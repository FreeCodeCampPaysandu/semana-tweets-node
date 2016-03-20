var gulp;

gulp = require('gulp');

gulp.task('default', ['compile-vendor-styles', 'compile-vendor-js']);

var sass = require('gulp-sass');
var flatten = require('gulp-flatten');
var cleanCSS = require('gulp-clean-css');
var uglifycss = require('gulp-uglifycss');
var concatCss = require('gulp-concat-css');
var concat = require('gulp-concat');



gulp.task('compile-vendor-styles', function() {
  gulp.src(['bower_components/bootstrap/dist/css/bootstrap.min.css'], {base: 'bower_components'})
      .pipe(concatCss("vendor.css"))
      .pipe(uglifycss({
		  "maxLineLen": 80,
		  "uglyComments": true
		}))
      .pipe(gulp.dest('public/css'));
});

gulp.task('compile-vendor-js', function() {
  gulp.src(['bower_components/jquery/dist/jquery.min.js',
  			'bower_components/bootstrap/dist/js/bootstrap.min.js',
  			'bower_components/masonry/dist/masonry.pkgd.min.js',
        'bower_components/packery/dist/packery.pkgd.min.js',
        'bower_components/imagesloaded/imagesloaded.pkgd.min.js' ], {base: 'bower_components'})
      .pipe(concat("vendor.js"))
      .pipe(gulp.dest('public/js'));
});