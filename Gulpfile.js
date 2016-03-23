var gulp = require('gulp')
var sass = require('gulp-sass')
var flatten = require('gulp-flatten')
var cleanCSS = require('gulp-clean-css')
var uglifycss = require('gulp-uglifycss')
var concatCss = require('gulp-concat-css')
var concat = require('gulp-concat')
var nodemon = require('gulp-nodemon')

gulp.task('default', ['serve', 'compile-vendor-js'])

gulp.task('compile-vendor-styles', function() {
  gulp.src(['bower_components/bootstrap/dist/css/bootstrap.min.css'], {base: 'bower_components'})
    .pipe(concatCss("vendor.css"))
    .pipe(uglifycss({
    "maxLineLen": 80,
    "uglyComments": true
  }))
  .pipe(gulp.dest('public/css'));
})

gulp.task('compile-vendor-js', function() {
  gulp.src([
    'bower_components/jquery/dist/jquery.min.js',
    'public/js/freewall.js'
  ], {base: 'bower_components'})
  .pipe(concat("vendor.js"))
  .pipe(gulp.dest('public/js'))
})

gulp.task('serve', function () {
  nodemon({
    script: 'server.js',
    ext: 'html js',
    ignore: ['node_modules/**/node_modules', 'gulpfile.js', 'public/**/*.js']
  })
  .on('restart', function () {
    console.log('server restarted!')
  })
})
