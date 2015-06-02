(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){

var webgl = require('gl/gl');
var assets = require('assets');
var utils = require('utils');
var Map = require('map');
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

var tick = function() {
    requestFrame(tick);
    Quake.instance.tick();
};

Quake = function() {};

var angle = 0;
var position = [0, 0, 0];

Quake.prototype.tick = function() {

    this.client.readFromServer();

    this.handleInput();

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    var m = utils.quakeIdentity(mat4.create());
    //mat4.translate(m, m, [100, 100, -20]);
    mat4.rotateZ(m, m, angle);
    mat4.translate(m, m, position);

    if (this.map)
        this.map.draw(this.projection, m);


    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    this.statusBar.draw(this.ortho);
    //this.console.draw(this.ortho);
};

Quake.prototype.handleInput = function() {

    var speed = 5.0;

    if (this.input.left)
        angle -= 0.04;
    if (this.input.right)
        angle += 0.04;
    if (this.input.up) {
        position[0] -= Math.cos(angle) * speed;
        position[1] += Math.sin(angle) * speed;
    }
    if (this.input.down) {
        position[0] += Math.cos(angle) * speed;
        position[1] -= Math.sin(angle) * speed;
    }
    if (this.input.flyUp)
        position[2] -= 10;
    if (this.input.flyDown)
        position[2] += 10;
};

Quake.prototype.start = function() {
    Quake.instance = this;
    webgl.init('canvas');
    this.ortho = mat4.ortho(mat4.create(), 0, gl.width, gl.height, 0, -10, 10);
    this.projection = mat4.perspective(mat4.create(), 68.03, gl.width / gl.height, 0.1, 4096);

    assets.add('data/pak0.pak');
    assets.add('shaders/color2d.shader');
    assets.add('shaders/texture2d.shader');
    assets.add('shaders/world.shader');

    var self = this;
    assets.precache(function() {
        self.console = new Console();
        self.statusBar = new StatusBar();
        self.input = new Input();
        self.client = new Client();

        //var bsp = assets.load('pak/maps/start.bsp');
        //self.map = new Map(bsp);
        self.client.playDemo('demo1.dem');
        tick();
    });
};





}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/fake_4d62f6a5.js","/")
},{"1YiZ5S":5,"assets":6,"buffer":2,"client":7,"gl/gl":15,"input":20,"map":23,"ui/console":26,"ui/statusbar":27,"utils":28}],2:[function(require,module,exports){
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

function getExtension(path) {
    var index = path.lastIndexOf('.');
    if (index === -1) return '';
    return path.substr(index + 1);
}

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
    type = type || getExtension(url);
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
    var type = getExtension(name) || 'texture';
    var name = name.substr(index + 1);
    var options = options || {};

    switch (type) {
        case 'bsp':
            var data = this.pak.load(name);
            return new Bsp(data);
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
},{"1YiZ5S":5,"buffer":2,"formats/bsp":9,"formats/pak":10,"formats/palette":11,"formats/wad":12,"gl/shader":17,"gl/texture":19}],7:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var assets = require('assets');
var Protocol = require('protocol');

var Client = function() {
    this.viewAngles = vec3.create();
    this.viewEntity = -1;
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

    this.viewAngles[0] = demo.readFloat();
    this.viewAngles[1] = demo.readFloat();
    this.viewAngles[2] = demo.readFloat();

    var msg = demo.read(messageSize);
    var cmd = 0;
    while (cmd !== -1 && !msg.eof()) {
        cmd = msg.readUInt8();
        if (cmd & 128) {
            this.parseFastUpdate(cmd & 127, msg);
            continue;
        }

        switch (cmd) {
            case Protocol.serverUpdateStat:
                var stat = msg.readUInt8();
                var value = msg.readInt32();
                break;
            case Protocol.serverSetView:
                this.viewEntity = msg.readInt16();
                break;
            case Protocol.serverTime:
                msg.readFloat();
                break;
            case Protocol.serverSetAngle:
                this.viewAngles[0] = msg.readInt8() * 1.40625;
                this.viewAngles[1] = msg.readInt8() * 1.40625;
                this.viewAngles[2] = msg.readInt8() * 1.40625;
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
                console.log('%s. %s', msg.readUInt8(), msg.readCString());
                break;
            case Protocol.serverUpdateFrags:
                console.log('%s. Frags: %s', msg.readUInt8(), msg.readInt16());
                break;
            case Protocol.serverUpdateColors:
                console.log('%s. Colors: %s', msg.readUInt8(), msg.readUInt8());
                break;
            case Protocol.serverParticle:
                this.parseParticle();
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
                this.parseBaseline(msg);
                break;
            case Protocol.serverKilledMonster:
                break;
            case Protocol.serverDamage:
                this.parseDamage(msg);
                break;
            case Protocol.serverSpawnBaseline:
                msg.skip(2);
                this.parseBaseline(msg);
                break;
            case Protocol.serverSpawnStaticSound:
                msg.skip(9);
                break;
            default: throw 'Unknown cmd: ' + cmd;
        }
    }
};

Client.prototype.parseServerInfo = function(msg) {
    msg.skip(6);
    var mapName = msg.readCString();
    console.log(mapName);

    while(true) {
        var modelName = msg.readCString();
        if (!modelName) break;
        //console.log(modelName);
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

    var entityNumber = (cmd & Protocol.fastUpdateLongEntity) ?
        msg.readInt16() : msg.readUInt8();

    var entity = {
        state: {},
        baseline: { frame: 0 },
        priorState: { angles: [], origin: [] },
        nextState: { angles: [], origin: [] }
    };
    //this.entities[entityNumber];
    entity.time = this.serverTime;

    if (cmd & Protocol.fastUpdateModel) {
        entity.state.modelIndex = msg.readUInt8();
        entity.model = 0;//this.models[entity.state.modelIndex];
    }
    if (cmd & Protocol.fastUpdateFrame)
        entity.state.frame = msg.readUInt8();
    else
        entity.state.frame = entity.baseline.frame;

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
    msg.skip(13);
};

module.exports = exports = Client;
}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/client.js","/")
},{"1YiZ5S":5,"assets":6,"buffer":2,"protocol":24}],8:[function(require,module,exports){
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
},{"1YiZ5S":5,"buffer":2,"file":8,"formats/palette":11,"formats/wad":12}],11:[function(require,module,exports){
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
},{"1YiZ5S":5,"buffer":2}],12:[function(require,module,exports){
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
},{"1YiZ5S":5,"buffer":2}],13:[function(require,module,exports){
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
},{"1YiZ5S":5,"buffer":2,"gl/texture":19}],14:[function(require,module,exports){
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
},{"1YiZ5S":5,"buffer":2}],15:[function(require,module,exports){
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
},{"1YiZ5S":5,"buffer":2,"lib/gl-matrix-min.js":21}],16:[function(require,module,exports){
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
},{"1YiZ5S":5,"buffer":2}],17:[function(require,module,exports){
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
},{"1YiZ5S":5,"buffer":2}],18:[function(require,module,exports){
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
},{"1YiZ5S":5,"buffer":2,"gl/atlas":13}],19:[function(require,module,exports){
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
},{"1YiZ5S":5,"buffer":2,"utils":28}],20:[function(require,module,exports){
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
},{"1YiZ5S":5,"buffer":2}],21:[function(require,module,exports){
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
},{"1YiZ5S":5,"buffer":2}],22:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var LightMap = require('gl/lightmap');
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
},{"1YiZ5S":5,"buffer":2,"gl/lightmap":16,"utils":28}],23:[function(require,module,exports){
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

    console.log(this.lightMaps.texture.asDataUrl());
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
},{"1YiZ5S":5,"assets":6,"buffer":2,"gl/texture":19,"lightmaps":22,"utils":28}],24:[function(require,module,exports){
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
},{"1YiZ5S":5,"buffer":2}],25:[function(require,module,exports){
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
},{"1YiZ5S":5,"buffer":2}],26:[function(require,module,exports){
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
},{"1YiZ5S":5,"assets":6,"buffer":2,"gl/font":14,"gl/sprites":18,"settings":25}],27:[function(require,module,exports){
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
},{"1YiZ5S":5,"assets":6,"buffer":2,"gl/sprites":18}],28:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var Utils = {};

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
},{"1YiZ5S":5,"buffer":2}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9lcmxhbmRyYW52aW5nZS9naXQvd2ViZ2wtcXVha2Uvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2VybGFuZHJhbnZpbmdlL2dpdC93ZWJnbC1xdWFrZS9qcy9mYWtlXzRkNjJmNmE1LmpzIiwiL1VzZXJzL2VybGFuZHJhbnZpbmdlL2dpdC93ZWJnbC1xdWFrZS9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9idWZmZXIvaW5kZXguanMiLCIvVXNlcnMvZXJsYW5kcmFudmluZ2UvZ2l0L3dlYmdsLXF1YWtlL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2J1ZmZlci9ub2RlX21vZHVsZXMvYmFzZTY0LWpzL2xpYi9iNjQuanMiLCIvVXNlcnMvZXJsYW5kcmFudmluZ2UvZ2l0L3dlYmdsLXF1YWtlL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2J1ZmZlci9ub2RlX21vZHVsZXMvaWVlZTc1NC9pbmRleC5qcyIsIi9Vc2Vycy9lcmxhbmRyYW52aW5nZS9naXQvd2ViZ2wtcXVha2Uvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwianMvYXNzZXRzLmpzIiwianMvY2xpZW50LmpzIiwianMvZmlsZS5qcyIsImpzL2Zvcm1hdHMvYnNwLmpzIiwianMvZm9ybWF0cy9wYWsuanMiLCJqcy9mb3JtYXRzL3BhbGV0dGUuanMiLCJqcy9mb3JtYXRzL3dhZC5qcyIsImpzL2dsL2F0bGFzLmpzIiwianMvZ2wvZm9udC5qcyIsImpzL2dsL2dsLmpzIiwianMvZ2wvbGlnaHRtYXAuanMiLCJqcy9nbC9zaGFkZXIuanMiLCJqcy9nbC9zcHJpdGVzLmpzIiwianMvZ2wvdGV4dHVyZS5qcyIsImpzL2lucHV0LmpzIiwianMvbGliL2dsLW1hdHJpeC1taW4uanMiLCJqcy9saWdodG1hcHMuanMiLCJqcy9tYXAuanMiLCJqcy9wcm90b2NvbC5qcyIsImpzL3NldHRpbmdzLmpzIiwianMvdWkvY29uc29sZS5qcyIsImpzL3VpL3N0YXR1c2Jhci5qcyIsImpzL3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdmxDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL1FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuXG52YXIgd2ViZ2wgPSByZXF1aXJlKCdnbC9nbCcpO1xudmFyIGFzc2V0cyA9IHJlcXVpcmUoJ2Fzc2V0cycpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgndXRpbHMnKTtcbnZhciBNYXAgPSByZXF1aXJlKCdtYXAnKTtcbnZhciBJbnB1dCA9IHJlcXVpcmUoJ2lucHV0Jyk7XG52YXIgQ29uc29sZSA9IHJlcXVpcmUoJ3VpL2NvbnNvbGUnKTtcbnZhciBTdGF0dXNCYXIgPSByZXF1aXJlKCd1aS9zdGF0dXNiYXInKTtcbnZhciBDbGllbnQgPSByZXF1aXJlKCdjbGllbnQnKTtcblxuaWYgKCF3aW5kb3cucmVxdWVzdEZyYW1lKSB7XG4gICAgd2luZG93LnJlcXVlc3RGcmFtZSA9ICggZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICAgICB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICAgICB3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICAgICB3aW5kb3cub1JlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgICAgd2luZG93Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dCggY2FsbGJhY2ssIDEwMDAgLyA2MCApO1xuICAgICAgICAgICAgfTtcbiAgICB9KSgpO1xufVxuXG52YXIgdGljayA9IGZ1bmN0aW9uKCkge1xuICAgIHJlcXVlc3RGcmFtZSh0aWNrKTtcbiAgICBRdWFrZS5pbnN0YW5jZS50aWNrKCk7XG59O1xuXG5RdWFrZSA9IGZ1bmN0aW9uKCkge307XG5cbnZhciBhbmdsZSA9IDA7XG52YXIgcG9zaXRpb24gPSBbMCwgMCwgMF07XG5cblF1YWtlLnByb3RvdHlwZS50aWNrID0gZnVuY3Rpb24oKSB7XG5cbiAgICB0aGlzLmNsaWVudC5yZWFkRnJvbVNlcnZlcigpO1xuXG4gICAgdGhpcy5oYW5kbGVJbnB1dCgpO1xuXG4gICAgZ2wuY2xlYXIoZ2wuQ09MT1JfQlVGRkVSX0JJVCB8IGdsLkRFUFRIX0JVRkZFUl9CSVQpO1xuXG4gICAgZ2wuZW5hYmxlKGdsLkRFUFRIX1RFU1QpO1xuICAgIGdsLmRpc2FibGUoZ2wuQkxFTkQpO1xuICAgIHZhciBtID0gdXRpbHMucXVha2VJZGVudGl0eShtYXQ0LmNyZWF0ZSgpKTtcbiAgICAvL21hdDQudHJhbnNsYXRlKG0sIG0sIFsxMDAsIDEwMCwgLTIwXSk7XG4gICAgbWF0NC5yb3RhdGVaKG0sIG0sIGFuZ2xlKTtcbiAgICBtYXQ0LnRyYW5zbGF0ZShtLCBtLCBwb3NpdGlvbik7XG5cbiAgICBpZiAodGhpcy5tYXApXG4gICAgICAgIHRoaXMubWFwLmRyYXcodGhpcy5wcm9qZWN0aW9uLCBtKTtcblxuXG4gICAgZ2wuZGlzYWJsZShnbC5ERVBUSF9URVNUKTtcbiAgICBnbC5kaXNhYmxlKGdsLkNVTExfRkFDRSk7XG4gICAgZ2wuZW5hYmxlKGdsLkJMRU5EKTtcbiAgICB0aGlzLnN0YXR1c0Jhci5kcmF3KHRoaXMub3J0aG8pO1xuICAgIC8vdGhpcy5jb25zb2xlLmRyYXcodGhpcy5vcnRobyk7XG59O1xuXG5RdWFrZS5wcm90b3R5cGUuaGFuZGxlSW5wdXQgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzcGVlZCA9IDUuMDtcblxuICAgIGlmICh0aGlzLmlucHV0LmxlZnQpXG4gICAgICAgIGFuZ2xlIC09IDAuMDQ7XG4gICAgaWYgKHRoaXMuaW5wdXQucmlnaHQpXG4gICAgICAgIGFuZ2xlICs9IDAuMDQ7XG4gICAgaWYgKHRoaXMuaW5wdXQudXApIHtcbiAgICAgICAgcG9zaXRpb25bMF0gLT0gTWF0aC5jb3MoYW5nbGUpICogc3BlZWQ7XG4gICAgICAgIHBvc2l0aW9uWzFdICs9IE1hdGguc2luKGFuZ2xlKSAqIHNwZWVkO1xuICAgIH1cbiAgICBpZiAodGhpcy5pbnB1dC5kb3duKSB7XG4gICAgICAgIHBvc2l0aW9uWzBdICs9IE1hdGguY29zKGFuZ2xlKSAqIHNwZWVkO1xuICAgICAgICBwb3NpdGlvblsxXSAtPSBNYXRoLnNpbihhbmdsZSkgKiBzcGVlZDtcbiAgICB9XG4gICAgaWYgKHRoaXMuaW5wdXQuZmx5VXApXG4gICAgICAgIHBvc2l0aW9uWzJdIC09IDEwO1xuICAgIGlmICh0aGlzLmlucHV0LmZseURvd24pXG4gICAgICAgIHBvc2l0aW9uWzJdICs9IDEwO1xufTtcblxuUXVha2UucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgUXVha2UuaW5zdGFuY2UgPSB0aGlzO1xuICAgIHdlYmdsLmluaXQoJ2NhbnZhcycpO1xuICAgIHRoaXMub3J0aG8gPSBtYXQ0Lm9ydGhvKG1hdDQuY3JlYXRlKCksIDAsIGdsLndpZHRoLCBnbC5oZWlnaHQsIDAsIC0xMCwgMTApO1xuICAgIHRoaXMucHJvamVjdGlvbiA9IG1hdDQucGVyc3BlY3RpdmUobWF0NC5jcmVhdGUoKSwgNjguMDMsIGdsLndpZHRoIC8gZ2wuaGVpZ2h0LCAwLjEsIDQwOTYpO1xuXG4gICAgYXNzZXRzLmFkZCgnZGF0YS9wYWswLnBhaycpO1xuICAgIGFzc2V0cy5hZGQoJ3NoYWRlcnMvY29sb3IyZC5zaGFkZXInKTtcbiAgICBhc3NldHMuYWRkKCdzaGFkZXJzL3RleHR1cmUyZC5zaGFkZXInKTtcbiAgICBhc3NldHMuYWRkKCdzaGFkZXJzL3dvcmxkLnNoYWRlcicpO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGFzc2V0cy5wcmVjYWNoZShmdW5jdGlvbigpIHtcbiAgICAgICAgc2VsZi5jb25zb2xlID0gbmV3IENvbnNvbGUoKTtcbiAgICAgICAgc2VsZi5zdGF0dXNCYXIgPSBuZXcgU3RhdHVzQmFyKCk7XG4gICAgICAgIHNlbGYuaW5wdXQgPSBuZXcgSW5wdXQoKTtcbiAgICAgICAgc2VsZi5jbGllbnQgPSBuZXcgQ2xpZW50KCk7XG5cbiAgICAgICAgLy92YXIgYnNwID0gYXNzZXRzLmxvYWQoJ3Bhay9tYXBzL3N0YXJ0LmJzcCcpO1xuICAgICAgICAvL3NlbGYubWFwID0gbmV3IE1hcChic3ApO1xuICAgICAgICBzZWxmLmNsaWVudC5wbGF5RGVtbygnZGVtbzEuZGVtJyk7XG4gICAgICAgIHRpY2soKTtcbiAgICB9KTtcbn07XG5cblxuXG5cblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIxWWlaNVNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9mYWtlXzRkNjJmNmE1LmpzXCIsXCIvXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLyohXG4gKiBUaGUgYnVmZmVyIG1vZHVsZSBmcm9tIG5vZGUuanMsIGZvciB0aGUgYnJvd3Nlci5cbiAqXG4gKiBAYXV0aG9yICAgRmVyb3NzIEFib3VraGFkaWplaCA8ZmVyb3NzQGZlcm9zcy5vcmc+IDxodHRwOi8vZmVyb3NzLm9yZz5cbiAqIEBsaWNlbnNlICBNSVRcbiAqL1xuXG52YXIgYmFzZTY0ID0gcmVxdWlyZSgnYmFzZTY0LWpzJylcbnZhciBpZWVlNzU0ID0gcmVxdWlyZSgnaWVlZTc1NCcpXG5cbmV4cG9ydHMuQnVmZmVyID0gQnVmZmVyXG5leHBvcnRzLlNsb3dCdWZmZXIgPSBCdWZmZXJcbmV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVMgPSA1MFxuQnVmZmVyLnBvb2xTaXplID0gODE5MlxuXG4vKipcbiAqIElmIGBCdWZmZXIuX3VzZVR5cGVkQXJyYXlzYDpcbiAqICAgPT09IHRydWUgICAgVXNlIFVpbnQ4QXJyYXkgaW1wbGVtZW50YXRpb24gKGZhc3Rlc3QpXG4gKiAgID09PSBmYWxzZSAgIFVzZSBPYmplY3QgaW1wbGVtZW50YXRpb24gKGNvbXBhdGlibGUgZG93biB0byBJRTYpXG4gKi9cbkJ1ZmZlci5fdXNlVHlwZWRBcnJheXMgPSAoZnVuY3Rpb24gKCkge1xuICAvLyBEZXRlY3QgaWYgYnJvd3NlciBzdXBwb3J0cyBUeXBlZCBBcnJheXMuIFN1cHBvcnRlZCBicm93c2VycyBhcmUgSUUgMTArLCBGaXJlZm94IDQrLFxuICAvLyBDaHJvbWUgNyssIFNhZmFyaSA1LjErLCBPcGVyYSAxMS42KywgaU9TIDQuMisuIElmIHRoZSBicm93c2VyIGRvZXMgbm90IHN1cHBvcnQgYWRkaW5nXG4gIC8vIHByb3BlcnRpZXMgdG8gYFVpbnQ4QXJyYXlgIGluc3RhbmNlcywgdGhlbiB0aGF0J3MgdGhlIHNhbWUgYXMgbm8gYFVpbnQ4QXJyYXlgIHN1cHBvcnRcbiAgLy8gYmVjYXVzZSB3ZSBuZWVkIHRvIGJlIGFibGUgdG8gYWRkIGFsbCB0aGUgbm9kZSBCdWZmZXIgQVBJIG1ldGhvZHMuIFRoaXMgaXMgYW4gaXNzdWVcbiAgLy8gaW4gRmlyZWZveCA0LTI5LiBOb3cgZml4ZWQ6IGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTY5NTQzOFxuICB0cnkge1xuICAgIHZhciBidWYgPSBuZXcgQXJyYXlCdWZmZXIoMClcbiAgICB2YXIgYXJyID0gbmV3IFVpbnQ4QXJyYXkoYnVmKVxuICAgIGFyci5mb28gPSBmdW5jdGlvbiAoKSB7IHJldHVybiA0MiB9XG4gICAgcmV0dXJuIDQyID09PSBhcnIuZm9vKCkgJiZcbiAgICAgICAgdHlwZW9mIGFyci5zdWJhcnJheSA9PT0gJ2Z1bmN0aW9uJyAvLyBDaHJvbWUgOS0xMCBsYWNrIGBzdWJhcnJheWBcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG59KSgpXG5cbi8qKlxuICogQ2xhc3M6IEJ1ZmZlclxuICogPT09PT09PT09PT09PVxuICpcbiAqIFRoZSBCdWZmZXIgY29uc3RydWN0b3IgcmV0dXJucyBpbnN0YW5jZXMgb2YgYFVpbnQ4QXJyYXlgIHRoYXQgYXJlIGF1Z21lbnRlZFxuICogd2l0aCBmdW5jdGlvbiBwcm9wZXJ0aWVzIGZvciBhbGwgdGhlIG5vZGUgYEJ1ZmZlcmAgQVBJIGZ1bmN0aW9ucy4gV2UgdXNlXG4gKiBgVWludDhBcnJheWAgc28gdGhhdCBzcXVhcmUgYnJhY2tldCBub3RhdGlvbiB3b3JrcyBhcyBleHBlY3RlZCAtLSBpdCByZXR1cm5zXG4gKiBhIHNpbmdsZSBvY3RldC5cbiAqXG4gKiBCeSBhdWdtZW50aW5nIHRoZSBpbnN0YW5jZXMsIHdlIGNhbiBhdm9pZCBtb2RpZnlpbmcgdGhlIGBVaW50OEFycmF5YFxuICogcHJvdG90eXBlLlxuICovXG5mdW5jdGlvbiBCdWZmZXIgKHN1YmplY3QsIGVuY29kaW5nLCBub1plcm8pIHtcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIEJ1ZmZlcikpXG4gICAgcmV0dXJuIG5ldyBCdWZmZXIoc3ViamVjdCwgZW5jb2RpbmcsIG5vWmVybylcblxuICB2YXIgdHlwZSA9IHR5cGVvZiBzdWJqZWN0XG5cbiAgLy8gV29ya2Fyb3VuZDogbm9kZSdzIGJhc2U2NCBpbXBsZW1lbnRhdGlvbiBhbGxvd3MgZm9yIG5vbi1wYWRkZWQgc3RyaW5nc1xuICAvLyB3aGlsZSBiYXNlNjQtanMgZG9lcyBub3QuXG4gIGlmIChlbmNvZGluZyA9PT0gJ2Jhc2U2NCcgJiYgdHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICBzdWJqZWN0ID0gc3RyaW5ndHJpbShzdWJqZWN0KVxuICAgIHdoaWxlIChzdWJqZWN0Lmxlbmd0aCAlIDQgIT09IDApIHtcbiAgICAgIHN1YmplY3QgPSBzdWJqZWN0ICsgJz0nXG4gICAgfVxuICB9XG5cbiAgLy8gRmluZCB0aGUgbGVuZ3RoXG4gIHZhciBsZW5ndGhcbiAgaWYgKHR5cGUgPT09ICdudW1iZXInKVxuICAgIGxlbmd0aCA9IGNvZXJjZShzdWJqZWN0KVxuICBlbHNlIGlmICh0eXBlID09PSAnc3RyaW5nJylcbiAgICBsZW5ndGggPSBCdWZmZXIuYnl0ZUxlbmd0aChzdWJqZWN0LCBlbmNvZGluZylcbiAgZWxzZSBpZiAodHlwZSA9PT0gJ29iamVjdCcpXG4gICAgbGVuZ3RoID0gY29lcmNlKHN1YmplY3QubGVuZ3RoKSAvLyBhc3N1bWUgdGhhdCBvYmplY3QgaXMgYXJyYXktbGlrZVxuICBlbHNlXG4gICAgdGhyb3cgbmV3IEVycm9yKCdGaXJzdCBhcmd1bWVudCBuZWVkcyB0byBiZSBhIG51bWJlciwgYXJyYXkgb3Igc3RyaW5nLicpXG5cbiAgdmFyIGJ1ZlxuICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgIC8vIFByZWZlcnJlZDogUmV0dXJuIGFuIGF1Z21lbnRlZCBgVWludDhBcnJheWAgaW5zdGFuY2UgZm9yIGJlc3QgcGVyZm9ybWFuY2VcbiAgICBidWYgPSBCdWZmZXIuX2F1Z21lbnQobmV3IFVpbnQ4QXJyYXkobGVuZ3RoKSlcbiAgfSBlbHNlIHtcbiAgICAvLyBGYWxsYmFjazogUmV0dXJuIFRISVMgaW5zdGFuY2Ugb2YgQnVmZmVyIChjcmVhdGVkIGJ5IGBuZXdgKVxuICAgIGJ1ZiA9IHRoaXNcbiAgICBidWYubGVuZ3RoID0gbGVuZ3RoXG4gICAgYnVmLl9pc0J1ZmZlciA9IHRydWVcbiAgfVxuXG4gIHZhciBpXG4gIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzICYmIHR5cGVvZiBzdWJqZWN0LmJ5dGVMZW5ndGggPT09ICdudW1iZXInKSB7XG4gICAgLy8gU3BlZWQgb3B0aW1pemF0aW9uIC0tIHVzZSBzZXQgaWYgd2UncmUgY29weWluZyBmcm9tIGEgdHlwZWQgYXJyYXlcbiAgICBidWYuX3NldChzdWJqZWN0KVxuICB9IGVsc2UgaWYgKGlzQXJyYXlpc2goc3ViamVjdCkpIHtcbiAgICAvLyBUcmVhdCBhcnJheS1pc2ggb2JqZWN0cyBhcyBhIGJ5dGUgYXJyYXlcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChCdWZmZXIuaXNCdWZmZXIoc3ViamVjdCkpXG4gICAgICAgIGJ1ZltpXSA9IHN1YmplY3QucmVhZFVJbnQ4KGkpXG4gICAgICBlbHNlXG4gICAgICAgIGJ1ZltpXSA9IHN1YmplY3RbaV1cbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICBidWYud3JpdGUoc3ViamVjdCwgMCwgZW5jb2RpbmcpXG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ251bWJlcicgJiYgIUJ1ZmZlci5fdXNlVHlwZWRBcnJheXMgJiYgIW5vWmVybykge1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgYnVmW2ldID0gMFxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBidWZcbn1cblxuLy8gU1RBVElDIE1FVEhPRFNcbi8vID09PT09PT09PT09PT09XG5cbkJ1ZmZlci5pc0VuY29kaW5nID0gZnVuY3Rpb24gKGVuY29kaW5nKSB7XG4gIHN3aXRjaCAoU3RyaW5nKGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgY2FzZSAnYXNjaWknOlxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICBjYXNlICdyYXcnOlxuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5CdWZmZXIuaXNCdWZmZXIgPSBmdW5jdGlvbiAoYikge1xuICByZXR1cm4gISEoYiAhPT0gbnVsbCAmJiBiICE9PSB1bmRlZmluZWQgJiYgYi5faXNCdWZmZXIpXG59XG5cbkJ1ZmZlci5ieXRlTGVuZ3RoID0gZnVuY3Rpb24gKHN0ciwgZW5jb2RpbmcpIHtcbiAgdmFyIHJldFxuICBzdHIgPSBzdHIgKyAnJ1xuICBzd2l0Y2ggKGVuY29kaW5nIHx8ICd1dGY4Jykge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoIC8gMlxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgICByZXQgPSB1dGY4VG9CeXRlcyhzdHIpLmxlbmd0aFxuICAgICAgYnJlYWtcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICBjYXNlICdyYXcnOlxuICAgICAgcmV0ID0gc3RyLmxlbmd0aFxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgcmV0ID0gYmFzZTY0VG9CeXRlcyhzdHIpLmxlbmd0aFxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0ID0gc3RyLmxlbmd0aCAqIDJcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZycpXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5CdWZmZXIuY29uY2F0ID0gZnVuY3Rpb24gKGxpc3QsIHRvdGFsTGVuZ3RoKSB7XG4gIGFzc2VydChpc0FycmF5KGxpc3QpLCAnVXNhZ2U6IEJ1ZmZlci5jb25jYXQobGlzdCwgW3RvdGFsTGVuZ3RoXSlcXG4nICtcbiAgICAgICdsaXN0IHNob3VsZCBiZSBhbiBBcnJheS4nKVxuXG4gIGlmIChsaXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBuZXcgQnVmZmVyKDApXG4gIH0gZWxzZSBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICByZXR1cm4gbGlzdFswXVxuICB9XG5cbiAgdmFyIGlcbiAgaWYgKHR5cGVvZiB0b3RhbExlbmd0aCAhPT0gJ251bWJlcicpIHtcbiAgICB0b3RhbExlbmd0aCA9IDBcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgdG90YWxMZW5ndGggKz0gbGlzdFtpXS5sZW5ndGhcbiAgICB9XG4gIH1cblxuICB2YXIgYnVmID0gbmV3IEJ1ZmZlcih0b3RhbExlbmd0aClcbiAgdmFyIHBvcyA9IDBcbiAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaXRlbSA9IGxpc3RbaV1cbiAgICBpdGVtLmNvcHkoYnVmLCBwb3MpXG4gICAgcG9zICs9IGl0ZW0ubGVuZ3RoXG4gIH1cbiAgcmV0dXJuIGJ1ZlxufVxuXG4vLyBCVUZGRVIgSU5TVEFOQ0UgTUVUSE9EU1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT1cblxuZnVuY3Rpb24gX2hleFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgb2Zmc2V0ID0gTnVtYmVyKG9mZnNldCkgfHwgMFxuICB2YXIgcmVtYWluaW5nID0gYnVmLmxlbmd0aCAtIG9mZnNldFxuICBpZiAoIWxlbmd0aCkge1xuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICB9IGVsc2Uge1xuICAgIGxlbmd0aCA9IE51bWJlcihsZW5ndGgpXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xuICAgICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gICAgfVxuICB9XG5cbiAgLy8gbXVzdCBiZSBhbiBldmVuIG51bWJlciBvZiBkaWdpdHNcbiAgdmFyIHN0ckxlbiA9IHN0cmluZy5sZW5ndGhcbiAgYXNzZXJ0KHN0ckxlbiAlIDIgPT09IDAsICdJbnZhbGlkIGhleCBzdHJpbmcnKVxuXG4gIGlmIChsZW5ndGggPiBzdHJMZW4gLyAyKSB7XG4gICAgbGVuZ3RoID0gc3RyTGVuIC8gMlxuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgYnl0ZSA9IHBhcnNlSW50KHN0cmluZy5zdWJzdHIoaSAqIDIsIDIpLCAxNilcbiAgICBhc3NlcnQoIWlzTmFOKGJ5dGUpLCAnSW52YWxpZCBoZXggc3RyaW5nJylcbiAgICBidWZbb2Zmc2V0ICsgaV0gPSBieXRlXG4gIH1cbiAgQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPSBpICogMlxuICByZXR1cm4gaVxufVxuXG5mdW5jdGlvbiBfdXRmOFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cbiAgICBibGl0QnVmZmVyKHV0ZjhUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuZnVuY3Rpb24gX2FzY2lpV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIoYXNjaWlUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuZnVuY3Rpb24gX2JpbmFyeVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIF9hc2NpaVdyaXRlKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gX2Jhc2U2NFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cbiAgICBibGl0QnVmZmVyKGJhc2U2NFRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5mdW5jdGlvbiBfdXRmMTZsZVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cbiAgICBibGl0QnVmZmVyKHV0ZjE2bGVUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uIChzdHJpbmcsIG9mZnNldCwgbGVuZ3RoLCBlbmNvZGluZykge1xuICAvLyBTdXBwb3J0IGJvdGggKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgsIGVuY29kaW5nKVxuICAvLyBhbmQgdGhlIGxlZ2FjeSAoc3RyaW5nLCBlbmNvZGluZywgb2Zmc2V0LCBsZW5ndGgpXG4gIGlmIChpc0Zpbml0ZShvZmZzZXQpKSB7XG4gICAgaWYgKCFpc0Zpbml0ZShsZW5ndGgpKSB7XG4gICAgICBlbmNvZGluZyA9IGxlbmd0aFxuICAgICAgbGVuZ3RoID0gdW5kZWZpbmVkXG4gICAgfVxuICB9IGVsc2UgeyAgLy8gbGVnYWN5XG4gICAgdmFyIHN3YXAgPSBlbmNvZGluZ1xuICAgIGVuY29kaW5nID0gb2Zmc2V0XG4gICAgb2Zmc2V0ID0gbGVuZ3RoXG4gICAgbGVuZ3RoID0gc3dhcFxuICB9XG5cbiAgb2Zmc2V0ID0gTnVtYmVyKG9mZnNldCkgfHwgMFxuICB2YXIgcmVtYWluaW5nID0gdGhpcy5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKCFsZW5ndGgpIHtcbiAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgfSBlbHNlIHtcbiAgICBsZW5ndGggPSBOdW1iZXIobGVuZ3RoKVxuICAgIGlmIChsZW5ndGggPiByZW1haW5pbmcpIHtcbiAgICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICAgIH1cbiAgfVxuICBlbmNvZGluZyA9IFN0cmluZyhlbmNvZGluZyB8fCAndXRmOCcpLnRvTG93ZXJDYXNlKClcblxuICB2YXIgcmV0XG4gIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgICAgcmV0ID0gX2hleFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIHJldCA9IF91dGY4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYXNjaWknOlxuICAgICAgcmV0ID0gX2FzY2lpV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgIHJldCA9IF9iaW5hcnlXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgcmV0ID0gX2Jhc2U2NFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXQgPSBfdXRmMTZsZVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZW5jb2RpbmcnKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIChlbmNvZGluZywgc3RhcnQsIGVuZCkge1xuICB2YXIgc2VsZiA9IHRoaXNcblxuICBlbmNvZGluZyA9IFN0cmluZyhlbmNvZGluZyB8fCAndXRmOCcpLnRvTG93ZXJDYXNlKClcbiAgc3RhcnQgPSBOdW1iZXIoc3RhcnQpIHx8IDBcbiAgZW5kID0gKGVuZCAhPT0gdW5kZWZpbmVkKVxuICAgID8gTnVtYmVyKGVuZClcbiAgICA6IGVuZCA9IHNlbGYubGVuZ3RoXG5cbiAgLy8gRmFzdHBhdGggZW1wdHkgc3RyaW5nc1xuICBpZiAoZW5kID09PSBzdGFydClcbiAgICByZXR1cm4gJydcblxuICB2YXIgcmV0XG4gIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgICAgcmV0ID0gX2hleFNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIHJldCA9IF91dGY4U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYXNjaWknOlxuICAgICAgcmV0ID0gX2FzY2lpU2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgIHJldCA9IF9iaW5hcnlTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgcmV0ID0gX2Jhc2U2NFNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXQgPSBfdXRmMTZsZVNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZW5jb2RpbmcnKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ0J1ZmZlcicsXG4gICAgZGF0YTogQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwodGhpcy5fYXJyIHx8IHRoaXMsIDApXG4gIH1cbn1cblxuLy8gY29weSh0YXJnZXRCdWZmZXIsIHRhcmdldFN0YXJ0PTAsIHNvdXJjZVN0YXJ0PTAsIHNvdXJjZUVuZD1idWZmZXIubGVuZ3RoKVxuQnVmZmVyLnByb3RvdHlwZS5jb3B5ID0gZnVuY3Rpb24gKHRhcmdldCwgdGFyZ2V0X3N0YXJ0LCBzdGFydCwgZW5kKSB7XG4gIHZhciBzb3VyY2UgPSB0aGlzXG5cbiAgaWYgKCFzdGFydCkgc3RhcnQgPSAwXG4gIGlmICghZW5kICYmIGVuZCAhPT0gMCkgZW5kID0gdGhpcy5sZW5ndGhcbiAgaWYgKCF0YXJnZXRfc3RhcnQpIHRhcmdldF9zdGFydCA9IDBcblxuICAvLyBDb3B5IDAgYnl0ZXM7IHdlJ3JlIGRvbmVcbiAgaWYgKGVuZCA9PT0gc3RhcnQpIHJldHVyblxuICBpZiAodGFyZ2V0Lmxlbmd0aCA9PT0gMCB8fCBzb3VyY2UubGVuZ3RoID09PSAwKSByZXR1cm5cblxuICAvLyBGYXRhbCBlcnJvciBjb25kaXRpb25zXG4gIGFzc2VydChlbmQgPj0gc3RhcnQsICdzb3VyY2VFbmQgPCBzb3VyY2VTdGFydCcpXG4gIGFzc2VydCh0YXJnZXRfc3RhcnQgPj0gMCAmJiB0YXJnZXRfc3RhcnQgPCB0YXJnZXQubGVuZ3RoLFxuICAgICAgJ3RhcmdldFN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBhc3NlcnQoc3RhcnQgPj0gMCAmJiBzdGFydCA8IHNvdXJjZS5sZW5ndGgsICdzb3VyY2VTdGFydCBvdXQgb2YgYm91bmRzJylcbiAgYXNzZXJ0KGVuZCA+PSAwICYmIGVuZCA8PSBzb3VyY2UubGVuZ3RoLCAnc291cmNlRW5kIG91dCBvZiBib3VuZHMnKVxuXG4gIC8vIEFyZSB3ZSBvb2I/XG4gIGlmIChlbmQgPiB0aGlzLmxlbmd0aClcbiAgICBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAodGFyZ2V0Lmxlbmd0aCAtIHRhcmdldF9zdGFydCA8IGVuZCAtIHN0YXJ0KVxuICAgIGVuZCA9IHRhcmdldC5sZW5ndGggLSB0YXJnZXRfc3RhcnQgKyBzdGFydFxuXG4gIHZhciBsZW4gPSBlbmQgLSBzdGFydFxuXG4gIGlmIChsZW4gPCAxMDAgfHwgIUJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKVxuICAgICAgdGFyZ2V0W2kgKyB0YXJnZXRfc3RhcnRdID0gdGhpc1tpICsgc3RhcnRdXG4gIH0gZWxzZSB7XG4gICAgdGFyZ2V0Ll9zZXQodGhpcy5zdWJhcnJheShzdGFydCwgc3RhcnQgKyBsZW4pLCB0YXJnZXRfc3RhcnQpXG4gIH1cbn1cblxuZnVuY3Rpb24gX2Jhc2U2NFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgaWYgKHN0YXJ0ID09PSAwICYmIGVuZCA9PT0gYnVmLmxlbmd0aCkge1xuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYpXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1Zi5zbGljZShzdGFydCwgZW5kKSlcbiAgfVxufVxuXG5mdW5jdGlvbiBfdXRmOFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHJlcyA9ICcnXG4gIHZhciB0bXAgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICBpZiAoYnVmW2ldIDw9IDB4N0YpIHtcbiAgICAgIHJlcyArPSBkZWNvZGVVdGY4Q2hhcih0bXApICsgU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0pXG4gICAgICB0bXAgPSAnJ1xuICAgIH0gZWxzZSB7XG4gICAgICB0bXAgKz0gJyUnICsgYnVmW2ldLnRvU3RyaW5nKDE2KVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXMgKyBkZWNvZGVVdGY4Q2hhcih0bXApXG59XG5cbmZ1bmN0aW9uIF9hc2NpaVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHJldCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKylcbiAgICByZXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0pXG4gIHJldHVybiByZXRcbn1cblxuZnVuY3Rpb24gX2JpbmFyeVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgcmV0dXJuIF9hc2NpaVNsaWNlKGJ1Ziwgc3RhcnQsIGVuZClcbn1cblxuZnVuY3Rpb24gX2hleFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcblxuICBpZiAoIXN0YXJ0IHx8IHN0YXJ0IDwgMCkgc3RhcnQgPSAwXG4gIGlmICghZW5kIHx8IGVuZCA8IDAgfHwgZW5kID4gbGVuKSBlbmQgPSBsZW5cblxuICB2YXIgb3V0ID0gJydcbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICBvdXQgKz0gdG9IZXgoYnVmW2ldKVxuICB9XG4gIHJldHVybiBvdXRcbn1cblxuZnVuY3Rpb24gX3V0ZjE2bGVTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciBieXRlcyA9IGJ1Zi5zbGljZShzdGFydCwgZW5kKVxuICB2YXIgcmVzID0gJydcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkgKz0gMikge1xuICAgIHJlcyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGVzW2ldICsgYnl0ZXNbaSsxXSAqIDI1NilcbiAgfVxuICByZXR1cm4gcmVzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc2xpY2UgPSBmdW5jdGlvbiAoc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgc3RhcnQgPSBjbGFtcChzdGFydCwgbGVuLCAwKVxuICBlbmQgPSBjbGFtcChlbmQsIGxlbiwgbGVuKVxuXG4gIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XG4gICAgcmV0dXJuIEJ1ZmZlci5fYXVnbWVudCh0aGlzLnN1YmFycmF5KHN0YXJ0LCBlbmQpKVxuICB9IGVsc2Uge1xuICAgIHZhciBzbGljZUxlbiA9IGVuZCAtIHN0YXJ0XG4gICAgdmFyIG5ld0J1ZiA9IG5ldyBCdWZmZXIoc2xpY2VMZW4sIHVuZGVmaW5lZCwgdHJ1ZSlcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNsaWNlTGVuOyBpKyspIHtcbiAgICAgIG5ld0J1ZltpXSA9IHRoaXNbaSArIHN0YXJ0XVxuICAgIH1cbiAgICByZXR1cm4gbmV3QnVmXG4gIH1cbn1cblxuLy8gYGdldGAgd2lsbCBiZSByZW1vdmVkIGluIE5vZGUgMC4xMytcbkJ1ZmZlci5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKG9mZnNldCkge1xuICBjb25zb2xlLmxvZygnLmdldCgpIGlzIGRlcHJlY2F0ZWQuIEFjY2VzcyB1c2luZyBhcnJheSBpbmRleGVzIGluc3RlYWQuJylcbiAgcmV0dXJuIHRoaXMucmVhZFVJbnQ4KG9mZnNldClcbn1cblxuLy8gYHNldGAgd2lsbCBiZSByZW1vdmVkIGluIE5vZGUgMC4xMytcbkJ1ZmZlci5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKHYsIG9mZnNldCkge1xuICBjb25zb2xlLmxvZygnLnNldCgpIGlzIGRlcHJlY2F0ZWQuIEFjY2VzcyB1c2luZyBhcnJheSBpbmRleGVzIGluc3RlYWQuJylcbiAgcmV0dXJuIHRoaXMud3JpdGVVSW50OCh2LCBvZmZzZXQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQ4ID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aClcbiAgICByZXR1cm5cblxuICByZXR1cm4gdGhpc1tvZmZzZXRdXG59XG5cbmZ1bmN0aW9uIF9yZWFkVUludDE2IChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbFxuICBpZiAobGl0dGxlRW5kaWFuKSB7XG4gICAgdmFsID0gYnVmW29mZnNldF1cbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMV0gPDwgOFxuICB9IGVsc2Uge1xuICAgIHZhbCA9IGJ1ZltvZmZzZXRdIDw8IDhcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMV1cbiAgfVxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkVUludDE2KHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkVUludDE2KHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZFVJbnQzMiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIHZhciB2YWxcbiAgaWYgKGxpdHRsZUVuZGlhbikge1xuICAgIGlmIChvZmZzZXQgKyAyIDwgbGVuKVxuICAgICAgdmFsID0gYnVmW29mZnNldCArIDJdIDw8IDE2XG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDFdIDw8IDhcbiAgICB2YWwgfD0gYnVmW29mZnNldF1cbiAgICBpZiAob2Zmc2V0ICsgMyA8IGxlbilcbiAgICAgIHZhbCA9IHZhbCArIChidWZbb2Zmc2V0ICsgM10gPDwgMjQgPj4+IDApXG4gIH0gZWxzZSB7XG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXG4gICAgICB2YWwgPSBidWZbb2Zmc2V0ICsgMV0gPDwgMTZcbiAgICBpZiAob2Zmc2V0ICsgMiA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMl0gPDwgOFxuICAgIGlmIChvZmZzZXQgKyAzIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAzXVxuICAgIHZhbCA9IHZhbCArIChidWZbb2Zmc2V0XSA8PCAyNCA+Pj4gMClcbiAgfVxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkVUludDMyKHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkVUludDMyKHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQ4ID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsXG4gICAgICAgICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aClcbiAgICByZXR1cm5cblxuICB2YXIgbmVnID0gdGhpc1tvZmZzZXRdICYgMHg4MFxuICBpZiAobmVnKVxuICAgIHJldHVybiAoMHhmZiAtIHRoaXNbb2Zmc2V0XSArIDEpICogLTFcbiAgZWxzZVxuICAgIHJldHVybiB0aGlzW29mZnNldF1cbn1cblxuZnVuY3Rpb24gX3JlYWRJbnQxNiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIHZhciB2YWwgPSBfcmVhZFVJbnQxNihidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCB0cnVlKVxuICB2YXIgbmVnID0gdmFsICYgMHg4MDAwXG4gIGlmIChuZWcpXG4gICAgcmV0dXJuICgweGZmZmYgLSB2YWwgKyAxKSAqIC0xXG4gIGVsc2VcbiAgICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2TEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRJbnQxNih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkSW50MTYodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF9yZWFkSW50MzIgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsID0gX3JlYWRVSW50MzIoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgdHJ1ZSlcbiAgdmFyIG5lZyA9IHZhbCAmIDB4ODAwMDAwMDBcbiAgaWYgKG5lZylcbiAgICByZXR1cm4gKDB4ZmZmZmZmZmYgLSB2YWwgKyAxKSAqIC0xXG4gIGVsc2VcbiAgICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyTEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRJbnQzMih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkSW50MzIodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF9yZWFkRmxvYXQgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgcmV0dXJuIGllZWU3NTQucmVhZChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCAyMywgNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEZsb2F0KHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEZsb2F0QkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRGbG9hdCh0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWREb3VibGUgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCArIDcgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgcmV0dXJuIGllZWU3NTQucmVhZChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCA1MiwgOClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlTEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWREb3VibGUodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWREb3VibGUodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50OCA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ3RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZ1aW50KHZhbHVlLCAweGZmKVxuICB9XG5cbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aCkgcmV0dXJuXG5cbiAgdGhpc1tvZmZzZXRdID0gdmFsdWVcbn1cblxuZnVuY3Rpb24gX3dyaXRlVUludDE2IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAndHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnVpbnQodmFsdWUsIDB4ZmZmZilcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGZvciAodmFyIGkgPSAwLCBqID0gTWF0aC5taW4obGVuIC0gb2Zmc2V0LCAyKTsgaSA8IGo7IGkrKykge1xuICAgIGJ1ZltvZmZzZXQgKyBpXSA9XG4gICAgICAgICh2YWx1ZSAmICgweGZmIDw8ICg4ICogKGxpdHRsZUVuZGlhbiA/IGkgOiAxIC0gaSkpKSkgPj4+XG4gICAgICAgICAgICAobGl0dGxlRW5kaWFuID8gaSA6IDEgLSBpKSAqIDhcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2TEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2QkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlVUludDMyIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAndHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnVpbnQodmFsdWUsIDB4ZmZmZmZmZmYpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBmb3IgKHZhciBpID0gMCwgaiA9IE1hdGgubWluKGxlbiAtIG9mZnNldCwgNCk7IGkgPCBqOyBpKyspIHtcbiAgICBidWZbb2Zmc2V0ICsgaV0gPVxuICAgICAgICAodmFsdWUgPj4+IChsaXR0bGVFbmRpYW4gPyBpIDogMyAtIGkpICogOCkgJiAweGZmXG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQ4ID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnNpbnQodmFsdWUsIDB4N2YsIC0weDgwKVxuICB9XG5cbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aClcbiAgICByZXR1cm5cblxuICBpZiAodmFsdWUgPj0gMClcbiAgICB0aGlzLndyaXRlVUludDgodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpXG4gIGVsc2VcbiAgICB0aGlzLndyaXRlVUludDgoMHhmZiArIHZhbHVlICsgMSwgb2Zmc2V0LCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlSW50MTYgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmc2ludCh2YWx1ZSwgMHg3ZmZmLCAtMHg4MDAwKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgaWYgKHZhbHVlID49IDApXG4gICAgX3dyaXRlVUludDE2KGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbiAgZWxzZVxuICAgIF93cml0ZVVJbnQxNihidWYsIDB4ZmZmZiArIHZhbHVlICsgMSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2QkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVJbnQzMiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZzaW50KHZhbHVlLCAweDdmZmZmZmZmLCAtMHg4MDAwMDAwMClcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGlmICh2YWx1ZSA+PSAwKVxuICAgIF93cml0ZVVJbnQzMihidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXG4gIGVsc2VcbiAgICBfd3JpdGVVSW50MzIoYnVmLCAweGZmZmZmZmZmICsgdmFsdWUgKyAxLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZUZsb2F0IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZklFRUU3NTQodmFsdWUsIDMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgsIC0zLjQwMjgyMzQ2NjM4NTI4ODZlKzM4KVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgMjMsIDQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdExFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZURvdWJsZSAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyA3IDwgYnVmLmxlbmd0aCxcbiAgICAgICAgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZJRUVFNzU0KHZhbHVlLCAxLjc5NzY5MzEzNDg2MjMxNTdFKzMwOCwgLTEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4KVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgNTIsIDgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG4vLyBmaWxsKHZhbHVlLCBzdGFydD0wLCBlbmQ9YnVmZmVyLmxlbmd0aClcbkJ1ZmZlci5wcm90b3R5cGUuZmlsbCA9IGZ1bmN0aW9uICh2YWx1ZSwgc3RhcnQsIGVuZCkge1xuICBpZiAoIXZhbHVlKSB2YWx1ZSA9IDBcbiAgaWYgKCFzdGFydCkgc3RhcnQgPSAwXG4gIGlmICghZW5kKSBlbmQgPSB0aGlzLmxlbmd0aFxuXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgdmFsdWUgPSB2YWx1ZS5jaGFyQ29kZUF0KDApXG4gIH1cblxuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJiAhaXNOYU4odmFsdWUpLCAndmFsdWUgaXMgbm90IGEgbnVtYmVyJylcbiAgYXNzZXJ0KGVuZCA+PSBzdGFydCwgJ2VuZCA8IHN0YXJ0JylcblxuICAvLyBGaWxsIDAgYnl0ZXM7IHdlJ3JlIGRvbmVcbiAgaWYgKGVuZCA9PT0gc3RhcnQpIHJldHVyblxuICBpZiAodGhpcy5sZW5ndGggPT09IDApIHJldHVyblxuXG4gIGFzc2VydChzdGFydCA+PSAwICYmIHN0YXJ0IDwgdGhpcy5sZW5ndGgsICdzdGFydCBvdXQgb2YgYm91bmRzJylcbiAgYXNzZXJ0KGVuZCA+PSAwICYmIGVuZCA8PSB0aGlzLmxlbmd0aCwgJ2VuZCBvdXQgb2YgYm91bmRzJylcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIHRoaXNbaV0gPSB2YWx1ZVxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuaW5zcGVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG91dCA9IFtdXG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgb3V0W2ldID0gdG9IZXgodGhpc1tpXSlcbiAgICBpZiAoaSA9PT0gZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFUykge1xuICAgICAgb3V0W2kgKyAxXSA9ICcuLi4nXG4gICAgICBicmVha1xuICAgIH1cbiAgfVxuICByZXR1cm4gJzxCdWZmZXIgJyArIG91dC5qb2luKCcgJykgKyAnPidcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGBBcnJheUJ1ZmZlcmAgd2l0aCB0aGUgKmNvcGllZCogbWVtb3J5IG9mIHRoZSBidWZmZXIgaW5zdGFuY2UuXG4gKiBBZGRlZCBpbiBOb2RlIDAuMTIuIE9ubHkgYXZhaWxhYmxlIGluIGJyb3dzZXJzIHRoYXQgc3VwcG9ydCBBcnJheUJ1ZmZlci5cbiAqL1xuQnVmZmVyLnByb3RvdHlwZS50b0FycmF5QnVmZmVyID0gZnVuY3Rpb24gKCkge1xuICBpZiAodHlwZW9mIFVpbnQ4QXJyYXkgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcbiAgICAgIHJldHVybiAobmV3IEJ1ZmZlcih0aGlzKSkuYnVmZmVyXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBidWYgPSBuZXcgVWludDhBcnJheSh0aGlzLmxlbmd0aClcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBidWYubGVuZ3RoOyBpIDwgbGVuOyBpICs9IDEpXG4gICAgICAgIGJ1ZltpXSA9IHRoaXNbaV1cbiAgICAgIHJldHVybiBidWYuYnVmZmVyXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcignQnVmZmVyLnRvQXJyYXlCdWZmZXIgbm90IHN1cHBvcnRlZCBpbiB0aGlzIGJyb3dzZXInKVxuICB9XG59XG5cbi8vIEhFTFBFUiBGVU5DVElPTlNcbi8vID09PT09PT09PT09PT09PT1cblxuZnVuY3Rpb24gc3RyaW5ndHJpbSAoc3RyKSB7XG4gIGlmIChzdHIudHJpbSkgcmV0dXJuIHN0ci50cmltKClcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJylcbn1cblxudmFyIEJQID0gQnVmZmVyLnByb3RvdHlwZVxuXG4vKipcbiAqIEF1Z21lbnQgYSBVaW50OEFycmF5ICppbnN0YW5jZSogKG5vdCB0aGUgVWludDhBcnJheSBjbGFzcyEpIHdpdGggQnVmZmVyIG1ldGhvZHNcbiAqL1xuQnVmZmVyLl9hdWdtZW50ID0gZnVuY3Rpb24gKGFycikge1xuICBhcnIuX2lzQnVmZmVyID0gdHJ1ZVxuXG4gIC8vIHNhdmUgcmVmZXJlbmNlIHRvIG9yaWdpbmFsIFVpbnQ4QXJyYXkgZ2V0L3NldCBtZXRob2RzIGJlZm9yZSBvdmVyd3JpdGluZ1xuICBhcnIuX2dldCA9IGFyci5nZXRcbiAgYXJyLl9zZXQgPSBhcnIuc2V0XG5cbiAgLy8gZGVwcmVjYXRlZCwgd2lsbCBiZSByZW1vdmVkIGluIG5vZGUgMC4xMytcbiAgYXJyLmdldCA9IEJQLmdldFxuICBhcnIuc2V0ID0gQlAuc2V0XG5cbiAgYXJyLndyaXRlID0gQlAud3JpdGVcbiAgYXJyLnRvU3RyaW5nID0gQlAudG9TdHJpbmdcbiAgYXJyLnRvTG9jYWxlU3RyaW5nID0gQlAudG9TdHJpbmdcbiAgYXJyLnRvSlNPTiA9IEJQLnRvSlNPTlxuICBhcnIuY29weSA9IEJQLmNvcHlcbiAgYXJyLnNsaWNlID0gQlAuc2xpY2VcbiAgYXJyLnJlYWRVSW50OCA9IEJQLnJlYWRVSW50OFxuICBhcnIucmVhZFVJbnQxNkxFID0gQlAucmVhZFVJbnQxNkxFXG4gIGFyci5yZWFkVUludDE2QkUgPSBCUC5yZWFkVUludDE2QkVcbiAgYXJyLnJlYWRVSW50MzJMRSA9IEJQLnJlYWRVSW50MzJMRVxuICBhcnIucmVhZFVJbnQzMkJFID0gQlAucmVhZFVJbnQzMkJFXG4gIGFyci5yZWFkSW50OCA9IEJQLnJlYWRJbnQ4XG4gIGFyci5yZWFkSW50MTZMRSA9IEJQLnJlYWRJbnQxNkxFXG4gIGFyci5yZWFkSW50MTZCRSA9IEJQLnJlYWRJbnQxNkJFXG4gIGFyci5yZWFkSW50MzJMRSA9IEJQLnJlYWRJbnQzMkxFXG4gIGFyci5yZWFkSW50MzJCRSA9IEJQLnJlYWRJbnQzMkJFXG4gIGFyci5yZWFkRmxvYXRMRSA9IEJQLnJlYWRGbG9hdExFXG4gIGFyci5yZWFkRmxvYXRCRSA9IEJQLnJlYWRGbG9hdEJFXG4gIGFyci5yZWFkRG91YmxlTEUgPSBCUC5yZWFkRG91YmxlTEVcbiAgYXJyLnJlYWREb3VibGVCRSA9IEJQLnJlYWREb3VibGVCRVxuICBhcnIud3JpdGVVSW50OCA9IEJQLndyaXRlVUludDhcbiAgYXJyLndyaXRlVUludDE2TEUgPSBCUC53cml0ZVVJbnQxNkxFXG4gIGFyci53cml0ZVVJbnQxNkJFID0gQlAud3JpdGVVSW50MTZCRVxuICBhcnIud3JpdGVVSW50MzJMRSA9IEJQLndyaXRlVUludDMyTEVcbiAgYXJyLndyaXRlVUludDMyQkUgPSBCUC53cml0ZVVJbnQzMkJFXG4gIGFyci53cml0ZUludDggPSBCUC53cml0ZUludDhcbiAgYXJyLndyaXRlSW50MTZMRSA9IEJQLndyaXRlSW50MTZMRVxuICBhcnIud3JpdGVJbnQxNkJFID0gQlAud3JpdGVJbnQxNkJFXG4gIGFyci53cml0ZUludDMyTEUgPSBCUC53cml0ZUludDMyTEVcbiAgYXJyLndyaXRlSW50MzJCRSA9IEJQLndyaXRlSW50MzJCRVxuICBhcnIud3JpdGVGbG9hdExFID0gQlAud3JpdGVGbG9hdExFXG4gIGFyci53cml0ZUZsb2F0QkUgPSBCUC53cml0ZUZsb2F0QkVcbiAgYXJyLndyaXRlRG91YmxlTEUgPSBCUC53cml0ZURvdWJsZUxFXG4gIGFyci53cml0ZURvdWJsZUJFID0gQlAud3JpdGVEb3VibGVCRVxuICBhcnIuZmlsbCA9IEJQLmZpbGxcbiAgYXJyLmluc3BlY3QgPSBCUC5pbnNwZWN0XG4gIGFyci50b0FycmF5QnVmZmVyID0gQlAudG9BcnJheUJ1ZmZlclxuXG4gIHJldHVybiBhcnJcbn1cblxuLy8gc2xpY2Uoc3RhcnQsIGVuZClcbmZ1bmN0aW9uIGNsYW1wIChpbmRleCwgbGVuLCBkZWZhdWx0VmFsdWUpIHtcbiAgaWYgKHR5cGVvZiBpbmRleCAhPT0gJ251bWJlcicpIHJldHVybiBkZWZhdWx0VmFsdWVcbiAgaW5kZXggPSB+fmluZGV4OyAgLy8gQ29lcmNlIHRvIGludGVnZXIuXG4gIGlmIChpbmRleCA+PSBsZW4pIHJldHVybiBsZW5cbiAgaWYgKGluZGV4ID49IDApIHJldHVybiBpbmRleFxuICBpbmRleCArPSBsZW5cbiAgaWYgKGluZGV4ID49IDApIHJldHVybiBpbmRleFxuICByZXR1cm4gMFxufVxuXG5mdW5jdGlvbiBjb2VyY2UgKGxlbmd0aCkge1xuICAvLyBDb2VyY2UgbGVuZ3RoIHRvIGEgbnVtYmVyIChwb3NzaWJseSBOYU4pLCByb3VuZCB1cFxuICAvLyBpbiBjYXNlIGl0J3MgZnJhY3Rpb25hbCAoZS5nLiAxMjMuNDU2KSB0aGVuIGRvIGFcbiAgLy8gZG91YmxlIG5lZ2F0ZSB0byBjb2VyY2UgYSBOYU4gdG8gMC4gRWFzeSwgcmlnaHQ/XG4gIGxlbmd0aCA9IH5+TWF0aC5jZWlsKCtsZW5ndGgpXG4gIHJldHVybiBsZW5ndGggPCAwID8gMCA6IGxlbmd0aFxufVxuXG5mdW5jdGlvbiBpc0FycmF5IChzdWJqZWN0KSB7XG4gIHJldHVybiAoQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAoc3ViamVjdCkge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoc3ViamVjdCkgPT09ICdbb2JqZWN0IEFycmF5XSdcbiAgfSkoc3ViamVjdClcbn1cblxuZnVuY3Rpb24gaXNBcnJheWlzaCAoc3ViamVjdCkge1xuICByZXR1cm4gaXNBcnJheShzdWJqZWN0KSB8fCBCdWZmZXIuaXNCdWZmZXIoc3ViamVjdCkgfHxcbiAgICAgIHN1YmplY3QgJiYgdHlwZW9mIHN1YmplY3QgPT09ICdvYmplY3QnICYmXG4gICAgICB0eXBlb2Ygc3ViamVjdC5sZW5ndGggPT09ICdudW1iZXInXG59XG5cbmZ1bmN0aW9uIHRvSGV4IChuKSB7XG4gIGlmIChuIDwgMTYpIHJldHVybiAnMCcgKyBuLnRvU3RyaW5nKDE2KVxuICByZXR1cm4gbi50b1N0cmluZygxNilcbn1cblxuZnVuY3Rpb24gdXRmOFRvQnl0ZXMgKHN0cikge1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgYiA9IHN0ci5jaGFyQ29kZUF0KGkpXG4gICAgaWYgKGIgPD0gMHg3RilcbiAgICAgIGJ5dGVBcnJheS5wdXNoKHN0ci5jaGFyQ29kZUF0KGkpKVxuICAgIGVsc2Uge1xuICAgICAgdmFyIHN0YXJ0ID0gaVxuICAgICAgaWYgKGIgPj0gMHhEODAwICYmIGIgPD0gMHhERkZGKSBpKytcbiAgICAgIHZhciBoID0gZW5jb2RlVVJJQ29tcG9uZW50KHN0ci5zbGljZShzdGFydCwgaSsxKSkuc3Vic3RyKDEpLnNwbGl0KCclJylcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgaC5sZW5ndGg7IGorKylcbiAgICAgICAgYnl0ZUFycmF5LnB1c2gocGFyc2VJbnQoaFtqXSwgMTYpKVxuICAgIH1cbiAgfVxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIGFzY2lpVG9CeXRlcyAoc3RyKSB7XG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgIC8vIE5vZGUncyBjb2RlIHNlZW1zIHRvIGJlIGRvaW5nIHRoaXMgYW5kIG5vdCAmIDB4N0YuLlxuICAgIGJ5dGVBcnJheS5wdXNoKHN0ci5jaGFyQ29kZUF0KGkpICYgMHhGRilcbiAgfVxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIHV0ZjE2bGVUb0J5dGVzIChzdHIpIHtcbiAgdmFyIGMsIGhpLCBsb1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICBjID0gc3RyLmNoYXJDb2RlQXQoaSlcbiAgICBoaSA9IGMgPj4gOFxuICAgIGxvID0gYyAlIDI1NlxuICAgIGJ5dGVBcnJheS5wdXNoKGxvKVxuICAgIGJ5dGVBcnJheS5wdXNoKGhpKVxuICB9XG5cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiBiYXNlNjRUb0J5dGVzIChzdHIpIHtcbiAgcmV0dXJuIGJhc2U2NC50b0J5dGVBcnJheShzdHIpXG59XG5cbmZ1bmN0aW9uIGJsaXRCdWZmZXIgKHNyYywgZHN0LCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgcG9zXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoKGkgKyBvZmZzZXQgPj0gZHN0Lmxlbmd0aCkgfHwgKGkgPj0gc3JjLmxlbmd0aCkpXG4gICAgICBicmVha1xuICAgIGRzdFtpICsgb2Zmc2V0XSA9IHNyY1tpXVxuICB9XG4gIHJldHVybiBpXG59XG5cbmZ1bmN0aW9uIGRlY29kZVV0ZjhDaGFyIChzdHIpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHN0cilcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoMHhGRkZEKSAvLyBVVEYgOCBpbnZhbGlkIGNoYXJcbiAgfVxufVxuXG4vKlxuICogV2UgaGF2ZSB0byBtYWtlIHN1cmUgdGhhdCB0aGUgdmFsdWUgaXMgYSB2YWxpZCBpbnRlZ2VyLiBUaGlzIG1lYW5zIHRoYXQgaXRcbiAqIGlzIG5vbi1uZWdhdGl2ZS4gSXQgaGFzIG5vIGZyYWN0aW9uYWwgY29tcG9uZW50IGFuZCB0aGF0IGl0IGRvZXMgbm90XG4gKiBleGNlZWQgdGhlIG1heGltdW0gYWxsb3dlZCB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gdmVyaWZ1aW50ICh2YWx1ZSwgbWF4KSB7XG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLCAnY2Fubm90IHdyaXRlIGEgbm9uLW51bWJlciBhcyBhIG51bWJlcicpXG4gIGFzc2VydCh2YWx1ZSA+PSAwLCAnc3BlY2lmaWVkIGEgbmVnYXRpdmUgdmFsdWUgZm9yIHdyaXRpbmcgYW4gdW5zaWduZWQgdmFsdWUnKVxuICBhc3NlcnQodmFsdWUgPD0gbWF4LCAndmFsdWUgaXMgbGFyZ2VyIHRoYW4gbWF4aW11bSB2YWx1ZSBmb3IgdHlwZScpXG4gIGFzc2VydChNYXRoLmZsb29yKHZhbHVlKSA9PT0gdmFsdWUsICd2YWx1ZSBoYXMgYSBmcmFjdGlvbmFsIGNvbXBvbmVudCcpXG59XG5cbmZ1bmN0aW9uIHZlcmlmc2ludCAodmFsdWUsIG1heCwgbWluKSB7XG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLCAnY2Fubm90IHdyaXRlIGEgbm9uLW51bWJlciBhcyBhIG51bWJlcicpXG4gIGFzc2VydCh2YWx1ZSA8PSBtYXgsICd2YWx1ZSBsYXJnZXIgdGhhbiBtYXhpbXVtIGFsbG93ZWQgdmFsdWUnKVxuICBhc3NlcnQodmFsdWUgPj0gbWluLCAndmFsdWUgc21hbGxlciB0aGFuIG1pbmltdW0gYWxsb3dlZCB2YWx1ZScpXG4gIGFzc2VydChNYXRoLmZsb29yKHZhbHVlKSA9PT0gdmFsdWUsICd2YWx1ZSBoYXMgYSBmcmFjdGlvbmFsIGNvbXBvbmVudCcpXG59XG5cbmZ1bmN0aW9uIHZlcmlmSUVFRTc1NCAodmFsdWUsIG1heCwgbWluKSB7XG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLCAnY2Fubm90IHdyaXRlIGEgbm9uLW51bWJlciBhcyBhIG51bWJlcicpXG4gIGFzc2VydCh2YWx1ZSA8PSBtYXgsICd2YWx1ZSBsYXJnZXIgdGhhbiBtYXhpbXVtIGFsbG93ZWQgdmFsdWUnKVxuICBhc3NlcnQodmFsdWUgPj0gbWluLCAndmFsdWUgc21hbGxlciB0aGFuIG1pbmltdW0gYWxsb3dlZCB2YWx1ZScpXG59XG5cbmZ1bmN0aW9uIGFzc2VydCAodGVzdCwgbWVzc2FnZSkge1xuICBpZiAoIXRlc3QpIHRocm93IG5ldyBFcnJvcihtZXNzYWdlIHx8ICdGYWlsZWQgYXNzZXJ0aW9uJylcbn1cblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIxWWlaNVNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLi9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9idWZmZXIvaW5kZXguanNcIixcIi8uLi9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9idWZmZXJcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgbG9va3VwID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky8nO1xuXG47KGZ1bmN0aW9uIChleHBvcnRzKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuICB2YXIgQXJyID0gKHR5cGVvZiBVaW50OEFycmF5ICE9PSAndW5kZWZpbmVkJylcbiAgICA/IFVpbnQ4QXJyYXlcbiAgICA6IEFycmF5XG5cblx0dmFyIFBMVVMgICA9ICcrJy5jaGFyQ29kZUF0KDApXG5cdHZhciBTTEFTSCAgPSAnLycuY2hhckNvZGVBdCgwKVxuXHR2YXIgTlVNQkVSID0gJzAnLmNoYXJDb2RlQXQoMClcblx0dmFyIExPV0VSICA9ICdhJy5jaGFyQ29kZUF0KDApXG5cdHZhciBVUFBFUiAgPSAnQScuY2hhckNvZGVBdCgwKVxuXHR2YXIgUExVU19VUkxfU0FGRSA9ICctJy5jaGFyQ29kZUF0KDApXG5cdHZhciBTTEFTSF9VUkxfU0FGRSA9ICdfJy5jaGFyQ29kZUF0KDApXG5cblx0ZnVuY3Rpb24gZGVjb2RlIChlbHQpIHtcblx0XHR2YXIgY29kZSA9IGVsdC5jaGFyQ29kZUF0KDApXG5cdFx0aWYgKGNvZGUgPT09IFBMVVMgfHxcblx0XHQgICAgY29kZSA9PT0gUExVU19VUkxfU0FGRSlcblx0XHRcdHJldHVybiA2MiAvLyAnKydcblx0XHRpZiAoY29kZSA9PT0gU0xBU0ggfHxcblx0XHQgICAgY29kZSA9PT0gU0xBU0hfVVJMX1NBRkUpXG5cdFx0XHRyZXR1cm4gNjMgLy8gJy8nXG5cdFx0aWYgKGNvZGUgPCBOVU1CRVIpXG5cdFx0XHRyZXR1cm4gLTEgLy9ubyBtYXRjaFxuXHRcdGlmIChjb2RlIDwgTlVNQkVSICsgMTApXG5cdFx0XHRyZXR1cm4gY29kZSAtIE5VTUJFUiArIDI2ICsgMjZcblx0XHRpZiAoY29kZSA8IFVQUEVSICsgMjYpXG5cdFx0XHRyZXR1cm4gY29kZSAtIFVQUEVSXG5cdFx0aWYgKGNvZGUgPCBMT1dFUiArIDI2KVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBMT1dFUiArIDI2XG5cdH1cblxuXHRmdW5jdGlvbiBiNjRUb0J5dGVBcnJheSAoYjY0KSB7XG5cdFx0dmFyIGksIGosIGwsIHRtcCwgcGxhY2VIb2xkZXJzLCBhcnJcblxuXHRcdGlmIChiNjQubGVuZ3RoICUgNCA+IDApIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignSW52YWxpZCBzdHJpbmcuIExlbmd0aCBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgNCcpXG5cdFx0fVxuXG5cdFx0Ly8gdGhlIG51bWJlciBvZiBlcXVhbCBzaWducyAocGxhY2UgaG9sZGVycylcblx0XHQvLyBpZiB0aGVyZSBhcmUgdHdvIHBsYWNlaG9sZGVycywgdGhhbiB0aGUgdHdvIGNoYXJhY3RlcnMgYmVmb3JlIGl0XG5cdFx0Ly8gcmVwcmVzZW50IG9uZSBieXRlXG5cdFx0Ly8gaWYgdGhlcmUgaXMgb25seSBvbmUsIHRoZW4gdGhlIHRocmVlIGNoYXJhY3RlcnMgYmVmb3JlIGl0IHJlcHJlc2VudCAyIGJ5dGVzXG5cdFx0Ly8gdGhpcyBpcyBqdXN0IGEgY2hlYXAgaGFjayB0byBub3QgZG8gaW5kZXhPZiB0d2ljZVxuXHRcdHZhciBsZW4gPSBiNjQubGVuZ3RoXG5cdFx0cGxhY2VIb2xkZXJzID0gJz0nID09PSBiNjQuY2hhckF0KGxlbiAtIDIpID8gMiA6ICc9JyA9PT0gYjY0LmNoYXJBdChsZW4gLSAxKSA/IDEgOiAwXG5cblx0XHQvLyBiYXNlNjQgaXMgNC8zICsgdXAgdG8gdHdvIGNoYXJhY3RlcnMgb2YgdGhlIG9yaWdpbmFsIGRhdGFcblx0XHRhcnIgPSBuZXcgQXJyKGI2NC5sZW5ndGggKiAzIC8gNCAtIHBsYWNlSG9sZGVycylcblxuXHRcdC8vIGlmIHRoZXJlIGFyZSBwbGFjZWhvbGRlcnMsIG9ubHkgZ2V0IHVwIHRvIHRoZSBsYXN0IGNvbXBsZXRlIDQgY2hhcnNcblx0XHRsID0gcGxhY2VIb2xkZXJzID4gMCA/IGI2NC5sZW5ndGggLSA0IDogYjY0Lmxlbmd0aFxuXG5cdFx0dmFyIEwgPSAwXG5cblx0XHRmdW5jdGlvbiBwdXNoICh2KSB7XG5cdFx0XHRhcnJbTCsrXSA9IHZcblx0XHR9XG5cblx0XHRmb3IgKGkgPSAwLCBqID0gMDsgaSA8IGw7IGkgKz0gNCwgaiArPSAzKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDE4KSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMSkpIDw8IDEyKSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMikpIDw8IDYpIHwgZGVjb2RlKGI2NC5jaGFyQXQoaSArIDMpKVxuXHRcdFx0cHVzaCgodG1wICYgMHhGRjAwMDApID4+IDE2KVxuXHRcdFx0cHVzaCgodG1wICYgMHhGRjAwKSA+PiA4KVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH1cblxuXHRcdGlmIChwbGFjZUhvbGRlcnMgPT09IDIpIHtcblx0XHRcdHRtcCA9IChkZWNvZGUoYjY0LmNoYXJBdChpKSkgPDwgMikgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA+PiA0KVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH0gZWxzZSBpZiAocGxhY2VIb2xkZXJzID09PSAxKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDEwKSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMSkpIDw8IDQpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAyKSkgPj4gMilcblx0XHRcdHB1c2goKHRtcCA+PiA4KSAmIDB4RkYpXG5cdFx0XHRwdXNoKHRtcCAmIDB4RkYpXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGFyclxuXHR9XG5cblx0ZnVuY3Rpb24gdWludDhUb0Jhc2U2NCAodWludDgpIHtcblx0XHR2YXIgaSxcblx0XHRcdGV4dHJhQnl0ZXMgPSB1aW50OC5sZW5ndGggJSAzLCAvLyBpZiB3ZSBoYXZlIDEgYnl0ZSBsZWZ0LCBwYWQgMiBieXRlc1xuXHRcdFx0b3V0cHV0ID0gXCJcIixcblx0XHRcdHRlbXAsIGxlbmd0aFxuXG5cdFx0ZnVuY3Rpb24gZW5jb2RlIChudW0pIHtcblx0XHRcdHJldHVybiBsb29rdXAuY2hhckF0KG51bSlcblx0XHR9XG5cblx0XHRmdW5jdGlvbiB0cmlwbGV0VG9CYXNlNjQgKG51bSkge1xuXHRcdFx0cmV0dXJuIGVuY29kZShudW0gPj4gMTggJiAweDNGKSArIGVuY29kZShudW0gPj4gMTIgJiAweDNGKSArIGVuY29kZShudW0gPj4gNiAmIDB4M0YpICsgZW5jb2RlKG51bSAmIDB4M0YpXG5cdFx0fVxuXG5cdFx0Ly8gZ28gdGhyb3VnaCB0aGUgYXJyYXkgZXZlcnkgdGhyZWUgYnl0ZXMsIHdlJ2xsIGRlYWwgd2l0aCB0cmFpbGluZyBzdHVmZiBsYXRlclxuXHRcdGZvciAoaSA9IDAsIGxlbmd0aCA9IHVpbnQ4Lmxlbmd0aCAtIGV4dHJhQnl0ZXM7IGkgPCBsZW5ndGg7IGkgKz0gMykge1xuXHRcdFx0dGVtcCA9ICh1aW50OFtpXSA8PCAxNikgKyAodWludDhbaSArIDFdIDw8IDgpICsgKHVpbnQ4W2kgKyAyXSlcblx0XHRcdG91dHB1dCArPSB0cmlwbGV0VG9CYXNlNjQodGVtcClcblx0XHR9XG5cblx0XHQvLyBwYWQgdGhlIGVuZCB3aXRoIHplcm9zLCBidXQgbWFrZSBzdXJlIHRvIG5vdCBmb3JnZXQgdGhlIGV4dHJhIGJ5dGVzXG5cdFx0c3dpdGNoIChleHRyYUJ5dGVzKSB7XG5cdFx0XHRjYXNlIDE6XG5cdFx0XHRcdHRlbXAgPSB1aW50OFt1aW50OC5sZW5ndGggLSAxXVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKHRlbXAgPj4gMilcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSgodGVtcCA8PCA0KSAmIDB4M0YpXG5cdFx0XHRcdG91dHB1dCArPSAnPT0nXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIDI6XG5cdFx0XHRcdHRlbXAgPSAodWludDhbdWludDgubGVuZ3RoIC0gMl0gPDwgOCkgKyAodWludDhbdWludDgubGVuZ3RoIC0gMV0pXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUodGVtcCA+PiAxMClcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSgodGVtcCA+PiA0KSAmIDB4M0YpXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPDwgMikgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gJz0nXG5cdFx0XHRcdGJyZWFrXG5cdFx0fVxuXG5cdFx0cmV0dXJuIG91dHB1dFxuXHR9XG5cblx0ZXhwb3J0cy50b0J5dGVBcnJheSA9IGI2NFRvQnl0ZUFycmF5XG5cdGV4cG9ydHMuZnJvbUJ5dGVBcnJheSA9IHVpbnQ4VG9CYXNlNjRcbn0odHlwZW9mIGV4cG9ydHMgPT09ICd1bmRlZmluZWQnID8gKHRoaXMuYmFzZTY0anMgPSB7fSkgOiBleHBvcnRzKSlcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIxWWlaNVNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLi9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9idWZmZXIvbm9kZV9tb2R1bGVzL2Jhc2U2NC1qcy9saWIvYjY0LmpzXCIsXCIvLi4vbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnVmZmVyL25vZGVfbW9kdWxlcy9iYXNlNjQtanMvbGliXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuZXhwb3J0cy5yZWFkID0gZnVuY3Rpb24gKGJ1ZmZlciwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG0sXG4gICAgICBlTGVuID0gbkJ5dGVzICogOCAtIG1MZW4gLSAxLFxuICAgICAgZU1heCA9ICgxIDw8IGVMZW4pIC0gMSxcbiAgICAgIGVCaWFzID0gZU1heCA+PiAxLFxuICAgICAgbkJpdHMgPSAtNyxcbiAgICAgIGkgPSBpc0xFID8gKG5CeXRlcyAtIDEpIDogMCxcbiAgICAgIGQgPSBpc0xFID8gLTEgOiAxLFxuICAgICAgcyA9IGJ1ZmZlcltvZmZzZXQgKyBpXVxuXG4gIGkgKz0gZFxuXG4gIGUgPSBzICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpXG4gIHMgPj49ICgtbkJpdHMpXG4gIG5CaXRzICs9IGVMZW5cbiAgZm9yICg7IG5CaXRzID4gMDsgZSA9IGUgKiAyNTYgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCkge31cblxuICBtID0gZSAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKVxuICBlID4+PSAoLW5CaXRzKVxuICBuQml0cyArPSBtTGVuXG4gIGZvciAoOyBuQml0cyA+IDA7IG0gPSBtICogMjU2ICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpIHt9XG5cbiAgaWYgKGUgPT09IDApIHtcbiAgICBlID0gMSAtIGVCaWFzXG4gIH0gZWxzZSBpZiAoZSA9PT0gZU1heCkge1xuICAgIHJldHVybiBtID8gTmFOIDogKChzID8gLTEgOiAxKSAqIEluZmluaXR5KVxuICB9IGVsc2Uge1xuICAgIG0gPSBtICsgTWF0aC5wb3coMiwgbUxlbilcbiAgICBlID0gZSAtIGVCaWFzXG4gIH1cbiAgcmV0dXJuIChzID8gLTEgOiAxKSAqIG0gKiBNYXRoLnBvdygyLCBlIC0gbUxlbilcbn1cblxuZXhwb3J0cy53cml0ZSA9IGZ1bmN0aW9uIChidWZmZXIsIHZhbHVlLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbSwgYyxcbiAgICAgIGVMZW4gPSBuQnl0ZXMgKiA4IC0gbUxlbiAtIDEsXG4gICAgICBlTWF4ID0gKDEgPDwgZUxlbikgLSAxLFxuICAgICAgZUJpYXMgPSBlTWF4ID4+IDEsXG4gICAgICBydCA9IChtTGVuID09PSAyMyA/IE1hdGgucG93KDIsIC0yNCkgLSBNYXRoLnBvdygyLCAtNzcpIDogMCksXG4gICAgICBpID0gaXNMRSA/IDAgOiAobkJ5dGVzIC0gMSksXG4gICAgICBkID0gaXNMRSA/IDEgOiAtMSxcbiAgICAgIHMgPSB2YWx1ZSA8IDAgfHwgKHZhbHVlID09PSAwICYmIDEgLyB2YWx1ZSA8IDApID8gMSA6IDBcblxuICB2YWx1ZSA9IE1hdGguYWJzKHZhbHVlKVxuXG4gIGlmIChpc05hTih2YWx1ZSkgfHwgdmFsdWUgPT09IEluZmluaXR5KSB7XG4gICAgbSA9IGlzTmFOKHZhbHVlKSA/IDEgOiAwXG4gICAgZSA9IGVNYXhcbiAgfSBlbHNlIHtcbiAgICBlID0gTWF0aC5mbG9vcihNYXRoLmxvZyh2YWx1ZSkgLyBNYXRoLkxOMilcbiAgICBpZiAodmFsdWUgKiAoYyA9IE1hdGgucG93KDIsIC1lKSkgPCAxKSB7XG4gICAgICBlLS1cbiAgICAgIGMgKj0gMlxuICAgIH1cbiAgICBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIHZhbHVlICs9IHJ0IC8gY1xuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZSArPSBydCAqIE1hdGgucG93KDIsIDEgLSBlQmlhcylcbiAgICB9XG4gICAgaWYgKHZhbHVlICogYyA+PSAyKSB7XG4gICAgICBlKytcbiAgICAgIGMgLz0gMlxuICAgIH1cblxuICAgIGlmIChlICsgZUJpYXMgPj0gZU1heCkge1xuICAgICAgbSA9IDBcbiAgICAgIGUgPSBlTWF4XG4gICAgfSBlbHNlIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgbSA9ICh2YWx1ZSAqIGMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pXG4gICAgICBlID0gZSArIGVCaWFzXG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSB2YWx1ZSAqIE1hdGgucG93KDIsIGVCaWFzIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKVxuICAgICAgZSA9IDBcbiAgICB9XG4gIH1cblxuICBmb3IgKDsgbUxlbiA+PSA4OyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBtICYgMHhmZiwgaSArPSBkLCBtIC89IDI1NiwgbUxlbiAtPSA4KSB7fVxuXG4gIGUgPSAoZSA8PCBtTGVuKSB8IG1cbiAgZUxlbiArPSBtTGVuXG4gIGZvciAoOyBlTGVuID4gMDsgYnVmZmVyW29mZnNldCArIGldID0gZSAmIDB4ZmYsIGkgKz0gZCwgZSAvPSAyNTYsIGVMZW4gLT0gOCkge31cblxuICBidWZmZXJbb2Zmc2V0ICsgaSAtIGRdIHw9IHMgKiAxMjhcbn1cblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIxWWlaNVNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLi9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9idWZmZXIvbm9kZV9tb2R1bGVzL2llZWU3NTQvaW5kZXguanNcIixcIi8uLi9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9idWZmZXIvbm9kZV9tb2R1bGVzL2llZWU3NTRcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4vLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5wcm9jZXNzLm5leHRUaWNrID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2FuU2V0SW1tZWRpYXRlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuc2V0SW1tZWRpYXRlO1xuICAgIHZhciBjYW5Qb3N0ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cucG9zdE1lc3NhZ2UgJiYgd2luZG93LmFkZEV2ZW50TGlzdGVuZXJcbiAgICA7XG5cbiAgICBpZiAoY2FuU2V0SW1tZWRpYXRlKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoZikgeyByZXR1cm4gd2luZG93LnNldEltbWVkaWF0ZShmKSB9O1xuICAgIH1cblxuICAgIGlmIChjYW5Qb3N0KSB7XG4gICAgICAgIHZhciBxdWV1ZSA9IFtdO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgdmFyIHNvdXJjZSA9IGV2LnNvdXJjZTtcbiAgICAgICAgICAgIGlmICgoc291cmNlID09PSB3aW5kb3cgfHwgc291cmNlID09PSBudWxsKSAmJiBldi5kYXRhID09PSAncHJvY2Vzcy10aWNrJykge1xuICAgICAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGlmIChxdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmbiA9IHF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0cnVlKTtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgICAgIHF1ZXVlLnB1c2goZm4pO1xuICAgICAgICAgICAgd2luZG93LnBvc3RNZXNzYWdlKCdwcm9jZXNzLXRpY2snLCAnKicpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICBzZXRUaW1lb3V0KGZuLCAwKTtcbiAgICB9O1xufSkoKTtcblxucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIxWWlaNVNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLi9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanNcIixcIi8uLi9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9wcm9jZXNzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIFNoYWRlciA9IHJlcXVpcmUoJ2dsL3NoYWRlcicpO1xudmFyIFRleHR1cmUgPSByZXF1aXJlKCdnbC90ZXh0dXJlJyk7XG52YXIgUGFrID0gcmVxdWlyZSgnZm9ybWF0cy9wYWsnKTtcbnZhciBXYWQgPSByZXF1aXJlKCdmb3JtYXRzL3dhZCcpO1xudmFyIFBhbGV0dGUgPSByZXF1aXJlKCdmb3JtYXRzL3BhbGV0dGUnKTtcbnZhciBCc3AgPSByZXF1aXJlKCdmb3JtYXRzL2JzcCcpO1xuXG5mdW5jdGlvbiBnZXRFeHRlbnNpb24ocGF0aCkge1xuICAgIHZhciBpbmRleCA9IHBhdGgubGFzdEluZGV4T2YoJy4nKTtcbiAgICBpZiAoaW5kZXggPT09IC0xKSByZXR1cm4gJyc7XG4gICAgcmV0dXJuIHBhdGguc3Vic3RyKGluZGV4ICsgMSk7XG59XG5cbmZ1bmN0aW9uIGdldE5hbWUocGF0aCkge1xuICAgIHZhciBpbmRleDEgPSBwYXRoLmxhc3RJbmRleE9mKCcvJyk7XG4gICAgdmFyIGluZGV4MiA9IHBhdGgubGFzdEluZGV4T2YoJy4nKTtcbiAgICByZXR1cm4gcGF0aC5zdWJzdHIoaW5kZXgxICsgMSwgaW5kZXgyIC0gaW5kZXgxIC0gMSk7XG59XG5cbmZ1bmN0aW9uIGRvd25sb2FkKGl0ZW0sIGRvbmUpIHtcbiAgICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIHJlcXVlc3Qub3BlbignR0VUJywgaXRlbS51cmwsIHRydWUpO1xuICAgIHJlcXVlc3Qub3ZlcnJpZGVNaW1lVHlwZSgndGV4dC9wbGFpbjsgY2hhcnNldD14LXVzZXItZGVmaW5lZCcpO1xuICAgIGlmIChpdGVtLmJpbmFyeSlcbiAgICAgICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSAnYXJyYXlidWZmZXInO1xuICAgIHJlcXVlc3Qub25sb2FkID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaWYgKHJlcXVlc3Quc3RhdHVzICE9PSAyMDApXG4gICAgICAgICAgICB0aHJvdyAnVW5hYmxlIHRvIHJlYWQgZmlsZSBmcm9tIHVybDogJyArIGl0ZW0ubmFtZTtcblxuICAgICAgICB2YXIgZGF0YSA9IGl0ZW0uYmluYXJ5ID9cbiAgICAgICAgICAgIG5ldyBVaW50OEFycmF5KHJlcXVlc3QucmVzcG9uc2UpIDogcmVxdWVzdC5yZXNwb25zZVRleHQ7XG4gICAgICAgIGRvbmUoaXRlbSwgZGF0YSk7XG4gICAgfTtcblxuICAgIHJlcXVlc3Qub25lcnJvciA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIHRocm93ICdVbmFibGUgdG8gcmVhZCBmaWxlIGZyb20gdXJsOiAnICsgcmVxdWVzdC5zdGF0dXNUZXh0O1xuICAgIH07XG4gICAgcmVxdWVzdC5zZW5kKG51bGwpO1xufVxuXG52YXIgQXNzZXRzID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wZW5kaW5nID0gW107XG4gICAgdGhpcy5zaGFkZXJzID0ge307XG59O1xuXG5Bc3NldHMucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKHVybCwgdHlwZSkge1xuICAgIHR5cGUgPSB0eXBlIHx8IGdldEV4dGVuc2lvbih1cmwpO1xuICAgIGlmICghdHlwZSlcbiAgICAgICAgdGhyb3cgJ0Vycm9yOiBVbmFibGUgdG8gZGV0ZXJtaW5lIHR5cGUgZm9yIGFzc2V0OiAnICsgbmFtZTtcbiAgICB2YXIgYmluYXJ5ID0gdHlwZSAhPT0gJ3NoYWRlcic7XG4gICAgdGhpcy5wZW5kaW5nLnB1c2goeyB1cmw6IHVybCwgbmFtZTogZ2V0TmFtZSh1cmwpLCB0eXBlOiB0eXBlLCBiaW5hcnk6IGJpbmFyeSB9KTtcbn07XG5cbkFzc2V0cy5wcm90b3R5cGUuaW5zZXJ0ID0gZnVuY3Rpb24oaXRlbSwgZGF0YSkge1xuICAgIHN3aXRjaCAoaXRlbS50eXBlKSB7XG4gICAgICAgIGNhc2UgJ3Bhayc6XG4gICAgICAgICAgICB0aGlzLnBhayA9IG5ldyBQYWsoZGF0YSk7XG4gICAgICAgICAgICB0aGlzLndhZCA9IG5ldyBXYWQodGhpcy5wYWsubG9hZCgnZ2Z4LndhZCcpKTtcbiAgICAgICAgICAgIHRoaXMucGFsZXR0ZSA9IG5ldyBQYWxldHRlKHRoaXMucGFrLmxvYWQoJ2dmeC9wYWxldHRlLmxtcCcpKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdzaGFkZXInOlxuICAgICAgICAgICAgdGhpcy5zaGFkZXJzW2l0ZW0ubmFtZV0gPSBuZXcgU2hhZGVyKGRhdGEpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6IHRocm93ICdFcnJvcjogVW5rbm93biB0eXBlIGxvYWRlZDogJyArIGl0ZW0udHlwZTtcbiAgICB9XG59O1xuXG5Bc3NldHMucHJvdG90eXBlLmxvYWQgPSBmdW5jdGlvbihuYW1lLCBvcHRpb25zKSB7XG4gICAgdmFyIGluZGV4ID0gbmFtZS5pbmRleE9mKCcvJyk7XG4gICAgdmFyIGxvY2F0aW9uID0gbmFtZS5zdWJzdHIoMCwgaW5kZXgpO1xuICAgIHZhciB0eXBlID0gZ2V0RXh0ZW5zaW9uKG5hbWUpIHx8ICd0ZXh0dXJlJztcbiAgICB2YXIgbmFtZSA9IG5hbWUuc3Vic3RyKGluZGV4ICsgMSk7XG4gICAgdmFyIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgIGNhc2UgJ2JzcCc6XG4gICAgICAgICAgICB2YXIgZGF0YSA9IHRoaXMucGFrLmxvYWQobmFtZSk7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEJzcChkYXRhKTtcbiAgICB9XG5cbiAgICBvcHRpb25zLnBhbGV0dGUgPSB0aGlzLnBhbGV0dGU7XG4gICAgc3dpdGNoKGxvY2F0aW9uKSB7XG4gICAgICAgIGNhc2UgJ3Bhayc6XG4gICAgICAgICAgICB2YXIgZGF0YSA9IHRoaXMucGFrLmxvYWQobmFtZSk7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFRleHR1cmUoZGF0YSwgb3B0aW9ucyk7XG4gICAgICAgIGNhc2UgJ3dhZCc6XG4gICAgICAgICAgICB2YXIgZGF0YSA9IHRoaXMud2FkLmdldChuYW1lKTtcbiAgICAgICAgICAgIHJldHVybiBuZXcgVGV4dHVyZShkYXRhLCBvcHRpb25zKTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93ICdFcnJvcjogQ2Fubm90IGxvYWQgZmlsZXMgb3V0c2lkZSBQQUsvV0FEOiAnICsgbmFtZTtcbiAgICB9XG59O1xuXG5Bc3NldHMucHJvdG90eXBlLnByZWNhY2hlID0gZnVuY3Rpb24oZG9uZSkge1xuICAgIHZhciB0b3RhbCA9IHRoaXMucGVuZGluZy5sZW5ndGg7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGZvciAodmFyIGkgaW4gdGhpcy5wZW5kaW5nKSB7XG4gICAgICAgIHZhciBwZW5kaW5nID0gdGhpcy5wZW5kaW5nW2ldO1xuICAgICAgICBkb3dubG9hZChwZW5kaW5nLCBmdW5jdGlvbihpdGVtLCBkYXRhKSB7XG4gICAgICAgICAgICBzZWxmLmluc2VydChpdGVtLCBkYXRhKTtcbiAgICAgICAgICAgIGlmICgtLXRvdGFsIDw9IDApIHtcbiAgICAgICAgICAgICAgICBzZWxmLnBlbmRpbmcgPSBbXTtcbiAgICAgICAgICAgICAgICBkb25lKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn07XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBuZXcgQXNzZXRzKCk7XG59KS5jYWxsKHRoaXMscmVxdWlyZShcIjFZaVo1U1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2Fzc2V0cy5qc1wiLFwiL1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbnZhciBhc3NldHMgPSByZXF1aXJlKCdhc3NldHMnKTtcbnZhciBQcm90b2NvbCA9IHJlcXVpcmUoJ3Byb3RvY29sJyk7XG5cbnZhciBDbGllbnQgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnZpZXdBbmdsZXMgPSB2ZWMzLmNyZWF0ZSgpO1xuICAgIHRoaXMudmlld0VudGl0eSA9IC0xO1xufTtcblxuQ2xpZW50LnByb3RvdHlwZS5wbGF5RGVtbyA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgZGVtbyA9IGFzc2V0cy5wYWsubG9hZChuYW1lKTtcbiAgICB3aGlsZSAoZGVtby5yZWFkVUludDgoKSAhPT0gMTApO1xuICAgIHRoaXMuZGVtbyA9IGRlbW87XG59O1xuXG5DbGllbnQucHJvdG90eXBlLnJlYWRGcm9tU2VydmVyID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRlbW8gPSB0aGlzLmRlbW87XG4gICAgaWYgKCFkZW1vIHx8IGRlbW8uZW9mKCkpIHJldHVybjtcblxuICAgIHZhciBtZXNzYWdlU2l6ZSA9IGRlbW8ucmVhZEludDMyKCk7XG5cbiAgICB0aGlzLnZpZXdBbmdsZXNbMF0gPSBkZW1vLnJlYWRGbG9hdCgpO1xuICAgIHRoaXMudmlld0FuZ2xlc1sxXSA9IGRlbW8ucmVhZEZsb2F0KCk7XG4gICAgdGhpcy52aWV3QW5nbGVzWzJdID0gZGVtby5yZWFkRmxvYXQoKTtcblxuICAgIHZhciBtc2cgPSBkZW1vLnJlYWQobWVzc2FnZVNpemUpO1xuICAgIHZhciBjbWQgPSAwO1xuICAgIHdoaWxlIChjbWQgIT09IC0xICYmICFtc2cuZW9mKCkpIHtcbiAgICAgICAgY21kID0gbXNnLnJlYWRVSW50OCgpO1xuICAgICAgICBpZiAoY21kICYgMTI4KSB7XG4gICAgICAgICAgICB0aGlzLnBhcnNlRmFzdFVwZGF0ZShjbWQgJiAxMjcsIG1zZyk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN3aXRjaCAoY21kKSB7XG4gICAgICAgICAgICBjYXNlIFByb3RvY29sLnNlcnZlclVwZGF0ZVN0YXQ6XG4gICAgICAgICAgICAgICAgdmFyIHN0YXQgPSBtc2cucmVhZFVJbnQ4KCk7XG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gbXNnLnJlYWRJbnQzMigpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQcm90b2NvbC5zZXJ2ZXJTZXRWaWV3OlxuICAgICAgICAgICAgICAgIHRoaXMudmlld0VudGl0eSA9IG1zZy5yZWFkSW50MTYoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgUHJvdG9jb2wuc2VydmVyVGltZTpcbiAgICAgICAgICAgICAgICBtc2cucmVhZEZsb2F0KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFByb3RvY29sLnNlcnZlclNldEFuZ2xlOlxuICAgICAgICAgICAgICAgIHRoaXMudmlld0FuZ2xlc1swXSA9IG1zZy5yZWFkSW50OCgpICogMS40MDYyNTtcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdBbmdsZXNbMV0gPSBtc2cucmVhZEludDgoKSAqIDEuNDA2MjU7XG4gICAgICAgICAgICAgICAgdGhpcy52aWV3QW5nbGVzWzJdID0gbXNnLnJlYWRJbnQ4KCkgKiAxLjQwNjI1O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQcm90b2NvbC5zZXJ2ZXJTb3VuZDpcbiAgICAgICAgICAgICAgICB0aGlzLnBhcnNlU291bmQobXNnKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgUHJvdG9jb2wuc2VydmVyUHJpbnQ6XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cobXNnLnJlYWRDU3RyaW5nKCkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQcm90b2NvbC5zZXJ2ZXJMaWdodFN0eWxlOlxuICAgICAgICAgICAgICAgIHZhciBzdHlsZSA9IG1zZy5yZWFkVUludDgoKTtcbiAgICAgICAgICAgICAgICB2YXIgcGF0dGVybiA9IG1zZy5yZWFkQ1N0cmluZygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQcm90b2NvbC5zZXJ2ZXJDbGllbnREYXRhOlxuICAgICAgICAgICAgICAgIHRoaXMucGFyc2VDbGllbnREYXRhKG1zZyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFByb3RvY29sLnNlcnZlclVwZGF0ZU5hbWU6XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJyVzLiAlcycsIG1zZy5yZWFkVUludDgoKSwgbXNnLnJlYWRDU3RyaW5nKCkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQcm90b2NvbC5zZXJ2ZXJVcGRhdGVGcmFnczpcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnJXMuIEZyYWdzOiAlcycsIG1zZy5yZWFkVUludDgoKSwgbXNnLnJlYWRJbnQxNigpKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgUHJvdG9jb2wuc2VydmVyVXBkYXRlQ29sb3JzOlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCclcy4gQ29sb3JzOiAlcycsIG1zZy5yZWFkVUludDgoKSwgbXNnLnJlYWRVSW50OCgpKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgUHJvdG9jb2wuc2VydmVyUGFydGljbGU6XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJzZVBhcnRpY2xlKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFByb3RvY29sLnNlcnZlclN0dWZmVGV4dDpcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhtc2cucmVhZENTdHJpbmcoKSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFByb3RvY29sLnNlcnZlclRlbXBFbnRpdHk6XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJzZVRlbXBFbnRpdHkobXNnKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgUHJvdG9jb2wuc2VydmVySW5mbzpcbiAgICAgICAgICAgICAgICB0aGlzLnBhcnNlU2VydmVySW5mbyhtc2cpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQcm90b2NvbC5zZXJ2ZXJTaWdub25OdW06XG4gICAgICAgICAgICAgICAgbXNnLnNraXAoMSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFByb3RvY29sLnNlcnZlckNkVHJhY2s6XG4gICAgICAgICAgICAgICAgbXNnLnNraXAoMik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFByb3RvY29sLnNlcnZlclNwYXduU3RhdGljOlxuICAgICAgICAgICAgICAgIHRoaXMucGFyc2VCYXNlbGluZShtc2cpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQcm90b2NvbC5zZXJ2ZXJLaWxsZWRNb25zdGVyOlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQcm90b2NvbC5zZXJ2ZXJEYW1hZ2U6XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJzZURhbWFnZShtc2cpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQcm90b2NvbC5zZXJ2ZXJTcGF3bkJhc2VsaW5lOlxuICAgICAgICAgICAgICAgIG1zZy5za2lwKDIpO1xuICAgICAgICAgICAgICAgIHRoaXMucGFyc2VCYXNlbGluZShtc2cpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQcm90b2NvbC5zZXJ2ZXJTcGF3blN0YXRpY1NvdW5kOlxuICAgICAgICAgICAgICAgIG1zZy5za2lwKDkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDogdGhyb3cgJ1Vua25vd24gY21kOiAnICsgY21kO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuQ2xpZW50LnByb3RvdHlwZS5wYXJzZVNlcnZlckluZm8gPSBmdW5jdGlvbihtc2cpIHtcbiAgICBtc2cuc2tpcCg2KTtcbiAgICB2YXIgbWFwTmFtZSA9IG1zZy5yZWFkQ1N0cmluZygpO1xuICAgIGNvbnNvbGUubG9nKG1hcE5hbWUpO1xuXG4gICAgd2hpbGUodHJ1ZSkge1xuICAgICAgICB2YXIgbW9kZWxOYW1lID0gbXNnLnJlYWRDU3RyaW5nKCk7XG4gICAgICAgIGlmICghbW9kZWxOYW1lKSBicmVhaztcbiAgICAgICAgLy9jb25zb2xlLmxvZyhtb2RlbE5hbWUpO1xuICAgIH1cbiAgICB3aGlsZSh0cnVlKSB7XG4gICAgICAgIHZhciBzb3VuZE5hbWUgPSBtc2cucmVhZENTdHJpbmcoKTtcbiAgICAgICAgaWYgKCFzb3VuZE5hbWUpIGJyZWFrO1xuICAgICAgICAvL2NvbnNvbGUubG9nKHNvdW5kTmFtZSk7XG4gICAgfVxufTtcblxuQ2xpZW50LnByb3RvdHlwZS5wYXJzZUNsaWVudERhdGEgPSBmdW5jdGlvbihtc2cpIHtcbiAgICB2YXIgYml0cyA9IG1zZy5yZWFkSW50MTYoKTtcbiAgICBpZiAoYml0cyAmIFByb3RvY29sLmNsaWVudFZpZXdIZWlnaHQpXG4gICAgICAgIG1zZy5yZWFkVUludDgoKTtcblxuICAgIGlmIChiaXRzICYgUHJvdG9jb2wuY2xpZW50SWRlYWxQaXRjaClcbiAgICAgICAgbXNnLnJlYWRJbnQ4KCk7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDM7IGkrKykge1xuXG4gICAgICAgIGlmIChiaXRzICYgKFByb3RvY29sLmNsaWVudFB1bmNoMSA8PCBpKSlcbiAgICAgICAgICAgIG1zZy5yZWFkSW50OCgpO1xuXG4gICAgICAgIGlmIChiaXRzICYgKFByb3RvY29sLmNsaWVudFZlbG9jaXR5MSA8PCBpKSlcbiAgICAgICAgICAgIG1zZy5yZWFkSW50OCgpO1xuICAgIH1cblxuICAgIG1zZy5yZWFkSW50MzIoKTtcblxuICAgIGlmIChiaXRzICYgUHJvdG9jb2wuY2xpZW50V2VhcG9uRnJhbWUpXG4gICAgICAgIG1zZy5yZWFkVUludDgoKTtcblxuICAgIGlmIChiaXRzICYgUHJvdG9jb2wuY2xpZW50QXJtb3IpXG4gICAgICAgIG1zZy5yZWFkVUludDgoKTtcblxuICAgIGlmIChiaXRzICYgUHJvdG9jb2wuY2xpZW50V2VhcG9uKVxuICAgICAgICBtc2cucmVhZFVJbnQ4KCk7XG5cbiAgICBtc2cucmVhZEludDE2KCk7XG4gICAgbXNnLnJlYWRVSW50OCgpO1xuICAgIG1zZy5yZWFkU3RyaW5nKDUpO1xufTtcblxuQ2xpZW50LnByb3RvdHlwZS5wYXJzZUZhc3RVcGRhdGUgPSBmdW5jdGlvbihjbWQsIG1zZykge1xuICAgIGlmIChjbWQgJiBQcm90b2NvbC5mYXN0VXBkYXRlTW9yZUJpdHMpXG4gICAgICAgIGNtZCA9IGNtZCB8IChtc2cucmVhZFVJbnQ4KCkgPDwgOCk7XG5cbiAgICB2YXIgZW50aXR5TnVtYmVyID0gKGNtZCAmIFByb3RvY29sLmZhc3RVcGRhdGVMb25nRW50aXR5KSA/XG4gICAgICAgIG1zZy5yZWFkSW50MTYoKSA6IG1zZy5yZWFkVUludDgoKTtcblxuICAgIHZhciBlbnRpdHkgPSB7XG4gICAgICAgIHN0YXRlOiB7fSxcbiAgICAgICAgYmFzZWxpbmU6IHsgZnJhbWU6IDAgfSxcbiAgICAgICAgcHJpb3JTdGF0ZTogeyBhbmdsZXM6IFtdLCBvcmlnaW46IFtdIH0sXG4gICAgICAgIG5leHRTdGF0ZTogeyBhbmdsZXM6IFtdLCBvcmlnaW46IFtdIH1cbiAgICB9O1xuICAgIC8vdGhpcy5lbnRpdGllc1tlbnRpdHlOdW1iZXJdO1xuICAgIGVudGl0eS50aW1lID0gdGhpcy5zZXJ2ZXJUaW1lO1xuXG4gICAgaWYgKGNtZCAmIFByb3RvY29sLmZhc3RVcGRhdGVNb2RlbCkge1xuICAgICAgICBlbnRpdHkuc3RhdGUubW9kZWxJbmRleCA9IG1zZy5yZWFkVUludDgoKTtcbiAgICAgICAgZW50aXR5Lm1vZGVsID0gMDsvL3RoaXMubW9kZWxzW2VudGl0eS5zdGF0ZS5tb2RlbEluZGV4XTtcbiAgICB9XG4gICAgaWYgKGNtZCAmIFByb3RvY29sLmZhc3RVcGRhdGVGcmFtZSlcbiAgICAgICAgZW50aXR5LnN0YXRlLmZyYW1lID0gbXNnLnJlYWRVSW50OCgpO1xuICAgIGVsc2VcbiAgICAgICAgZW50aXR5LnN0YXRlLmZyYW1lID0gZW50aXR5LmJhc2VsaW5lLmZyYW1lO1xuXG4gICAgaWYgKGNtZCAmIFByb3RvY29sLmZhc3RVcGRhdGVDb2xvck1hcClcbiAgICAgICAgbXNnLnJlYWRVSW50OCgpO1xuXG4gICAgaWYgKGNtZCAmIFByb3RvY29sLmZhc3RVcGRhdGVTa2luKVxuICAgICAgICBtc2cucmVhZFVJbnQ4KCk7XG4gICAgaWYgKGNtZCAmIFByb3RvY29sLmZhc3RVcGRhdGVFZmZlY3RzKVxuICAgICAgICBtc2cucmVhZFVJbnQ4KCk7XG5cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMzsgaSsrKSB7XG4gICAgICAgIGVudGl0eS5wcmlvclN0YXRlLmFuZ2xlc1tpXSA9IGVudGl0eS5uZXh0U3RhdGUuYW5nbGVzW2ldO1xuICAgICAgICBlbnRpdHkucHJpb3JTdGF0ZS5vcmlnaW5baV0gPSBlbnRpdHkubmV4dFN0YXRlLm9yaWdpbltpXTtcbiAgICB9XG5cbiAgICBpZiAoY21kICYgUHJvdG9jb2wuZmFzdFVwZGF0ZU9yaWdpbjEpXG4gICAgICAgIGVudGl0eS5uZXh0U3RhdGUub3JpZ2luWzBdID0gbXNnLnJlYWRJbnQxNigpICogMC4xMjU7XG4gICAgaWYgKGNtZCAmIFByb3RvY29sLmZhc3RVcGRhdGVBbmdsZTEpXG4gICAgICAgIGVudGl0eS5uZXh0U3RhdGUuYW5nbGVzWzBdID0gbXNnLnJlYWRJbnQ4KCkgKiAxLjQwNjI1O1xuICAgIGlmIChjbWQgJiBQcm90b2NvbC5mYXN0VXBkYXRlT3JpZ2luMilcbiAgICAgICAgZW50aXR5Lm5leHRTdGF0ZS5vcmlnaW5bMV0gPSBtc2cucmVhZEludDE2KCkgKiAwLjEyNTtcbiAgICBpZiAoY21kICYgUHJvdG9jb2wuZmFzdFVwZGF0ZUFuZ2xlMilcbiAgICAgICAgZW50aXR5Lm5leHRTdGF0ZS5hbmdsZXNbMV0gPSBtc2cucmVhZEludDgoKSAqIDEuNDA2MjU7XG4gICAgaWYgKGNtZCAmIFByb3RvY29sLmZhc3RVcGRhdGVPcmlnaW4zKVxuICAgICAgICBlbnRpdHkubmV4dFN0YXRlLm9yaWdpblsyXSA9IG1zZy5yZWFkSW50MTYoKSAqIDAuMTI1O1xuICAgIGlmIChjbWQgJiBQcm90b2NvbC5mYXN0VXBkYXRlQW5nbGUzKVxuICAgICAgICBlbnRpdHkubmV4dFN0YXRlLmFuZ2xlc1syXSA9IG1zZy5yZWFkSW50OCgpICogMS40MDYyNTtcbn07XG5cbkNsaWVudC5wcm90b3R5cGUucGFyc2VTb3VuZCA9IGZ1bmN0aW9uKG1zZykge1xuICAgIHZhciBiaXRzID0gbXNnLnJlYWRVSW50OCgpO1xuICAgIHZhciB2b2x1bWUgPSAoYml0cyAmIFByb3RvY29sLnNvdW5kVm9sdW1lKSA/IG1zZy5yZWFkVUludDgoKSA6IDI1NTtcbiAgICB2YXIgYXR0ZW51YXRpb24gPSAoYml0cyAmIFByb3RvY29sLnNvdW5kQXR0ZW51YXRpb24pID8gbXNnLnJlYWRVSW50OCgpIC8gNjQuMCA6IDEuMDtcbiAgICB2YXIgY2hhbm5lbCA9IG1zZy5yZWFkSW50MTYoKTtcbiAgICB2YXIgc291bmRJbmRleCA9IG1zZy5yZWFkVUludDgoKTtcblxuICAgIHZhciBwb3MgPSB2ZWMzLmNyZWF0ZSgpO1xuICAgIHBvc1swXSA9IG1zZy5yZWFkSW50MTYoKSAqIDAuMTI1O1xuICAgIHBvc1sxXSA9IG1zZy5yZWFkSW50MTYoKSAqIDAuMTI1O1xuICAgIHBvc1syXSA9IG1zZy5yZWFkSW50MTYoKSAqIDAuMTI1O1xufTtcblxuQ2xpZW50LnByb3RvdHlwZS5wYXJzZVRlbXBFbnRpdHkgPSBmdW5jdGlvbihtc2cpIHtcbiAgICB2YXIgdHlwZSA9IG1zZy5yZWFkVUludDgoKTtcbiAgICB2YXIgcG9zID0gdmVjMy5jcmVhdGUoKTtcbiAgICBzd2l0Y2godHlwZSkge1xuICAgICAgICBjYXNlIFByb3RvY29sLnRlbXBHdW5TaG90OlxuICAgICAgICBjYXNlIFByb3RvY29sLnRlbXBXaXpTcGlrZTpcbiAgICAgICAgY2FzZSBQcm90b2NvbC50ZW1wU3Bpa2U6XG4gICAgICAgIGNhc2UgUHJvdG9jb2wudGVtcEV4cGxvc2lvbjpcbiAgICAgICAgICAgIHBvc1swXSA9IG1zZy5yZWFkSW50MTYoKSAqIDAuMTI1O1xuICAgICAgICAgICAgcG9zWzFdID0gbXNnLnJlYWRJbnQxNigpICogMC4xMjU7XG4gICAgICAgICAgICBwb3NbMl0gPSBtc2cucmVhZEludDE2KCkgKiAwLjEyNTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgJ1Vua25vd24gdGVtcC4gZW50aXR5IGVuY291bnRlcmVkOiAnICsgdHlwZTtcbiAgICB9XG59O1xuXG5DbGllbnQucHJvdG90eXBlLnBhcnNlRGFtYWdlID0gZnVuY3Rpb24obXNnKSB7XG4gICAgdmFyIGFybW9yID0gbXNnLnJlYWRVSW50OCgpO1xuICAgIHZhciBibG9vZCA9IG1zZy5yZWFkVUludDgoKTtcblxuICAgIHZhciBwb3MgPSB2ZWMzLmNyZWF0ZSgpO1xuICAgIHBvc1swXSA9IG1zZy5yZWFkSW50MTYoKSAqIDAuMTI1O1xuICAgIHBvc1sxXSA9IG1zZy5yZWFkSW50MTYoKSAqIDAuMTI1O1xuICAgIHBvc1syXSA9IG1zZy5yZWFkSW50MTYoKSAqIDAuMTI1O1xufTtcblxuQ2xpZW50LnByb3RvdHlwZS5wYXJzZVBhcnRpY2xlID0gZnVuY3Rpb24obXNnKSB7XG4gICAgdmFyIHBvcyA9IHZlYzMuY3JlYXRlKCk7XG4gICAgdmFyIGFuZ2xlcyA9IHZlYzMuY3JlYXRlKCk7XG4gICAgcG9zWzBdID0gbXNnLnJlYWRJbnQxNigpICogMC4xMjU7XG4gICAgcG9zWzFdID0gbXNnLnJlYWRJbnQxNigpICogMC4xMjU7XG4gICAgcG9zWzJdID0gbXNnLnJlYWRJbnQxNigpICogMC4xMjU7XG4gICAgYW5nbGVzWzBdID0gbXNnLnJlYWRJbnQ4KCkgKiAwLjA2MjU7XG4gICAgYW5nbGVzWzFdID0gbXNnLnJlYWRJbnQ4KCkgKiAwLjA2MjU7XG4gICAgYW5nbGVzWzJdID0gbXNnLnJlYWRJbnQ4KCkgKiAwLjA2MjU7XG4gICAgdmFyIGNvdW50ID0gbXNnLnJlYWRVSW50OCgpO1xuICAgIHZhciBjb2xvciA9IG1zZy5yZWFkVUludDgoKTtcbn07XG5cbkNsaWVudC5wcm90b3R5cGUucGFyc2VCYXNlbGluZSA9IGZ1bmN0aW9uKG1zZykge1xuICAgIG1zZy5za2lwKDEzKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IENsaWVudDtcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiMVlpWjVTXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvY2xpZW50LmpzXCIsXCIvXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIEJ1ZmZlciA9IHJlcXVpcmUoJ2J1ZmZlcicpLkJ1ZmZlcjtcblxudmFyIEZpbGUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgdGhpcy5idWZmZXIgPSBuZXcgQnVmZmVyKGRhdGEpO1xuICAgIHRoaXMub2Zmc2V0ID0gMDtcbn07XG5cbkZpbGUucHJvdG90eXBlLnRlbGwgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5vZmZzZXQ7XG59O1xuXG5GaWxlLnByb3RvdHlwZS5zZWVrID0gZnVuY3Rpb24ob2Zmc2V0KSB7XG4gICAgdGhpcy5vZmZzZXQgPSBvZmZzZXQ7XG59O1xuXG5GaWxlLnByb3RvdHlwZS5za2lwID0gZnVuY3Rpb24oYnl0ZXMpIHtcbiAgICB0aGlzLm9mZnNldCArPSBieXRlcztcbn07XG5cbkZpbGUucHJvdG90eXBlLmVvZiA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLm9mZnNldCA+PSB0aGlzLmJ1ZmZlci5sZW5ndGg7XG59O1xuXG5GaWxlLnByb3RvdHlwZS5zbGljZSA9IGZ1bmN0aW9uKG9mZnNldCwgbGVuZ3RoKSB7XG4gICAgcmV0dXJuIG5ldyBGaWxlKHRoaXMuYnVmZmVyLnNsaWNlKG9mZnNldCwgb2Zmc2V0ICsgbGVuZ3RoKSk7XG59O1xuXG5GaWxlLnByb3RvdHlwZS5yZWFkID0gZnVuY3Rpb24obGVuZ3RoKSB7XG4gICAgdmFyIHJlc3VsdCA9IG5ldyBGaWxlKHRoaXMuYnVmZmVyLnNsaWNlKHRoaXMub2Zmc2V0LCB0aGlzLm9mZnNldCArIGxlbmd0aCkpO1xuICAgIHRoaXMub2Zmc2V0ICs9IGxlbmd0aDtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuRmlsZS5wcm90b3R5cGUucmVhZFN0cmluZyA9IGZ1bmN0aW9uKGxlbmd0aCkge1xuICAgIHZhciByZXN1bHQgPSAnJztcbiAgICB2YXIgdGVybWluYXRlZCA9IGZhbHNlO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGJ5dGUgPSB0aGlzLmJ1ZmZlci5yZWFkVUludDgodGhpcy5vZmZzZXQrKyk7XG4gICAgICAgIGlmIChieXRlID09PSAweDApIHRlcm1pbmF0ZWQgPSB0cnVlO1xuICAgICAgICBpZiAoIXRlcm1pbmF0ZWQpXG4gICAgICAgICAgICByZXN1bHQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbkZpbGUucHJvdG90eXBlLnJlYWRDU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHJlc3VsdCA9ICcnO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTI4OyBpKyspIHtcbiAgICAgICAgdmFyIGJ5dGUgPSB0aGlzLmJ1ZmZlci5yZWFkVUludDgodGhpcy5vZmZzZXQrKyk7XG4gICAgICAgIGlmIChieXRlID09PSAweDApIHJldHVybiByZXN1bHQ7XG4gICAgICAgIHJlc3VsdCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGUpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuRmlsZS5wcm90b3R5cGUucmVhZFVJbnQ4ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuYnVmZmVyLnJlYWRVSW50OCh0aGlzLm9mZnNldCsrKTtcbn07XG5cbkZpbGUucHJvdG90eXBlLnJlYWRJbnQ4ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuYnVmZmVyLnJlYWRJbnQ4KHRoaXMub2Zmc2V0KyspO1xufTtcblxuRmlsZS5wcm90b3R5cGUucmVhZFVJbnQxNiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByZXN1bHQgPSB0aGlzLmJ1ZmZlci5yZWFkVUludDE2TEUodGhpcy5vZmZzZXQpO1xuICAgIHRoaXMub2Zmc2V0ICs9IDI7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbkZpbGUucHJvdG90eXBlLnJlYWRJbnQxNiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByZXN1bHQgPSB0aGlzLmJ1ZmZlci5yZWFkSW50MTZMRSh0aGlzLm9mZnNldCk7XG4gICAgdGhpcy5vZmZzZXQgKz0gMjtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuRmlsZS5wcm90b3R5cGUucmVhZFVJbnQzMiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByZXN1bHQgPSB0aGlzLmJ1ZmZlci5yZWFkVUludDMyTEUodGhpcy5vZmZzZXQpO1xuICAgIHRoaXMub2Zmc2V0ICs9IDQ7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbkZpbGUucHJvdG90eXBlLnJlYWRJbnQzMiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByZXN1bHQgPSB0aGlzLmJ1ZmZlci5yZWFkSW50MzJMRSh0aGlzLm9mZnNldCk7XG4gICAgdGhpcy5vZmZzZXQgKz0gNDtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuRmlsZS5wcm90b3R5cGUucmVhZEZsb2F0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHJlc3VsdCA9IHRoaXMuYnVmZmVyLnJlYWRGbG9hdExFKHRoaXMub2Zmc2V0KTtcbiAgICB0aGlzLm9mZnNldCArPSA0O1xuICAgIHJldHVybiByZXN1bHQ7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBGaWxlO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIjFZaVo1U1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2ZpbGUuanNcIixcIi9cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG5cbnZhciBCc3AgPSBmdW5jdGlvbihmaWxlKSB7XG4gICAgdmFyIGhlYWRlciA9IHtcbiAgICAgICAgdmVyc2lvbjogZmlsZS5yZWFkSW50MzIoKSxcbiAgICAgICAgZW50aXRpZXM6IHtvZmZzZXQ6IGZpbGUucmVhZEludDMyKCksIHNpemU6IGZpbGUucmVhZEludDMyKCl9LFxuICAgICAgICBwbGFuZXM6IHtvZmZzZXQ6IGZpbGUucmVhZEludDMyKCksIHNpemU6IGZpbGUucmVhZEludDMyKCl9LFxuICAgICAgICBtaXB0ZXhzOiB7b2Zmc2V0OiBmaWxlLnJlYWRJbnQzMigpLCBzaXplOiBmaWxlLnJlYWRJbnQzMigpfSxcbiAgICAgICAgdmVydGljZXM6IHtvZmZzZXQ6IGZpbGUucmVhZEludDMyKCksIHNpemU6IGZpbGUucmVhZEludDMyKCl9LFxuICAgICAgICB2aXNpbGlzdDoge29mZnNldDogZmlsZS5yZWFkSW50MzIoKSwgc2l6ZTogZmlsZS5yZWFkSW50MzIoKX0sXG4gICAgICAgIG5vZGVzOiB7b2Zmc2V0OiBmaWxlLnJlYWRJbnQzMigpLCBzaXplOiBmaWxlLnJlYWRJbnQzMigpfSxcbiAgICAgICAgdGV4aW5mb3M6IHtvZmZzZXQ6IGZpbGUucmVhZEludDMyKCksIHNpemU6IGZpbGUucmVhZEludDMyKCl9LFxuICAgICAgICBmYWNlczoge29mZnNldDogZmlsZS5yZWFkSW50MzIoKSwgc2l6ZTogZmlsZS5yZWFkSW50MzIoKX0sXG4gICAgICAgIGxpZ2h0bWFwczoge29mZnNldDogZmlsZS5yZWFkSW50MzIoKSwgc2l6ZTogZmlsZS5yZWFkSW50MzIoKX0sXG4gICAgICAgIGNsaXBub2Rlczoge29mZnNldDogZmlsZS5yZWFkSW50MzIoKSwgc2l6ZTogZmlsZS5yZWFkSW50MzIoKX0sXG4gICAgICAgIGxlYXZlczoge29mZnNldDogZmlsZS5yZWFkSW50MzIoKSwgc2l6ZTogZmlsZS5yZWFkSW50MzIoKX0sXG4gICAgICAgIGxmYWNlczoge29mZnNldDogZmlsZS5yZWFkSW50MzIoKSwgc2l6ZTogZmlsZS5yZWFkSW50MzIoKX0sXG4gICAgICAgIGVkZ2VzOiB7b2Zmc2V0OiBmaWxlLnJlYWRJbnQzMigpLCBzaXplOiBmaWxlLnJlYWRJbnQzMigpfSxcbiAgICAgICAgbGVkZ2VzOiB7b2Zmc2V0OiBmaWxlLnJlYWRJbnQzMigpLCBzaXplOiBmaWxlLnJlYWRJbnQzMigpfSxcbiAgICAgICAgbW9kZWxzOiB7b2Zmc2V0OiBmaWxlLnJlYWRJbnQzMigpLCBzaXplOiBmaWxlLnJlYWRJbnQzMigpfVxuICAgIH07XG5cbiAgICB0aGlzLmxvYWRUZXh0dXJlcyhmaWxlLCBoZWFkZXIubWlwdGV4cyk7XG4gICAgdGhpcy5sb2FkVGV4SW5mb3MoZmlsZSwgaGVhZGVyLnRleGluZm9zKTtcbiAgICB0aGlzLmxvYWRMaWdodE1hcHMoZmlsZSwgaGVhZGVyLmxpZ2h0bWFwcyk7XG5cbiAgICB0aGlzLmxvYWRNb2RlbHMoZmlsZSwgaGVhZGVyLm1vZGVscyk7XG4gICAgdGhpcy5sb2FkVmVydGljZXMoZmlsZSwgaGVhZGVyLnZlcnRpY2VzKTtcbiAgICB0aGlzLmxvYWRFZGdlcyhmaWxlLCBoZWFkZXIuZWRnZXMpO1xuICAgIHRoaXMubG9hZFN1cmZhY2VFZGdlcyhmaWxlLCBoZWFkZXIubGVkZ2VzKTtcbiAgICB0aGlzLmxvYWRTdXJmYWNlcyhmaWxlLCBoZWFkZXIuZmFjZXMpO1xufTtcblxuQnNwLnByb3RvdHlwZS5sb2FkVmVydGljZXMgPSBmdW5jdGlvbihmaWxlLCBsdW1wKSB7XG4gICAgdGhpcy52ZXJ0ZXhDb3VudCA9IGx1bXAuc2l6ZSAvIDEyO1xuICAgIHRoaXMudmVydGljZXMgPSBbXTtcbiAgICBmaWxlLnNlZWsobHVtcC5vZmZzZXQpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy52ZXJ0ZXhDb3VudDsgaSsrKSB7XG4gICAgICAgIHRoaXMudmVydGljZXMucHVzaCh7XG4gICAgICAgICAgICB4OiBmaWxlLnJlYWRGbG9hdCgpLFxuICAgICAgICAgICAgeTogZmlsZS5yZWFkRmxvYXQoKSxcbiAgICAgICAgICAgIHo6IGZpbGUucmVhZEZsb2F0KClcbiAgICAgICAgfSk7XG4gICAgfVxufTtcblxuQnNwLnByb3RvdHlwZS5sb2FkRWRnZXMgPSBmdW5jdGlvbihmaWxlLCBsdW1wKSB7XG4gICAgdmFyIGVkZ2VDb3VudCA9IGx1bXAuc2l6ZSAvIDQ7XG4gICAgdGhpcy5lZGdlcyA9IFtdO1xuICAgIGZpbGUuc2VlayhsdW1wLm9mZnNldCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlZGdlQ291bnQgKiA0OyBpKyspXG4gICAgICAgIHRoaXMuZWRnZXMucHVzaChmaWxlLnJlYWRVSW50MTYoKSk7XG59O1xuXG5Cc3AucHJvdG90eXBlLmxvYWRTdXJmYWNlRWRnZXMgPSBmdW5jdGlvbihmaWxlLCBsdW1wKSB7XG4gICAgdmFyIGVkZ2VMaXN0Q291bnQgPSBsdW1wLnNpemUgLyA0O1xuICAgIHRoaXMuZWRnZUxpc3QgPSBbXTtcbiAgICBmaWxlLnNlZWsobHVtcC5vZmZzZXQpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWRnZUxpc3RDb3VudDsgaSsrKSB7XG4gICAgICAgIHRoaXMuZWRnZUxpc3QucHVzaChmaWxlLnJlYWRJbnQzMigpKTtcbiAgICB9XG59O1xuXG5Cc3AucHJvdG90eXBlLmNhbGN1bGF0ZVN1cmZhY2VFeHRlbnRzID0gZnVuY3Rpb24oc3VyZmFjZSkge1xuICAgIHZhciBtaW5TID0gOTk5OTk7XG4gICAgdmFyIG1heFMgPSAtOTk5OTk7XG4gICAgdmFyIG1pblQgPSA5OTk5OTtcbiAgICB2YXIgbWF4VCA9IC05OTk5OTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3VyZmFjZS5lZGdlQ291bnQ7IGkrKykge1xuICAgICAgICB2YXIgZWRnZUluZGV4ID0gdGhpcy5lZGdlTGlzdFtzdXJmYWNlLmVkZ2VTdGFydCArIGldO1xuICAgICAgICB2YXIgdmkgPSBlZGdlSW5kZXggPj0gMCA/IHRoaXMuZWRnZXNbZWRnZUluZGV4ICogMl0gOiB0aGlzLmVkZ2VzWy1lZGdlSW5kZXggKiAyICsgMV07XG4gICAgICAgIHZhciB2ID0gW3RoaXMudmVydGljZXNbdmldLngsIHRoaXMudmVydGljZXNbdmldLnksIHRoaXMudmVydGljZXNbdmldLnpdO1xuICAgICAgICB2YXIgdGV4SW5mbyA9IHRoaXMudGV4SW5mb3Nbc3VyZmFjZS50ZXhJbmZvSWRdO1xuXG4gICAgICAgIHZhciBzID0gdmVjMy5kb3QodiwgdGV4SW5mby52ZWN0b3JTKSArIHRleEluZm8uZGlzdFM7XG4gICAgICAgIG1pblMgPSBNYXRoLm1pbihtaW5TLCBzKTtcbiAgICAgICAgbWF4UyA9IE1hdGgubWF4KG1heFMsIHMpO1xuXG4gICAgICAgIHZhciB0ID0gdmVjMy5kb3QodiwgdGV4SW5mby52ZWN0b3JUKSArIHRleEluZm8uZGlzdFQ7XG4gICAgICAgIG1pblQgPSBNYXRoLm1pbihtaW5ULCB0KTtcbiAgICAgICAgbWF4VCA9IE1hdGgubWF4KG1heFQsIHQpO1xuICAgIH1cblxuICAgIC8qIENvbnZlcnQgdG8gaW50cyAqL1xuICAgIG1pblMgPSBNYXRoLmZsb29yKG1pblMgLyAxNik7XG4gICAgbWluVCA9IE1hdGguZmxvb3IobWluVCAvIDE2KTtcbiAgICBtYXhTID0gTWF0aC5jZWlsKG1heFMgLyAxNik7XG4gICAgbWF4VCA9IE1hdGguY2VpbChtYXhUIC8gMTYpO1xuXG4gICAgc3VyZmFjZS50ZXh0dXJlTWlucyA9IFttaW5TICogMTYsIG1pblQgKiAxNl07XG4gICAgc3VyZmFjZS5leHRlbnRzID0gWyhtYXhTIC0gbWluUykgKiAxNiwgKG1heFQgLSBtaW5UKSAqIDE2XTtcbn07XG5cbkJzcC5wcm90b3R5cGUubG9hZFN1cmZhY2VzID0gZnVuY3Rpb24gKGZpbGUsIGx1bXApIHtcblxuICAgIHZhciBzdXJmYWNlQ291bnQgPSBsdW1wLnNpemUgLyAyMDtcbiAgICB0aGlzLnN1cmZhY2VzID0gW107XG4gICAgZmlsZS5zZWVrKGx1bXAub2Zmc2V0KTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN1cmZhY2VDb3VudDsgaSsrKSB7XG4gICAgICAgIHZhciBzdXJmYWNlID0ge307XG4gICAgICAgIHN1cmZhY2UucGxhbmVJZCA9IGZpbGUucmVhZFVJbnQxNigpO1xuICAgICAgICBzdXJmYWNlLnNpZGUgPSBmaWxlLnJlYWRVSW50MTYoKTtcbiAgICAgICAgc3VyZmFjZS5lZGdlU3RhcnQgPSBmaWxlLnJlYWRJbnQzMigpO1xuICAgICAgICBzdXJmYWNlLmVkZ2VDb3VudCA9IGZpbGUucmVhZEludDE2KCk7XG4gICAgICAgIHN1cmZhY2UudGV4SW5mb0lkID0gZmlsZS5yZWFkVUludDE2KCk7XG5cbiAgICAgICAgc3VyZmFjZS5saWdodFN0eWxlcyA9IFtmaWxlLnJlYWRVSW50OCgpLCBmaWxlLnJlYWRVSW50OCgpLCBmaWxlLnJlYWRVSW50OCgpLCBmaWxlLnJlYWRVSW50OCgpXTtcbiAgICAgICAgc3VyZmFjZS5saWdodE1hcE9mZnNldCA9IGZpbGUucmVhZEludDMyKCk7XG4gICAgICAgIHN1cmZhY2UuZmxhZ3MgPSAwO1xuICAgICAgICB0aGlzLmNhbGN1bGF0ZVN1cmZhY2VFeHRlbnRzKHN1cmZhY2UpO1xuICAgICAgICB0aGlzLnN1cmZhY2VzLnB1c2goc3VyZmFjZSk7XG4gICAgfVxufTtcblxuQnNwLnByb3RvdHlwZS5sb2FkVGV4dHVyZXMgPSBmdW5jdGlvbihmaWxlLCBsdW1wKSB7XG4gICAgZmlsZS5zZWVrKGx1bXAub2Zmc2V0KTtcbiAgICB2YXIgdGV4dHVyZUNvdW50ID0gZmlsZS5yZWFkSW50MzIoKTtcblxuICAgIHRoaXMudGV4dHVyZXMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRleHR1cmVDb3VudDsgaSsrKSB7XG4gICAgICAgIHZhciB0ZXh0dXJlT2Zmc2V0ID0gZmlsZS5yZWFkSW50MzIoKTtcbiAgICAgICAgdmFyIG9yaWdpbmFsT2Zmc2V0ID0gZmlsZS50ZWxsKCk7XG4gICAgICAgIGZpbGUuc2VlayhsdW1wLm9mZnNldCArIHRleHR1cmVPZmZzZXQpO1xuICAgICAgICB2YXIgdGV4dHVyZSA9IHtcbiAgICAgICAgICAgIG5hbWU6IGZpbGUucmVhZFN0cmluZygxNiksXG4gICAgICAgICAgICB3aWR0aDogZmlsZS5yZWFkVUludDMyKCksXG4gICAgICAgICAgICBoZWlnaHQ6IGZpbGUucmVhZFVJbnQzMigpLFxuICAgICAgICB9O1xuICAgICAgICB2YXIgb2Zmc2V0ID0gbHVtcC5vZmZzZXQgKyB0ZXh0dXJlT2Zmc2V0ICsgZmlsZS5yZWFkVUludDMyKCk7XG4gICAgICAgIHRleHR1cmUuZGF0YSA9IGZpbGUuc2xpY2Uob2Zmc2V0LCB0ZXh0dXJlLndpZHRoICogdGV4dHVyZS5oZWlnaHQpO1xuICAgICAgICB0aGlzLnRleHR1cmVzLnB1c2godGV4dHVyZSk7XG5cbiAgICAgICAgZmlsZS5zZWVrKG9yaWdpbmFsT2Zmc2V0KTtcbiAgICB9XG59O1xuXG5Cc3AucHJvdG90eXBlLmxvYWRUZXhJbmZvcyA9IGZ1bmN0aW9uKGZpbGUsIGx1bXApIHtcbiAgICBmaWxlLnNlZWsobHVtcC5vZmZzZXQpO1xuICAgIHZhciB0ZXhJbmZvQ291bnQgPSBsdW1wLnNpemUgLyA0MDtcbiAgICB0aGlzLnRleEluZm9zID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0ZXhJbmZvQ291bnQ7IGkrKykge1xuICAgICAgICB2YXIgaW5mbyA9IHt9O1xuICAgICAgICBpbmZvLnZlY3RvclMgPSBbZmlsZS5yZWFkRmxvYXQoKSwgZmlsZS5yZWFkRmxvYXQoKSwgZmlsZS5yZWFkRmxvYXQoKV07XG4gICAgICAgIGluZm8uZGlzdFMgPSBmaWxlLnJlYWRGbG9hdCgpO1xuICAgICAgICBpbmZvLnZlY3RvclQgPSBbZmlsZS5yZWFkRmxvYXQoKSwgZmlsZS5yZWFkRmxvYXQoKSwgZmlsZS5yZWFkRmxvYXQoKV07XG4gICAgICAgIGluZm8uZGlzdFQgPSBmaWxlLnJlYWRGbG9hdCgpO1xuICAgICAgICBpbmZvLnRleHR1cmVJZCA9IGZpbGUucmVhZFVJbnQzMigpO1xuICAgICAgICBpbmZvLmFuaW1hdGVkID0gZmlsZS5yZWFkVUludDMyKCkgPT0gMTtcbiAgICAgICAgdGhpcy50ZXhJbmZvcy5wdXNoKGluZm8pO1xuICAgIH1cbn07XG5cbkJzcC5wcm90b3R5cGUubG9hZE1vZGVscyA9IGZ1bmN0aW9uKGZpbGUsIGx1bXApIHtcbiAgICBmaWxlLnNlZWsobHVtcC5vZmZzZXQpO1xuICAgIHZhciBtb2RlbENvdW50ID0gbHVtcC5zaXplIC8gNjQ7XG4gICAgdGhpcy5tb2RlbHMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1vZGVsQ291bnQ7IGkrKykge1xuXG4gICAgICAgIHZhciBtb2RlbCA9IHt9O1xuICAgICAgICBtb2RlbC5taW5zID0gdmVjMy5jcmVhdGUoW2ZpbGUucmVhZEZsb2F0KCksIGZpbGUucmVhZEZsb2F0KCksIGZpbGUucmVhZEZsb2F0KCldKTtcbiAgICAgICAgbW9kZWwubWF4ZXMgPSB2ZWMzLmNyZWF0ZShbZmlsZS5yZWFkRmxvYXQoKSwgZmlsZS5yZWFkRmxvYXQoKSwgZmlsZS5yZWFkRmxvYXQoKV0pO1xuICAgICAgICBtb2RlbC5vcmlnaW4gPSB2ZWMzLmNyZWF0ZShbZmlsZS5yZWFkRmxvYXQoKSwgZmlsZS5yZWFkRmxvYXQoKSwgZmlsZS5yZWFkRmxvYXQoKV0pO1xuICAgICAgICBtb2RlbC5ic3BOb2RlID0gZmlsZS5yZWFkSW50MzIoKTtcbiAgICAgICAgbW9kZWwuY2xpcE5vZGUxID0gZmlsZS5yZWFkSW50MzIoKTtcbiAgICAgICAgbW9kZWwuY2xpcE5vZGUyID0gZmlsZS5yZWFkSW50MzIoKTtcbiAgICAgICAgZmlsZS5yZWFkSW50MzIoKTsgLy8gU2tpcCBmb3Igbm93LlxuICAgICAgICBtb2RlbC52aXNMZWFmcyA9IGZpbGUucmVhZEludDMyKCk7XG4gICAgICAgIG1vZGVsLmZpcnN0U3VyZmFjZSA9IGZpbGUucmVhZEludDMyKCk7XG4gICAgICAgIG1vZGVsLnN1cmZhY2VDb3VudCA9IGZpbGUucmVhZEludDMyKCk7XG4gICAgICAgIHRoaXMubW9kZWxzLnB1c2gobW9kZWwpO1xuICAgIH1cbn07XG5cblxuQnNwLnByb3RvdHlwZS5sb2FkTGlnaHRNYXBzID0gZnVuY3Rpb24gKGZpbGUsIGx1bXApIHtcbiAgICBmaWxlLnNlZWsobHVtcC5vZmZzZXQpO1xuICAgIHRoaXMubGlnaHRNYXBzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsdW1wLnNpemU7IGkrKylcbiAgICAgICAgdGhpcy5saWdodE1hcHMucHVzaChmaWxlLnJlYWRVSW50OCgpKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IEJzcDtcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiMVlpWjVTXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvZm9ybWF0cy9ic3AuanNcIixcIi9mb3JtYXRzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIEZpbGUgPSByZXF1aXJlKCdmaWxlJyk7XG52YXIgV2FkID0gcmVxdWlyZSgnZm9ybWF0cy93YWQnKTtcbnZhciBQYWxldHRlID0gcmVxdWlyZSgnZm9ybWF0cy9wYWxldHRlJyk7XG5cbnZhciBQYWsgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgdmFyIGZpbGUgPSBuZXcgRmlsZShkYXRhKTtcblxuICAgIGlmIChmaWxlLnJlYWRTdHJpbmcoNCkgIT09ICdQQUNLJylcbiAgICAgICAgdGhyb3cgJ0Vycm9yOiBDb3JydXB0IFBBSyBmaWxlLic7XG5cbiAgICB2YXIgaW5kZXhPZmZzZXQgPSBmaWxlLnJlYWRVSW50MzIoKTtcbiAgICB2YXIgaW5kZXhGaWxlQ291bnQgPSBmaWxlLnJlYWRVSW50MzIoKSAvIDY0O1xuXG4gICAgZmlsZS5zZWVrKGluZGV4T2Zmc2V0KTtcbiAgICB0aGlzLmluZGV4ID0ge307XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbmRleEZpbGVDb3VudDsgaSsrKSB7XG4gICAgICAgIHZhciBwYXRoID0gZmlsZS5yZWFkU3RyaW5nKDU2KTtcbiAgICAgICAgdmFyIG9mZnNldCA9IGZpbGUucmVhZFVJbnQzMigpO1xuICAgICAgICB2YXIgc2l6ZSA9IGZpbGUucmVhZFVJbnQzMigpO1xuICAgICAgICB0aGlzLmluZGV4W3BhdGhdID0geyBvZmZzZXQ6IG9mZnNldCwgc2l6ZTogc2l6ZSB9O1xuICAgIH1cbiAgICBjb25zb2xlLmxvZygnUEFLOiBMb2FkZWQgJWkgZW50cmllcy4nLCBpbmRleEZpbGVDb3VudCk7XG5cbiAgICB0aGlzLmZpbGUgPSBmaWxlO1xufTtcblxuUGFrLnByb3RvdHlwZS5sb2FkID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBlbnRyeSA9IHRoaXMuaW5kZXhbbmFtZV07XG4gICAgaWYgKCFlbnRyeSlcbiAgICAgICAgdGhyb3cgJ0Vycm9yOiBDYW5cXCd0IGZpbmQgZW50cnkgaW4gUEFLOiAnICsgbmFtZTtcbiAgICByZXR1cm4gdGhpcy5maWxlLnNsaWNlKGVudHJ5Lm9mZnNldCwgZW50cnkuc2l6ZSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBQYWs7XG59KS5jYWxsKHRoaXMscmVxdWlyZShcIjFZaVo1U1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2Zvcm1hdHMvcGFrLmpzXCIsXCIvZm9ybWF0c1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcblxudmFyIFBhbGV0dGUgPSBmdW5jdGlvbihmaWxlKSB7XG4gICAgdGhpcy5jb2xvcnMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDI1NjsgaSsrKSB7XG4gICAgICAgIHRoaXMuY29sb3JzLnB1c2goe1xuICAgICAgICAgICAgcjogZmlsZS5yZWFkVUludDgoKSxcbiAgICAgICAgICAgIGc6IGZpbGUucmVhZFVJbnQ4KCksXG4gICAgICAgICAgICBiOiBmaWxlLnJlYWRVSW50OCgpXG4gICAgICAgIH0pO1xuICAgIH1cbn07XG5cblBhbGV0dGUucHJvdG90eXBlLnVucGFjayA9IGZ1bmN0aW9uKGZpbGUsIHdpZHRoLCBoZWlnaHQsIGFscGhhKSB7XG4gICAgdmFyIHBpeGVscyA9IG5ldyBVaW50OEFycmF5KDQgKiB3aWR0aCAqIGhlaWdodCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB3aWR0aCAqIGhlaWdodDsgaSsrKSB7XG4gICAgICAgIHZhciBpbmRleCA9IGZpbGUucmVhZFVJbnQ4KCk7XG4gICAgICAgIHZhciBjb2xvciA9IHRoaXMuY29sb3JzW2luZGV4XTtcbiAgICAgICAgcGl4ZWxzW2kqNF0gPSBjb2xvci5yO1xuICAgICAgICBwaXhlbHNbaSo0KzFdID0gY29sb3IuZztcbiAgICAgICAgcGl4ZWxzW2kqNCsyXSA9IGNvbG9yLmI7XG4gICAgICAgIHBpeGVsc1tpKjQrM10gPSAoYWxwaGEgJiYgIWluZGV4KSA/IDAgOiAyNTU7XG4gICAgfVxuICAgIHJldHVybiBwaXhlbHM7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBQYWxldHRlO1xufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIxWWlaNVNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9mb3JtYXRzL3BhbGV0dGUuanNcIixcIi9mb3JtYXRzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuXG52YXIgV2FkID0gZnVuY3Rpb24oZmlsZSkge1xuICAgIHRoaXMubHVtcHMgPSBbXTtcbiAgICBpZiAoZmlsZS5yZWFkU3RyaW5nKDQpICE9PSAnV0FEMicpXG4gICAgICAgIHRocm93ICdFcnJvcjogQ29ycnVwdCBXQUQtZmlsZSBlbmNvdW50ZXJlZC4nO1xuXG4gICAgdmFyIGx1bXBDb3VudCA9IGZpbGUucmVhZFVJbnQzMigpO1xuICAgIHZhciBvZmZzZXQgPSBmaWxlLnJlYWRVSW50MzIoKTtcblxuICAgIGZpbGUuc2VlayhvZmZzZXQpO1xuICAgIHZhciBpbmRleCA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbHVtcENvdW50OyBpKyspIHtcbiAgICAgICAgdmFyIG9mZnNldCA9IGZpbGUucmVhZFVJbnQzMigpO1xuICAgICAgICBmaWxlLnNraXAoNCk7XG4gICAgICAgIHZhciBzaXplID0gZmlsZS5yZWFkVUludDMyKCk7XG4gICAgICAgIHZhciB0eXBlID0gZmlsZS5yZWFkVUludDgoKTtcbiAgICAgICAgZmlsZS5za2lwKDMpO1xuICAgICAgICB2YXIgbmFtZSA9IGZpbGUucmVhZFN0cmluZygxNik7XG4gICAgICAgIGluZGV4LnB1c2goeyBuYW1lOiBuYW1lLCBvZmZzZXQ6IG9mZnNldCwgc2l6ZTogc2l6ZSB9KTtcbiAgICB9XG5cbiAgICB0aGlzLmx1bXBzID0ge307XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbmRleC5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgZW50cnkgPSBpbmRleFtpXTtcbiAgICAgICAgdGhpcy5sdW1wc1tlbnRyeS5uYW1lXSA9IGZpbGUuc2xpY2UoZW50cnkub2Zmc2V0LCBlbnRyeS5zaXplKTtcbiAgICB9XG4gICAgY29uc29sZS5sb2coJ1dBRDogTG9hZGVkICVzIGx1bXBzLicsIGx1bXBDb3VudCk7XG59O1xuXG5XYWQucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgZmlsZSA9IHRoaXMubHVtcHNbbmFtZV07XG4gICAgaWYgKCFmaWxlKVxuICAgICAgICB0aHJvdyAnRXJyb3I6IE5vIHN1Y2ggZW50cnkgZm91bmQgaW4gV0FEOiAnICsgbmFtZTtcbiAgICByZXR1cm4gZmlsZTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IFdhZDtcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiMVlpWjVTXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvZm9ybWF0cy93YWQuanNcIixcIi9mb3JtYXRzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIFRleHR1cmUgPSByZXF1aXJlKCdnbC90ZXh0dXJlJyk7XG5cbnZhciBBdGxhcyA9IGZ1bmN0aW9uICh3aWR0aCwgaGVpZ2h0KSB7XG4gICAgdGhpcy53aWR0aCA9IHdpZHRoIHx8IDUxMjtcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodCB8fCA1MTI7XG4gICAgdGhpcy50cmVlID0geyBjaGlsZHJlbjogW10sIHg6IDAsIHk6IDAsIHdpZHRoOiB3aWR0aCwgaGVpZ2h0OiBoZWlnaHQgfTtcbiAgICB0aGlzLnN1YlRleHR1cmVzID0gW107XG4gICAgdGhpcy50ZXh0dXJlID0gbnVsbDtcbn07XG5cbkF0bGFzLnByb3RvdHlwZS5nZXRTdWJUZXh0dXJlID0gZnVuY3Rpb24gKHN1YlRleHR1cmVJZCkge1xuICAgIHJldHVybiB0aGlzLnN1YlRleHR1cmVzW3N1YlRleHR1cmVJZF07XG59O1xuXG5BdGxhcy5wcm90b3R5cGUuYWRkU3ViVGV4dHVyZSA9IGZ1bmN0aW9uICh0ZXh0dXJlKSB7XG4gICAgdmFyIG5vZGUgPSB0aGlzLmdldEZyZWVOb2RlKHRoaXMudHJlZSwgdGV4dHVyZSk7XG4gICAgaWYgKG5vZGUgPT0gbnVsbClcbiAgICAgICAgdGhyb3cgJ0Vycm9yOiBVbmFibGUgdG8gcGFjayBzdWIgdGV4dHVyZSEgSXQgc2ltcGx5IHdvblxcJ3QgZml0LiA6Lyc7XG4gICAgbm9kZS50ZXh0dXJlID0gdGV4dHVyZTtcbiAgICB0aGlzLnN1YlRleHR1cmVzLnB1c2goe1xuICAgICAgICB0ZXh0dXJlOiBub2RlLnRleHR1cmUsXG4gICAgICAgIHg6IG5vZGUueCwgeTogbm9kZS55LFxuICAgICAgICB3aWR0aDogbm9kZS53aWR0aCwgaGVpZ2h0OiBub2RlLmhlaWdodCxcbiAgICAgICAgczE6IG5vZGUueCAvIHRoaXMudHJlZS53aWR0aCxcbiAgICAgICAgdDE6IG5vZGUueSAvIHRoaXMudHJlZS5oZWlnaHQsXG4gICAgICAgIHMyOiAobm9kZS54ICsgbm9kZS53aWR0aCkgLyB0aGlzLnRyZWUud2lkdGgsXG4gICAgICAgIHQyOiAobm9kZS55ICsgbm9kZS5oZWlnaHQpIC8gdGhpcy50cmVlLmhlaWdodFxuICAgIH0pO1xuICAgIHJldHVybiB0aGlzLnN1YlRleHR1cmVzLmxlbmd0aCAtIDE7XG59O1xuXG5BdGxhcy5wcm90b3R5cGUucmV1c2VTdWJUZXh0dXJlID0gZnVuY3Rpb24gKHMxLCB0MSwgczIsIHQyKSB7XG4gICAgdGhpcy5zdWJUZXh0dXJlcy5wdXNoKHsgczE6IHMxLCB0MTogdDEsIHMyOiBzMiwgdDI6IHQyIH0pO1xufTtcblxuQXRsYXMucHJvdG90eXBlLmNvbXBpbGUgPSBmdW5jdGlvbihzaGFkZXIpIHtcblxuICAgIHZhciBidWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KHRoaXMuc3ViVGV4dHVyZXMubGVuZ3RoICogNiAqIDUpOyAvLyB4LHkseixzLHRcbiAgICB2YXIgd2lkdGggPSB0aGlzLnRyZWUud2lkdGg7XG4gICAgdmFyIGhlaWdodCA9IHRoaXMudHJlZS5oZWlnaHQ7XG4gICAgdmFyIG9mZnNldCA9IDA7XG4gICAgdmFyIHN1YlRleHR1cmVzID0gdGhpcy5zdWJUZXh0dXJlcztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN1YlRleHR1cmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBzdWJUZXh0dXJlID0gc3ViVGV4dHVyZXNbaV07XG4gICAgICAgIHRoaXMuYWRkU3ByaXRlKGJ1ZmZlciwgb2Zmc2V0LFxuICAgICAgICAgICAgc3ViVGV4dHVyZS54LCBzdWJUZXh0dXJlLnksXG4gICAgICAgICAgICBzdWJUZXh0dXJlLndpZHRoLCBzdWJUZXh0dXJlLmhlaWdodCk7XG4gICAgICAgIG9mZnNldCArPSAoNiAqIDUpO1xuICAgIH1cblxuICAgIHZhciB2ZXJ0ZXhCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcbiAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdmVydGV4QnVmZmVyKTtcbiAgICBnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgYnVmZmVyLCBnbC5TVEFUSUNfRFJBVyk7XG5cbiAgICB2YXIgdGV4dHVyZSA9IG5ldyBUZXh0dXJlKG51bGwsIHsgd2lkdGg6IHdpZHRoLCBoZWlnaHQ6IGhlaWdodC8qLCBmaWx0ZXI6IGdsLk5FQVJFU1QgKi8gfSk7XG4gICAgdGV4dHVyZS5kcmF3VG8oZnVuY3Rpb24gKHByb2plY3Rpb25NYXRyaXgpIHtcbiAgICAgICAgc2hhZGVyLnVzZSgpO1xuICAgICAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShzaGFkZXIuYXR0cmlidXRlcy52ZXJ0ZXhBdHRyaWJ1dGUpO1xuICAgICAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShzaGFkZXIuYXR0cmlidXRlcy50ZXhDb29yZHNBdHRyaWJ1dGUpO1xuICAgICAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKHNoYWRlci5hdHRyaWJ1dGVzLnZlcnRleEF0dHJpYnV0ZSwgMywgZ2wuRkxPQVQsIGZhbHNlLCAyMCwgMCk7XG4gICAgICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIoc2hhZGVyLmF0dHJpYnV0ZXMudGV4Q29vcmRzQXR0cmlidXRlLCAyLCBnbC5GTE9BVCwgZmFsc2UsIDIwLCAxMik7XG4gICAgICAgIGdsLnVuaWZvcm1NYXRyaXg0ZnYoc2hhZGVyLnVuaWZvcm1zLnByb2plY3Rpb25NYXRyaXgsIGZhbHNlLCBwcm9qZWN0aW9uTWF0cml4KTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdWJUZXh0dXJlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHN1YlRleHR1cmUgPSBzdWJUZXh0dXJlc1tpXTtcbiAgICAgICAgICAgIGlmICghc3ViVGV4dHVyZS50ZXh0dXJlKVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCBzdWJUZXh0dXJlLnRleHR1cmUuaWQpO1xuICAgICAgICAgICAgZ2wuZHJhd0FycmF5cyhnbC5UUklBTkdMRVMsIGkgKiA2LCA2KTtcblxuICAgICAgICAgICAgZ2wuZGVsZXRlVGV4dHVyZShzdWJUZXh0dXJlLnRleHR1cmUuaWQpO1xuICAgICAgICAgICAgc3ViVGV4dHVyZS50ZXh0dXJlID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMudGV4dHVyZSA9IHRleHR1cmU7XG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIG51bGwpO1xuICAgIGdsLmRlbGV0ZUJ1ZmZlcih2ZXJ0ZXhCdWZmZXIpO1xuICAgIHRoaXMudHJlZSA9IG51bGw7XG59O1xuXG5BdGxhcy5wcm90b3R5cGUuYWRkU3ByaXRlID0gZnVuY3Rpb24gKGRhdGEsIG9mZnNldCwgeCwgeSwgd2lkdGgsIGhlaWdodCkge1xuICAgIHZhciB6ID0gMDtcbiAgICBkYXRhW29mZnNldCArIDBdID0geDsgZGF0YVtvZmZzZXQgKyAxXSA9IHk7IGRhdGFbb2Zmc2V0ICsgMl0gPSB6O1xuICAgIGRhdGFbb2Zmc2V0ICsgM10gPSAwOyBkYXRhW29mZnNldCArIDRdID0gMDtcbiAgICBkYXRhW29mZnNldCArIDVdID0geCArIHdpZHRoOyBkYXRhW29mZnNldCArIDZdID0geTsgZGF0YVtvZmZzZXQgKyA3XSA9IHo7XG4gICAgZGF0YVtvZmZzZXQgKyA4XSA9IDE7IGRhdGFbb2Zmc2V0ICsgOV0gPSAwO1xuICAgIGRhdGFbb2Zmc2V0ICsgMTBdID0geCArIHdpZHRoOyBkYXRhW29mZnNldCArIDExXSA9IHkgKyBoZWlnaHQ7IGRhdGFbb2Zmc2V0ICsgMTJdID0gejtcbiAgICBkYXRhW29mZnNldCArIDEzXSA9IDE7IGRhdGFbb2Zmc2V0ICsgMTRdID0gMTtcbiAgICBkYXRhW29mZnNldCArIDE1XSA9IHggKyB3aWR0aDsgZGF0YVtvZmZzZXQgKyAxNl0gPSB5ICsgaGVpZ2h0OyBkYXRhW29mZnNldCArIDE3XSA9IHo7XG4gICAgZGF0YVtvZmZzZXQgKyAxOF0gPSAxOyBkYXRhW29mZnNldCArIDE5XSA9IDE7XG4gICAgZGF0YVtvZmZzZXQgKyAyMF0gPSB4OyBkYXRhW29mZnNldCArIDIxXSA9IHkgKyBoZWlnaHQ7IGRhdGFbb2Zmc2V0ICsgMjJdID0gejtcbiAgICBkYXRhW29mZnNldCArIDIzXSA9IDA7IGRhdGFbb2Zmc2V0ICsgMjRdID0gMTtcbiAgICBkYXRhW29mZnNldCArIDI1XSA9IHg7IGRhdGFbb2Zmc2V0ICsgMjZdID0geTsgZGF0YVtvZmZzZXQgKyAyN10gPSB6O1xuICAgIGRhdGFbb2Zmc2V0ICsgMjhdID0gMDsgZGF0YVtvZmZzZXQgKyAyOV0gPSAwO1xufTtcblxuQXRsYXMucHJvdG90eXBlLmdldEZyZWVOb2RlID0gZnVuY3Rpb24gKG5vZGUsIHRleHR1cmUpIHtcbiAgICBpZiAobm9kZS5jaGlsZHJlblswXSB8fCBub2RlLmNoaWxkcmVuWzFdKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSB0aGlzLmdldEZyZWVOb2RlKG5vZGUuY2hpbGRyZW5bMF0sIHRleHR1cmUpO1xuICAgICAgICBpZiAocmVzdWx0KVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcblxuICAgICAgICByZXR1cm4gdGhpcy5nZXRGcmVlTm9kZShub2RlLmNoaWxkcmVuWzFdLCB0ZXh0dXJlKTtcbiAgICB9XG5cbiAgICBpZiAobm9kZS50ZXh0dXJlKVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICBpZiAobm9kZS53aWR0aCA8IHRleHR1cmUud2lkdGggfHwgbm9kZS5oZWlnaHQgPCB0ZXh0dXJlLmhlaWdodClcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgaWYgKG5vZGUud2lkdGggPT0gdGV4dHVyZS53aWR0aCAmJiBub2RlLmhlaWdodCA9PSB0ZXh0dXJlLmhlaWdodClcbiAgICAgICAgcmV0dXJuIG5vZGU7XG5cbiAgICB2YXIgZHcgPSBub2RlLndpZHRoIC0gdGV4dHVyZS53aWR0aDtcbiAgICB2YXIgZGggPSBub2RlLmhlaWdodCAtIHRleHR1cmUuaGVpZ2h0O1xuXG4gICAgaWYgKGR3ID4gZGgpIHtcbiAgICAgICAgbm9kZS5jaGlsZHJlblswXSA9IHsgY2hpbGRyZW46IFtudWxsLCBudWxsXSxcbiAgICAgICAgICAgIHg6IG5vZGUueCxcbiAgICAgICAgICAgIHk6IG5vZGUueSxcbiAgICAgICAgICAgIHdpZHRoOiB0ZXh0dXJlLndpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBub2RlLmhlaWdodFxuICAgICAgICB9O1xuICAgICAgICBub2RlLmNoaWxkcmVuWzFdID0geyBjaGlsZHJlbjogW251bGwsIG51bGxdLFxuICAgICAgICAgICAgeDogbm9kZS54ICsgdGV4dHVyZS53aWR0aCxcbiAgICAgICAgICAgIHk6IG5vZGUueSxcbiAgICAgICAgICAgIHdpZHRoOiBub2RlLndpZHRoIC0gdGV4dHVyZS53aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogbm9kZS5oZWlnaHRcbiAgICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBub2RlLmNoaWxkcmVuWzBdID0geyBjaGlsZHJlbjogW251bGwsIG51bGxdLFxuICAgICAgICAgICAgeDogbm9kZS54LFxuICAgICAgICAgICAgeTogbm9kZS55LFxuICAgICAgICAgICAgd2lkdGg6IG5vZGUud2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IHRleHR1cmUuaGVpZ2h0XG4gICAgICAgIH07XG4gICAgICAgIG5vZGUuY2hpbGRyZW5bMV0gPSB7IGNoaWxkcmVuOiBbbnVsbCwgbnVsbF0sXG4gICAgICAgICAgICB4OiBub2RlLngsXG4gICAgICAgICAgICB5OiBub2RlLnkgKyB0ZXh0dXJlLmhlaWdodCxcbiAgICAgICAgICAgIHdpZHRoOiBub2RlLndpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBub2RlLmhlaWdodCAtIHRleHR1cmUuaGVpZ2h0XG4gICAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmdldEZyZWVOb2RlKG5vZGUuY2hpbGRyZW5bMF0sIHRleHR1cmUpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gQXRsYXM7XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiMVlpWjVTXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvZ2wvYXRsYXMuanNcIixcIi9nbFwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcblxudmFyIEZvbnQgPSBmdW5jdGlvbiAodGV4dHVyZSwgY2hhcldpZHRoLCBjaGFySGVpZ2h0KSB7XG4gICAgdGhpcy50ZXh0dXJlID0gdGV4dHVyZTtcbiAgICB0aGlzLmNoYXJXaWR0aCA9IGNoYXJXaWR0aCB8fCA4O1xuICAgIHRoaXMuY2hhckhlaWdodCA9IGNoYXJIZWlnaHQgfHwgODtcbiAgICB0aGlzLmRhdGEgPSBuZXcgRmxvYXQzMkFycmF5KDYgKiA1ICogNCAqIDEwMjQpOyAvLyA8PSAxMDI0IG1heCBjaGFyYWN0ZXJzLlxuICAgIHRoaXMudmVydGV4QnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XG4gICAgdGhpcy52ZXJ0ZXhCdWZmZXIubmFtZSA9ICdzcHJpdGVGb250JztcbiAgICB0aGlzLm9mZnNldCA9IDA7XG4gICAgdGhpcy5lbGVtZW50Q291bnQgPSAwO1xufTtcblxuRm9udC5wcm90b3R5cGUuYWRkVmVydGV4ID0gZnVuY3Rpb24oeCwgeSwgdSwgdikge1xuICAgIHRoaXMuZGF0YVt0aGlzLm9mZnNldCsrXSA9IHg7XG4gICAgdGhpcy5kYXRhW3RoaXMub2Zmc2V0KytdID0geTtcbiAgICB0aGlzLmRhdGFbdGhpcy5vZmZzZXQrK10gPSAwO1xuICAgIHRoaXMuZGF0YVt0aGlzLm9mZnNldCsrXSA9IHU7XG4gICAgdGhpcy5kYXRhW3RoaXMub2Zmc2V0KytdID0gdjtcbn07XG5cbkZvbnQucHJvdG90eXBlLmRyYXdDaGFyYWN0ZXIgPSBmdW5jdGlvbih4LCB5LCBpbmRleCkge1xuICAgIGlmIChpbmRleCA9PSAzMiB8fCB5IDwgMCB8fCB4IDwgMCB8fCB4ID4gZ2wud2lkdGggfHwgeSA+IGdsLmhlaWdodClcbiAgICAgICAgcmV0dXJuO1xuXG4gICAgaW5kZXggJj0gMjU1O1xuICAgIHZhciByb3cgPSBpbmRleCA+PiA0O1xuICAgIHZhciBjb2x1bW4gPSBpbmRleCAmIDE1O1xuXG4gICAgdmFyIGZyb3cgPSByb3cgKiAwLjA2MjU7XG4gICAgdmFyIGZjb2wgPSBjb2x1bW4gKiAwLjA2MjU7XG4gICAgdmFyIHNpemUgPSAwLjA2MjU7XG5cbiAgICB0aGlzLmFkZFZlcnRleCh4LCB5LCBmY29sLCBmcm93KTtcbiAgICB0aGlzLmFkZFZlcnRleCh4ICsgdGhpcy5jaGFyV2lkdGgsIHksIGZjb2wgKyBzaXplLCBmcm93KTtcbiAgICB0aGlzLmFkZFZlcnRleCh4ICsgdGhpcy5jaGFyV2lkdGgsIHkgKyB0aGlzLmNoYXJIZWlnaHQsIGZjb2wgKyBzaXplLCAgZnJvdyArIHNpemUpO1xuICAgIHRoaXMuYWRkVmVydGV4KHggKyB0aGlzLmNoYXJXaWR0aCwgeSArIHRoaXMuY2hhckhlaWdodCwgZmNvbCArIHNpemUsICBmcm93ICsgc2l6ZSk7XG4gICAgdGhpcy5hZGRWZXJ0ZXgoeCwgeSArIHRoaXMuY2hhckhlaWdodCwgZmNvbCwgZnJvdyArIHNpemUpO1xuICAgIHRoaXMuYWRkVmVydGV4KHgsIHksIGZjb2wsIGZyb3cpO1xuICAgIHRoaXMuZWxlbWVudENvdW50ICs9IDY7XG59O1xuXG5Gb250LnByb3RvdHlwZS5kcmF3U3RyaW5nID0gZnVuY3Rpb24oeCwgeSwgc3RyLCBtb2RlKSB7XG4gICAgdmFyIG9mZnNldCA9IG1vZGUgPyAxMjggOiAwO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKVxuICAgICAgICB0aGlzLmRyYXdDaGFyYWN0ZXIoeCArICgoaSArIDEpICogdGhpcy5jaGFyV2lkdGgpLCB5LCBzdHIuY2hhckNvZGVBdChpKSArIG9mZnNldCk7XG59O1xuXG5Gb250LnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbihzaGFkZXIsIHApIHtcbiAgICBpZiAoIXRoaXMuZWxlbWVudENvdW50KVxuICAgICAgICByZXR1cm47XG5cbiAgICBzaGFkZXIudXNlKCk7XG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHRoaXMudmVydGV4QnVmZmVyKTtcbiAgICBnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgdGhpcy5kYXRhLCBnbC5TVFJFQU1fRFJBVyk7XG4gICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihzaGFkZXIuYXR0cmlidXRlcy52ZXJ0ZXhBdHRyaWJ1dGUsIDMsIGdsLkZMT0FULCBmYWxzZSwgMjAsIDApO1xuICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIoc2hhZGVyLmF0dHJpYnV0ZXMudGV4Q29vcmRzQXR0cmlidXRlLCAyLCBnbC5GTE9BVCwgZmFsc2UsIDIwLCAxMik7XG4gICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoc2hhZGVyLmF0dHJpYnV0ZXMudmVydGV4QXR0cmlidXRlKTtcbiAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShzaGFkZXIuYXR0cmlidXRlcy50ZXhDb29yZHNBdHRyaWJ1dGUpO1xuXG4gICAgZ2wudW5pZm9ybU1hdHJpeDRmdihzaGFkZXIudW5pZm9ybXMucHJvamVjdGlvbk1hdHJpeCwgZmFsc2UsIHApO1xuXG4gICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGhpcy50ZXh0dXJlLmlkKTtcbiAgICBnbC5kcmF3QXJyYXlzKGdsLlRSSUFOR0xFUywgMCwgdGhpcy5lbGVtZW50Q291bnQpO1xuXG5cbiAgICB0aGlzLmVsZW1lbnRDb3VudCA9IDA7XG4gICAgdGhpcy5vZmZzZXQgPSAwO1xuXG4gICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgbnVsbCk7XG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIG51bGwpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gRm9udDtcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiMVlpWjVTXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvZ2wvZm9udC5qc1wiLFwiL2dsXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIGdsTWF0cml4ID0gcmVxdWlyZSgnbGliL2dsLW1hdHJpeC1taW4uanMnKTtcblxudmFyIGdsID0gZnVuY3Rpb24oKSB7fTtcblxuZ2wuaW5pdCA9IGZ1bmN0aW9uKGlkKSB7XG5cbiAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xuICAgIGlmICghY2FudmFzKVxuICAgICAgICB0aHJvdyAnRXJyb3I6IE5vIGNhbnZhcyBlbGVtZW50IGZvdW5kLic7XG5cbiAgICB2YXIgb3B0aW9ucyA9IHt9O1xuICAgIHZhciBnbCA9IGNhbnZhcy5nZXRDb250ZXh0KCd3ZWJnbCcsIG9wdGlvbnMpO1xuICAgIGlmICghZ2wpXG4gICAgICAgIHRocm93ICdFcnJvcjogTm8gV2ViR0wgc3VwcG9ydCBmb3VuZC4nO1xuXG4gICAgZ2wud2lkdGggPSBjYW52YXMud2lkdGg7XG4gICAgZ2wuaGVpZ2h0ID0gY2FudmFzLmhlaWdodDtcbiAgICBnbC5jbGVhckNvbG9yKDAsIDAsIDAsIDEpO1xuICAgIGdsLmJsZW5kRnVuYyhnbC5TUkNfQUxQSEEsIGdsLk9ORV9NSU5VU19TUkNfQUxQSEEpO1xuICAgIGdsLmRlcHRoRnVuYyhnbC5MRVFVQUwpO1xuICAgIC8vZ2wuY3VsbEZhY2UoZ2wuRlJPTlQpO1xuICAgIGdsLnZpZXdwb3J0KDAsIDAsIGdsLndpZHRoLCBnbC5oZWlnaHQpO1xuXG4gICAgd2luZG93LnZlYzIgPSBnbE1hdHJpeC52ZWMyO1xuICAgIHdpbmRvdy52ZWMzID0gZ2xNYXRyaXgudmVjMztcbiAgICB3aW5kb3cubWF0NCA9IGdsTWF0cml4Lm1hdDQ7XG4gICAgd2luZG93LmdsID0gZ2w7XG5cbiAgICByZXR1cm4gZ2w7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBnbDtcblxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIjFZaVo1U1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2dsL2dsLmpzXCIsXCIvZ2xcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG5cbnZhciBMaWdodE1hcCA9IGZ1bmN0aW9uKGRhdGEsIG9mZnNldCwgd2lkdGgsIGhlaWdodCkge1xuICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgICB0aGlzLmlkID0gZ2wuY3JlYXRlVGV4dHVyZSgpO1xuXG4gICAgdmFyIHBpeGVscyA9IG5ldyBVaW50OEFycmF5KHdpZHRoICogaGVpZ2h0ICogMyk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB3aWR0aCAqIGhlaWdodDsgaSsrKSB7XG4gICAgICAgIHZhciBpbnRlbnNpdHkgPSBkYXRhW29mZnNldCArIGldO1xuICAgICAgICBpbnRlbnNpdHkgPSAhaW50ZW5zaXR5ID8gMCA6IGludGVuc2l0eTtcbiAgICAgICAgcGl4ZWxzW2kgKiAzICsgMF0gPSBpbnRlbnNpdHk7XG4gICAgICAgIHBpeGVsc1tpICogMyArIDFdID0gaW50ZW5zaXR5O1xuICAgICAgICBwaXhlbHNbaSAqIDMgKyAyXSA9IGludGVuc2l0eTtcbiAgICB9XG5cbiAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCB0aGlzLmlkKTtcbiAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgZ2wuTElORUFSKTtcbiAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgZ2wuTElORUFSKTtcbiAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9TLCBnbC5DTEFNUF9UT19FREdFKTtcbiAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9ULCBnbC5DTEFNUF9UT19FREdFKTtcblxuICAgIGdsLnRleEltYWdlMkQoZ2wuVEVYVFVSRV8yRCwgMCwgZ2wuUkdCLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgMCwgZ2wuUkdCLCBnbC5VTlNJR05FRF9CWVRFLCBwaXhlbHMpO1xufTtcblxuTGlnaHRNYXAucHJvdG90eXBlLmJpbmQgPSBmdW5jdGlvbih1bml0KSB7XG4gICAgZ2wuYWN0aXZlVGV4dHVyZShnbC5URVhUVVJFMCArICh1bml0IHx8IDApKTtcbiAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCB0aGlzLmlkKTtcbn07XG5cbkxpZ2h0TWFwLnByb3RvdHlwZS51bmJpbmQgPSBmdW5jdGlvbih1bml0KSB7XG4gICAgZ2wuYWN0aXZlVGV4dHVyZShnbC5URVhUVVJFMCArICh1bml0IHx8IDApKTtcbiAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCBudWxsKTtcbn07XG5cbkxpZ2h0TWFwLnByb3RvdHlwZS5hc0RhdGFVcmwgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZnJhbWVidWZmZXIgPSBnbC5jcmVhdGVGcmFtZWJ1ZmZlcigpO1xuICAgIGdsLmJpbmRGcmFtZWJ1ZmZlcihnbC5GUkFNRUJVRkZFUiwgZnJhbWVidWZmZXIpO1xuICAgIGdsLmZyYW1lYnVmZmVyVGV4dHVyZTJEKGdsLkZSQU1FQlVGRkVSLCBnbC5DT0xPUl9BVFRBQ0hNRU5UMCwgZ2wuVEVYVFVSRV8yRCwgdGhpcy5pZCwgMCk7XG5cbiAgICB2YXIgd2lkdGggPSB0aGlzLndpZHRoO1xuICAgIHZhciBoZWlnaHQgPSB0aGlzLmhlaWdodDtcblxuICAgIC8vIFJlYWQgdGhlIGNvbnRlbnRzIG9mIHRoZSBmcmFtZWJ1ZmZlclxuICAgIHZhciBkYXRhID0gbmV3IFVpbnQ4QXJyYXkod2lkdGggKiBoZWlnaHQgKiA0KTtcbiAgICBnbC5yZWFkUGl4ZWxzKDAsIDAsIHdpZHRoLCBoZWlnaHQsIGdsLlJHQkEsIGdsLlVOU0lHTkVEX0JZVEUsIGRhdGEpO1xuICAgIGdsLmRlbGV0ZUZyYW1lYnVmZmVyKGZyYW1lYnVmZmVyKTtcblxuICAgIC8vIENyZWF0ZSBhIDJEIGNhbnZhcyB0byBzdG9yZSB0aGUgcmVzdWx0XG4gICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgIGNhbnZhcy53aWR0aCA9IHdpZHRoO1xuICAgIGNhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgdmFyIGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgIC8vIENvcHkgdGhlIHBpeGVscyB0byBhIDJEIGNhbnZhc1xuICAgIHZhciBpbWFnZURhdGEgPSBjb250ZXh0LmNyZWF0ZUltYWdlRGF0YSh3aWR0aCwgaGVpZ2h0KTtcbiAgICBpbWFnZURhdGEuZGF0YS5zZXQoZGF0YSk7XG4gICAgY29udGV4dC5wdXRJbWFnZURhdGEoaW1hZ2VEYXRhLCAwLCAwKTtcbiAgICByZXR1cm4gY2FudmFzLnRvRGF0YVVSTCgpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gTGlnaHRNYXA7XG59KS5jYWxsKHRoaXMscmVxdWlyZShcIjFZaVo1U1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2dsL2xpZ2h0bWFwLmpzXCIsXCIvZ2xcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG5cbmZ1bmN0aW9uIGNvbXBpbGVTaGFkZXIodHlwZSwgc291cmNlKSB7XG4gICAgdmFyIHNoYWRlciA9IGdsLmNyZWF0ZVNoYWRlcih0eXBlKTtcbiAgICBnbC5zaGFkZXJTb3VyY2Uoc2hhZGVyLCBzb3VyY2UpO1xuICAgIGdsLmNvbXBpbGVTaGFkZXIoc2hhZGVyKTtcbiAgICBpZiAoIWdsLmdldFNoYWRlclBhcmFtZXRlcihzaGFkZXIsIGdsLkNPTVBJTEVfU1RBVFVTKSkge1xuICAgICAgICB0aHJvdyAnRXJyb3I6IFNoYWRlciBjb21waWxlIGVycm9yOiAnICsgZ2wuZ2V0U2hhZGVySW5mb0xvZyhzaGFkZXIpO1xuICAgIH1cbiAgICByZXR1cm4gc2hhZGVyO1xufVxuXG52YXIgU2hhZGVyID0gZnVuY3Rpb24oc291cmNlKSB7XG4gICAgdmFyIHZlcnRleFN0YXJ0ID0gc291cmNlLmluZGV4T2YoJ1t2ZXJ0ZXhdJyk7XG4gICAgdmFyIGZyYWdtZW50U3RhcnQgPSBzb3VyY2UuaW5kZXhPZignW2ZyYWdtZW50XScpO1xuICAgIGlmICh2ZXJ0ZXhTdGFydCA9PT0gLTEgfHwgZnJhZ21lbnRTdGFydCA9PT0gLTEpXG4gICAgICAgIHRocm93ICdFcnJvcjogTWlzc2luZyBbZnJhZ21lbnRdIGFuZC9vciBbdmVydGV4XSBtYXJrZXJzIGluIHNoYWRlci4nO1xuXG4gICAgdmFyIHZlcnRleFNvdXJjZSA9IHNvdXJjZS5zdWJzdHJpbmcodmVydGV4U3RhcnQgKyA4LCBmcmFnbWVudFN0YXJ0KTtcbiAgICB2YXIgZnJhZ21lbnRTb3VyY2UgPSBzb3VyY2Uuc3Vic3RyaW5nKGZyYWdtZW50U3RhcnQgKyAxMCk7XG4gICAgdGhpcy5jb21waWxlKHZlcnRleFNvdXJjZSwgZnJhZ21lbnRTb3VyY2UpO1xufTtcblxuU2hhZGVyLnByb3RvdHlwZS5jb21waWxlID0gZnVuY3Rpb24odmVydGV4U291cmNlLCBmcmFnbWVudFNvdXJjZSkge1xuICAgIHZhciBwcm9ncmFtID0gZ2wuY3JlYXRlUHJvZ3JhbSgpO1xuICAgIGdsLmF0dGFjaFNoYWRlcihwcm9ncmFtLCBjb21waWxlU2hhZGVyKGdsLlZFUlRFWF9TSEFERVIsIHZlcnRleFNvdXJjZSkpO1xuICAgIGdsLmF0dGFjaFNoYWRlcihwcm9ncmFtLCBjb21waWxlU2hhZGVyKGdsLkZSQUdNRU5UX1NIQURFUiwgZnJhZ21lbnRTb3VyY2UpKTtcbiAgICBnbC5saW5rUHJvZ3JhbShwcm9ncmFtKTtcbiAgICBpZiAoIWdsLmdldFByb2dyYW1QYXJhbWV0ZXIocHJvZ3JhbSwgZ2wuTElOS19TVEFUVVMpKVxuICAgICAgICB0aHJvdyAnRXJyb3I6IFNoYWRlciBsaW5raW5nIGVycm9yOiAnICsgZ2wuZ2V0UHJvZ3JhbUluZm9Mb2cocHJvZ3JhbSk7XG5cbiAgICB2YXIgc291cmNlcyA9IHZlcnRleFNvdXJjZSArIGZyYWdtZW50U291cmNlO1xuICAgIHZhciBsaW5lcyA9IHNvdXJjZXMubWF0Y2goLyh1bmlmb3JtfGF0dHJpYnV0ZSlcXHMrXFx3K1xccytcXHcrKD89OykvZyk7XG4gICAgdGhpcy51bmlmb3JtcyA9IHt9O1xuICAgIHRoaXMuYXR0cmlidXRlcyA9IHt9O1xuICAgIHRoaXMuc2FtcGxlcnMgPSBbXTtcbiAgICBmb3IgKHZhciBpIGluIGxpbmVzKSB7XG4gICAgICAgIHZhciB0b2tlbnMgPSBsaW5lc1tpXS5zcGxpdCgnICcpO1xuICAgICAgICB2YXIgbmFtZSA9IHRva2Vuc1syXTtcbiAgICAgICAgdmFyIHR5cGUgPSB0b2tlbnNbMV07XG4gICAgICAgIHN3aXRjaCAodG9rZW5zWzBdKSB7XG4gICAgICAgICAgICBjYXNlICdhdHRyaWJ1dGUnOlxuICAgICAgICAgICAgICAgIHZhciBhdHRyaWJ1dGVMb2NhdGlvbiA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKHByb2dyYW0sIG5hbWUpO1xuICAgICAgICAgICAgICAgIHRoaXMuYXR0cmlidXRlc1tuYW1lXSA9IGF0dHJpYnV0ZUxvY2F0aW9uO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAndW5pZm9ybSc6XG4gICAgICAgICAgICAgICAgdmFyIGxvY2F0aW9uID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHByb2dyYW0sIG5hbWUpO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlID09PSAnc2FtcGxlcjJEJylcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zYW1wbGVycy5wdXNoKGxvY2F0aW9uKTtcbiAgICAgICAgICAgICAgICB0aGlzLnVuaWZvcm1zW25hbWVdID0gbG9jYXRpb247XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93ICdJbnZhbGlkIGF0dHJpYnV0ZS91bmlmb3JtIGZvdW5kOiAnICsgdG9rZW5zWzFdO1xuICAgICAgICB9XG4gICAgfVxuICAgIHRoaXMucHJvZ3JhbSA9IHByb2dyYW07XG59O1xuXG5TaGFkZXIucHJvdG90eXBlLnVzZSA9IGZ1bmN0aW9uKCkge1xuICAgIGdsLnVzZVByb2dyYW0odGhpcy5wcm9ncmFtKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IFNoYWRlcjtcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiMVlpWjVTXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvZ2wvc2hhZGVyLmpzXCIsXCIvZ2xcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgQXRsYXMgPSByZXF1aXJlKCdnbC9hdGxhcycpO1xuXG52YXIgU3ByaXRlcyA9IGZ1bmN0aW9uICh3aWR0aCwgaGVpZ2h0LCBzcHJpdGVDb3VudCkge1xuICAgIHRoaXMuc3ByaXRlQ29tcG9uZW50cyA9IDk7IC8vIHh5eiwgdXYsIHJnYmFcbiAgICB0aGlzLnNwcml0ZVZlcnRpY2VzID0gNjtcbiAgICB0aGlzLm1heFNwcml0ZXMgPSBzcHJpdGVDb3VudCB8fCAxMjg7XG4gICAgdGhpcy50ZXh0dXJlcyA9IG5ldyBBdGxhcyh3aWR0aCwgaGVpZ2h0KTtcbiAgICB0aGlzLnNwcml0ZUNvdW50ID0gMDtcbiAgICB0aGlzLmRhdGEgPSBuZXcgRmxvYXQzMkFycmF5KHRoaXMubWF4U3ByaXRlcyAqIHRoaXMuc3ByaXRlQ29tcG9uZW50cyAqIHRoaXMuc3ByaXRlVmVydGljZXMpO1xuICAgIHRoaXMudmVydGV4QnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XG4gICAgdGhpcy5kaXJ0eSA9IGZhbHNlO1xufTtcblxuU3ByaXRlcy5wcm90b3R5cGUuZHJhd1Nwcml0ZSA9IGZ1bmN0aW9uICh0ZXh0dXJlLCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCByLCBnLCBiLCBhKSB7XG4gICAgdmFyIHogPSAwO1xuICAgIHZhciBkYXRhID0gdGhpcy5kYXRhO1xuICAgIHZhciBvZmZzZXQgPSB0aGlzLnNwcml0ZUNvdW50ICogdGhpcy5zcHJpdGVWZXJ0aWNlcyAqIHRoaXMuc3ByaXRlQ29tcG9uZW50cztcbiAgICB2YXIgdCA9IHRoaXMudGV4dHVyZXMuZ2V0U3ViVGV4dHVyZSh0ZXh0dXJlKTtcbiAgICB3aWR0aCA9IHdpZHRoIHx8IHQud2lkdGg7XG4gICAgaGVpZ2h0ID0gaGVpZ2h0IHx8IHQuaGVpZ2h0O1xuXG4gICAgZGF0YVtvZmZzZXQgKyAwXSA9IHg7XG4gICAgZGF0YVtvZmZzZXQgKyAxXSA9IHk7XG4gICAgZGF0YVtvZmZzZXQgKyAyXSA9IHo7XG4gICAgZGF0YVtvZmZzZXQgKyAzXSA9IHQuczE7XG4gICAgZGF0YVtvZmZzZXQgKyA0XSA9IHQudDE7XG4gICAgZGF0YVtvZmZzZXQgKyA1XSA9IHI7XG4gICAgZGF0YVtvZmZzZXQgKyA2XSA9IGc7XG4gICAgZGF0YVtvZmZzZXQgKyA3XSA9IGI7XG4gICAgZGF0YVtvZmZzZXQgKyA4XSA9IGE7XG5cbiAgICBkYXRhW29mZnNldCArIDldID0geCArIHdpZHRoO1xuICAgIGRhdGFbb2Zmc2V0ICsgMTBdID0geTtcbiAgICBkYXRhW29mZnNldCArIDExXSA9IHo7XG4gICAgZGF0YVtvZmZzZXQgKyAxMl0gPSB0LnMyO1xuICAgIGRhdGFbb2Zmc2V0ICsgMTNdID0gdC50MTtcbiAgICBkYXRhW29mZnNldCArIDE0XSA9IHI7XG4gICAgZGF0YVtvZmZzZXQgKyAxNV0gPSBnO1xuICAgIGRhdGFbb2Zmc2V0ICsgMTZdID0gYjtcbiAgICBkYXRhW29mZnNldCArIDE3XSA9IGE7XG5cbiAgICBkYXRhW29mZnNldCArIDE4XSA9IHggKyB3aWR0aDtcbiAgICBkYXRhW29mZnNldCArIDE5XSA9IHkgKyBoZWlnaHQ7XG4gICAgZGF0YVtvZmZzZXQgKyAyMF0gPSB6O1xuICAgIGRhdGFbb2Zmc2V0ICsgMjFdID0gdC5zMjtcbiAgICBkYXRhW29mZnNldCArIDIyXSA9IHQudDI7XG4gICAgZGF0YVtvZmZzZXQgKyAyM10gPSByO1xuICAgIGRhdGFbb2Zmc2V0ICsgMjRdID0gZztcbiAgICBkYXRhW29mZnNldCArIDI1XSA9IGI7XG4gICAgZGF0YVtvZmZzZXQgKyAyNl0gPSBhO1xuXG4gICAgZGF0YVtvZmZzZXQgKyAyN10gPSB4ICsgd2lkdGg7XG4gICAgZGF0YVtvZmZzZXQgKyAyOF0gPSB5ICsgaGVpZ2h0O1xuICAgIGRhdGFbb2Zmc2V0ICsgMjldID0gejtcbiAgICBkYXRhW29mZnNldCArIDMwXSA9IHQuczI7XG4gICAgZGF0YVtvZmZzZXQgKyAzMV0gPSB0LnQyO1xuICAgIGRhdGFbb2Zmc2V0ICsgMzJdID0gcjtcbiAgICBkYXRhW29mZnNldCArIDMzXSA9IGc7XG4gICAgZGF0YVtvZmZzZXQgKyAzNF0gPSBiO1xuICAgIGRhdGFbb2Zmc2V0ICsgMzVdID0gYTtcblxuICAgIGRhdGFbb2Zmc2V0ICsgMzZdID0geDtcbiAgICBkYXRhW29mZnNldCArIDM3XSA9IHkgKyBoZWlnaHQ7XG4gICAgZGF0YVtvZmZzZXQgKyAzOF0gPSB6O1xuICAgIGRhdGFbb2Zmc2V0ICsgMzldID0gdC5zMTtcbiAgICBkYXRhW29mZnNldCArIDQwXSA9IHQudDI7XG4gICAgZGF0YVtvZmZzZXQgKyA0MV0gPSByO1xuICAgIGRhdGFbb2Zmc2V0ICsgNDJdID0gZztcbiAgICBkYXRhW29mZnNldCArIDQzXSA9IGI7XG4gICAgZGF0YVtvZmZzZXQgKyA0NF0gPSBhO1xuXG4gICAgZGF0YVtvZmZzZXQgKyA0NV0gPSB4O1xuICAgIGRhdGFbb2Zmc2V0ICsgNDZdID0geTtcbiAgICBkYXRhW29mZnNldCArIDQ3XSA9IHo7XG4gICAgZGF0YVtvZmZzZXQgKyA0OF0gPSB0LnMxO1xuICAgIGRhdGFbb2Zmc2V0ICsgNDldID0gdC50MTtcbiAgICBkYXRhW29mZnNldCArIDUwXSA9IHI7XG4gICAgZGF0YVtvZmZzZXQgKyA1MV0gPSBnO1xuICAgIGRhdGFbb2Zmc2V0ICsgNTJdID0gYjtcbiAgICBkYXRhW29mZnNldCArIDUzXSA9IGE7XG5cbiAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcy5zcHJpdGVDb3VudCsrO1xufTtcblxuU3ByaXRlcy5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zcHJpdGVDb3VudCA9IDA7XG59O1xuXG5TcHJpdGVzLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiAoc2hhZGVyLCBwLCBmaXJzdFNwcml0ZSwgc3ByaXRlQ291bnQpIHtcbiAgICBpZiAodGhpcy5zcHJpdGVDb3VudCA8PSAwKVxuICAgICAgICByZXR1cm47XG5cbiAgICBmaXJzdFNwcml0ZSA9IGZpcnN0U3ByaXRlIHx8IDA7XG4gICAgc3ByaXRlQ291bnQgPSBzcHJpdGVDb3VudCB8fCB0aGlzLnNwcml0ZUNvdW50O1xuXG4gICAgc2hhZGVyLnVzZSgpO1xuICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLnZlcnRleEJ1ZmZlcik7XG5cbiAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShzaGFkZXIuYXR0cmlidXRlcy52ZXJ0ZXhBdHRyaWJ1dGUpO1xuICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHNoYWRlci5hdHRyaWJ1dGVzLnRleENvb3Jkc0F0dHJpYnV0ZSk7XG4gICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoc2hhZGVyLmF0dHJpYnV0ZXMuY29sb3JzQXR0cmlidXRlKTtcblxuICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIoc2hhZGVyLmF0dHJpYnV0ZXMudmVydGV4QXR0cmlidXRlLCAzLCBnbC5GTE9BVCwgZmFsc2UsIDM2LCAwKTtcbiAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKHNoYWRlci5hdHRyaWJ1dGVzLnRleENvb3Jkc0F0dHJpYnV0ZSwgMiwgZ2wuRkxPQVQsIGZhbHNlLCAzNiwgMTIpO1xuICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIoc2hhZGVyLmF0dHJpYnV0ZXMuY29sb3JzQXR0cmlidXRlLCA0LCBnbC5GTE9BVCwgZmFsc2UsIDM2LCAyMCk7XG5cbiAgICBnbC51bmlmb3JtTWF0cml4NGZ2KHNoYWRlci51bmlmb3Jtcy5wcm9qZWN0aW9uTWF0cml4LCBmYWxzZSwgcCk7XG5cbiAgICBpZiAodGhpcy5kaXJ0eSkge1xuICAgICAgICBnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgdGhpcy5kYXRhLCBnbC5TVEFUSUNfRFJBVyk7XG4gICAgICAgIHRoaXMuZGlydHkgPSBmYWxzZTtcbiAgICB9XG4gICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGhpcy50ZXh0dXJlcy50ZXh0dXJlLmlkKTtcbiAgICBnbC5kcmF3QXJyYXlzKGdsLlRSSUFOR0xFUywgZmlyc3RTcHJpdGUgKiB0aGlzLnNwcml0ZVZlcnRpY2VzLCBzcHJpdGVDb3VudCAqIHRoaXMuc3ByaXRlVmVydGljZXMpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gU3ByaXRlcztcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIxWWlaNVNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9nbC9zcHJpdGVzLmpzXCIsXCIvZ2xcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgdXRpbHMgPSByZXF1aXJlKCd1dGlscycpO1xuXG52YXIgVGV4dHVyZSA9IGZ1bmN0aW9uKGZpbGUsIG9wdGlvbnMpIHtcbiAgICB2YXIgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgb3B0aW9ucy5hbHBoYSA9IG9wdGlvbnMuYWxwaGEgfHwgZmFsc2U7XG4gICAgb3B0aW9ucy5mb3JtYXQgPSBvcHRpb25zLmZvcm1hdCB8fCBnbC5SR0JBO1xuICAgIG9wdGlvbnMudHlwZSA9IG9wdGlvbnMudHlwZSB8fCBnbC5VTlNJR05FRF9CWVRFO1xuICAgIG9wdGlvbnMuZmlsdGVyID0gb3B0aW9ucy5maWx0ZXIgfHwgZ2wuTElORUFSO1xuICAgIG9wdGlvbnMud3JhcCA9IG9wdGlvbnMud3JhcCB8fCBnbC5DTEFNUF9UT19FREdFO1xuXG4gICAgdGhpcy5pZCA9IGdsLmNyZWF0ZVRleHR1cmUoKTtcbiAgICB0aGlzLndpZHRoID0gb3B0aW9ucy53aWR0aCB8fCBmaWxlLnJlYWRVSW50MzIoKTtcbiAgICB0aGlzLmhlaWdodCA9IG9wdGlvbnMuaGVpZ2h0IHx8IGZpbGUucmVhZFVJbnQzMigpO1xuICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRoaXMuaWQpO1xuICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NQUdfRklMVEVSLCBvcHRpb25zLmZpbHRlcik7XG4gICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01JTl9GSUxURVIsIG9wdGlvbnMuZmlsdGVyKTtcbiAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9TLCBvcHRpb25zLndyYXApO1xuICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9XUkFQX1QsIG9wdGlvbnMud3JhcCk7XG5cbiAgICBpZiAoZmlsZSkge1xuICAgICAgICBpZiAoIW9wdGlvbnMucGFsZXR0ZSlcbiAgICAgICAgICAgIHRocm93ICdFcnJvcjogTm8gcGFsZXR0ZSBzcGVjaWZpZWQgaW4gb3B0aW9ucy4nO1xuXG4gICAgICAgIHZhciBwaXhlbHMgPSBvcHRpb25zLnBhbGV0dGUudW5wYWNrKGZpbGUsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCBvcHRpb25zLmFscGhhKTtcbiAgICAgICAgdmFyIG5wb3QgPSB1dGlscy5pc1Bvd2VyT2YyKHRoaXMud2lkdGgpICYmIHV0aWxzLmlzUG93ZXJPZjIodGhpcy5oZWlnaHQpO1xuICAgICAgICBpZiAoIW5wb3QgJiYgb3B0aW9ucy53cmFwID09PSBnbC5SRVBFQVQpIHtcbiAgICAgICAgICAgIHZhciBuZXdXaWR0aCA9IHV0aWxzLm5leHRQb3dlck9mMih0aGlzLndpZHRoKTtcbiAgICAgICAgICAgIHZhciBuZXdIZWlnaHQgPSB1dGlscy5uZXh0UG93ZXJPZjIodGhpcy5oZWlnaHQpO1xuICAgICAgICAgICAgcGl4ZWxzID0gdGhpcy5yZXNhbXBsZShwaXhlbHMsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCBuZXdXaWR0aCwgbmV3SGVpZ2h0KTtcbiAgICAgICAgICAgIGdsLnRleEltYWdlMkQoZ2wuVEVYVFVSRV8yRCwgMCwgb3B0aW9ucy5mb3JtYXQsIG5ld1dpZHRoLCBuZXdIZWlnaHQsXG4gICAgICAgICAgICAgICAgMCwgb3B0aW9ucy5mb3JtYXQsIG9wdGlvbnMudHlwZSwgcGl4ZWxzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGdsLnRleEltYWdlMkQoZ2wuVEVYVFVSRV8yRCwgMCwgb3B0aW9ucy5mb3JtYXQsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LFxuICAgICAgICAgICAgICAgIDAsIG9wdGlvbnMuZm9ybWF0LCBvcHRpb25zLnR5cGUsIHBpeGVscyk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBnbC50ZXhJbWFnZTJEKGdsLlRFWFRVUkVfMkQsIDAsIG9wdGlvbnMuZm9ybWF0LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCxcbiAgICAgICAgICAgIDAsIG9wdGlvbnMuZm9ybWF0LCBvcHRpb25zLnR5cGUsIG51bGwpO1xuICAgIH1cbn07XG5cblRleHR1cmUucHJvdG90eXBlLmRyYXdUbyA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgIHZhciB2ID0gZ2wuZ2V0UGFyYW1ldGVyKGdsLlZJRVdQT1JUKTtcblxuICAgIC8qIFNldHVwIHNoYXJlZCBidWZmZXJzIGZvciByZW5kZXIgdGFyZ2V0IGRyYXdpbmcgKi9cbiAgICBpZiAodHlwZW9mIFRleHR1cmUuZnJhbWVCdWZmZXIgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgVGV4dHVyZS5mcmFtZUJ1ZmZlciA9IGdsLmNyZWF0ZUZyYW1lYnVmZmVyKCk7XG4gICAgICAgIFRleHR1cmUucmVuZGVyQnVmZmVyID0gZ2wuY3JlYXRlUmVuZGVyYnVmZmVyKCk7XG4gICAgfVxuXG4gICAgZ2wuYmluZEZyYW1lYnVmZmVyKGdsLkZSQU1FQlVGRkVSLCBUZXh0dXJlLmZyYW1lQnVmZmVyKTtcbiAgICBnbC5iaW5kUmVuZGVyYnVmZmVyKGdsLlJFTkRFUkJVRkZFUiwgVGV4dHVyZS5yZW5kZXJCdWZmZXIpO1xuICAgIGlmICh0aGlzLndpZHRoICE9IFRleHR1cmUucmVuZGVyQnVmZmVyLndpZHRoIHx8IHRoaXMuaGVpZ2h0ICE9IFRleHR1cmUucmVuZGVyQnVmZmVyLmhlaWdodCkge1xuICAgICAgICBUZXh0dXJlLnJlbmRlckJ1ZmZlci53aWR0aCA9IHRoaXMud2lkdGg7XG4gICAgICAgIFRleHR1cmUucmVuZGVyQnVmZmVyLmhlaWdodCA9IHRoaXMuaGVpZ2h0O1xuICAgICAgICBnbC5yZW5kZXJidWZmZXJTdG9yYWdlKGdsLlJFTkRFUkJVRkZFUiwgZ2wuREVQVEhfQ09NUE9ORU5UMTYsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcbiAgICB9XG5cblxuICAgIGdsLmZyYW1lYnVmZmVyVGV4dHVyZTJEKGdsLkZSQU1FQlVGRkVSLCBnbC5DT0xPUl9BVFRBQ0hNRU5UMCwgZ2wuVEVYVFVSRV8yRCwgdGhpcy5pZCwgMCk7XG4gICAgZ2wuZnJhbWVidWZmZXJSZW5kZXJidWZmZXIoZ2wuRlJBTUVCVUZGRVIsIGdsLkRFUFRIX0FUVEFDSE1FTlQsIGdsLlJFTkRFUkJVRkZFUiwgVGV4dHVyZS5yZW5kZXJCdWZmZXIpO1xuICAgIGdsLnZpZXdwb3J0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcblxuICAgIHZhciBwcm9qZWN0aW9uTWF0cml4ID0gbWF0NC5vcnRobyhtYXQ0LmNyZWF0ZSgpLCAwLCB0aGlzLndpZHRoLCAwLCB0aGlzLmhlaWdodCwgLTEwLCAxMCk7XG4gICAgY2FsbGJhY2socHJvamVjdGlvbk1hdHJpeCk7XG5cbiAgICBnbC5iaW5kRnJhbWVidWZmZXIoZ2wuRlJBTUVCVUZGRVIsIG51bGwpO1xuICAgIGdsLmJpbmRSZW5kZXJidWZmZXIoZ2wuUkVOREVSQlVGRkVSLCBudWxsKTtcbiAgICBnbC52aWV3cG9ydCh2WzBdLCB2WzFdLCB2WzJdLCB2WzNdKTtcbn07XG5cblRleHR1cmUucHJvdG90eXBlLnJlc2FtcGxlID0gZnVuY3Rpb24ocGl4ZWxzLCB3aWR0aCwgaGVpZ2h0LCBuZXdXaWR0aCwgbmV3SGVpZ2h0KSB7XG4gICAgdmFyIHNyYyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgIHNyYy53aWR0aCA9IHdpZHRoO1xuICAgIHNyYy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgdmFyIGNvbnRleHQgPSBzcmMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICB2YXIgaW1hZ2VEYXRhID0gY29udGV4dC5jcmVhdGVJbWFnZURhdGEod2lkdGgsIGhlaWdodCk7XG4gICAgaW1hZ2VEYXRhLmRhdGEuc2V0KHBpeGVscyk7XG4gICAgY29udGV4dC5wdXRJbWFnZURhdGEoaW1hZ2VEYXRhLCAwLCAwKTtcblxuICAgIHZhciBkZXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgZGVzdC53aWR0aCA9IG5ld1dpZHRoO1xuICAgIGRlc3QuaGVpZ2h0ID0gbmV3SGVpZ2h0O1xuICAgIGNvbnRleHQgPSBkZXN0LmdldENvbnRleHQoJzJkJyk7XG4gICAgY29udGV4dC5kcmF3SW1hZ2Uoc3JjLCAwLCAwLCBkZXN0LndpZHRoLCBkZXN0LmhlaWdodCk7XG4gICAgdmFyIGltYWdlID0gY29udGV4dC5nZXRJbWFnZURhdGEoMCwgMCwgZGVzdC53aWR0aCwgZGVzdC5oZWlnaHQpO1xuICAgIHJldHVybiBuZXcgVWludDhBcnJheShpbWFnZS5kYXRhKTtcbn07XG5cblRleHR1cmUucHJvdG90eXBlLmJpbmQgPSBmdW5jdGlvbih1bml0KSB7XG4gICAgZ2wuYWN0aXZlVGV4dHVyZShnbC5URVhUVVJFMCArICh1bml0IHx8IDApKTtcbiAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCB0aGlzLmlkKTtcbn07XG5cblRleHR1cmUucHJvdG90eXBlLnVuYmluZCA9IGZ1bmN0aW9uKHVuaXQpIHtcbiAgICBnbC5hY3RpdmVUZXh0dXJlKGdsLlRFWFRVUkUwICsgKHVuaXQgfHwgMCkpO1xuICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIG51bGwpO1xufTtcblxuVGV4dHVyZS5wcm90b3R5cGUuYXNEYXRhVXJsID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGZyYW1lYnVmZmVyID0gZ2wuY3JlYXRlRnJhbWVidWZmZXIoKTtcbiAgICBnbC5iaW5kRnJhbWVidWZmZXIoZ2wuRlJBTUVCVUZGRVIsIGZyYW1lYnVmZmVyKTtcbiAgICBnbC5mcmFtZWJ1ZmZlclRleHR1cmUyRChnbC5GUkFNRUJVRkZFUiwgZ2wuQ09MT1JfQVRUQUNITUVOVDAsIGdsLlRFWFRVUkVfMkQsIHRoaXMuaWQsIDApO1xuXG4gICAgdmFyIHdpZHRoID0gdGhpcy53aWR0aDtcbiAgICB2YXIgaGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XG5cbiAgICAvLyBSZWFkIHRoZSBjb250ZW50cyBvZiB0aGUgZnJhbWVidWZmZXJcbiAgICB2YXIgZGF0YSA9IG5ldyBVaW50OEFycmF5KHdpZHRoICogaGVpZ2h0ICogNCk7XG4gICAgZ2wucmVhZFBpeGVscygwLCAwLCB3aWR0aCwgaGVpZ2h0LCBnbC5SR0JBLCBnbC5VTlNJR05FRF9CWVRFLCBkYXRhKTtcbiAgICBnbC5kZWxldGVGcmFtZWJ1ZmZlcihmcmFtZWJ1ZmZlcik7XG5cbiAgICAvLyBDcmVhdGUgYSAyRCBjYW52YXMgdG8gc3RvcmUgdGhlIHJlc3VsdFxuICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICBjYW52YXMud2lkdGggPSB3aWR0aDtcbiAgICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgIHZhciBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbiAgICAvLyBDb3B5IHRoZSBwaXhlbHMgdG8gYSAyRCBjYW52YXNcbiAgICB2YXIgaW1hZ2VEYXRhID0gY29udGV4dC5jcmVhdGVJbWFnZURhdGEod2lkdGgsIGhlaWdodCk7XG4gICAgaW1hZ2VEYXRhLmRhdGEuc2V0KGRhdGEpO1xuICAgIGNvbnRleHQucHV0SW1hZ2VEYXRhKGltYWdlRGF0YSwgMCwgMCk7XG4gICAgcmV0dXJuIGNhbnZhcy50b0RhdGFVUkwoKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IFRleHR1cmU7XG59KS5jYWxsKHRoaXMscmVxdWlyZShcIjFZaVo1U1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2dsL3RleHR1cmUuanNcIixcIi9nbFwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcblxudmFyIGtleXMgPSB7IGxlZnQ6IDM3LCByaWdodDogMzksIHVwOiAzOCwgZG93bjogNDAsIGE6IDY1LCB6OiA5MCB9O1xuXG52YXIgSW5wdXQgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmxlZnQgPSBmYWxzZTtcbiAgICB0aGlzLnJpZ2h0ID0gZmFsc2U7XG4gICAgdGhpcy51cCA9IGZhbHNlO1xuICAgIHRoaXMuZG93biA9IGZhbHNlO1xuICAgIHRoaXMuZmx5VXAgPSBmYWxzZTtcbiAgICB0aGlzLmZseURvd24gPSBmYWxzZTtcblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJyxcbiAgICAgICAgZnVuY3Rpb24oZXZlbnQpIHsgc2VsZi5rZXlEb3duKGV2ZW50KTsgfSwgdHJ1ZSk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLFxuICAgICAgICBmdW5jdGlvbihldmVudCkgeyBzZWxmLmtleVVwKGV2ZW50KTsgfSwgdHJ1ZSk7XG59O1xuXG5JbnB1dC5wcm90b3R5cGUua2V5RG93biA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgc3dpdGNoIChldmVudC5rZXlDb2RlKSB7XG4gICAgICAgIGNhc2Uga2V5cy5sZWZ0OiB0aGlzLmxlZnQgPSB0cnVlOyBicmVhaztcbiAgICAgICAgY2FzZSBrZXlzLnJpZ2h0OiB0aGlzLnJpZ2h0ID0gdHJ1ZTsgYnJlYWs7XG4gICAgICAgIGNhc2Uga2V5cy51cDogdGhpcy51cCA9IHRydWU7IGJyZWFrO1xuICAgICAgICBjYXNlIGtleXMuZG93bjogdGhpcy5kb3duID0gdHJ1ZTsgYnJlYWs7XG4gICAgICAgIGNhc2Uga2V5cy5hOiB0aGlzLmZseVVwID0gdHJ1ZTsgYnJlYWs7XG4gICAgICAgIGNhc2Uga2V5cy56OiB0aGlzLmZseURvd24gPSB0cnVlOyBicmVhaztcbiAgICB9XG59O1xuXG5JbnB1dC5wcm90b3R5cGUua2V5VXAgPSBmdW5jdGlvbihldmVudCkge1xuICAgIHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xuICAgICAgICBjYXNlIGtleXMubGVmdDogdGhpcy5sZWZ0ID0gZmFsc2U7IGJyZWFrO1xuICAgICAgICBjYXNlIGtleXMucmlnaHQ6IHRoaXMucmlnaHQgPSBmYWxzZTsgYnJlYWs7XG4gICAgICAgIGNhc2Uga2V5cy51cDogdGhpcy51cCA9IGZhbHNlOyBicmVhaztcbiAgICAgICAgY2FzZSBrZXlzLmRvd246IHRoaXMuZG93biA9IGZhbHNlOyBicmVhaztcbiAgICAgICAgY2FzZSBrZXlzLmE6IHRoaXMuZmx5VXAgPSBmYWxzZTsgYnJlYWs7XG4gICAgICAgIGNhc2Uga2V5cy56OiB0aGlzLmZseURvd24gPSBmYWxzZTsgYnJlYWs7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gSW5wdXQ7XG59KS5jYWxsKHRoaXMscmVxdWlyZShcIjFZaVo1U1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2lucHV0LmpzXCIsXCIvXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IGdsLW1hdHJpeCAtIEhpZ2ggcGVyZm9ybWFuY2UgbWF0cml4IGFuZCB2ZWN0b3Igb3BlcmF0aW9uc1xuICogQGF1dGhvciBCcmFuZG9uIEpvbmVzXG4gKiBAYXV0aG9yIENvbGluIE1hY0tlbnppZSBJVlxuICogQHZlcnNpb24gMi4yLjFcbiAqL1xuLyogQ29weXJpZ2h0IChjKSAyMDEzLCBCcmFuZG9uIEpvbmVzLCBDb2xpbiBNYWNLZW56aWUgSVYuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG5cbiBSZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXQgbW9kaWZpY2F0aW9uLFxuIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcblxuICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzXG4gbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXG4gdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvblxuIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuXG4gVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCIgQU5EXG4gQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcbiBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFXG4gRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1JcbiBBTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVNcbiAoSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7XG4gTE9TUyBPRiBVU0UsIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OXG4gQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbiAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJU1xuIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLiAqL1xuKGZ1bmN0aW9uKGUpe1widXNlIHN0cmljdFwiO3ZhciB0PXt9O3R5cGVvZiBleHBvcnRzPT1cInVuZGVmaW5lZFwiP3R5cGVvZiBkZWZpbmU9PVwiZnVuY3Rpb25cIiYmdHlwZW9mIGRlZmluZS5hbWQ9PVwib2JqZWN0XCImJmRlZmluZS5hbWQ/KHQuZXhwb3J0cz17fSxkZWZpbmUoZnVuY3Rpb24oKXtyZXR1cm4gdC5leHBvcnRzfSkpOnQuZXhwb3J0cz10eXBlb2Ygd2luZG93IT1cInVuZGVmaW5lZFwiP3dpbmRvdzplOnQuZXhwb3J0cz1leHBvcnRzLGZ1bmN0aW9uKGUpe2lmKCF0KXZhciB0PTFlLTY7aWYoIW4pdmFyIG49dHlwZW9mIEZsb2F0MzJBcnJheSE9XCJ1bmRlZmluZWRcIj9GbG9hdDMyQXJyYXk6QXJyYXk7aWYoIXIpdmFyIHI9TWF0aC5yYW5kb207dmFyIGk9e307aS5zZXRNYXRyaXhBcnJheVR5cGU9ZnVuY3Rpb24oZSl7bj1lfSx0eXBlb2YgZSE9XCJ1bmRlZmluZWRcIiYmKGUuZ2xNYXRyaXg9aSk7dmFyIHM9TWF0aC5QSS8xODA7aS50b1JhZGlhbj1mdW5jdGlvbihlKXtyZXR1cm4gZSpzfTt2YXIgbz17fTtvLmNyZWF0ZT1mdW5jdGlvbigpe3ZhciBlPW5ldyBuKDIpO3JldHVybiBlWzBdPTAsZVsxXT0wLGV9LG8uY2xvbmU9ZnVuY3Rpb24oZSl7dmFyIHQ9bmV3IG4oMik7cmV0dXJuIHRbMF09ZVswXSx0WzFdPWVbMV0sdH0sby5mcm9tVmFsdWVzPWZ1bmN0aW9uKGUsdCl7dmFyIHI9bmV3IG4oMik7cmV0dXJuIHJbMF09ZSxyWzFdPXQscn0sby5jb3B5PWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF09dFswXSxlWzFdPXRbMV0sZX0sby5zZXQ9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXQsZVsxXT1uLGV9LG8uYWRkPWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT10WzBdK25bMF0sZVsxXT10WzFdK25bMV0sZX0sby5zdWJ0cmFjdD1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXS1uWzBdLGVbMV09dFsxXS1uWzFdLGV9LG8uc3ViPW8uc3VidHJhY3Qsby5tdWx0aXBseT1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXSpuWzBdLGVbMV09dFsxXSpuWzFdLGV9LG8ubXVsPW8ubXVsdGlwbHksby5kaXZpZGU9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0vblswXSxlWzFdPXRbMV0vblsxXSxlfSxvLmRpdj1vLmRpdmlkZSxvLm1pbj1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09TWF0aC5taW4odFswXSxuWzBdKSxlWzFdPU1hdGgubWluKHRbMV0sblsxXSksZX0sby5tYXg9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPU1hdGgubWF4KHRbMF0sblswXSksZVsxXT1NYXRoLm1heCh0WzFdLG5bMV0pLGV9LG8uc2NhbGU9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0qbixlWzFdPXRbMV0qbixlfSxvLnNjYWxlQW5kQWRkPWZ1bmN0aW9uKGUsdCxuLHIpe3JldHVybiBlWzBdPXRbMF0rblswXSpyLGVbMV09dFsxXStuWzFdKnIsZX0sby5kaXN0YW5jZT1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0tZVswXSxyPXRbMV0tZVsxXTtyZXR1cm4gTWF0aC5zcXJ0KG4qbityKnIpfSxvLmRpc3Q9by5kaXN0YW5jZSxvLnNxdWFyZWREaXN0YW5jZT1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0tZVswXSxyPXRbMV0tZVsxXTtyZXR1cm4gbipuK3Iqcn0sby5zcXJEaXN0PW8uc3F1YXJlZERpc3RhbmNlLG8ubGVuZ3RoPWZ1bmN0aW9uKGUpe3ZhciB0PWVbMF0sbj1lWzFdO3JldHVybiBNYXRoLnNxcnQodCp0K24qbil9LG8ubGVuPW8ubGVuZ3RoLG8uc3F1YXJlZExlbmd0aD1mdW5jdGlvbihlKXt2YXIgdD1lWzBdLG49ZVsxXTtyZXR1cm4gdCp0K24qbn0sby5zcXJMZW49by5zcXVhcmVkTGVuZ3RoLG8ubmVnYXRlPWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF09LXRbMF0sZVsxXT0tdFsxXSxlfSxvLm5vcm1hbGl6ZT1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9bipuK3IqcjtyZXR1cm4gaT4wJiYoaT0xL01hdGguc3FydChpKSxlWzBdPXRbMF0qaSxlWzFdPXRbMV0qaSksZX0sby5kb3Q9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gZVswXSp0WzBdK2VbMV0qdFsxXX0sby5jcm9zcz1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSpuWzFdLXRbMV0qblswXTtyZXR1cm4gZVswXT1lWzFdPTAsZVsyXT1yLGV9LG8ubGVycD1mdW5jdGlvbihlLHQsbixyKXt2YXIgaT10WzBdLHM9dFsxXTtyZXR1cm4gZVswXT1pK3IqKG5bMF0taSksZVsxXT1zK3IqKG5bMV0tcyksZX0sby5yYW5kb209ZnVuY3Rpb24oZSx0KXt0PXR8fDE7dmFyIG49cigpKjIqTWF0aC5QSTtyZXR1cm4gZVswXT1NYXRoLmNvcyhuKSp0LGVbMV09TWF0aC5zaW4obikqdCxlfSxvLnRyYW5zZm9ybU1hdDI9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdO3JldHVybiBlWzBdPW5bMF0qcituWzJdKmksZVsxXT1uWzFdKnIrblszXSppLGV9LG8udHJhbnNmb3JtTWF0MmQ9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdO3JldHVybiBlWzBdPW5bMF0qcituWzJdKmkrbls0XSxlWzFdPW5bMV0qcituWzNdKmkrbls1XSxlfSxvLnRyYW5zZm9ybU1hdDM9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdO3JldHVybiBlWzBdPW5bMF0qcituWzNdKmkrbls2XSxlWzFdPW5bMV0qcituWzRdKmkrbls3XSxlfSxvLnRyYW5zZm9ybU1hdDQ9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdO3JldHVybiBlWzBdPW5bMF0qcituWzRdKmkrblsxMl0sZVsxXT1uWzFdKnIrbls1XSppK25bMTNdLGV9LG8uZm9yRWFjaD1mdW5jdGlvbigpe3ZhciBlPW8uY3JlYXRlKCk7cmV0dXJuIGZ1bmN0aW9uKHQsbixyLGkscyxvKXt2YXIgdSxhO258fChuPTIpLHJ8fChyPTApLGk/YT1NYXRoLm1pbihpKm4rcix0Lmxlbmd0aCk6YT10Lmxlbmd0aDtmb3IodT1yO3U8YTt1Kz1uKWVbMF09dFt1XSxlWzFdPXRbdSsxXSxzKGUsZSxvKSx0W3VdPWVbMF0sdFt1KzFdPWVbMV07cmV0dXJuIHR9fSgpLG8uc3RyPWZ1bmN0aW9uKGUpe3JldHVyblwidmVjMihcIitlWzBdK1wiLCBcIitlWzFdK1wiKVwifSx0eXBlb2YgZSE9XCJ1bmRlZmluZWRcIiYmKGUudmVjMj1vKTt2YXIgdT17fTt1LmNyZWF0ZT1mdW5jdGlvbigpe3ZhciBlPW5ldyBuKDMpO3JldHVybiBlWzBdPTAsZVsxXT0wLGVbMl09MCxlfSx1LmNsb25lPWZ1bmN0aW9uKGUpe3ZhciB0PW5ldyBuKDMpO3JldHVybiB0WzBdPWVbMF0sdFsxXT1lWzFdLHRbMl09ZVsyXSx0fSx1LmZyb21WYWx1ZXM9ZnVuY3Rpb24oZSx0LHIpe3ZhciBpPW5ldyBuKDMpO3JldHVybiBpWzBdPWUsaVsxXT10LGlbMl09cixpfSx1LmNvcHk9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gZVswXT10WzBdLGVbMV09dFsxXSxlWzJdPXRbMl0sZX0sdS5zZXQ9ZnVuY3Rpb24oZSx0LG4scil7cmV0dXJuIGVbMF09dCxlWzFdPW4sZVsyXT1yLGV9LHUuYWRkPWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT10WzBdK25bMF0sZVsxXT10WzFdK25bMV0sZVsyXT10WzJdK25bMl0sZX0sdS5zdWJ0cmFjdD1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXS1uWzBdLGVbMV09dFsxXS1uWzFdLGVbMl09dFsyXS1uWzJdLGV9LHUuc3ViPXUuc3VidHJhY3QsdS5tdWx0aXBseT1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXSpuWzBdLGVbMV09dFsxXSpuWzFdLGVbMl09dFsyXSpuWzJdLGV9LHUubXVsPXUubXVsdGlwbHksdS5kaXZpZGU9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0vblswXSxlWzFdPXRbMV0vblsxXSxlWzJdPXRbMl0vblsyXSxlfSx1LmRpdj11LmRpdmlkZSx1Lm1pbj1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09TWF0aC5taW4odFswXSxuWzBdKSxlWzFdPU1hdGgubWluKHRbMV0sblsxXSksZVsyXT1NYXRoLm1pbih0WzJdLG5bMl0pLGV9LHUubWF4PWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT1NYXRoLm1heCh0WzBdLG5bMF0pLGVbMV09TWF0aC5tYXgodFsxXSxuWzFdKSxlWzJdPU1hdGgubWF4KHRbMl0sblsyXSksZX0sdS5zY2FsZT1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXSpuLGVbMV09dFsxXSpuLGVbMl09dFsyXSpuLGV9LHUuc2NhbGVBbmRBZGQ9ZnVuY3Rpb24oZSx0LG4scil7cmV0dXJuIGVbMF09dFswXStuWzBdKnIsZVsxXT10WzFdK25bMV0qcixlWzJdPXRbMl0rblsyXSpyLGV9LHUuZGlzdGFuY2U9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLWVbMF0scj10WzFdLWVbMV0saT10WzJdLWVbMl07cmV0dXJuIE1hdGguc3FydChuKm4rcipyK2kqaSl9LHUuZGlzdD11LmRpc3RhbmNlLHUuc3F1YXJlZERpc3RhbmNlPWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXS1lWzBdLHI9dFsxXS1lWzFdLGk9dFsyXS1lWzJdO3JldHVybiBuKm4rcipyK2kqaX0sdS5zcXJEaXN0PXUuc3F1YXJlZERpc3RhbmNlLHUubGVuZ3RoPWZ1bmN0aW9uKGUpe3ZhciB0PWVbMF0sbj1lWzFdLHI9ZVsyXTtyZXR1cm4gTWF0aC5zcXJ0KHQqdCtuKm4rcipyKX0sdS5sZW49dS5sZW5ndGgsdS5zcXVhcmVkTGVuZ3RoPWZ1bmN0aW9uKGUpe3ZhciB0PWVbMF0sbj1lWzFdLHI9ZVsyXTtyZXR1cm4gdCp0K24qbityKnJ9LHUuc3FyTGVuPXUuc3F1YXJlZExlbmd0aCx1Lm5lZ2F0ZT1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdPS10WzBdLGVbMV09LXRbMV0sZVsyXT0tdFsyXSxlfSx1Lm5vcm1hbGl6ZT1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9dFsyXSxzPW4qbityKnIraSppO3JldHVybiBzPjAmJihzPTEvTWF0aC5zcXJ0KHMpLGVbMF09dFswXSpzLGVbMV09dFsxXSpzLGVbMl09dFsyXSpzKSxlfSx1LmRvdD1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdKnRbMF0rZVsxXSp0WzFdK2VbMl0qdFsyXX0sdS5jcm9zcz1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89blswXSx1PW5bMV0sYT1uWzJdO3JldHVybiBlWzBdPWkqYS1zKnUsZVsxXT1zKm8tciphLGVbMl09cip1LWkqbyxlfSx1LmxlcnA9ZnVuY3Rpb24oZSx0LG4scil7dmFyIGk9dFswXSxzPXRbMV0sbz10WzJdO3JldHVybiBlWzBdPWkrciooblswXS1pKSxlWzFdPXMrciooblsxXS1zKSxlWzJdPW8rciooblsyXS1vKSxlfSx1LnJhbmRvbT1mdW5jdGlvbihlLHQpe3Q9dHx8MTt2YXIgbj1yKCkqMipNYXRoLlBJLGk9cigpKjItMSxzPU1hdGguc3FydCgxLWkqaSkqdDtyZXR1cm4gZVswXT1NYXRoLmNvcyhuKSpzLGVbMV09TWF0aC5zaW4obikqcyxlWzJdPWkqdCxlfSx1LnRyYW5zZm9ybU1hdDQ9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXTtyZXR1cm4gZVswXT1uWzBdKnIrbls0XSppK25bOF0qcytuWzEyXSxlWzFdPW5bMV0qcituWzVdKmkrbls5XSpzK25bMTNdLGVbMl09blsyXSpyK25bNl0qaStuWzEwXSpzK25bMTRdLGV9LHUudHJhbnNmb3JtTWF0Mz1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdO3JldHVybiBlWzBdPXIqblswXStpKm5bM10rcypuWzZdLGVbMV09cipuWzFdK2kqbls0XStzKm5bN10sZVsyXT1yKm5bMl0raSpuWzVdK3Mqbls4XSxlfSx1LnRyYW5zZm9ybVF1YXQ9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPW5bMF0sdT1uWzFdLGE9blsyXSxmPW5bM10sbD1mKnIrdSpzLWEqaSxjPWYqaSthKnItbypzLGg9ZipzK28qaS11KnIscD0tbypyLXUqaS1hKnM7cmV0dXJuIGVbMF09bCpmK3AqLW8rYyotYS1oKi11LGVbMV09YypmK3AqLXUraCotby1sKi1hLGVbMl09aCpmK3AqLWErbCotdS1jKi1vLGV9LHUucm90YXRlWD1mdW5jdGlvbihlLHQsbixyKXt2YXIgaT1bXSxzPVtdO3JldHVybiBpWzBdPXRbMF0tblswXSxpWzFdPXRbMV0tblsxXSxpWzJdPXRbMl0tblsyXSxzWzBdPWlbMF0sc1sxXT1pWzFdKk1hdGguY29zKHIpLWlbMl0qTWF0aC5zaW4ociksc1syXT1pWzFdKk1hdGguc2luKHIpK2lbMl0qTWF0aC5jb3MociksZVswXT1zWzBdK25bMF0sZVsxXT1zWzFdK25bMV0sZVsyXT1zWzJdK25bMl0sZX0sdS5yb3RhdGVZPWZ1bmN0aW9uKGUsdCxuLHIpe3ZhciBpPVtdLHM9W107cmV0dXJuIGlbMF09dFswXS1uWzBdLGlbMV09dFsxXS1uWzFdLGlbMl09dFsyXS1uWzJdLHNbMF09aVsyXSpNYXRoLnNpbihyKStpWzBdKk1hdGguY29zKHIpLHNbMV09aVsxXSxzWzJdPWlbMl0qTWF0aC5jb3MociktaVswXSpNYXRoLnNpbihyKSxlWzBdPXNbMF0rblswXSxlWzFdPXNbMV0rblsxXSxlWzJdPXNbMl0rblsyXSxlfSx1LnJvdGF0ZVo9ZnVuY3Rpb24oZSx0LG4scil7dmFyIGk9W10scz1bXTtyZXR1cm4gaVswXT10WzBdLW5bMF0saVsxXT10WzFdLW5bMV0saVsyXT10WzJdLW5bMl0sc1swXT1pWzBdKk1hdGguY29zKHIpLWlbMV0qTWF0aC5zaW4ociksc1sxXT1pWzBdKk1hdGguc2luKHIpK2lbMV0qTWF0aC5jb3Mociksc1syXT1pWzJdLGVbMF09c1swXStuWzBdLGVbMV09c1sxXStuWzFdLGVbMl09c1syXStuWzJdLGV9LHUuZm9yRWFjaD1mdW5jdGlvbigpe3ZhciBlPXUuY3JlYXRlKCk7cmV0dXJuIGZ1bmN0aW9uKHQsbixyLGkscyxvKXt2YXIgdSxhO258fChuPTMpLHJ8fChyPTApLGk/YT1NYXRoLm1pbihpKm4rcix0Lmxlbmd0aCk6YT10Lmxlbmd0aDtmb3IodT1yO3U8YTt1Kz1uKWVbMF09dFt1XSxlWzFdPXRbdSsxXSxlWzJdPXRbdSsyXSxzKGUsZSxvKSx0W3VdPWVbMF0sdFt1KzFdPWVbMV0sdFt1KzJdPWVbMl07cmV0dXJuIHR9fSgpLHUuc3RyPWZ1bmN0aW9uKGUpe3JldHVyblwidmVjMyhcIitlWzBdK1wiLCBcIitlWzFdK1wiLCBcIitlWzJdK1wiKVwifSx0eXBlb2YgZSE9XCJ1bmRlZmluZWRcIiYmKGUudmVjMz11KTt2YXIgYT17fTthLmNyZWF0ZT1mdW5jdGlvbigpe3ZhciBlPW5ldyBuKDQpO3JldHVybiBlWzBdPTAsZVsxXT0wLGVbMl09MCxlWzNdPTAsZX0sYS5jbG9uZT1mdW5jdGlvbihlKXt2YXIgdD1uZXcgbig0KTtyZXR1cm4gdFswXT1lWzBdLHRbMV09ZVsxXSx0WzJdPWVbMl0sdFszXT1lWzNdLHR9LGEuZnJvbVZhbHVlcz1mdW5jdGlvbihlLHQscixpKXt2YXIgcz1uZXcgbig0KTtyZXR1cm4gc1swXT1lLHNbMV09dCxzWzJdPXIsc1szXT1pLHN9LGEuY29weT1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdPXRbMF0sZVsxXT10WzFdLGVbMl09dFsyXSxlWzNdPXRbM10sZX0sYS5zZXQ9ZnVuY3Rpb24oZSx0LG4scixpKXtyZXR1cm4gZVswXT10LGVbMV09bixlWzJdPXIsZVszXT1pLGV9LGEuYWRkPWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT10WzBdK25bMF0sZVsxXT10WzFdK25bMV0sZVsyXT10WzJdK25bMl0sZVszXT10WzNdK25bM10sZX0sYS5zdWJ0cmFjdD1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXS1uWzBdLGVbMV09dFsxXS1uWzFdLGVbMl09dFsyXS1uWzJdLGVbM109dFszXS1uWzNdLGV9LGEuc3ViPWEuc3VidHJhY3QsYS5tdWx0aXBseT1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXSpuWzBdLGVbMV09dFsxXSpuWzFdLGVbMl09dFsyXSpuWzJdLGVbM109dFszXSpuWzNdLGV9LGEubXVsPWEubXVsdGlwbHksYS5kaXZpZGU9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0vblswXSxlWzFdPXRbMV0vblsxXSxlWzJdPXRbMl0vblsyXSxlWzNdPXRbM10vblszXSxlfSxhLmRpdj1hLmRpdmlkZSxhLm1pbj1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09TWF0aC5taW4odFswXSxuWzBdKSxlWzFdPU1hdGgubWluKHRbMV0sblsxXSksZVsyXT1NYXRoLm1pbih0WzJdLG5bMl0pLGVbM109TWF0aC5taW4odFszXSxuWzNdKSxlfSxhLm1heD1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09TWF0aC5tYXgodFswXSxuWzBdKSxlWzFdPU1hdGgubWF4KHRbMV0sblsxXSksZVsyXT1NYXRoLm1heCh0WzJdLG5bMl0pLGVbM109TWF0aC5tYXgodFszXSxuWzNdKSxlfSxhLnNjYWxlPWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT10WzBdKm4sZVsxXT10WzFdKm4sZVsyXT10WzJdKm4sZVszXT10WzNdKm4sZX0sYS5zY2FsZUFuZEFkZD1mdW5jdGlvbihlLHQsbixyKXtyZXR1cm4gZVswXT10WzBdK25bMF0qcixlWzFdPXRbMV0rblsxXSpyLGVbMl09dFsyXStuWzJdKnIsZVszXT10WzNdK25bM10qcixlfSxhLmRpc3RhbmNlPWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXS1lWzBdLHI9dFsxXS1lWzFdLGk9dFsyXS1lWzJdLHM9dFszXS1lWzNdO3JldHVybiBNYXRoLnNxcnQobipuK3IqcitpKmkrcypzKX0sYS5kaXN0PWEuZGlzdGFuY2UsYS5zcXVhcmVkRGlzdGFuY2U9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLWVbMF0scj10WzFdLWVbMV0saT10WzJdLWVbMl0scz10WzNdLWVbM107cmV0dXJuIG4qbityKnIraSppK3Mqc30sYS5zcXJEaXN0PWEuc3F1YXJlZERpc3RhbmNlLGEubGVuZ3RoPWZ1bmN0aW9uKGUpe3ZhciB0PWVbMF0sbj1lWzFdLHI9ZVsyXSxpPWVbM107cmV0dXJuIE1hdGguc3FydCh0KnQrbipuK3IqcitpKmkpfSxhLmxlbj1hLmxlbmd0aCxhLnNxdWFyZWRMZW5ndGg9ZnVuY3Rpb24oZSl7dmFyIHQ9ZVswXSxuPWVbMV0scj1lWzJdLGk9ZVszXTtyZXR1cm4gdCp0K24qbityKnIraSppfSxhLnNxckxlbj1hLnNxdWFyZWRMZW5ndGgsYS5uZWdhdGU9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gZVswXT0tdFswXSxlWzFdPS10WzFdLGVbMl09LXRbMl0sZVszXT0tdFszXSxlfSxhLm5vcm1hbGl6ZT1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9dFsyXSxzPXRbM10sbz1uKm4rcipyK2kqaStzKnM7cmV0dXJuIG8+MCYmKG89MS9NYXRoLnNxcnQobyksZVswXT10WzBdKm8sZVsxXT10WzFdKm8sZVsyXT10WzJdKm8sZVszXT10WzNdKm8pLGV9LGEuZG90PWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF0qdFswXStlWzFdKnRbMV0rZVsyXSp0WzJdK2VbM10qdFszXX0sYS5sZXJwPWZ1bmN0aW9uKGUsdCxuLHIpe3ZhciBpPXRbMF0scz10WzFdLG89dFsyXSx1PXRbM107cmV0dXJuIGVbMF09aStyKihuWzBdLWkpLGVbMV09cytyKihuWzFdLXMpLGVbMl09bytyKihuWzJdLW8pLGVbM109dStyKihuWzNdLXUpLGV9LGEucmFuZG9tPWZ1bmN0aW9uKGUsdCl7cmV0dXJuIHQ9dHx8MSxlWzBdPXIoKSxlWzFdPXIoKSxlWzJdPXIoKSxlWzNdPXIoKSxhLm5vcm1hbGl6ZShlLGUpLGEuc2NhbGUoZSxlLHQpLGV9LGEudHJhbnNmb3JtTWF0ND1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXTtyZXR1cm4gZVswXT1uWzBdKnIrbls0XSppK25bOF0qcytuWzEyXSpvLGVbMV09blsxXSpyK25bNV0qaStuWzldKnMrblsxM10qbyxlWzJdPW5bMl0qcituWzZdKmkrblsxMF0qcytuWzE0XSpvLGVbM109blszXSpyK25bN10qaStuWzExXSpzK25bMTVdKm8sZX0sYS50cmFuc2Zvcm1RdWF0PWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz1uWzBdLHU9blsxXSxhPW5bMl0sZj1uWzNdLGw9ZipyK3Uqcy1hKmksYz1mKmkrYSpyLW8qcyxoPWYqcytvKmktdSpyLHA9LW8qci11KmktYSpzO3JldHVybiBlWzBdPWwqZitwKi1vK2MqLWEtaCotdSxlWzFdPWMqZitwKi11K2gqLW8tbCotYSxlWzJdPWgqZitwKi1hK2wqLXUtYyotbyxlfSxhLmZvckVhY2g9ZnVuY3Rpb24oKXt2YXIgZT1hLmNyZWF0ZSgpO3JldHVybiBmdW5jdGlvbih0LG4scixpLHMsbyl7dmFyIHUsYTtufHwobj00KSxyfHwocj0wKSxpP2E9TWF0aC5taW4oaSpuK3IsdC5sZW5ndGgpOmE9dC5sZW5ndGg7Zm9yKHU9cjt1PGE7dSs9billWzBdPXRbdV0sZVsxXT10W3UrMV0sZVsyXT10W3UrMl0sZVszXT10W3UrM10scyhlLGUsbyksdFt1XT1lWzBdLHRbdSsxXT1lWzFdLHRbdSsyXT1lWzJdLHRbdSszXT1lWzNdO3JldHVybiB0fX0oKSxhLnN0cj1mdW5jdGlvbihlKXtyZXR1cm5cInZlYzQoXCIrZVswXStcIiwgXCIrZVsxXStcIiwgXCIrZVsyXStcIiwgXCIrZVszXStcIilcIn0sdHlwZW9mIGUhPVwidW5kZWZpbmVkXCImJihlLnZlYzQ9YSk7dmFyIGY9e307Zi5jcmVhdGU9ZnVuY3Rpb24oKXt2YXIgZT1uZXcgbig0KTtyZXR1cm4gZVswXT0xLGVbMV09MCxlWzJdPTAsZVszXT0xLGV9LGYuY2xvbmU9ZnVuY3Rpb24oZSl7dmFyIHQ9bmV3IG4oNCk7cmV0dXJuIHRbMF09ZVswXSx0WzFdPWVbMV0sdFsyXT1lWzJdLHRbM109ZVszXSx0fSxmLmNvcHk9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gZVswXT10WzBdLGVbMV09dFsxXSxlWzJdPXRbMl0sZVszXT10WzNdLGV9LGYuaWRlbnRpdHk9ZnVuY3Rpb24oZSl7cmV0dXJuIGVbMF09MSxlWzFdPTAsZVsyXT0wLGVbM109MSxlfSxmLnRyYW5zcG9zZT1mdW5jdGlvbihlLHQpe2lmKGU9PT10KXt2YXIgbj10WzFdO2VbMV09dFsyXSxlWzJdPW59ZWxzZSBlWzBdPXRbMF0sZVsxXT10WzJdLGVbMl09dFsxXSxlWzNdPXRbM107cmV0dXJuIGV9LGYuaW52ZXJ0PWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSxyPXRbMV0saT10WzJdLHM9dFszXSxvPW4qcy1pKnI7cmV0dXJuIG8/KG89MS9vLGVbMF09cypvLGVbMV09LXIqbyxlWzJdPS1pKm8sZVszXT1uKm8sZSk6bnVsbH0sZi5hZGpvaW50PWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXTtyZXR1cm4gZVswXT10WzNdLGVbMV09LXRbMV0sZVsyXT0tdFsyXSxlWzNdPW4sZX0sZi5kZXRlcm1pbmFudD1mdW5jdGlvbihlKXtyZXR1cm4gZVswXSplWzNdLWVbMl0qZVsxXX0sZi5tdWx0aXBseT1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PW5bMF0sYT1uWzFdLGY9blsyXSxsPW5bM107cmV0dXJuIGVbMF09cip1K3MqYSxlWzFdPWkqdStvKmEsZVsyXT1yKmYrcypsLGVbM109aSpmK28qbCxlfSxmLm11bD1mLm11bHRpcGx5LGYucm90YXRlPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz10WzNdLHU9TWF0aC5zaW4obiksYT1NYXRoLmNvcyhuKTtyZXR1cm4gZVswXT1yKmErcyp1LGVbMV09aSphK28qdSxlWzJdPXIqLXUrcyphLGVbM109aSotdStvKmEsZX0sZi5zY2FsZT1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PW5bMF0sYT1uWzFdO3JldHVybiBlWzBdPXIqdSxlWzFdPWkqdSxlWzJdPXMqYSxlWzNdPW8qYSxlfSxmLnN0cj1mdW5jdGlvbihlKXtyZXR1cm5cIm1hdDIoXCIrZVswXStcIiwgXCIrZVsxXStcIiwgXCIrZVsyXStcIiwgXCIrZVszXStcIilcIn0sZi5mcm9iPWZ1bmN0aW9uKGUpe3JldHVybiBNYXRoLnNxcnQoTWF0aC5wb3coZVswXSwyKStNYXRoLnBvdyhlWzFdLDIpK01hdGgucG93KGVbMl0sMikrTWF0aC5wb3coZVszXSwyKSl9LGYuTERVPWZ1bmN0aW9uKGUsdCxuLHIpe3JldHVybiBlWzJdPXJbMl0vclswXSxuWzBdPXJbMF0sblsxXT1yWzFdLG5bM109clszXS1lWzJdKm5bMV0sW2UsdCxuXX0sdHlwZW9mIGUhPVwidW5kZWZpbmVkXCImJihlLm1hdDI9Zik7dmFyIGw9e307bC5jcmVhdGU9ZnVuY3Rpb24oKXt2YXIgZT1uZXcgbig2KTtyZXR1cm4gZVswXT0xLGVbMV09MCxlWzJdPTAsZVszXT0xLGVbNF09MCxlWzVdPTAsZX0sbC5jbG9uZT1mdW5jdGlvbihlKXt2YXIgdD1uZXcgbig2KTtyZXR1cm4gdFswXT1lWzBdLHRbMV09ZVsxXSx0WzJdPWVbMl0sdFszXT1lWzNdLHRbNF09ZVs0XSx0WzVdPWVbNV0sdH0sbC5jb3B5PWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF09dFswXSxlWzFdPXRbMV0sZVsyXT10WzJdLGVbM109dFszXSxlWzRdPXRbNF0sZVs1XT10WzVdLGV9LGwuaWRlbnRpdHk9ZnVuY3Rpb24oZSl7cmV0dXJuIGVbMF09MSxlWzFdPTAsZVsyXT0wLGVbM109MSxlWzRdPTAsZVs1XT0wLGV9LGwuaW52ZXJ0PWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSxyPXRbMV0saT10WzJdLHM9dFszXSxvPXRbNF0sdT10WzVdLGE9bipzLXIqaTtyZXR1cm4gYT8oYT0xL2EsZVswXT1zKmEsZVsxXT0tciphLGVbMl09LWkqYSxlWzNdPW4qYSxlWzRdPShpKnUtcypvKSphLGVbNV09KHIqby1uKnUpKmEsZSk6bnVsbH0sbC5kZXRlcm1pbmFudD1mdW5jdGlvbihlKXtyZXR1cm4gZVswXSplWzNdLWVbMV0qZVsyXX0sbC5tdWx0aXBseT1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PXRbNF0sYT10WzVdLGY9blswXSxsPW5bMV0sYz1uWzJdLGg9blszXSxwPW5bNF0sZD1uWzVdO3JldHVybiBlWzBdPXIqZitzKmwsZVsxXT1pKmYrbypsLGVbMl09cipjK3MqaCxlWzNdPWkqYytvKmgsZVs0XT1yKnArcypkK3UsZVs1XT1pKnArbypkK2EsZX0sbC5tdWw9bC5tdWx0aXBseSxsLnJvdGF0ZT1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PXRbNF0sYT10WzVdLGY9TWF0aC5zaW4obiksbD1NYXRoLmNvcyhuKTtyZXR1cm4gZVswXT1yKmwrcypmLGVbMV09aSpsK28qZixlWzJdPXIqLWYrcypsLGVbM109aSotZitvKmwsZVs0XT11LGVbNV09YSxlfSxsLnNjYWxlPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz10WzNdLHU9dFs0XSxhPXRbNV0sZj1uWzBdLGw9blsxXTtyZXR1cm4gZVswXT1yKmYsZVsxXT1pKmYsZVsyXT1zKmwsZVszXT1vKmwsZVs0XT11LGVbNV09YSxlfSxsLnRyYW5zbGF0ZT1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PXRbNF0sYT10WzVdLGY9blswXSxsPW5bMV07cmV0dXJuIGVbMF09cixlWzFdPWksZVsyXT1zLGVbM109byxlWzRdPXIqZitzKmwrdSxlWzVdPWkqZitvKmwrYSxlfSxsLnN0cj1mdW5jdGlvbihlKXtyZXR1cm5cIm1hdDJkKFwiK2VbMF0rXCIsIFwiK2VbMV0rXCIsIFwiK2VbMl0rXCIsIFwiK2VbM10rXCIsIFwiK2VbNF0rXCIsIFwiK2VbNV0rXCIpXCJ9LGwuZnJvYj1mdW5jdGlvbihlKXtyZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KGVbMF0sMikrTWF0aC5wb3coZVsxXSwyKStNYXRoLnBvdyhlWzJdLDIpK01hdGgucG93KGVbM10sMikrTWF0aC5wb3coZVs0XSwyKStNYXRoLnBvdyhlWzVdLDIpKzEpfSx0eXBlb2YgZSE9XCJ1bmRlZmluZWRcIiYmKGUubWF0MmQ9bCk7dmFyIGM9e307Yy5jcmVhdGU9ZnVuY3Rpb24oKXt2YXIgZT1uZXcgbig5KTtyZXR1cm4gZVswXT0xLGVbMV09MCxlWzJdPTAsZVszXT0wLGVbNF09MSxlWzVdPTAsZVs2XT0wLGVbN109MCxlWzhdPTEsZX0sYy5mcm9tTWF0ND1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdPXRbMF0sZVsxXT10WzFdLGVbMl09dFsyXSxlWzNdPXRbNF0sZVs0XT10WzVdLGVbNV09dFs2XSxlWzZdPXRbOF0sZVs3XT10WzldLGVbOF09dFsxMF0sZX0sYy5jbG9uZT1mdW5jdGlvbihlKXt2YXIgdD1uZXcgbig5KTtyZXR1cm4gdFswXT1lWzBdLHRbMV09ZVsxXSx0WzJdPWVbMl0sdFszXT1lWzNdLHRbNF09ZVs0XSx0WzVdPWVbNV0sdFs2XT1lWzZdLHRbN109ZVs3XSx0WzhdPWVbOF0sdH0sYy5jb3B5PWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF09dFswXSxlWzFdPXRbMV0sZVsyXT10WzJdLGVbM109dFszXSxlWzRdPXRbNF0sZVs1XT10WzVdLGVbNl09dFs2XSxlWzddPXRbN10sZVs4XT10WzhdLGV9LGMuaWRlbnRpdHk9ZnVuY3Rpb24oZSl7cmV0dXJuIGVbMF09MSxlWzFdPTAsZVsyXT0wLGVbM109MCxlWzRdPTEsZVs1XT0wLGVbNl09MCxlWzddPTAsZVs4XT0xLGV9LGMudHJhbnNwb3NlPWZ1bmN0aW9uKGUsdCl7aWYoZT09PXQpe3ZhciBuPXRbMV0scj10WzJdLGk9dFs1XTtlWzFdPXRbM10sZVsyXT10WzZdLGVbM109bixlWzVdPXRbN10sZVs2XT1yLGVbN109aX1lbHNlIGVbMF09dFswXSxlWzFdPXRbM10sZVsyXT10WzZdLGVbM109dFsxXSxlWzRdPXRbNF0sZVs1XT10WzddLGVbNl09dFsyXSxlWzddPXRbNV0sZVs4XT10WzhdO3JldHVybiBlfSxjLmludmVydD1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9dFsyXSxzPXRbM10sbz10WzRdLHU9dFs1XSxhPXRbNl0sZj10WzddLGw9dFs4XSxjPWwqby11KmYsaD0tbCpzK3UqYSxwPWYqcy1vKmEsZD1uKmMrcipoK2kqcDtyZXR1cm4gZD8oZD0xL2QsZVswXT1jKmQsZVsxXT0oLWwqcitpKmYpKmQsZVsyXT0odSpyLWkqbykqZCxlWzNdPWgqZCxlWzRdPShsKm4taSphKSpkLGVbNV09KC11Km4raSpzKSpkLGVbNl09cCpkLGVbN109KC1mKm4rciphKSpkLGVbOF09KG8qbi1yKnMpKmQsZSk6bnVsbH0sYy5hZGpvaW50PWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSxyPXRbMV0saT10WzJdLHM9dFszXSxvPXRbNF0sdT10WzVdLGE9dFs2XSxmPXRbN10sbD10WzhdO3JldHVybiBlWzBdPW8qbC11KmYsZVsxXT1pKmYtcipsLGVbMl09cip1LWkqbyxlWzNdPXUqYS1zKmwsZVs0XT1uKmwtaSphLGVbNV09aSpzLW4qdSxlWzZdPXMqZi1vKmEsZVs3XT1yKmEtbipmLGVbOF09bipvLXIqcyxlfSxjLmRldGVybWluYW50PWZ1bmN0aW9uKGUpe3ZhciB0PWVbMF0sbj1lWzFdLHI9ZVsyXSxpPWVbM10scz1lWzRdLG89ZVs1XSx1PWVbNl0sYT1lWzddLGY9ZVs4XTtyZXR1cm4gdCooZipzLW8qYSkrbiooLWYqaStvKnUpK3IqKGEqaS1zKnUpfSxjLm11bHRpcGx5PWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz10WzNdLHU9dFs0XSxhPXRbNV0sZj10WzZdLGw9dFs3XSxjPXRbOF0saD1uWzBdLHA9blsxXSxkPW5bMl0sdj1uWzNdLG09bls0XSxnPW5bNV0seT1uWzZdLGI9bls3XSx3PW5bOF07cmV0dXJuIGVbMF09aCpyK3AqbytkKmYsZVsxXT1oKmkrcCp1K2QqbCxlWzJdPWgqcytwKmErZCpjLGVbM109dipyK20qbytnKmYsZVs0XT12KmkrbSp1K2cqbCxlWzVdPXYqcyttKmErZypjLGVbNl09eSpyK2Iqbyt3KmYsZVs3XT15KmkrYip1K3cqbCxlWzhdPXkqcytiKmErdypjLGV9LGMubXVsPWMubXVsdGlwbHksYy50cmFuc2xhdGU9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT10WzRdLGE9dFs1XSxmPXRbNl0sbD10WzddLGM9dFs4XSxoPW5bMF0scD1uWzFdO3JldHVybiBlWzBdPXIsZVsxXT1pLGVbMl09cyxlWzNdPW8sZVs0XT11LGVbNV09YSxlWzZdPWgqcitwKm8rZixlWzddPWgqaStwKnUrbCxlWzhdPWgqcytwKmErYyxlfSxjLnJvdGF0ZT1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PXRbNF0sYT10WzVdLGY9dFs2XSxsPXRbN10sYz10WzhdLGg9TWF0aC5zaW4obikscD1NYXRoLmNvcyhuKTtyZXR1cm4gZVswXT1wKnIraCpvLGVbMV09cCppK2gqdSxlWzJdPXAqcytoKmEsZVszXT1wKm8taCpyLGVbNF09cCp1LWgqaSxlWzVdPXAqYS1oKnMsZVs2XT1mLGVbN109bCxlWzhdPWMsZX0sYy5zY2FsZT1mdW5jdGlvbihlLHQsbil7dmFyIHI9blswXSxpPW5bMV07cmV0dXJuIGVbMF09cip0WzBdLGVbMV09cip0WzFdLGVbMl09cip0WzJdLGVbM109aSp0WzNdLGVbNF09aSp0WzRdLGVbNV09aSp0WzVdLGVbNl09dFs2XSxlWzddPXRbN10sZVs4XT10WzhdLGV9LGMuZnJvbU1hdDJkPWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF09dFswXSxlWzFdPXRbMV0sZVsyXT0wLGVbM109dFsyXSxlWzRdPXRbM10sZVs1XT0wLGVbNl09dFs0XSxlWzddPXRbNV0sZVs4XT0xLGV9LGMuZnJvbVF1YXQ9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLHI9dFsxXSxpPXRbMl0scz10WzNdLG89bituLHU9cityLGE9aStpLGY9bipvLGw9cipvLGM9cip1LGg9aSpvLHA9aSp1LGQ9aSphLHY9cypvLG09cyp1LGc9cyphO3JldHVybiBlWzBdPTEtYy1kLGVbM109bC1nLGVbNl09aCttLGVbMV09bCtnLGVbNF09MS1mLWQsZVs3XT1wLXYsZVsyXT1oLW0sZVs1XT1wK3YsZVs4XT0xLWYtYyxlfSxjLm5vcm1hbEZyb21NYXQ0PWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSxyPXRbMV0saT10WzJdLHM9dFszXSxvPXRbNF0sdT10WzVdLGE9dFs2XSxmPXRbN10sbD10WzhdLGM9dFs5XSxoPXRbMTBdLHA9dFsxMV0sZD10WzEyXSx2PXRbMTNdLG09dFsxNF0sZz10WzE1XSx5PW4qdS1yKm8sYj1uKmEtaSpvLHc9bipmLXMqbyxFPXIqYS1pKnUsUz1yKmYtcyp1LHg9aSpmLXMqYSxUPWwqdi1jKmQsTj1sKm0taCpkLEM9bCpnLXAqZCxrPWMqbS1oKnYsTD1jKmctcCp2LEE9aCpnLXAqbSxPPXkqQS1iKkwrdyprK0UqQy1TKk4reCpUO3JldHVybiBPPyhPPTEvTyxlWzBdPSh1KkEtYSpMK2YqaykqTyxlWzFdPShhKkMtbypBLWYqTikqTyxlWzJdPShvKkwtdSpDK2YqVCkqTyxlWzNdPShpKkwtcipBLXMqaykqTyxlWzRdPShuKkEtaSpDK3MqTikqTyxlWzVdPShyKkMtbipMLXMqVCkqTyxlWzZdPSh2KngtbSpTK2cqRSkqTyxlWzddPShtKnctZCp4LWcqYikqTyxlWzhdPShkKlMtdip3K2cqeSkqTyxlKTpudWxsfSxjLnN0cj1mdW5jdGlvbihlKXtyZXR1cm5cIm1hdDMoXCIrZVswXStcIiwgXCIrZVsxXStcIiwgXCIrZVsyXStcIiwgXCIrZVszXStcIiwgXCIrZVs0XStcIiwgXCIrZVs1XStcIiwgXCIrZVs2XStcIiwgXCIrZVs3XStcIiwgXCIrZVs4XStcIilcIn0sYy5mcm9iPWZ1bmN0aW9uKGUpe3JldHVybiBNYXRoLnNxcnQoTWF0aC5wb3coZVswXSwyKStNYXRoLnBvdyhlWzFdLDIpK01hdGgucG93KGVbMl0sMikrTWF0aC5wb3coZVszXSwyKStNYXRoLnBvdyhlWzRdLDIpK01hdGgucG93KGVbNV0sMikrTWF0aC5wb3coZVs2XSwyKStNYXRoLnBvdyhlWzddLDIpK01hdGgucG93KGVbOF0sMikpfSx0eXBlb2YgZSE9XCJ1bmRlZmluZWRcIiYmKGUubWF0Mz1jKTt2YXIgaD17fTtoLmNyZWF0ZT1mdW5jdGlvbigpe3ZhciBlPW5ldyBuKDE2KTtyZXR1cm4gZVswXT0xLGVbMV09MCxlWzJdPTAsZVszXT0wLGVbNF09MCxlWzVdPTEsZVs2XT0wLGVbN109MCxlWzhdPTAsZVs5XT0wLGVbMTBdPTEsZVsxMV09MCxlWzEyXT0wLGVbMTNdPTAsZVsxNF09MCxlWzE1XT0xLGV9LGguY2xvbmU9ZnVuY3Rpb24oZSl7dmFyIHQ9bmV3IG4oMTYpO3JldHVybiB0WzBdPWVbMF0sdFsxXT1lWzFdLHRbMl09ZVsyXSx0WzNdPWVbM10sdFs0XT1lWzRdLHRbNV09ZVs1XSx0WzZdPWVbNl0sdFs3XT1lWzddLHRbOF09ZVs4XSx0WzldPWVbOV0sdFsxMF09ZVsxMF0sdFsxMV09ZVsxMV0sdFsxMl09ZVsxMl0sdFsxM109ZVsxM10sdFsxNF09ZVsxNF0sdFsxNV09ZVsxNV0sdH0saC5jb3B5PWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF09dFswXSxlWzFdPXRbMV0sZVsyXT10WzJdLGVbM109dFszXSxlWzRdPXRbNF0sZVs1XT10WzVdLGVbNl09dFs2XSxlWzddPXRbN10sZVs4XT10WzhdLGVbOV09dFs5XSxlWzEwXT10WzEwXSxlWzExXT10WzExXSxlWzEyXT10WzEyXSxlWzEzXT10WzEzXSxlWzE0XT10WzE0XSxlWzE1XT10WzE1XSxlfSxoLmlkZW50aXR5PWZ1bmN0aW9uKGUpe3JldHVybiBlWzBdPTEsZVsxXT0wLGVbMl09MCxlWzNdPTAsZVs0XT0wLGVbNV09MSxlWzZdPTAsZVs3XT0wLGVbOF09MCxlWzldPTAsZVsxMF09MSxlWzExXT0wLGVbMTJdPTAsZVsxM109MCxlWzE0XT0wLGVbMTVdPTEsZX0saC50cmFuc3Bvc2U9ZnVuY3Rpb24oZSx0KXtpZihlPT09dCl7dmFyIG49dFsxXSxyPXRbMl0saT10WzNdLHM9dFs2XSxvPXRbN10sdT10WzExXTtlWzFdPXRbNF0sZVsyXT10WzhdLGVbM109dFsxMl0sZVs0XT1uLGVbNl09dFs5XSxlWzddPXRbMTNdLGVbOF09cixlWzldPXMsZVsxMV09dFsxNF0sZVsxMl09aSxlWzEzXT1vLGVbMTRdPXV9ZWxzZSBlWzBdPXRbMF0sZVsxXT10WzRdLGVbMl09dFs4XSxlWzNdPXRbMTJdLGVbNF09dFsxXSxlWzVdPXRbNV0sZVs2XT10WzldLGVbN109dFsxM10sZVs4XT10WzJdLGVbOV09dFs2XSxlWzEwXT10WzEwXSxlWzExXT10WzE0XSxlWzEyXT10WzNdLGVbMTNdPXRbN10sZVsxNF09dFsxMV0sZVsxNV09dFsxNV07cmV0dXJuIGV9LGguaW52ZXJ0PWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSxyPXRbMV0saT10WzJdLHM9dFszXSxvPXRbNF0sdT10WzVdLGE9dFs2XSxmPXRbN10sbD10WzhdLGM9dFs5XSxoPXRbMTBdLHA9dFsxMV0sZD10WzEyXSx2PXRbMTNdLG09dFsxNF0sZz10WzE1XSx5PW4qdS1yKm8sYj1uKmEtaSpvLHc9bipmLXMqbyxFPXIqYS1pKnUsUz1yKmYtcyp1LHg9aSpmLXMqYSxUPWwqdi1jKmQsTj1sKm0taCpkLEM9bCpnLXAqZCxrPWMqbS1oKnYsTD1jKmctcCp2LEE9aCpnLXAqbSxPPXkqQS1iKkwrdyprK0UqQy1TKk4reCpUO3JldHVybiBPPyhPPTEvTyxlWzBdPSh1KkEtYSpMK2YqaykqTyxlWzFdPShpKkwtcipBLXMqaykqTyxlWzJdPSh2KngtbSpTK2cqRSkqTyxlWzNdPShoKlMtYyp4LXAqRSkqTyxlWzRdPShhKkMtbypBLWYqTikqTyxlWzVdPShuKkEtaSpDK3MqTikqTyxlWzZdPShtKnctZCp4LWcqYikqTyxlWzddPShsKngtaCp3K3AqYikqTyxlWzhdPShvKkwtdSpDK2YqVCkqTyxlWzldPShyKkMtbipMLXMqVCkqTyxlWzEwXT0oZCpTLXYqdytnKnkpKk8sZVsxMV09KGMqdy1sKlMtcCp5KSpPLGVbMTJdPSh1Kk4tbyprLWEqVCkqTyxlWzEzXT0obiprLXIqTitpKlQpKk8sZVsxNF09KHYqYi1kKkUtbSp5KSpPLGVbMTVdPShsKkUtYypiK2gqeSkqTyxlKTpudWxsfSxoLmFkam9pbnQ9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLHI9dFsxXSxpPXRbMl0scz10WzNdLG89dFs0XSx1PXRbNV0sYT10WzZdLGY9dFs3XSxsPXRbOF0sYz10WzldLGg9dFsxMF0scD10WzExXSxkPXRbMTJdLHY9dFsxM10sbT10WzE0XSxnPXRbMTVdO3JldHVybiBlWzBdPXUqKGgqZy1wKm0pLWMqKGEqZy1mKm0pK3YqKGEqcC1mKmgpLGVbMV09LShyKihoKmctcCptKS1jKihpKmctcyptKSt2KihpKnAtcypoKSksZVsyXT1yKihhKmctZiptKS11KihpKmctcyptKSt2KihpKmYtcyphKSxlWzNdPS0ociooYSpwLWYqaCktdSooaSpwLXMqaCkrYyooaSpmLXMqYSkpLGVbNF09LShvKihoKmctcCptKS1sKihhKmctZiptKStkKihhKnAtZipoKSksZVs1XT1uKihoKmctcCptKS1sKihpKmctcyptKStkKihpKnAtcypoKSxlWzZdPS0obiooYSpnLWYqbSktbyooaSpnLXMqbSkrZCooaSpmLXMqYSkpLGVbN109biooYSpwLWYqaCktbyooaSpwLXMqaCkrbCooaSpmLXMqYSksZVs4XT1vKihjKmctcCp2KS1sKih1KmctZip2KStkKih1KnAtZipjKSxlWzldPS0obiooYypnLXAqdiktbCoocipnLXMqdikrZCoocipwLXMqYykpLGVbMTBdPW4qKHUqZy1mKnYpLW8qKHIqZy1zKnYpK2QqKHIqZi1zKnUpLGVbMTFdPS0obioodSpwLWYqYyktbyoocipwLXMqYykrbCoocipmLXMqdSkpLGVbMTJdPS0obyooYyptLWgqdiktbCoodSptLWEqdikrZCoodSpoLWEqYykpLGVbMTNdPW4qKGMqbS1oKnYpLWwqKHIqbS1pKnYpK2QqKHIqaC1pKmMpLGVbMTRdPS0obioodSptLWEqdiktbyoociptLWkqdikrZCoociphLWkqdSkpLGVbMTVdPW4qKHUqaC1hKmMpLW8qKHIqaC1pKmMpK2wqKHIqYS1pKnUpLGV9LGguZGV0ZXJtaW5hbnQ9ZnVuY3Rpb24oZSl7dmFyIHQ9ZVswXSxuPWVbMV0scj1lWzJdLGk9ZVszXSxzPWVbNF0sbz1lWzVdLHU9ZVs2XSxhPWVbN10sZj1lWzhdLGw9ZVs5XSxjPWVbMTBdLGg9ZVsxMV0scD1lWzEyXSxkPWVbMTNdLHY9ZVsxNF0sbT1lWzE1XSxnPXQqby1uKnMseT10KnUtcipzLGI9dCphLWkqcyx3PW4qdS1yKm8sRT1uKmEtaSpvLFM9ciphLWkqdSx4PWYqZC1sKnAsVD1mKnYtYypwLE49ZiptLWgqcCxDPWwqdi1jKmQsaz1sKm0taCpkLEw9YyptLWgqdjtyZXR1cm4gZypMLXkqaytiKkMrdypOLUUqVCtTKnh9LGgubXVsdGlwbHk9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT10WzRdLGE9dFs1XSxmPXRbNl0sbD10WzddLGM9dFs4XSxoPXRbOV0scD10WzEwXSxkPXRbMTFdLHY9dFsxMl0sbT10WzEzXSxnPXRbMTRdLHk9dFsxNV0sYj1uWzBdLHc9blsxXSxFPW5bMl0sUz1uWzNdO3JldHVybiBlWzBdPWIqcit3KnUrRSpjK1MqdixlWzFdPWIqaSt3KmErRSpoK1MqbSxlWzJdPWIqcyt3KmYrRSpwK1MqZyxlWzNdPWIqbyt3KmwrRSpkK1MqeSxiPW5bNF0sdz1uWzVdLEU9bls2XSxTPW5bN10sZVs0XT1iKnIrdyp1K0UqYytTKnYsZVs1XT1iKmkrdyphK0UqaCtTKm0sZVs2XT1iKnMrdypmK0UqcCtTKmcsZVs3XT1iKm8rdypsK0UqZCtTKnksYj1uWzhdLHc9bls5XSxFPW5bMTBdLFM9blsxMV0sZVs4XT1iKnIrdyp1K0UqYytTKnYsZVs5XT1iKmkrdyphK0UqaCtTKm0sZVsxMF09YipzK3cqZitFKnArUypnLGVbMTFdPWIqbyt3KmwrRSpkK1MqeSxiPW5bMTJdLHc9blsxM10sRT1uWzE0XSxTPW5bMTVdLGVbMTJdPWIqcit3KnUrRSpjK1MqdixlWzEzXT1iKmkrdyphK0UqaCtTKm0sZVsxNF09YipzK3cqZitFKnArUypnLGVbMTVdPWIqbyt3KmwrRSpkK1MqeSxlfSxoLm11bD1oLm11bHRpcGx5LGgudHJhbnNsYXRlPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj1uWzBdLGk9blsxXSxzPW5bMl0sbyx1LGEsZixsLGMsaCxwLGQsdixtLGc7cmV0dXJuIHQ9PT1lPyhlWzEyXT10WzBdKnIrdFs0XSppK3RbOF0qcyt0WzEyXSxlWzEzXT10WzFdKnIrdFs1XSppK3RbOV0qcyt0WzEzXSxlWzE0XT10WzJdKnIrdFs2XSppK3RbMTBdKnMrdFsxNF0sZVsxNV09dFszXSpyK3RbN10qaSt0WzExXSpzK3RbMTVdKToobz10WzBdLHU9dFsxXSxhPXRbMl0sZj10WzNdLGw9dFs0XSxjPXRbNV0saD10WzZdLHA9dFs3XSxkPXRbOF0sdj10WzldLG09dFsxMF0sZz10WzExXSxlWzBdPW8sZVsxXT11LGVbMl09YSxlWzNdPWYsZVs0XT1sLGVbNV09YyxlWzZdPWgsZVs3XT1wLGVbOF09ZCxlWzldPXYsZVsxMF09bSxlWzExXT1nLGVbMTJdPW8qcitsKmkrZCpzK3RbMTJdLGVbMTNdPXUqcitjKmkrdipzK3RbMTNdLGVbMTRdPWEqcitoKmkrbSpzK3RbMTRdLGVbMTVdPWYqcitwKmkrZypzK3RbMTVdKSxlfSxoLnNjYWxlPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj1uWzBdLGk9blsxXSxzPW5bMl07cmV0dXJuIGVbMF09dFswXSpyLGVbMV09dFsxXSpyLGVbMl09dFsyXSpyLGVbM109dFszXSpyLGVbNF09dFs0XSppLGVbNV09dFs1XSppLGVbNl09dFs2XSppLGVbN109dFs3XSppLGVbOF09dFs4XSpzLGVbOV09dFs5XSpzLGVbMTBdPXRbMTBdKnMsZVsxMV09dFsxMV0qcyxlWzEyXT10WzEyXSxlWzEzXT10WzEzXSxlWzE0XT10WzE0XSxlWzE1XT10WzE1XSxlfSxoLnJvdGF0ZT1mdW5jdGlvbihlLG4scixpKXt2YXIgcz1pWzBdLG89aVsxXSx1PWlbMl0sYT1NYXRoLnNxcnQocypzK28qbyt1KnUpLGYsbCxjLGgscCxkLHYsbSxnLHksYix3LEUsUyx4LFQsTixDLGssTCxBLE8sTSxfO3JldHVybiBNYXRoLmFicyhhKTx0P251bGw6KGE9MS9hLHMqPWEsbyo9YSx1Kj1hLGY9TWF0aC5zaW4ociksbD1NYXRoLmNvcyhyKSxjPTEtbCxoPW5bMF0scD1uWzFdLGQ9blsyXSx2PW5bM10sbT1uWzRdLGc9bls1XSx5PW5bNl0sYj1uWzddLHc9bls4XSxFPW5bOV0sUz1uWzEwXSx4PW5bMTFdLFQ9cypzKmMrbCxOPW8qcypjK3UqZixDPXUqcypjLW8qZixrPXMqbypjLXUqZixMPW8qbypjK2wsQT11Km8qYytzKmYsTz1zKnUqYytvKmYsTT1vKnUqYy1zKmYsXz11KnUqYytsLGVbMF09aCpUK20qTit3KkMsZVsxXT1wKlQrZypOK0UqQyxlWzJdPWQqVCt5Kk4rUypDLGVbM109dipUK2IqTit4KkMsZVs0XT1oKmsrbSpMK3cqQSxlWzVdPXAqaytnKkwrRSpBLGVbNl09ZCprK3kqTCtTKkEsZVs3XT12KmsrYipMK3gqQSxlWzhdPWgqTyttKk0rdypfLGVbOV09cCpPK2cqTStFKl8sZVsxMF09ZCpPK3kqTStTKl8sZVsxMV09dipPK2IqTSt4Kl8sbiE9PWUmJihlWzEyXT1uWzEyXSxlWzEzXT1uWzEzXSxlWzE0XT1uWzE0XSxlWzE1XT1uWzE1XSksZSl9LGgucm90YXRlWD1mdW5jdGlvbihlLHQsbil7dmFyIHI9TWF0aC5zaW4obiksaT1NYXRoLmNvcyhuKSxzPXRbNF0sbz10WzVdLHU9dFs2XSxhPXRbN10sZj10WzhdLGw9dFs5XSxjPXRbMTBdLGg9dFsxMV07cmV0dXJuIHQhPT1lJiYoZVswXT10WzBdLGVbMV09dFsxXSxlWzJdPXRbMl0sZVszXT10WzNdLGVbMTJdPXRbMTJdLGVbMTNdPXRbMTNdLGVbMTRdPXRbMTRdLGVbMTVdPXRbMTVdKSxlWzRdPXMqaStmKnIsZVs1XT1vKmkrbCpyLGVbNl09dSppK2MqcixlWzddPWEqaStoKnIsZVs4XT1mKmktcypyLGVbOV09bCppLW8qcixlWzEwXT1jKmktdSpyLGVbMTFdPWgqaS1hKnIsZX0saC5yb3RhdGVZPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj1NYXRoLnNpbihuKSxpPU1hdGguY29zKG4pLHM9dFswXSxvPXRbMV0sdT10WzJdLGE9dFszXSxmPXRbOF0sbD10WzldLGM9dFsxMF0saD10WzExXTtyZXR1cm4gdCE9PWUmJihlWzRdPXRbNF0sZVs1XT10WzVdLGVbNl09dFs2XSxlWzddPXRbN10sZVsxMl09dFsxMl0sZVsxM109dFsxM10sZVsxNF09dFsxNF0sZVsxNV09dFsxNV0pLGVbMF09cyppLWYqcixlWzFdPW8qaS1sKnIsZVsyXT11KmktYypyLGVbM109YSppLWgqcixlWzhdPXMqcitmKmksZVs5XT1vKnIrbCppLGVbMTBdPXUqcitjKmksZVsxMV09YSpyK2gqaSxlfSxoLnJvdGF0ZVo9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPU1hdGguc2luKG4pLGk9TWF0aC5jb3Mobikscz10WzBdLG89dFsxXSx1PXRbMl0sYT10WzNdLGY9dFs0XSxsPXRbNV0sYz10WzZdLGg9dFs3XTtyZXR1cm4gdCE9PWUmJihlWzhdPXRbOF0sZVs5XT10WzldLGVbMTBdPXRbMTBdLGVbMTFdPXRbMTFdLGVbMTJdPXRbMTJdLGVbMTNdPXRbMTNdLGVbMTRdPXRbMTRdLGVbMTVdPXRbMTVdKSxlWzBdPXMqaStmKnIsZVsxXT1vKmkrbCpyLGVbMl09dSppK2MqcixlWzNdPWEqaStoKnIsZVs0XT1mKmktcypyLGVbNV09bCppLW8qcixlWzZdPWMqaS11KnIsZVs3XT1oKmktYSpyLGV9LGguZnJvbVJvdGF0aW9uVHJhbnNsYXRpb249ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT1yK3IsYT1pK2ksZj1zK3MsbD1yKnUsYz1yKmEsaD1yKmYscD1pKmEsZD1pKmYsdj1zKmYsbT1vKnUsZz1vKmEseT1vKmY7cmV0dXJuIGVbMF09MS0ocCt2KSxlWzFdPWMreSxlWzJdPWgtZyxlWzNdPTAsZVs0XT1jLXksZVs1XT0xLShsK3YpLGVbNl09ZCttLGVbN109MCxlWzhdPWgrZyxlWzldPWQtbSxlWzEwXT0xLShsK3ApLGVbMTFdPTAsZVsxMl09blswXSxlWzEzXT1uWzFdLGVbMTRdPW5bMl0sZVsxNV09MSxlfSxoLmZyb21RdWF0PWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSxyPXRbMV0saT10WzJdLHM9dFszXSxvPW4rbix1PXIrcixhPWkraSxmPW4qbyxsPXIqbyxjPXIqdSxoPWkqbyxwPWkqdSxkPWkqYSx2PXMqbyxtPXMqdSxnPXMqYTtyZXR1cm4gZVswXT0xLWMtZCxlWzFdPWwrZyxlWzJdPWgtbSxlWzNdPTAsZVs0XT1sLWcsZVs1XT0xLWYtZCxlWzZdPXArdixlWzddPTAsZVs4XT1oK20sZVs5XT1wLXYsZVsxMF09MS1mLWMsZVsxMV09MCxlWzEyXT0wLGVbMTNdPTAsZVsxNF09MCxlWzE1XT0xLGV9LGguZnJ1c3R1bT1mdW5jdGlvbihlLHQsbixyLGkscyxvKXt2YXIgdT0xLyhuLXQpLGE9MS8oaS1yKSxmPTEvKHMtbyk7cmV0dXJuIGVbMF09cyoyKnUsZVsxXT0wLGVbMl09MCxlWzNdPTAsZVs0XT0wLGVbNV09cyoyKmEsZVs2XT0wLGVbN109MCxlWzhdPShuK3QpKnUsZVs5XT0oaStyKSphLGVbMTBdPShvK3MpKmYsZVsxMV09LTEsZVsxMl09MCxlWzEzXT0wLGVbMTRdPW8qcyoyKmYsZVsxNV09MCxlfSxoLnBlcnNwZWN0aXZlPWZ1bmN0aW9uKGUsdCxuLHIsaSl7dmFyIHM9MS9NYXRoLnRhbih0LzIpLG89MS8oci1pKTtyZXR1cm4gZVswXT1zL24sZVsxXT0wLGVbMl09MCxlWzNdPTAsZVs0XT0wLGVbNV09cyxlWzZdPTAsZVs3XT0wLGVbOF09MCxlWzldPTAsZVsxMF09KGkrcikqbyxlWzExXT0tMSxlWzEyXT0wLGVbMTNdPTAsZVsxNF09MippKnIqbyxlWzE1XT0wLGV9LGgub3J0aG89ZnVuY3Rpb24oZSx0LG4scixpLHMsbyl7dmFyIHU9MS8odC1uKSxhPTEvKHItaSksZj0xLyhzLW8pO3JldHVybiBlWzBdPS0yKnUsZVsxXT0wLGVbMl09MCxlWzNdPTAsZVs0XT0wLGVbNV09LTIqYSxlWzZdPTAsZVs3XT0wLGVbOF09MCxlWzldPTAsZVsxMF09MipmLGVbMTFdPTAsZVsxMl09KHQrbikqdSxlWzEzXT0oaStyKSphLGVbMTRdPShvK3MpKmYsZVsxNV09MSxlfSxoLmxvb2tBdD1mdW5jdGlvbihlLG4scixpKXt2YXIgcyxvLHUsYSxmLGwsYyxwLGQsdixtPW5bMF0sZz1uWzFdLHk9blsyXSxiPWlbMF0sdz1pWzFdLEU9aVsyXSxTPXJbMF0seD1yWzFdLFQ9clsyXTtyZXR1cm4gTWF0aC5hYnMobS1TKTx0JiZNYXRoLmFicyhnLXgpPHQmJk1hdGguYWJzKHktVCk8dD9oLmlkZW50aXR5KGUpOihjPW0tUyxwPWcteCxkPXktVCx2PTEvTWF0aC5zcXJ0KGMqYytwKnArZCpkKSxjKj12LHAqPXYsZCo9dixzPXcqZC1FKnAsbz1FKmMtYipkLHU9YipwLXcqYyx2PU1hdGguc3FydChzKnMrbypvK3UqdSksdj8odj0xL3Yscyo9dixvKj12LHUqPXYpOihzPTAsbz0wLHU9MCksYT1wKnUtZCpvLGY9ZCpzLWMqdSxsPWMqby1wKnMsdj1NYXRoLnNxcnQoYSphK2YqZitsKmwpLHY/KHY9MS92LGEqPXYsZio9dixsKj12KTooYT0wLGY9MCxsPTApLGVbMF09cyxlWzFdPWEsZVsyXT1jLGVbM109MCxlWzRdPW8sZVs1XT1mLGVbNl09cCxlWzddPTAsZVs4XT11LGVbOV09bCxlWzEwXT1kLGVbMTFdPTAsZVsxMl09LShzKm0rbypnK3UqeSksZVsxM109LShhKm0rZipnK2wqeSksZVsxNF09LShjKm0rcCpnK2QqeSksZVsxNV09MSxlKX0saC5zdHI9ZnVuY3Rpb24oZSl7cmV0dXJuXCJtYXQ0KFwiK2VbMF0rXCIsIFwiK2VbMV0rXCIsIFwiK2VbMl0rXCIsIFwiK2VbM10rXCIsIFwiK2VbNF0rXCIsIFwiK2VbNV0rXCIsIFwiK2VbNl0rXCIsIFwiK2VbN10rXCIsIFwiK2VbOF0rXCIsIFwiK2VbOV0rXCIsIFwiK2VbMTBdK1wiLCBcIitlWzExXStcIiwgXCIrZVsxMl0rXCIsIFwiK2VbMTNdK1wiLCBcIitlWzE0XStcIiwgXCIrZVsxNV0rXCIpXCJ9LGguZnJvYj1mdW5jdGlvbihlKXtyZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KGVbMF0sMikrTWF0aC5wb3coZVsxXSwyKStNYXRoLnBvdyhlWzJdLDIpK01hdGgucG93KGVbM10sMikrTWF0aC5wb3coZVs0XSwyKStNYXRoLnBvdyhlWzVdLDIpK01hdGgucG93KGVbNl0sMikrTWF0aC5wb3coZVs2XSwyKStNYXRoLnBvdyhlWzddLDIpK01hdGgucG93KGVbOF0sMikrTWF0aC5wb3coZVs5XSwyKStNYXRoLnBvdyhlWzEwXSwyKStNYXRoLnBvdyhlWzExXSwyKStNYXRoLnBvdyhlWzEyXSwyKStNYXRoLnBvdyhlWzEzXSwyKStNYXRoLnBvdyhlWzE0XSwyKStNYXRoLnBvdyhlWzE1XSwyKSl9LHR5cGVvZiBlIT1cInVuZGVmaW5lZFwiJiYoZS5tYXQ0PWgpO3ZhciBwPXt9O3AuY3JlYXRlPWZ1bmN0aW9uKCl7dmFyIGU9bmV3IG4oNCk7cmV0dXJuIGVbMF09MCxlWzFdPTAsZVsyXT0wLGVbM109MSxlfSxwLnJvdGF0aW9uVG89ZnVuY3Rpb24oKXt2YXIgZT11LmNyZWF0ZSgpLHQ9dS5mcm9tVmFsdWVzKDEsMCwwKSxuPXUuZnJvbVZhbHVlcygwLDEsMCk7cmV0dXJuIGZ1bmN0aW9uKHIsaSxzKXt2YXIgbz11LmRvdChpLHMpO3JldHVybiBvPC0wLjk5OTk5OT8odS5jcm9zcyhlLHQsaSksdS5sZW5ndGgoZSk8MWUtNiYmdS5jcm9zcyhlLG4saSksdS5ub3JtYWxpemUoZSxlKSxwLnNldEF4aXNBbmdsZShyLGUsTWF0aC5QSSkscik6bz4uOTk5OTk5PyhyWzBdPTAsclsxXT0wLHJbMl09MCxyWzNdPTEscik6KHUuY3Jvc3MoZSxpLHMpLHJbMF09ZVswXSxyWzFdPWVbMV0sclsyXT1lWzJdLHJbM109MStvLHAubm9ybWFsaXplKHIscikpfX0oKSxwLnNldEF4ZXM9ZnVuY3Rpb24oKXt2YXIgZT1jLmNyZWF0ZSgpO3JldHVybiBmdW5jdGlvbih0LG4scixpKXtyZXR1cm4gZVswXT1yWzBdLGVbM109clsxXSxlWzZdPXJbMl0sZVsxXT1pWzBdLGVbNF09aVsxXSxlWzddPWlbMl0sZVsyXT0tblswXSxlWzVdPS1uWzFdLGVbOF09LW5bMl0scC5ub3JtYWxpemUodCxwLmZyb21NYXQzKHQsZSkpfX0oKSxwLmNsb25lPWEuY2xvbmUscC5mcm9tVmFsdWVzPWEuZnJvbVZhbHVlcyxwLmNvcHk9YS5jb3B5LHAuc2V0PWEuc2V0LHAuaWRlbnRpdHk9ZnVuY3Rpb24oZSl7cmV0dXJuIGVbMF09MCxlWzFdPTAsZVsyXT0wLGVbM109MSxlfSxwLnNldEF4aXNBbmdsZT1mdW5jdGlvbihlLHQsbil7bio9LjU7dmFyIHI9TWF0aC5zaW4obik7cmV0dXJuIGVbMF09cip0WzBdLGVbMV09cip0WzFdLGVbMl09cip0WzJdLGVbM109TWF0aC5jb3MobiksZX0scC5hZGQ9YS5hZGQscC5tdWx0aXBseT1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PW5bMF0sYT1uWzFdLGY9blsyXSxsPW5bM107cmV0dXJuIGVbMF09cipsK28qdStpKmYtcyphLGVbMV09aSpsK28qYStzKnUtcipmLGVbMl09cypsK28qZityKmEtaSp1LGVbM109bypsLXIqdS1pKmEtcypmLGV9LHAubXVsPXAubXVsdGlwbHkscC5zY2FsZT1hLnNjYWxlLHAucm90YXRlWD1mdW5jdGlvbihlLHQsbil7bio9LjU7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PU1hdGguc2luKG4pLGE9TWF0aC5jb3Mobik7cmV0dXJuIGVbMF09ciphK28qdSxlWzFdPWkqYStzKnUsZVsyXT1zKmEtaSp1LGVbM109byphLXIqdSxlfSxwLnJvdGF0ZVk9ZnVuY3Rpb24oZSx0LG4pe24qPS41O3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT1NYXRoLnNpbihuKSxhPU1hdGguY29zKG4pO3JldHVybiBlWzBdPXIqYS1zKnUsZVsxXT1pKmErbyp1LGVbMl09cyphK3IqdSxlWzNdPW8qYS1pKnUsZX0scC5yb3RhdGVaPWZ1bmN0aW9uKGUsdCxuKXtuKj0uNTt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz10WzNdLHU9TWF0aC5zaW4obiksYT1NYXRoLmNvcyhuKTtyZXR1cm4gZVswXT1yKmEraSp1LGVbMV09aSphLXIqdSxlWzJdPXMqYStvKnUsZVszXT1vKmEtcyp1LGV9LHAuY2FsY3VsYXRlVz1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9dFsyXTtyZXR1cm4gZVswXT1uLGVbMV09cixlWzJdPWksZVszXT0tTWF0aC5zcXJ0KE1hdGguYWJzKDEtbipuLXIqci1pKmkpKSxlfSxwLmRvdD1hLmRvdCxwLmxlcnA9YS5sZXJwLHAuc2xlcnA9ZnVuY3Rpb24oZSx0LG4scil7dmFyIGk9dFswXSxzPXRbMV0sbz10WzJdLHU9dFszXSxhPW5bMF0sZj1uWzFdLGw9blsyXSxjPW5bM10saCxwLGQsdixtO3JldHVybiBwPWkqYStzKmYrbypsK3UqYyxwPDAmJihwPS1wLGE9LWEsZj0tZixsPS1sLGM9LWMpLDEtcD4xZS02PyhoPU1hdGguYWNvcyhwKSxkPU1hdGguc2luKGgpLHY9TWF0aC5zaW4oKDEtcikqaCkvZCxtPU1hdGguc2luKHIqaCkvZCk6KHY9MS1yLG09ciksZVswXT12KmkrbSphLGVbMV09dipzK20qZixlWzJdPXYqbyttKmwsZVszXT12KnUrbSpjLGV9LHAuaW52ZXJ0PWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSxyPXRbMV0saT10WzJdLHM9dFszXSxvPW4qbityKnIraSppK3Mqcyx1PW8/MS9vOjA7cmV0dXJuIGVbMF09LW4qdSxlWzFdPS1yKnUsZVsyXT0taSp1LGVbM109cyp1LGV9LHAuY29uanVnYXRlPWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF09LXRbMF0sZVsxXT0tdFsxXSxlWzJdPS10WzJdLGVbM109dFszXSxlfSxwLmxlbmd0aD1hLmxlbmd0aCxwLmxlbj1wLmxlbmd0aCxwLnNxdWFyZWRMZW5ndGg9YS5zcXVhcmVkTGVuZ3RoLHAuc3FyTGVuPXAuc3F1YXJlZExlbmd0aCxwLm5vcm1hbGl6ZT1hLm5vcm1hbGl6ZSxwLmZyb21NYXQzPWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSt0WzRdK3RbOF0scjtpZihuPjApcj1NYXRoLnNxcnQobisxKSxlWzNdPS41KnIscj0uNS9yLGVbMF09KHRbN10tdFs1XSkqcixlWzFdPSh0WzJdLXRbNl0pKnIsZVsyXT0odFszXS10WzFdKSpyO2Vsc2V7dmFyIGk9MDt0WzRdPnRbMF0mJihpPTEpLHRbOF0+dFtpKjMraV0mJihpPTIpO3ZhciBzPShpKzEpJTMsbz0oaSsyKSUzO3I9TWF0aC5zcXJ0KHRbaSozK2ldLXRbcyozK3NdLXRbbyozK29dKzEpLGVbaV09LjUqcixyPS41L3IsZVszXT0odFtvKjMrc10tdFtzKjMrb10pKnIsZVtzXT0odFtzKjMraV0rdFtpKjMrc10pKnIsZVtvXT0odFtvKjMraV0rdFtpKjMrb10pKnJ9cmV0dXJuIGV9LHAuc3RyPWZ1bmN0aW9uKGUpe3JldHVyblwicXVhdChcIitlWzBdK1wiLCBcIitlWzFdK1wiLCBcIitlWzJdK1wiLCBcIitlWzNdK1wiKVwifSx0eXBlb2YgZSE9XCJ1bmRlZmluZWRcIiYmKGUucXVhdD1wKX0odC5leHBvcnRzKX0pKHRoaXMpO1xufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIxWWlaNVNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9saWIvZ2wtbWF0cml4LW1pbi5qc1wiLFwiL2xpYlwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbnZhciBMaWdodE1hcCA9IHJlcXVpcmUoJ2dsL2xpZ2h0bWFwJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCd1dGlscycpO1xuXG52YXIgbWF4TGlnaHRNYXBzID0gNjQ7XG52YXIgbGlnaHRNYXBCeXRlcyA9IDE7XG52YXIgYmxvY2tXaWR0aCA9IDUxMjtcbnZhciBibG9ja0hlaWdodCA9IDUxMjtcblxudmFyIExpZ2h0TWFwcyA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuYWxsb2NhdGVkID0gdXRpbHMuYXJyYXkyZChibG9ja1dpZHRoLCBtYXhMaWdodE1hcHMpO1xuICAgIHRoaXMubGlnaHRNYXBzRGF0YSA9IFtdO1xufTtcblxuTGlnaHRNYXBzLnByb3RvdHlwZS5idWlsZExpZ2h0TWFwID0gZnVuY3Rpb24oYnNwLCBzdXJmYWNlLCBvZmZzZXQpIHtcbiAgICB2YXIgd2lkdGggPSAoc3VyZmFjZS5leHRlbnRzWzBdID4+IDQpICsgMTtcbiAgICB2YXIgaGVpZ2h0ID0gKHN1cmZhY2UuZXh0ZW50c1sxXSA+PiA0KSArIDE7XG4gICAgdmFyIHNpemUgPSB3aWR0aCAqIGhlaWdodDtcbiAgICB2YXIgYmxvY2tMaWdodHMgPSB1dGlscy5hcnJheTFkKDE4ICogMTgpO1xuICAgIHZhciBsaWdodE1hcE9mZnNldCA9IHN1cmZhY2UubGlnaHRNYXBPZmZzZXQ7XG5cbiAgICBmb3IgKHZhciBtYXAgPSAwOyBtYXAgPCBtYXhMaWdodE1hcHM7IG1hcCsrKSB7XG4gICAgICAgIGlmIChzdXJmYWNlLmxpZ2h0U3R5bGVzW21hcF0gPT09IDI1NSlcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIC8vIFRPRE86IEFkZCBsaWdodHN0eWxlcywgdXNlZCBmb3IgZmxpY2tlcmluZywgYW5kIG90aGVyIGxpZ2h0IGFuaW1hdGlvbnMuXG4gICAgICAgIHZhciBzY2FsZSA9IDI2NDtcbiAgICAgICAgZm9yICh2YXIgYmwgPSAwOyBibCA8IHNpemU7IGJsKyspIHtcbiAgICAgICAgICAgIGJsb2NrTGlnaHRzW2JsXSArPSBic3AubGlnaHRNYXBzW2xpZ2h0TWFwT2Zmc2V0ICsgYmxdICogc2NhbGU7XG4gICAgICAgIH1cbiAgICAgICAgbGlnaHRNYXBPZmZzZXQgKz0gc2l6ZTtcbiAgICB9XG5cbiAgICB2YXIgaSA9IDA7XG4gICAgdmFyIHN0cmlkZSA9IGJsb2NrV2lkdGggKiBsaWdodE1hcEJ5dGVzO1xuICAgIGZvciAodmFyIHkgPSAwOyB5IDwgaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCB3aWR0aDsgeCsrKSB7XG4gICAgICAgICAgICB2YXIgcG9zaXRpb24gPSB5ICogc3RyaWRlICsgeDtcbiAgICAgICAgICAgIHRoaXMubGlnaHRNYXBzRGF0YVtvZmZzZXQgKyBwb3NpdGlvbl0gPSAyNTUgLSBNYXRoLm1pbigyNTUsIGJsb2NrTGlnaHRzW2ldID4+IDcpO1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuTGlnaHRNYXBzLnByb3RvdHlwZS5hbGxvY2F0ZUJsb2NrID0gZnVuY3Rpb24gKHdpZHRoLCBoZWlnaHQpIHtcbiAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgZm9yICh2YXIgdGV4SWQgPSAwOyB0ZXhJZCA8IG1heExpZ2h0TWFwczsgdGV4SWQrKykge1xuICAgICAgICB2YXIgYmVzdCA9IGJsb2NrSGVpZ2h0O1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJsb2NrV2lkdGggLSB3aWR0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgYmVzdDIgPSAwO1xuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB3aWR0aDsgaisrKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5hbGxvY2F0ZWRbdGV4SWRdW2kgKyBqXSA+PSBiZXN0KVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5hbGxvY2F0ZWRbdGV4SWRdW2kgKyBqXSA+IGJlc3QyKVxuICAgICAgICAgICAgICAgICAgICBiZXN0MiA9IHRoaXMuYWxsb2NhdGVkW3RleElkXVtpICsgal07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChqID09IHdpZHRoKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnggPSBpO1xuICAgICAgICAgICAgICAgIHJlc3VsdC55ID0gYmVzdCA9IGJlc3QyO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGJlc3QgKyBoZWlnaHQgPiBibG9ja0hlaWdodClcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgd2lkdGg7IGorKylcbiAgICAgICAgICAgIHRoaXMuYWxsb2NhdGVkW3RleElkXVtyZXN1bHQueCArIGpdID0gYmVzdCArIGhlaWdodDtcblxuICAgICAgICByZXN1bHQudGV4SWQgPSB0ZXhJZDtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59O1xuXG5MaWdodE1hcHMucHJvdG90eXBlLmJ1aWxkID0gZnVuY3Rpb24oYnNwKSB7XG5cbiAgICB2YXIgdXNlZE1hcHMgPSAwO1xuICAgIGZvciAodmFyIG0gPSAwOyBtIDwgYnNwLm1vZGVscy5sZW5ndGg7IG0rKykge1xuICAgICAgICB2YXIgbW9kZWwgPSBic3AubW9kZWxzW21dO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW9kZWwuc3VyZmFjZUNvdW50OyBpKyspIHtcbiAgICAgICAgICAgIHZhciBzdXJmYWNlID0gYnNwLnN1cmZhY2VzW21vZGVsLmZpcnN0U3VyZmFjZSArIGldO1xuXG4gICAgICAgICAgICB2YXIgd2lkdGggPSAoc3VyZmFjZS5leHRlbnRzWzBdID4+IDQpICsgMTtcbiAgICAgICAgICAgIHZhciBoZWlnaHQgPSAoc3VyZmFjZS5leHRlbnRzWzFdID4+IDQpICsgMTtcblxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHRoaXMuYWxsb2NhdGVCbG9jayh3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgICAgIHN1cmZhY2UubGlnaHRNYXBTID0gcmVzdWx0Lng7XG4gICAgICAgICAgICBzdXJmYWNlLmxpZ2h0TWFwVCA9IHJlc3VsdC55O1xuICAgICAgICAgICAgdXNlZE1hcHMgPSBNYXRoLm1heCh1c2VkTWFwcywgcmVzdWx0LnRleElkKTtcbiAgICAgICAgICAgIHZhciBvZmZzZXQgPSByZXN1bHQudGV4SWQgKiBsaWdodE1hcEJ5dGVzICogYmxvY2tXaWR0aCAqIGJsb2NrSGVpZ2h0O1xuICAgICAgICAgICAgb2Zmc2V0ICs9IChyZXN1bHQueSAqIGJsb2NrV2lkdGggKyByZXN1bHQueCkgKiBsaWdodE1hcEJ5dGVzO1xuICAgICAgICAgICAgdGhpcy5idWlsZExpZ2h0TWFwKGJzcCwgc3VyZmFjZSwgb2Zmc2V0KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnRleHR1cmUgPSBuZXcgTGlnaHRNYXAodGhpcy5saWdodE1hcHNEYXRhLCAwLCBibG9ja1dpZHRoLCBibG9ja0hlaWdodCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBMaWdodE1hcHM7XG5cblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIxWWlaNVNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9saWdodG1hcHMuanNcIixcIi9cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgVGV4dHVyZSA9IHJlcXVpcmUoJ2dsL3RleHR1cmUnKTtcbnZhciBMaWdodE1hcHMgPSByZXF1aXJlKCdsaWdodG1hcHMnKTtcbnZhciBhc3NldHMgPSByZXF1aXJlKCdhc3NldHMnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJ3V0aWxzJyk7XG52YXIgd2lyZWZyYW1lID0gZmFsc2U7XG5cbnZhciBibG9ja1dpZHRoID0gNTEyO1xudmFyIGJsb2NrSGVpZ2h0ID0gNTEyO1xuXG52YXIgTWFwID0gZnVuY3Rpb24oYnNwKSB7XG4gICAgdGhpcy50ZXh0dXJlcyA9IFtdO1xuICAgIHRoaXMubGlnaHRNYXBzID0gbmV3IExpZ2h0TWFwcygpO1xuICAgIHRoaXMubGlnaHRNYXBzLmJ1aWxkKGJzcCk7XG5cblxuICAgIGZvciAodmFyIHRleElkIGluIGJzcC50ZXh0dXJlcykge1xuICAgICAgICB2YXIgdGV4dHVyZSA9IGJzcC50ZXh0dXJlc1t0ZXhJZF07XG4gICAgICAgIHZhciBvcHRpb25zID0ge1xuICAgICAgICAgICAgd2lkdGg6IHRleHR1cmUud2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IHRleHR1cmUuaGVpZ2h0LFxuICAgICAgICAgICAgd3JhcDogZ2wuUkVQRUFULFxuICAgICAgICAgICAgcGFsZXR0ZTogYXNzZXRzLnBhbGV0dGVcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy50ZXh0dXJlcy5wdXNoKG5ldyBUZXh0dXJlKHRleHR1cmUuZGF0YSwgb3B0aW9ucykpO1xuICAgIH1cblxuICAgIHZhciBjaGFpbnMgPSBbXTtcbiAgICBmb3IgKHZhciBtIGluIGJzcC5tb2RlbHMpIHtcbiAgICAgICAgdmFyIG1vZGVsID0gYnNwLm1vZGVsc1ttXTtcbiAgICAgICAgZm9yICh2YXIgc2lkID0gbW9kZWwuZmlyc3RTdXJmYWNlOyBzaWQgPCBtb2RlbC5zdXJmYWNlQ291bnQ7IHNpZCsrKSB7XG4gICAgICAgICAgICB2YXIgc3VyZmFjZSA9IGJzcC5zdXJmYWNlc1tzaWRdO1xuICAgICAgICAgICAgdmFyIHRleEluZm8gPSBic3AudGV4SW5mb3Nbc3VyZmFjZS50ZXhJbmZvSWRdO1xuXG4gICAgICAgICAgICB2YXIgY2hhaW4gPSBjaGFpbnNbdGV4SW5mby50ZXh0dXJlSWRdO1xuICAgICAgICAgICAgaWYgKCFjaGFpbikge1xuICAgICAgICAgICAgICAgIGNoYWluID0geyB0ZXhJZDogdGV4SW5mby50ZXh0dXJlSWQsIGRhdGE6IFtdIH07XG4gICAgICAgICAgICAgICAgY2hhaW5zW3RleEluZm8udGV4dHVyZUlkXSA9IGNoYWluO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgaW5kaWNlcyA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgZSA9IHN1cmZhY2UuZWRnZVN0YXJ0OyBlIDwgc3VyZmFjZS5lZGdlU3RhcnQgKyBzdXJmYWNlLmVkZ2VDb3VudDsgZSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGVkZ2VGbGlwcGVkID0gYnNwLmVkZ2VMaXN0W2VdIDwgMDtcbiAgICAgICAgICAgICAgICB2YXIgZWRnZUluZGV4ID0gTWF0aC5hYnMoYnNwLmVkZ2VMaXN0W2VdKTtcbiAgICAgICAgICAgICAgICBpZiAoIWVkZ2VGbGlwcGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGluZGljZXMucHVzaChic3AuZWRnZXNbZWRnZUluZGV4ICogMl0pO1xuICAgICAgICAgICAgICAgICAgICBpbmRpY2VzLnB1c2goYnNwLmVkZ2VzW2VkZ2VJbmRleCAqIDIgKyAxXSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaW5kaWNlcy5wdXNoKGJzcC5lZGdlc1tlZGdlSW5kZXggKiAyICsgMV0pO1xuICAgICAgICAgICAgICAgICAgICBpbmRpY2VzLnB1c2goYnNwLmVkZ2VzW2VkZ2VJbmRleCAqIDJdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbmRpY2VzID0gd2lyZWZyYW1lID8gaW5kaWNlcyA6IHV0aWxzLnRyaWFuZ3VsYXRlKGluZGljZXMpO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbmRpY2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHYgPSBbXG4gICAgICAgICAgICAgICAgICAgIGJzcC52ZXJ0aWNlc1tpbmRpY2VzW2ldXS54LFxuICAgICAgICAgICAgICAgICAgICBic3AudmVydGljZXNbaW5kaWNlc1tpXV0ueSxcbiAgICAgICAgICAgICAgICAgICAgYnNwLnZlcnRpY2VzW2luZGljZXNbaV1dLnpcbiAgICAgICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICAgICAgdmFyIHMgPSB2ZWMzLmRvdCh2LCB0ZXhJbmZvLnZlY3RvclMpICsgdGV4SW5mby5kaXN0UztcbiAgICAgICAgICAgICAgICB2YXIgdCA9IHZlYzMuZG90KHYsIHRleEluZm8udmVjdG9yVCkgKyB0ZXhJbmZvLmRpc3RUO1xuXG4gICAgICAgICAgICAgICAgdmFyIHMxID0gcyAvIHRoaXMudGV4dHVyZXNbdGV4SW5mby50ZXh0dXJlSWRdLndpZHRoO1xuICAgICAgICAgICAgICAgIHZhciB0MSA9IHQgLyB0aGlzLnRleHR1cmVzW3RleEluZm8udGV4dHVyZUlkXS5oZWlnaHQ7XG5cbiAgICAgICAgICAgICAgICAvLyBTaGFkb3cgbWFwIHRleHR1cmUgY29vcmRpbmF0ZXNcbiAgICAgICAgICAgICAgICB2YXIgczIgPSBzO1xuICAgICAgICAgICAgICAgIHMyIC09IHN1cmZhY2UudGV4dHVyZU1pbnNbMF07XG4gICAgICAgICAgICAgICAgczIgKz0gKHN1cmZhY2UubGlnaHRNYXBTICogMTYpO1xuICAgICAgICAgICAgICAgIHMyICs9IDg7XG4gICAgICAgICAgICAgICAgczIgLz0gKGJsb2NrV2lkdGggKiAxNik7XG5cbiAgICAgICAgICAgICAgICB2YXIgdDIgPSB0O1xuICAgICAgICAgICAgICAgIHQyIC09IHN1cmZhY2UudGV4dHVyZU1pbnNbMV07XG4gICAgICAgICAgICAgICAgdDIgKz0gKHN1cmZhY2UubGlnaHRNYXBUICogMTYpO1xuICAgICAgICAgICAgICAgIHQyICs9IDg7XG4gICAgICAgICAgICAgICAgdDIgLz0gKGJsb2NrSGVpZ2h0ICogMTYpO1xuXG4gICAgICAgICAgICAgICAgY2hhaW4uZGF0YS5wdXNoKHZbMF0sIHZbMV0sIHZbMl0sIHMxLCB0MSwgczIsIHQyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciBkYXRhID0gW107XG4gICAgdmFyIG9mZnNldCA9IDA7XG4gICAgdGhpcy5jaGFpbnMgPSBbXTtcbiAgICBmb3IgKHZhciBjIGluIGNoYWlucykge1xuICAgICAgICBmb3IgKHZhciB2ID0gMDsgdiA8IGNoYWluc1tjXS5kYXRhLmxlbmd0aDsgdisrKSB7XG4gICAgICAgICAgICBkYXRhLnB1c2goY2hhaW5zW2NdLmRhdGFbdl0pO1xuICAgICAgICB9XG4gICAgICAgIHZhciBjaGFpbiA9IHtcbiAgICAgICAgICAgIG9mZnNldDogb2Zmc2V0LFxuICAgICAgICAgICAgdGV4SWQ6IGNoYWluc1tjXS50ZXhJZCxcbiAgICAgICAgICAgIGVsZW1lbnRzOiBjaGFpbnNbY10uZGF0YS5sZW5ndGggLyA3XG4gICAgICAgIH07XG4gICAgICAgIG9mZnNldCArPSBjaGFpbi5lbGVtZW50cztcbiAgICAgICAgdGhpcy5jaGFpbnMucHVzaChjaGFpbik7XG4gICAgfVxuICAgIHRoaXMuYnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHRoaXMuYnVmZmVyKTtcbiAgICBnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheShkYXRhKSwgZ2wuU1RBVElDX0RSQVcpO1xuICAgIHRoaXMuYnVmZmVyLnN0cmlkZSA9IDcgKiA0O1xuXG4gICAgY29uc29sZS5sb2codGhpcy5saWdodE1hcHMudGV4dHVyZS5hc0RhdGFVcmwoKSk7XG59O1xuXG5NYXAucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihwLCBtKSB7XG4gICAgdmFyIHNoYWRlciA9IGFzc2V0cy5zaGFkZXJzLndvcmxkO1xuICAgIHZhciBidWZmZXIgPSB0aGlzLmJ1ZmZlcjtcbiAgICB2YXIgbW9kZSA9IHdpcmVmcmFtZSA/IGdsLkxJTkVTIDogZ2wuVFJJQU5HTEVTO1xuXG4gICAgc2hhZGVyLnVzZSgpO1xuICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLmJ1ZmZlcik7XG5cbiAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShzaGFkZXIuYXR0cmlidXRlcy5zaGFkb3dUZXhDb29yZHNBdHRyaWJ1dGUpO1xuXG4gICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihzaGFkZXIuYXR0cmlidXRlcy52ZXJ0ZXhBdHRyaWJ1dGUsIDMsIGdsLkZMT0FULCBmYWxzZSwgYnVmZmVyLnN0cmlkZSwgMCk7XG4gICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihzaGFkZXIuYXR0cmlidXRlcy50ZXhDb29yZHNBdHRyaWJ1dGUsIDIsIGdsLkZMT0FULCBmYWxzZSwgYnVmZmVyLnN0cmlkZSwgMTIpO1xuICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIoc2hhZGVyLmF0dHJpYnV0ZXMuc2hhZG93VGV4Q29vcmRzQXR0cmlidXRlLCAyLCBnbC5GTE9BVCwgZmFsc2UsIGJ1ZmZlci5zdHJpZGUsIDIwKTtcbiAgICBnbC51bmlmb3JtTWF0cml4NGZ2KHNoYWRlci51bmlmb3Jtcy5wcm9qZWN0aW9uTWF0cml4LCBmYWxzZSwgcCk7XG4gICAgZ2wudW5pZm9ybU1hdHJpeDRmdihzaGFkZXIudW5pZm9ybXMubW9kZWx2aWV3TWF0cml4LCBmYWxzZSwgbSk7XG4gICAgZ2wudW5pZm9ybTFpKHNoYWRlci51bmlmb3Jtcy50ZXh0dXJlTWFwLCAwKTtcbiAgICBnbC51bmlmb3JtMWkoc2hhZGVyLnVuaWZvcm1zLmxpZ2h0TWFwLCAxKTtcblxuICAgIHRoaXMubGlnaHRNYXBzLnRleHR1cmUuYmluZCgxKTtcbiAgICBmb3IgKHZhciBjIGluIHRoaXMuY2hhaW5zKSB7XG4gICAgICAgIHZhciBjaGFpbiA9IHRoaXMuY2hhaW5zW2NdO1xuICAgICAgICB2YXIgdGV4dHVyZSA9IHRoaXMudGV4dHVyZXNbY2hhaW4udGV4SWRdO1xuICAgICAgICB0ZXh0dXJlLmJpbmQoMCk7XG4gICAgICAgIGdsLmRyYXdBcnJheXMobW9kZSwgdGhpcy5jaGFpbnNbY10ub2Zmc2V0LCB0aGlzLmNoYWluc1tjXS5lbGVtZW50cyk7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gTWFwO1xufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIxWWlaNVNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9tYXAuanNcIixcIi9cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG5cbnZhciBQcm90b2NvbCA9IHtcbiAgICBzZXJ2ZXJCYWQ6IDAsXG4gICAgc2VydmVyTm9wOiAxLFxuICAgIHNlcnZlckRpc2Nvbm5lY3Q6IDIsXG4gICAgc2VydmVyVXBkYXRlU3RhdDogMyxcbiAgICBzZXJ2ZXJWZXJzaW9uOiA0LFxuICAgIHNlcnZlclNldFZpZXc6IDUsXG4gICAgc2VydmVyU291bmQ6IDYsXG4gICAgc2VydmVyVGltZTogNyxcbiAgICBzZXJ2ZXJQcmludDogOCxcbiAgICBzZXJ2ZXJTdHVmZlRleHQ6IDksXG4gICAgc2VydmVyU2V0QW5nbGU6IDEwLFxuICAgIHNlcnZlckluZm86IDExLFxuICAgIHNlcnZlckxpZ2h0U3R5bGU6IDEyLFxuICAgIHNlcnZlclVwZGF0ZU5hbWU6IDEzLFxuICAgIHNlcnZlclVwZGF0ZUZyYWdzOiAxNCxcbiAgICBzZXJ2ZXJDbGllbnREYXRhOiAxNSxcbiAgICBzZXJ2ZXJTdG9wU291bmQ6IDE2LFxuICAgIHNlcnZlclVwZGF0ZUNvbG9yczogMTcsXG4gICAgc2VydmVyUGFydGljbGU6IDE4LFxuICAgIHNlcnZlckRhbWFnZTogMTksXG4gICAgc2VydmVyU3Bhd25TdGF0aWM6IDIwLFxuICAgIHNlcnZlclNwYXduQmFzZWxpbmU6IDIyLFxuICAgIHNlcnZlclRlbXBFbnRpdHk6IDIzLFxuICAgIHNlcnZlclNldFBhdXNlOiAyNCxcbiAgICBzZXJ2ZXJTaWdub25OdW06IDI1LFxuICAgIHNlcnZlckNlbnRlclByaW50OiAyNixcbiAgICBzZXJ2ZXJLaWxsZWRNb25zdGVyOiAyNyxcbiAgICBzZXJ2ZXJGb3VuZFNlY3JldDogMjgsXG4gICAgc2VydmVyU3Bhd25TdGF0aWNTb3VuZDogMjksXG4gICAgc2VydmVyQ2RUcmFjazogMzIsXG4gICAgXG4gICAgY2xpZW50Vmlld0hlaWdodDogMSxcbiAgICBjbGllbnRJZGVhbFBpdGNoOiAyLFxuICAgIGNsaWVudFB1bmNoMTogNCxcbiAgICBjbGllbnRQdW5jaDI6IDgsXG4gICAgY2xpZW50UHVuY2gzOiAxNixcbiAgICBjbGllbnRWZWxvY2l0eTE6IDMyLFxuICAgIGNsaWVudFZlbG9jaXR5MjogNjQsXG4gICAgY2xpZW50VmVsb2NpdHkzOiAxMjgsXG4gICAgY2xpZW50QWltZW50OiAyNTYsXG4gICAgY2xpZW50SXRlbXM6IDUxMixcbiAgICBjbGllbnRPbkdyb3VuZDogMTAyNCxcbiAgICBjbGllbnRJbldhdGVyOiAyMDQ4LFxuICAgIGNsaWVudFdlYXBvbkZyYW1lOiA0MDk2LFxuICAgIGNsaWVudEFybW9yOiA4MTkyLFxuICAgIGNsaWVudFdlYXBvbjogMTYzODQsXG5cbiAgICBmYXN0VXBkYXRlTW9yZUJpdHM6IDEsXG4gICAgZmFzdFVwZGF0ZU9yaWdpbjE6IDIsXG4gICAgZmFzdFVwZGF0ZU9yaWdpbjI6IDQsXG4gICAgZmFzdFVwZGF0ZU9yaWdpbjM6IDgsXG4gICAgZmFzdFVwZGF0ZUFuZ2xlMjogMTYsXG4gICAgZmFzdFVwZGF0ZU5vTGVycDogMzIsXG4gICAgZmFzdFVwZGF0ZUZyYW1lOiA2NCxcbiAgICBmYXN0VXBkYXRlU2lnbmFsOiAxMjgsXG4gICAgZmFzdFVwZGF0ZUFuZ2xlMTogMjU2LFxuICAgIGZhc3RVcGRhdGVBbmdsZTM6IDUxMixcbiAgICBmYXN0VXBkYXRlTW9kZWw6IDEwMjQsXG4gICAgZmFzdFVwZGF0ZUNvbG9yTWFwOiAyMDQ4LFxuICAgIGZhc3RVcGRhdGVTa2luOiA0MDk2LFxuICAgIGZhc3RVcGRhdGVFZmZlY3RzOiA4MTkyLFxuICAgIGZhc3RVcGRhdGVMb25nRW50aXR5OiAxNjM4NCxcblxuICAgIHNvdW5kVm9sdW1lOiAxLFxuICAgIHNvdW5kQXR0ZW51YXRpb246IDIsXG4gICAgc291bmRMb29waW5nOiA0LFxuXG4gICAgdGVtcFNwaWtlOiAwLFxuICAgIHRlbXBTdXBlclNwaWtlOiAxLFxuICAgIHRlbXBHdW5TaG90OiAyLFxuICAgIHRlbXBFeHBsb3Npb246IDMsXG4gICAgdGVtcFRhckV4cGxvc2lvbjogNCxcbiAgICB0ZW1wTGlnaHRuaW5nMTogNSxcbiAgICB0ZW1wTGlnaHRuaW5nMjogNixcbiAgICB0ZW1wV2l6U3Bpa2U6IDcsXG4gICAgdGVtcEtuaWdodFNwaWtlOiA4LFxuICAgIHRlbXBMaWdodG5pbmczOiA5LFxuICAgIHRlbXBMYXZhU3BsYXNoOiAxMCxcbiAgICB0ZW1wVGVsZXBvcnQ6IDExLFxuICAgIHRlbXBFeHBsb3Npb24yOiAxMlxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gUHJvdG9jb2w7XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiMVlpWjVTXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvcHJvdG9jb2wuanNcIixcIi9cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG5cbnZhciBzZXR0aW5ncyA9IHtcbiAgICB2ZXJzaW9uOiAnMC4xJyxcbiAgICBtYXBOYW1lczoge1xuICAgICAgICBzdGFydDogJ0VudHJhbmNlJyxcbiAgICAgICAgZTFtMTogJ1NsaXBnYXRlIENvbXBsZXgnLFxuICAgICAgICBlMW0yOiAnQ2FzdGxlIG9mIHRoZSBEYW1uZWQnLFxuICAgICAgICBlMW0zOiAnVGhlIE5lY3JvcG9saXMnLFxuICAgICAgICBlMW00OiAnVGhlIEdyaXNseSBHcm90dG8nLFxuICAgICAgICBlMW01OiAnR2xvb20gS2VlcCcsXG4gICAgICAgIGUxbTY6ICdUaGUgRG9vciBUbyBDaHRob24nLFxuICAgICAgICBlMW03OiAnVGhlIEhvdXNlIG9mIENodGhvbicsXG4gICAgICAgIGUxbTg6ICdaaWdndXJhdCBWZXJ0aWdvJ1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IHNldHRpbmdzO1xufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIxWWlaNVNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9zZXR0aW5ncy5qc1wiLFwiL1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbnZhciBTcHJpdGVzID0gcmVxdWlyZSgnZ2wvc3ByaXRlcycpO1xudmFyIEZvbnQgPSByZXF1aXJlKCdnbC9mb250Jyk7XG52YXIgYXNzZXRzID0gcmVxdWlyZSgnYXNzZXRzJyk7XG52YXIgc2V0dGluZ3MgPSByZXF1aXJlKCdzZXR0aW5ncycpO1xuXG52YXIgQ29uc29sZSA9IGZ1bmN0aW9uKCkge1xuICAgdmFyIGZvbnRUZXh0dXJlID0gYXNzZXRzLmxvYWQoJ3dhZC9DT05DSEFSUycsIHsgd2lkdGg6IDEyOCwgaGVpZ2h0OiAxMjgsIGFscGhhOiB0cnVlIH0pO1xuICAgdmFyIGZvbnQgPSBuZXcgRm9udChmb250VGV4dHVyZSwgOCwgOCk7XG5cbiAgIHZhciBiYWNrZ3JvdW5kVGV4dHVyZSA9IGFzc2V0cy5sb2FkKCdwYWsvZ2Z4L2NvbmJhY2subG1wJyk7XG4gICBiYWNrZ3JvdW5kVGV4dHVyZS5kcmF3VG8oZnVuY3Rpb24ocCkge1xuICAgICAgZ2wuZW5hYmxlKGdsLkJMRU5EKTtcbiAgICAgIHZhciB2ZXJzaW9uID0gJ1dlYkdMICcgKyBzZXR0aW5ncy52ZXJzaW9uO1xuICAgICAgZm9udC5kcmF3U3RyaW5nKGdsLndpZHRoICogMC43LCBnbC5oZWlnaHQgKiAwLjkzLCB2ZXJzaW9uLCAxKTtcbiAgICAgIGZvbnQucmVuZGVyKGFzc2V0cy5zaGFkZXJzLnRleHR1cmUyZCwgcCk7XG4gICB9KTtcbiAgIHZhciBiYWNrZ3JvdW5kID0gbmV3IFNwcml0ZXMoMzIwLCAyMDApO1xuICAgYmFja2dyb3VuZC50ZXh0dXJlcy5hZGRTdWJUZXh0dXJlKGJhY2tncm91bmRUZXh0dXJlKTtcbiAgIGJhY2tncm91bmQudGV4dHVyZXMuY29tcGlsZShhc3NldHMuc2hhZGVycy50ZXh0dXJlMmQpO1xuXG4gICB0aGlzLmZvbnQgPSBmb250O1xuICAgdGhpcy5iYWNrZ3JvdW5kID0gYmFja2dyb3VuZDtcbn07XG5cbkNvbnNvbGUucHJvdG90eXBlLnByaW50ID0gZnVuY3Rpb24obXNnKSB7XG4gICB0aGlzLmZvbnQuZHJhd1N0cmluZyg0MCwgNDAsIG1zZyk7XG59O1xuXG5Db25zb2xlLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24ocCkge1xuXG4gICB0aGlzLmJhY2tncm91bmQuY2xlYXIoKTtcbiAgIHRoaXMuYmFja2dyb3VuZC5kcmF3U3ByaXRlKDAsIDAsIC00MDAsIGdsLndpZHRoLCBnbC5oZWlnaHQsIDEsIDEsIDEsIDEuMCk7XG4gICB0aGlzLmJhY2tncm91bmQucmVuZGVyKGFzc2V0cy5zaGFkZXJzLmNvbG9yMmQsIHApO1xuXG4gICBnbC5lbmFibGUoZ2wuQkxFTkQpO1xuICAgdGhpcy5mb250LnJlbmRlcihhc3NldHMuc2hhZGVycy50ZXh0dXJlMmQsIHApO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gQ29uc29sZTtcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiMVlpWjVTXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvdWkvY29uc29sZS5qc1wiLFwiL3VpXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIFNwcml0ZXMgPSByZXF1aXJlKCdnbC9zcHJpdGVzJyk7XG52YXIgYXNzZXRzID0gcmVxdWlyZSgnYXNzZXRzJyk7XG5cbnZhciBTdGF0dXNCYXIgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNwcml0ZXMgPSBuZXcgU3ByaXRlcyg1MTIsIDUxMiwgNjQpO1xuXG4gICAgdGhpcy5iYWNrZ3JvdW5kID0gdGhpcy5sb2FkUGljKCdTQkFSJyk7XG4gICAgdGhpcy5udW1iZXJzID0gW107XG4gICAgdGhpcy5yZWROdW1iZXJzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxMDsgaSsrKSB7XG4gICAgICAgIHRoaXMubnVtYmVycy5wdXNoKHRoaXMubG9hZFBpYygnTlVNXycgKyBpKSk7XG4gICAgICAgIHRoaXMucmVkTnVtYmVycy5wdXNoKHRoaXMubG9hZFBpYygnQU5VTV8nICsgaSkpO1xuICAgIH1cblxuICAgIHRoaXMud2VhcG9ucyA9IG5ldyBBcnJheSg3KTtcbiAgICB0aGlzLndlYXBvbnNbMF0gPSB0aGlzLmxvYWRXZWFwb24oJ1NIT1RHVU4nKTtcbiAgICB0aGlzLndlYXBvbnNbMV0gPSB0aGlzLmxvYWRXZWFwb24oJ1NTSE9UR1VOJyk7XG4gICAgdGhpcy53ZWFwb25zWzJdID0gdGhpcy5sb2FkV2VhcG9uKCdOQUlMR1VOJyk7XG4gICAgdGhpcy53ZWFwb25zWzNdID0gdGhpcy5sb2FkV2VhcG9uKCdTTkFJTEdVTicpO1xuICAgIHRoaXMud2VhcG9uc1s0XSA9IHRoaXMubG9hZFdlYXBvbignUkxBVU5DSCcpO1xuICAgIHRoaXMud2VhcG9uc1s1XSA9IHRoaXMubG9hZFdlYXBvbignU1JMQVVOQ0gnKTtcbiAgICB0aGlzLndlYXBvbnNbNl0gPSB0aGlzLmxvYWRXZWFwb24oJ0xJR0hUTkcnKTtcblxuICAgIHRoaXMuZmFjZXMgPSBuZXcgQXJyYXkoNSk7XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPD0gNTsgaSsrKVxuICAgICAgICB0aGlzLmZhY2VzW2kgLSAxXSA9IHsgbm9ybWFsOiB0aGlzLmxvYWRQaWMoJ0ZBQ0UnICsgaSksIHBhaW46IHRoaXMubG9hZFBpYygnRkFDRV9QJyArIGkpIH07XG5cbiAgICB0aGlzLnNwcml0ZXMudGV4dHVyZXMuY29tcGlsZShhc3NldHMuc2hhZGVycy50ZXh0dXJlMmQpO1xufTtcblxuU3RhdHVzQmFyLnByb3RvdHlwZS5sb2FkUGljID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciB0ZXh0dXJlID0gYXNzZXRzLmxvYWQoJ3dhZC8nICsgbmFtZSk7XG4gICAgcmV0dXJuIHRoaXMuc3ByaXRlcy50ZXh0dXJlcy5hZGRTdWJUZXh0dXJlKHRleHR1cmUpO1xufTtcblxuU3RhdHVzQmFyLnByb3RvdHlwZS5kcmF3UGljID0gZnVuY3Rpb24oaW5kZXgsIHgsIHkpIHtcbiAgICB0aGlzLnNwcml0ZXMuZHJhd1Nwcml0ZShpbmRleCwgeCwgeSwgMCwgMCwgMSwgMSwgMSwgMSk7XG59O1xuXG5TdGF0dXNCYXIucHJvdG90eXBlLmxvYWRXZWFwb24gPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHZhciB3ZWFwb24gPSB7fTtcbiAgICB3ZWFwb24ub3duZWQgPSB0aGlzLmxvYWRQaWMoJ0lOVl8nICsgbmFtZSk7XG4gICAgd2VhcG9uLmFjdGl2ZSA9IHRoaXMubG9hZFBpYygnSU5WMl8nICsgbmFtZSk7XG4gICAgd2VhcG9uLmZsYXNoZXMgPSBuZXcgQXJyYXkoNSk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA1OyBpKyspXG4gICAgICAgIHdlYXBvbi5mbGFzaGVzW2ldID0gdGhpcy5sb2FkUGljKCdJTlZBJyArIChpICsgMSkgKyAnXycgKyBuYW1lKTtcbiAgICByZXR1cm4gd2VhcG9uO1xufTtcblxuU3RhdHVzQmFyLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24ocCkge1xuICAgIHRoaXMuc3ByaXRlcy5jbGVhcigpO1xuXG4gICAgdmFyIGxlZnQgPSBnbC53aWR0aCAvIDIgLSAxNjA7XG4gICAgdGhpcy5kcmF3UGljKHRoaXMuYmFja2dyb3VuZCwgbGVmdCwgZ2wuaGVpZ2h0IC0gMjgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNzsgaSsrKVxuICAgICAgICB0aGlzLmRyYXdQaWModGhpcy53ZWFwb25zW2ldLm93bmVkLCBsZWZ0ICsgaSAqIDI0LCBnbC5oZWlnaHQgLSA0Mik7XG5cbiAgICB0aGlzLnNwcml0ZXMucmVuZGVyKGFzc2V0cy5zaGFkZXJzLmNvbG9yMmQsIHApO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gU3RhdHVzQmFyO1xufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIxWWlaNVNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi91aS9zdGF0dXNiYXIuanNcIixcIi91aVwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbnZhciBVdGlscyA9IHt9O1xuXG5VdGlscy50cmlhbmd1bGF0ZSA9IGZ1bmN0aW9uKHBvaW50cykge1xuICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICBwb2ludHMucG9wKCk7XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBwb2ludHMubGVuZ3RoIC0gMjsgaSArPSAyKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKHBvaW50c1tpICsgMl0pO1xuICAgICAgICByZXN1bHQucHVzaChwb2ludHNbaV0pO1xuICAgICAgICByZXN1bHQucHVzaChwb2ludHNbMF0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuVXRpbHMucXVha2VJZGVudGl0eSA9IGZ1bmN0aW9uKGEpIHtcbiAgICBhWzBdID0gMDsgYVs0XSA9IDE7IGFbOF0gPSAwOyBhWzEyXSA9IDA7XG4gICAgYVsxXSA9IDA7IGFbNV0gPSAwOyBhWzldID0gLTE7IGFbMTNdID0gMDtcbiAgICBhWzJdID0gLTE7IGFbNl0gPSAwOyBhWzEwXSA9IDA7IGFbMTRdID0gMDtcbiAgICBhWzNdID0gMDsgYVs3XSA9IDA7IGFbMTFdID0gMDsgYVsxNV0gPSAxO1xuICAgIHJldHVybiBhO1xufTtcblxuVXRpbHMuZGVnMlJhZCA9IGZ1bmN0aW9uKGRlZ3JlZXMpIHtcbiAgICByZXR1cm4gZGVncmVlcyAqIE1hdGguUEkgLyAxODA7XG59O1xuXG5VdGlscy5pc1Bvd2VyT2YyID0gZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiAoeCAmICh4IC0gMSkpID09IDA7XG59O1xuXG5VdGlscy5uZXh0UG93ZXJPZjIgPSBmdW5jdGlvbih4KSB7XG4gICAgLS14O1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgMzI7IGkgPDw9IDEpIHtcbiAgICAgICAgeCA9IHggfCB4ID4+IGk7XG4gICAgfVxuICAgIHJldHVybiB4ICsgMTtcbn07XG5cblV0aWxzLmFycmF5MWQgPSBmdW5jdGlvbih3aWR0aCkge1xuICAgIHZhciByZXN1bHQgPSBuZXcgQXJyYXkod2lkdGgpO1xuICAgIGZvciAodmFyIHggPSAwOyB4IDwgd2lkdGg7IHgrKykgcmVzdWx0W3hdID0gMDtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuVXRpbHMuYXJyYXkyZCA9IGZ1bmN0aW9uKHdpZHRoLCBoZWlnaHQpIHtcbiAgICB2YXIgcmVzdWx0ID0gbmV3IEFycmF5KGhlaWdodCk7XG4gICAgZm9yICh2YXIgeSA9IDA7IHkgPCBoZWlnaHQ7IHkrKykge1xuICAgICAgICByZXN1bHRbeV0gPSBuZXcgQXJyYXkod2lkdGgpO1xuICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHdpZHRoOyB4KyspXG4gICAgICAgICAgICByZXN1bHRbeV1beF0gPSAwO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gVXRpbHM7XG5cblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIxWWlaNVNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi91dGlscy5qc1wiLFwiL1wiKSJdfQ==
