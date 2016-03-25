var Twit = require('twit');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var Q = require('q');

var T = new Twit({
  consumer_key: 'CZilMOQ8YKcGMzlvElWPN2E4q',
  consumer_secret: '7PwgJrmpxHIPnDHuGsrw14B2aXreBuqh9PLNnI9KhPFwWBxyij',
  access_token: '19188355-9U5OXiv0RKlylsADiA0p3Z8JkLOAm0HkJQsOfTbWO',
  access_token_secret: 'h0YECJT5SJau20fl3AOJg1HnqOcrerykX37XNzXQVNfz7',
  timeout_ms: 60 * 1000  // optional HTTP request timeout to apply to all requests.
});

function formatDate(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

app.use(express.static(path.join(__dirname, '/public')));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '/index.html'));
});

app.get('/test', function (req, res) {
  var fakeTweet = {
    id: Date.now(),
    text: "tweet de prueba ackac kac asc ksa ckas ckas csa " + Date.now(),
    user: {
      name: "UsuarioTest",
      profile_image_url: "https://pbs.twimg.com/profile_images/623117485265522688/DEEYl1Rx_normal.png"
    }
  };

  io.emit('tweet', fakeTweet);

  res.json(fakeTweet);
});

app.get('/initial', function (req, res) {

  var a = T.get('search/tweets', { q: '#51semanadelacerveza', count: 200 }, function (err, data, response) {
    return data.statuses;
  });

  var b = T.get('search/tweets', { q: '#SemanadelaCerveza', count: 200 }, function (err, data, response) {
    return data.statuses;
  });

  var c = T.get('search/tweets', { q: '@Semana_Cerveza', count: 200 }, function (err, data, response) {
    return data.statuses;
  });

  var d = T.get('search/tweets', { q: '#semana_cerveza', count: 200 }, function (err, data, response) {
    return data.statuses;
  });


  eventualAdd(a,b,c,d);

  function eventualAdd(a,b,c,d) {
    return Q.spread([a,b,c,d], function (a,b,c,d) {
        var list = a.data.statuses;
        var list = a.data.statuses.concat(b.data.statuses);
        list = list.concat(c.data.statuses);
        list = list.concat(d.data.statuses);
        res.json(list);
    })
  }
})


io.on('connection', function (socket) {
  console.log('a user connected');
  var fechaActual = new Date();
  var ayer = new Date(fechaActual.setDate(fechaActual.getDate() - 1));

  T.get('search/tweets', { q: 'from:@Semana_Cerveza since:'+ formatDate(ayer), count: 200 }, function (err, data, response) {

    io.emit('initialTweets', data.statuses);
    console.log('emited tweets');
  });

  /*
//  var a = T.get('search/tweets', { q: '#51semanadelacerveza', count: 200 }, function (err, data, response) {
  var a = T.get('search/tweets', { q: '@semana_cerveza', count: 200 }, function (err, data, response) {

    return data.statuses;
  });

//  var b = T.get('search/tweets', { q: '#SemanadelaCerveza', count: 200 }, function (err, data, response) {
  var b = T.get('search/tweets', { q: '@semana_cerveza', count: 200 }, function (err, data, response) {
    return data.statuses;
  });

//  var c = T.get('search/tweets', { q: '@Semana_Cerveza', count: 200 }, function (err, data, response) {
 var c = T.get('search/tweets', { q: '@semana_cerveza', count: 200 }, function (err, data, response) {
    return data.statuses;
  });

//  var d = T.get('search/tweets', { q: '#semana_cerveza', count: 200 }, function (err, data, response) {
  var d = T.get('search/tweets', { q: '@semana_cerveza', count: 200 }, function (err, data, response) {
    return data.statuses;
  });


  eventualAdd(a,b,c,d);

  function eventualAdd(a,b,c,d) {
    return Q.spread([a,b,c,d], function (a,b,c,d) {
        var list = a.data.statuses;
        var list = a.data.statuses.concat(b.data.statuses);
        list = list.concat(c.data.statuses);
        list = list.concat(d.data.statuses);
        io.emit('initialTweets', list);
        console.log('emited tweets');
    })
  }
  */
});

//var stream = T.stream('statuses/filter', { track: ['#SemanadelaCerveza', '#51Semanadelacerveza', '@Semana_Cerveza', '#semana_cerveza'] });
var stream = T.stream('statuses/filter', { track: ['from:@Semana_Cerveza'] });

stream.on('tweet', function (tweet) {
  io.emit('tweet', tweet);
})

var port = process.env.NODE_ENV === 'production' ? 80 : 9000;

http.listen(port, function () {
  console.log('listening on *:9000');
})
