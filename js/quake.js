
var gl = require('gl/gl');
var settings = require('settings');
var Console = require('./console');
var Pak = require('./pak');
var Wad = require('wad');
var utils = require('utils');

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
    var data = utils.download('data/pak0.pak', function(data) {
        var pak = new Pak(data);
        var wad = new Wad(pak.load('gfx.wad'));


    });

    gl.init('canvas');
    this.tick();
};




