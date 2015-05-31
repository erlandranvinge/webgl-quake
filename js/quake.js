
var webgl = require('gl/gl');
var assets = require('assets');
var Map = require('map');
var Console = require('./console');

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

var tick = function() {
    //requestFrame(tick);
    Quake.instance.tick();
};

Quake = function() {};

Quake.prototype.tick = function() {

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    this.console.draw(this.ortho);
};

Quake.prototype.start = function() {
    Quake.instance = this;
    webgl.init('canvas');
    this.ortho = mat4.ortho(mat4.create(), 0, gl.width, gl.height, 0, -10, 10);

    assets.add('data/pak0.pak');
    assets.add('shaders/color2d.shader');
    assets.add('shaders/texture2d.shader');

    var self = this;
    assets.precache(function() {
        self.console = new Console();

        var bsp = assets.load('pak/maps/start.bsp');
        var map = new Map(bsp);

        tick();
    });
};




