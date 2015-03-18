//oauth_consumer_key = "zgTw9HRJpjMmhzFrgZjyIN3Pp", oauth_nonce = "c8e140a69e365b260bd89beeb0f22beb", oauth_signature = "AokFfOjPsnDe68mcPYoMaTODHS8%3D", oauth_signature_method = "HMAC-SHA1", oauth_timestamp = "1419948792", oauth_token = "2189917776-fjORdeQFd8N7xfH4WDLZKjdIMryrZUjTNZYVfiY", oauth_version = "1.0"


var OAuth = require('oauth');
var oauth = new OAuth.OAuth(
	'https://api.twitter.com/oauth/request_token',
	'https://api.twitter.com/oauth/access_token',
	'rTozze3VGXh0hSPEy1mOvvhik', // consumer key
	's6uCmjBVllhdrGEzBridoEVjoseozT2wTearpddGycdngpQVrv', //'your application secret',
	'1.0A',
	null,
	'HMAC-SHA1'
);

var debug = false;
var user_token = '2189917776-ge1q7rTV1ZYV64Qqs2jakPvHvSkNfetX1fIHYKv';
var user_secret = 'Dc4Ik0YafSnHwNXELGrhHoSUa87X9k7ej0uDL0vKuGrNv';

function oauthGet(url, cb) {
	oauth.get(
		url,
		user_token,
		user_secret, 
		function (e, data, res) {
			if (debug) console.log( 'URL ', url, 'received data:',
								    ((!e && data) ? JSON.parse(data) : data)
			);
			cb(e, data, res);
		});
}
function oauthPost(url, params, cb) {
	oauth.post(
		url,
		user_token,
		user_secret,
		params,
		function (e, data) {
			if (debug) console.log( 'URL ', url, 'received data:',
								    ((!e && data) ? JSON.parse(data) : data)
			);
			cb(e, data);
		});
}

function getLists(cb) {
	oauthGet('https://api.twitter.com/1.1/lists/list.json?screen_name=DmitryYudakov', cb);
}

function getStatuses(params, cb) {
	var hint = '';
	if(params.hint) {
		console.log(params);
		for(var i in params.hint) {
			hint += '&' + i + '=' + params.hint[i];
		}
	}
	oauthGet('https://api.twitter.com/1.1/lists/statuses.json?list_id=' + params.listID + '&count=20' + hint, cb);
}

function getListMembers(listID, cb) {
	var maxCount = 5000;
	oauthGet('https://api.twitter.com/1.1/lists/members.json?list_id=' + listID + '&count=' + maxCount, cb);
}

function getFriends(cb) {
	var maxCount = 5000;
	oauthGet('https://api.twitter.com/1.1/friends/ids.json?screen_name=DmitryYudakov&stringify_ids=true&count=' + maxCount, cb); // TODO load more than 5K
}

function createList(listName, cb) {
	oauthPost( 'https://api.twitter.com/1.1/lists/create.json',
			   {name:listName, mode:'private'}, //?name=test&mode=private
			   cb);
}

// membersList is comma separated string
function addMembersToList(listID, membersList, cb){
	oauthPost( 'https://api.twitter.com/1.1/lists/members/create_all.json',
			   {list_id:listID, screen_name :membersList},
			   cb);
}

// membersList is comma separated string
function removeMembersFromList(listID, membersList, cb){
	oauthPost( 'https://api.twitter.com/1.1/lists/members/destroy_all.json',
			   {list_id:listID, screen_name :membersList},
			   cb);
}

module.exports = {
	getLists: getLists,
	getStatuses: getStatuses,
	getFriends: getFriends,
	getListMembers: getListMembers,
	createList: createList,
	addMembersToList: addMembersToList,
	removeMembersFromList: removeMembersFromList
}