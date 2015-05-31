
var Assets = function() {
    this.added = {};
    this.cached = {};
    this.loaded = 0;
    this.count = 0;
};

Assets.prototype.add = function(name, format) {
    format = format || 'binary';
    this.added[name] = { name: name, format: format };
    this.count++;
};

Assets.prototype.get = function(name) {
    var item = this.cached[name];
    if (!item)
        throw 'Error: Trying to get non-loaded asset: ' + name;
}

Assets.prototype.load = function(item) {
    var request = new XMLHttpRequest();
    request.open('GET', item.name, true);
    request.overrideMimeType('text/plain; charset=x-user-defined');

    if (item.format === 'binary')
        request.responseType = 'arraybuffer';

    var self = this;
    request.onload = function (e) {
        if (request.status !== 200)
            throw 'Unable to read file from url: ' + item.name;

        var data = item.format === 'binary' ?
            new Uint8Array(request.response) : request.responseText;
        self.cached[item.name] = data;

        if (++self.loaded === self.count)
            self.done();
    };
    request.onerror = function (e) {
        throw 'Unable to read file from url: ' + request.statusText;
    };
    request.send(null);
};

Assets.prototype.loadAll = function(done) {
    this.done = done;
    for (var item in this.added) {
        this.load(this.added[item]);
    }
};

module.exports = exports = Assets;