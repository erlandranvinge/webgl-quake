var Texture = require('gl/texture');
var assets = require('assets');
var utils = require('utils');

var Map = function(bsp, wireframe) {
    this.textures = {};
    for (var i in bsp.textures) {
        var texture = bsp.textures[i];
        var options = { width: texture.width, height: texture.height, palette: assets.palette };
        this.textures[texture.name] = new Texture(texture.data, options);
    }

    var chains = [];
    for (var m in bsp.models) {
        var model = bsp.models[m];
        for (var s = model.firstSurface; s < model.surfaceCount; s++) {
            var surface = bsp.surfaces[s];
            var texInfo = bsp.texInfos[surface.texInfoId];

            var chain = chains[texInfo.textureId];
            if (!chain) {
                chains[texInfo.textureId] = {
                    textureId: texInfo.textureId,
                    vertices: [],
                    flags: surface.flags
                };
            }
            console.log(chains);

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

            for (var j = indices.length - 1; j >= 0; j--) { // Do backwards, to allow correct back-face culling.
                var v = [
                    bsp.vertices[indices[j] * 3],
                    bsp.vertices[indices[j] * 3 + 1],
                    bsp.vertices[indices[j] * 3 + 2]
                ];

                // Add coordinates
                chain.vertices.push(v[0]);
                chain.vertices.push(v[1]);
                chain.vertices.push(v[2]);

                // Add tex-coords
                var s = vec3.dot(v, texInfo.vectorS) + texInfo.distS;
                var t = vec3.dot(v, texInfo.vectorT) + texInfo.distT;

                var s1 = s / this.textures[texInfo.textureId].width;
                var t1 = t / this.textures[texInfo.textureId].height;
                chain.vertices.push(s1);
                chain.vertices.push(t1);

                // Shadow map texture coordinates
                var s2 = s;
                s2 -= surface.textureMins[0];
                s2 += (surface.lightMapS * 16);
                s2 += 8;
                s2 /= (Bsp.BLOCK_WIDTH * 16);

                var t2 = t;
                t2 -= surface.textureMins[1];
                t2 += (surface.lightMapT * 16);
                t2 += 8;
                t2 /= (Bsp.BLOCK_HEIGHT * 16);

                chain.vertices.push(s2);
                chain.vertices.push(t2);
            }
        }
    }
};

module.exports = exports = Map;