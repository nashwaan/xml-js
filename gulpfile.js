/*jslint node:true */
'use strict';

var gulp = require('gulp');
var coveralls = require('gulp-coveralls');
 
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