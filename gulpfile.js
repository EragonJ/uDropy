var gulp = require('gulp');
var coffee = require('gulp-coffee');
var concat = require('gulp-concat');

gulp.task('default', function() {
  gulp
    .src('./src/*.coffee')
    .pipe(coffee({
      bare: true
    }))
    .pipe(concat('app.js'))
    .pipe(gulp.dest('./dist/'));
});
