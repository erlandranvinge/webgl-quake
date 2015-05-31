var Texture = require('gl/texture');
var assets = require('assets');
var utils = require('utils');

var Map = function(bsp, wireframe) {
    this.textures = [];
    for (var i in bsp.textures) {
        var texture = bsp.textures[i];
        var options = { width: texture.width, height: texture.height, palette: assets.palette };
        this.textures.push(new Texture(texture.data, options));
    }

    var chains = [];
    for (var m in bsp.models) {
        var model = bsp.models[m];
        for (var s = model.firstSurface; s < model.surfaceCount; s++) {
            var surface = bsp.surfaces[s];
            var texInfo = bsp.texInfos[surface.texInfoId];

            var chain = chains[texInfo.textureId];
            if (!chain) {
                chain = { textureId: texInfo.textureId, data: [] };
                chains[texInfo.textureId] = chain;
            }

            var indices = [];
            for (var e = surface.edgeStart; e < surface.edgeStart + surface.edgeCount; e++) {
                var edgeFlipped = bsp.edgeList[e] < 0;
                var edgeIndex = Math.abs(bsp.edgeList[e]);
                if (!edgeFlipped) {
                    indices.push(bsp.edges[edgeIndex * 2]);
                    indices.push(bsp.edges[edgeIndex * 2 + 1]);
                } else {
                    indices.push(bsp.edges[edgeIndex * 2 + 1]);
                    indices.push(bsp.edges[edgeIndex * 2]);
                }
            }
            indices = wireframe ? indices : utils.triangulate(indices);
            for (var i = 0; i < indices.length; i+= 3) {
                chain.data.push(bsp.vertices[indices[i]]);
                chain.data.push(bsp.vertices[indices[i+1]]);
                chain.data.push(bsp.vertices[indices[i+2]]);
                chain.data.push(0, 0, 0, 0);
            }
        }
    }

    var data = [];
    for (var c in chains) {
        for (var v = 0; v < chains[c].data.length; v++) {
            data.push(chains[c].data[v]);
        }
    }
    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    this.buffer.stride = 7 * 4;
};

Map.prototype.draw = function(p) {

};

module.exports = exports = Map;