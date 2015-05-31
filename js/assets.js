var Pak = require('formats/pak');
var Wad = require('formats/wad');
var Shader = require('gl/shader');
var Palette = require('formats/palette');

function getExtension(path) {
    var index = path.lastIndexOf('.');
    if (index === -1) return '';
    return path.substr(index + 1);
}

function getName(path) {
    var index = path.lastIndexOf('/');
    return path.substr(index + 1);
}

function download(item, done) {
    var request = new XMLHttpRequest();
    request.open('GET', item.url, true);
    request.overrideMimeType('text/plain; charset=x-user-defined');
    if (item.binary)
        request.responseType = 'arraybuffer';
    request.onload = function (e) {
        if (request.status !== 200)
            throw 'Unable to read file from url: ' + item.name;

        var data = item.binary ?
            new Uint8Array(request.response) : request.responseText;
        done(item, data);
    };

    request.onerror = function (e) {
        throw 'Unable to read file from url: ' + request.statusText;
    };
    request.send(null);
}

var Assets = function() {
    this.pending = [];
    this.shaders = {};
};

Assets.prototype.add = function(url, type) {
    type = type || getExtension(url);
    if (!type)
        throw 'Error: Unable to determine type for asset: ' + name;
    var binary = type !== 'shader';
    this.pending.push({ url: url, name: getName(url), type: type, binary: binary });
};

Assets.prototype.loadAll = function(done) {
    var total = this.pending.length;
    var self = this;
    for (var i in this.pending) {
        var pending = this.pending[i];
        download(pending, function(item, data) {
            switch (item.type) {
                case 'pak':
                    self.pak = new Pak(data);
                    self.wad = new Wad(self.pak.load('gfx.wad'));
                    self.palette = new Palette(self.pak.load('gfx/palette.lmp'));
                    break;
                case 'shader':
                    self.shaders[item.name] = new Shader(data);
                    break;
                default: throw 'Error: Unknown type loaded: ' + item.type;
            }
            if (--total <= 0)
                done();
        });
    }
};

module.exports = exports = Assets;