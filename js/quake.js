
var gl = require('gl/gl');
var Console = require('./console');
var Pak = require('./pak');
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
    // requestFrame(Quake.tick);
    this.console.draw();
};

Quake.prototype.start = function() {
    gl.init('canvas');

    var self = this;
    var data = utils.download('data/pak0.pak', function(data) {
        var pak = new Pak(data);
        self.console = new Console(pak);
        self.tick();
    });
};




