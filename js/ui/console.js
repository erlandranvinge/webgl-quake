var Texture = require('gl/texture');
var Sprites = require('gl/sprites');
var Font = require('gl/font');
var assets = require('assets');
var settings = require('settings');

var Console = function() {
   var fontTexture = assets.load('wad/CONCHARS', { width: 128, height: 128, alpha: true });
   var font = new Font(fontTexture, 8, 8);

   var backgroundTexture = assets.load('pak/gfx/conback.lmp');
   backgroundTexture.drawTo(function(p) {
      gl.enable(gl.BLEND);
      var version = 'WebGL ' + settings.version;
      font.drawString(225, 186, version, 1);
      font.render(assets.shaders.texture2d, p);
   });
   this.background = new Sprites(320, 200);
   this.background.textures.addSubTexture(backgroundTexture);
   this.background.textures.compile(assets.shaders.texture2d);

   this.buffer = new Sprites(gl.width, gl.height);
   this.buffer.textures.addSubTexture(new Texture(null, { width: gl.width, height: gl.height }));
   this.buffer.textures.compile(assets.shaders.texture2d);

   this.font = font;
   this.enabled = true;
   this.height = 0;
   this.lines = [];
   this.line = '> ';

};

Console.prototype.print = function(msg) {
   this.font.drawString(40, 40, msg);
};

Console.prototype.input = function(key) {
   switch (key) {
      case 192:
         this.enabled = !this.enabled; // TODO: Animate here.
         break;
      case 13:
         this.lines.push(this.line);
         this.line = '> ';
         this.redrawBuffer();
         break;
      default:
         this.line += String.fromCharCode(key);
   }
};

Console.prototype.update = function(dt) {
   if (!this.enabled)
      return;
   // TODO: Animate.
};

Console.prototype.redrawBuffer = function() {
   var self = this;
   this.buffer.textures.texture.drawTo(function (p) {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      var y = gl.height - 40;
      for (var i = self.lines.length - 1; i >= 0; i--) {
         self.font.drawString(8, y, self.lines[i]);
         y -= 8;
      }
      self.font.render(assets.shaders.texture2d, p);
   });
};

Console.prototype.draw = function(p) {
   if (!this.enabled)
      return;

   gl.enable(gl.BLEND);
   this.background.clear();
   this.background.drawSprite(0, 0, this.height, gl.width, gl.height, 1, 1, 1, 1);
   this.background.render(assets.shaders.color2d, p);

   this.buffer.clear();
   this.buffer.drawSprite(0, 0, this.height, gl.width, gl.height, 1, 1, 1, 1);
   this.buffer.render(assets.shaders.color2d, p);

   this.font.drawString(8, gl.height - 30, this.line);
   this.font.render(assets.shaders.texture2d, p);
};

module.exports = exports = Console;