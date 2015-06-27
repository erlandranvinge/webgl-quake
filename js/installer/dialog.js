

var Dialog = function(id) {
    this.id = id;
};

Dialog.prototype.hide = function() {
    var e = document.getElementById(id);
    e.style.display = 'none';
};

Dialog.prototype.show = function() {
    var e = document.getElementById(id);
    e.style.display = 'block';
};

Dialog.prototype.setCaption = function(caption) {
    var e = document.querySelectorAll('#' + this.id + ' p');
    e[0].innerHTML = caption;
};

module.exports = exports = Dialog;
