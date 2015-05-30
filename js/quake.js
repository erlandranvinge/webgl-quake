
var gl = require('gl/gl');
var con = require('console');
var settings = require('settings');

if (!window.requestFrame) {
    window.requestFrame = ( function() {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function() {
                window.setTimeout( callback, 1000 / 60 );
            };
    })();
}

Quake = {};

Quake.tick = function() {
    // requestFrame(Quake.tick);

};

Quake.start = function() {
    gl.init('canvas');
    Quake.tick();
};




