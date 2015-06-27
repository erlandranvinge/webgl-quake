(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){

var webgl = require('gl/gl');
var assets = require('assets');
var installer = require('installer/installer');
var Input = require('input');
var Console = require('ui/console');
var StatusBar = require('ui/statusbar');
var Client = require('client');

if (!window.requestFrame) {
    window.requestFrame = ( function() {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function() {
                window.setTimeout( callback, 1000 / 60 );
            };
    })();
}

Quake = function() {};

var tick = function(time) {
    //requestFrame(tick);


    for (var i = 0; i < 200; i++)
    Quake.instance.tick(time);


};

Quake.prototype.tick = function(time) {

    this.client.update(time);
    this.handleInput();

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);

    if (this.client.viewEntity > 0)
        this.client.world.draw(this.projection, this.client.viewEntity);

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    this.statusBar.draw(this.ortho);
};

// Temp. controller.
Quake.prototype.handleInput = function() {
    if (this.client.viewEntity === -1)
        return;

    /*
    var angle = utils.deg2Rad(this.client.viewAngles[1]);
    var position = this.client.entities[this.client.viewEntity].nextState.origin;
    var speed = 5.0;

    if (this.input.left)
        this.client.viewAngles[1] -= 2;
    if (this.input.right)
        this.client.viewAngles[1] += 2;
    if (this.input.up) {
        this.client.demo = null;
        position[0] += Math.cos(angle) * speed;
        position[1] -= Math.sin(angle) * speed;
    }
    if (this.input.down) {
        position[0] -= Math.cos(angle) * speed;
        position[1] += Math.sin(angle) * speed;
    }
    if (this.input.flyUp)
        position[2] += 10;
    if (this.input.flyDown)
        position[2] -= 10;
    */
};

Quake.prototype.install = function(done) {
    installer.start(function() {

    });
};

Quake.prototype.start = function() {


    /*
    Quake.instance = this;
    webgl.init('canvas');
    this.ortho = mat4.ortho(mat4.create(), 0, gl.width, gl.height, 0, -10, 10);
    this.projection = mat4.perspective(mat4.create(), 68.03, gl.width / gl.height, 0.1, 4096);

    assets.add('data/pak0.pak');
    assets.add('shaders/color2d.shader');
    assets.add('shaders/model.shader');
    assets.add('shaders/texture2d.shader');
    assets.add('shaders/world.shader');

    var self = this;
    assets.precache(function() {
        self.console = new Console();
        self.statusBar = new StatusBar();
        self.input = new Input();
        self.client = new Client();
        self.client.playDemo('demo2.dem');
        tick();
    });  */
};





}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/fake_7e85d484.js","/")
},{"1YiZ5S":5,"assets":6,"buffer":2,"client":7,"gl/gl":17,"input":22,"installer/installer":24,"ui/console":33,"ui/statusbar":34}],2:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192

/**
 * If `Buffer._useTypedArrays`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (compatible down to IE6)
 */
Buffer._useTypedArrays = (function () {
  // Detect if browser supports Typed Arrays. Supported browsers are IE 10+, Firefox 4+,
  // Chrome 7+, Safari 5.1+, Opera 11.6+, iOS 4.2+. If the browser does not support adding
  // properties to `Uint8Array` instances, then that's the same as no `Uint8Array` support
  // because we need to be able to add all the node Buffer API methods. This is an issue
  // in Firefox 4-29. Now fixed: https://bugzilla.mozilla.org/show_bug.cgi?id=695438
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() &&
        typeof arr.subarray === 'function' // Chrome 9-10 lack `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Workaround: node's base64 implementation allows for non-padded strings
  // while base64-js does not.
  if (encoding === 'base64' && type === 'string') {
    subject = stringtrim(subject)
    while (subject.length % 4 !== 0) {
      subject = subject + '='
    }
  }

  // Find the length
  var length
  if (type === 'number')
    length = coerce(subject)
  else if (type === 'string')
    length = Buffer.byteLength(subject, encoding)
  else if (type === 'object')
    length = coerce(subject.length) // assume that object is array-like
  else
    throw new Error('First argument needs to be a number, array or string.')

  var buf
  if (Buffer._useTypedArrays) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer._useTypedArrays && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    for (i = 0; i < length; i++) {
      if (Buffer.isBuffer(subject))
        buf[i] = subject.readUInt8(i)
      else
        buf[i] = subject[i]
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer._useTypedArrays && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

// STATIC METHODS
// ==============

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.isBuffer = function (b) {
  return !!(b !== null && b !== undefined && b._isBuffer)
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'hex':
      ret = str.length / 2
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.concat = function (list, totalLength) {
  assert(isArray(list), 'Usage: Buffer.concat(list, [totalLength])\n' +
      'list should be an Array.')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (typeof totalLength !== 'number') {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

// BUFFER INSTANCE METHODS
// =======================

function _hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  assert(strLen % 2 === 0, 'Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    assert(!isNaN(byte), 'Invalid hex string')
    buf[offset + i] = byte
  }
  Buffer._charsWritten = i * 2
  return i
}

function _utf8Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function _asciiWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function _binaryWrite (buf, string, offset, length) {
  return _asciiWrite(buf, string, offset, length)
}

function _base64Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function _utf16leWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = _asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = _binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = _base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leWrite(this, string, offset, length)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toString = function (encoding, start, end) {
  var self = this

  encoding = String(encoding || 'utf8').toLowerCase()
  start = Number(start) || 0
  end = (end !== undefined)
    ? Number(end)
    : end = self.length

  // Fastpath empty strings
  if (end === start)
    return ''

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexSlice(self, start, end)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Slice(self, start, end)
      break
    case 'ascii':
      ret = _asciiSlice(self, start, end)
      break
    case 'binary':
      ret = _binarySlice(self, start, end)
      break
    case 'base64':
      ret = _base64Slice(self, start, end)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leSlice(self, start, end)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  assert(end >= start, 'sourceEnd < sourceStart')
  assert(target_start >= 0 && target_start < target.length,
      'targetStart out of bounds')
  assert(start >= 0 && start < source.length, 'sourceStart out of bounds')
  assert(end >= 0 && end <= source.length, 'sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 100 || !Buffer._useTypedArrays) {
    for (var i = 0; i < len; i++)
      target[i + target_start] = this[i + start]
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

function _base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function _utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function _asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++)
    ret += String.fromCharCode(buf[i])
  return ret
}

function _binarySlice (buf, start, end) {
  return _asciiSlice(buf, start, end)
}

function _hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function _utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i+1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = clamp(start, len, 0)
  end = clamp(end, len, len)

  if (Buffer._useTypedArrays) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  return this[offset]
}

function _readUInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    val = buf[offset]
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
  } else {
    val = buf[offset] << 8
    if (offset + 1 < len)
      val |= buf[offset + 1]
  }
  return val
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  return _readUInt16(this, offset, true, noAssert)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  return _readUInt16(this, offset, false, noAssert)
}

function _readUInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    if (offset + 2 < len)
      val = buf[offset + 2] << 16
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
    val |= buf[offset]
    if (offset + 3 < len)
      val = val + (buf[offset + 3] << 24 >>> 0)
  } else {
    if (offset + 1 < len)
      val = buf[offset + 1] << 16
    if (offset + 2 < len)
      val |= buf[offset + 2] << 8
    if (offset + 3 < len)
      val |= buf[offset + 3]
    val = val + (buf[offset] << 24 >>> 0)
  }
  return val
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  return _readUInt32(this, offset, true, noAssert)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  return _readUInt32(this, offset, false, noAssert)
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null,
        'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  var neg = this[offset] & 0x80
  if (neg)
    return (0xff - this[offset] + 1) * -1
  else
    return this[offset]
}

function _readInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt16(buf, offset, littleEndian, true)
  var neg = val & 0x8000
  if (neg)
    return (0xffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  return _readInt16(this, offset, true, noAssert)
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  return _readInt16(this, offset, false, noAssert)
}

function _readInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt32(buf, offset, littleEndian, true)
  var neg = val & 0x80000000
  if (neg)
    return (0xffffffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  return _readInt32(this, offset, true, noAssert)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  return _readInt32(this, offset, false, noAssert)
}

function _readFloat (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 23, 4)
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  return _readFloat(this, offset, true, noAssert)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  return _readFloat(this, offset, false, noAssert)
}

function _readDouble (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 7 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 52, 8)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  return _readDouble(this, offset, true, noAssert)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  return _readDouble(this, offset, false, noAssert)
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'trying to write beyond buffer length')
    verifuint(value, 0xff)
  }

  if (offset >= this.length) return

  this[offset] = value
}

function _writeUInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 2); i < j; i++) {
    buf[offset + i] =
        (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
            (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, false, noAssert)
}

function _writeUInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffffffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 4); i < j; i++) {
    buf[offset + i] =
        (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, false, noAssert)
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7f, -0x80)
  }

  if (offset >= this.length)
    return

  if (value >= 0)
    this.writeUInt8(value, offset, noAssert)
  else
    this.writeUInt8(0xff + value + 1, offset, noAssert)
}

function _writeInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fff, -0x8000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt16(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt16(buf, 0xffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, false, noAssert)
}

function _writeInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fffffff, -0x80000000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt32(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt32(buf, 0xffffffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, false, noAssert)
}

function _writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 23, 4)
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, false, noAssert)
}

function _writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 7 < buf.length,
        'Trying to write beyond buffer length')
    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 52, 8)
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, false, noAssert)
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (typeof value === 'string') {
    value = value.charCodeAt(0)
  }

  assert(typeof value === 'number' && !isNaN(value), 'value is not a number')
  assert(end >= start, 'end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  assert(start >= 0 && start < this.length, 'start out of bounds')
  assert(end >= 0 && end <= this.length, 'end out of bounds')

  for (var i = start; i < end; i++) {
    this[i] = value
  }
}

Buffer.prototype.inspect = function () {
  var out = []
  var len = this.length
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i])
    if (i === exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...'
      break
    }
  }
  return '<Buffer ' + out.join(' ') + '>'
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer._useTypedArrays) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1)
        buf[i] = this[i]
      return buf.buffer
    }
  } else {
    throw new Error('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

// slice(start, end)
function clamp (index, len, defaultValue) {
  if (typeof index !== 'number') return defaultValue
  index = ~~index;  // Coerce to integer.
  if (index >= len) return len
  if (index >= 0) return index
  index += len
  if (index >= 0) return index
  return 0
}

function coerce (length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length)
  return length < 0 ? 0 : length
}

function isArray (subject) {
  return (Array.isArray || function (subject) {
    return Object.prototype.toString.call(subject) === '[object Array]'
  })(subject)
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F)
      byteArray.push(str.charCodeAt(i))
    else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16))
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  var pos
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

/*
 * We have to make sure that the value is a valid integer. This means that it
 * is non-negative. It has no fractional component and that it does not
 * exceed the maximum allowed value.
 */
function verifuint (value, max) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value >= 0, 'specified a negative value for writing an unsigned value')
  assert(value <= max, 'value is larger than maximum value for type')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifsint (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifIEEE754 (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
}

function assert (test, message) {
  if (!test) throw new Error(message || 'Failed assertion')
}

}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/index.js","/../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer")
},{"1YiZ5S":5,"base64-js":3,"buffer":2,"ieee754":4}],3:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/node_modules/base64-js/lib/b64.js","/../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/node_modules/base64-js/lib")
},{"1YiZ5S":5,"buffer":2}],4:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isLE ? (nBytes - 1) : 0,
      d = isLE ? -1 : 1,
      s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isLE ? 0 : (nBytes - 1),
      d = isLE ? 1 : -1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/node_modules/ieee754/index.js","/../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/node_modules/ieee754")
},{"1YiZ5S":5,"buffer":2}],5:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../node_modules/gulp-browserify/node_modules/browserify/node_modules/process/browser.js","/../node_modules/gulp-browserify/node_modules/browserify/node_modules/process")
},{"1YiZ5S":5,"buffer":2}],6:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
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

Assets.prototype.insert = function(item, data) {
    switch (item.type) {
        case 'pak':
            this.pak = new Pak(data);
            this.wad = new Wad(this.pak.load('gfx.wad'));
            this.palette = new Palette(this.pak.load('gfx/palette.lmp'));
            break;
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
}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/assets.js","/")
},{"1YiZ5S":5,"buffer":2,"formats/bsp":9,"formats/mdl":10,"formats/pak":11,"formats/palette":12,"formats/wad":13,"gl/shader":19,"gl/texture":21,"utils":35}],7:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var assets = require('assets');
var Protocol = require('protocol');
var World = require('world');

var Client = function() {
    this.viewEntity = -1;
    this.time = { oldServerTime: 0, serverTime: 0, oldClientTime: 0, clientTime: 0 };
    this.world = new World();
};

Client.prototype.playDemo = function(name) {
    var demo = assets.pak.load(name);
    while (demo.readUInt8() !== 10);
    this.demo = demo;
};

Client.prototype.readFromServer = function() {
    var demo = this.demo;
    if (!demo || demo.eof()) return;

    var messageSize = demo.readInt32();

    var angles = [demo.readFloat(), demo.readFloat(), demo.readFloat()];
    if (this.viewEntity !== -1) {
        //var entity = this.entities[this.viewEntity];
        //vec3.set(entity.state.angles, angles[0], angles[1], angles[1]);
    }

    var msg = demo.read(messageSize);
    var cmd = 0;
    while (cmd !== -1 && !msg.eof()) {
        cmd = msg.readUInt8();
        if (cmd & 128) {
            this.parseFastUpdate(cmd & 127, msg);
            continue;
        }

        switch (cmd) {
            case Protocol.serverDisconnect:
                console.log('DISCONNECT!');
                this.demo = null;
                return;
            case Protocol.serverUpdateStat:
                var stat = msg.readUInt8();
                var value = msg.readInt32();
                break;
            case Protocol.serverSetView:
                this.viewEntity = msg.readInt16();
                break;
            case Protocol.serverTime:
                this.time.oldServerTime = this.time.serverTime;
                this.time.serverTime = msg.readFloat();
                break;
            case Protocol.serverSetAngle:
                var x = msg.readInt8() * 1.40625;
                var y = msg.readInt8() * 1.40625;
                var z = msg.readInt8() * 1.40625;
                break;
            case Protocol.serverSound:
                this.parseSound(msg);
                break;
            case Protocol.serverPrint:
                console.log(msg.readCString());
                break;
            case Protocol.serverLightStyle:
                var style = msg.readUInt8();
                var pattern = msg.readCString();
                break;
            case Protocol.serverClientData:
                this.parseClientData(msg);
                break;
            case Protocol.serverUpdateName:
                var client = msg.readUInt8();
                var name = msg.readCString();
                break;
            case Protocol.serverUpdateFrags:
                var client = msg.readUInt8();
                var frags = msg.readInt16();
                break;
            case Protocol.serverUpdateColors:
                var client = msg.readUInt8();
                var colors = msg.readUInt8();
                break;
            case Protocol.serverParticle:
                this.parseParticle(msg);
                break;
            case Protocol.serverStuffText:
                console.log(msg.readCString());
                break;
            case Protocol.serverTempEntity:
                this.parseTempEntity(msg);
                break;
            case Protocol.serverInfo:
                this.parseServerInfo(msg);
                break;
            case Protocol.serverSignonNum:
                msg.skip(1);
                break;
            case Protocol.serverCdTrack:
                msg.skip(2);
                break;
            case Protocol.serverSpawnStatic:
                this.world.spawnStatic(this.parseBaseline(msg));
                break;
            case Protocol.serverKilledMonster:
                break;
            case Protocol.serverDamage:
                this.parseDamage(msg);
                break;
            case Protocol.serverFoundSecret:
                break;
            case Protocol.serverSpawnBaseline:
                this.world.spawnEntity(msg.readInt16(), this.parseBaseline(msg));
                break;
            case Protocol.serverCenterPrint:
                console.log('CENTER: ', msg.readCString());
                break;
            case Protocol.serverSpawnStaticSound:
                msg.skip(9);
                break;
            default: throw 'Unknown cmd: ' + cmd;
        }
    }
};

Client.prototype.update = function(time) {
    if (!time) return;

    this.time.oldClientTime = this.time.clientTime;
    this.time.clientTime = time / 1000;

    if (this.time.clientTime > this.time.serverTime)
        this.readFromServer();

    var serverDelta = this.time.serverTime - this.time.oldServerTime || 0.1;
    if (serverDelta > 0.1) {
        this.time.oldServerTime = this.time.serverTime - 0.1;
        serverDelta = 0.1;
    }
    var dt = (this.time.clientTime - this.time.oldServerTime) / serverDelta;
    if (dt > 1.0) dt = 1.0;

    this.world.update(dt);
};

Client.prototype.parseServerInfo = function(msg) {
    msg.skip(6);
    var mapName = msg.readCString();

    while(true) {
        var modelName = msg.readCString();
        if (!modelName) break;
        this.world.loadModel(modelName);
    }
    while(true) {
        var soundName = msg.readCString();
        if (!soundName) break;
        //console.log(soundName);
    }
};

Client.prototype.parseClientData = function(msg) {
    var bits = msg.readInt16();
    if (bits & Protocol.clientViewHeight)
        msg.readUInt8();

    if (bits & Protocol.clientIdealPitch)
        msg.readInt8();

    for (var i = 0; i < 3; i++) {

        if (bits & (Protocol.clientPunch1 << i))
            msg.readInt8();

        if (bits & (Protocol.clientVelocity1 << i))
            msg.readInt8();
    }

    msg.readInt32();

    if (bits & Protocol.clientWeaponFrame)
        msg.readUInt8();

    if (bits & Protocol.clientArmor)
        msg.readUInt8();

    if (bits & Protocol.clientWeapon)
        msg.readUInt8();

    msg.readInt16();
    msg.readUInt8();
    msg.readString(5);
};

Client.prototype.parseFastUpdate = function(cmd, msg) {
    if (cmd & Protocol.fastUpdateMoreBits)
        cmd = cmd | (msg.readUInt8() << 8);

    var entityNo = (cmd & Protocol.fastUpdateLongEntity) ?
        msg.readInt16() : msg.readUInt8();


    // TODO: Move entity fast updates into world.js.
    var entity = this.world.entities[entityNo];
    entity.time = this.serverTime;

    if (cmd & Protocol.fastUpdateModel) {
        entity.state.modelIndex = msg.readUInt8();
    }
    if (cmd & Protocol.fastUpdateFrame)
        entity.state.frame = msg.readUInt8();
    //else
    //    entity.state.frame = entity.baseline.frame;

    if (cmd & Protocol.fastUpdateColorMap)
        msg.readUInt8();

    if (cmd & Protocol.fastUpdateSkin)
        msg.readUInt8();
    if (cmd & Protocol.fastUpdateEffects)
        msg.readUInt8();


    for (var i = 0; i < 3; i++) {
        entity.priorState.angles[i] = entity.nextState.angles[i];
        entity.priorState.origin[i] = entity.nextState.origin[i];
    }

    if (cmd & Protocol.fastUpdateOrigin1)
        entity.nextState.origin[0] = msg.readInt16() * 0.125;
    if (cmd & Protocol.fastUpdateAngle1)
        entity.nextState.angles[0] = msg.readInt8() * 1.40625;
    if (cmd & Protocol.fastUpdateOrigin2)
        entity.nextState.origin[1] = msg.readInt16() * 0.125;
    if (cmd & Protocol.fastUpdateAngle2)
        entity.nextState.angles[1] = msg.readInt8() * 1.40625;
    if (cmd & Protocol.fastUpdateOrigin3)
        entity.nextState.origin[2] = msg.readInt16() * 0.125;
    if (cmd & Protocol.fastUpdateAngle3)
        entity.nextState.angles[2] = msg.readInt8() * 1.40625;
};

Client.prototype.parseSound = function(msg) {
    var bits = msg.readUInt8();
    var volume = (bits & Protocol.soundVolume) ? msg.readUInt8() : 255;
    var attenuation = (bits & Protocol.soundAttenuation) ? msg.readUInt8() / 64.0 : 1.0;
    var channel = msg.readInt16();
    var soundIndex = msg.readUInt8();

    var pos = vec3.create();
    pos[0] = msg.readInt16() * 0.125;
    pos[1] = msg.readInt16() * 0.125;
    pos[2] = msg.readInt16() * 0.125;
};

Client.prototype.parseTempEntity = function(msg) {
    var type = msg.readUInt8();
    var pos = vec3.create();
    switch(type) {
        case Protocol.tempGunShot:
        case Protocol.tempWizSpike:
        case Protocol.tempSpike:
        case Protocol.tempSuperSpike:
		case Protocol.tempTeleport:
		case Protocol.tempExplosion:
            pos[0] = msg.readInt16() * 0.125;
            pos[1] = msg.readInt16() * 0.125;
            pos[2] = msg.readInt16() * 0.125;
            break;
		default:
            throw 'Unknown temp. entity encountered: ' + type;
    }
};

Client.prototype.parseDamage = function(msg) {
    var armor = msg.readUInt8();
    var blood = msg.readUInt8();

    var pos = vec3.create();
    pos[0] = msg.readInt16() * 0.125;
    pos[1] = msg.readInt16() * 0.125;
    pos[2] = msg.readInt16() * 0.125;
};

Client.prototype.parseParticle = function(msg) {
    var pos = vec3.create();
    var angles = vec3.create();
    pos[0] = msg.readInt16() * 0.125;
    pos[1] = msg.readInt16() * 0.125;
    pos[2] = msg.readInt16() * 0.125;
    angles[0] = msg.readInt8() * 0.0625;
    angles[1] = msg.readInt8() * 0.0625;
    angles[2] = msg.readInt8() * 0.0625;
    var count = msg.readUInt8();
    var color = msg.readUInt8();
};

Client.prototype.parseBaseline = function(msg) {
    var baseline = {
        modelIndex: msg.readUInt8(),
        frame: msg.readUInt8(),
        colorMap: msg.readUInt8(),
        skin: msg.readUInt8(),
        origin: vec3.create(),
        angles: vec3.create()
    };
    baseline.origin[0] = msg.readInt16() * 0.125;
    baseline.angles[0] = msg.readInt8() * 1.40625;
    baseline.origin[1] = msg.readInt16() * 0.125;
    baseline.angles[1] = msg.readInt8() * 1.40625;
    baseline.origin[2] = msg.readInt16() * 0.125;
    baseline.angles[2] = msg.readInt8() * 1.40625;
    return baseline;
};

module.exports = exports = Client;
}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/client.js","/")
},{"1YiZ5S":5,"assets":6,"buffer":2,"protocol":31,"world":36}],8:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var Buffer = require('buffer').Buffer;

var File = function(data) {
    this.buffer = new Buffer(data);
    this.offset = 0;
};

File.prototype.tell = function() {
    return this.offset;
};

File.prototype.seek = function(offset) {
    this.offset = offset;
};

File.prototype.skip = function(bytes) {
    this.offset += bytes;
};

File.prototype.eof = function() {
    return this.offset >= this.buffer.length;
};

File.prototype.slice = function(offset, length) {
    return new File(this.buffer.slice(offset, offset + length));
};

File.prototype.read = function(length) {
    var result = new File(this.buffer.slice(this.offset, this.offset + length));
    this.offset += length;
    return result;
};

File.prototype.readString = function(length) {
    var result = '';
    var terminated = false;
    for (var i = 0; i < length; i++) {
        var byte = this.buffer.readUInt8(this.offset++);
        if (byte === 0x0) terminated = true;
        if (!terminated)
            result += String.fromCharCode(byte);
    }
    return result;
};

File.prototype.readCString = function() {
    var result = '';
    for (var i = 0; i < 128; i++) {
        var byte = this.buffer.readUInt8(this.offset++);
        if (byte === 0x0) return result;
        result += String.fromCharCode(byte);
    }
    return result;
};

File.prototype.readUInt8 = function() {
    return this.buffer.readUInt8(this.offset++);
};

File.prototype.readInt8 = function() {
    return this.buffer.readInt8(this.offset++);
};

File.prototype.readUInt16 = function() {
    var result = this.buffer.readUInt16LE(this.offset);
    this.offset += 2;
    return result;
};

File.prototype.readInt16 = function() {
    var result = this.buffer.readInt16LE(this.offset);
    this.offset += 2;
    return result;
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

File.prototype.readFloat = function() {
    var result = this.buffer.readFloatLE(this.offset);
    this.offset += 4;
    return result;
};

module.exports = exports = File;

}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/file.js","/")
},{"1YiZ5S":5,"buffer":2}],9:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){

var Bsp = function(file) {
    var header = {
        version: file.readInt32(),
        entities: {offset: file.readInt32(), size: file.readInt32()},
        planes: {offset: file.readInt32(), size: file.readInt32()},
        miptexs: {offset: file.readInt32(), size: file.readInt32()},
        vertices: {offset: file.readInt32(), size: file.readInt32()},
        visilist: {offset: file.readInt32(), size: file.readInt32()},
        nodes: {offset: file.readInt32(), size: file.readInt32()},
        texinfos: {offset: file.readInt32(), size: file.readInt32()},
        faces: {offset: file.readInt32(), size: file.readInt32()},
        lightmaps: {offset: file.readInt32(), size: file.readInt32()},
        clipnodes: {offset: file.readInt32(), size: file.readInt32()},
        leaves: {offset: file.readInt32(), size: file.readInt32()},
        lfaces: {offset: file.readInt32(), size: file.readInt32()},
        edges: {offset: file.readInt32(), size: file.readInt32()},
        ledges: {offset: file.readInt32(), size: file.readInt32()},
        models: {offset: file.readInt32(), size: file.readInt32()}
    };

    this.loadTextures(file, header.miptexs);
    this.loadTexInfos(file, header.texinfos);
    this.loadLightMaps(file, header.lightmaps);

    this.loadModels(file, header.models);
    this.loadVertices(file, header.vertices);
    this.loadEdges(file, header.edges);
    this.loadSurfaceEdges(file, header.ledges);
    this.loadSurfaces(file, header.faces);
};

Bsp.surfaceFlags = {
    planeBack: 2, drawSky: 4, drawSprite: 8, drawTurb: 16,
    drawTiled: 32, drawBackground: 64, underwater: 128
};

Bsp.prototype.loadVertices = function(file, lump) {
    this.vertexCount = lump.size / 12;
    this.vertices = [];
    file.seek(lump.offset);
    for (var i = 0; i < this.vertexCount; i++) {
        this.vertices.push({
            x: file.readFloat(),
            y: file.readFloat(),
            z: file.readFloat()
        });
    }
};

Bsp.prototype.loadEdges = function(file, lump) {
    var edgeCount = lump.size / 4;
    this.edges = [];
    file.seek(lump.offset);
    for (var i = 0; i < edgeCount * 4; i++)
        this.edges.push(file.readUInt16());
};

Bsp.prototype.loadSurfaceEdges = function(file, lump) {
    var edgeListCount = lump.size / 4;
    this.edgeList = [];
    file.seek(lump.offset);
    for (var i = 0; i < edgeListCount; i++) {
        this.edgeList.push(file.readInt32());
    }
};

Bsp.prototype.calculateSurfaceExtents = function(surface) {
    var minS = 99999;
    var maxS = -99999;
    var minT = 99999;
    var maxT = -99999;

    for (var i = 0; i < surface.edgeCount; i++) {
        var edgeIndex = this.edgeList[surface.edgeStart + i];
        var vi = edgeIndex >= 0 ? this.edges[edgeIndex * 2] : this.edges[-edgeIndex * 2 + 1];
        var v = [this.vertices[vi].x, this.vertices[vi].y, this.vertices[vi].z];
        var texInfo = this.texInfos[surface.texInfoId];

        var s = vec3.dot(v, texInfo.vectorS) + texInfo.distS;
        minS = Math.min(minS, s);
        maxS = Math.max(maxS, s);

        var t = vec3.dot(v, texInfo.vectorT) + texInfo.distT;
        minT = Math.min(minT, t);
        maxT = Math.max(maxT, t);
    }

    /* Convert to ints */
    minS = Math.floor(minS / 16);
    minT = Math.floor(minT / 16);
    maxS = Math.ceil(maxS / 16);
    maxT = Math.ceil(maxT / 16);

    surface.textureMins = [minS * 16, minT * 16];
    surface.extents = [(maxS - minS) * 16, (maxT - minT) * 16];
};

Bsp.prototype.loadSurfaces = function (file, lump) {

    var surfaceCount = lump.size / 20;
    this.surfaces = [];
    file.seek(lump.offset);
    for (var i = 0; i < surfaceCount; i++) {
        var surface = {};
        surface.planeId = file.readUInt16();
        surface.side = file.readUInt16();
        surface.edgeStart = file.readInt32();
        surface.edgeCount = file.readInt16();
        surface.texInfoId = file.readUInt16();

        surface.lightStyles = [file.readUInt8(), file.readUInt8(), file.readUInt8(), file.readUInt8()];
        surface.lightMapOffset = file.readInt32();
        surface.flags = 0;

        this.calculateSurfaceExtents(surface);
        this.surfaces.push(surface);
    }
};

Bsp.prototype.loadTextures = function(file, lump) {
    file.seek(lump.offset);
    var textureCount = file.readInt32();

    this.textures = [];
    for (var i = 0; i < textureCount; i++) {
        var textureOffset = file.readInt32();
        var originalOffset = file.tell();
        file.seek(lump.offset + textureOffset);
        var texture = {
            name: file.readString(16),
            width: file.readUInt32(),
            height: file.readUInt32(),
        };
        var offset = lump.offset + textureOffset + file.readUInt32();
        texture.data = file.slice(offset, texture.width * texture.height);
        this.textures.push(texture);

        file.seek(originalOffset);
    }
};

Bsp.prototype.loadTexInfos = function(file, lump) {
    file.seek(lump.offset);
    var texInfoCount = lump.size / 40;
    this.texInfos = [];
    for (var i = 0; i < texInfoCount; i++) {
        var info = {};
        info.vectorS = [file.readFloat(), file.readFloat(), file.readFloat()];
        info.distS = file.readFloat();
        info.vectorT = [file.readFloat(), file.readFloat(), file.readFloat()];
        info.distT = file.readFloat();
        info.textureId = file.readUInt32();
        info.animated = file.readUInt32() == 1;
        this.texInfos.push(info);
    }
};

Bsp.prototype.loadModels = function(file, lump) {
    file.seek(lump.offset);
    var modelCount = lump.size / 64;
    this.models = [];
    for (var i = 0; i < modelCount; i++) {

        var model = {};
        model.mins = vec3.create([file.readFloat(), file.readFloat(), file.readFloat()]);
        model.maxes = vec3.create([file.readFloat(), file.readFloat(), file.readFloat()]);
        model.origin = vec3.create([file.readFloat(), file.readFloat(), file.readFloat()]);
        model.bspNode = file.readInt32();
        model.clipNode1 = file.readInt32();
        model.clipNode2 = file.readInt32();
        file.readInt32(); // Skip for now.
        model.visLeafs = file.readInt32();
        model.firstSurface = file.readInt32();
        model.surfaceCount = file.readInt32();
        this.models.push(model);
    }
};


Bsp.prototype.loadLightMaps = function (file, lump) {
    file.seek(lump.offset);
    this.lightMaps = [];
    for (var i = 0; i < lump.size; i++)
        this.lightMaps.push(file.readUInt8());
};

module.exports = exports = Bsp;
}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/formats/bsp.js","/formats")
},{"1YiZ5S":5,"buffer":2}],10:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){

var Alias = { single: 0, group: 1};

var Mdl = function(name, file) {
    this.name = name;
    this.loadHeader(file);
    this.loadSkins(file);
    this.loadTexCoords(file);
    this.loadFaces(file);
    this.loadFrames(file);
};

Mdl.prototype.loadHeader = function(file) {
    this.id = file.readString(4);
    this.version = file.readUInt32();
    this.scale = vec3.fromValues(file.readFloat(), file.readFloat(), file.readFloat());
    this.origin = vec3.fromValues(file.readFloat(), file.readFloat(), file.readFloat());
    this.radius = file.readFloat();
    this.eyePosition = [file.readFloat(), file.readFloat(), file.readFloat()];
    this.skinCount = file.readInt32();
    this.skinWidth = file.readInt32();
    this.skinHeight = file.readInt32();
    this.vertexCount = file.readInt32();
    this.faceCount = file.readInt32();
    this.frameCount = file.readInt32();
    this.syncType = file.readInt32();
    this.flags = file.readInt32();
    this.averageFaceSize = file.readFloat();
};


Mdl.prototype.loadSkins = function(file) {
    file.seek(0x54); //baseskin offset, where skins start.
    this.skins = [];
    for (var i = 0; i < this.skinCount; i++) {
        var group = file.readInt32();
        if (group !== Alias.single) {
            console.log('Warning: Multiple skins not supported yet.');
        }
        var data = file.read(this.skinWidth * this.skinHeight);

        this.skins.push(data);
    }
};

Mdl.prototype.loadTexCoords = function(file) {
    this.texCoords = [];
    for (var i = 0; i < this.vertexCount; i++) {
        var texCoord = {};
        texCoord.onSeam = file.readInt32() == 0x20;
        texCoord.s = file.readInt32();
        texCoord.t = file.readInt32();
        this.texCoords.push(texCoord);
    }
};

Mdl.prototype.loadFaces = function(file) {
    this.faces = [];
    for (var i = 0; i < this.faceCount; i++) {
        var face = {};
        face.isFrontFace = file.readInt32() == 1;
        face.indices = [file.readInt32(), file.readInt32(), file.readInt32()];
        this.faces.push(face);
    }
    return true;
};

Mdl.prototype.loadFrames = function(file) {
    this.frames = [];
    this.animations = [];
    for (var i = 0; i < this.frameCount; i++) {
        var type = file.readInt32();
        switch (type) {
            case Alias.single:
                if (this.animations.length == 0)
                    this.animations.push({ firstFrame: 0, frameCount: this.frameCount });

                this.frames.push(this.loadSingleFrame(file));
                break;
            case Alias.group:
                var frames = this.loadGroupFrame(file);
                this.animations.push({ firstFrame: this.frames.length, frameCount: frames.length });

                for (var f = 0; f < frames.length; f++)
                    this.frames.push(frames[f]);
                break;
            default:
                console.warn('Warning: Unknown frame type: ' + type + ' found in ' + this.name);
                return false;
        }
    }

    // Reset framecounter to actual full framecount including all flatten groups.
    this.frameCount = this.frames.length;
    return true;
};

Mdl.prototype.loadSingleFrame = function(file) {
    var frame = {};
    frame.type = Alias.single;
    frame.bbox = [
        file.readUInt8(), file.readUInt8(), file.readUInt8(), file.readUInt8(),
        file.readUInt8(), file.readUInt8(), file.readUInt8(), file.readUInt8()
    ];

    frame.name = file.readString(16);
    frame.vertices = [];
    frame.poseCount = 1;
    frame.interval = 0;
    for (var v = 0; v < this.vertexCount; v++) {
        var vertex = [
            this.scale[0] * file.readUInt8() + this.origin[0],
            this.scale[1] * file.readUInt8() + this.origin[1],
            this.scale[2] * file.readUInt8() + this.origin[2]];
        frame.vertices.push([vertex[0], vertex[1], vertex[2]]);
        file.readUInt8(); // Don't care about normal for now
    }
    return frame;
};

Mdl.prototype.loadGroupFrame = function (file) {
    var groupFrame = {};
    groupFrame.type = Alias.group;
    groupFrame.poseCount = file.readUInt32();
    groupFrame.bbox = [
        file.readUInt8(), file.readUInt8(), file.readUInt8(), file.readUInt8(),
        file.readUInt8(), file.readUInt8(), file.readUInt8(), file.readUInt8()
    ];

    var intervals = [];
    for (var i = 0; i < groupFrame.poseCount; i++)
        intervals.push(file.readFloat());

    var frames = [];
    for (var f = 0; f < groupFrame.poseCount; f++) {
        var frame = this.loadSingleFrame(file);
        frame.interval = intervals[i];
        frames.push(frame);
    }
    return frames;
};



module.exports = exports = Mdl;
}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/formats/mdl.js","/formats")
},{"1YiZ5S":5,"buffer":2}],11:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var File = require('file');
var Wad = require('formats/wad');
var Palette = require('formats/palette');

var Pak = function(data) {
    var file = new File(data);

    if (file.readString(4) !== 'PACK')
        throw 'Error: Corrupt PAK file.';

    var indexOffset = file.readUInt32();
    var indexFileCount = file.readUInt32() / 64;

    file.seek(indexOffset);
    this.index = {};
    for (var i = 0; i < indexFileCount; i++) {
        var path = file.readString(56);
        var offset = file.readUInt32();
        var size = file.readUInt32();
        this.index[path] = { offset: offset, size: size };
    }
    console.log('PAK: Loaded %i entries.', indexFileCount);

    this.file = file;
};

Pak.prototype.load = function(name) {
    var entry = this.index[name];
    if (!entry)
        throw 'Error: Can\'t find entry in PAK: ' + name;
    return this.file.slice(entry.offset, entry.size);
};

module.exports = exports = Pak;
}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/formats/pak.js","/formats")
},{"1YiZ5S":5,"buffer":2,"file":8,"formats/palette":12,"formats/wad":13}],12:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){

var Palette = function(file) {
    this.colors = [];
    for (var i = 0; i < 256; i++) {
        this.colors.push({
            r: file.readUInt8(),
            g: file.readUInt8(),
            b: file.readUInt8()
        });
    }
};

Palette.prototype.unpack = function(file, width, height, alpha) {
    var pixels = new Uint8Array(4 * width * height);
    for (var i = 0; i < width * height; i++) {
        var index = file.readUInt8();
        var color = this.colors[index];
        pixels[i*4] = color.r;
        pixels[i*4+1] = color.g;
        pixels[i*4+2] = color.b;
        pixels[i*4+3] = (alpha && !index) ? 0 : 255;
    }
    return pixels;
};

module.exports = exports = Palette;
}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/formats/palette.js","/formats")
},{"1YiZ5S":5,"buffer":2}],13:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){

var Wad = function(file) {
    this.lumps = [];
    if (file.readString(4) !== 'WAD2')
        throw 'Error: Corrupt WAD-file encountered.';

    var lumpCount = file.readUInt32();
    var offset = file.readUInt32();

    file.seek(offset);
    var index = [];
    for (var i = 0; i < lumpCount; i++) {
        var offset = file.readUInt32();
        file.skip(4);
        var size = file.readUInt32();
        var type = file.readUInt8();
        file.skip(3);
        var name = file.readString(16);
        index.push({ name: name, offset: offset, size: size });
    }

    this.lumps = {};
    for (var i = 0; i < index.length; i++) {
        var entry = index[i];
        this.lumps[entry.name] = file.slice(entry.offset, entry.size);
    }
    console.log('WAD: Loaded %s lumps.', lumpCount);
};

Wad.prototype.get = function(name) {
    var file = this.lumps[name];
    if (!file)
        throw 'Error: No such entry found in WAD: ' + name;
    return file;
};

module.exports = exports = Wad;
}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/formats/wad.js","/formats")
},{"1YiZ5S":5,"buffer":2}],14:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var utils = require('utils');

var Texture = function(file, options) {
    var options = options || {};
    options.alpha = options.alpha || false;
    options.format = options.format || gl.RGBA;
    options.type = options.type || gl.UNSIGNED_BYTE;
    options.filter = options.filter || gl.LINEAR;
    options.wrap = options.wrap || gl.CLAMP_TO_EDGE;

    this.id = gl.createTexture();
    this.width = options.width || file.readUInt32();
    this.height = options.height || file.readUInt32();
    gl.bindTexture(gl.TEXTURE_2D, this.id);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, options.filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, options.filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, options.wrap);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, options.wrap);

    if (file) {
        if (!options.palette)
            throw 'Error: No palette specified in options.';

        var pixels = options.palette.unpack(file, this.width, this.height, options.alpha);
        var npot = utils.isPowerOf2(this.width) && utils.isPowerOf2(this.height);
        if (!npot && options.wrap === gl.REPEAT) {
            var newWidth = utils.nextPowerOf2(this.width);
            var newHeight = utils.nextPowerOf2(this.height);
            pixels = this.resample(pixels, this.width, this.height, newWidth, newHeight);
            gl.texImage2D(gl.TEXTURE_2D, 0, options.format, newWidth, newHeight,
                0, options.format, options.type, pixels);
        } else {
            gl.texImage2D(gl.TEXTURE_2D, 0, options.format, this.width, this.height,
                0, options.format, options.type, pixels);
        }
    } else {
        gl.texImage2D(gl.TEXTURE_2D, 0, options.format, this.width, this.height,
            0, options.format, options.type, null);
    }
};

Texture.prototype.drawTo = function (callback) {
    var v = gl.getParameter(gl.VIEWPORT);

    /* Setup shared buffers for render target drawing */
    if (typeof Texture.frameBuffer == 'undefined') {
        Texture.frameBuffer = gl.createFramebuffer();
        Texture.renderBuffer = gl.createRenderbuffer();
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, Texture.frameBuffer);
    gl.bindRenderbuffer(gl.RENDERBUFFER, Texture.renderBuffer);
    if (this.width != Texture.renderBuffer.width || this.height != Texture.renderBuffer.height) {
        Texture.renderBuffer.width = this.width;
        Texture.renderBuffer.height = this.height;
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);
    }


    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.id, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, Texture.renderBuffer);
    gl.viewport(0, 0, this.width, this.height);

    var projectionMatrix = mat4.ortho(mat4.create(), 0, this.width, 0, this.height, -10, 10);
    callback(projectionMatrix);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.viewport(v[0], v[1], v[2], v[3]);
};

Texture.prototype.resample = function(pixels, width, height, newWidth, newHeight) {
    var src = document.createElement('canvas');
    src.width = width;
    src.height = height;
    var context = src.getContext('2d');
    var imageData = context.createImageData(width, height);
    imageData.data.set(pixels);
    context.putImageData(imageData, 0, 0);

    var dest = document.createElement('canvas');
    dest.width = newWidth;
    dest.height = newHeight;
    context = dest.getContext('2d');
    context.drawImage(src, 0, 0, dest.width, dest.height);
    var image = context.getImageData(0, 0, dest.width, dest.height);
    return new Uint8Array(image.data);
};

Texture.prototype.bind = function(unit) {
    gl.activeTexture(gl.TEXTURE0 + (unit || 0));
    gl.bindTexture(gl.TEXTURE_2D, this.id);
};

Texture.prototype.unbind = function(unit) {
    gl.activeTexture(gl.TEXTURE0 + (unit || 0));
    gl.bindTexture(gl.TEXTURE_2D, null);
};

Texture.prototype.asDataUrl = function() {
    var framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.id, 0);

    var width = this.width;
    var height = this.height;

    // Read the contents of the framebuffer
    var data = new Uint8Array(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.deleteFramebuffer(framebuffer);

    // Create a 2D canvas to store the result
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    var context = canvas.getContext('2d');

    // Copy the pixels to a 2D canvas
    var imageData = context.createImageData(width, height);
    imageData.data.set(data);
    context.putImageData(imageData, 0, 0);
    return canvas.toDataURL();
};

module.exports = exports = Texture;
}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/gl/Texture.js","/gl")
},{"1YiZ5S":5,"buffer":2,"utils":35}],15:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var Texture = require('gl/texture');

var Atlas = function (width, height) {
    this.width = width || 512;
    this.height = height || 512;
    this.tree = { children: [], x: 0, y: 0, width: width, height: height };
    this.subTextures = [];
    this.texture = null;
};

Atlas.prototype.getSubTexture = function (subTextureId) {
    return this.subTextures[subTextureId];
};

Atlas.prototype.addSubTexture = function (texture) {
    var node = this.getFreeNode(this.tree, texture);
    if (node == null)
        throw 'Error: Unable to pack sub texture! It simply won\'t fit. :/';
    node.texture = texture;
    this.subTextures.push({
        texture: node.texture,
        x: node.x, y: node.y,
        width: node.width, height: node.height,
        s1: node.x / this.tree.width,
        t1: node.y / this.tree.height,
        s2: (node.x + node.width) / this.tree.width,
        t2: (node.y + node.height) / this.tree.height
    });
    return this.subTextures.length - 1;
};

Atlas.prototype.reuseSubTexture = function (s1, t1, s2, t2) {
    this.subTextures.push({ s1: s1, t1: t1, s2: s2, t2: t2 });
};

Atlas.prototype.compile = function(shader) {

    var buffer = new Float32Array(this.subTextures.length * 6 * 5); // x,y,z,s,t
    var width = this.tree.width;
    var height = this.tree.height;
    var offset = 0;
    var subTextures = this.subTextures;
    for (var i = 0; i < subTextures.length; i++) {
        var subTexture = subTextures[i];
        this.addSprite(buffer, offset,
            subTexture.x, subTexture.y,
            subTexture.width, subTexture.height);
        offset += (6 * 5);
    }

    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.STATIC_DRAW);

    var texture = new Texture(null, { width: width, height: height/*, filter: gl.NEAREST */ });
    texture.drawTo(function (projectionMatrix) {
        shader.use();
        gl.enableVertexAttribArray(shader.attributes.vertexAttribute);
        gl.enableVertexAttribArray(shader.attributes.texCoordsAttribute);
        gl.vertexAttribPointer(shader.attributes.vertexAttribute, 3, gl.FLOAT, false, 20, 0);
        gl.vertexAttribPointer(shader.attributes.texCoordsAttribute, 2, gl.FLOAT, false, 20, 12);
        gl.uniformMatrix4fv(shader.uniforms.projectionMatrix, false, projectionMatrix);
        for (var i = 0; i < subTextures.length; i++) {
            var subTexture = subTextures[i];
            if (!subTexture.texture)
                continue;

            gl.bindTexture(gl.TEXTURE_2D, subTexture.texture.id);
            gl.drawArrays(gl.TRIANGLES, i * 6, 6);

            gl.deleteTexture(subTexture.texture.id);
            subTexture.texture = null;
        }
    });
    this.texture = texture;
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.deleteBuffer(vertexBuffer);
    this.tree = null;
};

Atlas.prototype.addSprite = function (data, offset, x, y, width, height) {
    var z = 0;
    data[offset + 0] = x; data[offset + 1] = y; data[offset + 2] = z;
    data[offset + 3] = 0; data[offset + 4] = 0;
    data[offset + 5] = x + width; data[offset + 6] = y; data[offset + 7] = z;
    data[offset + 8] = 1; data[offset + 9] = 0;
    data[offset + 10] = x + width; data[offset + 11] = y + height; data[offset + 12] = z;
    data[offset + 13] = 1; data[offset + 14] = 1;
    data[offset + 15] = x + width; data[offset + 16] = y + height; data[offset + 17] = z;
    data[offset + 18] = 1; data[offset + 19] = 1;
    data[offset + 20] = x; data[offset + 21] = y + height; data[offset + 22] = z;
    data[offset + 23] = 0; data[offset + 24] = 1;
    data[offset + 25] = x; data[offset + 26] = y; data[offset + 27] = z;
    data[offset + 28] = 0; data[offset + 29] = 0;
};

Atlas.prototype.getFreeNode = function (node, texture) {
    if (node.children[0] || node.children[1]) {
        var result = this.getFreeNode(node.children[0], texture);
        if (result)
            return result;

        return this.getFreeNode(node.children[1], texture);
    }

    if (node.texture)
        return null;
    if (node.width < texture.width || node.height < texture.height)
        return null;
    if (node.width == texture.width && node.height == texture.height)
        return node;

    var dw = node.width - texture.width;
    var dh = node.height - texture.height;

    if (dw > dh) {
        node.children[0] = { children: [null, null],
            x: node.x,
            y: node.y,
            width: texture.width,
            height: node.height
        };
        node.children[1] = { children: [null, null],
            x: node.x + texture.width,
            y: node.y,
            width: node.width - texture.width,
            height: node.height
        };
    } else {
        node.children[0] = { children: [null, null],
            x: node.x,
            y: node.y,
            width: node.width,
            height: texture.height
        };
        node.children[1] = { children: [null, null],
            x: node.x,
            y: node.y + texture.height,
            width: node.width,
            height: node.height - texture.height
        };
    }
    return this.getFreeNode(node.children[0], texture);
};

module.exports = exports = Atlas;

}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/gl/atlas.js","/gl")
},{"1YiZ5S":5,"buffer":2,"gl/texture":21}],16:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){

var Font = function (texture, charWidth, charHeight) {
    this.texture = texture;
    this.charWidth = charWidth || 8;
    this.charHeight = charHeight || 8;
    this.data = new Float32Array(6 * 5 * 4 * 1024); // <= 1024 max characters.
    this.vertexBuffer = gl.createBuffer();
    this.vertexBuffer.name = 'spriteFont';
    this.offset = 0;
    this.elementCount = 0;
};

Font.prototype.addVertex = function(x, y, u, v) {
    this.data[this.offset++] = x;
    this.data[this.offset++] = y;
    this.data[this.offset++] = 0;
    this.data[this.offset++] = u;
    this.data[this.offset++] = v;
};

Font.prototype.drawCharacter = function(x, y, index) {
    if (index == 32 || y < 0 || x < 0 || x > gl.width || y > gl.height)
        return;

    index &= 255;
    var row = index >> 4;
    var column = index & 15;

    var frow = row * 0.0625;
    var fcol = column * 0.0625;
    var size = 0.0625;

    this.addVertex(x, y, fcol, frow);
    this.addVertex(x + this.charWidth, y, fcol + size, frow);
    this.addVertex(x + this.charWidth, y + this.charHeight, fcol + size,  frow + size);
    this.addVertex(x + this.charWidth, y + this.charHeight, fcol + size,  frow + size);
    this.addVertex(x, y + this.charHeight, fcol, frow + size);
    this.addVertex(x, y, fcol, frow);
    this.elementCount += 6;
};

Font.prototype.drawString = function(x, y, str, mode) {
    var offset = mode ? 128 : 0;
    for (var i = 0; i < str.length; i++)
        this.drawCharacter(x + ((i + 1) * this.charWidth), y, str.charCodeAt(i) + offset);
};

Font.prototype.render = function(shader, p) {
    if (!this.elementCount)
        return;

    shader.use();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.data, gl.STREAM_DRAW);
    gl.vertexAttribPointer(shader.attributes.vertexAttribute, 3, gl.FLOAT, false, 20, 0);
    gl.vertexAttribPointer(shader.attributes.texCoordsAttribute, 2, gl.FLOAT, false, 20, 12);
    gl.enableVertexAttribArray(shader.attributes.vertexAttribute);
    gl.enableVertexAttribArray(shader.attributes.texCoordsAttribute);

    gl.uniformMatrix4fv(shader.uniforms.projectionMatrix, false, p);

    gl.bindTexture(gl.TEXTURE_2D, this.texture.id);
    gl.drawArrays(gl.TRIANGLES, 0, this.elementCount);


    this.elementCount = 0;
    this.offset = 0;

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
};

module.exports = exports = Font;
}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/gl/font.js","/gl")
},{"1YiZ5S":5,"buffer":2}],17:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var glMatrix = require('lib/gl-matrix-min.js');

var gl = function() {};

gl.init = function(id) {

    var canvas = document.getElementById(id);
    if (!canvas)
        throw 'Error: No canvas element found.';

    var options = {};
    var gl = canvas.getContext('webgl', options);
    if (!gl)
        throw 'Error: No WebGL support found.';
	canvas.width  = window.innerWidth;
	canvas.height = window.innerHeight;


    gl.width = canvas.width;
    gl.height = canvas.height;
    gl.clearColor(0, 0, 0, 1);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.depthFunc(gl.LEQUAL);
    //gl.cullFace(gl.FRONT);
    gl.viewport(0, 0, gl.width, gl.height);

    window.vec2 = glMatrix.vec2;
    window.vec3 = glMatrix.vec3;
    window.mat4 = glMatrix.mat4;
    window.gl = gl;

    return gl;
};

module.exports = exports = gl;


}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/gl/gl.js","/gl")
},{"1YiZ5S":5,"buffer":2,"lib/gl-matrix-min.js":25}],18:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){

var LightMap = function(data, offset, width, height) {
    this.width = width;
    this.height = height;
    this.id = gl.createTexture();

    var pixels = new Uint8Array(width * height * 3);
    for (var i = 0; i < width * height; i++) {
        var intensity = data[offset + i];
        intensity = !intensity ? 0 : intensity;
        pixels[i * 3 + 0] = intensity;
        pixels[i * 3 + 1] = intensity;
        pixels[i * 3 + 2] = intensity;
    }

    gl.bindTexture(gl.TEXTURE_2D, this.id);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, pixels);
};

LightMap.prototype.bind = function(unit) {
    gl.activeTexture(gl.TEXTURE0 + (unit || 0));
    gl.bindTexture(gl.TEXTURE_2D, this.id);
};

LightMap.prototype.unbind = function(unit) {
    gl.activeTexture(gl.TEXTURE0 + (unit || 0));
    gl.bindTexture(gl.TEXTURE_2D, null);
};

LightMap.prototype.asDataUrl = function() {
    var framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.id, 0);

    var width = this.width;
    var height = this.height;

    // Read the contents of the framebuffer
    var data = new Uint8Array(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.deleteFramebuffer(framebuffer);

    // Create a 2D canvas to store the result
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    var context = canvas.getContext('2d');

    // Copy the pixels to a 2D canvas
    var imageData = context.createImageData(width, height);
    imageData.data.set(data);
    context.putImageData(imageData, 0, 0);
    return canvas.toDataURL();
};

module.exports = exports = LightMap;
}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/gl/lightmap.js","/gl")
},{"1YiZ5S":5,"buffer":2}],19:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){

function compileShader(type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw 'Error: Shader compile error: ' + gl.getShaderInfoLog(shader);
    }
    return shader;
}

var Shader = function(source) {
    var vertexStart = source.indexOf('[vertex]');
    var fragmentStart = source.indexOf('[fragment]');
    if (vertexStart === -1 || fragmentStart === -1)
        throw 'Error: Missing [fragment] and/or [vertex] markers in shader.';

    var vertexSource = source.substring(vertexStart + 8, fragmentStart);
    var fragmentSource = source.substring(fragmentStart + 10);
    this.compile(vertexSource, fragmentSource);
};

Shader.prototype.compile = function(vertexSource, fragmentSource) {
    var program = gl.createProgram();
    gl.attachShader(program, compileShader(gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        throw 'Error: Shader linking error: ' + gl.getProgramInfoLog(program);

    var sources = vertexSource + fragmentSource;
    var lines = sources.match(/(uniform|attribute)\s+\w+\s+\w+(?=;)/g);
    this.uniforms = {};
    this.attributes = {};
    this.samplers = [];
    for (var i in lines) {
        var tokens = lines[i].split(' ');
        var name = tokens[2];
        var type = tokens[1];
        switch (tokens[0]) {
            case 'attribute':
                var attributeLocation = gl.getAttribLocation(program, name);
                this.attributes[name] = attributeLocation;
                break;
            case 'uniform':
                var location = gl.getUniformLocation(program, name);
                if (type === 'sampler2D')
                    this.samplers.push(location);
                this.uniforms[name] = location;
                break;
            default:
                throw 'Invalid attribute/uniform found: ' + tokens[1];
        }
    }
    this.program = program;
};

Shader.prototype.use = function() {
    gl.useProgram(this.program);
};

module.exports = exports = Shader;
}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/gl/shader.js","/gl")
},{"1YiZ5S":5,"buffer":2}],20:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var Atlas = require('gl/atlas');

var Sprites = function (width, height, spriteCount) {
    this.spriteComponents = 9; // xyz, uv, rgba
    this.spriteVertices = 6;
    this.maxSprites = spriteCount || 128;
    this.textures = new Atlas(width, height);
    this.spriteCount = 0;
    this.data = new Float32Array(this.maxSprites * this.spriteComponents * this.spriteVertices);
    this.vertexBuffer = gl.createBuffer();
    this.dirty = false;
};

Sprites.prototype.drawSprite = function (texture, x, y, width, height, r, g, b, a) {
    var z = 0;
    var data = this.data;
    var offset = this.spriteCount * this.spriteVertices * this.spriteComponents;
    var t = this.textures.getSubTexture(texture);
    width = width || t.width;
    height = height || t.height;

    data[offset + 0] = x;
    data[offset + 1] = y;
    data[offset + 2] = z;
    data[offset + 3] = t.s1;
    data[offset + 4] = t.t1;
    data[offset + 5] = r;
    data[offset + 6] = g;
    data[offset + 7] = b;
    data[offset + 8] = a;

    data[offset + 9] = x + width;
    data[offset + 10] = y;
    data[offset + 11] = z;
    data[offset + 12] = t.s2;
    data[offset + 13] = t.t1;
    data[offset + 14] = r;
    data[offset + 15] = g;
    data[offset + 16] = b;
    data[offset + 17] = a;

    data[offset + 18] = x + width;
    data[offset + 19] = y + height;
    data[offset + 20] = z;
    data[offset + 21] = t.s2;
    data[offset + 22] = t.t2;
    data[offset + 23] = r;
    data[offset + 24] = g;
    data[offset + 25] = b;
    data[offset + 26] = a;

    data[offset + 27] = x + width;
    data[offset + 28] = y + height;
    data[offset + 29] = z;
    data[offset + 30] = t.s2;
    data[offset + 31] = t.t2;
    data[offset + 32] = r;
    data[offset + 33] = g;
    data[offset + 34] = b;
    data[offset + 35] = a;

    data[offset + 36] = x;
    data[offset + 37] = y + height;
    data[offset + 38] = z;
    data[offset + 39] = t.s1;
    data[offset + 40] = t.t2;
    data[offset + 41] = r;
    data[offset + 42] = g;
    data[offset + 43] = b;
    data[offset + 44] = a;

    data[offset + 45] = x;
    data[offset + 46] = y;
    data[offset + 47] = z;
    data[offset + 48] = t.s1;
    data[offset + 49] = t.t1;
    data[offset + 50] = r;
    data[offset + 51] = g;
    data[offset + 52] = b;
    data[offset + 53] = a;

    this.dirty = true;
    return this.spriteCount++;
};

Sprites.prototype.clear = function () {
    this.spriteCount = 0;
};

Sprites.prototype.render = function (shader, p, firstSprite, spriteCount) {
    if (this.spriteCount <= 0)
        return;

    firstSprite = firstSprite || 0;
    spriteCount = spriteCount || this.spriteCount;

    shader.use();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    gl.enableVertexAttribArray(shader.attributes.vertexAttribute);
    gl.enableVertexAttribArray(shader.attributes.texCoordsAttribute);
    gl.enableVertexAttribArray(shader.attributes.colorsAttribute);

    gl.vertexAttribPointer(shader.attributes.vertexAttribute, 3, gl.FLOAT, false, 36, 0);
    gl.vertexAttribPointer(shader.attributes.texCoordsAttribute, 2, gl.FLOAT, false, 36, 12);
    gl.vertexAttribPointer(shader.attributes.colorsAttribute, 4, gl.FLOAT, false, 36, 20);

    gl.uniformMatrix4fv(shader.uniforms.projectionMatrix, false, p);

    if (this.dirty) {
        gl.bufferData(gl.ARRAY_BUFFER, this.data, gl.STATIC_DRAW);
        this.dirty = false;
    }
    gl.bindTexture(gl.TEXTURE_2D, this.textures.texture.id);
    gl.drawArrays(gl.TRIANGLES, firstSprite * this.spriteVertices, spriteCount * this.spriteVertices);
};

module.exports = exports = Sprites;

}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/gl/sprites.js","/gl")
},{"1YiZ5S":5,"buffer":2,"gl/atlas":15}],21:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var utils = require('utils');

var Texture = function(file, options) {
    var options = options || {};
    options.alpha = options.alpha || false;
    options.format = options.format || gl.RGBA;
    options.type = options.type || gl.UNSIGNED_BYTE;
    options.filter = options.filter || gl.LINEAR;
    options.wrap = options.wrap || gl.CLAMP_TO_EDGE;

    this.id = gl.createTexture();
    this.width = options.width || file.readUInt32();
    this.height = options.height || file.readUInt32();
    gl.bindTexture(gl.TEXTURE_2D, this.id);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, options.filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, options.filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, options.wrap);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, options.wrap);

    if (file) {
        if (!options.palette)
            throw 'Error: No palette specified in options.';

        var pixels = options.palette.unpack(file, this.width, this.height, options.alpha);
        var npot = utils.isPowerOf2(this.width) && utils.isPowerOf2(this.height);
        if (!npot && options.wrap === gl.REPEAT) {
            var newWidth = utils.nextPowerOf2(this.width);
            var newHeight = utils.nextPowerOf2(this.height);
            pixels = this.resample(pixels, this.width, this.height, newWidth, newHeight);
            gl.texImage2D(gl.TEXTURE_2D, 0, options.format, newWidth, newHeight,
                0, options.format, options.type, pixels);
        } else {
            gl.texImage2D(gl.TEXTURE_2D, 0, options.format, this.width, this.height,
                0, options.format, options.type, pixels);
        }
    } else {
        gl.texImage2D(gl.TEXTURE_2D, 0, options.format, this.width, this.height,
            0, options.format, options.type, null);
    }
};

Texture.prototype.drawTo = function (callback) {
    var v = gl.getParameter(gl.VIEWPORT);

    /* Setup shared buffers for render target drawing */
    if (typeof Texture.frameBuffer == 'undefined') {
        Texture.frameBuffer = gl.createFramebuffer();
        Texture.renderBuffer = gl.createRenderbuffer();
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, Texture.frameBuffer);
    gl.bindRenderbuffer(gl.RENDERBUFFER, Texture.renderBuffer);
    if (this.width != Texture.renderBuffer.width || this.height != Texture.renderBuffer.height) {
        Texture.renderBuffer.width = this.width;
        Texture.renderBuffer.height = this.height;
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);
    }


    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.id, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, Texture.renderBuffer);
    gl.viewport(0, 0, this.width, this.height);

    var projectionMatrix = mat4.ortho(mat4.create(), 0, this.width, 0, this.height, -10, 10);
    callback(projectionMatrix);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.viewport(v[0], v[1], v[2], v[3]);
};

Texture.prototype.resample = function(pixels, width, height, newWidth, newHeight) {
    var src = document.createElement('canvas');
    src.width = width;
    src.height = height;
    var context = src.getContext('2d');
    var imageData = context.createImageData(width, height);
    imageData.data.set(pixels);
    context.putImageData(imageData, 0, 0);

    var dest = document.createElement('canvas');
    dest.width = newWidth;
    dest.height = newHeight;
    context = dest.getContext('2d');
    context.drawImage(src, 0, 0, dest.width, dest.height);
    var image = context.getImageData(0, 0, dest.width, dest.height);
    return new Uint8Array(image.data);
};

Texture.prototype.bind = function(unit) {
    gl.activeTexture(gl.TEXTURE0 + (unit || 0));
    gl.bindTexture(gl.TEXTURE_2D, this.id);
};

Texture.prototype.unbind = function(unit) {
    gl.activeTexture(gl.TEXTURE0 + (unit || 0));
    gl.bindTexture(gl.TEXTURE_2D, null);
};

Texture.prototype.asDataUrl = function() {
    var framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.id, 0);

    var width = this.width;
    var height = this.height;

    // Read the contents of the framebuffer
    var data = new Uint8Array(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.deleteFramebuffer(framebuffer);

    // Create a 2D canvas to store the result
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    var context = canvas.getContext('2d');

    // Copy the pixels to a 2D canvas
    var imageData = context.createImageData(width, height);
    imageData.data.set(data);
    context.putImageData(imageData, 0, 0);
    return canvas.toDataURL();
};

module.exports = exports = Texture;
}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/gl/texture.js","/gl")
},{"1YiZ5S":5,"buffer":2,"utils":35}],22:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){

var keys = { left: 37, right: 39, up: 38, down: 40, a: 65, z: 90 };

var Input = function() {
    this.left = false;
    this.right = false;
    this.up = false;
    this.down = false;
    this.flyUp = false;
    this.flyDown = false;

    var self = this;
    document.addEventListener('keydown',
        function(event) { self.keyDown(event); }, true);
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
}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/input.js","/")
},{"1YiZ5S":5,"buffer":2}],23:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){


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

}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/installer/dialog.js","/installer")
},{"1YiZ5S":5,"buffer":2}],24:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var Dialog = require('installer/dialog');
var zip = require('lib/zip.js').zip;
var lh4 = require('lib/lh4.js');

var Installer = function() {
    this.dialog = new Dialog('dialog');
};

Installer.crossOriginProxyUrl = 'http://crossorigin.me/';
Installer.mirrors = [
    'http://www.gamers.org/pub/games/quake/idstuff/quake/quake106.zip'
];

Installer.prototype.start = function(done) {
    this.dialog.setCaption('Downloading shareware version of Quake (quake106.zip)...');

    var url = Installer.crossOriginProxyUrl + Installer.mirrors[0];
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.overrideMimeType('text/plain; charset=x-user-defined');
    xhr.responseType = 'arraybuffer';
    xhr.onload = function(e) {
        if (this.status === 200) {
            var blob = new Blob([this.response]);
            zip.createReader(new zip.BlobReader(blob), function(reader) {
                reader.getEntries(function(entries) {

                });
            });
        }
    };
    xhr.send();
};

module.exports = exports = new Installer();






}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/installer/installer.js","/installer")
},{"1YiZ5S":5,"buffer":2,"installer/dialog":23,"lib/lh4.js":26,"lib/zip.js":27}],25:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * @fileoverview gl-matrix - High performance matrix and vector operations
 * @author Brandon Jones
 * @author Colin MacKenzie IV
 * @version 2.2.1
 */
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

 Redistribution and use in source and binary forms, with or without modification,
 are permitted provided that the following conditions are met:

 * Redistributions of source code must retain the above copyright notice, this
 list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice,
 this list of conditions and the following disclaimer in the documentation
 and/or other materials provided with the distribution.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
 ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */
(function(e){"use strict";var t={};typeof exports=="undefined"?typeof define=="function"&&typeof define.amd=="object"&&define.amd?(t.exports={},define(function(){return t.exports})):t.exports=typeof window!="undefined"?window:e:t.exports=exports,function(e){if(!t)var t=1e-6;if(!n)var n=typeof Float32Array!="undefined"?Float32Array:Array;if(!r)var r=Math.random;var i={};i.setMatrixArrayType=function(e){n=e},typeof e!="undefined"&&(e.glMatrix=i);var s=Math.PI/180;i.toRadian=function(e){return e*s};var o={};o.create=function(){var e=new n(2);return e[0]=0,e[1]=0,e},o.clone=function(e){var t=new n(2);return t[0]=e[0],t[1]=e[1],t},o.fromValues=function(e,t){var r=new n(2);return r[0]=e,r[1]=t,r},o.copy=function(e,t){return e[0]=t[0],e[1]=t[1],e},o.set=function(e,t,n){return e[0]=t,e[1]=n,e},o.add=function(e,t,n){return e[0]=t[0]+n[0],e[1]=t[1]+n[1],e},o.subtract=function(e,t,n){return e[0]=t[0]-n[0],e[1]=t[1]-n[1],e},o.sub=o.subtract,o.multiply=function(e,t,n){return e[0]=t[0]*n[0],e[1]=t[1]*n[1],e},o.mul=o.multiply,o.divide=function(e,t,n){return e[0]=t[0]/n[0],e[1]=t[1]/n[1],e},o.div=o.divide,o.min=function(e,t,n){return e[0]=Math.min(t[0],n[0]),e[1]=Math.min(t[1],n[1]),e},o.max=function(e,t,n){return e[0]=Math.max(t[0],n[0]),e[1]=Math.max(t[1],n[1]),e},o.scale=function(e,t,n){return e[0]=t[0]*n,e[1]=t[1]*n,e},o.scaleAndAdd=function(e,t,n,r){return e[0]=t[0]+n[0]*r,e[1]=t[1]+n[1]*r,e},o.distance=function(e,t){var n=t[0]-e[0],r=t[1]-e[1];return Math.sqrt(n*n+r*r)},o.dist=o.distance,o.squaredDistance=function(e,t){var n=t[0]-e[0],r=t[1]-e[1];return n*n+r*r},o.sqrDist=o.squaredDistance,o.length=function(e){var t=e[0],n=e[1];return Math.sqrt(t*t+n*n)},o.len=o.length,o.squaredLength=function(e){var t=e[0],n=e[1];return t*t+n*n},o.sqrLen=o.squaredLength,o.negate=function(e,t){return e[0]=-t[0],e[1]=-t[1],e},o.normalize=function(e,t){var n=t[0],r=t[1],i=n*n+r*r;return i>0&&(i=1/Math.sqrt(i),e[0]=t[0]*i,e[1]=t[1]*i),e},o.dot=function(e,t){return e[0]*t[0]+e[1]*t[1]},o.cross=function(e,t,n){var r=t[0]*n[1]-t[1]*n[0];return e[0]=e[1]=0,e[2]=r,e},o.lerp=function(e,t,n,r){var i=t[0],s=t[1];return e[0]=i+r*(n[0]-i),e[1]=s+r*(n[1]-s),e},o.random=function(e,t){t=t||1;var n=r()*2*Math.PI;return e[0]=Math.cos(n)*t,e[1]=Math.sin(n)*t,e},o.transformMat2=function(e,t,n){var r=t[0],i=t[1];return e[0]=n[0]*r+n[2]*i,e[1]=n[1]*r+n[3]*i,e},o.transformMat2d=function(e,t,n){var r=t[0],i=t[1];return e[0]=n[0]*r+n[2]*i+n[4],e[1]=n[1]*r+n[3]*i+n[5],e},o.transformMat3=function(e,t,n){var r=t[0],i=t[1];return e[0]=n[0]*r+n[3]*i+n[6],e[1]=n[1]*r+n[4]*i+n[7],e},o.transformMat4=function(e,t,n){var r=t[0],i=t[1];return e[0]=n[0]*r+n[4]*i+n[12],e[1]=n[1]*r+n[5]*i+n[13],e},o.forEach=function(){var e=o.create();return function(t,n,r,i,s,o){var u,a;n||(n=2),r||(r=0),i?a=Math.min(i*n+r,t.length):a=t.length;for(u=r;u<a;u+=n)e[0]=t[u],e[1]=t[u+1],s(e,e,o),t[u]=e[0],t[u+1]=e[1];return t}}(),o.str=function(e){return"vec2("+e[0]+", "+e[1]+")"},typeof e!="undefined"&&(e.vec2=o);var u={};u.create=function(){var e=new n(3);return e[0]=0,e[1]=0,e[2]=0,e},u.clone=function(e){var t=new n(3);return t[0]=e[0],t[1]=e[1],t[2]=e[2],t},u.fromValues=function(e,t,r){var i=new n(3);return i[0]=e,i[1]=t,i[2]=r,i},u.copy=function(e,t){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e},u.set=function(e,t,n,r){return e[0]=t,e[1]=n,e[2]=r,e},u.add=function(e,t,n){return e[0]=t[0]+n[0],e[1]=t[1]+n[1],e[2]=t[2]+n[2],e},u.subtract=function(e,t,n){return e[0]=t[0]-n[0],e[1]=t[1]-n[1],e[2]=t[2]-n[2],e},u.sub=u.subtract,u.multiply=function(e,t,n){return e[0]=t[0]*n[0],e[1]=t[1]*n[1],e[2]=t[2]*n[2],e},u.mul=u.multiply,u.divide=function(e,t,n){return e[0]=t[0]/n[0],e[1]=t[1]/n[1],e[2]=t[2]/n[2],e},u.div=u.divide,u.min=function(e,t,n){return e[0]=Math.min(t[0],n[0]),e[1]=Math.min(t[1],n[1]),e[2]=Math.min(t[2],n[2]),e},u.max=function(e,t,n){return e[0]=Math.max(t[0],n[0]),e[1]=Math.max(t[1],n[1]),e[2]=Math.max(t[2],n[2]),e},u.scale=function(e,t,n){return e[0]=t[0]*n,e[1]=t[1]*n,e[2]=t[2]*n,e},u.scaleAndAdd=function(e,t,n,r){return e[0]=t[0]+n[0]*r,e[1]=t[1]+n[1]*r,e[2]=t[2]+n[2]*r,e},u.distance=function(e,t){var n=t[0]-e[0],r=t[1]-e[1],i=t[2]-e[2];return Math.sqrt(n*n+r*r+i*i)},u.dist=u.distance,u.squaredDistance=function(e,t){var n=t[0]-e[0],r=t[1]-e[1],i=t[2]-e[2];return n*n+r*r+i*i},u.sqrDist=u.squaredDistance,u.length=function(e){var t=e[0],n=e[1],r=e[2];return Math.sqrt(t*t+n*n+r*r)},u.len=u.length,u.squaredLength=function(e){var t=e[0],n=e[1],r=e[2];return t*t+n*n+r*r},u.sqrLen=u.squaredLength,u.negate=function(e,t){return e[0]=-t[0],e[1]=-t[1],e[2]=-t[2],e},u.normalize=function(e,t){var n=t[0],r=t[1],i=t[2],s=n*n+r*r+i*i;return s>0&&(s=1/Math.sqrt(s),e[0]=t[0]*s,e[1]=t[1]*s,e[2]=t[2]*s),e},u.dot=function(e,t){return e[0]*t[0]+e[1]*t[1]+e[2]*t[2]},u.cross=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=n[0],u=n[1],a=n[2];return e[0]=i*a-s*u,e[1]=s*o-r*a,e[2]=r*u-i*o,e},u.lerp=function(e,t,n,r){var i=t[0],s=t[1],o=t[2];return e[0]=i+r*(n[0]-i),e[1]=s+r*(n[1]-s),e[2]=o+r*(n[2]-o),e},u.random=function(e,t){t=t||1;var n=r()*2*Math.PI,i=r()*2-1,s=Math.sqrt(1-i*i)*t;return e[0]=Math.cos(n)*s,e[1]=Math.sin(n)*s,e[2]=i*t,e},u.transformMat4=function(e,t,n){var r=t[0],i=t[1],s=t[2];return e[0]=n[0]*r+n[4]*i+n[8]*s+n[12],e[1]=n[1]*r+n[5]*i+n[9]*s+n[13],e[2]=n[2]*r+n[6]*i+n[10]*s+n[14],e},u.transformMat3=function(e,t,n){var r=t[0],i=t[1],s=t[2];return e[0]=r*n[0]+i*n[3]+s*n[6],e[1]=r*n[1]+i*n[4]+s*n[7],e[2]=r*n[2]+i*n[5]+s*n[8],e},u.transformQuat=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=n[0],u=n[1],a=n[2],f=n[3],l=f*r+u*s-a*i,c=f*i+a*r-o*s,h=f*s+o*i-u*r,p=-o*r-u*i-a*s;return e[0]=l*f+p*-o+c*-a-h*-u,e[1]=c*f+p*-u+h*-o-l*-a,e[2]=h*f+p*-a+l*-u-c*-o,e},u.rotateX=function(e,t,n,r){var i=[],s=[];return i[0]=t[0]-n[0],i[1]=t[1]-n[1],i[2]=t[2]-n[2],s[0]=i[0],s[1]=i[1]*Math.cos(r)-i[2]*Math.sin(r),s[2]=i[1]*Math.sin(r)+i[2]*Math.cos(r),e[0]=s[0]+n[0],e[1]=s[1]+n[1],e[2]=s[2]+n[2],e},u.rotateY=function(e,t,n,r){var i=[],s=[];return i[0]=t[0]-n[0],i[1]=t[1]-n[1],i[2]=t[2]-n[2],s[0]=i[2]*Math.sin(r)+i[0]*Math.cos(r),s[1]=i[1],s[2]=i[2]*Math.cos(r)-i[0]*Math.sin(r),e[0]=s[0]+n[0],e[1]=s[1]+n[1],e[2]=s[2]+n[2],e},u.rotateZ=function(e,t,n,r){var i=[],s=[];return i[0]=t[0]-n[0],i[1]=t[1]-n[1],i[2]=t[2]-n[2],s[0]=i[0]*Math.cos(r)-i[1]*Math.sin(r),s[1]=i[0]*Math.sin(r)+i[1]*Math.cos(r),s[2]=i[2],e[0]=s[0]+n[0],e[1]=s[1]+n[1],e[2]=s[2]+n[2],e},u.forEach=function(){var e=u.create();return function(t,n,r,i,s,o){var u,a;n||(n=3),r||(r=0),i?a=Math.min(i*n+r,t.length):a=t.length;for(u=r;u<a;u+=n)e[0]=t[u],e[1]=t[u+1],e[2]=t[u+2],s(e,e,o),t[u]=e[0],t[u+1]=e[1],t[u+2]=e[2];return t}}(),u.str=function(e){return"vec3("+e[0]+", "+e[1]+", "+e[2]+")"},typeof e!="undefined"&&(e.vec3=u);var a={};a.create=function(){var e=new n(4);return e[0]=0,e[1]=0,e[2]=0,e[3]=0,e},a.clone=function(e){var t=new n(4);return t[0]=e[0],t[1]=e[1],t[2]=e[2],t[3]=e[3],t},a.fromValues=function(e,t,r,i){var s=new n(4);return s[0]=e,s[1]=t,s[2]=r,s[3]=i,s},a.copy=function(e,t){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e},a.set=function(e,t,n,r,i){return e[0]=t,e[1]=n,e[2]=r,e[3]=i,e},a.add=function(e,t,n){return e[0]=t[0]+n[0],e[1]=t[1]+n[1],e[2]=t[2]+n[2],e[3]=t[3]+n[3],e},a.subtract=function(e,t,n){return e[0]=t[0]-n[0],e[1]=t[1]-n[1],e[2]=t[2]-n[2],e[3]=t[3]-n[3],e},a.sub=a.subtract,a.multiply=function(e,t,n){return e[0]=t[0]*n[0],e[1]=t[1]*n[1],e[2]=t[2]*n[2],e[3]=t[3]*n[3],e},a.mul=a.multiply,a.divide=function(e,t,n){return e[0]=t[0]/n[0],e[1]=t[1]/n[1],e[2]=t[2]/n[2],e[3]=t[3]/n[3],e},a.div=a.divide,a.min=function(e,t,n){return e[0]=Math.min(t[0],n[0]),e[1]=Math.min(t[1],n[1]),e[2]=Math.min(t[2],n[2]),e[3]=Math.min(t[3],n[3]),e},a.max=function(e,t,n){return e[0]=Math.max(t[0],n[0]),e[1]=Math.max(t[1],n[1]),e[2]=Math.max(t[2],n[2]),e[3]=Math.max(t[3],n[3]),e},a.scale=function(e,t,n){return e[0]=t[0]*n,e[1]=t[1]*n,e[2]=t[2]*n,e[3]=t[3]*n,e},a.scaleAndAdd=function(e,t,n,r){return e[0]=t[0]+n[0]*r,e[1]=t[1]+n[1]*r,e[2]=t[2]+n[2]*r,e[3]=t[3]+n[3]*r,e},a.distance=function(e,t){var n=t[0]-e[0],r=t[1]-e[1],i=t[2]-e[2],s=t[3]-e[3];return Math.sqrt(n*n+r*r+i*i+s*s)},a.dist=a.distance,a.squaredDistance=function(e,t){var n=t[0]-e[0],r=t[1]-e[1],i=t[2]-e[2],s=t[3]-e[3];return n*n+r*r+i*i+s*s},a.sqrDist=a.squaredDistance,a.length=function(e){var t=e[0],n=e[1],r=e[2],i=e[3];return Math.sqrt(t*t+n*n+r*r+i*i)},a.len=a.length,a.squaredLength=function(e){var t=e[0],n=e[1],r=e[2],i=e[3];return t*t+n*n+r*r+i*i},a.sqrLen=a.squaredLength,a.negate=function(e,t){return e[0]=-t[0],e[1]=-t[1],e[2]=-t[2],e[3]=-t[3],e},a.normalize=function(e,t){var n=t[0],r=t[1],i=t[2],s=t[3],o=n*n+r*r+i*i+s*s;return o>0&&(o=1/Math.sqrt(o),e[0]=t[0]*o,e[1]=t[1]*o,e[2]=t[2]*o,e[3]=t[3]*o),e},a.dot=function(e,t){return e[0]*t[0]+e[1]*t[1]+e[2]*t[2]+e[3]*t[3]},a.lerp=function(e,t,n,r){var i=t[0],s=t[1],o=t[2],u=t[3];return e[0]=i+r*(n[0]-i),e[1]=s+r*(n[1]-s),e[2]=o+r*(n[2]-o),e[3]=u+r*(n[3]-u),e},a.random=function(e,t){return t=t||1,e[0]=r(),e[1]=r(),e[2]=r(),e[3]=r(),a.normalize(e,e),a.scale(e,e,t),e},a.transformMat4=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3];return e[0]=n[0]*r+n[4]*i+n[8]*s+n[12]*o,e[1]=n[1]*r+n[5]*i+n[9]*s+n[13]*o,e[2]=n[2]*r+n[6]*i+n[10]*s+n[14]*o,e[3]=n[3]*r+n[7]*i+n[11]*s+n[15]*o,e},a.transformQuat=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=n[0],u=n[1],a=n[2],f=n[3],l=f*r+u*s-a*i,c=f*i+a*r-o*s,h=f*s+o*i-u*r,p=-o*r-u*i-a*s;return e[0]=l*f+p*-o+c*-a-h*-u,e[1]=c*f+p*-u+h*-o-l*-a,e[2]=h*f+p*-a+l*-u-c*-o,e},a.forEach=function(){var e=a.create();return function(t,n,r,i,s,o){var u,a;n||(n=4),r||(r=0),i?a=Math.min(i*n+r,t.length):a=t.length;for(u=r;u<a;u+=n)e[0]=t[u],e[1]=t[u+1],e[2]=t[u+2],e[3]=t[u+3],s(e,e,o),t[u]=e[0],t[u+1]=e[1],t[u+2]=e[2],t[u+3]=e[3];return t}}(),a.str=function(e){return"vec4("+e[0]+", "+e[1]+", "+e[2]+", "+e[3]+")"},typeof e!="undefined"&&(e.vec4=a);var f={};f.create=function(){var e=new n(4);return e[0]=1,e[1]=0,e[2]=0,e[3]=1,e},f.clone=function(e){var t=new n(4);return t[0]=e[0],t[1]=e[1],t[2]=e[2],t[3]=e[3],t},f.copy=function(e,t){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e},f.identity=function(e){return e[0]=1,e[1]=0,e[2]=0,e[3]=1,e},f.transpose=function(e,t){if(e===t){var n=t[1];e[1]=t[2],e[2]=n}else e[0]=t[0],e[1]=t[2],e[2]=t[1],e[3]=t[3];return e},f.invert=function(e,t){var n=t[0],r=t[1],i=t[2],s=t[3],o=n*s-i*r;return o?(o=1/o,e[0]=s*o,e[1]=-r*o,e[2]=-i*o,e[3]=n*o,e):null},f.adjoint=function(e,t){var n=t[0];return e[0]=t[3],e[1]=-t[1],e[2]=-t[2],e[3]=n,e},f.determinant=function(e){return e[0]*e[3]-e[2]*e[1]},f.multiply=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3],u=n[0],a=n[1],f=n[2],l=n[3];return e[0]=r*u+s*a,e[1]=i*u+o*a,e[2]=r*f+s*l,e[3]=i*f+o*l,e},f.mul=f.multiply,f.rotate=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3],u=Math.sin(n),a=Math.cos(n);return e[0]=r*a+s*u,e[1]=i*a+o*u,e[2]=r*-u+s*a,e[3]=i*-u+o*a,e},f.scale=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3],u=n[0],a=n[1];return e[0]=r*u,e[1]=i*u,e[2]=s*a,e[3]=o*a,e},f.str=function(e){return"mat2("+e[0]+", "+e[1]+", "+e[2]+", "+e[3]+")"},f.frob=function(e){return Math.sqrt(Math.pow(e[0],2)+Math.pow(e[1],2)+Math.pow(e[2],2)+Math.pow(e[3],2))},f.LDU=function(e,t,n,r){return e[2]=r[2]/r[0],n[0]=r[0],n[1]=r[1],n[3]=r[3]-e[2]*n[1],[e,t,n]},typeof e!="undefined"&&(e.mat2=f);var l={};l.create=function(){var e=new n(6);return e[0]=1,e[1]=0,e[2]=0,e[3]=1,e[4]=0,e[5]=0,e},l.clone=function(e){var t=new n(6);return t[0]=e[0],t[1]=e[1],t[2]=e[2],t[3]=e[3],t[4]=e[4],t[5]=e[5],t},l.copy=function(e,t){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e[4]=t[4],e[5]=t[5],e},l.identity=function(e){return e[0]=1,e[1]=0,e[2]=0,e[3]=1,e[4]=0,e[5]=0,e},l.invert=function(e,t){var n=t[0],r=t[1],i=t[2],s=t[3],o=t[4],u=t[5],a=n*s-r*i;return a?(a=1/a,e[0]=s*a,e[1]=-r*a,e[2]=-i*a,e[3]=n*a,e[4]=(i*u-s*o)*a,e[5]=(r*o-n*u)*a,e):null},l.determinant=function(e){return e[0]*e[3]-e[1]*e[2]},l.multiply=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3],u=t[4],a=t[5],f=n[0],l=n[1],c=n[2],h=n[3],p=n[4],d=n[5];return e[0]=r*f+s*l,e[1]=i*f+o*l,e[2]=r*c+s*h,e[3]=i*c+o*h,e[4]=r*p+s*d+u,e[5]=i*p+o*d+a,e},l.mul=l.multiply,l.rotate=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3],u=t[4],a=t[5],f=Math.sin(n),l=Math.cos(n);return e[0]=r*l+s*f,e[1]=i*l+o*f,e[2]=r*-f+s*l,e[3]=i*-f+o*l,e[4]=u,e[5]=a,e},l.scale=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3],u=t[4],a=t[5],f=n[0],l=n[1];return e[0]=r*f,e[1]=i*f,e[2]=s*l,e[3]=o*l,e[4]=u,e[5]=a,e},l.translate=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3],u=t[4],a=t[5],f=n[0],l=n[1];return e[0]=r,e[1]=i,e[2]=s,e[3]=o,e[4]=r*f+s*l+u,e[5]=i*f+o*l+a,e},l.str=function(e){return"mat2d("+e[0]+", "+e[1]+", "+e[2]+", "+e[3]+", "+e[4]+", "+e[5]+")"},l.frob=function(e){return Math.sqrt(Math.pow(e[0],2)+Math.pow(e[1],2)+Math.pow(e[2],2)+Math.pow(e[3],2)+Math.pow(e[4],2)+Math.pow(e[5],2)+1)},typeof e!="undefined"&&(e.mat2d=l);var c={};c.create=function(){var e=new n(9);return e[0]=1,e[1]=0,e[2]=0,e[3]=0,e[4]=1,e[5]=0,e[6]=0,e[7]=0,e[8]=1,e},c.fromMat4=function(e,t){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[4],e[4]=t[5],e[5]=t[6],e[6]=t[8],e[7]=t[9],e[8]=t[10],e},c.clone=function(e){var t=new n(9);return t[0]=e[0],t[1]=e[1],t[2]=e[2],t[3]=e[3],t[4]=e[4],t[5]=e[5],t[6]=e[6],t[7]=e[7],t[8]=e[8],t},c.copy=function(e,t){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e[4]=t[4],e[5]=t[5],e[6]=t[6],e[7]=t[7],e[8]=t[8],e},c.identity=function(e){return e[0]=1,e[1]=0,e[2]=0,e[3]=0,e[4]=1,e[5]=0,e[6]=0,e[7]=0,e[8]=1,e},c.transpose=function(e,t){if(e===t){var n=t[1],r=t[2],i=t[5];e[1]=t[3],e[2]=t[6],e[3]=n,e[5]=t[7],e[6]=r,e[7]=i}else e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8];return e},c.invert=function(e,t){var n=t[0],r=t[1],i=t[2],s=t[3],o=t[4],u=t[5],a=t[6],f=t[7],l=t[8],c=l*o-u*f,h=-l*s+u*a,p=f*s-o*a,d=n*c+r*h+i*p;return d?(d=1/d,e[0]=c*d,e[1]=(-l*r+i*f)*d,e[2]=(u*r-i*o)*d,e[3]=h*d,e[4]=(l*n-i*a)*d,e[5]=(-u*n+i*s)*d,e[6]=p*d,e[7]=(-f*n+r*a)*d,e[8]=(o*n-r*s)*d,e):null},c.adjoint=function(e,t){var n=t[0],r=t[1],i=t[2],s=t[3],o=t[4],u=t[5],a=t[6],f=t[7],l=t[8];return e[0]=o*l-u*f,e[1]=i*f-r*l,e[2]=r*u-i*o,e[3]=u*a-s*l,e[4]=n*l-i*a,e[5]=i*s-n*u,e[6]=s*f-o*a,e[7]=r*a-n*f,e[8]=n*o-r*s,e},c.determinant=function(e){var t=e[0],n=e[1],r=e[2],i=e[3],s=e[4],o=e[5],u=e[6],a=e[7],f=e[8];return t*(f*s-o*a)+n*(-f*i+o*u)+r*(a*i-s*u)},c.multiply=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3],u=t[4],a=t[5],f=t[6],l=t[7],c=t[8],h=n[0],p=n[1],d=n[2],v=n[3],m=n[4],g=n[5],y=n[6],b=n[7],w=n[8];return e[0]=h*r+p*o+d*f,e[1]=h*i+p*u+d*l,e[2]=h*s+p*a+d*c,e[3]=v*r+m*o+g*f,e[4]=v*i+m*u+g*l,e[5]=v*s+m*a+g*c,e[6]=y*r+b*o+w*f,e[7]=y*i+b*u+w*l,e[8]=y*s+b*a+w*c,e},c.mul=c.multiply,c.translate=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3],u=t[4],a=t[5],f=t[6],l=t[7],c=t[8],h=n[0],p=n[1];return e[0]=r,e[1]=i,e[2]=s,e[3]=o,e[4]=u,e[5]=a,e[6]=h*r+p*o+f,e[7]=h*i+p*u+l,e[8]=h*s+p*a+c,e},c.rotate=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3],u=t[4],a=t[5],f=t[6],l=t[7],c=t[8],h=Math.sin(n),p=Math.cos(n);return e[0]=p*r+h*o,e[1]=p*i+h*u,e[2]=p*s+h*a,e[3]=p*o-h*r,e[4]=p*u-h*i,e[5]=p*a-h*s,e[6]=f,e[7]=l,e[8]=c,e},c.scale=function(e,t,n){var r=n[0],i=n[1];return e[0]=r*t[0],e[1]=r*t[1],e[2]=r*t[2],e[3]=i*t[3],e[4]=i*t[4],e[5]=i*t[5],e[6]=t[6],e[7]=t[7],e[8]=t[8],e},c.fromMat2d=function(e,t){return e[0]=t[0],e[1]=t[1],e[2]=0,e[3]=t[2],e[4]=t[3],e[5]=0,e[6]=t[4],e[7]=t[5],e[8]=1,e},c.fromQuat=function(e,t){var n=t[0],r=t[1],i=t[2],s=t[3],o=n+n,u=r+r,a=i+i,f=n*o,l=r*o,c=r*u,h=i*o,p=i*u,d=i*a,v=s*o,m=s*u,g=s*a;return e[0]=1-c-d,e[3]=l-g,e[6]=h+m,e[1]=l+g,e[4]=1-f-d,e[7]=p-v,e[2]=h-m,e[5]=p+v,e[8]=1-f-c,e},c.normalFromMat4=function(e,t){var n=t[0],r=t[1],i=t[2],s=t[3],o=t[4],u=t[5],a=t[6],f=t[7],l=t[8],c=t[9],h=t[10],p=t[11],d=t[12],v=t[13],m=t[14],g=t[15],y=n*u-r*o,b=n*a-i*o,w=n*f-s*o,E=r*a-i*u,S=r*f-s*u,x=i*f-s*a,T=l*v-c*d,N=l*m-h*d,C=l*g-p*d,k=c*m-h*v,L=c*g-p*v,A=h*g-p*m,O=y*A-b*L+w*k+E*C-S*N+x*T;return O?(O=1/O,e[0]=(u*A-a*L+f*k)*O,e[1]=(a*C-o*A-f*N)*O,e[2]=(o*L-u*C+f*T)*O,e[3]=(i*L-r*A-s*k)*O,e[4]=(n*A-i*C+s*N)*O,e[5]=(r*C-n*L-s*T)*O,e[6]=(v*x-m*S+g*E)*O,e[7]=(m*w-d*x-g*b)*O,e[8]=(d*S-v*w+g*y)*O,e):null},c.str=function(e){return"mat3("+e[0]+", "+e[1]+", "+e[2]+", "+e[3]+", "+e[4]+", "+e[5]+", "+e[6]+", "+e[7]+", "+e[8]+")"},c.frob=function(e){return Math.sqrt(Math.pow(e[0],2)+Math.pow(e[1],2)+Math.pow(e[2],2)+Math.pow(e[3],2)+Math.pow(e[4],2)+Math.pow(e[5],2)+Math.pow(e[6],2)+Math.pow(e[7],2)+Math.pow(e[8],2))},typeof e!="undefined"&&(e.mat3=c);var h={};h.create=function(){var e=new n(16);return e[0]=1,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=1,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[10]=1,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,e},h.clone=function(e){var t=new n(16);return t[0]=e[0],t[1]=e[1],t[2]=e[2],t[3]=e[3],t[4]=e[4],t[5]=e[5],t[6]=e[6],t[7]=e[7],t[8]=e[8],t[9]=e[9],t[10]=e[10],t[11]=e[11],t[12]=e[12],t[13]=e[13],t[14]=e[14],t[15]=e[15],t},h.copy=function(e,t){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e[4]=t[4],e[5]=t[5],e[6]=t[6],e[7]=t[7],e[8]=t[8],e[9]=t[9],e[10]=t[10],e[11]=t[11],e[12]=t[12],e[13]=t[13],e[14]=t[14],e[15]=t[15],e},h.identity=function(e){return e[0]=1,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=1,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[10]=1,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,e},h.transpose=function(e,t){if(e===t){var n=t[1],r=t[2],i=t[3],s=t[6],o=t[7],u=t[11];e[1]=t[4],e[2]=t[8],e[3]=t[12],e[4]=n,e[6]=t[9],e[7]=t[13],e[8]=r,e[9]=s,e[11]=t[14],e[12]=i,e[13]=o,e[14]=u}else e[0]=t[0],e[1]=t[4],e[2]=t[8],e[3]=t[12],e[4]=t[1],e[5]=t[5],e[6]=t[9],e[7]=t[13],e[8]=t[2],e[9]=t[6],e[10]=t[10],e[11]=t[14],e[12]=t[3],e[13]=t[7],e[14]=t[11],e[15]=t[15];return e},h.invert=function(e,t){var n=t[0],r=t[1],i=t[2],s=t[3],o=t[4],u=t[5],a=t[6],f=t[7],l=t[8],c=t[9],h=t[10],p=t[11],d=t[12],v=t[13],m=t[14],g=t[15],y=n*u-r*o,b=n*a-i*o,w=n*f-s*o,E=r*a-i*u,S=r*f-s*u,x=i*f-s*a,T=l*v-c*d,N=l*m-h*d,C=l*g-p*d,k=c*m-h*v,L=c*g-p*v,A=h*g-p*m,O=y*A-b*L+w*k+E*C-S*N+x*T;return O?(O=1/O,e[0]=(u*A-a*L+f*k)*O,e[1]=(i*L-r*A-s*k)*O,e[2]=(v*x-m*S+g*E)*O,e[3]=(h*S-c*x-p*E)*O,e[4]=(a*C-o*A-f*N)*O,e[5]=(n*A-i*C+s*N)*O,e[6]=(m*w-d*x-g*b)*O,e[7]=(l*x-h*w+p*b)*O,e[8]=(o*L-u*C+f*T)*O,e[9]=(r*C-n*L-s*T)*O,e[10]=(d*S-v*w+g*y)*O,e[11]=(c*w-l*S-p*y)*O,e[12]=(u*N-o*k-a*T)*O,e[13]=(n*k-r*N+i*T)*O,e[14]=(v*b-d*E-m*y)*O,e[15]=(l*E-c*b+h*y)*O,e):null},h.adjoint=function(e,t){var n=t[0],r=t[1],i=t[2],s=t[3],o=t[4],u=t[5],a=t[6],f=t[7],l=t[8],c=t[9],h=t[10],p=t[11],d=t[12],v=t[13],m=t[14],g=t[15];return e[0]=u*(h*g-p*m)-c*(a*g-f*m)+v*(a*p-f*h),e[1]=-(r*(h*g-p*m)-c*(i*g-s*m)+v*(i*p-s*h)),e[2]=r*(a*g-f*m)-u*(i*g-s*m)+v*(i*f-s*a),e[3]=-(r*(a*p-f*h)-u*(i*p-s*h)+c*(i*f-s*a)),e[4]=-(o*(h*g-p*m)-l*(a*g-f*m)+d*(a*p-f*h)),e[5]=n*(h*g-p*m)-l*(i*g-s*m)+d*(i*p-s*h),e[6]=-(n*(a*g-f*m)-o*(i*g-s*m)+d*(i*f-s*a)),e[7]=n*(a*p-f*h)-o*(i*p-s*h)+l*(i*f-s*a),e[8]=o*(c*g-p*v)-l*(u*g-f*v)+d*(u*p-f*c),e[9]=-(n*(c*g-p*v)-l*(r*g-s*v)+d*(r*p-s*c)),e[10]=n*(u*g-f*v)-o*(r*g-s*v)+d*(r*f-s*u),e[11]=-(n*(u*p-f*c)-o*(r*p-s*c)+l*(r*f-s*u)),e[12]=-(o*(c*m-h*v)-l*(u*m-a*v)+d*(u*h-a*c)),e[13]=n*(c*m-h*v)-l*(r*m-i*v)+d*(r*h-i*c),e[14]=-(n*(u*m-a*v)-o*(r*m-i*v)+d*(r*a-i*u)),e[15]=n*(u*h-a*c)-o*(r*h-i*c)+l*(r*a-i*u),e},h.determinant=function(e){var t=e[0],n=e[1],r=e[2],i=e[3],s=e[4],o=e[5],u=e[6],a=e[7],f=e[8],l=e[9],c=e[10],h=e[11],p=e[12],d=e[13],v=e[14],m=e[15],g=t*o-n*s,y=t*u-r*s,b=t*a-i*s,w=n*u-r*o,E=n*a-i*o,S=r*a-i*u,x=f*d-l*p,T=f*v-c*p,N=f*m-h*p,C=l*v-c*d,k=l*m-h*d,L=c*m-h*v;return g*L-y*k+b*C+w*N-E*T+S*x},h.multiply=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3],u=t[4],a=t[5],f=t[6],l=t[7],c=t[8],h=t[9],p=t[10],d=t[11],v=t[12],m=t[13],g=t[14],y=t[15],b=n[0],w=n[1],E=n[2],S=n[3];return e[0]=b*r+w*u+E*c+S*v,e[1]=b*i+w*a+E*h+S*m,e[2]=b*s+w*f+E*p+S*g,e[3]=b*o+w*l+E*d+S*y,b=n[4],w=n[5],E=n[6],S=n[7],e[4]=b*r+w*u+E*c+S*v,e[5]=b*i+w*a+E*h+S*m,e[6]=b*s+w*f+E*p+S*g,e[7]=b*o+w*l+E*d+S*y,b=n[8],w=n[9],E=n[10],S=n[11],e[8]=b*r+w*u+E*c+S*v,e[9]=b*i+w*a+E*h+S*m,e[10]=b*s+w*f+E*p+S*g,e[11]=b*o+w*l+E*d+S*y,b=n[12],w=n[13],E=n[14],S=n[15],e[12]=b*r+w*u+E*c+S*v,e[13]=b*i+w*a+E*h+S*m,e[14]=b*s+w*f+E*p+S*g,e[15]=b*o+w*l+E*d+S*y,e},h.mul=h.multiply,h.translate=function(e,t,n){var r=n[0],i=n[1],s=n[2],o,u,a,f,l,c,h,p,d,v,m,g;return t===e?(e[12]=t[0]*r+t[4]*i+t[8]*s+t[12],e[13]=t[1]*r+t[5]*i+t[9]*s+t[13],e[14]=t[2]*r+t[6]*i+t[10]*s+t[14],e[15]=t[3]*r+t[7]*i+t[11]*s+t[15]):(o=t[0],u=t[1],a=t[2],f=t[3],l=t[4],c=t[5],h=t[6],p=t[7],d=t[8],v=t[9],m=t[10],g=t[11],e[0]=o,e[1]=u,e[2]=a,e[3]=f,e[4]=l,e[5]=c,e[6]=h,e[7]=p,e[8]=d,e[9]=v,e[10]=m,e[11]=g,e[12]=o*r+l*i+d*s+t[12],e[13]=u*r+c*i+v*s+t[13],e[14]=a*r+h*i+m*s+t[14],e[15]=f*r+p*i+g*s+t[15]),e},h.scale=function(e,t,n){var r=n[0],i=n[1],s=n[2];return e[0]=t[0]*r,e[1]=t[1]*r,e[2]=t[2]*r,e[3]=t[3]*r,e[4]=t[4]*i,e[5]=t[5]*i,e[6]=t[6]*i,e[7]=t[7]*i,e[8]=t[8]*s,e[9]=t[9]*s,e[10]=t[10]*s,e[11]=t[11]*s,e[12]=t[12],e[13]=t[13],e[14]=t[14],e[15]=t[15],e},h.rotate=function(e,n,r,i){var s=i[0],o=i[1],u=i[2],a=Math.sqrt(s*s+o*o+u*u),f,l,c,h,p,d,v,m,g,y,b,w,E,S,x,T,N,C,k,L,A,O,M,_;return Math.abs(a)<t?null:(a=1/a,s*=a,o*=a,u*=a,f=Math.sin(r),l=Math.cos(r),c=1-l,h=n[0],p=n[1],d=n[2],v=n[3],m=n[4],g=n[5],y=n[6],b=n[7],w=n[8],E=n[9],S=n[10],x=n[11],T=s*s*c+l,N=o*s*c+u*f,C=u*s*c-o*f,k=s*o*c-u*f,L=o*o*c+l,A=u*o*c+s*f,O=s*u*c+o*f,M=o*u*c-s*f,_=u*u*c+l,e[0]=h*T+m*N+w*C,e[1]=p*T+g*N+E*C,e[2]=d*T+y*N+S*C,e[3]=v*T+b*N+x*C,e[4]=h*k+m*L+w*A,e[5]=p*k+g*L+E*A,e[6]=d*k+y*L+S*A,e[7]=v*k+b*L+x*A,e[8]=h*O+m*M+w*_,e[9]=p*O+g*M+E*_,e[10]=d*O+y*M+S*_,e[11]=v*O+b*M+x*_,n!==e&&(e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15]),e)},h.rotateX=function(e,t,n){var r=Math.sin(n),i=Math.cos(n),s=t[4],o=t[5],u=t[6],a=t[7],f=t[8],l=t[9],c=t[10],h=t[11];return t!==e&&(e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e[12]=t[12],e[13]=t[13],e[14]=t[14],e[15]=t[15]),e[4]=s*i+f*r,e[5]=o*i+l*r,e[6]=u*i+c*r,e[7]=a*i+h*r,e[8]=f*i-s*r,e[9]=l*i-o*r,e[10]=c*i-u*r,e[11]=h*i-a*r,e},h.rotateY=function(e,t,n){var r=Math.sin(n),i=Math.cos(n),s=t[0],o=t[1],u=t[2],a=t[3],f=t[8],l=t[9],c=t[10],h=t[11];return t!==e&&(e[4]=t[4],e[5]=t[5],e[6]=t[6],e[7]=t[7],e[12]=t[12],e[13]=t[13],e[14]=t[14],e[15]=t[15]),e[0]=s*i-f*r,e[1]=o*i-l*r,e[2]=u*i-c*r,e[3]=a*i-h*r,e[8]=s*r+f*i,e[9]=o*r+l*i,e[10]=u*r+c*i,e[11]=a*r+h*i,e},h.rotateZ=function(e,t,n){var r=Math.sin(n),i=Math.cos(n),s=t[0],o=t[1],u=t[2],a=t[3],f=t[4],l=t[5],c=t[6],h=t[7];return t!==e&&(e[8]=t[8],e[9]=t[9],e[10]=t[10],e[11]=t[11],e[12]=t[12],e[13]=t[13],e[14]=t[14],e[15]=t[15]),e[0]=s*i+f*r,e[1]=o*i+l*r,e[2]=u*i+c*r,e[3]=a*i+h*r,e[4]=f*i-s*r,e[5]=l*i-o*r,e[6]=c*i-u*r,e[7]=h*i-a*r,e},h.fromRotationTranslation=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3],u=r+r,a=i+i,f=s+s,l=r*u,c=r*a,h=r*f,p=i*a,d=i*f,v=s*f,m=o*u,g=o*a,y=o*f;return e[0]=1-(p+v),e[1]=c+y,e[2]=h-g,e[3]=0,e[4]=c-y,e[5]=1-(l+v),e[6]=d+m,e[7]=0,e[8]=h+g,e[9]=d-m,e[10]=1-(l+p),e[11]=0,e[12]=n[0],e[13]=n[1],e[14]=n[2],e[15]=1,e},h.fromQuat=function(e,t){var n=t[0],r=t[1],i=t[2],s=t[3],o=n+n,u=r+r,a=i+i,f=n*o,l=r*o,c=r*u,h=i*o,p=i*u,d=i*a,v=s*o,m=s*u,g=s*a;return e[0]=1-c-d,e[1]=l+g,e[2]=h-m,e[3]=0,e[4]=l-g,e[5]=1-f-d,e[6]=p+v,e[7]=0,e[8]=h+m,e[9]=p-v,e[10]=1-f-c,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,e},h.frustum=function(e,t,n,r,i,s,o){var u=1/(n-t),a=1/(i-r),f=1/(s-o);return e[0]=s*2*u,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=s*2*a,e[6]=0,e[7]=0,e[8]=(n+t)*u,e[9]=(i+r)*a,e[10]=(o+s)*f,e[11]=-1,e[12]=0,e[13]=0,e[14]=o*s*2*f,e[15]=0,e},h.perspective=function(e,t,n,r,i){var s=1/Math.tan(t/2),o=1/(r-i);return e[0]=s/n,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=s,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[10]=(i+r)*o,e[11]=-1,e[12]=0,e[13]=0,e[14]=2*i*r*o,e[15]=0,e},h.ortho=function(e,t,n,r,i,s,o){var u=1/(t-n),a=1/(r-i),f=1/(s-o);return e[0]=-2*u,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=-2*a,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[10]=2*f,e[11]=0,e[12]=(t+n)*u,e[13]=(i+r)*a,e[14]=(o+s)*f,e[15]=1,e},h.lookAt=function(e,n,r,i){var s,o,u,a,f,l,c,p,d,v,m=n[0],g=n[1],y=n[2],b=i[0],w=i[1],E=i[2],S=r[0],x=r[1],T=r[2];return Math.abs(m-S)<t&&Math.abs(g-x)<t&&Math.abs(y-T)<t?h.identity(e):(c=m-S,p=g-x,d=y-T,v=1/Math.sqrt(c*c+p*p+d*d),c*=v,p*=v,d*=v,s=w*d-E*p,o=E*c-b*d,u=b*p-w*c,v=Math.sqrt(s*s+o*o+u*u),v?(v=1/v,s*=v,o*=v,u*=v):(s=0,o=0,u=0),a=p*u-d*o,f=d*s-c*u,l=c*o-p*s,v=Math.sqrt(a*a+f*f+l*l),v?(v=1/v,a*=v,f*=v,l*=v):(a=0,f=0,l=0),e[0]=s,e[1]=a,e[2]=c,e[3]=0,e[4]=o,e[5]=f,e[6]=p,e[7]=0,e[8]=u,e[9]=l,e[10]=d,e[11]=0,e[12]=-(s*m+o*g+u*y),e[13]=-(a*m+f*g+l*y),e[14]=-(c*m+p*g+d*y),e[15]=1,e)},h.str=function(e){return"mat4("+e[0]+", "+e[1]+", "+e[2]+", "+e[3]+", "+e[4]+", "+e[5]+", "+e[6]+", "+e[7]+", "+e[8]+", "+e[9]+", "+e[10]+", "+e[11]+", "+e[12]+", "+e[13]+", "+e[14]+", "+e[15]+")"},h.frob=function(e){return Math.sqrt(Math.pow(e[0],2)+Math.pow(e[1],2)+Math.pow(e[2],2)+Math.pow(e[3],2)+Math.pow(e[4],2)+Math.pow(e[5],2)+Math.pow(e[6],2)+Math.pow(e[6],2)+Math.pow(e[7],2)+Math.pow(e[8],2)+Math.pow(e[9],2)+Math.pow(e[10],2)+Math.pow(e[11],2)+Math.pow(e[12],2)+Math.pow(e[13],2)+Math.pow(e[14],2)+Math.pow(e[15],2))},typeof e!="undefined"&&(e.mat4=h);var p={};p.create=function(){var e=new n(4);return e[0]=0,e[1]=0,e[2]=0,e[3]=1,e},p.rotationTo=function(){var e=u.create(),t=u.fromValues(1,0,0),n=u.fromValues(0,1,0);return function(r,i,s){var o=u.dot(i,s);return o<-0.999999?(u.cross(e,t,i),u.length(e)<1e-6&&u.cross(e,n,i),u.normalize(e,e),p.setAxisAngle(r,e,Math.PI),r):o>.999999?(r[0]=0,r[1]=0,r[2]=0,r[3]=1,r):(u.cross(e,i,s),r[0]=e[0],r[1]=e[1],r[2]=e[2],r[3]=1+o,p.normalize(r,r))}}(),p.setAxes=function(){var e=c.create();return function(t,n,r,i){return e[0]=r[0],e[3]=r[1],e[6]=r[2],e[1]=i[0],e[4]=i[1],e[7]=i[2],e[2]=-n[0],e[5]=-n[1],e[8]=-n[2],p.normalize(t,p.fromMat3(t,e))}}(),p.clone=a.clone,p.fromValues=a.fromValues,p.copy=a.copy,p.set=a.set,p.identity=function(e){return e[0]=0,e[1]=0,e[2]=0,e[3]=1,e},p.setAxisAngle=function(e,t,n){n*=.5;var r=Math.sin(n);return e[0]=r*t[0],e[1]=r*t[1],e[2]=r*t[2],e[3]=Math.cos(n),e},p.add=a.add,p.multiply=function(e,t,n){var r=t[0],i=t[1],s=t[2],o=t[3],u=n[0],a=n[1],f=n[2],l=n[3];return e[0]=r*l+o*u+i*f-s*a,e[1]=i*l+o*a+s*u-r*f,e[2]=s*l+o*f+r*a-i*u,e[3]=o*l-r*u-i*a-s*f,e},p.mul=p.multiply,p.scale=a.scale,p.rotateX=function(e,t,n){n*=.5;var r=t[0],i=t[1],s=t[2],o=t[3],u=Math.sin(n),a=Math.cos(n);return e[0]=r*a+o*u,e[1]=i*a+s*u,e[2]=s*a-i*u,e[3]=o*a-r*u,e},p.rotateY=function(e,t,n){n*=.5;var r=t[0],i=t[1],s=t[2],o=t[3],u=Math.sin(n),a=Math.cos(n);return e[0]=r*a-s*u,e[1]=i*a+o*u,e[2]=s*a+r*u,e[3]=o*a-i*u,e},p.rotateZ=function(e,t,n){n*=.5;var r=t[0],i=t[1],s=t[2],o=t[3],u=Math.sin(n),a=Math.cos(n);return e[0]=r*a+i*u,e[1]=i*a-r*u,e[2]=s*a+o*u,e[3]=o*a-s*u,e},p.calculateW=function(e,t){var n=t[0],r=t[1],i=t[2];return e[0]=n,e[1]=r,e[2]=i,e[3]=-Math.sqrt(Math.abs(1-n*n-r*r-i*i)),e},p.dot=a.dot,p.lerp=a.lerp,p.slerp=function(e,t,n,r){var i=t[0],s=t[1],o=t[2],u=t[3],a=n[0],f=n[1],l=n[2],c=n[3],h,p,d,v,m;return p=i*a+s*f+o*l+u*c,p<0&&(p=-p,a=-a,f=-f,l=-l,c=-c),1-p>1e-6?(h=Math.acos(p),d=Math.sin(h),v=Math.sin((1-r)*h)/d,m=Math.sin(r*h)/d):(v=1-r,m=r),e[0]=v*i+m*a,e[1]=v*s+m*f,e[2]=v*o+m*l,e[3]=v*u+m*c,e},p.invert=function(e,t){var n=t[0],r=t[1],i=t[2],s=t[3],o=n*n+r*r+i*i+s*s,u=o?1/o:0;return e[0]=-n*u,e[1]=-r*u,e[2]=-i*u,e[3]=s*u,e},p.conjugate=function(e,t){return e[0]=-t[0],e[1]=-t[1],e[2]=-t[2],e[3]=t[3],e},p.length=a.length,p.len=p.length,p.squaredLength=a.squaredLength,p.sqrLen=p.squaredLength,p.normalize=a.normalize,p.fromMat3=function(e,t){var n=t[0]+t[4]+t[8],r;if(n>0)r=Math.sqrt(n+1),e[3]=.5*r,r=.5/r,e[0]=(t[7]-t[5])*r,e[1]=(t[2]-t[6])*r,e[2]=(t[3]-t[1])*r;else{var i=0;t[4]>t[0]&&(i=1),t[8]>t[i*3+i]&&(i=2);var s=(i+1)%3,o=(i+2)%3;r=Math.sqrt(t[i*3+i]-t[s*3+s]-t[o*3+o]+1),e[i]=.5*r,r=.5/r,e[3]=(t[o*3+s]-t[s*3+o])*r,e[s]=(t[s*3+i]+t[i*3+s])*r,e[o]=(t[o*3+i]+t[i*3+o])*r}return e},p.str=function(e){return"quat("+e[0]+", "+e[1]+", "+e[2]+", "+e[3]+")"},typeof e!="undefined"&&(e.quat=p)}(t.exports)})(this);
}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/lib/gl-matrix-min.js","/lib")
},{"1YiZ5S":5,"buffer":2}],26:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
// LH4, LHA (-lh4-) extractor, no crc/sum-checks. Will extract SFX-archives as well.
// Erland Ranvinge (erland.ranvinge@gmail.com)
// Based on a mix of Nobuyasu Suehiro's Java implementation and Simon Howard's C version.

var LhaArrayReader = function(buffer) {
    this.buffer = buffer;
    this.offset = 0;
    this.subOffset = 7;
};
LhaArrayReader.SeekAbsolute = 0;
LhaArrayReader.SeekRelative = 1;

LhaArrayReader.prototype.readBits = function(bits) {
    var bitMasks = [1, 2, 4, 8, 16, 32, 64, 128];
    var byte = this.buffer[this.offset];
    var result = 0;

    for (var bitIndex = 0; bitIndex < bits; bitIndex++) {
        var bit = (byte & bitMasks[this.subOffset]) >> this.subOffset;
        result <<= 1;
        result = result | bit;
        this.subOffset--;
        if (this.subOffset < 0) {
            if (this.offset + 1 >= this.buffer.length)
                return -1;

            byte = this.buffer[++this.offset];
            this.subOffset = 7;
        }
    }
    return result;
};

LhaArrayReader.prototype.readUInt8 = function() {
    if (this.offset + 1 >= this.buffer.length)
        return -1;
    return this.buffer[this.offset++];
};
LhaArrayReader.prototype.readUInt16 = function() {
    if (this.offset + 2 >= this.buffer.length)
        return -1;
    var value =
        (this.buffer[this.offset] & 0xFF) |
            ((this.buffer[this.offset+1] << 8) & 0xFF00);
    this.offset += 2;
    return value;
};
LhaArrayReader.prototype.readUInt32 = function() {
    if (this.offset + 4 >= this.buffer.length)
        return -1;
    var value =
        (this.buffer[this.offset] & 0xFF) |
            ((this.buffer[this.offset+1] << 8) & 0xFF00) |
            ((this.buffer[this.offset+2] << 16) & 0xFF0000) |
            ((this.buffer[this.offset+3] << 24) & 0xFF000000);
    this.offset += 4;
    return value;
};
LhaArrayReader.prototype.readString = function(size) {
    if (this.offset + size >= this.buffer.length)
        return -1;
    var result = '';
    for (var i = 0; i < size; i++)
        result += String.fromCharCode(this.buffer[this.offset++]);
    return result;
};

LhaArrayReader.prototype.readLength = function() {
    var length = this.readBits(3);
    if (length == -1)
        return -1;

    if (length == 7) {
        while (this.readBits(1) != 0) {
            length++;
        }
    }
    return length;
};
LhaArrayReader.prototype.seek = function(offset, mode) {
    switch (mode) {
        case LhaArrayReader.SeekAbsolute:
            this.offset = offset;
            this.subOffset = 7;
            break;
        case LhaArrayReader.SeekRelative:
            this.offset += offset;
            this.subOffset = 7;
            break;
    }
};
LhaArrayReader.prototype.getPosition = function() {
    return this.offset;
};

var LhaArrayWriter = function(size) {
    this.offset = 0;
    this.size = size;
    this.data = new Uint8Array(size);
};

LhaArrayWriter.prototype.write = function(data) {
    this.data[this.offset++] = data;
};

var LhaTree = function() {};
LhaTree.LEAF = 1 << 15;

LhaTree.prototype.setConstant = function(code) {
    this.tree[0] = code | LhaTree.LEAF;
};

LhaTree.prototype.expand = function() {
    var newNodes = (this.allocated - this.nextEntry) * 2;
    var endOffset = this.allocated;
    while (this.nextEntry < endOffset) {
        this.tree[this.nextEntry] = this.allocated;
        this.allocated += 2;
        this.nextEntry++;
    }
};

LhaTree.prototype.addCodesWithLength = function(codeLengths, codeLength) {
    var done = true;
    for (var i = 0; i < codeLengths.length; i++) {
        if (codeLengths[i] == codeLength) {
            var node = this.nextEntry++;
            this.tree[node] = i | LhaTree.LEAF;
        } else if (codeLengths[i] > codeLength) {
            done = false;
        }
    }
    return done;
};

LhaTree.prototype.build = function(codeLengths, size) {
    this.tree = [];
    for (var i = 0; i < size; i++)
        this.tree[i] = LhaTree.LEAF;

    this.nextEntry = 0;
    this.allocated = 1;
    var codeLength = 0;
    do {
        this.expand();
        codeLength++;
    } while (!this.addCodesWithLength(codeLengths, codeLength));
};

LhaTree.prototype.readCode = function(reader) {
    var code = this.tree[0];
    while ((code & LhaTree.LEAF) == 0) {
        var bit = reader.readBits(1);
        code = this.tree[code + bit];
    }
    return code & ~LhaTree.LEAF;
};

var LhaRingBuffer = function(size) {
    this.data = [];
    this.size = size;
    this.offset = 0;
};

LhaRingBuffer.prototype.add = function(value) {
    this.data[this.offset] = value;
    this.offset = (this.offset + 1) % this.size;
};

LhaRingBuffer.prototype.get = function(offset, length) {
    var pos = this.offset + this.size - offset - 1;
    var result = [];
    for (var i = 0; i < length; i++) {
        var code = this.data[(pos + i) % this.size];
        result.push(code);
        this.add(code);
    }
    return result;
};

var LhaReader = function(reader) {
    this.reader = reader;
    this.offsetTree = new LhaTree();
    this.codeTree = new LhaTree();
    this.ringBuffer = new LhaRingBuffer(1 << 13); // lh4 specific.
    this.entries = [];

    if (reader.readString(2) == 'MZ') { // Check for SFX header, and skip it if it exists.
        var lastBlockSize = reader.readUInt16();
        var blockCount = reader.readUInt16();
        var offset = (blockCount - 1) * 512 + (lastBlockSize != 0 ? lastBlockSize : 512);
        reader.seek(offset, LhaArrayReader.SeekAbsolute);
    } else {
        reader.seek(0, LhaArrayReader.SeekAbsolute);
    }

    for (;;) {
        var header = {};
        header.size = reader.readUInt8();
        if (header.size <= 0)
            break;

        header.checksum = reader.readUInt8();
        header.id = reader.readString(5);
        header.packedSize = reader.readUInt32();
        header.originalSize = reader.readUInt32();
        header.datetime = reader.readUInt32();
        header.attributes = reader.readUInt16();
        var filenameSize = reader.readUInt8();
        header.filename = reader.readString(filenameSize);
        header.crc = reader.readUInt16();
        header.offset = reader.getPosition();
        this.entries.push(header);
        reader.seek(header.packedSize, LhaArrayReader.SeekRelative);
    }
};

LhaReader.prototype.readTempTable = function () {
    var reader = this.reader;
    var codeCount = Math.min(reader.readBits(5), 19);
    if (codeCount <= 0) {
        var constant = reader.readBits(5);
        this.offsetTree.setConstant(constant);
        return;
    }
    var codeLengths = [];
    for (var i = 0; i < codeCount; i++) {
        var codeLength = reader.readLength();
        codeLengths.push(codeLength);
        if (i == 2) { // The dreaded special bit that no-one (including me) seems to understand.
            var length = reader.readBits(2);
            while (length-- > 0) {
                codeLengths.push(0);
                i++;
            }
        }
    }
    this.offsetTree.build(codeLengths, 19 * 2);
};

LhaReader.prototype.readCodeTable = function() {
    var reader = this.reader;
    var codeCount = Math.min(reader.readBits(9), 510);
    if (codeCount <= 0) {
        var constant = reader.readBits(9);
        this.codeTree.setConstant(constant);
        return;
    }

    var codeLengths = [];
    for (var i = 0; i < codeCount; ) {
        var code = this.offsetTree.readCode(reader);
        if (code <= 2) {
            var skip = 1;
            if (code == 1)
                skip = reader.readBits(4) + 3;
            else if (code == 2)
                skip = reader.readBits(9) + 20;
            while (--skip >= 0) {
                codeLengths.push(0);
                i++;
            }
        } else {
            codeLengths.push(code - 2);
            i++;
        }
    }
    this.codeTree.build(codeLengths, 510 * 2);
};

LhaReader.prototype.readOffsetTable = function() {
    var reader = this.reader;
    var codeCount = Math.min(reader.readBits(4), 14);
    if (codeCount <= 0) {
        var constant = reader.readBits(4);
        this.offsetTree.setConstant(constant);
        return;
    } else {
        var codeLengths = [];
        for (var i = 0; i < codeCount; i++) {
            var code = reader.readLength();
            codeLengths[i] = code;
        }
        this.offsetTree.build(codeLengths, 19 * 2);
    }
};

LhaReader.prototype.extract = function(id, callback) {
    var entry = this.entries[id];
    this.reader.seek(entry.offset, LhaArrayReader.SeekAbsolute);
    var writer = new LhaArrayWriter(entry.originalSize);
    while (this.extractBlock(writer)) {
        if (callback)
            callback(writer.offset, writer.size);
        if (writer.offset >= writer.size)
            break;
    }
    return buffer;
};

LhaReader.prototype.extractBlock = function(writer) {
    var reader = this.reader;
    var blockSize = reader.readBits(16);
    if (blockSize <= 0 || reader.offset >= reader.size)
        return false;

    this.readTempTable();
    this.readCodeTable();
    this.readOffsetTable();

    for (var i = 0; i < blockSize; i++) {
        var code = this.codeTree.readCode(reader);
        if (code < 256) {
            this.ringBuffer.add(code);
            writer.write(code);
        } else {
            var bits = this.offsetTree.readCode(reader);
            var offset = bits;
            if (bits >= 2) {
                var offset = reader.readBits(bits - 1);
                offset = offset + (1 << (bits - 1));
            }

            var length = code - 256 + 3;
            var chunk = this.ringBuffer.get(offset, length);
            for (var j in chunk)
                writer.write(chunk[j]); // TODO: Look at bulk-copying this.
        }
    }
    return true;
};

module.exports = exports = LhaReader;


}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/lib/lh4.js","/lib")
},{"1YiZ5S":5,"buffer":2}],27:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*
 Copyright (c) 2012 Gildas Lormeau. All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.

 2. Redistributions in binary form must reproduce the above copyright
 notice, this list of conditions and the following disclaimer in
 the documentation and/or other materials provided with the distribution.

 3. The names of the authors may not be used to endorse or promote products
 derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

(function(obj) {

	var ERR_BAD_FORMAT = "File format is not recognized.";
	var ERR_ENCRYPTED = "File contains encrypted entry.";
	var ERR_ZIP64 = "File is using Zip64 (4gb+ file size).";
	var ERR_READ = "Error while reading zip file.";
	var ERR_WRITE = "Error while writing zip file.";
	var ERR_WRITE_DATA = "Error while writing file data.";
	var ERR_READ_DATA = "Error while reading file data.";
	var ERR_DUPLICATED_NAME = "File already exists.";
	var ERR_HTTP_RANGE = "HTTP Range not supported.";
	var CHUNK_SIZE = 512 * 1024;

	var INFLATE_JS = "inflate.js";
	var DEFLATE_JS = "deflate.js";

	var BlobBuilder = obj.WebKitBlobBuilder || obj.MozBlobBuilder || obj.MSBlobBuilder || obj.BlobBuilder;

	var appendABViewSupported;

	function isAppendABViewSupported() {
		if (typeof appendABViewSupported == "undefined") {
			var blobBuilder;
			blobBuilder = new BlobBuilder();
			blobBuilder.append(getDataHelper(0).view);
			appendABViewSupported = blobBuilder.getBlob().size == 0;
		}
		return appendABViewSupported;
	}

	function Crc32() {
		var crc = -1, that = this;
		that.append = function(data) {
			var offset, table = that.table;
			for (offset = 0; offset < data.length; offset++)
				crc = (crc >>> 8) ^ table[(crc ^ data[offset]) & 0xFF];
		};
		that.get = function() {
			return ~crc;
		};
	}
	Crc32.prototype.table = (function() {
		var i, j, t, table = [];
		for (i = 0; i < 256; i++) {
			t = i;
			for (j = 0; j < 8; j++)
				if (t & 1)
					t = (t >>> 1) ^ 0xEDB88320;
				else
					t = t >>> 1;
			table[i] = t;
		}
		return table;
	})();

	function blobSlice(blob, index, length) {
		if (blob.slice)
			return blob.slice(index, index + length);
		else if (blob.webkitSlice)
			return blob.webkitSlice(index, index + length);
		else if (blob.mozSlice)
			return blob.mozSlice(index, index + length);
		else if (blob.msSlice)
			return blob.msSlice(index, index + length);
	}

	function getDataHelper(byteLength, bytes) {
		var dataBuffer, dataArray;
		dataBuffer = new ArrayBuffer(byteLength);
		dataArray = new Uint8Array(dataBuffer);
		if (bytes)
			dataArray.set(bytes, 0);
		return {
			buffer : dataBuffer,
			array : dataArray,
			view : new DataView(dataBuffer)
		};
	}

	// Readers
	function Reader() {
	}

	function TextReader(text) {
		var that = this, blobReader;

		function init(callback, onerror) {
			var blobBuilder = new BlobBuilder();
			blobBuilder.append(text);
			blobReader = new BlobReader(blobBuilder.getBlob("text/plain"));
			blobReader.init(function() {
				that.size = blobReader.size;
				callback();
			}, onerror);
		}

		function readUint8Array(index, length, callback, onerror) {
			blobReader.readUint8Array(index, length, callback, onerror);
		}

		that.size = 0;
		that.init = init;
		that.readUint8Array = readUint8Array;
	}
	TextReader.prototype = new Reader();
	TextReader.prototype.constructor = TextReader;

	function Data64URIReader(dataURI) {
		var that = this, dataStart;

		function init(callback) {
			var dataEnd = dataURI.length;
			while (dataURI.charAt(dataEnd - 1) == "=")
				dataEnd--;
			dataStart = dataURI.indexOf(",") + 1;
			that.size = Math.floor((dataEnd - dataStart) * 0.75);
			callback();
		}

		function readUint8Array(index, length, callback) {
			var i, data = getDataHelper(length);
			var start = Math.floor(index / 3) * 4;
			var end = Math.ceil((index + length) / 3) * 4;
			var bytes = obj.atob(dataURI.substring(start + dataStart, end + dataStart));
			var delta = index - Math.floor(start / 4) * 3;
			for (i = delta; i < delta + length; i++)
				data.array[i - delta] = bytes.charCodeAt(i);
			callback(data.array);
		}

		that.size = 0;
		that.init = init;
		that.readUint8Array = readUint8Array;
	}
	Data64URIReader.prototype = new Reader();
	Data64URIReader.prototype.constructor = Data64URIReader;

	function BlobReader(blob) {
		var that = this;

		function init(callback) {
			this.size = blob.size;
			callback();
		}

		function readUint8Array(index, length, callback, onerror) {
			var reader = new FileReader();
			reader.onload = function(e) {
				callback(new Uint8Array(e.target.result));
			};
			reader.onerror = onerror;
			reader.readAsArrayBuffer(blobSlice(blob, index, length));
		}

		that.size = 0;
		that.init = init;
		that.readUint8Array = readUint8Array;
	}
	BlobReader.prototype = new Reader();
	BlobReader.prototype.constructor = BlobReader;

	function HttpReader(url) {
		var that = this;

		function getData(callback, onerror) {
			var request;
			if (!that.data) {
				request = new XMLHttpRequest();
				request.addEventListener("load", function() {
					if (!that.size)
						that.size = Number(request.getResponseHeader("Content-Length"));
					that.data = new Uint8Array(request.response);
					callback();
				}, false);
				request.addEventListener("error", onerror, false);
				request.open("GET", url);
				request.responseType = "arraybuffer";
				request.send();
			} else
				callback();
		}

		function init(callback, onerror) {
			var request = new XMLHttpRequest();
            debugger;
			request.addEventListener("load", function() {
				that.size = Number(request.getResponseHeader("Content-Length"));
				callback();
			}, false);
			request.addEventListener("error", onerror, false);
			request.open("HEAD", url);
			request.send();
		}

		function readUint8Array(index, length, callback, onerror) {
			getData(function() {
				callback(new Uint8Array(that.data.subarray(index, index + length)));
			}, onerror);
		}

		that.size = 0;
		that.init = init;
		that.readUint8Array = readUint8Array;
	}
	HttpReader.prototype = new Reader();
	HttpReader.prototype.constructor = HttpReader;

	function HttpRangeReader(url) {
		var that = this;

		function init(callback, onerror) {
			var request = new XMLHttpRequest();
			request.addEventListener("load", function() {
				that.size = Number(request.getResponseHeader("Content-Length"));
				if (request.getResponseHeader("Accept-Ranges") == "bytes")
					callback();
				else
					onerror(ERR_HTTP_RANGE);
			}, false);
			request.addEventListener("error", onerror, false);
			request.open("HEAD", url);
			request.send();
		}

		function readArrayBuffer(index, length, callback, onerror) {
			var request = new XMLHttpRequest();
			request.open("GET", url);
			request.responseType = "arraybuffer";
			request.setRequestHeader("Range", "bytes=" + index + "-" + (index + length - 1));
			request.addEventListener("load", function() {
				callback(request.response);
			}, false);
			request.addEventListener("error", onerror, false);
			request.send();
		}

		function readUint8Array(index, length, callback, onerror) {
			readArrayBuffer(index, length, function(arraybuffer) {
				callback(new Uint8Array(arraybuffer));
			}, onerror);
		}

		that.size = 0;
		that.init = init;
		that.readUint8Array = readUint8Array;
	}
	HttpRangeReader.prototype = new Reader();
	HttpRangeReader.prototype.constructor = HttpRangeReader;

	// Writers

	function Writer() {
	}
	Writer.prototype.getData = function(callback) {
		callback(this.data);
	};

	function TextWriter() {
		var that = this, blobBuilder;

		function init(callback) {
			blobBuilder = new BlobBuilder();
			callback();
		}

		function writeUint8Array(array, callback) {
			blobBuilder.append(isAppendABViewSupported() ? array : array.buffer);
			callback();
		}

		function getData(callback, onerror) {
			var reader = new FileReader();
			reader.onload = function(e) {
				callback(e.target.result);
			};
			reader.onerror = onerror;
			reader.readAsText(blobBuilder.getBlob("text/plain"));
		}

		that.init = init;
		that.writeUint8Array = writeUint8Array;
		that.getData = getData;
	}
	TextWriter.prototype = new Writer();
	TextWriter.prototype.constructor = TextWriter;


	function Data64URIWriter(contentType) {
		var that = this, data = "", pending = "";

		function init(callback) {
			data += "data:" + (contentType || "") + ";base64,";
			callback();
		}

		function writeUint8Array(array, callback) {
			var i, delta = pending.length, dataString = pending;
			pending = "";
			for (i = 0; i < (Math.floor((delta + array.length) / 3) * 3) - delta; i++)
				dataString += String.fromCharCode(array[i]);
			for (; i < array.length; i++)
				pending += String.fromCharCode(array[i]);
			if (dataString.length > 2)
				data += obj.btoa(dataString);
			else
				pending = dataString;
			callback();
		}

		function getData(callback) {
			callback(data + obj.btoa(pending));
		}

		that.init = init;
		that.writeUint8Array = writeUint8Array;
		that.getData = getData;
	}
	Data64URIWriter.prototype = new Writer();
	Data64URIWriter.prototype.constructor = Data64URIWriter;

	function FileWriter(fileEntry, contentType) {
		var writer, that = this;

		function init(callback, onerror) {
			fileEntry.createWriter(function(fileWriter) {
				writer = fileWriter;
				callback();
			}, onerror);
		}

		function writeUint8Array(array, callback, onerror) {
			var blobBuilder = new BlobBuilder();
			blobBuilder.append(isAppendABViewSupported() ? array : array.buffer);
			writer.onwrite = function() {
				writer.onwrite = null;
				callback();
			};
			writer.onerror = onerror;
			writer.write(blobBuilder.getBlob(contentType));
		}

		function getData(callback) {
			fileEntry.file(callback);
		}

		that.init = init;
		that.writeUint8Array = writeUint8Array;
		that.getData = getData;
	}
	FileWriter.prototype = new Writer();
	FileWriter.prototype.constructor = FileWriter;

	function BlobWriter(contentType) {
		var blobBuilder, that = this;

		function init(callback) {
			blobBuilder = new BlobBuilder();
			callback();
		}

		function writeUint8Array(array, callback) {
			blobBuilder.append(isAppendABViewSupported() ? array : array.buffer);
			callback();
		}

		function getData(callback) {
			callback(blobBuilder.getBlob(contentType));
		}

		that.init = init;
		that.writeUint8Array = writeUint8Array;
		that.getData = getData;
	}
	BlobWriter.prototype = new Writer();
	BlobWriter.prototype.constructor = BlobWriter;

    function ArrayWriter(size) {
        var that = this;
        function init(callback) {
            that.buffer = new Uint8Array(size);
            that.offset = 0;
            callback();
        }

        function writeUint8Array(array, callback) {
            that.buffer.set(array, that.offset);
            that.offset += array.length;
            callback();
        }

        function getData(callback) {
            callback(that.buffer);
        }

        that.init = init;
        that.writeUint8Array = writeUint8Array;
        that.getData = getData;
    }
    ArrayWriter.prototype = new Writer();
    ArrayWriter.prototype.constructor = ArrayWriter;

	// inflate/deflate core functions
	function launchWorkerProcess(worker, reader, writer, offset, size, onappend, onprogress, onend, onreaderror, onwriteerror) {
		var chunkIndex = 0, index, outputSize;

		function onflush() {
			worker.removeEventListener("message", onmessage, false);
			onend(outputSize);
		}

		function onmessage(event) {
			var message = event.data, data = message.data;

			if (message.onappend) {
				outputSize += data.length;
				writer.writeUint8Array(data, function() {
					onappend(false, data);
					step();
				}, onwriteerror);
			}
			if (message.onflush)
				if (data) {
					outputSize += data.length;
					writer.writeUint8Array(data, function() {
						onappend(false, data);
						onflush();
					}, onwriteerror);
				} else
					onflush();
			if (message.progress && onprogress)
				onprogress(index + message.current, size);
		}

		function step() {
			index = chunkIndex * CHUNK_SIZE;
			if (index < size)
				reader.readUint8Array(offset + index, Math.min(CHUNK_SIZE, size - index), function(array) {
					worker.postMessage({
						append : true,
						data : array
					});
					chunkIndex++;
					if (onprogress)
						onprogress(index, size);
					onappend(true, array);
				}, onreaderror);
			else
				worker.postMessage({
					flush : true
				});
		}

		outputSize = 0;
		worker.addEventListener("message", onmessage, false);
		step();
	}

	function launchProcess(process, reader, writer, offset, size, onappend, onprogress, onend, onreaderror, onwriteerror) {
		var chunkIndex = 0, index, outputSize = 0;

		function step() {
			var outputData;
			index = chunkIndex * CHUNK_SIZE;
			if (index < size)
				reader.readUint8Array(offset + index, Math.min(CHUNK_SIZE, size - index), function(inputData) {
					var outputData = process.append(inputData, function() {
						if (onprogress)
							onprogress(offset + index, size);
					});
					outputSize += outputData.length;
					onappend(true, inputData);
					writer.writeUint8Array(outputData, function() {
						onappend(false, outputData);
						chunkIndex++;
						setTimeout(step, 1);
					}, onwriteerror);
					if (onprogress)
						onprogress(index, size);
				}, onreaderror);
			else {
				outputData = process.flush();
				if (outputData) {
					outputSize += outputData.length;
					writer.writeUint8Array(outputData, function() {
						onappend(false, outputData);
						onend(outputSize);
					}, onwriteerror);
				} else
					onend(outputSize);
			}
		}

		step();
	}

	function inflate(reader, writer, offset, size, computeCrc32, onend, onprogress, onreaderror, onwriteerror) {
		var worker, crc32 = new Crc32();

		function oninflateappend(sending, array) {
			if (computeCrc32 && !sending)
				crc32.append(array);
		}

		function oninflateend(outputSize) {
			onend(outputSize, crc32.get());
		}

		if (obj.zip.useWebWorkers) {
			worker = new Worker(obj.zip.workerScriptsPath + INFLATE_JS);
			launchWorkerProcess(worker, reader, writer, offset, size, oninflateappend, onprogress, oninflateend, onreaderror, onwriteerror);
		} else
			launchProcess(new obj.zip.Inflater(), reader, writer, offset, size, oninflateappend, onprogress, oninflateend, onreaderror, onwriteerror);
		return worker;
	}

	function deflate(reader, writer, level, onend, onprogress, onreaderror, onwriteerror) {
		var worker, crc32 = new Crc32();

		function ondeflateappend(sending, array) {
			if (sending)
				crc32.append(array);
		}

		function ondeflateend(outputSize) {
			onend(outputSize, crc32.get());
		}

		function onmessage() {
			worker.removeEventListener("message", onmessage, false);
			launchWorkerProcess(worker, reader, writer, 0, reader.size, ondeflateappend, onprogress, ondeflateend, onreaderror, onwriteerror);
		}

		if (obj.zip.useWebWorkers) {
			worker = new Worker(obj.zip.workerScriptsPath + DEFLATE_JS);
			worker.addEventListener("message", onmessage, false);
			worker.postMessage({
				init : true,
				level : level
			});
		} else
			launchProcess(new obj.zip.Deflater(), reader, writer, 0, reader.size, ondeflateappend, onprogress, ondeflateend, onreaderror, onwriteerror);
		return worker;
	}

	function copy(reader, writer, offset, size, computeCrc32, onend, onprogress, onreaderror, onwriteerror) {
		var chunkIndex = 0, crc32 = new Crc32();

		function step() {
			var index = chunkIndex * CHUNK_SIZE;
			if (index < size)
				reader.readUint8Array(offset + index, Math.min(CHUNK_SIZE, size - index), function(array) {
					if (computeCrc32)
						crc32.append(array);
					if (onprogress)
						onprogress(index, size, array);
					writer.writeUint8Array(array, function() {
						chunkIndex++;
						step();
					}, onwriteerror);
				}, onreaderror);
			else
				onend(size, crc32.get());
		}

		step();
	}

	// ZipReader

	function decodeASCII(str) {
		var i, out = "", charCode, extendedASCII = [ '\u00C7', '\u00FC', '\u00E9', '\u00E2', '\u00E4', '\u00E0', '\u00E5', '\u00E7', '\u00EA', '\u00EB',
				'\u00E8', '\u00EF', '\u00EE', '\u00EC', '\u00C4', '\u00C5', '\u00C9', '\u00E6', '\u00C6', '\u00F4', '\u00F6', '\u00F2', '\u00FB', '\u00F9',
				'\u00FF', '\u00D6', '\u00DC', '\u00F8', '\u00A3', '\u00D8', '\u00D7', '\u0192', '\u00E1', '\u00ED', '\u00F3', '\u00FA', '\u00F1', '\u00D1',
				'\u00AA', '\u00BA', '\u00BF', '\u00AE', '\u00AC', '\u00BD', '\u00BC', '\u00A1', '\u00AB', '\u00BB', '_', '_', '_', '\u00A6', '\u00A6',
				'\u00C1', '\u00C2', '\u00C0', '\u00A9', '\u00A6', '\u00A6', '+', '+', '\u00A2', '\u00A5', '+', '+', '-', '-', '+', '-', '+', '\u00E3',
				'\u00C3', '+', '+', '-', '-', '\u00A6', '-', '+', '\u00A4', '\u00F0', '\u00D0', '\u00CA', '\u00CB', '\u00C8', 'i', '\u00CD', '\u00CE',
				'\u00CF', '+', '+', '_', '_', '\u00A6', '\u00CC', '_', '\u00D3', '\u00DF', '\u00D4', '\u00D2', '\u00F5', '\u00D5', '\u00B5', '\u00FE',
				'\u00DE', '\u00DA', '\u00DB', '\u00D9', '\u00FD', '\u00DD', '\u00AF', '\u00B4', '\u00AD', '\u00B1', '_', '\u00BE', '\u00B6', '\u00A7',
				'\u00F7', '\u00B8', '\u00B0', '\u00A8', '\u00B7', '\u00B9', '\u00B3', '\u00B2', '_', ' ' ];
		for (i = 0; i < str.length; i++) {
			charCode = str.charCodeAt(i) & 0xFF;
			if (charCode > 127)
				out += extendedASCII[charCode - 128];
			else
				out += String.fromCharCode(charCode);
		}
		return out;
	}

	function decodeUTF8(str_data) {
		var tmp_arr = [], i = 0, ac = 0, c1 = 0, c2 = 0, c3 = 0;

		str_data += '';

		while (i < str_data.length) {
			c1 = str_data.charCodeAt(i);
			if (c1 < 128) {
				tmp_arr[ac++] = String.fromCharCode(c1);
				i++;
			} else if (c1 > 191 && c1 < 224) {
				c2 = str_data.charCodeAt(i + 1);
				tmp_arr[ac++] = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
				i += 2;
			} else {
				c2 = str_data.charCodeAt(i + 1);
				c3 = str_data.charCodeAt(i + 2);
				tmp_arr[ac++] = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
		}

		return tmp_arr.join('');
	}

	function getString(bytes) {
		var i, str = "";
		for (i = 0; i < bytes.length; i++)
			str += String.fromCharCode(bytes[i]);
		return str;
	}

	function getDate(timeRaw) {
		var date = (timeRaw & 0xffff0000) >> 16, time = timeRaw & 0x0000ffff;
		try {
			return new Date(1980 + ((date & 0xFE00) >> 9), ((date & 0x01E0) >> 5) - 1, date & 0x001F, (time & 0xF800) >> 11, (time & 0x07E0) >> 5,
					(time & 0x001F) * 2, 0);
		} catch (e) {
		}
	}

	function readCommonHeader(entry, data, index, centralDirectory, onerror) {
		entry.version = data.view.getUint16(index, true);
		entry.bitFlag = data.view.getUint16(index + 2, true);
		entry.compressionMethod = data.view.getUint16(index + 4, true);
		entry.lastModDateRaw = data.view.getUint32(index + 6, true);
		entry.lastModDate = getDate(entry.lastModDateRaw);
		if ((entry.bitFlag & 0x01) === 0x01) {
			onerror(ERR_ENCRYPTED);
			return;
		}
		if (centralDirectory || (entry.bitFlag & 0x0008) != 0x0008) {
			entry.crc32 = data.view.getUint32(index + 10, true);
			entry.compressedSize = data.view.getUint32(index + 14, true);
			entry.uncompressedSize = data.view.getUint32(index + 18, true);
		}
		if (entry.compressedSize === 0xFFFFFFFF || entry.uncompressedSize === 0xFFFFFFFF) {
			onerror(ERR_ZIP64);
			return;
		}
		entry.filenameLength = data.view.getUint16(index + 22, true);
		entry.extraFieldLength = data.view.getUint16(index + 24, true);
	}

	function createZipReader(reader, onerror) {
		function Entry() {
		}

		Entry.prototype.getData = function(writer, onend, onprogress, checkCrc32) {
			var that = this, worker;

			function terminate(callback, param) {
				if (worker)
					worker.terminate();
				worker = null;
				if (callback)
					callback(param);
			}

			function testCrc32(crc32) {
				var dataCrc32 = getDataHelper(4);
				dataCrc32.view.setUint32(0, crc32);
				return that.crc32 == dataCrc32.view.getUint32(0);
			}

			function getWriterData(uncompressedSize, crc32) {
				if (checkCrc32 && !testCrc32(crc32))
					onreaderror();
				else
					writer.getData(function(data) {
						terminate(onend, data);
					});
			}

			function onreaderror() {
				terminate(onerror, ERR_READ_DATA);
			}

			function onwriteerror() {
				terminate(onerror, ERR_WRITE_DATA);
			}

			reader.readUint8Array(that.offset, 30, function(bytes) {
				var data = getDataHelper(bytes.length, bytes), dataOffset;
				if (data.view.getUint32(0) != 0x504b0304) {
					onerror(ERR_BAD_FORMAT);
					return;
				}
				readCommonHeader(that, data, 4, false, function(error) {
					onerror(error);
					return;
				});
				dataOffset = that.offset + 30 + that.filenameLength + that.extraFieldLength;
				writer.init(function() {
					if (that.compressionMethod === 0)
						copy(reader, writer, dataOffset, that.compressedSize, checkCrc32, getWriterData, onprogress, onreaderror, onwriteerror);
					else
						worker = inflate(reader, writer, dataOffset, that.compressedSize, checkCrc32, getWriterData, onprogress, onreaderror, onwriteerror);
				}, onwriteerror);
			}, onreaderror);
		};

		function seekEOCDR(offset, entriesCallback) {
			reader.readUint8Array(reader.size - offset, offset, function(bytes) {
				var dataView = getDataHelper(bytes.length, bytes).view;
				if (dataView.getUint32(0) != 0x504b0506) {
					seekEOCDR(offset+1, entriesCallback);
				} else {
					entriesCallback(dataView);
				}
			}, function() {
				onerror(ERR_READ);
			});
		}
		
		return {
			getEntries : function(callback) {
				if (reader.size < 22) {
					onerror(ERR_BAD_FORMAT);
					return;
				}
				// look for End of central directory record
				seekEOCDR(22, function(dataView) {
					datalength = dataView.getUint32(16, true);
					fileslength = dataView.getUint16(8, true);
					reader.readUint8Array(datalength, reader.size - datalength, function(bytes) {
						var i, index = 0, entries = [], entry, filename, comment, data = getDataHelper(bytes.length, bytes);
						for (i = 0; i < fileslength; i++) {
							entry = new Entry();
							if (data.view.getUint32(index) != 0x504b0102) {
								onerror(ERR_BAD_FORMAT);
								return;
							}
							readCommonHeader(entry, data, index + 6, true, function(error) {
								onerror(error);
								return;
							});
							entry.commentLength = data.view.getUint16(index + 32, true);
							entry.directory = ((data.view.getUint8(index + 38) & 0x10) == 0x10);
							entry.offset = data.view.getUint32(index + 42, true);
							filename = getString(data.array.subarray(index + 46, index + 46 + entry.filenameLength));
							entry.filename = ((entry.bitFlag & 0x0800) === 0x0800) ? decodeUTF8(filename) : decodeASCII(filename);
							if (!entry.directory && entry.filename.charAt(entry.filename.length - 1) == "/")
								entry.directory = true;
							comment = getString(data.array.subarray(index + 46 + entry.filenameLength + entry.extraFieldLength, index + 46
									+ entry.filenameLength + entry.extraFieldLength + entry.commentLength));
							entry.comment = ((entry.bitFlag & 0x0800) === 0x0800) ? decodeUTF8(comment) : decodeASCII(comment);
							entries.push(entry);
							index += 46 + entry.filenameLength + entry.extraFieldLength + entry.commentLength;
						}
						callback(entries);
					}, function() {
						onerror(ERR_READ);
					});
				});
			},
			close : function(callback) {
				if (callback)
					callback();
			}
		};
	}

	// ZipWriter

	function encodeUTF8(string) {
		var n, c1, enc, utftext = [], start = 0, end = 0, stringl = string.length;
		for (n = 0; n < stringl; n++) {
			c1 = string.charCodeAt(n);
			enc = null;
			if (c1 < 128)
				end++;
			else if (c1 > 127 && c1 < 2048)
				enc = String.fromCharCode((c1 >> 6) | 192) + String.fromCharCode((c1 & 63) | 128);
			else
				enc = String.fromCharCode((c1 >> 12) | 224) + String.fromCharCode(((c1 >> 6) & 63) | 128) + String.fromCharCode((c1 & 63) | 128);
			if (enc != null) {
				if (end > start)
					utftext += string.slice(start, end);
				utftext += enc;
				start = end = n + 1;
			}
		}
		if (end > start)
			utftext += string.slice(start, stringl);
		return utftext;
	}

	function getBytes(str) {
		var i, array = [];
		for (i = 0; i < str.length; i++)
			array.push(str.charCodeAt(i));
		return array;
	}

	function createZipWriter(writer, onerror, dontDeflate) {
		var worker, files = [], filenames = [], datalength = 0;

		function terminate(callback, message) {
			if (worker)
				worker.terminate();
			worker = null;
			if (callback)
				callback(message);
		}

		function onwriteerror() {
			terminate(onerror, ERR_WRITE);
		}

		function onreaderror() {
			terminate(onerror, ERR_READ_DATA);
		}

		return {
			add : function(name, reader, onend, onprogress, options) {
				var header, filename, date;

				function writeHeader(callback) {
					var data;
					date = options.lastModDate || new Date();
					header = getDataHelper(26);
					files[name] = {
						headerArray : header.array,
						directory : options.directory,
						filename : filename,
						offset : datalength,
						comment : getBytes(encodeUTF8(options.comment || ""))
					};
					header.view.setUint32(0, 0x14000808);
					if (options.version)
						header.view.setUint8(0, options.version);
					if (!dontDeflate && options.level != 0)
						header.view.setUint16(4, 0x0800);
					header.view.setUint16(6, (((date.getHours() << 6) | date.getMinutes()) << 5) | date.getSeconds() / 2, true);
					header.view.setUint16(8, ((((date.getFullYear() - 1980) << 4) | (date.getMonth() + 1)) << 5) | date.getDate(), true);
					header.view.setUint16(22, filename.length, true);
					data = getDataHelper(30 + filename.length);
					data.view.setUint32(0, 0x504b0304);
					data.array.set(header.array, 4);
					data.array.set([], 30); // FIXME: remove when chrome 18 will be stable (14: OK, 16: KO, 17: OK)
					data.array.set(filename, 30);
					datalength += data.array.length;
					writer.writeUint8Array(data.array, callback, onwriteerror);
				}

				function writeFooter(compressedLength, crc32) {
					var footer = getDataHelper(16);
					datalength += compressedLength || 0;
					footer.view.setUint32(0, 0x504b0708);
					if (typeof crc32 != "undefined") {
						header.view.setUint32(10, crc32, true);
						footer.view.setUint32(4, crc32, true);
					}
					if (reader) {
						footer.view.setUint32(8, compressedLength, true);
						header.view.setUint32(14, compressedLength, true);
						footer.view.setUint32(12, reader.size, true);
						header.view.setUint32(18, reader.size, true);
					}
					writer.writeUint8Array(footer.array, function() {
						datalength += 16;
						terminate(onend);
					}, onwriteerror);
				}

				function writeFile() {
					options = options || {};
					name = name.trim();
					if (options.directory && name.charAt(name.length - 1) != "/")
						name += "/";
					if (files[name])
						throw ERR_DUPLICATED_NAME;
					filename = getBytes(encodeUTF8(name));
					filenames.push(name);
					writeHeader(function() {
						if (reader)
							if (dontDeflate || options.level == 0)
								copy(reader, writer, 0, reader.size, true, writeFooter, onprogress, onreaderror, onwriteerror);
							else
								worker = deflate(reader, writer, options.level, writeFooter, onprogress, onreaderror, onwriteerror);
						else
							writeFooter();
					}, onwriteerror);
				}

				if (reader)
					reader.init(writeFile, onreaderror);
				else
					writeFile();
			},
			close : function(callback) {
				var data, length = 0, index = 0;
				filenames.forEach(function(name) {
					var file = files[name];
					length += 46 + file.filename.length + file.comment.length;
				});
				data = getDataHelper(length + 22);
				filenames.forEach(function(name) {
					var file = files[name];
					data.view.setUint32(index, 0x504b0102);
					data.view.setUint16(index + 4, 0x1400);
					data.array.set(file.headerArray, index + 6);
					data.view.setUint16(index + 32, file.comment.length, true);
					if (file.directory)
						data.view.setUint8(index + 38, 0x10);
					data.view.setUint32(index + 42, file.offset, true);
					data.array.set(file.filename, index + 46);
					data.array.set(file.comment, index + 46 + file.filename.length);
					index += 46 + file.filename.length + file.comment.length;
				});
				data.view.setUint32(index, 0x504b0506);
				data.view.setUint16(index + 8, filenames.length, true);
				data.view.setUint16(index + 10, filenames.length, true);
				data.view.setUint32(index + 12, length, true);
				data.view.setUint32(index + 16, datalength, true);
				writer.writeUint8Array(data.array, function() {
					terminate(function() {
						writer.getData(callback);
					});
				}, onwriteerror);
			}
		};
	}

	if (typeof BlobBuilder == "undefined") {
		BlobBuilder = function() {
			var that = this, blobParts;

			function initBlobParts() {
				if (!blobParts) {
					blobParts = [ new Blob() ]
				}
			}

			that.append = function(data) {
				initBlobParts();
				blobParts.push(data);
			};
			that.getBlob = function(contentType) {
				initBlobParts();
				if (blobParts.length > 1 || blobParts[0].type != contentType) {
					blobParts = [ contentType ? new Blob(blobParts, {
						type : contentType
					}) : new Blob(blobParts) ];
				}
				return blobParts[0];
			};
		};
	}

	obj.zip = {
		Reader : Reader,
		Writer : Writer,
		BlobReader : BlobReader,
		HttpReader : HttpReader,
		HttpRangeReader : HttpRangeReader,
		Data64URIReader : Data64URIReader,
		TextReader : TextReader,
		BlobWriter : BlobWriter,
		ArrayWriter : ArrayWriter,
        FileWriter : FileWriter,
		Data64URIWriter : Data64URIWriter,
		TextWriter : TextWriter,
		createReader : function(reader, callback, onerror) {
			reader.init(function() {
				callback(createZipReader(reader, onerror));
			}, onerror);
		},
		createWriter : function(writer, callback, onerror, dontDeflate) {
			writer.init(function() {
				callback(createZipWriter(writer, onerror, dontDeflate));
			}, onerror);
		},
		workerScriptsPath : "",
		useWebWorkers : true
	};

})(this);

}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/lib/zip.js","/lib")
},{"1YiZ5S":5,"buffer":2}],28:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var LightMap = require('gl/lightmap');
var Bsp = require('formats/bsp');
var utils = require('utils');

var maxLightMaps = 64;
var lightMapBytes = 1;
var blockWidth = 512;
var blockHeight = 512;

var LightMaps = function() {
    this.allocated = utils.array2d(blockWidth, maxLightMaps);
    this.lightMapsData = [];
};

LightMaps.prototype.buildLightMap = function(bsp, surface, offset) {
    var width = (surface.extents[0] >> 4) + 1;
    var height = (surface.extents[1] >> 4) + 1;
    var size = width * height;
    var blockLights = utils.array1d(18 * 18);
    var lightMapOffset = surface.lightMapOffset;

    for (var map = 0; map < maxLightMaps; map++) {
        if (surface.lightStyles[map] === 255)
            break;

        // TODO: Add lightstyles, used for flickering, and other light animations.
        var scale = 264;
        for (var bl = 0; bl < size; bl++) {
            blockLights[bl] += bsp.lightMaps[lightMapOffset + bl] * scale;
        }
        lightMapOffset += size;
    }

    var i = 0;
    var stride = blockWidth * lightMapBytes;
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            var position = y * stride + x;
            this.lightMapsData[offset + position] = 255 - Math.min(255, blockLights[i] >> 7);
            i++;
        }
    }
};

LightMaps.prototype.allocateBlock = function (width, height) {
    var result = {};
    for (var texId = 0; texId < maxLightMaps; texId++) {
        var best = blockHeight;
        for (var i = 0; i < blockWidth - width; i++) {
            var best2 = 0;
            for (var j = 0; j < width; j++) {

                if (this.allocated[texId][i + j] >= best)
                    break;
                if (this.allocated[texId][i + j] > best2)
                    best2 = this.allocated[texId][i + j];
            }

            if (j == width) {
                result.x = i;
                result.y = best = best2;
            }
        }

        if (best + height > blockHeight)
            continue;

        for (var j = 0; j < width; j++)
            this.allocated[texId][result.x + j] = best + height;

        result.texId = texId;
        return result;
    }
    return null;
};

LightMaps.prototype.build = function(bsp) {
    var usedMaps = 0;
    for (var m = 0; m < bsp.models.length; m++) {
        var model = bsp.models[m];

        for (var i = 0; i < model.surfaceCount; i++) {
            var surface = bsp.surfaces[model.firstSurface + i];
            if (surface.flags !== 0) {
                continue;
            }

            var width = (surface.extents[0] >> 4) + 1;
            var height = (surface.extents[1] >> 4) + 1;

            var result = this.allocateBlock(width, height);
            surface.lightMapS = result.x;
            surface.lightMapT = result.y;
            usedMaps = Math.max(usedMaps, result.texId);
            var offset = result.texId * lightMapBytes * blockWidth * blockHeight;
            offset += (result.y * blockWidth + result.x) * lightMapBytes;
            this.buildLightMap(bsp, surface, offset);
        }
    }
    this.texture = new LightMap(this.lightMapsData, 0, blockWidth, blockHeight);
};

module.exports = exports = LightMaps;


}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/lightmaps.js","/")
},{"1YiZ5S":5,"buffer":2,"formats/bsp":9,"gl/lightmap":18,"utils":35}],29:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var Texture = require('gl/texture');
var LightMaps = require('lightmaps');
var assets = require('assets');
var utils = require('utils');
var wireframe = false;

var blockWidth = 512;
var blockHeight = 512;

var Map = function(bsp) {
    this.textures = [];
    this.lightMaps = new LightMaps();
    this.lightMaps.build(bsp);

    for (var texId in bsp.textures) {
        var texture = bsp.textures[texId];
        var options = {
            width: texture.width,
            height: texture.height,
            wrap: gl.REPEAT,
            palette: assets.palette
        };
        this.textures.push(new Texture(texture.data, options));
    }

    var chains = [];
    for (var m in bsp.models) {
        var model = bsp.models[m];
        for (var sid = model.firstSurface; sid < model.surfaceCount; sid++) {
            var surface = bsp.surfaces[sid];
            var texInfo = bsp.texInfos[surface.texInfoId];

            var chain = chains[texInfo.textureId];
            if (!chain) {
                chain = { texId: texInfo.textureId, data: [] };
                chains[texInfo.textureId] = chain;
            }

            var indices = [];
            for (var e = surface.edgeStart; e < surface.edgeStart + surface.edgeCount; e++) {
                var edgeFlipped = bsp.edgeList[e] < 0;
                var edgeIndex = Math.abs(bsp.edgeList[e]);
                if (!edgeFlipped) {
                    indices.push(bsp.edges[edgeIndex * 2]);
                    indices.push(bsp.edges[edgeIndex * 2 + 1]);
                } else {
                    indices.push(bsp.edges[edgeIndex * 2 + 1]);
                    indices.push(bsp.edges[edgeIndex * 2]);
                }
            }
            indices = wireframe ? indices : utils.triangulate(indices);
            for (var i = 0; i < indices.length; i++) {
                var v = [
                    bsp.vertices[indices[i]].x,
                    bsp.vertices[indices[i]].y,
                    bsp.vertices[indices[i]].z
                ];

                var s = vec3.dot(v, texInfo.vectorS) + texInfo.distS;
                var t = vec3.dot(v, texInfo.vectorT) + texInfo.distT;

                var s1 = s / this.textures[texInfo.textureId].width;
                var t1 = t / this.textures[texInfo.textureId].height;

                // Shadow map texture coordinates
                var s2 = s;
                s2 -= surface.textureMins[0];
                s2 += (surface.lightMapS * 16);
                s2 += 8;
                s2 /= (blockWidth * 16);

                var t2 = t;
                t2 -= surface.textureMins[1];
                t2 += (surface.lightMapT * 16);
                t2 += 8;
                t2 /= (blockHeight * 16);

                chain.data.push(v[0], v[1], v[2], s1, t1, s2, t2);
            }
        }
    }

    var data = [];
    var offset = 0;
    this.chains = [];
    for (var c in chains) {
        for (var v = 0; v < chains[c].data.length; v++) {
            data.push(chains[c].data[v]);
        }
        var chain = {
            offset: offset,
            texId: chains[c].texId,
            elements: chains[c].data.length / 7
        };
        offset += chain.elements;
        this.chains.push(chain);
    }
    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    this.buffer.stride = 7 * 4;
};

Map.prototype.draw = function(p, m) {
    var shader = assets.shaders.world;
    var buffer = this.buffer;
    var mode = wireframe ? gl.LINES : gl.TRIANGLES;

    shader.use();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

    gl.enableVertexAttribArray(shader.attributes.shadowTexCoordsAttribute);

    gl.vertexAttribPointer(shader.attributes.vertexAttribute, 3, gl.FLOAT, false, buffer.stride, 0);
    gl.vertexAttribPointer(shader.attributes.texCoordsAttribute, 2, gl.FLOAT, false, buffer.stride, 12);
    gl.vertexAttribPointer(shader.attributes.shadowTexCoordsAttribute, 2, gl.FLOAT, false, buffer.stride, 20);
    gl.uniformMatrix4fv(shader.uniforms.projectionMatrix, false, p);
    gl.uniformMatrix4fv(shader.uniforms.modelviewMatrix, false, m);
    gl.uniform1i(shader.uniforms.textureMap, 0);
    gl.uniform1i(shader.uniforms.lightMap, 1);

    this.lightMaps.texture.bind(1);
    for (var c in this.chains) {
        var chain = this.chains[c];
        var texture = this.textures[chain.texId];
        texture.bind(0);
        gl.drawArrays(mode, this.chains[c].offset, this.chains[c].elements);
    }
};

module.exports = exports = Map;
}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/map.js","/")
},{"1YiZ5S":5,"assets":6,"buffer":2,"gl/texture":21,"lightmaps":28,"utils":35}],30:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var assets = require('assets');
var Texture = require('gl/Texture');

var Model = function(mdl) {
    this.skins = [];
    for (var skinIndex = 0; skinIndex < mdl.skins.length; skinIndex++) {
        var skin = mdl.skins[skinIndex];
        var texture = new Texture(skin, {
            palette: assets.palette,
            width: mdl.skinWidth,
            height: mdl.skinHeight
        });
        this.skins.push(texture);
    }

    this.id = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.id);
    var data = new Float32Array(mdl.frameCount * mdl.faceCount * 3 * 5);
    var offset = 0;
    for (var i = 0; i < mdl.frameCount; i++) {
        var frame = mdl.frames[i];
        for (var f = 0; f < mdl.faceCount; f++) {
            var face = mdl.faces[f];
            for (var v = 0; v < 3; v++) {
                data[offset++] = frame.vertices[face.indices[v]][0];
                data[offset++] = frame.vertices[face.indices[v]][1];
                data[offset++] = frame.vertices[face.indices[v]][2];

                var s = mdl.texCoords[face.indices[v]].s;
                var t = mdl.texCoords[face.indices[v]].t;

                if (!face.isFrontFace && mdl.texCoords[face.indices[v]].onSeam)
                    s += this.skins[0].width * 0.5; // on back side

                data[offset++] = (s + 0.5) / this.skins[0].width;
                data[offset++] = (t + 0.5) / this.skins[0].height;
            }
        }
    }

    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    this.stride = 5 * 4; // x, y, z, s, t
    this.faceCount = mdl.faceCount;
    this.animations = mdl.animations;
};

Model.prototype.draw = function(p, m, animation, frame) {
    var shader = assets.shaders.model;
    animation = animation | 0;
    frame = frame | 0;
    shader.use();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.id);
    this.skins[0].bind(0);

    gl.vertexAttribPointer(shader.attributes.vertexAttribute, 3, gl.FLOAT, false, this.stride, 0);
    gl.vertexAttribPointer(shader.attributes.texCoordsAttribute, 2, gl.FLOAT, false, this.stride, 12);
    gl.uniformMatrix4fv(shader.uniforms.modelviewMatrix, false, m);
    gl.uniformMatrix4fv(shader.uniforms.projectionMatrix, false, p);

    frame += this.animations[animation].firstFrame;
    if (frame >= this.animations[animation].frameCount)
        frame = 0;

    gl.uniform1i(shader.uniforms.textureMap, 0);
    gl.drawArrays(gl.TRIANGLES, ~~frame * (this.faceCount * 3), this.faceCount * 3);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
};

module.exports = exports = Model;
}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/model.js","/")
},{"1YiZ5S":5,"assets":6,"buffer":2,"gl/Texture":14}],31:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){

var Protocol = {
    serverBad: 0,
    serverNop: 1,
    serverDisconnect: 2,
    serverUpdateStat: 3,
    serverVersion: 4,
    serverSetView: 5,
    serverSound: 6,
    serverTime: 7,
    serverPrint: 8,
    serverStuffText: 9,
    serverSetAngle: 10,
    serverInfo: 11,
    serverLightStyle: 12,
    serverUpdateName: 13,
    serverUpdateFrags: 14,
    serverClientData: 15,
    serverStopSound: 16,
    serverUpdateColors: 17,
    serverParticle: 18,
    serverDamage: 19,
    serverSpawnStatic: 20,
    serverSpawnBaseline: 22,
    serverTempEntity: 23,
    serverSetPause: 24,
    serverSignonNum: 25,
    serverCenterPrint: 26,
    serverKilledMonster: 27,
    serverFoundSecret: 28,
    serverSpawnStaticSound: 29,
    serverCdTrack: 32,
    
    clientViewHeight: 1,
    clientIdealPitch: 2,
    clientPunch1: 4,
    clientPunch2: 8,
    clientPunch3: 16,
    clientVelocity1: 32,
    clientVelocity2: 64,
    clientVelocity3: 128,
    clientAiment: 256,
    clientItems: 512,
    clientOnGround: 1024,
    clientInWater: 2048,
    clientWeaponFrame: 4096,
    clientArmor: 8192,
    clientWeapon: 16384,

    fastUpdateMoreBits: 1,
    fastUpdateOrigin1: 2,
    fastUpdateOrigin2: 4,
    fastUpdateOrigin3: 8,
    fastUpdateAngle2: 16,
    fastUpdateNoLerp: 32,
    fastUpdateFrame: 64,
    fastUpdateSignal: 128,
    fastUpdateAngle1: 256,
    fastUpdateAngle3: 512,
    fastUpdateModel: 1024,
    fastUpdateColorMap: 2048,
    fastUpdateSkin: 4096,
    fastUpdateEffects: 8192,
    fastUpdateLongEntity: 16384,

    soundVolume: 1,
    soundAttenuation: 2,
    soundLooping: 4,

    tempSpike: 0,
    tempSuperSpike: 1,
    tempGunShot: 2,
    tempExplosion: 3,
    tempTarExplosion: 4,
    tempLightning1: 5,
    tempLightning2: 6,
    tempWizSpike: 7,
    tempKnightSpike: 8,
    tempLightning3: 9,
    tempLavaSplash: 10,
    tempTeleport: 11,
    tempExplosion2: 12
};

module.exports = exports = Protocol;

}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/protocol.js","/")
},{"1YiZ5S":5,"buffer":2}],32:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){

var settings = {
    version: '0.1',
    mapNames: {
        start: 'Entrance',
        e1m1: 'Slipgate Complex',
        e1m2: 'Castle of the Damned',
        e1m3: 'The Necropolis',
        e1m4: 'The Grisly Grotto',
        e1m5: 'Gloom Keep',
        e1m6: 'The Door To Chthon',
        e1m7: 'The House of Chthon',
        e1m8: 'Ziggurat Vertigo'
    }
};

module.exports = exports = settings;
}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/settings.js","/")
},{"1YiZ5S":5,"buffer":2}],33:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var Sprites = require('gl/sprites');
var Font = require('gl/font');
var assets = require('assets');
var settings = require('settings');

var Console = function() {
   var fontTexture = assets.load('wad/CONCHARS', { width: 128, height: 128, alpha: true });
   var font = new Font(fontTexture, 8, 8);

   var backgroundTexture = assets.load('pak/gfx/conback.lmp');
   backgroundTexture.drawTo(function(p) {
      gl.enable(gl.BLEND);
      var version = 'WebGL ' + settings.version;
      font.drawString(gl.width * 0.7, gl.height * 0.93, version, 1);
      font.render(assets.shaders.texture2d, p);
   });
   var background = new Sprites(320, 200);
   background.textures.addSubTexture(backgroundTexture);
   background.textures.compile(assets.shaders.texture2d);

   this.font = font;
   this.background = background;
};

Console.prototype.print = function(msg) {
   this.font.drawString(40, 40, msg);
};

Console.prototype.draw = function(p) {

   this.background.clear();
   this.background.drawSprite(0, 0, -400, gl.width, gl.height, 1, 1, 1, 1.0);
   this.background.render(assets.shaders.color2d, p);

   gl.enable(gl.BLEND);
   this.font.render(assets.shaders.texture2d, p);
};

module.exports = exports = Console;
}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/ui/console.js","/ui")
},{"1YiZ5S":5,"assets":6,"buffer":2,"gl/font":16,"gl/sprites":20,"settings":32}],34:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var Sprites = require('gl/sprites');
var assets = require('assets');

var StatusBar = function() {
    this.sprites = new Sprites(512, 512, 64);

    this.background = this.loadPic('SBAR');
    this.numbers = [];
    this.redNumbers = [];
    for (var i = 0; i < 10; i++) {
        this.numbers.push(this.loadPic('NUM_' + i));
        this.redNumbers.push(this.loadPic('ANUM_' + i));
    }

    this.weapons = new Array(7);
    this.weapons[0] = this.loadWeapon('SHOTGUN');
    this.weapons[1] = this.loadWeapon('SSHOTGUN');
    this.weapons[2] = this.loadWeapon('NAILGUN');
    this.weapons[3] = this.loadWeapon('SNAILGUN');
    this.weapons[4] = this.loadWeapon('RLAUNCH');
    this.weapons[5] = this.loadWeapon('SRLAUNCH');
    this.weapons[6] = this.loadWeapon('LIGHTNG');

    this.faces = new Array(5);
    for (var i = 1; i <= 5; i++)
        this.faces[i - 1] = { normal: this.loadPic('FACE' + i), pain: this.loadPic('FACE_P' + i) };

    this.sprites.textures.compile(assets.shaders.texture2d);
};

StatusBar.prototype.loadPic = function(name) {
    var texture = assets.load('wad/' + name);
    return this.sprites.textures.addSubTexture(texture);
};

StatusBar.prototype.drawPic = function(index, x, y) {
    this.sprites.drawSprite(index, x, y, 0, 0, 1, 1, 1, 1);
};

StatusBar.prototype.loadWeapon = function (name) {
    var weapon = {};
    weapon.owned = this.loadPic('INV_' + name);
    weapon.active = this.loadPic('INV2_' + name);
    weapon.flashes = new Array(5);
    for (var i = 0; i < 5; i++)
        weapon.flashes[i] = this.loadPic('INVA' + (i + 1) + '_' + name);
    return weapon;
};

StatusBar.prototype.draw = function(p) {
    this.sprites.clear();

    var left = gl.width / 2 - 160;
    this.drawPic(this.background, left, gl.height - 28);
    for (var i = 0; i < 7; i++)
        this.drawPic(this.weapons[i].owned, left + i * 24, gl.height - 42);

    this.sprites.render(assets.shaders.color2d, p);
};

module.exports = exports = StatusBar;
}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/ui/statusbar.js","/ui")
},{"1YiZ5S":5,"assets":6,"buffer":2,"gl/sprites":20}],35:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var Utils = {};

Utils.getExtension = function(path) {
    var index = path.lastIndexOf('.');
    if (index === -1) return '';
    return path.substr(index + 1);
};

Utils.triangulate = function(points) {
    var result = [];
    points.pop();
    for (var i = 1; i < points.length - 2; i += 2) {
        result.push(points[i + 2]);
        result.push(points[i]);
        result.push(points[0]);
    }
    return result;
};

Utils.quakeIdentity = function(a) {
    a[0] = 0; a[4] = 1; a[8] = 0; a[12] = 0;
    a[1] = 0; a[5] = 0; a[9] = -1; a[13] = 0;
    a[2] = -1; a[6] = 0; a[10] = 0; a[14] = 0;
    a[3] = 0; a[7] = 0; a[11] = 0; a[15] = 1;
    return a;
};

Utils.deg2Rad = function(degrees) {
    return degrees * Math.PI / 180;
};

Utils.rad2Deg = function(degrees) {
    return degrees / Math.PI * 180;
};


Utils.isPowerOf2 = function(x) {
    return (x & (x - 1)) == 0;
};

Utils.nextPowerOf2 = function(x) {
    --x;
    for (var i = 1; i < 32; i <<= 1) {
        x = x | x >> i;
    }
    return x + 1;
};

Utils.array1d = function(width) {
    var result = new Array(width);
    for (var x = 0; x < width; x++) result[x] = 0;
    return result;
};

Utils.array2d = function(width, height) {
    var result = new Array(height);
    for (var y = 0; y < height; y++) {
        result[y] = new Array(width);
        for (var x = 0; x < width; x++)
            result[y][x] = 0;
    }
    return result;
};

module.exports = exports = Utils;


}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/utils.js","/")
},{"1YiZ5S":5,"buffer":2}],36:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var Map = require('map');
var Model = require('model');
var assets = require('assets');
var utils = require('utils');

var World = function() {
    this.models = ['dummy'];
    this.statics = [];
    this.entities = [];
    this.map = null;

    for (var i = 0; i < 1024; i++) {
        var entity = {
            time: 0,
            state: { angles: vec3.create(), origin: vec3.create() },
            priorState: { angles: vec3.create(), origin: vec3.create() },
            nextState: { angles: vec3.create(), origin: vec3.create() }
        };
        this.entities.push(entity);
    }
};

World.prototype.loadModel = function(name) {
    var type = utils.getExtension(name);
    switch (type) {
        case 'bsp':
            var model = new Map(assets.load('pak/' + name));
            this.models.push(model);
            if (!this.map) { this.map = model; }
            break;
        case 'mdl':
            this.models.push(new Model(assets.load('pak/' + name)));
            break;
        default:
            this.models.push(null);
            break;
    }
};

World.prototype.spawnStatic = function(baseline) {
    var entity = { state: baseline };
    this.statics.push(entity);
};

World.prototype.spawnEntity = function(id, baseline) {
    this.entities[id].state = baseline;
};

World.prototype.update = function(dt) {

    for (var e = 0; e < this.entities.length; e++) {
        var entity = this.entities[e];
        if (!entity) continue;

        for (var c = 0; c < 3; c++) {
            var dp = entity.nextState.origin[c] - entity.priorState.origin[c];
            entity.state.origin[c] = entity.priorState.origin[c] + dp * dt;

            var da = entity.nextState.angles[c] - entity.priorState.angles[c];
            if (da > 180) da -= 360;
            else if (da < -180) da += 360;
            entity.state.angles[c] = entity.priorState.angles[c] + da * dt;
        }
    }
};

World.prototype.draw = function(p, viewEntity) {
    var m = utils.quakeIdentity(mat4.create());
    var entity = this.entities[viewEntity];
    var origin = entity.state.origin;
    var angles = entity.state.angles;
    mat4.rotateY(m, m, utils.deg2Rad(-angles[0]));
    mat4.rotateZ(m, m, utils.deg2Rad(-angles[1]));
    mat4.translate(m, m, [-origin[0], -origin[1], -origin[2] - 22]);
    this.map.draw(p, m);

    this.drawStatics(p, m);
    this.drawEntities(p, m, viewEntity);
};

World.prototype.drawStatics = function(p, m) {
    var mm = mat4.create();
    for (var s = 0; s < this.statics.length; s++) {
        var state = this.statics[s].state;
        var model = this.models[state.modelIndex];
        mat4.translate(mm, m, state.origin);
        model.draw(p, mm, 0, 0);
    }
};

World.prototype.drawEntities = function(p, m, viewEntity) {
    var mm = mat4.create();
    for (var e = 0; e < this.entities.length; e++) {
        if (e === viewEntity)
            continue;

        var state = this.entities[e].state;
        var model = this.models[state.modelIndex];
        if (model) {
            mm = mat4.translate(mm, m, state.origin);
            mat4.rotateZ(mm, mm, utils.deg2Rad(state.angles[1]));
            model.draw(p, mm, 0, state.frame);
        }
    }
};

module.exports = exports = World;
}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/world.js","/")
},{"1YiZ5S":5,"assets":6,"buffer":2,"map":29,"model":30,"utils":35}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9lcmxhbmRyYW52aW5nZS9naXQvd2ViZ2wtcXVha2Uvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2VybGFuZHJhbnZpbmdlL2dpdC93ZWJnbC1xdWFrZS9qcy9mYWtlXzdlODVkNDg0LmpzIiwiL1VzZXJzL2VybGFuZHJhbnZpbmdlL2dpdC93ZWJnbC1xdWFrZS9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9idWZmZXIvaW5kZXguanMiLCIvVXNlcnMvZXJsYW5kcmFudmluZ2UvZ2l0L3dlYmdsLXF1YWtlL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2J1ZmZlci9ub2RlX21vZHVsZXMvYmFzZTY0LWpzL2xpYi9iNjQuanMiLCIvVXNlcnMvZXJsYW5kcmFudmluZ2UvZ2l0L3dlYmdsLXF1YWtlL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2J1ZmZlci9ub2RlX21vZHVsZXMvaWVlZTc1NC9pbmRleC5qcyIsIi9Vc2Vycy9lcmxhbmRyYW52aW5nZS9naXQvd2ViZ2wtcXVha2Uvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwianMvYXNzZXRzLmpzIiwianMvY2xpZW50LmpzIiwianMvZmlsZS5qcyIsImpzL2Zvcm1hdHMvYnNwLmpzIiwianMvZm9ybWF0cy9tZGwuanMiLCJqcy9mb3JtYXRzL3Bhay5qcyIsImpzL2Zvcm1hdHMvcGFsZXR0ZS5qcyIsImpzL2Zvcm1hdHMvd2FkLmpzIiwianMvZ2wvVGV4dHVyZS5qcyIsImpzL2dsL2F0bGFzLmpzIiwianMvZ2wvZm9udC5qcyIsImpzL2dsL2dsLmpzIiwianMvZ2wvbGlnaHRtYXAuanMiLCJqcy9nbC9zaGFkZXIuanMiLCJqcy9nbC9zcHJpdGVzLmpzIiwianMvZ2wvdGV4dHVyZS5qcyIsImpzL2lucHV0LmpzIiwianMvaW5zdGFsbGVyL2RpYWxvZy5qcyIsImpzL2luc3RhbGxlci9pbnN0YWxsZXIuanMiLCJqcy9saWIvZ2wtbWF0cml4LW1pbi5qcyIsImpzL2xpYi9saDQuanMiLCJqcy9saWIvemlwLmpzIiwianMvbGlnaHRtYXBzLmpzIiwianMvbWFwLmpzIiwianMvbW9kZWwuanMiLCJqcy9wcm90b2NvbC5qcyIsImpzL3NldHRpbmdzLmpzIiwianMvdWkvY29uc29sZS5qcyIsImpzL3VpL3N0YXR1c2Jhci5qcyIsImpzL3V0aWxzLmpzIiwianMvd29ybGQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdmxDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaFZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMS9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG5cbnZhciB3ZWJnbCA9IHJlcXVpcmUoJ2dsL2dsJyk7XG52YXIgYXNzZXRzID0gcmVxdWlyZSgnYXNzZXRzJyk7XG52YXIgaW5zdGFsbGVyID0gcmVxdWlyZSgnaW5zdGFsbGVyL2luc3RhbGxlcicpO1xudmFyIElucHV0ID0gcmVxdWlyZSgnaW5wdXQnKTtcbnZhciBDb25zb2xlID0gcmVxdWlyZSgndWkvY29uc29sZScpO1xudmFyIFN0YXR1c0JhciA9IHJlcXVpcmUoJ3VpL3N0YXR1c2JhcicpO1xudmFyIENsaWVudCA9IHJlcXVpcmUoJ2NsaWVudCcpO1xuXG5pZiAoIXdpbmRvdy5yZXF1ZXN0RnJhbWUpIHtcbiAgICB3aW5kb3cucmVxdWVzdEZyYW1lID0gKCBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICAgIHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICAgIHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICAgIHdpbmRvdy5vUmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICAgICB3aW5kb3cubXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KCBjYWxsYmFjaywgMTAwMCAvIDYwICk7XG4gICAgICAgICAgICB9O1xuICAgIH0pKCk7XG59XG5cblF1YWtlID0gZnVuY3Rpb24oKSB7fTtcblxudmFyIHRpY2sgPSBmdW5jdGlvbih0aW1lKSB7XG4gICAgLy9yZXF1ZXN0RnJhbWUodGljayk7XG5cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMjAwOyBpKyspXG4gICAgUXVha2UuaW5zdGFuY2UudGljayh0aW1lKTtcblxuXG59O1xuXG5RdWFrZS5wcm90b3R5cGUudGljayA9IGZ1bmN0aW9uKHRpbWUpIHtcblxuICAgIHRoaXMuY2xpZW50LnVwZGF0ZSh0aW1lKTtcbiAgICB0aGlzLmhhbmRsZUlucHV0KCk7XG5cbiAgICBnbC5jbGVhcihnbC5DT0xPUl9CVUZGRVJfQklUIHwgZ2wuREVQVEhfQlVGRkVSX0JJVCk7XG4gICAgZ2wuZW5hYmxlKGdsLkRFUFRIX1RFU1QpO1xuICAgIGdsLmRpc2FibGUoZ2wuQkxFTkQpO1xuXG4gICAgaWYgKHRoaXMuY2xpZW50LnZpZXdFbnRpdHkgPiAwKVxuICAgICAgICB0aGlzLmNsaWVudC53b3JsZC5kcmF3KHRoaXMucHJvamVjdGlvbiwgdGhpcy5jbGllbnQudmlld0VudGl0eSk7XG5cbiAgICBnbC5kaXNhYmxlKGdsLkRFUFRIX1RFU1QpO1xuICAgIGdsLmRpc2FibGUoZ2wuQ1VMTF9GQUNFKTtcbiAgICBnbC5lbmFibGUoZ2wuQkxFTkQpO1xuICAgIHRoaXMuc3RhdHVzQmFyLmRyYXcodGhpcy5vcnRobyk7XG59O1xuXG4vLyBUZW1wLiBjb250cm9sbGVyLlxuUXVha2UucHJvdG90eXBlLmhhbmRsZUlucHV0ID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuY2xpZW50LnZpZXdFbnRpdHkgPT09IC0xKVxuICAgICAgICByZXR1cm47XG5cbiAgICAvKlxuICAgIHZhciBhbmdsZSA9IHV0aWxzLmRlZzJSYWQodGhpcy5jbGllbnQudmlld0FuZ2xlc1sxXSk7XG4gICAgdmFyIHBvc2l0aW9uID0gdGhpcy5jbGllbnQuZW50aXRpZXNbdGhpcy5jbGllbnQudmlld0VudGl0eV0ubmV4dFN0YXRlLm9yaWdpbjtcbiAgICB2YXIgc3BlZWQgPSA1LjA7XG5cbiAgICBpZiAodGhpcy5pbnB1dC5sZWZ0KVxuICAgICAgICB0aGlzLmNsaWVudC52aWV3QW5nbGVzWzFdIC09IDI7XG4gICAgaWYgKHRoaXMuaW5wdXQucmlnaHQpXG4gICAgICAgIHRoaXMuY2xpZW50LnZpZXdBbmdsZXNbMV0gKz0gMjtcbiAgICBpZiAodGhpcy5pbnB1dC51cCkge1xuICAgICAgICB0aGlzLmNsaWVudC5kZW1vID0gbnVsbDtcbiAgICAgICAgcG9zaXRpb25bMF0gKz0gTWF0aC5jb3MoYW5nbGUpICogc3BlZWQ7XG4gICAgICAgIHBvc2l0aW9uWzFdIC09IE1hdGguc2luKGFuZ2xlKSAqIHNwZWVkO1xuICAgIH1cbiAgICBpZiAodGhpcy5pbnB1dC5kb3duKSB7XG4gICAgICAgIHBvc2l0aW9uWzBdIC09IE1hdGguY29zKGFuZ2xlKSAqIHNwZWVkO1xuICAgICAgICBwb3NpdGlvblsxXSArPSBNYXRoLnNpbihhbmdsZSkgKiBzcGVlZDtcbiAgICB9XG4gICAgaWYgKHRoaXMuaW5wdXQuZmx5VXApXG4gICAgICAgIHBvc2l0aW9uWzJdICs9IDEwO1xuICAgIGlmICh0aGlzLmlucHV0LmZseURvd24pXG4gICAgICAgIHBvc2l0aW9uWzJdIC09IDEwO1xuICAgICovXG59O1xuXG5RdWFrZS5wcm90b3R5cGUuaW5zdGFsbCA9IGZ1bmN0aW9uKGRvbmUpIHtcbiAgICBpbnN0YWxsZXIuc3RhcnQoZnVuY3Rpb24oKSB7XG5cbiAgICB9KTtcbn07XG5cblF1YWtlLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKCkge1xuXG5cbiAgICAvKlxuICAgIFF1YWtlLmluc3RhbmNlID0gdGhpcztcbiAgICB3ZWJnbC5pbml0KCdjYW52YXMnKTtcbiAgICB0aGlzLm9ydGhvID0gbWF0NC5vcnRobyhtYXQ0LmNyZWF0ZSgpLCAwLCBnbC53aWR0aCwgZ2wuaGVpZ2h0LCAwLCAtMTAsIDEwKTtcbiAgICB0aGlzLnByb2plY3Rpb24gPSBtYXQ0LnBlcnNwZWN0aXZlKG1hdDQuY3JlYXRlKCksIDY4LjAzLCBnbC53aWR0aCAvIGdsLmhlaWdodCwgMC4xLCA0MDk2KTtcblxuICAgIGFzc2V0cy5hZGQoJ2RhdGEvcGFrMC5wYWsnKTtcbiAgICBhc3NldHMuYWRkKCdzaGFkZXJzL2NvbG9yMmQuc2hhZGVyJyk7XG4gICAgYXNzZXRzLmFkZCgnc2hhZGVycy9tb2RlbC5zaGFkZXInKTtcbiAgICBhc3NldHMuYWRkKCdzaGFkZXJzL3RleHR1cmUyZC5zaGFkZXInKTtcbiAgICBhc3NldHMuYWRkKCdzaGFkZXJzL3dvcmxkLnNoYWRlcicpO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGFzc2V0cy5wcmVjYWNoZShmdW5jdGlvbigpIHtcbiAgICAgICAgc2VsZi5jb25zb2xlID0gbmV3IENvbnNvbGUoKTtcbiAgICAgICAgc2VsZi5zdGF0dXNCYXIgPSBuZXcgU3RhdHVzQmFyKCk7XG4gICAgICAgIHNlbGYuaW5wdXQgPSBuZXcgSW5wdXQoKTtcbiAgICAgICAgc2VsZi5jbGllbnQgPSBuZXcgQ2xpZW50KCk7XG4gICAgICAgIHNlbGYuY2xpZW50LnBsYXlEZW1vKCdkZW1vMi5kZW0nKTtcbiAgICAgICAgdGljaygpO1xuICAgIH0pOyAgKi9cbn07XG5cblxuXG5cblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIxWWlaNVNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9mYWtlXzdlODVkNDg0LmpzXCIsXCIvXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLyohXG4gKiBUaGUgYnVmZmVyIG1vZHVsZSBmcm9tIG5vZGUuanMsIGZvciB0aGUgYnJvd3Nlci5cbiAqXG4gKiBAYXV0aG9yICAgRmVyb3NzIEFib3VraGFkaWplaCA8ZmVyb3NzQGZlcm9zcy5vcmc+IDxodHRwOi8vZmVyb3NzLm9yZz5cbiAqIEBsaWNlbnNlICBNSVRcbiAqL1xuXG52YXIgYmFzZTY0ID0gcmVxdWlyZSgnYmFzZTY0LWpzJylcbnZhciBpZWVlNzU0ID0gcmVxdWlyZSgnaWVlZTc1NCcpXG5cbmV4cG9ydHMuQnVmZmVyID0gQnVmZmVyXG5leHBvcnRzLlNsb3dCdWZmZXIgPSBCdWZmZXJcbmV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVMgPSA1MFxuQnVmZmVyLnBvb2xTaXplID0gODE5MlxuXG4vKipcbiAqIElmIGBCdWZmZXIuX3VzZVR5cGVkQXJyYXlzYDpcbiAqICAgPT09IHRydWUgICAgVXNlIFVpbnQ4QXJyYXkgaW1wbGVtZW50YXRpb24gKGZhc3Rlc3QpXG4gKiAgID09PSBmYWxzZSAgIFVzZSBPYmplY3QgaW1wbGVtZW50YXRpb24gKGNvbXBhdGlibGUgZG93biB0byBJRTYpXG4gKi9cbkJ1ZmZlci5fdXNlVHlwZWRBcnJheXMgPSAoZnVuY3Rpb24gKCkge1xuICAvLyBEZXRlY3QgaWYgYnJvd3NlciBzdXBwb3J0cyBUeXBlZCBBcnJheXMuIFN1cHBvcnRlZCBicm93c2VycyBhcmUgSUUgMTArLCBGaXJlZm94IDQrLFxuICAvLyBDaHJvbWUgNyssIFNhZmFyaSA1LjErLCBPcGVyYSAxMS42KywgaU9TIDQuMisuIElmIHRoZSBicm93c2VyIGRvZXMgbm90IHN1cHBvcnQgYWRkaW5nXG4gIC8vIHByb3BlcnRpZXMgdG8gYFVpbnQ4QXJyYXlgIGluc3RhbmNlcywgdGhlbiB0aGF0J3MgdGhlIHNhbWUgYXMgbm8gYFVpbnQ4QXJyYXlgIHN1cHBvcnRcbiAgLy8gYmVjYXVzZSB3ZSBuZWVkIHRvIGJlIGFibGUgdG8gYWRkIGFsbCB0aGUgbm9kZSBCdWZmZXIgQVBJIG1ldGhvZHMuIFRoaXMgaXMgYW4gaXNzdWVcbiAgLy8gaW4gRmlyZWZveCA0LTI5LiBOb3cgZml4ZWQ6IGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTY5NTQzOFxuICB0cnkge1xuICAgIHZhciBidWYgPSBuZXcgQXJyYXlCdWZmZXIoMClcbiAgICB2YXIgYXJyID0gbmV3IFVpbnQ4QXJyYXkoYnVmKVxuICAgIGFyci5mb28gPSBmdW5jdGlvbiAoKSB7IHJldHVybiA0MiB9XG4gICAgcmV0dXJuIDQyID09PSBhcnIuZm9vKCkgJiZcbiAgICAgICAgdHlwZW9mIGFyci5zdWJhcnJheSA9PT0gJ2Z1bmN0aW9uJyAvLyBDaHJvbWUgOS0xMCBsYWNrIGBzdWJhcnJheWBcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG59KSgpXG5cbi8qKlxuICogQ2xhc3M6IEJ1ZmZlclxuICogPT09PT09PT09PT09PVxuICpcbiAqIFRoZSBCdWZmZXIgY29uc3RydWN0b3IgcmV0dXJucyBpbnN0YW5jZXMgb2YgYFVpbnQ4QXJyYXlgIHRoYXQgYXJlIGF1Z21lbnRlZFxuICogd2l0aCBmdW5jdGlvbiBwcm9wZXJ0aWVzIGZvciBhbGwgdGhlIG5vZGUgYEJ1ZmZlcmAgQVBJIGZ1bmN0aW9ucy4gV2UgdXNlXG4gKiBgVWludDhBcnJheWAgc28gdGhhdCBzcXVhcmUgYnJhY2tldCBub3RhdGlvbiB3b3JrcyBhcyBleHBlY3RlZCAtLSBpdCByZXR1cm5zXG4gKiBhIHNpbmdsZSBvY3RldC5cbiAqXG4gKiBCeSBhdWdtZW50aW5nIHRoZSBpbnN0YW5jZXMsIHdlIGNhbiBhdm9pZCBtb2RpZnlpbmcgdGhlIGBVaW50OEFycmF5YFxuICogcHJvdG90eXBlLlxuICovXG5mdW5jdGlvbiBCdWZmZXIgKHN1YmplY3QsIGVuY29kaW5nLCBub1plcm8pIHtcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIEJ1ZmZlcikpXG4gICAgcmV0dXJuIG5ldyBCdWZmZXIoc3ViamVjdCwgZW5jb2RpbmcsIG5vWmVybylcblxuICB2YXIgdHlwZSA9IHR5cGVvZiBzdWJqZWN0XG5cbiAgLy8gV29ya2Fyb3VuZDogbm9kZSdzIGJhc2U2NCBpbXBsZW1lbnRhdGlvbiBhbGxvd3MgZm9yIG5vbi1wYWRkZWQgc3RyaW5nc1xuICAvLyB3aGlsZSBiYXNlNjQtanMgZG9lcyBub3QuXG4gIGlmIChlbmNvZGluZyA9PT0gJ2Jhc2U2NCcgJiYgdHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICBzdWJqZWN0ID0gc3RyaW5ndHJpbShzdWJqZWN0KVxuICAgIHdoaWxlIChzdWJqZWN0Lmxlbmd0aCAlIDQgIT09IDApIHtcbiAgICAgIHN1YmplY3QgPSBzdWJqZWN0ICsgJz0nXG4gICAgfVxuICB9XG5cbiAgLy8gRmluZCB0aGUgbGVuZ3RoXG4gIHZhciBsZW5ndGhcbiAgaWYgKHR5cGUgPT09ICdudW1iZXInKVxuICAgIGxlbmd0aCA9IGNvZXJjZShzdWJqZWN0KVxuICBlbHNlIGlmICh0eXBlID09PSAnc3RyaW5nJylcbiAgICBsZW5ndGggPSBCdWZmZXIuYnl0ZUxlbmd0aChzdWJqZWN0LCBlbmNvZGluZylcbiAgZWxzZSBpZiAodHlwZSA9PT0gJ29iamVjdCcpXG4gICAgbGVuZ3RoID0gY29lcmNlKHN1YmplY3QubGVuZ3RoKSAvLyBhc3N1bWUgdGhhdCBvYmplY3QgaXMgYXJyYXktbGlrZVxuICBlbHNlXG4gICAgdGhyb3cgbmV3IEVycm9yKCdGaXJzdCBhcmd1bWVudCBuZWVkcyB0byBiZSBhIG51bWJlciwgYXJyYXkgb3Igc3RyaW5nLicpXG5cbiAgdmFyIGJ1ZlxuICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgIC8vIFByZWZlcnJlZDogUmV0dXJuIGFuIGF1Z21lbnRlZCBgVWludDhBcnJheWAgaW5zdGFuY2UgZm9yIGJlc3QgcGVyZm9ybWFuY2VcbiAgICBidWYgPSBCdWZmZXIuX2F1Z21lbnQobmV3IFVpbnQ4QXJyYXkobGVuZ3RoKSlcbiAgfSBlbHNlIHtcbiAgICAvLyBGYWxsYmFjazogUmV0dXJuIFRISVMgaW5zdGFuY2Ugb2YgQnVmZmVyIChjcmVhdGVkIGJ5IGBuZXdgKVxuICAgIGJ1ZiA9IHRoaXNcbiAgICBidWYubGVuZ3RoID0gbGVuZ3RoXG4gICAgYnVmLl9pc0J1ZmZlciA9IHRydWVcbiAgfVxuXG4gIHZhciBpXG4gIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzICYmIHR5cGVvZiBzdWJqZWN0LmJ5dGVMZW5ndGggPT09ICdudW1iZXInKSB7XG4gICAgLy8gU3BlZWQgb3B0aW1pemF0aW9uIC0tIHVzZSBzZXQgaWYgd2UncmUgY29weWluZyBmcm9tIGEgdHlwZWQgYXJyYXlcbiAgICBidWYuX3NldChzdWJqZWN0KVxuICB9IGVsc2UgaWYgKGlzQXJyYXlpc2goc3ViamVjdCkpIHtcbiAgICAvLyBUcmVhdCBhcnJheS1pc2ggb2JqZWN0cyBhcyBhIGJ5dGUgYXJyYXlcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChCdWZmZXIuaXNCdWZmZXIoc3ViamVjdCkpXG4gICAgICAgIGJ1ZltpXSA9IHN1YmplY3QucmVhZFVJbnQ4KGkpXG4gICAgICBlbHNlXG4gICAgICAgIGJ1ZltpXSA9IHN1YmplY3RbaV1cbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICBidWYud3JpdGUoc3ViamVjdCwgMCwgZW5jb2RpbmcpXG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ251bWJlcicgJiYgIUJ1ZmZlci5fdXNlVHlwZWRBcnJheXMgJiYgIW5vWmVybykge1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgYnVmW2ldID0gMFxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBidWZcbn1cblxuLy8gU1RBVElDIE1FVEhPRFNcbi8vID09PT09PT09PT09PT09XG5cbkJ1ZmZlci5pc0VuY29kaW5nID0gZnVuY3Rpb24gKGVuY29kaW5nKSB7XG4gIHN3aXRjaCAoU3RyaW5nKGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgY2FzZSAnYXNjaWknOlxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICBjYXNlICdyYXcnOlxuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5CdWZmZXIuaXNCdWZmZXIgPSBmdW5jdGlvbiAoYikge1xuICByZXR1cm4gISEoYiAhPT0gbnVsbCAmJiBiICE9PSB1bmRlZmluZWQgJiYgYi5faXNCdWZmZXIpXG59XG5cbkJ1ZmZlci5ieXRlTGVuZ3RoID0gZnVuY3Rpb24gKHN0ciwgZW5jb2RpbmcpIHtcbiAgdmFyIHJldFxuICBzdHIgPSBzdHIgKyAnJ1xuICBzd2l0Y2ggKGVuY29kaW5nIHx8ICd1dGY4Jykge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoIC8gMlxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgICByZXQgPSB1dGY4VG9CeXRlcyhzdHIpLmxlbmd0aFxuICAgICAgYnJlYWtcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICBjYXNlICdyYXcnOlxuICAgICAgcmV0ID0gc3RyLmxlbmd0aFxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgcmV0ID0gYmFzZTY0VG9CeXRlcyhzdHIpLmxlbmd0aFxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0ID0gc3RyLmxlbmd0aCAqIDJcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZycpXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5CdWZmZXIuY29uY2F0ID0gZnVuY3Rpb24gKGxpc3QsIHRvdGFsTGVuZ3RoKSB7XG4gIGFzc2VydChpc0FycmF5KGxpc3QpLCAnVXNhZ2U6IEJ1ZmZlci5jb25jYXQobGlzdCwgW3RvdGFsTGVuZ3RoXSlcXG4nICtcbiAgICAgICdsaXN0IHNob3VsZCBiZSBhbiBBcnJheS4nKVxuXG4gIGlmIChsaXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBuZXcgQnVmZmVyKDApXG4gIH0gZWxzZSBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICByZXR1cm4gbGlzdFswXVxuICB9XG5cbiAgdmFyIGlcbiAgaWYgKHR5cGVvZiB0b3RhbExlbmd0aCAhPT0gJ251bWJlcicpIHtcbiAgICB0b3RhbExlbmd0aCA9IDBcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgdG90YWxMZW5ndGggKz0gbGlzdFtpXS5sZW5ndGhcbiAgICB9XG4gIH1cblxuICB2YXIgYnVmID0gbmV3IEJ1ZmZlcih0b3RhbExlbmd0aClcbiAgdmFyIHBvcyA9IDBcbiAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaXRlbSA9IGxpc3RbaV1cbiAgICBpdGVtLmNvcHkoYnVmLCBwb3MpXG4gICAgcG9zICs9IGl0ZW0ubGVuZ3RoXG4gIH1cbiAgcmV0dXJuIGJ1ZlxufVxuXG4vLyBCVUZGRVIgSU5TVEFOQ0UgTUVUSE9EU1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT1cblxuZnVuY3Rpb24gX2hleFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgb2Zmc2V0ID0gTnVtYmVyKG9mZnNldCkgfHwgMFxuICB2YXIgcmVtYWluaW5nID0gYnVmLmxlbmd0aCAtIG9mZnNldFxuICBpZiAoIWxlbmd0aCkge1xuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICB9IGVsc2Uge1xuICAgIGxlbmd0aCA9IE51bWJlcihsZW5ndGgpXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xuICAgICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gICAgfVxuICB9XG5cbiAgLy8gbXVzdCBiZSBhbiBldmVuIG51bWJlciBvZiBkaWdpdHNcbiAgdmFyIHN0ckxlbiA9IHN0cmluZy5sZW5ndGhcbiAgYXNzZXJ0KHN0ckxlbiAlIDIgPT09IDAsICdJbnZhbGlkIGhleCBzdHJpbmcnKVxuXG4gIGlmIChsZW5ndGggPiBzdHJMZW4gLyAyKSB7XG4gICAgbGVuZ3RoID0gc3RyTGVuIC8gMlxuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgYnl0ZSA9IHBhcnNlSW50KHN0cmluZy5zdWJzdHIoaSAqIDIsIDIpLCAxNilcbiAgICBhc3NlcnQoIWlzTmFOKGJ5dGUpLCAnSW52YWxpZCBoZXggc3RyaW5nJylcbiAgICBidWZbb2Zmc2V0ICsgaV0gPSBieXRlXG4gIH1cbiAgQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPSBpICogMlxuICByZXR1cm4gaVxufVxuXG5mdW5jdGlvbiBfdXRmOFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cbiAgICBibGl0QnVmZmVyKHV0ZjhUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuZnVuY3Rpb24gX2FzY2lpV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIoYXNjaWlUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuZnVuY3Rpb24gX2JpbmFyeVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIF9hc2NpaVdyaXRlKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gX2Jhc2U2NFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cbiAgICBibGl0QnVmZmVyKGJhc2U2NFRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5mdW5jdGlvbiBfdXRmMTZsZVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cbiAgICBibGl0QnVmZmVyKHV0ZjE2bGVUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uIChzdHJpbmcsIG9mZnNldCwgbGVuZ3RoLCBlbmNvZGluZykge1xuICAvLyBTdXBwb3J0IGJvdGggKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgsIGVuY29kaW5nKVxuICAvLyBhbmQgdGhlIGxlZ2FjeSAoc3RyaW5nLCBlbmNvZGluZywgb2Zmc2V0LCBsZW5ndGgpXG4gIGlmIChpc0Zpbml0ZShvZmZzZXQpKSB7XG4gICAgaWYgKCFpc0Zpbml0ZShsZW5ndGgpKSB7XG4gICAgICBlbmNvZGluZyA9IGxlbmd0aFxuICAgICAgbGVuZ3RoID0gdW5kZWZpbmVkXG4gICAgfVxuICB9IGVsc2UgeyAgLy8gbGVnYWN5XG4gICAgdmFyIHN3YXAgPSBlbmNvZGluZ1xuICAgIGVuY29kaW5nID0gb2Zmc2V0XG4gICAgb2Zmc2V0ID0gbGVuZ3RoXG4gICAgbGVuZ3RoID0gc3dhcFxuICB9XG5cbiAgb2Zmc2V0ID0gTnVtYmVyKG9mZnNldCkgfHwgMFxuICB2YXIgcmVtYWluaW5nID0gdGhpcy5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKCFsZW5ndGgpIHtcbiAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgfSBlbHNlIHtcbiAgICBsZW5ndGggPSBOdW1iZXIobGVuZ3RoKVxuICAgIGlmIChsZW5ndGggPiByZW1haW5pbmcpIHtcbiAgICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICAgIH1cbiAgfVxuICBlbmNvZGluZyA9IFN0cmluZyhlbmNvZGluZyB8fCAndXRmOCcpLnRvTG93ZXJDYXNlKClcblxuICB2YXIgcmV0XG4gIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgICAgcmV0ID0gX2hleFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIHJldCA9IF91dGY4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYXNjaWknOlxuICAgICAgcmV0ID0gX2FzY2lpV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgIHJldCA9IF9iaW5hcnlXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgcmV0ID0gX2Jhc2U2NFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXQgPSBfdXRmMTZsZVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZW5jb2RpbmcnKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIChlbmNvZGluZywgc3RhcnQsIGVuZCkge1xuICB2YXIgc2VsZiA9IHRoaXNcblxuICBlbmNvZGluZyA9IFN0cmluZyhlbmNvZGluZyB8fCAndXRmOCcpLnRvTG93ZXJDYXNlKClcbiAgc3RhcnQgPSBOdW1iZXIoc3RhcnQpIHx8IDBcbiAgZW5kID0gKGVuZCAhPT0gdW5kZWZpbmVkKVxuICAgID8gTnVtYmVyKGVuZClcbiAgICA6IGVuZCA9IHNlbGYubGVuZ3RoXG5cbiAgLy8gRmFzdHBhdGggZW1wdHkgc3RyaW5nc1xuICBpZiAoZW5kID09PSBzdGFydClcbiAgICByZXR1cm4gJydcblxuICB2YXIgcmV0XG4gIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgICAgcmV0ID0gX2hleFNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIHJldCA9IF91dGY4U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYXNjaWknOlxuICAgICAgcmV0ID0gX2FzY2lpU2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgIHJldCA9IF9iaW5hcnlTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgcmV0ID0gX2Jhc2U2NFNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXQgPSBfdXRmMTZsZVNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZW5jb2RpbmcnKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ0J1ZmZlcicsXG4gICAgZGF0YTogQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwodGhpcy5fYXJyIHx8IHRoaXMsIDApXG4gIH1cbn1cblxuLy8gY29weSh0YXJnZXRCdWZmZXIsIHRhcmdldFN0YXJ0PTAsIHNvdXJjZVN0YXJ0PTAsIHNvdXJjZUVuZD1idWZmZXIubGVuZ3RoKVxuQnVmZmVyLnByb3RvdHlwZS5jb3B5ID0gZnVuY3Rpb24gKHRhcmdldCwgdGFyZ2V0X3N0YXJ0LCBzdGFydCwgZW5kKSB7XG4gIHZhciBzb3VyY2UgPSB0aGlzXG5cbiAgaWYgKCFzdGFydCkgc3RhcnQgPSAwXG4gIGlmICghZW5kICYmIGVuZCAhPT0gMCkgZW5kID0gdGhpcy5sZW5ndGhcbiAgaWYgKCF0YXJnZXRfc3RhcnQpIHRhcmdldF9zdGFydCA9IDBcblxuICAvLyBDb3B5IDAgYnl0ZXM7IHdlJ3JlIGRvbmVcbiAgaWYgKGVuZCA9PT0gc3RhcnQpIHJldHVyblxuICBpZiAodGFyZ2V0Lmxlbmd0aCA9PT0gMCB8fCBzb3VyY2UubGVuZ3RoID09PSAwKSByZXR1cm5cblxuICAvLyBGYXRhbCBlcnJvciBjb25kaXRpb25zXG4gIGFzc2VydChlbmQgPj0gc3RhcnQsICdzb3VyY2VFbmQgPCBzb3VyY2VTdGFydCcpXG4gIGFzc2VydCh0YXJnZXRfc3RhcnQgPj0gMCAmJiB0YXJnZXRfc3RhcnQgPCB0YXJnZXQubGVuZ3RoLFxuICAgICAgJ3RhcmdldFN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBhc3NlcnQoc3RhcnQgPj0gMCAmJiBzdGFydCA8IHNvdXJjZS5sZW5ndGgsICdzb3VyY2VTdGFydCBvdXQgb2YgYm91bmRzJylcbiAgYXNzZXJ0KGVuZCA+PSAwICYmIGVuZCA8PSBzb3VyY2UubGVuZ3RoLCAnc291cmNlRW5kIG91dCBvZiBib3VuZHMnKVxuXG4gIC8vIEFyZSB3ZSBvb2I/XG4gIGlmIChlbmQgPiB0aGlzLmxlbmd0aClcbiAgICBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAodGFyZ2V0Lmxlbmd0aCAtIHRhcmdldF9zdGFydCA8IGVuZCAtIHN0YXJ0KVxuICAgIGVuZCA9IHRhcmdldC5sZW5ndGggLSB0YXJnZXRfc3RhcnQgKyBzdGFydFxuXG4gIHZhciBsZW4gPSBlbmQgLSBzdGFydFxuXG4gIGlmIChsZW4gPCAxMDAgfHwgIUJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKVxuICAgICAgdGFyZ2V0W2kgKyB0YXJnZXRfc3RhcnRdID0gdGhpc1tpICsgc3RhcnRdXG4gIH0gZWxzZSB7XG4gICAgdGFyZ2V0Ll9zZXQodGhpcy5zdWJhcnJheShzdGFydCwgc3RhcnQgKyBsZW4pLCB0YXJnZXRfc3RhcnQpXG4gIH1cbn1cblxuZnVuY3Rpb24gX2Jhc2U2NFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgaWYgKHN0YXJ0ID09PSAwICYmIGVuZCA9PT0gYnVmLmxlbmd0aCkge1xuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYpXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1Zi5zbGljZShzdGFydCwgZW5kKSlcbiAgfVxufVxuXG5mdW5jdGlvbiBfdXRmOFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHJlcyA9ICcnXG4gIHZhciB0bXAgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICBpZiAoYnVmW2ldIDw9IDB4N0YpIHtcbiAgICAgIHJlcyArPSBkZWNvZGVVdGY4Q2hhcih0bXApICsgU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0pXG4gICAgICB0bXAgPSAnJ1xuICAgIH0gZWxzZSB7XG4gICAgICB0bXAgKz0gJyUnICsgYnVmW2ldLnRvU3RyaW5nKDE2KVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXMgKyBkZWNvZGVVdGY4Q2hhcih0bXApXG59XG5cbmZ1bmN0aW9uIF9hc2NpaVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHJldCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKylcbiAgICByZXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0pXG4gIHJldHVybiByZXRcbn1cblxuZnVuY3Rpb24gX2JpbmFyeVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgcmV0dXJuIF9hc2NpaVNsaWNlKGJ1Ziwgc3RhcnQsIGVuZClcbn1cblxuZnVuY3Rpb24gX2hleFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcblxuICBpZiAoIXN0YXJ0IHx8IHN0YXJ0IDwgMCkgc3RhcnQgPSAwXG4gIGlmICghZW5kIHx8IGVuZCA8IDAgfHwgZW5kID4gbGVuKSBlbmQgPSBsZW5cblxuICB2YXIgb3V0ID0gJydcbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICBvdXQgKz0gdG9IZXgoYnVmW2ldKVxuICB9XG4gIHJldHVybiBvdXRcbn1cblxuZnVuY3Rpb24gX3V0ZjE2bGVTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciBieXRlcyA9IGJ1Zi5zbGljZShzdGFydCwgZW5kKVxuICB2YXIgcmVzID0gJydcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkgKz0gMikge1xuICAgIHJlcyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGVzW2ldICsgYnl0ZXNbaSsxXSAqIDI1NilcbiAgfVxuICByZXR1cm4gcmVzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc2xpY2UgPSBmdW5jdGlvbiAoc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgc3RhcnQgPSBjbGFtcChzdGFydCwgbGVuLCAwKVxuICBlbmQgPSBjbGFtcChlbmQsIGxlbiwgbGVuKVxuXG4gIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XG4gICAgcmV0dXJuIEJ1ZmZlci5fYXVnbWVudCh0aGlzLnN1YmFycmF5KHN0YXJ0LCBlbmQpKVxuICB9IGVsc2Uge1xuICAgIHZhciBzbGljZUxlbiA9IGVuZCAtIHN0YXJ0XG4gICAgdmFyIG5ld0J1ZiA9IG5ldyBCdWZmZXIoc2xpY2VMZW4sIHVuZGVmaW5lZCwgdHJ1ZSlcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNsaWNlTGVuOyBpKyspIHtcbiAgICAgIG5ld0J1ZltpXSA9IHRoaXNbaSArIHN0YXJ0XVxuICAgIH1cbiAgICByZXR1cm4gbmV3QnVmXG4gIH1cbn1cblxuLy8gYGdldGAgd2lsbCBiZSByZW1vdmVkIGluIE5vZGUgMC4xMytcbkJ1ZmZlci5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKG9mZnNldCkge1xuICBjb25zb2xlLmxvZygnLmdldCgpIGlzIGRlcHJlY2F0ZWQuIEFjY2VzcyB1c2luZyBhcnJheSBpbmRleGVzIGluc3RlYWQuJylcbiAgcmV0dXJuIHRoaXMucmVhZFVJbnQ4KG9mZnNldClcbn1cblxuLy8gYHNldGAgd2lsbCBiZSByZW1vdmVkIGluIE5vZGUgMC4xMytcbkJ1ZmZlci5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKHYsIG9mZnNldCkge1xuICBjb25zb2xlLmxvZygnLnNldCgpIGlzIGRlcHJlY2F0ZWQuIEFjY2VzcyB1c2luZyBhcnJheSBpbmRleGVzIGluc3RlYWQuJylcbiAgcmV0dXJuIHRoaXMud3JpdGVVSW50OCh2LCBvZmZzZXQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQ4ID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aClcbiAgICByZXR1cm5cblxuICByZXR1cm4gdGhpc1tvZmZzZXRdXG59XG5cbmZ1bmN0aW9uIF9yZWFkVUludDE2IChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbFxuICBpZiAobGl0dGxlRW5kaWFuKSB7XG4gICAgdmFsID0gYnVmW29mZnNldF1cbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMV0gPDwgOFxuICB9IGVsc2Uge1xuICAgIHZhbCA9IGJ1ZltvZmZzZXRdIDw8IDhcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMV1cbiAgfVxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkVUludDE2KHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkVUludDE2KHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZFVJbnQzMiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIHZhciB2YWxcbiAgaWYgKGxpdHRsZUVuZGlhbikge1xuICAgIGlmIChvZmZzZXQgKyAyIDwgbGVuKVxuICAgICAgdmFsID0gYnVmW29mZnNldCArIDJdIDw8IDE2XG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDFdIDw8IDhcbiAgICB2YWwgfD0gYnVmW29mZnNldF1cbiAgICBpZiAob2Zmc2V0ICsgMyA8IGxlbilcbiAgICAgIHZhbCA9IHZhbCArIChidWZbb2Zmc2V0ICsgM10gPDwgMjQgPj4+IDApXG4gIH0gZWxzZSB7XG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXG4gICAgICB2YWwgPSBidWZbb2Zmc2V0ICsgMV0gPDwgMTZcbiAgICBpZiAob2Zmc2V0ICsgMiA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMl0gPDwgOFxuICAgIGlmIChvZmZzZXQgKyAzIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAzXVxuICAgIHZhbCA9IHZhbCArIChidWZbb2Zmc2V0XSA8PCAyNCA+Pj4gMClcbiAgfVxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkVUludDMyKHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkVUludDMyKHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQ4ID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsXG4gICAgICAgICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aClcbiAgICByZXR1cm5cblxuICB2YXIgbmVnID0gdGhpc1tvZmZzZXRdICYgMHg4MFxuICBpZiAobmVnKVxuICAgIHJldHVybiAoMHhmZiAtIHRoaXNbb2Zmc2V0XSArIDEpICogLTFcbiAgZWxzZVxuICAgIHJldHVybiB0aGlzW29mZnNldF1cbn1cblxuZnVuY3Rpb24gX3JlYWRJbnQxNiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIHZhciB2YWwgPSBfcmVhZFVJbnQxNihidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCB0cnVlKVxuICB2YXIgbmVnID0gdmFsICYgMHg4MDAwXG4gIGlmIChuZWcpXG4gICAgcmV0dXJuICgweGZmZmYgLSB2YWwgKyAxKSAqIC0xXG4gIGVsc2VcbiAgICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2TEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRJbnQxNih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkSW50MTYodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF9yZWFkSW50MzIgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsID0gX3JlYWRVSW50MzIoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgdHJ1ZSlcbiAgdmFyIG5lZyA9IHZhbCAmIDB4ODAwMDAwMDBcbiAgaWYgKG5lZylcbiAgICByZXR1cm4gKDB4ZmZmZmZmZmYgLSB2YWwgKyAxKSAqIC0xXG4gIGVsc2VcbiAgICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyTEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRJbnQzMih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkSW50MzIodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF9yZWFkRmxvYXQgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgcmV0dXJuIGllZWU3NTQucmVhZChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCAyMywgNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEZsb2F0KHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEZsb2F0QkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRGbG9hdCh0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWREb3VibGUgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCArIDcgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgcmV0dXJuIGllZWU3NTQucmVhZChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCA1MiwgOClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlTEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWREb3VibGUodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWREb3VibGUodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50OCA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ3RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZ1aW50KHZhbHVlLCAweGZmKVxuICB9XG5cbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aCkgcmV0dXJuXG5cbiAgdGhpc1tvZmZzZXRdID0gdmFsdWVcbn1cblxuZnVuY3Rpb24gX3dyaXRlVUludDE2IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAndHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnVpbnQodmFsdWUsIDB4ZmZmZilcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGZvciAodmFyIGkgPSAwLCBqID0gTWF0aC5taW4obGVuIC0gb2Zmc2V0LCAyKTsgaSA8IGo7IGkrKykge1xuICAgIGJ1ZltvZmZzZXQgKyBpXSA9XG4gICAgICAgICh2YWx1ZSAmICgweGZmIDw8ICg4ICogKGxpdHRsZUVuZGlhbiA/IGkgOiAxIC0gaSkpKSkgPj4+XG4gICAgICAgICAgICAobGl0dGxlRW5kaWFuID8gaSA6IDEgLSBpKSAqIDhcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2TEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2QkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlVUludDMyIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAndHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnVpbnQodmFsdWUsIDB4ZmZmZmZmZmYpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBmb3IgKHZhciBpID0gMCwgaiA9IE1hdGgubWluKGxlbiAtIG9mZnNldCwgNCk7IGkgPCBqOyBpKyspIHtcbiAgICBidWZbb2Zmc2V0ICsgaV0gPVxuICAgICAgICAodmFsdWUgPj4+IChsaXR0bGVFbmRpYW4gPyBpIDogMyAtIGkpICogOCkgJiAweGZmXG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQ4ID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnNpbnQodmFsdWUsIDB4N2YsIC0weDgwKVxuICB9XG5cbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aClcbiAgICByZXR1cm5cblxuICBpZiAodmFsdWUgPj0gMClcbiAgICB0aGlzLndyaXRlVUludDgodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpXG4gIGVsc2VcbiAgICB0aGlzLndyaXRlVUludDgoMHhmZiArIHZhbHVlICsgMSwgb2Zmc2V0LCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlSW50MTYgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmc2ludCh2YWx1ZSwgMHg3ZmZmLCAtMHg4MDAwKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgaWYgKHZhbHVlID49IDApXG4gICAgX3dyaXRlVUludDE2KGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbiAgZWxzZVxuICAgIF93cml0ZVVJbnQxNihidWYsIDB4ZmZmZiArIHZhbHVlICsgMSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2QkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVJbnQzMiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZzaW50KHZhbHVlLCAweDdmZmZmZmZmLCAtMHg4MDAwMDAwMClcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGlmICh2YWx1ZSA+PSAwKVxuICAgIF93cml0ZVVJbnQzMihidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXG4gIGVsc2VcbiAgICBfd3JpdGVVSW50MzIoYnVmLCAweGZmZmZmZmZmICsgdmFsdWUgKyAxLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZUZsb2F0IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZklFRUU3NTQodmFsdWUsIDMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgsIC0zLjQwMjgyMzQ2NjM4NTI4ODZlKzM4KVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgMjMsIDQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdExFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZURvdWJsZSAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyA3IDwgYnVmLmxlbmd0aCxcbiAgICAgICAgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZJRUVFNzU0KHZhbHVlLCAxLjc5NzY5MzEzNDg2MjMxNTdFKzMwOCwgLTEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4KVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgNTIsIDgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG4vLyBmaWxsKHZhbHVlLCBzdGFydD0wLCBlbmQ9YnVmZmVyLmxlbmd0aClcbkJ1ZmZlci5wcm90b3R5cGUuZmlsbCA9IGZ1bmN0aW9uICh2YWx1ZSwgc3RhcnQsIGVuZCkge1xuICBpZiAoIXZhbHVlKSB2YWx1ZSA9IDBcbiAgaWYgKCFzdGFydCkgc3RhcnQgPSAwXG4gIGlmICghZW5kKSBlbmQgPSB0aGlzLmxlbmd0aFxuXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgdmFsdWUgPSB2YWx1ZS5jaGFyQ29kZUF0KDApXG4gIH1cblxuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJiAhaXNOYU4odmFsdWUpLCAndmFsdWUgaXMgbm90IGEgbnVtYmVyJylcbiAgYXNzZXJ0KGVuZCA+PSBzdGFydCwgJ2VuZCA8IHN0YXJ0JylcblxuICAvLyBGaWxsIDAgYnl0ZXM7IHdlJ3JlIGRvbmVcbiAgaWYgKGVuZCA9PT0gc3RhcnQpIHJldHVyblxuICBpZiAodGhpcy5sZW5ndGggPT09IDApIHJldHVyblxuXG4gIGFzc2VydChzdGFydCA+PSAwICYmIHN0YXJ0IDwgdGhpcy5sZW5ndGgsICdzdGFydCBvdXQgb2YgYm91bmRzJylcbiAgYXNzZXJ0KGVuZCA+PSAwICYmIGVuZCA8PSB0aGlzLmxlbmd0aCwgJ2VuZCBvdXQgb2YgYm91bmRzJylcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIHRoaXNbaV0gPSB2YWx1ZVxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuaW5zcGVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG91dCA9IFtdXG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgb3V0W2ldID0gdG9IZXgodGhpc1tpXSlcbiAgICBpZiAoaSA9PT0gZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFUykge1xuICAgICAgb3V0W2kgKyAxXSA9ICcuLi4nXG4gICAgICBicmVha1xuICAgIH1cbiAgfVxuICByZXR1cm4gJzxCdWZmZXIgJyArIG91dC5qb2luKCcgJykgKyAnPidcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGBBcnJheUJ1ZmZlcmAgd2l0aCB0aGUgKmNvcGllZCogbWVtb3J5IG9mIHRoZSBidWZmZXIgaW5zdGFuY2UuXG4gKiBBZGRlZCBpbiBOb2RlIDAuMTIuIE9ubHkgYXZhaWxhYmxlIGluIGJyb3dzZXJzIHRoYXQgc3VwcG9ydCBBcnJheUJ1ZmZlci5cbiAqL1xuQnVmZmVyLnByb3RvdHlwZS50b0FycmF5QnVmZmVyID0gZnVuY3Rpb24gKCkge1xuICBpZiAodHlwZW9mIFVpbnQ4QXJyYXkgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcbiAgICAgIHJldHVybiAobmV3IEJ1ZmZlcih0aGlzKSkuYnVmZmVyXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBidWYgPSBuZXcgVWludDhBcnJheSh0aGlzLmxlbmd0aClcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBidWYubGVuZ3RoOyBpIDwgbGVuOyBpICs9IDEpXG4gICAgICAgIGJ1ZltpXSA9IHRoaXNbaV1cbiAgICAgIHJldHVybiBidWYuYnVmZmVyXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcignQnVmZmVyLnRvQXJyYXlCdWZmZXIgbm90IHN1cHBvcnRlZCBpbiB0aGlzIGJyb3dzZXInKVxuICB9XG59XG5cbi8vIEhFTFBFUiBGVU5DVElPTlNcbi8vID09PT09PT09PT09PT09PT1cblxuZnVuY3Rpb24gc3RyaW5ndHJpbSAoc3RyKSB7XG4gIGlmIChzdHIudHJpbSkgcmV0dXJuIHN0ci50cmltKClcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJylcbn1cblxudmFyIEJQID0gQnVmZmVyLnByb3RvdHlwZVxuXG4vKipcbiAqIEF1Z21lbnQgYSBVaW50OEFycmF5ICppbnN0YW5jZSogKG5vdCB0aGUgVWludDhBcnJheSBjbGFzcyEpIHdpdGggQnVmZmVyIG1ldGhvZHNcbiAqL1xuQnVmZmVyLl9hdWdtZW50ID0gZnVuY3Rpb24gKGFycikge1xuICBhcnIuX2lzQnVmZmVyID0gdHJ1ZVxuXG4gIC8vIHNhdmUgcmVmZXJlbmNlIHRvIG9yaWdpbmFsIFVpbnQ4QXJyYXkgZ2V0L3NldCBtZXRob2RzIGJlZm9yZSBvdmVyd3JpdGluZ1xuICBhcnIuX2dldCA9IGFyci5nZXRcbiAgYXJyLl9zZXQgPSBhcnIuc2V0XG5cbiAgLy8gZGVwcmVjYXRlZCwgd2lsbCBiZSByZW1vdmVkIGluIG5vZGUgMC4xMytcbiAgYXJyLmdldCA9IEJQLmdldFxuICBhcnIuc2V0ID0gQlAuc2V0XG5cbiAgYXJyLndyaXRlID0gQlAud3JpdGVcbiAgYXJyLnRvU3RyaW5nID0gQlAudG9TdHJpbmdcbiAgYXJyLnRvTG9jYWxlU3RyaW5nID0gQlAudG9TdHJpbmdcbiAgYXJyLnRvSlNPTiA9IEJQLnRvSlNPTlxuICBhcnIuY29weSA9IEJQLmNvcHlcbiAgYXJyLnNsaWNlID0gQlAuc2xpY2VcbiAgYXJyLnJlYWRVSW50OCA9IEJQLnJlYWRVSW50OFxuICBhcnIucmVhZFVJbnQxNkxFID0gQlAucmVhZFVJbnQxNkxFXG4gIGFyci5yZWFkVUludDE2QkUgPSBCUC5yZWFkVUludDE2QkVcbiAgYXJyLnJlYWRVSW50MzJMRSA9IEJQLnJlYWRVSW50MzJMRVxuICBhcnIucmVhZFVJbnQzMkJFID0gQlAucmVhZFVJbnQzMkJFXG4gIGFyci5yZWFkSW50OCA9IEJQLnJlYWRJbnQ4XG4gIGFyci5yZWFkSW50MTZMRSA9IEJQLnJlYWRJbnQxNkxFXG4gIGFyci5yZWFkSW50MTZCRSA9IEJQLnJlYWRJbnQxNkJFXG4gIGFyci5yZWFkSW50MzJMRSA9IEJQLnJlYWRJbnQzMkxFXG4gIGFyci5yZWFkSW50MzJCRSA9IEJQLnJlYWRJbnQzMkJFXG4gIGFyci5yZWFkRmxvYXRMRSA9IEJQLnJlYWRGbG9hdExFXG4gIGFyci5yZWFkRmxvYXRCRSA9IEJQLnJlYWRGbG9hdEJFXG4gIGFyci5yZWFkRG91YmxlTEUgPSBCUC5yZWFkRG91YmxlTEVcbiAgYXJyLnJlYWREb3VibGVCRSA9IEJQLnJlYWREb3VibGVCRVxuICBhcnIud3JpdGVVSW50OCA9IEJQLndyaXRlVUludDhcbiAgYXJyLndyaXRlVUludDE2TEUgPSBCUC53cml0ZVVJbnQxNkxFXG4gIGFyci53cml0ZVVJbnQxNkJFID0gQlAud3JpdGVVSW50MTZCRVxuICBhcnIud3JpdGVVSW50MzJMRSA9IEJQLndyaXRlVUludDMyTEVcbiAgYXJyLndyaXRlVUludDMyQkUgPSBCUC53cml0ZVVJbnQzMkJFXG4gIGFyci53cml0ZUludDggPSBCUC53cml0ZUludDhcbiAgYXJyLndyaXRlSW50MTZMRSA9IEJQLndyaXRlSW50MTZMRVxuICBhcnIud3JpdGVJbnQxNkJFID0gQlAud3JpdGVJbnQxNkJFXG4gIGFyci53cml0ZUludDMyTEUgPSBCUC53cml0ZUludDMyTEVcbiAgYXJyLndyaXRlSW50MzJCRSA9IEJQLndyaXRlSW50MzJCRVxuICBhcnIud3JpdGVGbG9hdExFID0gQlAud3JpdGVGbG9hdExFXG4gIGFyci53cml0ZUZsb2F0QkUgPSBCUC53cml0ZUZsb2F0QkVcbiAgYXJyLndyaXRlRG91YmxlTEUgPSBCUC53cml0ZURvdWJsZUxFXG4gIGFyci53cml0ZURvdWJsZUJFID0gQlAud3JpdGVEb3VibGVCRVxuICBhcnIuZmlsbCA9IEJQLmZpbGxcbiAgYXJyLmluc3BlY3QgPSBCUC5pbnNwZWN0XG4gIGFyci50b0FycmF5QnVmZmVyID0gQlAudG9BcnJheUJ1ZmZlclxuXG4gIHJldHVybiBhcnJcbn1cblxuLy8gc2xpY2Uoc3RhcnQsIGVuZClcbmZ1bmN0aW9uIGNsYW1wIChpbmRleCwgbGVuLCBkZWZhdWx0VmFsdWUpIHtcbiAgaWYgKHR5cGVvZiBpbmRleCAhPT0gJ251bWJlcicpIHJldHVybiBkZWZhdWx0VmFsdWVcbiAgaW5kZXggPSB+fmluZGV4OyAgLy8gQ29lcmNlIHRvIGludGVnZXIuXG4gIGlmIChpbmRleCA+PSBsZW4pIHJldHVybiBsZW5cbiAgaWYgKGluZGV4ID49IDApIHJldHVybiBpbmRleFxuICBpbmRleCArPSBsZW5cbiAgaWYgKGluZGV4ID49IDApIHJldHVybiBpbmRleFxuICByZXR1cm4gMFxufVxuXG5mdW5jdGlvbiBjb2VyY2UgKGxlbmd0aCkge1xuICAvLyBDb2VyY2UgbGVuZ3RoIHRvIGEgbnVtYmVyIChwb3NzaWJseSBOYU4pLCByb3VuZCB1cFxuICAvLyBpbiBjYXNlIGl0J3MgZnJhY3Rpb25hbCAoZS5nLiAxMjMuNDU2KSB0aGVuIGRvIGFcbiAgLy8gZG91YmxlIG5lZ2F0ZSB0byBjb2VyY2UgYSBOYU4gdG8gMC4gRWFzeSwgcmlnaHQ/XG4gIGxlbmd0aCA9IH5+TWF0aC5jZWlsKCtsZW5ndGgpXG4gIHJldHVybiBsZW5ndGggPCAwID8gMCA6IGxlbmd0aFxufVxuXG5mdW5jdGlvbiBpc0FycmF5IChzdWJqZWN0KSB7XG4gIHJldHVybiAoQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAoc3ViamVjdCkge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoc3ViamVjdCkgPT09ICdbb2JqZWN0IEFycmF5XSdcbiAgfSkoc3ViamVjdClcbn1cblxuZnVuY3Rpb24gaXNBcnJheWlzaCAoc3ViamVjdCkge1xuICByZXR1cm4gaXNBcnJheShzdWJqZWN0KSB8fCBCdWZmZXIuaXNCdWZmZXIoc3ViamVjdCkgfHxcbiAgICAgIHN1YmplY3QgJiYgdHlwZW9mIHN1YmplY3QgPT09ICdvYmplY3QnICYmXG4gICAgICB0eXBlb2Ygc3ViamVjdC5sZW5ndGggPT09ICdudW1iZXInXG59XG5cbmZ1bmN0aW9uIHRvSGV4IChuKSB7XG4gIGlmIChuIDwgMTYpIHJldHVybiAnMCcgKyBuLnRvU3RyaW5nKDE2KVxuICByZXR1cm4gbi50b1N0cmluZygxNilcbn1cblxuZnVuY3Rpb24gdXRmOFRvQnl0ZXMgKHN0cikge1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgYiA9IHN0ci5jaGFyQ29kZUF0KGkpXG4gICAgaWYgKGIgPD0gMHg3RilcbiAgICAgIGJ5dGVBcnJheS5wdXNoKHN0ci5jaGFyQ29kZUF0KGkpKVxuICAgIGVsc2Uge1xuICAgICAgdmFyIHN0YXJ0ID0gaVxuICAgICAgaWYgKGIgPj0gMHhEODAwICYmIGIgPD0gMHhERkZGKSBpKytcbiAgICAgIHZhciBoID0gZW5jb2RlVVJJQ29tcG9uZW50KHN0ci5zbGljZShzdGFydCwgaSsxKSkuc3Vic3RyKDEpLnNwbGl0KCclJylcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgaC5sZW5ndGg7IGorKylcbiAgICAgICAgYnl0ZUFycmF5LnB1c2gocGFyc2VJbnQoaFtqXSwgMTYpKVxuICAgIH1cbiAgfVxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIGFzY2lpVG9CeXRlcyAoc3RyKSB7XG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgIC8vIE5vZGUncyBjb2RlIHNlZW1zIHRvIGJlIGRvaW5nIHRoaXMgYW5kIG5vdCAmIDB4N0YuLlxuICAgIGJ5dGVBcnJheS5wdXNoKHN0ci5jaGFyQ29kZUF0KGkpICYgMHhGRilcbiAgfVxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIHV0ZjE2bGVUb0J5dGVzIChzdHIpIHtcbiAgdmFyIGMsIGhpLCBsb1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICBjID0gc3RyLmNoYXJDb2RlQXQoaSlcbiAgICBoaSA9IGMgPj4gOFxuICAgIGxvID0gYyAlIDI1NlxuICAgIGJ5dGVBcnJheS5wdXNoKGxvKVxuICAgIGJ5dGVBcnJheS5wdXNoKGhpKVxuICB9XG5cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiBiYXNlNjRUb0J5dGVzIChzdHIpIHtcbiAgcmV0dXJuIGJhc2U2NC50b0J5dGVBcnJheShzdHIpXG59XG5cbmZ1bmN0aW9uIGJsaXRCdWZmZXIgKHNyYywgZHN0LCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgcG9zXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoKGkgKyBvZmZzZXQgPj0gZHN0Lmxlbmd0aCkgfHwgKGkgPj0gc3JjLmxlbmd0aCkpXG4gICAgICBicmVha1xuICAgIGRzdFtpICsgb2Zmc2V0XSA9IHNyY1tpXVxuICB9XG4gIHJldHVybiBpXG59XG5cbmZ1bmN0aW9uIGRlY29kZVV0ZjhDaGFyIChzdHIpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHN0cilcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoMHhGRkZEKSAvLyBVVEYgOCBpbnZhbGlkIGNoYXJcbiAgfVxufVxuXG4vKlxuICogV2UgaGF2ZSB0byBtYWtlIHN1cmUgdGhhdCB0aGUgdmFsdWUgaXMgYSB2YWxpZCBpbnRlZ2VyLiBUaGlzIG1lYW5zIHRoYXQgaXRcbiAqIGlzIG5vbi1uZWdhdGl2ZS4gSXQgaGFzIG5vIGZyYWN0aW9uYWwgY29tcG9uZW50IGFuZCB0aGF0IGl0IGRvZXMgbm90XG4gKiBleGNlZWQgdGhlIG1heGltdW0gYWxsb3dlZCB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gdmVyaWZ1aW50ICh2YWx1ZSwgbWF4KSB7XG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLCAnY2Fubm90IHdyaXRlIGEgbm9uLW51bWJlciBhcyBhIG51bWJlcicpXG4gIGFzc2VydCh2YWx1ZSA+PSAwLCAnc3BlY2lmaWVkIGEgbmVnYXRpdmUgdmFsdWUgZm9yIHdyaXRpbmcgYW4gdW5zaWduZWQgdmFsdWUnKVxuICBhc3NlcnQodmFsdWUgPD0gbWF4LCAndmFsdWUgaXMgbGFyZ2VyIHRoYW4gbWF4aW11bSB2YWx1ZSBmb3IgdHlwZScpXG4gIGFzc2VydChNYXRoLmZsb29yKHZhbHVlKSA9PT0gdmFsdWUsICd2YWx1ZSBoYXMgYSBmcmFjdGlvbmFsIGNvbXBvbmVudCcpXG59XG5cbmZ1bmN0aW9uIHZlcmlmc2ludCAodmFsdWUsIG1heCwgbWluKSB7XG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLCAnY2Fubm90IHdyaXRlIGEgbm9uLW51bWJlciBhcyBhIG51bWJlcicpXG4gIGFzc2VydCh2YWx1ZSA8PSBtYXgsICd2YWx1ZSBsYXJnZXIgdGhhbiBtYXhpbXVtIGFsbG93ZWQgdmFsdWUnKVxuICBhc3NlcnQodmFsdWUgPj0gbWluLCAndmFsdWUgc21hbGxlciB0aGFuIG1pbmltdW0gYWxsb3dlZCB2YWx1ZScpXG4gIGFzc2VydChNYXRoLmZsb29yKHZhbHVlKSA9PT0gdmFsdWUsICd2YWx1ZSBoYXMgYSBmcmFjdGlvbmFsIGNvbXBvbmVudCcpXG59XG5cbmZ1bmN0aW9uIHZlcmlmSUVFRTc1NCAodmFsdWUsIG1heCwgbWluKSB7XG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLCAnY2Fubm90IHdyaXRlIGEgbm9uLW51bWJlciBhcyBhIG51bWJlcicpXG4gIGFzc2VydCh2YWx1ZSA8PSBtYXgsICd2YWx1ZSBsYXJnZXIgdGhhbiBtYXhpbXVtIGFsbG93ZWQgdmFsdWUnKVxuICBhc3NlcnQodmFsdWUgPj0gbWluLCAndmFsdWUgc21hbGxlciB0aGFuIG1pbmltdW0gYWxsb3dlZCB2YWx1ZScpXG59XG5cbmZ1bmN0aW9uIGFzc2VydCAodGVzdCwgbWVzc2FnZSkge1xuICBpZiAoIXRlc3QpIHRocm93IG5ldyBFcnJvcihtZXNzYWdlIHx8ICdGYWlsZWQgYXNzZXJ0aW9uJylcbn1cblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIxWWlaNVNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLi9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9idWZmZXIvaW5kZXguanNcIixcIi8uLi9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9idWZmZXJcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgbG9va3VwID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky8nO1xuXG47KGZ1bmN0aW9uIChleHBvcnRzKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuICB2YXIgQXJyID0gKHR5cGVvZiBVaW50OEFycmF5ICE9PSAndW5kZWZpbmVkJylcbiAgICA/IFVpbnQ4QXJyYXlcbiAgICA6IEFycmF5XG5cblx0dmFyIFBMVVMgICA9ICcrJy5jaGFyQ29kZUF0KDApXG5cdHZhciBTTEFTSCAgPSAnLycuY2hhckNvZGVBdCgwKVxuXHR2YXIgTlVNQkVSID0gJzAnLmNoYXJDb2RlQXQoMClcblx0dmFyIExPV0VSICA9ICdhJy5jaGFyQ29kZUF0KDApXG5cdHZhciBVUFBFUiAgPSAnQScuY2hhckNvZGVBdCgwKVxuXHR2YXIgUExVU19VUkxfU0FGRSA9ICctJy5jaGFyQ29kZUF0KDApXG5cdHZhciBTTEFTSF9VUkxfU0FGRSA9ICdfJy5jaGFyQ29kZUF0KDApXG5cblx0ZnVuY3Rpb24gZGVjb2RlIChlbHQpIHtcblx0XHR2YXIgY29kZSA9IGVsdC5jaGFyQ29kZUF0KDApXG5cdFx0aWYgKGNvZGUgPT09IFBMVVMgfHxcblx0XHQgICAgY29kZSA9PT0gUExVU19VUkxfU0FGRSlcblx0XHRcdHJldHVybiA2MiAvLyAnKydcblx0XHRpZiAoY29kZSA9PT0gU0xBU0ggfHxcblx0XHQgICAgY29kZSA9PT0gU0xBU0hfVVJMX1NBRkUpXG5cdFx0XHRyZXR1cm4gNjMgLy8gJy8nXG5cdFx0aWYgKGNvZGUgPCBOVU1CRVIpXG5cdFx0XHRyZXR1cm4gLTEgLy9ubyBtYXRjaFxuXHRcdGlmIChjb2RlIDwgTlVNQkVSICsgMTApXG5cdFx0XHRyZXR1cm4gY29kZSAtIE5VTUJFUiArIDI2ICsgMjZcblx0XHRpZiAoY29kZSA8IFVQUEVSICsgMjYpXG5cdFx0XHRyZXR1cm4gY29kZSAtIFVQUEVSXG5cdFx0aWYgKGNvZGUgPCBMT1dFUiArIDI2KVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBMT1dFUiArIDI2XG5cdH1cblxuXHRmdW5jdGlvbiBiNjRUb0J5dGVBcnJheSAoYjY0KSB7XG5cdFx0dmFyIGksIGosIGwsIHRtcCwgcGxhY2VIb2xkZXJzLCBhcnJcblxuXHRcdGlmIChiNjQubGVuZ3RoICUgNCA+IDApIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignSW52YWxpZCBzdHJpbmcuIExlbmd0aCBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgNCcpXG5cdFx0fVxuXG5cdFx0Ly8gdGhlIG51bWJlciBvZiBlcXVhbCBzaWducyAocGxhY2UgaG9sZGVycylcblx0XHQvLyBpZiB0aGVyZSBhcmUgdHdvIHBsYWNlaG9sZGVycywgdGhhbiB0aGUgdHdvIGNoYXJhY3RlcnMgYmVmb3JlIGl0XG5cdFx0Ly8gcmVwcmVzZW50IG9uZSBieXRlXG5cdFx0Ly8gaWYgdGhlcmUgaXMgb25seSBvbmUsIHRoZW4gdGhlIHRocmVlIGNoYXJhY3RlcnMgYmVmb3JlIGl0IHJlcHJlc2VudCAyIGJ5dGVzXG5cdFx0Ly8gdGhpcyBpcyBqdXN0IGEgY2hlYXAgaGFjayB0byBub3QgZG8gaW5kZXhPZiB0d2ljZVxuXHRcdHZhciBsZW4gPSBiNjQubGVuZ3RoXG5cdFx0cGxhY2VIb2xkZXJzID0gJz0nID09PSBiNjQuY2hhckF0KGxlbiAtIDIpID8gMiA6ICc9JyA9PT0gYjY0LmNoYXJBdChsZW4gLSAxKSA/IDEgOiAwXG5cblx0XHQvLyBiYXNlNjQgaXMgNC8zICsgdXAgdG8gdHdvIGNoYXJhY3RlcnMgb2YgdGhlIG9yaWdpbmFsIGRhdGFcblx0XHRhcnIgPSBuZXcgQXJyKGI2NC5sZW5ndGggKiAzIC8gNCAtIHBsYWNlSG9sZGVycylcblxuXHRcdC8vIGlmIHRoZXJlIGFyZSBwbGFjZWhvbGRlcnMsIG9ubHkgZ2V0IHVwIHRvIHRoZSBsYXN0IGNvbXBsZXRlIDQgY2hhcnNcblx0XHRsID0gcGxhY2VIb2xkZXJzID4gMCA/IGI2NC5sZW5ndGggLSA0IDogYjY0Lmxlbmd0aFxuXG5cdFx0dmFyIEwgPSAwXG5cblx0XHRmdW5jdGlvbiBwdXNoICh2KSB7XG5cdFx0XHRhcnJbTCsrXSA9IHZcblx0XHR9XG5cblx0XHRmb3IgKGkgPSAwLCBqID0gMDsgaSA8IGw7IGkgKz0gNCwgaiArPSAzKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDE4KSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMSkpIDw8IDEyKSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMikpIDw8IDYpIHwgZGVjb2RlKGI2NC5jaGFyQXQoaSArIDMpKVxuXHRcdFx0cHVzaCgodG1wICYgMHhGRjAwMDApID4+IDE2KVxuXHRcdFx0cHVzaCgodG1wICYgMHhGRjAwKSA+PiA4KVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH1cblxuXHRcdGlmIChwbGFjZUhvbGRlcnMgPT09IDIpIHtcblx0XHRcdHRtcCA9IChkZWNvZGUoYjY0LmNoYXJBdChpKSkgPDwgMikgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA+PiA0KVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH0gZWxzZSBpZiAocGxhY2VIb2xkZXJzID09PSAxKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDEwKSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMSkpIDw8IDQpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAyKSkgPj4gMilcblx0XHRcdHB1c2goKHRtcCA+PiA4KSAmIDB4RkYpXG5cdFx0XHRwdXNoKHRtcCAmIDB4RkYpXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGFyclxuXHR9XG5cblx0ZnVuY3Rpb24gdWludDhUb0Jhc2U2NCAodWludDgpIHtcblx0XHR2YXIgaSxcblx0XHRcdGV4dHJhQnl0ZXMgPSB1aW50OC5sZW5ndGggJSAzLCAvLyBpZiB3ZSBoYXZlIDEgYnl0ZSBsZWZ0LCBwYWQgMiBieXRlc1xuXHRcdFx0b3V0cHV0ID0gXCJcIixcblx0XHRcdHRlbXAsIGxlbmd0aFxuXG5cdFx0ZnVuY3Rpb24gZW5jb2RlIChudW0pIHtcblx0XHRcdHJldHVybiBsb29rdXAuY2hhckF0KG51bSlcblx0XHR9XG5cblx0XHRmdW5jdGlvbiB0cmlwbGV0VG9CYXNlNjQgKG51bSkge1xuXHRcdFx0cmV0dXJuIGVuY29kZShudW0gPj4gMTggJiAweDNGKSArIGVuY29kZShudW0gPj4gMTIgJiAweDNGKSArIGVuY29kZShudW0gPj4gNiAmIDB4M0YpICsgZW5jb2RlKG51bSAmIDB4M0YpXG5cdFx0fVxuXG5cdFx0Ly8gZ28gdGhyb3VnaCB0aGUgYXJyYXkgZXZlcnkgdGhyZWUgYnl0ZXMsIHdlJ2xsIGRlYWwgd2l0aCB0cmFpbGluZyBzdHVmZiBsYXRlclxuXHRcdGZvciAoaSA9IDAsIGxlbmd0aCA9IHVpbnQ4Lmxlbmd0aCAtIGV4dHJhQnl0ZXM7IGkgPCBsZW5ndGg7IGkgKz0gMykge1xuXHRcdFx0dGVtcCA9ICh1aW50OFtpXSA8PCAxNikgKyAodWludDhbaSArIDFdIDw8IDgpICsgKHVpbnQ4W2kgKyAyXSlcblx0XHRcdG91dHB1dCArPSB0cmlwbGV0VG9CYXNlNjQodGVtcClcblx0XHR9XG5cblx0XHQvLyBwYWQgdGhlIGVuZCB3aXRoIHplcm9zLCBidXQgbWFrZSBzdXJlIHRvIG5vdCBmb3JnZXQgdGhlIGV4dHJhIGJ5dGVzXG5cdFx0c3dpdGNoIChleHRyYUJ5dGVzKSB7XG5cdFx0XHRjYXNlIDE6XG5cdFx0XHRcdHRlbXAgPSB1aW50OFt1aW50OC5sZW5ndGggLSAxXVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKHRlbXAgPj4gMilcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSgodGVtcCA8PCA0KSAmIDB4M0YpXG5cdFx0XHRcdG91dHB1dCArPSAnPT0nXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIDI6XG5cdFx0XHRcdHRlbXAgPSAodWludDhbdWludDgubGVuZ3RoIC0gMl0gPDwgOCkgKyAodWludDhbdWludDgubGVuZ3RoIC0gMV0pXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUodGVtcCA+PiAxMClcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSgodGVtcCA+PiA0KSAmIDB4M0YpXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPDwgMikgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gJz0nXG5cdFx0XHRcdGJyZWFrXG5cdFx0fVxuXG5cdFx0cmV0dXJuIG91dHB1dFxuXHR9XG5cblx0ZXhwb3J0cy50b0J5dGVBcnJheSA9IGI2NFRvQnl0ZUFycmF5XG5cdGV4cG9ydHMuZnJvbUJ5dGVBcnJheSA9IHVpbnQ4VG9CYXNlNjRcbn0odHlwZW9mIGV4cG9ydHMgPT09ICd1bmRlZmluZWQnID8gKHRoaXMuYmFzZTY0anMgPSB7fSkgOiBleHBvcnRzKSlcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIxWWlaNVNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLi9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9idWZmZXIvbm9kZV9tb2R1bGVzL2Jhc2U2NC1qcy9saWIvYjY0LmpzXCIsXCIvLi4vbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnVmZmVyL25vZGVfbW9kdWxlcy9iYXNlNjQtanMvbGliXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuZXhwb3J0cy5yZWFkID0gZnVuY3Rpb24gKGJ1ZmZlciwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG0sXG4gICAgICBlTGVuID0gbkJ5dGVzICogOCAtIG1MZW4gLSAxLFxuICAgICAgZU1heCA9ICgxIDw8IGVMZW4pIC0gMSxcbiAgICAgIGVCaWFzID0gZU1heCA+PiAxLFxuICAgICAgbkJpdHMgPSAtNyxcbiAgICAgIGkgPSBpc0xFID8gKG5CeXRlcyAtIDEpIDogMCxcbiAgICAgIGQgPSBpc0xFID8gLTEgOiAxLFxuICAgICAgcyA9IGJ1ZmZlcltvZmZzZXQgKyBpXVxuXG4gIGkgKz0gZFxuXG4gIGUgPSBzICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpXG4gIHMgPj49ICgtbkJpdHMpXG4gIG5CaXRzICs9IGVMZW5cbiAgZm9yICg7IG5CaXRzID4gMDsgZSA9IGUgKiAyNTYgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCkge31cblxuICBtID0gZSAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKVxuICBlID4+PSAoLW5CaXRzKVxuICBuQml0cyArPSBtTGVuXG4gIGZvciAoOyBuQml0cyA+IDA7IG0gPSBtICogMjU2ICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpIHt9XG5cbiAgaWYgKGUgPT09IDApIHtcbiAgICBlID0gMSAtIGVCaWFzXG4gIH0gZWxzZSBpZiAoZSA9PT0gZU1heCkge1xuICAgIHJldHVybiBtID8gTmFOIDogKChzID8gLTEgOiAxKSAqIEluZmluaXR5KVxuICB9IGVsc2Uge1xuICAgIG0gPSBtICsgTWF0aC5wb3coMiwgbUxlbilcbiAgICBlID0gZSAtIGVCaWFzXG4gIH1cbiAgcmV0dXJuIChzID8gLTEgOiAxKSAqIG0gKiBNYXRoLnBvdygyLCBlIC0gbUxlbilcbn1cblxuZXhwb3J0cy53cml0ZSA9IGZ1bmN0aW9uIChidWZmZXIsIHZhbHVlLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbSwgYyxcbiAgICAgIGVMZW4gPSBuQnl0ZXMgKiA4IC0gbUxlbiAtIDEsXG4gICAgICBlTWF4ID0gKDEgPDwgZUxlbikgLSAxLFxuICAgICAgZUJpYXMgPSBlTWF4ID4+IDEsXG4gICAgICBydCA9IChtTGVuID09PSAyMyA/IE1hdGgucG93KDIsIC0yNCkgLSBNYXRoLnBvdygyLCAtNzcpIDogMCksXG4gICAgICBpID0gaXNMRSA/IDAgOiAobkJ5dGVzIC0gMSksXG4gICAgICBkID0gaXNMRSA/IDEgOiAtMSxcbiAgICAgIHMgPSB2YWx1ZSA8IDAgfHwgKHZhbHVlID09PSAwICYmIDEgLyB2YWx1ZSA8IDApID8gMSA6IDBcblxuICB2YWx1ZSA9IE1hdGguYWJzKHZhbHVlKVxuXG4gIGlmIChpc05hTih2YWx1ZSkgfHwgdmFsdWUgPT09IEluZmluaXR5KSB7XG4gICAgbSA9IGlzTmFOKHZhbHVlKSA/IDEgOiAwXG4gICAgZSA9IGVNYXhcbiAgfSBlbHNlIHtcbiAgICBlID0gTWF0aC5mbG9vcihNYXRoLmxvZyh2YWx1ZSkgLyBNYXRoLkxOMilcbiAgICBpZiAodmFsdWUgKiAoYyA9IE1hdGgucG93KDIsIC1lKSkgPCAxKSB7XG4gICAgICBlLS1cbiAgICAgIGMgKj0gMlxuICAgIH1cbiAgICBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIHZhbHVlICs9IHJ0IC8gY1xuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZSArPSBydCAqIE1hdGgucG93KDIsIDEgLSBlQmlhcylcbiAgICB9XG4gICAgaWYgKHZhbHVlICogYyA+PSAyKSB7XG4gICAgICBlKytcbiAgICAgIGMgLz0gMlxuICAgIH1cblxuICAgIGlmIChlICsgZUJpYXMgPj0gZU1heCkge1xuICAgICAgbSA9IDBcbiAgICAgIGUgPSBlTWF4XG4gICAgfSBlbHNlIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgbSA9ICh2YWx1ZSAqIGMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pXG4gICAgICBlID0gZSArIGVCaWFzXG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSB2YWx1ZSAqIE1hdGgucG93KDIsIGVCaWFzIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKVxuICAgICAgZSA9IDBcbiAgICB9XG4gIH1cblxuICBmb3IgKDsgbUxlbiA+PSA4OyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBtICYgMHhmZiwgaSArPSBkLCBtIC89IDI1NiwgbUxlbiAtPSA4KSB7fVxuXG4gIGUgPSAoZSA8PCBtTGVuKSB8IG1cbiAgZUxlbiArPSBtTGVuXG4gIGZvciAoOyBlTGVuID4gMDsgYnVmZmVyW29mZnNldCArIGldID0gZSAmIDB4ZmYsIGkgKz0gZCwgZSAvPSAyNTYsIGVMZW4gLT0gOCkge31cblxuICBidWZmZXJbb2Zmc2V0ICsgaSAtIGRdIHw9IHMgKiAxMjhcbn1cblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIxWWlaNVNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLi9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9idWZmZXIvbm9kZV9tb2R1bGVzL2llZWU3NTQvaW5kZXguanNcIixcIi8uLi9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9idWZmZXIvbm9kZV9tb2R1bGVzL2llZWU3NTRcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4vLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5wcm9jZXNzLm5leHRUaWNrID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2FuU2V0SW1tZWRpYXRlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuc2V0SW1tZWRpYXRlO1xuICAgIHZhciBjYW5Qb3N0ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cucG9zdE1lc3NhZ2UgJiYgd2luZG93LmFkZEV2ZW50TGlzdGVuZXJcbiAgICA7XG5cbiAgICBpZiAoY2FuU2V0SW1tZWRpYXRlKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoZikgeyByZXR1cm4gd2luZG93LnNldEltbWVkaWF0ZShmKSB9O1xuICAgIH1cblxuICAgIGlmIChjYW5Qb3N0KSB7XG4gICAgICAgIHZhciBxdWV1ZSA9IFtdO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgdmFyIHNvdXJjZSA9IGV2LnNvdXJjZTtcbiAgICAgICAgICAgIGlmICgoc291cmNlID09PSB3aW5kb3cgfHwgc291cmNlID09PSBudWxsKSAmJiBldi5kYXRhID09PSAncHJvY2Vzcy10aWNrJykge1xuICAgICAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGlmIChxdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmbiA9IHF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0cnVlKTtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgICAgIHF1ZXVlLnB1c2goZm4pO1xuICAgICAgICAgICAgd2luZG93LnBvc3RNZXNzYWdlKCdwcm9jZXNzLXRpY2snLCAnKicpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICBzZXRUaW1lb3V0KGZuLCAwKTtcbiAgICB9O1xufSkoKTtcblxucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIxWWlaNVNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLi9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanNcIixcIi8uLi9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9wcm9jZXNzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIFNoYWRlciA9IHJlcXVpcmUoJ2dsL3NoYWRlcicpO1xudmFyIFRleHR1cmUgPSByZXF1aXJlKCdnbC90ZXh0dXJlJyk7XG52YXIgUGFrID0gcmVxdWlyZSgnZm9ybWF0cy9wYWsnKTtcbnZhciBXYWQgPSByZXF1aXJlKCdmb3JtYXRzL3dhZCcpO1xudmFyIFBhbGV0dGUgPSByZXF1aXJlKCdmb3JtYXRzL3BhbGV0dGUnKTtcbnZhciBCc3AgPSByZXF1aXJlKCdmb3JtYXRzL2JzcCcpO1xudmFyIE1kbCA9IHJlcXVpcmUoJ2Zvcm1hdHMvbWRsJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCd1dGlscycpO1xuXG5mdW5jdGlvbiBnZXROYW1lKHBhdGgpIHtcbiAgICB2YXIgaW5kZXgxID0gcGF0aC5sYXN0SW5kZXhPZignLycpO1xuICAgIHZhciBpbmRleDIgPSBwYXRoLmxhc3RJbmRleE9mKCcuJyk7XG4gICAgcmV0dXJuIHBhdGguc3Vic3RyKGluZGV4MSArIDEsIGluZGV4MiAtIGluZGV4MSAtIDEpO1xufVxuXG5mdW5jdGlvbiBkb3dubG9hZChpdGVtLCBkb25lKSB7XG4gICAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICByZXF1ZXN0Lm9wZW4oJ0dFVCcsIGl0ZW0udXJsLCB0cnVlKTtcbiAgICByZXF1ZXN0Lm92ZXJyaWRlTWltZVR5cGUoJ3RleHQvcGxhaW47IGNoYXJzZXQ9eC11c2VyLWRlZmluZWQnKTtcbiAgICBpZiAoaXRlbS5iaW5hcnkpXG4gICAgICAgIHJlcXVlc3QucmVzcG9uc2VUeXBlID0gJ2FycmF5YnVmZmVyJztcbiAgICByZXF1ZXN0Lm9ubG9hZCA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmIChyZXF1ZXN0LnN0YXR1cyAhPT0gMjAwKVxuICAgICAgICAgICAgdGhyb3cgJ1VuYWJsZSB0byByZWFkIGZpbGUgZnJvbSB1cmw6ICcgKyBpdGVtLm5hbWU7XG5cbiAgICAgICAgdmFyIGRhdGEgPSBpdGVtLmJpbmFyeSA/XG4gICAgICAgICAgICBuZXcgVWludDhBcnJheShyZXF1ZXN0LnJlc3BvbnNlKSA6IHJlcXVlc3QucmVzcG9uc2VUZXh0O1xuICAgICAgICBkb25lKGl0ZW0sIGRhdGEpO1xuICAgIH07XG5cbiAgICByZXF1ZXN0Lm9uZXJyb3IgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICB0aHJvdyAnVW5hYmxlIHRvIHJlYWQgZmlsZSBmcm9tIHVybDogJyArIHJlcXVlc3Quc3RhdHVzVGV4dDtcbiAgICB9O1xuICAgIHJlcXVlc3Quc2VuZChudWxsKTtcbn1cblxudmFyIEFzc2V0cyA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucGVuZGluZyA9IFtdO1xuICAgIHRoaXMuc2hhZGVycyA9IHt9O1xufTtcblxuQXNzZXRzLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbih1cmwsIHR5cGUpIHtcbiAgICB0eXBlID0gdHlwZSB8fCB1dGlscy5nZXRFeHRlbnNpb24odXJsKTtcbiAgICBpZiAoIXR5cGUpXG4gICAgICAgIHRocm93ICdFcnJvcjogVW5hYmxlIHRvIGRldGVybWluZSB0eXBlIGZvciBhc3NldDogJyArIG5hbWU7XG4gICAgdmFyIGJpbmFyeSA9IHR5cGUgIT09ICdzaGFkZXInO1xuICAgIHRoaXMucGVuZGluZy5wdXNoKHsgdXJsOiB1cmwsIG5hbWU6IGdldE5hbWUodXJsKSwgdHlwZTogdHlwZSwgYmluYXJ5OiBiaW5hcnkgfSk7XG59O1xuXG5Bc3NldHMucHJvdG90eXBlLmluc2VydCA9IGZ1bmN0aW9uKGl0ZW0sIGRhdGEpIHtcbiAgICBzd2l0Y2ggKGl0ZW0udHlwZSkge1xuICAgICAgICBjYXNlICdwYWsnOlxuICAgICAgICAgICAgdGhpcy5wYWsgPSBuZXcgUGFrKGRhdGEpO1xuICAgICAgICAgICAgdGhpcy53YWQgPSBuZXcgV2FkKHRoaXMucGFrLmxvYWQoJ2dmeC53YWQnKSk7XG4gICAgICAgICAgICB0aGlzLnBhbGV0dGUgPSBuZXcgUGFsZXR0ZSh0aGlzLnBhay5sb2FkKCdnZngvcGFsZXR0ZS5sbXAnKSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnc2hhZGVyJzpcbiAgICAgICAgICAgIHRoaXMuc2hhZGVyc1tpdGVtLm5hbWVdID0gbmV3IFNoYWRlcihkYXRhKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OiB0aHJvdyAnRXJyb3I6IFVua25vd24gdHlwZSBsb2FkZWQ6ICcgKyBpdGVtLnR5cGU7XG4gICAgfVxufTtcblxuQXNzZXRzLnByb3RvdHlwZS5sb2FkID0gZnVuY3Rpb24obmFtZSwgb3B0aW9ucykge1xuXG4gICAgdmFyIGluZGV4ID0gbmFtZS5pbmRleE9mKCcvJyk7XG4gICAgdmFyIGxvY2F0aW9uID0gbmFtZS5zdWJzdHIoMCwgaW5kZXgpO1xuICAgIHZhciB0eXBlID0gdXRpbHMuZ2V0RXh0ZW5zaW9uKG5hbWUpIHx8ICd0ZXh0dXJlJztcbiAgICB2YXIgbmFtZSA9IG5hbWUuc3Vic3RyKGluZGV4ICsgMSk7XG4gICAgdmFyIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgIGNhc2UgJ2JzcCc6XG4gICAgICAgICAgICByZXR1cm4gbmV3IEJzcCh0aGlzLnBhay5sb2FkKG5hbWUpKTtcbiAgICAgICAgY2FzZSAnbWRsJzpcbiAgICAgICAgICAgIHJldHVybiBuZXcgTWRsKG5hbWUsIHRoaXMucGFrLmxvYWQobmFtZSkpO1xuICAgIH1cblxuICAgIG9wdGlvbnMucGFsZXR0ZSA9IHRoaXMucGFsZXR0ZTtcbiAgICBzd2l0Y2gobG9jYXRpb24pIHtcbiAgICAgICAgY2FzZSAncGFrJzpcbiAgICAgICAgICAgIHZhciBkYXRhID0gdGhpcy5wYWsubG9hZChuYW1lKTtcbiAgICAgICAgICAgIHJldHVybiBuZXcgVGV4dHVyZShkYXRhLCBvcHRpb25zKTtcbiAgICAgICAgY2FzZSAnd2FkJzpcbiAgICAgICAgICAgIHZhciBkYXRhID0gdGhpcy53YWQuZ2V0KG5hbWUpO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBUZXh0dXJlKGRhdGEsIG9wdGlvbnMpO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgJ0Vycm9yOiBDYW5ub3QgbG9hZCBmaWxlcyBvdXRzaWRlIFBBSy9XQUQ6ICcgKyBuYW1lO1xuICAgIH1cbn07XG5cbkFzc2V0cy5wcm90b3R5cGUucHJlY2FjaGUgPSBmdW5jdGlvbihkb25lKSB7XG4gICAgdmFyIHRvdGFsID0gdGhpcy5wZW5kaW5nLmxlbmd0aDtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgZm9yICh2YXIgaSBpbiB0aGlzLnBlbmRpbmcpIHtcbiAgICAgICAgdmFyIHBlbmRpbmcgPSB0aGlzLnBlbmRpbmdbaV07XG4gICAgICAgIGRvd25sb2FkKHBlbmRpbmcsIGZ1bmN0aW9uKGl0ZW0sIGRhdGEpIHtcbiAgICAgICAgICAgIHNlbGYuaW5zZXJ0KGl0ZW0sIGRhdGEpO1xuICAgICAgICAgICAgaWYgKC0tdG90YWwgPD0gMCkge1xuICAgICAgICAgICAgICAgIHNlbGYucGVuZGluZyA9IFtdO1xuICAgICAgICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IG5ldyBBc3NldHMoKTtcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiMVlpWjVTXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvYXNzZXRzLmpzXCIsXCIvXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIGFzc2V0cyA9IHJlcXVpcmUoJ2Fzc2V0cycpO1xudmFyIFByb3RvY29sID0gcmVxdWlyZSgncHJvdG9jb2wnKTtcbnZhciBXb3JsZCA9IHJlcXVpcmUoJ3dvcmxkJyk7XG5cbnZhciBDbGllbnQgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnZpZXdFbnRpdHkgPSAtMTtcbiAgICB0aGlzLnRpbWUgPSB7IG9sZFNlcnZlclRpbWU6IDAsIHNlcnZlclRpbWU6IDAsIG9sZENsaWVudFRpbWU6IDAsIGNsaWVudFRpbWU6IDAgfTtcbiAgICB0aGlzLndvcmxkID0gbmV3IFdvcmxkKCk7XG59O1xuXG5DbGllbnQucHJvdG90eXBlLnBsYXlEZW1vID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBkZW1vID0gYXNzZXRzLnBhay5sb2FkKG5hbWUpO1xuICAgIHdoaWxlIChkZW1vLnJlYWRVSW50OCgpICE9PSAxMCk7XG4gICAgdGhpcy5kZW1vID0gZGVtbztcbn07XG5cbkNsaWVudC5wcm90b3R5cGUucmVhZEZyb21TZXJ2ZXIgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZGVtbyA9IHRoaXMuZGVtbztcbiAgICBpZiAoIWRlbW8gfHwgZGVtby5lb2YoKSkgcmV0dXJuO1xuXG4gICAgdmFyIG1lc3NhZ2VTaXplID0gZGVtby5yZWFkSW50MzIoKTtcblxuICAgIHZhciBhbmdsZXMgPSBbZGVtby5yZWFkRmxvYXQoKSwgZGVtby5yZWFkRmxvYXQoKSwgZGVtby5yZWFkRmxvYXQoKV07XG4gICAgaWYgKHRoaXMudmlld0VudGl0eSAhPT0gLTEpIHtcbiAgICAgICAgLy92YXIgZW50aXR5ID0gdGhpcy5lbnRpdGllc1t0aGlzLnZpZXdFbnRpdHldO1xuICAgICAgICAvL3ZlYzMuc2V0KGVudGl0eS5zdGF0ZS5hbmdsZXMsIGFuZ2xlc1swXSwgYW5nbGVzWzFdLCBhbmdsZXNbMV0pO1xuICAgIH1cblxuICAgIHZhciBtc2cgPSBkZW1vLnJlYWQobWVzc2FnZVNpemUpO1xuICAgIHZhciBjbWQgPSAwO1xuICAgIHdoaWxlIChjbWQgIT09IC0xICYmICFtc2cuZW9mKCkpIHtcbiAgICAgICAgY21kID0gbXNnLnJlYWRVSW50OCgpO1xuICAgICAgICBpZiAoY21kICYgMTI4KSB7XG4gICAgICAgICAgICB0aGlzLnBhcnNlRmFzdFVwZGF0ZShjbWQgJiAxMjcsIG1zZyk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN3aXRjaCAoY21kKSB7XG4gICAgICAgICAgICBjYXNlIFByb3RvY29sLnNlcnZlckRpc2Nvbm5lY3Q6XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0RJU0NPTk5FQ1QhJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5kZW1vID0gbnVsbDtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBjYXNlIFByb3RvY29sLnNlcnZlclVwZGF0ZVN0YXQ6XG4gICAgICAgICAgICAgICAgdmFyIHN0YXQgPSBtc2cucmVhZFVJbnQ4KCk7XG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gbXNnLnJlYWRJbnQzMigpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQcm90b2NvbC5zZXJ2ZXJTZXRWaWV3OlxuICAgICAgICAgICAgICAgIHRoaXMudmlld0VudGl0eSA9IG1zZy5yZWFkSW50MTYoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgUHJvdG9jb2wuc2VydmVyVGltZTpcbiAgICAgICAgICAgICAgICB0aGlzLnRpbWUub2xkU2VydmVyVGltZSA9IHRoaXMudGltZS5zZXJ2ZXJUaW1lO1xuICAgICAgICAgICAgICAgIHRoaXMudGltZS5zZXJ2ZXJUaW1lID0gbXNnLnJlYWRGbG9hdCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQcm90b2NvbC5zZXJ2ZXJTZXRBbmdsZTpcbiAgICAgICAgICAgICAgICB2YXIgeCA9IG1zZy5yZWFkSW50OCgpICogMS40MDYyNTtcbiAgICAgICAgICAgICAgICB2YXIgeSA9IG1zZy5yZWFkSW50OCgpICogMS40MDYyNTtcbiAgICAgICAgICAgICAgICB2YXIgeiA9IG1zZy5yZWFkSW50OCgpICogMS40MDYyNTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgUHJvdG9jb2wuc2VydmVyU291bmQ6XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJzZVNvdW5kKG1zZyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFByb3RvY29sLnNlcnZlclByaW50OlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKG1zZy5yZWFkQ1N0cmluZygpKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgUHJvdG9jb2wuc2VydmVyTGlnaHRTdHlsZTpcbiAgICAgICAgICAgICAgICB2YXIgc3R5bGUgPSBtc2cucmVhZFVJbnQ4KCk7XG4gICAgICAgICAgICAgICAgdmFyIHBhdHRlcm4gPSBtc2cucmVhZENTdHJpbmcoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgUHJvdG9jb2wuc2VydmVyQ2xpZW50RGF0YTpcbiAgICAgICAgICAgICAgICB0aGlzLnBhcnNlQ2xpZW50RGF0YShtc2cpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQcm90b2NvbC5zZXJ2ZXJVcGRhdGVOYW1lOlxuICAgICAgICAgICAgICAgIHZhciBjbGllbnQgPSBtc2cucmVhZFVJbnQ4KCk7XG4gICAgICAgICAgICAgICAgdmFyIG5hbWUgPSBtc2cucmVhZENTdHJpbmcoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgUHJvdG9jb2wuc2VydmVyVXBkYXRlRnJhZ3M6XG4gICAgICAgICAgICAgICAgdmFyIGNsaWVudCA9IG1zZy5yZWFkVUludDgoKTtcbiAgICAgICAgICAgICAgICB2YXIgZnJhZ3MgPSBtc2cucmVhZEludDE2KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFByb3RvY29sLnNlcnZlclVwZGF0ZUNvbG9yczpcbiAgICAgICAgICAgICAgICB2YXIgY2xpZW50ID0gbXNnLnJlYWRVSW50OCgpO1xuICAgICAgICAgICAgICAgIHZhciBjb2xvcnMgPSBtc2cucmVhZFVJbnQ4KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFByb3RvY29sLnNlcnZlclBhcnRpY2xlOlxuICAgICAgICAgICAgICAgIHRoaXMucGFyc2VQYXJ0aWNsZShtc2cpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQcm90b2NvbC5zZXJ2ZXJTdHVmZlRleHQ6XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cobXNnLnJlYWRDU3RyaW5nKCkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQcm90b2NvbC5zZXJ2ZXJUZW1wRW50aXR5OlxuICAgICAgICAgICAgICAgIHRoaXMucGFyc2VUZW1wRW50aXR5KG1zZyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFByb3RvY29sLnNlcnZlckluZm86XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJzZVNlcnZlckluZm8obXNnKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgUHJvdG9jb2wuc2VydmVyU2lnbm9uTnVtOlxuICAgICAgICAgICAgICAgIG1zZy5za2lwKDEpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQcm90b2NvbC5zZXJ2ZXJDZFRyYWNrOlxuICAgICAgICAgICAgICAgIG1zZy5za2lwKDIpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQcm90b2NvbC5zZXJ2ZXJTcGF3blN0YXRpYzpcbiAgICAgICAgICAgICAgICB0aGlzLndvcmxkLnNwYXduU3RhdGljKHRoaXMucGFyc2VCYXNlbGluZShtc2cpKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgUHJvdG9jb2wuc2VydmVyS2lsbGVkTW9uc3RlcjpcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgUHJvdG9jb2wuc2VydmVyRGFtYWdlOlxuICAgICAgICAgICAgICAgIHRoaXMucGFyc2VEYW1hZ2UobXNnKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgUHJvdG9jb2wuc2VydmVyRm91bmRTZWNyZXQ6XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFByb3RvY29sLnNlcnZlclNwYXduQmFzZWxpbmU6XG4gICAgICAgICAgICAgICAgdGhpcy53b3JsZC5zcGF3bkVudGl0eShtc2cucmVhZEludDE2KCksIHRoaXMucGFyc2VCYXNlbGluZShtc2cpKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgUHJvdG9jb2wuc2VydmVyQ2VudGVyUHJpbnQ6XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0NFTlRFUjogJywgbXNnLnJlYWRDU3RyaW5nKCkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQcm90b2NvbC5zZXJ2ZXJTcGF3blN0YXRpY1NvdW5kOlxuICAgICAgICAgICAgICAgIG1zZy5za2lwKDkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDogdGhyb3cgJ1Vua25vd24gY21kOiAnICsgY21kO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuQ2xpZW50LnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbih0aW1lKSB7XG4gICAgaWYgKCF0aW1lKSByZXR1cm47XG5cbiAgICB0aGlzLnRpbWUub2xkQ2xpZW50VGltZSA9IHRoaXMudGltZS5jbGllbnRUaW1lO1xuICAgIHRoaXMudGltZS5jbGllbnRUaW1lID0gdGltZSAvIDEwMDA7XG5cbiAgICBpZiAodGhpcy50aW1lLmNsaWVudFRpbWUgPiB0aGlzLnRpbWUuc2VydmVyVGltZSlcbiAgICAgICAgdGhpcy5yZWFkRnJvbVNlcnZlcigpO1xuXG4gICAgdmFyIHNlcnZlckRlbHRhID0gdGhpcy50aW1lLnNlcnZlclRpbWUgLSB0aGlzLnRpbWUub2xkU2VydmVyVGltZSB8fCAwLjE7XG4gICAgaWYgKHNlcnZlckRlbHRhID4gMC4xKSB7XG4gICAgICAgIHRoaXMudGltZS5vbGRTZXJ2ZXJUaW1lID0gdGhpcy50aW1lLnNlcnZlclRpbWUgLSAwLjE7XG4gICAgICAgIHNlcnZlckRlbHRhID0gMC4xO1xuICAgIH1cbiAgICB2YXIgZHQgPSAodGhpcy50aW1lLmNsaWVudFRpbWUgLSB0aGlzLnRpbWUub2xkU2VydmVyVGltZSkgLyBzZXJ2ZXJEZWx0YTtcbiAgICBpZiAoZHQgPiAxLjApIGR0ID0gMS4wO1xuXG4gICAgdGhpcy53b3JsZC51cGRhdGUoZHQpO1xufTtcblxuQ2xpZW50LnByb3RvdHlwZS5wYXJzZVNlcnZlckluZm8gPSBmdW5jdGlvbihtc2cpIHtcbiAgICBtc2cuc2tpcCg2KTtcbiAgICB2YXIgbWFwTmFtZSA9IG1zZy5yZWFkQ1N0cmluZygpO1xuXG4gICAgd2hpbGUodHJ1ZSkge1xuICAgICAgICB2YXIgbW9kZWxOYW1lID0gbXNnLnJlYWRDU3RyaW5nKCk7XG4gICAgICAgIGlmICghbW9kZWxOYW1lKSBicmVhaztcbiAgICAgICAgdGhpcy53b3JsZC5sb2FkTW9kZWwobW9kZWxOYW1lKTtcbiAgICB9XG4gICAgd2hpbGUodHJ1ZSkge1xuICAgICAgICB2YXIgc291bmROYW1lID0gbXNnLnJlYWRDU3RyaW5nKCk7XG4gICAgICAgIGlmICghc291bmROYW1lKSBicmVhaztcbiAgICAgICAgLy9jb25zb2xlLmxvZyhzb3VuZE5hbWUpO1xuICAgIH1cbn07XG5cbkNsaWVudC5wcm90b3R5cGUucGFyc2VDbGllbnREYXRhID0gZnVuY3Rpb24obXNnKSB7XG4gICAgdmFyIGJpdHMgPSBtc2cucmVhZEludDE2KCk7XG4gICAgaWYgKGJpdHMgJiBQcm90b2NvbC5jbGllbnRWaWV3SGVpZ2h0KVxuICAgICAgICBtc2cucmVhZFVJbnQ4KCk7XG5cbiAgICBpZiAoYml0cyAmIFByb3RvY29sLmNsaWVudElkZWFsUGl0Y2gpXG4gICAgICAgIG1zZy5yZWFkSW50OCgpO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAzOyBpKyspIHtcblxuICAgICAgICBpZiAoYml0cyAmIChQcm90b2NvbC5jbGllbnRQdW5jaDEgPDwgaSkpXG4gICAgICAgICAgICBtc2cucmVhZEludDgoKTtcblxuICAgICAgICBpZiAoYml0cyAmIChQcm90b2NvbC5jbGllbnRWZWxvY2l0eTEgPDwgaSkpXG4gICAgICAgICAgICBtc2cucmVhZEludDgoKTtcbiAgICB9XG5cbiAgICBtc2cucmVhZEludDMyKCk7XG5cbiAgICBpZiAoYml0cyAmIFByb3RvY29sLmNsaWVudFdlYXBvbkZyYW1lKVxuICAgICAgICBtc2cucmVhZFVJbnQ4KCk7XG5cbiAgICBpZiAoYml0cyAmIFByb3RvY29sLmNsaWVudEFybW9yKVxuICAgICAgICBtc2cucmVhZFVJbnQ4KCk7XG5cbiAgICBpZiAoYml0cyAmIFByb3RvY29sLmNsaWVudFdlYXBvbilcbiAgICAgICAgbXNnLnJlYWRVSW50OCgpO1xuXG4gICAgbXNnLnJlYWRJbnQxNigpO1xuICAgIG1zZy5yZWFkVUludDgoKTtcbiAgICBtc2cucmVhZFN0cmluZyg1KTtcbn07XG5cbkNsaWVudC5wcm90b3R5cGUucGFyc2VGYXN0VXBkYXRlID0gZnVuY3Rpb24oY21kLCBtc2cpIHtcbiAgICBpZiAoY21kICYgUHJvdG9jb2wuZmFzdFVwZGF0ZU1vcmVCaXRzKVxuICAgICAgICBjbWQgPSBjbWQgfCAobXNnLnJlYWRVSW50OCgpIDw8IDgpO1xuXG4gICAgdmFyIGVudGl0eU5vID0gKGNtZCAmIFByb3RvY29sLmZhc3RVcGRhdGVMb25nRW50aXR5KSA/XG4gICAgICAgIG1zZy5yZWFkSW50MTYoKSA6IG1zZy5yZWFkVUludDgoKTtcblxuXG4gICAgLy8gVE9ETzogTW92ZSBlbnRpdHkgZmFzdCB1cGRhdGVzIGludG8gd29ybGQuanMuXG4gICAgdmFyIGVudGl0eSA9IHRoaXMud29ybGQuZW50aXRpZXNbZW50aXR5Tm9dO1xuICAgIGVudGl0eS50aW1lID0gdGhpcy5zZXJ2ZXJUaW1lO1xuXG4gICAgaWYgKGNtZCAmIFByb3RvY29sLmZhc3RVcGRhdGVNb2RlbCkge1xuICAgICAgICBlbnRpdHkuc3RhdGUubW9kZWxJbmRleCA9IG1zZy5yZWFkVUludDgoKTtcbiAgICB9XG4gICAgaWYgKGNtZCAmIFByb3RvY29sLmZhc3RVcGRhdGVGcmFtZSlcbiAgICAgICAgZW50aXR5LnN0YXRlLmZyYW1lID0gbXNnLnJlYWRVSW50OCgpO1xuICAgIC8vZWxzZVxuICAgIC8vICAgIGVudGl0eS5zdGF0ZS5mcmFtZSA9IGVudGl0eS5iYXNlbGluZS5mcmFtZTtcblxuICAgIGlmIChjbWQgJiBQcm90b2NvbC5mYXN0VXBkYXRlQ29sb3JNYXApXG4gICAgICAgIG1zZy5yZWFkVUludDgoKTtcblxuICAgIGlmIChjbWQgJiBQcm90b2NvbC5mYXN0VXBkYXRlU2tpbilcbiAgICAgICAgbXNnLnJlYWRVSW50OCgpO1xuICAgIGlmIChjbWQgJiBQcm90b2NvbC5mYXN0VXBkYXRlRWZmZWN0cylcbiAgICAgICAgbXNnLnJlYWRVSW50OCgpO1xuXG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDM7IGkrKykge1xuICAgICAgICBlbnRpdHkucHJpb3JTdGF0ZS5hbmdsZXNbaV0gPSBlbnRpdHkubmV4dFN0YXRlLmFuZ2xlc1tpXTtcbiAgICAgICAgZW50aXR5LnByaW9yU3RhdGUub3JpZ2luW2ldID0gZW50aXR5Lm5leHRTdGF0ZS5vcmlnaW5baV07XG4gICAgfVxuXG4gICAgaWYgKGNtZCAmIFByb3RvY29sLmZhc3RVcGRhdGVPcmlnaW4xKVxuICAgICAgICBlbnRpdHkubmV4dFN0YXRlLm9yaWdpblswXSA9IG1zZy5yZWFkSW50MTYoKSAqIDAuMTI1O1xuICAgIGlmIChjbWQgJiBQcm90b2NvbC5mYXN0VXBkYXRlQW5nbGUxKVxuICAgICAgICBlbnRpdHkubmV4dFN0YXRlLmFuZ2xlc1swXSA9IG1zZy5yZWFkSW50OCgpICogMS40MDYyNTtcbiAgICBpZiAoY21kICYgUHJvdG9jb2wuZmFzdFVwZGF0ZU9yaWdpbjIpXG4gICAgICAgIGVudGl0eS5uZXh0U3RhdGUub3JpZ2luWzFdID0gbXNnLnJlYWRJbnQxNigpICogMC4xMjU7XG4gICAgaWYgKGNtZCAmIFByb3RvY29sLmZhc3RVcGRhdGVBbmdsZTIpXG4gICAgICAgIGVudGl0eS5uZXh0U3RhdGUuYW5nbGVzWzFdID0gbXNnLnJlYWRJbnQ4KCkgKiAxLjQwNjI1O1xuICAgIGlmIChjbWQgJiBQcm90b2NvbC5mYXN0VXBkYXRlT3JpZ2luMylcbiAgICAgICAgZW50aXR5Lm5leHRTdGF0ZS5vcmlnaW5bMl0gPSBtc2cucmVhZEludDE2KCkgKiAwLjEyNTtcbiAgICBpZiAoY21kICYgUHJvdG9jb2wuZmFzdFVwZGF0ZUFuZ2xlMylcbiAgICAgICAgZW50aXR5Lm5leHRTdGF0ZS5hbmdsZXNbMl0gPSBtc2cucmVhZEludDgoKSAqIDEuNDA2MjU7XG59O1xuXG5DbGllbnQucHJvdG90eXBlLnBhcnNlU291bmQgPSBmdW5jdGlvbihtc2cpIHtcbiAgICB2YXIgYml0cyA9IG1zZy5yZWFkVUludDgoKTtcbiAgICB2YXIgdm9sdW1lID0gKGJpdHMgJiBQcm90b2NvbC5zb3VuZFZvbHVtZSkgPyBtc2cucmVhZFVJbnQ4KCkgOiAyNTU7XG4gICAgdmFyIGF0dGVudWF0aW9uID0gKGJpdHMgJiBQcm90b2NvbC5zb3VuZEF0dGVudWF0aW9uKSA/IG1zZy5yZWFkVUludDgoKSAvIDY0LjAgOiAxLjA7XG4gICAgdmFyIGNoYW5uZWwgPSBtc2cucmVhZEludDE2KCk7XG4gICAgdmFyIHNvdW5kSW5kZXggPSBtc2cucmVhZFVJbnQ4KCk7XG5cbiAgICB2YXIgcG9zID0gdmVjMy5jcmVhdGUoKTtcbiAgICBwb3NbMF0gPSBtc2cucmVhZEludDE2KCkgKiAwLjEyNTtcbiAgICBwb3NbMV0gPSBtc2cucmVhZEludDE2KCkgKiAwLjEyNTtcbiAgICBwb3NbMl0gPSBtc2cucmVhZEludDE2KCkgKiAwLjEyNTtcbn07XG5cbkNsaWVudC5wcm90b3R5cGUucGFyc2VUZW1wRW50aXR5ID0gZnVuY3Rpb24obXNnKSB7XG4gICAgdmFyIHR5cGUgPSBtc2cucmVhZFVJbnQ4KCk7XG4gICAgdmFyIHBvcyA9IHZlYzMuY3JlYXRlKCk7XG4gICAgc3dpdGNoKHR5cGUpIHtcbiAgICAgICAgY2FzZSBQcm90b2NvbC50ZW1wR3VuU2hvdDpcbiAgICAgICAgY2FzZSBQcm90b2NvbC50ZW1wV2l6U3Bpa2U6XG4gICAgICAgIGNhc2UgUHJvdG9jb2wudGVtcFNwaWtlOlxuICAgICAgICBjYXNlIFByb3RvY29sLnRlbXBTdXBlclNwaWtlOlxuXHRcdGNhc2UgUHJvdG9jb2wudGVtcFRlbGVwb3J0OlxuXHRcdGNhc2UgUHJvdG9jb2wudGVtcEV4cGxvc2lvbjpcbiAgICAgICAgICAgIHBvc1swXSA9IG1zZy5yZWFkSW50MTYoKSAqIDAuMTI1O1xuICAgICAgICAgICAgcG9zWzFdID0gbXNnLnJlYWRJbnQxNigpICogMC4xMjU7XG4gICAgICAgICAgICBwb3NbMl0gPSBtc2cucmVhZEludDE2KCkgKiAwLjEyNTtcbiAgICAgICAgICAgIGJyZWFrO1xuXHRcdGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyAnVW5rbm93biB0ZW1wLiBlbnRpdHkgZW5jb3VudGVyZWQ6ICcgKyB0eXBlO1xuICAgIH1cbn07XG5cbkNsaWVudC5wcm90b3R5cGUucGFyc2VEYW1hZ2UgPSBmdW5jdGlvbihtc2cpIHtcbiAgICB2YXIgYXJtb3IgPSBtc2cucmVhZFVJbnQ4KCk7XG4gICAgdmFyIGJsb29kID0gbXNnLnJlYWRVSW50OCgpO1xuXG4gICAgdmFyIHBvcyA9IHZlYzMuY3JlYXRlKCk7XG4gICAgcG9zWzBdID0gbXNnLnJlYWRJbnQxNigpICogMC4xMjU7XG4gICAgcG9zWzFdID0gbXNnLnJlYWRJbnQxNigpICogMC4xMjU7XG4gICAgcG9zWzJdID0gbXNnLnJlYWRJbnQxNigpICogMC4xMjU7XG59O1xuXG5DbGllbnQucHJvdG90eXBlLnBhcnNlUGFydGljbGUgPSBmdW5jdGlvbihtc2cpIHtcbiAgICB2YXIgcG9zID0gdmVjMy5jcmVhdGUoKTtcbiAgICB2YXIgYW5nbGVzID0gdmVjMy5jcmVhdGUoKTtcbiAgICBwb3NbMF0gPSBtc2cucmVhZEludDE2KCkgKiAwLjEyNTtcbiAgICBwb3NbMV0gPSBtc2cucmVhZEludDE2KCkgKiAwLjEyNTtcbiAgICBwb3NbMl0gPSBtc2cucmVhZEludDE2KCkgKiAwLjEyNTtcbiAgICBhbmdsZXNbMF0gPSBtc2cucmVhZEludDgoKSAqIDAuMDYyNTtcbiAgICBhbmdsZXNbMV0gPSBtc2cucmVhZEludDgoKSAqIDAuMDYyNTtcbiAgICBhbmdsZXNbMl0gPSBtc2cucmVhZEludDgoKSAqIDAuMDYyNTtcbiAgICB2YXIgY291bnQgPSBtc2cucmVhZFVJbnQ4KCk7XG4gICAgdmFyIGNvbG9yID0gbXNnLnJlYWRVSW50OCgpO1xufTtcblxuQ2xpZW50LnByb3RvdHlwZS5wYXJzZUJhc2VsaW5lID0gZnVuY3Rpb24obXNnKSB7XG4gICAgdmFyIGJhc2VsaW5lID0ge1xuICAgICAgICBtb2RlbEluZGV4OiBtc2cucmVhZFVJbnQ4KCksXG4gICAgICAgIGZyYW1lOiBtc2cucmVhZFVJbnQ4KCksXG4gICAgICAgIGNvbG9yTWFwOiBtc2cucmVhZFVJbnQ4KCksXG4gICAgICAgIHNraW46IG1zZy5yZWFkVUludDgoKSxcbiAgICAgICAgb3JpZ2luOiB2ZWMzLmNyZWF0ZSgpLFxuICAgICAgICBhbmdsZXM6IHZlYzMuY3JlYXRlKClcbiAgICB9O1xuICAgIGJhc2VsaW5lLm9yaWdpblswXSA9IG1zZy5yZWFkSW50MTYoKSAqIDAuMTI1O1xuICAgIGJhc2VsaW5lLmFuZ2xlc1swXSA9IG1zZy5yZWFkSW50OCgpICogMS40MDYyNTtcbiAgICBiYXNlbGluZS5vcmlnaW5bMV0gPSBtc2cucmVhZEludDE2KCkgKiAwLjEyNTtcbiAgICBiYXNlbGluZS5hbmdsZXNbMV0gPSBtc2cucmVhZEludDgoKSAqIDEuNDA2MjU7XG4gICAgYmFzZWxpbmUub3JpZ2luWzJdID0gbXNnLnJlYWRJbnQxNigpICogMC4xMjU7XG4gICAgYmFzZWxpbmUuYW5nbGVzWzJdID0gbXNnLnJlYWRJbnQ4KCkgKiAxLjQwNjI1O1xuICAgIHJldHVybiBiYXNlbGluZTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IENsaWVudDtcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiMVlpWjVTXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvY2xpZW50LmpzXCIsXCIvXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIEJ1ZmZlciA9IHJlcXVpcmUoJ2J1ZmZlcicpLkJ1ZmZlcjtcblxudmFyIEZpbGUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgdGhpcy5idWZmZXIgPSBuZXcgQnVmZmVyKGRhdGEpO1xuICAgIHRoaXMub2Zmc2V0ID0gMDtcbn07XG5cbkZpbGUucHJvdG90eXBlLnRlbGwgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5vZmZzZXQ7XG59O1xuXG5GaWxlLnByb3RvdHlwZS5zZWVrID0gZnVuY3Rpb24ob2Zmc2V0KSB7XG4gICAgdGhpcy5vZmZzZXQgPSBvZmZzZXQ7XG59O1xuXG5GaWxlLnByb3RvdHlwZS5za2lwID0gZnVuY3Rpb24oYnl0ZXMpIHtcbiAgICB0aGlzLm9mZnNldCArPSBieXRlcztcbn07XG5cbkZpbGUucHJvdG90eXBlLmVvZiA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLm9mZnNldCA+PSB0aGlzLmJ1ZmZlci5sZW5ndGg7XG59O1xuXG5GaWxlLnByb3RvdHlwZS5zbGljZSA9IGZ1bmN0aW9uKG9mZnNldCwgbGVuZ3RoKSB7XG4gICAgcmV0dXJuIG5ldyBGaWxlKHRoaXMuYnVmZmVyLnNsaWNlKG9mZnNldCwgb2Zmc2V0ICsgbGVuZ3RoKSk7XG59O1xuXG5GaWxlLnByb3RvdHlwZS5yZWFkID0gZnVuY3Rpb24obGVuZ3RoKSB7XG4gICAgdmFyIHJlc3VsdCA9IG5ldyBGaWxlKHRoaXMuYnVmZmVyLnNsaWNlKHRoaXMub2Zmc2V0LCB0aGlzLm9mZnNldCArIGxlbmd0aCkpO1xuICAgIHRoaXMub2Zmc2V0ICs9IGxlbmd0aDtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuRmlsZS5wcm90b3R5cGUucmVhZFN0cmluZyA9IGZ1bmN0aW9uKGxlbmd0aCkge1xuICAgIHZhciByZXN1bHQgPSAnJztcbiAgICB2YXIgdGVybWluYXRlZCA9IGZhbHNlO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGJ5dGUgPSB0aGlzLmJ1ZmZlci5yZWFkVUludDgodGhpcy5vZmZzZXQrKyk7XG4gICAgICAgIGlmIChieXRlID09PSAweDApIHRlcm1pbmF0ZWQgPSB0cnVlO1xuICAgICAgICBpZiAoIXRlcm1pbmF0ZWQpXG4gICAgICAgICAgICByZXN1bHQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbkZpbGUucHJvdG90eXBlLnJlYWRDU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHJlc3VsdCA9ICcnO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTI4OyBpKyspIHtcbiAgICAgICAgdmFyIGJ5dGUgPSB0aGlzLmJ1ZmZlci5yZWFkVUludDgodGhpcy5vZmZzZXQrKyk7XG4gICAgICAgIGlmIChieXRlID09PSAweDApIHJldHVybiByZXN1bHQ7XG4gICAgICAgIHJlc3VsdCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGUpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuRmlsZS5wcm90b3R5cGUucmVhZFVJbnQ4ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuYnVmZmVyLnJlYWRVSW50OCh0aGlzLm9mZnNldCsrKTtcbn07XG5cbkZpbGUucHJvdG90eXBlLnJlYWRJbnQ4ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuYnVmZmVyLnJlYWRJbnQ4KHRoaXMub2Zmc2V0KyspO1xufTtcblxuRmlsZS5wcm90b3R5cGUucmVhZFVJbnQxNiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByZXN1bHQgPSB0aGlzLmJ1ZmZlci5yZWFkVUludDE2TEUodGhpcy5vZmZzZXQpO1xuICAgIHRoaXMub2Zmc2V0ICs9IDI7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbkZpbGUucHJvdG90eXBlLnJlYWRJbnQxNiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByZXN1bHQgPSB0aGlzLmJ1ZmZlci5yZWFkSW50MTZMRSh0aGlzLm9mZnNldCk7XG4gICAgdGhpcy5vZmZzZXQgKz0gMjtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuRmlsZS5wcm90b3R5cGUucmVhZFVJbnQzMiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByZXN1bHQgPSB0aGlzLmJ1ZmZlci5yZWFkVUludDMyTEUodGhpcy5vZmZzZXQpO1xuICAgIHRoaXMub2Zmc2V0ICs9IDQ7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbkZpbGUucHJvdG90eXBlLnJlYWRJbnQzMiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByZXN1bHQgPSB0aGlzLmJ1ZmZlci5yZWFkSW50MzJMRSh0aGlzLm9mZnNldCk7XG4gICAgdGhpcy5vZmZzZXQgKz0gNDtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuRmlsZS5wcm90b3R5cGUucmVhZEZsb2F0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHJlc3VsdCA9IHRoaXMuYnVmZmVyLnJlYWRGbG9hdExFKHRoaXMub2Zmc2V0KTtcbiAgICB0aGlzLm9mZnNldCArPSA0O1xuICAgIHJldHVybiByZXN1bHQ7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBGaWxlO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIjFZaVo1U1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2ZpbGUuanNcIixcIi9cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG5cbnZhciBCc3AgPSBmdW5jdGlvbihmaWxlKSB7XG4gICAgdmFyIGhlYWRlciA9IHtcbiAgICAgICAgdmVyc2lvbjogZmlsZS5yZWFkSW50MzIoKSxcbiAgICAgICAgZW50aXRpZXM6IHtvZmZzZXQ6IGZpbGUucmVhZEludDMyKCksIHNpemU6IGZpbGUucmVhZEludDMyKCl9LFxuICAgICAgICBwbGFuZXM6IHtvZmZzZXQ6IGZpbGUucmVhZEludDMyKCksIHNpemU6IGZpbGUucmVhZEludDMyKCl9LFxuICAgICAgICBtaXB0ZXhzOiB7b2Zmc2V0OiBmaWxlLnJlYWRJbnQzMigpLCBzaXplOiBmaWxlLnJlYWRJbnQzMigpfSxcbiAgICAgICAgdmVydGljZXM6IHtvZmZzZXQ6IGZpbGUucmVhZEludDMyKCksIHNpemU6IGZpbGUucmVhZEludDMyKCl9LFxuICAgICAgICB2aXNpbGlzdDoge29mZnNldDogZmlsZS5yZWFkSW50MzIoKSwgc2l6ZTogZmlsZS5yZWFkSW50MzIoKX0sXG4gICAgICAgIG5vZGVzOiB7b2Zmc2V0OiBmaWxlLnJlYWRJbnQzMigpLCBzaXplOiBmaWxlLnJlYWRJbnQzMigpfSxcbiAgICAgICAgdGV4aW5mb3M6IHtvZmZzZXQ6IGZpbGUucmVhZEludDMyKCksIHNpemU6IGZpbGUucmVhZEludDMyKCl9LFxuICAgICAgICBmYWNlczoge29mZnNldDogZmlsZS5yZWFkSW50MzIoKSwgc2l6ZTogZmlsZS5yZWFkSW50MzIoKX0sXG4gICAgICAgIGxpZ2h0bWFwczoge29mZnNldDogZmlsZS5yZWFkSW50MzIoKSwgc2l6ZTogZmlsZS5yZWFkSW50MzIoKX0sXG4gICAgICAgIGNsaXBub2Rlczoge29mZnNldDogZmlsZS5yZWFkSW50MzIoKSwgc2l6ZTogZmlsZS5yZWFkSW50MzIoKX0sXG4gICAgICAgIGxlYXZlczoge29mZnNldDogZmlsZS5yZWFkSW50MzIoKSwgc2l6ZTogZmlsZS5yZWFkSW50MzIoKX0sXG4gICAgICAgIGxmYWNlczoge29mZnNldDogZmlsZS5yZWFkSW50MzIoKSwgc2l6ZTogZmlsZS5yZWFkSW50MzIoKX0sXG4gICAgICAgIGVkZ2VzOiB7b2Zmc2V0OiBmaWxlLnJlYWRJbnQzMigpLCBzaXplOiBmaWxlLnJlYWRJbnQzMigpfSxcbiAgICAgICAgbGVkZ2VzOiB7b2Zmc2V0OiBmaWxlLnJlYWRJbnQzMigpLCBzaXplOiBmaWxlLnJlYWRJbnQzMigpfSxcbiAgICAgICAgbW9kZWxzOiB7b2Zmc2V0OiBmaWxlLnJlYWRJbnQzMigpLCBzaXplOiBmaWxlLnJlYWRJbnQzMigpfVxuICAgIH07XG5cbiAgICB0aGlzLmxvYWRUZXh0dXJlcyhmaWxlLCBoZWFkZXIubWlwdGV4cyk7XG4gICAgdGhpcy5sb2FkVGV4SW5mb3MoZmlsZSwgaGVhZGVyLnRleGluZm9zKTtcbiAgICB0aGlzLmxvYWRMaWdodE1hcHMoZmlsZSwgaGVhZGVyLmxpZ2h0bWFwcyk7XG5cbiAgICB0aGlzLmxvYWRNb2RlbHMoZmlsZSwgaGVhZGVyLm1vZGVscyk7XG4gICAgdGhpcy5sb2FkVmVydGljZXMoZmlsZSwgaGVhZGVyLnZlcnRpY2VzKTtcbiAgICB0aGlzLmxvYWRFZGdlcyhmaWxlLCBoZWFkZXIuZWRnZXMpO1xuICAgIHRoaXMubG9hZFN1cmZhY2VFZGdlcyhmaWxlLCBoZWFkZXIubGVkZ2VzKTtcbiAgICB0aGlzLmxvYWRTdXJmYWNlcyhmaWxlLCBoZWFkZXIuZmFjZXMpO1xufTtcblxuQnNwLnN1cmZhY2VGbGFncyA9IHtcbiAgICBwbGFuZUJhY2s6IDIsIGRyYXdTa3k6IDQsIGRyYXdTcHJpdGU6IDgsIGRyYXdUdXJiOiAxNixcbiAgICBkcmF3VGlsZWQ6IDMyLCBkcmF3QmFja2dyb3VuZDogNjQsIHVuZGVyd2F0ZXI6IDEyOFxufTtcblxuQnNwLnByb3RvdHlwZS5sb2FkVmVydGljZXMgPSBmdW5jdGlvbihmaWxlLCBsdW1wKSB7XG4gICAgdGhpcy52ZXJ0ZXhDb3VudCA9IGx1bXAuc2l6ZSAvIDEyO1xuICAgIHRoaXMudmVydGljZXMgPSBbXTtcbiAgICBmaWxlLnNlZWsobHVtcC5vZmZzZXQpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy52ZXJ0ZXhDb3VudDsgaSsrKSB7XG4gICAgICAgIHRoaXMudmVydGljZXMucHVzaCh7XG4gICAgICAgICAgICB4OiBmaWxlLnJlYWRGbG9hdCgpLFxuICAgICAgICAgICAgeTogZmlsZS5yZWFkRmxvYXQoKSxcbiAgICAgICAgICAgIHo6IGZpbGUucmVhZEZsb2F0KClcbiAgICAgICAgfSk7XG4gICAgfVxufTtcblxuQnNwLnByb3RvdHlwZS5sb2FkRWRnZXMgPSBmdW5jdGlvbihmaWxlLCBsdW1wKSB7XG4gICAgdmFyIGVkZ2VDb3VudCA9IGx1bXAuc2l6ZSAvIDQ7XG4gICAgdGhpcy5lZGdlcyA9IFtdO1xuICAgIGZpbGUuc2VlayhsdW1wLm9mZnNldCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlZGdlQ291bnQgKiA0OyBpKyspXG4gICAgICAgIHRoaXMuZWRnZXMucHVzaChmaWxlLnJlYWRVSW50MTYoKSk7XG59O1xuXG5Cc3AucHJvdG90eXBlLmxvYWRTdXJmYWNlRWRnZXMgPSBmdW5jdGlvbihmaWxlLCBsdW1wKSB7XG4gICAgdmFyIGVkZ2VMaXN0Q291bnQgPSBsdW1wLnNpemUgLyA0O1xuICAgIHRoaXMuZWRnZUxpc3QgPSBbXTtcbiAgICBmaWxlLnNlZWsobHVtcC5vZmZzZXQpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWRnZUxpc3RDb3VudDsgaSsrKSB7XG4gICAgICAgIHRoaXMuZWRnZUxpc3QucHVzaChmaWxlLnJlYWRJbnQzMigpKTtcbiAgICB9XG59O1xuXG5Cc3AucHJvdG90eXBlLmNhbGN1bGF0ZVN1cmZhY2VFeHRlbnRzID0gZnVuY3Rpb24oc3VyZmFjZSkge1xuICAgIHZhciBtaW5TID0gOTk5OTk7XG4gICAgdmFyIG1heFMgPSAtOTk5OTk7XG4gICAgdmFyIG1pblQgPSA5OTk5OTtcbiAgICB2YXIgbWF4VCA9IC05OTk5OTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3VyZmFjZS5lZGdlQ291bnQ7IGkrKykge1xuICAgICAgICB2YXIgZWRnZUluZGV4ID0gdGhpcy5lZGdlTGlzdFtzdXJmYWNlLmVkZ2VTdGFydCArIGldO1xuICAgICAgICB2YXIgdmkgPSBlZGdlSW5kZXggPj0gMCA/IHRoaXMuZWRnZXNbZWRnZUluZGV4ICogMl0gOiB0aGlzLmVkZ2VzWy1lZGdlSW5kZXggKiAyICsgMV07XG4gICAgICAgIHZhciB2ID0gW3RoaXMudmVydGljZXNbdmldLngsIHRoaXMudmVydGljZXNbdmldLnksIHRoaXMudmVydGljZXNbdmldLnpdO1xuICAgICAgICB2YXIgdGV4SW5mbyA9IHRoaXMudGV4SW5mb3Nbc3VyZmFjZS50ZXhJbmZvSWRdO1xuXG4gICAgICAgIHZhciBzID0gdmVjMy5kb3QodiwgdGV4SW5mby52ZWN0b3JTKSArIHRleEluZm8uZGlzdFM7XG4gICAgICAgIG1pblMgPSBNYXRoLm1pbihtaW5TLCBzKTtcbiAgICAgICAgbWF4UyA9IE1hdGgubWF4KG1heFMsIHMpO1xuXG4gICAgICAgIHZhciB0ID0gdmVjMy5kb3QodiwgdGV4SW5mby52ZWN0b3JUKSArIHRleEluZm8uZGlzdFQ7XG4gICAgICAgIG1pblQgPSBNYXRoLm1pbihtaW5ULCB0KTtcbiAgICAgICAgbWF4VCA9IE1hdGgubWF4KG1heFQsIHQpO1xuICAgIH1cblxuICAgIC8qIENvbnZlcnQgdG8gaW50cyAqL1xuICAgIG1pblMgPSBNYXRoLmZsb29yKG1pblMgLyAxNik7XG4gICAgbWluVCA9IE1hdGguZmxvb3IobWluVCAvIDE2KTtcbiAgICBtYXhTID0gTWF0aC5jZWlsKG1heFMgLyAxNik7XG4gICAgbWF4VCA9IE1hdGguY2VpbChtYXhUIC8gMTYpO1xuXG4gICAgc3VyZmFjZS50ZXh0dXJlTWlucyA9IFttaW5TICogMTYsIG1pblQgKiAxNl07XG4gICAgc3VyZmFjZS5leHRlbnRzID0gWyhtYXhTIC0gbWluUykgKiAxNiwgKG1heFQgLSBtaW5UKSAqIDE2XTtcbn07XG5cbkJzcC5wcm90b3R5cGUubG9hZFN1cmZhY2VzID0gZnVuY3Rpb24gKGZpbGUsIGx1bXApIHtcblxuICAgIHZhciBzdXJmYWNlQ291bnQgPSBsdW1wLnNpemUgLyAyMDtcbiAgICB0aGlzLnN1cmZhY2VzID0gW107XG4gICAgZmlsZS5zZWVrKGx1bXAub2Zmc2V0KTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN1cmZhY2VDb3VudDsgaSsrKSB7XG4gICAgICAgIHZhciBzdXJmYWNlID0ge307XG4gICAgICAgIHN1cmZhY2UucGxhbmVJZCA9IGZpbGUucmVhZFVJbnQxNigpO1xuICAgICAgICBzdXJmYWNlLnNpZGUgPSBmaWxlLnJlYWRVSW50MTYoKTtcbiAgICAgICAgc3VyZmFjZS5lZGdlU3RhcnQgPSBmaWxlLnJlYWRJbnQzMigpO1xuICAgICAgICBzdXJmYWNlLmVkZ2VDb3VudCA9IGZpbGUucmVhZEludDE2KCk7XG4gICAgICAgIHN1cmZhY2UudGV4SW5mb0lkID0gZmlsZS5yZWFkVUludDE2KCk7XG5cbiAgICAgICAgc3VyZmFjZS5saWdodFN0eWxlcyA9IFtmaWxlLnJlYWRVSW50OCgpLCBmaWxlLnJlYWRVSW50OCgpLCBmaWxlLnJlYWRVSW50OCgpLCBmaWxlLnJlYWRVSW50OCgpXTtcbiAgICAgICAgc3VyZmFjZS5saWdodE1hcE9mZnNldCA9IGZpbGUucmVhZEludDMyKCk7XG4gICAgICAgIHN1cmZhY2UuZmxhZ3MgPSAwO1xuXG4gICAgICAgIHRoaXMuY2FsY3VsYXRlU3VyZmFjZUV4dGVudHMoc3VyZmFjZSk7XG4gICAgICAgIHRoaXMuc3VyZmFjZXMucHVzaChzdXJmYWNlKTtcbiAgICB9XG59O1xuXG5Cc3AucHJvdG90eXBlLmxvYWRUZXh0dXJlcyA9IGZ1bmN0aW9uKGZpbGUsIGx1bXApIHtcbiAgICBmaWxlLnNlZWsobHVtcC5vZmZzZXQpO1xuICAgIHZhciB0ZXh0dXJlQ291bnQgPSBmaWxlLnJlYWRJbnQzMigpO1xuXG4gICAgdGhpcy50ZXh0dXJlcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGV4dHVyZUNvdW50OyBpKyspIHtcbiAgICAgICAgdmFyIHRleHR1cmVPZmZzZXQgPSBmaWxlLnJlYWRJbnQzMigpO1xuICAgICAgICB2YXIgb3JpZ2luYWxPZmZzZXQgPSBmaWxlLnRlbGwoKTtcbiAgICAgICAgZmlsZS5zZWVrKGx1bXAub2Zmc2V0ICsgdGV4dHVyZU9mZnNldCk7XG4gICAgICAgIHZhciB0ZXh0dXJlID0ge1xuICAgICAgICAgICAgbmFtZTogZmlsZS5yZWFkU3RyaW5nKDE2KSxcbiAgICAgICAgICAgIHdpZHRoOiBmaWxlLnJlYWRVSW50MzIoKSxcbiAgICAgICAgICAgIGhlaWdodDogZmlsZS5yZWFkVUludDMyKCksXG4gICAgICAgIH07XG4gICAgICAgIHZhciBvZmZzZXQgPSBsdW1wLm9mZnNldCArIHRleHR1cmVPZmZzZXQgKyBmaWxlLnJlYWRVSW50MzIoKTtcbiAgICAgICAgdGV4dHVyZS5kYXRhID0gZmlsZS5zbGljZShvZmZzZXQsIHRleHR1cmUud2lkdGggKiB0ZXh0dXJlLmhlaWdodCk7XG4gICAgICAgIHRoaXMudGV4dHVyZXMucHVzaCh0ZXh0dXJlKTtcblxuICAgICAgICBmaWxlLnNlZWsob3JpZ2luYWxPZmZzZXQpO1xuICAgIH1cbn07XG5cbkJzcC5wcm90b3R5cGUubG9hZFRleEluZm9zID0gZnVuY3Rpb24oZmlsZSwgbHVtcCkge1xuICAgIGZpbGUuc2VlayhsdW1wLm9mZnNldCk7XG4gICAgdmFyIHRleEluZm9Db3VudCA9IGx1bXAuc2l6ZSAvIDQwO1xuICAgIHRoaXMudGV4SW5mb3MgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRleEluZm9Db3VudDsgaSsrKSB7XG4gICAgICAgIHZhciBpbmZvID0ge307XG4gICAgICAgIGluZm8udmVjdG9yUyA9IFtmaWxlLnJlYWRGbG9hdCgpLCBmaWxlLnJlYWRGbG9hdCgpLCBmaWxlLnJlYWRGbG9hdCgpXTtcbiAgICAgICAgaW5mby5kaXN0UyA9IGZpbGUucmVhZEZsb2F0KCk7XG4gICAgICAgIGluZm8udmVjdG9yVCA9IFtmaWxlLnJlYWRGbG9hdCgpLCBmaWxlLnJlYWRGbG9hdCgpLCBmaWxlLnJlYWRGbG9hdCgpXTtcbiAgICAgICAgaW5mby5kaXN0VCA9IGZpbGUucmVhZEZsb2F0KCk7XG4gICAgICAgIGluZm8udGV4dHVyZUlkID0gZmlsZS5yZWFkVUludDMyKCk7XG4gICAgICAgIGluZm8uYW5pbWF0ZWQgPSBmaWxlLnJlYWRVSW50MzIoKSA9PSAxO1xuICAgICAgICB0aGlzLnRleEluZm9zLnB1c2goaW5mbyk7XG4gICAgfVxufTtcblxuQnNwLnByb3RvdHlwZS5sb2FkTW9kZWxzID0gZnVuY3Rpb24oZmlsZSwgbHVtcCkge1xuICAgIGZpbGUuc2VlayhsdW1wLm9mZnNldCk7XG4gICAgdmFyIG1vZGVsQ291bnQgPSBsdW1wLnNpemUgLyA2NDtcbiAgICB0aGlzLm1vZGVscyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW9kZWxDb3VudDsgaSsrKSB7XG5cbiAgICAgICAgdmFyIG1vZGVsID0ge307XG4gICAgICAgIG1vZGVsLm1pbnMgPSB2ZWMzLmNyZWF0ZShbZmlsZS5yZWFkRmxvYXQoKSwgZmlsZS5yZWFkRmxvYXQoKSwgZmlsZS5yZWFkRmxvYXQoKV0pO1xuICAgICAgICBtb2RlbC5tYXhlcyA9IHZlYzMuY3JlYXRlKFtmaWxlLnJlYWRGbG9hdCgpLCBmaWxlLnJlYWRGbG9hdCgpLCBmaWxlLnJlYWRGbG9hdCgpXSk7XG4gICAgICAgIG1vZGVsLm9yaWdpbiA9IHZlYzMuY3JlYXRlKFtmaWxlLnJlYWRGbG9hdCgpLCBmaWxlLnJlYWRGbG9hdCgpLCBmaWxlLnJlYWRGbG9hdCgpXSk7XG4gICAgICAgIG1vZGVsLmJzcE5vZGUgPSBmaWxlLnJlYWRJbnQzMigpO1xuICAgICAgICBtb2RlbC5jbGlwTm9kZTEgPSBmaWxlLnJlYWRJbnQzMigpO1xuICAgICAgICBtb2RlbC5jbGlwTm9kZTIgPSBmaWxlLnJlYWRJbnQzMigpO1xuICAgICAgICBmaWxlLnJlYWRJbnQzMigpOyAvLyBTa2lwIGZvciBub3cuXG4gICAgICAgIG1vZGVsLnZpc0xlYWZzID0gZmlsZS5yZWFkSW50MzIoKTtcbiAgICAgICAgbW9kZWwuZmlyc3RTdXJmYWNlID0gZmlsZS5yZWFkSW50MzIoKTtcbiAgICAgICAgbW9kZWwuc3VyZmFjZUNvdW50ID0gZmlsZS5yZWFkSW50MzIoKTtcbiAgICAgICAgdGhpcy5tb2RlbHMucHVzaChtb2RlbCk7XG4gICAgfVxufTtcblxuXG5Cc3AucHJvdG90eXBlLmxvYWRMaWdodE1hcHMgPSBmdW5jdGlvbiAoZmlsZSwgbHVtcCkge1xuICAgIGZpbGUuc2VlayhsdW1wLm9mZnNldCk7XG4gICAgdGhpcy5saWdodE1hcHMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGx1bXAuc2l6ZTsgaSsrKVxuICAgICAgICB0aGlzLmxpZ2h0TWFwcy5wdXNoKGZpbGUucmVhZFVJbnQ4KCkpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gQnNwO1xufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIxWWlaNVNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9mb3JtYXRzL2JzcC5qc1wiLFwiL2Zvcm1hdHNcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG5cbnZhciBBbGlhcyA9IHsgc2luZ2xlOiAwLCBncm91cDogMX07XG5cbnZhciBNZGwgPSBmdW5jdGlvbihuYW1lLCBmaWxlKSB7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLmxvYWRIZWFkZXIoZmlsZSk7XG4gICAgdGhpcy5sb2FkU2tpbnMoZmlsZSk7XG4gICAgdGhpcy5sb2FkVGV4Q29vcmRzKGZpbGUpO1xuICAgIHRoaXMubG9hZEZhY2VzKGZpbGUpO1xuICAgIHRoaXMubG9hZEZyYW1lcyhmaWxlKTtcbn07XG5cbk1kbC5wcm90b3R5cGUubG9hZEhlYWRlciA9IGZ1bmN0aW9uKGZpbGUpIHtcbiAgICB0aGlzLmlkID0gZmlsZS5yZWFkU3RyaW5nKDQpO1xuICAgIHRoaXMudmVyc2lvbiA9IGZpbGUucmVhZFVJbnQzMigpO1xuICAgIHRoaXMuc2NhbGUgPSB2ZWMzLmZyb21WYWx1ZXMoZmlsZS5yZWFkRmxvYXQoKSwgZmlsZS5yZWFkRmxvYXQoKSwgZmlsZS5yZWFkRmxvYXQoKSk7XG4gICAgdGhpcy5vcmlnaW4gPSB2ZWMzLmZyb21WYWx1ZXMoZmlsZS5yZWFkRmxvYXQoKSwgZmlsZS5yZWFkRmxvYXQoKSwgZmlsZS5yZWFkRmxvYXQoKSk7XG4gICAgdGhpcy5yYWRpdXMgPSBmaWxlLnJlYWRGbG9hdCgpO1xuICAgIHRoaXMuZXllUG9zaXRpb24gPSBbZmlsZS5yZWFkRmxvYXQoKSwgZmlsZS5yZWFkRmxvYXQoKSwgZmlsZS5yZWFkRmxvYXQoKV07XG4gICAgdGhpcy5za2luQ291bnQgPSBmaWxlLnJlYWRJbnQzMigpO1xuICAgIHRoaXMuc2tpbldpZHRoID0gZmlsZS5yZWFkSW50MzIoKTtcbiAgICB0aGlzLnNraW5IZWlnaHQgPSBmaWxlLnJlYWRJbnQzMigpO1xuICAgIHRoaXMudmVydGV4Q291bnQgPSBmaWxlLnJlYWRJbnQzMigpO1xuICAgIHRoaXMuZmFjZUNvdW50ID0gZmlsZS5yZWFkSW50MzIoKTtcbiAgICB0aGlzLmZyYW1lQ291bnQgPSBmaWxlLnJlYWRJbnQzMigpO1xuICAgIHRoaXMuc3luY1R5cGUgPSBmaWxlLnJlYWRJbnQzMigpO1xuICAgIHRoaXMuZmxhZ3MgPSBmaWxlLnJlYWRJbnQzMigpO1xuICAgIHRoaXMuYXZlcmFnZUZhY2VTaXplID0gZmlsZS5yZWFkRmxvYXQoKTtcbn07XG5cblxuTWRsLnByb3RvdHlwZS5sb2FkU2tpbnMgPSBmdW5jdGlvbihmaWxlKSB7XG4gICAgZmlsZS5zZWVrKDB4NTQpOyAvL2Jhc2Vza2luIG9mZnNldCwgd2hlcmUgc2tpbnMgc3RhcnQuXG4gICAgdGhpcy5za2lucyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5za2luQ291bnQ7IGkrKykge1xuICAgICAgICB2YXIgZ3JvdXAgPSBmaWxlLnJlYWRJbnQzMigpO1xuICAgICAgICBpZiAoZ3JvdXAgIT09IEFsaWFzLnNpbmdsZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1dhcm5pbmc6IE11bHRpcGxlIHNraW5zIG5vdCBzdXBwb3J0ZWQgeWV0LicpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBkYXRhID0gZmlsZS5yZWFkKHRoaXMuc2tpbldpZHRoICogdGhpcy5za2luSGVpZ2h0KTtcblxuICAgICAgICB0aGlzLnNraW5zLnB1c2goZGF0YSk7XG4gICAgfVxufTtcblxuTWRsLnByb3RvdHlwZS5sb2FkVGV4Q29vcmRzID0gZnVuY3Rpb24oZmlsZSkge1xuICAgIHRoaXMudGV4Q29vcmRzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnZlcnRleENvdW50OyBpKyspIHtcbiAgICAgICAgdmFyIHRleENvb3JkID0ge307XG4gICAgICAgIHRleENvb3JkLm9uU2VhbSA9IGZpbGUucmVhZEludDMyKCkgPT0gMHgyMDtcbiAgICAgICAgdGV4Q29vcmQucyA9IGZpbGUucmVhZEludDMyKCk7XG4gICAgICAgIHRleENvb3JkLnQgPSBmaWxlLnJlYWRJbnQzMigpO1xuICAgICAgICB0aGlzLnRleENvb3Jkcy5wdXNoKHRleENvb3JkKTtcbiAgICB9XG59O1xuXG5NZGwucHJvdG90eXBlLmxvYWRGYWNlcyA9IGZ1bmN0aW9uKGZpbGUpIHtcbiAgICB0aGlzLmZhY2VzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmZhY2VDb3VudDsgaSsrKSB7XG4gICAgICAgIHZhciBmYWNlID0ge307XG4gICAgICAgIGZhY2UuaXNGcm9udEZhY2UgPSBmaWxlLnJlYWRJbnQzMigpID09IDE7XG4gICAgICAgIGZhY2UuaW5kaWNlcyA9IFtmaWxlLnJlYWRJbnQzMigpLCBmaWxlLnJlYWRJbnQzMigpLCBmaWxlLnJlYWRJbnQzMigpXTtcbiAgICAgICAgdGhpcy5mYWNlcy5wdXNoKGZhY2UpO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn07XG5cbk1kbC5wcm90b3R5cGUubG9hZEZyYW1lcyA9IGZ1bmN0aW9uKGZpbGUpIHtcbiAgICB0aGlzLmZyYW1lcyA9IFtdO1xuICAgIHRoaXMuYW5pbWF0aW9ucyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5mcmFtZUNvdW50OyBpKyspIHtcbiAgICAgICAgdmFyIHR5cGUgPSBmaWxlLnJlYWRJbnQzMigpO1xuICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgQWxpYXMuc2luZ2xlOlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmFuaW1hdGlvbnMubGVuZ3RoID09IDApXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9ucy5wdXNoKHsgZmlyc3RGcmFtZTogMCwgZnJhbWVDb3VudDogdGhpcy5mcmFtZUNvdW50IH0pO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5mcmFtZXMucHVzaCh0aGlzLmxvYWRTaW5nbGVGcmFtZShmaWxlKSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEFsaWFzLmdyb3VwOlxuICAgICAgICAgICAgICAgIHZhciBmcmFtZXMgPSB0aGlzLmxvYWRHcm91cEZyYW1lKGZpbGUpO1xuICAgICAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9ucy5wdXNoKHsgZmlyc3RGcmFtZTogdGhpcy5mcmFtZXMubGVuZ3RoLCBmcmFtZUNvdW50OiBmcmFtZXMubGVuZ3RoIH0pO1xuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgZiA9IDA7IGYgPCBmcmFtZXMubGVuZ3RoOyBmKyspXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZnJhbWVzLnB1c2goZnJhbWVzW2ZdKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdXYXJuaW5nOiBVbmtub3duIGZyYW1lIHR5cGU6ICcgKyB0eXBlICsgJyBmb3VuZCBpbiAnICsgdGhpcy5uYW1lKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZXNldCBmcmFtZWNvdW50ZXIgdG8gYWN0dWFsIGZ1bGwgZnJhbWVjb3VudCBpbmNsdWRpbmcgYWxsIGZsYXR0ZW4gZ3JvdXBzLlxuICAgIHRoaXMuZnJhbWVDb3VudCA9IHRoaXMuZnJhbWVzLmxlbmd0aDtcbiAgICByZXR1cm4gdHJ1ZTtcbn07XG5cbk1kbC5wcm90b3R5cGUubG9hZFNpbmdsZUZyYW1lID0gZnVuY3Rpb24oZmlsZSkge1xuICAgIHZhciBmcmFtZSA9IHt9O1xuICAgIGZyYW1lLnR5cGUgPSBBbGlhcy5zaW5nbGU7XG4gICAgZnJhbWUuYmJveCA9IFtcbiAgICAgICAgZmlsZS5yZWFkVUludDgoKSwgZmlsZS5yZWFkVUludDgoKSwgZmlsZS5yZWFkVUludDgoKSwgZmlsZS5yZWFkVUludDgoKSxcbiAgICAgICAgZmlsZS5yZWFkVUludDgoKSwgZmlsZS5yZWFkVUludDgoKSwgZmlsZS5yZWFkVUludDgoKSwgZmlsZS5yZWFkVUludDgoKVxuICAgIF07XG5cbiAgICBmcmFtZS5uYW1lID0gZmlsZS5yZWFkU3RyaW5nKDE2KTtcbiAgICBmcmFtZS52ZXJ0aWNlcyA9IFtdO1xuICAgIGZyYW1lLnBvc2VDb3VudCA9IDE7XG4gICAgZnJhbWUuaW50ZXJ2YWwgPSAwO1xuICAgIGZvciAodmFyIHYgPSAwOyB2IDwgdGhpcy52ZXJ0ZXhDb3VudDsgdisrKSB7XG4gICAgICAgIHZhciB2ZXJ0ZXggPSBbXG4gICAgICAgICAgICB0aGlzLnNjYWxlWzBdICogZmlsZS5yZWFkVUludDgoKSArIHRoaXMub3JpZ2luWzBdLFxuICAgICAgICAgICAgdGhpcy5zY2FsZVsxXSAqIGZpbGUucmVhZFVJbnQ4KCkgKyB0aGlzLm9yaWdpblsxXSxcbiAgICAgICAgICAgIHRoaXMuc2NhbGVbMl0gKiBmaWxlLnJlYWRVSW50OCgpICsgdGhpcy5vcmlnaW5bMl1dO1xuICAgICAgICBmcmFtZS52ZXJ0aWNlcy5wdXNoKFt2ZXJ0ZXhbMF0sIHZlcnRleFsxXSwgdmVydGV4WzJdXSk7XG4gICAgICAgIGZpbGUucmVhZFVJbnQ4KCk7IC8vIERvbid0IGNhcmUgYWJvdXQgbm9ybWFsIGZvciBub3dcbiAgICB9XG4gICAgcmV0dXJuIGZyYW1lO1xufTtcblxuTWRsLnByb3RvdHlwZS5sb2FkR3JvdXBGcmFtZSA9IGZ1bmN0aW9uIChmaWxlKSB7XG4gICAgdmFyIGdyb3VwRnJhbWUgPSB7fTtcbiAgICBncm91cEZyYW1lLnR5cGUgPSBBbGlhcy5ncm91cDtcbiAgICBncm91cEZyYW1lLnBvc2VDb3VudCA9IGZpbGUucmVhZFVJbnQzMigpO1xuICAgIGdyb3VwRnJhbWUuYmJveCA9IFtcbiAgICAgICAgZmlsZS5yZWFkVUludDgoKSwgZmlsZS5yZWFkVUludDgoKSwgZmlsZS5yZWFkVUludDgoKSwgZmlsZS5yZWFkVUludDgoKSxcbiAgICAgICAgZmlsZS5yZWFkVUludDgoKSwgZmlsZS5yZWFkVUludDgoKSwgZmlsZS5yZWFkVUludDgoKSwgZmlsZS5yZWFkVUludDgoKVxuICAgIF07XG5cbiAgICB2YXIgaW50ZXJ2YWxzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBncm91cEZyYW1lLnBvc2VDb3VudDsgaSsrKVxuICAgICAgICBpbnRlcnZhbHMucHVzaChmaWxlLnJlYWRGbG9hdCgpKTtcblxuICAgIHZhciBmcmFtZXMgPSBbXTtcbiAgICBmb3IgKHZhciBmID0gMDsgZiA8IGdyb3VwRnJhbWUucG9zZUNvdW50OyBmKyspIHtcbiAgICAgICAgdmFyIGZyYW1lID0gdGhpcy5sb2FkU2luZ2xlRnJhbWUoZmlsZSk7XG4gICAgICAgIGZyYW1lLmludGVydmFsID0gaW50ZXJ2YWxzW2ldO1xuICAgICAgICBmcmFtZXMucHVzaChmcmFtZSk7XG4gICAgfVxuICAgIHJldHVybiBmcmFtZXM7XG59O1xuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gTWRsO1xufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIxWWlaNVNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9mb3JtYXRzL21kbC5qc1wiLFwiL2Zvcm1hdHNcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgRmlsZSA9IHJlcXVpcmUoJ2ZpbGUnKTtcbnZhciBXYWQgPSByZXF1aXJlKCdmb3JtYXRzL3dhZCcpO1xudmFyIFBhbGV0dGUgPSByZXF1aXJlKCdmb3JtYXRzL3BhbGV0dGUnKTtcblxudmFyIFBhayA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICB2YXIgZmlsZSA9IG5ldyBGaWxlKGRhdGEpO1xuXG4gICAgaWYgKGZpbGUucmVhZFN0cmluZyg0KSAhPT0gJ1BBQ0snKVxuICAgICAgICB0aHJvdyAnRXJyb3I6IENvcnJ1cHQgUEFLIGZpbGUuJztcblxuICAgIHZhciBpbmRleE9mZnNldCA9IGZpbGUucmVhZFVJbnQzMigpO1xuICAgIHZhciBpbmRleEZpbGVDb3VudCA9IGZpbGUucmVhZFVJbnQzMigpIC8gNjQ7XG5cbiAgICBmaWxlLnNlZWsoaW5kZXhPZmZzZXQpO1xuICAgIHRoaXMuaW5kZXggPSB7fTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGluZGV4RmlsZUNvdW50OyBpKyspIHtcbiAgICAgICAgdmFyIHBhdGggPSBmaWxlLnJlYWRTdHJpbmcoNTYpO1xuICAgICAgICB2YXIgb2Zmc2V0ID0gZmlsZS5yZWFkVUludDMyKCk7XG4gICAgICAgIHZhciBzaXplID0gZmlsZS5yZWFkVUludDMyKCk7XG4gICAgICAgIHRoaXMuaW5kZXhbcGF0aF0gPSB7IG9mZnNldDogb2Zmc2V0LCBzaXplOiBzaXplIH07XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKCdQQUs6IExvYWRlZCAlaSBlbnRyaWVzLicsIGluZGV4RmlsZUNvdW50KTtcblxuICAgIHRoaXMuZmlsZSA9IGZpbGU7XG59O1xuXG5QYWsucHJvdG90eXBlLmxvYWQgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIGVudHJ5ID0gdGhpcy5pbmRleFtuYW1lXTtcbiAgICBpZiAoIWVudHJ5KVxuICAgICAgICB0aHJvdyAnRXJyb3I6IENhblxcJ3QgZmluZCBlbnRyeSBpbiBQQUs6ICcgKyBuYW1lO1xuICAgIHJldHVybiB0aGlzLmZpbGUuc2xpY2UoZW50cnkub2Zmc2V0LCBlbnRyeS5zaXplKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IFBhaztcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiMVlpWjVTXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvZm9ybWF0cy9wYWsuanNcIixcIi9mb3JtYXRzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuXG52YXIgUGFsZXR0ZSA9IGZ1bmN0aW9uKGZpbGUpIHtcbiAgICB0aGlzLmNvbG9ycyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMjU2OyBpKyspIHtcbiAgICAgICAgdGhpcy5jb2xvcnMucHVzaCh7XG4gICAgICAgICAgICByOiBmaWxlLnJlYWRVSW50OCgpLFxuICAgICAgICAgICAgZzogZmlsZS5yZWFkVUludDgoKSxcbiAgICAgICAgICAgIGI6IGZpbGUucmVhZFVJbnQ4KClcbiAgICAgICAgfSk7XG4gICAgfVxufTtcblxuUGFsZXR0ZS5wcm90b3R5cGUudW5wYWNrID0gZnVuY3Rpb24oZmlsZSwgd2lkdGgsIGhlaWdodCwgYWxwaGEpIHtcbiAgICB2YXIgcGl4ZWxzID0gbmV3IFVpbnQ4QXJyYXkoNCAqIHdpZHRoICogaGVpZ2h0KTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHdpZHRoICogaGVpZ2h0OyBpKyspIHtcbiAgICAgICAgdmFyIGluZGV4ID0gZmlsZS5yZWFkVUludDgoKTtcbiAgICAgICAgdmFyIGNvbG9yID0gdGhpcy5jb2xvcnNbaW5kZXhdO1xuICAgICAgICBwaXhlbHNbaSo0XSA9IGNvbG9yLnI7XG4gICAgICAgIHBpeGVsc1tpKjQrMV0gPSBjb2xvci5nO1xuICAgICAgICBwaXhlbHNbaSo0KzJdID0gY29sb3IuYjtcbiAgICAgICAgcGl4ZWxzW2kqNCszXSA9IChhbHBoYSAmJiAhaW5kZXgpID8gMCA6IDI1NTtcbiAgICB9XG4gICAgcmV0dXJuIHBpeGVscztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IFBhbGV0dGU7XG59KS5jYWxsKHRoaXMscmVxdWlyZShcIjFZaVo1U1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2Zvcm1hdHMvcGFsZXR0ZS5qc1wiLFwiL2Zvcm1hdHNcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG5cbnZhciBXYWQgPSBmdW5jdGlvbihmaWxlKSB7XG4gICAgdGhpcy5sdW1wcyA9IFtdO1xuICAgIGlmIChmaWxlLnJlYWRTdHJpbmcoNCkgIT09ICdXQUQyJylcbiAgICAgICAgdGhyb3cgJ0Vycm9yOiBDb3JydXB0IFdBRC1maWxlIGVuY291bnRlcmVkLic7XG5cbiAgICB2YXIgbHVtcENvdW50ID0gZmlsZS5yZWFkVUludDMyKCk7XG4gICAgdmFyIG9mZnNldCA9IGZpbGUucmVhZFVJbnQzMigpO1xuXG4gICAgZmlsZS5zZWVrKG9mZnNldCk7XG4gICAgdmFyIGluZGV4ID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsdW1wQ291bnQ7IGkrKykge1xuICAgICAgICB2YXIgb2Zmc2V0ID0gZmlsZS5yZWFkVUludDMyKCk7XG4gICAgICAgIGZpbGUuc2tpcCg0KTtcbiAgICAgICAgdmFyIHNpemUgPSBmaWxlLnJlYWRVSW50MzIoKTtcbiAgICAgICAgdmFyIHR5cGUgPSBmaWxlLnJlYWRVSW50OCgpO1xuICAgICAgICBmaWxlLnNraXAoMyk7XG4gICAgICAgIHZhciBuYW1lID0gZmlsZS5yZWFkU3RyaW5nKDE2KTtcbiAgICAgICAgaW5kZXgucHVzaCh7IG5hbWU6IG5hbWUsIG9mZnNldDogb2Zmc2V0LCBzaXplOiBzaXplIH0pO1xuICAgIH1cblxuICAgIHRoaXMubHVtcHMgPSB7fTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGluZGV4Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IGluZGV4W2ldO1xuICAgICAgICB0aGlzLmx1bXBzW2VudHJ5Lm5hbWVdID0gZmlsZS5zbGljZShlbnRyeS5vZmZzZXQsIGVudHJ5LnNpemUpO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZygnV0FEOiBMb2FkZWQgJXMgbHVtcHMuJywgbHVtcENvdW50KTtcbn07XG5cbldhZC5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBmaWxlID0gdGhpcy5sdW1wc1tuYW1lXTtcbiAgICBpZiAoIWZpbGUpXG4gICAgICAgIHRocm93ICdFcnJvcjogTm8gc3VjaCBlbnRyeSBmb3VuZCBpbiBXQUQ6ICcgKyBuYW1lO1xuICAgIHJldHVybiBmaWxlO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gV2FkO1xufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIxWWlaNVNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9mb3JtYXRzL3dhZC5qc1wiLFwiL2Zvcm1hdHNcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgdXRpbHMgPSByZXF1aXJlKCd1dGlscycpO1xuXG52YXIgVGV4dHVyZSA9IGZ1bmN0aW9uKGZpbGUsIG9wdGlvbnMpIHtcbiAgICB2YXIgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgb3B0aW9ucy5hbHBoYSA9IG9wdGlvbnMuYWxwaGEgfHwgZmFsc2U7XG4gICAgb3B0aW9ucy5mb3JtYXQgPSBvcHRpb25zLmZvcm1hdCB8fCBnbC5SR0JBO1xuICAgIG9wdGlvbnMudHlwZSA9IG9wdGlvbnMudHlwZSB8fCBnbC5VTlNJR05FRF9CWVRFO1xuICAgIG9wdGlvbnMuZmlsdGVyID0gb3B0aW9ucy5maWx0ZXIgfHwgZ2wuTElORUFSO1xuICAgIG9wdGlvbnMud3JhcCA9IG9wdGlvbnMud3JhcCB8fCBnbC5DTEFNUF9UT19FREdFO1xuXG4gICAgdGhpcy5pZCA9IGdsLmNyZWF0ZVRleHR1cmUoKTtcbiAgICB0aGlzLndpZHRoID0gb3B0aW9ucy53aWR0aCB8fCBmaWxlLnJlYWRVSW50MzIoKTtcbiAgICB0aGlzLmhlaWdodCA9IG9wdGlvbnMuaGVpZ2h0IHx8IGZpbGUucmVhZFVJbnQzMigpO1xuICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRoaXMuaWQpO1xuICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NQUdfRklMVEVSLCBvcHRpb25zLmZpbHRlcik7XG4gICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01JTl9GSUxURVIsIG9wdGlvbnMuZmlsdGVyKTtcbiAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9TLCBvcHRpb25zLndyYXApO1xuICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9XUkFQX1QsIG9wdGlvbnMud3JhcCk7XG5cbiAgICBpZiAoZmlsZSkge1xuICAgICAgICBpZiAoIW9wdGlvbnMucGFsZXR0ZSlcbiAgICAgICAgICAgIHRocm93ICdFcnJvcjogTm8gcGFsZXR0ZSBzcGVjaWZpZWQgaW4gb3B0aW9ucy4nO1xuXG4gICAgICAgIHZhciBwaXhlbHMgPSBvcHRpb25zLnBhbGV0dGUudW5wYWNrKGZpbGUsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCBvcHRpb25zLmFscGhhKTtcbiAgICAgICAgdmFyIG5wb3QgPSB1dGlscy5pc1Bvd2VyT2YyKHRoaXMud2lkdGgpICYmIHV0aWxzLmlzUG93ZXJPZjIodGhpcy5oZWlnaHQpO1xuICAgICAgICBpZiAoIW5wb3QgJiYgb3B0aW9ucy53cmFwID09PSBnbC5SRVBFQVQpIHtcbiAgICAgICAgICAgIHZhciBuZXdXaWR0aCA9IHV0aWxzLm5leHRQb3dlck9mMih0aGlzLndpZHRoKTtcbiAgICAgICAgICAgIHZhciBuZXdIZWlnaHQgPSB1dGlscy5uZXh0UG93ZXJPZjIodGhpcy5oZWlnaHQpO1xuICAgICAgICAgICAgcGl4ZWxzID0gdGhpcy5yZXNhbXBsZShwaXhlbHMsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCBuZXdXaWR0aCwgbmV3SGVpZ2h0KTtcbiAgICAgICAgICAgIGdsLnRleEltYWdlMkQoZ2wuVEVYVFVSRV8yRCwgMCwgb3B0aW9ucy5mb3JtYXQsIG5ld1dpZHRoLCBuZXdIZWlnaHQsXG4gICAgICAgICAgICAgICAgMCwgb3B0aW9ucy5mb3JtYXQsIG9wdGlvbnMudHlwZSwgcGl4ZWxzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGdsLnRleEltYWdlMkQoZ2wuVEVYVFVSRV8yRCwgMCwgb3B0aW9ucy5mb3JtYXQsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LFxuICAgICAgICAgICAgICAgIDAsIG9wdGlvbnMuZm9ybWF0LCBvcHRpb25zLnR5cGUsIHBpeGVscyk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBnbC50ZXhJbWFnZTJEKGdsLlRFWFRVUkVfMkQsIDAsIG9wdGlvbnMuZm9ybWF0LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCxcbiAgICAgICAgICAgIDAsIG9wdGlvbnMuZm9ybWF0LCBvcHRpb25zLnR5cGUsIG51bGwpO1xuICAgIH1cbn07XG5cblRleHR1cmUucHJvdG90eXBlLmRyYXdUbyA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgIHZhciB2ID0gZ2wuZ2V0UGFyYW1ldGVyKGdsLlZJRVdQT1JUKTtcblxuICAgIC8qIFNldHVwIHNoYXJlZCBidWZmZXJzIGZvciByZW5kZXIgdGFyZ2V0IGRyYXdpbmcgKi9cbiAgICBpZiAodHlwZW9mIFRleHR1cmUuZnJhbWVCdWZmZXIgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgVGV4dHVyZS5mcmFtZUJ1ZmZlciA9IGdsLmNyZWF0ZUZyYW1lYnVmZmVyKCk7XG4gICAgICAgIFRleHR1cmUucmVuZGVyQnVmZmVyID0gZ2wuY3JlYXRlUmVuZGVyYnVmZmVyKCk7XG4gICAgfVxuXG4gICAgZ2wuYmluZEZyYW1lYnVmZmVyKGdsLkZSQU1FQlVGRkVSLCBUZXh0dXJlLmZyYW1lQnVmZmVyKTtcbiAgICBnbC5iaW5kUmVuZGVyYnVmZmVyKGdsLlJFTkRFUkJVRkZFUiwgVGV4dHVyZS5yZW5kZXJCdWZmZXIpO1xuICAgIGlmICh0aGlzLndpZHRoICE9IFRleHR1cmUucmVuZGVyQnVmZmVyLndpZHRoIHx8IHRoaXMuaGVpZ2h0ICE9IFRleHR1cmUucmVuZGVyQnVmZmVyLmhlaWdodCkge1xuICAgICAgICBUZXh0dXJlLnJlbmRlckJ1ZmZlci53aWR0aCA9IHRoaXMud2lkdGg7XG4gICAgICAgIFRleHR1cmUucmVuZGVyQnVmZmVyLmhlaWdodCA9IHRoaXMuaGVpZ2h0O1xuICAgICAgICBnbC5yZW5kZXJidWZmZXJTdG9yYWdlKGdsLlJFTkRFUkJVRkZFUiwgZ2wuREVQVEhfQ09NUE9ORU5UMTYsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcbiAgICB9XG5cblxuICAgIGdsLmZyYW1lYnVmZmVyVGV4dHVyZTJEKGdsLkZSQU1FQlVGRkVSLCBnbC5DT0xPUl9BVFRBQ0hNRU5UMCwgZ2wuVEVYVFVSRV8yRCwgdGhpcy5pZCwgMCk7XG4gICAgZ2wuZnJhbWVidWZmZXJSZW5kZXJidWZmZXIoZ2wuRlJBTUVCVUZGRVIsIGdsLkRFUFRIX0FUVEFDSE1FTlQsIGdsLlJFTkRFUkJVRkZFUiwgVGV4dHVyZS5yZW5kZXJCdWZmZXIpO1xuICAgIGdsLnZpZXdwb3J0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcblxuICAgIHZhciBwcm9qZWN0aW9uTWF0cml4ID0gbWF0NC5vcnRobyhtYXQ0LmNyZWF0ZSgpLCAwLCB0aGlzLndpZHRoLCAwLCB0aGlzLmhlaWdodCwgLTEwLCAxMCk7XG4gICAgY2FsbGJhY2socHJvamVjdGlvbk1hdHJpeCk7XG5cbiAgICBnbC5iaW5kRnJhbWVidWZmZXIoZ2wuRlJBTUVCVUZGRVIsIG51bGwpO1xuICAgIGdsLmJpbmRSZW5kZXJidWZmZXIoZ2wuUkVOREVSQlVGRkVSLCBudWxsKTtcbiAgICBnbC52aWV3cG9ydCh2WzBdLCB2WzFdLCB2WzJdLCB2WzNdKTtcbn07XG5cblRleHR1cmUucHJvdG90eXBlLnJlc2FtcGxlID0gZnVuY3Rpb24ocGl4ZWxzLCB3aWR0aCwgaGVpZ2h0LCBuZXdXaWR0aCwgbmV3SGVpZ2h0KSB7XG4gICAgdmFyIHNyYyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgIHNyYy53aWR0aCA9IHdpZHRoO1xuICAgIHNyYy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgdmFyIGNvbnRleHQgPSBzcmMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICB2YXIgaW1hZ2VEYXRhID0gY29udGV4dC5jcmVhdGVJbWFnZURhdGEod2lkdGgsIGhlaWdodCk7XG4gICAgaW1hZ2VEYXRhLmRhdGEuc2V0KHBpeGVscyk7XG4gICAgY29udGV4dC5wdXRJbWFnZURhdGEoaW1hZ2VEYXRhLCAwLCAwKTtcblxuICAgIHZhciBkZXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgZGVzdC53aWR0aCA9IG5ld1dpZHRoO1xuICAgIGRlc3QuaGVpZ2h0ID0gbmV3SGVpZ2h0O1xuICAgIGNvbnRleHQgPSBkZXN0LmdldENvbnRleHQoJzJkJyk7XG4gICAgY29udGV4dC5kcmF3SW1hZ2Uoc3JjLCAwLCAwLCBkZXN0LndpZHRoLCBkZXN0LmhlaWdodCk7XG4gICAgdmFyIGltYWdlID0gY29udGV4dC5nZXRJbWFnZURhdGEoMCwgMCwgZGVzdC53aWR0aCwgZGVzdC5oZWlnaHQpO1xuICAgIHJldHVybiBuZXcgVWludDhBcnJheShpbWFnZS5kYXRhKTtcbn07XG5cblRleHR1cmUucHJvdG90eXBlLmJpbmQgPSBmdW5jdGlvbih1bml0KSB7XG4gICAgZ2wuYWN0aXZlVGV4dHVyZShnbC5URVhUVVJFMCArICh1bml0IHx8IDApKTtcbiAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCB0aGlzLmlkKTtcbn07XG5cblRleHR1cmUucHJvdG90eXBlLnVuYmluZCA9IGZ1bmN0aW9uKHVuaXQpIHtcbiAgICBnbC5hY3RpdmVUZXh0dXJlKGdsLlRFWFRVUkUwICsgKHVuaXQgfHwgMCkpO1xuICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIG51bGwpO1xufTtcblxuVGV4dHVyZS5wcm90b3R5cGUuYXNEYXRhVXJsID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGZyYW1lYnVmZmVyID0gZ2wuY3JlYXRlRnJhbWVidWZmZXIoKTtcbiAgICBnbC5iaW5kRnJhbWVidWZmZXIoZ2wuRlJBTUVCVUZGRVIsIGZyYW1lYnVmZmVyKTtcbiAgICBnbC5mcmFtZWJ1ZmZlclRleHR1cmUyRChnbC5GUkFNRUJVRkZFUiwgZ2wuQ09MT1JfQVRUQUNITUVOVDAsIGdsLlRFWFRVUkVfMkQsIHRoaXMuaWQsIDApO1xuXG4gICAgdmFyIHdpZHRoID0gdGhpcy53aWR0aDtcbiAgICB2YXIgaGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XG5cbiAgICAvLyBSZWFkIHRoZSBjb250ZW50cyBvZiB0aGUgZnJhbWVidWZmZXJcbiAgICB2YXIgZGF0YSA9IG5ldyBVaW50OEFycmF5KHdpZHRoICogaGVpZ2h0ICogNCk7XG4gICAgZ2wucmVhZFBpeGVscygwLCAwLCB3aWR0aCwgaGVpZ2h0LCBnbC5SR0JBLCBnbC5VTlNJR05FRF9CWVRFLCBkYXRhKTtcbiAgICBnbC5kZWxldGVGcmFtZWJ1ZmZlcihmcmFtZWJ1ZmZlcik7XG5cbiAgICAvLyBDcmVhdGUgYSAyRCBjYW52YXMgdG8gc3RvcmUgdGhlIHJlc3VsdFxuICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICBjYW52YXMud2lkdGggPSB3aWR0aDtcbiAgICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgIHZhciBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbiAgICAvLyBDb3B5IHRoZSBwaXhlbHMgdG8gYSAyRCBjYW52YXNcbiAgICB2YXIgaW1hZ2VEYXRhID0gY29udGV4dC5jcmVhdGVJbWFnZURhdGEod2lkdGgsIGhlaWdodCk7XG4gICAgaW1hZ2VEYXRhLmRhdGEuc2V0KGRhdGEpO1xuICAgIGNvbnRleHQucHV0SW1hZ2VEYXRhKGltYWdlRGF0YSwgMCwgMCk7XG4gICAgcmV0dXJuIGNhbnZhcy50b0RhdGFVUkwoKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IFRleHR1cmU7XG59KS5jYWxsKHRoaXMscmVxdWlyZShcIjFZaVo1U1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2dsL1RleHR1cmUuanNcIixcIi9nbFwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbnZhciBUZXh0dXJlID0gcmVxdWlyZSgnZ2wvdGV4dHVyZScpO1xuXG52YXIgQXRsYXMgPSBmdW5jdGlvbiAod2lkdGgsIGhlaWdodCkge1xuICAgIHRoaXMud2lkdGggPSB3aWR0aCB8fCA1MTI7XG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQgfHwgNTEyO1xuICAgIHRoaXMudHJlZSA9IHsgY2hpbGRyZW46IFtdLCB4OiAwLCB5OiAwLCB3aWR0aDogd2lkdGgsIGhlaWdodDogaGVpZ2h0IH07XG4gICAgdGhpcy5zdWJUZXh0dXJlcyA9IFtdO1xuICAgIHRoaXMudGV4dHVyZSA9IG51bGw7XG59O1xuXG5BdGxhcy5wcm90b3R5cGUuZ2V0U3ViVGV4dHVyZSA9IGZ1bmN0aW9uIChzdWJUZXh0dXJlSWQpIHtcbiAgICByZXR1cm4gdGhpcy5zdWJUZXh0dXJlc1tzdWJUZXh0dXJlSWRdO1xufTtcblxuQXRsYXMucHJvdG90eXBlLmFkZFN1YlRleHR1cmUgPSBmdW5jdGlvbiAodGV4dHVyZSkge1xuICAgIHZhciBub2RlID0gdGhpcy5nZXRGcmVlTm9kZSh0aGlzLnRyZWUsIHRleHR1cmUpO1xuICAgIGlmIChub2RlID09IG51bGwpXG4gICAgICAgIHRocm93ICdFcnJvcjogVW5hYmxlIHRvIHBhY2sgc3ViIHRleHR1cmUhIEl0IHNpbXBseSB3b25cXCd0IGZpdC4gOi8nO1xuICAgIG5vZGUudGV4dHVyZSA9IHRleHR1cmU7XG4gICAgdGhpcy5zdWJUZXh0dXJlcy5wdXNoKHtcbiAgICAgICAgdGV4dHVyZTogbm9kZS50ZXh0dXJlLFxuICAgICAgICB4OiBub2RlLngsIHk6IG5vZGUueSxcbiAgICAgICAgd2lkdGg6IG5vZGUud2lkdGgsIGhlaWdodDogbm9kZS5oZWlnaHQsXG4gICAgICAgIHMxOiBub2RlLnggLyB0aGlzLnRyZWUud2lkdGgsXG4gICAgICAgIHQxOiBub2RlLnkgLyB0aGlzLnRyZWUuaGVpZ2h0LFxuICAgICAgICBzMjogKG5vZGUueCArIG5vZGUud2lkdGgpIC8gdGhpcy50cmVlLndpZHRoLFxuICAgICAgICB0MjogKG5vZGUueSArIG5vZGUuaGVpZ2h0KSAvIHRoaXMudHJlZS5oZWlnaHRcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcy5zdWJUZXh0dXJlcy5sZW5ndGggLSAxO1xufTtcblxuQXRsYXMucHJvdG90eXBlLnJldXNlU3ViVGV4dHVyZSA9IGZ1bmN0aW9uIChzMSwgdDEsIHMyLCB0Mikge1xuICAgIHRoaXMuc3ViVGV4dHVyZXMucHVzaCh7IHMxOiBzMSwgdDE6IHQxLCBzMjogczIsIHQyOiB0MiB9KTtcbn07XG5cbkF0bGFzLnByb3RvdHlwZS5jb21waWxlID0gZnVuY3Rpb24oc2hhZGVyKSB7XG5cbiAgICB2YXIgYnVmZmVyID0gbmV3IEZsb2F0MzJBcnJheSh0aGlzLnN1YlRleHR1cmVzLmxlbmd0aCAqIDYgKiA1KTsgLy8geCx5LHoscyx0XG4gICAgdmFyIHdpZHRoID0gdGhpcy50cmVlLndpZHRoO1xuICAgIHZhciBoZWlnaHQgPSB0aGlzLnRyZWUuaGVpZ2h0O1xuICAgIHZhciBvZmZzZXQgPSAwO1xuICAgIHZhciBzdWJUZXh0dXJlcyA9IHRoaXMuc3ViVGV4dHVyZXM7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdWJUZXh0dXJlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgc3ViVGV4dHVyZSA9IHN1YlRleHR1cmVzW2ldO1xuICAgICAgICB0aGlzLmFkZFNwcml0ZShidWZmZXIsIG9mZnNldCxcbiAgICAgICAgICAgIHN1YlRleHR1cmUueCwgc3ViVGV4dHVyZS55LFxuICAgICAgICAgICAgc3ViVGV4dHVyZS53aWR0aCwgc3ViVGV4dHVyZS5oZWlnaHQpO1xuICAgICAgICBvZmZzZXQgKz0gKDYgKiA1KTtcbiAgICB9XG5cbiAgICB2YXIgdmVydGV4QnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHZlcnRleEJ1ZmZlcik7XG4gICAgZ2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIGJ1ZmZlciwgZ2wuU1RBVElDX0RSQVcpO1xuXG4gICAgdmFyIHRleHR1cmUgPSBuZXcgVGV4dHVyZShudWxsLCB7IHdpZHRoOiB3aWR0aCwgaGVpZ2h0OiBoZWlnaHQvKiwgZmlsdGVyOiBnbC5ORUFSRVNUICovIH0pO1xuICAgIHRleHR1cmUuZHJhd1RvKGZ1bmN0aW9uIChwcm9qZWN0aW9uTWF0cml4KSB7XG4gICAgICAgIHNoYWRlci51c2UoKTtcbiAgICAgICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoc2hhZGVyLmF0dHJpYnV0ZXMudmVydGV4QXR0cmlidXRlKTtcbiAgICAgICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoc2hhZGVyLmF0dHJpYnV0ZXMudGV4Q29vcmRzQXR0cmlidXRlKTtcbiAgICAgICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihzaGFkZXIuYXR0cmlidXRlcy52ZXJ0ZXhBdHRyaWJ1dGUsIDMsIGdsLkZMT0FULCBmYWxzZSwgMjAsIDApO1xuICAgICAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKHNoYWRlci5hdHRyaWJ1dGVzLnRleENvb3Jkc0F0dHJpYnV0ZSwgMiwgZ2wuRkxPQVQsIGZhbHNlLCAyMCwgMTIpO1xuICAgICAgICBnbC51bmlmb3JtTWF0cml4NGZ2KHNoYWRlci51bmlmb3Jtcy5wcm9qZWN0aW9uTWF0cml4LCBmYWxzZSwgcHJvamVjdGlvbk1hdHJpeCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3ViVGV4dHVyZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBzdWJUZXh0dXJlID0gc3ViVGV4dHVyZXNbaV07XG4gICAgICAgICAgICBpZiAoIXN1YlRleHR1cmUudGV4dHVyZSlcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgc3ViVGV4dHVyZS50ZXh0dXJlLmlkKTtcbiAgICAgICAgICAgIGdsLmRyYXdBcnJheXMoZ2wuVFJJQU5HTEVTLCBpICogNiwgNik7XG5cbiAgICAgICAgICAgIGdsLmRlbGV0ZVRleHR1cmUoc3ViVGV4dHVyZS50ZXh0dXJlLmlkKTtcbiAgICAgICAgICAgIHN1YlRleHR1cmUudGV4dHVyZSA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLnRleHR1cmUgPSB0ZXh0dXJlO1xuICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBudWxsKTtcbiAgICBnbC5kZWxldGVCdWZmZXIodmVydGV4QnVmZmVyKTtcbiAgICB0aGlzLnRyZWUgPSBudWxsO1xufTtcblxuQXRsYXMucHJvdG90eXBlLmFkZFNwcml0ZSA9IGZ1bmN0aW9uIChkYXRhLCBvZmZzZXQsIHgsIHksIHdpZHRoLCBoZWlnaHQpIHtcbiAgICB2YXIgeiA9IDA7XG4gICAgZGF0YVtvZmZzZXQgKyAwXSA9IHg7IGRhdGFbb2Zmc2V0ICsgMV0gPSB5OyBkYXRhW29mZnNldCArIDJdID0gejtcbiAgICBkYXRhW29mZnNldCArIDNdID0gMDsgZGF0YVtvZmZzZXQgKyA0XSA9IDA7XG4gICAgZGF0YVtvZmZzZXQgKyA1XSA9IHggKyB3aWR0aDsgZGF0YVtvZmZzZXQgKyA2XSA9IHk7IGRhdGFbb2Zmc2V0ICsgN10gPSB6O1xuICAgIGRhdGFbb2Zmc2V0ICsgOF0gPSAxOyBkYXRhW29mZnNldCArIDldID0gMDtcbiAgICBkYXRhW29mZnNldCArIDEwXSA9IHggKyB3aWR0aDsgZGF0YVtvZmZzZXQgKyAxMV0gPSB5ICsgaGVpZ2h0OyBkYXRhW29mZnNldCArIDEyXSA9IHo7XG4gICAgZGF0YVtvZmZzZXQgKyAxM10gPSAxOyBkYXRhW29mZnNldCArIDE0XSA9IDE7XG4gICAgZGF0YVtvZmZzZXQgKyAxNV0gPSB4ICsgd2lkdGg7IGRhdGFbb2Zmc2V0ICsgMTZdID0geSArIGhlaWdodDsgZGF0YVtvZmZzZXQgKyAxN10gPSB6O1xuICAgIGRhdGFbb2Zmc2V0ICsgMThdID0gMTsgZGF0YVtvZmZzZXQgKyAxOV0gPSAxO1xuICAgIGRhdGFbb2Zmc2V0ICsgMjBdID0geDsgZGF0YVtvZmZzZXQgKyAyMV0gPSB5ICsgaGVpZ2h0OyBkYXRhW29mZnNldCArIDIyXSA9IHo7XG4gICAgZGF0YVtvZmZzZXQgKyAyM10gPSAwOyBkYXRhW29mZnNldCArIDI0XSA9IDE7XG4gICAgZGF0YVtvZmZzZXQgKyAyNV0gPSB4OyBkYXRhW29mZnNldCArIDI2XSA9IHk7IGRhdGFbb2Zmc2V0ICsgMjddID0gejtcbiAgICBkYXRhW29mZnNldCArIDI4XSA9IDA7IGRhdGFbb2Zmc2V0ICsgMjldID0gMDtcbn07XG5cbkF0bGFzLnByb3RvdHlwZS5nZXRGcmVlTm9kZSA9IGZ1bmN0aW9uIChub2RlLCB0ZXh0dXJlKSB7XG4gICAgaWYgKG5vZGUuY2hpbGRyZW5bMF0gfHwgbm9kZS5jaGlsZHJlblsxXSkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gdGhpcy5nZXRGcmVlTm9kZShub2RlLmNoaWxkcmVuWzBdLCB0ZXh0dXJlKTtcbiAgICAgICAgaWYgKHJlc3VsdClcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RnJlZU5vZGUobm9kZS5jaGlsZHJlblsxXSwgdGV4dHVyZSk7XG4gICAgfVxuXG4gICAgaWYgKG5vZGUudGV4dHVyZSlcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgaWYgKG5vZGUud2lkdGggPCB0ZXh0dXJlLndpZHRoIHx8IG5vZGUuaGVpZ2h0IDwgdGV4dHVyZS5oZWlnaHQpXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIGlmIChub2RlLndpZHRoID09IHRleHR1cmUud2lkdGggJiYgbm9kZS5oZWlnaHQgPT0gdGV4dHVyZS5oZWlnaHQpXG4gICAgICAgIHJldHVybiBub2RlO1xuXG4gICAgdmFyIGR3ID0gbm9kZS53aWR0aCAtIHRleHR1cmUud2lkdGg7XG4gICAgdmFyIGRoID0gbm9kZS5oZWlnaHQgLSB0ZXh0dXJlLmhlaWdodDtcblxuICAgIGlmIChkdyA+IGRoKSB7XG4gICAgICAgIG5vZGUuY2hpbGRyZW5bMF0gPSB7IGNoaWxkcmVuOiBbbnVsbCwgbnVsbF0sXG4gICAgICAgICAgICB4OiBub2RlLngsXG4gICAgICAgICAgICB5OiBub2RlLnksXG4gICAgICAgICAgICB3aWR0aDogdGV4dHVyZS53aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogbm9kZS5oZWlnaHRcbiAgICAgICAgfTtcbiAgICAgICAgbm9kZS5jaGlsZHJlblsxXSA9IHsgY2hpbGRyZW46IFtudWxsLCBudWxsXSxcbiAgICAgICAgICAgIHg6IG5vZGUueCArIHRleHR1cmUud2lkdGgsXG4gICAgICAgICAgICB5OiBub2RlLnksXG4gICAgICAgICAgICB3aWR0aDogbm9kZS53aWR0aCAtIHRleHR1cmUud2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IG5vZGUuaGVpZ2h0XG4gICAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbm9kZS5jaGlsZHJlblswXSA9IHsgY2hpbGRyZW46IFtudWxsLCBudWxsXSxcbiAgICAgICAgICAgIHg6IG5vZGUueCxcbiAgICAgICAgICAgIHk6IG5vZGUueSxcbiAgICAgICAgICAgIHdpZHRoOiBub2RlLndpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiB0ZXh0dXJlLmhlaWdodFxuICAgICAgICB9O1xuICAgICAgICBub2RlLmNoaWxkcmVuWzFdID0geyBjaGlsZHJlbjogW251bGwsIG51bGxdLFxuICAgICAgICAgICAgeDogbm9kZS54LFxuICAgICAgICAgICAgeTogbm9kZS55ICsgdGV4dHVyZS5oZWlnaHQsXG4gICAgICAgICAgICB3aWR0aDogbm9kZS53aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogbm9kZS5oZWlnaHQgLSB0ZXh0dXJlLmhlaWdodFxuICAgICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5nZXRGcmVlTm9kZShub2RlLmNoaWxkcmVuWzBdLCB0ZXh0dXJlKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IEF0bGFzO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIjFZaVo1U1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2dsL2F0bGFzLmpzXCIsXCIvZ2xcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG5cbnZhciBGb250ID0gZnVuY3Rpb24gKHRleHR1cmUsIGNoYXJXaWR0aCwgY2hhckhlaWdodCkge1xuICAgIHRoaXMudGV4dHVyZSA9IHRleHR1cmU7XG4gICAgdGhpcy5jaGFyV2lkdGggPSBjaGFyV2lkdGggfHwgODtcbiAgICB0aGlzLmNoYXJIZWlnaHQgPSBjaGFySGVpZ2h0IHx8IDg7XG4gICAgdGhpcy5kYXRhID0gbmV3IEZsb2F0MzJBcnJheSg2ICogNSAqIDQgKiAxMDI0KTsgLy8gPD0gMTAyNCBtYXggY2hhcmFjdGVycy5cbiAgICB0aGlzLnZlcnRleEJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xuICAgIHRoaXMudmVydGV4QnVmZmVyLm5hbWUgPSAnc3ByaXRlRm9udCc7XG4gICAgdGhpcy5vZmZzZXQgPSAwO1xuICAgIHRoaXMuZWxlbWVudENvdW50ID0gMDtcbn07XG5cbkZvbnQucHJvdG90eXBlLmFkZFZlcnRleCA9IGZ1bmN0aW9uKHgsIHksIHUsIHYpIHtcbiAgICB0aGlzLmRhdGFbdGhpcy5vZmZzZXQrK10gPSB4O1xuICAgIHRoaXMuZGF0YVt0aGlzLm9mZnNldCsrXSA9IHk7XG4gICAgdGhpcy5kYXRhW3RoaXMub2Zmc2V0KytdID0gMDtcbiAgICB0aGlzLmRhdGFbdGhpcy5vZmZzZXQrK10gPSB1O1xuICAgIHRoaXMuZGF0YVt0aGlzLm9mZnNldCsrXSA9IHY7XG59O1xuXG5Gb250LnByb3RvdHlwZS5kcmF3Q2hhcmFjdGVyID0gZnVuY3Rpb24oeCwgeSwgaW5kZXgpIHtcbiAgICBpZiAoaW5kZXggPT0gMzIgfHwgeSA8IDAgfHwgeCA8IDAgfHwgeCA+IGdsLndpZHRoIHx8IHkgPiBnbC5oZWlnaHQpXG4gICAgICAgIHJldHVybjtcblxuICAgIGluZGV4ICY9IDI1NTtcbiAgICB2YXIgcm93ID0gaW5kZXggPj4gNDtcbiAgICB2YXIgY29sdW1uID0gaW5kZXggJiAxNTtcblxuICAgIHZhciBmcm93ID0gcm93ICogMC4wNjI1O1xuICAgIHZhciBmY29sID0gY29sdW1uICogMC4wNjI1O1xuICAgIHZhciBzaXplID0gMC4wNjI1O1xuXG4gICAgdGhpcy5hZGRWZXJ0ZXgoeCwgeSwgZmNvbCwgZnJvdyk7XG4gICAgdGhpcy5hZGRWZXJ0ZXgoeCArIHRoaXMuY2hhcldpZHRoLCB5LCBmY29sICsgc2l6ZSwgZnJvdyk7XG4gICAgdGhpcy5hZGRWZXJ0ZXgoeCArIHRoaXMuY2hhcldpZHRoLCB5ICsgdGhpcy5jaGFySGVpZ2h0LCBmY29sICsgc2l6ZSwgIGZyb3cgKyBzaXplKTtcbiAgICB0aGlzLmFkZFZlcnRleCh4ICsgdGhpcy5jaGFyV2lkdGgsIHkgKyB0aGlzLmNoYXJIZWlnaHQsIGZjb2wgKyBzaXplLCAgZnJvdyArIHNpemUpO1xuICAgIHRoaXMuYWRkVmVydGV4KHgsIHkgKyB0aGlzLmNoYXJIZWlnaHQsIGZjb2wsIGZyb3cgKyBzaXplKTtcbiAgICB0aGlzLmFkZFZlcnRleCh4LCB5LCBmY29sLCBmcm93KTtcbiAgICB0aGlzLmVsZW1lbnRDb3VudCArPSA2O1xufTtcblxuRm9udC5wcm90b3R5cGUuZHJhd1N0cmluZyA9IGZ1bmN0aW9uKHgsIHksIHN0ciwgbW9kZSkge1xuICAgIHZhciBvZmZzZXQgPSBtb2RlID8gMTI4IDogMDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKylcbiAgICAgICAgdGhpcy5kcmF3Q2hhcmFjdGVyKHggKyAoKGkgKyAxKSAqIHRoaXMuY2hhcldpZHRoKSwgeSwgc3RyLmNoYXJDb2RlQXQoaSkgKyBvZmZzZXQpO1xufTtcblxuRm9udC5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oc2hhZGVyLCBwKSB7XG4gICAgaWYgKCF0aGlzLmVsZW1lbnRDb3VudClcbiAgICAgICAgcmV0dXJuO1xuXG4gICAgc2hhZGVyLnVzZSgpO1xuICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLnZlcnRleEJ1ZmZlcik7XG4gICAgZ2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIHRoaXMuZGF0YSwgZ2wuU1RSRUFNX0RSQVcpO1xuICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIoc2hhZGVyLmF0dHJpYnV0ZXMudmVydGV4QXR0cmlidXRlLCAzLCBnbC5GTE9BVCwgZmFsc2UsIDIwLCAwKTtcbiAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKHNoYWRlci5hdHRyaWJ1dGVzLnRleENvb3Jkc0F0dHJpYnV0ZSwgMiwgZ2wuRkxPQVQsIGZhbHNlLCAyMCwgMTIpO1xuICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHNoYWRlci5hdHRyaWJ1dGVzLnZlcnRleEF0dHJpYnV0ZSk7XG4gICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoc2hhZGVyLmF0dHJpYnV0ZXMudGV4Q29vcmRzQXR0cmlidXRlKTtcblxuICAgIGdsLnVuaWZvcm1NYXRyaXg0ZnYoc2hhZGVyLnVuaWZvcm1zLnByb2plY3Rpb25NYXRyaXgsIGZhbHNlLCBwKTtcblxuICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRoaXMudGV4dHVyZS5pZCk7XG4gICAgZ2wuZHJhd0FycmF5cyhnbC5UUklBTkdMRVMsIDAsIHRoaXMuZWxlbWVudENvdW50KTtcblxuXG4gICAgdGhpcy5lbGVtZW50Q291bnQgPSAwO1xuICAgIHRoaXMub2Zmc2V0ID0gMDtcblxuICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIG51bGwpO1xuICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBudWxsKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IEZvbnQ7XG59KS5jYWxsKHRoaXMscmVxdWlyZShcIjFZaVo1U1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2dsL2ZvbnQuanNcIixcIi9nbFwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbnZhciBnbE1hdHJpeCA9IHJlcXVpcmUoJ2xpYi9nbC1tYXRyaXgtbWluLmpzJyk7XG5cbnZhciBnbCA9IGZ1bmN0aW9uKCkge307XG5cbmdsLmluaXQgPSBmdW5jdGlvbihpZCkge1xuXG4gICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcbiAgICBpZiAoIWNhbnZhcylcbiAgICAgICAgdGhyb3cgJ0Vycm9yOiBObyBjYW52YXMgZWxlbWVudCBmb3VuZC4nO1xuXG4gICAgdmFyIG9wdGlvbnMgPSB7fTtcbiAgICB2YXIgZ2wgPSBjYW52YXMuZ2V0Q29udGV4dCgnd2ViZ2wnLCBvcHRpb25zKTtcbiAgICBpZiAoIWdsKVxuICAgICAgICB0aHJvdyAnRXJyb3I6IE5vIFdlYkdMIHN1cHBvcnQgZm91bmQuJztcblx0Y2FudmFzLndpZHRoICA9IHdpbmRvdy5pbm5lcldpZHRoO1xuXHRjYW52YXMuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuXG5cbiAgICBnbC53aWR0aCA9IGNhbnZhcy53aWR0aDtcbiAgICBnbC5oZWlnaHQgPSBjYW52YXMuaGVpZ2h0O1xuICAgIGdsLmNsZWFyQ29sb3IoMCwgMCwgMCwgMSk7XG4gICAgZ2wuYmxlbmRGdW5jKGdsLlNSQ19BTFBIQSwgZ2wuT05FX01JTlVTX1NSQ19BTFBIQSk7XG4gICAgZ2wuZGVwdGhGdW5jKGdsLkxFUVVBTCk7XG4gICAgLy9nbC5jdWxsRmFjZShnbC5GUk9OVCk7XG4gICAgZ2wudmlld3BvcnQoMCwgMCwgZ2wud2lkdGgsIGdsLmhlaWdodCk7XG5cbiAgICB3aW5kb3cudmVjMiA9IGdsTWF0cml4LnZlYzI7XG4gICAgd2luZG93LnZlYzMgPSBnbE1hdHJpeC52ZWMzO1xuICAgIHdpbmRvdy5tYXQ0ID0gZ2xNYXRyaXgubWF0NDtcbiAgICB3aW5kb3cuZ2wgPSBnbDtcblxuICAgIHJldHVybiBnbDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IGdsO1xuXG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiMVlpWjVTXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvZ2wvZ2wuanNcIixcIi9nbFwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcblxudmFyIExpZ2h0TWFwID0gZnVuY3Rpb24oZGF0YSwgb2Zmc2V0LCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgIHRoaXMuaWQgPSBnbC5jcmVhdGVUZXh0dXJlKCk7XG5cbiAgICB2YXIgcGl4ZWxzID0gbmV3IFVpbnQ4QXJyYXkod2lkdGggKiBoZWlnaHQgKiAzKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHdpZHRoICogaGVpZ2h0OyBpKyspIHtcbiAgICAgICAgdmFyIGludGVuc2l0eSA9IGRhdGFbb2Zmc2V0ICsgaV07XG4gICAgICAgIGludGVuc2l0eSA9ICFpbnRlbnNpdHkgPyAwIDogaW50ZW5zaXR5O1xuICAgICAgICBwaXhlbHNbaSAqIDMgKyAwXSA9IGludGVuc2l0eTtcbiAgICAgICAgcGl4ZWxzW2kgKiAzICsgMV0gPSBpbnRlbnNpdHk7XG4gICAgICAgIHBpeGVsc1tpICogMyArIDJdID0gaW50ZW5zaXR5O1xuICAgIH1cblxuICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRoaXMuaWQpO1xuICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NQUdfRklMVEVSLCBnbC5MSU5FQVIpO1xuICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NSU5fRklMVEVSLCBnbC5MSU5FQVIpO1xuICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9XUkFQX1MsIGdsLkNMQU1QX1RPX0VER0UpO1xuICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9XUkFQX1QsIGdsLkNMQU1QX1RPX0VER0UpO1xuXG4gICAgZ2wudGV4SW1hZ2UyRChnbC5URVhUVVJFXzJELCAwLCBnbC5SR0IsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCAwLCBnbC5SR0IsIGdsLlVOU0lHTkVEX0JZVEUsIHBpeGVscyk7XG59O1xuXG5MaWdodE1hcC5wcm90b3R5cGUuYmluZCA9IGZ1bmN0aW9uKHVuaXQpIHtcbiAgICBnbC5hY3RpdmVUZXh0dXJlKGdsLlRFWFRVUkUwICsgKHVuaXQgfHwgMCkpO1xuICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRoaXMuaWQpO1xufTtcblxuTGlnaHRNYXAucHJvdG90eXBlLnVuYmluZCA9IGZ1bmN0aW9uKHVuaXQpIHtcbiAgICBnbC5hY3RpdmVUZXh0dXJlKGdsLlRFWFRVUkUwICsgKHVuaXQgfHwgMCkpO1xuICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIG51bGwpO1xufTtcblxuTGlnaHRNYXAucHJvdG90eXBlLmFzRGF0YVVybCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBmcmFtZWJ1ZmZlciA9IGdsLmNyZWF0ZUZyYW1lYnVmZmVyKCk7XG4gICAgZ2wuYmluZEZyYW1lYnVmZmVyKGdsLkZSQU1FQlVGRkVSLCBmcmFtZWJ1ZmZlcik7XG4gICAgZ2wuZnJhbWVidWZmZXJUZXh0dXJlMkQoZ2wuRlJBTUVCVUZGRVIsIGdsLkNPTE9SX0FUVEFDSE1FTlQwLCBnbC5URVhUVVJFXzJELCB0aGlzLmlkLCAwKTtcblxuICAgIHZhciB3aWR0aCA9IHRoaXMud2lkdGg7XG4gICAgdmFyIGhlaWdodCA9IHRoaXMuaGVpZ2h0O1xuXG4gICAgLy8gUmVhZCB0aGUgY29udGVudHMgb2YgdGhlIGZyYW1lYnVmZmVyXG4gICAgdmFyIGRhdGEgPSBuZXcgVWludDhBcnJheSh3aWR0aCAqIGhlaWdodCAqIDQpO1xuICAgIGdsLnJlYWRQaXhlbHMoMCwgMCwgd2lkdGgsIGhlaWdodCwgZ2wuUkdCQSwgZ2wuVU5TSUdORURfQllURSwgZGF0YSk7XG4gICAgZ2wuZGVsZXRlRnJhbWVidWZmZXIoZnJhbWVidWZmZXIpO1xuXG4gICAgLy8gQ3JlYXRlIGEgMkQgY2FudmFzIHRvIHN0b3JlIHRoZSByZXN1bHRcbiAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgY2FudmFzLndpZHRoID0gd2lkdGg7XG4gICAgY2FudmFzLmhlaWdodCA9IGhlaWdodDtcbiAgICB2YXIgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgLy8gQ29weSB0aGUgcGl4ZWxzIHRvIGEgMkQgY2FudmFzXG4gICAgdmFyIGltYWdlRGF0YSA9IGNvbnRleHQuY3JlYXRlSW1hZ2VEYXRhKHdpZHRoLCBoZWlnaHQpO1xuICAgIGltYWdlRGF0YS5kYXRhLnNldChkYXRhKTtcbiAgICBjb250ZXh0LnB1dEltYWdlRGF0YShpbWFnZURhdGEsIDAsIDApO1xuICAgIHJldHVybiBjYW52YXMudG9EYXRhVVJMKCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBMaWdodE1hcDtcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiMVlpWjVTXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvZ2wvbGlnaHRtYXAuanNcIixcIi9nbFwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcblxuZnVuY3Rpb24gY29tcGlsZVNoYWRlcih0eXBlLCBzb3VyY2UpIHtcbiAgICB2YXIgc2hhZGVyID0gZ2wuY3JlYXRlU2hhZGVyKHR5cGUpO1xuICAgIGdsLnNoYWRlclNvdXJjZShzaGFkZXIsIHNvdXJjZSk7XG4gICAgZ2wuY29tcGlsZVNoYWRlcihzaGFkZXIpO1xuICAgIGlmICghZ2wuZ2V0U2hhZGVyUGFyYW1ldGVyKHNoYWRlciwgZ2wuQ09NUElMRV9TVEFUVVMpKSB7XG4gICAgICAgIHRocm93ICdFcnJvcjogU2hhZGVyIGNvbXBpbGUgZXJyb3I6ICcgKyBnbC5nZXRTaGFkZXJJbmZvTG9nKHNoYWRlcik7XG4gICAgfVxuICAgIHJldHVybiBzaGFkZXI7XG59XG5cbnZhciBTaGFkZXIgPSBmdW5jdGlvbihzb3VyY2UpIHtcbiAgICB2YXIgdmVydGV4U3RhcnQgPSBzb3VyY2UuaW5kZXhPZignW3ZlcnRleF0nKTtcbiAgICB2YXIgZnJhZ21lbnRTdGFydCA9IHNvdXJjZS5pbmRleE9mKCdbZnJhZ21lbnRdJyk7XG4gICAgaWYgKHZlcnRleFN0YXJ0ID09PSAtMSB8fCBmcmFnbWVudFN0YXJ0ID09PSAtMSlcbiAgICAgICAgdGhyb3cgJ0Vycm9yOiBNaXNzaW5nIFtmcmFnbWVudF0gYW5kL29yIFt2ZXJ0ZXhdIG1hcmtlcnMgaW4gc2hhZGVyLic7XG5cbiAgICB2YXIgdmVydGV4U291cmNlID0gc291cmNlLnN1YnN0cmluZyh2ZXJ0ZXhTdGFydCArIDgsIGZyYWdtZW50U3RhcnQpO1xuICAgIHZhciBmcmFnbWVudFNvdXJjZSA9IHNvdXJjZS5zdWJzdHJpbmcoZnJhZ21lbnRTdGFydCArIDEwKTtcbiAgICB0aGlzLmNvbXBpbGUodmVydGV4U291cmNlLCBmcmFnbWVudFNvdXJjZSk7XG59O1xuXG5TaGFkZXIucHJvdG90eXBlLmNvbXBpbGUgPSBmdW5jdGlvbih2ZXJ0ZXhTb3VyY2UsIGZyYWdtZW50U291cmNlKSB7XG4gICAgdmFyIHByb2dyYW0gPSBnbC5jcmVhdGVQcm9ncmFtKCk7XG4gICAgZ2wuYXR0YWNoU2hhZGVyKHByb2dyYW0sIGNvbXBpbGVTaGFkZXIoZ2wuVkVSVEVYX1NIQURFUiwgdmVydGV4U291cmNlKSk7XG4gICAgZ2wuYXR0YWNoU2hhZGVyKHByb2dyYW0sIGNvbXBpbGVTaGFkZXIoZ2wuRlJBR01FTlRfU0hBREVSLCBmcmFnbWVudFNvdXJjZSkpO1xuICAgIGdsLmxpbmtQcm9ncmFtKHByb2dyYW0pO1xuICAgIGlmICghZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlcihwcm9ncmFtLCBnbC5MSU5LX1NUQVRVUykpXG4gICAgICAgIHRocm93ICdFcnJvcjogU2hhZGVyIGxpbmtpbmcgZXJyb3I6ICcgKyBnbC5nZXRQcm9ncmFtSW5mb0xvZyhwcm9ncmFtKTtcblxuICAgIHZhciBzb3VyY2VzID0gdmVydGV4U291cmNlICsgZnJhZ21lbnRTb3VyY2U7XG4gICAgdmFyIGxpbmVzID0gc291cmNlcy5tYXRjaCgvKHVuaWZvcm18YXR0cmlidXRlKVxccytcXHcrXFxzK1xcdysoPz07KS9nKTtcbiAgICB0aGlzLnVuaWZvcm1zID0ge307XG4gICAgdGhpcy5hdHRyaWJ1dGVzID0ge307XG4gICAgdGhpcy5zYW1wbGVycyA9IFtdO1xuICAgIGZvciAodmFyIGkgaW4gbGluZXMpIHtcbiAgICAgICAgdmFyIHRva2VucyA9IGxpbmVzW2ldLnNwbGl0KCcgJyk7XG4gICAgICAgIHZhciBuYW1lID0gdG9rZW5zWzJdO1xuICAgICAgICB2YXIgdHlwZSA9IHRva2Vuc1sxXTtcbiAgICAgICAgc3dpdGNoICh0b2tlbnNbMF0pIHtcbiAgICAgICAgICAgIGNhc2UgJ2F0dHJpYnV0ZSc6XG4gICAgICAgICAgICAgICAgdmFyIGF0dHJpYnV0ZUxvY2F0aW9uID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24ocHJvZ3JhbSwgbmFtZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5hdHRyaWJ1dGVzW25hbWVdID0gYXR0cmlidXRlTG9jYXRpb247XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd1bmlmb3JtJzpcbiAgICAgICAgICAgICAgICB2YXIgbG9jYXRpb24gPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24ocHJvZ3JhbSwgbmFtZSk7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdzYW1wbGVyMkQnKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNhbXBsZXJzLnB1c2gobG9jYXRpb24pO1xuICAgICAgICAgICAgICAgIHRoaXMudW5pZm9ybXNbbmFtZV0gPSBsb2NhdGlvbjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhyb3cgJ0ludmFsaWQgYXR0cmlidXRlL3VuaWZvcm0gZm91bmQ6ICcgKyB0b2tlbnNbMV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5wcm9ncmFtID0gcHJvZ3JhbTtcbn07XG5cblNoYWRlci5wcm90b3R5cGUudXNlID0gZnVuY3Rpb24oKSB7XG4gICAgZ2wudXNlUHJvZ3JhbSh0aGlzLnByb2dyYW0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gU2hhZGVyO1xufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIxWWlaNVNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9nbC9zaGFkZXIuanNcIixcIi9nbFwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbnZhciBBdGxhcyA9IHJlcXVpcmUoJ2dsL2F0bGFzJyk7XG5cbnZhciBTcHJpdGVzID0gZnVuY3Rpb24gKHdpZHRoLCBoZWlnaHQsIHNwcml0ZUNvdW50KSB7XG4gICAgdGhpcy5zcHJpdGVDb21wb25lbnRzID0gOTsgLy8geHl6LCB1diwgcmdiYVxuICAgIHRoaXMuc3ByaXRlVmVydGljZXMgPSA2O1xuICAgIHRoaXMubWF4U3ByaXRlcyA9IHNwcml0ZUNvdW50IHx8IDEyODtcbiAgICB0aGlzLnRleHR1cmVzID0gbmV3IEF0bGFzKHdpZHRoLCBoZWlnaHQpO1xuICAgIHRoaXMuc3ByaXRlQ291bnQgPSAwO1xuICAgIHRoaXMuZGF0YSA9IG5ldyBGbG9hdDMyQXJyYXkodGhpcy5tYXhTcHJpdGVzICogdGhpcy5zcHJpdGVDb21wb25lbnRzICogdGhpcy5zcHJpdGVWZXJ0aWNlcyk7XG4gICAgdGhpcy52ZXJ0ZXhCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcbiAgICB0aGlzLmRpcnR5ID0gZmFsc2U7XG59O1xuXG5TcHJpdGVzLnByb3RvdHlwZS5kcmF3U3ByaXRlID0gZnVuY3Rpb24gKHRleHR1cmUsIHgsIHksIHdpZHRoLCBoZWlnaHQsIHIsIGcsIGIsIGEpIHtcbiAgICB2YXIgeiA9IDA7XG4gICAgdmFyIGRhdGEgPSB0aGlzLmRhdGE7XG4gICAgdmFyIG9mZnNldCA9IHRoaXMuc3ByaXRlQ291bnQgKiB0aGlzLnNwcml0ZVZlcnRpY2VzICogdGhpcy5zcHJpdGVDb21wb25lbnRzO1xuICAgIHZhciB0ID0gdGhpcy50ZXh0dXJlcy5nZXRTdWJUZXh0dXJlKHRleHR1cmUpO1xuICAgIHdpZHRoID0gd2lkdGggfHwgdC53aWR0aDtcbiAgICBoZWlnaHQgPSBoZWlnaHQgfHwgdC5oZWlnaHQ7XG5cbiAgICBkYXRhW29mZnNldCArIDBdID0geDtcbiAgICBkYXRhW29mZnNldCArIDFdID0geTtcbiAgICBkYXRhW29mZnNldCArIDJdID0gejtcbiAgICBkYXRhW29mZnNldCArIDNdID0gdC5zMTtcbiAgICBkYXRhW29mZnNldCArIDRdID0gdC50MTtcbiAgICBkYXRhW29mZnNldCArIDVdID0gcjtcbiAgICBkYXRhW29mZnNldCArIDZdID0gZztcbiAgICBkYXRhW29mZnNldCArIDddID0gYjtcbiAgICBkYXRhW29mZnNldCArIDhdID0gYTtcblxuICAgIGRhdGFbb2Zmc2V0ICsgOV0gPSB4ICsgd2lkdGg7XG4gICAgZGF0YVtvZmZzZXQgKyAxMF0gPSB5O1xuICAgIGRhdGFbb2Zmc2V0ICsgMTFdID0gejtcbiAgICBkYXRhW29mZnNldCArIDEyXSA9IHQuczI7XG4gICAgZGF0YVtvZmZzZXQgKyAxM10gPSB0LnQxO1xuICAgIGRhdGFbb2Zmc2V0ICsgMTRdID0gcjtcbiAgICBkYXRhW29mZnNldCArIDE1XSA9IGc7XG4gICAgZGF0YVtvZmZzZXQgKyAxNl0gPSBiO1xuICAgIGRhdGFbb2Zmc2V0ICsgMTddID0gYTtcblxuICAgIGRhdGFbb2Zmc2V0ICsgMThdID0geCArIHdpZHRoO1xuICAgIGRhdGFbb2Zmc2V0ICsgMTldID0geSArIGhlaWdodDtcbiAgICBkYXRhW29mZnNldCArIDIwXSA9IHo7XG4gICAgZGF0YVtvZmZzZXQgKyAyMV0gPSB0LnMyO1xuICAgIGRhdGFbb2Zmc2V0ICsgMjJdID0gdC50MjtcbiAgICBkYXRhW29mZnNldCArIDIzXSA9IHI7XG4gICAgZGF0YVtvZmZzZXQgKyAyNF0gPSBnO1xuICAgIGRhdGFbb2Zmc2V0ICsgMjVdID0gYjtcbiAgICBkYXRhW29mZnNldCArIDI2XSA9IGE7XG5cbiAgICBkYXRhW29mZnNldCArIDI3XSA9IHggKyB3aWR0aDtcbiAgICBkYXRhW29mZnNldCArIDI4XSA9IHkgKyBoZWlnaHQ7XG4gICAgZGF0YVtvZmZzZXQgKyAyOV0gPSB6O1xuICAgIGRhdGFbb2Zmc2V0ICsgMzBdID0gdC5zMjtcbiAgICBkYXRhW29mZnNldCArIDMxXSA9IHQudDI7XG4gICAgZGF0YVtvZmZzZXQgKyAzMl0gPSByO1xuICAgIGRhdGFbb2Zmc2V0ICsgMzNdID0gZztcbiAgICBkYXRhW29mZnNldCArIDM0XSA9IGI7XG4gICAgZGF0YVtvZmZzZXQgKyAzNV0gPSBhO1xuXG4gICAgZGF0YVtvZmZzZXQgKyAzNl0gPSB4O1xuICAgIGRhdGFbb2Zmc2V0ICsgMzddID0geSArIGhlaWdodDtcbiAgICBkYXRhW29mZnNldCArIDM4XSA9IHo7XG4gICAgZGF0YVtvZmZzZXQgKyAzOV0gPSB0LnMxO1xuICAgIGRhdGFbb2Zmc2V0ICsgNDBdID0gdC50MjtcbiAgICBkYXRhW29mZnNldCArIDQxXSA9IHI7XG4gICAgZGF0YVtvZmZzZXQgKyA0Ml0gPSBnO1xuICAgIGRhdGFbb2Zmc2V0ICsgNDNdID0gYjtcbiAgICBkYXRhW29mZnNldCArIDQ0XSA9IGE7XG5cbiAgICBkYXRhW29mZnNldCArIDQ1XSA9IHg7XG4gICAgZGF0YVtvZmZzZXQgKyA0Nl0gPSB5O1xuICAgIGRhdGFbb2Zmc2V0ICsgNDddID0gejtcbiAgICBkYXRhW29mZnNldCArIDQ4XSA9IHQuczE7XG4gICAgZGF0YVtvZmZzZXQgKyA0OV0gPSB0LnQxO1xuICAgIGRhdGFbb2Zmc2V0ICsgNTBdID0gcjtcbiAgICBkYXRhW29mZnNldCArIDUxXSA9IGc7XG4gICAgZGF0YVtvZmZzZXQgKyA1Ml0gPSBiO1xuICAgIGRhdGFbb2Zmc2V0ICsgNTNdID0gYTtcblxuICAgIHRoaXMuZGlydHkgPSB0cnVlO1xuICAgIHJldHVybiB0aGlzLnNwcml0ZUNvdW50Kys7XG59O1xuXG5TcHJpdGVzLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnNwcml0ZUNvdW50ID0gMDtcbn07XG5cblNwcml0ZXMucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uIChzaGFkZXIsIHAsIGZpcnN0U3ByaXRlLCBzcHJpdGVDb3VudCkge1xuICAgIGlmICh0aGlzLnNwcml0ZUNvdW50IDw9IDApXG4gICAgICAgIHJldHVybjtcblxuICAgIGZpcnN0U3ByaXRlID0gZmlyc3RTcHJpdGUgfHwgMDtcbiAgICBzcHJpdGVDb3VudCA9IHNwcml0ZUNvdW50IHx8IHRoaXMuc3ByaXRlQ291bnQ7XG5cbiAgICBzaGFkZXIudXNlKCk7XG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHRoaXMudmVydGV4QnVmZmVyKTtcblxuICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHNoYWRlci5hdHRyaWJ1dGVzLnZlcnRleEF0dHJpYnV0ZSk7XG4gICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoc2hhZGVyLmF0dHJpYnV0ZXMudGV4Q29vcmRzQXR0cmlidXRlKTtcbiAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShzaGFkZXIuYXR0cmlidXRlcy5jb2xvcnNBdHRyaWJ1dGUpO1xuXG4gICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihzaGFkZXIuYXR0cmlidXRlcy52ZXJ0ZXhBdHRyaWJ1dGUsIDMsIGdsLkZMT0FULCBmYWxzZSwgMzYsIDApO1xuICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIoc2hhZGVyLmF0dHJpYnV0ZXMudGV4Q29vcmRzQXR0cmlidXRlLCAyLCBnbC5GTE9BVCwgZmFsc2UsIDM2LCAxMik7XG4gICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihzaGFkZXIuYXR0cmlidXRlcy5jb2xvcnNBdHRyaWJ1dGUsIDQsIGdsLkZMT0FULCBmYWxzZSwgMzYsIDIwKTtcblxuICAgIGdsLnVuaWZvcm1NYXRyaXg0ZnYoc2hhZGVyLnVuaWZvcm1zLnByb2plY3Rpb25NYXRyaXgsIGZhbHNlLCBwKTtcblxuICAgIGlmICh0aGlzLmRpcnR5KSB7XG4gICAgICAgIGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLmRhdGEsIGdsLlNUQVRJQ19EUkFXKTtcbiAgICAgICAgdGhpcy5kaXJ0eSA9IGZhbHNlO1xuICAgIH1cbiAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCB0aGlzLnRleHR1cmVzLnRleHR1cmUuaWQpO1xuICAgIGdsLmRyYXdBcnJheXMoZ2wuVFJJQU5HTEVTLCBmaXJzdFNwcml0ZSAqIHRoaXMuc3ByaXRlVmVydGljZXMsIHNwcml0ZUNvdW50ICogdGhpcy5zcHJpdGVWZXJ0aWNlcyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBTcHJpdGVzO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIjFZaVo1U1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2dsL3Nwcml0ZXMuanNcIixcIi9nbFwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbnZhciB1dGlscyA9IHJlcXVpcmUoJ3V0aWxzJyk7XG5cbnZhciBUZXh0dXJlID0gZnVuY3Rpb24oZmlsZSwgb3B0aW9ucykge1xuICAgIHZhciBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICBvcHRpb25zLmFscGhhID0gb3B0aW9ucy5hbHBoYSB8fCBmYWxzZTtcbiAgICBvcHRpb25zLmZvcm1hdCA9IG9wdGlvbnMuZm9ybWF0IHx8IGdsLlJHQkE7XG4gICAgb3B0aW9ucy50eXBlID0gb3B0aW9ucy50eXBlIHx8IGdsLlVOU0lHTkVEX0JZVEU7XG4gICAgb3B0aW9ucy5maWx0ZXIgPSBvcHRpb25zLmZpbHRlciB8fCBnbC5MSU5FQVI7XG4gICAgb3B0aW9ucy53cmFwID0gb3B0aW9ucy53cmFwIHx8IGdsLkNMQU1QX1RPX0VER0U7XG5cbiAgICB0aGlzLmlkID0gZ2wuY3JlYXRlVGV4dHVyZSgpO1xuICAgIHRoaXMud2lkdGggPSBvcHRpb25zLndpZHRoIHx8IGZpbGUucmVhZFVJbnQzMigpO1xuICAgIHRoaXMuaGVpZ2h0ID0gb3B0aW9ucy5oZWlnaHQgfHwgZmlsZS5yZWFkVUludDMyKCk7XG4gICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGhpcy5pZCk7XG4gICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01BR19GSUxURVIsIG9wdGlvbnMuZmlsdGVyKTtcbiAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgb3B0aW9ucy5maWx0ZXIpO1xuICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9XUkFQX1MsIG9wdGlvbnMud3JhcCk7XG4gICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfVCwgb3B0aW9ucy53cmFwKTtcblxuICAgIGlmIChmaWxlKSB7XG4gICAgICAgIGlmICghb3B0aW9ucy5wYWxldHRlKVxuICAgICAgICAgICAgdGhyb3cgJ0Vycm9yOiBObyBwYWxldHRlIHNwZWNpZmllZCBpbiBvcHRpb25zLic7XG5cbiAgICAgICAgdmFyIHBpeGVscyA9IG9wdGlvbnMucGFsZXR0ZS51bnBhY2soZmlsZSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsIG9wdGlvbnMuYWxwaGEpO1xuICAgICAgICB2YXIgbnBvdCA9IHV0aWxzLmlzUG93ZXJPZjIodGhpcy53aWR0aCkgJiYgdXRpbHMuaXNQb3dlck9mMih0aGlzLmhlaWdodCk7XG4gICAgICAgIGlmICghbnBvdCAmJiBvcHRpb25zLndyYXAgPT09IGdsLlJFUEVBVCkge1xuICAgICAgICAgICAgdmFyIG5ld1dpZHRoID0gdXRpbHMubmV4dFBvd2VyT2YyKHRoaXMud2lkdGgpO1xuICAgICAgICAgICAgdmFyIG5ld0hlaWdodCA9IHV0aWxzLm5leHRQb3dlck9mMih0aGlzLmhlaWdodCk7XG4gICAgICAgICAgICBwaXhlbHMgPSB0aGlzLnJlc2FtcGxlKHBpeGVscywgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsIG5ld1dpZHRoLCBuZXdIZWlnaHQpO1xuICAgICAgICAgICAgZ2wudGV4SW1hZ2UyRChnbC5URVhUVVJFXzJELCAwLCBvcHRpb25zLmZvcm1hdCwgbmV3V2lkdGgsIG5ld0hlaWdodCxcbiAgICAgICAgICAgICAgICAwLCBvcHRpb25zLmZvcm1hdCwgb3B0aW9ucy50eXBlLCBwaXhlbHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZ2wudGV4SW1hZ2UyRChnbC5URVhUVVJFXzJELCAwLCBvcHRpb25zLmZvcm1hdCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsXG4gICAgICAgICAgICAgICAgMCwgb3B0aW9ucy5mb3JtYXQsIG9wdGlvbnMudHlwZSwgcGl4ZWxzKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGdsLnRleEltYWdlMkQoZ2wuVEVYVFVSRV8yRCwgMCwgb3B0aW9ucy5mb3JtYXQsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LFxuICAgICAgICAgICAgMCwgb3B0aW9ucy5mb3JtYXQsIG9wdGlvbnMudHlwZSwgbnVsbCk7XG4gICAgfVxufTtcblxuVGV4dHVyZS5wcm90b3R5cGUuZHJhd1RvID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgdmFyIHYgPSBnbC5nZXRQYXJhbWV0ZXIoZ2wuVklFV1BPUlQpO1xuXG4gICAgLyogU2V0dXAgc2hhcmVkIGJ1ZmZlcnMgZm9yIHJlbmRlciB0YXJnZXQgZHJhd2luZyAqL1xuICAgIGlmICh0eXBlb2YgVGV4dHVyZS5mcmFtZUJ1ZmZlciA9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBUZXh0dXJlLmZyYW1lQnVmZmVyID0gZ2wuY3JlYXRlRnJhbWVidWZmZXIoKTtcbiAgICAgICAgVGV4dHVyZS5yZW5kZXJCdWZmZXIgPSBnbC5jcmVhdGVSZW5kZXJidWZmZXIoKTtcbiAgICB9XG5cbiAgICBnbC5iaW5kRnJhbWVidWZmZXIoZ2wuRlJBTUVCVUZGRVIsIFRleHR1cmUuZnJhbWVCdWZmZXIpO1xuICAgIGdsLmJpbmRSZW5kZXJidWZmZXIoZ2wuUkVOREVSQlVGRkVSLCBUZXh0dXJlLnJlbmRlckJ1ZmZlcik7XG4gICAgaWYgKHRoaXMud2lkdGggIT0gVGV4dHVyZS5yZW5kZXJCdWZmZXIud2lkdGggfHwgdGhpcy5oZWlnaHQgIT0gVGV4dHVyZS5yZW5kZXJCdWZmZXIuaGVpZ2h0KSB7XG4gICAgICAgIFRleHR1cmUucmVuZGVyQnVmZmVyLndpZHRoID0gdGhpcy53aWR0aDtcbiAgICAgICAgVGV4dHVyZS5yZW5kZXJCdWZmZXIuaGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XG4gICAgICAgIGdsLnJlbmRlcmJ1ZmZlclN0b3JhZ2UoZ2wuUkVOREVSQlVGRkVSLCBnbC5ERVBUSF9DT01QT05FTlQxNiwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICAgIH1cblxuXG4gICAgZ2wuZnJhbWVidWZmZXJUZXh0dXJlMkQoZ2wuRlJBTUVCVUZGRVIsIGdsLkNPTE9SX0FUVEFDSE1FTlQwLCBnbC5URVhUVVJFXzJELCB0aGlzLmlkLCAwKTtcbiAgICBnbC5mcmFtZWJ1ZmZlclJlbmRlcmJ1ZmZlcihnbC5GUkFNRUJVRkZFUiwgZ2wuREVQVEhfQVRUQUNITUVOVCwgZ2wuUkVOREVSQlVGRkVSLCBUZXh0dXJlLnJlbmRlckJ1ZmZlcik7XG4gICAgZ2wudmlld3BvcnQoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuXG4gICAgdmFyIHByb2plY3Rpb25NYXRyaXggPSBtYXQ0Lm9ydGhvKG1hdDQuY3JlYXRlKCksIDAsIHRoaXMud2lkdGgsIDAsIHRoaXMuaGVpZ2h0LCAtMTAsIDEwKTtcbiAgICBjYWxsYmFjayhwcm9qZWN0aW9uTWF0cml4KTtcblxuICAgIGdsLmJpbmRGcmFtZWJ1ZmZlcihnbC5GUkFNRUJVRkZFUiwgbnVsbCk7XG4gICAgZ2wuYmluZFJlbmRlcmJ1ZmZlcihnbC5SRU5ERVJCVUZGRVIsIG51bGwpO1xuICAgIGdsLnZpZXdwb3J0KHZbMF0sIHZbMV0sIHZbMl0sIHZbM10pO1xufTtcblxuVGV4dHVyZS5wcm90b3R5cGUucmVzYW1wbGUgPSBmdW5jdGlvbihwaXhlbHMsIHdpZHRoLCBoZWlnaHQsIG5ld1dpZHRoLCBuZXdIZWlnaHQpIHtcbiAgICB2YXIgc3JjID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgc3JjLndpZHRoID0gd2lkdGg7XG4gICAgc3JjLmhlaWdodCA9IGhlaWdodDtcbiAgICB2YXIgY29udGV4dCA9IHNyYy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIHZhciBpbWFnZURhdGEgPSBjb250ZXh0LmNyZWF0ZUltYWdlRGF0YSh3aWR0aCwgaGVpZ2h0KTtcbiAgICBpbWFnZURhdGEuZGF0YS5zZXQocGl4ZWxzKTtcbiAgICBjb250ZXh0LnB1dEltYWdlRGF0YShpbWFnZURhdGEsIDAsIDApO1xuXG4gICAgdmFyIGRlc3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICBkZXN0LndpZHRoID0gbmV3V2lkdGg7XG4gICAgZGVzdC5oZWlnaHQgPSBuZXdIZWlnaHQ7XG4gICAgY29udGV4dCA9IGRlc3QuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICBjb250ZXh0LmRyYXdJbWFnZShzcmMsIDAsIDAsIGRlc3Qud2lkdGgsIGRlc3QuaGVpZ2h0KTtcbiAgICB2YXIgaW1hZ2UgPSBjb250ZXh0LmdldEltYWdlRGF0YSgwLCAwLCBkZXN0LndpZHRoLCBkZXN0LmhlaWdodCk7XG4gICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGltYWdlLmRhdGEpO1xufTtcblxuVGV4dHVyZS5wcm90b3R5cGUuYmluZCA9IGZ1bmN0aW9uKHVuaXQpIHtcbiAgICBnbC5hY3RpdmVUZXh0dXJlKGdsLlRFWFRVUkUwICsgKHVuaXQgfHwgMCkpO1xuICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRoaXMuaWQpO1xufTtcblxuVGV4dHVyZS5wcm90b3R5cGUudW5iaW5kID0gZnVuY3Rpb24odW5pdCkge1xuICAgIGdsLmFjdGl2ZVRleHR1cmUoZ2wuVEVYVFVSRTAgKyAodW5pdCB8fCAwKSk7XG4gICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgbnVsbCk7XG59O1xuXG5UZXh0dXJlLnByb3RvdHlwZS5hc0RhdGFVcmwgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZnJhbWVidWZmZXIgPSBnbC5jcmVhdGVGcmFtZWJ1ZmZlcigpO1xuICAgIGdsLmJpbmRGcmFtZWJ1ZmZlcihnbC5GUkFNRUJVRkZFUiwgZnJhbWVidWZmZXIpO1xuICAgIGdsLmZyYW1lYnVmZmVyVGV4dHVyZTJEKGdsLkZSQU1FQlVGRkVSLCBnbC5DT0xPUl9BVFRBQ0hNRU5UMCwgZ2wuVEVYVFVSRV8yRCwgdGhpcy5pZCwgMCk7XG5cbiAgICB2YXIgd2lkdGggPSB0aGlzLndpZHRoO1xuICAgIHZhciBoZWlnaHQgPSB0aGlzLmhlaWdodDtcblxuICAgIC8vIFJlYWQgdGhlIGNvbnRlbnRzIG9mIHRoZSBmcmFtZWJ1ZmZlclxuICAgIHZhciBkYXRhID0gbmV3IFVpbnQ4QXJyYXkod2lkdGggKiBoZWlnaHQgKiA0KTtcbiAgICBnbC5yZWFkUGl4ZWxzKDAsIDAsIHdpZHRoLCBoZWlnaHQsIGdsLlJHQkEsIGdsLlVOU0lHTkVEX0JZVEUsIGRhdGEpO1xuICAgIGdsLmRlbGV0ZUZyYW1lYnVmZmVyKGZyYW1lYnVmZmVyKTtcblxuICAgIC8vIENyZWF0ZSBhIDJEIGNhbnZhcyB0byBzdG9yZSB0aGUgcmVzdWx0XG4gICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgIGNhbnZhcy53aWR0aCA9IHdpZHRoO1xuICAgIGNhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgdmFyIGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgIC8vIENvcHkgdGhlIHBpeGVscyB0byBhIDJEIGNhbnZhc1xuICAgIHZhciBpbWFnZURhdGEgPSBjb250ZXh0LmNyZWF0ZUltYWdlRGF0YSh3aWR0aCwgaGVpZ2h0KTtcbiAgICBpbWFnZURhdGEuZGF0YS5zZXQoZGF0YSk7XG4gICAgY29udGV4dC5wdXRJbWFnZURhdGEoaW1hZ2VEYXRhLCAwLCAwKTtcbiAgICByZXR1cm4gY2FudmFzLnRvRGF0YVVSTCgpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gVGV4dHVyZTtcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiMVlpWjVTXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvZ2wvdGV4dHVyZS5qc1wiLFwiL2dsXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuXG52YXIga2V5cyA9IHsgbGVmdDogMzcsIHJpZ2h0OiAzOSwgdXA6IDM4LCBkb3duOiA0MCwgYTogNjUsIHo6IDkwIH07XG5cbnZhciBJbnB1dCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMubGVmdCA9IGZhbHNlO1xuICAgIHRoaXMucmlnaHQgPSBmYWxzZTtcbiAgICB0aGlzLnVwID0gZmFsc2U7XG4gICAgdGhpcy5kb3duID0gZmFsc2U7XG4gICAgdGhpcy5mbHlVcCA9IGZhbHNlO1xuICAgIHRoaXMuZmx5RG93biA9IGZhbHNlO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLFxuICAgICAgICBmdW5jdGlvbihldmVudCkgeyBzZWxmLmtleURvd24oZXZlbnQpOyB9LCB0cnVlKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsXG4gICAgICAgIGZ1bmN0aW9uKGV2ZW50KSB7IHNlbGYua2V5VXAoZXZlbnQpOyB9LCB0cnVlKTtcbn07XG5cbklucHV0LnByb3RvdHlwZS5rZXlEb3duID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcbiAgICAgICAgY2FzZSBrZXlzLmxlZnQ6IHRoaXMubGVmdCA9IHRydWU7IGJyZWFrO1xuICAgICAgICBjYXNlIGtleXMucmlnaHQ6IHRoaXMucmlnaHQgPSB0cnVlOyBicmVhaztcbiAgICAgICAgY2FzZSBrZXlzLnVwOiB0aGlzLnVwID0gdHJ1ZTsgYnJlYWs7XG4gICAgICAgIGNhc2Uga2V5cy5kb3duOiB0aGlzLmRvd24gPSB0cnVlOyBicmVhaztcbiAgICAgICAgY2FzZSBrZXlzLmE6IHRoaXMuZmx5VXAgPSB0cnVlOyBicmVhaztcbiAgICAgICAgY2FzZSBrZXlzLno6IHRoaXMuZmx5RG93biA9IHRydWU7IGJyZWFrO1xuICAgIH1cbn07XG5cbklucHV0LnByb3RvdHlwZS5rZXlVcCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgc3dpdGNoIChldmVudC5rZXlDb2RlKSB7XG4gICAgICAgIGNhc2Uga2V5cy5sZWZ0OiB0aGlzLmxlZnQgPSBmYWxzZTsgYnJlYWs7XG4gICAgICAgIGNhc2Uga2V5cy5yaWdodDogdGhpcy5yaWdodCA9IGZhbHNlOyBicmVhaztcbiAgICAgICAgY2FzZSBrZXlzLnVwOiB0aGlzLnVwID0gZmFsc2U7IGJyZWFrO1xuICAgICAgICBjYXNlIGtleXMuZG93bjogdGhpcy5kb3duID0gZmFsc2U7IGJyZWFrO1xuICAgICAgICBjYXNlIGtleXMuYTogdGhpcy5mbHlVcCA9IGZhbHNlOyBicmVhaztcbiAgICAgICAgY2FzZSBrZXlzLno6IHRoaXMuZmx5RG93biA9IGZhbHNlOyBicmVhaztcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBJbnB1dDtcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiMVlpWjVTXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvaW5wdXQuanNcIixcIi9cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG5cblxudmFyIERpYWxvZyA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgdGhpcy5pZCA9IGlkO1xufTtcblxuRGlhbG9nLnByb3RvdHlwZS5oaWRlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XG4gICAgZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xufTtcblxuRGlhbG9nLnByb3RvdHlwZS5zaG93ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XG4gICAgZS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbn07XG5cbkRpYWxvZy5wcm90b3R5cGUuc2V0Q2FwdGlvbiA9IGZ1bmN0aW9uKGNhcHRpb24pIHtcbiAgICB2YXIgZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyMnICsgdGhpcy5pZCArICcgcCcpO1xuICAgIGVbMF0uaW5uZXJIVE1MID0gY2FwdGlvbjtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IERpYWxvZztcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIxWWlaNVNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9pbnN0YWxsZXIvZGlhbG9nLmpzXCIsXCIvaW5zdGFsbGVyXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIERpYWxvZyA9IHJlcXVpcmUoJ2luc3RhbGxlci9kaWFsb2cnKTtcbnZhciB6aXAgPSByZXF1aXJlKCdsaWIvemlwLmpzJykuemlwO1xudmFyIGxoNCA9IHJlcXVpcmUoJ2xpYi9saDQuanMnKTtcblxudmFyIEluc3RhbGxlciA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZGlhbG9nID0gbmV3IERpYWxvZygnZGlhbG9nJyk7XG59O1xuXG5JbnN0YWxsZXIuY3Jvc3NPcmlnaW5Qcm94eVVybCA9ICdodHRwOi8vY3Jvc3NvcmlnaW4ubWUvJztcbkluc3RhbGxlci5taXJyb3JzID0gW1xuICAgICdodHRwOi8vd3d3LmdhbWVycy5vcmcvcHViL2dhbWVzL3F1YWtlL2lkc3R1ZmYvcXVha2UvcXVha2UxMDYuemlwJ1xuXTtcblxuSW5zdGFsbGVyLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKGRvbmUpIHtcbiAgICB0aGlzLmRpYWxvZy5zZXRDYXB0aW9uKCdEb3dubG9hZGluZyBzaGFyZXdhcmUgdmVyc2lvbiBvZiBRdWFrZSAocXVha2UxMDYuemlwKS4uLicpO1xuXG4gICAgdmFyIHVybCA9IEluc3RhbGxlci5jcm9zc09yaWdpblByb3h5VXJsICsgSW5zdGFsbGVyLm1pcnJvcnNbMF07XG4gICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIHhoci5vcGVuKCdHRVQnLCB1cmwsIHRydWUpO1xuICAgIHhoci5vdmVycmlkZU1pbWVUeXBlKCd0ZXh0L3BsYWluOyBjaGFyc2V0PXgtdXNlci1kZWZpbmVkJyk7XG4gICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdhcnJheWJ1ZmZlcic7XG4gICAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgIHZhciBibG9iID0gbmV3IEJsb2IoW3RoaXMucmVzcG9uc2VdKTtcbiAgICAgICAgICAgIHppcC5jcmVhdGVSZWFkZXIobmV3IHppcC5CbG9iUmVhZGVyKGJsb2IpLCBmdW5jdGlvbihyZWFkZXIpIHtcbiAgICAgICAgICAgICAgICByZWFkZXIuZ2V0RW50cmllcyhmdW5jdGlvbihlbnRyaWVzKSB7XG5cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcbiAgICB4aHIuc2VuZCgpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gbmV3IEluc3RhbGxlcigpO1xuXG5cblxuXG5cblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIxWWlaNVNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9pbnN0YWxsZXIvaW5zdGFsbGVyLmpzXCIsXCIvaW5zdGFsbGVyXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IGdsLW1hdHJpeCAtIEhpZ2ggcGVyZm9ybWFuY2UgbWF0cml4IGFuZCB2ZWN0b3Igb3BlcmF0aW9uc1xuICogQGF1dGhvciBCcmFuZG9uIEpvbmVzXG4gKiBAYXV0aG9yIENvbGluIE1hY0tlbnppZSBJVlxuICogQHZlcnNpb24gMi4yLjFcbiAqL1xuLyogQ29weXJpZ2h0IChjKSAyMDEzLCBCcmFuZG9uIEpvbmVzLCBDb2xpbiBNYWNLZW56aWUgSVYuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG5cbiBSZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXQgbW9kaWZpY2F0aW9uLFxuIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcblxuICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzXG4gbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXG4gdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvblxuIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuXG4gVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCIgQU5EXG4gQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcbiBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFXG4gRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1JcbiBBTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVNcbiAoSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7XG4gTE9TUyBPRiBVU0UsIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OXG4gQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbiAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJU1xuIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLiAqL1xuKGZ1bmN0aW9uKGUpe1widXNlIHN0cmljdFwiO3ZhciB0PXt9O3R5cGVvZiBleHBvcnRzPT1cInVuZGVmaW5lZFwiP3R5cGVvZiBkZWZpbmU9PVwiZnVuY3Rpb25cIiYmdHlwZW9mIGRlZmluZS5hbWQ9PVwib2JqZWN0XCImJmRlZmluZS5hbWQ/KHQuZXhwb3J0cz17fSxkZWZpbmUoZnVuY3Rpb24oKXtyZXR1cm4gdC5leHBvcnRzfSkpOnQuZXhwb3J0cz10eXBlb2Ygd2luZG93IT1cInVuZGVmaW5lZFwiP3dpbmRvdzplOnQuZXhwb3J0cz1leHBvcnRzLGZ1bmN0aW9uKGUpe2lmKCF0KXZhciB0PTFlLTY7aWYoIW4pdmFyIG49dHlwZW9mIEZsb2F0MzJBcnJheSE9XCJ1bmRlZmluZWRcIj9GbG9hdDMyQXJyYXk6QXJyYXk7aWYoIXIpdmFyIHI9TWF0aC5yYW5kb207dmFyIGk9e307aS5zZXRNYXRyaXhBcnJheVR5cGU9ZnVuY3Rpb24oZSl7bj1lfSx0eXBlb2YgZSE9XCJ1bmRlZmluZWRcIiYmKGUuZ2xNYXRyaXg9aSk7dmFyIHM9TWF0aC5QSS8xODA7aS50b1JhZGlhbj1mdW5jdGlvbihlKXtyZXR1cm4gZSpzfTt2YXIgbz17fTtvLmNyZWF0ZT1mdW5jdGlvbigpe3ZhciBlPW5ldyBuKDIpO3JldHVybiBlWzBdPTAsZVsxXT0wLGV9LG8uY2xvbmU9ZnVuY3Rpb24oZSl7dmFyIHQ9bmV3IG4oMik7cmV0dXJuIHRbMF09ZVswXSx0WzFdPWVbMV0sdH0sby5mcm9tVmFsdWVzPWZ1bmN0aW9uKGUsdCl7dmFyIHI9bmV3IG4oMik7cmV0dXJuIHJbMF09ZSxyWzFdPXQscn0sby5jb3B5PWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF09dFswXSxlWzFdPXRbMV0sZX0sby5zZXQ9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXQsZVsxXT1uLGV9LG8uYWRkPWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT10WzBdK25bMF0sZVsxXT10WzFdK25bMV0sZX0sby5zdWJ0cmFjdD1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXS1uWzBdLGVbMV09dFsxXS1uWzFdLGV9LG8uc3ViPW8uc3VidHJhY3Qsby5tdWx0aXBseT1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXSpuWzBdLGVbMV09dFsxXSpuWzFdLGV9LG8ubXVsPW8ubXVsdGlwbHksby5kaXZpZGU9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0vblswXSxlWzFdPXRbMV0vblsxXSxlfSxvLmRpdj1vLmRpdmlkZSxvLm1pbj1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09TWF0aC5taW4odFswXSxuWzBdKSxlWzFdPU1hdGgubWluKHRbMV0sblsxXSksZX0sby5tYXg9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPU1hdGgubWF4KHRbMF0sblswXSksZVsxXT1NYXRoLm1heCh0WzFdLG5bMV0pLGV9LG8uc2NhbGU9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0qbixlWzFdPXRbMV0qbixlfSxvLnNjYWxlQW5kQWRkPWZ1bmN0aW9uKGUsdCxuLHIpe3JldHVybiBlWzBdPXRbMF0rblswXSpyLGVbMV09dFsxXStuWzFdKnIsZX0sby5kaXN0YW5jZT1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0tZVswXSxyPXRbMV0tZVsxXTtyZXR1cm4gTWF0aC5zcXJ0KG4qbityKnIpfSxvLmRpc3Q9by5kaXN0YW5jZSxvLnNxdWFyZWREaXN0YW5jZT1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0tZVswXSxyPXRbMV0tZVsxXTtyZXR1cm4gbipuK3Iqcn0sby5zcXJEaXN0PW8uc3F1YXJlZERpc3RhbmNlLG8ubGVuZ3RoPWZ1bmN0aW9uKGUpe3ZhciB0PWVbMF0sbj1lWzFdO3JldHVybiBNYXRoLnNxcnQodCp0K24qbil9LG8ubGVuPW8ubGVuZ3RoLG8uc3F1YXJlZExlbmd0aD1mdW5jdGlvbihlKXt2YXIgdD1lWzBdLG49ZVsxXTtyZXR1cm4gdCp0K24qbn0sby5zcXJMZW49by5zcXVhcmVkTGVuZ3RoLG8ubmVnYXRlPWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF09LXRbMF0sZVsxXT0tdFsxXSxlfSxvLm5vcm1hbGl6ZT1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9bipuK3IqcjtyZXR1cm4gaT4wJiYoaT0xL01hdGguc3FydChpKSxlWzBdPXRbMF0qaSxlWzFdPXRbMV0qaSksZX0sby5kb3Q9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gZVswXSp0WzBdK2VbMV0qdFsxXX0sby5jcm9zcz1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSpuWzFdLXRbMV0qblswXTtyZXR1cm4gZVswXT1lWzFdPTAsZVsyXT1yLGV9LG8ubGVycD1mdW5jdGlvbihlLHQsbixyKXt2YXIgaT10WzBdLHM9dFsxXTtyZXR1cm4gZVswXT1pK3IqKG5bMF0taSksZVsxXT1zK3IqKG5bMV0tcyksZX0sby5yYW5kb209ZnVuY3Rpb24oZSx0KXt0PXR8fDE7dmFyIG49cigpKjIqTWF0aC5QSTtyZXR1cm4gZVswXT1NYXRoLmNvcyhuKSp0LGVbMV09TWF0aC5zaW4obikqdCxlfSxvLnRyYW5zZm9ybU1hdDI9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdO3JldHVybiBlWzBdPW5bMF0qcituWzJdKmksZVsxXT1uWzFdKnIrblszXSppLGV9LG8udHJhbnNmb3JtTWF0MmQ9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdO3JldHVybiBlWzBdPW5bMF0qcituWzJdKmkrbls0XSxlWzFdPW5bMV0qcituWzNdKmkrbls1XSxlfSxvLnRyYW5zZm9ybU1hdDM9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdO3JldHVybiBlWzBdPW5bMF0qcituWzNdKmkrbls2XSxlWzFdPW5bMV0qcituWzRdKmkrbls3XSxlfSxvLnRyYW5zZm9ybU1hdDQ9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdO3JldHVybiBlWzBdPW5bMF0qcituWzRdKmkrblsxMl0sZVsxXT1uWzFdKnIrbls1XSppK25bMTNdLGV9LG8uZm9yRWFjaD1mdW5jdGlvbigpe3ZhciBlPW8uY3JlYXRlKCk7cmV0dXJuIGZ1bmN0aW9uKHQsbixyLGkscyxvKXt2YXIgdSxhO258fChuPTIpLHJ8fChyPTApLGk/YT1NYXRoLm1pbihpKm4rcix0Lmxlbmd0aCk6YT10Lmxlbmd0aDtmb3IodT1yO3U8YTt1Kz1uKWVbMF09dFt1XSxlWzFdPXRbdSsxXSxzKGUsZSxvKSx0W3VdPWVbMF0sdFt1KzFdPWVbMV07cmV0dXJuIHR9fSgpLG8uc3RyPWZ1bmN0aW9uKGUpe3JldHVyblwidmVjMihcIitlWzBdK1wiLCBcIitlWzFdK1wiKVwifSx0eXBlb2YgZSE9XCJ1bmRlZmluZWRcIiYmKGUudmVjMj1vKTt2YXIgdT17fTt1LmNyZWF0ZT1mdW5jdGlvbigpe3ZhciBlPW5ldyBuKDMpO3JldHVybiBlWzBdPTAsZVsxXT0wLGVbMl09MCxlfSx1LmNsb25lPWZ1bmN0aW9uKGUpe3ZhciB0PW5ldyBuKDMpO3JldHVybiB0WzBdPWVbMF0sdFsxXT1lWzFdLHRbMl09ZVsyXSx0fSx1LmZyb21WYWx1ZXM9ZnVuY3Rpb24oZSx0LHIpe3ZhciBpPW5ldyBuKDMpO3JldHVybiBpWzBdPWUsaVsxXT10LGlbMl09cixpfSx1LmNvcHk9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gZVswXT10WzBdLGVbMV09dFsxXSxlWzJdPXRbMl0sZX0sdS5zZXQ9ZnVuY3Rpb24oZSx0LG4scil7cmV0dXJuIGVbMF09dCxlWzFdPW4sZVsyXT1yLGV9LHUuYWRkPWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT10WzBdK25bMF0sZVsxXT10WzFdK25bMV0sZVsyXT10WzJdK25bMl0sZX0sdS5zdWJ0cmFjdD1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXS1uWzBdLGVbMV09dFsxXS1uWzFdLGVbMl09dFsyXS1uWzJdLGV9LHUuc3ViPXUuc3VidHJhY3QsdS5tdWx0aXBseT1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXSpuWzBdLGVbMV09dFsxXSpuWzFdLGVbMl09dFsyXSpuWzJdLGV9LHUubXVsPXUubXVsdGlwbHksdS5kaXZpZGU9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0vblswXSxlWzFdPXRbMV0vblsxXSxlWzJdPXRbMl0vblsyXSxlfSx1LmRpdj11LmRpdmlkZSx1Lm1pbj1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09TWF0aC5taW4odFswXSxuWzBdKSxlWzFdPU1hdGgubWluKHRbMV0sblsxXSksZVsyXT1NYXRoLm1pbih0WzJdLG5bMl0pLGV9LHUubWF4PWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT1NYXRoLm1heCh0WzBdLG5bMF0pLGVbMV09TWF0aC5tYXgodFsxXSxuWzFdKSxlWzJdPU1hdGgubWF4KHRbMl0sblsyXSksZX0sdS5zY2FsZT1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXSpuLGVbMV09dFsxXSpuLGVbMl09dFsyXSpuLGV9LHUuc2NhbGVBbmRBZGQ9ZnVuY3Rpb24oZSx0LG4scil7cmV0dXJuIGVbMF09dFswXStuWzBdKnIsZVsxXT10WzFdK25bMV0qcixlWzJdPXRbMl0rblsyXSpyLGV9LHUuZGlzdGFuY2U9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLWVbMF0scj10WzFdLWVbMV0saT10WzJdLWVbMl07cmV0dXJuIE1hdGguc3FydChuKm4rcipyK2kqaSl9LHUuZGlzdD11LmRpc3RhbmNlLHUuc3F1YXJlZERpc3RhbmNlPWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXS1lWzBdLHI9dFsxXS1lWzFdLGk9dFsyXS1lWzJdO3JldHVybiBuKm4rcipyK2kqaX0sdS5zcXJEaXN0PXUuc3F1YXJlZERpc3RhbmNlLHUubGVuZ3RoPWZ1bmN0aW9uKGUpe3ZhciB0PWVbMF0sbj1lWzFdLHI9ZVsyXTtyZXR1cm4gTWF0aC5zcXJ0KHQqdCtuKm4rcipyKX0sdS5sZW49dS5sZW5ndGgsdS5zcXVhcmVkTGVuZ3RoPWZ1bmN0aW9uKGUpe3ZhciB0PWVbMF0sbj1lWzFdLHI9ZVsyXTtyZXR1cm4gdCp0K24qbityKnJ9LHUuc3FyTGVuPXUuc3F1YXJlZExlbmd0aCx1Lm5lZ2F0ZT1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdPS10WzBdLGVbMV09LXRbMV0sZVsyXT0tdFsyXSxlfSx1Lm5vcm1hbGl6ZT1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9dFsyXSxzPW4qbityKnIraSppO3JldHVybiBzPjAmJihzPTEvTWF0aC5zcXJ0KHMpLGVbMF09dFswXSpzLGVbMV09dFsxXSpzLGVbMl09dFsyXSpzKSxlfSx1LmRvdD1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdKnRbMF0rZVsxXSp0WzFdK2VbMl0qdFsyXX0sdS5jcm9zcz1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89blswXSx1PW5bMV0sYT1uWzJdO3JldHVybiBlWzBdPWkqYS1zKnUsZVsxXT1zKm8tciphLGVbMl09cip1LWkqbyxlfSx1LmxlcnA9ZnVuY3Rpb24oZSx0LG4scil7dmFyIGk9dFswXSxzPXRbMV0sbz10WzJdO3JldHVybiBlWzBdPWkrciooblswXS1pKSxlWzFdPXMrciooblsxXS1zKSxlWzJdPW8rciooblsyXS1vKSxlfSx1LnJhbmRvbT1mdW5jdGlvbihlLHQpe3Q9dHx8MTt2YXIgbj1yKCkqMipNYXRoLlBJLGk9cigpKjItMSxzPU1hdGguc3FydCgxLWkqaSkqdDtyZXR1cm4gZVswXT1NYXRoLmNvcyhuKSpzLGVbMV09TWF0aC5zaW4obikqcyxlWzJdPWkqdCxlfSx1LnRyYW5zZm9ybU1hdDQ9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXTtyZXR1cm4gZVswXT1uWzBdKnIrbls0XSppK25bOF0qcytuWzEyXSxlWzFdPW5bMV0qcituWzVdKmkrbls5XSpzK25bMTNdLGVbMl09blsyXSpyK25bNl0qaStuWzEwXSpzK25bMTRdLGV9LHUudHJhbnNmb3JtTWF0Mz1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdO3JldHVybiBlWzBdPXIqblswXStpKm5bM10rcypuWzZdLGVbMV09cipuWzFdK2kqbls0XStzKm5bN10sZVsyXT1yKm5bMl0raSpuWzVdK3Mqbls4XSxlfSx1LnRyYW5zZm9ybVF1YXQ9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPW5bMF0sdT1uWzFdLGE9blsyXSxmPW5bM10sbD1mKnIrdSpzLWEqaSxjPWYqaSthKnItbypzLGg9ZipzK28qaS11KnIscD0tbypyLXUqaS1hKnM7cmV0dXJuIGVbMF09bCpmK3AqLW8rYyotYS1oKi11LGVbMV09YypmK3AqLXUraCotby1sKi1hLGVbMl09aCpmK3AqLWErbCotdS1jKi1vLGV9LHUucm90YXRlWD1mdW5jdGlvbihlLHQsbixyKXt2YXIgaT1bXSxzPVtdO3JldHVybiBpWzBdPXRbMF0tblswXSxpWzFdPXRbMV0tblsxXSxpWzJdPXRbMl0tblsyXSxzWzBdPWlbMF0sc1sxXT1pWzFdKk1hdGguY29zKHIpLWlbMl0qTWF0aC5zaW4ociksc1syXT1pWzFdKk1hdGguc2luKHIpK2lbMl0qTWF0aC5jb3MociksZVswXT1zWzBdK25bMF0sZVsxXT1zWzFdK25bMV0sZVsyXT1zWzJdK25bMl0sZX0sdS5yb3RhdGVZPWZ1bmN0aW9uKGUsdCxuLHIpe3ZhciBpPVtdLHM9W107cmV0dXJuIGlbMF09dFswXS1uWzBdLGlbMV09dFsxXS1uWzFdLGlbMl09dFsyXS1uWzJdLHNbMF09aVsyXSpNYXRoLnNpbihyKStpWzBdKk1hdGguY29zKHIpLHNbMV09aVsxXSxzWzJdPWlbMl0qTWF0aC5jb3MociktaVswXSpNYXRoLnNpbihyKSxlWzBdPXNbMF0rblswXSxlWzFdPXNbMV0rblsxXSxlWzJdPXNbMl0rblsyXSxlfSx1LnJvdGF0ZVo9ZnVuY3Rpb24oZSx0LG4scil7dmFyIGk9W10scz1bXTtyZXR1cm4gaVswXT10WzBdLW5bMF0saVsxXT10WzFdLW5bMV0saVsyXT10WzJdLW5bMl0sc1swXT1pWzBdKk1hdGguY29zKHIpLWlbMV0qTWF0aC5zaW4ociksc1sxXT1pWzBdKk1hdGguc2luKHIpK2lbMV0qTWF0aC5jb3Mociksc1syXT1pWzJdLGVbMF09c1swXStuWzBdLGVbMV09c1sxXStuWzFdLGVbMl09c1syXStuWzJdLGV9LHUuZm9yRWFjaD1mdW5jdGlvbigpe3ZhciBlPXUuY3JlYXRlKCk7cmV0dXJuIGZ1bmN0aW9uKHQsbixyLGkscyxvKXt2YXIgdSxhO258fChuPTMpLHJ8fChyPTApLGk/YT1NYXRoLm1pbihpKm4rcix0Lmxlbmd0aCk6YT10Lmxlbmd0aDtmb3IodT1yO3U8YTt1Kz1uKWVbMF09dFt1XSxlWzFdPXRbdSsxXSxlWzJdPXRbdSsyXSxzKGUsZSxvKSx0W3VdPWVbMF0sdFt1KzFdPWVbMV0sdFt1KzJdPWVbMl07cmV0dXJuIHR9fSgpLHUuc3RyPWZ1bmN0aW9uKGUpe3JldHVyblwidmVjMyhcIitlWzBdK1wiLCBcIitlWzFdK1wiLCBcIitlWzJdK1wiKVwifSx0eXBlb2YgZSE9XCJ1bmRlZmluZWRcIiYmKGUudmVjMz11KTt2YXIgYT17fTthLmNyZWF0ZT1mdW5jdGlvbigpe3ZhciBlPW5ldyBuKDQpO3JldHVybiBlWzBdPTAsZVsxXT0wLGVbMl09MCxlWzNdPTAsZX0sYS5jbG9uZT1mdW5jdGlvbihlKXt2YXIgdD1uZXcgbig0KTtyZXR1cm4gdFswXT1lWzBdLHRbMV09ZVsxXSx0WzJdPWVbMl0sdFszXT1lWzNdLHR9LGEuZnJvbVZhbHVlcz1mdW5jdGlvbihlLHQscixpKXt2YXIgcz1uZXcgbig0KTtyZXR1cm4gc1swXT1lLHNbMV09dCxzWzJdPXIsc1szXT1pLHN9LGEuY29weT1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdPXRbMF0sZVsxXT10WzFdLGVbMl09dFsyXSxlWzNdPXRbM10sZX0sYS5zZXQ9ZnVuY3Rpb24oZSx0LG4scixpKXtyZXR1cm4gZVswXT10LGVbMV09bixlWzJdPXIsZVszXT1pLGV9LGEuYWRkPWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT10WzBdK25bMF0sZVsxXT10WzFdK25bMV0sZVsyXT10WzJdK25bMl0sZVszXT10WzNdK25bM10sZX0sYS5zdWJ0cmFjdD1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXS1uWzBdLGVbMV09dFsxXS1uWzFdLGVbMl09dFsyXS1uWzJdLGVbM109dFszXS1uWzNdLGV9LGEuc3ViPWEuc3VidHJhY3QsYS5tdWx0aXBseT1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXSpuWzBdLGVbMV09dFsxXSpuWzFdLGVbMl09dFsyXSpuWzJdLGVbM109dFszXSpuWzNdLGV9LGEubXVsPWEubXVsdGlwbHksYS5kaXZpZGU9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0vblswXSxlWzFdPXRbMV0vblsxXSxlWzJdPXRbMl0vblsyXSxlWzNdPXRbM10vblszXSxlfSxhLmRpdj1hLmRpdmlkZSxhLm1pbj1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09TWF0aC5taW4odFswXSxuWzBdKSxlWzFdPU1hdGgubWluKHRbMV0sblsxXSksZVsyXT1NYXRoLm1pbih0WzJdLG5bMl0pLGVbM109TWF0aC5taW4odFszXSxuWzNdKSxlfSxhLm1heD1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09TWF0aC5tYXgodFswXSxuWzBdKSxlWzFdPU1hdGgubWF4KHRbMV0sblsxXSksZVsyXT1NYXRoLm1heCh0WzJdLG5bMl0pLGVbM109TWF0aC5tYXgodFszXSxuWzNdKSxlfSxhLnNjYWxlPWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT10WzBdKm4sZVsxXT10WzFdKm4sZVsyXT10WzJdKm4sZVszXT10WzNdKm4sZX0sYS5zY2FsZUFuZEFkZD1mdW5jdGlvbihlLHQsbixyKXtyZXR1cm4gZVswXT10WzBdK25bMF0qcixlWzFdPXRbMV0rblsxXSpyLGVbMl09dFsyXStuWzJdKnIsZVszXT10WzNdK25bM10qcixlfSxhLmRpc3RhbmNlPWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXS1lWzBdLHI9dFsxXS1lWzFdLGk9dFsyXS1lWzJdLHM9dFszXS1lWzNdO3JldHVybiBNYXRoLnNxcnQobipuK3IqcitpKmkrcypzKX0sYS5kaXN0PWEuZGlzdGFuY2UsYS5zcXVhcmVkRGlzdGFuY2U9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLWVbMF0scj10WzFdLWVbMV0saT10WzJdLWVbMl0scz10WzNdLWVbM107cmV0dXJuIG4qbityKnIraSppK3Mqc30sYS5zcXJEaXN0PWEuc3F1YXJlZERpc3RhbmNlLGEubGVuZ3RoPWZ1bmN0aW9uKGUpe3ZhciB0PWVbMF0sbj1lWzFdLHI9ZVsyXSxpPWVbM107cmV0dXJuIE1hdGguc3FydCh0KnQrbipuK3IqcitpKmkpfSxhLmxlbj1hLmxlbmd0aCxhLnNxdWFyZWRMZW5ndGg9ZnVuY3Rpb24oZSl7dmFyIHQ9ZVswXSxuPWVbMV0scj1lWzJdLGk9ZVszXTtyZXR1cm4gdCp0K24qbityKnIraSppfSxhLnNxckxlbj1hLnNxdWFyZWRMZW5ndGgsYS5uZWdhdGU9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gZVswXT0tdFswXSxlWzFdPS10WzFdLGVbMl09LXRbMl0sZVszXT0tdFszXSxlfSxhLm5vcm1hbGl6ZT1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9dFsyXSxzPXRbM10sbz1uKm4rcipyK2kqaStzKnM7cmV0dXJuIG8+MCYmKG89MS9NYXRoLnNxcnQobyksZVswXT10WzBdKm8sZVsxXT10WzFdKm8sZVsyXT10WzJdKm8sZVszXT10WzNdKm8pLGV9LGEuZG90PWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF0qdFswXStlWzFdKnRbMV0rZVsyXSp0WzJdK2VbM10qdFszXX0sYS5sZXJwPWZ1bmN0aW9uKGUsdCxuLHIpe3ZhciBpPXRbMF0scz10WzFdLG89dFsyXSx1PXRbM107cmV0dXJuIGVbMF09aStyKihuWzBdLWkpLGVbMV09cytyKihuWzFdLXMpLGVbMl09bytyKihuWzJdLW8pLGVbM109dStyKihuWzNdLXUpLGV9LGEucmFuZG9tPWZ1bmN0aW9uKGUsdCl7cmV0dXJuIHQ9dHx8MSxlWzBdPXIoKSxlWzFdPXIoKSxlWzJdPXIoKSxlWzNdPXIoKSxhLm5vcm1hbGl6ZShlLGUpLGEuc2NhbGUoZSxlLHQpLGV9LGEudHJhbnNmb3JtTWF0ND1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXTtyZXR1cm4gZVswXT1uWzBdKnIrbls0XSppK25bOF0qcytuWzEyXSpvLGVbMV09blsxXSpyK25bNV0qaStuWzldKnMrblsxM10qbyxlWzJdPW5bMl0qcituWzZdKmkrblsxMF0qcytuWzE0XSpvLGVbM109blszXSpyK25bN10qaStuWzExXSpzK25bMTVdKm8sZX0sYS50cmFuc2Zvcm1RdWF0PWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz1uWzBdLHU9blsxXSxhPW5bMl0sZj1uWzNdLGw9ZipyK3Uqcy1hKmksYz1mKmkrYSpyLW8qcyxoPWYqcytvKmktdSpyLHA9LW8qci11KmktYSpzO3JldHVybiBlWzBdPWwqZitwKi1vK2MqLWEtaCotdSxlWzFdPWMqZitwKi11K2gqLW8tbCotYSxlWzJdPWgqZitwKi1hK2wqLXUtYyotbyxlfSxhLmZvckVhY2g9ZnVuY3Rpb24oKXt2YXIgZT1hLmNyZWF0ZSgpO3JldHVybiBmdW5jdGlvbih0LG4scixpLHMsbyl7dmFyIHUsYTtufHwobj00KSxyfHwocj0wKSxpP2E9TWF0aC5taW4oaSpuK3IsdC5sZW5ndGgpOmE9dC5sZW5ndGg7Zm9yKHU9cjt1PGE7dSs9billWzBdPXRbdV0sZVsxXT10W3UrMV0sZVsyXT10W3UrMl0sZVszXT10W3UrM10scyhlLGUsbyksdFt1XT1lWzBdLHRbdSsxXT1lWzFdLHRbdSsyXT1lWzJdLHRbdSszXT1lWzNdO3JldHVybiB0fX0oKSxhLnN0cj1mdW5jdGlvbihlKXtyZXR1cm5cInZlYzQoXCIrZVswXStcIiwgXCIrZVsxXStcIiwgXCIrZVsyXStcIiwgXCIrZVszXStcIilcIn0sdHlwZW9mIGUhPVwidW5kZWZpbmVkXCImJihlLnZlYzQ9YSk7dmFyIGY9e307Zi5jcmVhdGU9ZnVuY3Rpb24oKXt2YXIgZT1uZXcgbig0KTtyZXR1cm4gZVswXT0xLGVbMV09MCxlWzJdPTAsZVszXT0xLGV9LGYuY2xvbmU9ZnVuY3Rpb24oZSl7dmFyIHQ9bmV3IG4oNCk7cmV0dXJuIHRbMF09ZVswXSx0WzFdPWVbMV0sdFsyXT1lWzJdLHRbM109ZVszXSx0fSxmLmNvcHk9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gZVswXT10WzBdLGVbMV09dFsxXSxlWzJdPXRbMl0sZVszXT10WzNdLGV9LGYuaWRlbnRpdHk9ZnVuY3Rpb24oZSl7cmV0dXJuIGVbMF09MSxlWzFdPTAsZVsyXT0wLGVbM109MSxlfSxmLnRyYW5zcG9zZT1mdW5jdGlvbihlLHQpe2lmKGU9PT10KXt2YXIgbj10WzFdO2VbMV09dFsyXSxlWzJdPW59ZWxzZSBlWzBdPXRbMF0sZVsxXT10WzJdLGVbMl09dFsxXSxlWzNdPXRbM107cmV0dXJuIGV9LGYuaW52ZXJ0PWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSxyPXRbMV0saT10WzJdLHM9dFszXSxvPW4qcy1pKnI7cmV0dXJuIG8/KG89MS9vLGVbMF09cypvLGVbMV09LXIqbyxlWzJdPS1pKm8sZVszXT1uKm8sZSk6bnVsbH0sZi5hZGpvaW50PWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXTtyZXR1cm4gZVswXT10WzNdLGVbMV09LXRbMV0sZVsyXT0tdFsyXSxlWzNdPW4sZX0sZi5kZXRlcm1pbmFudD1mdW5jdGlvbihlKXtyZXR1cm4gZVswXSplWzNdLWVbMl0qZVsxXX0sZi5tdWx0aXBseT1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PW5bMF0sYT1uWzFdLGY9blsyXSxsPW5bM107cmV0dXJuIGVbMF09cip1K3MqYSxlWzFdPWkqdStvKmEsZVsyXT1yKmYrcypsLGVbM109aSpmK28qbCxlfSxmLm11bD1mLm11bHRpcGx5LGYucm90YXRlPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz10WzNdLHU9TWF0aC5zaW4obiksYT1NYXRoLmNvcyhuKTtyZXR1cm4gZVswXT1yKmErcyp1LGVbMV09aSphK28qdSxlWzJdPXIqLXUrcyphLGVbM109aSotdStvKmEsZX0sZi5zY2FsZT1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PW5bMF0sYT1uWzFdO3JldHVybiBlWzBdPXIqdSxlWzFdPWkqdSxlWzJdPXMqYSxlWzNdPW8qYSxlfSxmLnN0cj1mdW5jdGlvbihlKXtyZXR1cm5cIm1hdDIoXCIrZVswXStcIiwgXCIrZVsxXStcIiwgXCIrZVsyXStcIiwgXCIrZVszXStcIilcIn0sZi5mcm9iPWZ1bmN0aW9uKGUpe3JldHVybiBNYXRoLnNxcnQoTWF0aC5wb3coZVswXSwyKStNYXRoLnBvdyhlWzFdLDIpK01hdGgucG93KGVbMl0sMikrTWF0aC5wb3coZVszXSwyKSl9LGYuTERVPWZ1bmN0aW9uKGUsdCxuLHIpe3JldHVybiBlWzJdPXJbMl0vclswXSxuWzBdPXJbMF0sblsxXT1yWzFdLG5bM109clszXS1lWzJdKm5bMV0sW2UsdCxuXX0sdHlwZW9mIGUhPVwidW5kZWZpbmVkXCImJihlLm1hdDI9Zik7dmFyIGw9e307bC5jcmVhdGU9ZnVuY3Rpb24oKXt2YXIgZT1uZXcgbig2KTtyZXR1cm4gZVswXT0xLGVbMV09MCxlWzJdPTAsZVszXT0xLGVbNF09MCxlWzVdPTAsZX0sbC5jbG9uZT1mdW5jdGlvbihlKXt2YXIgdD1uZXcgbig2KTtyZXR1cm4gdFswXT1lWzBdLHRbMV09ZVsxXSx0WzJdPWVbMl0sdFszXT1lWzNdLHRbNF09ZVs0XSx0WzVdPWVbNV0sdH0sbC5jb3B5PWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF09dFswXSxlWzFdPXRbMV0sZVsyXT10WzJdLGVbM109dFszXSxlWzRdPXRbNF0sZVs1XT10WzVdLGV9LGwuaWRlbnRpdHk9ZnVuY3Rpb24oZSl7cmV0dXJuIGVbMF09MSxlWzFdPTAsZVsyXT0wLGVbM109MSxlWzRdPTAsZVs1XT0wLGV9LGwuaW52ZXJ0PWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSxyPXRbMV0saT10WzJdLHM9dFszXSxvPXRbNF0sdT10WzVdLGE9bipzLXIqaTtyZXR1cm4gYT8oYT0xL2EsZVswXT1zKmEsZVsxXT0tciphLGVbMl09LWkqYSxlWzNdPW4qYSxlWzRdPShpKnUtcypvKSphLGVbNV09KHIqby1uKnUpKmEsZSk6bnVsbH0sbC5kZXRlcm1pbmFudD1mdW5jdGlvbihlKXtyZXR1cm4gZVswXSplWzNdLWVbMV0qZVsyXX0sbC5tdWx0aXBseT1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PXRbNF0sYT10WzVdLGY9blswXSxsPW5bMV0sYz1uWzJdLGg9blszXSxwPW5bNF0sZD1uWzVdO3JldHVybiBlWzBdPXIqZitzKmwsZVsxXT1pKmYrbypsLGVbMl09cipjK3MqaCxlWzNdPWkqYytvKmgsZVs0XT1yKnArcypkK3UsZVs1XT1pKnArbypkK2EsZX0sbC5tdWw9bC5tdWx0aXBseSxsLnJvdGF0ZT1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PXRbNF0sYT10WzVdLGY9TWF0aC5zaW4obiksbD1NYXRoLmNvcyhuKTtyZXR1cm4gZVswXT1yKmwrcypmLGVbMV09aSpsK28qZixlWzJdPXIqLWYrcypsLGVbM109aSotZitvKmwsZVs0XT11LGVbNV09YSxlfSxsLnNjYWxlPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz10WzNdLHU9dFs0XSxhPXRbNV0sZj1uWzBdLGw9blsxXTtyZXR1cm4gZVswXT1yKmYsZVsxXT1pKmYsZVsyXT1zKmwsZVszXT1vKmwsZVs0XT11LGVbNV09YSxlfSxsLnRyYW5zbGF0ZT1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PXRbNF0sYT10WzVdLGY9blswXSxsPW5bMV07cmV0dXJuIGVbMF09cixlWzFdPWksZVsyXT1zLGVbM109byxlWzRdPXIqZitzKmwrdSxlWzVdPWkqZitvKmwrYSxlfSxsLnN0cj1mdW5jdGlvbihlKXtyZXR1cm5cIm1hdDJkKFwiK2VbMF0rXCIsIFwiK2VbMV0rXCIsIFwiK2VbMl0rXCIsIFwiK2VbM10rXCIsIFwiK2VbNF0rXCIsIFwiK2VbNV0rXCIpXCJ9LGwuZnJvYj1mdW5jdGlvbihlKXtyZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KGVbMF0sMikrTWF0aC5wb3coZVsxXSwyKStNYXRoLnBvdyhlWzJdLDIpK01hdGgucG93KGVbM10sMikrTWF0aC5wb3coZVs0XSwyKStNYXRoLnBvdyhlWzVdLDIpKzEpfSx0eXBlb2YgZSE9XCJ1bmRlZmluZWRcIiYmKGUubWF0MmQ9bCk7dmFyIGM9e307Yy5jcmVhdGU9ZnVuY3Rpb24oKXt2YXIgZT1uZXcgbig5KTtyZXR1cm4gZVswXT0xLGVbMV09MCxlWzJdPTAsZVszXT0wLGVbNF09MSxlWzVdPTAsZVs2XT0wLGVbN109MCxlWzhdPTEsZX0sYy5mcm9tTWF0ND1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdPXRbMF0sZVsxXT10WzFdLGVbMl09dFsyXSxlWzNdPXRbNF0sZVs0XT10WzVdLGVbNV09dFs2XSxlWzZdPXRbOF0sZVs3XT10WzldLGVbOF09dFsxMF0sZX0sYy5jbG9uZT1mdW5jdGlvbihlKXt2YXIgdD1uZXcgbig5KTtyZXR1cm4gdFswXT1lWzBdLHRbMV09ZVsxXSx0WzJdPWVbMl0sdFszXT1lWzNdLHRbNF09ZVs0XSx0WzVdPWVbNV0sdFs2XT1lWzZdLHRbN109ZVs3XSx0WzhdPWVbOF0sdH0sYy5jb3B5PWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF09dFswXSxlWzFdPXRbMV0sZVsyXT10WzJdLGVbM109dFszXSxlWzRdPXRbNF0sZVs1XT10WzVdLGVbNl09dFs2XSxlWzddPXRbN10sZVs4XT10WzhdLGV9LGMuaWRlbnRpdHk9ZnVuY3Rpb24oZSl7cmV0dXJuIGVbMF09MSxlWzFdPTAsZVsyXT0wLGVbM109MCxlWzRdPTEsZVs1XT0wLGVbNl09MCxlWzddPTAsZVs4XT0xLGV9LGMudHJhbnNwb3NlPWZ1bmN0aW9uKGUsdCl7aWYoZT09PXQpe3ZhciBuPXRbMV0scj10WzJdLGk9dFs1XTtlWzFdPXRbM10sZVsyXT10WzZdLGVbM109bixlWzVdPXRbN10sZVs2XT1yLGVbN109aX1lbHNlIGVbMF09dFswXSxlWzFdPXRbM10sZVsyXT10WzZdLGVbM109dFsxXSxlWzRdPXRbNF0sZVs1XT10WzddLGVbNl09dFsyXSxlWzddPXRbNV0sZVs4XT10WzhdO3JldHVybiBlfSxjLmludmVydD1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9dFsyXSxzPXRbM10sbz10WzRdLHU9dFs1XSxhPXRbNl0sZj10WzddLGw9dFs4XSxjPWwqby11KmYsaD0tbCpzK3UqYSxwPWYqcy1vKmEsZD1uKmMrcipoK2kqcDtyZXR1cm4gZD8oZD0xL2QsZVswXT1jKmQsZVsxXT0oLWwqcitpKmYpKmQsZVsyXT0odSpyLWkqbykqZCxlWzNdPWgqZCxlWzRdPShsKm4taSphKSpkLGVbNV09KC11Km4raSpzKSpkLGVbNl09cCpkLGVbN109KC1mKm4rciphKSpkLGVbOF09KG8qbi1yKnMpKmQsZSk6bnVsbH0sYy5hZGpvaW50PWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSxyPXRbMV0saT10WzJdLHM9dFszXSxvPXRbNF0sdT10WzVdLGE9dFs2XSxmPXRbN10sbD10WzhdO3JldHVybiBlWzBdPW8qbC11KmYsZVsxXT1pKmYtcipsLGVbMl09cip1LWkqbyxlWzNdPXUqYS1zKmwsZVs0XT1uKmwtaSphLGVbNV09aSpzLW4qdSxlWzZdPXMqZi1vKmEsZVs3XT1yKmEtbipmLGVbOF09bipvLXIqcyxlfSxjLmRldGVybWluYW50PWZ1bmN0aW9uKGUpe3ZhciB0PWVbMF0sbj1lWzFdLHI9ZVsyXSxpPWVbM10scz1lWzRdLG89ZVs1XSx1PWVbNl0sYT1lWzddLGY9ZVs4XTtyZXR1cm4gdCooZipzLW8qYSkrbiooLWYqaStvKnUpK3IqKGEqaS1zKnUpfSxjLm11bHRpcGx5PWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz10WzNdLHU9dFs0XSxhPXRbNV0sZj10WzZdLGw9dFs3XSxjPXRbOF0saD1uWzBdLHA9blsxXSxkPW5bMl0sdj1uWzNdLG09bls0XSxnPW5bNV0seT1uWzZdLGI9bls3XSx3PW5bOF07cmV0dXJuIGVbMF09aCpyK3AqbytkKmYsZVsxXT1oKmkrcCp1K2QqbCxlWzJdPWgqcytwKmErZCpjLGVbM109dipyK20qbytnKmYsZVs0XT12KmkrbSp1K2cqbCxlWzVdPXYqcyttKmErZypjLGVbNl09eSpyK2Iqbyt3KmYsZVs3XT15KmkrYip1K3cqbCxlWzhdPXkqcytiKmErdypjLGV9LGMubXVsPWMubXVsdGlwbHksYy50cmFuc2xhdGU9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT10WzRdLGE9dFs1XSxmPXRbNl0sbD10WzddLGM9dFs4XSxoPW5bMF0scD1uWzFdO3JldHVybiBlWzBdPXIsZVsxXT1pLGVbMl09cyxlWzNdPW8sZVs0XT11LGVbNV09YSxlWzZdPWgqcitwKm8rZixlWzddPWgqaStwKnUrbCxlWzhdPWgqcytwKmErYyxlfSxjLnJvdGF0ZT1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PXRbNF0sYT10WzVdLGY9dFs2XSxsPXRbN10sYz10WzhdLGg9TWF0aC5zaW4obikscD1NYXRoLmNvcyhuKTtyZXR1cm4gZVswXT1wKnIraCpvLGVbMV09cCppK2gqdSxlWzJdPXAqcytoKmEsZVszXT1wKm8taCpyLGVbNF09cCp1LWgqaSxlWzVdPXAqYS1oKnMsZVs2XT1mLGVbN109bCxlWzhdPWMsZX0sYy5zY2FsZT1mdW5jdGlvbihlLHQsbil7dmFyIHI9blswXSxpPW5bMV07cmV0dXJuIGVbMF09cip0WzBdLGVbMV09cip0WzFdLGVbMl09cip0WzJdLGVbM109aSp0WzNdLGVbNF09aSp0WzRdLGVbNV09aSp0WzVdLGVbNl09dFs2XSxlWzddPXRbN10sZVs4XT10WzhdLGV9LGMuZnJvbU1hdDJkPWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF09dFswXSxlWzFdPXRbMV0sZVsyXT0wLGVbM109dFsyXSxlWzRdPXRbM10sZVs1XT0wLGVbNl09dFs0XSxlWzddPXRbNV0sZVs4XT0xLGV9LGMuZnJvbVF1YXQ9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLHI9dFsxXSxpPXRbMl0scz10WzNdLG89bituLHU9cityLGE9aStpLGY9bipvLGw9cipvLGM9cip1LGg9aSpvLHA9aSp1LGQ9aSphLHY9cypvLG09cyp1LGc9cyphO3JldHVybiBlWzBdPTEtYy1kLGVbM109bC1nLGVbNl09aCttLGVbMV09bCtnLGVbNF09MS1mLWQsZVs3XT1wLXYsZVsyXT1oLW0sZVs1XT1wK3YsZVs4XT0xLWYtYyxlfSxjLm5vcm1hbEZyb21NYXQ0PWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSxyPXRbMV0saT10WzJdLHM9dFszXSxvPXRbNF0sdT10WzVdLGE9dFs2XSxmPXRbN10sbD10WzhdLGM9dFs5XSxoPXRbMTBdLHA9dFsxMV0sZD10WzEyXSx2PXRbMTNdLG09dFsxNF0sZz10WzE1XSx5PW4qdS1yKm8sYj1uKmEtaSpvLHc9bipmLXMqbyxFPXIqYS1pKnUsUz1yKmYtcyp1LHg9aSpmLXMqYSxUPWwqdi1jKmQsTj1sKm0taCpkLEM9bCpnLXAqZCxrPWMqbS1oKnYsTD1jKmctcCp2LEE9aCpnLXAqbSxPPXkqQS1iKkwrdyprK0UqQy1TKk4reCpUO3JldHVybiBPPyhPPTEvTyxlWzBdPSh1KkEtYSpMK2YqaykqTyxlWzFdPShhKkMtbypBLWYqTikqTyxlWzJdPShvKkwtdSpDK2YqVCkqTyxlWzNdPShpKkwtcipBLXMqaykqTyxlWzRdPShuKkEtaSpDK3MqTikqTyxlWzVdPShyKkMtbipMLXMqVCkqTyxlWzZdPSh2KngtbSpTK2cqRSkqTyxlWzddPShtKnctZCp4LWcqYikqTyxlWzhdPShkKlMtdip3K2cqeSkqTyxlKTpudWxsfSxjLnN0cj1mdW5jdGlvbihlKXtyZXR1cm5cIm1hdDMoXCIrZVswXStcIiwgXCIrZVsxXStcIiwgXCIrZVsyXStcIiwgXCIrZVszXStcIiwgXCIrZVs0XStcIiwgXCIrZVs1XStcIiwgXCIrZVs2XStcIiwgXCIrZVs3XStcIiwgXCIrZVs4XStcIilcIn0sYy5mcm9iPWZ1bmN0aW9uKGUpe3JldHVybiBNYXRoLnNxcnQoTWF0aC5wb3coZVswXSwyKStNYXRoLnBvdyhlWzFdLDIpK01hdGgucG93KGVbMl0sMikrTWF0aC5wb3coZVszXSwyKStNYXRoLnBvdyhlWzRdLDIpK01hdGgucG93KGVbNV0sMikrTWF0aC5wb3coZVs2XSwyKStNYXRoLnBvdyhlWzddLDIpK01hdGgucG93KGVbOF0sMikpfSx0eXBlb2YgZSE9XCJ1bmRlZmluZWRcIiYmKGUubWF0Mz1jKTt2YXIgaD17fTtoLmNyZWF0ZT1mdW5jdGlvbigpe3ZhciBlPW5ldyBuKDE2KTtyZXR1cm4gZVswXT0xLGVbMV09MCxlWzJdPTAsZVszXT0wLGVbNF09MCxlWzVdPTEsZVs2XT0wLGVbN109MCxlWzhdPTAsZVs5XT0wLGVbMTBdPTEsZVsxMV09MCxlWzEyXT0wLGVbMTNdPTAsZVsxNF09MCxlWzE1XT0xLGV9LGguY2xvbmU9ZnVuY3Rpb24oZSl7dmFyIHQ9bmV3IG4oMTYpO3JldHVybiB0WzBdPWVbMF0sdFsxXT1lWzFdLHRbMl09ZVsyXSx0WzNdPWVbM10sdFs0XT1lWzRdLHRbNV09ZVs1XSx0WzZdPWVbNl0sdFs3XT1lWzddLHRbOF09ZVs4XSx0WzldPWVbOV0sdFsxMF09ZVsxMF0sdFsxMV09ZVsxMV0sdFsxMl09ZVsxMl0sdFsxM109ZVsxM10sdFsxNF09ZVsxNF0sdFsxNV09ZVsxNV0sdH0saC5jb3B5PWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF09dFswXSxlWzFdPXRbMV0sZVsyXT10WzJdLGVbM109dFszXSxlWzRdPXRbNF0sZVs1XT10WzVdLGVbNl09dFs2XSxlWzddPXRbN10sZVs4XT10WzhdLGVbOV09dFs5XSxlWzEwXT10WzEwXSxlWzExXT10WzExXSxlWzEyXT10WzEyXSxlWzEzXT10WzEzXSxlWzE0XT10WzE0XSxlWzE1XT10WzE1XSxlfSxoLmlkZW50aXR5PWZ1bmN0aW9uKGUpe3JldHVybiBlWzBdPTEsZVsxXT0wLGVbMl09MCxlWzNdPTAsZVs0XT0wLGVbNV09MSxlWzZdPTAsZVs3XT0wLGVbOF09MCxlWzldPTAsZVsxMF09MSxlWzExXT0wLGVbMTJdPTAsZVsxM109MCxlWzE0XT0wLGVbMTVdPTEsZX0saC50cmFuc3Bvc2U9ZnVuY3Rpb24oZSx0KXtpZihlPT09dCl7dmFyIG49dFsxXSxyPXRbMl0saT10WzNdLHM9dFs2XSxvPXRbN10sdT10WzExXTtlWzFdPXRbNF0sZVsyXT10WzhdLGVbM109dFsxMl0sZVs0XT1uLGVbNl09dFs5XSxlWzddPXRbMTNdLGVbOF09cixlWzldPXMsZVsxMV09dFsxNF0sZVsxMl09aSxlWzEzXT1vLGVbMTRdPXV9ZWxzZSBlWzBdPXRbMF0sZVsxXT10WzRdLGVbMl09dFs4XSxlWzNdPXRbMTJdLGVbNF09dFsxXSxlWzVdPXRbNV0sZVs2XT10WzldLGVbN109dFsxM10sZVs4XT10WzJdLGVbOV09dFs2XSxlWzEwXT10WzEwXSxlWzExXT10WzE0XSxlWzEyXT10WzNdLGVbMTNdPXRbN10sZVsxNF09dFsxMV0sZVsxNV09dFsxNV07cmV0dXJuIGV9LGguaW52ZXJ0PWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSxyPXRbMV0saT10WzJdLHM9dFszXSxvPXRbNF0sdT10WzVdLGE9dFs2XSxmPXRbN10sbD10WzhdLGM9dFs5XSxoPXRbMTBdLHA9dFsxMV0sZD10WzEyXSx2PXRbMTNdLG09dFsxNF0sZz10WzE1XSx5PW4qdS1yKm8sYj1uKmEtaSpvLHc9bipmLXMqbyxFPXIqYS1pKnUsUz1yKmYtcyp1LHg9aSpmLXMqYSxUPWwqdi1jKmQsTj1sKm0taCpkLEM9bCpnLXAqZCxrPWMqbS1oKnYsTD1jKmctcCp2LEE9aCpnLXAqbSxPPXkqQS1iKkwrdyprK0UqQy1TKk4reCpUO3JldHVybiBPPyhPPTEvTyxlWzBdPSh1KkEtYSpMK2YqaykqTyxlWzFdPShpKkwtcipBLXMqaykqTyxlWzJdPSh2KngtbSpTK2cqRSkqTyxlWzNdPShoKlMtYyp4LXAqRSkqTyxlWzRdPShhKkMtbypBLWYqTikqTyxlWzVdPShuKkEtaSpDK3MqTikqTyxlWzZdPShtKnctZCp4LWcqYikqTyxlWzddPShsKngtaCp3K3AqYikqTyxlWzhdPShvKkwtdSpDK2YqVCkqTyxlWzldPShyKkMtbipMLXMqVCkqTyxlWzEwXT0oZCpTLXYqdytnKnkpKk8sZVsxMV09KGMqdy1sKlMtcCp5KSpPLGVbMTJdPSh1Kk4tbyprLWEqVCkqTyxlWzEzXT0obiprLXIqTitpKlQpKk8sZVsxNF09KHYqYi1kKkUtbSp5KSpPLGVbMTVdPShsKkUtYypiK2gqeSkqTyxlKTpudWxsfSxoLmFkam9pbnQ9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLHI9dFsxXSxpPXRbMl0scz10WzNdLG89dFs0XSx1PXRbNV0sYT10WzZdLGY9dFs3XSxsPXRbOF0sYz10WzldLGg9dFsxMF0scD10WzExXSxkPXRbMTJdLHY9dFsxM10sbT10WzE0XSxnPXRbMTVdO3JldHVybiBlWzBdPXUqKGgqZy1wKm0pLWMqKGEqZy1mKm0pK3YqKGEqcC1mKmgpLGVbMV09LShyKihoKmctcCptKS1jKihpKmctcyptKSt2KihpKnAtcypoKSksZVsyXT1yKihhKmctZiptKS11KihpKmctcyptKSt2KihpKmYtcyphKSxlWzNdPS0ociooYSpwLWYqaCktdSooaSpwLXMqaCkrYyooaSpmLXMqYSkpLGVbNF09LShvKihoKmctcCptKS1sKihhKmctZiptKStkKihhKnAtZipoKSksZVs1XT1uKihoKmctcCptKS1sKihpKmctcyptKStkKihpKnAtcypoKSxlWzZdPS0obiooYSpnLWYqbSktbyooaSpnLXMqbSkrZCooaSpmLXMqYSkpLGVbN109biooYSpwLWYqaCktbyooaSpwLXMqaCkrbCooaSpmLXMqYSksZVs4XT1vKihjKmctcCp2KS1sKih1KmctZip2KStkKih1KnAtZipjKSxlWzldPS0obiooYypnLXAqdiktbCoocipnLXMqdikrZCoocipwLXMqYykpLGVbMTBdPW4qKHUqZy1mKnYpLW8qKHIqZy1zKnYpK2QqKHIqZi1zKnUpLGVbMTFdPS0obioodSpwLWYqYyktbyoocipwLXMqYykrbCoocipmLXMqdSkpLGVbMTJdPS0obyooYyptLWgqdiktbCoodSptLWEqdikrZCoodSpoLWEqYykpLGVbMTNdPW4qKGMqbS1oKnYpLWwqKHIqbS1pKnYpK2QqKHIqaC1pKmMpLGVbMTRdPS0obioodSptLWEqdiktbyoociptLWkqdikrZCoociphLWkqdSkpLGVbMTVdPW4qKHUqaC1hKmMpLW8qKHIqaC1pKmMpK2wqKHIqYS1pKnUpLGV9LGguZGV0ZXJtaW5hbnQ9ZnVuY3Rpb24oZSl7dmFyIHQ9ZVswXSxuPWVbMV0scj1lWzJdLGk9ZVszXSxzPWVbNF0sbz1lWzVdLHU9ZVs2XSxhPWVbN10sZj1lWzhdLGw9ZVs5XSxjPWVbMTBdLGg9ZVsxMV0scD1lWzEyXSxkPWVbMTNdLHY9ZVsxNF0sbT1lWzE1XSxnPXQqby1uKnMseT10KnUtcipzLGI9dCphLWkqcyx3PW4qdS1yKm8sRT1uKmEtaSpvLFM9ciphLWkqdSx4PWYqZC1sKnAsVD1mKnYtYypwLE49ZiptLWgqcCxDPWwqdi1jKmQsaz1sKm0taCpkLEw9YyptLWgqdjtyZXR1cm4gZypMLXkqaytiKkMrdypOLUUqVCtTKnh9LGgubXVsdGlwbHk9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT10WzRdLGE9dFs1XSxmPXRbNl0sbD10WzddLGM9dFs4XSxoPXRbOV0scD10WzEwXSxkPXRbMTFdLHY9dFsxMl0sbT10WzEzXSxnPXRbMTRdLHk9dFsxNV0sYj1uWzBdLHc9blsxXSxFPW5bMl0sUz1uWzNdO3JldHVybiBlWzBdPWIqcit3KnUrRSpjK1MqdixlWzFdPWIqaSt3KmErRSpoK1MqbSxlWzJdPWIqcyt3KmYrRSpwK1MqZyxlWzNdPWIqbyt3KmwrRSpkK1MqeSxiPW5bNF0sdz1uWzVdLEU9bls2XSxTPW5bN10sZVs0XT1iKnIrdyp1K0UqYytTKnYsZVs1XT1iKmkrdyphK0UqaCtTKm0sZVs2XT1iKnMrdypmK0UqcCtTKmcsZVs3XT1iKm8rdypsK0UqZCtTKnksYj1uWzhdLHc9bls5XSxFPW5bMTBdLFM9blsxMV0sZVs4XT1iKnIrdyp1K0UqYytTKnYsZVs5XT1iKmkrdyphK0UqaCtTKm0sZVsxMF09YipzK3cqZitFKnArUypnLGVbMTFdPWIqbyt3KmwrRSpkK1MqeSxiPW5bMTJdLHc9blsxM10sRT1uWzE0XSxTPW5bMTVdLGVbMTJdPWIqcit3KnUrRSpjK1MqdixlWzEzXT1iKmkrdyphK0UqaCtTKm0sZVsxNF09YipzK3cqZitFKnArUypnLGVbMTVdPWIqbyt3KmwrRSpkK1MqeSxlfSxoLm11bD1oLm11bHRpcGx5LGgudHJhbnNsYXRlPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj1uWzBdLGk9blsxXSxzPW5bMl0sbyx1LGEsZixsLGMsaCxwLGQsdixtLGc7cmV0dXJuIHQ9PT1lPyhlWzEyXT10WzBdKnIrdFs0XSppK3RbOF0qcyt0WzEyXSxlWzEzXT10WzFdKnIrdFs1XSppK3RbOV0qcyt0WzEzXSxlWzE0XT10WzJdKnIrdFs2XSppK3RbMTBdKnMrdFsxNF0sZVsxNV09dFszXSpyK3RbN10qaSt0WzExXSpzK3RbMTVdKToobz10WzBdLHU9dFsxXSxhPXRbMl0sZj10WzNdLGw9dFs0XSxjPXRbNV0saD10WzZdLHA9dFs3XSxkPXRbOF0sdj10WzldLG09dFsxMF0sZz10WzExXSxlWzBdPW8sZVsxXT11LGVbMl09YSxlWzNdPWYsZVs0XT1sLGVbNV09YyxlWzZdPWgsZVs3XT1wLGVbOF09ZCxlWzldPXYsZVsxMF09bSxlWzExXT1nLGVbMTJdPW8qcitsKmkrZCpzK3RbMTJdLGVbMTNdPXUqcitjKmkrdipzK3RbMTNdLGVbMTRdPWEqcitoKmkrbSpzK3RbMTRdLGVbMTVdPWYqcitwKmkrZypzK3RbMTVdKSxlfSxoLnNjYWxlPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj1uWzBdLGk9blsxXSxzPW5bMl07cmV0dXJuIGVbMF09dFswXSpyLGVbMV09dFsxXSpyLGVbMl09dFsyXSpyLGVbM109dFszXSpyLGVbNF09dFs0XSppLGVbNV09dFs1XSppLGVbNl09dFs2XSppLGVbN109dFs3XSppLGVbOF09dFs4XSpzLGVbOV09dFs5XSpzLGVbMTBdPXRbMTBdKnMsZVsxMV09dFsxMV0qcyxlWzEyXT10WzEyXSxlWzEzXT10WzEzXSxlWzE0XT10WzE0XSxlWzE1XT10WzE1XSxlfSxoLnJvdGF0ZT1mdW5jdGlvbihlLG4scixpKXt2YXIgcz1pWzBdLG89aVsxXSx1PWlbMl0sYT1NYXRoLnNxcnQocypzK28qbyt1KnUpLGYsbCxjLGgscCxkLHYsbSxnLHksYix3LEUsUyx4LFQsTixDLGssTCxBLE8sTSxfO3JldHVybiBNYXRoLmFicyhhKTx0P251bGw6KGE9MS9hLHMqPWEsbyo9YSx1Kj1hLGY9TWF0aC5zaW4ociksbD1NYXRoLmNvcyhyKSxjPTEtbCxoPW5bMF0scD1uWzFdLGQ9blsyXSx2PW5bM10sbT1uWzRdLGc9bls1XSx5PW5bNl0sYj1uWzddLHc9bls4XSxFPW5bOV0sUz1uWzEwXSx4PW5bMTFdLFQ9cypzKmMrbCxOPW8qcypjK3UqZixDPXUqcypjLW8qZixrPXMqbypjLXUqZixMPW8qbypjK2wsQT11Km8qYytzKmYsTz1zKnUqYytvKmYsTT1vKnUqYy1zKmYsXz11KnUqYytsLGVbMF09aCpUK20qTit3KkMsZVsxXT1wKlQrZypOK0UqQyxlWzJdPWQqVCt5Kk4rUypDLGVbM109dipUK2IqTit4KkMsZVs0XT1oKmsrbSpMK3cqQSxlWzVdPXAqaytnKkwrRSpBLGVbNl09ZCprK3kqTCtTKkEsZVs3XT12KmsrYipMK3gqQSxlWzhdPWgqTyttKk0rdypfLGVbOV09cCpPK2cqTStFKl8sZVsxMF09ZCpPK3kqTStTKl8sZVsxMV09dipPK2IqTSt4Kl8sbiE9PWUmJihlWzEyXT1uWzEyXSxlWzEzXT1uWzEzXSxlWzE0XT1uWzE0XSxlWzE1XT1uWzE1XSksZSl9LGgucm90YXRlWD1mdW5jdGlvbihlLHQsbil7dmFyIHI9TWF0aC5zaW4obiksaT1NYXRoLmNvcyhuKSxzPXRbNF0sbz10WzVdLHU9dFs2XSxhPXRbN10sZj10WzhdLGw9dFs5XSxjPXRbMTBdLGg9dFsxMV07cmV0dXJuIHQhPT1lJiYoZVswXT10WzBdLGVbMV09dFsxXSxlWzJdPXRbMl0sZVszXT10WzNdLGVbMTJdPXRbMTJdLGVbMTNdPXRbMTNdLGVbMTRdPXRbMTRdLGVbMTVdPXRbMTVdKSxlWzRdPXMqaStmKnIsZVs1XT1vKmkrbCpyLGVbNl09dSppK2MqcixlWzddPWEqaStoKnIsZVs4XT1mKmktcypyLGVbOV09bCppLW8qcixlWzEwXT1jKmktdSpyLGVbMTFdPWgqaS1hKnIsZX0saC5yb3RhdGVZPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj1NYXRoLnNpbihuKSxpPU1hdGguY29zKG4pLHM9dFswXSxvPXRbMV0sdT10WzJdLGE9dFszXSxmPXRbOF0sbD10WzldLGM9dFsxMF0saD10WzExXTtyZXR1cm4gdCE9PWUmJihlWzRdPXRbNF0sZVs1XT10WzVdLGVbNl09dFs2XSxlWzddPXRbN10sZVsxMl09dFsxMl0sZVsxM109dFsxM10sZVsxNF09dFsxNF0sZVsxNV09dFsxNV0pLGVbMF09cyppLWYqcixlWzFdPW8qaS1sKnIsZVsyXT11KmktYypyLGVbM109YSppLWgqcixlWzhdPXMqcitmKmksZVs5XT1vKnIrbCppLGVbMTBdPXUqcitjKmksZVsxMV09YSpyK2gqaSxlfSxoLnJvdGF0ZVo9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPU1hdGguc2luKG4pLGk9TWF0aC5jb3Mobikscz10WzBdLG89dFsxXSx1PXRbMl0sYT10WzNdLGY9dFs0XSxsPXRbNV0sYz10WzZdLGg9dFs3XTtyZXR1cm4gdCE9PWUmJihlWzhdPXRbOF0sZVs5XT10WzldLGVbMTBdPXRbMTBdLGVbMTFdPXRbMTFdLGVbMTJdPXRbMTJdLGVbMTNdPXRbMTNdLGVbMTRdPXRbMTRdLGVbMTVdPXRbMTVdKSxlWzBdPXMqaStmKnIsZVsxXT1vKmkrbCpyLGVbMl09dSppK2MqcixlWzNdPWEqaStoKnIsZVs0XT1mKmktcypyLGVbNV09bCppLW8qcixlWzZdPWMqaS11KnIsZVs3XT1oKmktYSpyLGV9LGguZnJvbVJvdGF0aW9uVHJhbnNsYXRpb249ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT1yK3IsYT1pK2ksZj1zK3MsbD1yKnUsYz1yKmEsaD1yKmYscD1pKmEsZD1pKmYsdj1zKmYsbT1vKnUsZz1vKmEseT1vKmY7cmV0dXJuIGVbMF09MS0ocCt2KSxlWzFdPWMreSxlWzJdPWgtZyxlWzNdPTAsZVs0XT1jLXksZVs1XT0xLShsK3YpLGVbNl09ZCttLGVbN109MCxlWzhdPWgrZyxlWzldPWQtbSxlWzEwXT0xLShsK3ApLGVbMTFdPTAsZVsxMl09blswXSxlWzEzXT1uWzFdLGVbMTRdPW5bMl0sZVsxNV09MSxlfSxoLmZyb21RdWF0PWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSxyPXRbMV0saT10WzJdLHM9dFszXSxvPW4rbix1PXIrcixhPWkraSxmPW4qbyxsPXIqbyxjPXIqdSxoPWkqbyxwPWkqdSxkPWkqYSx2PXMqbyxtPXMqdSxnPXMqYTtyZXR1cm4gZVswXT0xLWMtZCxlWzFdPWwrZyxlWzJdPWgtbSxlWzNdPTAsZVs0XT1sLWcsZVs1XT0xLWYtZCxlWzZdPXArdixlWzddPTAsZVs4XT1oK20sZVs5XT1wLXYsZVsxMF09MS1mLWMsZVsxMV09MCxlWzEyXT0wLGVbMTNdPTAsZVsxNF09MCxlWzE1XT0xLGV9LGguZnJ1c3R1bT1mdW5jdGlvbihlLHQsbixyLGkscyxvKXt2YXIgdT0xLyhuLXQpLGE9MS8oaS1yKSxmPTEvKHMtbyk7cmV0dXJuIGVbMF09cyoyKnUsZVsxXT0wLGVbMl09MCxlWzNdPTAsZVs0XT0wLGVbNV09cyoyKmEsZVs2XT0wLGVbN109MCxlWzhdPShuK3QpKnUsZVs5XT0oaStyKSphLGVbMTBdPShvK3MpKmYsZVsxMV09LTEsZVsxMl09MCxlWzEzXT0wLGVbMTRdPW8qcyoyKmYsZVsxNV09MCxlfSxoLnBlcnNwZWN0aXZlPWZ1bmN0aW9uKGUsdCxuLHIsaSl7dmFyIHM9MS9NYXRoLnRhbih0LzIpLG89MS8oci1pKTtyZXR1cm4gZVswXT1zL24sZVsxXT0wLGVbMl09MCxlWzNdPTAsZVs0XT0wLGVbNV09cyxlWzZdPTAsZVs3XT0wLGVbOF09MCxlWzldPTAsZVsxMF09KGkrcikqbyxlWzExXT0tMSxlWzEyXT0wLGVbMTNdPTAsZVsxNF09MippKnIqbyxlWzE1XT0wLGV9LGgub3J0aG89ZnVuY3Rpb24oZSx0LG4scixpLHMsbyl7dmFyIHU9MS8odC1uKSxhPTEvKHItaSksZj0xLyhzLW8pO3JldHVybiBlWzBdPS0yKnUsZVsxXT0wLGVbMl09MCxlWzNdPTAsZVs0XT0wLGVbNV09LTIqYSxlWzZdPTAsZVs3XT0wLGVbOF09MCxlWzldPTAsZVsxMF09MipmLGVbMTFdPTAsZVsxMl09KHQrbikqdSxlWzEzXT0oaStyKSphLGVbMTRdPShvK3MpKmYsZVsxNV09MSxlfSxoLmxvb2tBdD1mdW5jdGlvbihlLG4scixpKXt2YXIgcyxvLHUsYSxmLGwsYyxwLGQsdixtPW5bMF0sZz1uWzFdLHk9blsyXSxiPWlbMF0sdz1pWzFdLEU9aVsyXSxTPXJbMF0seD1yWzFdLFQ9clsyXTtyZXR1cm4gTWF0aC5hYnMobS1TKTx0JiZNYXRoLmFicyhnLXgpPHQmJk1hdGguYWJzKHktVCk8dD9oLmlkZW50aXR5KGUpOihjPW0tUyxwPWcteCxkPXktVCx2PTEvTWF0aC5zcXJ0KGMqYytwKnArZCpkKSxjKj12LHAqPXYsZCo9dixzPXcqZC1FKnAsbz1FKmMtYipkLHU9YipwLXcqYyx2PU1hdGguc3FydChzKnMrbypvK3UqdSksdj8odj0xL3Yscyo9dixvKj12LHUqPXYpOihzPTAsbz0wLHU9MCksYT1wKnUtZCpvLGY9ZCpzLWMqdSxsPWMqby1wKnMsdj1NYXRoLnNxcnQoYSphK2YqZitsKmwpLHY/KHY9MS92LGEqPXYsZio9dixsKj12KTooYT0wLGY9MCxsPTApLGVbMF09cyxlWzFdPWEsZVsyXT1jLGVbM109MCxlWzRdPW8sZVs1XT1mLGVbNl09cCxlWzddPTAsZVs4XT11LGVbOV09bCxlWzEwXT1kLGVbMTFdPTAsZVsxMl09LShzKm0rbypnK3UqeSksZVsxM109LShhKm0rZipnK2wqeSksZVsxNF09LShjKm0rcCpnK2QqeSksZVsxNV09MSxlKX0saC5zdHI9ZnVuY3Rpb24oZSl7cmV0dXJuXCJtYXQ0KFwiK2VbMF0rXCIsIFwiK2VbMV0rXCIsIFwiK2VbMl0rXCIsIFwiK2VbM10rXCIsIFwiK2VbNF0rXCIsIFwiK2VbNV0rXCIsIFwiK2VbNl0rXCIsIFwiK2VbN10rXCIsIFwiK2VbOF0rXCIsIFwiK2VbOV0rXCIsIFwiK2VbMTBdK1wiLCBcIitlWzExXStcIiwgXCIrZVsxMl0rXCIsIFwiK2VbMTNdK1wiLCBcIitlWzE0XStcIiwgXCIrZVsxNV0rXCIpXCJ9LGguZnJvYj1mdW5jdGlvbihlKXtyZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KGVbMF0sMikrTWF0aC5wb3coZVsxXSwyKStNYXRoLnBvdyhlWzJdLDIpK01hdGgucG93KGVbM10sMikrTWF0aC5wb3coZVs0XSwyKStNYXRoLnBvdyhlWzVdLDIpK01hdGgucG93KGVbNl0sMikrTWF0aC5wb3coZVs2XSwyKStNYXRoLnBvdyhlWzddLDIpK01hdGgucG93KGVbOF0sMikrTWF0aC5wb3coZVs5XSwyKStNYXRoLnBvdyhlWzEwXSwyKStNYXRoLnBvdyhlWzExXSwyKStNYXRoLnBvdyhlWzEyXSwyKStNYXRoLnBvdyhlWzEzXSwyKStNYXRoLnBvdyhlWzE0XSwyKStNYXRoLnBvdyhlWzE1XSwyKSl9LHR5cGVvZiBlIT1cInVuZGVmaW5lZFwiJiYoZS5tYXQ0PWgpO3ZhciBwPXt9O3AuY3JlYXRlPWZ1bmN0aW9uKCl7dmFyIGU9bmV3IG4oNCk7cmV0dXJuIGVbMF09MCxlWzFdPTAsZVsyXT0wLGVbM109MSxlfSxwLnJvdGF0aW9uVG89ZnVuY3Rpb24oKXt2YXIgZT11LmNyZWF0ZSgpLHQ9dS5mcm9tVmFsdWVzKDEsMCwwKSxuPXUuZnJvbVZhbHVlcygwLDEsMCk7cmV0dXJuIGZ1bmN0aW9uKHIsaSxzKXt2YXIgbz11LmRvdChpLHMpO3JldHVybiBvPC0wLjk5OTk5OT8odS5jcm9zcyhlLHQsaSksdS5sZW5ndGgoZSk8MWUtNiYmdS5jcm9zcyhlLG4saSksdS5ub3JtYWxpemUoZSxlKSxwLnNldEF4aXNBbmdsZShyLGUsTWF0aC5QSSkscik6bz4uOTk5OTk5PyhyWzBdPTAsclsxXT0wLHJbMl09MCxyWzNdPTEscik6KHUuY3Jvc3MoZSxpLHMpLHJbMF09ZVswXSxyWzFdPWVbMV0sclsyXT1lWzJdLHJbM109MStvLHAubm9ybWFsaXplKHIscikpfX0oKSxwLnNldEF4ZXM9ZnVuY3Rpb24oKXt2YXIgZT1jLmNyZWF0ZSgpO3JldHVybiBmdW5jdGlvbih0LG4scixpKXtyZXR1cm4gZVswXT1yWzBdLGVbM109clsxXSxlWzZdPXJbMl0sZVsxXT1pWzBdLGVbNF09aVsxXSxlWzddPWlbMl0sZVsyXT0tblswXSxlWzVdPS1uWzFdLGVbOF09LW5bMl0scC5ub3JtYWxpemUodCxwLmZyb21NYXQzKHQsZSkpfX0oKSxwLmNsb25lPWEuY2xvbmUscC5mcm9tVmFsdWVzPWEuZnJvbVZhbHVlcyxwLmNvcHk9YS5jb3B5LHAuc2V0PWEuc2V0LHAuaWRlbnRpdHk9ZnVuY3Rpb24oZSl7cmV0dXJuIGVbMF09MCxlWzFdPTAsZVsyXT0wLGVbM109MSxlfSxwLnNldEF4aXNBbmdsZT1mdW5jdGlvbihlLHQsbil7bio9LjU7dmFyIHI9TWF0aC5zaW4obik7cmV0dXJuIGVbMF09cip0WzBdLGVbMV09cip0WzFdLGVbMl09cip0WzJdLGVbM109TWF0aC5jb3MobiksZX0scC5hZGQ9YS5hZGQscC5tdWx0aXBseT1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PW5bMF0sYT1uWzFdLGY9blsyXSxsPW5bM107cmV0dXJuIGVbMF09cipsK28qdStpKmYtcyphLGVbMV09aSpsK28qYStzKnUtcipmLGVbMl09cypsK28qZityKmEtaSp1LGVbM109bypsLXIqdS1pKmEtcypmLGV9LHAubXVsPXAubXVsdGlwbHkscC5zY2FsZT1hLnNjYWxlLHAucm90YXRlWD1mdW5jdGlvbihlLHQsbil7bio9LjU7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PU1hdGguc2luKG4pLGE9TWF0aC5jb3Mobik7cmV0dXJuIGVbMF09ciphK28qdSxlWzFdPWkqYStzKnUsZVsyXT1zKmEtaSp1LGVbM109byphLXIqdSxlfSxwLnJvdGF0ZVk9ZnVuY3Rpb24oZSx0LG4pe24qPS41O3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT1NYXRoLnNpbihuKSxhPU1hdGguY29zKG4pO3JldHVybiBlWzBdPXIqYS1zKnUsZVsxXT1pKmErbyp1LGVbMl09cyphK3IqdSxlWzNdPW8qYS1pKnUsZX0scC5yb3RhdGVaPWZ1bmN0aW9uKGUsdCxuKXtuKj0uNTt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz10WzNdLHU9TWF0aC5zaW4obiksYT1NYXRoLmNvcyhuKTtyZXR1cm4gZVswXT1yKmEraSp1LGVbMV09aSphLXIqdSxlWzJdPXMqYStvKnUsZVszXT1vKmEtcyp1LGV9LHAuY2FsY3VsYXRlVz1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9dFsyXTtyZXR1cm4gZVswXT1uLGVbMV09cixlWzJdPWksZVszXT0tTWF0aC5zcXJ0KE1hdGguYWJzKDEtbipuLXIqci1pKmkpKSxlfSxwLmRvdD1hLmRvdCxwLmxlcnA9YS5sZXJwLHAuc2xlcnA9ZnVuY3Rpb24oZSx0LG4scil7dmFyIGk9dFswXSxzPXRbMV0sbz10WzJdLHU9dFszXSxhPW5bMF0sZj1uWzFdLGw9blsyXSxjPW5bM10saCxwLGQsdixtO3JldHVybiBwPWkqYStzKmYrbypsK3UqYyxwPDAmJihwPS1wLGE9LWEsZj0tZixsPS1sLGM9LWMpLDEtcD4xZS02PyhoPU1hdGguYWNvcyhwKSxkPU1hdGguc2luKGgpLHY9TWF0aC5zaW4oKDEtcikqaCkvZCxtPU1hdGguc2luKHIqaCkvZCk6KHY9MS1yLG09ciksZVswXT12KmkrbSphLGVbMV09dipzK20qZixlWzJdPXYqbyttKmwsZVszXT12KnUrbSpjLGV9LHAuaW52ZXJ0PWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSxyPXRbMV0saT10WzJdLHM9dFszXSxvPW4qbityKnIraSppK3Mqcyx1PW8/MS9vOjA7cmV0dXJuIGVbMF09LW4qdSxlWzFdPS1yKnUsZVsyXT0taSp1LGVbM109cyp1LGV9LHAuY29uanVnYXRlPWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF09LXRbMF0sZVsxXT0tdFsxXSxlWzJdPS10WzJdLGVbM109dFszXSxlfSxwLmxlbmd0aD1hLmxlbmd0aCxwLmxlbj1wLmxlbmd0aCxwLnNxdWFyZWRMZW5ndGg9YS5zcXVhcmVkTGVuZ3RoLHAuc3FyTGVuPXAuc3F1YXJlZExlbmd0aCxwLm5vcm1hbGl6ZT1hLm5vcm1hbGl6ZSxwLmZyb21NYXQzPWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSt0WzRdK3RbOF0scjtpZihuPjApcj1NYXRoLnNxcnQobisxKSxlWzNdPS41KnIscj0uNS9yLGVbMF09KHRbN10tdFs1XSkqcixlWzFdPSh0WzJdLXRbNl0pKnIsZVsyXT0odFszXS10WzFdKSpyO2Vsc2V7dmFyIGk9MDt0WzRdPnRbMF0mJihpPTEpLHRbOF0+dFtpKjMraV0mJihpPTIpO3ZhciBzPShpKzEpJTMsbz0oaSsyKSUzO3I9TWF0aC5zcXJ0KHRbaSozK2ldLXRbcyozK3NdLXRbbyozK29dKzEpLGVbaV09LjUqcixyPS41L3IsZVszXT0odFtvKjMrc10tdFtzKjMrb10pKnIsZVtzXT0odFtzKjMraV0rdFtpKjMrc10pKnIsZVtvXT0odFtvKjMraV0rdFtpKjMrb10pKnJ9cmV0dXJuIGV9LHAuc3RyPWZ1bmN0aW9uKGUpe3JldHVyblwicXVhdChcIitlWzBdK1wiLCBcIitlWzFdK1wiLCBcIitlWzJdK1wiLCBcIitlWzNdK1wiKVwifSx0eXBlb2YgZSE9XCJ1bmRlZmluZWRcIiYmKGUucXVhdD1wKX0odC5leHBvcnRzKX0pKHRoaXMpO1xufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIxWWlaNVNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9saWIvZ2wtbWF0cml4LW1pbi5qc1wiLFwiL2xpYlwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8vIExINCwgTEhBICgtbGg0LSkgZXh0cmFjdG9yLCBubyBjcmMvc3VtLWNoZWNrcy4gV2lsbCBleHRyYWN0IFNGWC1hcmNoaXZlcyBhcyB3ZWxsLlxyXG4vLyBFcmxhbmQgUmFudmluZ2UgKGVybGFuZC5yYW52aW5nZUBnbWFpbC5jb20pXHJcbi8vIEJhc2VkIG9uIGEgbWl4IG9mIE5vYnV5YXN1IFN1ZWhpcm8ncyBKYXZhIGltcGxlbWVudGF0aW9uIGFuZCBTaW1vbiBIb3dhcmQncyBDIHZlcnNpb24uXHJcblxyXG52YXIgTGhhQXJyYXlSZWFkZXIgPSBmdW5jdGlvbihidWZmZXIpIHtcclxuICAgIHRoaXMuYnVmZmVyID0gYnVmZmVyO1xyXG4gICAgdGhpcy5vZmZzZXQgPSAwO1xyXG4gICAgdGhpcy5zdWJPZmZzZXQgPSA3O1xyXG59O1xyXG5MaGFBcnJheVJlYWRlci5TZWVrQWJzb2x1dGUgPSAwO1xyXG5MaGFBcnJheVJlYWRlci5TZWVrUmVsYXRpdmUgPSAxO1xyXG5cclxuTGhhQXJyYXlSZWFkZXIucHJvdG90eXBlLnJlYWRCaXRzID0gZnVuY3Rpb24oYml0cykge1xyXG4gICAgdmFyIGJpdE1hc2tzID0gWzEsIDIsIDQsIDgsIDE2LCAzMiwgNjQsIDEyOF07XHJcbiAgICB2YXIgYnl0ZSA9IHRoaXMuYnVmZmVyW3RoaXMub2Zmc2V0XTtcclxuICAgIHZhciByZXN1bHQgPSAwO1xyXG5cclxuICAgIGZvciAodmFyIGJpdEluZGV4ID0gMDsgYml0SW5kZXggPCBiaXRzOyBiaXRJbmRleCsrKSB7XHJcbiAgICAgICAgdmFyIGJpdCA9IChieXRlICYgYml0TWFza3NbdGhpcy5zdWJPZmZzZXRdKSA+PiB0aGlzLnN1Yk9mZnNldDtcclxuICAgICAgICByZXN1bHQgPDw9IDE7XHJcbiAgICAgICAgcmVzdWx0ID0gcmVzdWx0IHwgYml0O1xyXG4gICAgICAgIHRoaXMuc3ViT2Zmc2V0LS07XHJcbiAgICAgICAgaWYgKHRoaXMuc3ViT2Zmc2V0IDwgMCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5vZmZzZXQgKyAxID49IHRoaXMuYnVmZmVyLmxlbmd0aClcclxuICAgICAgICAgICAgICAgIHJldHVybiAtMTtcclxuXHJcbiAgICAgICAgICAgIGJ5dGUgPSB0aGlzLmJ1ZmZlclsrK3RoaXMub2Zmc2V0XTtcclxuICAgICAgICAgICAgdGhpcy5zdWJPZmZzZXQgPSA3O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn07XHJcblxyXG5MaGFBcnJheVJlYWRlci5wcm90b3R5cGUucmVhZFVJbnQ4ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAodGhpcy5vZmZzZXQgKyAxID49IHRoaXMuYnVmZmVyLmxlbmd0aClcclxuICAgICAgICByZXR1cm4gLTE7XHJcbiAgICByZXR1cm4gdGhpcy5idWZmZXJbdGhpcy5vZmZzZXQrK107XHJcbn07XHJcbkxoYUFycmF5UmVhZGVyLnByb3RvdHlwZS5yZWFkVUludDE2ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAodGhpcy5vZmZzZXQgKyAyID49IHRoaXMuYnVmZmVyLmxlbmd0aClcclxuICAgICAgICByZXR1cm4gLTE7XHJcbiAgICB2YXIgdmFsdWUgPVxyXG4gICAgICAgICh0aGlzLmJ1ZmZlclt0aGlzLm9mZnNldF0gJiAweEZGKSB8XHJcbiAgICAgICAgICAgICgodGhpcy5idWZmZXJbdGhpcy5vZmZzZXQrMV0gPDwgOCkgJiAweEZGMDApO1xyXG4gICAgdGhpcy5vZmZzZXQgKz0gMjtcclxuICAgIHJldHVybiB2YWx1ZTtcclxufTtcclxuTGhhQXJyYXlSZWFkZXIucHJvdG90eXBlLnJlYWRVSW50MzIgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICh0aGlzLm9mZnNldCArIDQgPj0gdGhpcy5idWZmZXIubGVuZ3RoKVxyXG4gICAgICAgIHJldHVybiAtMTtcclxuICAgIHZhciB2YWx1ZSA9XHJcbiAgICAgICAgKHRoaXMuYnVmZmVyW3RoaXMub2Zmc2V0XSAmIDB4RkYpIHxcclxuICAgICAgICAgICAgKCh0aGlzLmJ1ZmZlclt0aGlzLm9mZnNldCsxXSA8PCA4KSAmIDB4RkYwMCkgfFxyXG4gICAgICAgICAgICAoKHRoaXMuYnVmZmVyW3RoaXMub2Zmc2V0KzJdIDw8IDE2KSAmIDB4RkYwMDAwKSB8XHJcbiAgICAgICAgICAgICgodGhpcy5idWZmZXJbdGhpcy5vZmZzZXQrM10gPDwgMjQpICYgMHhGRjAwMDAwMCk7XHJcbiAgICB0aGlzLm9mZnNldCArPSA0O1xyXG4gICAgcmV0dXJuIHZhbHVlO1xyXG59O1xyXG5MaGFBcnJheVJlYWRlci5wcm90b3R5cGUucmVhZFN0cmluZyA9IGZ1bmN0aW9uKHNpemUpIHtcclxuICAgIGlmICh0aGlzLm9mZnNldCArIHNpemUgPj0gdGhpcy5idWZmZXIubGVuZ3RoKVxyXG4gICAgICAgIHJldHVybiAtMTtcclxuICAgIHZhciByZXN1bHQgPSAnJztcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2l6ZTsgaSsrKVxyXG4gICAgICAgIHJlc3VsdCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHRoaXMuYnVmZmVyW3RoaXMub2Zmc2V0KytdKTtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn07XHJcblxyXG5MaGFBcnJheVJlYWRlci5wcm90b3R5cGUucmVhZExlbmd0aCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGxlbmd0aCA9IHRoaXMucmVhZEJpdHMoMyk7XHJcbiAgICBpZiAobGVuZ3RoID09IC0xKVxyXG4gICAgICAgIHJldHVybiAtMTtcclxuXHJcbiAgICBpZiAobGVuZ3RoID09IDcpIHtcclxuICAgICAgICB3aGlsZSAodGhpcy5yZWFkQml0cygxKSAhPSAwKSB7XHJcbiAgICAgICAgICAgIGxlbmd0aCsrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBsZW5ndGg7XHJcbn07XHJcbkxoYUFycmF5UmVhZGVyLnByb3RvdHlwZS5zZWVrID0gZnVuY3Rpb24ob2Zmc2V0LCBtb2RlKSB7XHJcbiAgICBzd2l0Y2ggKG1vZGUpIHtcclxuICAgICAgICBjYXNlIExoYUFycmF5UmVhZGVyLlNlZWtBYnNvbHV0ZTpcclxuICAgICAgICAgICAgdGhpcy5vZmZzZXQgPSBvZmZzZXQ7XHJcbiAgICAgICAgICAgIHRoaXMuc3ViT2Zmc2V0ID0gNztcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBMaGFBcnJheVJlYWRlci5TZWVrUmVsYXRpdmU6XHJcbiAgICAgICAgICAgIHRoaXMub2Zmc2V0ICs9IG9mZnNldDtcclxuICAgICAgICAgICAgdGhpcy5zdWJPZmZzZXQgPSA3O1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgIH1cclxufTtcclxuTGhhQXJyYXlSZWFkZXIucHJvdG90eXBlLmdldFBvc2l0aW9uID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5vZmZzZXQ7XHJcbn07XHJcblxyXG52YXIgTGhhQXJyYXlXcml0ZXIgPSBmdW5jdGlvbihzaXplKSB7XHJcbiAgICB0aGlzLm9mZnNldCA9IDA7XHJcbiAgICB0aGlzLnNpemUgPSBzaXplO1xyXG4gICAgdGhpcy5kYXRhID0gbmV3IFVpbnQ4QXJyYXkoc2l6ZSk7XHJcbn07XHJcblxyXG5MaGFBcnJheVdyaXRlci5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICB0aGlzLmRhdGFbdGhpcy5vZmZzZXQrK10gPSBkYXRhO1xyXG59O1xyXG5cclxudmFyIExoYVRyZWUgPSBmdW5jdGlvbigpIHt9O1xyXG5MaGFUcmVlLkxFQUYgPSAxIDw8IDE1O1xyXG5cclxuTGhhVHJlZS5wcm90b3R5cGUuc2V0Q29uc3RhbnQgPSBmdW5jdGlvbihjb2RlKSB7XHJcbiAgICB0aGlzLnRyZWVbMF0gPSBjb2RlIHwgTGhhVHJlZS5MRUFGO1xyXG59O1xyXG5cclxuTGhhVHJlZS5wcm90b3R5cGUuZXhwYW5kID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgbmV3Tm9kZXMgPSAodGhpcy5hbGxvY2F0ZWQgLSB0aGlzLm5leHRFbnRyeSkgKiAyO1xyXG4gICAgdmFyIGVuZE9mZnNldCA9IHRoaXMuYWxsb2NhdGVkO1xyXG4gICAgd2hpbGUgKHRoaXMubmV4dEVudHJ5IDwgZW5kT2Zmc2V0KSB7XHJcbiAgICAgICAgdGhpcy50cmVlW3RoaXMubmV4dEVudHJ5XSA9IHRoaXMuYWxsb2NhdGVkO1xyXG4gICAgICAgIHRoaXMuYWxsb2NhdGVkICs9IDI7XHJcbiAgICAgICAgdGhpcy5uZXh0RW50cnkrKztcclxuICAgIH1cclxufTtcclxuXHJcbkxoYVRyZWUucHJvdG90eXBlLmFkZENvZGVzV2l0aExlbmd0aCA9IGZ1bmN0aW9uKGNvZGVMZW5ndGhzLCBjb2RlTGVuZ3RoKSB7XHJcbiAgICB2YXIgZG9uZSA9IHRydWU7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvZGVMZW5ndGhzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKGNvZGVMZW5ndGhzW2ldID09IGNvZGVMZW5ndGgpIHtcclxuICAgICAgICAgICAgdmFyIG5vZGUgPSB0aGlzLm5leHRFbnRyeSsrO1xyXG4gICAgICAgICAgICB0aGlzLnRyZWVbbm9kZV0gPSBpIHwgTGhhVHJlZS5MRUFGO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY29kZUxlbmd0aHNbaV0gPiBjb2RlTGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGRvbmUgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZG9uZTtcclxufTtcclxuXHJcbkxoYVRyZWUucHJvdG90eXBlLmJ1aWxkID0gZnVuY3Rpb24oY29kZUxlbmd0aHMsIHNpemUpIHtcclxuICAgIHRoaXMudHJlZSA9IFtdO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzaXplOyBpKyspXHJcbiAgICAgICAgdGhpcy50cmVlW2ldID0gTGhhVHJlZS5MRUFGO1xyXG5cclxuICAgIHRoaXMubmV4dEVudHJ5ID0gMDtcclxuICAgIHRoaXMuYWxsb2NhdGVkID0gMTtcclxuICAgIHZhciBjb2RlTGVuZ3RoID0gMDtcclxuICAgIGRvIHtcclxuICAgICAgICB0aGlzLmV4cGFuZCgpO1xyXG4gICAgICAgIGNvZGVMZW5ndGgrKztcclxuICAgIH0gd2hpbGUgKCF0aGlzLmFkZENvZGVzV2l0aExlbmd0aChjb2RlTGVuZ3RocywgY29kZUxlbmd0aCkpO1xyXG59O1xyXG5cclxuTGhhVHJlZS5wcm90b3R5cGUucmVhZENvZGUgPSBmdW5jdGlvbihyZWFkZXIpIHtcclxuICAgIHZhciBjb2RlID0gdGhpcy50cmVlWzBdO1xyXG4gICAgd2hpbGUgKChjb2RlICYgTGhhVHJlZS5MRUFGKSA9PSAwKSB7XHJcbiAgICAgICAgdmFyIGJpdCA9IHJlYWRlci5yZWFkQml0cygxKTtcclxuICAgICAgICBjb2RlID0gdGhpcy50cmVlW2NvZGUgKyBiaXRdO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGNvZGUgJiB+TGhhVHJlZS5MRUFGO1xyXG59O1xyXG5cclxudmFyIExoYVJpbmdCdWZmZXIgPSBmdW5jdGlvbihzaXplKSB7XHJcbiAgICB0aGlzLmRhdGEgPSBbXTtcclxuICAgIHRoaXMuc2l6ZSA9IHNpemU7XHJcbiAgICB0aGlzLm9mZnNldCA9IDA7XHJcbn07XHJcblxyXG5MaGFSaW5nQnVmZmVyLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgdGhpcy5kYXRhW3RoaXMub2Zmc2V0XSA9IHZhbHVlO1xyXG4gICAgdGhpcy5vZmZzZXQgPSAodGhpcy5vZmZzZXQgKyAxKSAlIHRoaXMuc2l6ZTtcclxufTtcclxuXHJcbkxoYVJpbmdCdWZmZXIucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKG9mZnNldCwgbGVuZ3RoKSB7XHJcbiAgICB2YXIgcG9zID0gdGhpcy5vZmZzZXQgKyB0aGlzLnNpemUgLSBvZmZzZXQgLSAxO1xyXG4gICAgdmFyIHJlc3VsdCA9IFtdO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBjb2RlID0gdGhpcy5kYXRhWyhwb3MgKyBpKSAlIHRoaXMuc2l6ZV07XHJcbiAgICAgICAgcmVzdWx0LnB1c2goY29kZSk7XHJcbiAgICAgICAgdGhpcy5hZGQoY29kZSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59O1xyXG5cclxudmFyIExoYVJlYWRlciA9IGZ1bmN0aW9uKHJlYWRlcikge1xyXG4gICAgdGhpcy5yZWFkZXIgPSByZWFkZXI7XHJcbiAgICB0aGlzLm9mZnNldFRyZWUgPSBuZXcgTGhhVHJlZSgpO1xyXG4gICAgdGhpcy5jb2RlVHJlZSA9IG5ldyBMaGFUcmVlKCk7XHJcbiAgICB0aGlzLnJpbmdCdWZmZXIgPSBuZXcgTGhhUmluZ0J1ZmZlcigxIDw8IDEzKTsgLy8gbGg0IHNwZWNpZmljLlxyXG4gICAgdGhpcy5lbnRyaWVzID0gW107XHJcblxyXG4gICAgaWYgKHJlYWRlci5yZWFkU3RyaW5nKDIpID09ICdNWicpIHsgLy8gQ2hlY2sgZm9yIFNGWCBoZWFkZXIsIGFuZCBza2lwIGl0IGlmIGl0IGV4aXN0cy5cclxuICAgICAgICB2YXIgbGFzdEJsb2NrU2l6ZSA9IHJlYWRlci5yZWFkVUludDE2KCk7XHJcbiAgICAgICAgdmFyIGJsb2NrQ291bnQgPSByZWFkZXIucmVhZFVJbnQxNigpO1xyXG4gICAgICAgIHZhciBvZmZzZXQgPSAoYmxvY2tDb3VudCAtIDEpICogNTEyICsgKGxhc3RCbG9ja1NpemUgIT0gMCA/IGxhc3RCbG9ja1NpemUgOiA1MTIpO1xyXG4gICAgICAgIHJlYWRlci5zZWVrKG9mZnNldCwgTGhhQXJyYXlSZWFkZXIuU2Vla0Fic29sdXRlKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmVhZGVyLnNlZWsoMCwgTGhhQXJyYXlSZWFkZXIuU2Vla0Fic29sdXRlKTtcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKDs7KSB7XHJcbiAgICAgICAgdmFyIGhlYWRlciA9IHt9O1xyXG4gICAgICAgIGhlYWRlci5zaXplID0gcmVhZGVyLnJlYWRVSW50OCgpO1xyXG4gICAgICAgIGlmIChoZWFkZXIuc2l6ZSA8PSAwKVxyXG4gICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgaGVhZGVyLmNoZWNrc3VtID0gcmVhZGVyLnJlYWRVSW50OCgpO1xyXG4gICAgICAgIGhlYWRlci5pZCA9IHJlYWRlci5yZWFkU3RyaW5nKDUpO1xyXG4gICAgICAgIGhlYWRlci5wYWNrZWRTaXplID0gcmVhZGVyLnJlYWRVSW50MzIoKTtcclxuICAgICAgICBoZWFkZXIub3JpZ2luYWxTaXplID0gcmVhZGVyLnJlYWRVSW50MzIoKTtcclxuICAgICAgICBoZWFkZXIuZGF0ZXRpbWUgPSByZWFkZXIucmVhZFVJbnQzMigpO1xyXG4gICAgICAgIGhlYWRlci5hdHRyaWJ1dGVzID0gcmVhZGVyLnJlYWRVSW50MTYoKTtcclxuICAgICAgICB2YXIgZmlsZW5hbWVTaXplID0gcmVhZGVyLnJlYWRVSW50OCgpO1xyXG4gICAgICAgIGhlYWRlci5maWxlbmFtZSA9IHJlYWRlci5yZWFkU3RyaW5nKGZpbGVuYW1lU2l6ZSk7XHJcbiAgICAgICAgaGVhZGVyLmNyYyA9IHJlYWRlci5yZWFkVUludDE2KCk7XHJcbiAgICAgICAgaGVhZGVyLm9mZnNldCA9IHJlYWRlci5nZXRQb3NpdGlvbigpO1xyXG4gICAgICAgIHRoaXMuZW50cmllcy5wdXNoKGhlYWRlcik7XHJcbiAgICAgICAgcmVhZGVyLnNlZWsoaGVhZGVyLnBhY2tlZFNpemUsIExoYUFycmF5UmVhZGVyLlNlZWtSZWxhdGl2ZSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5MaGFSZWFkZXIucHJvdG90eXBlLnJlYWRUZW1wVGFibGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgcmVhZGVyID0gdGhpcy5yZWFkZXI7XHJcbiAgICB2YXIgY29kZUNvdW50ID0gTWF0aC5taW4ocmVhZGVyLnJlYWRCaXRzKDUpLCAxOSk7XHJcbiAgICBpZiAoY29kZUNvdW50IDw9IDApIHtcclxuICAgICAgICB2YXIgY29uc3RhbnQgPSByZWFkZXIucmVhZEJpdHMoNSk7XHJcbiAgICAgICAgdGhpcy5vZmZzZXRUcmVlLnNldENvbnN0YW50KGNvbnN0YW50KTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICB2YXIgY29kZUxlbmd0aHMgPSBbXTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29kZUNvdW50OyBpKyspIHtcclxuICAgICAgICB2YXIgY29kZUxlbmd0aCA9IHJlYWRlci5yZWFkTGVuZ3RoKCk7XHJcbiAgICAgICAgY29kZUxlbmd0aHMucHVzaChjb2RlTGVuZ3RoKTtcclxuICAgICAgICBpZiAoaSA9PSAyKSB7IC8vIFRoZSBkcmVhZGVkIHNwZWNpYWwgYml0IHRoYXQgbm8tb25lIChpbmNsdWRpbmcgbWUpIHNlZW1zIHRvIHVuZGVyc3RhbmQuXHJcbiAgICAgICAgICAgIHZhciBsZW5ndGggPSByZWFkZXIucmVhZEJpdHMoMik7XHJcbiAgICAgICAgICAgIHdoaWxlIChsZW5ndGgtLSA+IDApIHtcclxuICAgICAgICAgICAgICAgIGNvZGVMZW5ndGhzLnB1c2goMCk7XHJcbiAgICAgICAgICAgICAgICBpKys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLm9mZnNldFRyZWUuYnVpbGQoY29kZUxlbmd0aHMsIDE5ICogMik7XHJcbn07XHJcblxyXG5MaGFSZWFkZXIucHJvdG90eXBlLnJlYWRDb2RlVGFibGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciByZWFkZXIgPSB0aGlzLnJlYWRlcjtcclxuICAgIHZhciBjb2RlQ291bnQgPSBNYXRoLm1pbihyZWFkZXIucmVhZEJpdHMoOSksIDUxMCk7XHJcbiAgICBpZiAoY29kZUNvdW50IDw9IDApIHtcclxuICAgICAgICB2YXIgY29uc3RhbnQgPSByZWFkZXIucmVhZEJpdHMoOSk7XHJcbiAgICAgICAgdGhpcy5jb2RlVHJlZS5zZXRDb25zdGFudChjb25zdGFudCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBjb2RlTGVuZ3RocyA9IFtdO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb2RlQ291bnQ7ICkge1xyXG4gICAgICAgIHZhciBjb2RlID0gdGhpcy5vZmZzZXRUcmVlLnJlYWRDb2RlKHJlYWRlcik7XHJcbiAgICAgICAgaWYgKGNvZGUgPD0gMikge1xyXG4gICAgICAgICAgICB2YXIgc2tpcCA9IDE7XHJcbiAgICAgICAgICAgIGlmIChjb2RlID09IDEpXHJcbiAgICAgICAgICAgICAgICBza2lwID0gcmVhZGVyLnJlYWRCaXRzKDQpICsgMztcclxuICAgICAgICAgICAgZWxzZSBpZiAoY29kZSA9PSAyKVxyXG4gICAgICAgICAgICAgICAgc2tpcCA9IHJlYWRlci5yZWFkQml0cyg5KSArIDIwO1xyXG4gICAgICAgICAgICB3aGlsZSAoLS1za2lwID49IDApIHtcclxuICAgICAgICAgICAgICAgIGNvZGVMZW5ndGhzLnB1c2goMCk7XHJcbiAgICAgICAgICAgICAgICBpKys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb2RlTGVuZ3Rocy5wdXNoKGNvZGUgLSAyKTtcclxuICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMuY29kZVRyZWUuYnVpbGQoY29kZUxlbmd0aHMsIDUxMCAqIDIpO1xyXG59O1xyXG5cclxuTGhhUmVhZGVyLnByb3RvdHlwZS5yZWFkT2Zmc2V0VGFibGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciByZWFkZXIgPSB0aGlzLnJlYWRlcjtcclxuICAgIHZhciBjb2RlQ291bnQgPSBNYXRoLm1pbihyZWFkZXIucmVhZEJpdHMoNCksIDE0KTtcclxuICAgIGlmIChjb2RlQ291bnQgPD0gMCkge1xyXG4gICAgICAgIHZhciBjb25zdGFudCA9IHJlYWRlci5yZWFkQml0cyg0KTtcclxuICAgICAgICB0aGlzLm9mZnNldFRyZWUuc2V0Q29uc3RhbnQoY29uc3RhbnQpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdmFyIGNvZGVMZW5ndGhzID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb2RlQ291bnQ7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgY29kZSA9IHJlYWRlci5yZWFkTGVuZ3RoKCk7XHJcbiAgICAgICAgICAgIGNvZGVMZW5ndGhzW2ldID0gY29kZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5vZmZzZXRUcmVlLmJ1aWxkKGNvZGVMZW5ndGhzLCAxOSAqIDIpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuTGhhUmVhZGVyLnByb3RvdHlwZS5leHRyYWN0ID0gZnVuY3Rpb24oaWQsIGNhbGxiYWNrKSB7XHJcbiAgICB2YXIgZW50cnkgPSB0aGlzLmVudHJpZXNbaWRdO1xyXG4gICAgdGhpcy5yZWFkZXIuc2VlayhlbnRyeS5vZmZzZXQsIExoYUFycmF5UmVhZGVyLlNlZWtBYnNvbHV0ZSk7XHJcbiAgICB2YXIgd3JpdGVyID0gbmV3IExoYUFycmF5V3JpdGVyKGVudHJ5Lm9yaWdpbmFsU2l6ZSk7XHJcbiAgICB3aGlsZSAodGhpcy5leHRyYWN0QmxvY2sod3JpdGVyKSkge1xyXG4gICAgICAgIGlmIChjYWxsYmFjaylcclxuICAgICAgICAgICAgY2FsbGJhY2sod3JpdGVyLm9mZnNldCwgd3JpdGVyLnNpemUpO1xyXG4gICAgICAgIGlmICh3cml0ZXIub2Zmc2V0ID49IHdyaXRlci5zaXplKVxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgIH1cclxuICAgIHJldHVybiBidWZmZXI7XHJcbn07XHJcblxyXG5MaGFSZWFkZXIucHJvdG90eXBlLmV4dHJhY3RCbG9jayA9IGZ1bmN0aW9uKHdyaXRlcikge1xyXG4gICAgdmFyIHJlYWRlciA9IHRoaXMucmVhZGVyO1xyXG4gICAgdmFyIGJsb2NrU2l6ZSA9IHJlYWRlci5yZWFkQml0cygxNik7XHJcbiAgICBpZiAoYmxvY2tTaXplIDw9IDAgfHwgcmVhZGVyLm9mZnNldCA+PSByZWFkZXIuc2l6ZSlcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgdGhpcy5yZWFkVGVtcFRhYmxlKCk7XHJcbiAgICB0aGlzLnJlYWRDb2RlVGFibGUoKTtcclxuICAgIHRoaXMucmVhZE9mZnNldFRhYmxlKCk7XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBibG9ja1NpemU7IGkrKykge1xyXG4gICAgICAgIHZhciBjb2RlID0gdGhpcy5jb2RlVHJlZS5yZWFkQ29kZShyZWFkZXIpO1xyXG4gICAgICAgIGlmIChjb2RlIDwgMjU2KSB7XHJcbiAgICAgICAgICAgIHRoaXMucmluZ0J1ZmZlci5hZGQoY29kZSk7XHJcbiAgICAgICAgICAgIHdyaXRlci53cml0ZShjb2RlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB2YXIgYml0cyA9IHRoaXMub2Zmc2V0VHJlZS5yZWFkQ29kZShyZWFkZXIpO1xyXG4gICAgICAgICAgICB2YXIgb2Zmc2V0ID0gYml0cztcclxuICAgICAgICAgICAgaWYgKGJpdHMgPj0gMikge1xyXG4gICAgICAgICAgICAgICAgdmFyIG9mZnNldCA9IHJlYWRlci5yZWFkQml0cyhiaXRzIC0gMSk7XHJcbiAgICAgICAgICAgICAgICBvZmZzZXQgPSBvZmZzZXQgKyAoMSA8PCAoYml0cyAtIDEpKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIGxlbmd0aCA9IGNvZGUgLSAyNTYgKyAzO1xyXG4gICAgICAgICAgICB2YXIgY2h1bmsgPSB0aGlzLnJpbmdCdWZmZXIuZ2V0KG9mZnNldCwgbGVuZ3RoKTtcclxuICAgICAgICAgICAgZm9yICh2YXIgaiBpbiBjaHVuaylcclxuICAgICAgICAgICAgICAgIHdyaXRlci53cml0ZShjaHVua1tqXSk7IC8vIFRPRE86IExvb2sgYXQgYnVsay1jb3B5aW5nIHRoaXMuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRydWU7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBMaGFSZWFkZXI7XHJcblxyXG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiMVlpWjVTXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvbGliL2xoNC5qc1wiLFwiL2xpYlwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8qXG4gQ29weXJpZ2h0IChjKSAyMDEyIEdpbGRhcyBMb3JtZWF1LiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuXG4gUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0XG4gbW9kaWZpY2F0aW9uLCBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG5cbiAxLiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXG4gdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cblxuIDIuIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0XG4gbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluXG4gdGhlIGRvY3VtZW50YXRpb24gYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG5cbiAzLiBUaGUgbmFtZXMgb2YgdGhlIGF1dGhvcnMgbWF5IG5vdCBiZSB1c2VkIHRvIGVuZG9yc2Ugb3IgcHJvbW90ZSBwcm9kdWN0c1xuIGRlcml2ZWQgZnJvbSB0aGlzIHNvZnR3YXJlIHdpdGhvdXQgc3BlY2lmaWMgcHJpb3Igd3JpdHRlbiBwZXJtaXNzaW9uLlxuXG4gVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBgYEFTIElTJycgQU5EIEFOWSBFWFBSRVNTRUQgT1IgSU1QTElFRCBXQVJSQU5USUVTLFxuIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkRcbiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgSkNSQUZULFxuIElOQy4gT1IgQU5ZIENPTlRSSUJVVE9SUyBUTyBUSElTIFNPRlRXQVJFIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCwgSU5ESVJFQ1QsXG4gSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUIE5PVFxuIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7IExPU1MgT0YgVVNFLCBEQVRBLFxuIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWSBUSEVPUlkgT0ZcbiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlQgKElOQ0xVRElOR1xuIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJUyBTT0ZUV0FSRSxcbiBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxuICovXG5cbihmdW5jdGlvbihvYmopIHtcblxuXHR2YXIgRVJSX0JBRF9GT1JNQVQgPSBcIkZpbGUgZm9ybWF0IGlzIG5vdCByZWNvZ25pemVkLlwiO1xuXHR2YXIgRVJSX0VOQ1JZUFRFRCA9IFwiRmlsZSBjb250YWlucyBlbmNyeXB0ZWQgZW50cnkuXCI7XG5cdHZhciBFUlJfWklQNjQgPSBcIkZpbGUgaXMgdXNpbmcgWmlwNjQgKDRnYisgZmlsZSBzaXplKS5cIjtcblx0dmFyIEVSUl9SRUFEID0gXCJFcnJvciB3aGlsZSByZWFkaW5nIHppcCBmaWxlLlwiO1xuXHR2YXIgRVJSX1dSSVRFID0gXCJFcnJvciB3aGlsZSB3cml0aW5nIHppcCBmaWxlLlwiO1xuXHR2YXIgRVJSX1dSSVRFX0RBVEEgPSBcIkVycm9yIHdoaWxlIHdyaXRpbmcgZmlsZSBkYXRhLlwiO1xuXHR2YXIgRVJSX1JFQURfREFUQSA9IFwiRXJyb3Igd2hpbGUgcmVhZGluZyBmaWxlIGRhdGEuXCI7XG5cdHZhciBFUlJfRFVQTElDQVRFRF9OQU1FID0gXCJGaWxlIGFscmVhZHkgZXhpc3RzLlwiO1xuXHR2YXIgRVJSX0hUVFBfUkFOR0UgPSBcIkhUVFAgUmFuZ2Ugbm90IHN1cHBvcnRlZC5cIjtcblx0dmFyIENIVU5LX1NJWkUgPSA1MTIgKiAxMDI0O1xuXG5cdHZhciBJTkZMQVRFX0pTID0gXCJpbmZsYXRlLmpzXCI7XG5cdHZhciBERUZMQVRFX0pTID0gXCJkZWZsYXRlLmpzXCI7XG5cblx0dmFyIEJsb2JCdWlsZGVyID0gb2JqLldlYktpdEJsb2JCdWlsZGVyIHx8IG9iai5Nb3pCbG9iQnVpbGRlciB8fCBvYmouTVNCbG9iQnVpbGRlciB8fCBvYmouQmxvYkJ1aWxkZXI7XG5cblx0dmFyIGFwcGVuZEFCVmlld1N1cHBvcnRlZDtcblxuXHRmdW5jdGlvbiBpc0FwcGVuZEFCVmlld1N1cHBvcnRlZCgpIHtcblx0XHRpZiAodHlwZW9mIGFwcGVuZEFCVmlld1N1cHBvcnRlZCA9PSBcInVuZGVmaW5lZFwiKSB7XG5cdFx0XHR2YXIgYmxvYkJ1aWxkZXI7XG5cdFx0XHRibG9iQnVpbGRlciA9IG5ldyBCbG9iQnVpbGRlcigpO1xuXHRcdFx0YmxvYkJ1aWxkZXIuYXBwZW5kKGdldERhdGFIZWxwZXIoMCkudmlldyk7XG5cdFx0XHRhcHBlbmRBQlZpZXdTdXBwb3J0ZWQgPSBibG9iQnVpbGRlci5nZXRCbG9iKCkuc2l6ZSA9PSAwO1xuXHRcdH1cblx0XHRyZXR1cm4gYXBwZW5kQUJWaWV3U3VwcG9ydGVkO1xuXHR9XG5cblx0ZnVuY3Rpb24gQ3JjMzIoKSB7XG5cdFx0dmFyIGNyYyA9IC0xLCB0aGF0ID0gdGhpcztcblx0XHR0aGF0LmFwcGVuZCA9IGZ1bmN0aW9uKGRhdGEpIHtcblx0XHRcdHZhciBvZmZzZXQsIHRhYmxlID0gdGhhdC50YWJsZTtcblx0XHRcdGZvciAob2Zmc2V0ID0gMDsgb2Zmc2V0IDwgZGF0YS5sZW5ndGg7IG9mZnNldCsrKVxuXHRcdFx0XHRjcmMgPSAoY3JjID4+PiA4KSBeIHRhYmxlWyhjcmMgXiBkYXRhW29mZnNldF0pICYgMHhGRl07XG5cdFx0fTtcblx0XHR0aGF0LmdldCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIH5jcmM7XG5cdFx0fTtcblx0fVxuXHRDcmMzMi5wcm90b3R5cGUudGFibGUgPSAoZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGksIGosIHQsIHRhYmxlID0gW107XG5cdFx0Zm9yIChpID0gMDsgaSA8IDI1NjsgaSsrKSB7XG5cdFx0XHR0ID0gaTtcblx0XHRcdGZvciAoaiA9IDA7IGogPCA4OyBqKyspXG5cdFx0XHRcdGlmICh0ICYgMSlcblx0XHRcdFx0XHR0ID0gKHQgPj4+IDEpIF4gMHhFREI4ODMyMDtcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHQgPSB0ID4+PiAxO1xuXHRcdFx0dGFibGVbaV0gPSB0O1xuXHRcdH1cblx0XHRyZXR1cm4gdGFibGU7XG5cdH0pKCk7XG5cblx0ZnVuY3Rpb24gYmxvYlNsaWNlKGJsb2IsIGluZGV4LCBsZW5ndGgpIHtcblx0XHRpZiAoYmxvYi5zbGljZSlcblx0XHRcdHJldHVybiBibG9iLnNsaWNlKGluZGV4LCBpbmRleCArIGxlbmd0aCk7XG5cdFx0ZWxzZSBpZiAoYmxvYi53ZWJraXRTbGljZSlcblx0XHRcdHJldHVybiBibG9iLndlYmtpdFNsaWNlKGluZGV4LCBpbmRleCArIGxlbmd0aCk7XG5cdFx0ZWxzZSBpZiAoYmxvYi5tb3pTbGljZSlcblx0XHRcdHJldHVybiBibG9iLm1velNsaWNlKGluZGV4LCBpbmRleCArIGxlbmd0aCk7XG5cdFx0ZWxzZSBpZiAoYmxvYi5tc1NsaWNlKVxuXHRcdFx0cmV0dXJuIGJsb2IubXNTbGljZShpbmRleCwgaW5kZXggKyBsZW5ndGgpO1xuXHR9XG5cblx0ZnVuY3Rpb24gZ2V0RGF0YUhlbHBlcihieXRlTGVuZ3RoLCBieXRlcykge1xuXHRcdHZhciBkYXRhQnVmZmVyLCBkYXRhQXJyYXk7XG5cdFx0ZGF0YUJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihieXRlTGVuZ3RoKTtcblx0XHRkYXRhQXJyYXkgPSBuZXcgVWludDhBcnJheShkYXRhQnVmZmVyKTtcblx0XHRpZiAoYnl0ZXMpXG5cdFx0XHRkYXRhQXJyYXkuc2V0KGJ5dGVzLCAwKTtcblx0XHRyZXR1cm4ge1xuXHRcdFx0YnVmZmVyIDogZGF0YUJ1ZmZlcixcblx0XHRcdGFycmF5IDogZGF0YUFycmF5LFxuXHRcdFx0dmlldyA6IG5ldyBEYXRhVmlldyhkYXRhQnVmZmVyKVxuXHRcdH07XG5cdH1cblxuXHQvLyBSZWFkZXJzXG5cdGZ1bmN0aW9uIFJlYWRlcigpIHtcblx0fVxuXG5cdGZ1bmN0aW9uIFRleHRSZWFkZXIodGV4dCkge1xuXHRcdHZhciB0aGF0ID0gdGhpcywgYmxvYlJlYWRlcjtcblxuXHRcdGZ1bmN0aW9uIGluaXQoY2FsbGJhY2ssIG9uZXJyb3IpIHtcblx0XHRcdHZhciBibG9iQnVpbGRlciA9IG5ldyBCbG9iQnVpbGRlcigpO1xuXHRcdFx0YmxvYkJ1aWxkZXIuYXBwZW5kKHRleHQpO1xuXHRcdFx0YmxvYlJlYWRlciA9IG5ldyBCbG9iUmVhZGVyKGJsb2JCdWlsZGVyLmdldEJsb2IoXCJ0ZXh0L3BsYWluXCIpKTtcblx0XHRcdGJsb2JSZWFkZXIuaW5pdChmdW5jdGlvbigpIHtcblx0XHRcdFx0dGhhdC5zaXplID0gYmxvYlJlYWRlci5zaXplO1xuXHRcdFx0XHRjYWxsYmFjaygpO1xuXHRcdFx0fSwgb25lcnJvcik7XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gcmVhZFVpbnQ4QXJyYXkoaW5kZXgsIGxlbmd0aCwgY2FsbGJhY2ssIG9uZXJyb3IpIHtcblx0XHRcdGJsb2JSZWFkZXIucmVhZFVpbnQ4QXJyYXkoaW5kZXgsIGxlbmd0aCwgY2FsbGJhY2ssIG9uZXJyb3IpO1xuXHRcdH1cblxuXHRcdHRoYXQuc2l6ZSA9IDA7XG5cdFx0dGhhdC5pbml0ID0gaW5pdDtcblx0XHR0aGF0LnJlYWRVaW50OEFycmF5ID0gcmVhZFVpbnQ4QXJyYXk7XG5cdH1cblx0VGV4dFJlYWRlci5wcm90b3R5cGUgPSBuZXcgUmVhZGVyKCk7XG5cdFRleHRSZWFkZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gVGV4dFJlYWRlcjtcblxuXHRmdW5jdGlvbiBEYXRhNjRVUklSZWFkZXIoZGF0YVVSSSkge1xuXHRcdHZhciB0aGF0ID0gdGhpcywgZGF0YVN0YXJ0O1xuXG5cdFx0ZnVuY3Rpb24gaW5pdChjYWxsYmFjaykge1xuXHRcdFx0dmFyIGRhdGFFbmQgPSBkYXRhVVJJLmxlbmd0aDtcblx0XHRcdHdoaWxlIChkYXRhVVJJLmNoYXJBdChkYXRhRW5kIC0gMSkgPT0gXCI9XCIpXG5cdFx0XHRcdGRhdGFFbmQtLTtcblx0XHRcdGRhdGFTdGFydCA9IGRhdGFVUkkuaW5kZXhPZihcIixcIikgKyAxO1xuXHRcdFx0dGhhdC5zaXplID0gTWF0aC5mbG9vcigoZGF0YUVuZCAtIGRhdGFTdGFydCkgKiAwLjc1KTtcblx0XHRcdGNhbGxiYWNrKCk7XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gcmVhZFVpbnQ4QXJyYXkoaW5kZXgsIGxlbmd0aCwgY2FsbGJhY2spIHtcblx0XHRcdHZhciBpLCBkYXRhID0gZ2V0RGF0YUhlbHBlcihsZW5ndGgpO1xuXHRcdFx0dmFyIHN0YXJ0ID0gTWF0aC5mbG9vcihpbmRleCAvIDMpICogNDtcblx0XHRcdHZhciBlbmQgPSBNYXRoLmNlaWwoKGluZGV4ICsgbGVuZ3RoKSAvIDMpICogNDtcblx0XHRcdHZhciBieXRlcyA9IG9iai5hdG9iKGRhdGFVUkkuc3Vic3RyaW5nKHN0YXJ0ICsgZGF0YVN0YXJ0LCBlbmQgKyBkYXRhU3RhcnQpKTtcblx0XHRcdHZhciBkZWx0YSA9IGluZGV4IC0gTWF0aC5mbG9vcihzdGFydCAvIDQpICogMztcblx0XHRcdGZvciAoaSA9IGRlbHRhOyBpIDwgZGVsdGEgKyBsZW5ndGg7IGkrKylcblx0XHRcdFx0ZGF0YS5hcnJheVtpIC0gZGVsdGFdID0gYnl0ZXMuY2hhckNvZGVBdChpKTtcblx0XHRcdGNhbGxiYWNrKGRhdGEuYXJyYXkpO1xuXHRcdH1cblxuXHRcdHRoYXQuc2l6ZSA9IDA7XG5cdFx0dGhhdC5pbml0ID0gaW5pdDtcblx0XHR0aGF0LnJlYWRVaW50OEFycmF5ID0gcmVhZFVpbnQ4QXJyYXk7XG5cdH1cblx0RGF0YTY0VVJJUmVhZGVyLnByb3RvdHlwZSA9IG5ldyBSZWFkZXIoKTtcblx0RGF0YTY0VVJJUmVhZGVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IERhdGE2NFVSSVJlYWRlcjtcblxuXHRmdW5jdGlvbiBCbG9iUmVhZGVyKGJsb2IpIHtcblx0XHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0XHRmdW5jdGlvbiBpbml0KGNhbGxiYWNrKSB7XG5cdFx0XHR0aGlzLnNpemUgPSBibG9iLnNpemU7XG5cdFx0XHRjYWxsYmFjaygpO1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIHJlYWRVaW50OEFycmF5KGluZGV4LCBsZW5ndGgsIGNhbGxiYWNrLCBvbmVycm9yKSB7XG5cdFx0XHR2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcblx0XHRcdHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbihlKSB7XG5cdFx0XHRcdGNhbGxiYWNrKG5ldyBVaW50OEFycmF5KGUudGFyZ2V0LnJlc3VsdCkpO1xuXHRcdFx0fTtcblx0XHRcdHJlYWRlci5vbmVycm9yID0gb25lcnJvcjtcblx0XHRcdHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlcihibG9iU2xpY2UoYmxvYiwgaW5kZXgsIGxlbmd0aCkpO1xuXHRcdH1cblxuXHRcdHRoYXQuc2l6ZSA9IDA7XG5cdFx0dGhhdC5pbml0ID0gaW5pdDtcblx0XHR0aGF0LnJlYWRVaW50OEFycmF5ID0gcmVhZFVpbnQ4QXJyYXk7XG5cdH1cblx0QmxvYlJlYWRlci5wcm90b3R5cGUgPSBuZXcgUmVhZGVyKCk7XG5cdEJsb2JSZWFkZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQmxvYlJlYWRlcjtcblxuXHRmdW5jdGlvbiBIdHRwUmVhZGVyKHVybCkge1xuXHRcdHZhciB0aGF0ID0gdGhpcztcblxuXHRcdGZ1bmN0aW9uIGdldERhdGEoY2FsbGJhY2ssIG9uZXJyb3IpIHtcblx0XHRcdHZhciByZXF1ZXN0O1xuXHRcdFx0aWYgKCF0aGF0LmRhdGEpIHtcblx0XHRcdFx0cmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXHRcdFx0XHRyZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGlmICghdGhhdC5zaXplKVxuXHRcdFx0XHRcdFx0dGhhdC5zaXplID0gTnVtYmVyKHJlcXVlc3QuZ2V0UmVzcG9uc2VIZWFkZXIoXCJDb250ZW50LUxlbmd0aFwiKSk7XG5cdFx0XHRcdFx0dGhhdC5kYXRhID0gbmV3IFVpbnQ4QXJyYXkocmVxdWVzdC5yZXNwb25zZSk7XG5cdFx0XHRcdFx0Y2FsbGJhY2soKTtcblx0XHRcdFx0fSwgZmFsc2UpO1xuXHRcdFx0XHRyZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLCBvbmVycm9yLCBmYWxzZSk7XG5cdFx0XHRcdHJlcXVlc3Qub3BlbihcIkdFVFwiLCB1cmwpO1xuXHRcdFx0XHRyZXF1ZXN0LnJlc3BvbnNlVHlwZSA9IFwiYXJyYXlidWZmZXJcIjtcblx0XHRcdFx0cmVxdWVzdC5zZW5kKCk7XG5cdFx0XHR9IGVsc2Vcblx0XHRcdFx0Y2FsbGJhY2soKTtcblx0XHR9XG5cblx0XHRmdW5jdGlvbiBpbml0KGNhbGxiYWNrLCBvbmVycm9yKSB7XG5cdFx0XHR2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICAgICAgZGVidWdnZXI7XG5cdFx0XHRyZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR0aGF0LnNpemUgPSBOdW1iZXIocmVxdWVzdC5nZXRSZXNwb25zZUhlYWRlcihcIkNvbnRlbnQtTGVuZ3RoXCIpKTtcblx0XHRcdFx0Y2FsbGJhY2soKTtcblx0XHRcdH0sIGZhbHNlKTtcblx0XHRcdHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsIG9uZXJyb3IsIGZhbHNlKTtcblx0XHRcdHJlcXVlc3Qub3BlbihcIkhFQURcIiwgdXJsKTtcblx0XHRcdHJlcXVlc3Quc2VuZCgpO1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIHJlYWRVaW50OEFycmF5KGluZGV4LCBsZW5ndGgsIGNhbGxiYWNrLCBvbmVycm9yKSB7XG5cdFx0XHRnZXREYXRhKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRjYWxsYmFjayhuZXcgVWludDhBcnJheSh0aGF0LmRhdGEuc3ViYXJyYXkoaW5kZXgsIGluZGV4ICsgbGVuZ3RoKSkpO1xuXHRcdFx0fSwgb25lcnJvcik7XG5cdFx0fVxuXG5cdFx0dGhhdC5zaXplID0gMDtcblx0XHR0aGF0LmluaXQgPSBpbml0O1xuXHRcdHRoYXQucmVhZFVpbnQ4QXJyYXkgPSByZWFkVWludDhBcnJheTtcblx0fVxuXHRIdHRwUmVhZGVyLnByb3RvdHlwZSA9IG5ldyBSZWFkZXIoKTtcblx0SHR0cFJlYWRlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBIdHRwUmVhZGVyO1xuXG5cdGZ1bmN0aW9uIEh0dHBSYW5nZVJlYWRlcih1cmwpIHtcblx0XHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0XHRmdW5jdGlvbiBpbml0KGNhbGxiYWNrLCBvbmVycm9yKSB7XG5cdFx0XHR2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXHRcdFx0cmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0dGhhdC5zaXplID0gTnVtYmVyKHJlcXVlc3QuZ2V0UmVzcG9uc2VIZWFkZXIoXCJDb250ZW50LUxlbmd0aFwiKSk7XG5cdFx0XHRcdGlmIChyZXF1ZXN0LmdldFJlc3BvbnNlSGVhZGVyKFwiQWNjZXB0LVJhbmdlc1wiKSA9PSBcImJ5dGVzXCIpXG5cdFx0XHRcdFx0Y2FsbGJhY2soKTtcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdG9uZXJyb3IoRVJSX0hUVFBfUkFOR0UpO1xuXHRcdFx0fSwgZmFsc2UpO1xuXHRcdFx0cmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKFwiZXJyb3JcIiwgb25lcnJvciwgZmFsc2UpO1xuXHRcdFx0cmVxdWVzdC5vcGVuKFwiSEVBRFwiLCB1cmwpO1xuXHRcdFx0cmVxdWVzdC5zZW5kKCk7XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gcmVhZEFycmF5QnVmZmVyKGluZGV4LCBsZW5ndGgsIGNhbGxiYWNrLCBvbmVycm9yKSB7XG5cdFx0XHR2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXHRcdFx0cmVxdWVzdC5vcGVuKFwiR0VUXCIsIHVybCk7XG5cdFx0XHRyZXF1ZXN0LnJlc3BvbnNlVHlwZSA9IFwiYXJyYXlidWZmZXJcIjtcblx0XHRcdHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcihcIlJhbmdlXCIsIFwiYnl0ZXM9XCIgKyBpbmRleCArIFwiLVwiICsgKGluZGV4ICsgbGVuZ3RoIC0gMSkpO1xuXHRcdFx0cmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0Y2FsbGJhY2socmVxdWVzdC5yZXNwb25zZSk7XG5cdFx0XHR9LCBmYWxzZSk7XG5cdFx0XHRyZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLCBvbmVycm9yLCBmYWxzZSk7XG5cdFx0XHRyZXF1ZXN0LnNlbmQoKTtcblx0XHR9XG5cblx0XHRmdW5jdGlvbiByZWFkVWludDhBcnJheShpbmRleCwgbGVuZ3RoLCBjYWxsYmFjaywgb25lcnJvcikge1xuXHRcdFx0cmVhZEFycmF5QnVmZmVyKGluZGV4LCBsZW5ndGgsIGZ1bmN0aW9uKGFycmF5YnVmZmVyKSB7XG5cdFx0XHRcdGNhbGxiYWNrKG5ldyBVaW50OEFycmF5KGFycmF5YnVmZmVyKSk7XG5cdFx0XHR9LCBvbmVycm9yKTtcblx0XHR9XG5cblx0XHR0aGF0LnNpemUgPSAwO1xuXHRcdHRoYXQuaW5pdCA9IGluaXQ7XG5cdFx0dGhhdC5yZWFkVWludDhBcnJheSA9IHJlYWRVaW50OEFycmF5O1xuXHR9XG5cdEh0dHBSYW5nZVJlYWRlci5wcm90b3R5cGUgPSBuZXcgUmVhZGVyKCk7XG5cdEh0dHBSYW5nZVJlYWRlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBIdHRwUmFuZ2VSZWFkZXI7XG5cblx0Ly8gV3JpdGVyc1xuXG5cdGZ1bmN0aW9uIFdyaXRlcigpIHtcblx0fVxuXHRXcml0ZXIucHJvdG90eXBlLmdldERhdGEgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuXHRcdGNhbGxiYWNrKHRoaXMuZGF0YSk7XG5cdH07XG5cblx0ZnVuY3Rpb24gVGV4dFdyaXRlcigpIHtcblx0XHR2YXIgdGhhdCA9IHRoaXMsIGJsb2JCdWlsZGVyO1xuXG5cdFx0ZnVuY3Rpb24gaW5pdChjYWxsYmFjaykge1xuXHRcdFx0YmxvYkJ1aWxkZXIgPSBuZXcgQmxvYkJ1aWxkZXIoKTtcblx0XHRcdGNhbGxiYWNrKCk7XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gd3JpdGVVaW50OEFycmF5KGFycmF5LCBjYWxsYmFjaykge1xuXHRcdFx0YmxvYkJ1aWxkZXIuYXBwZW5kKGlzQXBwZW5kQUJWaWV3U3VwcG9ydGVkKCkgPyBhcnJheSA6IGFycmF5LmJ1ZmZlcik7XG5cdFx0XHRjYWxsYmFjaygpO1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIGdldERhdGEoY2FsbGJhY2ssIG9uZXJyb3IpIHtcblx0XHRcdHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuXHRcdFx0cmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKGUpIHtcblx0XHRcdFx0Y2FsbGJhY2soZS50YXJnZXQucmVzdWx0KTtcblx0XHRcdH07XG5cdFx0XHRyZWFkZXIub25lcnJvciA9IG9uZXJyb3I7XG5cdFx0XHRyZWFkZXIucmVhZEFzVGV4dChibG9iQnVpbGRlci5nZXRCbG9iKFwidGV4dC9wbGFpblwiKSk7XG5cdFx0fVxuXG5cdFx0dGhhdC5pbml0ID0gaW5pdDtcblx0XHR0aGF0LndyaXRlVWludDhBcnJheSA9IHdyaXRlVWludDhBcnJheTtcblx0XHR0aGF0LmdldERhdGEgPSBnZXREYXRhO1xuXHR9XG5cdFRleHRXcml0ZXIucHJvdG90eXBlID0gbmV3IFdyaXRlcigpO1xuXHRUZXh0V3JpdGVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFRleHRXcml0ZXI7XG5cblxuXHRmdW5jdGlvbiBEYXRhNjRVUklXcml0ZXIoY29udGVudFR5cGUpIHtcblx0XHR2YXIgdGhhdCA9IHRoaXMsIGRhdGEgPSBcIlwiLCBwZW5kaW5nID0gXCJcIjtcblxuXHRcdGZ1bmN0aW9uIGluaXQoY2FsbGJhY2spIHtcblx0XHRcdGRhdGEgKz0gXCJkYXRhOlwiICsgKGNvbnRlbnRUeXBlIHx8IFwiXCIpICsgXCI7YmFzZTY0LFwiO1xuXHRcdFx0Y2FsbGJhY2soKTtcblx0XHR9XG5cblx0XHRmdW5jdGlvbiB3cml0ZVVpbnQ4QXJyYXkoYXJyYXksIGNhbGxiYWNrKSB7XG5cdFx0XHR2YXIgaSwgZGVsdGEgPSBwZW5kaW5nLmxlbmd0aCwgZGF0YVN0cmluZyA9IHBlbmRpbmc7XG5cdFx0XHRwZW5kaW5nID0gXCJcIjtcblx0XHRcdGZvciAoaSA9IDA7IGkgPCAoTWF0aC5mbG9vcigoZGVsdGEgKyBhcnJheS5sZW5ndGgpIC8gMykgKiAzKSAtIGRlbHRhOyBpKyspXG5cdFx0XHRcdGRhdGFTdHJpbmcgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShhcnJheVtpXSk7XG5cdFx0XHRmb3IgKDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKVxuXHRcdFx0XHRwZW5kaW5nICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYXJyYXlbaV0pO1xuXHRcdFx0aWYgKGRhdGFTdHJpbmcubGVuZ3RoID4gMilcblx0XHRcdFx0ZGF0YSArPSBvYmouYnRvYShkYXRhU3RyaW5nKTtcblx0XHRcdGVsc2Vcblx0XHRcdFx0cGVuZGluZyA9IGRhdGFTdHJpbmc7XG5cdFx0XHRjYWxsYmFjaygpO1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIGdldERhdGEoY2FsbGJhY2spIHtcblx0XHRcdGNhbGxiYWNrKGRhdGEgKyBvYmouYnRvYShwZW5kaW5nKSk7XG5cdFx0fVxuXG5cdFx0dGhhdC5pbml0ID0gaW5pdDtcblx0XHR0aGF0LndyaXRlVWludDhBcnJheSA9IHdyaXRlVWludDhBcnJheTtcblx0XHR0aGF0LmdldERhdGEgPSBnZXREYXRhO1xuXHR9XG5cdERhdGE2NFVSSVdyaXRlci5wcm90b3R5cGUgPSBuZXcgV3JpdGVyKCk7XG5cdERhdGE2NFVSSVdyaXRlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBEYXRhNjRVUklXcml0ZXI7XG5cblx0ZnVuY3Rpb24gRmlsZVdyaXRlcihmaWxlRW50cnksIGNvbnRlbnRUeXBlKSB7XG5cdFx0dmFyIHdyaXRlciwgdGhhdCA9IHRoaXM7XG5cblx0XHRmdW5jdGlvbiBpbml0KGNhbGxiYWNrLCBvbmVycm9yKSB7XG5cdFx0XHRmaWxlRW50cnkuY3JlYXRlV3JpdGVyKGZ1bmN0aW9uKGZpbGVXcml0ZXIpIHtcblx0XHRcdFx0d3JpdGVyID0gZmlsZVdyaXRlcjtcblx0XHRcdFx0Y2FsbGJhY2soKTtcblx0XHRcdH0sIG9uZXJyb3IpO1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIHdyaXRlVWludDhBcnJheShhcnJheSwgY2FsbGJhY2ssIG9uZXJyb3IpIHtcblx0XHRcdHZhciBibG9iQnVpbGRlciA9IG5ldyBCbG9iQnVpbGRlcigpO1xuXHRcdFx0YmxvYkJ1aWxkZXIuYXBwZW5kKGlzQXBwZW5kQUJWaWV3U3VwcG9ydGVkKCkgPyBhcnJheSA6IGFycmF5LmJ1ZmZlcik7XG5cdFx0XHR3cml0ZXIub253cml0ZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR3cml0ZXIub253cml0ZSA9IG51bGw7XG5cdFx0XHRcdGNhbGxiYWNrKCk7XG5cdFx0XHR9O1xuXHRcdFx0d3JpdGVyLm9uZXJyb3IgPSBvbmVycm9yO1xuXHRcdFx0d3JpdGVyLndyaXRlKGJsb2JCdWlsZGVyLmdldEJsb2IoY29udGVudFR5cGUpKTtcblx0XHR9XG5cblx0XHRmdW5jdGlvbiBnZXREYXRhKGNhbGxiYWNrKSB7XG5cdFx0XHRmaWxlRW50cnkuZmlsZShjYWxsYmFjayk7XG5cdFx0fVxuXG5cdFx0dGhhdC5pbml0ID0gaW5pdDtcblx0XHR0aGF0LndyaXRlVWludDhBcnJheSA9IHdyaXRlVWludDhBcnJheTtcblx0XHR0aGF0LmdldERhdGEgPSBnZXREYXRhO1xuXHR9XG5cdEZpbGVXcml0ZXIucHJvdG90eXBlID0gbmV3IFdyaXRlcigpO1xuXHRGaWxlV3JpdGVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEZpbGVXcml0ZXI7XG5cblx0ZnVuY3Rpb24gQmxvYldyaXRlcihjb250ZW50VHlwZSkge1xuXHRcdHZhciBibG9iQnVpbGRlciwgdGhhdCA9IHRoaXM7XG5cblx0XHRmdW5jdGlvbiBpbml0KGNhbGxiYWNrKSB7XG5cdFx0XHRibG9iQnVpbGRlciA9IG5ldyBCbG9iQnVpbGRlcigpO1xuXHRcdFx0Y2FsbGJhY2soKTtcblx0XHR9XG5cblx0XHRmdW5jdGlvbiB3cml0ZVVpbnQ4QXJyYXkoYXJyYXksIGNhbGxiYWNrKSB7XG5cdFx0XHRibG9iQnVpbGRlci5hcHBlbmQoaXNBcHBlbmRBQlZpZXdTdXBwb3J0ZWQoKSA/IGFycmF5IDogYXJyYXkuYnVmZmVyKTtcblx0XHRcdGNhbGxiYWNrKCk7XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gZ2V0RGF0YShjYWxsYmFjaykge1xuXHRcdFx0Y2FsbGJhY2soYmxvYkJ1aWxkZXIuZ2V0QmxvYihjb250ZW50VHlwZSkpO1xuXHRcdH1cblxuXHRcdHRoYXQuaW5pdCA9IGluaXQ7XG5cdFx0dGhhdC53cml0ZVVpbnQ4QXJyYXkgPSB3cml0ZVVpbnQ4QXJyYXk7XG5cdFx0dGhhdC5nZXREYXRhID0gZ2V0RGF0YTtcblx0fVxuXHRCbG9iV3JpdGVyLnByb3RvdHlwZSA9IG5ldyBXcml0ZXIoKTtcblx0QmxvYldyaXRlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBCbG9iV3JpdGVyO1xuXG4gICAgZnVuY3Rpb24gQXJyYXlXcml0ZXIoc2l6ZSkge1xuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgIGZ1bmN0aW9uIGluaXQoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHRoYXQuYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoc2l6ZSk7XG4gICAgICAgICAgICB0aGF0Lm9mZnNldCA9IDA7XG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gd3JpdGVVaW50OEFycmF5KGFycmF5LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgdGhhdC5idWZmZXIuc2V0KGFycmF5LCB0aGF0Lm9mZnNldCk7XG4gICAgICAgICAgICB0aGF0Lm9mZnNldCArPSBhcnJheS5sZW5ndGg7XG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZ2V0RGF0YShjYWxsYmFjaykge1xuICAgICAgICAgICAgY2FsbGJhY2sodGhhdC5idWZmZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhhdC5pbml0ID0gaW5pdDtcbiAgICAgICAgdGhhdC53cml0ZVVpbnQ4QXJyYXkgPSB3cml0ZVVpbnQ4QXJyYXk7XG4gICAgICAgIHRoYXQuZ2V0RGF0YSA9IGdldERhdGE7XG4gICAgfVxuICAgIEFycmF5V3JpdGVyLnByb3RvdHlwZSA9IG5ldyBXcml0ZXIoKTtcbiAgICBBcnJheVdyaXRlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBBcnJheVdyaXRlcjtcblxuXHQvLyBpbmZsYXRlL2RlZmxhdGUgY29yZSBmdW5jdGlvbnNcblx0ZnVuY3Rpb24gbGF1bmNoV29ya2VyUHJvY2Vzcyh3b3JrZXIsIHJlYWRlciwgd3JpdGVyLCBvZmZzZXQsIHNpemUsIG9uYXBwZW5kLCBvbnByb2dyZXNzLCBvbmVuZCwgb25yZWFkZXJyb3IsIG9ud3JpdGVlcnJvcikge1xuXHRcdHZhciBjaHVua0luZGV4ID0gMCwgaW5kZXgsIG91dHB1dFNpemU7XG5cblx0XHRmdW5jdGlvbiBvbmZsdXNoKCkge1xuXHRcdFx0d29ya2VyLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIG9ubWVzc2FnZSwgZmFsc2UpO1xuXHRcdFx0b25lbmQob3V0cHV0U2l6ZSk7XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gb25tZXNzYWdlKGV2ZW50KSB7XG5cdFx0XHR2YXIgbWVzc2FnZSA9IGV2ZW50LmRhdGEsIGRhdGEgPSBtZXNzYWdlLmRhdGE7XG5cblx0XHRcdGlmIChtZXNzYWdlLm9uYXBwZW5kKSB7XG5cdFx0XHRcdG91dHB1dFNpemUgKz0gZGF0YS5sZW5ndGg7XG5cdFx0XHRcdHdyaXRlci53cml0ZVVpbnQ4QXJyYXkoZGF0YSwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0b25hcHBlbmQoZmFsc2UsIGRhdGEpO1xuXHRcdFx0XHRcdHN0ZXAoKTtcblx0XHRcdFx0fSwgb253cml0ZWVycm9yKTtcblx0XHRcdH1cblx0XHRcdGlmIChtZXNzYWdlLm9uZmx1c2gpXG5cdFx0XHRcdGlmIChkYXRhKSB7XG5cdFx0XHRcdFx0b3V0cHV0U2l6ZSArPSBkYXRhLmxlbmd0aDtcblx0XHRcdFx0XHR3cml0ZXIud3JpdGVVaW50OEFycmF5KGRhdGEsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0b25hcHBlbmQoZmFsc2UsIGRhdGEpO1xuXHRcdFx0XHRcdFx0b25mbHVzaCgpO1xuXHRcdFx0XHRcdH0sIG9ud3JpdGVlcnJvcik7XG5cdFx0XHRcdH0gZWxzZVxuXHRcdFx0XHRcdG9uZmx1c2goKTtcblx0XHRcdGlmIChtZXNzYWdlLnByb2dyZXNzICYmIG9ucHJvZ3Jlc3MpXG5cdFx0XHRcdG9ucHJvZ3Jlc3MoaW5kZXggKyBtZXNzYWdlLmN1cnJlbnQsIHNpemUpO1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIHN0ZXAoKSB7XG5cdFx0XHRpbmRleCA9IGNodW5rSW5kZXggKiBDSFVOS19TSVpFO1xuXHRcdFx0aWYgKGluZGV4IDwgc2l6ZSlcblx0XHRcdFx0cmVhZGVyLnJlYWRVaW50OEFycmF5KG9mZnNldCArIGluZGV4LCBNYXRoLm1pbihDSFVOS19TSVpFLCBzaXplIC0gaW5kZXgpLCBmdW5jdGlvbihhcnJheSkge1xuXHRcdFx0XHRcdHdvcmtlci5wb3N0TWVzc2FnZSh7XG5cdFx0XHRcdFx0XHRhcHBlbmQgOiB0cnVlLFxuXHRcdFx0XHRcdFx0ZGF0YSA6IGFycmF5XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0Y2h1bmtJbmRleCsrO1xuXHRcdFx0XHRcdGlmIChvbnByb2dyZXNzKVxuXHRcdFx0XHRcdFx0b25wcm9ncmVzcyhpbmRleCwgc2l6ZSk7XG5cdFx0XHRcdFx0b25hcHBlbmQodHJ1ZSwgYXJyYXkpO1xuXHRcdFx0XHR9LCBvbnJlYWRlcnJvcik7XG5cdFx0XHRlbHNlXG5cdFx0XHRcdHdvcmtlci5wb3N0TWVzc2FnZSh7XG5cdFx0XHRcdFx0Zmx1c2ggOiB0cnVlXG5cdFx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdG91dHB1dFNpemUgPSAwO1xuXHRcdHdvcmtlci5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCBvbm1lc3NhZ2UsIGZhbHNlKTtcblx0XHRzdGVwKCk7XG5cdH1cblxuXHRmdW5jdGlvbiBsYXVuY2hQcm9jZXNzKHByb2Nlc3MsIHJlYWRlciwgd3JpdGVyLCBvZmZzZXQsIHNpemUsIG9uYXBwZW5kLCBvbnByb2dyZXNzLCBvbmVuZCwgb25yZWFkZXJyb3IsIG9ud3JpdGVlcnJvcikge1xuXHRcdHZhciBjaHVua0luZGV4ID0gMCwgaW5kZXgsIG91dHB1dFNpemUgPSAwO1xuXG5cdFx0ZnVuY3Rpb24gc3RlcCgpIHtcblx0XHRcdHZhciBvdXRwdXREYXRhO1xuXHRcdFx0aW5kZXggPSBjaHVua0luZGV4ICogQ0hVTktfU0laRTtcblx0XHRcdGlmIChpbmRleCA8IHNpemUpXG5cdFx0XHRcdHJlYWRlci5yZWFkVWludDhBcnJheShvZmZzZXQgKyBpbmRleCwgTWF0aC5taW4oQ0hVTktfU0laRSwgc2l6ZSAtIGluZGV4KSwgZnVuY3Rpb24oaW5wdXREYXRhKSB7XG5cdFx0XHRcdFx0dmFyIG91dHB1dERhdGEgPSBwcm9jZXNzLmFwcGVuZChpbnB1dERhdGEsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0aWYgKG9ucHJvZ3Jlc3MpXG5cdFx0XHRcdFx0XHRcdG9ucHJvZ3Jlc3Mob2Zmc2V0ICsgaW5kZXgsIHNpemUpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdG91dHB1dFNpemUgKz0gb3V0cHV0RGF0YS5sZW5ndGg7XG5cdFx0XHRcdFx0b25hcHBlbmQodHJ1ZSwgaW5wdXREYXRhKTtcblx0XHRcdFx0XHR3cml0ZXIud3JpdGVVaW50OEFycmF5KG91dHB1dERhdGEsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0b25hcHBlbmQoZmFsc2UsIG91dHB1dERhdGEpO1xuXHRcdFx0XHRcdFx0Y2h1bmtJbmRleCsrO1xuXHRcdFx0XHRcdFx0c2V0VGltZW91dChzdGVwLCAxKTtcblx0XHRcdFx0XHR9LCBvbndyaXRlZXJyb3IpO1xuXHRcdFx0XHRcdGlmIChvbnByb2dyZXNzKVxuXHRcdFx0XHRcdFx0b25wcm9ncmVzcyhpbmRleCwgc2l6ZSk7XG5cdFx0XHRcdH0sIG9ucmVhZGVycm9yKTtcblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRvdXRwdXREYXRhID0gcHJvY2Vzcy5mbHVzaCgpO1xuXHRcdFx0XHRpZiAob3V0cHV0RGF0YSkge1xuXHRcdFx0XHRcdG91dHB1dFNpemUgKz0gb3V0cHV0RGF0YS5sZW5ndGg7XG5cdFx0XHRcdFx0d3JpdGVyLndyaXRlVWludDhBcnJheShvdXRwdXREYXRhLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdG9uYXBwZW5kKGZhbHNlLCBvdXRwdXREYXRhKTtcblx0XHRcdFx0XHRcdG9uZW5kKG91dHB1dFNpemUpO1xuXHRcdFx0XHRcdH0sIG9ud3JpdGVlcnJvcik7XG5cdFx0XHRcdH0gZWxzZVxuXHRcdFx0XHRcdG9uZW5kKG91dHB1dFNpemUpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHN0ZXAoKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGluZmxhdGUocmVhZGVyLCB3cml0ZXIsIG9mZnNldCwgc2l6ZSwgY29tcHV0ZUNyYzMyLCBvbmVuZCwgb25wcm9ncmVzcywgb25yZWFkZXJyb3IsIG9ud3JpdGVlcnJvcikge1xuXHRcdHZhciB3b3JrZXIsIGNyYzMyID0gbmV3IENyYzMyKCk7XG5cblx0XHRmdW5jdGlvbiBvbmluZmxhdGVhcHBlbmQoc2VuZGluZywgYXJyYXkpIHtcblx0XHRcdGlmIChjb21wdXRlQ3JjMzIgJiYgIXNlbmRpbmcpXG5cdFx0XHRcdGNyYzMyLmFwcGVuZChhcnJheSk7XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gb25pbmZsYXRlZW5kKG91dHB1dFNpemUpIHtcblx0XHRcdG9uZW5kKG91dHB1dFNpemUsIGNyYzMyLmdldCgpKTtcblx0XHR9XG5cblx0XHRpZiAob2JqLnppcC51c2VXZWJXb3JrZXJzKSB7XG5cdFx0XHR3b3JrZXIgPSBuZXcgV29ya2VyKG9iai56aXAud29ya2VyU2NyaXB0c1BhdGggKyBJTkZMQVRFX0pTKTtcblx0XHRcdGxhdW5jaFdvcmtlclByb2Nlc3Mod29ya2VyLCByZWFkZXIsIHdyaXRlciwgb2Zmc2V0LCBzaXplLCBvbmluZmxhdGVhcHBlbmQsIG9ucHJvZ3Jlc3MsIG9uaW5mbGF0ZWVuZCwgb25yZWFkZXJyb3IsIG9ud3JpdGVlcnJvcik7XG5cdFx0fSBlbHNlXG5cdFx0XHRsYXVuY2hQcm9jZXNzKG5ldyBvYmouemlwLkluZmxhdGVyKCksIHJlYWRlciwgd3JpdGVyLCBvZmZzZXQsIHNpemUsIG9uaW5mbGF0ZWFwcGVuZCwgb25wcm9ncmVzcywgb25pbmZsYXRlZW5kLCBvbnJlYWRlcnJvciwgb253cml0ZWVycm9yKTtcblx0XHRyZXR1cm4gd29ya2VyO1xuXHR9XG5cblx0ZnVuY3Rpb24gZGVmbGF0ZShyZWFkZXIsIHdyaXRlciwgbGV2ZWwsIG9uZW5kLCBvbnByb2dyZXNzLCBvbnJlYWRlcnJvciwgb253cml0ZWVycm9yKSB7XG5cdFx0dmFyIHdvcmtlciwgY3JjMzIgPSBuZXcgQ3JjMzIoKTtcblxuXHRcdGZ1bmN0aW9uIG9uZGVmbGF0ZWFwcGVuZChzZW5kaW5nLCBhcnJheSkge1xuXHRcdFx0aWYgKHNlbmRpbmcpXG5cdFx0XHRcdGNyYzMyLmFwcGVuZChhcnJheSk7XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gb25kZWZsYXRlZW5kKG91dHB1dFNpemUpIHtcblx0XHRcdG9uZW5kKG91dHB1dFNpemUsIGNyYzMyLmdldCgpKTtcblx0XHR9XG5cblx0XHRmdW5jdGlvbiBvbm1lc3NhZ2UoKSB7XG5cdFx0XHR3b3JrZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgb25tZXNzYWdlLCBmYWxzZSk7XG5cdFx0XHRsYXVuY2hXb3JrZXJQcm9jZXNzKHdvcmtlciwgcmVhZGVyLCB3cml0ZXIsIDAsIHJlYWRlci5zaXplLCBvbmRlZmxhdGVhcHBlbmQsIG9ucHJvZ3Jlc3MsIG9uZGVmbGF0ZWVuZCwgb25yZWFkZXJyb3IsIG9ud3JpdGVlcnJvcik7XG5cdFx0fVxuXG5cdFx0aWYgKG9iai56aXAudXNlV2ViV29ya2Vycykge1xuXHRcdFx0d29ya2VyID0gbmV3IFdvcmtlcihvYmouemlwLndvcmtlclNjcmlwdHNQYXRoICsgREVGTEFURV9KUyk7XG5cdFx0XHR3b3JrZXIuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgb25tZXNzYWdlLCBmYWxzZSk7XG5cdFx0XHR3b3JrZXIucG9zdE1lc3NhZ2Uoe1xuXHRcdFx0XHRpbml0IDogdHJ1ZSxcblx0XHRcdFx0bGV2ZWwgOiBsZXZlbFxuXHRcdFx0fSk7XG5cdFx0fSBlbHNlXG5cdFx0XHRsYXVuY2hQcm9jZXNzKG5ldyBvYmouemlwLkRlZmxhdGVyKCksIHJlYWRlciwgd3JpdGVyLCAwLCByZWFkZXIuc2l6ZSwgb25kZWZsYXRlYXBwZW5kLCBvbnByb2dyZXNzLCBvbmRlZmxhdGVlbmQsIG9ucmVhZGVycm9yLCBvbndyaXRlZXJyb3IpO1xuXHRcdHJldHVybiB3b3JrZXI7XG5cdH1cblxuXHRmdW5jdGlvbiBjb3B5KHJlYWRlciwgd3JpdGVyLCBvZmZzZXQsIHNpemUsIGNvbXB1dGVDcmMzMiwgb25lbmQsIG9ucHJvZ3Jlc3MsIG9ucmVhZGVycm9yLCBvbndyaXRlZXJyb3IpIHtcblx0XHR2YXIgY2h1bmtJbmRleCA9IDAsIGNyYzMyID0gbmV3IENyYzMyKCk7XG5cblx0XHRmdW5jdGlvbiBzdGVwKCkge1xuXHRcdFx0dmFyIGluZGV4ID0gY2h1bmtJbmRleCAqIENIVU5LX1NJWkU7XG5cdFx0XHRpZiAoaW5kZXggPCBzaXplKVxuXHRcdFx0XHRyZWFkZXIucmVhZFVpbnQ4QXJyYXkob2Zmc2V0ICsgaW5kZXgsIE1hdGgubWluKENIVU5LX1NJWkUsIHNpemUgLSBpbmRleCksIGZ1bmN0aW9uKGFycmF5KSB7XG5cdFx0XHRcdFx0aWYgKGNvbXB1dGVDcmMzMilcblx0XHRcdFx0XHRcdGNyYzMyLmFwcGVuZChhcnJheSk7XG5cdFx0XHRcdFx0aWYgKG9ucHJvZ3Jlc3MpXG5cdFx0XHRcdFx0XHRvbnByb2dyZXNzKGluZGV4LCBzaXplLCBhcnJheSk7XG5cdFx0XHRcdFx0d3JpdGVyLndyaXRlVWludDhBcnJheShhcnJheSwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRjaHVua0luZGV4Kys7XG5cdFx0XHRcdFx0XHRzdGVwKCk7XG5cdFx0XHRcdFx0fSwgb253cml0ZWVycm9yKTtcblx0XHRcdFx0fSwgb25yZWFkZXJyb3IpO1xuXHRcdFx0ZWxzZVxuXHRcdFx0XHRvbmVuZChzaXplLCBjcmMzMi5nZXQoKSk7XG5cdFx0fVxuXG5cdFx0c3RlcCgpO1xuXHR9XG5cblx0Ly8gWmlwUmVhZGVyXG5cblx0ZnVuY3Rpb24gZGVjb2RlQVNDSUkoc3RyKSB7XG5cdFx0dmFyIGksIG91dCA9IFwiXCIsIGNoYXJDb2RlLCBleHRlbmRlZEFTQ0lJID0gWyAnXFx1MDBDNycsICdcXHUwMEZDJywgJ1xcdTAwRTknLCAnXFx1MDBFMicsICdcXHUwMEU0JywgJ1xcdTAwRTAnLCAnXFx1MDBFNScsICdcXHUwMEU3JywgJ1xcdTAwRUEnLCAnXFx1MDBFQicsXG5cdFx0XHRcdCdcXHUwMEU4JywgJ1xcdTAwRUYnLCAnXFx1MDBFRScsICdcXHUwMEVDJywgJ1xcdTAwQzQnLCAnXFx1MDBDNScsICdcXHUwMEM5JywgJ1xcdTAwRTYnLCAnXFx1MDBDNicsICdcXHUwMEY0JywgJ1xcdTAwRjYnLCAnXFx1MDBGMicsICdcXHUwMEZCJywgJ1xcdTAwRjknLFxuXHRcdFx0XHQnXFx1MDBGRicsICdcXHUwMEQ2JywgJ1xcdTAwREMnLCAnXFx1MDBGOCcsICdcXHUwMEEzJywgJ1xcdTAwRDgnLCAnXFx1MDBENycsICdcXHUwMTkyJywgJ1xcdTAwRTEnLCAnXFx1MDBFRCcsICdcXHUwMEYzJywgJ1xcdTAwRkEnLCAnXFx1MDBGMScsICdcXHUwMEQxJyxcblx0XHRcdFx0J1xcdTAwQUEnLCAnXFx1MDBCQScsICdcXHUwMEJGJywgJ1xcdTAwQUUnLCAnXFx1MDBBQycsICdcXHUwMEJEJywgJ1xcdTAwQkMnLCAnXFx1MDBBMScsICdcXHUwMEFCJywgJ1xcdTAwQkInLCAnXycsICdfJywgJ18nLCAnXFx1MDBBNicsICdcXHUwMEE2Jyxcblx0XHRcdFx0J1xcdTAwQzEnLCAnXFx1MDBDMicsICdcXHUwMEMwJywgJ1xcdTAwQTknLCAnXFx1MDBBNicsICdcXHUwMEE2JywgJysnLCAnKycsICdcXHUwMEEyJywgJ1xcdTAwQTUnLCAnKycsICcrJywgJy0nLCAnLScsICcrJywgJy0nLCAnKycsICdcXHUwMEUzJyxcblx0XHRcdFx0J1xcdTAwQzMnLCAnKycsICcrJywgJy0nLCAnLScsICdcXHUwMEE2JywgJy0nLCAnKycsICdcXHUwMEE0JywgJ1xcdTAwRjAnLCAnXFx1MDBEMCcsICdcXHUwMENBJywgJ1xcdTAwQ0InLCAnXFx1MDBDOCcsICdpJywgJ1xcdTAwQ0QnLCAnXFx1MDBDRScsXG5cdFx0XHRcdCdcXHUwMENGJywgJysnLCAnKycsICdfJywgJ18nLCAnXFx1MDBBNicsICdcXHUwMENDJywgJ18nLCAnXFx1MDBEMycsICdcXHUwMERGJywgJ1xcdTAwRDQnLCAnXFx1MDBEMicsICdcXHUwMEY1JywgJ1xcdTAwRDUnLCAnXFx1MDBCNScsICdcXHUwMEZFJyxcblx0XHRcdFx0J1xcdTAwREUnLCAnXFx1MDBEQScsICdcXHUwMERCJywgJ1xcdTAwRDknLCAnXFx1MDBGRCcsICdcXHUwMEREJywgJ1xcdTAwQUYnLCAnXFx1MDBCNCcsICdcXHUwMEFEJywgJ1xcdTAwQjEnLCAnXycsICdcXHUwMEJFJywgJ1xcdTAwQjYnLCAnXFx1MDBBNycsXG5cdFx0XHRcdCdcXHUwMEY3JywgJ1xcdTAwQjgnLCAnXFx1MDBCMCcsICdcXHUwMEE4JywgJ1xcdTAwQjcnLCAnXFx1MDBCOScsICdcXHUwMEIzJywgJ1xcdTAwQjInLCAnXycsICcgJyBdO1xuXHRcdGZvciAoaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcblx0XHRcdGNoYXJDb2RlID0gc3RyLmNoYXJDb2RlQXQoaSkgJiAweEZGO1xuXHRcdFx0aWYgKGNoYXJDb2RlID4gMTI3KVxuXHRcdFx0XHRvdXQgKz0gZXh0ZW5kZWRBU0NJSVtjaGFyQ29kZSAtIDEyOF07XG5cdFx0XHRlbHNlXG5cdFx0XHRcdG91dCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGNoYXJDb2RlKTtcblx0XHR9XG5cdFx0cmV0dXJuIG91dDtcblx0fVxuXG5cdGZ1bmN0aW9uIGRlY29kZVVURjgoc3RyX2RhdGEpIHtcblx0XHR2YXIgdG1wX2FyciA9IFtdLCBpID0gMCwgYWMgPSAwLCBjMSA9IDAsIGMyID0gMCwgYzMgPSAwO1xuXG5cdFx0c3RyX2RhdGEgKz0gJyc7XG5cblx0XHR3aGlsZSAoaSA8IHN0cl9kYXRhLmxlbmd0aCkge1xuXHRcdFx0YzEgPSBzdHJfZGF0YS5jaGFyQ29kZUF0KGkpO1xuXHRcdFx0aWYgKGMxIDwgMTI4KSB7XG5cdFx0XHRcdHRtcF9hcnJbYWMrK10gPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGMxKTtcblx0XHRcdFx0aSsrO1xuXHRcdFx0fSBlbHNlIGlmIChjMSA+IDE5MSAmJiBjMSA8IDIyNCkge1xuXHRcdFx0XHRjMiA9IHN0cl9kYXRhLmNoYXJDb2RlQXQoaSArIDEpO1xuXHRcdFx0XHR0bXBfYXJyW2FjKytdID0gU3RyaW5nLmZyb21DaGFyQ29kZSgoKGMxICYgMzEpIDw8IDYpIHwgKGMyICYgNjMpKTtcblx0XHRcdFx0aSArPSAyO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0YzIgPSBzdHJfZGF0YS5jaGFyQ29kZUF0KGkgKyAxKTtcblx0XHRcdFx0YzMgPSBzdHJfZGF0YS5jaGFyQ29kZUF0KGkgKyAyKTtcblx0XHRcdFx0dG1wX2FyclthYysrXSA9IFN0cmluZy5mcm9tQ2hhckNvZGUoKChjMSAmIDE1KSA8PCAxMikgfCAoKGMyICYgNjMpIDw8IDYpIHwgKGMzICYgNjMpKTtcblx0XHRcdFx0aSArPSAzO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB0bXBfYXJyLmpvaW4oJycpO1xuXHR9XG5cblx0ZnVuY3Rpb24gZ2V0U3RyaW5nKGJ5dGVzKSB7XG5cdFx0dmFyIGksIHN0ciA9IFwiXCI7XG5cdFx0Zm9yIChpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSsrKVxuXHRcdFx0c3RyICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnl0ZXNbaV0pO1xuXHRcdHJldHVybiBzdHI7XG5cdH1cblxuXHRmdW5jdGlvbiBnZXREYXRlKHRpbWVSYXcpIHtcblx0XHR2YXIgZGF0ZSA9ICh0aW1lUmF3ICYgMHhmZmZmMDAwMCkgPj4gMTYsIHRpbWUgPSB0aW1lUmF3ICYgMHgwMDAwZmZmZjtcblx0XHR0cnkge1xuXHRcdFx0cmV0dXJuIG5ldyBEYXRlKDE5ODAgKyAoKGRhdGUgJiAweEZFMDApID4+IDkpLCAoKGRhdGUgJiAweDAxRTApID4+IDUpIC0gMSwgZGF0ZSAmIDB4MDAxRiwgKHRpbWUgJiAweEY4MDApID4+IDExLCAodGltZSAmIDB4MDdFMCkgPj4gNSxcblx0XHRcdFx0XHQodGltZSAmIDB4MDAxRikgKiAyLCAwKTtcblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gcmVhZENvbW1vbkhlYWRlcihlbnRyeSwgZGF0YSwgaW5kZXgsIGNlbnRyYWxEaXJlY3RvcnksIG9uZXJyb3IpIHtcblx0XHRlbnRyeS52ZXJzaW9uID0gZGF0YS52aWV3LmdldFVpbnQxNihpbmRleCwgdHJ1ZSk7XG5cdFx0ZW50cnkuYml0RmxhZyA9IGRhdGEudmlldy5nZXRVaW50MTYoaW5kZXggKyAyLCB0cnVlKTtcblx0XHRlbnRyeS5jb21wcmVzc2lvbk1ldGhvZCA9IGRhdGEudmlldy5nZXRVaW50MTYoaW5kZXggKyA0LCB0cnVlKTtcblx0XHRlbnRyeS5sYXN0TW9kRGF0ZVJhdyA9IGRhdGEudmlldy5nZXRVaW50MzIoaW5kZXggKyA2LCB0cnVlKTtcblx0XHRlbnRyeS5sYXN0TW9kRGF0ZSA9IGdldERhdGUoZW50cnkubGFzdE1vZERhdGVSYXcpO1xuXHRcdGlmICgoZW50cnkuYml0RmxhZyAmIDB4MDEpID09PSAweDAxKSB7XG5cdFx0XHRvbmVycm9yKEVSUl9FTkNSWVBURUQpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRpZiAoY2VudHJhbERpcmVjdG9yeSB8fCAoZW50cnkuYml0RmxhZyAmIDB4MDAwOCkgIT0gMHgwMDA4KSB7XG5cdFx0XHRlbnRyeS5jcmMzMiA9IGRhdGEudmlldy5nZXRVaW50MzIoaW5kZXggKyAxMCwgdHJ1ZSk7XG5cdFx0XHRlbnRyeS5jb21wcmVzc2VkU2l6ZSA9IGRhdGEudmlldy5nZXRVaW50MzIoaW5kZXggKyAxNCwgdHJ1ZSk7XG5cdFx0XHRlbnRyeS51bmNvbXByZXNzZWRTaXplID0gZGF0YS52aWV3LmdldFVpbnQzMihpbmRleCArIDE4LCB0cnVlKTtcblx0XHR9XG5cdFx0aWYgKGVudHJ5LmNvbXByZXNzZWRTaXplID09PSAweEZGRkZGRkZGIHx8IGVudHJ5LnVuY29tcHJlc3NlZFNpemUgPT09IDB4RkZGRkZGRkYpIHtcblx0XHRcdG9uZXJyb3IoRVJSX1pJUDY0KTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0ZW50cnkuZmlsZW5hbWVMZW5ndGggPSBkYXRhLnZpZXcuZ2V0VWludDE2KGluZGV4ICsgMjIsIHRydWUpO1xuXHRcdGVudHJ5LmV4dHJhRmllbGRMZW5ndGggPSBkYXRhLnZpZXcuZ2V0VWludDE2KGluZGV4ICsgMjQsIHRydWUpO1xuXHR9XG5cblx0ZnVuY3Rpb24gY3JlYXRlWmlwUmVhZGVyKHJlYWRlciwgb25lcnJvcikge1xuXHRcdGZ1bmN0aW9uIEVudHJ5KCkge1xuXHRcdH1cblxuXHRcdEVudHJ5LnByb3RvdHlwZS5nZXREYXRhID0gZnVuY3Rpb24od3JpdGVyLCBvbmVuZCwgb25wcm9ncmVzcywgY2hlY2tDcmMzMikge1xuXHRcdFx0dmFyIHRoYXQgPSB0aGlzLCB3b3JrZXI7XG5cblx0XHRcdGZ1bmN0aW9uIHRlcm1pbmF0ZShjYWxsYmFjaywgcGFyYW0pIHtcblx0XHRcdFx0aWYgKHdvcmtlcilcblx0XHRcdFx0XHR3b3JrZXIudGVybWluYXRlKCk7XG5cdFx0XHRcdHdvcmtlciA9IG51bGw7XG5cdFx0XHRcdGlmIChjYWxsYmFjaylcblx0XHRcdFx0XHRjYWxsYmFjayhwYXJhbSk7XG5cdFx0XHR9XG5cblx0XHRcdGZ1bmN0aW9uIHRlc3RDcmMzMihjcmMzMikge1xuXHRcdFx0XHR2YXIgZGF0YUNyYzMyID0gZ2V0RGF0YUhlbHBlcig0KTtcblx0XHRcdFx0ZGF0YUNyYzMyLnZpZXcuc2V0VWludDMyKDAsIGNyYzMyKTtcblx0XHRcdFx0cmV0dXJuIHRoYXQuY3JjMzIgPT0gZGF0YUNyYzMyLnZpZXcuZ2V0VWludDMyKDApO1xuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiBnZXRXcml0ZXJEYXRhKHVuY29tcHJlc3NlZFNpemUsIGNyYzMyKSB7XG5cdFx0XHRcdGlmIChjaGVja0NyYzMyICYmICF0ZXN0Q3JjMzIoY3JjMzIpKVxuXHRcdFx0XHRcdG9ucmVhZGVycm9yKCk7XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHR3cml0ZXIuZ2V0RGF0YShmdW5jdGlvbihkYXRhKSB7XG5cdFx0XHRcdFx0XHR0ZXJtaW5hdGUob25lbmQsIGRhdGEpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiBvbnJlYWRlcnJvcigpIHtcblx0XHRcdFx0dGVybWluYXRlKG9uZXJyb3IsIEVSUl9SRUFEX0RBVEEpO1xuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiBvbndyaXRlZXJyb3IoKSB7XG5cdFx0XHRcdHRlcm1pbmF0ZShvbmVycm9yLCBFUlJfV1JJVEVfREFUQSk7XG5cdFx0XHR9XG5cblx0XHRcdHJlYWRlci5yZWFkVWludDhBcnJheSh0aGF0Lm9mZnNldCwgMzAsIGZ1bmN0aW9uKGJ5dGVzKSB7XG5cdFx0XHRcdHZhciBkYXRhID0gZ2V0RGF0YUhlbHBlcihieXRlcy5sZW5ndGgsIGJ5dGVzKSwgZGF0YU9mZnNldDtcblx0XHRcdFx0aWYgKGRhdGEudmlldy5nZXRVaW50MzIoMCkgIT0gMHg1MDRiMDMwNCkge1xuXHRcdFx0XHRcdG9uZXJyb3IoRVJSX0JBRF9GT1JNQVQpO1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZWFkQ29tbW9uSGVhZGVyKHRoYXQsIGRhdGEsIDQsIGZhbHNlLCBmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0XHRcdG9uZXJyb3IoZXJyb3IpO1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdGRhdGFPZmZzZXQgPSB0aGF0Lm9mZnNldCArIDMwICsgdGhhdC5maWxlbmFtZUxlbmd0aCArIHRoYXQuZXh0cmFGaWVsZExlbmd0aDtcblx0XHRcdFx0d3JpdGVyLmluaXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0aWYgKHRoYXQuY29tcHJlc3Npb25NZXRob2QgPT09IDApXG5cdFx0XHRcdFx0XHRjb3B5KHJlYWRlciwgd3JpdGVyLCBkYXRhT2Zmc2V0LCB0aGF0LmNvbXByZXNzZWRTaXplLCBjaGVja0NyYzMyLCBnZXRXcml0ZXJEYXRhLCBvbnByb2dyZXNzLCBvbnJlYWRlcnJvciwgb253cml0ZWVycm9yKTtcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHR3b3JrZXIgPSBpbmZsYXRlKHJlYWRlciwgd3JpdGVyLCBkYXRhT2Zmc2V0LCB0aGF0LmNvbXByZXNzZWRTaXplLCBjaGVja0NyYzMyLCBnZXRXcml0ZXJEYXRhLCBvbnByb2dyZXNzLCBvbnJlYWRlcnJvciwgb253cml0ZWVycm9yKTtcblx0XHRcdFx0fSwgb253cml0ZWVycm9yKTtcblx0XHRcdH0sIG9ucmVhZGVycm9yKTtcblx0XHR9O1xuXG5cdFx0ZnVuY3Rpb24gc2Vla0VPQ0RSKG9mZnNldCwgZW50cmllc0NhbGxiYWNrKSB7XG5cdFx0XHRyZWFkZXIucmVhZFVpbnQ4QXJyYXkocmVhZGVyLnNpemUgLSBvZmZzZXQsIG9mZnNldCwgZnVuY3Rpb24oYnl0ZXMpIHtcblx0XHRcdFx0dmFyIGRhdGFWaWV3ID0gZ2V0RGF0YUhlbHBlcihieXRlcy5sZW5ndGgsIGJ5dGVzKS52aWV3O1xuXHRcdFx0XHRpZiAoZGF0YVZpZXcuZ2V0VWludDMyKDApICE9IDB4NTA0YjA1MDYpIHtcblx0XHRcdFx0XHRzZWVrRU9DRFIob2Zmc2V0KzEsIGVudHJpZXNDYWxsYmFjayk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0ZW50cmllc0NhbGxiYWNrKGRhdGFWaWV3KTtcblx0XHRcdFx0fVxuXHRcdFx0fSwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdG9uZXJyb3IoRVJSX1JFQUQpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiB7XG5cdFx0XHRnZXRFbnRyaWVzIDogZnVuY3Rpb24oY2FsbGJhY2spIHtcblx0XHRcdFx0aWYgKHJlYWRlci5zaXplIDwgMjIpIHtcblx0XHRcdFx0XHRvbmVycm9yKEVSUl9CQURfRk9STUFUKTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gbG9vayBmb3IgRW5kIG9mIGNlbnRyYWwgZGlyZWN0b3J5IHJlY29yZFxuXHRcdFx0XHRzZWVrRU9DRFIoMjIsIGZ1bmN0aW9uKGRhdGFWaWV3KSB7XG5cdFx0XHRcdFx0ZGF0YWxlbmd0aCA9IGRhdGFWaWV3LmdldFVpbnQzMigxNiwgdHJ1ZSk7XG5cdFx0XHRcdFx0ZmlsZXNsZW5ndGggPSBkYXRhVmlldy5nZXRVaW50MTYoOCwgdHJ1ZSk7XG5cdFx0XHRcdFx0cmVhZGVyLnJlYWRVaW50OEFycmF5KGRhdGFsZW5ndGgsIHJlYWRlci5zaXplIC0gZGF0YWxlbmd0aCwgZnVuY3Rpb24oYnl0ZXMpIHtcblx0XHRcdFx0XHRcdHZhciBpLCBpbmRleCA9IDAsIGVudHJpZXMgPSBbXSwgZW50cnksIGZpbGVuYW1lLCBjb21tZW50LCBkYXRhID0gZ2V0RGF0YUhlbHBlcihieXRlcy5sZW5ndGgsIGJ5dGVzKTtcblx0XHRcdFx0XHRcdGZvciAoaSA9IDA7IGkgPCBmaWxlc2xlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRcdGVudHJ5ID0gbmV3IEVudHJ5KCk7XG5cdFx0XHRcdFx0XHRcdGlmIChkYXRhLnZpZXcuZ2V0VWludDMyKGluZGV4KSAhPSAweDUwNGIwMTAyKSB7XG5cdFx0XHRcdFx0XHRcdFx0b25lcnJvcihFUlJfQkFEX0ZPUk1BVCk7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdHJlYWRDb21tb25IZWFkZXIoZW50cnksIGRhdGEsIGluZGV4ICsgNiwgdHJ1ZSwgZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRcdFx0XHRcdFx0XHRvbmVycm9yKGVycm9yKTtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHRlbnRyeS5jb21tZW50TGVuZ3RoID0gZGF0YS52aWV3LmdldFVpbnQxNihpbmRleCArIDMyLCB0cnVlKTtcblx0XHRcdFx0XHRcdFx0ZW50cnkuZGlyZWN0b3J5ID0gKChkYXRhLnZpZXcuZ2V0VWludDgoaW5kZXggKyAzOCkgJiAweDEwKSA9PSAweDEwKTtcblx0XHRcdFx0XHRcdFx0ZW50cnkub2Zmc2V0ID0gZGF0YS52aWV3LmdldFVpbnQzMihpbmRleCArIDQyLCB0cnVlKTtcblx0XHRcdFx0XHRcdFx0ZmlsZW5hbWUgPSBnZXRTdHJpbmcoZGF0YS5hcnJheS5zdWJhcnJheShpbmRleCArIDQ2LCBpbmRleCArIDQ2ICsgZW50cnkuZmlsZW5hbWVMZW5ndGgpKTtcblx0XHRcdFx0XHRcdFx0ZW50cnkuZmlsZW5hbWUgPSAoKGVudHJ5LmJpdEZsYWcgJiAweDA4MDApID09PSAweDA4MDApID8gZGVjb2RlVVRGOChmaWxlbmFtZSkgOiBkZWNvZGVBU0NJSShmaWxlbmFtZSk7XG5cdFx0XHRcdFx0XHRcdGlmICghZW50cnkuZGlyZWN0b3J5ICYmIGVudHJ5LmZpbGVuYW1lLmNoYXJBdChlbnRyeS5maWxlbmFtZS5sZW5ndGggLSAxKSA9PSBcIi9cIilcblx0XHRcdFx0XHRcdFx0XHRlbnRyeS5kaXJlY3RvcnkgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRjb21tZW50ID0gZ2V0U3RyaW5nKGRhdGEuYXJyYXkuc3ViYXJyYXkoaW5kZXggKyA0NiArIGVudHJ5LmZpbGVuYW1lTGVuZ3RoICsgZW50cnkuZXh0cmFGaWVsZExlbmd0aCwgaW5kZXggKyA0NlxuXHRcdFx0XHRcdFx0XHRcdFx0KyBlbnRyeS5maWxlbmFtZUxlbmd0aCArIGVudHJ5LmV4dHJhRmllbGRMZW5ndGggKyBlbnRyeS5jb21tZW50TGVuZ3RoKSk7XG5cdFx0XHRcdFx0XHRcdGVudHJ5LmNvbW1lbnQgPSAoKGVudHJ5LmJpdEZsYWcgJiAweDA4MDApID09PSAweDA4MDApID8gZGVjb2RlVVRGOChjb21tZW50KSA6IGRlY29kZUFTQ0lJKGNvbW1lbnQpO1xuXHRcdFx0XHRcdFx0XHRlbnRyaWVzLnB1c2goZW50cnkpO1xuXHRcdFx0XHRcdFx0XHRpbmRleCArPSA0NiArIGVudHJ5LmZpbGVuYW1lTGVuZ3RoICsgZW50cnkuZXh0cmFGaWVsZExlbmd0aCArIGVudHJ5LmNvbW1lbnRMZW5ndGg7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRjYWxsYmFjayhlbnRyaWVzKTtcblx0XHRcdFx0XHR9LCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdG9uZXJyb3IoRVJSX1JFQUQpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0sXG5cdFx0XHRjbG9zZSA6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG5cdFx0XHRcdGlmIChjYWxsYmFjaylcblx0XHRcdFx0XHRjYWxsYmFjaygpO1xuXHRcdFx0fVxuXHRcdH07XG5cdH1cblxuXHQvLyBaaXBXcml0ZXJcblxuXHRmdW5jdGlvbiBlbmNvZGVVVEY4KHN0cmluZykge1xuXHRcdHZhciBuLCBjMSwgZW5jLCB1dGZ0ZXh0ID0gW10sIHN0YXJ0ID0gMCwgZW5kID0gMCwgc3RyaW5nbCA9IHN0cmluZy5sZW5ndGg7XG5cdFx0Zm9yIChuID0gMDsgbiA8IHN0cmluZ2w7IG4rKykge1xuXHRcdFx0YzEgPSBzdHJpbmcuY2hhckNvZGVBdChuKTtcblx0XHRcdGVuYyA9IG51bGw7XG5cdFx0XHRpZiAoYzEgPCAxMjgpXG5cdFx0XHRcdGVuZCsrO1xuXHRcdFx0ZWxzZSBpZiAoYzEgPiAxMjcgJiYgYzEgPCAyMDQ4KVxuXHRcdFx0XHRlbmMgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKChjMSA+PiA2KSB8IDE5MikgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKChjMSAmIDYzKSB8IDEyOCk7XG5cdFx0XHRlbHNlXG5cdFx0XHRcdGVuYyA9IFN0cmluZy5mcm9tQ2hhckNvZGUoKGMxID4+IDEyKSB8IDIyNCkgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKCgoYzEgPj4gNikgJiA2MykgfCAxMjgpICsgU3RyaW5nLmZyb21DaGFyQ29kZSgoYzEgJiA2MykgfCAxMjgpO1xuXHRcdFx0aWYgKGVuYyAhPSBudWxsKSB7XG5cdFx0XHRcdGlmIChlbmQgPiBzdGFydClcblx0XHRcdFx0XHR1dGZ0ZXh0ICs9IHN0cmluZy5zbGljZShzdGFydCwgZW5kKTtcblx0XHRcdFx0dXRmdGV4dCArPSBlbmM7XG5cdFx0XHRcdHN0YXJ0ID0gZW5kID0gbiArIDE7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChlbmQgPiBzdGFydClcblx0XHRcdHV0ZnRleHQgKz0gc3RyaW5nLnNsaWNlKHN0YXJ0LCBzdHJpbmdsKTtcblx0XHRyZXR1cm4gdXRmdGV4dDtcblx0fVxuXG5cdGZ1bmN0aW9uIGdldEJ5dGVzKHN0cikge1xuXHRcdHZhciBpLCBhcnJheSA9IFtdO1xuXHRcdGZvciAoaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspXG5cdFx0XHRhcnJheS5wdXNoKHN0ci5jaGFyQ29kZUF0KGkpKTtcblx0XHRyZXR1cm4gYXJyYXk7XG5cdH1cblxuXHRmdW5jdGlvbiBjcmVhdGVaaXBXcml0ZXIod3JpdGVyLCBvbmVycm9yLCBkb250RGVmbGF0ZSkge1xuXHRcdHZhciB3b3JrZXIsIGZpbGVzID0gW10sIGZpbGVuYW1lcyA9IFtdLCBkYXRhbGVuZ3RoID0gMDtcblxuXHRcdGZ1bmN0aW9uIHRlcm1pbmF0ZShjYWxsYmFjaywgbWVzc2FnZSkge1xuXHRcdFx0aWYgKHdvcmtlcilcblx0XHRcdFx0d29ya2VyLnRlcm1pbmF0ZSgpO1xuXHRcdFx0d29ya2VyID0gbnVsbDtcblx0XHRcdGlmIChjYWxsYmFjaylcblx0XHRcdFx0Y2FsbGJhY2sobWVzc2FnZSk7XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gb253cml0ZWVycm9yKCkge1xuXHRcdFx0dGVybWluYXRlKG9uZXJyb3IsIEVSUl9XUklURSk7XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gb25yZWFkZXJyb3IoKSB7XG5cdFx0XHR0ZXJtaW5hdGUob25lcnJvciwgRVJSX1JFQURfREFUQSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdGFkZCA6IGZ1bmN0aW9uKG5hbWUsIHJlYWRlciwgb25lbmQsIG9ucHJvZ3Jlc3MsIG9wdGlvbnMpIHtcblx0XHRcdFx0dmFyIGhlYWRlciwgZmlsZW5hbWUsIGRhdGU7XG5cblx0XHRcdFx0ZnVuY3Rpb24gd3JpdGVIZWFkZXIoY2FsbGJhY2spIHtcblx0XHRcdFx0XHR2YXIgZGF0YTtcblx0XHRcdFx0XHRkYXRlID0gb3B0aW9ucy5sYXN0TW9kRGF0ZSB8fCBuZXcgRGF0ZSgpO1xuXHRcdFx0XHRcdGhlYWRlciA9IGdldERhdGFIZWxwZXIoMjYpO1xuXHRcdFx0XHRcdGZpbGVzW25hbWVdID0ge1xuXHRcdFx0XHRcdFx0aGVhZGVyQXJyYXkgOiBoZWFkZXIuYXJyYXksXG5cdFx0XHRcdFx0XHRkaXJlY3RvcnkgOiBvcHRpb25zLmRpcmVjdG9yeSxcblx0XHRcdFx0XHRcdGZpbGVuYW1lIDogZmlsZW5hbWUsXG5cdFx0XHRcdFx0XHRvZmZzZXQgOiBkYXRhbGVuZ3RoLFxuXHRcdFx0XHRcdFx0Y29tbWVudCA6IGdldEJ5dGVzKGVuY29kZVVURjgob3B0aW9ucy5jb21tZW50IHx8IFwiXCIpKVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0aGVhZGVyLnZpZXcuc2V0VWludDMyKDAsIDB4MTQwMDA4MDgpO1xuXHRcdFx0XHRcdGlmIChvcHRpb25zLnZlcnNpb24pXG5cdFx0XHRcdFx0XHRoZWFkZXIudmlldy5zZXRVaW50OCgwLCBvcHRpb25zLnZlcnNpb24pO1xuXHRcdFx0XHRcdGlmICghZG9udERlZmxhdGUgJiYgb3B0aW9ucy5sZXZlbCAhPSAwKVxuXHRcdFx0XHRcdFx0aGVhZGVyLnZpZXcuc2V0VWludDE2KDQsIDB4MDgwMCk7XG5cdFx0XHRcdFx0aGVhZGVyLnZpZXcuc2V0VWludDE2KDYsICgoKGRhdGUuZ2V0SG91cnMoKSA8PCA2KSB8IGRhdGUuZ2V0TWludXRlcygpKSA8PCA1KSB8IGRhdGUuZ2V0U2Vjb25kcygpIC8gMiwgdHJ1ZSk7XG5cdFx0XHRcdFx0aGVhZGVyLnZpZXcuc2V0VWludDE2KDgsICgoKChkYXRlLmdldEZ1bGxZZWFyKCkgLSAxOTgwKSA8PCA0KSB8IChkYXRlLmdldE1vbnRoKCkgKyAxKSkgPDwgNSkgfCBkYXRlLmdldERhdGUoKSwgdHJ1ZSk7XG5cdFx0XHRcdFx0aGVhZGVyLnZpZXcuc2V0VWludDE2KDIyLCBmaWxlbmFtZS5sZW5ndGgsIHRydWUpO1xuXHRcdFx0XHRcdGRhdGEgPSBnZXREYXRhSGVscGVyKDMwICsgZmlsZW5hbWUubGVuZ3RoKTtcblx0XHRcdFx0XHRkYXRhLnZpZXcuc2V0VWludDMyKDAsIDB4NTA0YjAzMDQpO1xuXHRcdFx0XHRcdGRhdGEuYXJyYXkuc2V0KGhlYWRlci5hcnJheSwgNCk7XG5cdFx0XHRcdFx0ZGF0YS5hcnJheS5zZXQoW10sIDMwKTsgLy8gRklYTUU6IHJlbW92ZSB3aGVuIGNocm9tZSAxOCB3aWxsIGJlIHN0YWJsZSAoMTQ6IE9LLCAxNjogS08sIDE3OiBPSylcblx0XHRcdFx0XHRkYXRhLmFycmF5LnNldChmaWxlbmFtZSwgMzApO1xuXHRcdFx0XHRcdGRhdGFsZW5ndGggKz0gZGF0YS5hcnJheS5sZW5ndGg7XG5cdFx0XHRcdFx0d3JpdGVyLndyaXRlVWludDhBcnJheShkYXRhLmFycmF5LCBjYWxsYmFjaywgb253cml0ZWVycm9yKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGZ1bmN0aW9uIHdyaXRlRm9vdGVyKGNvbXByZXNzZWRMZW5ndGgsIGNyYzMyKSB7XG5cdFx0XHRcdFx0dmFyIGZvb3RlciA9IGdldERhdGFIZWxwZXIoMTYpO1xuXHRcdFx0XHRcdGRhdGFsZW5ndGggKz0gY29tcHJlc3NlZExlbmd0aCB8fCAwO1xuXHRcdFx0XHRcdGZvb3Rlci52aWV3LnNldFVpbnQzMigwLCAweDUwNGIwNzA4KTtcblx0XHRcdFx0XHRpZiAodHlwZW9mIGNyYzMyICE9IFwidW5kZWZpbmVkXCIpIHtcblx0XHRcdFx0XHRcdGhlYWRlci52aWV3LnNldFVpbnQzMigxMCwgY3JjMzIsIHRydWUpO1xuXHRcdFx0XHRcdFx0Zm9vdGVyLnZpZXcuc2V0VWludDMyKDQsIGNyYzMyLCB0cnVlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKHJlYWRlcikge1xuXHRcdFx0XHRcdFx0Zm9vdGVyLnZpZXcuc2V0VWludDMyKDgsIGNvbXByZXNzZWRMZW5ndGgsIHRydWUpO1xuXHRcdFx0XHRcdFx0aGVhZGVyLnZpZXcuc2V0VWludDMyKDE0LCBjb21wcmVzc2VkTGVuZ3RoLCB0cnVlKTtcblx0XHRcdFx0XHRcdGZvb3Rlci52aWV3LnNldFVpbnQzMigxMiwgcmVhZGVyLnNpemUsIHRydWUpO1xuXHRcdFx0XHRcdFx0aGVhZGVyLnZpZXcuc2V0VWludDMyKDE4LCByZWFkZXIuc2l6ZSwgdHJ1ZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHdyaXRlci53cml0ZVVpbnQ4QXJyYXkoZm9vdGVyLmFycmF5LCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdGRhdGFsZW5ndGggKz0gMTY7XG5cdFx0XHRcdFx0XHR0ZXJtaW5hdGUob25lbmQpO1xuXHRcdFx0XHRcdH0sIG9ud3JpdGVlcnJvcik7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRmdW5jdGlvbiB3cml0ZUZpbGUoKSB7XG5cdFx0XHRcdFx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdFx0XHRcdFx0bmFtZSA9IG5hbWUudHJpbSgpO1xuXHRcdFx0XHRcdGlmIChvcHRpb25zLmRpcmVjdG9yeSAmJiBuYW1lLmNoYXJBdChuYW1lLmxlbmd0aCAtIDEpICE9IFwiL1wiKVxuXHRcdFx0XHRcdFx0bmFtZSArPSBcIi9cIjtcblx0XHRcdFx0XHRpZiAoZmlsZXNbbmFtZV0pXG5cdFx0XHRcdFx0XHR0aHJvdyBFUlJfRFVQTElDQVRFRF9OQU1FO1xuXHRcdFx0XHRcdGZpbGVuYW1lID0gZ2V0Qnl0ZXMoZW5jb2RlVVRGOChuYW1lKSk7XG5cdFx0XHRcdFx0ZmlsZW5hbWVzLnB1c2gobmFtZSk7XG5cdFx0XHRcdFx0d3JpdGVIZWFkZXIoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRpZiAocmVhZGVyKVxuXHRcdFx0XHRcdFx0XHRpZiAoZG9udERlZmxhdGUgfHwgb3B0aW9ucy5sZXZlbCA9PSAwKVxuXHRcdFx0XHRcdFx0XHRcdGNvcHkocmVhZGVyLCB3cml0ZXIsIDAsIHJlYWRlci5zaXplLCB0cnVlLCB3cml0ZUZvb3Rlciwgb25wcm9ncmVzcywgb25yZWFkZXJyb3IsIG9ud3JpdGVlcnJvcik7XG5cdFx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdFx0XHR3b3JrZXIgPSBkZWZsYXRlKHJlYWRlciwgd3JpdGVyLCBvcHRpb25zLmxldmVsLCB3cml0ZUZvb3Rlciwgb25wcm9ncmVzcywgb25yZWFkZXJyb3IsIG9ud3JpdGVlcnJvcik7XG5cdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdHdyaXRlRm9vdGVyKCk7XG5cdFx0XHRcdFx0fSwgb253cml0ZWVycm9yKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChyZWFkZXIpXG5cdFx0XHRcdFx0cmVhZGVyLmluaXQod3JpdGVGaWxlLCBvbnJlYWRlcnJvcik7XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHR3cml0ZUZpbGUoKTtcblx0XHRcdH0sXG5cdFx0XHRjbG9zZSA6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG5cdFx0XHRcdHZhciBkYXRhLCBsZW5ndGggPSAwLCBpbmRleCA9IDA7XG5cdFx0XHRcdGZpbGVuYW1lcy5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcblx0XHRcdFx0XHR2YXIgZmlsZSA9IGZpbGVzW25hbWVdO1xuXHRcdFx0XHRcdGxlbmd0aCArPSA0NiArIGZpbGUuZmlsZW5hbWUubGVuZ3RoICsgZmlsZS5jb21tZW50Lmxlbmd0aDtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdGRhdGEgPSBnZXREYXRhSGVscGVyKGxlbmd0aCArIDIyKTtcblx0XHRcdFx0ZmlsZW5hbWVzLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuXHRcdFx0XHRcdHZhciBmaWxlID0gZmlsZXNbbmFtZV07XG5cdFx0XHRcdFx0ZGF0YS52aWV3LnNldFVpbnQzMihpbmRleCwgMHg1MDRiMDEwMik7XG5cdFx0XHRcdFx0ZGF0YS52aWV3LnNldFVpbnQxNihpbmRleCArIDQsIDB4MTQwMCk7XG5cdFx0XHRcdFx0ZGF0YS5hcnJheS5zZXQoZmlsZS5oZWFkZXJBcnJheSwgaW5kZXggKyA2KTtcblx0XHRcdFx0XHRkYXRhLnZpZXcuc2V0VWludDE2KGluZGV4ICsgMzIsIGZpbGUuY29tbWVudC5sZW5ndGgsIHRydWUpO1xuXHRcdFx0XHRcdGlmIChmaWxlLmRpcmVjdG9yeSlcblx0XHRcdFx0XHRcdGRhdGEudmlldy5zZXRVaW50OChpbmRleCArIDM4LCAweDEwKTtcblx0XHRcdFx0XHRkYXRhLnZpZXcuc2V0VWludDMyKGluZGV4ICsgNDIsIGZpbGUub2Zmc2V0LCB0cnVlKTtcblx0XHRcdFx0XHRkYXRhLmFycmF5LnNldChmaWxlLmZpbGVuYW1lLCBpbmRleCArIDQ2KTtcblx0XHRcdFx0XHRkYXRhLmFycmF5LnNldChmaWxlLmNvbW1lbnQsIGluZGV4ICsgNDYgKyBmaWxlLmZpbGVuYW1lLmxlbmd0aCk7XG5cdFx0XHRcdFx0aW5kZXggKz0gNDYgKyBmaWxlLmZpbGVuYW1lLmxlbmd0aCArIGZpbGUuY29tbWVudC5sZW5ndGg7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRkYXRhLnZpZXcuc2V0VWludDMyKGluZGV4LCAweDUwNGIwNTA2KTtcblx0XHRcdFx0ZGF0YS52aWV3LnNldFVpbnQxNihpbmRleCArIDgsIGZpbGVuYW1lcy5sZW5ndGgsIHRydWUpO1xuXHRcdFx0XHRkYXRhLnZpZXcuc2V0VWludDE2KGluZGV4ICsgMTAsIGZpbGVuYW1lcy5sZW5ndGgsIHRydWUpO1xuXHRcdFx0XHRkYXRhLnZpZXcuc2V0VWludDMyKGluZGV4ICsgMTIsIGxlbmd0aCwgdHJ1ZSk7XG5cdFx0XHRcdGRhdGEudmlldy5zZXRVaW50MzIoaW5kZXggKyAxNiwgZGF0YWxlbmd0aCwgdHJ1ZSk7XG5cdFx0XHRcdHdyaXRlci53cml0ZVVpbnQ4QXJyYXkoZGF0YS5hcnJheSwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0dGVybWluYXRlKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0d3JpdGVyLmdldERhdGEoY2FsbGJhY2spO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9LCBvbndyaXRlZXJyb3IpO1xuXHRcdFx0fVxuXHRcdH07XG5cdH1cblxuXHRpZiAodHlwZW9mIEJsb2JCdWlsZGVyID09IFwidW5kZWZpbmVkXCIpIHtcblx0XHRCbG9iQnVpbGRlciA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHRoYXQgPSB0aGlzLCBibG9iUGFydHM7XG5cblx0XHRcdGZ1bmN0aW9uIGluaXRCbG9iUGFydHMoKSB7XG5cdFx0XHRcdGlmICghYmxvYlBhcnRzKSB7XG5cdFx0XHRcdFx0YmxvYlBhcnRzID0gWyBuZXcgQmxvYigpIF1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHR0aGF0LmFwcGVuZCA9IGZ1bmN0aW9uKGRhdGEpIHtcblx0XHRcdFx0aW5pdEJsb2JQYXJ0cygpO1xuXHRcdFx0XHRibG9iUGFydHMucHVzaChkYXRhKTtcblx0XHRcdH07XG5cdFx0XHR0aGF0LmdldEJsb2IgPSBmdW5jdGlvbihjb250ZW50VHlwZSkge1xuXHRcdFx0XHRpbml0QmxvYlBhcnRzKCk7XG5cdFx0XHRcdGlmIChibG9iUGFydHMubGVuZ3RoID4gMSB8fCBibG9iUGFydHNbMF0udHlwZSAhPSBjb250ZW50VHlwZSkge1xuXHRcdFx0XHRcdGJsb2JQYXJ0cyA9IFsgY29udGVudFR5cGUgPyBuZXcgQmxvYihibG9iUGFydHMsIHtcblx0XHRcdFx0XHRcdHR5cGUgOiBjb250ZW50VHlwZVxuXHRcdFx0XHRcdH0pIDogbmV3IEJsb2IoYmxvYlBhcnRzKSBdO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBibG9iUGFydHNbMF07XG5cdFx0XHR9O1xuXHRcdH07XG5cdH1cblxuXHRvYmouemlwID0ge1xuXHRcdFJlYWRlciA6IFJlYWRlcixcblx0XHRXcml0ZXIgOiBXcml0ZXIsXG5cdFx0QmxvYlJlYWRlciA6IEJsb2JSZWFkZXIsXG5cdFx0SHR0cFJlYWRlciA6IEh0dHBSZWFkZXIsXG5cdFx0SHR0cFJhbmdlUmVhZGVyIDogSHR0cFJhbmdlUmVhZGVyLFxuXHRcdERhdGE2NFVSSVJlYWRlciA6IERhdGE2NFVSSVJlYWRlcixcblx0XHRUZXh0UmVhZGVyIDogVGV4dFJlYWRlcixcblx0XHRCbG9iV3JpdGVyIDogQmxvYldyaXRlcixcblx0XHRBcnJheVdyaXRlciA6IEFycmF5V3JpdGVyLFxuICAgICAgICBGaWxlV3JpdGVyIDogRmlsZVdyaXRlcixcblx0XHREYXRhNjRVUklXcml0ZXIgOiBEYXRhNjRVUklXcml0ZXIsXG5cdFx0VGV4dFdyaXRlciA6IFRleHRXcml0ZXIsXG5cdFx0Y3JlYXRlUmVhZGVyIDogZnVuY3Rpb24ocmVhZGVyLCBjYWxsYmFjaywgb25lcnJvcikge1xuXHRcdFx0cmVhZGVyLmluaXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGNhbGxiYWNrKGNyZWF0ZVppcFJlYWRlcihyZWFkZXIsIG9uZXJyb3IpKTtcblx0XHRcdH0sIG9uZXJyb3IpO1xuXHRcdH0sXG5cdFx0Y3JlYXRlV3JpdGVyIDogZnVuY3Rpb24od3JpdGVyLCBjYWxsYmFjaywgb25lcnJvciwgZG9udERlZmxhdGUpIHtcblx0XHRcdHdyaXRlci5pbml0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRjYWxsYmFjayhjcmVhdGVaaXBXcml0ZXIod3JpdGVyLCBvbmVycm9yLCBkb250RGVmbGF0ZSkpO1xuXHRcdFx0fSwgb25lcnJvcik7XG5cdFx0fSxcblx0XHR3b3JrZXJTY3JpcHRzUGF0aCA6IFwiXCIsXG5cdFx0dXNlV2ViV29ya2VycyA6IHRydWVcblx0fTtcblxufSkodGhpcyk7XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiMVlpWjVTXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvbGliL3ppcC5qc1wiLFwiL2xpYlwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbnZhciBMaWdodE1hcCA9IHJlcXVpcmUoJ2dsL2xpZ2h0bWFwJyk7XG52YXIgQnNwID0gcmVxdWlyZSgnZm9ybWF0cy9ic3AnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJ3V0aWxzJyk7XG5cbnZhciBtYXhMaWdodE1hcHMgPSA2NDtcbnZhciBsaWdodE1hcEJ5dGVzID0gMTtcbnZhciBibG9ja1dpZHRoID0gNTEyO1xudmFyIGJsb2NrSGVpZ2h0ID0gNTEyO1xuXG52YXIgTGlnaHRNYXBzID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5hbGxvY2F0ZWQgPSB1dGlscy5hcnJheTJkKGJsb2NrV2lkdGgsIG1heExpZ2h0TWFwcyk7XG4gICAgdGhpcy5saWdodE1hcHNEYXRhID0gW107XG59O1xuXG5MaWdodE1hcHMucHJvdG90eXBlLmJ1aWxkTGlnaHRNYXAgPSBmdW5jdGlvbihic3AsIHN1cmZhY2UsIG9mZnNldCkge1xuICAgIHZhciB3aWR0aCA9IChzdXJmYWNlLmV4dGVudHNbMF0gPj4gNCkgKyAxO1xuICAgIHZhciBoZWlnaHQgPSAoc3VyZmFjZS5leHRlbnRzWzFdID4+IDQpICsgMTtcbiAgICB2YXIgc2l6ZSA9IHdpZHRoICogaGVpZ2h0O1xuICAgIHZhciBibG9ja0xpZ2h0cyA9IHV0aWxzLmFycmF5MWQoMTggKiAxOCk7XG4gICAgdmFyIGxpZ2h0TWFwT2Zmc2V0ID0gc3VyZmFjZS5saWdodE1hcE9mZnNldDtcblxuICAgIGZvciAodmFyIG1hcCA9IDA7IG1hcCA8IG1heExpZ2h0TWFwczsgbWFwKyspIHtcbiAgICAgICAgaWYgKHN1cmZhY2UubGlnaHRTdHlsZXNbbWFwXSA9PT0gMjU1KVxuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgLy8gVE9ETzogQWRkIGxpZ2h0c3R5bGVzLCB1c2VkIGZvciBmbGlja2VyaW5nLCBhbmQgb3RoZXIgbGlnaHQgYW5pbWF0aW9ucy5cbiAgICAgICAgdmFyIHNjYWxlID0gMjY0O1xuICAgICAgICBmb3IgKHZhciBibCA9IDA7IGJsIDwgc2l6ZTsgYmwrKykge1xuICAgICAgICAgICAgYmxvY2tMaWdodHNbYmxdICs9IGJzcC5saWdodE1hcHNbbGlnaHRNYXBPZmZzZXQgKyBibF0gKiBzY2FsZTtcbiAgICAgICAgfVxuICAgICAgICBsaWdodE1hcE9mZnNldCArPSBzaXplO1xuICAgIH1cblxuICAgIHZhciBpID0gMDtcbiAgICB2YXIgc3RyaWRlID0gYmxvY2tXaWR0aCAqIGxpZ2h0TWFwQnl0ZXM7XG4gICAgZm9yICh2YXIgeSA9IDA7IHkgPCBoZWlnaHQ7IHkrKykge1xuICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHdpZHRoOyB4KyspIHtcbiAgICAgICAgICAgIHZhciBwb3NpdGlvbiA9IHkgKiBzdHJpZGUgKyB4O1xuICAgICAgICAgICAgdGhpcy5saWdodE1hcHNEYXRhW29mZnNldCArIHBvc2l0aW9uXSA9IDI1NSAtIE1hdGgubWluKDI1NSwgYmxvY2tMaWdodHNbaV0gPj4gNyk7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5MaWdodE1hcHMucHJvdG90eXBlLmFsbG9jYXRlQmxvY2sgPSBmdW5jdGlvbiAod2lkdGgsIGhlaWdodCkge1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICBmb3IgKHZhciB0ZXhJZCA9IDA7IHRleElkIDwgbWF4TGlnaHRNYXBzOyB0ZXhJZCsrKSB7XG4gICAgICAgIHZhciBiZXN0ID0gYmxvY2tIZWlnaHQ7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYmxvY2tXaWR0aCAtIHdpZHRoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBiZXN0MiA9IDA7XG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHdpZHRoOyBqKyspIHtcblxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmFsbG9jYXRlZFt0ZXhJZF1baSArIGpdID49IGJlc3QpXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmFsbG9jYXRlZFt0ZXhJZF1baSArIGpdID4gYmVzdDIpXG4gICAgICAgICAgICAgICAgICAgIGJlc3QyID0gdGhpcy5hbGxvY2F0ZWRbdGV4SWRdW2kgKyBqXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGogPT0gd2lkdGgpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQueCA9IGk7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnkgPSBiZXN0ID0gYmVzdDI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYmVzdCArIGhlaWdodCA+IGJsb2NrSGVpZ2h0KVxuICAgICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB3aWR0aDsgaisrKVxuICAgICAgICAgICAgdGhpcy5hbGxvY2F0ZWRbdGV4SWRdW3Jlc3VsdC54ICsgal0gPSBiZXN0ICsgaGVpZ2h0O1xuXG4gICAgICAgIHJlc3VsdC50ZXhJZCA9IHRleElkO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn07XG5cbkxpZ2h0TWFwcy5wcm90b3R5cGUuYnVpbGQgPSBmdW5jdGlvbihic3ApIHtcbiAgICB2YXIgdXNlZE1hcHMgPSAwO1xuICAgIGZvciAodmFyIG0gPSAwOyBtIDwgYnNwLm1vZGVscy5sZW5ndGg7IG0rKykge1xuICAgICAgICB2YXIgbW9kZWwgPSBic3AubW9kZWxzW21dO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW9kZWwuc3VyZmFjZUNvdW50OyBpKyspIHtcbiAgICAgICAgICAgIHZhciBzdXJmYWNlID0gYnNwLnN1cmZhY2VzW21vZGVsLmZpcnN0U3VyZmFjZSArIGldO1xuICAgICAgICAgICAgaWYgKHN1cmZhY2UuZmxhZ3MgIT09IDApIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHdpZHRoID0gKHN1cmZhY2UuZXh0ZW50c1swXSA+PiA0KSArIDE7XG4gICAgICAgICAgICB2YXIgaGVpZ2h0ID0gKHN1cmZhY2UuZXh0ZW50c1sxXSA+PiA0KSArIDE7XG5cbiAgICAgICAgICAgIHZhciByZXN1bHQgPSB0aGlzLmFsbG9jYXRlQmxvY2sod2lkdGgsIGhlaWdodCk7XG4gICAgICAgICAgICBzdXJmYWNlLmxpZ2h0TWFwUyA9IHJlc3VsdC54O1xuICAgICAgICAgICAgc3VyZmFjZS5saWdodE1hcFQgPSByZXN1bHQueTtcbiAgICAgICAgICAgIHVzZWRNYXBzID0gTWF0aC5tYXgodXNlZE1hcHMsIHJlc3VsdC50ZXhJZCk7XG4gICAgICAgICAgICB2YXIgb2Zmc2V0ID0gcmVzdWx0LnRleElkICogbGlnaHRNYXBCeXRlcyAqIGJsb2NrV2lkdGggKiBibG9ja0hlaWdodDtcbiAgICAgICAgICAgIG9mZnNldCArPSAocmVzdWx0LnkgKiBibG9ja1dpZHRoICsgcmVzdWx0LngpICogbGlnaHRNYXBCeXRlcztcbiAgICAgICAgICAgIHRoaXMuYnVpbGRMaWdodE1hcChic3AsIHN1cmZhY2UsIG9mZnNldCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdGhpcy50ZXh0dXJlID0gbmV3IExpZ2h0TWFwKHRoaXMubGlnaHRNYXBzRGF0YSwgMCwgYmxvY2tXaWR0aCwgYmxvY2tIZWlnaHQpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gTGlnaHRNYXBzO1xuXG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiMVlpWjVTXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvbGlnaHRtYXBzLmpzXCIsXCIvXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIFRleHR1cmUgPSByZXF1aXJlKCdnbC90ZXh0dXJlJyk7XG52YXIgTGlnaHRNYXBzID0gcmVxdWlyZSgnbGlnaHRtYXBzJyk7XG52YXIgYXNzZXRzID0gcmVxdWlyZSgnYXNzZXRzJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCd1dGlscycpO1xudmFyIHdpcmVmcmFtZSA9IGZhbHNlO1xuXG52YXIgYmxvY2tXaWR0aCA9IDUxMjtcbnZhciBibG9ja0hlaWdodCA9IDUxMjtcblxudmFyIE1hcCA9IGZ1bmN0aW9uKGJzcCkge1xuICAgIHRoaXMudGV4dHVyZXMgPSBbXTtcbiAgICB0aGlzLmxpZ2h0TWFwcyA9IG5ldyBMaWdodE1hcHMoKTtcbiAgICB0aGlzLmxpZ2h0TWFwcy5idWlsZChic3ApO1xuXG4gICAgZm9yICh2YXIgdGV4SWQgaW4gYnNwLnRleHR1cmVzKSB7XG4gICAgICAgIHZhciB0ZXh0dXJlID0gYnNwLnRleHR1cmVzW3RleElkXTtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB7XG4gICAgICAgICAgICB3aWR0aDogdGV4dHVyZS53aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogdGV4dHVyZS5oZWlnaHQsXG4gICAgICAgICAgICB3cmFwOiBnbC5SRVBFQVQsXG4gICAgICAgICAgICBwYWxldHRlOiBhc3NldHMucGFsZXR0ZVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLnRleHR1cmVzLnB1c2gobmV3IFRleHR1cmUodGV4dHVyZS5kYXRhLCBvcHRpb25zKSk7XG4gICAgfVxuXG4gICAgdmFyIGNoYWlucyA9IFtdO1xuICAgIGZvciAodmFyIG0gaW4gYnNwLm1vZGVscykge1xuICAgICAgICB2YXIgbW9kZWwgPSBic3AubW9kZWxzW21dO1xuICAgICAgICBmb3IgKHZhciBzaWQgPSBtb2RlbC5maXJzdFN1cmZhY2U7IHNpZCA8IG1vZGVsLnN1cmZhY2VDb3VudDsgc2lkKyspIHtcbiAgICAgICAgICAgIHZhciBzdXJmYWNlID0gYnNwLnN1cmZhY2VzW3NpZF07XG4gICAgICAgICAgICB2YXIgdGV4SW5mbyA9IGJzcC50ZXhJbmZvc1tzdXJmYWNlLnRleEluZm9JZF07XG5cbiAgICAgICAgICAgIHZhciBjaGFpbiA9IGNoYWluc1t0ZXhJbmZvLnRleHR1cmVJZF07XG4gICAgICAgICAgICBpZiAoIWNoYWluKSB7XG4gICAgICAgICAgICAgICAgY2hhaW4gPSB7IHRleElkOiB0ZXhJbmZvLnRleHR1cmVJZCwgZGF0YTogW10gfTtcbiAgICAgICAgICAgICAgICBjaGFpbnNbdGV4SW5mby50ZXh0dXJlSWRdID0gY2hhaW47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBpbmRpY2VzID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBlID0gc3VyZmFjZS5lZGdlU3RhcnQ7IGUgPCBzdXJmYWNlLmVkZ2VTdGFydCArIHN1cmZhY2UuZWRnZUNvdW50OyBlKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgZWRnZUZsaXBwZWQgPSBic3AuZWRnZUxpc3RbZV0gPCAwO1xuICAgICAgICAgICAgICAgIHZhciBlZGdlSW5kZXggPSBNYXRoLmFicyhic3AuZWRnZUxpc3RbZV0pO1xuICAgICAgICAgICAgICAgIGlmICghZWRnZUZsaXBwZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5kaWNlcy5wdXNoKGJzcC5lZGdlc1tlZGdlSW5kZXggKiAyXSk7XG4gICAgICAgICAgICAgICAgICAgIGluZGljZXMucHVzaChic3AuZWRnZXNbZWRnZUluZGV4ICogMiArIDFdKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpbmRpY2VzLnB1c2goYnNwLmVkZ2VzW2VkZ2VJbmRleCAqIDIgKyAxXSk7XG4gICAgICAgICAgICAgICAgICAgIGluZGljZXMucHVzaChic3AuZWRnZXNbZWRnZUluZGV4ICogMl0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGluZGljZXMgPSB3aXJlZnJhbWUgPyBpbmRpY2VzIDogdXRpbHMudHJpYW5ndWxhdGUoaW5kaWNlcyk7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGluZGljZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgdiA9IFtcbiAgICAgICAgICAgICAgICAgICAgYnNwLnZlcnRpY2VzW2luZGljZXNbaV1dLngsXG4gICAgICAgICAgICAgICAgICAgIGJzcC52ZXJ0aWNlc1tpbmRpY2VzW2ldXS55LFxuICAgICAgICAgICAgICAgICAgICBic3AudmVydGljZXNbaW5kaWNlc1tpXV0uelxuICAgICAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgICAgICB2YXIgcyA9IHZlYzMuZG90KHYsIHRleEluZm8udmVjdG9yUykgKyB0ZXhJbmZvLmRpc3RTO1xuICAgICAgICAgICAgICAgIHZhciB0ID0gdmVjMy5kb3QodiwgdGV4SW5mby52ZWN0b3JUKSArIHRleEluZm8uZGlzdFQ7XG5cbiAgICAgICAgICAgICAgICB2YXIgczEgPSBzIC8gdGhpcy50ZXh0dXJlc1t0ZXhJbmZvLnRleHR1cmVJZF0ud2lkdGg7XG4gICAgICAgICAgICAgICAgdmFyIHQxID0gdCAvIHRoaXMudGV4dHVyZXNbdGV4SW5mby50ZXh0dXJlSWRdLmhlaWdodDtcblxuICAgICAgICAgICAgICAgIC8vIFNoYWRvdyBtYXAgdGV4dHVyZSBjb29yZGluYXRlc1xuICAgICAgICAgICAgICAgIHZhciBzMiA9IHM7XG4gICAgICAgICAgICAgICAgczIgLT0gc3VyZmFjZS50ZXh0dXJlTWluc1swXTtcbiAgICAgICAgICAgICAgICBzMiArPSAoc3VyZmFjZS5saWdodE1hcFMgKiAxNik7XG4gICAgICAgICAgICAgICAgczIgKz0gODtcbiAgICAgICAgICAgICAgICBzMiAvPSAoYmxvY2tXaWR0aCAqIDE2KTtcblxuICAgICAgICAgICAgICAgIHZhciB0MiA9IHQ7XG4gICAgICAgICAgICAgICAgdDIgLT0gc3VyZmFjZS50ZXh0dXJlTWluc1sxXTtcbiAgICAgICAgICAgICAgICB0MiArPSAoc3VyZmFjZS5saWdodE1hcFQgKiAxNik7XG4gICAgICAgICAgICAgICAgdDIgKz0gODtcbiAgICAgICAgICAgICAgICB0MiAvPSAoYmxvY2tIZWlnaHQgKiAxNik7XG5cbiAgICAgICAgICAgICAgICBjaGFpbi5kYXRhLnB1c2godlswXSwgdlsxXSwgdlsyXSwgczEsIHQxLCBzMiwgdDIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGRhdGEgPSBbXTtcbiAgICB2YXIgb2Zmc2V0ID0gMDtcbiAgICB0aGlzLmNoYWlucyA9IFtdO1xuICAgIGZvciAodmFyIGMgaW4gY2hhaW5zKSB7XG4gICAgICAgIGZvciAodmFyIHYgPSAwOyB2IDwgY2hhaW5zW2NdLmRhdGEubGVuZ3RoOyB2KyspIHtcbiAgICAgICAgICAgIGRhdGEucHVzaChjaGFpbnNbY10uZGF0YVt2XSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNoYWluID0ge1xuICAgICAgICAgICAgb2Zmc2V0OiBvZmZzZXQsXG4gICAgICAgICAgICB0ZXhJZDogY2hhaW5zW2NdLnRleElkLFxuICAgICAgICAgICAgZWxlbWVudHM6IGNoYWluc1tjXS5kYXRhLmxlbmd0aCAvIDdcbiAgICAgICAgfTtcbiAgICAgICAgb2Zmc2V0ICs9IGNoYWluLmVsZW1lbnRzO1xuICAgICAgICB0aGlzLmNoYWlucy5wdXNoKGNoYWluKTtcbiAgICB9XG4gICAgdGhpcy5idWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcbiAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdGhpcy5idWZmZXIpO1xuICAgIGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KGRhdGEpLCBnbC5TVEFUSUNfRFJBVyk7XG4gICAgdGhpcy5idWZmZXIuc3RyaWRlID0gNyAqIDQ7XG59O1xuXG5NYXAucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihwLCBtKSB7XG4gICAgdmFyIHNoYWRlciA9IGFzc2V0cy5zaGFkZXJzLndvcmxkO1xuICAgIHZhciBidWZmZXIgPSB0aGlzLmJ1ZmZlcjtcbiAgICB2YXIgbW9kZSA9IHdpcmVmcmFtZSA/IGdsLkxJTkVTIDogZ2wuVFJJQU5HTEVTO1xuXG4gICAgc2hhZGVyLnVzZSgpO1xuICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLmJ1ZmZlcik7XG5cbiAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShzaGFkZXIuYXR0cmlidXRlcy5zaGFkb3dUZXhDb29yZHNBdHRyaWJ1dGUpO1xuXG4gICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihzaGFkZXIuYXR0cmlidXRlcy52ZXJ0ZXhBdHRyaWJ1dGUsIDMsIGdsLkZMT0FULCBmYWxzZSwgYnVmZmVyLnN0cmlkZSwgMCk7XG4gICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihzaGFkZXIuYXR0cmlidXRlcy50ZXhDb29yZHNBdHRyaWJ1dGUsIDIsIGdsLkZMT0FULCBmYWxzZSwgYnVmZmVyLnN0cmlkZSwgMTIpO1xuICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIoc2hhZGVyLmF0dHJpYnV0ZXMuc2hhZG93VGV4Q29vcmRzQXR0cmlidXRlLCAyLCBnbC5GTE9BVCwgZmFsc2UsIGJ1ZmZlci5zdHJpZGUsIDIwKTtcbiAgICBnbC51bmlmb3JtTWF0cml4NGZ2KHNoYWRlci51bmlmb3Jtcy5wcm9qZWN0aW9uTWF0cml4LCBmYWxzZSwgcCk7XG4gICAgZ2wudW5pZm9ybU1hdHJpeDRmdihzaGFkZXIudW5pZm9ybXMubW9kZWx2aWV3TWF0cml4LCBmYWxzZSwgbSk7XG4gICAgZ2wudW5pZm9ybTFpKHNoYWRlci51bmlmb3Jtcy50ZXh0dXJlTWFwLCAwKTtcbiAgICBnbC51bmlmb3JtMWkoc2hhZGVyLnVuaWZvcm1zLmxpZ2h0TWFwLCAxKTtcblxuICAgIHRoaXMubGlnaHRNYXBzLnRleHR1cmUuYmluZCgxKTtcbiAgICBmb3IgKHZhciBjIGluIHRoaXMuY2hhaW5zKSB7XG4gICAgICAgIHZhciBjaGFpbiA9IHRoaXMuY2hhaW5zW2NdO1xuICAgICAgICB2YXIgdGV4dHVyZSA9IHRoaXMudGV4dHVyZXNbY2hhaW4udGV4SWRdO1xuICAgICAgICB0ZXh0dXJlLmJpbmQoMCk7XG4gICAgICAgIGdsLmRyYXdBcnJheXMobW9kZSwgdGhpcy5jaGFpbnNbY10ub2Zmc2V0LCB0aGlzLmNoYWluc1tjXS5lbGVtZW50cyk7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gTWFwO1xufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIxWWlaNVNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9tYXAuanNcIixcIi9cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgYXNzZXRzID0gcmVxdWlyZSgnYXNzZXRzJyk7XG52YXIgVGV4dHVyZSA9IHJlcXVpcmUoJ2dsL1RleHR1cmUnKTtcblxudmFyIE1vZGVsID0gZnVuY3Rpb24obWRsKSB7XG4gICAgdGhpcy5za2lucyA9IFtdO1xuICAgIGZvciAodmFyIHNraW5JbmRleCA9IDA7IHNraW5JbmRleCA8IG1kbC5za2lucy5sZW5ndGg7IHNraW5JbmRleCsrKSB7XG4gICAgICAgIHZhciBza2luID0gbWRsLnNraW5zW3NraW5JbmRleF07XG4gICAgICAgIHZhciB0ZXh0dXJlID0gbmV3IFRleHR1cmUoc2tpbiwge1xuICAgICAgICAgICAgcGFsZXR0ZTogYXNzZXRzLnBhbGV0dGUsXG4gICAgICAgICAgICB3aWR0aDogbWRsLnNraW5XaWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogbWRsLnNraW5IZWlnaHRcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc2tpbnMucHVzaCh0ZXh0dXJlKTtcbiAgICB9XG5cbiAgICB0aGlzLmlkID0gZ2wuY3JlYXRlQnVmZmVyKCk7XG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHRoaXMuaWQpO1xuICAgIHZhciBkYXRhID0gbmV3IEZsb2F0MzJBcnJheShtZGwuZnJhbWVDb3VudCAqIG1kbC5mYWNlQ291bnQgKiAzICogNSk7XG4gICAgdmFyIG9mZnNldCA9IDA7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtZGwuZnJhbWVDb3VudDsgaSsrKSB7XG4gICAgICAgIHZhciBmcmFtZSA9IG1kbC5mcmFtZXNbaV07XG4gICAgICAgIGZvciAodmFyIGYgPSAwOyBmIDwgbWRsLmZhY2VDb3VudDsgZisrKSB7XG4gICAgICAgICAgICB2YXIgZmFjZSA9IG1kbC5mYWNlc1tmXTtcbiAgICAgICAgICAgIGZvciAodmFyIHYgPSAwOyB2IDwgMzsgdisrKSB7XG4gICAgICAgICAgICAgICAgZGF0YVtvZmZzZXQrK10gPSBmcmFtZS52ZXJ0aWNlc1tmYWNlLmluZGljZXNbdl1dWzBdO1xuICAgICAgICAgICAgICAgIGRhdGFbb2Zmc2V0KytdID0gZnJhbWUudmVydGljZXNbZmFjZS5pbmRpY2VzW3ZdXVsxXTtcbiAgICAgICAgICAgICAgICBkYXRhW29mZnNldCsrXSA9IGZyYW1lLnZlcnRpY2VzW2ZhY2UuaW5kaWNlc1t2XV1bMl07XG5cbiAgICAgICAgICAgICAgICB2YXIgcyA9IG1kbC50ZXhDb29yZHNbZmFjZS5pbmRpY2VzW3ZdXS5zO1xuICAgICAgICAgICAgICAgIHZhciB0ID0gbWRsLnRleENvb3Jkc1tmYWNlLmluZGljZXNbdl1dLnQ7XG5cbiAgICAgICAgICAgICAgICBpZiAoIWZhY2UuaXNGcm9udEZhY2UgJiYgbWRsLnRleENvb3Jkc1tmYWNlLmluZGljZXNbdl1dLm9uU2VhbSlcbiAgICAgICAgICAgICAgICAgICAgcyArPSB0aGlzLnNraW5zWzBdLndpZHRoICogMC41OyAvLyBvbiBiYWNrIHNpZGVcblxuICAgICAgICAgICAgICAgIGRhdGFbb2Zmc2V0KytdID0gKHMgKyAwLjUpIC8gdGhpcy5za2luc1swXS53aWR0aDtcbiAgICAgICAgICAgICAgICBkYXRhW29mZnNldCsrXSA9ICh0ICsgMC41KSAvIHRoaXMuc2tpbnNbMF0uaGVpZ2h0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIGRhdGEsIGdsLlNUQVRJQ19EUkFXKTtcbiAgICB0aGlzLnN0cmlkZSA9IDUgKiA0OyAvLyB4LCB5LCB6LCBzLCB0XG4gICAgdGhpcy5mYWNlQ291bnQgPSBtZGwuZmFjZUNvdW50O1xuICAgIHRoaXMuYW5pbWF0aW9ucyA9IG1kbC5hbmltYXRpb25zO1xufTtcblxuTW9kZWwucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihwLCBtLCBhbmltYXRpb24sIGZyYW1lKSB7XG4gICAgdmFyIHNoYWRlciA9IGFzc2V0cy5zaGFkZXJzLm1vZGVsO1xuICAgIGFuaW1hdGlvbiA9IGFuaW1hdGlvbiB8IDA7XG4gICAgZnJhbWUgPSBmcmFtZSB8IDA7XG4gICAgc2hhZGVyLnVzZSgpO1xuXG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHRoaXMuaWQpO1xuICAgIHRoaXMuc2tpbnNbMF0uYmluZCgwKTtcblxuICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIoc2hhZGVyLmF0dHJpYnV0ZXMudmVydGV4QXR0cmlidXRlLCAzLCBnbC5GTE9BVCwgZmFsc2UsIHRoaXMuc3RyaWRlLCAwKTtcbiAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKHNoYWRlci5hdHRyaWJ1dGVzLnRleENvb3Jkc0F0dHJpYnV0ZSwgMiwgZ2wuRkxPQVQsIGZhbHNlLCB0aGlzLnN0cmlkZSwgMTIpO1xuICAgIGdsLnVuaWZvcm1NYXRyaXg0ZnYoc2hhZGVyLnVuaWZvcm1zLm1vZGVsdmlld01hdHJpeCwgZmFsc2UsIG0pO1xuICAgIGdsLnVuaWZvcm1NYXRyaXg0ZnYoc2hhZGVyLnVuaWZvcm1zLnByb2plY3Rpb25NYXRyaXgsIGZhbHNlLCBwKTtcblxuICAgIGZyYW1lICs9IHRoaXMuYW5pbWF0aW9uc1thbmltYXRpb25dLmZpcnN0RnJhbWU7XG4gICAgaWYgKGZyYW1lID49IHRoaXMuYW5pbWF0aW9uc1thbmltYXRpb25dLmZyYW1lQ291bnQpXG4gICAgICAgIGZyYW1lID0gMDtcblxuICAgIGdsLnVuaWZvcm0xaShzaGFkZXIudW5pZm9ybXMudGV4dHVyZU1hcCwgMCk7XG4gICAgZ2wuZHJhd0FycmF5cyhnbC5UUklBTkdMRVMsIH5+ZnJhbWUgKiAodGhpcy5mYWNlQ291bnQgKiAzKSwgdGhpcy5mYWNlQ291bnQgKiAzKTtcbiAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgbnVsbCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBNb2RlbDtcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiMVlpWjVTXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvbW9kZWwuanNcIixcIi9cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG5cbnZhciBQcm90b2NvbCA9IHtcbiAgICBzZXJ2ZXJCYWQ6IDAsXG4gICAgc2VydmVyTm9wOiAxLFxuICAgIHNlcnZlckRpc2Nvbm5lY3Q6IDIsXG4gICAgc2VydmVyVXBkYXRlU3RhdDogMyxcbiAgICBzZXJ2ZXJWZXJzaW9uOiA0LFxuICAgIHNlcnZlclNldFZpZXc6IDUsXG4gICAgc2VydmVyU291bmQ6IDYsXG4gICAgc2VydmVyVGltZTogNyxcbiAgICBzZXJ2ZXJQcmludDogOCxcbiAgICBzZXJ2ZXJTdHVmZlRleHQ6IDksXG4gICAgc2VydmVyU2V0QW5nbGU6IDEwLFxuICAgIHNlcnZlckluZm86IDExLFxuICAgIHNlcnZlckxpZ2h0U3R5bGU6IDEyLFxuICAgIHNlcnZlclVwZGF0ZU5hbWU6IDEzLFxuICAgIHNlcnZlclVwZGF0ZUZyYWdzOiAxNCxcbiAgICBzZXJ2ZXJDbGllbnREYXRhOiAxNSxcbiAgICBzZXJ2ZXJTdG9wU291bmQ6IDE2LFxuICAgIHNlcnZlclVwZGF0ZUNvbG9yczogMTcsXG4gICAgc2VydmVyUGFydGljbGU6IDE4LFxuICAgIHNlcnZlckRhbWFnZTogMTksXG4gICAgc2VydmVyU3Bhd25TdGF0aWM6IDIwLFxuICAgIHNlcnZlclNwYXduQmFzZWxpbmU6IDIyLFxuICAgIHNlcnZlclRlbXBFbnRpdHk6IDIzLFxuICAgIHNlcnZlclNldFBhdXNlOiAyNCxcbiAgICBzZXJ2ZXJTaWdub25OdW06IDI1LFxuICAgIHNlcnZlckNlbnRlclByaW50OiAyNixcbiAgICBzZXJ2ZXJLaWxsZWRNb25zdGVyOiAyNyxcbiAgICBzZXJ2ZXJGb3VuZFNlY3JldDogMjgsXG4gICAgc2VydmVyU3Bhd25TdGF0aWNTb3VuZDogMjksXG4gICAgc2VydmVyQ2RUcmFjazogMzIsXG4gICAgXG4gICAgY2xpZW50Vmlld0hlaWdodDogMSxcbiAgICBjbGllbnRJZGVhbFBpdGNoOiAyLFxuICAgIGNsaWVudFB1bmNoMTogNCxcbiAgICBjbGllbnRQdW5jaDI6IDgsXG4gICAgY2xpZW50UHVuY2gzOiAxNixcbiAgICBjbGllbnRWZWxvY2l0eTE6IDMyLFxuICAgIGNsaWVudFZlbG9jaXR5MjogNjQsXG4gICAgY2xpZW50VmVsb2NpdHkzOiAxMjgsXG4gICAgY2xpZW50QWltZW50OiAyNTYsXG4gICAgY2xpZW50SXRlbXM6IDUxMixcbiAgICBjbGllbnRPbkdyb3VuZDogMTAyNCxcbiAgICBjbGllbnRJbldhdGVyOiAyMDQ4LFxuICAgIGNsaWVudFdlYXBvbkZyYW1lOiA0MDk2LFxuICAgIGNsaWVudEFybW9yOiA4MTkyLFxuICAgIGNsaWVudFdlYXBvbjogMTYzODQsXG5cbiAgICBmYXN0VXBkYXRlTW9yZUJpdHM6IDEsXG4gICAgZmFzdFVwZGF0ZU9yaWdpbjE6IDIsXG4gICAgZmFzdFVwZGF0ZU9yaWdpbjI6IDQsXG4gICAgZmFzdFVwZGF0ZU9yaWdpbjM6IDgsXG4gICAgZmFzdFVwZGF0ZUFuZ2xlMjogMTYsXG4gICAgZmFzdFVwZGF0ZU5vTGVycDogMzIsXG4gICAgZmFzdFVwZGF0ZUZyYW1lOiA2NCxcbiAgICBmYXN0VXBkYXRlU2lnbmFsOiAxMjgsXG4gICAgZmFzdFVwZGF0ZUFuZ2xlMTogMjU2LFxuICAgIGZhc3RVcGRhdGVBbmdsZTM6IDUxMixcbiAgICBmYXN0VXBkYXRlTW9kZWw6IDEwMjQsXG4gICAgZmFzdFVwZGF0ZUNvbG9yTWFwOiAyMDQ4LFxuICAgIGZhc3RVcGRhdGVTa2luOiA0MDk2LFxuICAgIGZhc3RVcGRhdGVFZmZlY3RzOiA4MTkyLFxuICAgIGZhc3RVcGRhdGVMb25nRW50aXR5OiAxNjM4NCxcblxuICAgIHNvdW5kVm9sdW1lOiAxLFxuICAgIHNvdW5kQXR0ZW51YXRpb246IDIsXG4gICAgc291bmRMb29waW5nOiA0LFxuXG4gICAgdGVtcFNwaWtlOiAwLFxuICAgIHRlbXBTdXBlclNwaWtlOiAxLFxuICAgIHRlbXBHdW5TaG90OiAyLFxuICAgIHRlbXBFeHBsb3Npb246IDMsXG4gICAgdGVtcFRhckV4cGxvc2lvbjogNCxcbiAgICB0ZW1wTGlnaHRuaW5nMTogNSxcbiAgICB0ZW1wTGlnaHRuaW5nMjogNixcbiAgICB0ZW1wV2l6U3Bpa2U6IDcsXG4gICAgdGVtcEtuaWdodFNwaWtlOiA4LFxuICAgIHRlbXBMaWdodG5pbmczOiA5LFxuICAgIHRlbXBMYXZhU3BsYXNoOiAxMCxcbiAgICB0ZW1wVGVsZXBvcnQ6IDExLFxuICAgIHRlbXBFeHBsb3Npb24yOiAxMlxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gUHJvdG9jb2w7XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiMVlpWjVTXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvcHJvdG9jb2wuanNcIixcIi9cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG5cbnZhciBzZXR0aW5ncyA9IHtcbiAgICB2ZXJzaW9uOiAnMC4xJyxcbiAgICBtYXBOYW1lczoge1xuICAgICAgICBzdGFydDogJ0VudHJhbmNlJyxcbiAgICAgICAgZTFtMTogJ1NsaXBnYXRlIENvbXBsZXgnLFxuICAgICAgICBlMW0yOiAnQ2FzdGxlIG9mIHRoZSBEYW1uZWQnLFxuICAgICAgICBlMW0zOiAnVGhlIE5lY3JvcG9saXMnLFxuICAgICAgICBlMW00OiAnVGhlIEdyaXNseSBHcm90dG8nLFxuICAgICAgICBlMW01OiAnR2xvb20gS2VlcCcsXG4gICAgICAgIGUxbTY6ICdUaGUgRG9vciBUbyBDaHRob24nLFxuICAgICAgICBlMW03OiAnVGhlIEhvdXNlIG9mIENodGhvbicsXG4gICAgICAgIGUxbTg6ICdaaWdndXJhdCBWZXJ0aWdvJ1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IHNldHRpbmdzO1xufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIxWWlaNVNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9zZXR0aW5ncy5qc1wiLFwiL1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbnZhciBTcHJpdGVzID0gcmVxdWlyZSgnZ2wvc3ByaXRlcycpO1xudmFyIEZvbnQgPSByZXF1aXJlKCdnbC9mb250Jyk7XG52YXIgYXNzZXRzID0gcmVxdWlyZSgnYXNzZXRzJyk7XG52YXIgc2V0dGluZ3MgPSByZXF1aXJlKCdzZXR0aW5ncycpO1xuXG52YXIgQ29uc29sZSA9IGZ1bmN0aW9uKCkge1xuICAgdmFyIGZvbnRUZXh0dXJlID0gYXNzZXRzLmxvYWQoJ3dhZC9DT05DSEFSUycsIHsgd2lkdGg6IDEyOCwgaGVpZ2h0OiAxMjgsIGFscGhhOiB0cnVlIH0pO1xuICAgdmFyIGZvbnQgPSBuZXcgRm9udChmb250VGV4dHVyZSwgOCwgOCk7XG5cbiAgIHZhciBiYWNrZ3JvdW5kVGV4dHVyZSA9IGFzc2V0cy5sb2FkKCdwYWsvZ2Z4L2NvbmJhY2subG1wJyk7XG4gICBiYWNrZ3JvdW5kVGV4dHVyZS5kcmF3VG8oZnVuY3Rpb24ocCkge1xuICAgICAgZ2wuZW5hYmxlKGdsLkJMRU5EKTtcbiAgICAgIHZhciB2ZXJzaW9uID0gJ1dlYkdMICcgKyBzZXR0aW5ncy52ZXJzaW9uO1xuICAgICAgZm9udC5kcmF3U3RyaW5nKGdsLndpZHRoICogMC43LCBnbC5oZWlnaHQgKiAwLjkzLCB2ZXJzaW9uLCAxKTtcbiAgICAgIGZvbnQucmVuZGVyKGFzc2V0cy5zaGFkZXJzLnRleHR1cmUyZCwgcCk7XG4gICB9KTtcbiAgIHZhciBiYWNrZ3JvdW5kID0gbmV3IFNwcml0ZXMoMzIwLCAyMDApO1xuICAgYmFja2dyb3VuZC50ZXh0dXJlcy5hZGRTdWJUZXh0dXJlKGJhY2tncm91bmRUZXh0dXJlKTtcbiAgIGJhY2tncm91bmQudGV4dHVyZXMuY29tcGlsZShhc3NldHMuc2hhZGVycy50ZXh0dXJlMmQpO1xuXG4gICB0aGlzLmZvbnQgPSBmb250O1xuICAgdGhpcy5iYWNrZ3JvdW5kID0gYmFja2dyb3VuZDtcbn07XG5cbkNvbnNvbGUucHJvdG90eXBlLnByaW50ID0gZnVuY3Rpb24obXNnKSB7XG4gICB0aGlzLmZvbnQuZHJhd1N0cmluZyg0MCwgNDAsIG1zZyk7XG59O1xuXG5Db25zb2xlLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24ocCkge1xuXG4gICB0aGlzLmJhY2tncm91bmQuY2xlYXIoKTtcbiAgIHRoaXMuYmFja2dyb3VuZC5kcmF3U3ByaXRlKDAsIDAsIC00MDAsIGdsLndpZHRoLCBnbC5oZWlnaHQsIDEsIDEsIDEsIDEuMCk7XG4gICB0aGlzLmJhY2tncm91bmQucmVuZGVyKGFzc2V0cy5zaGFkZXJzLmNvbG9yMmQsIHApO1xuXG4gICBnbC5lbmFibGUoZ2wuQkxFTkQpO1xuICAgdGhpcy5mb250LnJlbmRlcihhc3NldHMuc2hhZGVycy50ZXh0dXJlMmQsIHApO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gQ29uc29sZTtcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiMVlpWjVTXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvdWkvY29uc29sZS5qc1wiLFwiL3VpXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIFNwcml0ZXMgPSByZXF1aXJlKCdnbC9zcHJpdGVzJyk7XG52YXIgYXNzZXRzID0gcmVxdWlyZSgnYXNzZXRzJyk7XG5cbnZhciBTdGF0dXNCYXIgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNwcml0ZXMgPSBuZXcgU3ByaXRlcyg1MTIsIDUxMiwgNjQpO1xuXG4gICAgdGhpcy5iYWNrZ3JvdW5kID0gdGhpcy5sb2FkUGljKCdTQkFSJyk7XG4gICAgdGhpcy5udW1iZXJzID0gW107XG4gICAgdGhpcy5yZWROdW1iZXJzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxMDsgaSsrKSB7XG4gICAgICAgIHRoaXMubnVtYmVycy5wdXNoKHRoaXMubG9hZFBpYygnTlVNXycgKyBpKSk7XG4gICAgICAgIHRoaXMucmVkTnVtYmVycy5wdXNoKHRoaXMubG9hZFBpYygnQU5VTV8nICsgaSkpO1xuICAgIH1cblxuICAgIHRoaXMud2VhcG9ucyA9IG5ldyBBcnJheSg3KTtcbiAgICB0aGlzLndlYXBvbnNbMF0gPSB0aGlzLmxvYWRXZWFwb24oJ1NIT1RHVU4nKTtcbiAgICB0aGlzLndlYXBvbnNbMV0gPSB0aGlzLmxvYWRXZWFwb24oJ1NTSE9UR1VOJyk7XG4gICAgdGhpcy53ZWFwb25zWzJdID0gdGhpcy5sb2FkV2VhcG9uKCdOQUlMR1VOJyk7XG4gICAgdGhpcy53ZWFwb25zWzNdID0gdGhpcy5sb2FkV2VhcG9uKCdTTkFJTEdVTicpO1xuICAgIHRoaXMud2VhcG9uc1s0XSA9IHRoaXMubG9hZFdlYXBvbignUkxBVU5DSCcpO1xuICAgIHRoaXMud2VhcG9uc1s1XSA9IHRoaXMubG9hZFdlYXBvbignU1JMQVVOQ0gnKTtcbiAgICB0aGlzLndlYXBvbnNbNl0gPSB0aGlzLmxvYWRXZWFwb24oJ0xJR0hUTkcnKTtcblxuICAgIHRoaXMuZmFjZXMgPSBuZXcgQXJyYXkoNSk7XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPD0gNTsgaSsrKVxuICAgICAgICB0aGlzLmZhY2VzW2kgLSAxXSA9IHsgbm9ybWFsOiB0aGlzLmxvYWRQaWMoJ0ZBQ0UnICsgaSksIHBhaW46IHRoaXMubG9hZFBpYygnRkFDRV9QJyArIGkpIH07XG5cbiAgICB0aGlzLnNwcml0ZXMudGV4dHVyZXMuY29tcGlsZShhc3NldHMuc2hhZGVycy50ZXh0dXJlMmQpO1xufTtcblxuU3RhdHVzQmFyLnByb3RvdHlwZS5sb2FkUGljID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciB0ZXh0dXJlID0gYXNzZXRzLmxvYWQoJ3dhZC8nICsgbmFtZSk7XG4gICAgcmV0dXJuIHRoaXMuc3ByaXRlcy50ZXh0dXJlcy5hZGRTdWJUZXh0dXJlKHRleHR1cmUpO1xufTtcblxuU3RhdHVzQmFyLnByb3RvdHlwZS5kcmF3UGljID0gZnVuY3Rpb24oaW5kZXgsIHgsIHkpIHtcbiAgICB0aGlzLnNwcml0ZXMuZHJhd1Nwcml0ZShpbmRleCwgeCwgeSwgMCwgMCwgMSwgMSwgMSwgMSk7XG59O1xuXG5TdGF0dXNCYXIucHJvdG90eXBlLmxvYWRXZWFwb24gPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHZhciB3ZWFwb24gPSB7fTtcbiAgICB3ZWFwb24ub3duZWQgPSB0aGlzLmxvYWRQaWMoJ0lOVl8nICsgbmFtZSk7XG4gICAgd2VhcG9uLmFjdGl2ZSA9IHRoaXMubG9hZFBpYygnSU5WMl8nICsgbmFtZSk7XG4gICAgd2VhcG9uLmZsYXNoZXMgPSBuZXcgQXJyYXkoNSk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA1OyBpKyspXG4gICAgICAgIHdlYXBvbi5mbGFzaGVzW2ldID0gdGhpcy5sb2FkUGljKCdJTlZBJyArIChpICsgMSkgKyAnXycgKyBuYW1lKTtcbiAgICByZXR1cm4gd2VhcG9uO1xufTtcblxuU3RhdHVzQmFyLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24ocCkge1xuICAgIHRoaXMuc3ByaXRlcy5jbGVhcigpO1xuXG4gICAgdmFyIGxlZnQgPSBnbC53aWR0aCAvIDIgLSAxNjA7XG4gICAgdGhpcy5kcmF3UGljKHRoaXMuYmFja2dyb3VuZCwgbGVmdCwgZ2wuaGVpZ2h0IC0gMjgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNzsgaSsrKVxuICAgICAgICB0aGlzLmRyYXdQaWModGhpcy53ZWFwb25zW2ldLm93bmVkLCBsZWZ0ICsgaSAqIDI0LCBnbC5oZWlnaHQgLSA0Mik7XG5cbiAgICB0aGlzLnNwcml0ZXMucmVuZGVyKGFzc2V0cy5zaGFkZXJzLmNvbG9yMmQsIHApO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gU3RhdHVzQmFyO1xufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIxWWlaNVNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi91aS9zdGF0dXNiYXIuanNcIixcIi91aVwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbnZhciBVdGlscyA9IHt9O1xuXG5VdGlscy5nZXRFeHRlbnNpb24gPSBmdW5jdGlvbihwYXRoKSB7XG4gICAgdmFyIGluZGV4ID0gcGF0aC5sYXN0SW5kZXhPZignLicpO1xuICAgIGlmIChpbmRleCA9PT0gLTEpIHJldHVybiAnJztcbiAgICByZXR1cm4gcGF0aC5zdWJzdHIoaW5kZXggKyAxKTtcbn07XG5cblV0aWxzLnRyaWFuZ3VsYXRlID0gZnVuY3Rpb24ocG9pbnRzKSB7XG4gICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgIHBvaW50cy5wb3AoKTtcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IHBvaW50cy5sZW5ndGggLSAyOyBpICs9IDIpIHtcbiAgICAgICAgcmVzdWx0LnB1c2gocG9pbnRzW2kgKyAyXSk7XG4gICAgICAgIHJlc3VsdC5wdXNoKHBvaW50c1tpXSk7XG4gICAgICAgIHJlc3VsdC5wdXNoKHBvaW50c1swXSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59O1xuXG5VdGlscy5xdWFrZUlkZW50aXR5ID0gZnVuY3Rpb24oYSkge1xuICAgIGFbMF0gPSAwOyBhWzRdID0gMTsgYVs4XSA9IDA7IGFbMTJdID0gMDtcbiAgICBhWzFdID0gMDsgYVs1XSA9IDA7IGFbOV0gPSAtMTsgYVsxM10gPSAwO1xuICAgIGFbMl0gPSAtMTsgYVs2XSA9IDA7IGFbMTBdID0gMDsgYVsxNF0gPSAwO1xuICAgIGFbM10gPSAwOyBhWzddID0gMDsgYVsxMV0gPSAwOyBhWzE1XSA9IDE7XG4gICAgcmV0dXJuIGE7XG59O1xuXG5VdGlscy5kZWcyUmFkID0gZnVuY3Rpb24oZGVncmVlcykge1xuICAgIHJldHVybiBkZWdyZWVzICogTWF0aC5QSSAvIDE4MDtcbn07XG5cblV0aWxzLnJhZDJEZWcgPSBmdW5jdGlvbihkZWdyZWVzKSB7XG4gICAgcmV0dXJuIGRlZ3JlZXMgLyBNYXRoLlBJICogMTgwO1xufTtcblxuXG5VdGlscy5pc1Bvd2VyT2YyID0gZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiAoeCAmICh4IC0gMSkpID09IDA7XG59O1xuXG5VdGlscy5uZXh0UG93ZXJPZjIgPSBmdW5jdGlvbih4KSB7XG4gICAgLS14O1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgMzI7IGkgPDw9IDEpIHtcbiAgICAgICAgeCA9IHggfCB4ID4+IGk7XG4gICAgfVxuICAgIHJldHVybiB4ICsgMTtcbn07XG5cblV0aWxzLmFycmF5MWQgPSBmdW5jdGlvbih3aWR0aCkge1xuICAgIHZhciByZXN1bHQgPSBuZXcgQXJyYXkod2lkdGgpO1xuICAgIGZvciAodmFyIHggPSAwOyB4IDwgd2lkdGg7IHgrKykgcmVzdWx0W3hdID0gMDtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuVXRpbHMuYXJyYXkyZCA9IGZ1bmN0aW9uKHdpZHRoLCBoZWlnaHQpIHtcbiAgICB2YXIgcmVzdWx0ID0gbmV3IEFycmF5KGhlaWdodCk7XG4gICAgZm9yICh2YXIgeSA9IDA7IHkgPCBoZWlnaHQ7IHkrKykge1xuICAgICAgICByZXN1bHRbeV0gPSBuZXcgQXJyYXkod2lkdGgpO1xuICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHdpZHRoOyB4KyspXG4gICAgICAgICAgICByZXN1bHRbeV1beF0gPSAwO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gVXRpbHM7XG5cblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIxWWlaNVNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi91dGlscy5qc1wiLFwiL1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbnZhciBNYXAgPSByZXF1aXJlKCdtYXAnKTtcbnZhciBNb2RlbCA9IHJlcXVpcmUoJ21vZGVsJyk7XG52YXIgYXNzZXRzID0gcmVxdWlyZSgnYXNzZXRzJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCd1dGlscycpO1xuXG52YXIgV29ybGQgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLm1vZGVscyA9IFsnZHVtbXknXTtcbiAgICB0aGlzLnN0YXRpY3MgPSBbXTtcbiAgICB0aGlzLmVudGl0aWVzID0gW107XG4gICAgdGhpcy5tYXAgPSBudWxsO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxMDI0OyBpKyspIHtcbiAgICAgICAgdmFyIGVudGl0eSA9IHtcbiAgICAgICAgICAgIHRpbWU6IDAsXG4gICAgICAgICAgICBzdGF0ZTogeyBhbmdsZXM6IHZlYzMuY3JlYXRlKCksIG9yaWdpbjogdmVjMy5jcmVhdGUoKSB9LFxuICAgICAgICAgICAgcHJpb3JTdGF0ZTogeyBhbmdsZXM6IHZlYzMuY3JlYXRlKCksIG9yaWdpbjogdmVjMy5jcmVhdGUoKSB9LFxuICAgICAgICAgICAgbmV4dFN0YXRlOiB7IGFuZ2xlczogdmVjMy5jcmVhdGUoKSwgb3JpZ2luOiB2ZWMzLmNyZWF0ZSgpIH1cbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5lbnRpdGllcy5wdXNoKGVudGl0eSk7XG4gICAgfVxufTtcblxuV29ybGQucHJvdG90eXBlLmxvYWRNb2RlbCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgdHlwZSA9IHV0aWxzLmdldEV4dGVuc2lvbihuYW1lKTtcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgY2FzZSAnYnNwJzpcbiAgICAgICAgICAgIHZhciBtb2RlbCA9IG5ldyBNYXAoYXNzZXRzLmxvYWQoJ3Bhay8nICsgbmFtZSkpO1xuICAgICAgICAgICAgdGhpcy5tb2RlbHMucHVzaChtb2RlbCk7XG4gICAgICAgICAgICBpZiAoIXRoaXMubWFwKSB7IHRoaXMubWFwID0gbW9kZWw7IH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdtZGwnOlxuICAgICAgICAgICAgdGhpcy5tb2RlbHMucHVzaChuZXcgTW9kZWwoYXNzZXRzLmxvYWQoJ3Bhay8nICsgbmFtZSkpKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhpcy5tb2RlbHMucHVzaChudWxsKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbn07XG5cbldvcmxkLnByb3RvdHlwZS5zcGF3blN0YXRpYyA9IGZ1bmN0aW9uKGJhc2VsaW5lKSB7XG4gICAgdmFyIGVudGl0eSA9IHsgc3RhdGU6IGJhc2VsaW5lIH07XG4gICAgdGhpcy5zdGF0aWNzLnB1c2goZW50aXR5KTtcbn07XG5cbldvcmxkLnByb3RvdHlwZS5zcGF3bkVudGl0eSA9IGZ1bmN0aW9uKGlkLCBiYXNlbGluZSkge1xuICAgIHRoaXMuZW50aXRpZXNbaWRdLnN0YXRlID0gYmFzZWxpbmU7XG59O1xuXG5Xb3JsZC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZHQpIHtcblxuICAgIGZvciAodmFyIGUgPSAwOyBlIDwgdGhpcy5lbnRpdGllcy5sZW5ndGg7IGUrKykge1xuICAgICAgICB2YXIgZW50aXR5ID0gdGhpcy5lbnRpdGllc1tlXTtcbiAgICAgICAgaWYgKCFlbnRpdHkpIGNvbnRpbnVlO1xuXG4gICAgICAgIGZvciAodmFyIGMgPSAwOyBjIDwgMzsgYysrKSB7XG4gICAgICAgICAgICB2YXIgZHAgPSBlbnRpdHkubmV4dFN0YXRlLm9yaWdpbltjXSAtIGVudGl0eS5wcmlvclN0YXRlLm9yaWdpbltjXTtcbiAgICAgICAgICAgIGVudGl0eS5zdGF0ZS5vcmlnaW5bY10gPSBlbnRpdHkucHJpb3JTdGF0ZS5vcmlnaW5bY10gKyBkcCAqIGR0O1xuXG4gICAgICAgICAgICB2YXIgZGEgPSBlbnRpdHkubmV4dFN0YXRlLmFuZ2xlc1tjXSAtIGVudGl0eS5wcmlvclN0YXRlLmFuZ2xlc1tjXTtcbiAgICAgICAgICAgIGlmIChkYSA+IDE4MCkgZGEgLT0gMzYwO1xuICAgICAgICAgICAgZWxzZSBpZiAoZGEgPCAtMTgwKSBkYSArPSAzNjA7XG4gICAgICAgICAgICBlbnRpdHkuc3RhdGUuYW5nbGVzW2NdID0gZW50aXR5LnByaW9yU3RhdGUuYW5nbGVzW2NdICsgZGEgKiBkdDtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbldvcmxkLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24ocCwgdmlld0VudGl0eSkge1xuICAgIHZhciBtID0gdXRpbHMucXVha2VJZGVudGl0eShtYXQ0LmNyZWF0ZSgpKTtcbiAgICB2YXIgZW50aXR5ID0gdGhpcy5lbnRpdGllc1t2aWV3RW50aXR5XTtcbiAgICB2YXIgb3JpZ2luID0gZW50aXR5LnN0YXRlLm9yaWdpbjtcbiAgICB2YXIgYW5nbGVzID0gZW50aXR5LnN0YXRlLmFuZ2xlcztcbiAgICBtYXQ0LnJvdGF0ZVkobSwgbSwgdXRpbHMuZGVnMlJhZCgtYW5nbGVzWzBdKSk7XG4gICAgbWF0NC5yb3RhdGVaKG0sIG0sIHV0aWxzLmRlZzJSYWQoLWFuZ2xlc1sxXSkpO1xuICAgIG1hdDQudHJhbnNsYXRlKG0sIG0sIFstb3JpZ2luWzBdLCAtb3JpZ2luWzFdLCAtb3JpZ2luWzJdIC0gMjJdKTtcbiAgICB0aGlzLm1hcC5kcmF3KHAsIG0pO1xuXG4gICAgdGhpcy5kcmF3U3RhdGljcyhwLCBtKTtcbiAgICB0aGlzLmRyYXdFbnRpdGllcyhwLCBtLCB2aWV3RW50aXR5KTtcbn07XG5cbldvcmxkLnByb3RvdHlwZS5kcmF3U3RhdGljcyA9IGZ1bmN0aW9uKHAsIG0pIHtcbiAgICB2YXIgbW0gPSBtYXQ0LmNyZWF0ZSgpO1xuICAgIGZvciAodmFyIHMgPSAwOyBzIDwgdGhpcy5zdGF0aWNzLmxlbmd0aDsgcysrKSB7XG4gICAgICAgIHZhciBzdGF0ZSA9IHRoaXMuc3RhdGljc1tzXS5zdGF0ZTtcbiAgICAgICAgdmFyIG1vZGVsID0gdGhpcy5tb2RlbHNbc3RhdGUubW9kZWxJbmRleF07XG4gICAgICAgIG1hdDQudHJhbnNsYXRlKG1tLCBtLCBzdGF0ZS5vcmlnaW4pO1xuICAgICAgICBtb2RlbC5kcmF3KHAsIG1tLCAwLCAwKTtcbiAgICB9XG59O1xuXG5Xb3JsZC5wcm90b3R5cGUuZHJhd0VudGl0aWVzID0gZnVuY3Rpb24ocCwgbSwgdmlld0VudGl0eSkge1xuICAgIHZhciBtbSA9IG1hdDQuY3JlYXRlKCk7XG4gICAgZm9yICh2YXIgZSA9IDA7IGUgPCB0aGlzLmVudGl0aWVzLmxlbmd0aDsgZSsrKSB7XG4gICAgICAgIGlmIChlID09PSB2aWV3RW50aXR5KVxuICAgICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgdmFyIHN0YXRlID0gdGhpcy5lbnRpdGllc1tlXS5zdGF0ZTtcbiAgICAgICAgdmFyIG1vZGVsID0gdGhpcy5tb2RlbHNbc3RhdGUubW9kZWxJbmRleF07XG4gICAgICAgIGlmIChtb2RlbCkge1xuICAgICAgICAgICAgbW0gPSBtYXQ0LnRyYW5zbGF0ZShtbSwgbSwgc3RhdGUub3JpZ2luKTtcbiAgICAgICAgICAgIG1hdDQucm90YXRlWihtbSwgbW0sIHV0aWxzLmRlZzJSYWQoc3RhdGUuYW5nbGVzWzFdKSk7XG4gICAgICAgICAgICBtb2RlbC5kcmF3KHAsIG1tLCAwLCBzdGF0ZS5mcmFtZSk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBXb3JsZDtcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiMVlpWjVTXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvd29ybGQuanNcIixcIi9cIikiXX0=
