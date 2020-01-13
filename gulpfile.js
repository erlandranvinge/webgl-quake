var gulp = require('gulp');
var browserify = require('gulp-browserify');
var watch = require('gulp-watch');
var connect = require('gulp-connect');

/*
function swallowError (error) {
   console.log(error.toString());
    this.emit('end');
}
*/

gulp.task('connect', () => 
    connect.server({root: '', livereload: true})
);

gulp.task('watch', () => {
    const options = {
        paths: ['./js'],    
        insertGlobals: true,
        debug: true
    };

    watch('js/**/*.js', () => 
        gulp.src('js/quake.js')
            .pipe(browserify(options))
            .pipe(gulp.dest('./'))
            .pipe(connect.reload()));
});

gulp.task('default', gulp.series(['connect', 'watch']));

/*
gulp.task('default', function (callback) {
  runSequence(['connect', ''],
    callback
  )
})*/




/*
gulp.task('connect', function() {
    connect.server({
        root: '',
        livereload: true
    });
});
*/

//gulp.task('watch', function() {
//    watch('js/**/*.js', function() {

  /*      var options = {
            paths: ['./js'],
            insertGlobals: true,
            //insertGlobalVars: 'Buffer',
            debug: true
        };

        gulp.src('js/quake.js')
            .pipe(browserify(options))
            .on('error', swallowError)
            .pipe(gulp.dest('./'))
            .pipe(connect.reload());
        console.log('Bundle complete!');
    });
});

gulp.task('default', ['connect', 'watch']);*/