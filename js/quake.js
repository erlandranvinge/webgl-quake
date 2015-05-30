
var gl = require('gl/gl');
var settings = require('settings');
var Console = require('./console');
var Pak = require('./pak');

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

Quake = function() {
    this.con = new Console();
};

Quake.prototype.tick = function() {
    // requestFrame(Quake.tick);

    this.con.draw();
};

Quake.prototype.start = function() {
    var pak = new Pak('data/pak0.pak');

    gl.init('canvas');
    this.tick();
};




