var con = require('ui/console');

var keys = { left: 37, right: 39, up: 38, down: 40, a: 65, z: 90 };

var Input = function(console) {
    this.left = false;
    this.right = false;
    this.up = false;
    this.down = false;
    this.flyUp = false;
    this.flyDown = false;
    var self = this;
    document.addEventListener('keydown', function(event) {
        con.input(event.keyCode);
        self.keyDown(event);
    }, true);
    document.addEventListener('keyup',
        function(event) { self.keyUp(event); }, true);
};

Input.prototype.keyDown = function(event) {
    switch (event.keyCode) {
        case keys.left: this.left = true; break;
        case keys.right: this.right = true; break;
        case keys.up: this.up = true; break;
        case keys.down: this.down = true; break;
        case keys.a: this.flyUp = true; break;
        case keys.z: this.flyDown = true; break;
    }
};

Input.prototype.keyUp = function(event) {
    switch (event.keyCode) {
        case keys.left: this.left = false; break;
        case keys.right: this.right = false; break;
        case keys.up: this.up = false; break;
        case keys.down: this.down = false; break;
        case keys.a: this.flyUp = false; break;
        case keys.z: this.flyDown = false; break;
    }
};

module.exports = exports = Input;