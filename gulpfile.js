/*jslint node:true */
'use strict';

var gulp = require('gulp');
var coveralls = require('gulp-coveralls');

var gutil = require('gulp-util');
var watchify = require('watchify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var assign = require('lodash.assign');

// add custom browserify options here
var b = watchify(browserify(assign({}, watchify.args, {entries: ['./test/js2xml_test.js', './test/xml2js_test.js'], debug: true}))); 

// add transformations here
// i.e. b.transform(coffeeify);

gulp.task('js', bundle); // so you can run `gulp js` to build the file
b.on('update', bundle); // on any dep update, runs the bundler
b.on('log', gutil.log); // output build logs to terminal

function bundle() {
  return b.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./jasmine'));
}

gulp.task('coveralls', function () {
    gulp.src('coverage/lcov.info')
        .pipe(coveralls());
});

gulp.task('test', function () {
    /*gulp.watch('lib/*.js').on('change', function (event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    });*/
    gulp.watch('lib/*.js', function () {
        console.log('File running tasks...');
        require('child_process').exec('npm run jasmine', function (err, stdout, stderr) {
            console.log(stdout); console.log(stderr);
        });
        /*require('child_process')
            .spawn('npm', ['run jasmine'], {stdio:'inherit'})
            .on('exit', function (error) {
                if (!error) {
                  console.log('Success!');
                }
            });*/
    });
});

gulp.task('default', ['test']);