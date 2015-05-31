
var Texture = function(file, options) {
    var options = options || {};

    if (!options.palette)
        throw 'Error: No palette specified in options.';

    if (!options.width || !options.height) {
        options.width = file.readUInt32();
        options.height = file.readUInt32();

        var pixels = new Uint8Array(4 * options.width * options.height);
        for (var i = 0; i < options.width * options.height; i++) {
            var color = file.readUInt8();
            pixels[i*4] = color;
            pixels[i*4+1] = color;
            pixels[i*4+2] = color;
            pixels[i*4+3] = 0;
        }
    }

    options.format = options.format || gl.RGBA;
    options.type = options.type || gl.UNSIGNED_BYTE;
    options.filter = options.filter || gl.LINEAR;
    options.wrap = options.wrap || gl.CLAMP_TO_EDGE;

    this.id = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.id);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, options.filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, options.filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, options.wrap);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, options.wrap);

    gl.texImage2D(gl.TEXTURE_2D, 0, options.format, options.width, options.height,
        0, options.format, options.type, pixels);
};

module.exports = exports = Texture;