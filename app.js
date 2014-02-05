"use strict";

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');

var app = express();

var passport = require('passport');
var GoogleStrategy = require('passport-google').Strategy;

passport.serializeUser(function (user, done) {
	done(null, user);
});

passport.deserializeUser(function (obj, done) {
	done(null, obj);
});

passport.use(new GoogleStrategy({
		returnURL: 'http://localhost:3000/auth/google/return',
		realm: 'http://localhost:3000/'
	},
	function (identifier, profile, done) {
		process.nextTick(function () {
			profile.identifier = identifier;
			return done(null, profile);
		});
	}
));

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({
	secret: 'wibble'
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' === app.get('env')) {
	app.use(express.errorHandler());
}

app.get('/auth/google/:return?', passport.authenticate('google', {
	successRedirect: '/'
}));

app.get('/auth/logout', function (req, res) {
	req.logout();
	res.redirect('/');
});

app.get('/', function (req, res) {
	res.render('index', {
		user: req.user
	});
});

var server = http.createServer(app).listen(app.get('port'), function () {
	console.log('Express server listening on port ' + app.get('port'));
});