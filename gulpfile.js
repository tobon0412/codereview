/* File: gulpfile.js */

// grab our gulp packages
var gulp   = require('gulp'),
    gutil = require('gulp-util'),
    source = require('vinyl-source-stream'),
    browserify = require('browserify');
  /*  jshint = require('gulp-jshint');*/

// define the default task and add the watch task to it
gulp.task('default', ['watch']);


function bundle(bundler){
    return bundler
        .bundle()
        .on('error', function(e){
            gutil.log(e);
        })
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('./dist/js/'));
}

// configure the jshint task
//gulp.task('jshint', function() {
//  return gulp.src('src/js/**/*.js')
//    .pipe(jshint())
//   .pipe(jshint.reporter('jshint-stylish'));
//});

// configure which files to watch and what tasks to use on file changes

//gulp.task('watch', function() {
//  gulp.watch('src/js/**/*.js', ['jshint']);
//});

//gulp.task('watch', function() {
//  gulp.watch('src/js/**/*.js', ['jshint']);
//});


gulp.task('js', function(){
   return bundle(browserify('./src/js/server.js'));
});
