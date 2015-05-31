
var webgl = require('gl/gl');
var assets = require('assets');
var utils = require('utils');
var Map = require('map');
var Console = require('console');
var Input = require('input');

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
    requestFrame(tick);
    Quake.instance.tick();
};

Quake = function() {};

Quake.prototype.tick = function() {

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    //this.console.draw(this.ortho);

    var m = utils.quakeIdentity(mat4.create());

    mat4.translate(m, m, [100, 100, -20]);
    this.map.draw(this.projection, m);
};

Quake.prototype.start = function() {
    Quake.instance = this;
    webgl.init('canvas');
    this.ortho = mat4.ortho(mat4.create(), 0, gl.width, gl.height, 0, -10, 10);
    this.projection = mat4.perspective(mat4.create(), 68.03, gl.width / gl.height, 0.1, 4096);


    assets.add('data/pak0.pak');
    assets.add('shaders/color2d.shader');
    assets.add('shaders/texture2d.shader');
    assets.add('shaders/world.shader');

    var self = this;
    assets.precache(function() {
        self.console = new Console();
        self.input = new Input();
        var bsp = assets.load('pak/maps/start.bsp');
        self.map = new Map(bsp);
        tick();
    });
};




