var app = require('express')();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
var httpServer = require('http').createServer(app).listen(process.env.PORT || 3000);
var http = require('http');
var io = require('socket.io').listen(httpServer);

var sessions = {};

app.get('/', function(req, res){
	res.sendfile('index.html');
});

io.on('connection', function(socket){
	socket.emit('hello', '');
	socket.on('session:name', function(m){
		socket.session = m;
		socket.emit('soundcloud:song:current', (sessions[m] || ""));
	});
});

app.post('/song', function(req, res){
	currentSong = req.body.url;
	var clients = io.sockets.connected;
	for(var key in clients){
		if(clients.hasOwnProperty(key)){
			var socket = clients[key];
			if(socket.session === req.body.session){
				socket.emit('soundcloud:song:change', req.body.url);
			}
		}
	}
	sessions[req.body.session] = req.body.url;
	res.send(req.body.url);
});

app.post('/control', function(req, res){
	var action;
	switch(req.body.type){
		case 'next':
			action = 'next';
			break;
		case 'previous':
			action = 'previous';
			break;
		default:
			action = 'toggle';
			break;
	}
	var clients = io.sockets.connected;
	for(var key in clients){
		if(clients.hasOwnProperty(key)){
			var socket = clients[key];
			if(socket.session === req.body.session){
				socket.emit('soundcloud:control:'+action, '');
			}
		}
	}
	res.send('');
});