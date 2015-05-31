
var Utils = {};

Utils.download = function (url, done) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.overrideMimeType('text/plain; charset=x-user-defined');
    request.responseType = 'arraybuffer';
    request.onload = function (e) {
        if (request.status !== 200)
            throw 'Unable to read file from url: ' + url;
        done(new Uint8Array(request.response));
    };
    request.onerror = function (e) {
        throw 'Unable to read file from url: ' + request.statusText;
    };
    request.send(null);
};

module.exports = exports = Utils;