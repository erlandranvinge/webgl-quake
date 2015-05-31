var Sprites = require('gl/sprites');
var Font = require('gl/font');
var assets = require('assets');

var Console = function() {
   var backgroundTexture = assets.load('pak/gfx/conback.lmp');
   this.background = new Sprites(320, 200);
   this.background.textures.addSubTexture(backgroundTexture);
   this.background.textures.compile(assets.shaders.texture2d);

   var fontTexture = assets.load('wad/CONCHARS', { width: 128, height: 128, alpha: true });
   this.font = new Font(fontTexture, 8, 8);
};

Console.prototype.draw = function(p) {
   this.background.clear();
   this.background.drawSprite(0, 0, 0, gl.width, gl.height, 1, 1, 1, 1.0);
   this.background.render(assets.shaders.color2d, p);

   this.font.drawString("WOOT", 40, 40);
   this.font.render(assets.shaders.texture2d, p);
};

module.exports = exports = Console;