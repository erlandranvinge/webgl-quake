var Dialog = require('installer/dialog');
var zip = require('lib/zip.js').zip;
var lh4 = require('lib/lh4.js');

var Installer = function() {
    this.dialog = new Dialog('dialog');
    this.isLocal = window.location.hostname.indexOf('localhost') !== -1;
};

Installer.crossOriginProxyUrl = 'http://crossorigin.me/';
Installer.mirrors = [
    'http://www.gamers.org/pub/games/quake/idstuff/quake/quake106.zip'
];

Installer.prototype.start = function(done) {
    this.dialog.setCaption('Downloading shareware version of Quake (quake106.zip)...');
    var url = this.isLocal ?
        'data/quake106.zip' :
        Installer.crossOriginProxyUrl + Installer.mirrors[0];

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.overrideMimeType('text/plain; charset=x-user-defined');
   // xhr.responseType = 'arraybuffer';

    var self = this;

    xhr.onreadystatechange = function() {
        self.dialog.setCaption('HATT...', this.readyState);
    };

    xhr.onload = function(e) {
        if (this.status === 200) {

            var blob = new Blob([this.response]);
            zip.createReader(new zip.BlobReader(blob), function(reader) {
                reader.getEntries(function(entries) {
                     console.log('ENTRY', entries[0]);
                });
            });
        }
    };
    xhr.send();
};

module.exports = exports = new Installer();





