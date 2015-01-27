//oauth_consumer_key = "zgTw9HRJpjMmhzFrgZjyIN3Pp", oauth_nonce = "c8e140a69e365b260bd89beeb0f22beb", oauth_signature = "AokFfOjPsnDe68mcPYoMaTODHS8%3D", oauth_signature_method = "HMAC-SHA1", oauth_timestamp = "1419948792", oauth_token = "2189917776-fjORdeQFd8N7xfH4WDLZKjdIMryrZUjTNZYVfiY", oauth_version = "1.0"


var OAuth = require('oauth');
var oauth = new OAuth.OAuth(
	'https://api.twitter.com/oauth/request_token',
	'https://api.twitter.com/oauth/access_token',
	'zgTw9HRJpjMmhzFrgZjyIN3Pp', // consumer key
	'7LMrxMPr9MK7yWvloLIQOGfbQGmvPEnaeLn6U6wuBD80MpMlU0', //'your application secret',
	'1.0A',
	null,
	'HMAC-SHA1'
);

var debug = true;

function oauthGet(url, cb) {
	oauth.get(
		url,
		'2189917776-fjORdeQFd8N7xfH4WDLZKjdIMryrZUjTNZYVfiY', //test user token
		'X4ptclZNVDv3LDYgNSS2cg5wK4YFSCWFZR9MFeYEB5r27', //test user secret  
		function (e, data, res) {
			if (debug) console.log( 'URL ', url, 'received data:',
								    ((!e && data) ? JSON.parse(data) : data)
			);
			cb(e, data, res);
		});
}

function getLists(cb) {
	oauthGet('https://api.twitter.com/1.1/lists/list.json?screen_name=DmitryYudakov', cb);
}

function getStatuses(listID, cb) {
	oauthGet('https://api.twitter.com/1.1/lists/statuses.json?list_id=' + listID + '&count=20', cb);
}

function getListMembers(listID, cb) {
	var maxCount = 5;
	oauthGet('https://api.twitter.com/1.1/lists/members.json?list_id=' + listID + '&count=' + maxCount, cb);// TODO load more than 5K
}

function getFriends(cb) {
	var maxCount = 5000;
	oauthGet('https://api.twitter.com/1.1/friends/ids.json?screen_name=DmitryYudakov&stringify_ids=true&count=' + maxCount, cb); // TODO load more than 5K
}

module.exports = {
	getLists: getLists,
	getStatuses: getStatuses,
	getFriends: getFriends,
	getListMembers: getListMembers
}