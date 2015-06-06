var assets = require('assets');
var Texture = require('gl/Texture');

var Model = function(mdl) {
    this.skins = [];
    for (var skinIndex = 0; skinIndex < mdl.skins.length; skinIndex++) {
        var skin = mdl.skins[skinIndex];
        var texture = new Texture(skin, {
            palette: assets.palette,
            width: mdl.skinWidth,
            height: mdl.skinHeight
        });
        this.skins.push(texture);
    }

    this.id = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.id);
    var data = new Float32Array(mdl.frameCount * mdl.faceCount * 3 * 5);
    var offset = 0;
    for (var i = 0; i < mdl.frameCount; i++) {
        var frame = mdl.frames[i];
        for (var f = 0; f < mdl.faceCount; f++) {
            var face = mdl.faces[f];
            for (var v = 0; v < 3; v++) {
                data[offset++] = frame.vertices[face.indices[v]][0];
                data[offset++] = frame.vertices[face.indices[v]][1];
                data[offset++] = frame.vertices[face.indices[v]][2];

                var s = mdl.texCoords[face.indices[v]].s;
                var t = mdl.texCoords[face.indices[v]].t;

                if (!face.isFrontFace && mdl.texCoords[face.indices[v]].onSeam)
                    s += this.skins[0].width * 0.5; // on back side

                data[offset++] = (s + 0.5) / this.skins[0].width;
                data[offset++] = (t + 0.5) / this.skins[0].height;
            }
        }
    }

    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    this.stride = 5 * 4; // x, y, z, s, t
    this.faceCount = mdl.faceCount;
    this.animations = mdl.animations;
};

Model.prototype.draw = function(p, m, animation, frame) {
    var shader = assets.shaders.model;
    animation = animation | 0;
    frame = frame | 0;
    shader.use();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.id);
    this.skins[0].bind(0);

    gl.vertexAttribPointer(shader.attributes.vertexAttribute, 3, gl.FLOAT, false, this.stride, 0);
    gl.vertexAttribPointer(shader.attributes.texCoordsAttribute, 2, gl.FLOAT, false, this.stride, 12);
    gl.uniformMatrix4fv(shader.uniforms.modelviewMatrix, false, m);
    gl.uniformMatrix4fv(shader.uniforms.projectionMatrix, false, p);

    frame += this.animations[animation].firstFrame;
    if (frame >= this.animations[animation].frameCount)
        frame = 0;

    gl.uniform1i(shader.uniforms.textureMap, 0);
    gl.drawArrays(gl.TRIANGLES, ~~frame * (this.faceCount * 3), this.faceCount * 3);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
};

module.exports = exports = Model;