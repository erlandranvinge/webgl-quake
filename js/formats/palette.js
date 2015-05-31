
var Palette = function(file) {
    this.colors = [];
    for (var i = 0; i < 256; i++) {
        this.colors.push({
            r: file.readUInt8(),
            g: file.readUInt8(),
            b: file.readUInt8()
        });
    }
};

Palette.prototype.apply = function(data, width, height) {
    var pixels = new Uint8Array(4 * width * height);
    for (var i = 0; i < width * height; i++) {
        var color = this.colors[data.readUInt8()];
        pixels[i*4] = color.r;
        pixels[i*4+1] = color.g;
        pixels[i*4+2] = color.b;
        pixels[i*4+3] = 255;
    }
    return pixels;
};

module.exports = exports = Palette;