var express = require('express'),
	//  bodyParser = require('body-parser'),
	//  methodOverride = require('method-override'),
	//  errorHandler = require('error-handler'),
	//  morgan = require('morgan'),
	//  routes = require('./routes'),
	//  api = require('./routes/api'),
	http = require('http'),
	path = require('path');

var twitlist = require('./twitlist.js');

var app = module.exports = express();


/**
 * Configuration
 */

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
//app.use(morgan('dev'));
//app.use(bodyParser());
//app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));




app.get('/', function (req, res) {
	res.render('index', {
		title: 'Manage Twitter Lists'
	});

});

app.get('/getLists', function (req, res) {
	twitlist.getLists(function (err, lists) {
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
	twitlist.getStatuses(req.params.id, function (err, statuses) {
		res.send(statuses);
	});
});
app.get('/showList/:id', function (req, res) {
	twitlist.getLists(function (err, lists) {
		res.send(lists);
	});
});




//var env = process.env.NODE_ENV || 'development';
//
//// development only
//if (env === 'development') {
////  app.use(express.errorHandler());
//}
//
//// production only
//if (env === 'production') {
//  // TODO
//}


/**
 * Routes
 */

// serve index and view partials
//app.get('/', routes.index);
//app.get('/partials/:name', routes.partials);

// JSON API
//app.get('/api/name', api.name);

// redirect all others to the index (HTML5 history)
//app.get('*', routes.index);


/**
 * Start Server
 */

http.createServer(app).listen(app.get('port'), function () {
	console.log('Express server listening on port ' + app.get('port'));
});