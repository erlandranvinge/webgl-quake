var gulp = require('gulp');
var browserify = require('gulp-browserify');
var watch = require('gulp-watch');
var connect = require('gulp-connect');

gulp.task('connect', function() {
    connect.server({
        root: '',
        livereload: true
    });
});

gulp.task('watch', function() {
    watch('js/**/*.js', function() {

        var options = {
            paths: ['./js'],
            insertGlobals: true,
            //insertGlobalVars: 'Buffer',
            debug: true
        };

        gulp.src('js/quake.js')
            .pipe(browserify(options))
            .pipe(gulp.dest('./'))
            .pipe(connect.reload());
        console.log('Bundle complete!');
    });
});

gulp.task('default', ['connect', 'watch']);