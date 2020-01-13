const { src, dest, watch, series } = require('gulp');
const browserify = require('gulp-browserify');
const connect = require('gulp-connect');

function build() {
    const options = {
        paths: ['./js'],    
        insertGlobals: true,
        debug: true
    };

    return src('js/quake.js')
        .pipe(browserify(options))
        .pipe(dest('./'))
        .pipe(connect.reload());
}

function dev() {
    connect.server({root: '', livereload: true});
    return watch(['js/**/*.js'], build);
}

exports.build = build;
exports.dev = dev;
exports.default = dev;
