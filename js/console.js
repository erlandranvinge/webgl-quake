var Sprites = require('gl/sprites');
var Font = require('gl/font');

var Console = function(assets) {

   this.shader = assets.shaders.console;

   var backgroundTexture = assets.load('pak/gfx/conback.lmp');
   this.background = new Sprites(320, 200);
   this.background.textures.addSubTexture(backgroundTexture);
   this.background.textures.compile(assets.shaders.atlas);


   var fontTexture = assets.load('wad/CONCHARS', { width: 128, height: 128 });
   this.font = new Font(fontTexture, 8, 8);
};

Console.prototype.draw = function(p) {
   this.background.clear();
   this.background.drawSprite(0, 0, 0, gl.width, gl.height, 1, 1, 1, 1.0);
   this.background.render(this.shader, p);


   this.font.drawString("HELLO WORLD", 100, 100);
   this.font.render(this.shader, p);
};

module.exports = exports = Console;