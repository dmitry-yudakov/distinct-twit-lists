var express = require('express'),
	//  bodyParser = require('body-parser'),
	//  methodOverride = require('method-override'),
	//  errorHandler = require('error-handler'),
	//  morgan = require('morgan'),
	//  routes = require('./routes'),
	//  api = require('./routes/api'),
	http = require('http'),
	path = require('path');

var twitlist = require('./twitlist.js').create();

var app = module.exports = express();

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', function (req, res) {
//	console.log('req:', req);
	if(twitlist.signedIn) {
		return res.render('index', {});
	}
	
	// not signedIn
	var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl+'signedIn';
//		console.log('fullUrl:', fullUrl);
	twitlist.signIn(fullUrl, function(err, token) {
		if(err) {
			return res.render('error', {
				error_message: 'Unable to login to twitter: ' + err
			});
		}
		res.redirect(302, 'https://api.twitter.com/oauth/authenticate?oauth_token='+token);
	});
});

app.get('/signedIn', function (req, res) {
	console.log('req query:', req.query);
	if(!req.query.oauth_token || !req.query.oauth_verifier) {
		return res.render('error', {
			error_message: 'Missing oauth token and verifier'
		});
	}
	
	twitlist.obtainAccessToken(req.query.oauth_token, req.query.oauth_verifier, function(err){
		if(err) return res.render('error', {
			error_message: 'Unable to get access token: ' + err
		});

		return res.redirect('/');
	});
});

app.get('/getLists', function (req, res) {
	twitlist.getLists(function (err, lists) {
		if(err) {
			console.log('Cannot get lists:', err);
			return res.send( 'Unable to load lists: ' + JSON.stringify(err) );
		}
		res.send(lists);
	});
});

app.get('/getListMembers/:id', function (req, res) {
	twitlist.getListMembers(req.params.id, function (err, data) {
		res.send(data);
	});
});

app.post('/createList/:name', function(req, res) {
	twitlist.createList( req.params.name, function(err,data){
		res.send(data);
	});
});

app.post('/addMembersToList/:listid/:members', function(req, res) {
	twitlist.addMembersToList( req.params.listid, req.params.members, function(err,data){
		res.send(data);
	});
});

app.post('/moveMember/:member/:srcList/:targetList', function(req, res) {
	console.log('Move %s from %s to %s', req.params.member, req.params.srcList, req.params.targetList);
										   
	twitlist.addMembersToList( req.params.targetList, req.params.member, function(err,data){
		if(!err){
			twitlist.removeMembersFromList(req.params.srcList, req.params.member, function(err,data){
				res.send(data);
			});
		} else {
			console.log('Error', err);
			res.send(err);
		}
	});
});

app.get('/getFriends', function (req, res) {
	twitlist.getFriends(function (err, data) {
		res.send(data);
	});
});

app.get('/getStatuses/:id', function (req, res) {
//	console.log("req", req);
	if(!req.params.id) {
		res.send("");
		return;
	}
	twitlist.getStatuses({
		listID: req.params.id,
		hint: req.query
	}, function (err, statuses) {
		res.send(statuses);
	});
});

app.get('/showList/:id', function (req, res) {
	twitlist.getLists(function (err, lists) {
		res.send(lists);
	});
});

http.createServer(app).listen(app.get('port'), function () {
	console.log('Express server listening on port ' + app.get('port'));
});