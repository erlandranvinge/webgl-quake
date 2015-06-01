var assets = require('assets');

var Client = function() {
    this.viewAngles = vec3.create();
    this.viewOrigin = vec3.create();
};

Client.prototype.playDemo = function(name) {
    var demo = assets.pak.load(name);
    demo.skip(4);
    this.demo = demo;
};

Client.prototype.readFromServer = function() {
    var demo = this.demo;
    if (!demo) return;

    var messageSize = demo.readInt32();
    console.log(messageSize);

    this.viewAngles[0] = demo.readFloat();
    this.viewAngles[1] = demo.readFloat();
    this.viewAngles[2] = demo.readFloat();

    var message = demo.read(messageSize);
};

module.exports = exports = Client;