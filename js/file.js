var Buffer = require('buffer').Buffer;

var File = function(data) {
    this.buffer = new Buffer(data);
    this.offset = 0;
};

File.prototype.tell = function() {
    return offset;
};

File.prototype.seek = function(offset) {
    this.offset = offset;
};

File.prototype.skip = function(bytes) {
    this.offset += bytes;
};

File.prototype.slice = function(offset, length) {
    return new File(this.buffer.slice(offset, offset + length));
};

File.prototype.readString = function(length) {
    var result = '';
    for (var i = 0; i < length; i++) {
        var byte = this.buffer.readUInt8(this.offset);
        if (byte !== 0)
            result += String.fromCharCode(byte);
        this.offset++;
    }
    return result;
};

File.prototype.readUInt8 = function() {
    return this.buffer.readUInt8(this.offset++);
};

File.prototype.readUInt32 = function() {
    var result = this.buffer.readUInt32LE(this.offset);
    this.offset += 4;
    return result;
};

File.prototype.readInt32 = function() {
    var result = this.buffer.readInt32LE(this.offset);
    this.offset += 4;
    return result;
};

module.exports = exports = File;
