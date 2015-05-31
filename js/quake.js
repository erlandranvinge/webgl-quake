
var gl = require('gl/gl');
var Assets = require('assets');
var Console = require('./console');
var Pak = require('formats/pak');
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

Quake = function() {};

Quake.prototype.tick = function() {
    // requestFrame(this.tick);
    this.console.draw();
};

Quake.prototype.start = function() {
    gl.init('canvas');

    var assets = new Assets();
    assets.add('data/pak0.pak');
    assets.add('shaders/atlas.shader');
    assets.add('shaders/console.shader');

    var self = this;
    assets.precache(function() {
        self.console = new Console(assets);
    });


    /*
    var self = this;
    var data = utils.download('data/pak0.pak', function(data) {
        var pak = new Pak(data);

        shaders.load(function() {
            self.console = new Console(pak);
            self.tick();
        });
    }); */
};




