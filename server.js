var Twit = require('twit');
var express = require('express');
var app = require('express')();
var _ = require('underscore');
var http = require('http').Server(app);
var io = require('socket.io')(http);

var T = new Twit({
  consumer_key:         'CZilMOQ8YKcGMzlvElWPN2E4q',
  consumer_secret:      '7PwgJrmpxHIPnDHuGsrw14B2aXreBuqh9PLNnI9KhPFwWBxyij',
  access_token:         '19188355-9U5OXiv0RKlylsADiA0p3Z8JkLOAm0HkJQsOfTbWO',
  access_token_secret:  'h0YECJT5SJau20fl3AOJg1HnqOcrerykX37XNzXQVNfz7',
  timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
});

app.use(express.static(__dirname + '/public')); 

app.get('/tweets', function(req, res){
  
  T.get('search/tweets', { q: '#SemanadelaCerveza', count: 200 }, function(err, data, response) {
  	console.log(data);

  	res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(data));
  });
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');

  T.get('search/tweets', { q: '#SemanadelaCerveza', count: 500 }, function(err, data, response) {
  	//console.log(data);

  	_.each(data.statuses, function(tweet) {
  	  io.emit('tweet', tweet);
  	});
  });
});

var stream = T.stream('statuses/filter', { track: '#SemanadelaCerveza' });

stream.on('tweet', function (tweet) {
  io.emit('tweet', tweet);
});

http.listen(9000, function(){
  console.log('listening on *:9000');
});