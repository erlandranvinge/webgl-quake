
var Utils = {};

Utils.readDataFromUrl = function (url) {
    var req = new XMLHttpRequest();
    req.open('GET', url, false);
    req.overrideMimeType('text/plain; charset=x-user-defined');
    req.send(null);
    if (req.status !== 200)
        throw 'Unable to read file from url: ' + url;

    return req.responseText;
};

module.exports = exports = Utils;