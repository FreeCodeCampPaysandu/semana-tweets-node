/* global $, Freewall, io */
var timerHide = null;
var timerShow = null;
var timerRefresh = null;

var tiempoDeVisualizacion = 8000;
var ocultarDespuesDe = tiempoDeVisualizacion + (2000);
var tweet_ids = [];
var tweet_texts = [];

moment.locale('es');

// Funcion que devuelve Verdadero aproximadamente una de cada X veces, X como parametro
function unoDeCada (num) {
  return (Math.floor((Math.random() * num) + 1)) === num;
}

var idTweetMostrar;

function showTweet() {  
  if ($('.unseenTweet').length === 0) {
    $('.modal:not(".unseenTweet")').map(function(index, elem) {
      $(elem).addClass('unseenTweet');
    });
    
    console.log("Volvio a setear la clase unseenTweet");
  }
  
  idTweetMostrar = $('.unseenTweet').first().attr('id');
  $('#' + idTweetMostrar).modal('toggle');
  $('#' + idTweetMostrar).removeClass('unseenTweet');
  
  clearTimeout(timerHide);
  clearTimeout(timerShow);
  
  timerHide = _.delay(function() {$('#' + idTweetMostrar).modal('hide'); }, tiempoDeVisualizacion);
  timerShow = _.delay(showTweet, ocultarDespuesDe);
}

function refresh(wall) {
  clearTimeout(timerRefresh);
  console.log('refreshing');
  wall.fitZone($(window).width(), $(window).height());
  $(window).trigger('resize');

  timerRefresh = _.delay(refresh, 30000, wall);
}

function createCell (image) {
  var cellHtml = '<div class="cell" style="width:{size}px; height: {size}px; {avatar}"></div>';
  var avatar = 'background-image: url({url})'.replace(/\{url\}/g, image);
  var size = unoDeCada(6) ? 250 : 80;

  if ($(window).width() > 1600) {
    size = unoDeCada(6) ? 400 : 120;
  }
  var element = cellHtml.replace(/\{avatar\}/g, avatar);
  return element.replace(/\{size\}/g, size);
}

function createColorboxDiv (tweet, image) {
  var tweetSocialInfo = [
    '<div class="col-xs-6 socialCol">',
      '<span class="retweetCount"><i class="fa fa-retweet"></i> {retweets}</span>',
      '<span class="likeCount"><i class="fa fa-heart"></i> {likes}</span>',
    '</div>'
  ].join('');

  tweetSocialInfo = tweetSocialInfo.replace(/\{retweets\}/g, tweet.retweet_count);
  tweetSocialInfo = tweetSocialInfo.replace(/\{likes\}/g, tweet.favorite_count);

  var colorboxHtml = [
    '<div class="modal fade unseenTweet" id="{id}">',
      '<div class="vertical-alignment-helper">',
        '<div class="modal-dialog modal-lg vertical-align-center">',
          '<div class="modal-content">',
            '<div class="modal-body">',
              '<div class="row">',
                '<div class="col-xs-6">',
                  '<img src="{url}" class="img img-responsive">',
                '</div>',
                '<div class="col-xs-6">',
                  '<h1>{user}</h1>',
                  '<span class="userScreenName">{userScreenName}</span>',
                  '<span class="tweetCreadoHace">{created}</span>',
                  '<h3>{text}</h3>',
                '</div>',
                tweetSocialInfo,
              '</div>',
            '</div>',
          '</div>',
        '</div>',
      '</div>',
    '</div>'
  ].join('');

  var created = moment(tweet.created_at).fromNow();
  
  colorboxHtml = colorboxHtml.replace(/\{url\}/g, image);
  colorboxHtml = colorboxHtml.replace(/\{text\}/g, tweet.text);
  colorboxHtml = colorboxHtml.replace(/\{id\}/g, tweet.id);
  colorboxHtml = colorboxHtml.replace(/\{userScreenName\}/g, '@' + tweet.user.screen_name);
  colorboxHtml = colorboxHtml.replace(/\{user\}/g, tweet.user.name);
  colorboxHtml = colorboxHtml.replace(/\{created\}/g, created);

  return colorboxHtml;
}

function addTweet (wall, tweet, colocarAlInicio) {
  if ($.inArray(tweet.text, tweet_texts) == -1 && $.inArray(tweet.id, tweet_ids) == -1) {
    var tweetUserImage = tweet.user.profile_image_url.replace('_normal', '');

    //replace the avatar with the first media share
    if (tweet.entities != undefined && tweet.entities.media != undefined) {
      tweetUserImage = tweet.entities.media[0].media_url;
    }

    var element = createCell(tweetUserImage);
    var colorBox = createColorboxDiv(tweet, tweetUserImage);

    wall.prepend(element);

    if (colocarAlInicio) {
      $('.colorbox-container').prepend(colorBox);
    } else {
      $('.colorbox-container').append(colorBox);
    }
    
    tweet_texts.push(tweet.text);
    tweet_ids.push(tweet.id);
  }
}

$(document).ready(function () {
  var cellSize = 80;
  var cellGutter = 5;

  if ($(window).width() > 1600) {
    cellSize = 120;
  }

  $('#freewall').empty();

  var socket = io({
    'reconnect': true,
    'reconnection delay': 500,
    'max reconnection attempts': 1000
  });

  var wall = new Freewall('#freewall');

  wall.reset({
    selector: '.cell',
    animate: true,
    gutterX: cellGutter,
    gutterY: cellGutter,
    cellW: cellSize,
    cellH: cellSize,
    onResize: function () {
      wall.refresh($(window).width(), $(window).height())
    },
    onComplete: function() {
      wall.reset({
        animate: false
      });
      $('.spinner').fadeOut('400', 
        function() {
          $('.tweet-container').show();  
      });
      
    },
    onBlockFinish: function() {

    }
  });

  timerShow = _.delay(showTweet, 5000);
  timerRefresh = _.delay(refresh, 10000, wall);


  wall.fitZone($(window).width(), $(window).height());
  $(window).trigger('resize');


  
  socket.on('initialTweets', function (tweets) {
    $.each(tweets, function (index, tweet) {
      addTweet(wall, tweet, false);
    })
  });
  
  socket.on('disconnect', function () {
    /*
    $('#freewall').empty();
    $('.tweet-container').hide();
    $('.spinner').show();
    $('.modal').modal('hide');
    $('.colorbox-container').html('');
    tweet_ids = [];
    tweets_tweet_texts = [];

    wall = new Freewall('#freewall');

    wall.reset({
        selector: '.cell',
        animate: true,
        gutterX: cellGutter,
        gutterY: cellGutter,
        cellW: cellSize,
        cellH: cellSize,
        onResize: function () {
          wall.refresh($(window).width(), $(window).height())
        },
        onComplete: function() {
          wall.reset({
            animate: false
          });
          $('.spinner').fadeOut('400',
            function() {
              $('.tweet-container').show();
          });

        },
        onBlockFinish: function() {

        }
    });
    */
  });

  socket.on('tweet', function (tweet) {
    addTweet(wall, tweet, true);
  })
})

