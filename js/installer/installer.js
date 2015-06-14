
var Installer = function() {};

Installer.prototype.start = function(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.overrideMimeType('text/plain; charset=x-user-defined');
    xhr.onreadystatechange = function(e) {
        console.log(this.readyState);
        console.log(this.status);
    };
    xhr.send();
};

module.exports = exports = new Installer();





