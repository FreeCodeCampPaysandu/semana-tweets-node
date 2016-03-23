/* global $, Freewall, io */

// Funcion que devuelve Verdadero aproximadamente una de cada X veces, X como parametro
function unoDeCada (num) {
  return (Math.floor((Math.random() * num) + 1)) === num
}

function createCell (image) {
  var cellHtml = '<div class="cell" style="width:{size}px; height: {size}px; {avatar}"></div>'
  var avatar = 'background-image: url({url})'.replace(/\{url\}/g, image)
  var size = unoDeCada(6) ? 250 : 80
  var element = cellHtml.replace(/\{avatar\}/g, avatar)
  return element.replace(/\{size\}/g, size)
}

$(document).ready(function () {
  var cellSize = 80
  var cellGutter = 5

  $('#freewall').empty()

  var socket = io()
  var wall = new Freewall('#freewall')

  wall.reset({
    selector: '.cell',
    animate: true,
    gutterX: cellGutter,
    gutterY: cellGutter,
    cellW: cellSize,
    cellH: cellSize,
    onResize: function () {
      wall.refresh($(window).width(), $(window).height())
    }
  })

  wall.fitZone($(window).width(), $(window).height())
  $(window).trigger('resize')

  socket.on('initialTweets', function (tweets) {
    $.each(tweets, function (index, tweet) {
      var tweetUserImage = tweet.user.profile_image_url.replace('_normal', '')
      var element = createCell(tweetUserImage)
      wall.prepend(element)
    })
  })

  socket.on('disconnect', function () {
    $('#freewall').empty()
  })

  socket.on('tweet', function (tweet) {
    console.log(tweet)
    var tweetUserImage = tweet.user.profile_image_url.replace('_normal', '')
    var element = createCell(tweetUserImage)
    wall.prepend(element)
  })
})

