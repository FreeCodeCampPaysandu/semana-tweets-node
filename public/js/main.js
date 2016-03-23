/* global $, Freewall, io */

// Funcion que devuelve Verdadero aproximadamente una de cada X veces, X como parametro
function unoDeCada (num) {
  return (Math.floor((Math.random() * num) + 1)) === num;
}

function showTweet(tweets, id) {
  var index = Math.floor((Math.random() * tweets.length) + 1);
  

  //$.colorbox({html: $('#' + tweets[index]) });
  $('#' + tweets[index]).modal('toggle');

  _.delay(function() {$('.modal').modal('hide'); }, 10000);
  _.delay(showTweet, 20000, tweets, null);
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

function createColorboxDiv (id, user, text, hashTags, image) {
  var colorboxHtml = '<div class="modal fade" id="{id}"><div class="modal-dialog modal-lg"><div class="modal-content"><div class="modal-body"><div class="row"><div class="col-xs-6"><img src="{url}" class="img img-responsive"></div><div class="col-xs-6"><h1>{user}</h1><p>{text}</p></div></div></div></div></div></div>';
  
  colorboxHtml = colorboxHtml.replace(/\{url\}/g, image);
  colorboxHtml = colorboxHtml.replace(/\{text\}/g, text);
  colorboxHtml = colorboxHtml.replace(/\{id\}/g, id);
  colorboxHtml = colorboxHtml.replace(/\{user\}/g, user);


  return colorboxHtml;
}

$(document).ready(function () {
  var cellSize = 80;
  var cellGutter = 5;
  var tweet_ids = [];
  var tweet_texts = [];


  if ($(window).width() > 1600) {
    cellSize = 120;
  }

  $('#freewall').empty();

  var socket = io();
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

  _.delay(showTweet, 5000, tweet_ids, null);


  wall.fitZone($(window).width(), $(window).height());
  $(window).trigger('resize');

  
  socket.on('initialTweets', function (tweets) {
    $.each(tweets, function (index, tweet) {
      //if the tweet hasnt been added
      if ($.inArray(tweet.text, tweet_texts) == -1 && $.inArray(tweet.id, tweet_ids) == -1) {
        var tweetUserImage = tweet.user.profile_image_url.replace('_normal', '');

        //replace the avatar with the first media share
        if (tweet.entities != undefined && tweet.entities.media != undefined) {
          tweetUserImage = tweet.entities.media[0].media_url;
        }
        var element = createCell(tweetUserImage);
        wall.prepend(element);
        $('.colorbox-container').append(createColorboxDiv(tweet.id, tweet.user.name, tweet.text, '', tweetUserImage));
        //console.log(tweet);
        tweet_texts.push(tweet.text);
        tweet_ids.push(tweet.id);
      }
    })
  });
  
  socket.on('disconnect', function () {
    $('#freewall').empty();
    $('.tweet-container').hide();
    $('.spinner').show();
    $('.modal').modal('hide');
    $('.colorbox-container').html('');
  });

  socket.on('tweet', function (tweet) {
    console.log(tweet);
    if ($.inArray(tweet.text, tweet_texts) == -1 && $.inArray(tweet.id, tweet_ids) == -1) {
      var tweetUserImage = tweet.user.profile_image_url.replace('_normal', '');

      //replace the avatar with the first media share
      if (tweet.entities != undefined && tweet.entities.media != undefined) {
        tweetUserImage = tweet.entities.media[0].media_url;
      }
      var element = createCell(tweetUserImage);
      wall.prepend(element);
      $('.colorbox-container').append(createColorboxDiv(tweet.id, tweet.user.name, tweet.text, '', tweetUserImage));
      //console.log(tweet);
      tweet_texts.push(tweet.text);
      tweet_ids.push(tweet.id);
      wall.prepend(element);
    }
    
  })
})

