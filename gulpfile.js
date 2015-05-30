var gulp = require('gulp');
var browserify = require('gulp-browserify');
var watch = require('gulp-watch');

gulp.task('default', function() {
    watch('js/**/*.js', function() {

        var options = {
            paths: ['./js'],
            insertGlobals: true,
            //insertGlobalVars: 'Buffer',
            debug: true
        };

        gulp.src('js/quake.js')
            .pipe(browserify(options))
            .pipe(gulp.dest('./'));
        console.log('Bundle complete!');
    });
});