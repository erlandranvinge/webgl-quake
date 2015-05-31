var Texture = require('gl/texture');
var assets = require('assets');

var Map = function(bsp) {
    this.textures = {};
    for (var i in bsp.textures) {
        var texture = bsp.textures[i];
        var options = { width: texture.width, height: texture.height, palette: assets.palette };
        this.textures[texture.name] = new Texture(texture.data, options);
    }
};

module.exports = exports = Map;