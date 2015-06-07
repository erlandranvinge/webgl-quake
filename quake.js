(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){

var webgl = require('gl/gl');
var assets = require('assets');
var utils = require('utils');
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
    requestFrame(tick);
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

    /*

    */
    /*
    if (this.client.viewEntity !== -1) {
        var pos = this.client.entities[this.client.viewEntity].nextState.origin;
        mat4.translate(m, m, [-pos[0], -pos[1], -pos[2]]);

        if (this.client.map) {
            this.client.map.draw(this.projection, m);

            var models = this.client.models;

            var mm = mat4.create();

            var statics = this.client.statics;
            for (var i = 0; i < statics.length; i++) {
                var state = statics[i].state;
                var model = models[state.modelIndex];
                var mm = mat4.translate(mm, m, state.origin);
                model.draw(this.projection, mm, 0, 0);
            }

            var entities = this.client.entities;
            for (var i = 0; i < entities.length; i++) {
                if (i === this.client.viewEntity)
                    continue;

                var state = entities[i].state;
                var model = models[state.modelIndex];
                if (model) {
                    try {
                        var mm = mat4.translate(mm, m, state.origin);
                        mat4.rotateZ(mm, mm, utils.deg2Rad(state.angles[1]));

                        model.draw(this.projection, mm, 0, state.frame);
                    } catch (e) { console.log(e); }
                }
            }

        }
    }
    */
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

Quake.prototype.start = function() {
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
        self.client.playDemo('demo1.dem');
        tick();
    });
};





}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/fake_4a808f7a.js","/")
},{"1YiZ5S":5,"assets":6,"buffer":2,"client":7,"gl/gl":17,"input":22,"ui/console":29,"ui/statusbar":30,"utils":31}],2:[function(require,module,exports){
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
},{"1YiZ5S":5,"buffer":2,"formats/bsp":9,"formats/mdl":10,"formats/pak":11,"formats/palette":12,"formats/wad":13,"gl/shader":19,"gl/texture":21,"utils":31}],7:[function(require,module,exports){
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
},{"1YiZ5S":5,"assets":6,"buffer":2,"protocol":27,"world":32}],8:[function(require,module,exports){
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
},{"1YiZ5S":5,"buffer":2,"utils":31}],15:[function(require,module,exports){
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
},{"1YiZ5S":5,"buffer":2,"lib/gl-matrix-min.js":23}],18:[function(require,module,exports){
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
},{"1YiZ5S":5,"buffer":2,"utils":31}],22:[function(require,module,exports){
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
},{"1YiZ5S":5,"buffer":2}],24:[function(require,module,exports){
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
},{"1YiZ5S":5,"buffer":2,"formats/bsp":9,"gl/lightmap":18,"utils":31}],25:[function(require,module,exports){
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
},{"1YiZ5S":5,"assets":6,"buffer":2,"gl/texture":21,"lightmaps":24,"utils":31}],26:[function(require,module,exports){
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
},{"1YiZ5S":5,"assets":6,"buffer":2,"gl/Texture":14}],27:[function(require,module,exports){
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
},{"1YiZ5S":5,"buffer":2}],28:[function(require,module,exports){
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
},{"1YiZ5S":5,"buffer":2}],29:[function(require,module,exports){
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
},{"1YiZ5S":5,"assets":6,"buffer":2,"gl/font":16,"gl/sprites":20,"settings":28}],30:[function(require,module,exports){
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
},{"1YiZ5S":5,"assets":6,"buffer":2,"gl/sprites":20}],31:[function(require,module,exports){
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
},{"1YiZ5S":5,"buffer":2}],32:[function(require,module,exports){
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
    mat4.translate(m, m, [-origin[0], -origin[1], -origin[2]]);
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
            var mm = mat4.translate(mm, m, state.origin);
            mat4.rotateZ(mm, mm, utils.deg2Rad(state.angles[1]));
            model.draw(p, mm, 0, state.frame);
        }
    }
};

module.exports = exports = World;
}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/world.js","/")
},{"1YiZ5S":5,"assets":6,"buffer":2,"map":25,"model":26,"utils":31}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9lcmxhbmRyYW52aW5nZS9naXQvd2ViZ2wtcXVha2Uvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2VybGFuZHJhbnZpbmdlL2dpdC93ZWJnbC1xdWFrZS9qcy9mYWtlXzRhODA4ZjdhLmpzIiwiL1VzZXJzL2VybGFuZHJhbnZpbmdlL2dpdC93ZWJnbC1xdWFrZS9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9idWZmZXIvaW5kZXguanMiLCIvVXNlcnMvZXJsYW5kcmFudmluZ2UvZ2l0L3dlYmdsLXF1YWtlL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2J1ZmZlci9ub2RlX21vZHVsZXMvYmFzZTY0LWpzL2xpYi9iNjQuanMiLCIvVXNlcnMvZXJsYW5kcmFudmluZ2UvZ2l0L3dlYmdsLXF1YWtlL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2J1ZmZlci9ub2RlX21vZHVsZXMvaWVlZTc1NC9pbmRleC5qcyIsIi9Vc2Vycy9lcmxhbmRyYW52aW5nZS9naXQvd2ViZ2wtcXVha2Uvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwianMvYXNzZXRzLmpzIiwianMvY2xpZW50LmpzIiwianMvZmlsZS5qcyIsImpzL2Zvcm1hdHMvYnNwLmpzIiwianMvZm9ybWF0cy9tZGwuanMiLCJqcy9mb3JtYXRzL3Bhay5qcyIsImpzL2Zvcm1hdHMvcGFsZXR0ZS5qcyIsImpzL2Zvcm1hdHMvd2FkLmpzIiwianMvZ2wvVGV4dHVyZS5qcyIsImpzL2dsL2F0bGFzLmpzIiwianMvZ2wvZm9udC5qcyIsImpzL2dsL2dsLmpzIiwianMvZ2wvbGlnaHRtYXAuanMiLCJqcy9nbC9zaGFkZXIuanMiLCJqcy9nbC9zcHJpdGVzLmpzIiwianMvZ2wvdGV4dHVyZS5qcyIsImpzL2lucHV0LmpzIiwianMvbGliL2dsLW1hdHJpeC1taW4uanMiLCJqcy9saWdodG1hcHMuanMiLCJqcy9tYXAuanMiLCJqcy9tb2RlbC5qcyIsImpzL3Byb3RvY29sLmpzIiwianMvc2V0dGluZ3MuanMiLCJqcy91aS9jb25zb2xlLmpzIiwianMvdWkvc3RhdHVzYmFyLmpzIiwianMvdXRpbHMuanMiLCJqcy93b3JsZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdmxDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcblxudmFyIHdlYmdsID0gcmVxdWlyZSgnZ2wvZ2wnKTtcbnZhciBhc3NldHMgPSByZXF1aXJlKCdhc3NldHMnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJ3V0aWxzJyk7XG52YXIgSW5wdXQgPSByZXF1aXJlKCdpbnB1dCcpO1xudmFyIENvbnNvbGUgPSByZXF1aXJlKCd1aS9jb25zb2xlJyk7XG52YXIgU3RhdHVzQmFyID0gcmVxdWlyZSgndWkvc3RhdHVzYmFyJyk7XG52YXIgQ2xpZW50ID0gcmVxdWlyZSgnY2xpZW50Jyk7XG5cbmlmICghd2luZG93LnJlcXVlc3RGcmFtZSkge1xuICAgIHdpbmRvdy5yZXF1ZXN0RnJhbWUgPSAoIGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgICAgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgICAgd2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgICAgd2luZG93Lm9SZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICAgIHdpbmRvdy5tc1JlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoIGNhbGxiYWNrLCAxMDAwIC8gNjAgKTtcbiAgICAgICAgICAgIH07XG4gICAgfSkoKTtcbn1cblxuUXVha2UgPSBmdW5jdGlvbigpIHt9O1xuXG52YXIgdGljayA9IGZ1bmN0aW9uKHRpbWUpIHtcbiAgICByZXF1ZXN0RnJhbWUodGljayk7XG4gICAgUXVha2UuaW5zdGFuY2UudGljayh0aW1lKTtcbn07XG5cblF1YWtlLnByb3RvdHlwZS50aWNrID0gZnVuY3Rpb24odGltZSkge1xuXG4gICAgdGhpcy5jbGllbnQudXBkYXRlKHRpbWUpO1xuICAgIHRoaXMuaGFuZGxlSW5wdXQoKTtcblxuICAgIGdsLmNsZWFyKGdsLkNPTE9SX0JVRkZFUl9CSVQgfCBnbC5ERVBUSF9CVUZGRVJfQklUKTtcbiAgICBnbC5lbmFibGUoZ2wuREVQVEhfVEVTVCk7XG4gICAgZ2wuZGlzYWJsZShnbC5CTEVORCk7XG5cbiAgICBpZiAodGhpcy5jbGllbnQudmlld0VudGl0eSA+IDApXG4gICAgICAgIHRoaXMuY2xpZW50LndvcmxkLmRyYXcodGhpcy5wcm9qZWN0aW9uLCB0aGlzLmNsaWVudC52aWV3RW50aXR5KTtcblxuICAgIC8qXG5cbiAgICAqL1xuICAgIC8qXG4gICAgaWYgKHRoaXMuY2xpZW50LnZpZXdFbnRpdHkgIT09IC0xKSB7XG4gICAgICAgIHZhciBwb3MgPSB0aGlzLmNsaWVudC5lbnRpdGllc1t0aGlzLmNsaWVudC52aWV3RW50aXR5XS5uZXh0U3RhdGUub3JpZ2luO1xuICAgICAgICBtYXQ0LnRyYW5zbGF0ZShtLCBtLCBbLXBvc1swXSwgLXBvc1sxXSwgLXBvc1syXV0pO1xuXG4gICAgICAgIGlmICh0aGlzLmNsaWVudC5tYXApIHtcbiAgICAgICAgICAgIHRoaXMuY2xpZW50Lm1hcC5kcmF3KHRoaXMucHJvamVjdGlvbiwgbSk7XG5cbiAgICAgICAgICAgIHZhciBtb2RlbHMgPSB0aGlzLmNsaWVudC5tb2RlbHM7XG5cbiAgICAgICAgICAgIHZhciBtbSA9IG1hdDQuY3JlYXRlKCk7XG5cbiAgICAgICAgICAgIHZhciBzdGF0aWNzID0gdGhpcy5jbGllbnQuc3RhdGljcztcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RhdGljcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBzdGF0ZSA9IHN0YXRpY3NbaV0uc3RhdGU7XG4gICAgICAgICAgICAgICAgdmFyIG1vZGVsID0gbW9kZWxzW3N0YXRlLm1vZGVsSW5kZXhdO1xuICAgICAgICAgICAgICAgIHZhciBtbSA9IG1hdDQudHJhbnNsYXRlKG1tLCBtLCBzdGF0ZS5vcmlnaW4pO1xuICAgICAgICAgICAgICAgIG1vZGVsLmRyYXcodGhpcy5wcm9qZWN0aW9uLCBtbSwgMCwgMCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBlbnRpdGllcyA9IHRoaXMuY2xpZW50LmVudGl0aWVzO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbnRpdGllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChpID09PSB0aGlzLmNsaWVudC52aWV3RW50aXR5KVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICAgICAgICAgIHZhciBzdGF0ZSA9IGVudGl0aWVzW2ldLnN0YXRlO1xuICAgICAgICAgICAgICAgIHZhciBtb2RlbCA9IG1vZGVsc1tzdGF0ZS5tb2RlbEluZGV4XTtcbiAgICAgICAgICAgICAgICBpZiAobW9kZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtbSA9IG1hdDQudHJhbnNsYXRlKG1tLCBtLCBzdGF0ZS5vcmlnaW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWF0NC5yb3RhdGVaKG1tLCBtbSwgdXRpbHMuZGVnMlJhZChzdGF0ZS5hbmdsZXNbMV0pKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWwuZHJhdyh0aGlzLnByb2plY3Rpb24sIG1tLCAwLCBzdGF0ZS5mcmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHsgY29uc29sZS5sb2coZSk7IH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuICAgIH1cbiAgICAqL1xuICAgIGdsLmRpc2FibGUoZ2wuREVQVEhfVEVTVCk7XG4gICAgZ2wuZGlzYWJsZShnbC5DVUxMX0ZBQ0UpO1xuICAgIGdsLmVuYWJsZShnbC5CTEVORCk7XG4gICAgdGhpcy5zdGF0dXNCYXIuZHJhdyh0aGlzLm9ydGhvKTtcbn07XG5cbi8vIFRlbXAuIGNvbnRyb2xsZXIuXG5RdWFrZS5wcm90b3R5cGUuaGFuZGxlSW5wdXQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5jbGllbnQudmlld0VudGl0eSA9PT0gLTEpXG4gICAgICAgIHJldHVybjtcblxuICAgIC8qXG4gICAgdmFyIGFuZ2xlID0gdXRpbHMuZGVnMlJhZCh0aGlzLmNsaWVudC52aWV3QW5nbGVzWzFdKTtcbiAgICB2YXIgcG9zaXRpb24gPSB0aGlzLmNsaWVudC5lbnRpdGllc1t0aGlzLmNsaWVudC52aWV3RW50aXR5XS5uZXh0U3RhdGUub3JpZ2luO1xuICAgIHZhciBzcGVlZCA9IDUuMDtcblxuICAgIGlmICh0aGlzLmlucHV0LmxlZnQpXG4gICAgICAgIHRoaXMuY2xpZW50LnZpZXdBbmdsZXNbMV0gLT0gMjtcbiAgICBpZiAodGhpcy5pbnB1dC5yaWdodClcbiAgICAgICAgdGhpcy5jbGllbnQudmlld0FuZ2xlc1sxXSArPSAyO1xuICAgIGlmICh0aGlzLmlucHV0LnVwKSB7XG4gICAgICAgIHRoaXMuY2xpZW50LmRlbW8gPSBudWxsO1xuICAgICAgICBwb3NpdGlvblswXSArPSBNYXRoLmNvcyhhbmdsZSkgKiBzcGVlZDtcbiAgICAgICAgcG9zaXRpb25bMV0gLT0gTWF0aC5zaW4oYW5nbGUpICogc3BlZWQ7XG4gICAgfVxuICAgIGlmICh0aGlzLmlucHV0LmRvd24pIHtcbiAgICAgICAgcG9zaXRpb25bMF0gLT0gTWF0aC5jb3MoYW5nbGUpICogc3BlZWQ7XG4gICAgICAgIHBvc2l0aW9uWzFdICs9IE1hdGguc2luKGFuZ2xlKSAqIHNwZWVkO1xuICAgIH1cbiAgICBpZiAodGhpcy5pbnB1dC5mbHlVcClcbiAgICAgICAgcG9zaXRpb25bMl0gKz0gMTA7XG4gICAgaWYgKHRoaXMuaW5wdXQuZmx5RG93bilcbiAgICAgICAgcG9zaXRpb25bMl0gLT0gMTA7XG4gICAgKi9cbn07XG5cblF1YWtlLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgIFF1YWtlLmluc3RhbmNlID0gdGhpcztcbiAgICB3ZWJnbC5pbml0KCdjYW52YXMnKTtcbiAgICB0aGlzLm9ydGhvID0gbWF0NC5vcnRobyhtYXQ0LmNyZWF0ZSgpLCAwLCBnbC53aWR0aCwgZ2wuaGVpZ2h0LCAwLCAtMTAsIDEwKTtcbiAgICB0aGlzLnByb2plY3Rpb24gPSBtYXQ0LnBlcnNwZWN0aXZlKG1hdDQuY3JlYXRlKCksIDY4LjAzLCBnbC53aWR0aCAvIGdsLmhlaWdodCwgMC4xLCA0MDk2KTtcblxuICAgIGFzc2V0cy5hZGQoJ2RhdGEvcGFrMC5wYWsnKTtcbiAgICBhc3NldHMuYWRkKCdzaGFkZXJzL2NvbG9yMmQuc2hhZGVyJyk7XG4gICAgYXNzZXRzLmFkZCgnc2hhZGVycy9tb2RlbC5zaGFkZXInKTtcbiAgICBhc3NldHMuYWRkKCdzaGFkZXJzL3RleHR1cmUyZC5zaGFkZXInKTtcbiAgICBhc3NldHMuYWRkKCdzaGFkZXJzL3dvcmxkLnNoYWRlcicpO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGFzc2V0cy5wcmVjYWNoZShmdW5jdGlvbigpIHtcbiAgICAgICAgc2VsZi5jb25zb2xlID0gbmV3IENvbnNvbGUoKTtcbiAgICAgICAgc2VsZi5zdGF0dXNCYXIgPSBuZXcgU3RhdHVzQmFyKCk7XG4gICAgICAgIHNlbGYuaW5wdXQgPSBuZXcgSW5wdXQoKTtcbiAgICAgICAgc2VsZi5jbGllbnQgPSBuZXcgQ2xpZW50KCk7XG4gICAgICAgIHNlbGYuY2xpZW50LnBsYXlEZW1vKCdkZW1vMS5kZW0nKTtcbiAgICAgICAgdGljaygpO1xuICAgIH0pO1xufTtcblxuXG5cblxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIjFZaVo1U1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2Zha2VfNGE4MDhmN2EuanNcIixcIi9cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4vKiFcbiAqIFRoZSBidWZmZXIgbW9kdWxlIGZyb20gbm9kZS5qcywgZm9yIHRoZSBicm93c2VyLlxuICpcbiAqIEBhdXRob3IgICBGZXJvc3MgQWJvdWtoYWRpamVoIDxmZXJvc3NAZmVyb3NzLm9yZz4gPGh0dHA6Ly9mZXJvc3Mub3JnPlxuICogQGxpY2Vuc2UgIE1JVFxuICovXG5cbnZhciBiYXNlNjQgPSByZXF1aXJlKCdiYXNlNjQtanMnKVxudmFyIGllZWU3NTQgPSByZXF1aXJlKCdpZWVlNzU0JylcblxuZXhwb3J0cy5CdWZmZXIgPSBCdWZmZXJcbmV4cG9ydHMuU2xvd0J1ZmZlciA9IEJ1ZmZlclxuZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFUyA9IDUwXG5CdWZmZXIucG9vbFNpemUgPSA4MTkyXG5cbi8qKlxuICogSWYgYEJ1ZmZlci5fdXNlVHlwZWRBcnJheXNgOlxuICogICA9PT0gdHJ1ZSAgICBVc2UgVWludDhBcnJheSBpbXBsZW1lbnRhdGlvbiAoZmFzdGVzdClcbiAqICAgPT09IGZhbHNlICAgVXNlIE9iamVjdCBpbXBsZW1lbnRhdGlvbiAoY29tcGF0aWJsZSBkb3duIHRvIElFNilcbiAqL1xuQnVmZmVyLl91c2VUeXBlZEFycmF5cyA9IChmdW5jdGlvbiAoKSB7XG4gIC8vIERldGVjdCBpZiBicm93c2VyIHN1cHBvcnRzIFR5cGVkIEFycmF5cy4gU3VwcG9ydGVkIGJyb3dzZXJzIGFyZSBJRSAxMCssIEZpcmVmb3ggNCssXG4gIC8vIENocm9tZSA3KywgU2FmYXJpIDUuMSssIE9wZXJhIDExLjYrLCBpT1MgNC4yKy4gSWYgdGhlIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCBhZGRpbmdcbiAgLy8gcHJvcGVydGllcyB0byBgVWludDhBcnJheWAgaW5zdGFuY2VzLCB0aGVuIHRoYXQncyB0aGUgc2FtZSBhcyBubyBgVWludDhBcnJheWAgc3VwcG9ydFxuICAvLyBiZWNhdXNlIHdlIG5lZWQgdG8gYmUgYWJsZSB0byBhZGQgYWxsIHRoZSBub2RlIEJ1ZmZlciBBUEkgbWV0aG9kcy4gVGhpcyBpcyBhbiBpc3N1ZVxuICAvLyBpbiBGaXJlZm94IDQtMjkuIE5vdyBmaXhlZDogaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9Njk1NDM4XG4gIHRyeSB7XG4gICAgdmFyIGJ1ZiA9IG5ldyBBcnJheUJ1ZmZlcigwKVxuICAgIHZhciBhcnIgPSBuZXcgVWludDhBcnJheShidWYpXG4gICAgYXJyLmZvbyA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDQyIH1cbiAgICByZXR1cm4gNDIgPT09IGFyci5mb28oKSAmJlxuICAgICAgICB0eXBlb2YgYXJyLnN1YmFycmF5ID09PSAnZnVuY3Rpb24nIC8vIENocm9tZSA5LTEwIGxhY2sgYHN1YmFycmF5YFxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn0pKClcblxuLyoqXG4gKiBDbGFzczogQnVmZmVyXG4gKiA9PT09PT09PT09PT09XG4gKlxuICogVGhlIEJ1ZmZlciBjb25zdHJ1Y3RvciByZXR1cm5zIGluc3RhbmNlcyBvZiBgVWludDhBcnJheWAgdGhhdCBhcmUgYXVnbWVudGVkXG4gKiB3aXRoIGZ1bmN0aW9uIHByb3BlcnRpZXMgZm9yIGFsbCB0aGUgbm9kZSBgQnVmZmVyYCBBUEkgZnVuY3Rpb25zLiBXZSB1c2VcbiAqIGBVaW50OEFycmF5YCBzbyB0aGF0IHNxdWFyZSBicmFja2V0IG5vdGF0aW9uIHdvcmtzIGFzIGV4cGVjdGVkIC0tIGl0IHJldHVybnNcbiAqIGEgc2luZ2xlIG9jdGV0LlxuICpcbiAqIEJ5IGF1Z21lbnRpbmcgdGhlIGluc3RhbmNlcywgd2UgY2FuIGF2b2lkIG1vZGlmeWluZyB0aGUgYFVpbnQ4QXJyYXlgXG4gKiBwcm90b3R5cGUuXG4gKi9cbmZ1bmN0aW9uIEJ1ZmZlciAoc3ViamVjdCwgZW5jb2RpbmcsIG5vWmVybykge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgQnVmZmVyKSlcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcihzdWJqZWN0LCBlbmNvZGluZywgbm9aZXJvKVxuXG4gIHZhciB0eXBlID0gdHlwZW9mIHN1YmplY3RcblxuICAvLyBXb3JrYXJvdW5kOiBub2RlJ3MgYmFzZTY0IGltcGxlbWVudGF0aW9uIGFsbG93cyBmb3Igbm9uLXBhZGRlZCBzdHJpbmdzXG4gIC8vIHdoaWxlIGJhc2U2NC1qcyBkb2VzIG5vdC5cbiAgaWYgKGVuY29kaW5nID09PSAnYmFzZTY0JyAmJiB0eXBlID09PSAnc3RyaW5nJykge1xuICAgIHN1YmplY3QgPSBzdHJpbmd0cmltKHN1YmplY3QpXG4gICAgd2hpbGUgKHN1YmplY3QubGVuZ3RoICUgNCAhPT0gMCkge1xuICAgICAgc3ViamVjdCA9IHN1YmplY3QgKyAnPSdcbiAgICB9XG4gIH1cblxuICAvLyBGaW5kIHRoZSBsZW5ndGhcbiAgdmFyIGxlbmd0aFxuICBpZiAodHlwZSA9PT0gJ251bWJlcicpXG4gICAgbGVuZ3RoID0gY29lcmNlKHN1YmplY3QpXG4gIGVsc2UgaWYgKHR5cGUgPT09ICdzdHJpbmcnKVxuICAgIGxlbmd0aCA9IEJ1ZmZlci5ieXRlTGVuZ3RoKHN1YmplY3QsIGVuY29kaW5nKVxuICBlbHNlIGlmICh0eXBlID09PSAnb2JqZWN0JylcbiAgICBsZW5ndGggPSBjb2VyY2Uoc3ViamVjdC5sZW5ndGgpIC8vIGFzc3VtZSB0aGF0IG9iamVjdCBpcyBhcnJheS1saWtlXG4gIGVsc2VcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZpcnN0IGFyZ3VtZW50IG5lZWRzIHRvIGJlIGEgbnVtYmVyLCBhcnJheSBvciBzdHJpbmcuJylcblxuICB2YXIgYnVmXG4gIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XG4gICAgLy8gUHJlZmVycmVkOiBSZXR1cm4gYW4gYXVnbWVudGVkIGBVaW50OEFycmF5YCBpbnN0YW5jZSBmb3IgYmVzdCBwZXJmb3JtYW5jZVxuICAgIGJ1ZiA9IEJ1ZmZlci5fYXVnbWVudChuZXcgVWludDhBcnJheShsZW5ndGgpKVxuICB9IGVsc2Uge1xuICAgIC8vIEZhbGxiYWNrOiBSZXR1cm4gVEhJUyBpbnN0YW5jZSBvZiBCdWZmZXIgKGNyZWF0ZWQgYnkgYG5ld2ApXG4gICAgYnVmID0gdGhpc1xuICAgIGJ1Zi5sZW5ndGggPSBsZW5ndGhcbiAgICBidWYuX2lzQnVmZmVyID0gdHJ1ZVxuICB9XG5cbiAgdmFyIGlcbiAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMgJiYgdHlwZW9mIHN1YmplY3QuYnl0ZUxlbmd0aCA9PT0gJ251bWJlcicpIHtcbiAgICAvLyBTcGVlZCBvcHRpbWl6YXRpb24gLS0gdXNlIHNldCBpZiB3ZSdyZSBjb3B5aW5nIGZyb20gYSB0eXBlZCBhcnJheVxuICAgIGJ1Zi5fc2V0KHN1YmplY3QpXG4gIH0gZWxzZSBpZiAoaXNBcnJheWlzaChzdWJqZWN0KSkge1xuICAgIC8vIFRyZWF0IGFycmF5LWlzaCBvYmplY3RzIGFzIGEgYnl0ZSBhcnJheVxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKEJ1ZmZlci5pc0J1ZmZlcihzdWJqZWN0KSlcbiAgICAgICAgYnVmW2ldID0gc3ViamVjdC5yZWFkVUludDgoaSlcbiAgICAgIGVsc2VcbiAgICAgICAgYnVmW2ldID0gc3ViamVjdFtpXVxuICAgIH1cbiAgfSBlbHNlIGlmICh0eXBlID09PSAnc3RyaW5nJykge1xuICAgIGJ1Zi53cml0ZShzdWJqZWN0LCAwLCBlbmNvZGluZylcbiAgfSBlbHNlIGlmICh0eXBlID09PSAnbnVtYmVyJyAmJiAhQnVmZmVyLl91c2VUeXBlZEFycmF5cyAmJiAhbm9aZXJvKSB7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBidWZbaV0gPSAwXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJ1ZlxufVxuXG4vLyBTVEFUSUMgTUVUSE9EU1xuLy8gPT09PT09PT09PT09PT1cblxuQnVmZmVyLmlzRW5jb2RpbmcgPSBmdW5jdGlvbiAoZW5jb2RpbmcpIHtcbiAgc3dpdGNoIChTdHJpbmcoZW5jb2RpbmcpLnRvTG93ZXJDYXNlKCkpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgIGNhc2UgJ3Jhdyc6XG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldHVybiB0cnVlXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbkJ1ZmZlci5pc0J1ZmZlciA9IGZ1bmN0aW9uIChiKSB7XG4gIHJldHVybiAhIShiICE9PSBudWxsICYmIGIgIT09IHVuZGVmaW5lZCAmJiBiLl9pc0J1ZmZlcilcbn1cblxuQnVmZmVyLmJ5dGVMZW5ndGggPSBmdW5jdGlvbiAoc3RyLCBlbmNvZGluZykge1xuICB2YXIgcmV0XG4gIHN0ciA9IHN0ciArICcnXG4gIHN3aXRjaCAoZW5jb2RpbmcgfHwgJ3V0ZjgnKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGggLyAyXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIHJldCA9IHV0ZjhUb0J5dGVzKHN0cikubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICBjYXNlICdiaW5hcnknOlxuICAgIGNhc2UgJ3Jhdyc6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXQgPSBiYXNlNjRUb0J5dGVzKHN0cikubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoICogMlxuICAgICAgYnJlYWtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nJylcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbkJ1ZmZlci5jb25jYXQgPSBmdW5jdGlvbiAobGlzdCwgdG90YWxMZW5ndGgpIHtcbiAgYXNzZXJ0KGlzQXJyYXkobGlzdCksICdVc2FnZTogQnVmZmVyLmNvbmNhdChsaXN0LCBbdG90YWxMZW5ndGhdKVxcbicgK1xuICAgICAgJ2xpc3Qgc2hvdWxkIGJlIGFuIEFycmF5LicpXG5cbiAgaWYgKGxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIG5ldyBCdWZmZXIoMClcbiAgfSBlbHNlIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgIHJldHVybiBsaXN0WzBdXG4gIH1cblxuICB2YXIgaVxuICBpZiAodHlwZW9mIHRvdGFsTGVuZ3RoICE9PSAnbnVtYmVyJykge1xuICAgIHRvdGFsTGVuZ3RoID0gMFxuICAgIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICB0b3RhbExlbmd0aCArPSBsaXN0W2ldLmxlbmd0aFxuICAgIH1cbiAgfVxuXG4gIHZhciBidWYgPSBuZXcgQnVmZmVyKHRvdGFsTGVuZ3RoKVxuICB2YXIgcG9zID0gMFxuICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpdGVtID0gbGlzdFtpXVxuICAgIGl0ZW0uY29weShidWYsIHBvcylcbiAgICBwb3MgKz0gaXRlbS5sZW5ndGhcbiAgfVxuICByZXR1cm4gYnVmXG59XG5cbi8vIEJVRkZFUiBJTlNUQU5DRSBNRVRIT0RTXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PVxuXG5mdW5jdGlvbiBfaGV4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICBvZmZzZXQgPSBOdW1iZXIob2Zmc2V0KSB8fCAwXG4gIHZhciByZW1haW5pbmcgPSBidWYubGVuZ3RoIC0gb2Zmc2V0XG4gIGlmICghbGVuZ3RoKSB7XG4gICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gIH0gZWxzZSB7XG4gICAgbGVuZ3RoID0gTnVtYmVyKGxlbmd0aClcbiAgICBpZiAobGVuZ3RoID4gcmVtYWluaW5nKSB7XG4gICAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgICB9XG4gIH1cblxuICAvLyBtdXN0IGJlIGFuIGV2ZW4gbnVtYmVyIG9mIGRpZ2l0c1xuICB2YXIgc3RyTGVuID0gc3RyaW5nLmxlbmd0aFxuICBhc3NlcnQoc3RyTGVuICUgMiA9PT0gMCwgJ0ludmFsaWQgaGV4IHN0cmluZycpXG5cbiAgaWYgKGxlbmd0aCA+IHN0ckxlbiAvIDIpIHtcbiAgICBsZW5ndGggPSBzdHJMZW4gLyAyXG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIHZhciBieXRlID0gcGFyc2VJbnQoc3RyaW5nLnN1YnN0cihpICogMiwgMiksIDE2KVxuICAgIGFzc2VydCghaXNOYU4oYnl0ZSksICdJbnZhbGlkIGhleCBzdHJpbmcnKVxuICAgIGJ1ZltvZmZzZXQgKyBpXSA9IGJ5dGVcbiAgfVxuICBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9IGkgKiAyXG4gIHJldHVybiBpXG59XG5cbmZ1bmN0aW9uIF91dGY4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIodXRmOFRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5mdW5jdGlvbiBfYXNjaWlXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcihhc2NpaVRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5mdW5jdGlvbiBfYmluYXJ5V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gX2FzY2lpV3JpdGUoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiBfYmFzZTY0V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIoYmFzZTY0VG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbmZ1bmN0aW9uIF91dGYxNmxlV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIodXRmMTZsZVRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgsIGVuY29kaW5nKSB7XG4gIC8vIFN1cHBvcnQgYm90aCAoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCwgZW5jb2RpbmcpXG4gIC8vIGFuZCB0aGUgbGVnYWN5IChzdHJpbmcsIGVuY29kaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgaWYgKGlzRmluaXRlKG9mZnNldCkpIHtcbiAgICBpZiAoIWlzRmluaXRlKGxlbmd0aCkpIHtcbiAgICAgIGVuY29kaW5nID0gbGVuZ3RoXG4gICAgICBsZW5ndGggPSB1bmRlZmluZWRcbiAgICB9XG4gIH0gZWxzZSB7ICAvLyBsZWdhY3lcbiAgICB2YXIgc3dhcCA9IGVuY29kaW5nXG4gICAgZW5jb2RpbmcgPSBvZmZzZXRcbiAgICBvZmZzZXQgPSBsZW5ndGhcbiAgICBsZW5ndGggPSBzd2FwXG4gIH1cblxuICBvZmZzZXQgPSBOdW1iZXIob2Zmc2V0KSB8fCAwXG4gIHZhciByZW1haW5pbmcgPSB0aGlzLmxlbmd0aCAtIG9mZnNldFxuICBpZiAoIWxlbmd0aCkge1xuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICB9IGVsc2Uge1xuICAgIGxlbmd0aCA9IE51bWJlcihsZW5ndGgpXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xuICAgICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gICAgfVxuICB9XG4gIGVuY29kaW5nID0gU3RyaW5nKGVuY29kaW5nIHx8ICd1dGY4JykudG9Mb3dlckNhc2UoKVxuXG4gIHZhciByZXRcbiAgc3dpdGNoIChlbmNvZGluZykge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXQgPSBfaGV4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgICAgcmV0ID0gX3V0ZjhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgICByZXQgPSBfYXNjaWlXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiaW5hcnknOlxuICAgICAgcmV0ID0gX2JpbmFyeVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXQgPSBfYmFzZTY0V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldCA9IF91dGYxNmxlV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZycpXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKGVuY29kaW5nLCBzdGFydCwgZW5kKSB7XG4gIHZhciBzZWxmID0gdGhpc1xuXG4gIGVuY29kaW5nID0gU3RyaW5nKGVuY29kaW5nIHx8ICd1dGY4JykudG9Mb3dlckNhc2UoKVxuICBzdGFydCA9IE51bWJlcihzdGFydCkgfHwgMFxuICBlbmQgPSAoZW5kICE9PSB1bmRlZmluZWQpXG4gICAgPyBOdW1iZXIoZW5kKVxuICAgIDogZW5kID0gc2VsZi5sZW5ndGhcblxuICAvLyBGYXN0cGF0aCBlbXB0eSBzdHJpbmdzXG4gIGlmIChlbmQgPT09IHN0YXJ0KVxuICAgIHJldHVybiAnJ1xuXG4gIHZhciByZXRcbiAgc3dpdGNoIChlbmNvZGluZykge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXQgPSBfaGV4U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgICAgcmV0ID0gX3V0ZjhTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgICByZXQgPSBfYXNjaWlTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiaW5hcnknOlxuICAgICAgcmV0ID0gX2JpbmFyeVNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXQgPSBfYmFzZTY0U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldCA9IF91dGYxNmxlU2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZycpXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnQnVmZmVyJyxcbiAgICBkYXRhOiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCh0aGlzLl9hcnIgfHwgdGhpcywgMClcbiAgfVxufVxuXG4vLyBjb3B5KHRhcmdldEJ1ZmZlciwgdGFyZ2V0U3RhcnQ9MCwgc291cmNlU3RhcnQ9MCwgc291cmNlRW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmNvcHkgPSBmdW5jdGlvbiAodGFyZ2V0LCB0YXJnZXRfc3RhcnQsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHNvdXJjZSA9IHRoaXNcblxuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgJiYgZW5kICE9PSAwKSBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAoIXRhcmdldF9zdGFydCkgdGFyZ2V0X3N0YXJ0ID0gMFxuXG4gIC8vIENvcHkgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuXG4gIGlmICh0YXJnZXQubGVuZ3RoID09PSAwIHx8IHNvdXJjZS5sZW5ndGggPT09IDApIHJldHVyblxuXG4gIC8vIEZhdGFsIGVycm9yIGNvbmRpdGlvbnNcbiAgYXNzZXJ0KGVuZCA+PSBzdGFydCwgJ3NvdXJjZUVuZCA8IHNvdXJjZVN0YXJ0JylcbiAgYXNzZXJ0KHRhcmdldF9zdGFydCA+PSAwICYmIHRhcmdldF9zdGFydCA8IHRhcmdldC5sZW5ndGgsXG4gICAgICAndGFyZ2V0U3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIGFzc2VydChzdGFydCA+PSAwICYmIHN0YXJ0IDwgc291cmNlLmxlbmd0aCwgJ3NvdXJjZVN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBhc3NlcnQoZW5kID49IDAgJiYgZW5kIDw9IHNvdXJjZS5sZW5ndGgsICdzb3VyY2VFbmQgb3V0IG9mIGJvdW5kcycpXG5cbiAgLy8gQXJlIHdlIG9vYj9cbiAgaWYgKGVuZCA+IHRoaXMubGVuZ3RoKVxuICAgIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICh0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0X3N0YXJ0IDwgZW5kIC0gc3RhcnQpXG4gICAgZW5kID0gdGFyZ2V0Lmxlbmd0aCAtIHRhcmdldF9zdGFydCArIHN0YXJ0XG5cbiAgdmFyIGxlbiA9IGVuZCAtIHN0YXJ0XG5cbiAgaWYgKGxlbiA8IDEwMCB8fCAhQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICB0YXJnZXRbaSArIHRhcmdldF9zdGFydF0gPSB0aGlzW2kgKyBzdGFydF1cbiAgfSBlbHNlIHtcbiAgICB0YXJnZXQuX3NldCh0aGlzLnN1YmFycmF5KHN0YXJ0LCBzdGFydCArIGxlbiksIHRhcmdldF9zdGFydClcbiAgfVxufVxuXG5mdW5jdGlvbiBfYmFzZTY0U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICBpZiAoc3RhcnQgPT09IDAgJiYgZW5kID09PSBidWYubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1ZilcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmLnNsaWNlKHN0YXJ0LCBlbmQpKVxuICB9XG59XG5cbmZ1bmN0aW9uIF91dGY4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmVzID0gJydcbiAgdmFyIHRtcCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIGlmIChidWZbaV0gPD0gMHg3Rikge1xuICAgICAgcmVzICs9IGRlY29kZVV0ZjhDaGFyKHRtcCkgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSlcbiAgICAgIHRtcCA9ICcnXG4gICAgfSBlbHNlIHtcbiAgICAgIHRtcCArPSAnJScgKyBidWZbaV0udG9TdHJpbmcoMTYpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlcyArIGRlY29kZVV0ZjhDaGFyKHRtcClcbn1cblxuZnVuY3Rpb24gX2FzY2lpU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmV0ID0gJydcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKVxuICAgIHJldCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSlcbiAgcmV0dXJuIHJldFxufVxuXG5mdW5jdGlvbiBfYmluYXJ5U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICByZXR1cm4gX2FzY2lpU2xpY2UoYnVmLCBzdGFydCwgZW5kKVxufVxuXG5mdW5jdGlvbiBfaGV4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuXG4gIGlmICghc3RhcnQgfHwgc3RhcnQgPCAwKSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgfHwgZW5kIDwgMCB8fCBlbmQgPiBsZW4pIGVuZCA9IGxlblxuXG4gIHZhciBvdXQgPSAnJ1xuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIG91dCArPSB0b0hleChidWZbaV0pXG4gIH1cbiAgcmV0dXJuIG91dFxufVxuXG5mdW5jdGlvbiBfdXRmMTZsZVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGJ5dGVzID0gYnVmLnNsaWNlKHN0YXJ0LCBlbmQpXG4gIHZhciByZXMgPSAnJ1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgcmVzICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnl0ZXNbaV0gKyBieXRlc1tpKzFdICogMjU2KVxuICB9XG4gIHJldHVybiByZXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zbGljZSA9IGZ1bmN0aW9uIChzdGFydCwgZW5kKSB7XG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBzdGFydCA9IGNsYW1wKHN0YXJ0LCBsZW4sIDApXG4gIGVuZCA9IGNsYW1wKGVuZCwgbGVuLCBsZW4pXG5cbiAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcbiAgICByZXR1cm4gQnVmZmVyLl9hdWdtZW50KHRoaXMuc3ViYXJyYXkoc3RhcnQsIGVuZCkpXG4gIH0gZWxzZSB7XG4gICAgdmFyIHNsaWNlTGVuID0gZW5kIC0gc3RhcnRcbiAgICB2YXIgbmV3QnVmID0gbmV3IEJ1ZmZlcihzbGljZUxlbiwgdW5kZWZpbmVkLCB0cnVlKVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2xpY2VMZW47IGkrKykge1xuICAgICAgbmV3QnVmW2ldID0gdGhpc1tpICsgc3RhcnRdXG4gICAgfVxuICAgIHJldHVybiBuZXdCdWZcbiAgfVxufVxuXG4vLyBgZ2V0YCB3aWxsIGJlIHJlbW92ZWQgaW4gTm9kZSAwLjEzK1xuQnVmZmVyLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAob2Zmc2V0KSB7XG4gIGNvbnNvbGUubG9nKCcuZ2V0KCkgaXMgZGVwcmVjYXRlZC4gQWNjZXNzIHVzaW5nIGFycmF5IGluZGV4ZXMgaW5zdGVhZC4nKVxuICByZXR1cm4gdGhpcy5yZWFkVUludDgob2Zmc2V0KVxufVxuXG4vLyBgc2V0YCB3aWxsIGJlIHJlbW92ZWQgaW4gTm9kZSAwLjEzK1xuQnVmZmVyLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAodiwgb2Zmc2V0KSB7XG4gIGNvbnNvbGUubG9nKCcuc2V0KCkgaXMgZGVwcmVjYXRlZC4gQWNjZXNzIHVzaW5nIGFycmF5IGluZGV4ZXMgaW5zdGVhZC4nKVxuICByZXR1cm4gdGhpcy53cml0ZVVJbnQ4KHYsIG9mZnNldClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDggPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKVxuICAgIHJldHVyblxuXG4gIHJldHVybiB0aGlzW29mZnNldF1cbn1cblxuZnVuY3Rpb24gX3JlYWRVSW50MTYgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsXG4gIGlmIChsaXR0bGVFbmRpYW4pIHtcbiAgICB2YWwgPSBidWZbb2Zmc2V0XVxuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAxXSA8PCA4XG4gIH0gZWxzZSB7XG4gICAgdmFsID0gYnVmW29mZnNldF0gPDwgOFxuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAxXVxuICB9XG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2TEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MTYodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2QkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MTYodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF9yZWFkVUludDMyIChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbFxuICBpZiAobGl0dGxlRW5kaWFuKSB7XG4gICAgaWYgKG9mZnNldCArIDIgPCBsZW4pXG4gICAgICB2YWwgPSBidWZbb2Zmc2V0ICsgMl0gPDwgMTZcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMV0gPDwgOFxuICAgIHZhbCB8PSBidWZbb2Zmc2V0XVxuICAgIGlmIChvZmZzZXQgKyAzIDwgbGVuKVxuICAgICAgdmFsID0gdmFsICsgKGJ1ZltvZmZzZXQgKyAzXSA8PCAyNCA+Pj4gMClcbiAgfSBlbHNlIHtcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcbiAgICAgIHZhbCA9IGJ1ZltvZmZzZXQgKyAxXSA8PCAxNlxuICAgIGlmIChvZmZzZXQgKyAyIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAyXSA8PCA4XG4gICAgaWYgKG9mZnNldCArIDMgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDNdXG4gICAgdmFsID0gdmFsICsgKGJ1ZltvZmZzZXRdIDw8IDI0ID4+PiAwKVxuICB9XG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyTEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MzIodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MzIodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDggPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCxcbiAgICAgICAgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKVxuICAgIHJldHVyblxuXG4gIHZhciBuZWcgPSB0aGlzW29mZnNldF0gJiAweDgwXG4gIGlmIChuZWcpXG4gICAgcmV0dXJuICgweGZmIC0gdGhpc1tvZmZzZXRdICsgMSkgKiAtMVxuICBlbHNlXG4gICAgcmV0dXJuIHRoaXNbb2Zmc2V0XVxufVxuXG5mdW5jdGlvbiBfcmVhZEludDE2IChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbCA9IF9yZWFkVUludDE2KGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIHRydWUpXG4gIHZhciBuZWcgPSB2YWwgJiAweDgwMDBcbiAgaWYgKG5lZylcbiAgICByZXR1cm4gKDB4ZmZmZiAtIHZhbCArIDEpICogLTFcbiAgZWxzZVxuICAgIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDE2KHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2QkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRJbnQxNih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWRJbnQzMiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIHZhciB2YWwgPSBfcmVhZFVJbnQzMihidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCB0cnVlKVxuICB2YXIgbmVnID0gdmFsICYgMHg4MDAwMDAwMFxuICBpZiAobmVnKVxuICAgIHJldHVybiAoMHhmZmZmZmZmZiAtIHZhbCArIDEpICogLTFcbiAgZWxzZVxuICAgIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDMyKHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRJbnQzMih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWRGbG9hdCAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICByZXR1cm4gaWVlZTc1NC5yZWFkKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdExFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRmxvYXQodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEZsb2F0KHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZERvdWJsZSAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICsgNyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICByZXR1cm4gaWVlZTc1NC5yZWFkKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDUyLCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZERvdWJsZSh0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZERvdWJsZSh0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQ4ID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAndHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnVpbnQodmFsdWUsIDB4ZmYpXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKSByZXR1cm5cblxuICB0aGlzW29mZnNldF0gPSB2YWx1ZVxufVxuXG5mdW5jdGlvbiBfd3JpdGVVSW50MTYgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmdWludCh2YWx1ZSwgMHhmZmZmKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgZm9yICh2YXIgaSA9IDAsIGogPSBNYXRoLm1pbihsZW4gLSBvZmZzZXQsIDIpOyBpIDwgajsgaSsrKSB7XG4gICAgYnVmW29mZnNldCArIGldID1cbiAgICAgICAgKHZhbHVlICYgKDB4ZmYgPDwgKDggKiAobGl0dGxlRW5kaWFuID8gaSA6IDEgLSBpKSkpKSA+Pj5cbiAgICAgICAgICAgIChsaXR0bGVFbmRpYW4gPyBpIDogMSAtIGkpICogOFxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVVSW50MzIgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmdWludCh2YWx1ZSwgMHhmZmZmZmZmZilcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGZvciAodmFyIGkgPSAwLCBqID0gTWF0aC5taW4obGVuIC0gb2Zmc2V0LCA0KTsgaSA8IGo7IGkrKykge1xuICAgIGJ1ZltvZmZzZXQgKyBpXSA9XG4gICAgICAgICh2YWx1ZSA+Pj4gKGxpdHRsZUVuZGlhbiA/IGkgOiAzIC0gaSkgKiA4KSAmIDB4ZmZcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyTEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDggPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmc2ludCh2YWx1ZSwgMHg3ZiwgLTB4ODApXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKVxuICAgIHJldHVyblxuXG4gIGlmICh2YWx1ZSA+PSAwKVxuICAgIHRoaXMud3JpdGVVSW50OCh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydClcbiAgZWxzZVxuICAgIHRoaXMud3JpdGVVSW50OCgweGZmICsgdmFsdWUgKyAxLCBvZmZzZXQsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVJbnQxNiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZzaW50KHZhbHVlLCAweDdmZmYsIC0weDgwMDApXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZiAodmFsdWUgPj0gMClcbiAgICBfd3JpdGVVSW50MTYoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxuICBlbHNlXG4gICAgX3dyaXRlVUludDE2KGJ1ZiwgMHhmZmZmICsgdmFsdWUgKyAxLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZUludDMyIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnNpbnQodmFsdWUsIDB4N2ZmZmZmZmYsIC0weDgwMDAwMDAwKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgaWYgKHZhbHVlID49IDApXG4gICAgX3dyaXRlVUludDMyKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbiAgZWxzZVxuICAgIF93cml0ZVVJbnQzMihidWYsIDB4ZmZmZmZmZmYgKyB2YWx1ZSArIDEsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyTEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlRmxvYXQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmSUVFRTc1NCh2YWx1ZSwgMy40MDI4MjM0NjYzODUyODg2ZSszOCwgLTMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCAyMywgNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0TEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdEJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlRG91YmxlIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDcgPCBidWYubGVuZ3RoLFxuICAgICAgICAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZklFRUU3NTQodmFsdWUsIDEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4LCAtMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCA1MiwgOClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbi8vIGZpbGwodmFsdWUsIHN0YXJ0PTAsIGVuZD1idWZmZXIubGVuZ3RoKVxuQnVmZmVyLnByb3RvdHlwZS5maWxsID0gZnVuY3Rpb24gKHZhbHVlLCBzdGFydCwgZW5kKSB7XG4gIGlmICghdmFsdWUpIHZhbHVlID0gMFxuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcbiAgaWYgKCFlbmQpIGVuZCA9IHRoaXMubGVuZ3RoXG5cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICB2YWx1ZSA9IHZhbHVlLmNoYXJDb2RlQXQoMClcbiAgfVxuXG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmICFpc05hTih2YWx1ZSksICd2YWx1ZSBpcyBub3QgYSBudW1iZXInKVxuICBhc3NlcnQoZW5kID49IHN0YXJ0LCAnZW5kIDwgc3RhcnQnKVxuXG4gIC8vIEZpbGwgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuXG4gIGlmICh0aGlzLmxlbmd0aCA9PT0gMCkgcmV0dXJuXG5cbiAgYXNzZXJ0KHN0YXJ0ID49IDAgJiYgc3RhcnQgPCB0aGlzLmxlbmd0aCwgJ3N0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBhc3NlcnQoZW5kID49IDAgJiYgZW5kIDw9IHRoaXMubGVuZ3RoLCAnZW5kIG91dCBvZiBib3VuZHMnKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgdGhpc1tpXSA9IHZhbHVlXG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgb3V0ID0gW11cbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICBvdXRbaV0gPSB0b0hleCh0aGlzW2ldKVxuICAgIGlmIChpID09PSBleHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTKSB7XG4gICAgICBvdXRbaSArIDFdID0gJy4uLidcbiAgICAgIGJyZWFrXG4gICAgfVxuICB9XG4gIHJldHVybiAnPEJ1ZmZlciAnICsgb3V0LmpvaW4oJyAnKSArICc+J1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgYEFycmF5QnVmZmVyYCB3aXRoIHRoZSAqY29waWVkKiBtZW1vcnkgb2YgdGhlIGJ1ZmZlciBpbnN0YW5jZS5cbiAqIEFkZGVkIGluIE5vZGUgMC4xMi4gT25seSBhdmFpbGFibGUgaW4gYnJvd3NlcnMgdGhhdCBzdXBwb3J0IEFycmF5QnVmZmVyLlxuICovXG5CdWZmZXIucHJvdG90eXBlLnRvQXJyYXlCdWZmZXIgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgICAgcmV0dXJuIChuZXcgQnVmZmVyKHRoaXMpKS5idWZmZXJcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGJ1ZiA9IG5ldyBVaW50OEFycmF5KHRoaXMubGVuZ3RoKVxuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGJ1Zi5sZW5ndGg7IGkgPCBsZW47IGkgKz0gMSlcbiAgICAgICAgYnVmW2ldID0gdGhpc1tpXVxuICAgICAgcmV0dXJuIGJ1Zi5idWZmZXJcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdCdWZmZXIudG9BcnJheUJ1ZmZlciBub3Qgc3VwcG9ydGVkIGluIHRoaXMgYnJvd3NlcicpXG4gIH1cbn1cblxuLy8gSEVMUEVSIEZVTkNUSU9OU1xuLy8gPT09PT09PT09PT09PT09PVxuXG5mdW5jdGlvbiBzdHJpbmd0cmltIChzdHIpIHtcbiAgaWYgKHN0ci50cmltKSByZXR1cm4gc3RyLnRyaW0oKVxuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKVxufVxuXG52YXIgQlAgPSBCdWZmZXIucHJvdG90eXBlXG5cbi8qKlxuICogQXVnbWVudCBhIFVpbnQ4QXJyYXkgKmluc3RhbmNlKiAobm90IHRoZSBVaW50OEFycmF5IGNsYXNzISkgd2l0aCBCdWZmZXIgbWV0aG9kc1xuICovXG5CdWZmZXIuX2F1Z21lbnQgPSBmdW5jdGlvbiAoYXJyKSB7XG4gIGFyci5faXNCdWZmZXIgPSB0cnVlXG5cbiAgLy8gc2F2ZSByZWZlcmVuY2UgdG8gb3JpZ2luYWwgVWludDhBcnJheSBnZXQvc2V0IG1ldGhvZHMgYmVmb3JlIG92ZXJ3cml0aW5nXG4gIGFyci5fZ2V0ID0gYXJyLmdldFxuICBhcnIuX3NldCA9IGFyci5zZXRcblxuICAvLyBkZXByZWNhdGVkLCB3aWxsIGJlIHJlbW92ZWQgaW4gbm9kZSAwLjEzK1xuICBhcnIuZ2V0ID0gQlAuZ2V0XG4gIGFyci5zZXQgPSBCUC5zZXRcblxuICBhcnIud3JpdGUgPSBCUC53cml0ZVxuICBhcnIudG9TdHJpbmcgPSBCUC50b1N0cmluZ1xuICBhcnIudG9Mb2NhbGVTdHJpbmcgPSBCUC50b1N0cmluZ1xuICBhcnIudG9KU09OID0gQlAudG9KU09OXG4gIGFyci5jb3B5ID0gQlAuY29weVxuICBhcnIuc2xpY2UgPSBCUC5zbGljZVxuICBhcnIucmVhZFVJbnQ4ID0gQlAucmVhZFVJbnQ4XG4gIGFyci5yZWFkVUludDE2TEUgPSBCUC5yZWFkVUludDE2TEVcbiAgYXJyLnJlYWRVSW50MTZCRSA9IEJQLnJlYWRVSW50MTZCRVxuICBhcnIucmVhZFVJbnQzMkxFID0gQlAucmVhZFVJbnQzMkxFXG4gIGFyci5yZWFkVUludDMyQkUgPSBCUC5yZWFkVUludDMyQkVcbiAgYXJyLnJlYWRJbnQ4ID0gQlAucmVhZEludDhcbiAgYXJyLnJlYWRJbnQxNkxFID0gQlAucmVhZEludDE2TEVcbiAgYXJyLnJlYWRJbnQxNkJFID0gQlAucmVhZEludDE2QkVcbiAgYXJyLnJlYWRJbnQzMkxFID0gQlAucmVhZEludDMyTEVcbiAgYXJyLnJlYWRJbnQzMkJFID0gQlAucmVhZEludDMyQkVcbiAgYXJyLnJlYWRGbG9hdExFID0gQlAucmVhZEZsb2F0TEVcbiAgYXJyLnJlYWRGbG9hdEJFID0gQlAucmVhZEZsb2F0QkVcbiAgYXJyLnJlYWREb3VibGVMRSA9IEJQLnJlYWREb3VibGVMRVxuICBhcnIucmVhZERvdWJsZUJFID0gQlAucmVhZERvdWJsZUJFXG4gIGFyci53cml0ZVVJbnQ4ID0gQlAud3JpdGVVSW50OFxuICBhcnIud3JpdGVVSW50MTZMRSA9IEJQLndyaXRlVUludDE2TEVcbiAgYXJyLndyaXRlVUludDE2QkUgPSBCUC53cml0ZVVJbnQxNkJFXG4gIGFyci53cml0ZVVJbnQzMkxFID0gQlAud3JpdGVVSW50MzJMRVxuICBhcnIud3JpdGVVSW50MzJCRSA9IEJQLndyaXRlVUludDMyQkVcbiAgYXJyLndyaXRlSW50OCA9IEJQLndyaXRlSW50OFxuICBhcnIud3JpdGVJbnQxNkxFID0gQlAud3JpdGVJbnQxNkxFXG4gIGFyci53cml0ZUludDE2QkUgPSBCUC53cml0ZUludDE2QkVcbiAgYXJyLndyaXRlSW50MzJMRSA9IEJQLndyaXRlSW50MzJMRVxuICBhcnIud3JpdGVJbnQzMkJFID0gQlAud3JpdGVJbnQzMkJFXG4gIGFyci53cml0ZUZsb2F0TEUgPSBCUC53cml0ZUZsb2F0TEVcbiAgYXJyLndyaXRlRmxvYXRCRSA9IEJQLndyaXRlRmxvYXRCRVxuICBhcnIud3JpdGVEb3VibGVMRSA9IEJQLndyaXRlRG91YmxlTEVcbiAgYXJyLndyaXRlRG91YmxlQkUgPSBCUC53cml0ZURvdWJsZUJFXG4gIGFyci5maWxsID0gQlAuZmlsbFxuICBhcnIuaW5zcGVjdCA9IEJQLmluc3BlY3RcbiAgYXJyLnRvQXJyYXlCdWZmZXIgPSBCUC50b0FycmF5QnVmZmVyXG5cbiAgcmV0dXJuIGFyclxufVxuXG4vLyBzbGljZShzdGFydCwgZW5kKVxuZnVuY3Rpb24gY2xhbXAgKGluZGV4LCBsZW4sIGRlZmF1bHRWYWx1ZSkge1xuICBpZiAodHlwZW9mIGluZGV4ICE9PSAnbnVtYmVyJykgcmV0dXJuIGRlZmF1bHRWYWx1ZVxuICBpbmRleCA9IH5+aW5kZXg7ICAvLyBDb2VyY2UgdG8gaW50ZWdlci5cbiAgaWYgKGluZGV4ID49IGxlbikgcmV0dXJuIGxlblxuICBpZiAoaW5kZXggPj0gMCkgcmV0dXJuIGluZGV4XG4gIGluZGV4ICs9IGxlblxuICBpZiAoaW5kZXggPj0gMCkgcmV0dXJuIGluZGV4XG4gIHJldHVybiAwXG59XG5cbmZ1bmN0aW9uIGNvZXJjZSAobGVuZ3RoKSB7XG4gIC8vIENvZXJjZSBsZW5ndGggdG8gYSBudW1iZXIgKHBvc3NpYmx5IE5hTiksIHJvdW5kIHVwXG4gIC8vIGluIGNhc2UgaXQncyBmcmFjdGlvbmFsIChlLmcuIDEyMy40NTYpIHRoZW4gZG8gYVxuICAvLyBkb3VibGUgbmVnYXRlIHRvIGNvZXJjZSBhIE5hTiB0byAwLiBFYXN5LCByaWdodD9cbiAgbGVuZ3RoID0gfn5NYXRoLmNlaWwoK2xlbmd0aClcbiAgcmV0dXJuIGxlbmd0aCA8IDAgPyAwIDogbGVuZ3RoXG59XG5cbmZ1bmN0aW9uIGlzQXJyYXkgKHN1YmplY3QpIHtcbiAgcmV0dXJuIChBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIChzdWJqZWN0KSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChzdWJqZWN0KSA9PT0gJ1tvYmplY3QgQXJyYXldJ1xuICB9KShzdWJqZWN0KVxufVxuXG5mdW5jdGlvbiBpc0FycmF5aXNoIChzdWJqZWN0KSB7XG4gIHJldHVybiBpc0FycmF5KHN1YmplY3QpIHx8IEJ1ZmZlci5pc0J1ZmZlcihzdWJqZWN0KSB8fFxuICAgICAgc3ViamVjdCAmJiB0eXBlb2Ygc3ViamVjdCA9PT0gJ29iamVjdCcgJiZcbiAgICAgIHR5cGVvZiBzdWJqZWN0Lmxlbmd0aCA9PT0gJ251bWJlcidcbn1cblxuZnVuY3Rpb24gdG9IZXggKG4pIHtcbiAgaWYgKG4gPCAxNikgcmV0dXJuICcwJyArIG4udG9TdHJpbmcoMTYpXG4gIHJldHVybiBuLnRvU3RyaW5nKDE2KVxufVxuXG5mdW5jdGlvbiB1dGY4VG9CeXRlcyAoc3RyKSB7XG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgIHZhciBiID0gc3RyLmNoYXJDb2RlQXQoaSlcbiAgICBpZiAoYiA8PSAweDdGKVxuICAgICAgYnl0ZUFycmF5LnB1c2goc3RyLmNoYXJDb2RlQXQoaSkpXG4gICAgZWxzZSB7XG4gICAgICB2YXIgc3RhcnQgPSBpXG4gICAgICBpZiAoYiA+PSAweEQ4MDAgJiYgYiA8PSAweERGRkYpIGkrK1xuICAgICAgdmFyIGggPSBlbmNvZGVVUklDb21wb25lbnQoc3RyLnNsaWNlKHN0YXJ0LCBpKzEpKS5zdWJzdHIoMSkuc3BsaXQoJyUnKVxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBoLmxlbmd0aDsgaisrKVxuICAgICAgICBieXRlQXJyYXkucHVzaChwYXJzZUludChoW2pdLCAxNikpXG4gICAgfVxuICB9XG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gYXNjaWlUb0J5dGVzIChzdHIpIHtcbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgLy8gTm9kZSdzIGNvZGUgc2VlbXMgdG8gYmUgZG9pbmcgdGhpcyBhbmQgbm90ICYgMHg3Ri4uXG4gICAgYnl0ZUFycmF5LnB1c2goc3RyLmNoYXJDb2RlQXQoaSkgJiAweEZGKVxuICB9XG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gdXRmMTZsZVRvQnl0ZXMgKHN0cikge1xuICB2YXIgYywgaGksIGxvXG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgIGMgPSBzdHIuY2hhckNvZGVBdChpKVxuICAgIGhpID0gYyA+PiA4XG4gICAgbG8gPSBjICUgMjU2XG4gICAgYnl0ZUFycmF5LnB1c2gobG8pXG4gICAgYnl0ZUFycmF5LnB1c2goaGkpXG4gIH1cblxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFRvQnl0ZXMgKHN0cikge1xuICByZXR1cm4gYmFzZTY0LnRvQnl0ZUFycmF5KHN0cilcbn1cblxuZnVuY3Rpb24gYmxpdEJ1ZmZlciAoc3JjLCBkc3QsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBwb3NcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIGlmICgoaSArIG9mZnNldCA+PSBkc3QubGVuZ3RoKSB8fCAoaSA+PSBzcmMubGVuZ3RoKSlcbiAgICAgIGJyZWFrXG4gICAgZHN0W2kgKyBvZmZzZXRdID0gc3JjW2ldXG4gIH1cbiAgcmV0dXJuIGlcbn1cblxuZnVuY3Rpb24gZGVjb2RlVXRmOENoYXIgKHN0cikge1xuICB0cnkge1xuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoc3RyKVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZSgweEZGRkQpIC8vIFVURiA4IGludmFsaWQgY2hhclxuICB9XG59XG5cbi8qXG4gKiBXZSBoYXZlIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSB2YWx1ZSBpcyBhIHZhbGlkIGludGVnZXIuIFRoaXMgbWVhbnMgdGhhdCBpdFxuICogaXMgbm9uLW5lZ2F0aXZlLiBJdCBoYXMgbm8gZnJhY3Rpb25hbCBjb21wb25lbnQgYW5kIHRoYXQgaXQgZG9lcyBub3RcbiAqIGV4Y2VlZCB0aGUgbWF4aW11bSBhbGxvd2VkIHZhbHVlLlxuICovXG5mdW5jdGlvbiB2ZXJpZnVpbnQgKHZhbHVlLCBtYXgpIHtcbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJylcbiAgYXNzZXJ0KHZhbHVlID49IDAsICdzcGVjaWZpZWQgYSBuZWdhdGl2ZSB2YWx1ZSBmb3Igd3JpdGluZyBhbiB1bnNpZ25lZCB2YWx1ZScpXG4gIGFzc2VydCh2YWx1ZSA8PSBtYXgsICd2YWx1ZSBpcyBsYXJnZXIgdGhhbiBtYXhpbXVtIHZhbHVlIGZvciB0eXBlJylcbiAgYXNzZXJ0KE1hdGguZmxvb3IodmFsdWUpID09PSB2YWx1ZSwgJ3ZhbHVlIGhhcyBhIGZyYWN0aW9uYWwgY29tcG9uZW50Jylcbn1cblxuZnVuY3Rpb24gdmVyaWZzaW50ICh2YWx1ZSwgbWF4LCBtaW4pIHtcbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJylcbiAgYXNzZXJ0KHZhbHVlIDw9IG1heCwgJ3ZhbHVlIGxhcmdlciB0aGFuIG1heGltdW0gYWxsb3dlZCB2YWx1ZScpXG4gIGFzc2VydCh2YWx1ZSA+PSBtaW4sICd2YWx1ZSBzbWFsbGVyIHRoYW4gbWluaW11bSBhbGxvd2VkIHZhbHVlJylcbiAgYXNzZXJ0KE1hdGguZmxvb3IodmFsdWUpID09PSB2YWx1ZSwgJ3ZhbHVlIGhhcyBhIGZyYWN0aW9uYWwgY29tcG9uZW50Jylcbn1cblxuZnVuY3Rpb24gdmVyaWZJRUVFNzU0ICh2YWx1ZSwgbWF4LCBtaW4pIHtcbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJylcbiAgYXNzZXJ0KHZhbHVlIDw9IG1heCwgJ3ZhbHVlIGxhcmdlciB0aGFuIG1heGltdW0gYWxsb3dlZCB2YWx1ZScpXG4gIGFzc2VydCh2YWx1ZSA+PSBtaW4sICd2YWx1ZSBzbWFsbGVyIHRoYW4gbWluaW11bSBhbGxvd2VkIHZhbHVlJylcbn1cblxuZnVuY3Rpb24gYXNzZXJ0ICh0ZXN0LCBtZXNzYWdlKSB7XG4gIGlmICghdGVzdCkgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UgfHwgJ0ZhaWxlZCBhc3NlcnRpb24nKVxufVxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIjFZaVo1U1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2J1ZmZlci9pbmRleC5qc1wiLFwiLy4uL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2J1ZmZlclwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbnZhciBsb29rdXAgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLyc7XG5cbjsoZnVuY3Rpb24gKGV4cG9ydHMpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG4gIHZhciBBcnIgPSAodHlwZW9mIFVpbnQ4QXJyYXkgIT09ICd1bmRlZmluZWQnKVxuICAgID8gVWludDhBcnJheVxuICAgIDogQXJyYXlcblxuXHR2YXIgUExVUyAgID0gJysnLmNoYXJDb2RlQXQoMClcblx0dmFyIFNMQVNIICA9ICcvJy5jaGFyQ29kZUF0KDApXG5cdHZhciBOVU1CRVIgPSAnMCcuY2hhckNvZGVBdCgwKVxuXHR2YXIgTE9XRVIgID0gJ2EnLmNoYXJDb2RlQXQoMClcblx0dmFyIFVQUEVSICA9ICdBJy5jaGFyQ29kZUF0KDApXG5cdHZhciBQTFVTX1VSTF9TQUZFID0gJy0nLmNoYXJDb2RlQXQoMClcblx0dmFyIFNMQVNIX1VSTF9TQUZFID0gJ18nLmNoYXJDb2RlQXQoMClcblxuXHRmdW5jdGlvbiBkZWNvZGUgKGVsdCkge1xuXHRcdHZhciBjb2RlID0gZWx0LmNoYXJDb2RlQXQoMClcblx0XHRpZiAoY29kZSA9PT0gUExVUyB8fFxuXHRcdCAgICBjb2RlID09PSBQTFVTX1VSTF9TQUZFKVxuXHRcdFx0cmV0dXJuIDYyIC8vICcrJ1xuXHRcdGlmIChjb2RlID09PSBTTEFTSCB8fFxuXHRcdCAgICBjb2RlID09PSBTTEFTSF9VUkxfU0FGRSlcblx0XHRcdHJldHVybiA2MyAvLyAnLydcblx0XHRpZiAoY29kZSA8IE5VTUJFUilcblx0XHRcdHJldHVybiAtMSAvL25vIG1hdGNoXG5cdFx0aWYgKGNvZGUgPCBOVU1CRVIgKyAxMClcblx0XHRcdHJldHVybiBjb2RlIC0gTlVNQkVSICsgMjYgKyAyNlxuXHRcdGlmIChjb2RlIDwgVVBQRVIgKyAyNilcblx0XHRcdHJldHVybiBjb2RlIC0gVVBQRVJcblx0XHRpZiAoY29kZSA8IExPV0VSICsgMjYpXG5cdFx0XHRyZXR1cm4gY29kZSAtIExPV0VSICsgMjZcblx0fVxuXG5cdGZ1bmN0aW9uIGI2NFRvQnl0ZUFycmF5IChiNjQpIHtcblx0XHR2YXIgaSwgaiwgbCwgdG1wLCBwbGFjZUhvbGRlcnMsIGFyclxuXG5cdFx0aWYgKGI2NC5sZW5ndGggJSA0ID4gMCkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHN0cmluZy4gTGVuZ3RoIG11c3QgYmUgYSBtdWx0aXBsZSBvZiA0Jylcblx0XHR9XG5cblx0XHQvLyB0aGUgbnVtYmVyIG9mIGVxdWFsIHNpZ25zIChwbGFjZSBob2xkZXJzKVxuXHRcdC8vIGlmIHRoZXJlIGFyZSB0d28gcGxhY2Vob2xkZXJzLCB0aGFuIHRoZSB0d28gY2hhcmFjdGVycyBiZWZvcmUgaXRcblx0XHQvLyByZXByZXNlbnQgb25lIGJ5dGVcblx0XHQvLyBpZiB0aGVyZSBpcyBvbmx5IG9uZSwgdGhlbiB0aGUgdGhyZWUgY2hhcmFjdGVycyBiZWZvcmUgaXQgcmVwcmVzZW50IDIgYnl0ZXNcblx0XHQvLyB0aGlzIGlzIGp1c3QgYSBjaGVhcCBoYWNrIHRvIG5vdCBkbyBpbmRleE9mIHR3aWNlXG5cdFx0dmFyIGxlbiA9IGI2NC5sZW5ndGhcblx0XHRwbGFjZUhvbGRlcnMgPSAnPScgPT09IGI2NC5jaGFyQXQobGVuIC0gMikgPyAyIDogJz0nID09PSBiNjQuY2hhckF0KGxlbiAtIDEpID8gMSA6IDBcblxuXHRcdC8vIGJhc2U2NCBpcyA0LzMgKyB1cCB0byB0d28gY2hhcmFjdGVycyBvZiB0aGUgb3JpZ2luYWwgZGF0YVxuXHRcdGFyciA9IG5ldyBBcnIoYjY0Lmxlbmd0aCAqIDMgLyA0IC0gcGxhY2VIb2xkZXJzKVxuXG5cdFx0Ly8gaWYgdGhlcmUgYXJlIHBsYWNlaG9sZGVycywgb25seSBnZXQgdXAgdG8gdGhlIGxhc3QgY29tcGxldGUgNCBjaGFyc1xuXHRcdGwgPSBwbGFjZUhvbGRlcnMgPiAwID8gYjY0Lmxlbmd0aCAtIDQgOiBiNjQubGVuZ3RoXG5cblx0XHR2YXIgTCA9IDBcblxuXHRcdGZ1bmN0aW9uIHB1c2ggKHYpIHtcblx0XHRcdGFycltMKytdID0gdlxuXHRcdH1cblxuXHRcdGZvciAoaSA9IDAsIGogPSAwOyBpIDwgbDsgaSArPSA0LCBqICs9IDMpIHtcblx0XHRcdHRtcCA9IChkZWNvZGUoYjY0LmNoYXJBdChpKSkgPDwgMTgpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPDwgMTIpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAyKSkgPDwgNikgfCBkZWNvZGUoYjY0LmNoYXJBdChpICsgMykpXG5cdFx0XHRwdXNoKCh0bXAgJiAweEZGMDAwMCkgPj4gMTYpXG5cdFx0XHRwdXNoKCh0bXAgJiAweEZGMDApID4+IDgpXG5cdFx0XHRwdXNoKHRtcCAmIDB4RkYpXG5cdFx0fVxuXG5cdFx0aWYgKHBsYWNlSG9sZGVycyA9PT0gMikge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAyKSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMSkpID4+IDQpXG5cdFx0XHRwdXNoKHRtcCAmIDB4RkYpXG5cdFx0fSBlbHNlIGlmIChwbGFjZUhvbGRlcnMgPT09IDEpIHtcblx0XHRcdHRtcCA9IChkZWNvZGUoYjY0LmNoYXJBdChpKSkgPDwgMTApIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPDwgNCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDIpKSA+PiAyKVxuXHRcdFx0cHVzaCgodG1wID4+IDgpICYgMHhGRilcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9XG5cblx0XHRyZXR1cm4gYXJyXG5cdH1cblxuXHRmdW5jdGlvbiB1aW50OFRvQmFzZTY0ICh1aW50OCkge1xuXHRcdHZhciBpLFxuXHRcdFx0ZXh0cmFCeXRlcyA9IHVpbnQ4Lmxlbmd0aCAlIDMsIC8vIGlmIHdlIGhhdmUgMSBieXRlIGxlZnQsIHBhZCAyIGJ5dGVzXG5cdFx0XHRvdXRwdXQgPSBcIlwiLFxuXHRcdFx0dGVtcCwgbGVuZ3RoXG5cblx0XHRmdW5jdGlvbiBlbmNvZGUgKG51bSkge1xuXHRcdFx0cmV0dXJuIGxvb2t1cC5jaGFyQXQobnVtKVxuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIHRyaXBsZXRUb0Jhc2U2NCAobnVtKSB7XG5cdFx0XHRyZXR1cm4gZW5jb2RlKG51bSA+PiAxOCAmIDB4M0YpICsgZW5jb2RlKG51bSA+PiAxMiAmIDB4M0YpICsgZW5jb2RlKG51bSA+PiA2ICYgMHgzRikgKyBlbmNvZGUobnVtICYgMHgzRilcblx0XHR9XG5cblx0XHQvLyBnbyB0aHJvdWdoIHRoZSBhcnJheSBldmVyeSB0aHJlZSBieXRlcywgd2UnbGwgZGVhbCB3aXRoIHRyYWlsaW5nIHN0dWZmIGxhdGVyXG5cdFx0Zm9yIChpID0gMCwgbGVuZ3RoID0gdWludDgubGVuZ3RoIC0gZXh0cmFCeXRlczsgaSA8IGxlbmd0aDsgaSArPSAzKSB7XG5cdFx0XHR0ZW1wID0gKHVpbnQ4W2ldIDw8IDE2KSArICh1aW50OFtpICsgMV0gPDwgOCkgKyAodWludDhbaSArIDJdKVxuXHRcdFx0b3V0cHV0ICs9IHRyaXBsZXRUb0Jhc2U2NCh0ZW1wKVxuXHRcdH1cblxuXHRcdC8vIHBhZCB0aGUgZW5kIHdpdGggemVyb3MsIGJ1dCBtYWtlIHN1cmUgdG8gbm90IGZvcmdldCB0aGUgZXh0cmEgYnl0ZXNcblx0XHRzd2l0Y2ggKGV4dHJhQnl0ZXMpIHtcblx0XHRcdGNhc2UgMTpcblx0XHRcdFx0dGVtcCA9IHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDFdXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUodGVtcCA+PiAyKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKCh0ZW1wIDw8IDQpICYgMHgzRilcblx0XHRcdFx0b3V0cHV0ICs9ICc9PSdcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgMjpcblx0XHRcdFx0dGVtcCA9ICh1aW50OFt1aW50OC5sZW5ndGggLSAyXSA8PCA4KSArICh1aW50OFt1aW50OC5sZW5ndGggLSAxXSlcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSh0ZW1wID4+IDEwKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKCh0ZW1wID4+IDQpICYgMHgzRilcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSgodGVtcCA8PCAyKSAmIDB4M0YpXG5cdFx0XHRcdG91dHB1dCArPSAnPSdcblx0XHRcdFx0YnJlYWtcblx0XHR9XG5cblx0XHRyZXR1cm4gb3V0cHV0XG5cdH1cblxuXHRleHBvcnRzLnRvQnl0ZUFycmF5ID0gYjY0VG9CeXRlQXJyYXlcblx0ZXhwb3J0cy5mcm9tQnl0ZUFycmF5ID0gdWludDhUb0Jhc2U2NFxufSh0eXBlb2YgZXhwb3J0cyA9PT0gJ3VuZGVmaW5lZCcgPyAodGhpcy5iYXNlNjRqcyA9IHt9KSA6IGV4cG9ydHMpKVxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIjFZaVo1U1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2J1ZmZlci9ub2RlX21vZHVsZXMvYmFzZTY0LWpzL2xpYi9iNjQuanNcIixcIi8uLi9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9idWZmZXIvbm9kZV9tb2R1bGVzL2Jhc2U2NC1qcy9saWJcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG5leHBvcnRzLnJlYWQgPSBmdW5jdGlvbiAoYnVmZmVyLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbSxcbiAgICAgIGVMZW4gPSBuQnl0ZXMgKiA4IC0gbUxlbiAtIDEsXG4gICAgICBlTWF4ID0gKDEgPDwgZUxlbikgLSAxLFxuICAgICAgZUJpYXMgPSBlTWF4ID4+IDEsXG4gICAgICBuQml0cyA9IC03LFxuICAgICAgaSA9IGlzTEUgPyAobkJ5dGVzIC0gMSkgOiAwLFxuICAgICAgZCA9IGlzTEUgPyAtMSA6IDEsXG4gICAgICBzID0gYnVmZmVyW29mZnNldCArIGldXG5cbiAgaSArPSBkXG5cbiAgZSA9IHMgJiAoKDEgPDwgKC1uQml0cykpIC0gMSlcbiAgcyA+Pj0gKC1uQml0cylcbiAgbkJpdHMgKz0gZUxlblxuICBmb3IgKDsgbkJpdHMgPiAwOyBlID0gZSAqIDI1NiArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxuXG4gIG0gPSBlICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpXG4gIGUgPj49ICgtbkJpdHMpXG4gIG5CaXRzICs9IG1MZW5cbiAgZm9yICg7IG5CaXRzID4gMDsgbSA9IG0gKiAyNTYgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCkge31cblxuICBpZiAoZSA9PT0gMCkge1xuICAgIGUgPSAxIC0gZUJpYXNcbiAgfSBlbHNlIGlmIChlID09PSBlTWF4KSB7XG4gICAgcmV0dXJuIG0gPyBOYU4gOiAoKHMgPyAtMSA6IDEpICogSW5maW5pdHkpXG4gIH0gZWxzZSB7XG4gICAgbSA9IG0gKyBNYXRoLnBvdygyLCBtTGVuKVxuICAgIGUgPSBlIC0gZUJpYXNcbiAgfVxuICByZXR1cm4gKHMgPyAtMSA6IDEpICogbSAqIE1hdGgucG93KDIsIGUgLSBtTGVuKVxufVxuXG5leHBvcnRzLndyaXRlID0gZnVuY3Rpb24gKGJ1ZmZlciwgdmFsdWUsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtLCBjLFxuICAgICAgZUxlbiA9IG5CeXRlcyAqIDggLSBtTGVuIC0gMSxcbiAgICAgIGVNYXggPSAoMSA8PCBlTGVuKSAtIDEsXG4gICAgICBlQmlhcyA9IGVNYXggPj4gMSxcbiAgICAgIHJ0ID0gKG1MZW4gPT09IDIzID8gTWF0aC5wb3coMiwgLTI0KSAtIE1hdGgucG93KDIsIC03NykgOiAwKSxcbiAgICAgIGkgPSBpc0xFID8gMCA6IChuQnl0ZXMgLSAxKSxcbiAgICAgIGQgPSBpc0xFID8gMSA6IC0xLFxuICAgICAgcyA9IHZhbHVlIDwgMCB8fCAodmFsdWUgPT09IDAgJiYgMSAvIHZhbHVlIDwgMCkgPyAxIDogMFxuXG4gIHZhbHVlID0gTWF0aC5hYnModmFsdWUpXG5cbiAgaWYgKGlzTmFOKHZhbHVlKSB8fCB2YWx1ZSA9PT0gSW5maW5pdHkpIHtcbiAgICBtID0gaXNOYU4odmFsdWUpID8gMSA6IDBcbiAgICBlID0gZU1heFxuICB9IGVsc2Uge1xuICAgIGUgPSBNYXRoLmZsb29yKE1hdGgubG9nKHZhbHVlKSAvIE1hdGguTE4yKVxuICAgIGlmICh2YWx1ZSAqIChjID0gTWF0aC5wb3coMiwgLWUpKSA8IDEpIHtcbiAgICAgIGUtLVxuICAgICAgYyAqPSAyXG4gICAgfVxuICAgIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgdmFsdWUgKz0gcnQgLyBjXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlICs9IHJ0ICogTWF0aC5wb3coMiwgMSAtIGVCaWFzKVxuICAgIH1cbiAgICBpZiAodmFsdWUgKiBjID49IDIpIHtcbiAgICAgIGUrK1xuICAgICAgYyAvPSAyXG4gICAgfVxuXG4gICAgaWYgKGUgKyBlQmlhcyA+PSBlTWF4KSB7XG4gICAgICBtID0gMFxuICAgICAgZSA9IGVNYXhcbiAgICB9IGVsc2UgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICBtID0gKHZhbHVlICogYyAtIDEpICogTWF0aC5wb3coMiwgbUxlbilcbiAgICAgIGUgPSBlICsgZUJpYXNcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IHZhbHVlICogTWF0aC5wb3coMiwgZUJpYXMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pXG4gICAgICBlID0gMFxuICAgIH1cbiAgfVxuXG4gIGZvciAoOyBtTGVuID49IDg7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IG0gJiAweGZmLCBpICs9IGQsIG0gLz0gMjU2LCBtTGVuIC09IDgpIHt9XG5cbiAgZSA9IChlIDw8IG1MZW4pIHwgbVxuICBlTGVuICs9IG1MZW5cbiAgZm9yICg7IGVMZW4gPiAwOyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBlICYgMHhmZiwgaSArPSBkLCBlIC89IDI1NiwgZUxlbiAtPSA4KSB7fVxuXG4gIGJ1ZmZlcltvZmZzZXQgKyBpIC0gZF0gfD0gcyAqIDEyOFxufVxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIjFZaVo1U1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2J1ZmZlci9ub2RlX21vZHVsZXMvaWVlZTc1NC9pbmRleC5qc1wiLFwiLy4uL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2J1ZmZlci9ub2RlX21vZHVsZXMvaWVlZTc1NFwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnByb2Nlc3MubmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjYW5TZXRJbW1lZGlhdGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5zZXRJbW1lZGlhdGU7XG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxuICAgIDtcblxuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgdmFyIHF1ZXVlID0gW107XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc291cmNlID0gZXYuc291cmNlO1xuICAgICAgICAgICAgaWYgKChzb3VyY2UgPT09IHdpbmRvdyB8fCBzb3VyY2UgPT09IG51bGwpICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn1cblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIjFZaVo1U1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qc1wiLFwiLy4uL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3NcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgU2hhZGVyID0gcmVxdWlyZSgnZ2wvc2hhZGVyJyk7XG52YXIgVGV4dHVyZSA9IHJlcXVpcmUoJ2dsL3RleHR1cmUnKTtcbnZhciBQYWsgPSByZXF1aXJlKCdmb3JtYXRzL3BhaycpO1xudmFyIFdhZCA9IHJlcXVpcmUoJ2Zvcm1hdHMvd2FkJyk7XG52YXIgUGFsZXR0ZSA9IHJlcXVpcmUoJ2Zvcm1hdHMvcGFsZXR0ZScpO1xudmFyIEJzcCA9IHJlcXVpcmUoJ2Zvcm1hdHMvYnNwJyk7XG52YXIgTWRsID0gcmVxdWlyZSgnZm9ybWF0cy9tZGwnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJ3V0aWxzJyk7XG5cbmZ1bmN0aW9uIGdldE5hbWUocGF0aCkge1xuICAgIHZhciBpbmRleDEgPSBwYXRoLmxhc3RJbmRleE9mKCcvJyk7XG4gICAgdmFyIGluZGV4MiA9IHBhdGgubGFzdEluZGV4T2YoJy4nKTtcbiAgICByZXR1cm4gcGF0aC5zdWJzdHIoaW5kZXgxICsgMSwgaW5kZXgyIC0gaW5kZXgxIC0gMSk7XG59XG5cbmZ1bmN0aW9uIGRvd25sb2FkKGl0ZW0sIGRvbmUpIHtcbiAgICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIHJlcXVlc3Qub3BlbignR0VUJywgaXRlbS51cmwsIHRydWUpO1xuICAgIHJlcXVlc3Qub3ZlcnJpZGVNaW1lVHlwZSgndGV4dC9wbGFpbjsgY2hhcnNldD14LXVzZXItZGVmaW5lZCcpO1xuICAgIGlmIChpdGVtLmJpbmFyeSlcbiAgICAgICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSAnYXJyYXlidWZmZXInO1xuICAgIHJlcXVlc3Qub25sb2FkID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaWYgKHJlcXVlc3Quc3RhdHVzICE9PSAyMDApXG4gICAgICAgICAgICB0aHJvdyAnVW5hYmxlIHRvIHJlYWQgZmlsZSBmcm9tIHVybDogJyArIGl0ZW0ubmFtZTtcblxuICAgICAgICB2YXIgZGF0YSA9IGl0ZW0uYmluYXJ5ID9cbiAgICAgICAgICAgIG5ldyBVaW50OEFycmF5KHJlcXVlc3QucmVzcG9uc2UpIDogcmVxdWVzdC5yZXNwb25zZVRleHQ7XG4gICAgICAgIGRvbmUoaXRlbSwgZGF0YSk7XG4gICAgfTtcblxuICAgIHJlcXVlc3Qub25lcnJvciA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIHRocm93ICdVbmFibGUgdG8gcmVhZCBmaWxlIGZyb20gdXJsOiAnICsgcmVxdWVzdC5zdGF0dXNUZXh0O1xuICAgIH07XG4gICAgcmVxdWVzdC5zZW5kKG51bGwpO1xufVxuXG52YXIgQXNzZXRzID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wZW5kaW5nID0gW107XG4gICAgdGhpcy5zaGFkZXJzID0ge307XG59O1xuXG5Bc3NldHMucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKHVybCwgdHlwZSkge1xuICAgIHR5cGUgPSB0eXBlIHx8IHV0aWxzLmdldEV4dGVuc2lvbih1cmwpO1xuICAgIGlmICghdHlwZSlcbiAgICAgICAgdGhyb3cgJ0Vycm9yOiBVbmFibGUgdG8gZGV0ZXJtaW5lIHR5cGUgZm9yIGFzc2V0OiAnICsgbmFtZTtcbiAgICB2YXIgYmluYXJ5ID0gdHlwZSAhPT0gJ3NoYWRlcic7XG4gICAgdGhpcy5wZW5kaW5nLnB1c2goeyB1cmw6IHVybCwgbmFtZTogZ2V0TmFtZSh1cmwpLCB0eXBlOiB0eXBlLCBiaW5hcnk6IGJpbmFyeSB9KTtcbn07XG5cbkFzc2V0cy5wcm90b3R5cGUuaW5zZXJ0ID0gZnVuY3Rpb24oaXRlbSwgZGF0YSkge1xuICAgIHN3aXRjaCAoaXRlbS50eXBlKSB7XG4gICAgICAgIGNhc2UgJ3Bhayc6XG4gICAgICAgICAgICB0aGlzLnBhayA9IG5ldyBQYWsoZGF0YSk7XG4gICAgICAgICAgICB0aGlzLndhZCA9IG5ldyBXYWQodGhpcy5wYWsubG9hZCgnZ2Z4LndhZCcpKTtcbiAgICAgICAgICAgIHRoaXMucGFsZXR0ZSA9IG5ldyBQYWxldHRlKHRoaXMucGFrLmxvYWQoJ2dmeC9wYWxldHRlLmxtcCcpKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdzaGFkZXInOlxuICAgICAgICAgICAgdGhpcy5zaGFkZXJzW2l0ZW0ubmFtZV0gPSBuZXcgU2hhZGVyKGRhdGEpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6IHRocm93ICdFcnJvcjogVW5rbm93biB0eXBlIGxvYWRlZDogJyArIGl0ZW0udHlwZTtcbiAgICB9XG59O1xuXG5Bc3NldHMucHJvdG90eXBlLmxvYWQgPSBmdW5jdGlvbihuYW1lLCBvcHRpb25zKSB7XG5cbiAgICB2YXIgaW5kZXggPSBuYW1lLmluZGV4T2YoJy8nKTtcbiAgICB2YXIgbG9jYXRpb24gPSBuYW1lLnN1YnN0cigwLCBpbmRleCk7XG4gICAgdmFyIHR5cGUgPSB1dGlscy5nZXRFeHRlbnNpb24obmFtZSkgfHwgJ3RleHR1cmUnO1xuICAgIHZhciBuYW1lID0gbmFtZS5zdWJzdHIoaW5kZXggKyAxKTtcbiAgICB2YXIgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgY2FzZSAnYnNwJzpcbiAgICAgICAgICAgIHJldHVybiBuZXcgQnNwKHRoaXMucGFrLmxvYWQobmFtZSkpO1xuICAgICAgICBjYXNlICdtZGwnOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBNZGwobmFtZSwgdGhpcy5wYWsubG9hZChuYW1lKSk7XG4gICAgfVxuXG4gICAgb3B0aW9ucy5wYWxldHRlID0gdGhpcy5wYWxldHRlO1xuICAgIHN3aXRjaChsb2NhdGlvbikge1xuICAgICAgICBjYXNlICdwYWsnOlxuICAgICAgICAgICAgdmFyIGRhdGEgPSB0aGlzLnBhay5sb2FkKG5hbWUpO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBUZXh0dXJlKGRhdGEsIG9wdGlvbnMpO1xuICAgICAgICBjYXNlICd3YWQnOlxuICAgICAgICAgICAgdmFyIGRhdGEgPSB0aGlzLndhZC5nZXQobmFtZSk7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFRleHR1cmUoZGF0YSwgb3B0aW9ucyk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyAnRXJyb3I6IENhbm5vdCBsb2FkIGZpbGVzIG91dHNpZGUgUEFLL1dBRDogJyArIG5hbWU7XG4gICAgfVxufTtcblxuQXNzZXRzLnByb3RvdHlwZS5wcmVjYWNoZSA9IGZ1bmN0aW9uKGRvbmUpIHtcbiAgICB2YXIgdG90YWwgPSB0aGlzLnBlbmRpbmcubGVuZ3RoO1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBmb3IgKHZhciBpIGluIHRoaXMucGVuZGluZykge1xuICAgICAgICB2YXIgcGVuZGluZyA9IHRoaXMucGVuZGluZ1tpXTtcbiAgICAgICAgZG93bmxvYWQocGVuZGluZywgZnVuY3Rpb24oaXRlbSwgZGF0YSkge1xuICAgICAgICAgICAgc2VsZi5pbnNlcnQoaXRlbSwgZGF0YSk7XG4gICAgICAgICAgICBpZiAoLS10b3RhbCA8PSAwKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5wZW5kaW5nID0gW107XG4gICAgICAgICAgICAgICAgZG9uZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59O1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gbmV3IEFzc2V0cygpO1xufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIxWWlaNVNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9hc3NldHMuanNcIixcIi9cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgYXNzZXRzID0gcmVxdWlyZSgnYXNzZXRzJyk7XG52YXIgUHJvdG9jb2wgPSByZXF1aXJlKCdwcm90b2NvbCcpO1xudmFyIFdvcmxkID0gcmVxdWlyZSgnd29ybGQnKTtcblxudmFyIENsaWVudCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMudmlld0VudGl0eSA9IC0xO1xuICAgIHRoaXMudGltZSA9IHsgb2xkU2VydmVyVGltZTogMCwgc2VydmVyVGltZTogMCwgb2xkQ2xpZW50VGltZTogMCwgY2xpZW50VGltZTogMCB9O1xuICAgIHRoaXMud29ybGQgPSBuZXcgV29ybGQoKTtcbn07XG5cbkNsaWVudC5wcm90b3R5cGUucGxheURlbW8gPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIGRlbW8gPSBhc3NldHMucGFrLmxvYWQobmFtZSk7XG4gICAgd2hpbGUgKGRlbW8ucmVhZFVJbnQ4KCkgIT09IDEwKTtcbiAgICB0aGlzLmRlbW8gPSBkZW1vO1xufTtcblxuQ2xpZW50LnByb3RvdHlwZS5yZWFkRnJvbVNlcnZlciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBkZW1vID0gdGhpcy5kZW1vO1xuICAgIGlmICghZGVtbyB8fCBkZW1vLmVvZigpKSByZXR1cm47XG5cbiAgICB2YXIgbWVzc2FnZVNpemUgPSBkZW1vLnJlYWRJbnQzMigpO1xuXG4gICAgdmFyIGFuZ2xlcyA9IFtkZW1vLnJlYWRGbG9hdCgpLCBkZW1vLnJlYWRGbG9hdCgpLCBkZW1vLnJlYWRGbG9hdCgpXTtcbiAgICBpZiAodGhpcy52aWV3RW50aXR5ICE9PSAtMSkge1xuICAgICAgICAvL3ZhciBlbnRpdHkgPSB0aGlzLmVudGl0aWVzW3RoaXMudmlld0VudGl0eV07XG4gICAgICAgIC8vdmVjMy5zZXQoZW50aXR5LnN0YXRlLmFuZ2xlcywgYW5nbGVzWzBdLCBhbmdsZXNbMV0sIGFuZ2xlc1sxXSk7XG4gICAgfVxuXG4gICAgdmFyIG1zZyA9IGRlbW8ucmVhZChtZXNzYWdlU2l6ZSk7XG4gICAgdmFyIGNtZCA9IDA7XG4gICAgd2hpbGUgKGNtZCAhPT0gLTEgJiYgIW1zZy5lb2YoKSkge1xuICAgICAgICBjbWQgPSBtc2cucmVhZFVJbnQ4KCk7XG4gICAgICAgIGlmIChjbWQgJiAxMjgpIHtcbiAgICAgICAgICAgIHRoaXMucGFyc2VGYXN0VXBkYXRlKGNtZCAmIDEyNywgbXNnKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgc3dpdGNoIChjbWQpIHtcbiAgICAgICAgICAgIGNhc2UgUHJvdG9jb2wuc2VydmVyRGlzY29ubmVjdDpcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnRElTQ09OTkVDVCEnKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRlbW8gPSBudWxsO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIGNhc2UgUHJvdG9jb2wuc2VydmVyVXBkYXRlU3RhdDpcbiAgICAgICAgICAgICAgICB2YXIgc3RhdCA9IG1zZy5yZWFkVUludDgoKTtcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBtc2cucmVhZEludDMyKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFByb3RvY29sLnNlcnZlclNldFZpZXc6XG4gICAgICAgICAgICAgICAgdGhpcy52aWV3RW50aXR5ID0gbXNnLnJlYWRJbnQxNigpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQcm90b2NvbC5zZXJ2ZXJUaW1lOlxuICAgICAgICAgICAgICAgIHRoaXMudGltZS5vbGRTZXJ2ZXJUaW1lID0gdGhpcy50aW1lLnNlcnZlclRpbWU7XG4gICAgICAgICAgICAgICAgdGhpcy50aW1lLnNlcnZlclRpbWUgPSBtc2cucmVhZEZsb2F0KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFByb3RvY29sLnNlcnZlclNldEFuZ2xlOlxuICAgICAgICAgICAgICAgIHZhciB4ID0gbXNnLnJlYWRJbnQ4KCkgKiAxLjQwNjI1O1xuICAgICAgICAgICAgICAgIHZhciB5ID0gbXNnLnJlYWRJbnQ4KCkgKiAxLjQwNjI1O1xuICAgICAgICAgICAgICAgIHZhciB6ID0gbXNnLnJlYWRJbnQ4KCkgKiAxLjQwNjI1O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQcm90b2NvbC5zZXJ2ZXJTb3VuZDpcbiAgICAgICAgICAgICAgICB0aGlzLnBhcnNlU291bmQobXNnKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgUHJvdG9jb2wuc2VydmVyUHJpbnQ6XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cobXNnLnJlYWRDU3RyaW5nKCkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQcm90b2NvbC5zZXJ2ZXJMaWdodFN0eWxlOlxuICAgICAgICAgICAgICAgIHZhciBzdHlsZSA9IG1zZy5yZWFkVUludDgoKTtcbiAgICAgICAgICAgICAgICB2YXIgcGF0dGVybiA9IG1zZy5yZWFkQ1N0cmluZygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQcm90b2NvbC5zZXJ2ZXJDbGllbnREYXRhOlxuICAgICAgICAgICAgICAgIHRoaXMucGFyc2VDbGllbnREYXRhKG1zZyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFByb3RvY29sLnNlcnZlclVwZGF0ZU5hbWU6XG4gICAgICAgICAgICAgICAgdmFyIGNsaWVudCA9IG1zZy5yZWFkVUludDgoKTtcbiAgICAgICAgICAgICAgICB2YXIgbmFtZSA9IG1zZy5yZWFkQ1N0cmluZygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQcm90b2NvbC5zZXJ2ZXJVcGRhdGVGcmFnczpcbiAgICAgICAgICAgICAgICB2YXIgY2xpZW50ID0gbXNnLnJlYWRVSW50OCgpO1xuICAgICAgICAgICAgICAgIHZhciBmcmFncyA9IG1zZy5yZWFkSW50MTYoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgUHJvdG9jb2wuc2VydmVyVXBkYXRlQ29sb3JzOlxuICAgICAgICAgICAgICAgIHZhciBjbGllbnQgPSBtc2cucmVhZFVJbnQ4KCk7XG4gICAgICAgICAgICAgICAgdmFyIGNvbG9ycyA9IG1zZy5yZWFkVUludDgoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgUHJvdG9jb2wuc2VydmVyUGFydGljbGU6XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJzZVBhcnRpY2xlKG1zZyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFByb3RvY29sLnNlcnZlclN0dWZmVGV4dDpcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhtc2cucmVhZENTdHJpbmcoKSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFByb3RvY29sLnNlcnZlclRlbXBFbnRpdHk6XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJzZVRlbXBFbnRpdHkobXNnKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgUHJvdG9jb2wuc2VydmVySW5mbzpcbiAgICAgICAgICAgICAgICB0aGlzLnBhcnNlU2VydmVySW5mbyhtc2cpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQcm90b2NvbC5zZXJ2ZXJTaWdub25OdW06XG4gICAgICAgICAgICAgICAgbXNnLnNraXAoMSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFByb3RvY29sLnNlcnZlckNkVHJhY2s6XG4gICAgICAgICAgICAgICAgbXNnLnNraXAoMik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFByb3RvY29sLnNlcnZlclNwYXduU3RhdGljOlxuICAgICAgICAgICAgICAgIHRoaXMud29ybGQuc3Bhd25TdGF0aWModGhpcy5wYXJzZUJhc2VsaW5lKG1zZykpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQcm90b2NvbC5zZXJ2ZXJLaWxsZWRNb25zdGVyOlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQcm90b2NvbC5zZXJ2ZXJEYW1hZ2U6XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJzZURhbWFnZShtc2cpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQcm90b2NvbC5zZXJ2ZXJGb3VuZFNlY3JldDpcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgUHJvdG9jb2wuc2VydmVyU3Bhd25CYXNlbGluZTpcbiAgICAgICAgICAgICAgICB0aGlzLndvcmxkLnNwYXduRW50aXR5KG1zZy5yZWFkSW50MTYoKSwgdGhpcy5wYXJzZUJhc2VsaW5lKG1zZykpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQcm90b2NvbC5zZXJ2ZXJDZW50ZXJQcmludDpcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQ0VOVEVSOiAnLCBtc2cucmVhZENTdHJpbmcoKSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFByb3RvY29sLnNlcnZlclNwYXduU3RhdGljU291bmQ6XG4gICAgICAgICAgICAgICAgbXNnLnNraXAoOSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OiB0aHJvdyAnVW5rbm93biBjbWQ6ICcgKyBjbWQ7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5DbGllbnQucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKHRpbWUpIHtcbiAgICBpZiAoIXRpbWUpIHJldHVybjtcblxuICAgIHRoaXMudGltZS5vbGRDbGllbnRUaW1lID0gdGhpcy50aW1lLmNsaWVudFRpbWU7XG4gICAgdGhpcy50aW1lLmNsaWVudFRpbWUgPSB0aW1lIC8gMTAwMDtcblxuICAgIGlmICh0aGlzLnRpbWUuY2xpZW50VGltZSA+IHRoaXMudGltZS5zZXJ2ZXJUaW1lKVxuICAgICAgICB0aGlzLnJlYWRGcm9tU2VydmVyKCk7XG5cbiAgICB2YXIgc2VydmVyRGVsdGEgPSB0aGlzLnRpbWUuc2VydmVyVGltZSAtIHRoaXMudGltZS5vbGRTZXJ2ZXJUaW1lIHx8IDAuMTtcbiAgICBpZiAoc2VydmVyRGVsdGEgPiAwLjEpIHtcbiAgICAgICAgdGhpcy50aW1lLm9sZFNlcnZlclRpbWUgPSB0aGlzLnRpbWUuc2VydmVyVGltZSAtIDAuMTtcbiAgICAgICAgc2VydmVyRGVsdGEgPSAwLjE7XG4gICAgfVxuICAgIHZhciBkdCA9ICh0aGlzLnRpbWUuY2xpZW50VGltZSAtIHRoaXMudGltZS5vbGRTZXJ2ZXJUaW1lKSAvIHNlcnZlckRlbHRhO1xuICAgIGlmIChkdCA+IDEuMCkgZHQgPSAxLjA7XG5cbiAgICB0aGlzLndvcmxkLnVwZGF0ZShkdCk7XG5cbn07XG5cbkNsaWVudC5wcm90b3R5cGUucGFyc2VTZXJ2ZXJJbmZvID0gZnVuY3Rpb24obXNnKSB7XG4gICAgbXNnLnNraXAoNik7XG4gICAgdmFyIG1hcE5hbWUgPSBtc2cucmVhZENTdHJpbmcoKTtcblxuICAgIHdoaWxlKHRydWUpIHtcbiAgICAgICAgdmFyIG1vZGVsTmFtZSA9IG1zZy5yZWFkQ1N0cmluZygpO1xuICAgICAgICBpZiAoIW1vZGVsTmFtZSkgYnJlYWs7XG4gICAgICAgIHRoaXMud29ybGQubG9hZE1vZGVsKG1vZGVsTmFtZSk7XG4gICAgfVxuICAgIHdoaWxlKHRydWUpIHtcbiAgICAgICAgdmFyIHNvdW5kTmFtZSA9IG1zZy5yZWFkQ1N0cmluZygpO1xuICAgICAgICBpZiAoIXNvdW5kTmFtZSkgYnJlYWs7XG4gICAgICAgIC8vY29uc29sZS5sb2coc291bmROYW1lKTtcbiAgICB9XG59O1xuXG5DbGllbnQucHJvdG90eXBlLnBhcnNlQ2xpZW50RGF0YSA9IGZ1bmN0aW9uKG1zZykge1xuICAgIHZhciBiaXRzID0gbXNnLnJlYWRJbnQxNigpO1xuICAgIGlmIChiaXRzICYgUHJvdG9jb2wuY2xpZW50Vmlld0hlaWdodClcbiAgICAgICAgbXNnLnJlYWRVSW50OCgpO1xuXG4gICAgaWYgKGJpdHMgJiBQcm90b2NvbC5jbGllbnRJZGVhbFBpdGNoKVxuICAgICAgICBtc2cucmVhZEludDgoKTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMzsgaSsrKSB7XG5cbiAgICAgICAgaWYgKGJpdHMgJiAoUHJvdG9jb2wuY2xpZW50UHVuY2gxIDw8IGkpKVxuICAgICAgICAgICAgbXNnLnJlYWRJbnQ4KCk7XG5cbiAgICAgICAgaWYgKGJpdHMgJiAoUHJvdG9jb2wuY2xpZW50VmVsb2NpdHkxIDw8IGkpKVxuICAgICAgICAgICAgbXNnLnJlYWRJbnQ4KCk7XG4gICAgfVxuXG4gICAgbXNnLnJlYWRJbnQzMigpO1xuXG4gICAgaWYgKGJpdHMgJiBQcm90b2NvbC5jbGllbnRXZWFwb25GcmFtZSlcbiAgICAgICAgbXNnLnJlYWRVSW50OCgpO1xuXG4gICAgaWYgKGJpdHMgJiBQcm90b2NvbC5jbGllbnRBcm1vcilcbiAgICAgICAgbXNnLnJlYWRVSW50OCgpO1xuXG4gICAgaWYgKGJpdHMgJiBQcm90b2NvbC5jbGllbnRXZWFwb24pXG4gICAgICAgIG1zZy5yZWFkVUludDgoKTtcblxuICAgIG1zZy5yZWFkSW50MTYoKTtcbiAgICBtc2cucmVhZFVJbnQ4KCk7XG4gICAgbXNnLnJlYWRTdHJpbmcoNSk7XG59O1xuXG5DbGllbnQucHJvdG90eXBlLnBhcnNlRmFzdFVwZGF0ZSA9IGZ1bmN0aW9uKGNtZCwgbXNnKSB7XG4gICAgaWYgKGNtZCAmIFByb3RvY29sLmZhc3RVcGRhdGVNb3JlQml0cylcbiAgICAgICAgY21kID0gY21kIHwgKG1zZy5yZWFkVUludDgoKSA8PCA4KTtcblxuICAgIHZhciBlbnRpdHlObyA9IChjbWQgJiBQcm90b2NvbC5mYXN0VXBkYXRlTG9uZ0VudGl0eSkgP1xuICAgICAgICBtc2cucmVhZEludDE2KCkgOiBtc2cucmVhZFVJbnQ4KCk7XG5cblxuICAgIC8vIFRPRE86IE1vdmUgZW50aXR5IGZhc3QgdXBkYXRlcyBpbnRvIHdvcmxkLmpzLlxuICAgIHZhciBlbnRpdHkgPSB0aGlzLndvcmxkLmVudGl0aWVzW2VudGl0eU5vXTtcbiAgICBlbnRpdHkudGltZSA9IHRoaXMuc2VydmVyVGltZTtcblxuICAgIGlmIChjbWQgJiBQcm90b2NvbC5mYXN0VXBkYXRlTW9kZWwpIHtcbiAgICAgICAgZW50aXR5LnN0YXRlLm1vZGVsSW5kZXggPSBtc2cucmVhZFVJbnQ4KCk7XG4gICAgfVxuICAgIGlmIChjbWQgJiBQcm90b2NvbC5mYXN0VXBkYXRlRnJhbWUpXG4gICAgICAgIGVudGl0eS5zdGF0ZS5mcmFtZSA9IG1zZy5yZWFkVUludDgoKTtcbiAgICAvL2Vsc2VcbiAgICAvLyAgICBlbnRpdHkuc3RhdGUuZnJhbWUgPSBlbnRpdHkuYmFzZWxpbmUuZnJhbWU7XG5cbiAgICBpZiAoY21kICYgUHJvdG9jb2wuZmFzdFVwZGF0ZUNvbG9yTWFwKVxuICAgICAgICBtc2cucmVhZFVJbnQ4KCk7XG5cbiAgICBpZiAoY21kICYgUHJvdG9jb2wuZmFzdFVwZGF0ZVNraW4pXG4gICAgICAgIG1zZy5yZWFkVUludDgoKTtcbiAgICBpZiAoY21kICYgUHJvdG9jb2wuZmFzdFVwZGF0ZUVmZmVjdHMpXG4gICAgICAgIG1zZy5yZWFkVUludDgoKTtcblxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAzOyBpKyspIHtcbiAgICAgICAgZW50aXR5LnByaW9yU3RhdGUuYW5nbGVzW2ldID0gZW50aXR5Lm5leHRTdGF0ZS5hbmdsZXNbaV07XG4gICAgICAgIGVudGl0eS5wcmlvclN0YXRlLm9yaWdpbltpXSA9IGVudGl0eS5uZXh0U3RhdGUub3JpZ2luW2ldO1xuICAgIH1cblxuICAgIGlmIChjbWQgJiBQcm90b2NvbC5mYXN0VXBkYXRlT3JpZ2luMSlcbiAgICAgICAgZW50aXR5Lm5leHRTdGF0ZS5vcmlnaW5bMF0gPSBtc2cucmVhZEludDE2KCkgKiAwLjEyNTtcbiAgICBpZiAoY21kICYgUHJvdG9jb2wuZmFzdFVwZGF0ZUFuZ2xlMSlcbiAgICAgICAgZW50aXR5Lm5leHRTdGF0ZS5hbmdsZXNbMF0gPSBtc2cucmVhZEludDgoKSAqIDEuNDA2MjU7XG4gICAgaWYgKGNtZCAmIFByb3RvY29sLmZhc3RVcGRhdGVPcmlnaW4yKVxuICAgICAgICBlbnRpdHkubmV4dFN0YXRlLm9yaWdpblsxXSA9IG1zZy5yZWFkSW50MTYoKSAqIDAuMTI1O1xuICAgIGlmIChjbWQgJiBQcm90b2NvbC5mYXN0VXBkYXRlQW5nbGUyKVxuICAgICAgICBlbnRpdHkubmV4dFN0YXRlLmFuZ2xlc1sxXSA9IG1zZy5yZWFkSW50OCgpICogMS40MDYyNTtcbiAgICBpZiAoY21kICYgUHJvdG9jb2wuZmFzdFVwZGF0ZU9yaWdpbjMpXG4gICAgICAgIGVudGl0eS5uZXh0U3RhdGUub3JpZ2luWzJdID0gbXNnLnJlYWRJbnQxNigpICogMC4xMjU7XG4gICAgaWYgKGNtZCAmIFByb3RvY29sLmZhc3RVcGRhdGVBbmdsZTMpXG4gICAgICAgIGVudGl0eS5uZXh0U3RhdGUuYW5nbGVzWzJdID0gbXNnLnJlYWRJbnQ4KCkgKiAxLjQwNjI1O1xufTtcblxuQ2xpZW50LnByb3RvdHlwZS5wYXJzZVNvdW5kID0gZnVuY3Rpb24obXNnKSB7XG4gICAgdmFyIGJpdHMgPSBtc2cucmVhZFVJbnQ4KCk7XG4gICAgdmFyIHZvbHVtZSA9IChiaXRzICYgUHJvdG9jb2wuc291bmRWb2x1bWUpID8gbXNnLnJlYWRVSW50OCgpIDogMjU1O1xuICAgIHZhciBhdHRlbnVhdGlvbiA9IChiaXRzICYgUHJvdG9jb2wuc291bmRBdHRlbnVhdGlvbikgPyBtc2cucmVhZFVJbnQ4KCkgLyA2NC4wIDogMS4wO1xuICAgIHZhciBjaGFubmVsID0gbXNnLnJlYWRJbnQxNigpO1xuICAgIHZhciBzb3VuZEluZGV4ID0gbXNnLnJlYWRVSW50OCgpO1xuXG4gICAgdmFyIHBvcyA9IHZlYzMuY3JlYXRlKCk7XG4gICAgcG9zWzBdID0gbXNnLnJlYWRJbnQxNigpICogMC4xMjU7XG4gICAgcG9zWzFdID0gbXNnLnJlYWRJbnQxNigpICogMC4xMjU7XG4gICAgcG9zWzJdID0gbXNnLnJlYWRJbnQxNigpICogMC4xMjU7XG59O1xuXG5DbGllbnQucHJvdG90eXBlLnBhcnNlVGVtcEVudGl0eSA9IGZ1bmN0aW9uKG1zZykge1xuICAgIHZhciB0eXBlID0gbXNnLnJlYWRVSW50OCgpO1xuICAgIHZhciBwb3MgPSB2ZWMzLmNyZWF0ZSgpO1xuICAgIHN3aXRjaCh0eXBlKSB7XG4gICAgICAgIGNhc2UgUHJvdG9jb2wudGVtcEd1blNob3Q6XG4gICAgICAgIGNhc2UgUHJvdG9jb2wudGVtcFdpelNwaWtlOlxuICAgICAgICBjYXNlIFByb3RvY29sLnRlbXBTcGlrZTpcbiAgICAgICAgY2FzZSBQcm90b2NvbC50ZW1wU3VwZXJTcGlrZTpcblx0XHRjYXNlIFByb3RvY29sLnRlbXBUZWxlcG9ydDpcblx0XHRjYXNlIFByb3RvY29sLnRlbXBFeHBsb3Npb246XG4gICAgICAgICAgICBwb3NbMF0gPSBtc2cucmVhZEludDE2KCkgKiAwLjEyNTtcbiAgICAgICAgICAgIHBvc1sxXSA9IG1zZy5yZWFkSW50MTYoKSAqIDAuMTI1O1xuICAgICAgICAgICAgcG9zWzJdID0gbXNnLnJlYWRJbnQxNigpICogMC4xMjU7XG4gICAgICAgICAgICBicmVhaztcblx0XHRkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgJ1Vua25vd24gdGVtcC4gZW50aXR5IGVuY291bnRlcmVkOiAnICsgdHlwZTtcbiAgICB9XG59O1xuXG5DbGllbnQucHJvdG90eXBlLnBhcnNlRGFtYWdlID0gZnVuY3Rpb24obXNnKSB7XG4gICAgdmFyIGFybW9yID0gbXNnLnJlYWRVSW50OCgpO1xuICAgIHZhciBibG9vZCA9IG1zZy5yZWFkVUludDgoKTtcblxuICAgIHZhciBwb3MgPSB2ZWMzLmNyZWF0ZSgpO1xuICAgIHBvc1swXSA9IG1zZy5yZWFkSW50MTYoKSAqIDAuMTI1O1xuICAgIHBvc1sxXSA9IG1zZy5yZWFkSW50MTYoKSAqIDAuMTI1O1xuICAgIHBvc1syXSA9IG1zZy5yZWFkSW50MTYoKSAqIDAuMTI1O1xufTtcblxuQ2xpZW50LnByb3RvdHlwZS5wYXJzZVBhcnRpY2xlID0gZnVuY3Rpb24obXNnKSB7XG4gICAgdmFyIHBvcyA9IHZlYzMuY3JlYXRlKCk7XG4gICAgdmFyIGFuZ2xlcyA9IHZlYzMuY3JlYXRlKCk7XG4gICAgcG9zWzBdID0gbXNnLnJlYWRJbnQxNigpICogMC4xMjU7XG4gICAgcG9zWzFdID0gbXNnLnJlYWRJbnQxNigpICogMC4xMjU7XG4gICAgcG9zWzJdID0gbXNnLnJlYWRJbnQxNigpICogMC4xMjU7XG4gICAgYW5nbGVzWzBdID0gbXNnLnJlYWRJbnQ4KCkgKiAwLjA2MjU7XG4gICAgYW5nbGVzWzFdID0gbXNnLnJlYWRJbnQ4KCkgKiAwLjA2MjU7XG4gICAgYW5nbGVzWzJdID0gbXNnLnJlYWRJbnQ4KCkgKiAwLjA2MjU7XG4gICAgdmFyIGNvdW50ID0gbXNnLnJlYWRVSW50OCgpO1xuICAgIHZhciBjb2xvciA9IG1zZy5yZWFkVUludDgoKTtcbn07XG5cbkNsaWVudC5wcm90b3R5cGUucGFyc2VCYXNlbGluZSA9IGZ1bmN0aW9uKG1zZykge1xuICAgIHZhciBiYXNlbGluZSA9IHtcbiAgICAgICAgbW9kZWxJbmRleDogbXNnLnJlYWRVSW50OCgpLFxuICAgICAgICBmcmFtZTogbXNnLnJlYWRVSW50OCgpLFxuICAgICAgICBjb2xvck1hcDogbXNnLnJlYWRVSW50OCgpLFxuICAgICAgICBza2luOiBtc2cucmVhZFVJbnQ4KCksXG4gICAgICAgIG9yaWdpbjogdmVjMy5jcmVhdGUoKSxcbiAgICAgICAgYW5nbGVzOiB2ZWMzLmNyZWF0ZSgpXG4gICAgfTtcbiAgICBiYXNlbGluZS5vcmlnaW5bMF0gPSBtc2cucmVhZEludDE2KCkgKiAwLjEyNTtcbiAgICBiYXNlbGluZS5hbmdsZXNbMF0gPSBtc2cucmVhZEludDgoKSAqIDEuNDA2MjU7XG4gICAgYmFzZWxpbmUub3JpZ2luWzFdID0gbXNnLnJlYWRJbnQxNigpICogMC4xMjU7XG4gICAgYmFzZWxpbmUuYW5nbGVzWzFdID0gbXNnLnJlYWRJbnQ4KCkgKiAxLjQwNjI1O1xuICAgIGJhc2VsaW5lLm9yaWdpblsyXSA9IG1zZy5yZWFkSW50MTYoKSAqIDAuMTI1O1xuICAgIGJhc2VsaW5lLmFuZ2xlc1syXSA9IG1zZy5yZWFkSW50OCgpICogMS40MDYyNTtcbiAgICByZXR1cm4gYmFzZWxpbmU7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBDbGllbnQ7XG59KS5jYWxsKHRoaXMscmVxdWlyZShcIjFZaVo1U1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2NsaWVudC5qc1wiLFwiL1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbnZhciBCdWZmZXIgPSByZXF1aXJlKCdidWZmZXInKS5CdWZmZXI7XG5cbnZhciBGaWxlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIHRoaXMuYnVmZmVyID0gbmV3IEJ1ZmZlcihkYXRhKTtcbiAgICB0aGlzLm9mZnNldCA9IDA7XG59O1xuXG5GaWxlLnByb3RvdHlwZS50ZWxsID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMub2Zmc2V0O1xufTtcblxuRmlsZS5wcm90b3R5cGUuc2VlayA9IGZ1bmN0aW9uKG9mZnNldCkge1xuICAgIHRoaXMub2Zmc2V0ID0gb2Zmc2V0O1xufTtcblxuRmlsZS5wcm90b3R5cGUuc2tpcCA9IGZ1bmN0aW9uKGJ5dGVzKSB7XG4gICAgdGhpcy5vZmZzZXQgKz0gYnl0ZXM7XG59O1xuXG5GaWxlLnByb3RvdHlwZS5lb2YgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5vZmZzZXQgPj0gdGhpcy5idWZmZXIubGVuZ3RoO1xufTtcblxuRmlsZS5wcm90b3R5cGUuc2xpY2UgPSBmdW5jdGlvbihvZmZzZXQsIGxlbmd0aCkge1xuICAgIHJldHVybiBuZXcgRmlsZSh0aGlzLmJ1ZmZlci5zbGljZShvZmZzZXQsIG9mZnNldCArIGxlbmd0aCkpO1xufTtcblxuRmlsZS5wcm90b3R5cGUucmVhZCA9IGZ1bmN0aW9uKGxlbmd0aCkge1xuICAgIHZhciByZXN1bHQgPSBuZXcgRmlsZSh0aGlzLmJ1ZmZlci5zbGljZSh0aGlzLm9mZnNldCwgdGhpcy5vZmZzZXQgKyBsZW5ndGgpKTtcbiAgICB0aGlzLm9mZnNldCArPSBsZW5ndGg7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbkZpbGUucHJvdG90eXBlLnJlYWRTdHJpbmcgPSBmdW5jdGlvbihsZW5ndGgpIHtcbiAgICB2YXIgcmVzdWx0ID0gJyc7XG4gICAgdmFyIHRlcm1pbmF0ZWQgPSBmYWxzZTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBieXRlID0gdGhpcy5idWZmZXIucmVhZFVJbnQ4KHRoaXMub2Zmc2V0KyspO1xuICAgICAgICBpZiAoYnl0ZSA9PT0gMHgwKSB0ZXJtaW5hdGVkID0gdHJ1ZTtcbiAgICAgICAgaWYgKCF0ZXJtaW5hdGVkKVxuICAgICAgICAgICAgcmVzdWx0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnl0ZSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59O1xuXG5GaWxlLnByb3RvdHlwZS5yZWFkQ1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByZXN1bHQgPSAnJztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDEyODsgaSsrKSB7XG4gICAgICAgIHZhciBieXRlID0gdGhpcy5idWZmZXIucmVhZFVJbnQ4KHRoaXMub2Zmc2V0KyspO1xuICAgICAgICBpZiAoYnl0ZSA9PT0gMHgwKSByZXR1cm4gcmVzdWx0O1xuICAgICAgICByZXN1bHQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbkZpbGUucHJvdG90eXBlLnJlYWRVSW50OCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmJ1ZmZlci5yZWFkVUludDgodGhpcy5vZmZzZXQrKyk7XG59O1xuXG5GaWxlLnByb3RvdHlwZS5yZWFkSW50OCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmJ1ZmZlci5yZWFkSW50OCh0aGlzLm9mZnNldCsrKTtcbn07XG5cbkZpbGUucHJvdG90eXBlLnJlYWRVSW50MTYgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcmVzdWx0ID0gdGhpcy5idWZmZXIucmVhZFVJbnQxNkxFKHRoaXMub2Zmc2V0KTtcbiAgICB0aGlzLm9mZnNldCArPSAyO1xuICAgIHJldHVybiByZXN1bHQ7XG59O1xuXG5GaWxlLnByb3RvdHlwZS5yZWFkSW50MTYgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcmVzdWx0ID0gdGhpcy5idWZmZXIucmVhZEludDE2TEUodGhpcy5vZmZzZXQpO1xuICAgIHRoaXMub2Zmc2V0ICs9IDI7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbkZpbGUucHJvdG90eXBlLnJlYWRVSW50MzIgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcmVzdWx0ID0gdGhpcy5idWZmZXIucmVhZFVJbnQzMkxFKHRoaXMub2Zmc2V0KTtcbiAgICB0aGlzLm9mZnNldCArPSA0O1xuICAgIHJldHVybiByZXN1bHQ7XG59O1xuXG5GaWxlLnByb3RvdHlwZS5yZWFkSW50MzIgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcmVzdWx0ID0gdGhpcy5idWZmZXIucmVhZEludDMyTEUodGhpcy5vZmZzZXQpO1xuICAgIHRoaXMub2Zmc2V0ICs9IDQ7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbkZpbGUucHJvdG90eXBlLnJlYWRGbG9hdCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByZXN1bHQgPSB0aGlzLmJ1ZmZlci5yZWFkRmxvYXRMRSh0aGlzLm9mZnNldCk7XG4gICAgdGhpcy5vZmZzZXQgKz0gNDtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gRmlsZTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIxWWlaNVNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9maWxlLmpzXCIsXCIvXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuXG52YXIgQnNwID0gZnVuY3Rpb24oZmlsZSkge1xuICAgIHZhciBoZWFkZXIgPSB7XG4gICAgICAgIHZlcnNpb246IGZpbGUucmVhZEludDMyKCksXG4gICAgICAgIGVudGl0aWVzOiB7b2Zmc2V0OiBmaWxlLnJlYWRJbnQzMigpLCBzaXplOiBmaWxlLnJlYWRJbnQzMigpfSxcbiAgICAgICAgcGxhbmVzOiB7b2Zmc2V0OiBmaWxlLnJlYWRJbnQzMigpLCBzaXplOiBmaWxlLnJlYWRJbnQzMigpfSxcbiAgICAgICAgbWlwdGV4czoge29mZnNldDogZmlsZS5yZWFkSW50MzIoKSwgc2l6ZTogZmlsZS5yZWFkSW50MzIoKX0sXG4gICAgICAgIHZlcnRpY2VzOiB7b2Zmc2V0OiBmaWxlLnJlYWRJbnQzMigpLCBzaXplOiBmaWxlLnJlYWRJbnQzMigpfSxcbiAgICAgICAgdmlzaWxpc3Q6IHtvZmZzZXQ6IGZpbGUucmVhZEludDMyKCksIHNpemU6IGZpbGUucmVhZEludDMyKCl9LFxuICAgICAgICBub2Rlczoge29mZnNldDogZmlsZS5yZWFkSW50MzIoKSwgc2l6ZTogZmlsZS5yZWFkSW50MzIoKX0sXG4gICAgICAgIHRleGluZm9zOiB7b2Zmc2V0OiBmaWxlLnJlYWRJbnQzMigpLCBzaXplOiBmaWxlLnJlYWRJbnQzMigpfSxcbiAgICAgICAgZmFjZXM6IHtvZmZzZXQ6IGZpbGUucmVhZEludDMyKCksIHNpemU6IGZpbGUucmVhZEludDMyKCl9LFxuICAgICAgICBsaWdodG1hcHM6IHtvZmZzZXQ6IGZpbGUucmVhZEludDMyKCksIHNpemU6IGZpbGUucmVhZEludDMyKCl9LFxuICAgICAgICBjbGlwbm9kZXM6IHtvZmZzZXQ6IGZpbGUucmVhZEludDMyKCksIHNpemU6IGZpbGUucmVhZEludDMyKCl9LFxuICAgICAgICBsZWF2ZXM6IHtvZmZzZXQ6IGZpbGUucmVhZEludDMyKCksIHNpemU6IGZpbGUucmVhZEludDMyKCl9LFxuICAgICAgICBsZmFjZXM6IHtvZmZzZXQ6IGZpbGUucmVhZEludDMyKCksIHNpemU6IGZpbGUucmVhZEludDMyKCl9LFxuICAgICAgICBlZGdlczoge29mZnNldDogZmlsZS5yZWFkSW50MzIoKSwgc2l6ZTogZmlsZS5yZWFkSW50MzIoKX0sXG4gICAgICAgIGxlZGdlczoge29mZnNldDogZmlsZS5yZWFkSW50MzIoKSwgc2l6ZTogZmlsZS5yZWFkSW50MzIoKX0sXG4gICAgICAgIG1vZGVsczoge29mZnNldDogZmlsZS5yZWFkSW50MzIoKSwgc2l6ZTogZmlsZS5yZWFkSW50MzIoKX1cbiAgICB9O1xuXG4gICAgdGhpcy5sb2FkVGV4dHVyZXMoZmlsZSwgaGVhZGVyLm1pcHRleHMpO1xuICAgIHRoaXMubG9hZFRleEluZm9zKGZpbGUsIGhlYWRlci50ZXhpbmZvcyk7XG4gICAgdGhpcy5sb2FkTGlnaHRNYXBzKGZpbGUsIGhlYWRlci5saWdodG1hcHMpO1xuXG4gICAgdGhpcy5sb2FkTW9kZWxzKGZpbGUsIGhlYWRlci5tb2RlbHMpO1xuICAgIHRoaXMubG9hZFZlcnRpY2VzKGZpbGUsIGhlYWRlci52ZXJ0aWNlcyk7XG4gICAgdGhpcy5sb2FkRWRnZXMoZmlsZSwgaGVhZGVyLmVkZ2VzKTtcbiAgICB0aGlzLmxvYWRTdXJmYWNlRWRnZXMoZmlsZSwgaGVhZGVyLmxlZGdlcyk7XG4gICAgdGhpcy5sb2FkU3VyZmFjZXMoZmlsZSwgaGVhZGVyLmZhY2VzKTtcbn07XG5cbkJzcC5zdXJmYWNlRmxhZ3MgPSB7XG4gICAgcGxhbmVCYWNrOiAyLCBkcmF3U2t5OiA0LCBkcmF3U3ByaXRlOiA4LCBkcmF3VHVyYjogMTYsXG4gICAgZHJhd1RpbGVkOiAzMiwgZHJhd0JhY2tncm91bmQ6IDY0LCB1bmRlcndhdGVyOiAxMjhcbn07XG5cbkJzcC5wcm90b3R5cGUubG9hZFZlcnRpY2VzID0gZnVuY3Rpb24oZmlsZSwgbHVtcCkge1xuICAgIHRoaXMudmVydGV4Q291bnQgPSBsdW1wLnNpemUgLyAxMjtcbiAgICB0aGlzLnZlcnRpY2VzID0gW107XG4gICAgZmlsZS5zZWVrKGx1bXAub2Zmc2V0KTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudmVydGV4Q291bnQ7IGkrKykge1xuICAgICAgICB0aGlzLnZlcnRpY2VzLnB1c2goe1xuICAgICAgICAgICAgeDogZmlsZS5yZWFkRmxvYXQoKSxcbiAgICAgICAgICAgIHk6IGZpbGUucmVhZEZsb2F0KCksXG4gICAgICAgICAgICB6OiBmaWxlLnJlYWRGbG9hdCgpXG4gICAgICAgIH0pO1xuICAgIH1cbn07XG5cbkJzcC5wcm90b3R5cGUubG9hZEVkZ2VzID0gZnVuY3Rpb24oZmlsZSwgbHVtcCkge1xuICAgIHZhciBlZGdlQ291bnQgPSBsdW1wLnNpemUgLyA0O1xuICAgIHRoaXMuZWRnZXMgPSBbXTtcbiAgICBmaWxlLnNlZWsobHVtcC5vZmZzZXQpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWRnZUNvdW50ICogNDsgaSsrKVxuICAgICAgICB0aGlzLmVkZ2VzLnB1c2goZmlsZS5yZWFkVUludDE2KCkpO1xufTtcblxuQnNwLnByb3RvdHlwZS5sb2FkU3VyZmFjZUVkZ2VzID0gZnVuY3Rpb24oZmlsZSwgbHVtcCkge1xuICAgIHZhciBlZGdlTGlzdENvdW50ID0gbHVtcC5zaXplIC8gNDtcbiAgICB0aGlzLmVkZ2VMaXN0ID0gW107XG4gICAgZmlsZS5zZWVrKGx1bXAub2Zmc2V0KTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVkZ2VMaXN0Q291bnQ7IGkrKykge1xuICAgICAgICB0aGlzLmVkZ2VMaXN0LnB1c2goZmlsZS5yZWFkSW50MzIoKSk7XG4gICAgfVxufTtcblxuQnNwLnByb3RvdHlwZS5jYWxjdWxhdGVTdXJmYWNlRXh0ZW50cyA9IGZ1bmN0aW9uKHN1cmZhY2UpIHtcbiAgICB2YXIgbWluUyA9IDk5OTk5O1xuICAgIHZhciBtYXhTID0gLTk5OTk5O1xuICAgIHZhciBtaW5UID0gOTk5OTk7XG4gICAgdmFyIG1heFQgPSAtOTk5OTk7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN1cmZhY2UuZWRnZUNvdW50OyBpKyspIHtcbiAgICAgICAgdmFyIGVkZ2VJbmRleCA9IHRoaXMuZWRnZUxpc3Rbc3VyZmFjZS5lZGdlU3RhcnQgKyBpXTtcbiAgICAgICAgdmFyIHZpID0gZWRnZUluZGV4ID49IDAgPyB0aGlzLmVkZ2VzW2VkZ2VJbmRleCAqIDJdIDogdGhpcy5lZGdlc1stZWRnZUluZGV4ICogMiArIDFdO1xuICAgICAgICB2YXIgdiA9IFt0aGlzLnZlcnRpY2VzW3ZpXS54LCB0aGlzLnZlcnRpY2VzW3ZpXS55LCB0aGlzLnZlcnRpY2VzW3ZpXS56XTtcbiAgICAgICAgdmFyIHRleEluZm8gPSB0aGlzLnRleEluZm9zW3N1cmZhY2UudGV4SW5mb0lkXTtcblxuICAgICAgICB2YXIgcyA9IHZlYzMuZG90KHYsIHRleEluZm8udmVjdG9yUykgKyB0ZXhJbmZvLmRpc3RTO1xuICAgICAgICBtaW5TID0gTWF0aC5taW4obWluUywgcyk7XG4gICAgICAgIG1heFMgPSBNYXRoLm1heChtYXhTLCBzKTtcblxuICAgICAgICB2YXIgdCA9IHZlYzMuZG90KHYsIHRleEluZm8udmVjdG9yVCkgKyB0ZXhJbmZvLmRpc3RUO1xuICAgICAgICBtaW5UID0gTWF0aC5taW4obWluVCwgdCk7XG4gICAgICAgIG1heFQgPSBNYXRoLm1heChtYXhULCB0KTtcbiAgICB9XG5cbiAgICAvKiBDb252ZXJ0IHRvIGludHMgKi9cbiAgICBtaW5TID0gTWF0aC5mbG9vcihtaW5TIC8gMTYpO1xuICAgIG1pblQgPSBNYXRoLmZsb29yKG1pblQgLyAxNik7XG4gICAgbWF4UyA9IE1hdGguY2VpbChtYXhTIC8gMTYpO1xuICAgIG1heFQgPSBNYXRoLmNlaWwobWF4VCAvIDE2KTtcblxuICAgIHN1cmZhY2UudGV4dHVyZU1pbnMgPSBbbWluUyAqIDE2LCBtaW5UICogMTZdO1xuICAgIHN1cmZhY2UuZXh0ZW50cyA9IFsobWF4UyAtIG1pblMpICogMTYsIChtYXhUIC0gbWluVCkgKiAxNl07XG59O1xuXG5Cc3AucHJvdG90eXBlLmxvYWRTdXJmYWNlcyA9IGZ1bmN0aW9uIChmaWxlLCBsdW1wKSB7XG5cbiAgICB2YXIgc3VyZmFjZUNvdW50ID0gbHVtcC5zaXplIC8gMjA7XG4gICAgdGhpcy5zdXJmYWNlcyA9IFtdO1xuICAgIGZpbGUuc2VlayhsdW1wLm9mZnNldCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdXJmYWNlQ291bnQ7IGkrKykge1xuICAgICAgICB2YXIgc3VyZmFjZSA9IHt9O1xuICAgICAgICBzdXJmYWNlLnBsYW5lSWQgPSBmaWxlLnJlYWRVSW50MTYoKTtcbiAgICAgICAgc3VyZmFjZS5zaWRlID0gZmlsZS5yZWFkVUludDE2KCk7XG4gICAgICAgIHN1cmZhY2UuZWRnZVN0YXJ0ID0gZmlsZS5yZWFkSW50MzIoKTtcbiAgICAgICAgc3VyZmFjZS5lZGdlQ291bnQgPSBmaWxlLnJlYWRJbnQxNigpO1xuICAgICAgICBzdXJmYWNlLnRleEluZm9JZCA9IGZpbGUucmVhZFVJbnQxNigpO1xuXG4gICAgICAgIHN1cmZhY2UubGlnaHRTdHlsZXMgPSBbZmlsZS5yZWFkVUludDgoKSwgZmlsZS5yZWFkVUludDgoKSwgZmlsZS5yZWFkVUludDgoKSwgZmlsZS5yZWFkVUludDgoKV07XG4gICAgICAgIHN1cmZhY2UubGlnaHRNYXBPZmZzZXQgPSBmaWxlLnJlYWRJbnQzMigpO1xuICAgICAgICBzdXJmYWNlLmZsYWdzID0gMDtcblxuICAgICAgICB0aGlzLmNhbGN1bGF0ZVN1cmZhY2VFeHRlbnRzKHN1cmZhY2UpO1xuICAgICAgICB0aGlzLnN1cmZhY2VzLnB1c2goc3VyZmFjZSk7XG4gICAgfVxufTtcblxuQnNwLnByb3RvdHlwZS5sb2FkVGV4dHVyZXMgPSBmdW5jdGlvbihmaWxlLCBsdW1wKSB7XG4gICAgZmlsZS5zZWVrKGx1bXAub2Zmc2V0KTtcbiAgICB2YXIgdGV4dHVyZUNvdW50ID0gZmlsZS5yZWFkSW50MzIoKTtcblxuICAgIHRoaXMudGV4dHVyZXMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRleHR1cmVDb3VudDsgaSsrKSB7XG4gICAgICAgIHZhciB0ZXh0dXJlT2Zmc2V0ID0gZmlsZS5yZWFkSW50MzIoKTtcbiAgICAgICAgdmFyIG9yaWdpbmFsT2Zmc2V0ID0gZmlsZS50ZWxsKCk7XG4gICAgICAgIGZpbGUuc2VlayhsdW1wLm9mZnNldCArIHRleHR1cmVPZmZzZXQpO1xuICAgICAgICB2YXIgdGV4dHVyZSA9IHtcbiAgICAgICAgICAgIG5hbWU6IGZpbGUucmVhZFN0cmluZygxNiksXG4gICAgICAgICAgICB3aWR0aDogZmlsZS5yZWFkVUludDMyKCksXG4gICAgICAgICAgICBoZWlnaHQ6IGZpbGUucmVhZFVJbnQzMigpLFxuICAgICAgICB9O1xuICAgICAgICB2YXIgb2Zmc2V0ID0gbHVtcC5vZmZzZXQgKyB0ZXh0dXJlT2Zmc2V0ICsgZmlsZS5yZWFkVUludDMyKCk7XG4gICAgICAgIHRleHR1cmUuZGF0YSA9IGZpbGUuc2xpY2Uob2Zmc2V0LCB0ZXh0dXJlLndpZHRoICogdGV4dHVyZS5oZWlnaHQpO1xuICAgICAgICB0aGlzLnRleHR1cmVzLnB1c2godGV4dHVyZSk7XG5cbiAgICAgICAgZmlsZS5zZWVrKG9yaWdpbmFsT2Zmc2V0KTtcbiAgICB9XG59O1xuXG5Cc3AucHJvdG90eXBlLmxvYWRUZXhJbmZvcyA9IGZ1bmN0aW9uKGZpbGUsIGx1bXApIHtcbiAgICBmaWxlLnNlZWsobHVtcC5vZmZzZXQpO1xuICAgIHZhciB0ZXhJbmZvQ291bnQgPSBsdW1wLnNpemUgLyA0MDtcbiAgICB0aGlzLnRleEluZm9zID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0ZXhJbmZvQ291bnQ7IGkrKykge1xuICAgICAgICB2YXIgaW5mbyA9IHt9O1xuICAgICAgICBpbmZvLnZlY3RvclMgPSBbZmlsZS5yZWFkRmxvYXQoKSwgZmlsZS5yZWFkRmxvYXQoKSwgZmlsZS5yZWFkRmxvYXQoKV07XG4gICAgICAgIGluZm8uZGlzdFMgPSBmaWxlLnJlYWRGbG9hdCgpO1xuICAgICAgICBpbmZvLnZlY3RvclQgPSBbZmlsZS5yZWFkRmxvYXQoKSwgZmlsZS5yZWFkRmxvYXQoKSwgZmlsZS5yZWFkRmxvYXQoKV07XG4gICAgICAgIGluZm8uZGlzdFQgPSBmaWxlLnJlYWRGbG9hdCgpO1xuICAgICAgICBpbmZvLnRleHR1cmVJZCA9IGZpbGUucmVhZFVJbnQzMigpO1xuICAgICAgICBpbmZvLmFuaW1hdGVkID0gZmlsZS5yZWFkVUludDMyKCkgPT0gMTtcbiAgICAgICAgdGhpcy50ZXhJbmZvcy5wdXNoKGluZm8pO1xuICAgIH1cbn07XG5cbkJzcC5wcm90b3R5cGUubG9hZE1vZGVscyA9IGZ1bmN0aW9uKGZpbGUsIGx1bXApIHtcbiAgICBmaWxlLnNlZWsobHVtcC5vZmZzZXQpO1xuICAgIHZhciBtb2RlbENvdW50ID0gbHVtcC5zaXplIC8gNjQ7XG4gICAgdGhpcy5tb2RlbHMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1vZGVsQ291bnQ7IGkrKykge1xuXG4gICAgICAgIHZhciBtb2RlbCA9IHt9O1xuICAgICAgICBtb2RlbC5taW5zID0gdmVjMy5jcmVhdGUoW2ZpbGUucmVhZEZsb2F0KCksIGZpbGUucmVhZEZsb2F0KCksIGZpbGUucmVhZEZsb2F0KCldKTtcbiAgICAgICAgbW9kZWwubWF4ZXMgPSB2ZWMzLmNyZWF0ZShbZmlsZS5yZWFkRmxvYXQoKSwgZmlsZS5yZWFkRmxvYXQoKSwgZmlsZS5yZWFkRmxvYXQoKV0pO1xuICAgICAgICBtb2RlbC5vcmlnaW4gPSB2ZWMzLmNyZWF0ZShbZmlsZS5yZWFkRmxvYXQoKSwgZmlsZS5yZWFkRmxvYXQoKSwgZmlsZS5yZWFkRmxvYXQoKV0pO1xuICAgICAgICBtb2RlbC5ic3BOb2RlID0gZmlsZS5yZWFkSW50MzIoKTtcbiAgICAgICAgbW9kZWwuY2xpcE5vZGUxID0gZmlsZS5yZWFkSW50MzIoKTtcbiAgICAgICAgbW9kZWwuY2xpcE5vZGUyID0gZmlsZS5yZWFkSW50MzIoKTtcbiAgICAgICAgZmlsZS5yZWFkSW50MzIoKTsgLy8gU2tpcCBmb3Igbm93LlxuICAgICAgICBtb2RlbC52aXNMZWFmcyA9IGZpbGUucmVhZEludDMyKCk7XG4gICAgICAgIG1vZGVsLmZpcnN0U3VyZmFjZSA9IGZpbGUucmVhZEludDMyKCk7XG4gICAgICAgIG1vZGVsLnN1cmZhY2VDb3VudCA9IGZpbGUucmVhZEludDMyKCk7XG4gICAgICAgIHRoaXMubW9kZWxzLnB1c2gobW9kZWwpO1xuICAgIH1cbn07XG5cblxuQnNwLnByb3RvdHlwZS5sb2FkTGlnaHRNYXBzID0gZnVuY3Rpb24gKGZpbGUsIGx1bXApIHtcbiAgICBmaWxlLnNlZWsobHVtcC5vZmZzZXQpO1xuICAgIHRoaXMubGlnaHRNYXBzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsdW1wLnNpemU7IGkrKylcbiAgICAgICAgdGhpcy5saWdodE1hcHMucHVzaChmaWxlLnJlYWRVSW50OCgpKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IEJzcDtcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiMVlpWjVTXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvZm9ybWF0cy9ic3AuanNcIixcIi9mb3JtYXRzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuXG52YXIgQWxpYXMgPSB7IHNpbmdsZTogMCwgZ3JvdXA6IDF9O1xuXG52YXIgTWRsID0gZnVuY3Rpb24obmFtZSwgZmlsZSkge1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy5sb2FkSGVhZGVyKGZpbGUpO1xuICAgIHRoaXMubG9hZFNraW5zKGZpbGUpO1xuICAgIHRoaXMubG9hZFRleENvb3JkcyhmaWxlKTtcbiAgICB0aGlzLmxvYWRGYWNlcyhmaWxlKTtcbiAgICB0aGlzLmxvYWRGcmFtZXMoZmlsZSk7XG59O1xuXG5NZGwucHJvdG90eXBlLmxvYWRIZWFkZXIgPSBmdW5jdGlvbihmaWxlKSB7XG4gICAgdGhpcy5pZCA9IGZpbGUucmVhZFN0cmluZyg0KTtcbiAgICB0aGlzLnZlcnNpb24gPSBmaWxlLnJlYWRVSW50MzIoKTtcbiAgICB0aGlzLnNjYWxlID0gdmVjMy5mcm9tVmFsdWVzKGZpbGUucmVhZEZsb2F0KCksIGZpbGUucmVhZEZsb2F0KCksIGZpbGUucmVhZEZsb2F0KCkpO1xuICAgIHRoaXMub3JpZ2luID0gdmVjMy5mcm9tVmFsdWVzKGZpbGUucmVhZEZsb2F0KCksIGZpbGUucmVhZEZsb2F0KCksIGZpbGUucmVhZEZsb2F0KCkpO1xuICAgIHRoaXMucmFkaXVzID0gZmlsZS5yZWFkRmxvYXQoKTtcbiAgICB0aGlzLmV5ZVBvc2l0aW9uID0gW2ZpbGUucmVhZEZsb2F0KCksIGZpbGUucmVhZEZsb2F0KCksIGZpbGUucmVhZEZsb2F0KCldO1xuICAgIHRoaXMuc2tpbkNvdW50ID0gZmlsZS5yZWFkSW50MzIoKTtcbiAgICB0aGlzLnNraW5XaWR0aCA9IGZpbGUucmVhZEludDMyKCk7XG4gICAgdGhpcy5za2luSGVpZ2h0ID0gZmlsZS5yZWFkSW50MzIoKTtcbiAgICB0aGlzLnZlcnRleENvdW50ID0gZmlsZS5yZWFkSW50MzIoKTtcbiAgICB0aGlzLmZhY2VDb3VudCA9IGZpbGUucmVhZEludDMyKCk7XG4gICAgdGhpcy5mcmFtZUNvdW50ID0gZmlsZS5yZWFkSW50MzIoKTtcbiAgICB0aGlzLnN5bmNUeXBlID0gZmlsZS5yZWFkSW50MzIoKTtcbiAgICB0aGlzLmZsYWdzID0gZmlsZS5yZWFkSW50MzIoKTtcbiAgICB0aGlzLmF2ZXJhZ2VGYWNlU2l6ZSA9IGZpbGUucmVhZEZsb2F0KCk7XG59O1xuXG5cbk1kbC5wcm90b3R5cGUubG9hZFNraW5zID0gZnVuY3Rpb24oZmlsZSkge1xuICAgIGZpbGUuc2VlaygweDU0KTsgLy9iYXNlc2tpbiBvZmZzZXQsIHdoZXJlIHNraW5zIHN0YXJ0LlxuICAgIHRoaXMuc2tpbnMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuc2tpbkNvdW50OyBpKyspIHtcbiAgICAgICAgdmFyIGdyb3VwID0gZmlsZS5yZWFkSW50MzIoKTtcbiAgICAgICAgaWYgKGdyb3VwICE9PSBBbGlhcy5zaW5nbGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdXYXJuaW5nOiBNdWx0aXBsZSBza2lucyBub3Qgc3VwcG9ydGVkIHlldC4nKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZGF0YSA9IGZpbGUucmVhZCh0aGlzLnNraW5XaWR0aCAqIHRoaXMuc2tpbkhlaWdodCk7XG5cbiAgICAgICAgdGhpcy5za2lucy5wdXNoKGRhdGEpO1xuICAgIH1cbn07XG5cbk1kbC5wcm90b3R5cGUubG9hZFRleENvb3JkcyA9IGZ1bmN0aW9uKGZpbGUpIHtcbiAgICB0aGlzLnRleENvb3JkcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy52ZXJ0ZXhDb3VudDsgaSsrKSB7XG4gICAgICAgIHZhciB0ZXhDb29yZCA9IHt9O1xuICAgICAgICB0ZXhDb29yZC5vblNlYW0gPSBmaWxlLnJlYWRJbnQzMigpID09IDB4MjA7XG4gICAgICAgIHRleENvb3JkLnMgPSBmaWxlLnJlYWRJbnQzMigpO1xuICAgICAgICB0ZXhDb29yZC50ID0gZmlsZS5yZWFkSW50MzIoKTtcbiAgICAgICAgdGhpcy50ZXhDb29yZHMucHVzaCh0ZXhDb29yZCk7XG4gICAgfVxufTtcblxuTWRsLnByb3RvdHlwZS5sb2FkRmFjZXMgPSBmdW5jdGlvbihmaWxlKSB7XG4gICAgdGhpcy5mYWNlcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5mYWNlQ291bnQ7IGkrKykge1xuICAgICAgICB2YXIgZmFjZSA9IHt9O1xuICAgICAgICBmYWNlLmlzRnJvbnRGYWNlID0gZmlsZS5yZWFkSW50MzIoKSA9PSAxO1xuICAgICAgICBmYWNlLmluZGljZXMgPSBbZmlsZS5yZWFkSW50MzIoKSwgZmlsZS5yZWFkSW50MzIoKSwgZmlsZS5yZWFkSW50MzIoKV07XG4gICAgICAgIHRoaXMuZmFjZXMucHVzaChmYWNlKTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG59O1xuXG5NZGwucHJvdG90eXBlLmxvYWRGcmFtZXMgPSBmdW5jdGlvbihmaWxlKSB7XG4gICAgdGhpcy5mcmFtZXMgPSBbXTtcbiAgICB0aGlzLmFuaW1hdGlvbnMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZnJhbWVDb3VudDsgaSsrKSB7XG4gICAgICAgIHZhciB0eXBlID0gZmlsZS5yZWFkSW50MzIoKTtcbiAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICBjYXNlIEFsaWFzLnNpbmdsZTpcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5hbmltYXRpb25zLmxlbmd0aCA9PSAwKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFuaW1hdGlvbnMucHVzaCh7IGZpcnN0RnJhbWU6IDAsIGZyYW1lQ291bnQ6IHRoaXMuZnJhbWVDb3VudCB9KTtcblxuICAgICAgICAgICAgICAgIHRoaXMuZnJhbWVzLnB1c2godGhpcy5sb2FkU2luZ2xlRnJhbWUoZmlsZSkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBBbGlhcy5ncm91cDpcbiAgICAgICAgICAgICAgICB2YXIgZnJhbWVzID0gdGhpcy5sb2FkR3JvdXBGcmFtZShmaWxlKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFuaW1hdGlvbnMucHVzaCh7IGZpcnN0RnJhbWU6IHRoaXMuZnJhbWVzLmxlbmd0aCwgZnJhbWVDb3VudDogZnJhbWVzLmxlbmd0aCB9KTtcblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGYgPSAwOyBmIDwgZnJhbWVzLmxlbmd0aDsgZisrKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmZyYW1lcy5wdXNoKGZyYW1lc1tmXSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignV2FybmluZzogVW5rbm93biBmcmFtZSB0eXBlOiAnICsgdHlwZSArICcgZm91bmQgaW4gJyArIHRoaXMubmFtZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gUmVzZXQgZnJhbWVjb3VudGVyIHRvIGFjdHVhbCBmdWxsIGZyYW1lY291bnQgaW5jbHVkaW5nIGFsbCBmbGF0dGVuIGdyb3Vwcy5cbiAgICB0aGlzLmZyYW1lQ291bnQgPSB0aGlzLmZyYW1lcy5sZW5ndGg7XG4gICAgcmV0dXJuIHRydWU7XG59O1xuXG5NZGwucHJvdG90eXBlLmxvYWRTaW5nbGVGcmFtZSA9IGZ1bmN0aW9uKGZpbGUpIHtcbiAgICB2YXIgZnJhbWUgPSB7fTtcbiAgICBmcmFtZS50eXBlID0gQWxpYXMuc2luZ2xlO1xuICAgIGZyYW1lLmJib3ggPSBbXG4gICAgICAgIGZpbGUucmVhZFVJbnQ4KCksIGZpbGUucmVhZFVJbnQ4KCksIGZpbGUucmVhZFVJbnQ4KCksIGZpbGUucmVhZFVJbnQ4KCksXG4gICAgICAgIGZpbGUucmVhZFVJbnQ4KCksIGZpbGUucmVhZFVJbnQ4KCksIGZpbGUucmVhZFVJbnQ4KCksIGZpbGUucmVhZFVJbnQ4KClcbiAgICBdO1xuXG4gICAgZnJhbWUubmFtZSA9IGZpbGUucmVhZFN0cmluZygxNik7XG4gICAgZnJhbWUudmVydGljZXMgPSBbXTtcbiAgICBmcmFtZS5wb3NlQ291bnQgPSAxO1xuICAgIGZyYW1lLmludGVydmFsID0gMDtcbiAgICBmb3IgKHZhciB2ID0gMDsgdiA8IHRoaXMudmVydGV4Q291bnQ7IHYrKykge1xuICAgICAgICB2YXIgdmVydGV4ID0gW1xuICAgICAgICAgICAgdGhpcy5zY2FsZVswXSAqIGZpbGUucmVhZFVJbnQ4KCkgKyB0aGlzLm9yaWdpblswXSxcbiAgICAgICAgICAgIHRoaXMuc2NhbGVbMV0gKiBmaWxlLnJlYWRVSW50OCgpICsgdGhpcy5vcmlnaW5bMV0sXG4gICAgICAgICAgICB0aGlzLnNjYWxlWzJdICogZmlsZS5yZWFkVUludDgoKSArIHRoaXMub3JpZ2luWzJdXTtcbiAgICAgICAgZnJhbWUudmVydGljZXMucHVzaChbdmVydGV4WzBdLCB2ZXJ0ZXhbMV0sIHZlcnRleFsyXV0pO1xuICAgICAgICBmaWxlLnJlYWRVSW50OCgpOyAvLyBEb24ndCBjYXJlIGFib3V0IG5vcm1hbCBmb3Igbm93XG4gICAgfVxuICAgIHJldHVybiBmcmFtZTtcbn07XG5cbk1kbC5wcm90b3R5cGUubG9hZEdyb3VwRnJhbWUgPSBmdW5jdGlvbiAoZmlsZSkge1xuICAgIHZhciBncm91cEZyYW1lID0ge307XG4gICAgZ3JvdXBGcmFtZS50eXBlID0gQWxpYXMuZ3JvdXA7XG4gICAgZ3JvdXBGcmFtZS5wb3NlQ291bnQgPSBmaWxlLnJlYWRVSW50MzIoKTtcbiAgICBncm91cEZyYW1lLmJib3ggPSBbXG4gICAgICAgIGZpbGUucmVhZFVJbnQ4KCksIGZpbGUucmVhZFVJbnQ4KCksIGZpbGUucmVhZFVJbnQ4KCksIGZpbGUucmVhZFVJbnQ4KCksXG4gICAgICAgIGZpbGUucmVhZFVJbnQ4KCksIGZpbGUucmVhZFVJbnQ4KCksIGZpbGUucmVhZFVJbnQ4KCksIGZpbGUucmVhZFVJbnQ4KClcbiAgICBdO1xuXG4gICAgdmFyIGludGVydmFscyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ3JvdXBGcmFtZS5wb3NlQ291bnQ7IGkrKylcbiAgICAgICAgaW50ZXJ2YWxzLnB1c2goZmlsZS5yZWFkRmxvYXQoKSk7XG5cbiAgICB2YXIgZnJhbWVzID0gW107XG4gICAgZm9yICh2YXIgZiA9IDA7IGYgPCBncm91cEZyYW1lLnBvc2VDb3VudDsgZisrKSB7XG4gICAgICAgIHZhciBmcmFtZSA9IHRoaXMubG9hZFNpbmdsZUZyYW1lKGZpbGUpO1xuICAgICAgICBmcmFtZS5pbnRlcnZhbCA9IGludGVydmFsc1tpXTtcbiAgICAgICAgZnJhbWVzLnB1c2goZnJhbWUpO1xuICAgIH1cbiAgICByZXR1cm4gZnJhbWVzO1xufTtcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IE1kbDtcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiMVlpWjVTXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvZm9ybWF0cy9tZGwuanNcIixcIi9mb3JtYXRzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIEZpbGUgPSByZXF1aXJlKCdmaWxlJyk7XG52YXIgV2FkID0gcmVxdWlyZSgnZm9ybWF0cy93YWQnKTtcbnZhciBQYWxldHRlID0gcmVxdWlyZSgnZm9ybWF0cy9wYWxldHRlJyk7XG5cbnZhciBQYWsgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgdmFyIGZpbGUgPSBuZXcgRmlsZShkYXRhKTtcblxuICAgIGlmIChmaWxlLnJlYWRTdHJpbmcoNCkgIT09ICdQQUNLJylcbiAgICAgICAgdGhyb3cgJ0Vycm9yOiBDb3JydXB0IFBBSyBmaWxlLic7XG5cbiAgICB2YXIgaW5kZXhPZmZzZXQgPSBmaWxlLnJlYWRVSW50MzIoKTtcbiAgICB2YXIgaW5kZXhGaWxlQ291bnQgPSBmaWxlLnJlYWRVSW50MzIoKSAvIDY0O1xuXG4gICAgZmlsZS5zZWVrKGluZGV4T2Zmc2V0KTtcbiAgICB0aGlzLmluZGV4ID0ge307XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbmRleEZpbGVDb3VudDsgaSsrKSB7XG4gICAgICAgIHZhciBwYXRoID0gZmlsZS5yZWFkU3RyaW5nKDU2KTtcbiAgICAgICAgdmFyIG9mZnNldCA9IGZpbGUucmVhZFVJbnQzMigpO1xuICAgICAgICB2YXIgc2l6ZSA9IGZpbGUucmVhZFVJbnQzMigpO1xuICAgICAgICB0aGlzLmluZGV4W3BhdGhdID0geyBvZmZzZXQ6IG9mZnNldCwgc2l6ZTogc2l6ZSB9O1xuICAgIH1cbiAgICBjb25zb2xlLmxvZygnUEFLOiBMb2FkZWQgJWkgZW50cmllcy4nLCBpbmRleEZpbGVDb3VudCk7XG5cbiAgICB0aGlzLmZpbGUgPSBmaWxlO1xufTtcblxuUGFrLnByb3RvdHlwZS5sb2FkID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBlbnRyeSA9IHRoaXMuaW5kZXhbbmFtZV07XG4gICAgaWYgKCFlbnRyeSlcbiAgICAgICAgdGhyb3cgJ0Vycm9yOiBDYW5cXCd0IGZpbmQgZW50cnkgaW4gUEFLOiAnICsgbmFtZTtcbiAgICByZXR1cm4gdGhpcy5maWxlLnNsaWNlKGVudHJ5Lm9mZnNldCwgZW50cnkuc2l6ZSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBQYWs7XG59KS5jYWxsKHRoaXMscmVxdWlyZShcIjFZaVo1U1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2Zvcm1hdHMvcGFrLmpzXCIsXCIvZm9ybWF0c1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcblxudmFyIFBhbGV0dGUgPSBmdW5jdGlvbihmaWxlKSB7XG4gICAgdGhpcy5jb2xvcnMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDI1NjsgaSsrKSB7XG4gICAgICAgIHRoaXMuY29sb3JzLnB1c2goe1xuICAgICAgICAgICAgcjogZmlsZS5yZWFkVUludDgoKSxcbiAgICAgICAgICAgIGc6IGZpbGUucmVhZFVJbnQ4KCksXG4gICAgICAgICAgICBiOiBmaWxlLnJlYWRVSW50OCgpXG4gICAgICAgIH0pO1xuICAgIH1cbn07XG5cblBhbGV0dGUucHJvdG90eXBlLnVucGFjayA9IGZ1bmN0aW9uKGZpbGUsIHdpZHRoLCBoZWlnaHQsIGFscGhhKSB7XG4gICAgdmFyIHBpeGVscyA9IG5ldyBVaW50OEFycmF5KDQgKiB3aWR0aCAqIGhlaWdodCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB3aWR0aCAqIGhlaWdodDsgaSsrKSB7XG4gICAgICAgIHZhciBpbmRleCA9IGZpbGUucmVhZFVJbnQ4KCk7XG4gICAgICAgIHZhciBjb2xvciA9IHRoaXMuY29sb3JzW2luZGV4XTtcbiAgICAgICAgcGl4ZWxzW2kqNF0gPSBjb2xvci5yO1xuICAgICAgICBwaXhlbHNbaSo0KzFdID0gY29sb3IuZztcbiAgICAgICAgcGl4ZWxzW2kqNCsyXSA9IGNvbG9yLmI7XG4gICAgICAgIHBpeGVsc1tpKjQrM10gPSAoYWxwaGEgJiYgIWluZGV4KSA/IDAgOiAyNTU7XG4gICAgfVxuICAgIHJldHVybiBwaXhlbHM7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBQYWxldHRlO1xufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIxWWlaNVNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9mb3JtYXRzL3BhbGV0dGUuanNcIixcIi9mb3JtYXRzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuXG52YXIgV2FkID0gZnVuY3Rpb24oZmlsZSkge1xuICAgIHRoaXMubHVtcHMgPSBbXTtcbiAgICBpZiAoZmlsZS5yZWFkU3RyaW5nKDQpICE9PSAnV0FEMicpXG4gICAgICAgIHRocm93ICdFcnJvcjogQ29ycnVwdCBXQUQtZmlsZSBlbmNvdW50ZXJlZC4nO1xuXG4gICAgdmFyIGx1bXBDb3VudCA9IGZpbGUucmVhZFVJbnQzMigpO1xuICAgIHZhciBvZmZzZXQgPSBmaWxlLnJlYWRVSW50MzIoKTtcblxuICAgIGZpbGUuc2VlayhvZmZzZXQpO1xuICAgIHZhciBpbmRleCA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbHVtcENvdW50OyBpKyspIHtcbiAgICAgICAgdmFyIG9mZnNldCA9IGZpbGUucmVhZFVJbnQzMigpO1xuICAgICAgICBmaWxlLnNraXAoNCk7XG4gICAgICAgIHZhciBzaXplID0gZmlsZS5yZWFkVUludDMyKCk7XG4gICAgICAgIHZhciB0eXBlID0gZmlsZS5yZWFkVUludDgoKTtcbiAgICAgICAgZmlsZS5za2lwKDMpO1xuICAgICAgICB2YXIgbmFtZSA9IGZpbGUucmVhZFN0cmluZygxNik7XG4gICAgICAgIGluZGV4LnB1c2goeyBuYW1lOiBuYW1lLCBvZmZzZXQ6IG9mZnNldCwgc2l6ZTogc2l6ZSB9KTtcbiAgICB9XG5cbiAgICB0aGlzLmx1bXBzID0ge307XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbmRleC5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgZW50cnkgPSBpbmRleFtpXTtcbiAgICAgICAgdGhpcy5sdW1wc1tlbnRyeS5uYW1lXSA9IGZpbGUuc2xpY2UoZW50cnkub2Zmc2V0LCBlbnRyeS5zaXplKTtcbiAgICB9XG4gICAgY29uc29sZS5sb2coJ1dBRDogTG9hZGVkICVzIGx1bXBzLicsIGx1bXBDb3VudCk7XG59O1xuXG5XYWQucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgZmlsZSA9IHRoaXMubHVtcHNbbmFtZV07XG4gICAgaWYgKCFmaWxlKVxuICAgICAgICB0aHJvdyAnRXJyb3I6IE5vIHN1Y2ggZW50cnkgZm91bmQgaW4gV0FEOiAnICsgbmFtZTtcbiAgICByZXR1cm4gZmlsZTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IFdhZDtcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiMVlpWjVTXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvZm9ybWF0cy93YWQuanNcIixcIi9mb3JtYXRzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIHV0aWxzID0gcmVxdWlyZSgndXRpbHMnKTtcblxudmFyIFRleHR1cmUgPSBmdW5jdGlvbihmaWxlLCBvcHRpb25zKSB7XG4gICAgdmFyIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIG9wdGlvbnMuYWxwaGEgPSBvcHRpb25zLmFscGhhIHx8IGZhbHNlO1xuICAgIG9wdGlvbnMuZm9ybWF0ID0gb3B0aW9ucy5mb3JtYXQgfHwgZ2wuUkdCQTtcbiAgICBvcHRpb25zLnR5cGUgPSBvcHRpb25zLnR5cGUgfHwgZ2wuVU5TSUdORURfQllURTtcbiAgICBvcHRpb25zLmZpbHRlciA9IG9wdGlvbnMuZmlsdGVyIHx8IGdsLkxJTkVBUjtcbiAgICBvcHRpb25zLndyYXAgPSBvcHRpb25zLndyYXAgfHwgZ2wuQ0xBTVBfVE9fRURHRTtcblxuICAgIHRoaXMuaWQgPSBnbC5jcmVhdGVUZXh0dXJlKCk7XG4gICAgdGhpcy53aWR0aCA9IG9wdGlvbnMud2lkdGggfHwgZmlsZS5yZWFkVUludDMyKCk7XG4gICAgdGhpcy5oZWlnaHQgPSBvcHRpb25zLmhlaWdodCB8fCBmaWxlLnJlYWRVSW50MzIoKTtcbiAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCB0aGlzLmlkKTtcbiAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgb3B0aW9ucy5maWx0ZXIpO1xuICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NSU5fRklMVEVSLCBvcHRpb25zLmZpbHRlcik7XG4gICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfUywgb3B0aW9ucy53cmFwKTtcbiAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9ULCBvcHRpb25zLndyYXApO1xuXG4gICAgaWYgKGZpbGUpIHtcbiAgICAgICAgaWYgKCFvcHRpb25zLnBhbGV0dGUpXG4gICAgICAgICAgICB0aHJvdyAnRXJyb3I6IE5vIHBhbGV0dGUgc3BlY2lmaWVkIGluIG9wdGlvbnMuJztcblxuICAgICAgICB2YXIgcGl4ZWxzID0gb3B0aW9ucy5wYWxldHRlLnVucGFjayhmaWxlLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgb3B0aW9ucy5hbHBoYSk7XG4gICAgICAgIHZhciBucG90ID0gdXRpbHMuaXNQb3dlck9mMih0aGlzLndpZHRoKSAmJiB1dGlscy5pc1Bvd2VyT2YyKHRoaXMuaGVpZ2h0KTtcbiAgICAgICAgaWYgKCFucG90ICYmIG9wdGlvbnMud3JhcCA9PT0gZ2wuUkVQRUFUKSB7XG4gICAgICAgICAgICB2YXIgbmV3V2lkdGggPSB1dGlscy5uZXh0UG93ZXJPZjIodGhpcy53aWR0aCk7XG4gICAgICAgICAgICB2YXIgbmV3SGVpZ2h0ID0gdXRpbHMubmV4dFBvd2VyT2YyKHRoaXMuaGVpZ2h0KTtcbiAgICAgICAgICAgIHBpeGVscyA9IHRoaXMucmVzYW1wbGUocGl4ZWxzLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgbmV3V2lkdGgsIG5ld0hlaWdodCk7XG4gICAgICAgICAgICBnbC50ZXhJbWFnZTJEKGdsLlRFWFRVUkVfMkQsIDAsIG9wdGlvbnMuZm9ybWF0LCBuZXdXaWR0aCwgbmV3SGVpZ2h0LFxuICAgICAgICAgICAgICAgIDAsIG9wdGlvbnMuZm9ybWF0LCBvcHRpb25zLnR5cGUsIHBpeGVscyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBnbC50ZXhJbWFnZTJEKGdsLlRFWFRVUkVfMkQsIDAsIG9wdGlvbnMuZm9ybWF0LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCxcbiAgICAgICAgICAgICAgICAwLCBvcHRpb25zLmZvcm1hdCwgb3B0aW9ucy50eXBlLCBwaXhlbHMpO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZ2wudGV4SW1hZ2UyRChnbC5URVhUVVJFXzJELCAwLCBvcHRpb25zLmZvcm1hdCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsXG4gICAgICAgICAgICAwLCBvcHRpb25zLmZvcm1hdCwgb3B0aW9ucy50eXBlLCBudWxsKTtcbiAgICB9XG59O1xuXG5UZXh0dXJlLnByb3RvdHlwZS5kcmF3VG8gPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICB2YXIgdiA9IGdsLmdldFBhcmFtZXRlcihnbC5WSUVXUE9SVCk7XG5cbiAgICAvKiBTZXR1cCBzaGFyZWQgYnVmZmVycyBmb3IgcmVuZGVyIHRhcmdldCBkcmF3aW5nICovXG4gICAgaWYgKHR5cGVvZiBUZXh0dXJlLmZyYW1lQnVmZmVyID09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIFRleHR1cmUuZnJhbWVCdWZmZXIgPSBnbC5jcmVhdGVGcmFtZWJ1ZmZlcigpO1xuICAgICAgICBUZXh0dXJlLnJlbmRlckJ1ZmZlciA9IGdsLmNyZWF0ZVJlbmRlcmJ1ZmZlcigpO1xuICAgIH1cblxuICAgIGdsLmJpbmRGcmFtZWJ1ZmZlcihnbC5GUkFNRUJVRkZFUiwgVGV4dHVyZS5mcmFtZUJ1ZmZlcik7XG4gICAgZ2wuYmluZFJlbmRlcmJ1ZmZlcihnbC5SRU5ERVJCVUZGRVIsIFRleHR1cmUucmVuZGVyQnVmZmVyKTtcbiAgICBpZiAodGhpcy53aWR0aCAhPSBUZXh0dXJlLnJlbmRlckJ1ZmZlci53aWR0aCB8fCB0aGlzLmhlaWdodCAhPSBUZXh0dXJlLnJlbmRlckJ1ZmZlci5oZWlnaHQpIHtcbiAgICAgICAgVGV4dHVyZS5yZW5kZXJCdWZmZXIud2lkdGggPSB0aGlzLndpZHRoO1xuICAgICAgICBUZXh0dXJlLnJlbmRlckJ1ZmZlci5oZWlnaHQgPSB0aGlzLmhlaWdodDtcbiAgICAgICAgZ2wucmVuZGVyYnVmZmVyU3RvcmFnZShnbC5SRU5ERVJCVUZGRVIsIGdsLkRFUFRIX0NPTVBPTkVOVDE2LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gICAgfVxuXG5cbiAgICBnbC5mcmFtZWJ1ZmZlclRleHR1cmUyRChnbC5GUkFNRUJVRkZFUiwgZ2wuQ09MT1JfQVRUQUNITUVOVDAsIGdsLlRFWFRVUkVfMkQsIHRoaXMuaWQsIDApO1xuICAgIGdsLmZyYW1lYnVmZmVyUmVuZGVyYnVmZmVyKGdsLkZSQU1FQlVGRkVSLCBnbC5ERVBUSF9BVFRBQ0hNRU5ULCBnbC5SRU5ERVJCVUZGRVIsIFRleHR1cmUucmVuZGVyQnVmZmVyKTtcbiAgICBnbC52aWV3cG9ydCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG5cbiAgICB2YXIgcHJvamVjdGlvbk1hdHJpeCA9IG1hdDQub3J0aG8obWF0NC5jcmVhdGUoKSwgMCwgdGhpcy53aWR0aCwgMCwgdGhpcy5oZWlnaHQsIC0xMCwgMTApO1xuICAgIGNhbGxiYWNrKHByb2plY3Rpb25NYXRyaXgpO1xuXG4gICAgZ2wuYmluZEZyYW1lYnVmZmVyKGdsLkZSQU1FQlVGRkVSLCBudWxsKTtcbiAgICBnbC5iaW5kUmVuZGVyYnVmZmVyKGdsLlJFTkRFUkJVRkZFUiwgbnVsbCk7XG4gICAgZ2wudmlld3BvcnQodlswXSwgdlsxXSwgdlsyXSwgdlszXSk7XG59O1xuXG5UZXh0dXJlLnByb3RvdHlwZS5yZXNhbXBsZSA9IGZ1bmN0aW9uKHBpeGVscywgd2lkdGgsIGhlaWdodCwgbmV3V2lkdGgsIG5ld0hlaWdodCkge1xuICAgIHZhciBzcmMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICBzcmMud2lkdGggPSB3aWR0aDtcbiAgICBzcmMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgIHZhciBjb250ZXh0ID0gc3JjLmdldENvbnRleHQoJzJkJyk7XG4gICAgdmFyIGltYWdlRGF0YSA9IGNvbnRleHQuY3JlYXRlSW1hZ2VEYXRhKHdpZHRoLCBoZWlnaHQpO1xuICAgIGltYWdlRGF0YS5kYXRhLnNldChwaXhlbHMpO1xuICAgIGNvbnRleHQucHV0SW1hZ2VEYXRhKGltYWdlRGF0YSwgMCwgMCk7XG5cbiAgICB2YXIgZGVzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgIGRlc3Qud2lkdGggPSBuZXdXaWR0aDtcbiAgICBkZXN0LmhlaWdodCA9IG5ld0hlaWdodDtcbiAgICBjb250ZXh0ID0gZGVzdC5nZXRDb250ZXh0KCcyZCcpO1xuICAgIGNvbnRleHQuZHJhd0ltYWdlKHNyYywgMCwgMCwgZGVzdC53aWR0aCwgZGVzdC5oZWlnaHQpO1xuICAgIHZhciBpbWFnZSA9IGNvbnRleHQuZ2V0SW1hZ2VEYXRhKDAsIDAsIGRlc3Qud2lkdGgsIGRlc3QuaGVpZ2h0KTtcbiAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoaW1hZ2UuZGF0YSk7XG59O1xuXG5UZXh0dXJlLnByb3RvdHlwZS5iaW5kID0gZnVuY3Rpb24odW5pdCkge1xuICAgIGdsLmFjdGl2ZVRleHR1cmUoZ2wuVEVYVFVSRTAgKyAodW5pdCB8fCAwKSk7XG4gICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGhpcy5pZCk7XG59O1xuXG5UZXh0dXJlLnByb3RvdHlwZS51bmJpbmQgPSBmdW5jdGlvbih1bml0KSB7XG4gICAgZ2wuYWN0aXZlVGV4dHVyZShnbC5URVhUVVJFMCArICh1bml0IHx8IDApKTtcbiAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCBudWxsKTtcbn07XG5cblRleHR1cmUucHJvdG90eXBlLmFzRGF0YVVybCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBmcmFtZWJ1ZmZlciA9IGdsLmNyZWF0ZUZyYW1lYnVmZmVyKCk7XG4gICAgZ2wuYmluZEZyYW1lYnVmZmVyKGdsLkZSQU1FQlVGRkVSLCBmcmFtZWJ1ZmZlcik7XG4gICAgZ2wuZnJhbWVidWZmZXJUZXh0dXJlMkQoZ2wuRlJBTUVCVUZGRVIsIGdsLkNPTE9SX0FUVEFDSE1FTlQwLCBnbC5URVhUVVJFXzJELCB0aGlzLmlkLCAwKTtcblxuICAgIHZhciB3aWR0aCA9IHRoaXMud2lkdGg7XG4gICAgdmFyIGhlaWdodCA9IHRoaXMuaGVpZ2h0O1xuXG4gICAgLy8gUmVhZCB0aGUgY29udGVudHMgb2YgdGhlIGZyYW1lYnVmZmVyXG4gICAgdmFyIGRhdGEgPSBuZXcgVWludDhBcnJheSh3aWR0aCAqIGhlaWdodCAqIDQpO1xuICAgIGdsLnJlYWRQaXhlbHMoMCwgMCwgd2lkdGgsIGhlaWdodCwgZ2wuUkdCQSwgZ2wuVU5TSUdORURfQllURSwgZGF0YSk7XG4gICAgZ2wuZGVsZXRlRnJhbWVidWZmZXIoZnJhbWVidWZmZXIpO1xuXG4gICAgLy8gQ3JlYXRlIGEgMkQgY2FudmFzIHRvIHN0b3JlIHRoZSByZXN1bHRcbiAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgY2FudmFzLndpZHRoID0gd2lkdGg7XG4gICAgY2FudmFzLmhlaWdodCA9IGhlaWdodDtcbiAgICB2YXIgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgLy8gQ29weSB0aGUgcGl4ZWxzIHRvIGEgMkQgY2FudmFzXG4gICAgdmFyIGltYWdlRGF0YSA9IGNvbnRleHQuY3JlYXRlSW1hZ2VEYXRhKHdpZHRoLCBoZWlnaHQpO1xuICAgIGltYWdlRGF0YS5kYXRhLnNldChkYXRhKTtcbiAgICBjb250ZXh0LnB1dEltYWdlRGF0YShpbWFnZURhdGEsIDAsIDApO1xuICAgIHJldHVybiBjYW52YXMudG9EYXRhVVJMKCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBUZXh0dXJlO1xufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIxWWlaNVNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9nbC9UZXh0dXJlLmpzXCIsXCIvZ2xcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgVGV4dHVyZSA9IHJlcXVpcmUoJ2dsL3RleHR1cmUnKTtcblxudmFyIEF0bGFzID0gZnVuY3Rpb24gKHdpZHRoLCBoZWlnaHQpIHtcbiAgICB0aGlzLndpZHRoID0gd2lkdGggfHwgNTEyO1xuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0IHx8IDUxMjtcbiAgICB0aGlzLnRyZWUgPSB7IGNoaWxkcmVuOiBbXSwgeDogMCwgeTogMCwgd2lkdGg6IHdpZHRoLCBoZWlnaHQ6IGhlaWdodCB9O1xuICAgIHRoaXMuc3ViVGV4dHVyZXMgPSBbXTtcbiAgICB0aGlzLnRleHR1cmUgPSBudWxsO1xufTtcblxuQXRsYXMucHJvdG90eXBlLmdldFN1YlRleHR1cmUgPSBmdW5jdGlvbiAoc3ViVGV4dHVyZUlkKSB7XG4gICAgcmV0dXJuIHRoaXMuc3ViVGV4dHVyZXNbc3ViVGV4dHVyZUlkXTtcbn07XG5cbkF0bGFzLnByb3RvdHlwZS5hZGRTdWJUZXh0dXJlID0gZnVuY3Rpb24gKHRleHR1cmUpIHtcbiAgICB2YXIgbm9kZSA9IHRoaXMuZ2V0RnJlZU5vZGUodGhpcy50cmVlLCB0ZXh0dXJlKTtcbiAgICBpZiAobm9kZSA9PSBudWxsKVxuICAgICAgICB0aHJvdyAnRXJyb3I6IFVuYWJsZSB0byBwYWNrIHN1YiB0ZXh0dXJlISBJdCBzaW1wbHkgd29uXFwndCBmaXQuIDovJztcbiAgICBub2RlLnRleHR1cmUgPSB0ZXh0dXJlO1xuICAgIHRoaXMuc3ViVGV4dHVyZXMucHVzaCh7XG4gICAgICAgIHRleHR1cmU6IG5vZGUudGV4dHVyZSxcbiAgICAgICAgeDogbm9kZS54LCB5OiBub2RlLnksXG4gICAgICAgIHdpZHRoOiBub2RlLndpZHRoLCBoZWlnaHQ6IG5vZGUuaGVpZ2h0LFxuICAgICAgICBzMTogbm9kZS54IC8gdGhpcy50cmVlLndpZHRoLFxuICAgICAgICB0MTogbm9kZS55IC8gdGhpcy50cmVlLmhlaWdodCxcbiAgICAgICAgczI6IChub2RlLnggKyBub2RlLndpZHRoKSAvIHRoaXMudHJlZS53aWR0aCxcbiAgICAgICAgdDI6IChub2RlLnkgKyBub2RlLmhlaWdodCkgLyB0aGlzLnRyZWUuaGVpZ2h0XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXMuc3ViVGV4dHVyZXMubGVuZ3RoIC0gMTtcbn07XG5cbkF0bGFzLnByb3RvdHlwZS5yZXVzZVN1YlRleHR1cmUgPSBmdW5jdGlvbiAoczEsIHQxLCBzMiwgdDIpIHtcbiAgICB0aGlzLnN1YlRleHR1cmVzLnB1c2goeyBzMTogczEsIHQxOiB0MSwgczI6IHMyLCB0MjogdDIgfSk7XG59O1xuXG5BdGxhcy5wcm90b3R5cGUuY29tcGlsZSA9IGZ1bmN0aW9uKHNoYWRlcikge1xuXG4gICAgdmFyIGJ1ZmZlciA9IG5ldyBGbG9hdDMyQXJyYXkodGhpcy5zdWJUZXh0dXJlcy5sZW5ndGggKiA2ICogNSk7IC8vIHgseSx6LHMsdFxuICAgIHZhciB3aWR0aCA9IHRoaXMudHJlZS53aWR0aDtcbiAgICB2YXIgaGVpZ2h0ID0gdGhpcy50cmVlLmhlaWdodDtcbiAgICB2YXIgb2Zmc2V0ID0gMDtcbiAgICB2YXIgc3ViVGV4dHVyZXMgPSB0aGlzLnN1YlRleHR1cmVzO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3ViVGV4dHVyZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHN1YlRleHR1cmUgPSBzdWJUZXh0dXJlc1tpXTtcbiAgICAgICAgdGhpcy5hZGRTcHJpdGUoYnVmZmVyLCBvZmZzZXQsXG4gICAgICAgICAgICBzdWJUZXh0dXJlLngsIHN1YlRleHR1cmUueSxcbiAgICAgICAgICAgIHN1YlRleHR1cmUud2lkdGgsIHN1YlRleHR1cmUuaGVpZ2h0KTtcbiAgICAgICAgb2Zmc2V0ICs9ICg2ICogNSk7XG4gICAgfVxuXG4gICAgdmFyIHZlcnRleEJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xuICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB2ZXJ0ZXhCdWZmZXIpO1xuICAgIGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBidWZmZXIsIGdsLlNUQVRJQ19EUkFXKTtcblxuICAgIHZhciB0ZXh0dXJlID0gbmV3IFRleHR1cmUobnVsbCwgeyB3aWR0aDogd2lkdGgsIGhlaWdodDogaGVpZ2h0LyosIGZpbHRlcjogZ2wuTkVBUkVTVCAqLyB9KTtcbiAgICB0ZXh0dXJlLmRyYXdUbyhmdW5jdGlvbiAocHJvamVjdGlvbk1hdHJpeCkge1xuICAgICAgICBzaGFkZXIudXNlKCk7XG4gICAgICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHNoYWRlci5hdHRyaWJ1dGVzLnZlcnRleEF0dHJpYnV0ZSk7XG4gICAgICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHNoYWRlci5hdHRyaWJ1dGVzLnRleENvb3Jkc0F0dHJpYnV0ZSk7XG4gICAgICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIoc2hhZGVyLmF0dHJpYnV0ZXMudmVydGV4QXR0cmlidXRlLCAzLCBnbC5GTE9BVCwgZmFsc2UsIDIwLCAwKTtcbiAgICAgICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihzaGFkZXIuYXR0cmlidXRlcy50ZXhDb29yZHNBdHRyaWJ1dGUsIDIsIGdsLkZMT0FULCBmYWxzZSwgMjAsIDEyKTtcbiAgICAgICAgZ2wudW5pZm9ybU1hdHJpeDRmdihzaGFkZXIudW5pZm9ybXMucHJvamVjdGlvbk1hdHJpeCwgZmFsc2UsIHByb2plY3Rpb25NYXRyaXgpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN1YlRleHR1cmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgc3ViVGV4dHVyZSA9IHN1YlRleHR1cmVzW2ldO1xuICAgICAgICAgICAgaWYgKCFzdWJUZXh0dXJlLnRleHR1cmUpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHN1YlRleHR1cmUudGV4dHVyZS5pZCk7XG4gICAgICAgICAgICBnbC5kcmF3QXJyYXlzKGdsLlRSSUFOR0xFUywgaSAqIDYsIDYpO1xuXG4gICAgICAgICAgICBnbC5kZWxldGVUZXh0dXJlKHN1YlRleHR1cmUudGV4dHVyZS5pZCk7XG4gICAgICAgICAgICBzdWJUZXh0dXJlLnRleHR1cmUgPSBudWxsO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy50ZXh0dXJlID0gdGV4dHVyZTtcbiAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgbnVsbCk7XG4gICAgZ2wuZGVsZXRlQnVmZmVyKHZlcnRleEJ1ZmZlcik7XG4gICAgdGhpcy50cmVlID0gbnVsbDtcbn07XG5cbkF0bGFzLnByb3RvdHlwZS5hZGRTcHJpdGUgPSBmdW5jdGlvbiAoZGF0YSwgb2Zmc2V0LCB4LCB5LCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgdmFyIHogPSAwO1xuICAgIGRhdGFbb2Zmc2V0ICsgMF0gPSB4OyBkYXRhW29mZnNldCArIDFdID0geTsgZGF0YVtvZmZzZXQgKyAyXSA9IHo7XG4gICAgZGF0YVtvZmZzZXQgKyAzXSA9IDA7IGRhdGFbb2Zmc2V0ICsgNF0gPSAwO1xuICAgIGRhdGFbb2Zmc2V0ICsgNV0gPSB4ICsgd2lkdGg7IGRhdGFbb2Zmc2V0ICsgNl0gPSB5OyBkYXRhW29mZnNldCArIDddID0gejtcbiAgICBkYXRhW29mZnNldCArIDhdID0gMTsgZGF0YVtvZmZzZXQgKyA5XSA9IDA7XG4gICAgZGF0YVtvZmZzZXQgKyAxMF0gPSB4ICsgd2lkdGg7IGRhdGFbb2Zmc2V0ICsgMTFdID0geSArIGhlaWdodDsgZGF0YVtvZmZzZXQgKyAxMl0gPSB6O1xuICAgIGRhdGFbb2Zmc2V0ICsgMTNdID0gMTsgZGF0YVtvZmZzZXQgKyAxNF0gPSAxO1xuICAgIGRhdGFbb2Zmc2V0ICsgMTVdID0geCArIHdpZHRoOyBkYXRhW29mZnNldCArIDE2XSA9IHkgKyBoZWlnaHQ7IGRhdGFbb2Zmc2V0ICsgMTddID0gejtcbiAgICBkYXRhW29mZnNldCArIDE4XSA9IDE7IGRhdGFbb2Zmc2V0ICsgMTldID0gMTtcbiAgICBkYXRhW29mZnNldCArIDIwXSA9IHg7IGRhdGFbb2Zmc2V0ICsgMjFdID0geSArIGhlaWdodDsgZGF0YVtvZmZzZXQgKyAyMl0gPSB6O1xuICAgIGRhdGFbb2Zmc2V0ICsgMjNdID0gMDsgZGF0YVtvZmZzZXQgKyAyNF0gPSAxO1xuICAgIGRhdGFbb2Zmc2V0ICsgMjVdID0geDsgZGF0YVtvZmZzZXQgKyAyNl0gPSB5OyBkYXRhW29mZnNldCArIDI3XSA9IHo7XG4gICAgZGF0YVtvZmZzZXQgKyAyOF0gPSAwOyBkYXRhW29mZnNldCArIDI5XSA9IDA7XG59O1xuXG5BdGxhcy5wcm90b3R5cGUuZ2V0RnJlZU5vZGUgPSBmdW5jdGlvbiAobm9kZSwgdGV4dHVyZSkge1xuICAgIGlmIChub2RlLmNoaWxkcmVuWzBdIHx8IG5vZGUuY2hpbGRyZW5bMV0pIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHRoaXMuZ2V0RnJlZU5vZGUobm9kZS5jaGlsZHJlblswXSwgdGV4dHVyZSk7XG4gICAgICAgIGlmIChyZXN1bHQpXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuXG4gICAgICAgIHJldHVybiB0aGlzLmdldEZyZWVOb2RlKG5vZGUuY2hpbGRyZW5bMV0sIHRleHR1cmUpO1xuICAgIH1cblxuICAgIGlmIChub2RlLnRleHR1cmUpXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIGlmIChub2RlLndpZHRoIDwgdGV4dHVyZS53aWR0aCB8fCBub2RlLmhlaWdodCA8IHRleHR1cmUuaGVpZ2h0KVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICBpZiAobm9kZS53aWR0aCA9PSB0ZXh0dXJlLndpZHRoICYmIG5vZGUuaGVpZ2h0ID09IHRleHR1cmUuaGVpZ2h0KVxuICAgICAgICByZXR1cm4gbm9kZTtcblxuICAgIHZhciBkdyA9IG5vZGUud2lkdGggLSB0ZXh0dXJlLndpZHRoO1xuICAgIHZhciBkaCA9IG5vZGUuaGVpZ2h0IC0gdGV4dHVyZS5oZWlnaHQ7XG5cbiAgICBpZiAoZHcgPiBkaCkge1xuICAgICAgICBub2RlLmNoaWxkcmVuWzBdID0geyBjaGlsZHJlbjogW251bGwsIG51bGxdLFxuICAgICAgICAgICAgeDogbm9kZS54LFxuICAgICAgICAgICAgeTogbm9kZS55LFxuICAgICAgICAgICAgd2lkdGg6IHRleHR1cmUud2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IG5vZGUuaGVpZ2h0XG4gICAgICAgIH07XG4gICAgICAgIG5vZGUuY2hpbGRyZW5bMV0gPSB7IGNoaWxkcmVuOiBbbnVsbCwgbnVsbF0sXG4gICAgICAgICAgICB4OiBub2RlLnggKyB0ZXh0dXJlLndpZHRoLFxuICAgICAgICAgICAgeTogbm9kZS55LFxuICAgICAgICAgICAgd2lkdGg6IG5vZGUud2lkdGggLSB0ZXh0dXJlLndpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBub2RlLmhlaWdodFxuICAgICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG5vZGUuY2hpbGRyZW5bMF0gPSB7IGNoaWxkcmVuOiBbbnVsbCwgbnVsbF0sXG4gICAgICAgICAgICB4OiBub2RlLngsXG4gICAgICAgICAgICB5OiBub2RlLnksXG4gICAgICAgICAgICB3aWR0aDogbm9kZS53aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogdGV4dHVyZS5oZWlnaHRcbiAgICAgICAgfTtcbiAgICAgICAgbm9kZS5jaGlsZHJlblsxXSA9IHsgY2hpbGRyZW46IFtudWxsLCBudWxsXSxcbiAgICAgICAgICAgIHg6IG5vZGUueCxcbiAgICAgICAgICAgIHk6IG5vZGUueSArIHRleHR1cmUuaGVpZ2h0LFxuICAgICAgICAgICAgd2lkdGg6IG5vZGUud2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IG5vZGUuaGVpZ2h0IC0gdGV4dHVyZS5oZWlnaHRcbiAgICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZ2V0RnJlZU5vZGUobm9kZS5jaGlsZHJlblswXSwgdGV4dHVyZSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBBdGxhcztcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIxWWlaNVNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9nbC9hdGxhcy5qc1wiLFwiL2dsXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuXG52YXIgRm9udCA9IGZ1bmN0aW9uICh0ZXh0dXJlLCBjaGFyV2lkdGgsIGNoYXJIZWlnaHQpIHtcbiAgICB0aGlzLnRleHR1cmUgPSB0ZXh0dXJlO1xuICAgIHRoaXMuY2hhcldpZHRoID0gY2hhcldpZHRoIHx8IDg7XG4gICAgdGhpcy5jaGFySGVpZ2h0ID0gY2hhckhlaWdodCB8fCA4O1xuICAgIHRoaXMuZGF0YSA9IG5ldyBGbG9hdDMyQXJyYXkoNiAqIDUgKiA0ICogMTAyNCk7IC8vIDw9IDEwMjQgbWF4IGNoYXJhY3RlcnMuXG4gICAgdGhpcy52ZXJ0ZXhCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcbiAgICB0aGlzLnZlcnRleEJ1ZmZlci5uYW1lID0gJ3Nwcml0ZUZvbnQnO1xuICAgIHRoaXMub2Zmc2V0ID0gMDtcbiAgICB0aGlzLmVsZW1lbnRDb3VudCA9IDA7XG59O1xuXG5Gb250LnByb3RvdHlwZS5hZGRWZXJ0ZXggPSBmdW5jdGlvbih4LCB5LCB1LCB2KSB7XG4gICAgdGhpcy5kYXRhW3RoaXMub2Zmc2V0KytdID0geDtcbiAgICB0aGlzLmRhdGFbdGhpcy5vZmZzZXQrK10gPSB5O1xuICAgIHRoaXMuZGF0YVt0aGlzLm9mZnNldCsrXSA9IDA7XG4gICAgdGhpcy5kYXRhW3RoaXMub2Zmc2V0KytdID0gdTtcbiAgICB0aGlzLmRhdGFbdGhpcy5vZmZzZXQrK10gPSB2O1xufTtcblxuRm9udC5wcm90b3R5cGUuZHJhd0NoYXJhY3RlciA9IGZ1bmN0aW9uKHgsIHksIGluZGV4KSB7XG4gICAgaWYgKGluZGV4ID09IDMyIHx8IHkgPCAwIHx8IHggPCAwIHx8IHggPiBnbC53aWR0aCB8fCB5ID4gZ2wuaGVpZ2h0KVxuICAgICAgICByZXR1cm47XG5cbiAgICBpbmRleCAmPSAyNTU7XG4gICAgdmFyIHJvdyA9IGluZGV4ID4+IDQ7XG4gICAgdmFyIGNvbHVtbiA9IGluZGV4ICYgMTU7XG5cbiAgICB2YXIgZnJvdyA9IHJvdyAqIDAuMDYyNTtcbiAgICB2YXIgZmNvbCA9IGNvbHVtbiAqIDAuMDYyNTtcbiAgICB2YXIgc2l6ZSA9IDAuMDYyNTtcblxuICAgIHRoaXMuYWRkVmVydGV4KHgsIHksIGZjb2wsIGZyb3cpO1xuICAgIHRoaXMuYWRkVmVydGV4KHggKyB0aGlzLmNoYXJXaWR0aCwgeSwgZmNvbCArIHNpemUsIGZyb3cpO1xuICAgIHRoaXMuYWRkVmVydGV4KHggKyB0aGlzLmNoYXJXaWR0aCwgeSArIHRoaXMuY2hhckhlaWdodCwgZmNvbCArIHNpemUsICBmcm93ICsgc2l6ZSk7XG4gICAgdGhpcy5hZGRWZXJ0ZXgoeCArIHRoaXMuY2hhcldpZHRoLCB5ICsgdGhpcy5jaGFySGVpZ2h0LCBmY29sICsgc2l6ZSwgIGZyb3cgKyBzaXplKTtcbiAgICB0aGlzLmFkZFZlcnRleCh4LCB5ICsgdGhpcy5jaGFySGVpZ2h0LCBmY29sLCBmcm93ICsgc2l6ZSk7XG4gICAgdGhpcy5hZGRWZXJ0ZXgoeCwgeSwgZmNvbCwgZnJvdyk7XG4gICAgdGhpcy5lbGVtZW50Q291bnQgKz0gNjtcbn07XG5cbkZvbnQucHJvdG90eXBlLmRyYXdTdHJpbmcgPSBmdW5jdGlvbih4LCB5LCBzdHIsIG1vZGUpIHtcbiAgICB2YXIgb2Zmc2V0ID0gbW9kZSA/IDEyOCA6IDA7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspXG4gICAgICAgIHRoaXMuZHJhd0NoYXJhY3Rlcih4ICsgKChpICsgMSkgKiB0aGlzLmNoYXJXaWR0aCksIHksIHN0ci5jaGFyQ29kZUF0KGkpICsgb2Zmc2V0KTtcbn07XG5cbkZvbnQucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKHNoYWRlciwgcCkge1xuICAgIGlmICghdGhpcy5lbGVtZW50Q291bnQpXG4gICAgICAgIHJldHVybjtcblxuICAgIHNoYWRlci51c2UoKTtcbiAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdGhpcy52ZXJ0ZXhCdWZmZXIpO1xuICAgIGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLmRhdGEsIGdsLlNUUkVBTV9EUkFXKTtcbiAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKHNoYWRlci5hdHRyaWJ1dGVzLnZlcnRleEF0dHJpYnV0ZSwgMywgZ2wuRkxPQVQsIGZhbHNlLCAyMCwgMCk7XG4gICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihzaGFkZXIuYXR0cmlidXRlcy50ZXhDb29yZHNBdHRyaWJ1dGUsIDIsIGdsLkZMT0FULCBmYWxzZSwgMjAsIDEyKTtcbiAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShzaGFkZXIuYXR0cmlidXRlcy52ZXJ0ZXhBdHRyaWJ1dGUpO1xuICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHNoYWRlci5hdHRyaWJ1dGVzLnRleENvb3Jkc0F0dHJpYnV0ZSk7XG5cbiAgICBnbC51bmlmb3JtTWF0cml4NGZ2KHNoYWRlci51bmlmb3Jtcy5wcm9qZWN0aW9uTWF0cml4LCBmYWxzZSwgcCk7XG5cbiAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCB0aGlzLnRleHR1cmUuaWQpO1xuICAgIGdsLmRyYXdBcnJheXMoZ2wuVFJJQU5HTEVTLCAwLCB0aGlzLmVsZW1lbnRDb3VudCk7XG5cblxuICAgIHRoaXMuZWxlbWVudENvdW50ID0gMDtcbiAgICB0aGlzLm9mZnNldCA9IDA7XG5cbiAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCBudWxsKTtcbiAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgbnVsbCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBGb250O1xufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIxWWlaNVNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9nbC9mb250LmpzXCIsXCIvZ2xcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgZ2xNYXRyaXggPSByZXF1aXJlKCdsaWIvZ2wtbWF0cml4LW1pbi5qcycpO1xuXG52YXIgZ2wgPSBmdW5jdGlvbigpIHt9O1xuXG5nbC5pbml0ID0gZnVuY3Rpb24oaWQpIHtcblxuICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XG4gICAgaWYgKCFjYW52YXMpXG4gICAgICAgIHRocm93ICdFcnJvcjogTm8gY2FudmFzIGVsZW1lbnQgZm91bmQuJztcblxuICAgIHZhciBvcHRpb25zID0ge307XG4gICAgdmFyIGdsID0gY2FudmFzLmdldENvbnRleHQoJ3dlYmdsJywgb3B0aW9ucyk7XG4gICAgaWYgKCFnbClcbiAgICAgICAgdGhyb3cgJ0Vycm9yOiBObyBXZWJHTCBzdXBwb3J0IGZvdW5kLic7XG5cbiAgICBnbC53aWR0aCA9IGNhbnZhcy53aWR0aDtcbiAgICBnbC5oZWlnaHQgPSBjYW52YXMuaGVpZ2h0O1xuICAgIGdsLmNsZWFyQ29sb3IoMCwgMCwgMCwgMSk7XG4gICAgZ2wuYmxlbmRGdW5jKGdsLlNSQ19BTFBIQSwgZ2wuT05FX01JTlVTX1NSQ19BTFBIQSk7XG4gICAgZ2wuZGVwdGhGdW5jKGdsLkxFUVVBTCk7XG4gICAgLy9nbC5jdWxsRmFjZShnbC5GUk9OVCk7XG4gICAgZ2wudmlld3BvcnQoMCwgMCwgZ2wud2lkdGgsIGdsLmhlaWdodCk7XG5cbiAgICB3aW5kb3cudmVjMiA9IGdsTWF0cml4LnZlYzI7XG4gICAgd2luZG93LnZlYzMgPSBnbE1hdHJpeC52ZWMzO1xuICAgIHdpbmRvdy5tYXQ0ID0gZ2xNYXRyaXgubWF0NDtcbiAgICB3aW5kb3cuZ2wgPSBnbDtcblxuICAgIHJldHVybiBnbDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IGdsO1xuXG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiMVlpWjVTXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvZ2wvZ2wuanNcIixcIi9nbFwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcblxudmFyIExpZ2h0TWFwID0gZnVuY3Rpb24oZGF0YSwgb2Zmc2V0LCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgIHRoaXMuaWQgPSBnbC5jcmVhdGVUZXh0dXJlKCk7XG5cbiAgICB2YXIgcGl4ZWxzID0gbmV3IFVpbnQ4QXJyYXkod2lkdGggKiBoZWlnaHQgKiAzKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHdpZHRoICogaGVpZ2h0OyBpKyspIHtcbiAgICAgICAgdmFyIGludGVuc2l0eSA9IGRhdGFbb2Zmc2V0ICsgaV07XG4gICAgICAgIGludGVuc2l0eSA9ICFpbnRlbnNpdHkgPyAwIDogaW50ZW5zaXR5O1xuICAgICAgICBwaXhlbHNbaSAqIDMgKyAwXSA9IGludGVuc2l0eTtcbiAgICAgICAgcGl4ZWxzW2kgKiAzICsgMV0gPSBpbnRlbnNpdHk7XG4gICAgICAgIHBpeGVsc1tpICogMyArIDJdID0gaW50ZW5zaXR5O1xuICAgIH1cblxuICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRoaXMuaWQpO1xuICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NQUdfRklMVEVSLCBnbC5MSU5FQVIpO1xuICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NSU5fRklMVEVSLCBnbC5MSU5FQVIpO1xuICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9XUkFQX1MsIGdsLkNMQU1QX1RPX0VER0UpO1xuICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9XUkFQX1QsIGdsLkNMQU1QX1RPX0VER0UpO1xuXG4gICAgZ2wudGV4SW1hZ2UyRChnbC5URVhUVVJFXzJELCAwLCBnbC5SR0IsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCAwLCBnbC5SR0IsIGdsLlVOU0lHTkVEX0JZVEUsIHBpeGVscyk7XG59O1xuXG5MaWdodE1hcC5wcm90b3R5cGUuYmluZCA9IGZ1bmN0aW9uKHVuaXQpIHtcbiAgICBnbC5hY3RpdmVUZXh0dXJlKGdsLlRFWFRVUkUwICsgKHVuaXQgfHwgMCkpO1xuICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRoaXMuaWQpO1xufTtcblxuTGlnaHRNYXAucHJvdG90eXBlLnVuYmluZCA9IGZ1bmN0aW9uKHVuaXQpIHtcbiAgICBnbC5hY3RpdmVUZXh0dXJlKGdsLlRFWFRVUkUwICsgKHVuaXQgfHwgMCkpO1xuICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIG51bGwpO1xufTtcblxuTGlnaHRNYXAucHJvdG90eXBlLmFzRGF0YVVybCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBmcmFtZWJ1ZmZlciA9IGdsLmNyZWF0ZUZyYW1lYnVmZmVyKCk7XG4gICAgZ2wuYmluZEZyYW1lYnVmZmVyKGdsLkZSQU1FQlVGRkVSLCBmcmFtZWJ1ZmZlcik7XG4gICAgZ2wuZnJhbWVidWZmZXJUZXh0dXJlMkQoZ2wuRlJBTUVCVUZGRVIsIGdsLkNPTE9SX0FUVEFDSE1FTlQwLCBnbC5URVhUVVJFXzJELCB0aGlzLmlkLCAwKTtcblxuICAgIHZhciB3aWR0aCA9IHRoaXMud2lkdGg7XG4gICAgdmFyIGhlaWdodCA9IHRoaXMuaGVpZ2h0O1xuXG4gICAgLy8gUmVhZCB0aGUgY29udGVudHMgb2YgdGhlIGZyYW1lYnVmZmVyXG4gICAgdmFyIGRhdGEgPSBuZXcgVWludDhBcnJheSh3aWR0aCAqIGhlaWdodCAqIDQpO1xuICAgIGdsLnJlYWRQaXhlbHMoMCwgMCwgd2lkdGgsIGhlaWdodCwgZ2wuUkdCQSwgZ2wuVU5TSUdORURfQllURSwgZGF0YSk7XG4gICAgZ2wuZGVsZXRlRnJhbWVidWZmZXIoZnJhbWVidWZmZXIpO1xuXG4gICAgLy8gQ3JlYXRlIGEgMkQgY2FudmFzIHRvIHN0b3JlIHRoZSByZXN1bHRcbiAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgY2FudmFzLndpZHRoID0gd2lkdGg7XG4gICAgY2FudmFzLmhlaWdodCA9IGhlaWdodDtcbiAgICB2YXIgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgLy8gQ29weSB0aGUgcGl4ZWxzIHRvIGEgMkQgY2FudmFzXG4gICAgdmFyIGltYWdlRGF0YSA9IGNvbnRleHQuY3JlYXRlSW1hZ2VEYXRhKHdpZHRoLCBoZWlnaHQpO1xuICAgIGltYWdlRGF0YS5kYXRhLnNldChkYXRhKTtcbiAgICBjb250ZXh0LnB1dEltYWdlRGF0YShpbWFnZURhdGEsIDAsIDApO1xuICAgIHJldHVybiBjYW52YXMudG9EYXRhVVJMKCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBMaWdodE1hcDtcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiMVlpWjVTXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvZ2wvbGlnaHRtYXAuanNcIixcIi9nbFwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcblxuZnVuY3Rpb24gY29tcGlsZVNoYWRlcih0eXBlLCBzb3VyY2UpIHtcbiAgICB2YXIgc2hhZGVyID0gZ2wuY3JlYXRlU2hhZGVyKHR5cGUpO1xuICAgIGdsLnNoYWRlclNvdXJjZShzaGFkZXIsIHNvdXJjZSk7XG4gICAgZ2wuY29tcGlsZVNoYWRlcihzaGFkZXIpO1xuICAgIGlmICghZ2wuZ2V0U2hhZGVyUGFyYW1ldGVyKHNoYWRlciwgZ2wuQ09NUElMRV9TVEFUVVMpKSB7XG4gICAgICAgIHRocm93ICdFcnJvcjogU2hhZGVyIGNvbXBpbGUgZXJyb3I6ICcgKyBnbC5nZXRTaGFkZXJJbmZvTG9nKHNoYWRlcik7XG4gICAgfVxuICAgIHJldHVybiBzaGFkZXI7XG59XG5cbnZhciBTaGFkZXIgPSBmdW5jdGlvbihzb3VyY2UpIHtcbiAgICB2YXIgdmVydGV4U3RhcnQgPSBzb3VyY2UuaW5kZXhPZignW3ZlcnRleF0nKTtcbiAgICB2YXIgZnJhZ21lbnRTdGFydCA9IHNvdXJjZS5pbmRleE9mKCdbZnJhZ21lbnRdJyk7XG4gICAgaWYgKHZlcnRleFN0YXJ0ID09PSAtMSB8fCBmcmFnbWVudFN0YXJ0ID09PSAtMSlcbiAgICAgICAgdGhyb3cgJ0Vycm9yOiBNaXNzaW5nIFtmcmFnbWVudF0gYW5kL29yIFt2ZXJ0ZXhdIG1hcmtlcnMgaW4gc2hhZGVyLic7XG5cbiAgICB2YXIgdmVydGV4U291cmNlID0gc291cmNlLnN1YnN0cmluZyh2ZXJ0ZXhTdGFydCArIDgsIGZyYWdtZW50U3RhcnQpO1xuICAgIHZhciBmcmFnbWVudFNvdXJjZSA9IHNvdXJjZS5zdWJzdHJpbmcoZnJhZ21lbnRTdGFydCArIDEwKTtcbiAgICB0aGlzLmNvbXBpbGUodmVydGV4U291cmNlLCBmcmFnbWVudFNvdXJjZSk7XG59O1xuXG5TaGFkZXIucHJvdG90eXBlLmNvbXBpbGUgPSBmdW5jdGlvbih2ZXJ0ZXhTb3VyY2UsIGZyYWdtZW50U291cmNlKSB7XG4gICAgdmFyIHByb2dyYW0gPSBnbC5jcmVhdGVQcm9ncmFtKCk7XG4gICAgZ2wuYXR0YWNoU2hhZGVyKHByb2dyYW0sIGNvbXBpbGVTaGFkZXIoZ2wuVkVSVEVYX1NIQURFUiwgdmVydGV4U291cmNlKSk7XG4gICAgZ2wuYXR0YWNoU2hhZGVyKHByb2dyYW0sIGNvbXBpbGVTaGFkZXIoZ2wuRlJBR01FTlRfU0hBREVSLCBmcmFnbWVudFNvdXJjZSkpO1xuICAgIGdsLmxpbmtQcm9ncmFtKHByb2dyYW0pO1xuICAgIGlmICghZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlcihwcm9ncmFtLCBnbC5MSU5LX1NUQVRVUykpXG4gICAgICAgIHRocm93ICdFcnJvcjogU2hhZGVyIGxpbmtpbmcgZXJyb3I6ICcgKyBnbC5nZXRQcm9ncmFtSW5mb0xvZyhwcm9ncmFtKTtcblxuICAgIHZhciBzb3VyY2VzID0gdmVydGV4U291cmNlICsgZnJhZ21lbnRTb3VyY2U7XG4gICAgdmFyIGxpbmVzID0gc291cmNlcy5tYXRjaCgvKHVuaWZvcm18YXR0cmlidXRlKVxccytcXHcrXFxzK1xcdysoPz07KS9nKTtcbiAgICB0aGlzLnVuaWZvcm1zID0ge307XG4gICAgdGhpcy5hdHRyaWJ1dGVzID0ge307XG4gICAgdGhpcy5zYW1wbGVycyA9IFtdO1xuICAgIGZvciAodmFyIGkgaW4gbGluZXMpIHtcbiAgICAgICAgdmFyIHRva2VucyA9IGxpbmVzW2ldLnNwbGl0KCcgJyk7XG4gICAgICAgIHZhciBuYW1lID0gdG9rZW5zWzJdO1xuICAgICAgICB2YXIgdHlwZSA9IHRva2Vuc1sxXTtcbiAgICAgICAgc3dpdGNoICh0b2tlbnNbMF0pIHtcbiAgICAgICAgICAgIGNhc2UgJ2F0dHJpYnV0ZSc6XG4gICAgICAgICAgICAgICAgdmFyIGF0dHJpYnV0ZUxvY2F0aW9uID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24ocHJvZ3JhbSwgbmFtZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5hdHRyaWJ1dGVzW25hbWVdID0gYXR0cmlidXRlTG9jYXRpb247XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd1bmlmb3JtJzpcbiAgICAgICAgICAgICAgICB2YXIgbG9jYXRpb24gPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24ocHJvZ3JhbSwgbmFtZSk7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdzYW1wbGVyMkQnKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNhbXBsZXJzLnB1c2gobG9jYXRpb24pO1xuICAgICAgICAgICAgICAgIHRoaXMudW5pZm9ybXNbbmFtZV0gPSBsb2NhdGlvbjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhyb3cgJ0ludmFsaWQgYXR0cmlidXRlL3VuaWZvcm0gZm91bmQ6ICcgKyB0b2tlbnNbMV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5wcm9ncmFtID0gcHJvZ3JhbTtcbn07XG5cblNoYWRlci5wcm90b3R5cGUudXNlID0gZnVuY3Rpb24oKSB7XG4gICAgZ2wudXNlUHJvZ3JhbSh0aGlzLnByb2dyYW0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gU2hhZGVyO1xufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIxWWlaNVNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9nbC9zaGFkZXIuanNcIixcIi9nbFwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbnZhciBBdGxhcyA9IHJlcXVpcmUoJ2dsL2F0bGFzJyk7XG5cbnZhciBTcHJpdGVzID0gZnVuY3Rpb24gKHdpZHRoLCBoZWlnaHQsIHNwcml0ZUNvdW50KSB7XG4gICAgdGhpcy5zcHJpdGVDb21wb25lbnRzID0gOTsgLy8geHl6LCB1diwgcmdiYVxuICAgIHRoaXMuc3ByaXRlVmVydGljZXMgPSA2O1xuICAgIHRoaXMubWF4U3ByaXRlcyA9IHNwcml0ZUNvdW50IHx8IDEyODtcbiAgICB0aGlzLnRleHR1cmVzID0gbmV3IEF0bGFzKHdpZHRoLCBoZWlnaHQpO1xuICAgIHRoaXMuc3ByaXRlQ291bnQgPSAwO1xuICAgIHRoaXMuZGF0YSA9IG5ldyBGbG9hdDMyQXJyYXkodGhpcy5tYXhTcHJpdGVzICogdGhpcy5zcHJpdGVDb21wb25lbnRzICogdGhpcy5zcHJpdGVWZXJ0aWNlcyk7XG4gICAgdGhpcy52ZXJ0ZXhCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcbiAgICB0aGlzLmRpcnR5ID0gZmFsc2U7XG59O1xuXG5TcHJpdGVzLnByb3RvdHlwZS5kcmF3U3ByaXRlID0gZnVuY3Rpb24gKHRleHR1cmUsIHgsIHksIHdpZHRoLCBoZWlnaHQsIHIsIGcsIGIsIGEpIHtcbiAgICB2YXIgeiA9IDA7XG4gICAgdmFyIGRhdGEgPSB0aGlzLmRhdGE7XG4gICAgdmFyIG9mZnNldCA9IHRoaXMuc3ByaXRlQ291bnQgKiB0aGlzLnNwcml0ZVZlcnRpY2VzICogdGhpcy5zcHJpdGVDb21wb25lbnRzO1xuICAgIHZhciB0ID0gdGhpcy50ZXh0dXJlcy5nZXRTdWJUZXh0dXJlKHRleHR1cmUpO1xuICAgIHdpZHRoID0gd2lkdGggfHwgdC53aWR0aDtcbiAgICBoZWlnaHQgPSBoZWlnaHQgfHwgdC5oZWlnaHQ7XG5cbiAgICBkYXRhW29mZnNldCArIDBdID0geDtcbiAgICBkYXRhW29mZnNldCArIDFdID0geTtcbiAgICBkYXRhW29mZnNldCArIDJdID0gejtcbiAgICBkYXRhW29mZnNldCArIDNdID0gdC5zMTtcbiAgICBkYXRhW29mZnNldCArIDRdID0gdC50MTtcbiAgICBkYXRhW29mZnNldCArIDVdID0gcjtcbiAgICBkYXRhW29mZnNldCArIDZdID0gZztcbiAgICBkYXRhW29mZnNldCArIDddID0gYjtcbiAgICBkYXRhW29mZnNldCArIDhdID0gYTtcblxuICAgIGRhdGFbb2Zmc2V0ICsgOV0gPSB4ICsgd2lkdGg7XG4gICAgZGF0YVtvZmZzZXQgKyAxMF0gPSB5O1xuICAgIGRhdGFbb2Zmc2V0ICsgMTFdID0gejtcbiAgICBkYXRhW29mZnNldCArIDEyXSA9IHQuczI7XG4gICAgZGF0YVtvZmZzZXQgKyAxM10gPSB0LnQxO1xuICAgIGRhdGFbb2Zmc2V0ICsgMTRdID0gcjtcbiAgICBkYXRhW29mZnNldCArIDE1XSA9IGc7XG4gICAgZGF0YVtvZmZzZXQgKyAxNl0gPSBiO1xuICAgIGRhdGFbb2Zmc2V0ICsgMTddID0gYTtcblxuICAgIGRhdGFbb2Zmc2V0ICsgMThdID0geCArIHdpZHRoO1xuICAgIGRhdGFbb2Zmc2V0ICsgMTldID0geSArIGhlaWdodDtcbiAgICBkYXRhW29mZnNldCArIDIwXSA9IHo7XG4gICAgZGF0YVtvZmZzZXQgKyAyMV0gPSB0LnMyO1xuICAgIGRhdGFbb2Zmc2V0ICsgMjJdID0gdC50MjtcbiAgICBkYXRhW29mZnNldCArIDIzXSA9IHI7XG4gICAgZGF0YVtvZmZzZXQgKyAyNF0gPSBnO1xuICAgIGRhdGFbb2Zmc2V0ICsgMjVdID0gYjtcbiAgICBkYXRhW29mZnNldCArIDI2XSA9IGE7XG5cbiAgICBkYXRhW29mZnNldCArIDI3XSA9IHggKyB3aWR0aDtcbiAgICBkYXRhW29mZnNldCArIDI4XSA9IHkgKyBoZWlnaHQ7XG4gICAgZGF0YVtvZmZzZXQgKyAyOV0gPSB6O1xuICAgIGRhdGFbb2Zmc2V0ICsgMzBdID0gdC5zMjtcbiAgICBkYXRhW29mZnNldCArIDMxXSA9IHQudDI7XG4gICAgZGF0YVtvZmZzZXQgKyAzMl0gPSByO1xuICAgIGRhdGFbb2Zmc2V0ICsgMzNdID0gZztcbiAgICBkYXRhW29mZnNldCArIDM0XSA9IGI7XG4gICAgZGF0YVtvZmZzZXQgKyAzNV0gPSBhO1xuXG4gICAgZGF0YVtvZmZzZXQgKyAzNl0gPSB4O1xuICAgIGRhdGFbb2Zmc2V0ICsgMzddID0geSArIGhlaWdodDtcbiAgICBkYXRhW29mZnNldCArIDM4XSA9IHo7XG4gICAgZGF0YVtvZmZzZXQgKyAzOV0gPSB0LnMxO1xuICAgIGRhdGFbb2Zmc2V0ICsgNDBdID0gdC50MjtcbiAgICBkYXRhW29mZnNldCArIDQxXSA9IHI7XG4gICAgZGF0YVtvZmZzZXQgKyA0Ml0gPSBnO1xuICAgIGRhdGFbb2Zmc2V0ICsgNDNdID0gYjtcbiAgICBkYXRhW29mZnNldCArIDQ0XSA9IGE7XG5cbiAgICBkYXRhW29mZnNldCArIDQ1XSA9IHg7XG4gICAgZGF0YVtvZmZzZXQgKyA0Nl0gPSB5O1xuICAgIGRhdGFbb2Zmc2V0ICsgNDddID0gejtcbiAgICBkYXRhW29mZnNldCArIDQ4XSA9IHQuczE7XG4gICAgZGF0YVtvZmZzZXQgKyA0OV0gPSB0LnQxO1xuICAgIGRhdGFbb2Zmc2V0ICsgNTBdID0gcjtcbiAgICBkYXRhW29mZnNldCArIDUxXSA9IGc7XG4gICAgZGF0YVtvZmZzZXQgKyA1Ml0gPSBiO1xuICAgIGRhdGFbb2Zmc2V0ICsgNTNdID0gYTtcblxuICAgIHRoaXMuZGlydHkgPSB0cnVlO1xuICAgIHJldHVybiB0aGlzLnNwcml0ZUNvdW50Kys7XG59O1xuXG5TcHJpdGVzLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnNwcml0ZUNvdW50ID0gMDtcbn07XG5cblNwcml0ZXMucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uIChzaGFkZXIsIHAsIGZpcnN0U3ByaXRlLCBzcHJpdGVDb3VudCkge1xuICAgIGlmICh0aGlzLnNwcml0ZUNvdW50IDw9IDApXG4gICAgICAgIHJldHVybjtcblxuICAgIGZpcnN0U3ByaXRlID0gZmlyc3RTcHJpdGUgfHwgMDtcbiAgICBzcHJpdGVDb3VudCA9IHNwcml0ZUNvdW50IHx8IHRoaXMuc3ByaXRlQ291bnQ7XG5cbiAgICBzaGFkZXIudXNlKCk7XG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHRoaXMudmVydGV4QnVmZmVyKTtcblxuICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHNoYWRlci5hdHRyaWJ1dGVzLnZlcnRleEF0dHJpYnV0ZSk7XG4gICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoc2hhZGVyLmF0dHJpYnV0ZXMudGV4Q29vcmRzQXR0cmlidXRlKTtcbiAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShzaGFkZXIuYXR0cmlidXRlcy5jb2xvcnNBdHRyaWJ1dGUpO1xuXG4gICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihzaGFkZXIuYXR0cmlidXRlcy52ZXJ0ZXhBdHRyaWJ1dGUsIDMsIGdsLkZMT0FULCBmYWxzZSwgMzYsIDApO1xuICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIoc2hhZGVyLmF0dHJpYnV0ZXMudGV4Q29vcmRzQXR0cmlidXRlLCAyLCBnbC5GTE9BVCwgZmFsc2UsIDM2LCAxMik7XG4gICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihzaGFkZXIuYXR0cmlidXRlcy5jb2xvcnNBdHRyaWJ1dGUsIDQsIGdsLkZMT0FULCBmYWxzZSwgMzYsIDIwKTtcblxuICAgIGdsLnVuaWZvcm1NYXRyaXg0ZnYoc2hhZGVyLnVuaWZvcm1zLnByb2plY3Rpb25NYXRyaXgsIGZhbHNlLCBwKTtcblxuICAgIGlmICh0aGlzLmRpcnR5KSB7XG4gICAgICAgIGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLmRhdGEsIGdsLlNUQVRJQ19EUkFXKTtcbiAgICAgICAgdGhpcy5kaXJ0eSA9IGZhbHNlO1xuICAgIH1cbiAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCB0aGlzLnRleHR1cmVzLnRleHR1cmUuaWQpO1xuICAgIGdsLmRyYXdBcnJheXMoZ2wuVFJJQU5HTEVTLCBmaXJzdFNwcml0ZSAqIHRoaXMuc3ByaXRlVmVydGljZXMsIHNwcml0ZUNvdW50ICogdGhpcy5zcHJpdGVWZXJ0aWNlcyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBTcHJpdGVzO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIjFZaVo1U1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2dsL3Nwcml0ZXMuanNcIixcIi9nbFwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbnZhciB1dGlscyA9IHJlcXVpcmUoJ3V0aWxzJyk7XG5cbnZhciBUZXh0dXJlID0gZnVuY3Rpb24oZmlsZSwgb3B0aW9ucykge1xuICAgIHZhciBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICBvcHRpb25zLmFscGhhID0gb3B0aW9ucy5hbHBoYSB8fCBmYWxzZTtcbiAgICBvcHRpb25zLmZvcm1hdCA9IG9wdGlvbnMuZm9ybWF0IHx8IGdsLlJHQkE7XG4gICAgb3B0aW9ucy50eXBlID0gb3B0aW9ucy50eXBlIHx8IGdsLlVOU0lHTkVEX0JZVEU7XG4gICAgb3B0aW9ucy5maWx0ZXIgPSBvcHRpb25zLmZpbHRlciB8fCBnbC5MSU5FQVI7XG4gICAgb3B0aW9ucy53cmFwID0gb3B0aW9ucy53cmFwIHx8IGdsLkNMQU1QX1RPX0VER0U7XG5cbiAgICB0aGlzLmlkID0gZ2wuY3JlYXRlVGV4dHVyZSgpO1xuICAgIHRoaXMud2lkdGggPSBvcHRpb25zLndpZHRoIHx8IGZpbGUucmVhZFVJbnQzMigpO1xuICAgIHRoaXMuaGVpZ2h0ID0gb3B0aW9ucy5oZWlnaHQgfHwgZmlsZS5yZWFkVUludDMyKCk7XG4gICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGhpcy5pZCk7XG4gICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01BR19GSUxURVIsIG9wdGlvbnMuZmlsdGVyKTtcbiAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgb3B0aW9ucy5maWx0ZXIpO1xuICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9XUkFQX1MsIG9wdGlvbnMud3JhcCk7XG4gICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfVCwgb3B0aW9ucy53cmFwKTtcblxuICAgIGlmIChmaWxlKSB7XG4gICAgICAgIGlmICghb3B0aW9ucy5wYWxldHRlKVxuICAgICAgICAgICAgdGhyb3cgJ0Vycm9yOiBObyBwYWxldHRlIHNwZWNpZmllZCBpbiBvcHRpb25zLic7XG5cbiAgICAgICAgdmFyIHBpeGVscyA9IG9wdGlvbnMucGFsZXR0ZS51bnBhY2soZmlsZSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsIG9wdGlvbnMuYWxwaGEpO1xuICAgICAgICB2YXIgbnBvdCA9IHV0aWxzLmlzUG93ZXJPZjIodGhpcy53aWR0aCkgJiYgdXRpbHMuaXNQb3dlck9mMih0aGlzLmhlaWdodCk7XG4gICAgICAgIGlmICghbnBvdCAmJiBvcHRpb25zLndyYXAgPT09IGdsLlJFUEVBVCkge1xuICAgICAgICAgICAgdmFyIG5ld1dpZHRoID0gdXRpbHMubmV4dFBvd2VyT2YyKHRoaXMud2lkdGgpO1xuICAgICAgICAgICAgdmFyIG5ld0hlaWdodCA9IHV0aWxzLm5leHRQb3dlck9mMih0aGlzLmhlaWdodCk7XG4gICAgICAgICAgICBwaXhlbHMgPSB0aGlzLnJlc2FtcGxlKHBpeGVscywgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsIG5ld1dpZHRoLCBuZXdIZWlnaHQpO1xuICAgICAgICAgICAgZ2wudGV4SW1hZ2UyRChnbC5URVhUVVJFXzJELCAwLCBvcHRpb25zLmZvcm1hdCwgbmV3V2lkdGgsIG5ld0hlaWdodCxcbiAgICAgICAgICAgICAgICAwLCBvcHRpb25zLmZvcm1hdCwgb3B0aW9ucy50eXBlLCBwaXhlbHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZ2wudGV4SW1hZ2UyRChnbC5URVhUVVJFXzJELCAwLCBvcHRpb25zLmZvcm1hdCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsXG4gICAgICAgICAgICAgICAgMCwgb3B0aW9ucy5mb3JtYXQsIG9wdGlvbnMudHlwZSwgcGl4ZWxzKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGdsLnRleEltYWdlMkQoZ2wuVEVYVFVSRV8yRCwgMCwgb3B0aW9ucy5mb3JtYXQsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LFxuICAgICAgICAgICAgMCwgb3B0aW9ucy5mb3JtYXQsIG9wdGlvbnMudHlwZSwgbnVsbCk7XG4gICAgfVxufTtcblxuVGV4dHVyZS5wcm90b3R5cGUuZHJhd1RvID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgdmFyIHYgPSBnbC5nZXRQYXJhbWV0ZXIoZ2wuVklFV1BPUlQpO1xuXG4gICAgLyogU2V0dXAgc2hhcmVkIGJ1ZmZlcnMgZm9yIHJlbmRlciB0YXJnZXQgZHJhd2luZyAqL1xuICAgIGlmICh0eXBlb2YgVGV4dHVyZS5mcmFtZUJ1ZmZlciA9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBUZXh0dXJlLmZyYW1lQnVmZmVyID0gZ2wuY3JlYXRlRnJhbWVidWZmZXIoKTtcbiAgICAgICAgVGV4dHVyZS5yZW5kZXJCdWZmZXIgPSBnbC5jcmVhdGVSZW5kZXJidWZmZXIoKTtcbiAgICB9XG5cbiAgICBnbC5iaW5kRnJhbWVidWZmZXIoZ2wuRlJBTUVCVUZGRVIsIFRleHR1cmUuZnJhbWVCdWZmZXIpO1xuICAgIGdsLmJpbmRSZW5kZXJidWZmZXIoZ2wuUkVOREVSQlVGRkVSLCBUZXh0dXJlLnJlbmRlckJ1ZmZlcik7XG4gICAgaWYgKHRoaXMud2lkdGggIT0gVGV4dHVyZS5yZW5kZXJCdWZmZXIud2lkdGggfHwgdGhpcy5oZWlnaHQgIT0gVGV4dHVyZS5yZW5kZXJCdWZmZXIuaGVpZ2h0KSB7XG4gICAgICAgIFRleHR1cmUucmVuZGVyQnVmZmVyLndpZHRoID0gdGhpcy53aWR0aDtcbiAgICAgICAgVGV4dHVyZS5yZW5kZXJCdWZmZXIuaGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XG4gICAgICAgIGdsLnJlbmRlcmJ1ZmZlclN0b3JhZ2UoZ2wuUkVOREVSQlVGRkVSLCBnbC5ERVBUSF9DT01QT05FTlQxNiwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICAgIH1cblxuXG4gICAgZ2wuZnJhbWVidWZmZXJUZXh0dXJlMkQoZ2wuRlJBTUVCVUZGRVIsIGdsLkNPTE9SX0FUVEFDSE1FTlQwLCBnbC5URVhUVVJFXzJELCB0aGlzLmlkLCAwKTtcbiAgICBnbC5mcmFtZWJ1ZmZlclJlbmRlcmJ1ZmZlcihnbC5GUkFNRUJVRkZFUiwgZ2wuREVQVEhfQVRUQUNITUVOVCwgZ2wuUkVOREVSQlVGRkVSLCBUZXh0dXJlLnJlbmRlckJ1ZmZlcik7XG4gICAgZ2wudmlld3BvcnQoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuXG4gICAgdmFyIHByb2plY3Rpb25NYXRyaXggPSBtYXQ0Lm9ydGhvKG1hdDQuY3JlYXRlKCksIDAsIHRoaXMud2lkdGgsIDAsIHRoaXMuaGVpZ2h0LCAtMTAsIDEwKTtcbiAgICBjYWxsYmFjayhwcm9qZWN0aW9uTWF0cml4KTtcblxuICAgIGdsLmJpbmRGcmFtZWJ1ZmZlcihnbC5GUkFNRUJVRkZFUiwgbnVsbCk7XG4gICAgZ2wuYmluZFJlbmRlcmJ1ZmZlcihnbC5SRU5ERVJCVUZGRVIsIG51bGwpO1xuICAgIGdsLnZpZXdwb3J0KHZbMF0sIHZbMV0sIHZbMl0sIHZbM10pO1xufTtcblxuVGV4dHVyZS5wcm90b3R5cGUucmVzYW1wbGUgPSBmdW5jdGlvbihwaXhlbHMsIHdpZHRoLCBoZWlnaHQsIG5ld1dpZHRoLCBuZXdIZWlnaHQpIHtcbiAgICB2YXIgc3JjID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgc3JjLndpZHRoID0gd2lkdGg7XG4gICAgc3JjLmhlaWdodCA9IGhlaWdodDtcbiAgICB2YXIgY29udGV4dCA9IHNyYy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIHZhciBpbWFnZURhdGEgPSBjb250ZXh0LmNyZWF0ZUltYWdlRGF0YSh3aWR0aCwgaGVpZ2h0KTtcbiAgICBpbWFnZURhdGEuZGF0YS5zZXQocGl4ZWxzKTtcbiAgICBjb250ZXh0LnB1dEltYWdlRGF0YShpbWFnZURhdGEsIDAsIDApO1xuXG4gICAgdmFyIGRlc3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICBkZXN0LndpZHRoID0gbmV3V2lkdGg7XG4gICAgZGVzdC5oZWlnaHQgPSBuZXdIZWlnaHQ7XG4gICAgY29udGV4dCA9IGRlc3QuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICBjb250ZXh0LmRyYXdJbWFnZShzcmMsIDAsIDAsIGRlc3Qud2lkdGgsIGRlc3QuaGVpZ2h0KTtcbiAgICB2YXIgaW1hZ2UgPSBjb250ZXh0LmdldEltYWdlRGF0YSgwLCAwLCBkZXN0LndpZHRoLCBkZXN0LmhlaWdodCk7XG4gICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGltYWdlLmRhdGEpO1xufTtcblxuVGV4dHVyZS5wcm90b3R5cGUuYmluZCA9IGZ1bmN0aW9uKHVuaXQpIHtcbiAgICBnbC5hY3RpdmVUZXh0dXJlKGdsLlRFWFRVUkUwICsgKHVuaXQgfHwgMCkpO1xuICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRoaXMuaWQpO1xufTtcblxuVGV4dHVyZS5wcm90b3R5cGUudW5iaW5kID0gZnVuY3Rpb24odW5pdCkge1xuICAgIGdsLmFjdGl2ZVRleHR1cmUoZ2wuVEVYVFVSRTAgKyAodW5pdCB8fCAwKSk7XG4gICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgbnVsbCk7XG59O1xuXG5UZXh0dXJlLnByb3RvdHlwZS5hc0RhdGFVcmwgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZnJhbWVidWZmZXIgPSBnbC5jcmVhdGVGcmFtZWJ1ZmZlcigpO1xuICAgIGdsLmJpbmRGcmFtZWJ1ZmZlcihnbC5GUkFNRUJVRkZFUiwgZnJhbWVidWZmZXIpO1xuICAgIGdsLmZyYW1lYnVmZmVyVGV4dHVyZTJEKGdsLkZSQU1FQlVGRkVSLCBnbC5DT0xPUl9BVFRBQ0hNRU5UMCwgZ2wuVEVYVFVSRV8yRCwgdGhpcy5pZCwgMCk7XG5cbiAgICB2YXIgd2lkdGggPSB0aGlzLndpZHRoO1xuICAgIHZhciBoZWlnaHQgPSB0aGlzLmhlaWdodDtcblxuICAgIC8vIFJlYWQgdGhlIGNvbnRlbnRzIG9mIHRoZSBmcmFtZWJ1ZmZlclxuICAgIHZhciBkYXRhID0gbmV3IFVpbnQ4QXJyYXkod2lkdGggKiBoZWlnaHQgKiA0KTtcbiAgICBnbC5yZWFkUGl4ZWxzKDAsIDAsIHdpZHRoLCBoZWlnaHQsIGdsLlJHQkEsIGdsLlVOU0lHTkVEX0JZVEUsIGRhdGEpO1xuICAgIGdsLmRlbGV0ZUZyYW1lYnVmZmVyKGZyYW1lYnVmZmVyKTtcblxuICAgIC8vIENyZWF0ZSBhIDJEIGNhbnZhcyB0byBzdG9yZSB0aGUgcmVzdWx0XG4gICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgIGNhbnZhcy53aWR0aCA9IHdpZHRoO1xuICAgIGNhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgdmFyIGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgIC8vIENvcHkgdGhlIHBpeGVscyB0byBhIDJEIGNhbnZhc1xuICAgIHZhciBpbWFnZURhdGEgPSBjb250ZXh0LmNyZWF0ZUltYWdlRGF0YSh3aWR0aCwgaGVpZ2h0KTtcbiAgICBpbWFnZURhdGEuZGF0YS5zZXQoZGF0YSk7XG4gICAgY29udGV4dC5wdXRJbWFnZURhdGEoaW1hZ2VEYXRhLCAwLCAwKTtcbiAgICByZXR1cm4gY2FudmFzLnRvRGF0YVVSTCgpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gVGV4dHVyZTtcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiMVlpWjVTXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvZ2wvdGV4dHVyZS5qc1wiLFwiL2dsXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuXG52YXIga2V5cyA9IHsgbGVmdDogMzcsIHJpZ2h0OiAzOSwgdXA6IDM4LCBkb3duOiA0MCwgYTogNjUsIHo6IDkwIH07XG5cbnZhciBJbnB1dCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMubGVmdCA9IGZhbHNlO1xuICAgIHRoaXMucmlnaHQgPSBmYWxzZTtcbiAgICB0aGlzLnVwID0gZmFsc2U7XG4gICAgdGhpcy5kb3duID0gZmFsc2U7XG4gICAgdGhpcy5mbHlVcCA9IGZhbHNlO1xuICAgIHRoaXMuZmx5RG93biA9IGZhbHNlO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLFxuICAgICAgICBmdW5jdGlvbihldmVudCkgeyBzZWxmLmtleURvd24oZXZlbnQpOyB9LCB0cnVlKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsXG4gICAgICAgIGZ1bmN0aW9uKGV2ZW50KSB7IHNlbGYua2V5VXAoZXZlbnQpOyB9LCB0cnVlKTtcbn07XG5cbklucHV0LnByb3RvdHlwZS5rZXlEb3duID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcbiAgICAgICAgY2FzZSBrZXlzLmxlZnQ6IHRoaXMubGVmdCA9IHRydWU7IGJyZWFrO1xuICAgICAgICBjYXNlIGtleXMucmlnaHQ6IHRoaXMucmlnaHQgPSB0cnVlOyBicmVhaztcbiAgICAgICAgY2FzZSBrZXlzLnVwOiB0aGlzLnVwID0gdHJ1ZTsgYnJlYWs7XG4gICAgICAgIGNhc2Uga2V5cy5kb3duOiB0aGlzLmRvd24gPSB0cnVlOyBicmVhaztcbiAgICAgICAgY2FzZSBrZXlzLmE6IHRoaXMuZmx5VXAgPSB0cnVlOyBicmVhaztcbiAgICAgICAgY2FzZSBrZXlzLno6IHRoaXMuZmx5RG93biA9IHRydWU7IGJyZWFrO1xuICAgIH1cbn07XG5cbklucHV0LnByb3RvdHlwZS5rZXlVcCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgc3dpdGNoIChldmVudC5rZXlDb2RlKSB7XG4gICAgICAgIGNhc2Uga2V5cy5sZWZ0OiB0aGlzLmxlZnQgPSBmYWxzZTsgYnJlYWs7XG4gICAgICAgIGNhc2Uga2V5cy5yaWdodDogdGhpcy5yaWdodCA9IGZhbHNlOyBicmVhaztcbiAgICAgICAgY2FzZSBrZXlzLnVwOiB0aGlzLnVwID0gZmFsc2U7IGJyZWFrO1xuICAgICAgICBjYXNlIGtleXMuZG93bjogdGhpcy5kb3duID0gZmFsc2U7IGJyZWFrO1xuICAgICAgICBjYXNlIGtleXMuYTogdGhpcy5mbHlVcCA9IGZhbHNlOyBicmVhaztcbiAgICAgICAgY2FzZSBrZXlzLno6IHRoaXMuZmx5RG93biA9IGZhbHNlOyBicmVhaztcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBJbnB1dDtcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiMVlpWjVTXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvaW5wdXQuanNcIixcIi9cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgZ2wtbWF0cml4IC0gSGlnaCBwZXJmb3JtYW5jZSBtYXRyaXggYW5kIHZlY3RvciBvcGVyYXRpb25zXG4gKiBAYXV0aG9yIEJyYW5kb24gSm9uZXNcbiAqIEBhdXRob3IgQ29saW4gTWFjS2VuemllIElWXG4gKiBAdmVyc2lvbiAyLjIuMVxuICovXG4vKiBDb3B5cmlnaHQgKGMpIDIwMTMsIEJyYW5kb24gSm9uZXMsIENvbGluIE1hY0tlbnppZSBJVi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cblxuIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXG4gYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuXG4gKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uXG4gYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG5cbiBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIiBBTkRcbiBBTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkVcbiBESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUlxuIEFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFU1xuIChJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUztcbiBMT1NTIE9GIFVTRSwgREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT05cbiBBTlkgVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuIChJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTXG4gU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuICovXG4oZnVuY3Rpb24oZSl7XCJ1c2Ugc3RyaWN0XCI7dmFyIHQ9e307dHlwZW9mIGV4cG9ydHM9PVwidW5kZWZpbmVkXCI/dHlwZW9mIGRlZmluZT09XCJmdW5jdGlvblwiJiZ0eXBlb2YgZGVmaW5lLmFtZD09XCJvYmplY3RcIiYmZGVmaW5lLmFtZD8odC5leHBvcnRzPXt9LGRlZmluZShmdW5jdGlvbigpe3JldHVybiB0LmV4cG9ydHN9KSk6dC5leHBvcnRzPXR5cGVvZiB3aW5kb3chPVwidW5kZWZpbmVkXCI/d2luZG93OmU6dC5leHBvcnRzPWV4cG9ydHMsZnVuY3Rpb24oZSl7aWYoIXQpdmFyIHQ9MWUtNjtpZighbil2YXIgbj10eXBlb2YgRmxvYXQzMkFycmF5IT1cInVuZGVmaW5lZFwiP0Zsb2F0MzJBcnJheTpBcnJheTtpZighcil2YXIgcj1NYXRoLnJhbmRvbTt2YXIgaT17fTtpLnNldE1hdHJpeEFycmF5VHlwZT1mdW5jdGlvbihlKXtuPWV9LHR5cGVvZiBlIT1cInVuZGVmaW5lZFwiJiYoZS5nbE1hdHJpeD1pKTt2YXIgcz1NYXRoLlBJLzE4MDtpLnRvUmFkaWFuPWZ1bmN0aW9uKGUpe3JldHVybiBlKnN9O3ZhciBvPXt9O28uY3JlYXRlPWZ1bmN0aW9uKCl7dmFyIGU9bmV3IG4oMik7cmV0dXJuIGVbMF09MCxlWzFdPTAsZX0sby5jbG9uZT1mdW5jdGlvbihlKXt2YXIgdD1uZXcgbigyKTtyZXR1cm4gdFswXT1lWzBdLHRbMV09ZVsxXSx0fSxvLmZyb21WYWx1ZXM9ZnVuY3Rpb24oZSx0KXt2YXIgcj1uZXcgbigyKTtyZXR1cm4gclswXT1lLHJbMV09dCxyfSxvLmNvcHk9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gZVswXT10WzBdLGVbMV09dFsxXSxlfSxvLnNldD1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dCxlWzFdPW4sZX0sby5hZGQ9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0rblswXSxlWzFdPXRbMV0rblsxXSxlfSxvLnN1YnRyYWN0PWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT10WzBdLW5bMF0sZVsxXT10WzFdLW5bMV0sZX0sby5zdWI9by5zdWJ0cmFjdCxvLm11bHRpcGx5PWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT10WzBdKm5bMF0sZVsxXT10WzFdKm5bMV0sZX0sby5tdWw9by5tdWx0aXBseSxvLmRpdmlkZT1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXS9uWzBdLGVbMV09dFsxXS9uWzFdLGV9LG8uZGl2PW8uZGl2aWRlLG8ubWluPWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT1NYXRoLm1pbih0WzBdLG5bMF0pLGVbMV09TWF0aC5taW4odFsxXSxuWzFdKSxlfSxvLm1heD1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09TWF0aC5tYXgodFswXSxuWzBdKSxlWzFdPU1hdGgubWF4KHRbMV0sblsxXSksZX0sby5zY2FsZT1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXSpuLGVbMV09dFsxXSpuLGV9LG8uc2NhbGVBbmRBZGQ9ZnVuY3Rpb24oZSx0LG4scil7cmV0dXJuIGVbMF09dFswXStuWzBdKnIsZVsxXT10WzFdK25bMV0qcixlfSxvLmRpc3RhbmNlPWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXS1lWzBdLHI9dFsxXS1lWzFdO3JldHVybiBNYXRoLnNxcnQobipuK3Iqcil9LG8uZGlzdD1vLmRpc3RhbmNlLG8uc3F1YXJlZERpc3RhbmNlPWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXS1lWzBdLHI9dFsxXS1lWzFdO3JldHVybiBuKm4rcipyfSxvLnNxckRpc3Q9by5zcXVhcmVkRGlzdGFuY2Usby5sZW5ndGg9ZnVuY3Rpb24oZSl7dmFyIHQ9ZVswXSxuPWVbMV07cmV0dXJuIE1hdGguc3FydCh0KnQrbipuKX0sby5sZW49by5sZW5ndGgsby5zcXVhcmVkTGVuZ3RoPWZ1bmN0aW9uKGUpe3ZhciB0PWVbMF0sbj1lWzFdO3JldHVybiB0KnQrbipufSxvLnNxckxlbj1vLnNxdWFyZWRMZW5ndGgsby5uZWdhdGU9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gZVswXT0tdFswXSxlWzFdPS10WzFdLGV9LG8ubm9ybWFsaXplPWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSxyPXRbMV0saT1uKm4rcipyO3JldHVybiBpPjAmJihpPTEvTWF0aC5zcXJ0KGkpLGVbMF09dFswXSppLGVbMV09dFsxXSppKSxlfSxvLmRvdD1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdKnRbMF0rZVsxXSp0WzFdfSxvLmNyb3NzPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdKm5bMV0tdFsxXSpuWzBdO3JldHVybiBlWzBdPWVbMV09MCxlWzJdPXIsZX0sby5sZXJwPWZ1bmN0aW9uKGUsdCxuLHIpe3ZhciBpPXRbMF0scz10WzFdO3JldHVybiBlWzBdPWkrciooblswXS1pKSxlWzFdPXMrciooblsxXS1zKSxlfSxvLnJhbmRvbT1mdW5jdGlvbihlLHQpe3Q9dHx8MTt2YXIgbj1yKCkqMipNYXRoLlBJO3JldHVybiBlWzBdPU1hdGguY29zKG4pKnQsZVsxXT1NYXRoLnNpbihuKSp0LGV9LG8udHJhbnNmb3JtTWF0Mj1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV07cmV0dXJuIGVbMF09blswXSpyK25bMl0qaSxlWzFdPW5bMV0qcituWzNdKmksZX0sby50cmFuc2Zvcm1NYXQyZD1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV07cmV0dXJuIGVbMF09blswXSpyK25bMl0qaStuWzRdLGVbMV09blsxXSpyK25bM10qaStuWzVdLGV9LG8udHJhbnNmb3JtTWF0Mz1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV07cmV0dXJuIGVbMF09blswXSpyK25bM10qaStuWzZdLGVbMV09blsxXSpyK25bNF0qaStuWzddLGV9LG8udHJhbnNmb3JtTWF0ND1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV07cmV0dXJuIGVbMF09blswXSpyK25bNF0qaStuWzEyXSxlWzFdPW5bMV0qcituWzVdKmkrblsxM10sZX0sby5mb3JFYWNoPWZ1bmN0aW9uKCl7dmFyIGU9by5jcmVhdGUoKTtyZXR1cm4gZnVuY3Rpb24odCxuLHIsaSxzLG8pe3ZhciB1LGE7bnx8KG49Mikscnx8KHI9MCksaT9hPU1hdGgubWluKGkqbityLHQubGVuZ3RoKTphPXQubGVuZ3RoO2Zvcih1PXI7dTxhO3UrPW4pZVswXT10W3VdLGVbMV09dFt1KzFdLHMoZSxlLG8pLHRbdV09ZVswXSx0W3UrMV09ZVsxXTtyZXR1cm4gdH19KCksby5zdHI9ZnVuY3Rpb24oZSl7cmV0dXJuXCJ2ZWMyKFwiK2VbMF0rXCIsIFwiK2VbMV0rXCIpXCJ9LHR5cGVvZiBlIT1cInVuZGVmaW5lZFwiJiYoZS52ZWMyPW8pO3ZhciB1PXt9O3UuY3JlYXRlPWZ1bmN0aW9uKCl7dmFyIGU9bmV3IG4oMyk7cmV0dXJuIGVbMF09MCxlWzFdPTAsZVsyXT0wLGV9LHUuY2xvbmU9ZnVuY3Rpb24oZSl7dmFyIHQ9bmV3IG4oMyk7cmV0dXJuIHRbMF09ZVswXSx0WzFdPWVbMV0sdFsyXT1lWzJdLHR9LHUuZnJvbVZhbHVlcz1mdW5jdGlvbihlLHQscil7dmFyIGk9bmV3IG4oMyk7cmV0dXJuIGlbMF09ZSxpWzFdPXQsaVsyXT1yLGl9LHUuY29weT1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdPXRbMF0sZVsxXT10WzFdLGVbMl09dFsyXSxlfSx1LnNldD1mdW5jdGlvbihlLHQsbixyKXtyZXR1cm4gZVswXT10LGVbMV09bixlWzJdPXIsZX0sdS5hZGQ9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0rblswXSxlWzFdPXRbMV0rblsxXSxlWzJdPXRbMl0rblsyXSxlfSx1LnN1YnRyYWN0PWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT10WzBdLW5bMF0sZVsxXT10WzFdLW5bMV0sZVsyXT10WzJdLW5bMl0sZX0sdS5zdWI9dS5zdWJ0cmFjdCx1Lm11bHRpcGx5PWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT10WzBdKm5bMF0sZVsxXT10WzFdKm5bMV0sZVsyXT10WzJdKm5bMl0sZX0sdS5tdWw9dS5tdWx0aXBseSx1LmRpdmlkZT1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXS9uWzBdLGVbMV09dFsxXS9uWzFdLGVbMl09dFsyXS9uWzJdLGV9LHUuZGl2PXUuZGl2aWRlLHUubWluPWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT1NYXRoLm1pbih0WzBdLG5bMF0pLGVbMV09TWF0aC5taW4odFsxXSxuWzFdKSxlWzJdPU1hdGgubWluKHRbMl0sblsyXSksZX0sdS5tYXg9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPU1hdGgubWF4KHRbMF0sblswXSksZVsxXT1NYXRoLm1heCh0WzFdLG5bMV0pLGVbMl09TWF0aC5tYXgodFsyXSxuWzJdKSxlfSx1LnNjYWxlPWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT10WzBdKm4sZVsxXT10WzFdKm4sZVsyXT10WzJdKm4sZX0sdS5zY2FsZUFuZEFkZD1mdW5jdGlvbihlLHQsbixyKXtyZXR1cm4gZVswXT10WzBdK25bMF0qcixlWzFdPXRbMV0rblsxXSpyLGVbMl09dFsyXStuWzJdKnIsZX0sdS5kaXN0YW5jZT1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0tZVswXSxyPXRbMV0tZVsxXSxpPXRbMl0tZVsyXTtyZXR1cm4gTWF0aC5zcXJ0KG4qbityKnIraSppKX0sdS5kaXN0PXUuZGlzdGFuY2UsdS5zcXVhcmVkRGlzdGFuY2U9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLWVbMF0scj10WzFdLWVbMV0saT10WzJdLWVbMl07cmV0dXJuIG4qbityKnIraSppfSx1LnNxckRpc3Q9dS5zcXVhcmVkRGlzdGFuY2UsdS5sZW5ndGg9ZnVuY3Rpb24oZSl7dmFyIHQ9ZVswXSxuPWVbMV0scj1lWzJdO3JldHVybiBNYXRoLnNxcnQodCp0K24qbityKnIpfSx1Lmxlbj11Lmxlbmd0aCx1LnNxdWFyZWRMZW5ndGg9ZnVuY3Rpb24oZSl7dmFyIHQ9ZVswXSxuPWVbMV0scj1lWzJdO3JldHVybiB0KnQrbipuK3Iqcn0sdS5zcXJMZW49dS5zcXVhcmVkTGVuZ3RoLHUubmVnYXRlPWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF09LXRbMF0sZVsxXT0tdFsxXSxlWzJdPS10WzJdLGV9LHUubm9ybWFsaXplPWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSxyPXRbMV0saT10WzJdLHM9bipuK3IqcitpKmk7cmV0dXJuIHM+MCYmKHM9MS9NYXRoLnNxcnQocyksZVswXT10WzBdKnMsZVsxXT10WzFdKnMsZVsyXT10WzJdKnMpLGV9LHUuZG90PWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF0qdFswXStlWzFdKnRbMV0rZVsyXSp0WzJdfSx1LmNyb3NzPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz1uWzBdLHU9blsxXSxhPW5bMl07cmV0dXJuIGVbMF09aSphLXMqdSxlWzFdPXMqby1yKmEsZVsyXT1yKnUtaSpvLGV9LHUubGVycD1mdW5jdGlvbihlLHQsbixyKXt2YXIgaT10WzBdLHM9dFsxXSxvPXRbMl07cmV0dXJuIGVbMF09aStyKihuWzBdLWkpLGVbMV09cytyKihuWzFdLXMpLGVbMl09bytyKihuWzJdLW8pLGV9LHUucmFuZG9tPWZ1bmN0aW9uKGUsdCl7dD10fHwxO3ZhciBuPXIoKSoyKk1hdGguUEksaT1yKCkqMi0xLHM9TWF0aC5zcXJ0KDEtaSppKSp0O3JldHVybiBlWzBdPU1hdGguY29zKG4pKnMsZVsxXT1NYXRoLnNpbihuKSpzLGVbMl09aSp0LGV9LHUudHJhbnNmb3JtTWF0ND1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdO3JldHVybiBlWzBdPW5bMF0qcituWzRdKmkrbls4XSpzK25bMTJdLGVbMV09blsxXSpyK25bNV0qaStuWzldKnMrblsxM10sZVsyXT1uWzJdKnIrbls2XSppK25bMTBdKnMrblsxNF0sZX0sdS50cmFuc2Zvcm1NYXQzPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl07cmV0dXJuIGVbMF09cipuWzBdK2kqblszXStzKm5bNl0sZVsxXT1yKm5bMV0raSpuWzRdK3Mqbls3XSxlWzJdPXIqblsyXStpKm5bNV0rcypuWzhdLGV9LHUudHJhbnNmb3JtUXVhdD1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89blswXSx1PW5bMV0sYT1uWzJdLGY9blszXSxsPWYqcit1KnMtYSppLGM9ZippK2Eqci1vKnMsaD1mKnMrbyppLXUqcixwPS1vKnItdSppLWEqcztyZXR1cm4gZVswXT1sKmYrcCotbytjKi1hLWgqLXUsZVsxXT1jKmYrcCotdStoKi1vLWwqLWEsZVsyXT1oKmYrcCotYStsKi11LWMqLW8sZX0sdS5yb3RhdGVYPWZ1bmN0aW9uKGUsdCxuLHIpe3ZhciBpPVtdLHM9W107cmV0dXJuIGlbMF09dFswXS1uWzBdLGlbMV09dFsxXS1uWzFdLGlbMl09dFsyXS1uWzJdLHNbMF09aVswXSxzWzFdPWlbMV0qTWF0aC5jb3MociktaVsyXSpNYXRoLnNpbihyKSxzWzJdPWlbMV0qTWF0aC5zaW4ocikraVsyXSpNYXRoLmNvcyhyKSxlWzBdPXNbMF0rblswXSxlWzFdPXNbMV0rblsxXSxlWzJdPXNbMl0rblsyXSxlfSx1LnJvdGF0ZVk9ZnVuY3Rpb24oZSx0LG4scil7dmFyIGk9W10scz1bXTtyZXR1cm4gaVswXT10WzBdLW5bMF0saVsxXT10WzFdLW5bMV0saVsyXT10WzJdLW5bMl0sc1swXT1pWzJdKk1hdGguc2luKHIpK2lbMF0qTWF0aC5jb3Mociksc1sxXT1pWzFdLHNbMl09aVsyXSpNYXRoLmNvcyhyKS1pWzBdKk1hdGguc2luKHIpLGVbMF09c1swXStuWzBdLGVbMV09c1sxXStuWzFdLGVbMl09c1syXStuWzJdLGV9LHUucm90YXRlWj1mdW5jdGlvbihlLHQsbixyKXt2YXIgaT1bXSxzPVtdO3JldHVybiBpWzBdPXRbMF0tblswXSxpWzFdPXRbMV0tblsxXSxpWzJdPXRbMl0tblsyXSxzWzBdPWlbMF0qTWF0aC5jb3MociktaVsxXSpNYXRoLnNpbihyKSxzWzFdPWlbMF0qTWF0aC5zaW4ocikraVsxXSpNYXRoLmNvcyhyKSxzWzJdPWlbMl0sZVswXT1zWzBdK25bMF0sZVsxXT1zWzFdK25bMV0sZVsyXT1zWzJdK25bMl0sZX0sdS5mb3JFYWNoPWZ1bmN0aW9uKCl7dmFyIGU9dS5jcmVhdGUoKTtyZXR1cm4gZnVuY3Rpb24odCxuLHIsaSxzLG8pe3ZhciB1LGE7bnx8KG49Mykscnx8KHI9MCksaT9hPU1hdGgubWluKGkqbityLHQubGVuZ3RoKTphPXQubGVuZ3RoO2Zvcih1PXI7dTxhO3UrPW4pZVswXT10W3VdLGVbMV09dFt1KzFdLGVbMl09dFt1KzJdLHMoZSxlLG8pLHRbdV09ZVswXSx0W3UrMV09ZVsxXSx0W3UrMl09ZVsyXTtyZXR1cm4gdH19KCksdS5zdHI9ZnVuY3Rpb24oZSl7cmV0dXJuXCJ2ZWMzKFwiK2VbMF0rXCIsIFwiK2VbMV0rXCIsIFwiK2VbMl0rXCIpXCJ9LHR5cGVvZiBlIT1cInVuZGVmaW5lZFwiJiYoZS52ZWMzPXUpO3ZhciBhPXt9O2EuY3JlYXRlPWZ1bmN0aW9uKCl7dmFyIGU9bmV3IG4oNCk7cmV0dXJuIGVbMF09MCxlWzFdPTAsZVsyXT0wLGVbM109MCxlfSxhLmNsb25lPWZ1bmN0aW9uKGUpe3ZhciB0PW5ldyBuKDQpO3JldHVybiB0WzBdPWVbMF0sdFsxXT1lWzFdLHRbMl09ZVsyXSx0WzNdPWVbM10sdH0sYS5mcm9tVmFsdWVzPWZ1bmN0aW9uKGUsdCxyLGkpe3ZhciBzPW5ldyBuKDQpO3JldHVybiBzWzBdPWUsc1sxXT10LHNbMl09cixzWzNdPWksc30sYS5jb3B5PWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF09dFswXSxlWzFdPXRbMV0sZVsyXT10WzJdLGVbM109dFszXSxlfSxhLnNldD1mdW5jdGlvbihlLHQsbixyLGkpe3JldHVybiBlWzBdPXQsZVsxXT1uLGVbMl09cixlWzNdPWksZX0sYS5hZGQ9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0rblswXSxlWzFdPXRbMV0rblsxXSxlWzJdPXRbMl0rblsyXSxlWzNdPXRbM10rblszXSxlfSxhLnN1YnRyYWN0PWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT10WzBdLW5bMF0sZVsxXT10WzFdLW5bMV0sZVsyXT10WzJdLW5bMl0sZVszXT10WzNdLW5bM10sZX0sYS5zdWI9YS5zdWJ0cmFjdCxhLm11bHRpcGx5PWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT10WzBdKm5bMF0sZVsxXT10WzFdKm5bMV0sZVsyXT10WzJdKm5bMl0sZVszXT10WzNdKm5bM10sZX0sYS5tdWw9YS5tdWx0aXBseSxhLmRpdmlkZT1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXS9uWzBdLGVbMV09dFsxXS9uWzFdLGVbMl09dFsyXS9uWzJdLGVbM109dFszXS9uWzNdLGV9LGEuZGl2PWEuZGl2aWRlLGEubWluPWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT1NYXRoLm1pbih0WzBdLG5bMF0pLGVbMV09TWF0aC5taW4odFsxXSxuWzFdKSxlWzJdPU1hdGgubWluKHRbMl0sblsyXSksZVszXT1NYXRoLm1pbih0WzNdLG5bM10pLGV9LGEubWF4PWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT1NYXRoLm1heCh0WzBdLG5bMF0pLGVbMV09TWF0aC5tYXgodFsxXSxuWzFdKSxlWzJdPU1hdGgubWF4KHRbMl0sblsyXSksZVszXT1NYXRoLm1heCh0WzNdLG5bM10pLGV9LGEuc2NhbGU9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0qbixlWzFdPXRbMV0qbixlWzJdPXRbMl0qbixlWzNdPXRbM10qbixlfSxhLnNjYWxlQW5kQWRkPWZ1bmN0aW9uKGUsdCxuLHIpe3JldHVybiBlWzBdPXRbMF0rblswXSpyLGVbMV09dFsxXStuWzFdKnIsZVsyXT10WzJdK25bMl0qcixlWzNdPXRbM10rblszXSpyLGV9LGEuZGlzdGFuY2U9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLWVbMF0scj10WzFdLWVbMV0saT10WzJdLWVbMl0scz10WzNdLWVbM107cmV0dXJuIE1hdGguc3FydChuKm4rcipyK2kqaStzKnMpfSxhLmRpc3Q9YS5kaXN0YW5jZSxhLnNxdWFyZWREaXN0YW5jZT1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0tZVswXSxyPXRbMV0tZVsxXSxpPXRbMl0tZVsyXSxzPXRbM10tZVszXTtyZXR1cm4gbipuK3IqcitpKmkrcypzfSxhLnNxckRpc3Q9YS5zcXVhcmVkRGlzdGFuY2UsYS5sZW5ndGg9ZnVuY3Rpb24oZSl7dmFyIHQ9ZVswXSxuPWVbMV0scj1lWzJdLGk9ZVszXTtyZXR1cm4gTWF0aC5zcXJ0KHQqdCtuKm4rcipyK2kqaSl9LGEubGVuPWEubGVuZ3RoLGEuc3F1YXJlZExlbmd0aD1mdW5jdGlvbihlKXt2YXIgdD1lWzBdLG49ZVsxXSxyPWVbMl0saT1lWzNdO3JldHVybiB0KnQrbipuK3IqcitpKml9LGEuc3FyTGVuPWEuc3F1YXJlZExlbmd0aCxhLm5lZ2F0ZT1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdPS10WzBdLGVbMV09LXRbMV0sZVsyXT0tdFsyXSxlWzNdPS10WzNdLGV9LGEubm9ybWFsaXplPWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSxyPXRbMV0saT10WzJdLHM9dFszXSxvPW4qbityKnIraSppK3MqcztyZXR1cm4gbz4wJiYobz0xL01hdGguc3FydChvKSxlWzBdPXRbMF0qbyxlWzFdPXRbMV0qbyxlWzJdPXRbMl0qbyxlWzNdPXRbM10qbyksZX0sYS5kb3Q9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gZVswXSp0WzBdK2VbMV0qdFsxXStlWzJdKnRbMl0rZVszXSp0WzNdfSxhLmxlcnA9ZnVuY3Rpb24oZSx0LG4scil7dmFyIGk9dFswXSxzPXRbMV0sbz10WzJdLHU9dFszXTtyZXR1cm4gZVswXT1pK3IqKG5bMF0taSksZVsxXT1zK3IqKG5bMV0tcyksZVsyXT1vK3IqKG5bMl0tbyksZVszXT11K3IqKG5bM10tdSksZX0sYS5yYW5kb209ZnVuY3Rpb24oZSx0KXtyZXR1cm4gdD10fHwxLGVbMF09cigpLGVbMV09cigpLGVbMl09cigpLGVbM109cigpLGEubm9ybWFsaXplKGUsZSksYS5zY2FsZShlLGUsdCksZX0sYS50cmFuc2Zvcm1NYXQ0PWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz10WzNdO3JldHVybiBlWzBdPW5bMF0qcituWzRdKmkrbls4XSpzK25bMTJdKm8sZVsxXT1uWzFdKnIrbls1XSppK25bOV0qcytuWzEzXSpvLGVbMl09blsyXSpyK25bNl0qaStuWzEwXSpzK25bMTRdKm8sZVszXT1uWzNdKnIrbls3XSppK25bMTFdKnMrblsxNV0qbyxlfSxhLnRyYW5zZm9ybVF1YXQ9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPW5bMF0sdT1uWzFdLGE9blsyXSxmPW5bM10sbD1mKnIrdSpzLWEqaSxjPWYqaSthKnItbypzLGg9ZipzK28qaS11KnIscD0tbypyLXUqaS1hKnM7cmV0dXJuIGVbMF09bCpmK3AqLW8rYyotYS1oKi11LGVbMV09YypmK3AqLXUraCotby1sKi1hLGVbMl09aCpmK3AqLWErbCotdS1jKi1vLGV9LGEuZm9yRWFjaD1mdW5jdGlvbigpe3ZhciBlPWEuY3JlYXRlKCk7cmV0dXJuIGZ1bmN0aW9uKHQsbixyLGkscyxvKXt2YXIgdSxhO258fChuPTQpLHJ8fChyPTApLGk/YT1NYXRoLm1pbihpKm4rcix0Lmxlbmd0aCk6YT10Lmxlbmd0aDtmb3IodT1yO3U8YTt1Kz1uKWVbMF09dFt1XSxlWzFdPXRbdSsxXSxlWzJdPXRbdSsyXSxlWzNdPXRbdSszXSxzKGUsZSxvKSx0W3VdPWVbMF0sdFt1KzFdPWVbMV0sdFt1KzJdPWVbMl0sdFt1KzNdPWVbM107cmV0dXJuIHR9fSgpLGEuc3RyPWZ1bmN0aW9uKGUpe3JldHVyblwidmVjNChcIitlWzBdK1wiLCBcIitlWzFdK1wiLCBcIitlWzJdK1wiLCBcIitlWzNdK1wiKVwifSx0eXBlb2YgZSE9XCJ1bmRlZmluZWRcIiYmKGUudmVjND1hKTt2YXIgZj17fTtmLmNyZWF0ZT1mdW5jdGlvbigpe3ZhciBlPW5ldyBuKDQpO3JldHVybiBlWzBdPTEsZVsxXT0wLGVbMl09MCxlWzNdPTEsZX0sZi5jbG9uZT1mdW5jdGlvbihlKXt2YXIgdD1uZXcgbig0KTtyZXR1cm4gdFswXT1lWzBdLHRbMV09ZVsxXSx0WzJdPWVbMl0sdFszXT1lWzNdLHR9LGYuY29weT1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdPXRbMF0sZVsxXT10WzFdLGVbMl09dFsyXSxlWzNdPXRbM10sZX0sZi5pZGVudGl0eT1mdW5jdGlvbihlKXtyZXR1cm4gZVswXT0xLGVbMV09MCxlWzJdPTAsZVszXT0xLGV9LGYudHJhbnNwb3NlPWZ1bmN0aW9uKGUsdCl7aWYoZT09PXQpe3ZhciBuPXRbMV07ZVsxXT10WzJdLGVbMl09bn1lbHNlIGVbMF09dFswXSxlWzFdPXRbMl0sZVsyXT10WzFdLGVbM109dFszXTtyZXR1cm4gZX0sZi5pbnZlcnQ9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLHI9dFsxXSxpPXRbMl0scz10WzNdLG89bipzLWkqcjtyZXR1cm4gbz8obz0xL28sZVswXT1zKm8sZVsxXT0tcipvLGVbMl09LWkqbyxlWzNdPW4qbyxlKTpudWxsfSxmLmFkam9pbnQ9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdO3JldHVybiBlWzBdPXRbM10sZVsxXT0tdFsxXSxlWzJdPS10WzJdLGVbM109bixlfSxmLmRldGVybWluYW50PWZ1bmN0aW9uKGUpe3JldHVybiBlWzBdKmVbM10tZVsyXSplWzFdfSxmLm11bHRpcGx5PWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz10WzNdLHU9blswXSxhPW5bMV0sZj1uWzJdLGw9blszXTtyZXR1cm4gZVswXT1yKnUrcyphLGVbMV09aSp1K28qYSxlWzJdPXIqZitzKmwsZVszXT1pKmYrbypsLGV9LGYubXVsPWYubXVsdGlwbHksZi5yb3RhdGU9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT1NYXRoLnNpbihuKSxhPU1hdGguY29zKG4pO3JldHVybiBlWzBdPXIqYStzKnUsZVsxXT1pKmErbyp1LGVbMl09ciotdStzKmEsZVszXT1pKi11K28qYSxlfSxmLnNjYWxlPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz10WzNdLHU9blswXSxhPW5bMV07cmV0dXJuIGVbMF09cip1LGVbMV09aSp1LGVbMl09cyphLGVbM109byphLGV9LGYuc3RyPWZ1bmN0aW9uKGUpe3JldHVyblwibWF0MihcIitlWzBdK1wiLCBcIitlWzFdK1wiLCBcIitlWzJdK1wiLCBcIitlWzNdK1wiKVwifSxmLmZyb2I9ZnVuY3Rpb24oZSl7cmV0dXJuIE1hdGguc3FydChNYXRoLnBvdyhlWzBdLDIpK01hdGgucG93KGVbMV0sMikrTWF0aC5wb3coZVsyXSwyKStNYXRoLnBvdyhlWzNdLDIpKX0sZi5MRFU9ZnVuY3Rpb24oZSx0LG4scil7cmV0dXJuIGVbMl09clsyXS9yWzBdLG5bMF09clswXSxuWzFdPXJbMV0sblszXT1yWzNdLWVbMl0qblsxXSxbZSx0LG5dfSx0eXBlb2YgZSE9XCJ1bmRlZmluZWRcIiYmKGUubWF0Mj1mKTt2YXIgbD17fTtsLmNyZWF0ZT1mdW5jdGlvbigpe3ZhciBlPW5ldyBuKDYpO3JldHVybiBlWzBdPTEsZVsxXT0wLGVbMl09MCxlWzNdPTEsZVs0XT0wLGVbNV09MCxlfSxsLmNsb25lPWZ1bmN0aW9uKGUpe3ZhciB0PW5ldyBuKDYpO3JldHVybiB0WzBdPWVbMF0sdFsxXT1lWzFdLHRbMl09ZVsyXSx0WzNdPWVbM10sdFs0XT1lWzRdLHRbNV09ZVs1XSx0fSxsLmNvcHk9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gZVswXT10WzBdLGVbMV09dFsxXSxlWzJdPXRbMl0sZVszXT10WzNdLGVbNF09dFs0XSxlWzVdPXRbNV0sZX0sbC5pZGVudGl0eT1mdW5jdGlvbihlKXtyZXR1cm4gZVswXT0xLGVbMV09MCxlWzJdPTAsZVszXT0xLGVbNF09MCxlWzVdPTAsZX0sbC5pbnZlcnQ9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLHI9dFsxXSxpPXRbMl0scz10WzNdLG89dFs0XSx1PXRbNV0sYT1uKnMtcippO3JldHVybiBhPyhhPTEvYSxlWzBdPXMqYSxlWzFdPS1yKmEsZVsyXT0taSphLGVbM109biphLGVbNF09KGkqdS1zKm8pKmEsZVs1XT0ocipvLW4qdSkqYSxlKTpudWxsfSxsLmRldGVybWluYW50PWZ1bmN0aW9uKGUpe3JldHVybiBlWzBdKmVbM10tZVsxXSplWzJdfSxsLm11bHRpcGx5PWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz10WzNdLHU9dFs0XSxhPXRbNV0sZj1uWzBdLGw9blsxXSxjPW5bMl0saD1uWzNdLHA9bls0XSxkPW5bNV07cmV0dXJuIGVbMF09cipmK3MqbCxlWzFdPWkqZitvKmwsZVsyXT1yKmMrcypoLGVbM109aSpjK28qaCxlWzRdPXIqcCtzKmQrdSxlWzVdPWkqcCtvKmQrYSxlfSxsLm11bD1sLm11bHRpcGx5LGwucm90YXRlPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz10WzNdLHU9dFs0XSxhPXRbNV0sZj1NYXRoLnNpbihuKSxsPU1hdGguY29zKG4pO3JldHVybiBlWzBdPXIqbCtzKmYsZVsxXT1pKmwrbypmLGVbMl09ciotZitzKmwsZVszXT1pKi1mK28qbCxlWzRdPXUsZVs1XT1hLGV9LGwuc2NhbGU9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT10WzRdLGE9dFs1XSxmPW5bMF0sbD1uWzFdO3JldHVybiBlWzBdPXIqZixlWzFdPWkqZixlWzJdPXMqbCxlWzNdPW8qbCxlWzRdPXUsZVs1XT1hLGV9LGwudHJhbnNsYXRlPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz10WzNdLHU9dFs0XSxhPXRbNV0sZj1uWzBdLGw9blsxXTtyZXR1cm4gZVswXT1yLGVbMV09aSxlWzJdPXMsZVszXT1vLGVbNF09cipmK3MqbCt1LGVbNV09aSpmK28qbCthLGV9LGwuc3RyPWZ1bmN0aW9uKGUpe3JldHVyblwibWF0MmQoXCIrZVswXStcIiwgXCIrZVsxXStcIiwgXCIrZVsyXStcIiwgXCIrZVszXStcIiwgXCIrZVs0XStcIiwgXCIrZVs1XStcIilcIn0sbC5mcm9iPWZ1bmN0aW9uKGUpe3JldHVybiBNYXRoLnNxcnQoTWF0aC5wb3coZVswXSwyKStNYXRoLnBvdyhlWzFdLDIpK01hdGgucG93KGVbMl0sMikrTWF0aC5wb3coZVszXSwyKStNYXRoLnBvdyhlWzRdLDIpK01hdGgucG93KGVbNV0sMikrMSl9LHR5cGVvZiBlIT1cInVuZGVmaW5lZFwiJiYoZS5tYXQyZD1sKTt2YXIgYz17fTtjLmNyZWF0ZT1mdW5jdGlvbigpe3ZhciBlPW5ldyBuKDkpO3JldHVybiBlWzBdPTEsZVsxXT0wLGVbMl09MCxlWzNdPTAsZVs0XT0xLGVbNV09MCxlWzZdPTAsZVs3XT0wLGVbOF09MSxlfSxjLmZyb21NYXQ0PWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF09dFswXSxlWzFdPXRbMV0sZVsyXT10WzJdLGVbM109dFs0XSxlWzRdPXRbNV0sZVs1XT10WzZdLGVbNl09dFs4XSxlWzddPXRbOV0sZVs4XT10WzEwXSxlfSxjLmNsb25lPWZ1bmN0aW9uKGUpe3ZhciB0PW5ldyBuKDkpO3JldHVybiB0WzBdPWVbMF0sdFsxXT1lWzFdLHRbMl09ZVsyXSx0WzNdPWVbM10sdFs0XT1lWzRdLHRbNV09ZVs1XSx0WzZdPWVbNl0sdFs3XT1lWzddLHRbOF09ZVs4XSx0fSxjLmNvcHk9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gZVswXT10WzBdLGVbMV09dFsxXSxlWzJdPXRbMl0sZVszXT10WzNdLGVbNF09dFs0XSxlWzVdPXRbNV0sZVs2XT10WzZdLGVbN109dFs3XSxlWzhdPXRbOF0sZX0sYy5pZGVudGl0eT1mdW5jdGlvbihlKXtyZXR1cm4gZVswXT0xLGVbMV09MCxlWzJdPTAsZVszXT0wLGVbNF09MSxlWzVdPTAsZVs2XT0wLGVbN109MCxlWzhdPTEsZX0sYy50cmFuc3Bvc2U9ZnVuY3Rpb24oZSx0KXtpZihlPT09dCl7dmFyIG49dFsxXSxyPXRbMl0saT10WzVdO2VbMV09dFszXSxlWzJdPXRbNl0sZVszXT1uLGVbNV09dFs3XSxlWzZdPXIsZVs3XT1pfWVsc2UgZVswXT10WzBdLGVbMV09dFszXSxlWzJdPXRbNl0sZVszXT10WzFdLGVbNF09dFs0XSxlWzVdPXRbN10sZVs2XT10WzJdLGVbN109dFs1XSxlWzhdPXRbOF07cmV0dXJuIGV9LGMuaW52ZXJ0PWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSxyPXRbMV0saT10WzJdLHM9dFszXSxvPXRbNF0sdT10WzVdLGE9dFs2XSxmPXRbN10sbD10WzhdLGM9bCpvLXUqZixoPS1sKnMrdSphLHA9ZipzLW8qYSxkPW4qYytyKmgraSpwO3JldHVybiBkPyhkPTEvZCxlWzBdPWMqZCxlWzFdPSgtbCpyK2kqZikqZCxlWzJdPSh1KnItaSpvKSpkLGVbM109aCpkLGVbNF09KGwqbi1pKmEpKmQsZVs1XT0oLXUqbitpKnMpKmQsZVs2XT1wKmQsZVs3XT0oLWYqbityKmEpKmQsZVs4XT0obypuLXIqcykqZCxlKTpudWxsfSxjLmFkam9pbnQ9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLHI9dFsxXSxpPXRbMl0scz10WzNdLG89dFs0XSx1PXRbNV0sYT10WzZdLGY9dFs3XSxsPXRbOF07cmV0dXJuIGVbMF09bypsLXUqZixlWzFdPWkqZi1yKmwsZVsyXT1yKnUtaSpvLGVbM109dSphLXMqbCxlWzRdPW4qbC1pKmEsZVs1XT1pKnMtbip1LGVbNl09cypmLW8qYSxlWzddPXIqYS1uKmYsZVs4XT1uKm8tcipzLGV9LGMuZGV0ZXJtaW5hbnQ9ZnVuY3Rpb24oZSl7dmFyIHQ9ZVswXSxuPWVbMV0scj1lWzJdLGk9ZVszXSxzPWVbNF0sbz1lWzVdLHU9ZVs2XSxhPWVbN10sZj1lWzhdO3JldHVybiB0KihmKnMtbyphKStuKigtZippK28qdSkrciooYSppLXMqdSl9LGMubXVsdGlwbHk9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT10WzRdLGE9dFs1XSxmPXRbNl0sbD10WzddLGM9dFs4XSxoPW5bMF0scD1uWzFdLGQ9blsyXSx2PW5bM10sbT1uWzRdLGc9bls1XSx5PW5bNl0sYj1uWzddLHc9bls4XTtyZXR1cm4gZVswXT1oKnIrcCpvK2QqZixlWzFdPWgqaStwKnUrZCpsLGVbMl09aCpzK3AqYStkKmMsZVszXT12KnIrbSpvK2cqZixlWzRdPXYqaSttKnUrZypsLGVbNV09dipzK20qYStnKmMsZVs2XT15KnIrYipvK3cqZixlWzddPXkqaStiKnUrdypsLGVbOF09eSpzK2IqYSt3KmMsZX0sYy5tdWw9Yy5tdWx0aXBseSxjLnRyYW5zbGF0ZT1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PXRbNF0sYT10WzVdLGY9dFs2XSxsPXRbN10sYz10WzhdLGg9blswXSxwPW5bMV07cmV0dXJuIGVbMF09cixlWzFdPWksZVsyXT1zLGVbM109byxlWzRdPXUsZVs1XT1hLGVbNl09aCpyK3AqbytmLGVbN109aCppK3AqdStsLGVbOF09aCpzK3AqYStjLGV9LGMucm90YXRlPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz10WzNdLHU9dFs0XSxhPXRbNV0sZj10WzZdLGw9dFs3XSxjPXRbOF0saD1NYXRoLnNpbihuKSxwPU1hdGguY29zKG4pO3JldHVybiBlWzBdPXAqcitoKm8sZVsxXT1wKmkraCp1LGVbMl09cCpzK2gqYSxlWzNdPXAqby1oKnIsZVs0XT1wKnUtaCppLGVbNV09cCphLWgqcyxlWzZdPWYsZVs3XT1sLGVbOF09YyxlfSxjLnNjYWxlPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj1uWzBdLGk9blsxXTtyZXR1cm4gZVswXT1yKnRbMF0sZVsxXT1yKnRbMV0sZVsyXT1yKnRbMl0sZVszXT1pKnRbM10sZVs0XT1pKnRbNF0sZVs1XT1pKnRbNV0sZVs2XT10WzZdLGVbN109dFs3XSxlWzhdPXRbOF0sZX0sYy5mcm9tTWF0MmQ9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gZVswXT10WzBdLGVbMV09dFsxXSxlWzJdPTAsZVszXT10WzJdLGVbNF09dFszXSxlWzVdPTAsZVs2XT10WzRdLGVbN109dFs1XSxlWzhdPTEsZX0sYy5mcm9tUXVhdD1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9dFsyXSxzPXRbM10sbz1uK24sdT1yK3IsYT1pK2ksZj1uKm8sbD1yKm8sYz1yKnUsaD1pKm8scD1pKnUsZD1pKmEsdj1zKm8sbT1zKnUsZz1zKmE7cmV0dXJuIGVbMF09MS1jLWQsZVszXT1sLWcsZVs2XT1oK20sZVsxXT1sK2csZVs0XT0xLWYtZCxlWzddPXAtdixlWzJdPWgtbSxlWzVdPXArdixlWzhdPTEtZi1jLGV9LGMubm9ybWFsRnJvbU1hdDQ9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLHI9dFsxXSxpPXRbMl0scz10WzNdLG89dFs0XSx1PXRbNV0sYT10WzZdLGY9dFs3XSxsPXRbOF0sYz10WzldLGg9dFsxMF0scD10WzExXSxkPXRbMTJdLHY9dFsxM10sbT10WzE0XSxnPXRbMTVdLHk9bip1LXIqbyxiPW4qYS1pKm8sdz1uKmYtcypvLEU9ciphLWkqdSxTPXIqZi1zKnUseD1pKmYtcyphLFQ9bCp2LWMqZCxOPWwqbS1oKmQsQz1sKmctcCpkLGs9YyptLWgqdixMPWMqZy1wKnYsQT1oKmctcCptLE89eSpBLWIqTCt3KmsrRSpDLVMqTit4KlQ7cmV0dXJuIE8/KE89MS9PLGVbMF09KHUqQS1hKkwrZiprKSpPLGVbMV09KGEqQy1vKkEtZipOKSpPLGVbMl09KG8qTC11KkMrZipUKSpPLGVbM109KGkqTC1yKkEtcyprKSpPLGVbNF09KG4qQS1pKkMrcypOKSpPLGVbNV09KHIqQy1uKkwtcypUKSpPLGVbNl09KHYqeC1tKlMrZypFKSpPLGVbN109KG0qdy1kKngtZypiKSpPLGVbOF09KGQqUy12KncrZyp5KSpPLGUpOm51bGx9LGMuc3RyPWZ1bmN0aW9uKGUpe3JldHVyblwibWF0MyhcIitlWzBdK1wiLCBcIitlWzFdK1wiLCBcIitlWzJdK1wiLCBcIitlWzNdK1wiLCBcIitlWzRdK1wiLCBcIitlWzVdK1wiLCBcIitlWzZdK1wiLCBcIitlWzddK1wiLCBcIitlWzhdK1wiKVwifSxjLmZyb2I9ZnVuY3Rpb24oZSl7cmV0dXJuIE1hdGguc3FydChNYXRoLnBvdyhlWzBdLDIpK01hdGgucG93KGVbMV0sMikrTWF0aC5wb3coZVsyXSwyKStNYXRoLnBvdyhlWzNdLDIpK01hdGgucG93KGVbNF0sMikrTWF0aC5wb3coZVs1XSwyKStNYXRoLnBvdyhlWzZdLDIpK01hdGgucG93KGVbN10sMikrTWF0aC5wb3coZVs4XSwyKSl9LHR5cGVvZiBlIT1cInVuZGVmaW5lZFwiJiYoZS5tYXQzPWMpO3ZhciBoPXt9O2guY3JlYXRlPWZ1bmN0aW9uKCl7dmFyIGU9bmV3IG4oMTYpO3JldHVybiBlWzBdPTEsZVsxXT0wLGVbMl09MCxlWzNdPTAsZVs0XT0wLGVbNV09MSxlWzZdPTAsZVs3XT0wLGVbOF09MCxlWzldPTAsZVsxMF09MSxlWzExXT0wLGVbMTJdPTAsZVsxM109MCxlWzE0XT0wLGVbMTVdPTEsZX0saC5jbG9uZT1mdW5jdGlvbihlKXt2YXIgdD1uZXcgbigxNik7cmV0dXJuIHRbMF09ZVswXSx0WzFdPWVbMV0sdFsyXT1lWzJdLHRbM109ZVszXSx0WzRdPWVbNF0sdFs1XT1lWzVdLHRbNl09ZVs2XSx0WzddPWVbN10sdFs4XT1lWzhdLHRbOV09ZVs5XSx0WzEwXT1lWzEwXSx0WzExXT1lWzExXSx0WzEyXT1lWzEyXSx0WzEzXT1lWzEzXSx0WzE0XT1lWzE0XSx0WzE1XT1lWzE1XSx0fSxoLmNvcHk9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gZVswXT10WzBdLGVbMV09dFsxXSxlWzJdPXRbMl0sZVszXT10WzNdLGVbNF09dFs0XSxlWzVdPXRbNV0sZVs2XT10WzZdLGVbN109dFs3XSxlWzhdPXRbOF0sZVs5XT10WzldLGVbMTBdPXRbMTBdLGVbMTFdPXRbMTFdLGVbMTJdPXRbMTJdLGVbMTNdPXRbMTNdLGVbMTRdPXRbMTRdLGVbMTVdPXRbMTVdLGV9LGguaWRlbnRpdHk9ZnVuY3Rpb24oZSl7cmV0dXJuIGVbMF09MSxlWzFdPTAsZVsyXT0wLGVbM109MCxlWzRdPTAsZVs1XT0xLGVbNl09MCxlWzddPTAsZVs4XT0wLGVbOV09MCxlWzEwXT0xLGVbMTFdPTAsZVsxMl09MCxlWzEzXT0wLGVbMTRdPTAsZVsxNV09MSxlfSxoLnRyYW5zcG9zZT1mdW5jdGlvbihlLHQpe2lmKGU9PT10KXt2YXIgbj10WzFdLHI9dFsyXSxpPXRbM10scz10WzZdLG89dFs3XSx1PXRbMTFdO2VbMV09dFs0XSxlWzJdPXRbOF0sZVszXT10WzEyXSxlWzRdPW4sZVs2XT10WzldLGVbN109dFsxM10sZVs4XT1yLGVbOV09cyxlWzExXT10WzE0XSxlWzEyXT1pLGVbMTNdPW8sZVsxNF09dX1lbHNlIGVbMF09dFswXSxlWzFdPXRbNF0sZVsyXT10WzhdLGVbM109dFsxMl0sZVs0XT10WzFdLGVbNV09dFs1XSxlWzZdPXRbOV0sZVs3XT10WzEzXSxlWzhdPXRbMl0sZVs5XT10WzZdLGVbMTBdPXRbMTBdLGVbMTFdPXRbMTRdLGVbMTJdPXRbM10sZVsxM109dFs3XSxlWzE0XT10WzExXSxlWzE1XT10WzE1XTtyZXR1cm4gZX0saC5pbnZlcnQ9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLHI9dFsxXSxpPXRbMl0scz10WzNdLG89dFs0XSx1PXRbNV0sYT10WzZdLGY9dFs3XSxsPXRbOF0sYz10WzldLGg9dFsxMF0scD10WzExXSxkPXRbMTJdLHY9dFsxM10sbT10WzE0XSxnPXRbMTVdLHk9bip1LXIqbyxiPW4qYS1pKm8sdz1uKmYtcypvLEU9ciphLWkqdSxTPXIqZi1zKnUseD1pKmYtcyphLFQ9bCp2LWMqZCxOPWwqbS1oKmQsQz1sKmctcCpkLGs9YyptLWgqdixMPWMqZy1wKnYsQT1oKmctcCptLE89eSpBLWIqTCt3KmsrRSpDLVMqTit4KlQ7cmV0dXJuIE8/KE89MS9PLGVbMF09KHUqQS1hKkwrZiprKSpPLGVbMV09KGkqTC1yKkEtcyprKSpPLGVbMl09KHYqeC1tKlMrZypFKSpPLGVbM109KGgqUy1jKngtcCpFKSpPLGVbNF09KGEqQy1vKkEtZipOKSpPLGVbNV09KG4qQS1pKkMrcypOKSpPLGVbNl09KG0qdy1kKngtZypiKSpPLGVbN109KGwqeC1oKncrcCpiKSpPLGVbOF09KG8qTC11KkMrZipUKSpPLGVbOV09KHIqQy1uKkwtcypUKSpPLGVbMTBdPShkKlMtdip3K2cqeSkqTyxlWzExXT0oYyp3LWwqUy1wKnkpKk8sZVsxMl09KHUqTi1vKmstYSpUKSpPLGVbMTNdPShuKmstcipOK2kqVCkqTyxlWzE0XT0odipiLWQqRS1tKnkpKk8sZVsxNV09KGwqRS1jKmIraCp5KSpPLGUpOm51bGx9LGguYWRqb2ludD1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9dFsyXSxzPXRbM10sbz10WzRdLHU9dFs1XSxhPXRbNl0sZj10WzddLGw9dFs4XSxjPXRbOV0saD10WzEwXSxwPXRbMTFdLGQ9dFsxMl0sdj10WzEzXSxtPXRbMTRdLGc9dFsxNV07cmV0dXJuIGVbMF09dSooaCpnLXAqbSktYyooYSpnLWYqbSkrdiooYSpwLWYqaCksZVsxXT0tKHIqKGgqZy1wKm0pLWMqKGkqZy1zKm0pK3YqKGkqcC1zKmgpKSxlWzJdPXIqKGEqZy1mKm0pLXUqKGkqZy1zKm0pK3YqKGkqZi1zKmEpLGVbM109LShyKihhKnAtZipoKS11KihpKnAtcypoKStjKihpKmYtcyphKSksZVs0XT0tKG8qKGgqZy1wKm0pLWwqKGEqZy1mKm0pK2QqKGEqcC1mKmgpKSxlWzVdPW4qKGgqZy1wKm0pLWwqKGkqZy1zKm0pK2QqKGkqcC1zKmgpLGVbNl09LShuKihhKmctZiptKS1vKihpKmctcyptKStkKihpKmYtcyphKSksZVs3XT1uKihhKnAtZipoKS1vKihpKnAtcypoKStsKihpKmYtcyphKSxlWzhdPW8qKGMqZy1wKnYpLWwqKHUqZy1mKnYpK2QqKHUqcC1mKmMpLGVbOV09LShuKihjKmctcCp2KS1sKihyKmctcyp2KStkKihyKnAtcypjKSksZVsxMF09bioodSpnLWYqdiktbyoocipnLXMqdikrZCoocipmLXMqdSksZVsxMV09LShuKih1KnAtZipjKS1vKihyKnAtcypjKStsKihyKmYtcyp1KSksZVsxMl09LShvKihjKm0taCp2KS1sKih1Km0tYSp2KStkKih1KmgtYSpjKSksZVsxM109biooYyptLWgqdiktbCoociptLWkqdikrZCoocipoLWkqYyksZVsxNF09LShuKih1Km0tYSp2KS1vKihyKm0taSp2KStkKihyKmEtaSp1KSksZVsxNV09bioodSpoLWEqYyktbyoocipoLWkqYykrbCoociphLWkqdSksZX0saC5kZXRlcm1pbmFudD1mdW5jdGlvbihlKXt2YXIgdD1lWzBdLG49ZVsxXSxyPWVbMl0saT1lWzNdLHM9ZVs0XSxvPWVbNV0sdT1lWzZdLGE9ZVs3XSxmPWVbOF0sbD1lWzldLGM9ZVsxMF0saD1lWzExXSxwPWVbMTJdLGQ9ZVsxM10sdj1lWzE0XSxtPWVbMTVdLGc9dCpvLW4qcyx5PXQqdS1yKnMsYj10KmEtaSpzLHc9bip1LXIqbyxFPW4qYS1pKm8sUz1yKmEtaSp1LHg9ZipkLWwqcCxUPWYqdi1jKnAsTj1mKm0taCpwLEM9bCp2LWMqZCxrPWwqbS1oKmQsTD1jKm0taCp2O3JldHVybiBnKkwteSprK2IqQyt3Kk4tRSpUK1MqeH0saC5tdWx0aXBseT1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PXRbNF0sYT10WzVdLGY9dFs2XSxsPXRbN10sYz10WzhdLGg9dFs5XSxwPXRbMTBdLGQ9dFsxMV0sdj10WzEyXSxtPXRbMTNdLGc9dFsxNF0seT10WzE1XSxiPW5bMF0sdz1uWzFdLEU9blsyXSxTPW5bM107cmV0dXJuIGVbMF09YipyK3cqdStFKmMrUyp2LGVbMV09YippK3cqYStFKmgrUyptLGVbMl09YipzK3cqZitFKnArUypnLGVbM109YipvK3cqbCtFKmQrUyp5LGI9bls0XSx3PW5bNV0sRT1uWzZdLFM9bls3XSxlWzRdPWIqcit3KnUrRSpjK1MqdixlWzVdPWIqaSt3KmErRSpoK1MqbSxlWzZdPWIqcyt3KmYrRSpwK1MqZyxlWzddPWIqbyt3KmwrRSpkK1MqeSxiPW5bOF0sdz1uWzldLEU9blsxMF0sUz1uWzExXSxlWzhdPWIqcit3KnUrRSpjK1MqdixlWzldPWIqaSt3KmErRSpoK1MqbSxlWzEwXT1iKnMrdypmK0UqcCtTKmcsZVsxMV09YipvK3cqbCtFKmQrUyp5LGI9blsxMl0sdz1uWzEzXSxFPW5bMTRdLFM9blsxNV0sZVsxMl09YipyK3cqdStFKmMrUyp2LGVbMTNdPWIqaSt3KmErRSpoK1MqbSxlWzE0XT1iKnMrdypmK0UqcCtTKmcsZVsxNV09YipvK3cqbCtFKmQrUyp5LGV9LGgubXVsPWgubXVsdGlwbHksaC50cmFuc2xhdGU9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPW5bMF0saT1uWzFdLHM9blsyXSxvLHUsYSxmLGwsYyxoLHAsZCx2LG0sZztyZXR1cm4gdD09PWU/KGVbMTJdPXRbMF0qcit0WzRdKmkrdFs4XSpzK3RbMTJdLGVbMTNdPXRbMV0qcit0WzVdKmkrdFs5XSpzK3RbMTNdLGVbMTRdPXRbMl0qcit0WzZdKmkrdFsxMF0qcyt0WzE0XSxlWzE1XT10WzNdKnIrdFs3XSppK3RbMTFdKnMrdFsxNV0pOihvPXRbMF0sdT10WzFdLGE9dFsyXSxmPXRbM10sbD10WzRdLGM9dFs1XSxoPXRbNl0scD10WzddLGQ9dFs4XSx2PXRbOV0sbT10WzEwXSxnPXRbMTFdLGVbMF09byxlWzFdPXUsZVsyXT1hLGVbM109ZixlWzRdPWwsZVs1XT1jLGVbNl09aCxlWzddPXAsZVs4XT1kLGVbOV09dixlWzEwXT1tLGVbMTFdPWcsZVsxMl09bypyK2wqaStkKnMrdFsxMl0sZVsxM109dSpyK2MqaSt2KnMrdFsxM10sZVsxNF09YSpyK2gqaSttKnMrdFsxNF0sZVsxNV09ZipyK3AqaStnKnMrdFsxNV0pLGV9LGguc2NhbGU9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPW5bMF0saT1uWzFdLHM9blsyXTtyZXR1cm4gZVswXT10WzBdKnIsZVsxXT10WzFdKnIsZVsyXT10WzJdKnIsZVszXT10WzNdKnIsZVs0XT10WzRdKmksZVs1XT10WzVdKmksZVs2XT10WzZdKmksZVs3XT10WzddKmksZVs4XT10WzhdKnMsZVs5XT10WzldKnMsZVsxMF09dFsxMF0qcyxlWzExXT10WzExXSpzLGVbMTJdPXRbMTJdLGVbMTNdPXRbMTNdLGVbMTRdPXRbMTRdLGVbMTVdPXRbMTVdLGV9LGgucm90YXRlPWZ1bmN0aW9uKGUsbixyLGkpe3ZhciBzPWlbMF0sbz1pWzFdLHU9aVsyXSxhPU1hdGguc3FydChzKnMrbypvK3UqdSksZixsLGMsaCxwLGQsdixtLGcseSxiLHcsRSxTLHgsVCxOLEMsayxMLEEsTyxNLF87cmV0dXJuIE1hdGguYWJzKGEpPHQ/bnVsbDooYT0xL2Escyo9YSxvKj1hLHUqPWEsZj1NYXRoLnNpbihyKSxsPU1hdGguY29zKHIpLGM9MS1sLGg9blswXSxwPW5bMV0sZD1uWzJdLHY9blszXSxtPW5bNF0sZz1uWzVdLHk9bls2XSxiPW5bN10sdz1uWzhdLEU9bls5XSxTPW5bMTBdLHg9blsxMV0sVD1zKnMqYytsLE49bypzKmMrdSpmLEM9dSpzKmMtbypmLGs9cypvKmMtdSpmLEw9bypvKmMrbCxBPXUqbypjK3MqZixPPXMqdSpjK28qZixNPW8qdSpjLXMqZixfPXUqdSpjK2wsZVswXT1oKlQrbSpOK3cqQyxlWzFdPXAqVCtnKk4rRSpDLGVbMl09ZCpUK3kqTitTKkMsZVszXT12KlQrYipOK3gqQyxlWzRdPWgqayttKkwrdypBLGVbNV09cCprK2cqTCtFKkEsZVs2XT1kKmsreSpMK1MqQSxlWzddPXYqaytiKkwreCpBLGVbOF09aCpPK20qTSt3Kl8sZVs5XT1wKk8rZypNK0UqXyxlWzEwXT1kKk8reSpNK1MqXyxlWzExXT12Kk8rYipNK3gqXyxuIT09ZSYmKGVbMTJdPW5bMTJdLGVbMTNdPW5bMTNdLGVbMTRdPW5bMTRdLGVbMTVdPW5bMTVdKSxlKX0saC5yb3RhdGVYPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj1NYXRoLnNpbihuKSxpPU1hdGguY29zKG4pLHM9dFs0XSxvPXRbNV0sdT10WzZdLGE9dFs3XSxmPXRbOF0sbD10WzldLGM9dFsxMF0saD10WzExXTtyZXR1cm4gdCE9PWUmJihlWzBdPXRbMF0sZVsxXT10WzFdLGVbMl09dFsyXSxlWzNdPXRbM10sZVsxMl09dFsxMl0sZVsxM109dFsxM10sZVsxNF09dFsxNF0sZVsxNV09dFsxNV0pLGVbNF09cyppK2YqcixlWzVdPW8qaStsKnIsZVs2XT11KmkrYypyLGVbN109YSppK2gqcixlWzhdPWYqaS1zKnIsZVs5XT1sKmktbypyLGVbMTBdPWMqaS11KnIsZVsxMV09aCppLWEqcixlfSxoLnJvdGF0ZVk9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPU1hdGguc2luKG4pLGk9TWF0aC5jb3Mobikscz10WzBdLG89dFsxXSx1PXRbMl0sYT10WzNdLGY9dFs4XSxsPXRbOV0sYz10WzEwXSxoPXRbMTFdO3JldHVybiB0IT09ZSYmKGVbNF09dFs0XSxlWzVdPXRbNV0sZVs2XT10WzZdLGVbN109dFs3XSxlWzEyXT10WzEyXSxlWzEzXT10WzEzXSxlWzE0XT10WzE0XSxlWzE1XT10WzE1XSksZVswXT1zKmktZipyLGVbMV09byppLWwqcixlWzJdPXUqaS1jKnIsZVszXT1hKmktaCpyLGVbOF09cypyK2YqaSxlWzldPW8qcitsKmksZVsxMF09dSpyK2MqaSxlWzExXT1hKnIraCppLGV9LGgucm90YXRlWj1mdW5jdGlvbihlLHQsbil7dmFyIHI9TWF0aC5zaW4obiksaT1NYXRoLmNvcyhuKSxzPXRbMF0sbz10WzFdLHU9dFsyXSxhPXRbM10sZj10WzRdLGw9dFs1XSxjPXRbNl0saD10WzddO3JldHVybiB0IT09ZSYmKGVbOF09dFs4XSxlWzldPXRbOV0sZVsxMF09dFsxMF0sZVsxMV09dFsxMV0sZVsxMl09dFsxMl0sZVsxM109dFsxM10sZVsxNF09dFsxNF0sZVsxNV09dFsxNV0pLGVbMF09cyppK2YqcixlWzFdPW8qaStsKnIsZVsyXT11KmkrYypyLGVbM109YSppK2gqcixlWzRdPWYqaS1zKnIsZVs1XT1sKmktbypyLGVbNl09YyppLXUqcixlWzddPWgqaS1hKnIsZX0saC5mcm9tUm90YXRpb25UcmFuc2xhdGlvbj1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PXIrcixhPWkraSxmPXMrcyxsPXIqdSxjPXIqYSxoPXIqZixwPWkqYSxkPWkqZix2PXMqZixtPW8qdSxnPW8qYSx5PW8qZjtyZXR1cm4gZVswXT0xLShwK3YpLGVbMV09Yyt5LGVbMl09aC1nLGVbM109MCxlWzRdPWMteSxlWzVdPTEtKGwrdiksZVs2XT1kK20sZVs3XT0wLGVbOF09aCtnLGVbOV09ZC1tLGVbMTBdPTEtKGwrcCksZVsxMV09MCxlWzEyXT1uWzBdLGVbMTNdPW5bMV0sZVsxNF09blsyXSxlWzE1XT0xLGV9LGguZnJvbVF1YXQ9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLHI9dFsxXSxpPXRbMl0scz10WzNdLG89bituLHU9cityLGE9aStpLGY9bipvLGw9cipvLGM9cip1LGg9aSpvLHA9aSp1LGQ9aSphLHY9cypvLG09cyp1LGc9cyphO3JldHVybiBlWzBdPTEtYy1kLGVbMV09bCtnLGVbMl09aC1tLGVbM109MCxlWzRdPWwtZyxlWzVdPTEtZi1kLGVbNl09cCt2LGVbN109MCxlWzhdPWgrbSxlWzldPXAtdixlWzEwXT0xLWYtYyxlWzExXT0wLGVbMTJdPTAsZVsxM109MCxlWzE0XT0wLGVbMTVdPTEsZX0saC5mcnVzdHVtPWZ1bmN0aW9uKGUsdCxuLHIsaSxzLG8pe3ZhciB1PTEvKG4tdCksYT0xLyhpLXIpLGY9MS8ocy1vKTtyZXR1cm4gZVswXT1zKjIqdSxlWzFdPTAsZVsyXT0wLGVbM109MCxlWzRdPTAsZVs1XT1zKjIqYSxlWzZdPTAsZVs3XT0wLGVbOF09KG4rdCkqdSxlWzldPShpK3IpKmEsZVsxMF09KG8rcykqZixlWzExXT0tMSxlWzEyXT0wLGVbMTNdPTAsZVsxNF09bypzKjIqZixlWzE1XT0wLGV9LGgucGVyc3BlY3RpdmU9ZnVuY3Rpb24oZSx0LG4scixpKXt2YXIgcz0xL01hdGgudGFuKHQvMiksbz0xLyhyLWkpO3JldHVybiBlWzBdPXMvbixlWzFdPTAsZVsyXT0wLGVbM109MCxlWzRdPTAsZVs1XT1zLGVbNl09MCxlWzddPTAsZVs4XT0wLGVbOV09MCxlWzEwXT0oaStyKSpvLGVbMTFdPS0xLGVbMTJdPTAsZVsxM109MCxlWzE0XT0yKmkqcipvLGVbMTVdPTAsZX0saC5vcnRobz1mdW5jdGlvbihlLHQsbixyLGkscyxvKXt2YXIgdT0xLyh0LW4pLGE9MS8oci1pKSxmPTEvKHMtbyk7cmV0dXJuIGVbMF09LTIqdSxlWzFdPTAsZVsyXT0wLGVbM109MCxlWzRdPTAsZVs1XT0tMiphLGVbNl09MCxlWzddPTAsZVs4XT0wLGVbOV09MCxlWzEwXT0yKmYsZVsxMV09MCxlWzEyXT0odCtuKSp1LGVbMTNdPShpK3IpKmEsZVsxNF09KG8rcykqZixlWzE1XT0xLGV9LGgubG9va0F0PWZ1bmN0aW9uKGUsbixyLGkpe3ZhciBzLG8sdSxhLGYsbCxjLHAsZCx2LG09blswXSxnPW5bMV0seT1uWzJdLGI9aVswXSx3PWlbMV0sRT1pWzJdLFM9clswXSx4PXJbMV0sVD1yWzJdO3JldHVybiBNYXRoLmFicyhtLVMpPHQmJk1hdGguYWJzKGcteCk8dCYmTWF0aC5hYnMoeS1UKTx0P2guaWRlbnRpdHkoZSk6KGM9bS1TLHA9Zy14LGQ9eS1ULHY9MS9NYXRoLnNxcnQoYypjK3AqcCtkKmQpLGMqPXYscCo9dixkKj12LHM9dypkLUUqcCxvPUUqYy1iKmQsdT1iKnAtdypjLHY9TWF0aC5zcXJ0KHMqcytvKm8rdSp1KSx2Pyh2PTEvdixzKj12LG8qPXYsdSo9dik6KHM9MCxvPTAsdT0wKSxhPXAqdS1kKm8sZj1kKnMtYyp1LGw9YypvLXAqcyx2PU1hdGguc3FydChhKmErZipmK2wqbCksdj8odj0xL3YsYSo9dixmKj12LGwqPXYpOihhPTAsZj0wLGw9MCksZVswXT1zLGVbMV09YSxlWzJdPWMsZVszXT0wLGVbNF09byxlWzVdPWYsZVs2XT1wLGVbN109MCxlWzhdPXUsZVs5XT1sLGVbMTBdPWQsZVsxMV09MCxlWzEyXT0tKHMqbStvKmcrdSp5KSxlWzEzXT0tKGEqbStmKmcrbCp5KSxlWzE0XT0tKGMqbStwKmcrZCp5KSxlWzE1XT0xLGUpfSxoLnN0cj1mdW5jdGlvbihlKXtyZXR1cm5cIm1hdDQoXCIrZVswXStcIiwgXCIrZVsxXStcIiwgXCIrZVsyXStcIiwgXCIrZVszXStcIiwgXCIrZVs0XStcIiwgXCIrZVs1XStcIiwgXCIrZVs2XStcIiwgXCIrZVs3XStcIiwgXCIrZVs4XStcIiwgXCIrZVs5XStcIiwgXCIrZVsxMF0rXCIsIFwiK2VbMTFdK1wiLCBcIitlWzEyXStcIiwgXCIrZVsxM10rXCIsIFwiK2VbMTRdK1wiLCBcIitlWzE1XStcIilcIn0saC5mcm9iPWZ1bmN0aW9uKGUpe3JldHVybiBNYXRoLnNxcnQoTWF0aC5wb3coZVswXSwyKStNYXRoLnBvdyhlWzFdLDIpK01hdGgucG93KGVbMl0sMikrTWF0aC5wb3coZVszXSwyKStNYXRoLnBvdyhlWzRdLDIpK01hdGgucG93KGVbNV0sMikrTWF0aC5wb3coZVs2XSwyKStNYXRoLnBvdyhlWzZdLDIpK01hdGgucG93KGVbN10sMikrTWF0aC5wb3coZVs4XSwyKStNYXRoLnBvdyhlWzldLDIpK01hdGgucG93KGVbMTBdLDIpK01hdGgucG93KGVbMTFdLDIpK01hdGgucG93KGVbMTJdLDIpK01hdGgucG93KGVbMTNdLDIpK01hdGgucG93KGVbMTRdLDIpK01hdGgucG93KGVbMTVdLDIpKX0sdHlwZW9mIGUhPVwidW5kZWZpbmVkXCImJihlLm1hdDQ9aCk7dmFyIHA9e307cC5jcmVhdGU9ZnVuY3Rpb24oKXt2YXIgZT1uZXcgbig0KTtyZXR1cm4gZVswXT0wLGVbMV09MCxlWzJdPTAsZVszXT0xLGV9LHAucm90YXRpb25Ubz1mdW5jdGlvbigpe3ZhciBlPXUuY3JlYXRlKCksdD11LmZyb21WYWx1ZXMoMSwwLDApLG49dS5mcm9tVmFsdWVzKDAsMSwwKTtyZXR1cm4gZnVuY3Rpb24ocixpLHMpe3ZhciBvPXUuZG90KGkscyk7cmV0dXJuIG88LTAuOTk5OTk5Pyh1LmNyb3NzKGUsdCxpKSx1Lmxlbmd0aChlKTwxZS02JiZ1LmNyb3NzKGUsbixpKSx1Lm5vcm1hbGl6ZShlLGUpLHAuc2V0QXhpc0FuZ2xlKHIsZSxNYXRoLlBJKSxyKTpvPi45OTk5OTk/KHJbMF09MCxyWzFdPTAsclsyXT0wLHJbM109MSxyKToodS5jcm9zcyhlLGkscyksclswXT1lWzBdLHJbMV09ZVsxXSxyWzJdPWVbMl0sclszXT0xK28scC5ub3JtYWxpemUocixyKSl9fSgpLHAuc2V0QXhlcz1mdW5jdGlvbigpe3ZhciBlPWMuY3JlYXRlKCk7cmV0dXJuIGZ1bmN0aW9uKHQsbixyLGkpe3JldHVybiBlWzBdPXJbMF0sZVszXT1yWzFdLGVbNl09clsyXSxlWzFdPWlbMF0sZVs0XT1pWzFdLGVbN109aVsyXSxlWzJdPS1uWzBdLGVbNV09LW5bMV0sZVs4XT0tblsyXSxwLm5vcm1hbGl6ZSh0LHAuZnJvbU1hdDModCxlKSl9fSgpLHAuY2xvbmU9YS5jbG9uZSxwLmZyb21WYWx1ZXM9YS5mcm9tVmFsdWVzLHAuY29weT1hLmNvcHkscC5zZXQ9YS5zZXQscC5pZGVudGl0eT1mdW5jdGlvbihlKXtyZXR1cm4gZVswXT0wLGVbMV09MCxlWzJdPTAsZVszXT0xLGV9LHAuc2V0QXhpc0FuZ2xlPWZ1bmN0aW9uKGUsdCxuKXtuKj0uNTt2YXIgcj1NYXRoLnNpbihuKTtyZXR1cm4gZVswXT1yKnRbMF0sZVsxXT1yKnRbMV0sZVsyXT1yKnRbMl0sZVszXT1NYXRoLmNvcyhuKSxlfSxwLmFkZD1hLmFkZCxwLm11bHRpcGx5PWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz10WzNdLHU9blswXSxhPW5bMV0sZj1uWzJdLGw9blszXTtyZXR1cm4gZVswXT1yKmwrbyp1K2kqZi1zKmEsZVsxXT1pKmwrbyphK3MqdS1yKmYsZVsyXT1zKmwrbypmK3IqYS1pKnUsZVszXT1vKmwtcip1LWkqYS1zKmYsZX0scC5tdWw9cC5tdWx0aXBseSxwLnNjYWxlPWEuc2NhbGUscC5yb3RhdGVYPWZ1bmN0aW9uKGUsdCxuKXtuKj0uNTt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz10WzNdLHU9TWF0aC5zaW4obiksYT1NYXRoLmNvcyhuKTtyZXR1cm4gZVswXT1yKmErbyp1LGVbMV09aSphK3MqdSxlWzJdPXMqYS1pKnUsZVszXT1vKmEtcip1LGV9LHAucm90YXRlWT1mdW5jdGlvbihlLHQsbil7bio9LjU7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PU1hdGguc2luKG4pLGE9TWF0aC5jb3Mobik7cmV0dXJuIGVbMF09ciphLXMqdSxlWzFdPWkqYStvKnUsZVsyXT1zKmErcip1LGVbM109byphLWkqdSxlfSxwLnJvdGF0ZVo9ZnVuY3Rpb24oZSx0LG4pe24qPS41O3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT1NYXRoLnNpbihuKSxhPU1hdGguY29zKG4pO3JldHVybiBlWzBdPXIqYStpKnUsZVsxXT1pKmEtcip1LGVbMl09cyphK28qdSxlWzNdPW8qYS1zKnUsZX0scC5jYWxjdWxhdGVXPWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSxyPXRbMV0saT10WzJdO3JldHVybiBlWzBdPW4sZVsxXT1yLGVbMl09aSxlWzNdPS1NYXRoLnNxcnQoTWF0aC5hYnMoMS1uKm4tcipyLWkqaSkpLGV9LHAuZG90PWEuZG90LHAubGVycD1hLmxlcnAscC5zbGVycD1mdW5jdGlvbihlLHQsbixyKXt2YXIgaT10WzBdLHM9dFsxXSxvPXRbMl0sdT10WzNdLGE9blswXSxmPW5bMV0sbD1uWzJdLGM9blszXSxoLHAsZCx2LG07cmV0dXJuIHA9aSphK3MqZitvKmwrdSpjLHA8MCYmKHA9LXAsYT0tYSxmPS1mLGw9LWwsYz0tYyksMS1wPjFlLTY/KGg9TWF0aC5hY29zKHApLGQ9TWF0aC5zaW4oaCksdj1NYXRoLnNpbigoMS1yKSpoKS9kLG09TWF0aC5zaW4ocipoKS9kKToodj0xLXIsbT1yKSxlWzBdPXYqaSttKmEsZVsxXT12KnMrbSpmLGVbMl09dipvK20qbCxlWzNdPXYqdSttKmMsZX0scC5pbnZlcnQ9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLHI9dFsxXSxpPXRbMl0scz10WzNdLG89bipuK3IqcitpKmkrcypzLHU9bz8xL286MDtyZXR1cm4gZVswXT0tbip1LGVbMV09LXIqdSxlWzJdPS1pKnUsZVszXT1zKnUsZX0scC5jb25qdWdhdGU9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gZVswXT0tdFswXSxlWzFdPS10WzFdLGVbMl09LXRbMl0sZVszXT10WzNdLGV9LHAubGVuZ3RoPWEubGVuZ3RoLHAubGVuPXAubGVuZ3RoLHAuc3F1YXJlZExlbmd0aD1hLnNxdWFyZWRMZW5ndGgscC5zcXJMZW49cC5zcXVhcmVkTGVuZ3RoLHAubm9ybWFsaXplPWEubm9ybWFsaXplLHAuZnJvbU1hdDM9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdK3RbNF0rdFs4XSxyO2lmKG4+MClyPU1hdGguc3FydChuKzEpLGVbM109LjUqcixyPS41L3IsZVswXT0odFs3XS10WzVdKSpyLGVbMV09KHRbMl0tdFs2XSkqcixlWzJdPSh0WzNdLXRbMV0pKnI7ZWxzZXt2YXIgaT0wO3RbNF0+dFswXSYmKGk9MSksdFs4XT50W2kqMytpXSYmKGk9Mik7dmFyIHM9KGkrMSklMyxvPShpKzIpJTM7cj1NYXRoLnNxcnQodFtpKjMraV0tdFtzKjMrc10tdFtvKjMrb10rMSksZVtpXT0uNSpyLHI9LjUvcixlWzNdPSh0W28qMytzXS10W3MqMytvXSkqcixlW3NdPSh0W3MqMytpXSt0W2kqMytzXSkqcixlW29dPSh0W28qMytpXSt0W2kqMytvXSkqcn1yZXR1cm4gZX0scC5zdHI9ZnVuY3Rpb24oZSl7cmV0dXJuXCJxdWF0KFwiK2VbMF0rXCIsIFwiK2VbMV0rXCIsIFwiK2VbMl0rXCIsIFwiK2VbM10rXCIpXCJ9LHR5cGVvZiBlIT1cInVuZGVmaW5lZFwiJiYoZS5xdWF0PXApfSh0LmV4cG9ydHMpfSkodGhpcyk7XG59KS5jYWxsKHRoaXMscmVxdWlyZShcIjFZaVo1U1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2xpYi9nbC1tYXRyaXgtbWluLmpzXCIsXCIvbGliXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIExpZ2h0TWFwID0gcmVxdWlyZSgnZ2wvbGlnaHRtYXAnKTtcbnZhciBCc3AgPSByZXF1aXJlKCdmb3JtYXRzL2JzcCcpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgndXRpbHMnKTtcblxudmFyIG1heExpZ2h0TWFwcyA9IDY0O1xudmFyIGxpZ2h0TWFwQnl0ZXMgPSAxO1xudmFyIGJsb2NrV2lkdGggPSA1MTI7XG52YXIgYmxvY2tIZWlnaHQgPSA1MTI7XG5cbnZhciBMaWdodE1hcHMgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmFsbG9jYXRlZCA9IHV0aWxzLmFycmF5MmQoYmxvY2tXaWR0aCwgbWF4TGlnaHRNYXBzKTtcbiAgICB0aGlzLmxpZ2h0TWFwc0RhdGEgPSBbXTtcbn07XG5cbkxpZ2h0TWFwcy5wcm90b3R5cGUuYnVpbGRMaWdodE1hcCA9IGZ1bmN0aW9uKGJzcCwgc3VyZmFjZSwgb2Zmc2V0KSB7XG4gICAgdmFyIHdpZHRoID0gKHN1cmZhY2UuZXh0ZW50c1swXSA+PiA0KSArIDE7XG4gICAgdmFyIGhlaWdodCA9IChzdXJmYWNlLmV4dGVudHNbMV0gPj4gNCkgKyAxO1xuICAgIHZhciBzaXplID0gd2lkdGggKiBoZWlnaHQ7XG4gICAgdmFyIGJsb2NrTGlnaHRzID0gdXRpbHMuYXJyYXkxZCgxOCAqIDE4KTtcbiAgICB2YXIgbGlnaHRNYXBPZmZzZXQgPSBzdXJmYWNlLmxpZ2h0TWFwT2Zmc2V0O1xuXG4gICAgZm9yICh2YXIgbWFwID0gMDsgbWFwIDwgbWF4TGlnaHRNYXBzOyBtYXArKykge1xuICAgICAgICBpZiAoc3VyZmFjZS5saWdodFN0eWxlc1ttYXBdID09PSAyNTUpXG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAvLyBUT0RPOiBBZGQgbGlnaHRzdHlsZXMsIHVzZWQgZm9yIGZsaWNrZXJpbmcsIGFuZCBvdGhlciBsaWdodCBhbmltYXRpb25zLlxuICAgICAgICB2YXIgc2NhbGUgPSAyNjQ7XG4gICAgICAgIGZvciAodmFyIGJsID0gMDsgYmwgPCBzaXplOyBibCsrKSB7XG4gICAgICAgICAgICBibG9ja0xpZ2h0c1tibF0gKz0gYnNwLmxpZ2h0TWFwc1tsaWdodE1hcE9mZnNldCArIGJsXSAqIHNjYWxlO1xuICAgICAgICB9XG4gICAgICAgIGxpZ2h0TWFwT2Zmc2V0ICs9IHNpemU7XG4gICAgfVxuXG4gICAgdmFyIGkgPSAwO1xuICAgIHZhciBzdHJpZGUgPSBibG9ja1dpZHRoICogbGlnaHRNYXBCeXRlcztcbiAgICBmb3IgKHZhciB5ID0gMDsgeSA8IGhlaWdodDsgeSsrKSB7XG4gICAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgd2lkdGg7IHgrKykge1xuICAgICAgICAgICAgdmFyIHBvc2l0aW9uID0geSAqIHN0cmlkZSArIHg7XG4gICAgICAgICAgICB0aGlzLmxpZ2h0TWFwc0RhdGFbb2Zmc2V0ICsgcG9zaXRpb25dID0gMjU1IC0gTWF0aC5taW4oMjU1LCBibG9ja0xpZ2h0c1tpXSA+PiA3KTtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbkxpZ2h0TWFwcy5wcm90b3R5cGUuYWxsb2NhdGVCbG9jayA9IGZ1bmN0aW9uICh3aWR0aCwgaGVpZ2h0KSB7XG4gICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgIGZvciAodmFyIHRleElkID0gMDsgdGV4SWQgPCBtYXhMaWdodE1hcHM7IHRleElkKyspIHtcbiAgICAgICAgdmFyIGJlc3QgPSBibG9ja0hlaWdodDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBibG9ja1dpZHRoIC0gd2lkdGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGJlc3QyID0gMDtcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgd2lkdGg7IGorKykge1xuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYWxsb2NhdGVkW3RleElkXVtpICsgal0gPj0gYmVzdClcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYWxsb2NhdGVkW3RleElkXVtpICsgal0gPiBiZXN0MilcbiAgICAgICAgICAgICAgICAgICAgYmVzdDIgPSB0aGlzLmFsbG9jYXRlZFt0ZXhJZF1baSArIGpdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaiA9PSB3aWR0aCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdC54ID0gaTtcbiAgICAgICAgICAgICAgICByZXN1bHQueSA9IGJlc3QgPSBiZXN0MjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChiZXN0ICsgaGVpZ2h0ID4gYmxvY2tIZWlnaHQpXG4gICAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHdpZHRoOyBqKyspXG4gICAgICAgICAgICB0aGlzLmFsbG9jYXRlZFt0ZXhJZF1bcmVzdWx0LnggKyBqXSA9IGJlc3QgKyBoZWlnaHQ7XG5cbiAgICAgICAgcmVzdWx0LnRleElkID0gdGV4SWQ7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufTtcblxuTGlnaHRNYXBzLnByb3RvdHlwZS5idWlsZCA9IGZ1bmN0aW9uKGJzcCkge1xuICAgIHZhciB1c2VkTWFwcyA9IDA7XG4gICAgZm9yICh2YXIgbSA9IDA7IG0gPCBic3AubW9kZWxzLmxlbmd0aDsgbSsrKSB7XG4gICAgICAgIHZhciBtb2RlbCA9IGJzcC5tb2RlbHNbbV07XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb2RlbC5zdXJmYWNlQ291bnQ7IGkrKykge1xuICAgICAgICAgICAgdmFyIHN1cmZhY2UgPSBic3Auc3VyZmFjZXNbbW9kZWwuZmlyc3RTdXJmYWNlICsgaV07XG4gICAgICAgICAgICBpZiAoc3VyZmFjZS5mbGFncyAhPT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgd2lkdGggPSAoc3VyZmFjZS5leHRlbnRzWzBdID4+IDQpICsgMTtcbiAgICAgICAgICAgIHZhciBoZWlnaHQgPSAoc3VyZmFjZS5leHRlbnRzWzFdID4+IDQpICsgMTtcblxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHRoaXMuYWxsb2NhdGVCbG9jayh3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgICAgIHN1cmZhY2UubGlnaHRNYXBTID0gcmVzdWx0Lng7XG4gICAgICAgICAgICBzdXJmYWNlLmxpZ2h0TWFwVCA9IHJlc3VsdC55O1xuICAgICAgICAgICAgdXNlZE1hcHMgPSBNYXRoLm1heCh1c2VkTWFwcywgcmVzdWx0LnRleElkKTtcbiAgICAgICAgICAgIHZhciBvZmZzZXQgPSByZXN1bHQudGV4SWQgKiBsaWdodE1hcEJ5dGVzICogYmxvY2tXaWR0aCAqIGJsb2NrSGVpZ2h0O1xuICAgICAgICAgICAgb2Zmc2V0ICs9IChyZXN1bHQueSAqIGJsb2NrV2lkdGggKyByZXN1bHQueCkgKiBsaWdodE1hcEJ5dGVzO1xuICAgICAgICAgICAgdGhpcy5idWlsZExpZ2h0TWFwKGJzcCwgc3VyZmFjZSwgb2Zmc2V0KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnRleHR1cmUgPSBuZXcgTGlnaHRNYXAodGhpcy5saWdodE1hcHNEYXRhLCAwLCBibG9ja1dpZHRoLCBibG9ja0hlaWdodCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBMaWdodE1hcHM7XG5cblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIxWWlaNVNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9saWdodG1hcHMuanNcIixcIi9cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgVGV4dHVyZSA9IHJlcXVpcmUoJ2dsL3RleHR1cmUnKTtcbnZhciBMaWdodE1hcHMgPSByZXF1aXJlKCdsaWdodG1hcHMnKTtcbnZhciBhc3NldHMgPSByZXF1aXJlKCdhc3NldHMnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJ3V0aWxzJyk7XG52YXIgd2lyZWZyYW1lID0gZmFsc2U7XG5cbnZhciBibG9ja1dpZHRoID0gNTEyO1xudmFyIGJsb2NrSGVpZ2h0ID0gNTEyO1xuXG52YXIgTWFwID0gZnVuY3Rpb24oYnNwKSB7XG4gICAgdGhpcy50ZXh0dXJlcyA9IFtdO1xuICAgIHRoaXMubGlnaHRNYXBzID0gbmV3IExpZ2h0TWFwcygpO1xuICAgIHRoaXMubGlnaHRNYXBzLmJ1aWxkKGJzcCk7XG5cbiAgICBmb3IgKHZhciB0ZXhJZCBpbiBic3AudGV4dHVyZXMpIHtcbiAgICAgICAgdmFyIHRleHR1cmUgPSBic3AudGV4dHVyZXNbdGV4SWRdO1xuICAgICAgICB2YXIgb3B0aW9ucyA9IHtcbiAgICAgICAgICAgIHdpZHRoOiB0ZXh0dXJlLndpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiB0ZXh0dXJlLmhlaWdodCxcbiAgICAgICAgICAgIHdyYXA6IGdsLlJFUEVBVCxcbiAgICAgICAgICAgIHBhbGV0dGU6IGFzc2V0cy5wYWxldHRlXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMudGV4dHVyZXMucHVzaChuZXcgVGV4dHVyZSh0ZXh0dXJlLmRhdGEsIG9wdGlvbnMpKTtcbiAgICB9XG5cbiAgICB2YXIgY2hhaW5zID0gW107XG4gICAgZm9yICh2YXIgbSBpbiBic3AubW9kZWxzKSB7XG4gICAgICAgIHZhciBtb2RlbCA9IGJzcC5tb2RlbHNbbV07XG4gICAgICAgIGZvciAodmFyIHNpZCA9IG1vZGVsLmZpcnN0U3VyZmFjZTsgc2lkIDwgbW9kZWwuc3VyZmFjZUNvdW50OyBzaWQrKykge1xuICAgICAgICAgICAgdmFyIHN1cmZhY2UgPSBic3Auc3VyZmFjZXNbc2lkXTtcbiAgICAgICAgICAgIHZhciB0ZXhJbmZvID0gYnNwLnRleEluZm9zW3N1cmZhY2UudGV4SW5mb0lkXTtcblxuICAgICAgICAgICAgdmFyIGNoYWluID0gY2hhaW5zW3RleEluZm8udGV4dHVyZUlkXTtcbiAgICAgICAgICAgIGlmICghY2hhaW4pIHtcbiAgICAgICAgICAgICAgICBjaGFpbiA9IHsgdGV4SWQ6IHRleEluZm8udGV4dHVyZUlkLCBkYXRhOiBbXSB9O1xuICAgICAgICAgICAgICAgIGNoYWluc1t0ZXhJbmZvLnRleHR1cmVJZF0gPSBjaGFpbjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGluZGljZXMgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGUgPSBzdXJmYWNlLmVkZ2VTdGFydDsgZSA8IHN1cmZhY2UuZWRnZVN0YXJ0ICsgc3VyZmFjZS5lZGdlQ291bnQ7IGUrKykge1xuICAgICAgICAgICAgICAgIHZhciBlZGdlRmxpcHBlZCA9IGJzcC5lZGdlTGlzdFtlXSA8IDA7XG4gICAgICAgICAgICAgICAgdmFyIGVkZ2VJbmRleCA9IE1hdGguYWJzKGJzcC5lZGdlTGlzdFtlXSk7XG4gICAgICAgICAgICAgICAgaWYgKCFlZGdlRmxpcHBlZCkge1xuICAgICAgICAgICAgICAgICAgICBpbmRpY2VzLnB1c2goYnNwLmVkZ2VzW2VkZ2VJbmRleCAqIDJdKTtcbiAgICAgICAgICAgICAgICAgICAgaW5kaWNlcy5wdXNoKGJzcC5lZGdlc1tlZGdlSW5kZXggKiAyICsgMV0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGluZGljZXMucHVzaChic3AuZWRnZXNbZWRnZUluZGV4ICogMiArIDFdKTtcbiAgICAgICAgICAgICAgICAgICAgaW5kaWNlcy5wdXNoKGJzcC5lZGdlc1tlZGdlSW5kZXggKiAyXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW5kaWNlcyA9IHdpcmVmcmFtZSA/IGluZGljZXMgOiB1dGlscy50cmlhbmd1bGF0ZShpbmRpY2VzKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW5kaWNlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciB2ID0gW1xuICAgICAgICAgICAgICAgICAgICBic3AudmVydGljZXNbaW5kaWNlc1tpXV0ueCxcbiAgICAgICAgICAgICAgICAgICAgYnNwLnZlcnRpY2VzW2luZGljZXNbaV1dLnksXG4gICAgICAgICAgICAgICAgICAgIGJzcC52ZXJ0aWNlc1tpbmRpY2VzW2ldXS56XG4gICAgICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgICAgIHZhciBzID0gdmVjMy5kb3QodiwgdGV4SW5mby52ZWN0b3JTKSArIHRleEluZm8uZGlzdFM7XG4gICAgICAgICAgICAgICAgdmFyIHQgPSB2ZWMzLmRvdCh2LCB0ZXhJbmZvLnZlY3RvclQpICsgdGV4SW5mby5kaXN0VDtcblxuICAgICAgICAgICAgICAgIHZhciBzMSA9IHMgLyB0aGlzLnRleHR1cmVzW3RleEluZm8udGV4dHVyZUlkXS53aWR0aDtcbiAgICAgICAgICAgICAgICB2YXIgdDEgPSB0IC8gdGhpcy50ZXh0dXJlc1t0ZXhJbmZvLnRleHR1cmVJZF0uaGVpZ2h0O1xuXG4gICAgICAgICAgICAgICAgLy8gU2hhZG93IG1hcCB0ZXh0dXJlIGNvb3JkaW5hdGVzXG4gICAgICAgICAgICAgICAgdmFyIHMyID0gcztcbiAgICAgICAgICAgICAgICBzMiAtPSBzdXJmYWNlLnRleHR1cmVNaW5zWzBdO1xuICAgICAgICAgICAgICAgIHMyICs9IChzdXJmYWNlLmxpZ2h0TWFwUyAqIDE2KTtcbiAgICAgICAgICAgICAgICBzMiArPSA4O1xuICAgICAgICAgICAgICAgIHMyIC89IChibG9ja1dpZHRoICogMTYpO1xuXG4gICAgICAgICAgICAgICAgdmFyIHQyID0gdDtcbiAgICAgICAgICAgICAgICB0MiAtPSBzdXJmYWNlLnRleHR1cmVNaW5zWzFdO1xuICAgICAgICAgICAgICAgIHQyICs9IChzdXJmYWNlLmxpZ2h0TWFwVCAqIDE2KTtcbiAgICAgICAgICAgICAgICB0MiArPSA4O1xuICAgICAgICAgICAgICAgIHQyIC89IChibG9ja0hlaWdodCAqIDE2KTtcblxuICAgICAgICAgICAgICAgIGNoYWluLmRhdGEucHVzaCh2WzBdLCB2WzFdLCB2WzJdLCBzMSwgdDEsIHMyLCB0Mik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgZGF0YSA9IFtdO1xuICAgIHZhciBvZmZzZXQgPSAwO1xuICAgIHRoaXMuY2hhaW5zID0gW107XG4gICAgZm9yICh2YXIgYyBpbiBjaGFpbnMpIHtcbiAgICAgICAgZm9yICh2YXIgdiA9IDA7IHYgPCBjaGFpbnNbY10uZGF0YS5sZW5ndGg7IHYrKykge1xuICAgICAgICAgICAgZGF0YS5wdXNoKGNoYWluc1tjXS5kYXRhW3ZdKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgY2hhaW4gPSB7XG4gICAgICAgICAgICBvZmZzZXQ6IG9mZnNldCxcbiAgICAgICAgICAgIHRleElkOiBjaGFpbnNbY10udGV4SWQsXG4gICAgICAgICAgICBlbGVtZW50czogY2hhaW5zW2NdLmRhdGEubGVuZ3RoIC8gN1xuICAgICAgICB9O1xuICAgICAgICBvZmZzZXQgKz0gY2hhaW4uZWxlbWVudHM7XG4gICAgICAgIHRoaXMuY2hhaW5zLnB1c2goY2hhaW4pO1xuICAgIH1cbiAgICB0aGlzLmJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xuICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLmJ1ZmZlcik7XG4gICAgZ2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkoZGF0YSksIGdsLlNUQVRJQ19EUkFXKTtcbiAgICB0aGlzLmJ1ZmZlci5zdHJpZGUgPSA3ICogNDtcbn07XG5cbk1hcC5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKHAsIG0pIHtcbiAgICB2YXIgc2hhZGVyID0gYXNzZXRzLnNoYWRlcnMud29ybGQ7XG4gICAgdmFyIGJ1ZmZlciA9IHRoaXMuYnVmZmVyO1xuICAgIHZhciBtb2RlID0gd2lyZWZyYW1lID8gZ2wuTElORVMgOiBnbC5UUklBTkdMRVM7XG5cbiAgICBzaGFkZXIudXNlKCk7XG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHRoaXMuYnVmZmVyKTtcblxuICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHNoYWRlci5hdHRyaWJ1dGVzLnNoYWRvd1RleENvb3Jkc0F0dHJpYnV0ZSk7XG5cbiAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKHNoYWRlci5hdHRyaWJ1dGVzLnZlcnRleEF0dHJpYnV0ZSwgMywgZ2wuRkxPQVQsIGZhbHNlLCBidWZmZXIuc3RyaWRlLCAwKTtcbiAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKHNoYWRlci5hdHRyaWJ1dGVzLnRleENvb3Jkc0F0dHJpYnV0ZSwgMiwgZ2wuRkxPQVQsIGZhbHNlLCBidWZmZXIuc3RyaWRlLCAxMik7XG4gICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihzaGFkZXIuYXR0cmlidXRlcy5zaGFkb3dUZXhDb29yZHNBdHRyaWJ1dGUsIDIsIGdsLkZMT0FULCBmYWxzZSwgYnVmZmVyLnN0cmlkZSwgMjApO1xuICAgIGdsLnVuaWZvcm1NYXRyaXg0ZnYoc2hhZGVyLnVuaWZvcm1zLnByb2plY3Rpb25NYXRyaXgsIGZhbHNlLCBwKTtcbiAgICBnbC51bmlmb3JtTWF0cml4NGZ2KHNoYWRlci51bmlmb3Jtcy5tb2RlbHZpZXdNYXRyaXgsIGZhbHNlLCBtKTtcbiAgICBnbC51bmlmb3JtMWkoc2hhZGVyLnVuaWZvcm1zLnRleHR1cmVNYXAsIDApO1xuICAgIGdsLnVuaWZvcm0xaShzaGFkZXIudW5pZm9ybXMubGlnaHRNYXAsIDEpO1xuXG4gICAgdGhpcy5saWdodE1hcHMudGV4dHVyZS5iaW5kKDEpO1xuICAgIGZvciAodmFyIGMgaW4gdGhpcy5jaGFpbnMpIHtcbiAgICAgICAgdmFyIGNoYWluID0gdGhpcy5jaGFpbnNbY107XG4gICAgICAgIHZhciB0ZXh0dXJlID0gdGhpcy50ZXh0dXJlc1tjaGFpbi50ZXhJZF07XG4gICAgICAgIHRleHR1cmUuYmluZCgwKTtcbiAgICAgICAgZ2wuZHJhd0FycmF5cyhtb2RlLCB0aGlzLmNoYWluc1tjXS5vZmZzZXQsIHRoaXMuY2hhaW5zW2NdLmVsZW1lbnRzKTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBNYXA7XG59KS5jYWxsKHRoaXMscmVxdWlyZShcIjFZaVo1U1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL21hcC5qc1wiLFwiL1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbnZhciBhc3NldHMgPSByZXF1aXJlKCdhc3NldHMnKTtcbnZhciBUZXh0dXJlID0gcmVxdWlyZSgnZ2wvVGV4dHVyZScpO1xuXG52YXIgTW9kZWwgPSBmdW5jdGlvbihtZGwpIHtcbiAgICB0aGlzLnNraW5zID0gW107XG4gICAgZm9yICh2YXIgc2tpbkluZGV4ID0gMDsgc2tpbkluZGV4IDwgbWRsLnNraW5zLmxlbmd0aDsgc2tpbkluZGV4KyspIHtcbiAgICAgICAgdmFyIHNraW4gPSBtZGwuc2tpbnNbc2tpbkluZGV4XTtcbiAgICAgICAgdmFyIHRleHR1cmUgPSBuZXcgVGV4dHVyZShza2luLCB7XG4gICAgICAgICAgICBwYWxldHRlOiBhc3NldHMucGFsZXR0ZSxcbiAgICAgICAgICAgIHdpZHRoOiBtZGwuc2tpbldpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBtZGwuc2tpbkhlaWdodFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5za2lucy5wdXNoKHRleHR1cmUpO1xuICAgIH1cblxuICAgIHRoaXMuaWQgPSBnbC5jcmVhdGVCdWZmZXIoKTtcbiAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdGhpcy5pZCk7XG4gICAgdmFyIGRhdGEgPSBuZXcgRmxvYXQzMkFycmF5KG1kbC5mcmFtZUNvdW50ICogbWRsLmZhY2VDb3VudCAqIDMgKiA1KTtcbiAgICB2YXIgb2Zmc2V0ID0gMDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1kbC5mcmFtZUNvdW50OyBpKyspIHtcbiAgICAgICAgdmFyIGZyYW1lID0gbWRsLmZyYW1lc1tpXTtcbiAgICAgICAgZm9yICh2YXIgZiA9IDA7IGYgPCBtZGwuZmFjZUNvdW50OyBmKyspIHtcbiAgICAgICAgICAgIHZhciBmYWNlID0gbWRsLmZhY2VzW2ZdO1xuICAgICAgICAgICAgZm9yICh2YXIgdiA9IDA7IHYgPCAzOyB2KyspIHtcbiAgICAgICAgICAgICAgICBkYXRhW29mZnNldCsrXSA9IGZyYW1lLnZlcnRpY2VzW2ZhY2UuaW5kaWNlc1t2XV1bMF07XG4gICAgICAgICAgICAgICAgZGF0YVtvZmZzZXQrK10gPSBmcmFtZS52ZXJ0aWNlc1tmYWNlLmluZGljZXNbdl1dWzFdO1xuICAgICAgICAgICAgICAgIGRhdGFbb2Zmc2V0KytdID0gZnJhbWUudmVydGljZXNbZmFjZS5pbmRpY2VzW3ZdXVsyXTtcblxuICAgICAgICAgICAgICAgIHZhciBzID0gbWRsLnRleENvb3Jkc1tmYWNlLmluZGljZXNbdl1dLnM7XG4gICAgICAgICAgICAgICAgdmFyIHQgPSBtZGwudGV4Q29vcmRzW2ZhY2UuaW5kaWNlc1t2XV0udDtcblxuICAgICAgICAgICAgICAgIGlmICghZmFjZS5pc0Zyb250RmFjZSAmJiBtZGwudGV4Q29vcmRzW2ZhY2UuaW5kaWNlc1t2XV0ub25TZWFtKVxuICAgICAgICAgICAgICAgICAgICBzICs9IHRoaXMuc2tpbnNbMF0ud2lkdGggKiAwLjU7IC8vIG9uIGJhY2sgc2lkZVxuXG4gICAgICAgICAgICAgICAgZGF0YVtvZmZzZXQrK10gPSAocyArIDAuNSkgLyB0aGlzLnNraW5zWzBdLndpZHRoO1xuICAgICAgICAgICAgICAgIGRhdGFbb2Zmc2V0KytdID0gKHQgKyAwLjUpIC8gdGhpcy5za2luc1swXS5oZWlnaHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgZGF0YSwgZ2wuU1RBVElDX0RSQVcpO1xuICAgIHRoaXMuc3RyaWRlID0gNSAqIDQ7IC8vIHgsIHksIHosIHMsIHRcbiAgICB0aGlzLmZhY2VDb3VudCA9IG1kbC5mYWNlQ291bnQ7XG4gICAgdGhpcy5hbmltYXRpb25zID0gbWRsLmFuaW1hdGlvbnM7XG59O1xuXG5Nb2RlbC5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKHAsIG0sIGFuaW1hdGlvbiwgZnJhbWUpIHtcbiAgICB2YXIgc2hhZGVyID0gYXNzZXRzLnNoYWRlcnMubW9kZWw7XG4gICAgYW5pbWF0aW9uID0gYW5pbWF0aW9uIHwgMDtcbiAgICBmcmFtZSA9IGZyYW1lIHwgMDtcbiAgICBzaGFkZXIudXNlKCk7XG5cbiAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdGhpcy5pZCk7XG4gICAgdGhpcy5za2luc1swXS5iaW5kKDApO1xuXG4gICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihzaGFkZXIuYXR0cmlidXRlcy52ZXJ0ZXhBdHRyaWJ1dGUsIDMsIGdsLkZMT0FULCBmYWxzZSwgdGhpcy5zdHJpZGUsIDApO1xuICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIoc2hhZGVyLmF0dHJpYnV0ZXMudGV4Q29vcmRzQXR0cmlidXRlLCAyLCBnbC5GTE9BVCwgZmFsc2UsIHRoaXMuc3RyaWRlLCAxMik7XG4gICAgZ2wudW5pZm9ybU1hdHJpeDRmdihzaGFkZXIudW5pZm9ybXMubW9kZWx2aWV3TWF0cml4LCBmYWxzZSwgbSk7XG4gICAgZ2wudW5pZm9ybU1hdHJpeDRmdihzaGFkZXIudW5pZm9ybXMucHJvamVjdGlvbk1hdHJpeCwgZmFsc2UsIHApO1xuXG4gICAgZnJhbWUgKz0gdGhpcy5hbmltYXRpb25zW2FuaW1hdGlvbl0uZmlyc3RGcmFtZTtcbiAgICBpZiAoZnJhbWUgPj0gdGhpcy5hbmltYXRpb25zW2FuaW1hdGlvbl0uZnJhbWVDb3VudClcbiAgICAgICAgZnJhbWUgPSAwO1xuXG4gICAgZ2wudW5pZm9ybTFpKHNoYWRlci51bmlmb3Jtcy50ZXh0dXJlTWFwLCAwKTtcbiAgICBnbC5kcmF3QXJyYXlzKGdsLlRSSUFOR0xFUywgfn5mcmFtZSAqICh0aGlzLmZhY2VDb3VudCAqIDMpLCB0aGlzLmZhY2VDb3VudCAqIDMpO1xuICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBudWxsKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IE1vZGVsO1xufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIxWWlaNVNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9tb2RlbC5qc1wiLFwiL1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcblxudmFyIFByb3RvY29sID0ge1xuICAgIHNlcnZlckJhZDogMCxcbiAgICBzZXJ2ZXJOb3A6IDEsXG4gICAgc2VydmVyRGlzY29ubmVjdDogMixcbiAgICBzZXJ2ZXJVcGRhdGVTdGF0OiAzLFxuICAgIHNlcnZlclZlcnNpb246IDQsXG4gICAgc2VydmVyU2V0VmlldzogNSxcbiAgICBzZXJ2ZXJTb3VuZDogNixcbiAgICBzZXJ2ZXJUaW1lOiA3LFxuICAgIHNlcnZlclByaW50OiA4LFxuICAgIHNlcnZlclN0dWZmVGV4dDogOSxcbiAgICBzZXJ2ZXJTZXRBbmdsZTogMTAsXG4gICAgc2VydmVySW5mbzogMTEsXG4gICAgc2VydmVyTGlnaHRTdHlsZTogMTIsXG4gICAgc2VydmVyVXBkYXRlTmFtZTogMTMsXG4gICAgc2VydmVyVXBkYXRlRnJhZ3M6IDE0LFxuICAgIHNlcnZlckNsaWVudERhdGE6IDE1LFxuICAgIHNlcnZlclN0b3BTb3VuZDogMTYsXG4gICAgc2VydmVyVXBkYXRlQ29sb3JzOiAxNyxcbiAgICBzZXJ2ZXJQYXJ0aWNsZTogMTgsXG4gICAgc2VydmVyRGFtYWdlOiAxOSxcbiAgICBzZXJ2ZXJTcGF3blN0YXRpYzogMjAsXG4gICAgc2VydmVyU3Bhd25CYXNlbGluZTogMjIsXG4gICAgc2VydmVyVGVtcEVudGl0eTogMjMsXG4gICAgc2VydmVyU2V0UGF1c2U6IDI0LFxuICAgIHNlcnZlclNpZ25vbk51bTogMjUsXG4gICAgc2VydmVyQ2VudGVyUHJpbnQ6IDI2LFxuICAgIHNlcnZlcktpbGxlZE1vbnN0ZXI6IDI3LFxuICAgIHNlcnZlckZvdW5kU2VjcmV0OiAyOCxcbiAgICBzZXJ2ZXJTcGF3blN0YXRpY1NvdW5kOiAyOSxcbiAgICBzZXJ2ZXJDZFRyYWNrOiAzMixcbiAgICBcbiAgICBjbGllbnRWaWV3SGVpZ2h0OiAxLFxuICAgIGNsaWVudElkZWFsUGl0Y2g6IDIsXG4gICAgY2xpZW50UHVuY2gxOiA0LFxuICAgIGNsaWVudFB1bmNoMjogOCxcbiAgICBjbGllbnRQdW5jaDM6IDE2LFxuICAgIGNsaWVudFZlbG9jaXR5MTogMzIsXG4gICAgY2xpZW50VmVsb2NpdHkyOiA2NCxcbiAgICBjbGllbnRWZWxvY2l0eTM6IDEyOCxcbiAgICBjbGllbnRBaW1lbnQ6IDI1NixcbiAgICBjbGllbnRJdGVtczogNTEyLFxuICAgIGNsaWVudE9uR3JvdW5kOiAxMDI0LFxuICAgIGNsaWVudEluV2F0ZXI6IDIwNDgsXG4gICAgY2xpZW50V2VhcG9uRnJhbWU6IDQwOTYsXG4gICAgY2xpZW50QXJtb3I6IDgxOTIsXG4gICAgY2xpZW50V2VhcG9uOiAxNjM4NCxcblxuICAgIGZhc3RVcGRhdGVNb3JlQml0czogMSxcbiAgICBmYXN0VXBkYXRlT3JpZ2luMTogMixcbiAgICBmYXN0VXBkYXRlT3JpZ2luMjogNCxcbiAgICBmYXN0VXBkYXRlT3JpZ2luMzogOCxcbiAgICBmYXN0VXBkYXRlQW5nbGUyOiAxNixcbiAgICBmYXN0VXBkYXRlTm9MZXJwOiAzMixcbiAgICBmYXN0VXBkYXRlRnJhbWU6IDY0LFxuICAgIGZhc3RVcGRhdGVTaWduYWw6IDEyOCxcbiAgICBmYXN0VXBkYXRlQW5nbGUxOiAyNTYsXG4gICAgZmFzdFVwZGF0ZUFuZ2xlMzogNTEyLFxuICAgIGZhc3RVcGRhdGVNb2RlbDogMTAyNCxcbiAgICBmYXN0VXBkYXRlQ29sb3JNYXA6IDIwNDgsXG4gICAgZmFzdFVwZGF0ZVNraW46IDQwOTYsXG4gICAgZmFzdFVwZGF0ZUVmZmVjdHM6IDgxOTIsXG4gICAgZmFzdFVwZGF0ZUxvbmdFbnRpdHk6IDE2Mzg0LFxuXG4gICAgc291bmRWb2x1bWU6IDEsXG4gICAgc291bmRBdHRlbnVhdGlvbjogMixcbiAgICBzb3VuZExvb3Bpbmc6IDQsXG5cbiAgICB0ZW1wU3Bpa2U6IDAsXG4gICAgdGVtcFN1cGVyU3Bpa2U6IDEsXG4gICAgdGVtcEd1blNob3Q6IDIsXG4gICAgdGVtcEV4cGxvc2lvbjogMyxcbiAgICB0ZW1wVGFyRXhwbG9zaW9uOiA0LFxuICAgIHRlbXBMaWdodG5pbmcxOiA1LFxuICAgIHRlbXBMaWdodG5pbmcyOiA2LFxuICAgIHRlbXBXaXpTcGlrZTogNyxcbiAgICB0ZW1wS25pZ2h0U3Bpa2U6IDgsXG4gICAgdGVtcExpZ2h0bmluZzM6IDksXG4gICAgdGVtcExhdmFTcGxhc2g6IDEwLFxuICAgIHRlbXBUZWxlcG9ydDogMTEsXG4gICAgdGVtcEV4cGxvc2lvbjI6IDEyXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBQcm90b2NvbDtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIxWWlaNVNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9wcm90b2NvbC5qc1wiLFwiL1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcblxudmFyIHNldHRpbmdzID0ge1xuICAgIHZlcnNpb246ICcwLjEnLFxuICAgIG1hcE5hbWVzOiB7XG4gICAgICAgIHN0YXJ0OiAnRW50cmFuY2UnLFxuICAgICAgICBlMW0xOiAnU2xpcGdhdGUgQ29tcGxleCcsXG4gICAgICAgIGUxbTI6ICdDYXN0bGUgb2YgdGhlIERhbW5lZCcsXG4gICAgICAgIGUxbTM6ICdUaGUgTmVjcm9wb2xpcycsXG4gICAgICAgIGUxbTQ6ICdUaGUgR3Jpc2x5IEdyb3R0bycsXG4gICAgICAgIGUxbTU6ICdHbG9vbSBLZWVwJyxcbiAgICAgICAgZTFtNjogJ1RoZSBEb29yIFRvIENodGhvbicsXG4gICAgICAgIGUxbTc6ICdUaGUgSG91c2Ugb2YgQ2h0aG9uJyxcbiAgICAgICAgZTFtODogJ1ppZ2d1cmF0IFZlcnRpZ28nXG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gc2V0dGluZ3M7XG59KS5jYWxsKHRoaXMscmVxdWlyZShcIjFZaVo1U1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL3NldHRpbmdzLmpzXCIsXCIvXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIFNwcml0ZXMgPSByZXF1aXJlKCdnbC9zcHJpdGVzJyk7XG52YXIgRm9udCA9IHJlcXVpcmUoJ2dsL2ZvbnQnKTtcbnZhciBhc3NldHMgPSByZXF1aXJlKCdhc3NldHMnKTtcbnZhciBzZXR0aW5ncyA9IHJlcXVpcmUoJ3NldHRpbmdzJyk7XG5cbnZhciBDb25zb2xlID0gZnVuY3Rpb24oKSB7XG4gICB2YXIgZm9udFRleHR1cmUgPSBhc3NldHMubG9hZCgnd2FkL0NPTkNIQVJTJywgeyB3aWR0aDogMTI4LCBoZWlnaHQ6IDEyOCwgYWxwaGE6IHRydWUgfSk7XG4gICB2YXIgZm9udCA9IG5ldyBGb250KGZvbnRUZXh0dXJlLCA4LCA4KTtcblxuICAgdmFyIGJhY2tncm91bmRUZXh0dXJlID0gYXNzZXRzLmxvYWQoJ3Bhay9nZngvY29uYmFjay5sbXAnKTtcbiAgIGJhY2tncm91bmRUZXh0dXJlLmRyYXdUbyhmdW5jdGlvbihwKSB7XG4gICAgICBnbC5lbmFibGUoZ2wuQkxFTkQpO1xuICAgICAgdmFyIHZlcnNpb24gPSAnV2ViR0wgJyArIHNldHRpbmdzLnZlcnNpb247XG4gICAgICBmb250LmRyYXdTdHJpbmcoZ2wud2lkdGggKiAwLjcsIGdsLmhlaWdodCAqIDAuOTMsIHZlcnNpb24sIDEpO1xuICAgICAgZm9udC5yZW5kZXIoYXNzZXRzLnNoYWRlcnMudGV4dHVyZTJkLCBwKTtcbiAgIH0pO1xuICAgdmFyIGJhY2tncm91bmQgPSBuZXcgU3ByaXRlcygzMjAsIDIwMCk7XG4gICBiYWNrZ3JvdW5kLnRleHR1cmVzLmFkZFN1YlRleHR1cmUoYmFja2dyb3VuZFRleHR1cmUpO1xuICAgYmFja2dyb3VuZC50ZXh0dXJlcy5jb21waWxlKGFzc2V0cy5zaGFkZXJzLnRleHR1cmUyZCk7XG5cbiAgIHRoaXMuZm9udCA9IGZvbnQ7XG4gICB0aGlzLmJhY2tncm91bmQgPSBiYWNrZ3JvdW5kO1xufTtcblxuQ29uc29sZS5wcm90b3R5cGUucHJpbnQgPSBmdW5jdGlvbihtc2cpIHtcbiAgIHRoaXMuZm9udC5kcmF3U3RyaW5nKDQwLCA0MCwgbXNnKTtcbn07XG5cbkNvbnNvbGUucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihwKSB7XG5cbiAgIHRoaXMuYmFja2dyb3VuZC5jbGVhcigpO1xuICAgdGhpcy5iYWNrZ3JvdW5kLmRyYXdTcHJpdGUoMCwgMCwgLTQwMCwgZ2wud2lkdGgsIGdsLmhlaWdodCwgMSwgMSwgMSwgMS4wKTtcbiAgIHRoaXMuYmFja2dyb3VuZC5yZW5kZXIoYXNzZXRzLnNoYWRlcnMuY29sb3IyZCwgcCk7XG5cbiAgIGdsLmVuYWJsZShnbC5CTEVORCk7XG4gICB0aGlzLmZvbnQucmVuZGVyKGFzc2V0cy5zaGFkZXJzLnRleHR1cmUyZCwgcCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBDb25zb2xlO1xufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIxWWlaNVNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi91aS9jb25zb2xlLmpzXCIsXCIvdWlcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgU3ByaXRlcyA9IHJlcXVpcmUoJ2dsL3Nwcml0ZXMnKTtcbnZhciBhc3NldHMgPSByZXF1aXJlKCdhc3NldHMnKTtcblxudmFyIFN0YXR1c0JhciA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc3ByaXRlcyA9IG5ldyBTcHJpdGVzKDUxMiwgNTEyLCA2NCk7XG5cbiAgICB0aGlzLmJhY2tncm91bmQgPSB0aGlzLmxvYWRQaWMoJ1NCQVInKTtcbiAgICB0aGlzLm51bWJlcnMgPSBbXTtcbiAgICB0aGlzLnJlZE51bWJlcnMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDEwOyBpKyspIHtcbiAgICAgICAgdGhpcy5udW1iZXJzLnB1c2godGhpcy5sb2FkUGljKCdOVU1fJyArIGkpKTtcbiAgICAgICAgdGhpcy5yZWROdW1iZXJzLnB1c2godGhpcy5sb2FkUGljKCdBTlVNXycgKyBpKSk7XG4gICAgfVxuXG4gICAgdGhpcy53ZWFwb25zID0gbmV3IEFycmF5KDcpO1xuICAgIHRoaXMud2VhcG9uc1swXSA9IHRoaXMubG9hZFdlYXBvbignU0hPVEdVTicpO1xuICAgIHRoaXMud2VhcG9uc1sxXSA9IHRoaXMubG9hZFdlYXBvbignU1NIT1RHVU4nKTtcbiAgICB0aGlzLndlYXBvbnNbMl0gPSB0aGlzLmxvYWRXZWFwb24oJ05BSUxHVU4nKTtcbiAgICB0aGlzLndlYXBvbnNbM10gPSB0aGlzLmxvYWRXZWFwb24oJ1NOQUlMR1VOJyk7XG4gICAgdGhpcy53ZWFwb25zWzRdID0gdGhpcy5sb2FkV2VhcG9uKCdSTEFVTkNIJyk7XG4gICAgdGhpcy53ZWFwb25zWzVdID0gdGhpcy5sb2FkV2VhcG9uKCdTUkxBVU5DSCcpO1xuICAgIHRoaXMud2VhcG9uc1s2XSA9IHRoaXMubG9hZFdlYXBvbignTElHSFRORycpO1xuXG4gICAgdGhpcy5mYWNlcyA9IG5ldyBBcnJheSg1KTtcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8PSA1OyBpKyspXG4gICAgICAgIHRoaXMuZmFjZXNbaSAtIDFdID0geyBub3JtYWw6IHRoaXMubG9hZFBpYygnRkFDRScgKyBpKSwgcGFpbjogdGhpcy5sb2FkUGljKCdGQUNFX1AnICsgaSkgfTtcblxuICAgIHRoaXMuc3ByaXRlcy50ZXh0dXJlcy5jb21waWxlKGFzc2V0cy5zaGFkZXJzLnRleHR1cmUyZCk7XG59O1xuXG5TdGF0dXNCYXIucHJvdG90eXBlLmxvYWRQaWMgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIHRleHR1cmUgPSBhc3NldHMubG9hZCgnd2FkLycgKyBuYW1lKTtcbiAgICByZXR1cm4gdGhpcy5zcHJpdGVzLnRleHR1cmVzLmFkZFN1YlRleHR1cmUodGV4dHVyZSk7XG59O1xuXG5TdGF0dXNCYXIucHJvdG90eXBlLmRyYXdQaWMgPSBmdW5jdGlvbihpbmRleCwgeCwgeSkge1xuICAgIHRoaXMuc3ByaXRlcy5kcmF3U3ByaXRlKGluZGV4LCB4LCB5LCAwLCAwLCAxLCAxLCAxLCAxKTtcbn07XG5cblN0YXR1c0Jhci5wcm90b3R5cGUubG9hZFdlYXBvbiA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdmFyIHdlYXBvbiA9IHt9O1xuICAgIHdlYXBvbi5vd25lZCA9IHRoaXMubG9hZFBpYygnSU5WXycgKyBuYW1lKTtcbiAgICB3ZWFwb24uYWN0aXZlID0gdGhpcy5sb2FkUGljKCdJTlYyXycgKyBuYW1lKTtcbiAgICB3ZWFwb24uZmxhc2hlcyA9IG5ldyBBcnJheSg1KTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDU7IGkrKylcbiAgICAgICAgd2VhcG9uLmZsYXNoZXNbaV0gPSB0aGlzLmxvYWRQaWMoJ0lOVkEnICsgKGkgKyAxKSArICdfJyArIG5hbWUpO1xuICAgIHJldHVybiB3ZWFwb247XG59O1xuXG5TdGF0dXNCYXIucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihwKSB7XG4gICAgdGhpcy5zcHJpdGVzLmNsZWFyKCk7XG5cbiAgICB2YXIgbGVmdCA9IGdsLndpZHRoIC8gMiAtIDE2MDtcbiAgICB0aGlzLmRyYXdQaWModGhpcy5iYWNrZ3JvdW5kLCBsZWZ0LCBnbC5oZWlnaHQgLSAyOCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA3OyBpKyspXG4gICAgICAgIHRoaXMuZHJhd1BpYyh0aGlzLndlYXBvbnNbaV0ub3duZWQsIGxlZnQgKyBpICogMjQsIGdsLmhlaWdodCAtIDQyKTtcblxuICAgIHRoaXMuc3ByaXRlcy5yZW5kZXIoYXNzZXRzLnNoYWRlcnMuY29sb3IyZCwgcCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBTdGF0dXNCYXI7XG59KS5jYWxsKHRoaXMscmVxdWlyZShcIjFZaVo1U1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL3VpL3N0YXR1c2Jhci5qc1wiLFwiL3VpXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIFV0aWxzID0ge307XG5cblV0aWxzLmdldEV4dGVuc2lvbiA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgICB2YXIgaW5kZXggPSBwYXRoLmxhc3RJbmRleE9mKCcuJyk7XG4gICAgaWYgKGluZGV4ID09PSAtMSkgcmV0dXJuICcnO1xuICAgIHJldHVybiBwYXRoLnN1YnN0cihpbmRleCArIDEpO1xufTtcblxuVXRpbHMudHJpYW5ndWxhdGUgPSBmdW5jdGlvbihwb2ludHMpIHtcbiAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgcG9pbnRzLnBvcCgpO1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgcG9pbnRzLmxlbmd0aCAtIDI7IGkgKz0gMikge1xuICAgICAgICByZXN1bHQucHVzaChwb2ludHNbaSArIDJdKTtcbiAgICAgICAgcmVzdWx0LnB1c2gocG9pbnRzW2ldKTtcbiAgICAgICAgcmVzdWx0LnB1c2gocG9pbnRzWzBdKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cblV0aWxzLnF1YWtlSWRlbnRpdHkgPSBmdW5jdGlvbihhKSB7XG4gICAgYVswXSA9IDA7IGFbNF0gPSAxOyBhWzhdID0gMDsgYVsxMl0gPSAwO1xuICAgIGFbMV0gPSAwOyBhWzVdID0gMDsgYVs5XSA9IC0xOyBhWzEzXSA9IDA7XG4gICAgYVsyXSA9IC0xOyBhWzZdID0gMDsgYVsxMF0gPSAwOyBhWzE0XSA9IDA7XG4gICAgYVszXSA9IDA7IGFbN10gPSAwOyBhWzExXSA9IDA7IGFbMTVdID0gMTtcbiAgICByZXR1cm4gYTtcbn07XG5cblV0aWxzLmRlZzJSYWQgPSBmdW5jdGlvbihkZWdyZWVzKSB7XG4gICAgcmV0dXJuIGRlZ3JlZXMgKiBNYXRoLlBJIC8gMTgwO1xufTtcblxuVXRpbHMucmFkMkRlZyA9IGZ1bmN0aW9uKGRlZ3JlZXMpIHtcbiAgICByZXR1cm4gZGVncmVlcyAvIE1hdGguUEkgKiAxODA7XG59O1xuXG5cblV0aWxzLmlzUG93ZXJPZjIgPSBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuICh4ICYgKHggLSAxKSkgPT0gMDtcbn07XG5cblV0aWxzLm5leHRQb3dlck9mMiA9IGZ1bmN0aW9uKHgpIHtcbiAgICAtLXg7XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCAzMjsgaSA8PD0gMSkge1xuICAgICAgICB4ID0geCB8IHggPj4gaTtcbiAgICB9XG4gICAgcmV0dXJuIHggKyAxO1xufTtcblxuVXRpbHMuYXJyYXkxZCA9IGZ1bmN0aW9uKHdpZHRoKSB7XG4gICAgdmFyIHJlc3VsdCA9IG5ldyBBcnJheSh3aWR0aCk7XG4gICAgZm9yICh2YXIgeCA9IDA7IHggPCB3aWR0aDsgeCsrKSByZXN1bHRbeF0gPSAwO1xuICAgIHJldHVybiByZXN1bHQ7XG59O1xuXG5VdGlscy5hcnJheTJkID0gZnVuY3Rpb24od2lkdGgsIGhlaWdodCkge1xuICAgIHZhciByZXN1bHQgPSBuZXcgQXJyYXkoaGVpZ2h0KTtcbiAgICBmb3IgKHZhciB5ID0gMDsgeSA8IGhlaWdodDsgeSsrKSB7XG4gICAgICAgIHJlc3VsdFt5XSA9IG5ldyBBcnJheSh3aWR0aCk7XG4gICAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgd2lkdGg7IHgrKylcbiAgICAgICAgICAgIHJlc3VsdFt5XVt4XSA9IDA7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBVdGlscztcblxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIjFZaVo1U1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL3V0aWxzLmpzXCIsXCIvXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIE1hcCA9IHJlcXVpcmUoJ21hcCcpO1xudmFyIE1vZGVsID0gcmVxdWlyZSgnbW9kZWwnKTtcbnZhciBhc3NldHMgPSByZXF1aXJlKCdhc3NldHMnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJ3V0aWxzJyk7XG5cbnZhciBXb3JsZCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMubW9kZWxzID0gWydkdW1teSddO1xuICAgIHRoaXMuc3RhdGljcyA9IFtdO1xuICAgIHRoaXMuZW50aXRpZXMgPSBbXTtcbiAgICB0aGlzLm1hcCA9IG51bGw7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDEwMjQ7IGkrKykge1xuICAgICAgICB2YXIgZW50aXR5ID0ge1xuICAgICAgICAgICAgc3RhdGU6IHsgYW5nbGVzOiB2ZWMzLmNyZWF0ZSgpLCBvcmlnaW46IHZlYzMuY3JlYXRlKCkgfSxcbiAgICAgICAgICAgIHByaW9yU3RhdGU6IHsgYW5nbGVzOiB2ZWMzLmNyZWF0ZSgpLCBvcmlnaW46IHZlYzMuY3JlYXRlKCkgfSxcbiAgICAgICAgICAgIG5leHRTdGF0ZTogeyBhbmdsZXM6IHZlYzMuY3JlYXRlKCksIG9yaWdpbjogdmVjMy5jcmVhdGUoKSB9XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZW50aXRpZXMucHVzaChlbnRpdHkpO1xuICAgIH1cbn07XG5cbldvcmxkLnByb3RvdHlwZS5sb2FkTW9kZWwgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIHR5cGUgPSB1dGlscy5nZXRFeHRlbnNpb24obmFtZSk7XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgIGNhc2UgJ2JzcCc6XG4gICAgICAgICAgICB2YXIgbW9kZWwgPSBuZXcgTWFwKGFzc2V0cy5sb2FkKCdwYWsvJyArIG5hbWUpKTtcbiAgICAgICAgICAgIHRoaXMubW9kZWxzLnB1c2gobW9kZWwpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLm1hcCkgeyB0aGlzLm1hcCA9IG1vZGVsOyB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnbWRsJzpcbiAgICAgICAgICAgIHRoaXMubW9kZWxzLnB1c2gobmV3IE1vZGVsKGFzc2V0cy5sb2FkKCdwYWsvJyArIG5hbWUpKSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRoaXMubW9kZWxzLnB1c2gobnVsbCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG59O1xuXG5Xb3JsZC5wcm90b3R5cGUuc3Bhd25TdGF0aWMgPSBmdW5jdGlvbihiYXNlbGluZSkge1xuICAgIHZhciBlbnRpdHkgPSB7IHN0YXRlOiBiYXNlbGluZSB9O1xuICAgIHRoaXMuc3RhdGljcy5wdXNoKGVudGl0eSk7XG59O1xuXG5Xb3JsZC5wcm90b3R5cGUuc3Bhd25FbnRpdHkgPSBmdW5jdGlvbihpZCwgYmFzZWxpbmUpIHtcbiAgICB0aGlzLmVudGl0aWVzW2lkXS5zdGF0ZSA9IGJhc2VsaW5lO1xufTtcblxuV29ybGQucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGR0KSB7XG5cbiAgICBmb3IgKHZhciBlID0gMDsgZSA8IHRoaXMuZW50aXRpZXMubGVuZ3RoOyBlKyspIHtcbiAgICAgICAgdmFyIGVudGl0eSA9IHRoaXMuZW50aXRpZXNbZV07XG4gICAgICAgIGlmICghZW50aXR5KSBjb250aW51ZTtcblxuICAgICAgICBmb3IgKHZhciBjID0gMDsgYyA8IDM7IGMrKykge1xuICAgICAgICAgICAgdmFyIGRwID0gZW50aXR5Lm5leHRTdGF0ZS5vcmlnaW5bY10gLSBlbnRpdHkucHJpb3JTdGF0ZS5vcmlnaW5bY107XG4gICAgICAgICAgICBlbnRpdHkuc3RhdGUub3JpZ2luW2NdID0gZW50aXR5LnByaW9yU3RhdGUub3JpZ2luW2NdICsgZHAgKiBkdDtcblxuICAgICAgICAgICAgdmFyIGRhID0gZW50aXR5Lm5leHRTdGF0ZS5hbmdsZXNbY10gLSBlbnRpdHkucHJpb3JTdGF0ZS5hbmdsZXNbY107XG4gICAgICAgICAgICBpZiAoZGEgPiAxODApIGRhIC09IDM2MDtcbiAgICAgICAgICAgIGVsc2UgaWYgKGRhIDwgLTE4MCkgZGEgKz0gMzYwO1xuICAgICAgICAgICAgZW50aXR5LnN0YXRlLmFuZ2xlc1tjXSA9IGVudGl0eS5wcmlvclN0YXRlLmFuZ2xlc1tjXSArIGRhICogZHQ7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5Xb3JsZC5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKHAsIHZpZXdFbnRpdHkpIHtcbiAgICB2YXIgbSA9IHV0aWxzLnF1YWtlSWRlbnRpdHkobWF0NC5jcmVhdGUoKSk7XG4gICAgdmFyIGVudGl0eSA9IHRoaXMuZW50aXRpZXNbdmlld0VudGl0eV07XG4gICAgdmFyIG9yaWdpbiA9IGVudGl0eS5zdGF0ZS5vcmlnaW47XG4gICAgdmFyIGFuZ2xlcyA9IGVudGl0eS5zdGF0ZS5hbmdsZXM7XG4gICAgbWF0NC5yb3RhdGVZKG0sIG0sIHV0aWxzLmRlZzJSYWQoLWFuZ2xlc1swXSkpO1xuICAgIG1hdDQucm90YXRlWihtLCBtLCB1dGlscy5kZWcyUmFkKC1hbmdsZXNbMV0pKTtcbiAgICBtYXQ0LnRyYW5zbGF0ZShtLCBtLCBbLW9yaWdpblswXSwgLW9yaWdpblsxXSwgLW9yaWdpblsyXV0pO1xuICAgIHRoaXMubWFwLmRyYXcocCwgbSk7XG5cbiAgICB0aGlzLmRyYXdTdGF0aWNzKHAsIG0pO1xuICAgIHRoaXMuZHJhd0VudGl0aWVzKHAsIG0sIHZpZXdFbnRpdHkpO1xufTtcblxuV29ybGQucHJvdG90eXBlLmRyYXdTdGF0aWNzID0gZnVuY3Rpb24ocCwgbSkge1xuICAgIHZhciBtbSA9IG1hdDQuY3JlYXRlKCk7XG4gICAgZm9yICh2YXIgcyA9IDA7IHMgPCB0aGlzLnN0YXRpY3MubGVuZ3RoOyBzKyspIHtcbiAgICAgICAgdmFyIHN0YXRlID0gdGhpcy5zdGF0aWNzW3NdLnN0YXRlO1xuICAgICAgICB2YXIgbW9kZWwgPSB0aGlzLm1vZGVsc1tzdGF0ZS5tb2RlbEluZGV4XTtcbiAgICAgICAgbWF0NC50cmFuc2xhdGUobW0sIG0sIHN0YXRlLm9yaWdpbik7XG4gICAgICAgIG1vZGVsLmRyYXcocCwgbW0sIDAsIDApO1xuICAgIH1cbn07XG5cbldvcmxkLnByb3RvdHlwZS5kcmF3RW50aXRpZXMgPSBmdW5jdGlvbihwLCBtLCB2aWV3RW50aXR5KSB7XG4gICAgdmFyIG1tID0gbWF0NC5jcmVhdGUoKTtcbiAgICBmb3IgKHZhciBlID0gMDsgZSA8IHRoaXMuZW50aXRpZXMubGVuZ3RoOyBlKyspIHtcbiAgICAgICAgaWYgKGUgPT09IHZpZXdFbnRpdHkpXG4gICAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLmVudGl0aWVzW2VdLnN0YXRlO1xuICAgICAgICB2YXIgbW9kZWwgPSB0aGlzLm1vZGVsc1tzdGF0ZS5tb2RlbEluZGV4XTtcbiAgICAgICAgaWYgKG1vZGVsKSB7XG4gICAgICAgICAgICB2YXIgbW0gPSBtYXQ0LnRyYW5zbGF0ZShtbSwgbSwgc3RhdGUub3JpZ2luKTtcbiAgICAgICAgICAgIG1hdDQucm90YXRlWihtbSwgbW0sIHV0aWxzLmRlZzJSYWQoc3RhdGUuYW5nbGVzWzFdKSk7XG4gICAgICAgICAgICBtb2RlbC5kcmF3KHAsIG1tLCAwLCBzdGF0ZS5mcmFtZSk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBXb3JsZDtcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiMVlpWjVTXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvd29ybGQuanNcIixcIi9cIikiXX0=
