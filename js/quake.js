
var webgl = require('gl/gl');
var Assets = require('assets');
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

// TODO: Bridge between browser ticks and quake instance needs to get cleaner.
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
    this.ortho = mat4.ortho(mat4.create(), 0, gl.width, 0, gl.height, -10, 10);

    var assets = new Assets();
    assets.add('data/pak0.pak');
    assets.add('shaders/atlas.shader');
    assets.add('shaders/console.shader');

    var self = this;
    assets.precache(function() {
        self.console = new Console(assets);
        tick();
    });
};




