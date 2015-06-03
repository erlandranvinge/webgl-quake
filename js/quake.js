
var webgl = require('gl/gl');
var assets = require('assets');
var utils = require('utils');
var Input = require('input');
var Console = require('ui/console');
var StatusBar = require('ui/statusbar');
var Client = require('client');

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

var tick = function() {
    requestFrame(tick);
    Quake.instance.tick();
};

Quake.prototype.tick = function() {

    this.client.readFromServer();
    this.handleInput();

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    var m = utils.quakeIdentity(mat4.create());

    mat4.rotateY(m, m, utils.deg2Rad(this.client.viewAngles[0]));
    mat4.rotateZ(m, m, utils.deg2Rad(this.client.viewAngles[1]));

    if (this.client.viewEntity !== -1) {
        var position = this.client.entities[this.client.viewEntity].nextState.origin;
        mat4.translate(m, m, [-position[0], -position[1], -position[2]]);
    }

    if (this.client.map) {
        this.client.map.draw(this.projection, m);

        var statics = this.client.staticEntities;
        var models = this.client.models;

        for (var i = 0; i < statics.length; i++) {
            var modelIndex = statics[i].state.modelIndex;
            var mm = mat4.create(m);
            mat4.translate(mm, mm, statics[i].state.origin);
            models[modelIndex].draw(this.projection, mm);
        }
    }

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    this.statusBar.draw(this.ortho);
};

// Temp. controller.
Quake.prototype.handleInput = function() {
    if (this.client.viewEntity === -1)
        return;
    var angle = utils.deg2Rad(this.client.viewAngles[1]);
    var position = this.client.entities[this.client.viewEntity].nextState.origin;
    var speed = 5.0;

    if (this.input.left)
        this.client.viewAngles[1] -= 2;
    if (this.input.right)
        this.client.viewAngles[1] += 2;
    if (this.input.up) {
        this.client.demo = null;
        position[0] += Math.cos(angle) * speed;
        position[1] -= Math.sin(angle) * speed;
    }
    if (this.input.down) {
        position[0] -= Math.cos(angle) * speed;
        position[1] += Math.sin(angle) * speed;
    }
    if (this.input.flyUp)
        position[2] += 10;
    if (this.input.flyDown)
        position[2] -= 10;
};

Quake.prototype.start = function() {
    Quake.instance = this;
    webgl.init('canvas');
    this.ortho = mat4.ortho(mat4.create(), 0, gl.width, gl.height, 0, -10, 10);
    this.projection = mat4.perspective(mat4.create(), 68.03, gl.width / gl.height, 0.1, 4096);

    assets.add('data/pak0.pak');
    assets.add('shaders/color2d.shader');
    assets.add('shaders/model.shader');
    assets.add('shaders/texture2d.shader');
    assets.add('shaders/world.shader');

    var self = this;
    assets.precache(function() {
        self.console = new Console();
        self.statusBar = new StatusBar();
        self.input = new Input();
        self.client = new Client();

        //var bsp = assets.load('pak/maps/start.bsp');
        //self.map = new Map(bsp);
        self.client.playDemo('demo1.dem');
        tick();
    });
};




