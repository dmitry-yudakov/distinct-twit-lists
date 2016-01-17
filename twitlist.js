var OAuth = require('oauth');

//oauth_consumer_key = "zgTw9HRJpjMmhzFrgZjyIN3Pp", oauth_nonce = "c8e140a69e365b260bd89beeb0f22beb", oauth_signature = "AokFfOjPsnDe68mcPYoMaTODHS8%3D", oauth_signature_method = "HMAC-SHA1", oauth_timestamp = "1419948792", oauth_token = "2189917776-fjORdeQFd8N7xfH4WDLZKjdIMryrZUjTNZYVfiY", oauth_version = "1.0"

var consumer_key = 'rTozze3VGXh0hSPEy1mOvvhik';
var app_secret = 's6uCmjBVllhdrGEzBridoEVjoseozT2wTearpddGycdngpQVrv';

function TwitLists(opts) {
	this.debug = opts && opts.debug;
	this.oauth = null;
	this.logged = false;
}

TwitLists.prototype.logIn = function(oauth_callback, cb) {
	console.log('getOAuthRequestToken');
	if(!this.oauth) {
		this.oauth = new OAuth.OAuth(
			'https://api.twitter.com/oauth/request_token',
			'https://api.twitter.com/oauth/access_token',
			consumer_key,
			app_secret,
			'1.0A',
//			null, 
			oauth_callback,
			'HMAC-SHA1'
		);
		
		var that = this;
		this.oauth.getOAuthRequestToken(function(err, token, token_secret, parsedQueryString) {
//			console.log('!! arguments:', arguments);
			if(err) {
				console.log('Error:', err);
				return cb(JSON.stringify(err));
			}
			that.token = token;
			that.token_secret = token_secret;
			that.logged = true;

			cb(null, token);
		});
	} else {
		cb(null, this.user_token);
	}
}

TwitLists.prototype.obtainAccessToken = function(oauth_token, oauth_verifier, cb) {
	var that = this;
	this.oauth.getOAuthAccessToken(	this.token, // it's same as oauth_token
									this.token_secret,
									oauth_verifier,
									function(err, oauth_access_token, oauth_access_token_secret, results) {
		if(err) return cb(JSON.stringify(err));
		that.user_token = oauth_access_token;
		that.user_secret = oauth_access_token_secret;
		cb(null);
	});
}

TwitLists.prototype.oauthGet = function(url, cb) {
	if(!this.logged) {
		return cb('Not logged on twitter');
	}
	this.oauth.get(
		url,
		this.user_token,
		this.user_secret, 
		function (e, data, res) {
			if (this.debug) console.log( 'URL ', url, 'received data:',
								    ((!e && data) ? JSON.parse(data) : data)
			);
			cb(e, data, res);
		});
}
TwitLists.prototype.oauthPost = function(url, params, cb) {
	if(!this.logged) {
		return cb('Not logged on twitter');
	}
	this.oauth.post(
		url,
		this.user_token,
		this.user_secret,
		params,
		function (e, data) {
			if (this.debug) console.log( 'URL ', url, 'received data:',
								    ((!e && data) ? JSON.parse(data) : data)
			);
			cb(e, data);
		});
}


TwitLists.prototype.getLists = function(cb) {
	this.oauthGet('https://api.twitter.com/1.1/lists/list.json?screen_name=DmitryYudakov', cb);
}

TwitLists.prototype.getStatuses = function(params, cb) {
	var hint = '';
	if(params.hint) {
		console.log(params);
		for(var i in params.hint) {
			hint += '&' + i + '=' + params.hint[i];
		}
	}
	this.oauthGet('https://api.twitter.com/1.1/lists/statuses.json?list_id=' + params.listID + '&count=20' + hint, cb);
}

TwitLists.prototype.getListMembers = function(listID, cb) {
	var maxCount = 5000;
	this.oauthGet('https://api.twitter.com/1.1/lists/members.json?list_id=' + listID + '&count=' + maxCount, cb);
}

TwitLists.prototype.getFriends = function(cb) {
	var maxCount = 5000;
	this.oauthGet('https://api.twitter.com/1.1/friends/ids.json?screen_name=DmitryYudakov&stringify_ids=true&count=' + maxCount, cb); // TODO load more than 5K
}

TwitLists.prototype.createList = function(listName, cb) {
	this.oauthPost( 'https://api.twitter.com/1.1/lists/create.json',
			   {name:listName, mode:'private'}, //?name=test&mode=private
			   cb);
}

// membersList is comma separated string
TwitLists.prototype.addMembersToList = function(listID, membersList, cb){
	this.oauthPost( 'https://api.twitter.com/1.1/lists/members/create_all.json',
			   {list_id:listID, screen_name :membersList},
			   cb);
}

// membersList is comma separated string
TwitLists.prototype.removeMembersFromList = function(listID, membersList, cb){
	this.oauthPost( 'https://api.twitter.com/1.1/lists/members/destroy_all.json',
			   {list_id:listID, screen_name :membersList},
			   cb);
}

module.exports.create = function(opts) {
	return new TwitLists(opts);
}