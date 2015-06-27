var Shader = require('gl/shader');
var Texture = require('gl/texture');
var Pak = require('formats/pak');
var Wad = require('formats/wad');
var Palette = require('formats/palette');
var Bsp = require('formats/bsp');
var Mdl = require('formats/mdl');
var utils = require('utils');

function getName(path) {
    var index1 = path.lastIndexOf('/');
    var index2 = path.lastIndexOf('.');
    return path.substr(index1 + 1, index2 - index1 - 1);
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
    type = type || utils.getExtension(url);
    if (!type)
        throw 'Error: Unable to determine type for asset: ' + name;
    var binary = type !== 'shader';
    this.pending.push({ url: url, name: getName(url), type: type, binary: binary });
};

Assets.prototype.setPak = function(data) {
    this.pak = new Pak(data);
    this.wad = new Wad(this.pak.load('gfx.wad'));
    this.palette = new Palette(this.pak.load('gfx/palette.lmp'));
};

Assets.prototype.insert = function(item, data) {
    switch (item.type) {
        case 'shader':
            this.shaders[item.name] = new Shader(data);
            break;
        default: throw 'Error: Unknown type loaded: ' + item.type;
    }
};

Assets.prototype.load = function(name, options) {

    var index = name.indexOf('/');
    var location = name.substr(0, index);
    var type = utils.getExtension(name) || 'texture';
    var name = name.substr(index + 1);
    var options = options || {};

    switch (type) {
        case 'bsp':
            return new Bsp(this.pak.load(name));
        case 'mdl':
            return new Mdl(name, this.pak.load(name));
    }

    options.palette = this.palette;
    switch(location) {
        case 'pak':
            var data = this.pak.load(name);
            return new Texture(data, options);
        case 'wad':
            var data = this.wad.get(name);
            return new Texture(data, options);
        default:
            throw 'Error: Cannot load files outside PAK/WAD: ' + name;
    }
};

Assets.prototype.precache = function(done) {
    var total = this.pending.length;
    var self = this;
    for (var i in this.pending) {
        var pending = this.pending[i];
        download(pending, function(item, data) {
            self.insert(item, data);
            if (--total <= 0) {
                self.pending = [];
                done();
            }
        });
    }
};
module.exports = exports = new Assets();