var Sprites = require('gl/sprites');

var Console = function(assets) {

   var background = assets.load('pak/gfx/conback.lmp');
   this.background = new Sprites(320, 200);
   this.background.textures.addSubTexture(background);
   this.background.textures.compile(assets.shaders.atlas);
};

Console.prototype.draw = function() {
};

module.exports = exports = Console;