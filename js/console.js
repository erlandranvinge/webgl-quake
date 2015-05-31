var Sprites = require('gl/sprites');

var Console = function(assets) {

   this.shader = assets.shaders.console;
   this.background = new Sprites(320, 200);
   this.background.textures.addSubTexture(assets.load('pak/gfx/conback.lmp'));
   this.background.textures.compile(assets.shaders.atlas);
};

Console.prototype.draw = function(p) {
   var y = 0;
   this.background.clear();
   this.background.drawSprite(0, 0, y, gl.width, gl.height, 1, 1, 1, 0.5);
   //this.background.render(this.shader, p);
};

module.exports = exports = Console;