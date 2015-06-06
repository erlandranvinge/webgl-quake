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
    var m = utils.quakeIdentity(mat4.create());
    mat4.rotateY(m, m, utils.deg2Rad(-this.client.viewAngles[0]));
    mat4.rotateZ(m, m, utils.deg2Rad(-this.client.viewAngles[1]));

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

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    this.statusBar.draw(this.ortho);
};

// Temp. controller.
Quake.prototype.handleInput = function() {
    if (this.client.viewEntity === -1)
        return;
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





}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/fake_3b789766.js","/")
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
var Map = require('map');
var Model = require('model');
var utils = require('utils');

var Client = function() {
    this.priorViewAngles = vec3.create();
    this.viewAngles = vec3.create();
    this.nextViewAngles = vec3.create();
    this.viewEntity = -1;
    this.time = { serverTime: -1, oldClientTime: -1, clientTime: -1 };


    // TEMPORARY.
    this.map = null;
    this.entities = [];
    this.statics = [];
    this.models = ['dummy'];
    for (var i = 0; i < 1024; i++) {
        var entity = {
            state: { angles: vec3.create(), origin: vec3.create() },
            priorState: { angles: vec3.create(), origin: vec3.create() },
            nextState: { angles: vec3.create(), origin: vec3.create() }
        };
        this.entities.push(entity);
    }
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

    for (var i = 0; i < 3; i++) {
        this.priorViewAngles[i] = this.nextViewAngles[i];
        this.nextViewAngles[i] = demo.readFloat();
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
                this.time.serverTime = msg.readFloat();
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
                var baseline = this.parseBaseline(msg);
                var entity = { state: baseline };
                this.statics.push(entity);
                break;
            case Protocol.serverKilledMonster:
                break;
            case Protocol.serverDamage:
                this.parseDamage(msg);
                break;
            case Protocol.serverFoundSecret:
                break;
            case Protocol.serverSpawnBaseline:
                var entityNo = msg.readInt16();
                this.entities[entityNo].state = this.parseBaseline(msg);
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
    this.time.oldClientTime = this.time.clientTime;
    this.time.clientTime = time / 1000;

    if (this.time.clientTime > this.time.serverTime)
        this.readFromServer();


    var dt = this.time.clientTime - this.time.oldClientTime;

    for (var a = 0; a < 3; a++) {
        var deltaAngle = this.nextViewAngles[a] - this.priorViewAngles[a];
        if (deltaAngle > 180)
            deltaAngle -= 360;
        else if (deltaAngle < -180)
            deltaAngle += 360;
        this.viewAngles[a] = this.priorViewAngles[a] + deltaAngle * dt;
    }


    // TODO: Move to entities.js or similar.
    for (var i = 0; i < this.entities.length; i++) {
        var entity = this.entities[i];
        for (var j = 0; j < 3; j++) {
            entity.state.origin[j] = entity.priorState.origin[j] +
            (entity.nextState.origin[j] - entity.priorState.origin[j]) * dt;
            entity.state.angles[j] = entity.priorState.angles[j] +
            (entity.nextState.angles[j] - entity.priorState.angles[j]) * dt;
        }
    }
};

Client.prototype.parseServerInfo = function(msg) {
    msg.skip(6);
    var mapName = msg.readCString();

    while(true) {
        var modelName = msg.readCString();
        if (!modelName) break;
        var type = utils.getExtension(modelName);
        switch (type) {
            case 'bsp':
                var model = new Map(assets.load('pak/' + modelName));
                this.models.push(model);
                if (!this.map) { this.map = model; }
                break;
            case 'mdl':
                this.models.push(new Model(assets.load('pak/' + modelName)));
                break;
            default:
                this.models.push(null);
                break;

        }
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


    var entity = this.entities[entityNo];
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
},{"1YiZ5S":5,"assets":6,"buffer":2,"map":25,"model":26,"protocol":27,"utils":31}],8:[function(require,module,exports){
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
},{"1YiZ5S":5,"buffer":2}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9lcmxhbmRyYW52aW5nZS9naXQvd2ViZ2wtcXVha2Uvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2VybGFuZHJhbnZpbmdlL2dpdC93ZWJnbC1xdWFrZS9qcy9mYWtlXzNiNzg5NzY2LmpzIiwiL1VzZXJzL2VybGFuZHJhbnZpbmdlL2dpdC93ZWJnbC1xdWFrZS9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9idWZmZXIvaW5kZXguanMiLCIvVXNlcnMvZXJsYW5kcmFudmluZ2UvZ2l0L3dlYmdsLXF1YWtlL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2J1ZmZlci9ub2RlX21vZHVsZXMvYmFzZTY0LWpzL2xpYi9iNjQuanMiLCIvVXNlcnMvZXJsYW5kcmFudmluZ2UvZ2l0L3dlYmdsLXF1YWtlL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2J1ZmZlci9ub2RlX21vZHVsZXMvaWVlZTc1NC9pbmRleC5qcyIsIi9Vc2Vycy9lcmxhbmRyYW52aW5nZS9naXQvd2ViZ2wtcXVha2Uvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwianMvYXNzZXRzLmpzIiwianMvY2xpZW50LmpzIiwianMvZmlsZS5qcyIsImpzL2Zvcm1hdHMvYnNwLmpzIiwianMvZm9ybWF0cy9tZGwuanMiLCJqcy9mb3JtYXRzL3Bhay5qcyIsImpzL2Zvcm1hdHMvcGFsZXR0ZS5qcyIsImpzL2Zvcm1hdHMvd2FkLmpzIiwianMvZ2wvVGV4dHVyZS5qcyIsImpzL2dsL2F0bGFzLmpzIiwianMvZ2wvZm9udC5qcyIsImpzL2dsL2dsLmpzIiwianMvZ2wvbGlnaHRtYXAuanMiLCJqcy9nbC9zaGFkZXIuanMiLCJqcy9nbC9zcHJpdGVzLmpzIiwianMvZ2wvdGV4dHVyZS5qcyIsImpzL2lucHV0LmpzIiwianMvbGliL2dsLW1hdHJpeC1taW4uanMiLCJqcy9saWdodG1hcHMuanMiLCJqcy9tYXAuanMiLCJqcy9tb2RlbC5qcyIsImpzL3Byb3RvY29sLmpzIiwianMvc2V0dGluZ3MuanMiLCJqcy91aS9jb25zb2xlLmpzIiwianMvdWkvc3RhdHVzYmFyLmpzIiwianMvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2bENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMVdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG5cbnZhciB3ZWJnbCA9IHJlcXVpcmUoJ2dsL2dsJyk7XG52YXIgYXNzZXRzID0gcmVxdWlyZSgnYXNzZXRzJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCd1dGlscycpO1xudmFyIElucHV0ID0gcmVxdWlyZSgnaW5wdXQnKTtcbnZhciBDb25zb2xlID0gcmVxdWlyZSgndWkvY29uc29sZScpO1xudmFyIFN0YXR1c0JhciA9IHJlcXVpcmUoJ3VpL3N0YXR1c2JhcicpO1xudmFyIENsaWVudCA9IHJlcXVpcmUoJ2NsaWVudCcpO1xuXG5pZiAoIXdpbmRvdy5yZXF1ZXN0RnJhbWUpIHtcbiAgICB3aW5kb3cucmVxdWVzdEZyYW1lID0gKCBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICAgIHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICAgIHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICAgIHdpbmRvdy5vUmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICAgICB3aW5kb3cubXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KCBjYWxsYmFjaywgMTAwMCAvIDYwICk7XG4gICAgICAgICAgICB9O1xuICAgIH0pKCk7XG59XG5cblF1YWtlID0gZnVuY3Rpb24oKSB7fTtcblxudmFyIHRpY2sgPSBmdW5jdGlvbih0aW1lKSB7XG4gICAgcmVxdWVzdEZyYW1lKHRpY2spO1xuICAgIFF1YWtlLmluc3RhbmNlLnRpY2sodGltZSk7XG59O1xuXG5RdWFrZS5wcm90b3R5cGUudGljayA9IGZ1bmN0aW9uKHRpbWUpIHtcblxuICAgIHRoaXMuY2xpZW50LnVwZGF0ZSh0aW1lKTtcbiAgICB0aGlzLmhhbmRsZUlucHV0KCk7XG5cbiAgICBnbC5jbGVhcihnbC5DT0xPUl9CVUZGRVJfQklUIHwgZ2wuREVQVEhfQlVGRkVSX0JJVCk7XG4gICAgZ2wuZW5hYmxlKGdsLkRFUFRIX1RFU1QpO1xuICAgIGdsLmRpc2FibGUoZ2wuQkxFTkQpO1xuICAgIHZhciBtID0gdXRpbHMucXVha2VJZGVudGl0eShtYXQ0LmNyZWF0ZSgpKTtcbiAgICBtYXQ0LnJvdGF0ZVkobSwgbSwgdXRpbHMuZGVnMlJhZCgtdGhpcy5jbGllbnQudmlld0FuZ2xlc1swXSkpO1xuICAgIG1hdDQucm90YXRlWihtLCBtLCB1dGlscy5kZWcyUmFkKC10aGlzLmNsaWVudC52aWV3QW5nbGVzWzFdKSk7XG5cbiAgICBpZiAodGhpcy5jbGllbnQudmlld0VudGl0eSAhPT0gLTEpIHtcbiAgICAgICAgdmFyIHBvcyA9IHRoaXMuY2xpZW50LmVudGl0aWVzW3RoaXMuY2xpZW50LnZpZXdFbnRpdHldLm5leHRTdGF0ZS5vcmlnaW47XG4gICAgICAgIG1hdDQudHJhbnNsYXRlKG0sIG0sIFstcG9zWzBdLCAtcG9zWzFdLCAtcG9zWzJdXSk7XG5cbiAgICAgICAgaWYgKHRoaXMuY2xpZW50Lm1hcCkge1xuICAgICAgICAgICAgdGhpcy5jbGllbnQubWFwLmRyYXcodGhpcy5wcm9qZWN0aW9uLCBtKTtcblxuICAgICAgICAgICAgdmFyIG1vZGVscyA9IHRoaXMuY2xpZW50Lm1vZGVscztcblxuICAgICAgICAgICAgdmFyIG1tID0gbWF0NC5jcmVhdGUoKTtcblxuICAgICAgICAgICAgdmFyIHN0YXRpY3MgPSB0aGlzLmNsaWVudC5zdGF0aWNzO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdGF0aWNzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN0YXRlID0gc3RhdGljc1tpXS5zdGF0ZTtcbiAgICAgICAgICAgICAgICB2YXIgbW9kZWwgPSBtb2RlbHNbc3RhdGUubW9kZWxJbmRleF07XG4gICAgICAgICAgICAgICAgdmFyIG1tID0gbWF0NC50cmFuc2xhdGUobW0sIG0sIHN0YXRlLm9yaWdpbik7XG4gICAgICAgICAgICAgICAgbW9kZWwuZHJhdyh0aGlzLnByb2plY3Rpb24sIG1tLCAwLCAwKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGVudGl0aWVzID0gdGhpcy5jbGllbnQuZW50aXRpZXM7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVudGl0aWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGkgPT09IHRoaXMuY2xpZW50LnZpZXdFbnRpdHkpXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICAgICAgdmFyIHN0YXRlID0gZW50aXRpZXNbaV0uc3RhdGU7XG4gICAgICAgICAgICAgICAgdmFyIG1vZGVsID0gbW9kZWxzW3N0YXRlLm1vZGVsSW5kZXhdO1xuICAgICAgICAgICAgICAgIGlmIChtb2RlbCkge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1tID0gbWF0NC50cmFuc2xhdGUobW0sIG0sIHN0YXRlLm9yaWdpbik7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXQ0LnJvdGF0ZVoobW0sIG1tLCB1dGlscy5kZWcyUmFkKHN0YXRlLmFuZ2xlc1sxXSkpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlbC5kcmF3KHRoaXMucHJvamVjdGlvbiwgbW0sIDAsIHN0YXRlLmZyYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkgeyBjb25zb2xlLmxvZyhlKTsgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2wuZGlzYWJsZShnbC5ERVBUSF9URVNUKTtcbiAgICBnbC5kaXNhYmxlKGdsLkNVTExfRkFDRSk7XG4gICAgZ2wuZW5hYmxlKGdsLkJMRU5EKTtcbiAgICB0aGlzLnN0YXR1c0Jhci5kcmF3KHRoaXMub3J0aG8pO1xufTtcblxuLy8gVGVtcC4gY29udHJvbGxlci5cblF1YWtlLnByb3RvdHlwZS5oYW5kbGVJbnB1dCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLmNsaWVudC52aWV3RW50aXR5ID09PSAtMSlcbiAgICAgICAgcmV0dXJuO1xuICAgIHZhciBhbmdsZSA9IHV0aWxzLmRlZzJSYWQodGhpcy5jbGllbnQudmlld0FuZ2xlc1sxXSk7XG4gICAgdmFyIHBvc2l0aW9uID0gdGhpcy5jbGllbnQuZW50aXRpZXNbdGhpcy5jbGllbnQudmlld0VudGl0eV0ubmV4dFN0YXRlLm9yaWdpbjtcbiAgICB2YXIgc3BlZWQgPSA1LjA7XG5cbiAgICBpZiAodGhpcy5pbnB1dC5sZWZ0KVxuICAgICAgICB0aGlzLmNsaWVudC52aWV3QW5nbGVzWzFdIC09IDI7XG4gICAgaWYgKHRoaXMuaW5wdXQucmlnaHQpXG4gICAgICAgIHRoaXMuY2xpZW50LnZpZXdBbmdsZXNbMV0gKz0gMjtcbiAgICBpZiAodGhpcy5pbnB1dC51cCkge1xuICAgICAgICB0aGlzLmNsaWVudC5kZW1vID0gbnVsbDtcbiAgICAgICAgcG9zaXRpb25bMF0gKz0gTWF0aC5jb3MoYW5nbGUpICogc3BlZWQ7XG4gICAgICAgIHBvc2l0aW9uWzFdIC09IE1hdGguc2luKGFuZ2xlKSAqIHNwZWVkO1xuICAgIH1cbiAgICBpZiAodGhpcy5pbnB1dC5kb3duKSB7XG4gICAgICAgIHBvc2l0aW9uWzBdIC09IE1hdGguY29zKGFuZ2xlKSAqIHNwZWVkO1xuICAgICAgICBwb3NpdGlvblsxXSArPSBNYXRoLnNpbihhbmdsZSkgKiBzcGVlZDtcbiAgICB9XG4gICAgaWYgKHRoaXMuaW5wdXQuZmx5VXApXG4gICAgICAgIHBvc2l0aW9uWzJdICs9IDEwO1xuICAgIGlmICh0aGlzLmlucHV0LmZseURvd24pXG4gICAgICAgIHBvc2l0aW9uWzJdIC09IDEwO1xufTtcblxuUXVha2UucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgUXVha2UuaW5zdGFuY2UgPSB0aGlzO1xuICAgIHdlYmdsLmluaXQoJ2NhbnZhcycpO1xuICAgIHRoaXMub3J0aG8gPSBtYXQ0Lm9ydGhvKG1hdDQuY3JlYXRlKCksIDAsIGdsLndpZHRoLCBnbC5oZWlnaHQsIDAsIC0xMCwgMTApO1xuICAgIHRoaXMucHJvamVjdGlvbiA9IG1hdDQucGVyc3BlY3RpdmUobWF0NC5jcmVhdGUoKSwgNjguMDMsIGdsLndpZHRoIC8gZ2wuaGVpZ2h0LCAwLjEsIDQwOTYpO1xuXG4gICAgYXNzZXRzLmFkZCgnZGF0YS9wYWswLnBhaycpO1xuICAgIGFzc2V0cy5hZGQoJ3NoYWRlcnMvY29sb3IyZC5zaGFkZXInKTtcbiAgICBhc3NldHMuYWRkKCdzaGFkZXJzL21vZGVsLnNoYWRlcicpO1xuICAgIGFzc2V0cy5hZGQoJ3NoYWRlcnMvdGV4dHVyZTJkLnNoYWRlcicpO1xuICAgIGFzc2V0cy5hZGQoJ3NoYWRlcnMvd29ybGQuc2hhZGVyJyk7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgYXNzZXRzLnByZWNhY2hlKGZ1bmN0aW9uKCkge1xuICAgICAgICBzZWxmLmNvbnNvbGUgPSBuZXcgQ29uc29sZSgpO1xuICAgICAgICBzZWxmLnN0YXR1c0JhciA9IG5ldyBTdGF0dXNCYXIoKTtcbiAgICAgICAgc2VsZi5pbnB1dCA9IG5ldyBJbnB1dCgpO1xuICAgICAgICBzZWxmLmNsaWVudCA9IG5ldyBDbGllbnQoKTtcbiAgICAgICAgc2VsZi5jbGllbnQucGxheURlbW8oJ2RlbW8xLmRlbScpO1xuICAgICAgICB0aWNrKCk7XG4gICAgfSk7XG59O1xuXG5cblxuXG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiMVlpWjVTXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvZmFrZV8zYjc4OTc2Ni5qc1wiLFwiL1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8qIVxuICogVGhlIGJ1ZmZlciBtb2R1bGUgZnJvbSBub2RlLmpzLCBmb3IgdGhlIGJyb3dzZXIuXG4gKlxuICogQGF1dGhvciAgIEZlcm9zcyBBYm91a2hhZGlqZWggPGZlcm9zc0BmZXJvc3Mub3JnPiA8aHR0cDovL2Zlcm9zcy5vcmc+XG4gKiBAbGljZW5zZSAgTUlUXG4gKi9cblxudmFyIGJhc2U2NCA9IHJlcXVpcmUoJ2Jhc2U2NC1qcycpXG52YXIgaWVlZTc1NCA9IHJlcXVpcmUoJ2llZWU3NTQnKVxuXG5leHBvcnRzLkJ1ZmZlciA9IEJ1ZmZlclxuZXhwb3J0cy5TbG93QnVmZmVyID0gQnVmZmVyXG5leHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTID0gNTBcbkJ1ZmZlci5wb29sU2l6ZSA9IDgxOTJcblxuLyoqXG4gKiBJZiBgQnVmZmVyLl91c2VUeXBlZEFycmF5c2A6XG4gKiAgID09PSB0cnVlICAgIFVzZSBVaW50OEFycmF5IGltcGxlbWVudGF0aW9uIChmYXN0ZXN0KVxuICogICA9PT0gZmFsc2UgICBVc2UgT2JqZWN0IGltcGxlbWVudGF0aW9uIChjb21wYXRpYmxlIGRvd24gdG8gSUU2KVxuICovXG5CdWZmZXIuX3VzZVR5cGVkQXJyYXlzID0gKGZ1bmN0aW9uICgpIHtcbiAgLy8gRGV0ZWN0IGlmIGJyb3dzZXIgc3VwcG9ydHMgVHlwZWQgQXJyYXlzLiBTdXBwb3J0ZWQgYnJvd3NlcnMgYXJlIElFIDEwKywgRmlyZWZveCA0KyxcbiAgLy8gQ2hyb21lIDcrLCBTYWZhcmkgNS4xKywgT3BlcmEgMTEuNissIGlPUyA0LjIrLiBJZiB0aGUgYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IGFkZGluZ1xuICAvLyBwcm9wZXJ0aWVzIHRvIGBVaW50OEFycmF5YCBpbnN0YW5jZXMsIHRoZW4gdGhhdCdzIHRoZSBzYW1lIGFzIG5vIGBVaW50OEFycmF5YCBzdXBwb3J0XG4gIC8vIGJlY2F1c2Ugd2UgbmVlZCB0byBiZSBhYmxlIHRvIGFkZCBhbGwgdGhlIG5vZGUgQnVmZmVyIEFQSSBtZXRob2RzLiBUaGlzIGlzIGFuIGlzc3VlXG4gIC8vIGluIEZpcmVmb3ggNC0yOS4gTm93IGZpeGVkOiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD02OTU0MzhcbiAgdHJ5IHtcbiAgICB2YXIgYnVmID0gbmV3IEFycmF5QnVmZmVyKDApXG4gICAgdmFyIGFyciA9IG5ldyBVaW50OEFycmF5KGJ1ZilcbiAgICBhcnIuZm9vID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gNDIgfVxuICAgIHJldHVybiA0MiA9PT0gYXJyLmZvbygpICYmXG4gICAgICAgIHR5cGVvZiBhcnIuc3ViYXJyYXkgPT09ICdmdW5jdGlvbicgLy8gQ2hyb21lIDktMTAgbGFjayBgc3ViYXJyYXlgXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufSkoKVxuXG4vKipcbiAqIENsYXNzOiBCdWZmZXJcbiAqID09PT09PT09PT09PT1cbiAqXG4gKiBUaGUgQnVmZmVyIGNvbnN0cnVjdG9yIHJldHVybnMgaW5zdGFuY2VzIG9mIGBVaW50OEFycmF5YCB0aGF0IGFyZSBhdWdtZW50ZWRcbiAqIHdpdGggZnVuY3Rpb24gcHJvcGVydGllcyBmb3IgYWxsIHRoZSBub2RlIGBCdWZmZXJgIEFQSSBmdW5jdGlvbnMuIFdlIHVzZVxuICogYFVpbnQ4QXJyYXlgIHNvIHRoYXQgc3F1YXJlIGJyYWNrZXQgbm90YXRpb24gd29ya3MgYXMgZXhwZWN0ZWQgLS0gaXQgcmV0dXJuc1xuICogYSBzaW5nbGUgb2N0ZXQuXG4gKlxuICogQnkgYXVnbWVudGluZyB0aGUgaW5zdGFuY2VzLCB3ZSBjYW4gYXZvaWQgbW9kaWZ5aW5nIHRoZSBgVWludDhBcnJheWBcbiAqIHByb3RvdHlwZS5cbiAqL1xuZnVuY3Rpb24gQnVmZmVyIChzdWJqZWN0LCBlbmNvZGluZywgbm9aZXJvKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBCdWZmZXIpKVxuICAgIHJldHVybiBuZXcgQnVmZmVyKHN1YmplY3QsIGVuY29kaW5nLCBub1plcm8pXG5cbiAgdmFyIHR5cGUgPSB0eXBlb2Ygc3ViamVjdFxuXG4gIC8vIFdvcmthcm91bmQ6IG5vZGUncyBiYXNlNjQgaW1wbGVtZW50YXRpb24gYWxsb3dzIGZvciBub24tcGFkZGVkIHN0cmluZ3NcbiAgLy8gd2hpbGUgYmFzZTY0LWpzIGRvZXMgbm90LlxuICBpZiAoZW5jb2RpbmcgPT09ICdiYXNlNjQnICYmIHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgc3ViamVjdCA9IHN0cmluZ3RyaW0oc3ViamVjdClcbiAgICB3aGlsZSAoc3ViamVjdC5sZW5ndGggJSA0ICE9PSAwKSB7XG4gICAgICBzdWJqZWN0ID0gc3ViamVjdCArICc9J1xuICAgIH1cbiAgfVxuXG4gIC8vIEZpbmQgdGhlIGxlbmd0aFxuICB2YXIgbGVuZ3RoXG4gIGlmICh0eXBlID09PSAnbnVtYmVyJylcbiAgICBsZW5ndGggPSBjb2VyY2Uoc3ViamVjdClcbiAgZWxzZSBpZiAodHlwZSA9PT0gJ3N0cmluZycpXG4gICAgbGVuZ3RoID0gQnVmZmVyLmJ5dGVMZW5ndGgoc3ViamVjdCwgZW5jb2RpbmcpXG4gIGVsc2UgaWYgKHR5cGUgPT09ICdvYmplY3QnKVxuICAgIGxlbmd0aCA9IGNvZXJjZShzdWJqZWN0Lmxlbmd0aCkgLy8gYXNzdW1lIHRoYXQgb2JqZWN0IGlzIGFycmF5LWxpa2VcbiAgZWxzZVxuICAgIHRocm93IG5ldyBFcnJvcignRmlyc3QgYXJndW1lbnQgbmVlZHMgdG8gYmUgYSBudW1iZXIsIGFycmF5IG9yIHN0cmluZy4nKVxuXG4gIHZhciBidWZcbiAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcbiAgICAvLyBQcmVmZXJyZWQ6IFJldHVybiBhbiBhdWdtZW50ZWQgYFVpbnQ4QXJyYXlgIGluc3RhbmNlIGZvciBiZXN0IHBlcmZvcm1hbmNlXG4gICAgYnVmID0gQnVmZmVyLl9hdWdtZW50KG5ldyBVaW50OEFycmF5KGxlbmd0aCkpXG4gIH0gZWxzZSB7XG4gICAgLy8gRmFsbGJhY2s6IFJldHVybiBUSElTIGluc3RhbmNlIG9mIEJ1ZmZlciAoY3JlYXRlZCBieSBgbmV3YClcbiAgICBidWYgPSB0aGlzXG4gICAgYnVmLmxlbmd0aCA9IGxlbmd0aFxuICAgIGJ1Zi5faXNCdWZmZXIgPSB0cnVlXG4gIH1cblxuICB2YXIgaVxuICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cyAmJiB0eXBlb2Ygc3ViamVjdC5ieXRlTGVuZ3RoID09PSAnbnVtYmVyJykge1xuICAgIC8vIFNwZWVkIG9wdGltaXphdGlvbiAtLSB1c2Ugc2V0IGlmIHdlJ3JlIGNvcHlpbmcgZnJvbSBhIHR5cGVkIGFycmF5XG4gICAgYnVmLl9zZXQoc3ViamVjdClcbiAgfSBlbHNlIGlmIChpc0FycmF5aXNoKHN1YmplY3QpKSB7XG4gICAgLy8gVHJlYXQgYXJyYXktaXNoIG9iamVjdHMgYXMgYSBieXRlIGFycmF5XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoQnVmZmVyLmlzQnVmZmVyKHN1YmplY3QpKVxuICAgICAgICBidWZbaV0gPSBzdWJqZWN0LnJlYWRVSW50OChpKVxuICAgICAgZWxzZVxuICAgICAgICBidWZbaV0gPSBzdWJqZWN0W2ldXG4gICAgfVxuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgYnVmLndyaXRlKHN1YmplY3QsIDAsIGVuY29kaW5nKVxuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdudW1iZXInICYmICFCdWZmZXIuX3VzZVR5cGVkQXJyYXlzICYmICFub1plcm8pIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGJ1ZltpXSA9IDBcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYnVmXG59XG5cbi8vIFNUQVRJQyBNRVRIT0RTXG4vLyA9PT09PT09PT09PT09PVxuXG5CdWZmZXIuaXNFbmNvZGluZyA9IGZ1bmN0aW9uIChlbmNvZGluZykge1xuICBzd2l0Y2ggKFN0cmluZyhlbmNvZGluZykudG9Mb3dlckNhc2UoKSkge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICBjYXNlICdiaW5hcnknOlxuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgY2FzZSAncmF3JzpcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0dXJuIHRydWVcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuQnVmZmVyLmlzQnVmZmVyID0gZnVuY3Rpb24gKGIpIHtcbiAgcmV0dXJuICEhKGIgIT09IG51bGwgJiYgYiAhPT0gdW5kZWZpbmVkICYmIGIuX2lzQnVmZmVyKVxufVxuXG5CdWZmZXIuYnl0ZUxlbmd0aCA9IGZ1bmN0aW9uIChzdHIsIGVuY29kaW5nKSB7XG4gIHZhciByZXRcbiAgc3RyID0gc3RyICsgJydcbiAgc3dpdGNoIChlbmNvZGluZyB8fCAndXRmOCcpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgICAgcmV0ID0gc3RyLmxlbmd0aCAvIDJcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgICAgcmV0ID0gdXRmOFRvQnl0ZXMoc3RyKS5sZW5ndGhcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYXNjaWknOlxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgY2FzZSAncmF3JzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGhcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIHJldCA9IGJhc2U2NFRvQnl0ZXMoc3RyKS5sZW5ndGhcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGggKiAyXG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZW5jb2RpbmcnKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuQnVmZmVyLmNvbmNhdCA9IGZ1bmN0aW9uIChsaXN0LCB0b3RhbExlbmd0aCkge1xuICBhc3NlcnQoaXNBcnJheShsaXN0KSwgJ1VzYWdlOiBCdWZmZXIuY29uY2F0KGxpc3QsIFt0b3RhbExlbmd0aF0pXFxuJyArXG4gICAgICAnbGlzdCBzaG91bGQgYmUgYW4gQXJyYXkuJylcblxuICBpZiAobGlzdC5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcigwKVxuICB9IGVsc2UgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgcmV0dXJuIGxpc3RbMF1cbiAgfVxuXG4gIHZhciBpXG4gIGlmICh0eXBlb2YgdG90YWxMZW5ndGggIT09ICdudW1iZXInKSB7XG4gICAgdG90YWxMZW5ndGggPSAwXG4gICAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRvdGFsTGVuZ3RoICs9IGxpc3RbaV0ubGVuZ3RoXG4gICAgfVxuICB9XG5cbiAgdmFyIGJ1ZiA9IG5ldyBCdWZmZXIodG90YWxMZW5ndGgpXG4gIHZhciBwb3MgPSAwXG4gIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGl0ZW0gPSBsaXN0W2ldXG4gICAgaXRlbS5jb3B5KGJ1ZiwgcG9zKVxuICAgIHBvcyArPSBpdGVtLmxlbmd0aFxuICB9XG4gIHJldHVybiBidWZcbn1cblxuLy8gQlVGRkVSIElOU1RBTkNFIE1FVEhPRFNcbi8vID09PT09PT09PT09PT09PT09PT09PT09XG5cbmZ1bmN0aW9uIF9oZXhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIG9mZnNldCA9IE51bWJlcihvZmZzZXQpIHx8IDBcbiAgdmFyIHJlbWFpbmluZyA9IGJ1Zi5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKCFsZW5ndGgpIHtcbiAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgfSBlbHNlIHtcbiAgICBsZW5ndGggPSBOdW1iZXIobGVuZ3RoKVxuICAgIGlmIChsZW5ndGggPiByZW1haW5pbmcpIHtcbiAgICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICAgIH1cbiAgfVxuXG4gIC8vIG11c3QgYmUgYW4gZXZlbiBudW1iZXIgb2YgZGlnaXRzXG4gIHZhciBzdHJMZW4gPSBzdHJpbmcubGVuZ3RoXG4gIGFzc2VydChzdHJMZW4gJSAyID09PSAwLCAnSW52YWxpZCBoZXggc3RyaW5nJylcblxuICBpZiAobGVuZ3RoID4gc3RyTGVuIC8gMikge1xuICAgIGxlbmd0aCA9IHN0ckxlbiAvIDJcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGJ5dGUgPSBwYXJzZUludChzdHJpbmcuc3Vic3RyKGkgKiAyLCAyKSwgMTYpXG4gICAgYXNzZXJ0KCFpc05hTihieXRlKSwgJ0ludmFsaWQgaGV4IHN0cmluZycpXG4gICAgYnVmW29mZnNldCArIGldID0gYnl0ZVxuICB9XG4gIEJ1ZmZlci5fY2hhcnNXcml0dGVuID0gaSAqIDJcbiAgcmV0dXJuIGlcbn1cblxuZnVuY3Rpb24gX3V0ZjhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcih1dGY4VG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbmZ1bmN0aW9uIF9hc2NpaVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cbiAgICBibGl0QnVmZmVyKGFzY2lpVG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbmZ1bmN0aW9uIF9iaW5hcnlXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBfYXNjaWlXcml0ZShidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIF9iYXNlNjRXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcihiYXNlNjRUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuZnVuY3Rpb24gX3V0ZjE2bGVXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcih1dGYxNmxlVG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbiAoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCwgZW5jb2RpbmcpIHtcbiAgLy8gU3VwcG9ydCBib3RoIChzdHJpbmcsIG9mZnNldCwgbGVuZ3RoLCBlbmNvZGluZylcbiAgLy8gYW5kIHRoZSBsZWdhY3kgKHN0cmluZywgZW5jb2RpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICBpZiAoaXNGaW5pdGUob2Zmc2V0KSkge1xuICAgIGlmICghaXNGaW5pdGUobGVuZ3RoKSkge1xuICAgICAgZW5jb2RpbmcgPSBsZW5ndGhcbiAgICAgIGxlbmd0aCA9IHVuZGVmaW5lZFxuICAgIH1cbiAgfSBlbHNlIHsgIC8vIGxlZ2FjeVxuICAgIHZhciBzd2FwID0gZW5jb2RpbmdcbiAgICBlbmNvZGluZyA9IG9mZnNldFxuICAgIG9mZnNldCA9IGxlbmd0aFxuICAgIGxlbmd0aCA9IHN3YXBcbiAgfVxuXG4gIG9mZnNldCA9IE51bWJlcihvZmZzZXQpIHx8IDBcbiAgdmFyIHJlbWFpbmluZyA9IHRoaXMubGVuZ3RoIC0gb2Zmc2V0XG4gIGlmICghbGVuZ3RoKSB7XG4gICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gIH0gZWxzZSB7XG4gICAgbGVuZ3RoID0gTnVtYmVyKGxlbmd0aClcbiAgICBpZiAobGVuZ3RoID4gcmVtYWluaW5nKSB7XG4gICAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgICB9XG4gIH1cbiAgZW5jb2RpbmcgPSBTdHJpbmcoZW5jb2RpbmcgfHwgJ3V0ZjgnKS50b0xvd2VyQ2FzZSgpXG5cbiAgdmFyIHJldFxuICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldCA9IF9oZXhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgICByZXQgPSBfdXRmOFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgIHJldCA9IF9hc2NpaVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICByZXQgPSBfYmluYXJ5V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIHJldCA9IF9iYXNlNjRXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0ID0gX3V0ZjE2bGVXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nJylcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoZW5jb2RpbmcsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHNlbGYgPSB0aGlzXG5cbiAgZW5jb2RpbmcgPSBTdHJpbmcoZW5jb2RpbmcgfHwgJ3V0ZjgnKS50b0xvd2VyQ2FzZSgpXG4gIHN0YXJ0ID0gTnVtYmVyKHN0YXJ0KSB8fCAwXG4gIGVuZCA9IChlbmQgIT09IHVuZGVmaW5lZClcbiAgICA/IE51bWJlcihlbmQpXG4gICAgOiBlbmQgPSBzZWxmLmxlbmd0aFxuXG4gIC8vIEZhc3RwYXRoIGVtcHR5IHN0cmluZ3NcbiAgaWYgKGVuZCA9PT0gc3RhcnQpXG4gICAgcmV0dXJuICcnXG5cbiAgdmFyIHJldFxuICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldCA9IF9oZXhTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgICByZXQgPSBfdXRmOFNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgIHJldCA9IF9hc2NpaVNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICByZXQgPSBfYmluYXJ5U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIHJldCA9IF9iYXNlNjRTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0ID0gX3V0ZjE2bGVTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nJylcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdCdWZmZXInLFxuICAgIGRhdGE6IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRoaXMuX2FyciB8fCB0aGlzLCAwKVxuICB9XG59XG5cbi8vIGNvcHkodGFyZ2V0QnVmZmVyLCB0YXJnZXRTdGFydD0wLCBzb3VyY2VTdGFydD0wLCBzb3VyY2VFbmQ9YnVmZmVyLmxlbmd0aClcbkJ1ZmZlci5wcm90b3R5cGUuY29weSA9IGZ1bmN0aW9uICh0YXJnZXQsIHRhcmdldF9zdGFydCwgc3RhcnQsIGVuZCkge1xuICB2YXIgc291cmNlID0gdGhpc1xuXG4gIGlmICghc3RhcnQpIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCAmJiBlbmQgIT09IDApIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICghdGFyZ2V0X3N0YXJ0KSB0YXJnZXRfc3RhcnQgPSAwXG5cbiAgLy8gQ29weSAwIGJ5dGVzOyB3ZSdyZSBkb25lXG4gIGlmIChlbmQgPT09IHN0YXJ0KSByZXR1cm5cbiAgaWYgKHRhcmdldC5sZW5ndGggPT09IDAgfHwgc291cmNlLmxlbmd0aCA9PT0gMCkgcmV0dXJuXG5cbiAgLy8gRmF0YWwgZXJyb3IgY29uZGl0aW9uc1xuICBhc3NlcnQoZW5kID49IHN0YXJ0LCAnc291cmNlRW5kIDwgc291cmNlU3RhcnQnKVxuICBhc3NlcnQodGFyZ2V0X3N0YXJ0ID49IDAgJiYgdGFyZ2V0X3N0YXJ0IDwgdGFyZ2V0Lmxlbmd0aCxcbiAgICAgICd0YXJnZXRTdGFydCBvdXQgb2YgYm91bmRzJylcbiAgYXNzZXJ0KHN0YXJ0ID49IDAgJiYgc3RhcnQgPCBzb3VyY2UubGVuZ3RoLCAnc291cmNlU3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIGFzc2VydChlbmQgPj0gMCAmJiBlbmQgPD0gc291cmNlLmxlbmd0aCwgJ3NvdXJjZUVuZCBvdXQgb2YgYm91bmRzJylcblxuICAvLyBBcmUgd2Ugb29iP1xuICBpZiAoZW5kID4gdGhpcy5sZW5ndGgpXG4gICAgZW5kID0gdGhpcy5sZW5ndGhcbiAgaWYgKHRhcmdldC5sZW5ndGggLSB0YXJnZXRfc3RhcnQgPCBlbmQgLSBzdGFydClcbiAgICBlbmQgPSB0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0X3N0YXJ0ICsgc3RhcnRcblxuICB2YXIgbGVuID0gZW5kIC0gc3RhcnRcblxuICBpZiAobGVuIDwgMTAwIHx8ICFCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgIHRhcmdldFtpICsgdGFyZ2V0X3N0YXJ0XSA9IHRoaXNbaSArIHN0YXJ0XVxuICB9IGVsc2Uge1xuICAgIHRhcmdldC5fc2V0KHRoaXMuc3ViYXJyYXkoc3RhcnQsIHN0YXJ0ICsgbGVuKSwgdGFyZ2V0X3N0YXJ0KVxuICB9XG59XG5cbmZ1bmN0aW9uIF9iYXNlNjRTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIGlmIChzdGFydCA9PT0gMCAmJiBlbmQgPT09IGJ1Zi5sZW5ndGgpIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmKVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYuc2xpY2Uoc3RhcnQsIGVuZCkpXG4gIH1cbn1cblxuZnVuY3Rpb24gX3V0ZjhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciByZXMgPSAnJ1xuICB2YXIgdG1wID0gJydcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgaWYgKGJ1ZltpXSA8PSAweDdGKSB7XG4gICAgICByZXMgKz0gZGVjb2RlVXRmOENoYXIodG1wKSArIFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKVxuICAgICAgdG1wID0gJydcbiAgICB9IGVsc2Uge1xuICAgICAgdG1wICs9ICclJyArIGJ1ZltpXS50b1N0cmluZygxNilcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzICsgZGVjb2RlVXRmOENoYXIodG1wKVxufVxuXG5mdW5jdGlvbiBfYXNjaWlTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciByZXQgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspXG4gICAgcmV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKVxuICByZXR1cm4gcmV0XG59XG5cbmZ1bmN0aW9uIF9iaW5hcnlTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHJldHVybiBfYXNjaWlTbGljZShidWYsIHN0YXJ0LCBlbmQpXG59XG5cbmZ1bmN0aW9uIF9oZXhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG5cbiAgaWYgKCFzdGFydCB8fCBzdGFydCA8IDApIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCB8fCBlbmQgPCAwIHx8IGVuZCA+IGxlbikgZW5kID0gbGVuXG5cbiAgdmFyIG91dCA9ICcnXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgb3V0ICs9IHRvSGV4KGJ1ZltpXSlcbiAgfVxuICByZXR1cm4gb3V0XG59XG5cbmZ1bmN0aW9uIF91dGYxNmxlU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgYnl0ZXMgPSBidWYuc2xpY2Uoc3RhcnQsIGVuZClcbiAgdmFyIHJlcyA9ICcnXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICByZXMgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSArIGJ5dGVzW2krMV0gKiAyNTYpXG4gIH1cbiAgcmV0dXJuIHJlc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnNsaWNlID0gZnVuY3Rpb24gKHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIHN0YXJ0ID0gY2xhbXAoc3RhcnQsIGxlbiwgMClcbiAgZW5kID0gY2xhbXAoZW5kLCBsZW4sIGxlbilcblxuICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgIHJldHVybiBCdWZmZXIuX2F1Z21lbnQodGhpcy5zdWJhcnJheShzdGFydCwgZW5kKSlcbiAgfSBlbHNlIHtcbiAgICB2YXIgc2xpY2VMZW4gPSBlbmQgLSBzdGFydFxuICAgIHZhciBuZXdCdWYgPSBuZXcgQnVmZmVyKHNsaWNlTGVuLCB1bmRlZmluZWQsIHRydWUpXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzbGljZUxlbjsgaSsrKSB7XG4gICAgICBuZXdCdWZbaV0gPSB0aGlzW2kgKyBzdGFydF1cbiAgICB9XG4gICAgcmV0dXJuIG5ld0J1ZlxuICB9XG59XG5cbi8vIGBnZXRgIHdpbGwgYmUgcmVtb3ZlZCBpbiBOb2RlIDAuMTMrXG5CdWZmZXIucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIChvZmZzZXQpIHtcbiAgY29uc29sZS5sb2coJy5nZXQoKSBpcyBkZXByZWNhdGVkLiBBY2Nlc3MgdXNpbmcgYXJyYXkgaW5kZXhlcyBpbnN0ZWFkLicpXG4gIHJldHVybiB0aGlzLnJlYWRVSW50OChvZmZzZXQpXG59XG5cbi8vIGBzZXRgIHdpbGwgYmUgcmVtb3ZlZCBpbiBOb2RlIDAuMTMrXG5CdWZmZXIucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uICh2LCBvZmZzZXQpIHtcbiAgY29uc29sZS5sb2coJy5zZXQoKSBpcyBkZXByZWNhdGVkLiBBY2Nlc3MgdXNpbmcgYXJyYXkgaW5kZXhlcyBpbnN0ZWFkLicpXG4gIHJldHVybiB0aGlzLndyaXRlVUludDgodiwgb2Zmc2V0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50OCA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpXG4gICAgcmV0dXJuXG5cbiAgcmV0dXJuIHRoaXNbb2Zmc2V0XVxufVxuXG5mdW5jdGlvbiBfcmVhZFVJbnQxNiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIHZhciB2YWxcbiAgaWYgKGxpdHRsZUVuZGlhbikge1xuICAgIHZhbCA9IGJ1ZltvZmZzZXRdXG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDFdIDw8IDhcbiAgfSBlbHNlIHtcbiAgICB2YWwgPSBidWZbb2Zmc2V0XSA8PCA4XG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDFdXG4gIH1cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQxNih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQxNih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWRVSW50MzIgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsXG4gIGlmIChsaXR0bGVFbmRpYW4pIHtcbiAgICBpZiAob2Zmc2V0ICsgMiA8IGxlbilcbiAgICAgIHZhbCA9IGJ1ZltvZmZzZXQgKyAyXSA8PCAxNlxuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAxXSA8PCA4XG4gICAgdmFsIHw9IGJ1ZltvZmZzZXRdXG4gICAgaWYgKG9mZnNldCArIDMgPCBsZW4pXG4gICAgICB2YWwgPSB2YWwgKyAoYnVmW29mZnNldCArIDNdIDw8IDI0ID4+PiAwKVxuICB9IGVsc2Uge1xuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsID0gYnVmW29mZnNldCArIDFdIDw8IDE2XG4gICAgaWYgKG9mZnNldCArIDIgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDJdIDw8IDhcbiAgICBpZiAob2Zmc2V0ICsgMyA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgM11cbiAgICB2YWwgPSB2YWwgKyAoYnVmW29mZnNldF0gPDwgMjQgPj4+IDApXG4gIH1cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQzMih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQzMih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50OCA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLFxuICAgICAgICAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpXG4gICAgcmV0dXJuXG5cbiAgdmFyIG5lZyA9IHRoaXNbb2Zmc2V0XSAmIDB4ODBcbiAgaWYgKG5lZylcbiAgICByZXR1cm4gKDB4ZmYgLSB0aGlzW29mZnNldF0gKyAxKSAqIC0xXG4gIGVsc2VcbiAgICByZXR1cm4gdGhpc1tvZmZzZXRdXG59XG5cbmZ1bmN0aW9uIF9yZWFkSW50MTYgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsID0gX3JlYWRVSW50MTYoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgdHJ1ZSlcbiAgdmFyIG5lZyA9IHZhbCAmIDB4ODAwMFxuICBpZiAobmVnKVxuICAgIHJldHVybiAoMHhmZmZmIC0gdmFsICsgMSkgKiAtMVxuICBlbHNlXG4gICAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkSW50MTYodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDE2KHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZEludDMyIChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbCA9IF9yZWFkVUludDMyKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIHRydWUpXG4gIHZhciBuZWcgPSB2YWwgJiAweDgwMDAwMDAwXG4gIGlmIChuZWcpXG4gICAgcmV0dXJuICgweGZmZmZmZmZmIC0gdmFsICsgMSkgKiAtMVxuICBlbHNlXG4gICAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkSW50MzIodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDMyKHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZEZsb2F0IChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHJldHVybiBpZWVlNzU0LnJlYWQoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgMjMsIDQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEZsb2F0TEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRGbG9hdCh0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdEJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRmxvYXQodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF9yZWFkRG91YmxlIChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgKyA3IDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHJldHVybiBpZWVlNzU0LnJlYWQoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgNTIsIDgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRG91YmxlKHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRG91YmxlKHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDggPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmdWludCh2YWx1ZSwgMHhmZilcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpIHJldHVyblxuXG4gIHRoaXNbb2Zmc2V0XSA9IHZhbHVlXG59XG5cbmZ1bmN0aW9uIF93cml0ZVVJbnQxNiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ3RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZ1aW50KHZhbHVlLCAweGZmZmYpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBmb3IgKHZhciBpID0gMCwgaiA9IE1hdGgubWluKGxlbiAtIG9mZnNldCwgMik7IGkgPCBqOyBpKyspIHtcbiAgICBidWZbb2Zmc2V0ICsgaV0gPVxuICAgICAgICAodmFsdWUgJiAoMHhmZiA8PCAoOCAqIChsaXR0bGVFbmRpYW4gPyBpIDogMSAtIGkpKSkpID4+PlxuICAgICAgICAgICAgKGxpdHRsZUVuZGlhbiA/IGkgOiAxIC0gaSkgKiA4XG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZVVJbnQzMiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ3RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZ1aW50KHZhbHVlLCAweGZmZmZmZmZmKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgZm9yICh2YXIgaSA9IDAsIGogPSBNYXRoLm1pbihsZW4gLSBvZmZzZXQsIDQpOyBpIDwgajsgaSsrKSB7XG4gICAgYnVmW29mZnNldCArIGldID1cbiAgICAgICAgKHZhbHVlID4+PiAobGl0dGxlRW5kaWFuID8gaSA6IDMgLSBpKSAqIDgpICYgMHhmZlxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50OCA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZzaW50KHZhbHVlLCAweDdmLCAtMHg4MClcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpXG4gICAgcmV0dXJuXG5cbiAgaWYgKHZhbHVlID49IDApXG4gICAgdGhpcy53cml0ZVVJbnQ4KHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KVxuICBlbHNlXG4gICAgdGhpcy53cml0ZVVJbnQ4KDB4ZmYgKyB2YWx1ZSArIDEsIG9mZnNldCwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZUludDE2IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnNpbnQodmFsdWUsIDB4N2ZmZiwgLTB4ODAwMClcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGlmICh2YWx1ZSA+PSAwKVxuICAgIF93cml0ZVVJbnQxNihidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXG4gIGVsc2VcbiAgICBfd3JpdGVVSW50MTYoYnVmLCAweGZmZmYgKyB2YWx1ZSArIDEsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2TEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlSW50MzIgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmc2ludCh2YWx1ZSwgMHg3ZmZmZmZmZiwgLTB4ODAwMDAwMDApXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZiAodmFsdWUgPj0gMClcbiAgICBfd3JpdGVVSW50MzIoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxuICBlbHNlXG4gICAgX3dyaXRlVUludDMyKGJ1ZiwgMHhmZmZmZmZmZiArIHZhbHVlICsgMSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVGbG9hdCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZJRUVFNzU0KHZhbHVlLCAzLjQwMjgyMzQ2NjM4NTI4ODZlKzM4LCAtMy40MDI4MjM0NjYzODUyODg2ZSszOClcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0QkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVEb3VibGUgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgNyA8IGJ1Zi5sZW5ndGgsXG4gICAgICAgICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmSUVFRTc1NCh2YWx1ZSwgMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgsIC0xLjc5NzY5MzEzNDg2MjMxNTdFKzMwOClcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDUyLCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlTEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuLy8gZmlsbCh2YWx1ZSwgc3RhcnQ9MCwgZW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmZpbGwgPSBmdW5jdGlvbiAodmFsdWUsIHN0YXJ0LCBlbmQpIHtcbiAgaWYgKCF2YWx1ZSkgdmFsdWUgPSAwXG4gIGlmICghc3RhcnQpIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCkgZW5kID0gdGhpcy5sZW5ndGhcblxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIHZhbHVlID0gdmFsdWUuY2hhckNvZGVBdCgwKVxuICB9XG5cbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgIWlzTmFOKHZhbHVlKSwgJ3ZhbHVlIGlzIG5vdCBhIG51bWJlcicpXG4gIGFzc2VydChlbmQgPj0gc3RhcnQsICdlbmQgPCBzdGFydCcpXG5cbiAgLy8gRmlsbCAwIGJ5dGVzOyB3ZSdyZSBkb25lXG4gIGlmIChlbmQgPT09IHN0YXJ0KSByZXR1cm5cbiAgaWYgKHRoaXMubGVuZ3RoID09PSAwKSByZXR1cm5cblxuICBhc3NlcnQoc3RhcnQgPj0gMCAmJiBzdGFydCA8IHRoaXMubGVuZ3RoLCAnc3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIGFzc2VydChlbmQgPj0gMCAmJiBlbmQgPD0gdGhpcy5sZW5ndGgsICdlbmQgb3V0IG9mIGJvdW5kcycpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICB0aGlzW2ldID0gdmFsdWVcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluc3BlY3QgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBvdXQgPSBbXVxuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgIG91dFtpXSA9IHRvSGV4KHRoaXNbaV0pXG4gICAgaWYgKGkgPT09IGV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVMpIHtcbiAgICAgIG91dFtpICsgMV0gPSAnLi4uJ1xuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cbiAgcmV0dXJuICc8QnVmZmVyICcgKyBvdXQuam9pbignICcpICsgJz4nXG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBgQXJyYXlCdWZmZXJgIHdpdGggdGhlICpjb3BpZWQqIG1lbW9yeSBvZiB0aGUgYnVmZmVyIGluc3RhbmNlLlxuICogQWRkZWQgaW4gTm9kZSAwLjEyLiBPbmx5IGF2YWlsYWJsZSBpbiBicm93c2VycyB0aGF0IHN1cHBvcnQgQXJyYXlCdWZmZXIuXG4gKi9cbkJ1ZmZlci5wcm90b3R5cGUudG9BcnJheUJ1ZmZlciA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHR5cGVvZiBVaW50OEFycmF5ICE9PSAndW5kZWZpbmVkJykge1xuICAgIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XG4gICAgICByZXR1cm4gKG5ldyBCdWZmZXIodGhpcykpLmJ1ZmZlclxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgYnVmID0gbmV3IFVpbnQ4QXJyYXkodGhpcy5sZW5ndGgpXG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gYnVmLmxlbmd0aDsgaSA8IGxlbjsgaSArPSAxKVxuICAgICAgICBidWZbaV0gPSB0aGlzW2ldXG4gICAgICByZXR1cm4gYnVmLmJ1ZmZlclxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0J1ZmZlci50b0FycmF5QnVmZmVyIG5vdCBzdXBwb3J0ZWQgaW4gdGhpcyBicm93c2VyJylcbiAgfVxufVxuXG4vLyBIRUxQRVIgRlVOQ1RJT05TXG4vLyA9PT09PT09PT09PT09PT09XG5cbmZ1bmN0aW9uIHN0cmluZ3RyaW0gKHN0cikge1xuICBpZiAoc3RyLnRyaW0pIHJldHVybiBzdHIudHJpbSgpXG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpXG59XG5cbnZhciBCUCA9IEJ1ZmZlci5wcm90b3R5cGVcblxuLyoqXG4gKiBBdWdtZW50IGEgVWludDhBcnJheSAqaW5zdGFuY2UqIChub3QgdGhlIFVpbnQ4QXJyYXkgY2xhc3MhKSB3aXRoIEJ1ZmZlciBtZXRob2RzXG4gKi9cbkJ1ZmZlci5fYXVnbWVudCA9IGZ1bmN0aW9uIChhcnIpIHtcbiAgYXJyLl9pc0J1ZmZlciA9IHRydWVcblxuICAvLyBzYXZlIHJlZmVyZW5jZSB0byBvcmlnaW5hbCBVaW50OEFycmF5IGdldC9zZXQgbWV0aG9kcyBiZWZvcmUgb3ZlcndyaXRpbmdcbiAgYXJyLl9nZXQgPSBhcnIuZ2V0XG4gIGFyci5fc2V0ID0gYXJyLnNldFxuXG4gIC8vIGRlcHJlY2F0ZWQsIHdpbGwgYmUgcmVtb3ZlZCBpbiBub2RlIDAuMTMrXG4gIGFyci5nZXQgPSBCUC5nZXRcbiAgYXJyLnNldCA9IEJQLnNldFxuXG4gIGFyci53cml0ZSA9IEJQLndyaXRlXG4gIGFyci50b1N0cmluZyA9IEJQLnRvU3RyaW5nXG4gIGFyci50b0xvY2FsZVN0cmluZyA9IEJQLnRvU3RyaW5nXG4gIGFyci50b0pTT04gPSBCUC50b0pTT05cbiAgYXJyLmNvcHkgPSBCUC5jb3B5XG4gIGFyci5zbGljZSA9IEJQLnNsaWNlXG4gIGFyci5yZWFkVUludDggPSBCUC5yZWFkVUludDhcbiAgYXJyLnJlYWRVSW50MTZMRSA9IEJQLnJlYWRVSW50MTZMRVxuICBhcnIucmVhZFVJbnQxNkJFID0gQlAucmVhZFVJbnQxNkJFXG4gIGFyci5yZWFkVUludDMyTEUgPSBCUC5yZWFkVUludDMyTEVcbiAgYXJyLnJlYWRVSW50MzJCRSA9IEJQLnJlYWRVSW50MzJCRVxuICBhcnIucmVhZEludDggPSBCUC5yZWFkSW50OFxuICBhcnIucmVhZEludDE2TEUgPSBCUC5yZWFkSW50MTZMRVxuICBhcnIucmVhZEludDE2QkUgPSBCUC5yZWFkSW50MTZCRVxuICBhcnIucmVhZEludDMyTEUgPSBCUC5yZWFkSW50MzJMRVxuICBhcnIucmVhZEludDMyQkUgPSBCUC5yZWFkSW50MzJCRVxuICBhcnIucmVhZEZsb2F0TEUgPSBCUC5yZWFkRmxvYXRMRVxuICBhcnIucmVhZEZsb2F0QkUgPSBCUC5yZWFkRmxvYXRCRVxuICBhcnIucmVhZERvdWJsZUxFID0gQlAucmVhZERvdWJsZUxFXG4gIGFyci5yZWFkRG91YmxlQkUgPSBCUC5yZWFkRG91YmxlQkVcbiAgYXJyLndyaXRlVUludDggPSBCUC53cml0ZVVJbnQ4XG4gIGFyci53cml0ZVVJbnQxNkxFID0gQlAud3JpdGVVSW50MTZMRVxuICBhcnIud3JpdGVVSW50MTZCRSA9IEJQLndyaXRlVUludDE2QkVcbiAgYXJyLndyaXRlVUludDMyTEUgPSBCUC53cml0ZVVJbnQzMkxFXG4gIGFyci53cml0ZVVJbnQzMkJFID0gQlAud3JpdGVVSW50MzJCRVxuICBhcnIud3JpdGVJbnQ4ID0gQlAud3JpdGVJbnQ4XG4gIGFyci53cml0ZUludDE2TEUgPSBCUC53cml0ZUludDE2TEVcbiAgYXJyLndyaXRlSW50MTZCRSA9IEJQLndyaXRlSW50MTZCRVxuICBhcnIud3JpdGVJbnQzMkxFID0gQlAud3JpdGVJbnQzMkxFXG4gIGFyci53cml0ZUludDMyQkUgPSBCUC53cml0ZUludDMyQkVcbiAgYXJyLndyaXRlRmxvYXRMRSA9IEJQLndyaXRlRmxvYXRMRVxuICBhcnIud3JpdGVGbG9hdEJFID0gQlAud3JpdGVGbG9hdEJFXG4gIGFyci53cml0ZURvdWJsZUxFID0gQlAud3JpdGVEb3VibGVMRVxuICBhcnIud3JpdGVEb3VibGVCRSA9IEJQLndyaXRlRG91YmxlQkVcbiAgYXJyLmZpbGwgPSBCUC5maWxsXG4gIGFyci5pbnNwZWN0ID0gQlAuaW5zcGVjdFxuICBhcnIudG9BcnJheUJ1ZmZlciA9IEJQLnRvQXJyYXlCdWZmZXJcblxuICByZXR1cm4gYXJyXG59XG5cbi8vIHNsaWNlKHN0YXJ0LCBlbmQpXG5mdW5jdGlvbiBjbGFtcCAoaW5kZXgsIGxlbiwgZGVmYXVsdFZhbHVlKSB7XG4gIGlmICh0eXBlb2YgaW5kZXggIT09ICdudW1iZXInKSByZXR1cm4gZGVmYXVsdFZhbHVlXG4gIGluZGV4ID0gfn5pbmRleDsgIC8vIENvZXJjZSB0byBpbnRlZ2VyLlxuICBpZiAoaW5kZXggPj0gbGVuKSByZXR1cm4gbGVuXG4gIGlmIChpbmRleCA+PSAwKSByZXR1cm4gaW5kZXhcbiAgaW5kZXggKz0gbGVuXG4gIGlmIChpbmRleCA+PSAwKSByZXR1cm4gaW5kZXhcbiAgcmV0dXJuIDBcbn1cblxuZnVuY3Rpb24gY29lcmNlIChsZW5ndGgpIHtcbiAgLy8gQ29lcmNlIGxlbmd0aCB0byBhIG51bWJlciAocG9zc2libHkgTmFOKSwgcm91bmQgdXBcbiAgLy8gaW4gY2FzZSBpdCdzIGZyYWN0aW9uYWwgKGUuZy4gMTIzLjQ1NikgdGhlbiBkbyBhXG4gIC8vIGRvdWJsZSBuZWdhdGUgdG8gY29lcmNlIGEgTmFOIHRvIDAuIEVhc3ksIHJpZ2h0P1xuICBsZW5ndGggPSB+fk1hdGguY2VpbCgrbGVuZ3RoKVxuICByZXR1cm4gbGVuZ3RoIDwgMCA/IDAgOiBsZW5ndGhcbn1cblxuZnVuY3Rpb24gaXNBcnJheSAoc3ViamVjdCkge1xuICByZXR1cm4gKEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKHN1YmplY3QpIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHN1YmplY3QpID09PSAnW29iamVjdCBBcnJheV0nXG4gIH0pKHN1YmplY3QpXG59XG5cbmZ1bmN0aW9uIGlzQXJyYXlpc2ggKHN1YmplY3QpIHtcbiAgcmV0dXJuIGlzQXJyYXkoc3ViamVjdCkgfHwgQnVmZmVyLmlzQnVmZmVyKHN1YmplY3QpIHx8XG4gICAgICBzdWJqZWN0ICYmIHR5cGVvZiBzdWJqZWN0ID09PSAnb2JqZWN0JyAmJlxuICAgICAgdHlwZW9mIHN1YmplY3QubGVuZ3RoID09PSAnbnVtYmVyJ1xufVxuXG5mdW5jdGlvbiB0b0hleCAobikge1xuICBpZiAobiA8IDE2KSByZXR1cm4gJzAnICsgbi50b1N0cmluZygxNilcbiAgcmV0dXJuIG4udG9TdHJpbmcoMTYpXG59XG5cbmZ1bmN0aW9uIHV0ZjhUb0J5dGVzIChzdHIpIHtcbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGIgPSBzdHIuY2hhckNvZGVBdChpKVxuICAgIGlmIChiIDw9IDB4N0YpXG4gICAgICBieXRlQXJyYXkucHVzaChzdHIuY2hhckNvZGVBdChpKSlcbiAgICBlbHNlIHtcbiAgICAgIHZhciBzdGFydCA9IGlcbiAgICAgIGlmIChiID49IDB4RDgwMCAmJiBiIDw9IDB4REZGRikgaSsrXG4gICAgICB2YXIgaCA9IGVuY29kZVVSSUNvbXBvbmVudChzdHIuc2xpY2Uoc3RhcnQsIGkrMSkpLnN1YnN0cigxKS5zcGxpdCgnJScpXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGgubGVuZ3RoOyBqKyspXG4gICAgICAgIGJ5dGVBcnJheS5wdXNoKHBhcnNlSW50KGhbal0sIDE2KSlcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiBhc2NpaVRvQnl0ZXMgKHN0cikge1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICAvLyBOb2RlJ3MgY29kZSBzZWVtcyB0byBiZSBkb2luZyB0aGlzIGFuZCBub3QgJiAweDdGLi5cbiAgICBieXRlQXJyYXkucHVzaChzdHIuY2hhckNvZGVBdChpKSAmIDB4RkYpXG4gIH1cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiB1dGYxNmxlVG9CeXRlcyAoc3RyKSB7XG4gIHZhciBjLCBoaSwgbG9cbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgYyA9IHN0ci5jaGFyQ29kZUF0KGkpXG4gICAgaGkgPSBjID4+IDhcbiAgICBsbyA9IGMgJSAyNTZcbiAgICBieXRlQXJyYXkucHVzaChsbylcbiAgICBieXRlQXJyYXkucHVzaChoaSlcbiAgfVxuXG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gYmFzZTY0VG9CeXRlcyAoc3RyKSB7XG4gIHJldHVybiBiYXNlNjQudG9CeXRlQXJyYXkoc3RyKVxufVxuXG5mdW5jdGlvbiBibGl0QnVmZmVyIChzcmMsIGRzdCwgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIHBvc1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKChpICsgb2Zmc2V0ID49IGRzdC5sZW5ndGgpIHx8IChpID49IHNyYy5sZW5ndGgpKVxuICAgICAgYnJlYWtcbiAgICBkc3RbaSArIG9mZnNldF0gPSBzcmNbaV1cbiAgfVxuICByZXR1cm4gaVxufVxuXG5mdW5jdGlvbiBkZWNvZGVVdGY4Q2hhciAoc3RyKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChzdHIpXG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKDB4RkZGRCkgLy8gVVRGIDggaW52YWxpZCBjaGFyXG4gIH1cbn1cblxuLypcbiAqIFdlIGhhdmUgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIHZhbHVlIGlzIGEgdmFsaWQgaW50ZWdlci4gVGhpcyBtZWFucyB0aGF0IGl0XG4gKiBpcyBub24tbmVnYXRpdmUuIEl0IGhhcyBubyBmcmFjdGlvbmFsIGNvbXBvbmVudCBhbmQgdGhhdCBpdCBkb2VzIG5vdFxuICogZXhjZWVkIHRoZSBtYXhpbXVtIGFsbG93ZWQgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIHZlcmlmdWludCAodmFsdWUsIG1heCkge1xuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJywgJ2Nhbm5vdCB3cml0ZSBhIG5vbi1udW1iZXIgYXMgYSBudW1iZXInKVxuICBhc3NlcnQodmFsdWUgPj0gMCwgJ3NwZWNpZmllZCBhIG5lZ2F0aXZlIHZhbHVlIGZvciB3cml0aW5nIGFuIHVuc2lnbmVkIHZhbHVlJylcbiAgYXNzZXJ0KHZhbHVlIDw9IG1heCwgJ3ZhbHVlIGlzIGxhcmdlciB0aGFuIG1heGltdW0gdmFsdWUgZm9yIHR5cGUnKVxuICBhc3NlcnQoTWF0aC5mbG9vcih2YWx1ZSkgPT09IHZhbHVlLCAndmFsdWUgaGFzIGEgZnJhY3Rpb25hbCBjb21wb25lbnQnKVxufVxuXG5mdW5jdGlvbiB2ZXJpZnNpbnQgKHZhbHVlLCBtYXgsIG1pbikge1xuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJywgJ2Nhbm5vdCB3cml0ZSBhIG5vbi1udW1iZXIgYXMgYSBudW1iZXInKVxuICBhc3NlcnQodmFsdWUgPD0gbWF4LCAndmFsdWUgbGFyZ2VyIHRoYW4gbWF4aW11bSBhbGxvd2VkIHZhbHVlJylcbiAgYXNzZXJ0KHZhbHVlID49IG1pbiwgJ3ZhbHVlIHNtYWxsZXIgdGhhbiBtaW5pbXVtIGFsbG93ZWQgdmFsdWUnKVxuICBhc3NlcnQoTWF0aC5mbG9vcih2YWx1ZSkgPT09IHZhbHVlLCAndmFsdWUgaGFzIGEgZnJhY3Rpb25hbCBjb21wb25lbnQnKVxufVxuXG5mdW5jdGlvbiB2ZXJpZklFRUU3NTQgKHZhbHVlLCBtYXgsIG1pbikge1xuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJywgJ2Nhbm5vdCB3cml0ZSBhIG5vbi1udW1iZXIgYXMgYSBudW1iZXInKVxuICBhc3NlcnQodmFsdWUgPD0gbWF4LCAndmFsdWUgbGFyZ2VyIHRoYW4gbWF4aW11bSBhbGxvd2VkIHZhbHVlJylcbiAgYXNzZXJ0KHZhbHVlID49IG1pbiwgJ3ZhbHVlIHNtYWxsZXIgdGhhbiBtaW5pbXVtIGFsbG93ZWQgdmFsdWUnKVxufVxuXG5mdW5jdGlvbiBhc3NlcnQgKHRlc3QsIG1lc3NhZ2UpIHtcbiAgaWYgKCF0ZXN0KSB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSB8fCAnRmFpbGVkIGFzc2VydGlvbicpXG59XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiMVlpWjVTXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi4vbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnVmZmVyL2luZGV4LmpzXCIsXCIvLi4vbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnVmZmVyXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIGxvb2t1cCA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvJztcblxuOyhmdW5jdGlvbiAoZXhwb3J0cykge1xuXHQndXNlIHN0cmljdCc7XG5cbiAgdmFyIEFyciA9ICh0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcpXG4gICAgPyBVaW50OEFycmF5XG4gICAgOiBBcnJheVxuXG5cdHZhciBQTFVTICAgPSAnKycuY2hhckNvZGVBdCgwKVxuXHR2YXIgU0xBU0ggID0gJy8nLmNoYXJDb2RlQXQoMClcblx0dmFyIE5VTUJFUiA9ICcwJy5jaGFyQ29kZUF0KDApXG5cdHZhciBMT1dFUiAgPSAnYScuY2hhckNvZGVBdCgwKVxuXHR2YXIgVVBQRVIgID0gJ0EnLmNoYXJDb2RlQXQoMClcblx0dmFyIFBMVVNfVVJMX1NBRkUgPSAnLScuY2hhckNvZGVBdCgwKVxuXHR2YXIgU0xBU0hfVVJMX1NBRkUgPSAnXycuY2hhckNvZGVBdCgwKVxuXG5cdGZ1bmN0aW9uIGRlY29kZSAoZWx0KSB7XG5cdFx0dmFyIGNvZGUgPSBlbHQuY2hhckNvZGVBdCgwKVxuXHRcdGlmIChjb2RlID09PSBQTFVTIHx8XG5cdFx0ICAgIGNvZGUgPT09IFBMVVNfVVJMX1NBRkUpXG5cdFx0XHRyZXR1cm4gNjIgLy8gJysnXG5cdFx0aWYgKGNvZGUgPT09IFNMQVNIIHx8XG5cdFx0ICAgIGNvZGUgPT09IFNMQVNIX1VSTF9TQUZFKVxuXHRcdFx0cmV0dXJuIDYzIC8vICcvJ1xuXHRcdGlmIChjb2RlIDwgTlVNQkVSKVxuXHRcdFx0cmV0dXJuIC0xIC8vbm8gbWF0Y2hcblx0XHRpZiAoY29kZSA8IE5VTUJFUiArIDEwKVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBOVU1CRVIgKyAyNiArIDI2XG5cdFx0aWYgKGNvZGUgPCBVUFBFUiArIDI2KVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBVUFBFUlxuXHRcdGlmIChjb2RlIDwgTE9XRVIgKyAyNilcblx0XHRcdHJldHVybiBjb2RlIC0gTE9XRVIgKyAyNlxuXHR9XG5cblx0ZnVuY3Rpb24gYjY0VG9CeXRlQXJyYXkgKGI2NCkge1xuXHRcdHZhciBpLCBqLCBsLCB0bXAsIHBsYWNlSG9sZGVycywgYXJyXG5cblx0XHRpZiAoYjY0Lmxlbmd0aCAlIDQgPiAwKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc3RyaW5nLiBMZW5ndGggbXVzdCBiZSBhIG11bHRpcGxlIG9mIDQnKVxuXHRcdH1cblxuXHRcdC8vIHRoZSBudW1iZXIgb2YgZXF1YWwgc2lnbnMgKHBsYWNlIGhvbGRlcnMpXG5cdFx0Ly8gaWYgdGhlcmUgYXJlIHR3byBwbGFjZWhvbGRlcnMsIHRoYW4gdGhlIHR3byBjaGFyYWN0ZXJzIGJlZm9yZSBpdFxuXHRcdC8vIHJlcHJlc2VudCBvbmUgYnl0ZVxuXHRcdC8vIGlmIHRoZXJlIGlzIG9ubHkgb25lLCB0aGVuIHRoZSB0aHJlZSBjaGFyYWN0ZXJzIGJlZm9yZSBpdCByZXByZXNlbnQgMiBieXRlc1xuXHRcdC8vIHRoaXMgaXMganVzdCBhIGNoZWFwIGhhY2sgdG8gbm90IGRvIGluZGV4T2YgdHdpY2Vcblx0XHR2YXIgbGVuID0gYjY0Lmxlbmd0aFxuXHRcdHBsYWNlSG9sZGVycyA9ICc9JyA9PT0gYjY0LmNoYXJBdChsZW4gLSAyKSA/IDIgOiAnPScgPT09IGI2NC5jaGFyQXQobGVuIC0gMSkgPyAxIDogMFxuXG5cdFx0Ly8gYmFzZTY0IGlzIDQvMyArIHVwIHRvIHR3byBjaGFyYWN0ZXJzIG9mIHRoZSBvcmlnaW5hbCBkYXRhXG5cdFx0YXJyID0gbmV3IEFycihiNjQubGVuZ3RoICogMyAvIDQgLSBwbGFjZUhvbGRlcnMpXG5cblx0XHQvLyBpZiB0aGVyZSBhcmUgcGxhY2Vob2xkZXJzLCBvbmx5IGdldCB1cCB0byB0aGUgbGFzdCBjb21wbGV0ZSA0IGNoYXJzXG5cdFx0bCA9IHBsYWNlSG9sZGVycyA+IDAgPyBiNjQubGVuZ3RoIC0gNCA6IGI2NC5sZW5ndGhcblxuXHRcdHZhciBMID0gMFxuXG5cdFx0ZnVuY3Rpb24gcHVzaCAodikge1xuXHRcdFx0YXJyW0wrK10gPSB2XG5cdFx0fVxuXG5cdFx0Zm9yIChpID0gMCwgaiA9IDA7IGkgPCBsOyBpICs9IDQsIGogKz0gMykge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxOCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCAxMikgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDIpKSA8PCA2KSB8IGRlY29kZShiNjQuY2hhckF0KGkgKyAzKSlcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMDAwKSA+PiAxNilcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMCkgPj4gOClcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9XG5cblx0XHRpZiAocGxhY2VIb2xkZXJzID09PSAyKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDIpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPj4gNClcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9IGVsc2UgaWYgKHBsYWNlSG9sZGVycyA9PT0gMSkge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxMCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCA0KSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMikpID4+IDIpXG5cdFx0XHRwdXNoKCh0bXAgPj4gOCkgJiAweEZGKVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH1cblxuXHRcdHJldHVybiBhcnJcblx0fVxuXG5cdGZ1bmN0aW9uIHVpbnQ4VG9CYXNlNjQgKHVpbnQ4KSB7XG5cdFx0dmFyIGksXG5cdFx0XHRleHRyYUJ5dGVzID0gdWludDgubGVuZ3RoICUgMywgLy8gaWYgd2UgaGF2ZSAxIGJ5dGUgbGVmdCwgcGFkIDIgYnl0ZXNcblx0XHRcdG91dHB1dCA9IFwiXCIsXG5cdFx0XHR0ZW1wLCBsZW5ndGhcblxuXHRcdGZ1bmN0aW9uIGVuY29kZSAobnVtKSB7XG5cdFx0XHRyZXR1cm4gbG9va3VwLmNoYXJBdChudW0pXG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gdHJpcGxldFRvQmFzZTY0IChudW0pIHtcblx0XHRcdHJldHVybiBlbmNvZGUobnVtID4+IDE4ICYgMHgzRikgKyBlbmNvZGUobnVtID4+IDEyICYgMHgzRikgKyBlbmNvZGUobnVtID4+IDYgJiAweDNGKSArIGVuY29kZShudW0gJiAweDNGKVxuXHRcdH1cblxuXHRcdC8vIGdvIHRocm91Z2ggdGhlIGFycmF5IGV2ZXJ5IHRocmVlIGJ5dGVzLCB3ZSdsbCBkZWFsIHdpdGggdHJhaWxpbmcgc3R1ZmYgbGF0ZXJcblx0XHRmb3IgKGkgPSAwLCBsZW5ndGggPSB1aW50OC5sZW5ndGggLSBleHRyYUJ5dGVzOyBpIDwgbGVuZ3RoOyBpICs9IDMpIHtcblx0XHRcdHRlbXAgPSAodWludDhbaV0gPDwgMTYpICsgKHVpbnQ4W2kgKyAxXSA8PCA4KSArICh1aW50OFtpICsgMl0pXG5cdFx0XHRvdXRwdXQgKz0gdHJpcGxldFRvQmFzZTY0KHRlbXApXG5cdFx0fVxuXG5cdFx0Ly8gcGFkIHRoZSBlbmQgd2l0aCB6ZXJvcywgYnV0IG1ha2Ugc3VyZSB0byBub3QgZm9yZ2V0IHRoZSBleHRyYSBieXRlc1xuXHRcdHN3aXRjaCAoZXh0cmFCeXRlcykge1xuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHR0ZW1wID0gdWludDhbdWludDgubGVuZ3RoIC0gMV1cblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSh0ZW1wID4+IDIpXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPDwgNCkgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gJz09J1xuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHR0ZW1wID0gKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDJdIDw8IDgpICsgKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDFdKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKHRlbXAgPj4gMTApXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPj4gNCkgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKCh0ZW1wIDw8IDIpICYgMHgzRilcblx0XHRcdFx0b3V0cHV0ICs9ICc9J1xuXHRcdFx0XHRicmVha1xuXHRcdH1cblxuXHRcdHJldHVybiBvdXRwdXRcblx0fVxuXG5cdGV4cG9ydHMudG9CeXRlQXJyYXkgPSBiNjRUb0J5dGVBcnJheVxuXHRleHBvcnRzLmZyb21CeXRlQXJyYXkgPSB1aW50OFRvQmFzZTY0XG59KHR5cGVvZiBleHBvcnRzID09PSAndW5kZWZpbmVkJyA/ICh0aGlzLmJhc2U2NGpzID0ge30pIDogZXhwb3J0cykpXG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiMVlpWjVTXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi4vbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnVmZmVyL25vZGVfbW9kdWxlcy9iYXNlNjQtanMvbGliL2I2NC5qc1wiLFwiLy4uL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2J1ZmZlci9ub2RlX21vZHVsZXMvYmFzZTY0LWpzL2xpYlwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbmV4cG9ydHMucmVhZCA9IGZ1bmN0aW9uIChidWZmZXIsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtLFxuICAgICAgZUxlbiA9IG5CeXRlcyAqIDggLSBtTGVuIC0gMSxcbiAgICAgIGVNYXggPSAoMSA8PCBlTGVuKSAtIDEsXG4gICAgICBlQmlhcyA9IGVNYXggPj4gMSxcbiAgICAgIG5CaXRzID0gLTcsXG4gICAgICBpID0gaXNMRSA/IChuQnl0ZXMgLSAxKSA6IDAsXG4gICAgICBkID0gaXNMRSA/IC0xIDogMSxcbiAgICAgIHMgPSBidWZmZXJbb2Zmc2V0ICsgaV1cblxuICBpICs9IGRcblxuICBlID0gcyAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKVxuICBzID4+PSAoLW5CaXRzKVxuICBuQml0cyArPSBlTGVuXG4gIGZvciAoOyBuQml0cyA+IDA7IGUgPSBlICogMjU2ICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpIHt9XG5cbiAgbSA9IGUgJiAoKDEgPDwgKC1uQml0cykpIC0gMSlcbiAgZSA+Pj0gKC1uQml0cylcbiAgbkJpdHMgKz0gbUxlblxuICBmb3IgKDsgbkJpdHMgPiAwOyBtID0gbSAqIDI1NiArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxuXG4gIGlmIChlID09PSAwKSB7XG4gICAgZSA9IDEgLSBlQmlhc1xuICB9IGVsc2UgaWYgKGUgPT09IGVNYXgpIHtcbiAgICByZXR1cm4gbSA/IE5hTiA6ICgocyA/IC0xIDogMSkgKiBJbmZpbml0eSlcbiAgfSBlbHNlIHtcbiAgICBtID0gbSArIE1hdGgucG93KDIsIG1MZW4pXG4gICAgZSA9IGUgLSBlQmlhc1xuICB9XG4gIHJldHVybiAocyA/IC0xIDogMSkgKiBtICogTWF0aC5wb3coMiwgZSAtIG1MZW4pXG59XG5cbmV4cG9ydHMud3JpdGUgPSBmdW5jdGlvbiAoYnVmZmVyLCB2YWx1ZSwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG0sIGMsXG4gICAgICBlTGVuID0gbkJ5dGVzICogOCAtIG1MZW4gLSAxLFxuICAgICAgZU1heCA9ICgxIDw8IGVMZW4pIC0gMSxcbiAgICAgIGVCaWFzID0gZU1heCA+PiAxLFxuICAgICAgcnQgPSAobUxlbiA9PT0gMjMgPyBNYXRoLnBvdygyLCAtMjQpIC0gTWF0aC5wb3coMiwgLTc3KSA6IDApLFxuICAgICAgaSA9IGlzTEUgPyAwIDogKG5CeXRlcyAtIDEpLFxuICAgICAgZCA9IGlzTEUgPyAxIDogLTEsXG4gICAgICBzID0gdmFsdWUgPCAwIHx8ICh2YWx1ZSA9PT0gMCAmJiAxIC8gdmFsdWUgPCAwKSA/IDEgOiAwXG5cbiAgdmFsdWUgPSBNYXRoLmFicyh2YWx1ZSlcblxuICBpZiAoaXNOYU4odmFsdWUpIHx8IHZhbHVlID09PSBJbmZpbml0eSkge1xuICAgIG0gPSBpc05hTih2YWx1ZSkgPyAxIDogMFxuICAgIGUgPSBlTWF4XG4gIH0gZWxzZSB7XG4gICAgZSA9IE1hdGguZmxvb3IoTWF0aC5sb2codmFsdWUpIC8gTWF0aC5MTjIpXG4gICAgaWYgKHZhbHVlICogKGMgPSBNYXRoLnBvdygyLCAtZSkpIDwgMSkge1xuICAgICAgZS0tXG4gICAgICBjICo9IDJcbiAgICB9XG4gICAgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICB2YWx1ZSArPSBydCAvIGNcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWUgKz0gcnQgKiBNYXRoLnBvdygyLCAxIC0gZUJpYXMpXG4gICAgfVxuICAgIGlmICh2YWx1ZSAqIGMgPj0gMikge1xuICAgICAgZSsrXG4gICAgICBjIC89IDJcbiAgICB9XG5cbiAgICBpZiAoZSArIGVCaWFzID49IGVNYXgpIHtcbiAgICAgIG0gPSAwXG4gICAgICBlID0gZU1heFxuICAgIH0gZWxzZSBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIG0gPSAodmFsdWUgKiBjIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKVxuICAgICAgZSA9IGUgKyBlQmlhc1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gdmFsdWUgKiBNYXRoLnBvdygyLCBlQmlhcyAtIDEpICogTWF0aC5wb3coMiwgbUxlbilcbiAgICAgIGUgPSAwXG4gICAgfVxuICB9XG5cbiAgZm9yICg7IG1MZW4gPj0gODsgYnVmZmVyW29mZnNldCArIGldID0gbSAmIDB4ZmYsIGkgKz0gZCwgbSAvPSAyNTYsIG1MZW4gLT0gOCkge31cblxuICBlID0gKGUgPDwgbUxlbikgfCBtXG4gIGVMZW4gKz0gbUxlblxuICBmb3IgKDsgZUxlbiA+IDA7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IGUgJiAweGZmLCBpICs9IGQsIGUgLz0gMjU2LCBlTGVuIC09IDgpIHt9XG5cbiAgYnVmZmVyW29mZnNldCArIGkgLSBkXSB8PSBzICogMTI4XG59XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiMVlpWjVTXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi4vbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnVmZmVyL25vZGVfbW9kdWxlcy9pZWVlNzU0L2luZGV4LmpzXCIsXCIvLi4vbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnVmZmVyL25vZGVfbW9kdWxlcy9pZWVlNzU0XCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxucHJvY2Vzcy5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnNldEltbWVkaWF0ZTtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICBpZiAoY2FuUG9zdCkge1xuICAgICAgICB2YXIgcXVldWUgPSBbXTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBldi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbn0pKCk7XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufVxuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiMVlpWjVTXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi4vbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzXCIsXCIvLi4vbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzc1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbnZhciBTaGFkZXIgPSByZXF1aXJlKCdnbC9zaGFkZXInKTtcbnZhciBUZXh0dXJlID0gcmVxdWlyZSgnZ2wvdGV4dHVyZScpO1xudmFyIFBhayA9IHJlcXVpcmUoJ2Zvcm1hdHMvcGFrJyk7XG52YXIgV2FkID0gcmVxdWlyZSgnZm9ybWF0cy93YWQnKTtcbnZhciBQYWxldHRlID0gcmVxdWlyZSgnZm9ybWF0cy9wYWxldHRlJyk7XG52YXIgQnNwID0gcmVxdWlyZSgnZm9ybWF0cy9ic3AnKTtcbnZhciBNZGwgPSByZXF1aXJlKCdmb3JtYXRzL21kbCcpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgndXRpbHMnKTtcblxuZnVuY3Rpb24gZ2V0TmFtZShwYXRoKSB7XG4gICAgdmFyIGluZGV4MSA9IHBhdGgubGFzdEluZGV4T2YoJy8nKTtcbiAgICB2YXIgaW5kZXgyID0gcGF0aC5sYXN0SW5kZXhPZignLicpO1xuICAgIHJldHVybiBwYXRoLnN1YnN0cihpbmRleDEgKyAxLCBpbmRleDIgLSBpbmRleDEgLSAxKTtcbn1cblxuZnVuY3Rpb24gZG93bmxvYWQoaXRlbSwgZG9uZSkge1xuICAgIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgcmVxdWVzdC5vcGVuKCdHRVQnLCBpdGVtLnVybCwgdHJ1ZSk7XG4gICAgcmVxdWVzdC5vdmVycmlkZU1pbWVUeXBlKCd0ZXh0L3BsYWluOyBjaGFyc2V0PXgtdXNlci1kZWZpbmVkJyk7XG4gICAgaWYgKGl0ZW0uYmluYXJ5KVxuICAgICAgICByZXF1ZXN0LnJlc3BvbnNlVHlwZSA9ICdhcnJheWJ1ZmZlcic7XG4gICAgcmVxdWVzdC5vbmxvYWQgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICBpZiAocmVxdWVzdC5zdGF0dXMgIT09IDIwMClcbiAgICAgICAgICAgIHRocm93ICdVbmFibGUgdG8gcmVhZCBmaWxlIGZyb20gdXJsOiAnICsgaXRlbS5uYW1lO1xuXG4gICAgICAgIHZhciBkYXRhID0gaXRlbS5iaW5hcnkgP1xuICAgICAgICAgICAgbmV3IFVpbnQ4QXJyYXkocmVxdWVzdC5yZXNwb25zZSkgOiByZXF1ZXN0LnJlc3BvbnNlVGV4dDtcbiAgICAgICAgZG9uZShpdGVtLCBkYXRhKTtcbiAgICB9O1xuXG4gICAgcmVxdWVzdC5vbmVycm9yID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgdGhyb3cgJ1VuYWJsZSB0byByZWFkIGZpbGUgZnJvbSB1cmw6ICcgKyByZXF1ZXN0LnN0YXR1c1RleHQ7XG4gICAgfTtcbiAgICByZXF1ZXN0LnNlbmQobnVsbCk7XG59XG5cbnZhciBBc3NldHMgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnBlbmRpbmcgPSBbXTtcbiAgICB0aGlzLnNoYWRlcnMgPSB7fTtcbn07XG5cbkFzc2V0cy5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24odXJsLCB0eXBlKSB7XG4gICAgdHlwZSA9IHR5cGUgfHwgdXRpbHMuZ2V0RXh0ZW5zaW9uKHVybCk7XG4gICAgaWYgKCF0eXBlKVxuICAgICAgICB0aHJvdyAnRXJyb3I6IFVuYWJsZSB0byBkZXRlcm1pbmUgdHlwZSBmb3IgYXNzZXQ6ICcgKyBuYW1lO1xuICAgIHZhciBiaW5hcnkgPSB0eXBlICE9PSAnc2hhZGVyJztcbiAgICB0aGlzLnBlbmRpbmcucHVzaCh7IHVybDogdXJsLCBuYW1lOiBnZXROYW1lKHVybCksIHR5cGU6IHR5cGUsIGJpbmFyeTogYmluYXJ5IH0pO1xufTtcblxuQXNzZXRzLnByb3RvdHlwZS5pbnNlcnQgPSBmdW5jdGlvbihpdGVtLCBkYXRhKSB7XG4gICAgc3dpdGNoIChpdGVtLnR5cGUpIHtcbiAgICAgICAgY2FzZSAncGFrJzpcbiAgICAgICAgICAgIHRoaXMucGFrID0gbmV3IFBhayhkYXRhKTtcbiAgICAgICAgICAgIHRoaXMud2FkID0gbmV3IFdhZCh0aGlzLnBhay5sb2FkKCdnZngud2FkJykpO1xuICAgICAgICAgICAgdGhpcy5wYWxldHRlID0gbmV3IFBhbGV0dGUodGhpcy5wYWsubG9hZCgnZ2Z4L3BhbGV0dGUubG1wJykpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3NoYWRlcic6XG4gICAgICAgICAgICB0aGlzLnNoYWRlcnNbaXRlbS5uYW1lXSA9IG5ldyBTaGFkZXIoZGF0YSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDogdGhyb3cgJ0Vycm9yOiBVbmtub3duIHR5cGUgbG9hZGVkOiAnICsgaXRlbS50eXBlO1xuICAgIH1cbn07XG5cbkFzc2V0cy5wcm90b3R5cGUubG9hZCA9IGZ1bmN0aW9uKG5hbWUsIG9wdGlvbnMpIHtcblxuICAgIHZhciBpbmRleCA9IG5hbWUuaW5kZXhPZignLycpO1xuICAgIHZhciBsb2NhdGlvbiA9IG5hbWUuc3Vic3RyKDAsIGluZGV4KTtcbiAgICB2YXIgdHlwZSA9IHV0aWxzLmdldEV4dGVuc2lvbihuYW1lKSB8fCAndGV4dHVyZSc7XG4gICAgdmFyIG5hbWUgPSBuYW1lLnN1YnN0cihpbmRleCArIDEpO1xuICAgIHZhciBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICBjYXNlICdic3AnOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBCc3AodGhpcy5wYWsubG9hZChuYW1lKSk7XG4gICAgICAgIGNhc2UgJ21kbCc6XG4gICAgICAgICAgICByZXR1cm4gbmV3IE1kbChuYW1lLCB0aGlzLnBhay5sb2FkKG5hbWUpKTtcbiAgICB9XG5cbiAgICBvcHRpb25zLnBhbGV0dGUgPSB0aGlzLnBhbGV0dGU7XG4gICAgc3dpdGNoKGxvY2F0aW9uKSB7XG4gICAgICAgIGNhc2UgJ3Bhayc6XG4gICAgICAgICAgICB2YXIgZGF0YSA9IHRoaXMucGFrLmxvYWQobmFtZSk7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFRleHR1cmUoZGF0YSwgb3B0aW9ucyk7XG4gICAgICAgIGNhc2UgJ3dhZCc6XG4gICAgICAgICAgICB2YXIgZGF0YSA9IHRoaXMud2FkLmdldChuYW1lKTtcbiAgICAgICAgICAgIHJldHVybiBuZXcgVGV4dHVyZShkYXRhLCBvcHRpb25zKTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93ICdFcnJvcjogQ2Fubm90IGxvYWQgZmlsZXMgb3V0c2lkZSBQQUsvV0FEOiAnICsgbmFtZTtcbiAgICB9XG59O1xuXG5Bc3NldHMucHJvdG90eXBlLnByZWNhY2hlID0gZnVuY3Rpb24oZG9uZSkge1xuICAgIHZhciB0b3RhbCA9IHRoaXMucGVuZGluZy5sZW5ndGg7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGZvciAodmFyIGkgaW4gdGhpcy5wZW5kaW5nKSB7XG4gICAgICAgIHZhciBwZW5kaW5nID0gdGhpcy5wZW5kaW5nW2ldO1xuICAgICAgICBkb3dubG9hZChwZW5kaW5nLCBmdW5jdGlvbihpdGVtLCBkYXRhKSB7XG4gICAgICAgICAgICBzZWxmLmluc2VydChpdGVtLCBkYXRhKTtcbiAgICAgICAgICAgIGlmICgtLXRvdGFsIDw9IDApIHtcbiAgICAgICAgICAgICAgICBzZWxmLnBlbmRpbmcgPSBbXTtcbiAgICAgICAgICAgICAgICBkb25lKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn07XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBuZXcgQXNzZXRzKCk7XG59KS5jYWxsKHRoaXMscmVxdWlyZShcIjFZaVo1U1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2Fzc2V0cy5qc1wiLFwiL1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbnZhciBhc3NldHMgPSByZXF1aXJlKCdhc3NldHMnKTtcbnZhciBQcm90b2NvbCA9IHJlcXVpcmUoJ3Byb3RvY29sJyk7XG52YXIgTWFwID0gcmVxdWlyZSgnbWFwJyk7XG52YXIgTW9kZWwgPSByZXF1aXJlKCdtb2RlbCcpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgndXRpbHMnKTtcblxudmFyIENsaWVudCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucHJpb3JWaWV3QW5nbGVzID0gdmVjMy5jcmVhdGUoKTtcbiAgICB0aGlzLnZpZXdBbmdsZXMgPSB2ZWMzLmNyZWF0ZSgpO1xuICAgIHRoaXMubmV4dFZpZXdBbmdsZXMgPSB2ZWMzLmNyZWF0ZSgpO1xuICAgIHRoaXMudmlld0VudGl0eSA9IC0xO1xuICAgIHRoaXMudGltZSA9IHsgc2VydmVyVGltZTogLTEsIG9sZENsaWVudFRpbWU6IC0xLCBjbGllbnRUaW1lOiAtMSB9O1xuXG5cbiAgICAvLyBURU1QT1JBUlkuXG4gICAgdGhpcy5tYXAgPSBudWxsO1xuICAgIHRoaXMuZW50aXRpZXMgPSBbXTtcbiAgICB0aGlzLnN0YXRpY3MgPSBbXTtcbiAgICB0aGlzLm1vZGVscyA9IFsnZHVtbXknXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDEwMjQ7IGkrKykge1xuICAgICAgICB2YXIgZW50aXR5ID0ge1xuICAgICAgICAgICAgc3RhdGU6IHsgYW5nbGVzOiB2ZWMzLmNyZWF0ZSgpLCBvcmlnaW46IHZlYzMuY3JlYXRlKCkgfSxcbiAgICAgICAgICAgIHByaW9yU3RhdGU6IHsgYW5nbGVzOiB2ZWMzLmNyZWF0ZSgpLCBvcmlnaW46IHZlYzMuY3JlYXRlKCkgfSxcbiAgICAgICAgICAgIG5leHRTdGF0ZTogeyBhbmdsZXM6IHZlYzMuY3JlYXRlKCksIG9yaWdpbjogdmVjMy5jcmVhdGUoKSB9XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZW50aXRpZXMucHVzaChlbnRpdHkpO1xuICAgIH1cbn07XG5cbkNsaWVudC5wcm90b3R5cGUucGxheURlbW8gPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIGRlbW8gPSBhc3NldHMucGFrLmxvYWQobmFtZSk7XG4gICAgd2hpbGUgKGRlbW8ucmVhZFVJbnQ4KCkgIT09IDEwKTtcbiAgICB0aGlzLmRlbW8gPSBkZW1vO1xufTtcblxuQ2xpZW50LnByb3RvdHlwZS5yZWFkRnJvbVNlcnZlciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBkZW1vID0gdGhpcy5kZW1vO1xuICAgIGlmICghZGVtbyB8fCBkZW1vLmVvZigpKSByZXR1cm47XG5cbiAgICB2YXIgbWVzc2FnZVNpemUgPSBkZW1vLnJlYWRJbnQzMigpO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAzOyBpKyspIHtcbiAgICAgICAgdGhpcy5wcmlvclZpZXdBbmdsZXNbaV0gPSB0aGlzLm5leHRWaWV3QW5nbGVzW2ldO1xuICAgICAgICB0aGlzLm5leHRWaWV3QW5nbGVzW2ldID0gZGVtby5yZWFkRmxvYXQoKTtcbiAgICB9XG5cbiAgICB2YXIgbXNnID0gZGVtby5yZWFkKG1lc3NhZ2VTaXplKTtcbiAgICB2YXIgY21kID0gMDtcbiAgICB3aGlsZSAoY21kICE9PSAtMSAmJiAhbXNnLmVvZigpKSB7XG4gICAgICAgIGNtZCA9IG1zZy5yZWFkVUludDgoKTtcbiAgICAgICAgaWYgKGNtZCAmIDEyOCkge1xuICAgICAgICAgICAgdGhpcy5wYXJzZUZhc3RVcGRhdGUoY21kICYgMTI3LCBtc2cpO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBzd2l0Y2ggKGNtZCkge1xuICAgICAgICAgICAgY2FzZSBQcm90b2NvbC5zZXJ2ZXJEaXNjb25uZWN0OlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdESVNDT05ORUNUIScpO1xuICAgICAgICAgICAgICAgIHRoaXMuZGVtbyA9IG51bGw7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgY2FzZSBQcm90b2NvbC5zZXJ2ZXJVcGRhdGVTdGF0OlxuICAgICAgICAgICAgICAgIHZhciBzdGF0ID0gbXNnLnJlYWRVSW50OCgpO1xuICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IG1zZy5yZWFkSW50MzIoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgUHJvdG9jb2wuc2VydmVyU2V0VmlldzpcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdFbnRpdHkgPSBtc2cucmVhZEludDE2KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFByb3RvY29sLnNlcnZlclRpbWU6XG4gICAgICAgICAgICAgICAgdGhpcy50aW1lLnNlcnZlclRpbWUgPSBtc2cucmVhZEZsb2F0KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFByb3RvY29sLnNlcnZlclNldEFuZ2xlOlxuICAgICAgICAgICAgICAgIHRoaXMudmlld0FuZ2xlc1swXSA9IG1zZy5yZWFkSW50OCgpICogMS40MDYyNTtcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdBbmdsZXNbMV0gPSBtc2cucmVhZEludDgoKSAqIDEuNDA2MjU7XG4gICAgICAgICAgICAgICAgdGhpcy52aWV3QW5nbGVzWzJdID0gbXNnLnJlYWRJbnQ4KCkgKiAxLjQwNjI1O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQcm90b2NvbC5zZXJ2ZXJTb3VuZDpcbiAgICAgICAgICAgICAgICB0aGlzLnBhcnNlU291bmQobXNnKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgUHJvdG9jb2wuc2VydmVyUHJpbnQ6XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cobXNnLnJlYWRDU3RyaW5nKCkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQcm90b2NvbC5zZXJ2ZXJMaWdodFN0eWxlOlxuICAgICAgICAgICAgICAgIHZhciBzdHlsZSA9IG1zZy5yZWFkVUludDgoKTtcbiAgICAgICAgICAgICAgICB2YXIgcGF0dGVybiA9IG1zZy5yZWFkQ1N0cmluZygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQcm90b2NvbC5zZXJ2ZXJDbGllbnREYXRhOlxuICAgICAgICAgICAgICAgIHRoaXMucGFyc2VDbGllbnREYXRhKG1zZyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFByb3RvY29sLnNlcnZlclVwZGF0ZU5hbWU6XG4gICAgICAgICAgICAgICAgdmFyIGNsaWVudCA9IG1zZy5yZWFkVUludDgoKTtcbiAgICAgICAgICAgICAgICB2YXIgbmFtZSA9IG1zZy5yZWFkQ1N0cmluZygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQcm90b2NvbC5zZXJ2ZXJVcGRhdGVGcmFnczpcbiAgICAgICAgICAgICAgICB2YXIgY2xpZW50ID0gbXNnLnJlYWRVSW50OCgpO1xuICAgICAgICAgICAgICAgIHZhciBmcmFncyA9IG1zZy5yZWFkSW50MTYoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgUHJvdG9jb2wuc2VydmVyVXBkYXRlQ29sb3JzOlxuICAgICAgICAgICAgICAgIHZhciBjbGllbnQgPSBtc2cucmVhZFVJbnQ4KCk7XG4gICAgICAgICAgICAgICAgdmFyIGNvbG9ycyA9IG1zZy5yZWFkVUludDgoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgUHJvdG9jb2wuc2VydmVyUGFydGljbGU6XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJzZVBhcnRpY2xlKG1zZyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFByb3RvY29sLnNlcnZlclN0dWZmVGV4dDpcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhtc2cucmVhZENTdHJpbmcoKSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFByb3RvY29sLnNlcnZlclRlbXBFbnRpdHk6XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJzZVRlbXBFbnRpdHkobXNnKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgUHJvdG9jb2wuc2VydmVySW5mbzpcbiAgICAgICAgICAgICAgICB0aGlzLnBhcnNlU2VydmVySW5mbyhtc2cpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQcm90b2NvbC5zZXJ2ZXJTaWdub25OdW06XG4gICAgICAgICAgICAgICAgbXNnLnNraXAoMSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFByb3RvY29sLnNlcnZlckNkVHJhY2s6XG4gICAgICAgICAgICAgICAgbXNnLnNraXAoMik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFByb3RvY29sLnNlcnZlclNwYXduU3RhdGljOlxuICAgICAgICAgICAgICAgIHZhciBiYXNlbGluZSA9IHRoaXMucGFyc2VCYXNlbGluZShtc2cpO1xuICAgICAgICAgICAgICAgIHZhciBlbnRpdHkgPSB7IHN0YXRlOiBiYXNlbGluZSB9O1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGljcy5wdXNoKGVudGl0eSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFByb3RvY29sLnNlcnZlcktpbGxlZE1vbnN0ZXI6XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFByb3RvY29sLnNlcnZlckRhbWFnZTpcbiAgICAgICAgICAgICAgICB0aGlzLnBhcnNlRGFtYWdlKG1zZyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFByb3RvY29sLnNlcnZlckZvdW5kU2VjcmV0OlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQcm90b2NvbC5zZXJ2ZXJTcGF3bkJhc2VsaW5lOlxuICAgICAgICAgICAgICAgIHZhciBlbnRpdHlObyA9IG1zZy5yZWFkSW50MTYoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmVudGl0aWVzW2VudGl0eU5vXS5zdGF0ZSA9IHRoaXMucGFyc2VCYXNlbGluZShtc2cpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQcm90b2NvbC5zZXJ2ZXJDZW50ZXJQcmludDpcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQ0VOVEVSOiAnLCBtc2cucmVhZENTdHJpbmcoKSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFByb3RvY29sLnNlcnZlclNwYXduU3RhdGljU291bmQ6XG4gICAgICAgICAgICAgICAgbXNnLnNraXAoOSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OiB0aHJvdyAnVW5rbm93biBjbWQ6ICcgKyBjbWQ7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5DbGllbnQucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKHRpbWUpIHtcbiAgICB0aGlzLnRpbWUub2xkQ2xpZW50VGltZSA9IHRoaXMudGltZS5jbGllbnRUaW1lO1xuICAgIHRoaXMudGltZS5jbGllbnRUaW1lID0gdGltZSAvIDEwMDA7XG5cbiAgICBpZiAodGhpcy50aW1lLmNsaWVudFRpbWUgPiB0aGlzLnRpbWUuc2VydmVyVGltZSlcbiAgICAgICAgdGhpcy5yZWFkRnJvbVNlcnZlcigpO1xuXG5cbiAgICB2YXIgZHQgPSB0aGlzLnRpbWUuY2xpZW50VGltZSAtIHRoaXMudGltZS5vbGRDbGllbnRUaW1lO1xuXG4gICAgZm9yICh2YXIgYSA9IDA7IGEgPCAzOyBhKyspIHtcbiAgICAgICAgdmFyIGRlbHRhQW5nbGUgPSB0aGlzLm5leHRWaWV3QW5nbGVzW2FdIC0gdGhpcy5wcmlvclZpZXdBbmdsZXNbYV07XG4gICAgICAgIGlmIChkZWx0YUFuZ2xlID4gMTgwKVxuICAgICAgICAgICAgZGVsdGFBbmdsZSAtPSAzNjA7XG4gICAgICAgIGVsc2UgaWYgKGRlbHRhQW5nbGUgPCAtMTgwKVxuICAgICAgICAgICAgZGVsdGFBbmdsZSArPSAzNjA7XG4gICAgICAgIHRoaXMudmlld0FuZ2xlc1thXSA9IHRoaXMucHJpb3JWaWV3QW5nbGVzW2FdICsgZGVsdGFBbmdsZSAqIGR0O1xuICAgIH1cblxuXG4gICAgLy8gVE9ETzogTW92ZSB0byBlbnRpdGllcy5qcyBvciBzaW1pbGFyLlxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5lbnRpdGllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgZW50aXR5ID0gdGhpcy5lbnRpdGllc1tpXTtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCAzOyBqKyspIHtcbiAgICAgICAgICAgIGVudGl0eS5zdGF0ZS5vcmlnaW5bal0gPSBlbnRpdHkucHJpb3JTdGF0ZS5vcmlnaW5bal0gK1xuICAgICAgICAgICAgKGVudGl0eS5uZXh0U3RhdGUub3JpZ2luW2pdIC0gZW50aXR5LnByaW9yU3RhdGUub3JpZ2luW2pdKSAqIGR0O1xuICAgICAgICAgICAgZW50aXR5LnN0YXRlLmFuZ2xlc1tqXSA9IGVudGl0eS5wcmlvclN0YXRlLmFuZ2xlc1tqXSArXG4gICAgICAgICAgICAoZW50aXR5Lm5leHRTdGF0ZS5hbmdsZXNbal0gLSBlbnRpdHkucHJpb3JTdGF0ZS5hbmdsZXNbal0pICogZHQ7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5DbGllbnQucHJvdG90eXBlLnBhcnNlU2VydmVySW5mbyA9IGZ1bmN0aW9uKG1zZykge1xuICAgIG1zZy5za2lwKDYpO1xuICAgIHZhciBtYXBOYW1lID0gbXNnLnJlYWRDU3RyaW5nKCk7XG5cbiAgICB3aGlsZSh0cnVlKSB7XG4gICAgICAgIHZhciBtb2RlbE5hbWUgPSBtc2cucmVhZENTdHJpbmcoKTtcbiAgICAgICAgaWYgKCFtb2RlbE5hbWUpIGJyZWFrO1xuICAgICAgICB2YXIgdHlwZSA9IHV0aWxzLmdldEV4dGVuc2lvbihtb2RlbE5hbWUpO1xuICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2JzcCc6XG4gICAgICAgICAgICAgICAgdmFyIG1vZGVsID0gbmV3IE1hcChhc3NldHMubG9hZCgncGFrLycgKyBtb2RlbE5hbWUpKTtcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVscy5wdXNoKG1vZGVsKTtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMubWFwKSB7IHRoaXMubWFwID0gbW9kZWw7IH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ21kbCc6XG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbHMucHVzaChuZXcgTW9kZWwoYXNzZXRzLmxvYWQoJ3Bhay8nICsgbW9kZWxOYW1lKSkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVscy5wdXNoKG51bGwpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIH1cbiAgICB9XG4gICAgd2hpbGUodHJ1ZSkge1xuICAgICAgICB2YXIgc291bmROYW1lID0gbXNnLnJlYWRDU3RyaW5nKCk7XG4gICAgICAgIGlmICghc291bmROYW1lKSBicmVhaztcbiAgICAgICAgLy9jb25zb2xlLmxvZyhzb3VuZE5hbWUpO1xuICAgIH1cbn07XG5cbkNsaWVudC5wcm90b3R5cGUucGFyc2VDbGllbnREYXRhID0gZnVuY3Rpb24obXNnKSB7XG4gICAgdmFyIGJpdHMgPSBtc2cucmVhZEludDE2KCk7XG4gICAgaWYgKGJpdHMgJiBQcm90b2NvbC5jbGllbnRWaWV3SGVpZ2h0KVxuICAgICAgICBtc2cucmVhZFVJbnQ4KCk7XG5cbiAgICBpZiAoYml0cyAmIFByb3RvY29sLmNsaWVudElkZWFsUGl0Y2gpXG4gICAgICAgIG1zZy5yZWFkSW50OCgpO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAzOyBpKyspIHtcblxuICAgICAgICBpZiAoYml0cyAmIChQcm90b2NvbC5jbGllbnRQdW5jaDEgPDwgaSkpXG4gICAgICAgICAgICBtc2cucmVhZEludDgoKTtcblxuICAgICAgICBpZiAoYml0cyAmIChQcm90b2NvbC5jbGllbnRWZWxvY2l0eTEgPDwgaSkpXG4gICAgICAgICAgICBtc2cucmVhZEludDgoKTtcbiAgICB9XG5cbiAgICBtc2cucmVhZEludDMyKCk7XG5cbiAgICBpZiAoYml0cyAmIFByb3RvY29sLmNsaWVudFdlYXBvbkZyYW1lKVxuICAgICAgICBtc2cucmVhZFVJbnQ4KCk7XG5cbiAgICBpZiAoYml0cyAmIFByb3RvY29sLmNsaWVudEFybW9yKVxuICAgICAgICBtc2cucmVhZFVJbnQ4KCk7XG5cbiAgICBpZiAoYml0cyAmIFByb3RvY29sLmNsaWVudFdlYXBvbilcbiAgICAgICAgbXNnLnJlYWRVSW50OCgpO1xuXG4gICAgbXNnLnJlYWRJbnQxNigpO1xuICAgIG1zZy5yZWFkVUludDgoKTtcbiAgICBtc2cucmVhZFN0cmluZyg1KTtcbn07XG5cbkNsaWVudC5wcm90b3R5cGUucGFyc2VGYXN0VXBkYXRlID0gZnVuY3Rpb24oY21kLCBtc2cpIHtcbiAgICBpZiAoY21kICYgUHJvdG9jb2wuZmFzdFVwZGF0ZU1vcmVCaXRzKVxuICAgICAgICBjbWQgPSBjbWQgfCAobXNnLnJlYWRVSW50OCgpIDw8IDgpO1xuXG4gICAgdmFyIGVudGl0eU5vID0gKGNtZCAmIFByb3RvY29sLmZhc3RVcGRhdGVMb25nRW50aXR5KSA/XG4gICAgICAgIG1zZy5yZWFkSW50MTYoKSA6IG1zZy5yZWFkVUludDgoKTtcblxuXG4gICAgdmFyIGVudGl0eSA9IHRoaXMuZW50aXRpZXNbZW50aXR5Tm9dO1xuICAgIGVudGl0eS50aW1lID0gdGhpcy5zZXJ2ZXJUaW1lO1xuXG4gICAgaWYgKGNtZCAmIFByb3RvY29sLmZhc3RVcGRhdGVNb2RlbCkge1xuICAgICAgICBlbnRpdHkuc3RhdGUubW9kZWxJbmRleCA9IG1zZy5yZWFkVUludDgoKTtcbiAgICB9XG4gICAgaWYgKGNtZCAmIFByb3RvY29sLmZhc3RVcGRhdGVGcmFtZSlcbiAgICAgICAgZW50aXR5LnN0YXRlLmZyYW1lID0gbXNnLnJlYWRVSW50OCgpO1xuICAgIC8vZWxzZVxuICAgIC8vICAgIGVudGl0eS5zdGF0ZS5mcmFtZSA9IGVudGl0eS5iYXNlbGluZS5mcmFtZTtcblxuICAgIGlmIChjbWQgJiBQcm90b2NvbC5mYXN0VXBkYXRlQ29sb3JNYXApXG4gICAgICAgIG1zZy5yZWFkVUludDgoKTtcblxuICAgIGlmIChjbWQgJiBQcm90b2NvbC5mYXN0VXBkYXRlU2tpbilcbiAgICAgICAgbXNnLnJlYWRVSW50OCgpO1xuICAgIGlmIChjbWQgJiBQcm90b2NvbC5mYXN0VXBkYXRlRWZmZWN0cylcbiAgICAgICAgbXNnLnJlYWRVSW50OCgpO1xuXG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDM7IGkrKykge1xuICAgICAgICBlbnRpdHkucHJpb3JTdGF0ZS5hbmdsZXNbaV0gPSBlbnRpdHkubmV4dFN0YXRlLmFuZ2xlc1tpXTtcbiAgICAgICAgZW50aXR5LnByaW9yU3RhdGUub3JpZ2luW2ldID0gZW50aXR5Lm5leHRTdGF0ZS5vcmlnaW5baV07XG4gICAgfVxuXG4gICAgaWYgKGNtZCAmIFByb3RvY29sLmZhc3RVcGRhdGVPcmlnaW4xKVxuICAgICAgICBlbnRpdHkubmV4dFN0YXRlLm9yaWdpblswXSA9IG1zZy5yZWFkSW50MTYoKSAqIDAuMTI1O1xuICAgIGlmIChjbWQgJiBQcm90b2NvbC5mYXN0VXBkYXRlQW5nbGUxKVxuICAgICAgICBlbnRpdHkubmV4dFN0YXRlLmFuZ2xlc1swXSA9IG1zZy5yZWFkSW50OCgpICogMS40MDYyNTtcbiAgICBpZiAoY21kICYgUHJvdG9jb2wuZmFzdFVwZGF0ZU9yaWdpbjIpXG4gICAgICAgIGVudGl0eS5uZXh0U3RhdGUub3JpZ2luWzFdID0gbXNnLnJlYWRJbnQxNigpICogMC4xMjU7XG4gICAgaWYgKGNtZCAmIFByb3RvY29sLmZhc3RVcGRhdGVBbmdsZTIpXG4gICAgICAgIGVudGl0eS5uZXh0U3RhdGUuYW5nbGVzWzFdID0gbXNnLnJlYWRJbnQ4KCkgKiAxLjQwNjI1O1xuICAgIGlmIChjbWQgJiBQcm90b2NvbC5mYXN0VXBkYXRlT3JpZ2luMylcbiAgICAgICAgZW50aXR5Lm5leHRTdGF0ZS5vcmlnaW5bMl0gPSBtc2cucmVhZEludDE2KCkgKiAwLjEyNTtcbiAgICBpZiAoY21kICYgUHJvdG9jb2wuZmFzdFVwZGF0ZUFuZ2xlMylcbiAgICAgICAgZW50aXR5Lm5leHRTdGF0ZS5hbmdsZXNbMl0gPSBtc2cucmVhZEludDgoKSAqIDEuNDA2MjU7XG59O1xuXG5DbGllbnQucHJvdG90eXBlLnBhcnNlU291bmQgPSBmdW5jdGlvbihtc2cpIHtcbiAgICB2YXIgYml0cyA9IG1zZy5yZWFkVUludDgoKTtcbiAgICB2YXIgdm9sdW1lID0gKGJpdHMgJiBQcm90b2NvbC5zb3VuZFZvbHVtZSkgPyBtc2cucmVhZFVJbnQ4KCkgOiAyNTU7XG4gICAgdmFyIGF0dGVudWF0aW9uID0gKGJpdHMgJiBQcm90b2NvbC5zb3VuZEF0dGVudWF0aW9uKSA/IG1zZy5yZWFkVUludDgoKSAvIDY0LjAgOiAxLjA7XG4gICAgdmFyIGNoYW5uZWwgPSBtc2cucmVhZEludDE2KCk7XG4gICAgdmFyIHNvdW5kSW5kZXggPSBtc2cucmVhZFVJbnQ4KCk7XG5cbiAgICB2YXIgcG9zID0gdmVjMy5jcmVhdGUoKTtcbiAgICBwb3NbMF0gPSBtc2cucmVhZEludDE2KCkgKiAwLjEyNTtcbiAgICBwb3NbMV0gPSBtc2cucmVhZEludDE2KCkgKiAwLjEyNTtcbiAgICBwb3NbMl0gPSBtc2cucmVhZEludDE2KCkgKiAwLjEyNTtcbn07XG5cbkNsaWVudC5wcm90b3R5cGUucGFyc2VUZW1wRW50aXR5ID0gZnVuY3Rpb24obXNnKSB7XG4gICAgdmFyIHR5cGUgPSBtc2cucmVhZFVJbnQ4KCk7XG4gICAgdmFyIHBvcyA9IHZlYzMuY3JlYXRlKCk7XG4gICAgc3dpdGNoKHR5cGUpIHtcbiAgICAgICAgY2FzZSBQcm90b2NvbC50ZW1wR3VuU2hvdDpcbiAgICAgICAgY2FzZSBQcm90b2NvbC50ZW1wV2l6U3Bpa2U6XG4gICAgICAgIGNhc2UgUHJvdG9jb2wudGVtcFNwaWtlOlxuICAgICAgICBjYXNlIFByb3RvY29sLnRlbXBTdXBlclNwaWtlOlxuXHRcdGNhc2UgUHJvdG9jb2wudGVtcFRlbGVwb3J0OlxuXHRcdGNhc2UgUHJvdG9jb2wudGVtcEV4cGxvc2lvbjpcbiAgICAgICAgICAgIHBvc1swXSA9IG1zZy5yZWFkSW50MTYoKSAqIDAuMTI1O1xuICAgICAgICAgICAgcG9zWzFdID0gbXNnLnJlYWRJbnQxNigpICogMC4xMjU7XG4gICAgICAgICAgICBwb3NbMl0gPSBtc2cucmVhZEludDE2KCkgKiAwLjEyNTtcbiAgICAgICAgICAgIGJyZWFrO1xuXHRcdGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyAnVW5rbm93biB0ZW1wLiBlbnRpdHkgZW5jb3VudGVyZWQ6ICcgKyB0eXBlO1xuICAgIH1cbn07XG5cbkNsaWVudC5wcm90b3R5cGUucGFyc2VEYW1hZ2UgPSBmdW5jdGlvbihtc2cpIHtcbiAgICB2YXIgYXJtb3IgPSBtc2cucmVhZFVJbnQ4KCk7XG4gICAgdmFyIGJsb29kID0gbXNnLnJlYWRVSW50OCgpO1xuXG4gICAgdmFyIHBvcyA9IHZlYzMuY3JlYXRlKCk7XG4gICAgcG9zWzBdID0gbXNnLnJlYWRJbnQxNigpICogMC4xMjU7XG4gICAgcG9zWzFdID0gbXNnLnJlYWRJbnQxNigpICogMC4xMjU7XG4gICAgcG9zWzJdID0gbXNnLnJlYWRJbnQxNigpICogMC4xMjU7XG59O1xuXG5DbGllbnQucHJvdG90eXBlLnBhcnNlUGFydGljbGUgPSBmdW5jdGlvbihtc2cpIHtcbiAgICB2YXIgcG9zID0gdmVjMy5jcmVhdGUoKTtcbiAgICB2YXIgYW5nbGVzID0gdmVjMy5jcmVhdGUoKTtcbiAgICBwb3NbMF0gPSBtc2cucmVhZEludDE2KCkgKiAwLjEyNTtcbiAgICBwb3NbMV0gPSBtc2cucmVhZEludDE2KCkgKiAwLjEyNTtcbiAgICBwb3NbMl0gPSBtc2cucmVhZEludDE2KCkgKiAwLjEyNTtcbiAgICBhbmdsZXNbMF0gPSBtc2cucmVhZEludDgoKSAqIDAuMDYyNTtcbiAgICBhbmdsZXNbMV0gPSBtc2cucmVhZEludDgoKSAqIDAuMDYyNTtcbiAgICBhbmdsZXNbMl0gPSBtc2cucmVhZEludDgoKSAqIDAuMDYyNTtcbiAgICB2YXIgY291bnQgPSBtc2cucmVhZFVJbnQ4KCk7XG4gICAgdmFyIGNvbG9yID0gbXNnLnJlYWRVSW50OCgpO1xufTtcblxuQ2xpZW50LnByb3RvdHlwZS5wYXJzZUJhc2VsaW5lID0gZnVuY3Rpb24obXNnKSB7XG4gICAgdmFyIGJhc2VsaW5lID0ge1xuICAgICAgICBtb2RlbEluZGV4OiBtc2cucmVhZFVJbnQ4KCksXG4gICAgICAgIGZyYW1lOiBtc2cucmVhZFVJbnQ4KCksXG4gICAgICAgIGNvbG9yTWFwOiBtc2cucmVhZFVJbnQ4KCksXG4gICAgICAgIHNraW46IG1zZy5yZWFkVUludDgoKSxcbiAgICAgICAgb3JpZ2luOiB2ZWMzLmNyZWF0ZSgpLFxuICAgICAgICBhbmdsZXM6IHZlYzMuY3JlYXRlKClcbiAgICB9O1xuICAgIGJhc2VsaW5lLm9yaWdpblswXSA9IG1zZy5yZWFkSW50MTYoKSAqIDAuMTI1O1xuICAgIGJhc2VsaW5lLmFuZ2xlc1swXSA9IG1zZy5yZWFkSW50OCgpICogMS40MDYyNTtcbiAgICBiYXNlbGluZS5vcmlnaW5bMV0gPSBtc2cucmVhZEludDE2KCkgKiAwLjEyNTtcbiAgICBiYXNlbGluZS5hbmdsZXNbMV0gPSBtc2cucmVhZEludDgoKSAqIDEuNDA2MjU7XG4gICAgYmFzZWxpbmUub3JpZ2luWzJdID0gbXNnLnJlYWRJbnQxNigpICogMC4xMjU7XG4gICAgYmFzZWxpbmUuYW5nbGVzWzJdID0gbXNnLnJlYWRJbnQ4KCkgKiAxLjQwNjI1O1xuICAgIHJldHVybiBiYXNlbGluZTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IENsaWVudDtcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiMVlpWjVTXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvY2xpZW50LmpzXCIsXCIvXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIEJ1ZmZlciA9IHJlcXVpcmUoJ2J1ZmZlcicpLkJ1ZmZlcjtcblxudmFyIEZpbGUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgdGhpcy5idWZmZXIgPSBuZXcgQnVmZmVyKGRhdGEpO1xuICAgIHRoaXMub2Zmc2V0ID0gMDtcbn07XG5cbkZpbGUucHJvdG90eXBlLnRlbGwgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5vZmZzZXQ7XG59O1xuXG5GaWxlLnByb3RvdHlwZS5zZWVrID0gZnVuY3Rpb24ob2Zmc2V0KSB7XG4gICAgdGhpcy5vZmZzZXQgPSBvZmZzZXQ7XG59O1xuXG5GaWxlLnByb3RvdHlwZS5za2lwID0gZnVuY3Rpb24oYnl0ZXMpIHtcbiAgICB0aGlzLm9mZnNldCArPSBieXRlcztcbn07XG5cbkZpbGUucHJvdG90eXBlLmVvZiA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLm9mZnNldCA+PSB0aGlzLmJ1ZmZlci5sZW5ndGg7XG59O1xuXG5GaWxlLnByb3RvdHlwZS5zbGljZSA9IGZ1bmN0aW9uKG9mZnNldCwgbGVuZ3RoKSB7XG4gICAgcmV0dXJuIG5ldyBGaWxlKHRoaXMuYnVmZmVyLnNsaWNlKG9mZnNldCwgb2Zmc2V0ICsgbGVuZ3RoKSk7XG59O1xuXG5GaWxlLnByb3RvdHlwZS5yZWFkID0gZnVuY3Rpb24obGVuZ3RoKSB7XG4gICAgdmFyIHJlc3VsdCA9IG5ldyBGaWxlKHRoaXMuYnVmZmVyLnNsaWNlKHRoaXMub2Zmc2V0LCB0aGlzLm9mZnNldCArIGxlbmd0aCkpO1xuICAgIHRoaXMub2Zmc2V0ICs9IGxlbmd0aDtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuRmlsZS5wcm90b3R5cGUucmVhZFN0cmluZyA9IGZ1bmN0aW9uKGxlbmd0aCkge1xuICAgIHZhciByZXN1bHQgPSAnJztcbiAgICB2YXIgdGVybWluYXRlZCA9IGZhbHNlO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGJ5dGUgPSB0aGlzLmJ1ZmZlci5yZWFkVUludDgodGhpcy5vZmZzZXQrKyk7XG4gICAgICAgIGlmIChieXRlID09PSAweDApIHRlcm1pbmF0ZWQgPSB0cnVlO1xuICAgICAgICBpZiAoIXRlcm1pbmF0ZWQpXG4gICAgICAgICAgICByZXN1bHQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbkZpbGUucHJvdG90eXBlLnJlYWRDU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHJlc3VsdCA9ICcnO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTI4OyBpKyspIHtcbiAgICAgICAgdmFyIGJ5dGUgPSB0aGlzLmJ1ZmZlci5yZWFkVUludDgodGhpcy5vZmZzZXQrKyk7XG4gICAgICAgIGlmIChieXRlID09PSAweDApIHJldHVybiByZXN1bHQ7XG4gICAgICAgIHJlc3VsdCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGUpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuRmlsZS5wcm90b3R5cGUucmVhZFVJbnQ4ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuYnVmZmVyLnJlYWRVSW50OCh0aGlzLm9mZnNldCsrKTtcbn07XG5cbkZpbGUucHJvdG90eXBlLnJlYWRJbnQ4ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuYnVmZmVyLnJlYWRJbnQ4KHRoaXMub2Zmc2V0KyspO1xufTtcblxuRmlsZS5wcm90b3R5cGUucmVhZFVJbnQxNiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByZXN1bHQgPSB0aGlzLmJ1ZmZlci5yZWFkVUludDE2TEUodGhpcy5vZmZzZXQpO1xuICAgIHRoaXMub2Zmc2V0ICs9IDI7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbkZpbGUucHJvdG90eXBlLnJlYWRJbnQxNiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByZXN1bHQgPSB0aGlzLmJ1ZmZlci5yZWFkSW50MTZMRSh0aGlzLm9mZnNldCk7XG4gICAgdGhpcy5vZmZzZXQgKz0gMjtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuRmlsZS5wcm90b3R5cGUucmVhZFVJbnQzMiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByZXN1bHQgPSB0aGlzLmJ1ZmZlci5yZWFkVUludDMyTEUodGhpcy5vZmZzZXQpO1xuICAgIHRoaXMub2Zmc2V0ICs9IDQ7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbkZpbGUucHJvdG90eXBlLnJlYWRJbnQzMiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByZXN1bHQgPSB0aGlzLmJ1ZmZlci5yZWFkSW50MzJMRSh0aGlzLm9mZnNldCk7XG4gICAgdGhpcy5vZmZzZXQgKz0gNDtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuRmlsZS5wcm90b3R5cGUucmVhZEZsb2F0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHJlc3VsdCA9IHRoaXMuYnVmZmVyLnJlYWRGbG9hdExFKHRoaXMub2Zmc2V0KTtcbiAgICB0aGlzLm9mZnNldCArPSA0O1xuICAgIHJldHVybiByZXN1bHQ7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBGaWxlO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIjFZaVo1U1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2ZpbGUuanNcIixcIi9cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG5cbnZhciBCc3AgPSBmdW5jdGlvbihmaWxlKSB7XG4gICAgdmFyIGhlYWRlciA9IHtcbiAgICAgICAgdmVyc2lvbjogZmlsZS5yZWFkSW50MzIoKSxcbiAgICAgICAgZW50aXRpZXM6IHtvZmZzZXQ6IGZpbGUucmVhZEludDMyKCksIHNpemU6IGZpbGUucmVhZEludDMyKCl9LFxuICAgICAgICBwbGFuZXM6IHtvZmZzZXQ6IGZpbGUucmVhZEludDMyKCksIHNpemU6IGZpbGUucmVhZEludDMyKCl9LFxuICAgICAgICBtaXB0ZXhzOiB7b2Zmc2V0OiBmaWxlLnJlYWRJbnQzMigpLCBzaXplOiBmaWxlLnJlYWRJbnQzMigpfSxcbiAgICAgICAgdmVydGljZXM6IHtvZmZzZXQ6IGZpbGUucmVhZEludDMyKCksIHNpemU6IGZpbGUucmVhZEludDMyKCl9LFxuICAgICAgICB2aXNpbGlzdDoge29mZnNldDogZmlsZS5yZWFkSW50MzIoKSwgc2l6ZTogZmlsZS5yZWFkSW50MzIoKX0sXG4gICAgICAgIG5vZGVzOiB7b2Zmc2V0OiBmaWxlLnJlYWRJbnQzMigpLCBzaXplOiBmaWxlLnJlYWRJbnQzMigpfSxcbiAgICAgICAgdGV4aW5mb3M6IHtvZmZzZXQ6IGZpbGUucmVhZEludDMyKCksIHNpemU6IGZpbGUucmVhZEludDMyKCl9LFxuICAgICAgICBmYWNlczoge29mZnNldDogZmlsZS5yZWFkSW50MzIoKSwgc2l6ZTogZmlsZS5yZWFkSW50MzIoKX0sXG4gICAgICAgIGxpZ2h0bWFwczoge29mZnNldDogZmlsZS5yZWFkSW50MzIoKSwgc2l6ZTogZmlsZS5yZWFkSW50MzIoKX0sXG4gICAgICAgIGNsaXBub2Rlczoge29mZnNldDogZmlsZS5yZWFkSW50MzIoKSwgc2l6ZTogZmlsZS5yZWFkSW50MzIoKX0sXG4gICAgICAgIGxlYXZlczoge29mZnNldDogZmlsZS5yZWFkSW50MzIoKSwgc2l6ZTogZmlsZS5yZWFkSW50MzIoKX0sXG4gICAgICAgIGxmYWNlczoge29mZnNldDogZmlsZS5yZWFkSW50MzIoKSwgc2l6ZTogZmlsZS5yZWFkSW50MzIoKX0sXG4gICAgICAgIGVkZ2VzOiB7b2Zmc2V0OiBmaWxlLnJlYWRJbnQzMigpLCBzaXplOiBmaWxlLnJlYWRJbnQzMigpfSxcbiAgICAgICAgbGVkZ2VzOiB7b2Zmc2V0OiBmaWxlLnJlYWRJbnQzMigpLCBzaXplOiBmaWxlLnJlYWRJbnQzMigpfSxcbiAgICAgICAgbW9kZWxzOiB7b2Zmc2V0OiBmaWxlLnJlYWRJbnQzMigpLCBzaXplOiBmaWxlLnJlYWRJbnQzMigpfVxuICAgIH07XG5cbiAgICB0aGlzLmxvYWRUZXh0dXJlcyhmaWxlLCBoZWFkZXIubWlwdGV4cyk7XG4gICAgdGhpcy5sb2FkVGV4SW5mb3MoZmlsZSwgaGVhZGVyLnRleGluZm9zKTtcbiAgICB0aGlzLmxvYWRMaWdodE1hcHMoZmlsZSwgaGVhZGVyLmxpZ2h0bWFwcyk7XG5cbiAgICB0aGlzLmxvYWRNb2RlbHMoZmlsZSwgaGVhZGVyLm1vZGVscyk7XG4gICAgdGhpcy5sb2FkVmVydGljZXMoZmlsZSwgaGVhZGVyLnZlcnRpY2VzKTtcbiAgICB0aGlzLmxvYWRFZGdlcyhmaWxlLCBoZWFkZXIuZWRnZXMpO1xuICAgIHRoaXMubG9hZFN1cmZhY2VFZGdlcyhmaWxlLCBoZWFkZXIubGVkZ2VzKTtcbiAgICB0aGlzLmxvYWRTdXJmYWNlcyhmaWxlLCBoZWFkZXIuZmFjZXMpO1xufTtcblxuQnNwLnN1cmZhY2VGbGFncyA9IHtcbiAgICBwbGFuZUJhY2s6IDIsIGRyYXdTa3k6IDQsIGRyYXdTcHJpdGU6IDgsIGRyYXdUdXJiOiAxNixcbiAgICBkcmF3VGlsZWQ6IDMyLCBkcmF3QmFja2dyb3VuZDogNjQsIHVuZGVyd2F0ZXI6IDEyOFxufTtcblxuQnNwLnByb3RvdHlwZS5sb2FkVmVydGljZXMgPSBmdW5jdGlvbihmaWxlLCBsdW1wKSB7XG4gICAgdGhpcy52ZXJ0ZXhDb3VudCA9IGx1bXAuc2l6ZSAvIDEyO1xuICAgIHRoaXMudmVydGljZXMgPSBbXTtcbiAgICBmaWxlLnNlZWsobHVtcC5vZmZzZXQpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy52ZXJ0ZXhDb3VudDsgaSsrKSB7XG4gICAgICAgIHRoaXMudmVydGljZXMucHVzaCh7XG4gICAgICAgICAgICB4OiBmaWxlLnJlYWRGbG9hdCgpLFxuICAgICAgICAgICAgeTogZmlsZS5yZWFkRmxvYXQoKSxcbiAgICAgICAgICAgIHo6IGZpbGUucmVhZEZsb2F0KClcbiAgICAgICAgfSk7XG4gICAgfVxufTtcblxuQnNwLnByb3RvdHlwZS5sb2FkRWRnZXMgPSBmdW5jdGlvbihmaWxlLCBsdW1wKSB7XG4gICAgdmFyIGVkZ2VDb3VudCA9IGx1bXAuc2l6ZSAvIDQ7XG4gICAgdGhpcy5lZGdlcyA9IFtdO1xuICAgIGZpbGUuc2VlayhsdW1wLm9mZnNldCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlZGdlQ291bnQgKiA0OyBpKyspXG4gICAgICAgIHRoaXMuZWRnZXMucHVzaChmaWxlLnJlYWRVSW50MTYoKSk7XG59O1xuXG5Cc3AucHJvdG90eXBlLmxvYWRTdXJmYWNlRWRnZXMgPSBmdW5jdGlvbihmaWxlLCBsdW1wKSB7XG4gICAgdmFyIGVkZ2VMaXN0Q291bnQgPSBsdW1wLnNpemUgLyA0O1xuICAgIHRoaXMuZWRnZUxpc3QgPSBbXTtcbiAgICBmaWxlLnNlZWsobHVtcC5vZmZzZXQpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWRnZUxpc3RDb3VudDsgaSsrKSB7XG4gICAgICAgIHRoaXMuZWRnZUxpc3QucHVzaChmaWxlLnJlYWRJbnQzMigpKTtcbiAgICB9XG59O1xuXG5Cc3AucHJvdG90eXBlLmNhbGN1bGF0ZVN1cmZhY2VFeHRlbnRzID0gZnVuY3Rpb24oc3VyZmFjZSkge1xuICAgIHZhciBtaW5TID0gOTk5OTk7XG4gICAgdmFyIG1heFMgPSAtOTk5OTk7XG4gICAgdmFyIG1pblQgPSA5OTk5OTtcbiAgICB2YXIgbWF4VCA9IC05OTk5OTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3VyZmFjZS5lZGdlQ291bnQ7IGkrKykge1xuICAgICAgICB2YXIgZWRnZUluZGV4ID0gdGhpcy5lZGdlTGlzdFtzdXJmYWNlLmVkZ2VTdGFydCArIGldO1xuICAgICAgICB2YXIgdmkgPSBlZGdlSW5kZXggPj0gMCA/IHRoaXMuZWRnZXNbZWRnZUluZGV4ICogMl0gOiB0aGlzLmVkZ2VzWy1lZGdlSW5kZXggKiAyICsgMV07XG4gICAgICAgIHZhciB2ID0gW3RoaXMudmVydGljZXNbdmldLngsIHRoaXMudmVydGljZXNbdmldLnksIHRoaXMudmVydGljZXNbdmldLnpdO1xuICAgICAgICB2YXIgdGV4SW5mbyA9IHRoaXMudGV4SW5mb3Nbc3VyZmFjZS50ZXhJbmZvSWRdO1xuXG4gICAgICAgIHZhciBzID0gdmVjMy5kb3QodiwgdGV4SW5mby52ZWN0b3JTKSArIHRleEluZm8uZGlzdFM7XG4gICAgICAgIG1pblMgPSBNYXRoLm1pbihtaW5TLCBzKTtcbiAgICAgICAgbWF4UyA9IE1hdGgubWF4KG1heFMsIHMpO1xuXG4gICAgICAgIHZhciB0ID0gdmVjMy5kb3QodiwgdGV4SW5mby52ZWN0b3JUKSArIHRleEluZm8uZGlzdFQ7XG4gICAgICAgIG1pblQgPSBNYXRoLm1pbihtaW5ULCB0KTtcbiAgICAgICAgbWF4VCA9IE1hdGgubWF4KG1heFQsIHQpO1xuICAgIH1cblxuICAgIC8qIENvbnZlcnQgdG8gaW50cyAqL1xuICAgIG1pblMgPSBNYXRoLmZsb29yKG1pblMgLyAxNik7XG4gICAgbWluVCA9IE1hdGguZmxvb3IobWluVCAvIDE2KTtcbiAgICBtYXhTID0gTWF0aC5jZWlsKG1heFMgLyAxNik7XG4gICAgbWF4VCA9IE1hdGguY2VpbChtYXhUIC8gMTYpO1xuXG4gICAgc3VyZmFjZS50ZXh0dXJlTWlucyA9IFttaW5TICogMTYsIG1pblQgKiAxNl07XG4gICAgc3VyZmFjZS5leHRlbnRzID0gWyhtYXhTIC0gbWluUykgKiAxNiwgKG1heFQgLSBtaW5UKSAqIDE2XTtcbn07XG5cbkJzcC5wcm90b3R5cGUubG9hZFN1cmZhY2VzID0gZnVuY3Rpb24gKGZpbGUsIGx1bXApIHtcblxuICAgIHZhciBzdXJmYWNlQ291bnQgPSBsdW1wLnNpemUgLyAyMDtcbiAgICB0aGlzLnN1cmZhY2VzID0gW107XG4gICAgZmlsZS5zZWVrKGx1bXAub2Zmc2V0KTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN1cmZhY2VDb3VudDsgaSsrKSB7XG4gICAgICAgIHZhciBzdXJmYWNlID0ge307XG4gICAgICAgIHN1cmZhY2UucGxhbmVJZCA9IGZpbGUucmVhZFVJbnQxNigpO1xuICAgICAgICBzdXJmYWNlLnNpZGUgPSBmaWxlLnJlYWRVSW50MTYoKTtcbiAgICAgICAgc3VyZmFjZS5lZGdlU3RhcnQgPSBmaWxlLnJlYWRJbnQzMigpO1xuICAgICAgICBzdXJmYWNlLmVkZ2VDb3VudCA9IGZpbGUucmVhZEludDE2KCk7XG4gICAgICAgIHN1cmZhY2UudGV4SW5mb0lkID0gZmlsZS5yZWFkVUludDE2KCk7XG5cbiAgICAgICAgc3VyZmFjZS5saWdodFN0eWxlcyA9IFtmaWxlLnJlYWRVSW50OCgpLCBmaWxlLnJlYWRVSW50OCgpLCBmaWxlLnJlYWRVSW50OCgpLCBmaWxlLnJlYWRVSW50OCgpXTtcbiAgICAgICAgc3VyZmFjZS5saWdodE1hcE9mZnNldCA9IGZpbGUucmVhZEludDMyKCk7XG4gICAgICAgIHN1cmZhY2UuZmxhZ3MgPSAwO1xuXG4gICAgICAgIHRoaXMuY2FsY3VsYXRlU3VyZmFjZUV4dGVudHMoc3VyZmFjZSk7XG4gICAgICAgIHRoaXMuc3VyZmFjZXMucHVzaChzdXJmYWNlKTtcbiAgICB9XG59O1xuXG5Cc3AucHJvdG90eXBlLmxvYWRUZXh0dXJlcyA9IGZ1bmN0aW9uKGZpbGUsIGx1bXApIHtcbiAgICBmaWxlLnNlZWsobHVtcC5vZmZzZXQpO1xuICAgIHZhciB0ZXh0dXJlQ291bnQgPSBmaWxlLnJlYWRJbnQzMigpO1xuXG4gICAgdGhpcy50ZXh0dXJlcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGV4dHVyZUNvdW50OyBpKyspIHtcbiAgICAgICAgdmFyIHRleHR1cmVPZmZzZXQgPSBmaWxlLnJlYWRJbnQzMigpO1xuICAgICAgICB2YXIgb3JpZ2luYWxPZmZzZXQgPSBmaWxlLnRlbGwoKTtcbiAgICAgICAgZmlsZS5zZWVrKGx1bXAub2Zmc2V0ICsgdGV4dHVyZU9mZnNldCk7XG4gICAgICAgIHZhciB0ZXh0dXJlID0ge1xuICAgICAgICAgICAgbmFtZTogZmlsZS5yZWFkU3RyaW5nKDE2KSxcbiAgICAgICAgICAgIHdpZHRoOiBmaWxlLnJlYWRVSW50MzIoKSxcbiAgICAgICAgICAgIGhlaWdodDogZmlsZS5yZWFkVUludDMyKCksXG4gICAgICAgIH07XG4gICAgICAgIHZhciBvZmZzZXQgPSBsdW1wLm9mZnNldCArIHRleHR1cmVPZmZzZXQgKyBmaWxlLnJlYWRVSW50MzIoKTtcbiAgICAgICAgdGV4dHVyZS5kYXRhID0gZmlsZS5zbGljZShvZmZzZXQsIHRleHR1cmUud2lkdGggKiB0ZXh0dXJlLmhlaWdodCk7XG4gICAgICAgIHRoaXMudGV4dHVyZXMucHVzaCh0ZXh0dXJlKTtcblxuICAgICAgICBmaWxlLnNlZWsob3JpZ2luYWxPZmZzZXQpO1xuICAgIH1cbn07XG5cbkJzcC5wcm90b3R5cGUubG9hZFRleEluZm9zID0gZnVuY3Rpb24oZmlsZSwgbHVtcCkge1xuICAgIGZpbGUuc2VlayhsdW1wLm9mZnNldCk7XG4gICAgdmFyIHRleEluZm9Db3VudCA9IGx1bXAuc2l6ZSAvIDQwO1xuICAgIHRoaXMudGV4SW5mb3MgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRleEluZm9Db3VudDsgaSsrKSB7XG4gICAgICAgIHZhciBpbmZvID0ge307XG4gICAgICAgIGluZm8udmVjdG9yUyA9IFtmaWxlLnJlYWRGbG9hdCgpLCBmaWxlLnJlYWRGbG9hdCgpLCBmaWxlLnJlYWRGbG9hdCgpXTtcbiAgICAgICAgaW5mby5kaXN0UyA9IGZpbGUucmVhZEZsb2F0KCk7XG4gICAgICAgIGluZm8udmVjdG9yVCA9IFtmaWxlLnJlYWRGbG9hdCgpLCBmaWxlLnJlYWRGbG9hdCgpLCBmaWxlLnJlYWRGbG9hdCgpXTtcbiAgICAgICAgaW5mby5kaXN0VCA9IGZpbGUucmVhZEZsb2F0KCk7XG4gICAgICAgIGluZm8udGV4dHVyZUlkID0gZmlsZS5yZWFkVUludDMyKCk7XG4gICAgICAgIGluZm8uYW5pbWF0ZWQgPSBmaWxlLnJlYWRVSW50MzIoKSA9PSAxO1xuICAgICAgICB0aGlzLnRleEluZm9zLnB1c2goaW5mbyk7XG4gICAgfVxufTtcblxuQnNwLnByb3RvdHlwZS5sb2FkTW9kZWxzID0gZnVuY3Rpb24oZmlsZSwgbHVtcCkge1xuICAgIGZpbGUuc2VlayhsdW1wLm9mZnNldCk7XG4gICAgdmFyIG1vZGVsQ291bnQgPSBsdW1wLnNpemUgLyA2NDtcbiAgICB0aGlzLm1vZGVscyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW9kZWxDb3VudDsgaSsrKSB7XG5cbiAgICAgICAgdmFyIG1vZGVsID0ge307XG4gICAgICAgIG1vZGVsLm1pbnMgPSB2ZWMzLmNyZWF0ZShbZmlsZS5yZWFkRmxvYXQoKSwgZmlsZS5yZWFkRmxvYXQoKSwgZmlsZS5yZWFkRmxvYXQoKV0pO1xuICAgICAgICBtb2RlbC5tYXhlcyA9IHZlYzMuY3JlYXRlKFtmaWxlLnJlYWRGbG9hdCgpLCBmaWxlLnJlYWRGbG9hdCgpLCBmaWxlLnJlYWRGbG9hdCgpXSk7XG4gICAgICAgIG1vZGVsLm9yaWdpbiA9IHZlYzMuY3JlYXRlKFtmaWxlLnJlYWRGbG9hdCgpLCBmaWxlLnJlYWRGbG9hdCgpLCBmaWxlLnJlYWRGbG9hdCgpXSk7XG4gICAgICAgIG1vZGVsLmJzcE5vZGUgPSBmaWxlLnJlYWRJbnQzMigpO1xuICAgICAgICBtb2RlbC5jbGlwTm9kZTEgPSBmaWxlLnJlYWRJbnQzMigpO1xuICAgICAgICBtb2RlbC5jbGlwTm9kZTIgPSBmaWxlLnJlYWRJbnQzMigpO1xuICAgICAgICBmaWxlLnJlYWRJbnQzMigpOyAvLyBTa2lwIGZvciBub3cuXG4gICAgICAgIG1vZGVsLnZpc0xlYWZzID0gZmlsZS5yZWFkSW50MzIoKTtcbiAgICAgICAgbW9kZWwuZmlyc3RTdXJmYWNlID0gZmlsZS5yZWFkSW50MzIoKTtcbiAgICAgICAgbW9kZWwuc3VyZmFjZUNvdW50ID0gZmlsZS5yZWFkSW50MzIoKTtcbiAgICAgICAgdGhpcy5tb2RlbHMucHVzaChtb2RlbCk7XG4gICAgfVxufTtcblxuXG5Cc3AucHJvdG90eXBlLmxvYWRMaWdodE1hcHMgPSBmdW5jdGlvbiAoZmlsZSwgbHVtcCkge1xuICAgIGZpbGUuc2VlayhsdW1wLm9mZnNldCk7XG4gICAgdGhpcy5saWdodE1hcHMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGx1bXAuc2l6ZTsgaSsrKVxuICAgICAgICB0aGlzLmxpZ2h0TWFwcy5wdXNoKGZpbGUucmVhZFVJbnQ4KCkpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gQnNwO1xufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIxWWlaNVNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9mb3JtYXRzL2JzcC5qc1wiLFwiL2Zvcm1hdHNcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG5cbnZhciBBbGlhcyA9IHsgc2luZ2xlOiAwLCBncm91cDogMX07XG5cbnZhciBNZGwgPSBmdW5jdGlvbihuYW1lLCBmaWxlKSB7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLmxvYWRIZWFkZXIoZmlsZSk7XG4gICAgdGhpcy5sb2FkU2tpbnMoZmlsZSk7XG4gICAgdGhpcy5sb2FkVGV4Q29vcmRzKGZpbGUpO1xuICAgIHRoaXMubG9hZEZhY2VzKGZpbGUpO1xuICAgIHRoaXMubG9hZEZyYW1lcyhmaWxlKTtcbn07XG5cbk1kbC5wcm90b3R5cGUubG9hZEhlYWRlciA9IGZ1bmN0aW9uKGZpbGUpIHtcbiAgICB0aGlzLmlkID0gZmlsZS5yZWFkU3RyaW5nKDQpO1xuICAgIHRoaXMudmVyc2lvbiA9IGZpbGUucmVhZFVJbnQzMigpO1xuICAgIHRoaXMuc2NhbGUgPSB2ZWMzLmZyb21WYWx1ZXMoZmlsZS5yZWFkRmxvYXQoKSwgZmlsZS5yZWFkRmxvYXQoKSwgZmlsZS5yZWFkRmxvYXQoKSk7XG4gICAgdGhpcy5vcmlnaW4gPSB2ZWMzLmZyb21WYWx1ZXMoZmlsZS5yZWFkRmxvYXQoKSwgZmlsZS5yZWFkRmxvYXQoKSwgZmlsZS5yZWFkRmxvYXQoKSk7XG4gICAgdGhpcy5yYWRpdXMgPSBmaWxlLnJlYWRGbG9hdCgpO1xuICAgIHRoaXMuZXllUG9zaXRpb24gPSBbZmlsZS5yZWFkRmxvYXQoKSwgZmlsZS5yZWFkRmxvYXQoKSwgZmlsZS5yZWFkRmxvYXQoKV07XG4gICAgdGhpcy5za2luQ291bnQgPSBmaWxlLnJlYWRJbnQzMigpO1xuICAgIHRoaXMuc2tpbldpZHRoID0gZmlsZS5yZWFkSW50MzIoKTtcbiAgICB0aGlzLnNraW5IZWlnaHQgPSBmaWxlLnJlYWRJbnQzMigpO1xuICAgIHRoaXMudmVydGV4Q291bnQgPSBmaWxlLnJlYWRJbnQzMigpO1xuICAgIHRoaXMuZmFjZUNvdW50ID0gZmlsZS5yZWFkSW50MzIoKTtcbiAgICB0aGlzLmZyYW1lQ291bnQgPSBmaWxlLnJlYWRJbnQzMigpO1xuICAgIHRoaXMuc3luY1R5cGUgPSBmaWxlLnJlYWRJbnQzMigpO1xuICAgIHRoaXMuZmxhZ3MgPSBmaWxlLnJlYWRJbnQzMigpO1xuICAgIHRoaXMuYXZlcmFnZUZhY2VTaXplID0gZmlsZS5yZWFkRmxvYXQoKTtcbn07XG5cblxuTWRsLnByb3RvdHlwZS5sb2FkU2tpbnMgPSBmdW5jdGlvbihmaWxlKSB7XG4gICAgZmlsZS5zZWVrKDB4NTQpOyAvL2Jhc2Vza2luIG9mZnNldCwgd2hlcmUgc2tpbnMgc3RhcnQuXG4gICAgdGhpcy5za2lucyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5za2luQ291bnQ7IGkrKykge1xuICAgICAgICB2YXIgZ3JvdXAgPSBmaWxlLnJlYWRJbnQzMigpO1xuICAgICAgICBpZiAoZ3JvdXAgIT09IEFsaWFzLnNpbmdsZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1dhcm5pbmc6IE11bHRpcGxlIHNraW5zIG5vdCBzdXBwb3J0ZWQgeWV0LicpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBkYXRhID0gZmlsZS5yZWFkKHRoaXMuc2tpbldpZHRoICogdGhpcy5za2luSGVpZ2h0KTtcblxuICAgICAgICB0aGlzLnNraW5zLnB1c2goZGF0YSk7XG4gICAgfVxufTtcblxuTWRsLnByb3RvdHlwZS5sb2FkVGV4Q29vcmRzID0gZnVuY3Rpb24oZmlsZSkge1xuICAgIHRoaXMudGV4Q29vcmRzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnZlcnRleENvdW50OyBpKyspIHtcbiAgICAgICAgdmFyIHRleENvb3JkID0ge307XG4gICAgICAgIHRleENvb3JkLm9uU2VhbSA9IGZpbGUucmVhZEludDMyKCkgPT0gMHgyMDtcbiAgICAgICAgdGV4Q29vcmQucyA9IGZpbGUucmVhZEludDMyKCk7XG4gICAgICAgIHRleENvb3JkLnQgPSBmaWxlLnJlYWRJbnQzMigpO1xuICAgICAgICB0aGlzLnRleENvb3Jkcy5wdXNoKHRleENvb3JkKTtcbiAgICB9XG59O1xuXG5NZGwucHJvdG90eXBlLmxvYWRGYWNlcyA9IGZ1bmN0aW9uKGZpbGUpIHtcbiAgICB0aGlzLmZhY2VzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmZhY2VDb3VudDsgaSsrKSB7XG4gICAgICAgIHZhciBmYWNlID0ge307XG4gICAgICAgIGZhY2UuaXNGcm9udEZhY2UgPSBmaWxlLnJlYWRJbnQzMigpID09IDE7XG4gICAgICAgIGZhY2UuaW5kaWNlcyA9IFtmaWxlLnJlYWRJbnQzMigpLCBmaWxlLnJlYWRJbnQzMigpLCBmaWxlLnJlYWRJbnQzMigpXTtcbiAgICAgICAgdGhpcy5mYWNlcy5wdXNoKGZhY2UpO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn07XG5cbk1kbC5wcm90b3R5cGUubG9hZEZyYW1lcyA9IGZ1bmN0aW9uKGZpbGUpIHtcbiAgICB0aGlzLmZyYW1lcyA9IFtdO1xuICAgIHRoaXMuYW5pbWF0aW9ucyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5mcmFtZUNvdW50OyBpKyspIHtcbiAgICAgICAgdmFyIHR5cGUgPSBmaWxlLnJlYWRJbnQzMigpO1xuICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgQWxpYXMuc2luZ2xlOlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmFuaW1hdGlvbnMubGVuZ3RoID09IDApXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9ucy5wdXNoKHsgZmlyc3RGcmFtZTogMCwgZnJhbWVDb3VudDogdGhpcy5mcmFtZUNvdW50IH0pO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5mcmFtZXMucHVzaCh0aGlzLmxvYWRTaW5nbGVGcmFtZShmaWxlKSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEFsaWFzLmdyb3VwOlxuICAgICAgICAgICAgICAgIHZhciBmcmFtZXMgPSB0aGlzLmxvYWRHcm91cEZyYW1lKGZpbGUpO1xuICAgICAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9ucy5wdXNoKHsgZmlyc3RGcmFtZTogdGhpcy5mcmFtZXMubGVuZ3RoLCBmcmFtZUNvdW50OiBmcmFtZXMubGVuZ3RoIH0pO1xuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgZiA9IDA7IGYgPCBmcmFtZXMubGVuZ3RoOyBmKyspXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZnJhbWVzLnB1c2goZnJhbWVzW2ZdKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdXYXJuaW5nOiBVbmtub3duIGZyYW1lIHR5cGU6ICcgKyB0eXBlICsgJyBmb3VuZCBpbiAnICsgdGhpcy5uYW1lKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZXNldCBmcmFtZWNvdW50ZXIgdG8gYWN0dWFsIGZ1bGwgZnJhbWVjb3VudCBpbmNsdWRpbmcgYWxsIGZsYXR0ZW4gZ3JvdXBzLlxuICAgIHRoaXMuZnJhbWVDb3VudCA9IHRoaXMuZnJhbWVzLmxlbmd0aDtcbiAgICByZXR1cm4gdHJ1ZTtcbn07XG5cbk1kbC5wcm90b3R5cGUubG9hZFNpbmdsZUZyYW1lID0gZnVuY3Rpb24oZmlsZSkge1xuICAgIHZhciBmcmFtZSA9IHt9O1xuICAgIGZyYW1lLnR5cGUgPSBBbGlhcy5zaW5nbGU7XG4gICAgZnJhbWUuYmJveCA9IFtcbiAgICAgICAgZmlsZS5yZWFkVUludDgoKSwgZmlsZS5yZWFkVUludDgoKSwgZmlsZS5yZWFkVUludDgoKSwgZmlsZS5yZWFkVUludDgoKSxcbiAgICAgICAgZmlsZS5yZWFkVUludDgoKSwgZmlsZS5yZWFkVUludDgoKSwgZmlsZS5yZWFkVUludDgoKSwgZmlsZS5yZWFkVUludDgoKVxuICAgIF07XG5cbiAgICBmcmFtZS5uYW1lID0gZmlsZS5yZWFkU3RyaW5nKDE2KTtcbiAgICBmcmFtZS52ZXJ0aWNlcyA9IFtdO1xuICAgIGZyYW1lLnBvc2VDb3VudCA9IDE7XG4gICAgZnJhbWUuaW50ZXJ2YWwgPSAwO1xuICAgIGZvciAodmFyIHYgPSAwOyB2IDwgdGhpcy52ZXJ0ZXhDb3VudDsgdisrKSB7XG4gICAgICAgIHZhciB2ZXJ0ZXggPSBbXG4gICAgICAgICAgICB0aGlzLnNjYWxlWzBdICogZmlsZS5yZWFkVUludDgoKSArIHRoaXMub3JpZ2luWzBdLFxuICAgICAgICAgICAgdGhpcy5zY2FsZVsxXSAqIGZpbGUucmVhZFVJbnQ4KCkgKyB0aGlzLm9yaWdpblsxXSxcbiAgICAgICAgICAgIHRoaXMuc2NhbGVbMl0gKiBmaWxlLnJlYWRVSW50OCgpICsgdGhpcy5vcmlnaW5bMl1dO1xuICAgICAgICBmcmFtZS52ZXJ0aWNlcy5wdXNoKFt2ZXJ0ZXhbMF0sIHZlcnRleFsxXSwgdmVydGV4WzJdXSk7XG4gICAgICAgIGZpbGUucmVhZFVJbnQ4KCk7IC8vIERvbid0IGNhcmUgYWJvdXQgbm9ybWFsIGZvciBub3dcbiAgICB9XG4gICAgcmV0dXJuIGZyYW1lO1xufTtcblxuTWRsLnByb3RvdHlwZS5sb2FkR3JvdXBGcmFtZSA9IGZ1bmN0aW9uIChmaWxlKSB7XG4gICAgdmFyIGdyb3VwRnJhbWUgPSB7fTtcbiAgICBncm91cEZyYW1lLnR5cGUgPSBBbGlhcy5ncm91cDtcbiAgICBncm91cEZyYW1lLnBvc2VDb3VudCA9IGZpbGUucmVhZFVJbnQzMigpO1xuICAgIGdyb3VwRnJhbWUuYmJveCA9IFtcbiAgICAgICAgZmlsZS5yZWFkVUludDgoKSwgZmlsZS5yZWFkVUludDgoKSwgZmlsZS5yZWFkVUludDgoKSwgZmlsZS5yZWFkVUludDgoKSxcbiAgICAgICAgZmlsZS5yZWFkVUludDgoKSwgZmlsZS5yZWFkVUludDgoKSwgZmlsZS5yZWFkVUludDgoKSwgZmlsZS5yZWFkVUludDgoKVxuICAgIF07XG5cbiAgICB2YXIgaW50ZXJ2YWxzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBncm91cEZyYW1lLnBvc2VDb3VudDsgaSsrKVxuICAgICAgICBpbnRlcnZhbHMucHVzaChmaWxlLnJlYWRGbG9hdCgpKTtcblxuICAgIHZhciBmcmFtZXMgPSBbXTtcbiAgICBmb3IgKHZhciBmID0gMDsgZiA8IGdyb3VwRnJhbWUucG9zZUNvdW50OyBmKyspIHtcbiAgICAgICAgdmFyIGZyYW1lID0gdGhpcy5sb2FkU2luZ2xlRnJhbWUoZmlsZSk7XG4gICAgICAgIGZyYW1lLmludGVydmFsID0gaW50ZXJ2YWxzW2ldO1xuICAgICAgICBmcmFtZXMucHVzaChmcmFtZSk7XG4gICAgfVxuICAgIHJldHVybiBmcmFtZXM7XG59O1xuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gTWRsO1xufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIxWWlaNVNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9mb3JtYXRzL21kbC5qc1wiLFwiL2Zvcm1hdHNcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgRmlsZSA9IHJlcXVpcmUoJ2ZpbGUnKTtcbnZhciBXYWQgPSByZXF1aXJlKCdmb3JtYXRzL3dhZCcpO1xudmFyIFBhbGV0dGUgPSByZXF1aXJlKCdmb3JtYXRzL3BhbGV0dGUnKTtcblxudmFyIFBhayA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICB2YXIgZmlsZSA9IG5ldyBGaWxlKGRhdGEpO1xuXG4gICAgaWYgKGZpbGUucmVhZFN0cmluZyg0KSAhPT0gJ1BBQ0snKVxuICAgICAgICB0aHJvdyAnRXJyb3I6IENvcnJ1cHQgUEFLIGZpbGUuJztcblxuICAgIHZhciBpbmRleE9mZnNldCA9IGZpbGUucmVhZFVJbnQzMigpO1xuICAgIHZhciBpbmRleEZpbGVDb3VudCA9IGZpbGUucmVhZFVJbnQzMigpIC8gNjQ7XG5cbiAgICBmaWxlLnNlZWsoaW5kZXhPZmZzZXQpO1xuICAgIHRoaXMuaW5kZXggPSB7fTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGluZGV4RmlsZUNvdW50OyBpKyspIHtcbiAgICAgICAgdmFyIHBhdGggPSBmaWxlLnJlYWRTdHJpbmcoNTYpO1xuICAgICAgICB2YXIgb2Zmc2V0ID0gZmlsZS5yZWFkVUludDMyKCk7XG4gICAgICAgIHZhciBzaXplID0gZmlsZS5yZWFkVUludDMyKCk7XG4gICAgICAgIHRoaXMuaW5kZXhbcGF0aF0gPSB7IG9mZnNldDogb2Zmc2V0LCBzaXplOiBzaXplIH07XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKCdQQUs6IExvYWRlZCAlaSBlbnRyaWVzLicsIGluZGV4RmlsZUNvdW50KTtcblxuICAgIHRoaXMuZmlsZSA9IGZpbGU7XG59O1xuXG5QYWsucHJvdG90eXBlLmxvYWQgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIGVudHJ5ID0gdGhpcy5pbmRleFtuYW1lXTtcbiAgICBpZiAoIWVudHJ5KVxuICAgICAgICB0aHJvdyAnRXJyb3I6IENhblxcJ3QgZmluZCBlbnRyeSBpbiBQQUs6ICcgKyBuYW1lO1xuICAgIHJldHVybiB0aGlzLmZpbGUuc2xpY2UoZW50cnkub2Zmc2V0LCBlbnRyeS5zaXplKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IFBhaztcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiMVlpWjVTXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvZm9ybWF0cy9wYWsuanNcIixcIi9mb3JtYXRzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuXG52YXIgUGFsZXR0ZSA9IGZ1bmN0aW9uKGZpbGUpIHtcbiAgICB0aGlzLmNvbG9ycyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMjU2OyBpKyspIHtcbiAgICAgICAgdGhpcy5jb2xvcnMucHVzaCh7XG4gICAgICAgICAgICByOiBmaWxlLnJlYWRVSW50OCgpLFxuICAgICAgICAgICAgZzogZmlsZS5yZWFkVUludDgoKSxcbiAgICAgICAgICAgIGI6IGZpbGUucmVhZFVJbnQ4KClcbiAgICAgICAgfSk7XG4gICAgfVxufTtcblxuUGFsZXR0ZS5wcm90b3R5cGUudW5wYWNrID0gZnVuY3Rpb24oZmlsZSwgd2lkdGgsIGhlaWdodCwgYWxwaGEpIHtcbiAgICB2YXIgcGl4ZWxzID0gbmV3IFVpbnQ4QXJyYXkoNCAqIHdpZHRoICogaGVpZ2h0KTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHdpZHRoICogaGVpZ2h0OyBpKyspIHtcbiAgICAgICAgdmFyIGluZGV4ID0gZmlsZS5yZWFkVUludDgoKTtcbiAgICAgICAgdmFyIGNvbG9yID0gdGhpcy5jb2xvcnNbaW5kZXhdO1xuICAgICAgICBwaXhlbHNbaSo0XSA9IGNvbG9yLnI7XG4gICAgICAgIHBpeGVsc1tpKjQrMV0gPSBjb2xvci5nO1xuICAgICAgICBwaXhlbHNbaSo0KzJdID0gY29sb3IuYjtcbiAgICAgICAgcGl4ZWxzW2kqNCszXSA9IChhbHBoYSAmJiAhaW5kZXgpID8gMCA6IDI1NTtcbiAgICB9XG4gICAgcmV0dXJuIHBpeGVscztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IFBhbGV0dGU7XG59KS5jYWxsKHRoaXMscmVxdWlyZShcIjFZaVo1U1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2Zvcm1hdHMvcGFsZXR0ZS5qc1wiLFwiL2Zvcm1hdHNcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG5cbnZhciBXYWQgPSBmdW5jdGlvbihmaWxlKSB7XG4gICAgdGhpcy5sdW1wcyA9IFtdO1xuICAgIGlmIChmaWxlLnJlYWRTdHJpbmcoNCkgIT09ICdXQUQyJylcbiAgICAgICAgdGhyb3cgJ0Vycm9yOiBDb3JydXB0IFdBRC1maWxlIGVuY291bnRlcmVkLic7XG5cbiAgICB2YXIgbHVtcENvdW50ID0gZmlsZS5yZWFkVUludDMyKCk7XG4gICAgdmFyIG9mZnNldCA9IGZpbGUucmVhZFVJbnQzMigpO1xuXG4gICAgZmlsZS5zZWVrKG9mZnNldCk7XG4gICAgdmFyIGluZGV4ID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsdW1wQ291bnQ7IGkrKykge1xuICAgICAgICB2YXIgb2Zmc2V0ID0gZmlsZS5yZWFkVUludDMyKCk7XG4gICAgICAgIGZpbGUuc2tpcCg0KTtcbiAgICAgICAgdmFyIHNpemUgPSBmaWxlLnJlYWRVSW50MzIoKTtcbiAgICAgICAgdmFyIHR5cGUgPSBmaWxlLnJlYWRVSW50OCgpO1xuICAgICAgICBmaWxlLnNraXAoMyk7XG4gICAgICAgIHZhciBuYW1lID0gZmlsZS5yZWFkU3RyaW5nKDE2KTtcbiAgICAgICAgaW5kZXgucHVzaCh7IG5hbWU6IG5hbWUsIG9mZnNldDogb2Zmc2V0LCBzaXplOiBzaXplIH0pO1xuICAgIH1cblxuICAgIHRoaXMubHVtcHMgPSB7fTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGluZGV4Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IGluZGV4W2ldO1xuICAgICAgICB0aGlzLmx1bXBzW2VudHJ5Lm5hbWVdID0gZmlsZS5zbGljZShlbnRyeS5vZmZzZXQsIGVudHJ5LnNpemUpO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZygnV0FEOiBMb2FkZWQgJXMgbHVtcHMuJywgbHVtcENvdW50KTtcbn07XG5cbldhZC5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBmaWxlID0gdGhpcy5sdW1wc1tuYW1lXTtcbiAgICBpZiAoIWZpbGUpXG4gICAgICAgIHRocm93ICdFcnJvcjogTm8gc3VjaCBlbnRyeSBmb3VuZCBpbiBXQUQ6ICcgKyBuYW1lO1xuICAgIHJldHVybiBmaWxlO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gV2FkO1xufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIxWWlaNVNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9mb3JtYXRzL3dhZC5qc1wiLFwiL2Zvcm1hdHNcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgdXRpbHMgPSByZXF1aXJlKCd1dGlscycpO1xuXG52YXIgVGV4dHVyZSA9IGZ1bmN0aW9uKGZpbGUsIG9wdGlvbnMpIHtcbiAgICB2YXIgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgb3B0aW9ucy5hbHBoYSA9IG9wdGlvbnMuYWxwaGEgfHwgZmFsc2U7XG4gICAgb3B0aW9ucy5mb3JtYXQgPSBvcHRpb25zLmZvcm1hdCB8fCBnbC5SR0JBO1xuICAgIG9wdGlvbnMudHlwZSA9IG9wdGlvbnMudHlwZSB8fCBnbC5VTlNJR05FRF9CWVRFO1xuICAgIG9wdGlvbnMuZmlsdGVyID0gb3B0aW9ucy5maWx0ZXIgfHwgZ2wuTElORUFSO1xuICAgIG9wdGlvbnMud3JhcCA9IG9wdGlvbnMud3JhcCB8fCBnbC5DTEFNUF9UT19FREdFO1xuXG4gICAgdGhpcy5pZCA9IGdsLmNyZWF0ZVRleHR1cmUoKTtcbiAgICB0aGlzLndpZHRoID0gb3B0aW9ucy53aWR0aCB8fCBmaWxlLnJlYWRVSW50MzIoKTtcbiAgICB0aGlzLmhlaWdodCA9IG9wdGlvbnMuaGVpZ2h0IHx8IGZpbGUucmVhZFVJbnQzMigpO1xuICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRoaXMuaWQpO1xuICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NQUdfRklMVEVSLCBvcHRpb25zLmZpbHRlcik7XG4gICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01JTl9GSUxURVIsIG9wdGlvbnMuZmlsdGVyKTtcbiAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9TLCBvcHRpb25zLndyYXApO1xuICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9XUkFQX1QsIG9wdGlvbnMud3JhcCk7XG5cbiAgICBpZiAoZmlsZSkge1xuICAgICAgICBpZiAoIW9wdGlvbnMucGFsZXR0ZSlcbiAgICAgICAgICAgIHRocm93ICdFcnJvcjogTm8gcGFsZXR0ZSBzcGVjaWZpZWQgaW4gb3B0aW9ucy4nO1xuXG4gICAgICAgIHZhciBwaXhlbHMgPSBvcHRpb25zLnBhbGV0dGUudW5wYWNrKGZpbGUsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCBvcHRpb25zLmFscGhhKTtcbiAgICAgICAgdmFyIG5wb3QgPSB1dGlscy5pc1Bvd2VyT2YyKHRoaXMud2lkdGgpICYmIHV0aWxzLmlzUG93ZXJPZjIodGhpcy5oZWlnaHQpO1xuICAgICAgICBpZiAoIW5wb3QgJiYgb3B0aW9ucy53cmFwID09PSBnbC5SRVBFQVQpIHtcbiAgICAgICAgICAgIHZhciBuZXdXaWR0aCA9IHV0aWxzLm5leHRQb3dlck9mMih0aGlzLndpZHRoKTtcbiAgICAgICAgICAgIHZhciBuZXdIZWlnaHQgPSB1dGlscy5uZXh0UG93ZXJPZjIodGhpcy5oZWlnaHQpO1xuICAgICAgICAgICAgcGl4ZWxzID0gdGhpcy5yZXNhbXBsZShwaXhlbHMsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCBuZXdXaWR0aCwgbmV3SGVpZ2h0KTtcbiAgICAgICAgICAgIGdsLnRleEltYWdlMkQoZ2wuVEVYVFVSRV8yRCwgMCwgb3B0aW9ucy5mb3JtYXQsIG5ld1dpZHRoLCBuZXdIZWlnaHQsXG4gICAgICAgICAgICAgICAgMCwgb3B0aW9ucy5mb3JtYXQsIG9wdGlvbnMudHlwZSwgcGl4ZWxzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGdsLnRleEltYWdlMkQoZ2wuVEVYVFVSRV8yRCwgMCwgb3B0aW9ucy5mb3JtYXQsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LFxuICAgICAgICAgICAgICAgIDAsIG9wdGlvbnMuZm9ybWF0LCBvcHRpb25zLnR5cGUsIHBpeGVscyk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBnbC50ZXhJbWFnZTJEKGdsLlRFWFRVUkVfMkQsIDAsIG9wdGlvbnMuZm9ybWF0LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCxcbiAgICAgICAgICAgIDAsIG9wdGlvbnMuZm9ybWF0LCBvcHRpb25zLnR5cGUsIG51bGwpO1xuICAgIH1cbn07XG5cblRleHR1cmUucHJvdG90eXBlLmRyYXdUbyA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgIHZhciB2ID0gZ2wuZ2V0UGFyYW1ldGVyKGdsLlZJRVdQT1JUKTtcblxuICAgIC8qIFNldHVwIHNoYXJlZCBidWZmZXJzIGZvciByZW5kZXIgdGFyZ2V0IGRyYXdpbmcgKi9cbiAgICBpZiAodHlwZW9mIFRleHR1cmUuZnJhbWVCdWZmZXIgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgVGV4dHVyZS5mcmFtZUJ1ZmZlciA9IGdsLmNyZWF0ZUZyYW1lYnVmZmVyKCk7XG4gICAgICAgIFRleHR1cmUucmVuZGVyQnVmZmVyID0gZ2wuY3JlYXRlUmVuZGVyYnVmZmVyKCk7XG4gICAgfVxuXG4gICAgZ2wuYmluZEZyYW1lYnVmZmVyKGdsLkZSQU1FQlVGRkVSLCBUZXh0dXJlLmZyYW1lQnVmZmVyKTtcbiAgICBnbC5iaW5kUmVuZGVyYnVmZmVyKGdsLlJFTkRFUkJVRkZFUiwgVGV4dHVyZS5yZW5kZXJCdWZmZXIpO1xuICAgIGlmICh0aGlzLndpZHRoICE9IFRleHR1cmUucmVuZGVyQnVmZmVyLndpZHRoIHx8IHRoaXMuaGVpZ2h0ICE9IFRleHR1cmUucmVuZGVyQnVmZmVyLmhlaWdodCkge1xuICAgICAgICBUZXh0dXJlLnJlbmRlckJ1ZmZlci53aWR0aCA9IHRoaXMud2lkdGg7XG4gICAgICAgIFRleHR1cmUucmVuZGVyQnVmZmVyLmhlaWdodCA9IHRoaXMuaGVpZ2h0O1xuICAgICAgICBnbC5yZW5kZXJidWZmZXJTdG9yYWdlKGdsLlJFTkRFUkJVRkZFUiwgZ2wuREVQVEhfQ09NUE9ORU5UMTYsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcbiAgICB9XG5cblxuICAgIGdsLmZyYW1lYnVmZmVyVGV4dHVyZTJEKGdsLkZSQU1FQlVGRkVSLCBnbC5DT0xPUl9BVFRBQ0hNRU5UMCwgZ2wuVEVYVFVSRV8yRCwgdGhpcy5pZCwgMCk7XG4gICAgZ2wuZnJhbWVidWZmZXJSZW5kZXJidWZmZXIoZ2wuRlJBTUVCVUZGRVIsIGdsLkRFUFRIX0FUVEFDSE1FTlQsIGdsLlJFTkRFUkJVRkZFUiwgVGV4dHVyZS5yZW5kZXJCdWZmZXIpO1xuICAgIGdsLnZpZXdwb3J0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcblxuICAgIHZhciBwcm9qZWN0aW9uTWF0cml4ID0gbWF0NC5vcnRobyhtYXQ0LmNyZWF0ZSgpLCAwLCB0aGlzLndpZHRoLCAwLCB0aGlzLmhlaWdodCwgLTEwLCAxMCk7XG4gICAgY2FsbGJhY2socHJvamVjdGlvbk1hdHJpeCk7XG5cbiAgICBnbC5iaW5kRnJhbWVidWZmZXIoZ2wuRlJBTUVCVUZGRVIsIG51bGwpO1xuICAgIGdsLmJpbmRSZW5kZXJidWZmZXIoZ2wuUkVOREVSQlVGRkVSLCBudWxsKTtcbiAgICBnbC52aWV3cG9ydCh2WzBdLCB2WzFdLCB2WzJdLCB2WzNdKTtcbn07XG5cblRleHR1cmUucHJvdG90eXBlLnJlc2FtcGxlID0gZnVuY3Rpb24ocGl4ZWxzLCB3aWR0aCwgaGVpZ2h0LCBuZXdXaWR0aCwgbmV3SGVpZ2h0KSB7XG4gICAgdmFyIHNyYyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgIHNyYy53aWR0aCA9IHdpZHRoO1xuICAgIHNyYy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgdmFyIGNvbnRleHQgPSBzcmMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICB2YXIgaW1hZ2VEYXRhID0gY29udGV4dC5jcmVhdGVJbWFnZURhdGEod2lkdGgsIGhlaWdodCk7XG4gICAgaW1hZ2VEYXRhLmRhdGEuc2V0KHBpeGVscyk7XG4gICAgY29udGV4dC5wdXRJbWFnZURhdGEoaW1hZ2VEYXRhLCAwLCAwKTtcblxuICAgIHZhciBkZXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgZGVzdC53aWR0aCA9IG5ld1dpZHRoO1xuICAgIGRlc3QuaGVpZ2h0ID0gbmV3SGVpZ2h0O1xuICAgIGNvbnRleHQgPSBkZXN0LmdldENvbnRleHQoJzJkJyk7XG4gICAgY29udGV4dC5kcmF3SW1hZ2Uoc3JjLCAwLCAwLCBkZXN0LndpZHRoLCBkZXN0LmhlaWdodCk7XG4gICAgdmFyIGltYWdlID0gY29udGV4dC5nZXRJbWFnZURhdGEoMCwgMCwgZGVzdC53aWR0aCwgZGVzdC5oZWlnaHQpO1xuICAgIHJldHVybiBuZXcgVWludDhBcnJheShpbWFnZS5kYXRhKTtcbn07XG5cblRleHR1cmUucHJvdG90eXBlLmJpbmQgPSBmdW5jdGlvbih1bml0KSB7XG4gICAgZ2wuYWN0aXZlVGV4dHVyZShnbC5URVhUVVJFMCArICh1bml0IHx8IDApKTtcbiAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCB0aGlzLmlkKTtcbn07XG5cblRleHR1cmUucHJvdG90eXBlLnVuYmluZCA9IGZ1bmN0aW9uKHVuaXQpIHtcbiAgICBnbC5hY3RpdmVUZXh0dXJlKGdsLlRFWFRVUkUwICsgKHVuaXQgfHwgMCkpO1xuICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIG51bGwpO1xufTtcblxuVGV4dHVyZS5wcm90b3R5cGUuYXNEYXRhVXJsID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGZyYW1lYnVmZmVyID0gZ2wuY3JlYXRlRnJhbWVidWZmZXIoKTtcbiAgICBnbC5iaW5kRnJhbWVidWZmZXIoZ2wuRlJBTUVCVUZGRVIsIGZyYW1lYnVmZmVyKTtcbiAgICBnbC5mcmFtZWJ1ZmZlclRleHR1cmUyRChnbC5GUkFNRUJVRkZFUiwgZ2wuQ09MT1JfQVRUQUNITUVOVDAsIGdsLlRFWFRVUkVfMkQsIHRoaXMuaWQsIDApO1xuXG4gICAgdmFyIHdpZHRoID0gdGhpcy53aWR0aDtcbiAgICB2YXIgaGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XG5cbiAgICAvLyBSZWFkIHRoZSBjb250ZW50cyBvZiB0aGUgZnJhbWVidWZmZXJcbiAgICB2YXIgZGF0YSA9IG5ldyBVaW50OEFycmF5KHdpZHRoICogaGVpZ2h0ICogNCk7XG4gICAgZ2wucmVhZFBpeGVscygwLCAwLCB3aWR0aCwgaGVpZ2h0LCBnbC5SR0JBLCBnbC5VTlNJR05FRF9CWVRFLCBkYXRhKTtcbiAgICBnbC5kZWxldGVGcmFtZWJ1ZmZlcihmcmFtZWJ1ZmZlcik7XG5cbiAgICAvLyBDcmVhdGUgYSAyRCBjYW52YXMgdG8gc3RvcmUgdGhlIHJlc3VsdFxuICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICBjYW52YXMud2lkdGggPSB3aWR0aDtcbiAgICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgIHZhciBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbiAgICAvLyBDb3B5IHRoZSBwaXhlbHMgdG8gYSAyRCBjYW52YXNcbiAgICB2YXIgaW1hZ2VEYXRhID0gY29udGV4dC5jcmVhdGVJbWFnZURhdGEod2lkdGgsIGhlaWdodCk7XG4gICAgaW1hZ2VEYXRhLmRhdGEuc2V0KGRhdGEpO1xuICAgIGNvbnRleHQucHV0SW1hZ2VEYXRhKGltYWdlRGF0YSwgMCwgMCk7XG4gICAgcmV0dXJuIGNhbnZhcy50b0RhdGFVUkwoKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IFRleHR1cmU7XG59KS5jYWxsKHRoaXMscmVxdWlyZShcIjFZaVo1U1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2dsL1RleHR1cmUuanNcIixcIi9nbFwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbnZhciBUZXh0dXJlID0gcmVxdWlyZSgnZ2wvdGV4dHVyZScpO1xuXG52YXIgQXRsYXMgPSBmdW5jdGlvbiAod2lkdGgsIGhlaWdodCkge1xuICAgIHRoaXMud2lkdGggPSB3aWR0aCB8fCA1MTI7XG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQgfHwgNTEyO1xuICAgIHRoaXMudHJlZSA9IHsgY2hpbGRyZW46IFtdLCB4OiAwLCB5OiAwLCB3aWR0aDogd2lkdGgsIGhlaWdodDogaGVpZ2h0IH07XG4gICAgdGhpcy5zdWJUZXh0dXJlcyA9IFtdO1xuICAgIHRoaXMudGV4dHVyZSA9IG51bGw7XG59O1xuXG5BdGxhcy5wcm90b3R5cGUuZ2V0U3ViVGV4dHVyZSA9IGZ1bmN0aW9uIChzdWJUZXh0dXJlSWQpIHtcbiAgICByZXR1cm4gdGhpcy5zdWJUZXh0dXJlc1tzdWJUZXh0dXJlSWRdO1xufTtcblxuQXRsYXMucHJvdG90eXBlLmFkZFN1YlRleHR1cmUgPSBmdW5jdGlvbiAodGV4dHVyZSkge1xuICAgIHZhciBub2RlID0gdGhpcy5nZXRGcmVlTm9kZSh0aGlzLnRyZWUsIHRleHR1cmUpO1xuICAgIGlmIChub2RlID09IG51bGwpXG4gICAgICAgIHRocm93ICdFcnJvcjogVW5hYmxlIHRvIHBhY2sgc3ViIHRleHR1cmUhIEl0IHNpbXBseSB3b25cXCd0IGZpdC4gOi8nO1xuICAgIG5vZGUudGV4dHVyZSA9IHRleHR1cmU7XG4gICAgdGhpcy5zdWJUZXh0dXJlcy5wdXNoKHtcbiAgICAgICAgdGV4dHVyZTogbm9kZS50ZXh0dXJlLFxuICAgICAgICB4OiBub2RlLngsIHk6IG5vZGUueSxcbiAgICAgICAgd2lkdGg6IG5vZGUud2lkdGgsIGhlaWdodDogbm9kZS5oZWlnaHQsXG4gICAgICAgIHMxOiBub2RlLnggLyB0aGlzLnRyZWUud2lkdGgsXG4gICAgICAgIHQxOiBub2RlLnkgLyB0aGlzLnRyZWUuaGVpZ2h0LFxuICAgICAgICBzMjogKG5vZGUueCArIG5vZGUud2lkdGgpIC8gdGhpcy50cmVlLndpZHRoLFxuICAgICAgICB0MjogKG5vZGUueSArIG5vZGUuaGVpZ2h0KSAvIHRoaXMudHJlZS5oZWlnaHRcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcy5zdWJUZXh0dXJlcy5sZW5ndGggLSAxO1xufTtcblxuQXRsYXMucHJvdG90eXBlLnJldXNlU3ViVGV4dHVyZSA9IGZ1bmN0aW9uIChzMSwgdDEsIHMyLCB0Mikge1xuICAgIHRoaXMuc3ViVGV4dHVyZXMucHVzaCh7IHMxOiBzMSwgdDE6IHQxLCBzMjogczIsIHQyOiB0MiB9KTtcbn07XG5cbkF0bGFzLnByb3RvdHlwZS5jb21waWxlID0gZnVuY3Rpb24oc2hhZGVyKSB7XG5cbiAgICB2YXIgYnVmZmVyID0gbmV3IEZsb2F0MzJBcnJheSh0aGlzLnN1YlRleHR1cmVzLmxlbmd0aCAqIDYgKiA1KTsgLy8geCx5LHoscyx0XG4gICAgdmFyIHdpZHRoID0gdGhpcy50cmVlLndpZHRoO1xuICAgIHZhciBoZWlnaHQgPSB0aGlzLnRyZWUuaGVpZ2h0O1xuICAgIHZhciBvZmZzZXQgPSAwO1xuICAgIHZhciBzdWJUZXh0dXJlcyA9IHRoaXMuc3ViVGV4dHVyZXM7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdWJUZXh0dXJlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgc3ViVGV4dHVyZSA9IHN1YlRleHR1cmVzW2ldO1xuICAgICAgICB0aGlzLmFkZFNwcml0ZShidWZmZXIsIG9mZnNldCxcbiAgICAgICAgICAgIHN1YlRleHR1cmUueCwgc3ViVGV4dHVyZS55LFxuICAgICAgICAgICAgc3ViVGV4dHVyZS53aWR0aCwgc3ViVGV4dHVyZS5oZWlnaHQpO1xuICAgICAgICBvZmZzZXQgKz0gKDYgKiA1KTtcbiAgICB9XG5cbiAgICB2YXIgdmVydGV4QnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHZlcnRleEJ1ZmZlcik7XG4gICAgZ2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIGJ1ZmZlciwgZ2wuU1RBVElDX0RSQVcpO1xuXG4gICAgdmFyIHRleHR1cmUgPSBuZXcgVGV4dHVyZShudWxsLCB7IHdpZHRoOiB3aWR0aCwgaGVpZ2h0OiBoZWlnaHQvKiwgZmlsdGVyOiBnbC5ORUFSRVNUICovIH0pO1xuICAgIHRleHR1cmUuZHJhd1RvKGZ1bmN0aW9uIChwcm9qZWN0aW9uTWF0cml4KSB7XG4gICAgICAgIHNoYWRlci51c2UoKTtcbiAgICAgICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoc2hhZGVyLmF0dHJpYnV0ZXMudmVydGV4QXR0cmlidXRlKTtcbiAgICAgICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoc2hhZGVyLmF0dHJpYnV0ZXMudGV4Q29vcmRzQXR0cmlidXRlKTtcbiAgICAgICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihzaGFkZXIuYXR0cmlidXRlcy52ZXJ0ZXhBdHRyaWJ1dGUsIDMsIGdsLkZMT0FULCBmYWxzZSwgMjAsIDApO1xuICAgICAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKHNoYWRlci5hdHRyaWJ1dGVzLnRleENvb3Jkc0F0dHJpYnV0ZSwgMiwgZ2wuRkxPQVQsIGZhbHNlLCAyMCwgMTIpO1xuICAgICAgICBnbC51bmlmb3JtTWF0cml4NGZ2KHNoYWRlci51bmlmb3Jtcy5wcm9qZWN0aW9uTWF0cml4LCBmYWxzZSwgcHJvamVjdGlvbk1hdHJpeCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3ViVGV4dHVyZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBzdWJUZXh0dXJlID0gc3ViVGV4dHVyZXNbaV07XG4gICAgICAgICAgICBpZiAoIXN1YlRleHR1cmUudGV4dHVyZSlcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgc3ViVGV4dHVyZS50ZXh0dXJlLmlkKTtcbiAgICAgICAgICAgIGdsLmRyYXdBcnJheXMoZ2wuVFJJQU5HTEVTLCBpICogNiwgNik7XG5cbiAgICAgICAgICAgIGdsLmRlbGV0ZVRleHR1cmUoc3ViVGV4dHVyZS50ZXh0dXJlLmlkKTtcbiAgICAgICAgICAgIHN1YlRleHR1cmUudGV4dHVyZSA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLnRleHR1cmUgPSB0ZXh0dXJlO1xuICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBudWxsKTtcbiAgICBnbC5kZWxldGVCdWZmZXIodmVydGV4QnVmZmVyKTtcbiAgICB0aGlzLnRyZWUgPSBudWxsO1xufTtcblxuQXRsYXMucHJvdG90eXBlLmFkZFNwcml0ZSA9IGZ1bmN0aW9uIChkYXRhLCBvZmZzZXQsIHgsIHksIHdpZHRoLCBoZWlnaHQpIHtcbiAgICB2YXIgeiA9IDA7XG4gICAgZGF0YVtvZmZzZXQgKyAwXSA9IHg7IGRhdGFbb2Zmc2V0ICsgMV0gPSB5OyBkYXRhW29mZnNldCArIDJdID0gejtcbiAgICBkYXRhW29mZnNldCArIDNdID0gMDsgZGF0YVtvZmZzZXQgKyA0XSA9IDA7XG4gICAgZGF0YVtvZmZzZXQgKyA1XSA9IHggKyB3aWR0aDsgZGF0YVtvZmZzZXQgKyA2XSA9IHk7IGRhdGFbb2Zmc2V0ICsgN10gPSB6O1xuICAgIGRhdGFbb2Zmc2V0ICsgOF0gPSAxOyBkYXRhW29mZnNldCArIDldID0gMDtcbiAgICBkYXRhW29mZnNldCArIDEwXSA9IHggKyB3aWR0aDsgZGF0YVtvZmZzZXQgKyAxMV0gPSB5ICsgaGVpZ2h0OyBkYXRhW29mZnNldCArIDEyXSA9IHo7XG4gICAgZGF0YVtvZmZzZXQgKyAxM10gPSAxOyBkYXRhW29mZnNldCArIDE0XSA9IDE7XG4gICAgZGF0YVtvZmZzZXQgKyAxNV0gPSB4ICsgd2lkdGg7IGRhdGFbb2Zmc2V0ICsgMTZdID0geSArIGhlaWdodDsgZGF0YVtvZmZzZXQgKyAxN10gPSB6O1xuICAgIGRhdGFbb2Zmc2V0ICsgMThdID0gMTsgZGF0YVtvZmZzZXQgKyAxOV0gPSAxO1xuICAgIGRhdGFbb2Zmc2V0ICsgMjBdID0geDsgZGF0YVtvZmZzZXQgKyAyMV0gPSB5ICsgaGVpZ2h0OyBkYXRhW29mZnNldCArIDIyXSA9IHo7XG4gICAgZGF0YVtvZmZzZXQgKyAyM10gPSAwOyBkYXRhW29mZnNldCArIDI0XSA9IDE7XG4gICAgZGF0YVtvZmZzZXQgKyAyNV0gPSB4OyBkYXRhW29mZnNldCArIDI2XSA9IHk7IGRhdGFbb2Zmc2V0ICsgMjddID0gejtcbiAgICBkYXRhW29mZnNldCArIDI4XSA9IDA7IGRhdGFbb2Zmc2V0ICsgMjldID0gMDtcbn07XG5cbkF0bGFzLnByb3RvdHlwZS5nZXRGcmVlTm9kZSA9IGZ1bmN0aW9uIChub2RlLCB0ZXh0dXJlKSB7XG4gICAgaWYgKG5vZGUuY2hpbGRyZW5bMF0gfHwgbm9kZS5jaGlsZHJlblsxXSkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gdGhpcy5nZXRGcmVlTm9kZShub2RlLmNoaWxkcmVuWzBdLCB0ZXh0dXJlKTtcbiAgICAgICAgaWYgKHJlc3VsdClcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RnJlZU5vZGUobm9kZS5jaGlsZHJlblsxXSwgdGV4dHVyZSk7XG4gICAgfVxuXG4gICAgaWYgKG5vZGUudGV4dHVyZSlcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgaWYgKG5vZGUud2lkdGggPCB0ZXh0dXJlLndpZHRoIHx8IG5vZGUuaGVpZ2h0IDwgdGV4dHVyZS5oZWlnaHQpXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIGlmIChub2RlLndpZHRoID09IHRleHR1cmUud2lkdGggJiYgbm9kZS5oZWlnaHQgPT0gdGV4dHVyZS5oZWlnaHQpXG4gICAgICAgIHJldHVybiBub2RlO1xuXG4gICAgdmFyIGR3ID0gbm9kZS53aWR0aCAtIHRleHR1cmUud2lkdGg7XG4gICAgdmFyIGRoID0gbm9kZS5oZWlnaHQgLSB0ZXh0dXJlLmhlaWdodDtcblxuICAgIGlmIChkdyA+IGRoKSB7XG4gICAgICAgIG5vZGUuY2hpbGRyZW5bMF0gPSB7IGNoaWxkcmVuOiBbbnVsbCwgbnVsbF0sXG4gICAgICAgICAgICB4OiBub2RlLngsXG4gICAgICAgICAgICB5OiBub2RlLnksXG4gICAgICAgICAgICB3aWR0aDogdGV4dHVyZS53aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogbm9kZS5oZWlnaHRcbiAgICAgICAgfTtcbiAgICAgICAgbm9kZS5jaGlsZHJlblsxXSA9IHsgY2hpbGRyZW46IFtudWxsLCBudWxsXSxcbiAgICAgICAgICAgIHg6IG5vZGUueCArIHRleHR1cmUud2lkdGgsXG4gICAgICAgICAgICB5OiBub2RlLnksXG4gICAgICAgICAgICB3aWR0aDogbm9kZS53aWR0aCAtIHRleHR1cmUud2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IG5vZGUuaGVpZ2h0XG4gICAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbm9kZS5jaGlsZHJlblswXSA9IHsgY2hpbGRyZW46IFtudWxsLCBudWxsXSxcbiAgICAgICAgICAgIHg6IG5vZGUueCxcbiAgICAgICAgICAgIHk6IG5vZGUueSxcbiAgICAgICAgICAgIHdpZHRoOiBub2RlLndpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiB0ZXh0dXJlLmhlaWdodFxuICAgICAgICB9O1xuICAgICAgICBub2RlLmNoaWxkcmVuWzFdID0geyBjaGlsZHJlbjogW251bGwsIG51bGxdLFxuICAgICAgICAgICAgeDogbm9kZS54LFxuICAgICAgICAgICAgeTogbm9kZS55ICsgdGV4dHVyZS5oZWlnaHQsXG4gICAgICAgICAgICB3aWR0aDogbm9kZS53aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogbm9kZS5oZWlnaHQgLSB0ZXh0dXJlLmhlaWdodFxuICAgICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5nZXRGcmVlTm9kZShub2RlLmNoaWxkcmVuWzBdLCB0ZXh0dXJlKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IEF0bGFzO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIjFZaVo1U1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2dsL2F0bGFzLmpzXCIsXCIvZ2xcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG5cbnZhciBGb250ID0gZnVuY3Rpb24gKHRleHR1cmUsIGNoYXJXaWR0aCwgY2hhckhlaWdodCkge1xuICAgIHRoaXMudGV4dHVyZSA9IHRleHR1cmU7XG4gICAgdGhpcy5jaGFyV2lkdGggPSBjaGFyV2lkdGggfHwgODtcbiAgICB0aGlzLmNoYXJIZWlnaHQgPSBjaGFySGVpZ2h0IHx8IDg7XG4gICAgdGhpcy5kYXRhID0gbmV3IEZsb2F0MzJBcnJheSg2ICogNSAqIDQgKiAxMDI0KTsgLy8gPD0gMTAyNCBtYXggY2hhcmFjdGVycy5cbiAgICB0aGlzLnZlcnRleEJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xuICAgIHRoaXMudmVydGV4QnVmZmVyLm5hbWUgPSAnc3ByaXRlRm9udCc7XG4gICAgdGhpcy5vZmZzZXQgPSAwO1xuICAgIHRoaXMuZWxlbWVudENvdW50ID0gMDtcbn07XG5cbkZvbnQucHJvdG90eXBlLmFkZFZlcnRleCA9IGZ1bmN0aW9uKHgsIHksIHUsIHYpIHtcbiAgICB0aGlzLmRhdGFbdGhpcy5vZmZzZXQrK10gPSB4O1xuICAgIHRoaXMuZGF0YVt0aGlzLm9mZnNldCsrXSA9IHk7XG4gICAgdGhpcy5kYXRhW3RoaXMub2Zmc2V0KytdID0gMDtcbiAgICB0aGlzLmRhdGFbdGhpcy5vZmZzZXQrK10gPSB1O1xuICAgIHRoaXMuZGF0YVt0aGlzLm9mZnNldCsrXSA9IHY7XG59O1xuXG5Gb250LnByb3RvdHlwZS5kcmF3Q2hhcmFjdGVyID0gZnVuY3Rpb24oeCwgeSwgaW5kZXgpIHtcbiAgICBpZiAoaW5kZXggPT0gMzIgfHwgeSA8IDAgfHwgeCA8IDAgfHwgeCA+IGdsLndpZHRoIHx8IHkgPiBnbC5oZWlnaHQpXG4gICAgICAgIHJldHVybjtcblxuICAgIGluZGV4ICY9IDI1NTtcbiAgICB2YXIgcm93ID0gaW5kZXggPj4gNDtcbiAgICB2YXIgY29sdW1uID0gaW5kZXggJiAxNTtcblxuICAgIHZhciBmcm93ID0gcm93ICogMC4wNjI1O1xuICAgIHZhciBmY29sID0gY29sdW1uICogMC4wNjI1O1xuICAgIHZhciBzaXplID0gMC4wNjI1O1xuXG4gICAgdGhpcy5hZGRWZXJ0ZXgoeCwgeSwgZmNvbCwgZnJvdyk7XG4gICAgdGhpcy5hZGRWZXJ0ZXgoeCArIHRoaXMuY2hhcldpZHRoLCB5LCBmY29sICsgc2l6ZSwgZnJvdyk7XG4gICAgdGhpcy5hZGRWZXJ0ZXgoeCArIHRoaXMuY2hhcldpZHRoLCB5ICsgdGhpcy5jaGFySGVpZ2h0LCBmY29sICsgc2l6ZSwgIGZyb3cgKyBzaXplKTtcbiAgICB0aGlzLmFkZFZlcnRleCh4ICsgdGhpcy5jaGFyV2lkdGgsIHkgKyB0aGlzLmNoYXJIZWlnaHQsIGZjb2wgKyBzaXplLCAgZnJvdyArIHNpemUpO1xuICAgIHRoaXMuYWRkVmVydGV4KHgsIHkgKyB0aGlzLmNoYXJIZWlnaHQsIGZjb2wsIGZyb3cgKyBzaXplKTtcbiAgICB0aGlzLmFkZFZlcnRleCh4LCB5LCBmY29sLCBmcm93KTtcbiAgICB0aGlzLmVsZW1lbnRDb3VudCArPSA2O1xufTtcblxuRm9udC5wcm90b3R5cGUuZHJhd1N0cmluZyA9IGZ1bmN0aW9uKHgsIHksIHN0ciwgbW9kZSkge1xuICAgIHZhciBvZmZzZXQgPSBtb2RlID8gMTI4IDogMDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKylcbiAgICAgICAgdGhpcy5kcmF3Q2hhcmFjdGVyKHggKyAoKGkgKyAxKSAqIHRoaXMuY2hhcldpZHRoKSwgeSwgc3RyLmNoYXJDb2RlQXQoaSkgKyBvZmZzZXQpO1xufTtcblxuRm9udC5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oc2hhZGVyLCBwKSB7XG4gICAgaWYgKCF0aGlzLmVsZW1lbnRDb3VudClcbiAgICAgICAgcmV0dXJuO1xuXG4gICAgc2hhZGVyLnVzZSgpO1xuICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLnZlcnRleEJ1ZmZlcik7XG4gICAgZ2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIHRoaXMuZGF0YSwgZ2wuU1RSRUFNX0RSQVcpO1xuICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIoc2hhZGVyLmF0dHJpYnV0ZXMudmVydGV4QXR0cmlidXRlLCAzLCBnbC5GTE9BVCwgZmFsc2UsIDIwLCAwKTtcbiAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKHNoYWRlci5hdHRyaWJ1dGVzLnRleENvb3Jkc0F0dHJpYnV0ZSwgMiwgZ2wuRkxPQVQsIGZhbHNlLCAyMCwgMTIpO1xuICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHNoYWRlci5hdHRyaWJ1dGVzLnZlcnRleEF0dHJpYnV0ZSk7XG4gICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoc2hhZGVyLmF0dHJpYnV0ZXMudGV4Q29vcmRzQXR0cmlidXRlKTtcblxuICAgIGdsLnVuaWZvcm1NYXRyaXg0ZnYoc2hhZGVyLnVuaWZvcm1zLnByb2plY3Rpb25NYXRyaXgsIGZhbHNlLCBwKTtcblxuICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRoaXMudGV4dHVyZS5pZCk7XG4gICAgZ2wuZHJhd0FycmF5cyhnbC5UUklBTkdMRVMsIDAsIHRoaXMuZWxlbWVudENvdW50KTtcblxuXG4gICAgdGhpcy5lbGVtZW50Q291bnQgPSAwO1xuICAgIHRoaXMub2Zmc2V0ID0gMDtcblxuICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIG51bGwpO1xuICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBudWxsKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IEZvbnQ7XG59KS5jYWxsKHRoaXMscmVxdWlyZShcIjFZaVo1U1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2dsL2ZvbnQuanNcIixcIi9nbFwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbnZhciBnbE1hdHJpeCA9IHJlcXVpcmUoJ2xpYi9nbC1tYXRyaXgtbWluLmpzJyk7XG5cbnZhciBnbCA9IGZ1bmN0aW9uKCkge307XG5cbmdsLmluaXQgPSBmdW5jdGlvbihpZCkge1xuXG4gICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcbiAgICBpZiAoIWNhbnZhcylcbiAgICAgICAgdGhyb3cgJ0Vycm9yOiBObyBjYW52YXMgZWxlbWVudCBmb3VuZC4nO1xuXG4gICAgdmFyIG9wdGlvbnMgPSB7fTtcbiAgICB2YXIgZ2wgPSBjYW52YXMuZ2V0Q29udGV4dCgnd2ViZ2wnLCBvcHRpb25zKTtcbiAgICBpZiAoIWdsKVxuICAgICAgICB0aHJvdyAnRXJyb3I6IE5vIFdlYkdMIHN1cHBvcnQgZm91bmQuJztcblxuICAgIGdsLndpZHRoID0gY2FudmFzLndpZHRoO1xuICAgIGdsLmhlaWdodCA9IGNhbnZhcy5oZWlnaHQ7XG4gICAgZ2wuY2xlYXJDb2xvcigwLCAwLCAwLCAxKTtcbiAgICBnbC5ibGVuZEZ1bmMoZ2wuU1JDX0FMUEhBLCBnbC5PTkVfTUlOVVNfU1JDX0FMUEhBKTtcbiAgICBnbC5kZXB0aEZ1bmMoZ2wuTEVRVUFMKTtcbiAgICAvL2dsLmN1bGxGYWNlKGdsLkZST05UKTtcbiAgICBnbC52aWV3cG9ydCgwLCAwLCBnbC53aWR0aCwgZ2wuaGVpZ2h0KTtcblxuICAgIHdpbmRvdy52ZWMyID0gZ2xNYXRyaXgudmVjMjtcbiAgICB3aW5kb3cudmVjMyA9IGdsTWF0cml4LnZlYzM7XG4gICAgd2luZG93Lm1hdDQgPSBnbE1hdHJpeC5tYXQ0O1xuICAgIHdpbmRvdy5nbCA9IGdsO1xuXG4gICAgcmV0dXJuIGdsO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gZ2w7XG5cblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIxWWlaNVNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9nbC9nbC5qc1wiLFwiL2dsXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuXG52YXIgTGlnaHRNYXAgPSBmdW5jdGlvbihkYXRhLCBvZmZzZXQsIHdpZHRoLCBoZWlnaHQpIHtcbiAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgdGhpcy5pZCA9IGdsLmNyZWF0ZVRleHR1cmUoKTtcblxuICAgIHZhciBwaXhlbHMgPSBuZXcgVWludDhBcnJheSh3aWR0aCAqIGhlaWdodCAqIDMpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgd2lkdGggKiBoZWlnaHQ7IGkrKykge1xuICAgICAgICB2YXIgaW50ZW5zaXR5ID0gZGF0YVtvZmZzZXQgKyBpXTtcbiAgICAgICAgaW50ZW5zaXR5ID0gIWludGVuc2l0eSA/IDAgOiBpbnRlbnNpdHk7XG4gICAgICAgIHBpeGVsc1tpICogMyArIDBdID0gaW50ZW5zaXR5O1xuICAgICAgICBwaXhlbHNbaSAqIDMgKyAxXSA9IGludGVuc2l0eTtcbiAgICAgICAgcGl4ZWxzW2kgKiAzICsgMl0gPSBpbnRlbnNpdHk7XG4gICAgfVxuXG4gICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGhpcy5pZCk7XG4gICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01BR19GSUxURVIsIGdsLkxJTkVBUik7XG4gICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01JTl9GSUxURVIsIGdsLkxJTkVBUik7XG4gICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfUywgZ2wuQ0xBTVBfVE9fRURHRSk7XG4gICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfVCwgZ2wuQ0xBTVBfVE9fRURHRSk7XG5cbiAgICBnbC50ZXhJbWFnZTJEKGdsLlRFWFRVUkVfMkQsIDAsIGdsLlJHQiwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsIDAsIGdsLlJHQiwgZ2wuVU5TSUdORURfQllURSwgcGl4ZWxzKTtcbn07XG5cbkxpZ2h0TWFwLnByb3RvdHlwZS5iaW5kID0gZnVuY3Rpb24odW5pdCkge1xuICAgIGdsLmFjdGl2ZVRleHR1cmUoZ2wuVEVYVFVSRTAgKyAodW5pdCB8fCAwKSk7XG4gICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGhpcy5pZCk7XG59O1xuXG5MaWdodE1hcC5wcm90b3R5cGUudW5iaW5kID0gZnVuY3Rpb24odW5pdCkge1xuICAgIGdsLmFjdGl2ZVRleHR1cmUoZ2wuVEVYVFVSRTAgKyAodW5pdCB8fCAwKSk7XG4gICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgbnVsbCk7XG59O1xuXG5MaWdodE1hcC5wcm90b3R5cGUuYXNEYXRhVXJsID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGZyYW1lYnVmZmVyID0gZ2wuY3JlYXRlRnJhbWVidWZmZXIoKTtcbiAgICBnbC5iaW5kRnJhbWVidWZmZXIoZ2wuRlJBTUVCVUZGRVIsIGZyYW1lYnVmZmVyKTtcbiAgICBnbC5mcmFtZWJ1ZmZlclRleHR1cmUyRChnbC5GUkFNRUJVRkZFUiwgZ2wuQ09MT1JfQVRUQUNITUVOVDAsIGdsLlRFWFRVUkVfMkQsIHRoaXMuaWQsIDApO1xuXG4gICAgdmFyIHdpZHRoID0gdGhpcy53aWR0aDtcbiAgICB2YXIgaGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XG5cbiAgICAvLyBSZWFkIHRoZSBjb250ZW50cyBvZiB0aGUgZnJhbWVidWZmZXJcbiAgICB2YXIgZGF0YSA9IG5ldyBVaW50OEFycmF5KHdpZHRoICogaGVpZ2h0ICogNCk7XG4gICAgZ2wucmVhZFBpeGVscygwLCAwLCB3aWR0aCwgaGVpZ2h0LCBnbC5SR0JBLCBnbC5VTlNJR05FRF9CWVRFLCBkYXRhKTtcbiAgICBnbC5kZWxldGVGcmFtZWJ1ZmZlcihmcmFtZWJ1ZmZlcik7XG5cbiAgICAvLyBDcmVhdGUgYSAyRCBjYW52YXMgdG8gc3RvcmUgdGhlIHJlc3VsdFxuICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICBjYW52YXMud2lkdGggPSB3aWR0aDtcbiAgICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgIHZhciBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbiAgICAvLyBDb3B5IHRoZSBwaXhlbHMgdG8gYSAyRCBjYW52YXNcbiAgICB2YXIgaW1hZ2VEYXRhID0gY29udGV4dC5jcmVhdGVJbWFnZURhdGEod2lkdGgsIGhlaWdodCk7XG4gICAgaW1hZ2VEYXRhLmRhdGEuc2V0KGRhdGEpO1xuICAgIGNvbnRleHQucHV0SW1hZ2VEYXRhKGltYWdlRGF0YSwgMCwgMCk7XG4gICAgcmV0dXJuIGNhbnZhcy50b0RhdGFVUkwoKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IExpZ2h0TWFwO1xufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIxWWlaNVNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9nbC9saWdodG1hcC5qc1wiLFwiL2dsXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuXG5mdW5jdGlvbiBjb21waWxlU2hhZGVyKHR5cGUsIHNvdXJjZSkge1xuICAgIHZhciBzaGFkZXIgPSBnbC5jcmVhdGVTaGFkZXIodHlwZSk7XG4gICAgZ2wuc2hhZGVyU291cmNlKHNoYWRlciwgc291cmNlKTtcbiAgICBnbC5jb21waWxlU2hhZGVyKHNoYWRlcik7XG4gICAgaWYgKCFnbC5nZXRTaGFkZXJQYXJhbWV0ZXIoc2hhZGVyLCBnbC5DT01QSUxFX1NUQVRVUykpIHtcbiAgICAgICAgdGhyb3cgJ0Vycm9yOiBTaGFkZXIgY29tcGlsZSBlcnJvcjogJyArIGdsLmdldFNoYWRlckluZm9Mb2coc2hhZGVyKTtcbiAgICB9XG4gICAgcmV0dXJuIHNoYWRlcjtcbn1cblxudmFyIFNoYWRlciA9IGZ1bmN0aW9uKHNvdXJjZSkge1xuICAgIHZhciB2ZXJ0ZXhTdGFydCA9IHNvdXJjZS5pbmRleE9mKCdbdmVydGV4XScpO1xuICAgIHZhciBmcmFnbWVudFN0YXJ0ID0gc291cmNlLmluZGV4T2YoJ1tmcmFnbWVudF0nKTtcbiAgICBpZiAodmVydGV4U3RhcnQgPT09IC0xIHx8IGZyYWdtZW50U3RhcnQgPT09IC0xKVxuICAgICAgICB0aHJvdyAnRXJyb3I6IE1pc3NpbmcgW2ZyYWdtZW50XSBhbmQvb3IgW3ZlcnRleF0gbWFya2VycyBpbiBzaGFkZXIuJztcblxuICAgIHZhciB2ZXJ0ZXhTb3VyY2UgPSBzb3VyY2Uuc3Vic3RyaW5nKHZlcnRleFN0YXJ0ICsgOCwgZnJhZ21lbnRTdGFydCk7XG4gICAgdmFyIGZyYWdtZW50U291cmNlID0gc291cmNlLnN1YnN0cmluZyhmcmFnbWVudFN0YXJ0ICsgMTApO1xuICAgIHRoaXMuY29tcGlsZSh2ZXJ0ZXhTb3VyY2UsIGZyYWdtZW50U291cmNlKTtcbn07XG5cblNoYWRlci5wcm90b3R5cGUuY29tcGlsZSA9IGZ1bmN0aW9uKHZlcnRleFNvdXJjZSwgZnJhZ21lbnRTb3VyY2UpIHtcbiAgICB2YXIgcHJvZ3JhbSA9IGdsLmNyZWF0ZVByb2dyYW0oKTtcbiAgICBnbC5hdHRhY2hTaGFkZXIocHJvZ3JhbSwgY29tcGlsZVNoYWRlcihnbC5WRVJURVhfU0hBREVSLCB2ZXJ0ZXhTb3VyY2UpKTtcbiAgICBnbC5hdHRhY2hTaGFkZXIocHJvZ3JhbSwgY29tcGlsZVNoYWRlcihnbC5GUkFHTUVOVF9TSEFERVIsIGZyYWdtZW50U291cmNlKSk7XG4gICAgZ2wubGlua1Byb2dyYW0ocHJvZ3JhbSk7XG4gICAgaWYgKCFnbC5nZXRQcm9ncmFtUGFyYW1ldGVyKHByb2dyYW0sIGdsLkxJTktfU1RBVFVTKSlcbiAgICAgICAgdGhyb3cgJ0Vycm9yOiBTaGFkZXIgbGlua2luZyBlcnJvcjogJyArIGdsLmdldFByb2dyYW1JbmZvTG9nKHByb2dyYW0pO1xuXG4gICAgdmFyIHNvdXJjZXMgPSB2ZXJ0ZXhTb3VyY2UgKyBmcmFnbWVudFNvdXJjZTtcbiAgICB2YXIgbGluZXMgPSBzb3VyY2VzLm1hdGNoKC8odW5pZm9ybXxhdHRyaWJ1dGUpXFxzK1xcdytcXHMrXFx3Kyg/PTspL2cpO1xuICAgIHRoaXMudW5pZm9ybXMgPSB7fTtcbiAgICB0aGlzLmF0dHJpYnV0ZXMgPSB7fTtcbiAgICB0aGlzLnNhbXBsZXJzID0gW107XG4gICAgZm9yICh2YXIgaSBpbiBsaW5lcykge1xuICAgICAgICB2YXIgdG9rZW5zID0gbGluZXNbaV0uc3BsaXQoJyAnKTtcbiAgICAgICAgdmFyIG5hbWUgPSB0b2tlbnNbMl07XG4gICAgICAgIHZhciB0eXBlID0gdG9rZW5zWzFdO1xuICAgICAgICBzd2l0Y2ggKHRva2Vuc1swXSkge1xuICAgICAgICAgICAgY2FzZSAnYXR0cmlidXRlJzpcbiAgICAgICAgICAgICAgICB2YXIgYXR0cmlidXRlTG9jYXRpb24gPSBnbC5nZXRBdHRyaWJMb2NhdGlvbihwcm9ncmFtLCBuYW1lKTtcbiAgICAgICAgICAgICAgICB0aGlzLmF0dHJpYnV0ZXNbbmFtZV0gPSBhdHRyaWJ1dGVMb2NhdGlvbjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3VuaWZvcm0nOlxuICAgICAgICAgICAgICAgIHZhciBsb2NhdGlvbiA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihwcm9ncmFtLCBuYW1lKTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZSA9PT0gJ3NhbXBsZXIyRCcpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2FtcGxlcnMucHVzaChsb2NhdGlvbik7XG4gICAgICAgICAgICAgICAgdGhpcy51bmlmb3Jtc1tuYW1lXSA9IGxvY2F0aW9uO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyAnSW52YWxpZCBhdHRyaWJ1dGUvdW5pZm9ybSBmb3VuZDogJyArIHRva2Vuc1sxXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnByb2dyYW0gPSBwcm9ncmFtO1xufTtcblxuU2hhZGVyLnByb3RvdHlwZS51c2UgPSBmdW5jdGlvbigpIHtcbiAgICBnbC51c2VQcm9ncmFtKHRoaXMucHJvZ3JhbSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBTaGFkZXI7XG59KS5jYWxsKHRoaXMscmVxdWlyZShcIjFZaVo1U1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2dsL3NoYWRlci5qc1wiLFwiL2dsXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIEF0bGFzID0gcmVxdWlyZSgnZ2wvYXRsYXMnKTtcblxudmFyIFNwcml0ZXMgPSBmdW5jdGlvbiAod2lkdGgsIGhlaWdodCwgc3ByaXRlQ291bnQpIHtcbiAgICB0aGlzLnNwcml0ZUNvbXBvbmVudHMgPSA5OyAvLyB4eXosIHV2LCByZ2JhXG4gICAgdGhpcy5zcHJpdGVWZXJ0aWNlcyA9IDY7XG4gICAgdGhpcy5tYXhTcHJpdGVzID0gc3ByaXRlQ291bnQgfHwgMTI4O1xuICAgIHRoaXMudGV4dHVyZXMgPSBuZXcgQXRsYXMod2lkdGgsIGhlaWdodCk7XG4gICAgdGhpcy5zcHJpdGVDb3VudCA9IDA7XG4gICAgdGhpcy5kYXRhID0gbmV3IEZsb2F0MzJBcnJheSh0aGlzLm1heFNwcml0ZXMgKiB0aGlzLnNwcml0ZUNvbXBvbmVudHMgKiB0aGlzLnNwcml0ZVZlcnRpY2VzKTtcbiAgICB0aGlzLnZlcnRleEJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xuICAgIHRoaXMuZGlydHkgPSBmYWxzZTtcbn07XG5cblNwcml0ZXMucHJvdG90eXBlLmRyYXdTcHJpdGUgPSBmdW5jdGlvbiAodGV4dHVyZSwgeCwgeSwgd2lkdGgsIGhlaWdodCwgciwgZywgYiwgYSkge1xuICAgIHZhciB6ID0gMDtcbiAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YTtcbiAgICB2YXIgb2Zmc2V0ID0gdGhpcy5zcHJpdGVDb3VudCAqIHRoaXMuc3ByaXRlVmVydGljZXMgKiB0aGlzLnNwcml0ZUNvbXBvbmVudHM7XG4gICAgdmFyIHQgPSB0aGlzLnRleHR1cmVzLmdldFN1YlRleHR1cmUodGV4dHVyZSk7XG4gICAgd2lkdGggPSB3aWR0aCB8fCB0LndpZHRoO1xuICAgIGhlaWdodCA9IGhlaWdodCB8fCB0LmhlaWdodDtcblxuICAgIGRhdGFbb2Zmc2V0ICsgMF0gPSB4O1xuICAgIGRhdGFbb2Zmc2V0ICsgMV0gPSB5O1xuICAgIGRhdGFbb2Zmc2V0ICsgMl0gPSB6O1xuICAgIGRhdGFbb2Zmc2V0ICsgM10gPSB0LnMxO1xuICAgIGRhdGFbb2Zmc2V0ICsgNF0gPSB0LnQxO1xuICAgIGRhdGFbb2Zmc2V0ICsgNV0gPSByO1xuICAgIGRhdGFbb2Zmc2V0ICsgNl0gPSBnO1xuICAgIGRhdGFbb2Zmc2V0ICsgN10gPSBiO1xuICAgIGRhdGFbb2Zmc2V0ICsgOF0gPSBhO1xuXG4gICAgZGF0YVtvZmZzZXQgKyA5XSA9IHggKyB3aWR0aDtcbiAgICBkYXRhW29mZnNldCArIDEwXSA9IHk7XG4gICAgZGF0YVtvZmZzZXQgKyAxMV0gPSB6O1xuICAgIGRhdGFbb2Zmc2V0ICsgMTJdID0gdC5zMjtcbiAgICBkYXRhW29mZnNldCArIDEzXSA9IHQudDE7XG4gICAgZGF0YVtvZmZzZXQgKyAxNF0gPSByO1xuICAgIGRhdGFbb2Zmc2V0ICsgMTVdID0gZztcbiAgICBkYXRhW29mZnNldCArIDE2XSA9IGI7XG4gICAgZGF0YVtvZmZzZXQgKyAxN10gPSBhO1xuXG4gICAgZGF0YVtvZmZzZXQgKyAxOF0gPSB4ICsgd2lkdGg7XG4gICAgZGF0YVtvZmZzZXQgKyAxOV0gPSB5ICsgaGVpZ2h0O1xuICAgIGRhdGFbb2Zmc2V0ICsgMjBdID0gejtcbiAgICBkYXRhW29mZnNldCArIDIxXSA9IHQuczI7XG4gICAgZGF0YVtvZmZzZXQgKyAyMl0gPSB0LnQyO1xuICAgIGRhdGFbb2Zmc2V0ICsgMjNdID0gcjtcbiAgICBkYXRhW29mZnNldCArIDI0XSA9IGc7XG4gICAgZGF0YVtvZmZzZXQgKyAyNV0gPSBiO1xuICAgIGRhdGFbb2Zmc2V0ICsgMjZdID0gYTtcblxuICAgIGRhdGFbb2Zmc2V0ICsgMjddID0geCArIHdpZHRoO1xuICAgIGRhdGFbb2Zmc2V0ICsgMjhdID0geSArIGhlaWdodDtcbiAgICBkYXRhW29mZnNldCArIDI5XSA9IHo7XG4gICAgZGF0YVtvZmZzZXQgKyAzMF0gPSB0LnMyO1xuICAgIGRhdGFbb2Zmc2V0ICsgMzFdID0gdC50MjtcbiAgICBkYXRhW29mZnNldCArIDMyXSA9IHI7XG4gICAgZGF0YVtvZmZzZXQgKyAzM10gPSBnO1xuICAgIGRhdGFbb2Zmc2V0ICsgMzRdID0gYjtcbiAgICBkYXRhW29mZnNldCArIDM1XSA9IGE7XG5cbiAgICBkYXRhW29mZnNldCArIDM2XSA9IHg7XG4gICAgZGF0YVtvZmZzZXQgKyAzN10gPSB5ICsgaGVpZ2h0O1xuICAgIGRhdGFbb2Zmc2V0ICsgMzhdID0gejtcbiAgICBkYXRhW29mZnNldCArIDM5XSA9IHQuczE7XG4gICAgZGF0YVtvZmZzZXQgKyA0MF0gPSB0LnQyO1xuICAgIGRhdGFbb2Zmc2V0ICsgNDFdID0gcjtcbiAgICBkYXRhW29mZnNldCArIDQyXSA9IGc7XG4gICAgZGF0YVtvZmZzZXQgKyA0M10gPSBiO1xuICAgIGRhdGFbb2Zmc2V0ICsgNDRdID0gYTtcblxuICAgIGRhdGFbb2Zmc2V0ICsgNDVdID0geDtcbiAgICBkYXRhW29mZnNldCArIDQ2XSA9IHk7XG4gICAgZGF0YVtvZmZzZXQgKyA0N10gPSB6O1xuICAgIGRhdGFbb2Zmc2V0ICsgNDhdID0gdC5zMTtcbiAgICBkYXRhW29mZnNldCArIDQ5XSA9IHQudDE7XG4gICAgZGF0YVtvZmZzZXQgKyA1MF0gPSByO1xuICAgIGRhdGFbb2Zmc2V0ICsgNTFdID0gZztcbiAgICBkYXRhW29mZnNldCArIDUyXSA9IGI7XG4gICAgZGF0YVtvZmZzZXQgKyA1M10gPSBhO1xuXG4gICAgdGhpcy5kaXJ0eSA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXMuc3ByaXRlQ291bnQrKztcbn07XG5cblNwcml0ZXMucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuc3ByaXRlQ291bnQgPSAwO1xufTtcblxuU3ByaXRlcy5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gKHNoYWRlciwgcCwgZmlyc3RTcHJpdGUsIHNwcml0ZUNvdW50KSB7XG4gICAgaWYgKHRoaXMuc3ByaXRlQ291bnQgPD0gMClcbiAgICAgICAgcmV0dXJuO1xuXG4gICAgZmlyc3RTcHJpdGUgPSBmaXJzdFNwcml0ZSB8fCAwO1xuICAgIHNwcml0ZUNvdW50ID0gc3ByaXRlQ291bnQgfHwgdGhpcy5zcHJpdGVDb3VudDtcblxuICAgIHNoYWRlci51c2UoKTtcbiAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdGhpcy52ZXJ0ZXhCdWZmZXIpO1xuXG4gICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoc2hhZGVyLmF0dHJpYnV0ZXMudmVydGV4QXR0cmlidXRlKTtcbiAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShzaGFkZXIuYXR0cmlidXRlcy50ZXhDb29yZHNBdHRyaWJ1dGUpO1xuICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHNoYWRlci5hdHRyaWJ1dGVzLmNvbG9yc0F0dHJpYnV0ZSk7XG5cbiAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKHNoYWRlci5hdHRyaWJ1dGVzLnZlcnRleEF0dHJpYnV0ZSwgMywgZ2wuRkxPQVQsIGZhbHNlLCAzNiwgMCk7XG4gICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihzaGFkZXIuYXR0cmlidXRlcy50ZXhDb29yZHNBdHRyaWJ1dGUsIDIsIGdsLkZMT0FULCBmYWxzZSwgMzYsIDEyKTtcbiAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKHNoYWRlci5hdHRyaWJ1dGVzLmNvbG9yc0F0dHJpYnV0ZSwgNCwgZ2wuRkxPQVQsIGZhbHNlLCAzNiwgMjApO1xuXG4gICAgZ2wudW5pZm9ybU1hdHJpeDRmdihzaGFkZXIudW5pZm9ybXMucHJvamVjdGlvbk1hdHJpeCwgZmFsc2UsIHApO1xuXG4gICAgaWYgKHRoaXMuZGlydHkpIHtcbiAgICAgICAgZ2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIHRoaXMuZGF0YSwgZ2wuU1RBVElDX0RSQVcpO1xuICAgICAgICB0aGlzLmRpcnR5ID0gZmFsc2U7XG4gICAgfVxuICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRoaXMudGV4dHVyZXMudGV4dHVyZS5pZCk7XG4gICAgZ2wuZHJhd0FycmF5cyhnbC5UUklBTkdMRVMsIGZpcnN0U3ByaXRlICogdGhpcy5zcHJpdGVWZXJ0aWNlcywgc3ByaXRlQ291bnQgKiB0aGlzLnNwcml0ZVZlcnRpY2VzKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IFNwcml0ZXM7XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiMVlpWjVTXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvZ2wvc3ByaXRlcy5qc1wiLFwiL2dsXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIHV0aWxzID0gcmVxdWlyZSgndXRpbHMnKTtcblxudmFyIFRleHR1cmUgPSBmdW5jdGlvbihmaWxlLCBvcHRpb25zKSB7XG4gICAgdmFyIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIG9wdGlvbnMuYWxwaGEgPSBvcHRpb25zLmFscGhhIHx8IGZhbHNlO1xuICAgIG9wdGlvbnMuZm9ybWF0ID0gb3B0aW9ucy5mb3JtYXQgfHwgZ2wuUkdCQTtcbiAgICBvcHRpb25zLnR5cGUgPSBvcHRpb25zLnR5cGUgfHwgZ2wuVU5TSUdORURfQllURTtcbiAgICBvcHRpb25zLmZpbHRlciA9IG9wdGlvbnMuZmlsdGVyIHx8IGdsLkxJTkVBUjtcbiAgICBvcHRpb25zLndyYXAgPSBvcHRpb25zLndyYXAgfHwgZ2wuQ0xBTVBfVE9fRURHRTtcblxuICAgIHRoaXMuaWQgPSBnbC5jcmVhdGVUZXh0dXJlKCk7XG4gICAgdGhpcy53aWR0aCA9IG9wdGlvbnMud2lkdGggfHwgZmlsZS5yZWFkVUludDMyKCk7XG4gICAgdGhpcy5oZWlnaHQgPSBvcHRpb25zLmhlaWdodCB8fCBmaWxlLnJlYWRVSW50MzIoKTtcbiAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCB0aGlzLmlkKTtcbiAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgb3B0aW9ucy5maWx0ZXIpO1xuICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NSU5fRklMVEVSLCBvcHRpb25zLmZpbHRlcik7XG4gICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfUywgb3B0aW9ucy53cmFwKTtcbiAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9ULCBvcHRpb25zLndyYXApO1xuXG4gICAgaWYgKGZpbGUpIHtcbiAgICAgICAgaWYgKCFvcHRpb25zLnBhbGV0dGUpXG4gICAgICAgICAgICB0aHJvdyAnRXJyb3I6IE5vIHBhbGV0dGUgc3BlY2lmaWVkIGluIG9wdGlvbnMuJztcblxuICAgICAgICB2YXIgcGl4ZWxzID0gb3B0aW9ucy5wYWxldHRlLnVucGFjayhmaWxlLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgb3B0aW9ucy5hbHBoYSk7XG4gICAgICAgIHZhciBucG90ID0gdXRpbHMuaXNQb3dlck9mMih0aGlzLndpZHRoKSAmJiB1dGlscy5pc1Bvd2VyT2YyKHRoaXMuaGVpZ2h0KTtcbiAgICAgICAgaWYgKCFucG90ICYmIG9wdGlvbnMud3JhcCA9PT0gZ2wuUkVQRUFUKSB7XG4gICAgICAgICAgICB2YXIgbmV3V2lkdGggPSB1dGlscy5uZXh0UG93ZXJPZjIodGhpcy53aWR0aCk7XG4gICAgICAgICAgICB2YXIgbmV3SGVpZ2h0ID0gdXRpbHMubmV4dFBvd2VyT2YyKHRoaXMuaGVpZ2h0KTtcbiAgICAgICAgICAgIHBpeGVscyA9IHRoaXMucmVzYW1wbGUocGl4ZWxzLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgbmV3V2lkdGgsIG5ld0hlaWdodCk7XG4gICAgICAgICAgICBnbC50ZXhJbWFnZTJEKGdsLlRFWFRVUkVfMkQsIDAsIG9wdGlvbnMuZm9ybWF0LCBuZXdXaWR0aCwgbmV3SGVpZ2h0LFxuICAgICAgICAgICAgICAgIDAsIG9wdGlvbnMuZm9ybWF0LCBvcHRpb25zLnR5cGUsIHBpeGVscyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBnbC50ZXhJbWFnZTJEKGdsLlRFWFRVUkVfMkQsIDAsIG9wdGlvbnMuZm9ybWF0LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCxcbiAgICAgICAgICAgICAgICAwLCBvcHRpb25zLmZvcm1hdCwgb3B0aW9ucy50eXBlLCBwaXhlbHMpO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZ2wudGV4SW1hZ2UyRChnbC5URVhUVVJFXzJELCAwLCBvcHRpb25zLmZvcm1hdCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsXG4gICAgICAgICAgICAwLCBvcHRpb25zLmZvcm1hdCwgb3B0aW9ucy50eXBlLCBudWxsKTtcbiAgICB9XG59O1xuXG5UZXh0dXJlLnByb3RvdHlwZS5kcmF3VG8gPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICB2YXIgdiA9IGdsLmdldFBhcmFtZXRlcihnbC5WSUVXUE9SVCk7XG5cbiAgICAvKiBTZXR1cCBzaGFyZWQgYnVmZmVycyBmb3IgcmVuZGVyIHRhcmdldCBkcmF3aW5nICovXG4gICAgaWYgKHR5cGVvZiBUZXh0dXJlLmZyYW1lQnVmZmVyID09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIFRleHR1cmUuZnJhbWVCdWZmZXIgPSBnbC5jcmVhdGVGcmFtZWJ1ZmZlcigpO1xuICAgICAgICBUZXh0dXJlLnJlbmRlckJ1ZmZlciA9IGdsLmNyZWF0ZVJlbmRlcmJ1ZmZlcigpO1xuICAgIH1cblxuICAgIGdsLmJpbmRGcmFtZWJ1ZmZlcihnbC5GUkFNRUJVRkZFUiwgVGV4dHVyZS5mcmFtZUJ1ZmZlcik7XG4gICAgZ2wuYmluZFJlbmRlcmJ1ZmZlcihnbC5SRU5ERVJCVUZGRVIsIFRleHR1cmUucmVuZGVyQnVmZmVyKTtcbiAgICBpZiAodGhpcy53aWR0aCAhPSBUZXh0dXJlLnJlbmRlckJ1ZmZlci53aWR0aCB8fCB0aGlzLmhlaWdodCAhPSBUZXh0dXJlLnJlbmRlckJ1ZmZlci5oZWlnaHQpIHtcbiAgICAgICAgVGV4dHVyZS5yZW5kZXJCdWZmZXIud2lkdGggPSB0aGlzLndpZHRoO1xuICAgICAgICBUZXh0dXJlLnJlbmRlckJ1ZmZlci5oZWlnaHQgPSB0aGlzLmhlaWdodDtcbiAgICAgICAgZ2wucmVuZGVyYnVmZmVyU3RvcmFnZShnbC5SRU5ERVJCVUZGRVIsIGdsLkRFUFRIX0NPTVBPTkVOVDE2LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gICAgfVxuXG5cbiAgICBnbC5mcmFtZWJ1ZmZlclRleHR1cmUyRChnbC5GUkFNRUJVRkZFUiwgZ2wuQ09MT1JfQVRUQUNITUVOVDAsIGdsLlRFWFRVUkVfMkQsIHRoaXMuaWQsIDApO1xuICAgIGdsLmZyYW1lYnVmZmVyUmVuZGVyYnVmZmVyKGdsLkZSQU1FQlVGRkVSLCBnbC5ERVBUSF9BVFRBQ0hNRU5ULCBnbC5SRU5ERVJCVUZGRVIsIFRleHR1cmUucmVuZGVyQnVmZmVyKTtcbiAgICBnbC52aWV3cG9ydCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG5cbiAgICB2YXIgcHJvamVjdGlvbk1hdHJpeCA9IG1hdDQub3J0aG8obWF0NC5jcmVhdGUoKSwgMCwgdGhpcy53aWR0aCwgMCwgdGhpcy5oZWlnaHQsIC0xMCwgMTApO1xuICAgIGNhbGxiYWNrKHByb2plY3Rpb25NYXRyaXgpO1xuXG4gICAgZ2wuYmluZEZyYW1lYnVmZmVyKGdsLkZSQU1FQlVGRkVSLCBudWxsKTtcbiAgICBnbC5iaW5kUmVuZGVyYnVmZmVyKGdsLlJFTkRFUkJVRkZFUiwgbnVsbCk7XG4gICAgZ2wudmlld3BvcnQodlswXSwgdlsxXSwgdlsyXSwgdlszXSk7XG59O1xuXG5UZXh0dXJlLnByb3RvdHlwZS5yZXNhbXBsZSA9IGZ1bmN0aW9uKHBpeGVscywgd2lkdGgsIGhlaWdodCwgbmV3V2lkdGgsIG5ld0hlaWdodCkge1xuICAgIHZhciBzcmMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICBzcmMud2lkdGggPSB3aWR0aDtcbiAgICBzcmMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgIHZhciBjb250ZXh0ID0gc3JjLmdldENvbnRleHQoJzJkJyk7XG4gICAgdmFyIGltYWdlRGF0YSA9IGNvbnRleHQuY3JlYXRlSW1hZ2VEYXRhKHdpZHRoLCBoZWlnaHQpO1xuICAgIGltYWdlRGF0YS5kYXRhLnNldChwaXhlbHMpO1xuICAgIGNvbnRleHQucHV0SW1hZ2VEYXRhKGltYWdlRGF0YSwgMCwgMCk7XG5cbiAgICB2YXIgZGVzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgIGRlc3Qud2lkdGggPSBuZXdXaWR0aDtcbiAgICBkZXN0LmhlaWdodCA9IG5ld0hlaWdodDtcbiAgICBjb250ZXh0ID0gZGVzdC5nZXRDb250ZXh0KCcyZCcpO1xuICAgIGNvbnRleHQuZHJhd0ltYWdlKHNyYywgMCwgMCwgZGVzdC53aWR0aCwgZGVzdC5oZWlnaHQpO1xuICAgIHZhciBpbWFnZSA9IGNvbnRleHQuZ2V0SW1hZ2VEYXRhKDAsIDAsIGRlc3Qud2lkdGgsIGRlc3QuaGVpZ2h0KTtcbiAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoaW1hZ2UuZGF0YSk7XG59O1xuXG5UZXh0dXJlLnByb3RvdHlwZS5iaW5kID0gZnVuY3Rpb24odW5pdCkge1xuICAgIGdsLmFjdGl2ZVRleHR1cmUoZ2wuVEVYVFVSRTAgKyAodW5pdCB8fCAwKSk7XG4gICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGhpcy5pZCk7XG59O1xuXG5UZXh0dXJlLnByb3RvdHlwZS51bmJpbmQgPSBmdW5jdGlvbih1bml0KSB7XG4gICAgZ2wuYWN0aXZlVGV4dHVyZShnbC5URVhUVVJFMCArICh1bml0IHx8IDApKTtcbiAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCBudWxsKTtcbn07XG5cblRleHR1cmUucHJvdG90eXBlLmFzRGF0YVVybCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBmcmFtZWJ1ZmZlciA9IGdsLmNyZWF0ZUZyYW1lYnVmZmVyKCk7XG4gICAgZ2wuYmluZEZyYW1lYnVmZmVyKGdsLkZSQU1FQlVGRkVSLCBmcmFtZWJ1ZmZlcik7XG4gICAgZ2wuZnJhbWVidWZmZXJUZXh0dXJlMkQoZ2wuRlJBTUVCVUZGRVIsIGdsLkNPTE9SX0FUVEFDSE1FTlQwLCBnbC5URVhUVVJFXzJELCB0aGlzLmlkLCAwKTtcblxuICAgIHZhciB3aWR0aCA9IHRoaXMud2lkdGg7XG4gICAgdmFyIGhlaWdodCA9IHRoaXMuaGVpZ2h0O1xuXG4gICAgLy8gUmVhZCB0aGUgY29udGVudHMgb2YgdGhlIGZyYW1lYnVmZmVyXG4gICAgdmFyIGRhdGEgPSBuZXcgVWludDhBcnJheSh3aWR0aCAqIGhlaWdodCAqIDQpO1xuICAgIGdsLnJlYWRQaXhlbHMoMCwgMCwgd2lkdGgsIGhlaWdodCwgZ2wuUkdCQSwgZ2wuVU5TSUdORURfQllURSwgZGF0YSk7XG4gICAgZ2wuZGVsZXRlRnJhbWVidWZmZXIoZnJhbWVidWZmZXIpO1xuXG4gICAgLy8gQ3JlYXRlIGEgMkQgY2FudmFzIHRvIHN0b3JlIHRoZSByZXN1bHRcbiAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgY2FudmFzLndpZHRoID0gd2lkdGg7XG4gICAgY2FudmFzLmhlaWdodCA9IGhlaWdodDtcbiAgICB2YXIgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgLy8gQ29weSB0aGUgcGl4ZWxzIHRvIGEgMkQgY2FudmFzXG4gICAgdmFyIGltYWdlRGF0YSA9IGNvbnRleHQuY3JlYXRlSW1hZ2VEYXRhKHdpZHRoLCBoZWlnaHQpO1xuICAgIGltYWdlRGF0YS5kYXRhLnNldChkYXRhKTtcbiAgICBjb250ZXh0LnB1dEltYWdlRGF0YShpbWFnZURhdGEsIDAsIDApO1xuICAgIHJldHVybiBjYW52YXMudG9EYXRhVVJMKCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBUZXh0dXJlO1xufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIxWWlaNVNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9nbC90ZXh0dXJlLmpzXCIsXCIvZ2xcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG5cbnZhciBrZXlzID0geyBsZWZ0OiAzNywgcmlnaHQ6IDM5LCB1cDogMzgsIGRvd246IDQwLCBhOiA2NSwgejogOTAgfTtcblxudmFyIElucHV0ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5sZWZ0ID0gZmFsc2U7XG4gICAgdGhpcy5yaWdodCA9IGZhbHNlO1xuICAgIHRoaXMudXAgPSBmYWxzZTtcbiAgICB0aGlzLmRvd24gPSBmYWxzZTtcbiAgICB0aGlzLmZseVVwID0gZmFsc2U7XG4gICAgdGhpcy5mbHlEb3duID0gZmFsc2U7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsXG4gICAgICAgIGZ1bmN0aW9uKGV2ZW50KSB7IHNlbGYua2V5RG93bihldmVudCk7IH0sIHRydWUpO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJyxcbiAgICAgICAgZnVuY3Rpb24oZXZlbnQpIHsgc2VsZi5rZXlVcChldmVudCk7IH0sIHRydWUpO1xufTtcblxuSW5wdXQucHJvdG90eXBlLmtleURvd24gPSBmdW5jdGlvbihldmVudCkge1xuICAgIHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xuICAgICAgICBjYXNlIGtleXMubGVmdDogdGhpcy5sZWZ0ID0gdHJ1ZTsgYnJlYWs7XG4gICAgICAgIGNhc2Uga2V5cy5yaWdodDogdGhpcy5yaWdodCA9IHRydWU7IGJyZWFrO1xuICAgICAgICBjYXNlIGtleXMudXA6IHRoaXMudXAgPSB0cnVlOyBicmVhaztcbiAgICAgICAgY2FzZSBrZXlzLmRvd246IHRoaXMuZG93biA9IHRydWU7IGJyZWFrO1xuICAgICAgICBjYXNlIGtleXMuYTogdGhpcy5mbHlVcCA9IHRydWU7IGJyZWFrO1xuICAgICAgICBjYXNlIGtleXMuejogdGhpcy5mbHlEb3duID0gdHJ1ZTsgYnJlYWs7XG4gICAgfVxufTtcblxuSW5wdXQucHJvdG90eXBlLmtleVVwID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcbiAgICAgICAgY2FzZSBrZXlzLmxlZnQ6IHRoaXMubGVmdCA9IGZhbHNlOyBicmVhaztcbiAgICAgICAgY2FzZSBrZXlzLnJpZ2h0OiB0aGlzLnJpZ2h0ID0gZmFsc2U7IGJyZWFrO1xuICAgICAgICBjYXNlIGtleXMudXA6IHRoaXMudXAgPSBmYWxzZTsgYnJlYWs7XG4gICAgICAgIGNhc2Uga2V5cy5kb3duOiB0aGlzLmRvd24gPSBmYWxzZTsgYnJlYWs7XG4gICAgICAgIGNhc2Uga2V5cy5hOiB0aGlzLmZseVVwID0gZmFsc2U7IGJyZWFrO1xuICAgICAgICBjYXNlIGtleXMuejogdGhpcy5mbHlEb3duID0gZmFsc2U7IGJyZWFrO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IElucHV0O1xufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIxWWlaNVNcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9pbnB1dC5qc1wiLFwiL1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8qKlxuICogQGZpbGVvdmVydmlldyBnbC1tYXRyaXggLSBIaWdoIHBlcmZvcm1hbmNlIG1hdHJpeCBhbmQgdmVjdG9yIG9wZXJhdGlvbnNcbiAqIEBhdXRob3IgQnJhbmRvbiBKb25lc1xuICogQGF1dGhvciBDb2xpbiBNYWNLZW56aWUgSVZcbiAqIEB2ZXJzaW9uIDIuMi4xXG4gKi9cbi8qIENvcHlyaWdodCAoYykgMjAxMywgQnJhbmRvbiBKb25lcywgQ29saW4gTWFjS2VuemllIElWLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuXG4gUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbiBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG5cbiAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxuIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb25cbiBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cblxuIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgXCJBUyBJU1wiIEFORFxuIEFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEXG4gV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRVxuIERJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFQgSE9MREVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SXG4gQU5ZIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTXG4gKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTO1xuIExPU1MgT0YgVVNFLCBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTlxuIEFOWSBUSEVPUlkgT0YgTElBQklMSVRZLCBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUXG4gKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVNcbiBTT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS4gKi9cbihmdW5jdGlvbihlKXtcInVzZSBzdHJpY3RcIjt2YXIgdD17fTt0eXBlb2YgZXhwb3J0cz09XCJ1bmRlZmluZWRcIj90eXBlb2YgZGVmaW5lPT1cImZ1bmN0aW9uXCImJnR5cGVvZiBkZWZpbmUuYW1kPT1cIm9iamVjdFwiJiZkZWZpbmUuYW1kPyh0LmV4cG9ydHM9e30sZGVmaW5lKGZ1bmN0aW9uKCl7cmV0dXJuIHQuZXhwb3J0c30pKTp0LmV4cG9ydHM9dHlwZW9mIHdpbmRvdyE9XCJ1bmRlZmluZWRcIj93aW5kb3c6ZTp0LmV4cG9ydHM9ZXhwb3J0cyxmdW5jdGlvbihlKXtpZighdCl2YXIgdD0xZS02O2lmKCFuKXZhciBuPXR5cGVvZiBGbG9hdDMyQXJyYXkhPVwidW5kZWZpbmVkXCI/RmxvYXQzMkFycmF5OkFycmF5O2lmKCFyKXZhciByPU1hdGgucmFuZG9tO3ZhciBpPXt9O2kuc2V0TWF0cml4QXJyYXlUeXBlPWZ1bmN0aW9uKGUpe249ZX0sdHlwZW9mIGUhPVwidW5kZWZpbmVkXCImJihlLmdsTWF0cml4PWkpO3ZhciBzPU1hdGguUEkvMTgwO2kudG9SYWRpYW49ZnVuY3Rpb24oZSl7cmV0dXJuIGUqc307dmFyIG89e307by5jcmVhdGU9ZnVuY3Rpb24oKXt2YXIgZT1uZXcgbigyKTtyZXR1cm4gZVswXT0wLGVbMV09MCxlfSxvLmNsb25lPWZ1bmN0aW9uKGUpe3ZhciB0PW5ldyBuKDIpO3JldHVybiB0WzBdPWVbMF0sdFsxXT1lWzFdLHR9LG8uZnJvbVZhbHVlcz1mdW5jdGlvbihlLHQpe3ZhciByPW5ldyBuKDIpO3JldHVybiByWzBdPWUsclsxXT10LHJ9LG8uY29weT1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdPXRbMF0sZVsxXT10WzFdLGV9LG8uc2V0PWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT10LGVbMV09bixlfSxvLmFkZD1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXStuWzBdLGVbMV09dFsxXStuWzFdLGV9LG8uc3VidHJhY3Q9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0tblswXSxlWzFdPXRbMV0tblsxXSxlfSxvLnN1Yj1vLnN1YnRyYWN0LG8ubXVsdGlwbHk9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0qblswXSxlWzFdPXRbMV0qblsxXSxlfSxvLm11bD1vLm11bHRpcGx5LG8uZGl2aWRlPWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT10WzBdL25bMF0sZVsxXT10WzFdL25bMV0sZX0sby5kaXY9by5kaXZpZGUsby5taW49ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPU1hdGgubWluKHRbMF0sblswXSksZVsxXT1NYXRoLm1pbih0WzFdLG5bMV0pLGV9LG8ubWF4PWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT1NYXRoLm1heCh0WzBdLG5bMF0pLGVbMV09TWF0aC5tYXgodFsxXSxuWzFdKSxlfSxvLnNjYWxlPWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT10WzBdKm4sZVsxXT10WzFdKm4sZX0sby5zY2FsZUFuZEFkZD1mdW5jdGlvbihlLHQsbixyKXtyZXR1cm4gZVswXT10WzBdK25bMF0qcixlWzFdPXRbMV0rblsxXSpyLGV9LG8uZGlzdGFuY2U9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLWVbMF0scj10WzFdLWVbMV07cmV0dXJuIE1hdGguc3FydChuKm4rcipyKX0sby5kaXN0PW8uZGlzdGFuY2Usby5zcXVhcmVkRGlzdGFuY2U9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLWVbMF0scj10WzFdLWVbMV07cmV0dXJuIG4qbityKnJ9LG8uc3FyRGlzdD1vLnNxdWFyZWREaXN0YW5jZSxvLmxlbmd0aD1mdW5jdGlvbihlKXt2YXIgdD1lWzBdLG49ZVsxXTtyZXR1cm4gTWF0aC5zcXJ0KHQqdCtuKm4pfSxvLmxlbj1vLmxlbmd0aCxvLnNxdWFyZWRMZW5ndGg9ZnVuY3Rpb24oZSl7dmFyIHQ9ZVswXSxuPWVbMV07cmV0dXJuIHQqdCtuKm59LG8uc3FyTGVuPW8uc3F1YXJlZExlbmd0aCxvLm5lZ2F0ZT1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdPS10WzBdLGVbMV09LXRbMV0sZX0sby5ub3JtYWxpemU9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLHI9dFsxXSxpPW4qbityKnI7cmV0dXJuIGk+MCYmKGk9MS9NYXRoLnNxcnQoaSksZVswXT10WzBdKmksZVsxXT10WzFdKmkpLGV9LG8uZG90PWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF0qdFswXStlWzFdKnRbMV19LG8uY3Jvc3M9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0qblsxXS10WzFdKm5bMF07cmV0dXJuIGVbMF09ZVsxXT0wLGVbMl09cixlfSxvLmxlcnA9ZnVuY3Rpb24oZSx0LG4scil7dmFyIGk9dFswXSxzPXRbMV07cmV0dXJuIGVbMF09aStyKihuWzBdLWkpLGVbMV09cytyKihuWzFdLXMpLGV9LG8ucmFuZG9tPWZ1bmN0aW9uKGUsdCl7dD10fHwxO3ZhciBuPXIoKSoyKk1hdGguUEk7cmV0dXJuIGVbMF09TWF0aC5jb3MobikqdCxlWzFdPU1hdGguc2luKG4pKnQsZX0sby50cmFuc2Zvcm1NYXQyPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXTtyZXR1cm4gZVswXT1uWzBdKnIrblsyXSppLGVbMV09blsxXSpyK25bM10qaSxlfSxvLnRyYW5zZm9ybU1hdDJkPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXTtyZXR1cm4gZVswXT1uWzBdKnIrblsyXSppK25bNF0sZVsxXT1uWzFdKnIrblszXSppK25bNV0sZX0sby50cmFuc2Zvcm1NYXQzPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXTtyZXR1cm4gZVswXT1uWzBdKnIrblszXSppK25bNl0sZVsxXT1uWzFdKnIrbls0XSppK25bN10sZX0sby50cmFuc2Zvcm1NYXQ0PWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXTtyZXR1cm4gZVswXT1uWzBdKnIrbls0XSppK25bMTJdLGVbMV09blsxXSpyK25bNV0qaStuWzEzXSxlfSxvLmZvckVhY2g9ZnVuY3Rpb24oKXt2YXIgZT1vLmNyZWF0ZSgpO3JldHVybiBmdW5jdGlvbih0LG4scixpLHMsbyl7dmFyIHUsYTtufHwobj0yKSxyfHwocj0wKSxpP2E9TWF0aC5taW4oaSpuK3IsdC5sZW5ndGgpOmE9dC5sZW5ndGg7Zm9yKHU9cjt1PGE7dSs9billWzBdPXRbdV0sZVsxXT10W3UrMV0scyhlLGUsbyksdFt1XT1lWzBdLHRbdSsxXT1lWzFdO3JldHVybiB0fX0oKSxvLnN0cj1mdW5jdGlvbihlKXtyZXR1cm5cInZlYzIoXCIrZVswXStcIiwgXCIrZVsxXStcIilcIn0sdHlwZW9mIGUhPVwidW5kZWZpbmVkXCImJihlLnZlYzI9byk7dmFyIHU9e307dS5jcmVhdGU9ZnVuY3Rpb24oKXt2YXIgZT1uZXcgbigzKTtyZXR1cm4gZVswXT0wLGVbMV09MCxlWzJdPTAsZX0sdS5jbG9uZT1mdW5jdGlvbihlKXt2YXIgdD1uZXcgbigzKTtyZXR1cm4gdFswXT1lWzBdLHRbMV09ZVsxXSx0WzJdPWVbMl0sdH0sdS5mcm9tVmFsdWVzPWZ1bmN0aW9uKGUsdCxyKXt2YXIgaT1uZXcgbigzKTtyZXR1cm4gaVswXT1lLGlbMV09dCxpWzJdPXIsaX0sdS5jb3B5PWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF09dFswXSxlWzFdPXRbMV0sZVsyXT10WzJdLGV9LHUuc2V0PWZ1bmN0aW9uKGUsdCxuLHIpe3JldHVybiBlWzBdPXQsZVsxXT1uLGVbMl09cixlfSx1LmFkZD1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXStuWzBdLGVbMV09dFsxXStuWzFdLGVbMl09dFsyXStuWzJdLGV9LHUuc3VidHJhY3Q9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0tblswXSxlWzFdPXRbMV0tblsxXSxlWzJdPXRbMl0tblsyXSxlfSx1LnN1Yj11LnN1YnRyYWN0LHUubXVsdGlwbHk9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0qblswXSxlWzFdPXRbMV0qblsxXSxlWzJdPXRbMl0qblsyXSxlfSx1Lm11bD11Lm11bHRpcGx5LHUuZGl2aWRlPWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT10WzBdL25bMF0sZVsxXT10WzFdL25bMV0sZVsyXT10WzJdL25bMl0sZX0sdS5kaXY9dS5kaXZpZGUsdS5taW49ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPU1hdGgubWluKHRbMF0sblswXSksZVsxXT1NYXRoLm1pbih0WzFdLG5bMV0pLGVbMl09TWF0aC5taW4odFsyXSxuWzJdKSxlfSx1Lm1heD1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09TWF0aC5tYXgodFswXSxuWzBdKSxlWzFdPU1hdGgubWF4KHRbMV0sblsxXSksZVsyXT1NYXRoLm1heCh0WzJdLG5bMl0pLGV9LHUuc2NhbGU9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0qbixlWzFdPXRbMV0qbixlWzJdPXRbMl0qbixlfSx1LnNjYWxlQW5kQWRkPWZ1bmN0aW9uKGUsdCxuLHIpe3JldHVybiBlWzBdPXRbMF0rblswXSpyLGVbMV09dFsxXStuWzFdKnIsZVsyXT10WzJdK25bMl0qcixlfSx1LmRpc3RhbmNlPWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXS1lWzBdLHI9dFsxXS1lWzFdLGk9dFsyXS1lWzJdO3JldHVybiBNYXRoLnNxcnQobipuK3IqcitpKmkpfSx1LmRpc3Q9dS5kaXN0YW5jZSx1LnNxdWFyZWREaXN0YW5jZT1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0tZVswXSxyPXRbMV0tZVsxXSxpPXRbMl0tZVsyXTtyZXR1cm4gbipuK3IqcitpKml9LHUuc3FyRGlzdD11LnNxdWFyZWREaXN0YW5jZSx1Lmxlbmd0aD1mdW5jdGlvbihlKXt2YXIgdD1lWzBdLG49ZVsxXSxyPWVbMl07cmV0dXJuIE1hdGguc3FydCh0KnQrbipuK3Iqcil9LHUubGVuPXUubGVuZ3RoLHUuc3F1YXJlZExlbmd0aD1mdW5jdGlvbihlKXt2YXIgdD1lWzBdLG49ZVsxXSxyPWVbMl07cmV0dXJuIHQqdCtuKm4rcipyfSx1LnNxckxlbj11LnNxdWFyZWRMZW5ndGgsdS5uZWdhdGU9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gZVswXT0tdFswXSxlWzFdPS10WzFdLGVbMl09LXRbMl0sZX0sdS5ub3JtYWxpemU9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLHI9dFsxXSxpPXRbMl0scz1uKm4rcipyK2kqaTtyZXR1cm4gcz4wJiYocz0xL01hdGguc3FydChzKSxlWzBdPXRbMF0qcyxlWzFdPXRbMV0qcyxlWzJdPXRbMl0qcyksZX0sdS5kb3Q9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gZVswXSp0WzBdK2VbMV0qdFsxXStlWzJdKnRbMl19LHUuY3Jvc3M9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPW5bMF0sdT1uWzFdLGE9blsyXTtyZXR1cm4gZVswXT1pKmEtcyp1LGVbMV09cypvLXIqYSxlWzJdPXIqdS1pKm8sZX0sdS5sZXJwPWZ1bmN0aW9uKGUsdCxuLHIpe3ZhciBpPXRbMF0scz10WzFdLG89dFsyXTtyZXR1cm4gZVswXT1pK3IqKG5bMF0taSksZVsxXT1zK3IqKG5bMV0tcyksZVsyXT1vK3IqKG5bMl0tbyksZX0sdS5yYW5kb209ZnVuY3Rpb24oZSx0KXt0PXR8fDE7dmFyIG49cigpKjIqTWF0aC5QSSxpPXIoKSoyLTEscz1NYXRoLnNxcnQoMS1pKmkpKnQ7cmV0dXJuIGVbMF09TWF0aC5jb3MobikqcyxlWzFdPU1hdGguc2luKG4pKnMsZVsyXT1pKnQsZX0sdS50cmFuc2Zvcm1NYXQ0PWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl07cmV0dXJuIGVbMF09blswXSpyK25bNF0qaStuWzhdKnMrblsxMl0sZVsxXT1uWzFdKnIrbls1XSppK25bOV0qcytuWzEzXSxlWzJdPW5bMl0qcituWzZdKmkrblsxMF0qcytuWzE0XSxlfSx1LnRyYW5zZm9ybU1hdDM9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXTtyZXR1cm4gZVswXT1yKm5bMF0raSpuWzNdK3Mqbls2XSxlWzFdPXIqblsxXStpKm5bNF0rcypuWzddLGVbMl09cipuWzJdK2kqbls1XStzKm5bOF0sZX0sdS50cmFuc2Zvcm1RdWF0PWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz1uWzBdLHU9blsxXSxhPW5bMl0sZj1uWzNdLGw9ZipyK3Uqcy1hKmksYz1mKmkrYSpyLW8qcyxoPWYqcytvKmktdSpyLHA9LW8qci11KmktYSpzO3JldHVybiBlWzBdPWwqZitwKi1vK2MqLWEtaCotdSxlWzFdPWMqZitwKi11K2gqLW8tbCotYSxlWzJdPWgqZitwKi1hK2wqLXUtYyotbyxlfSx1LnJvdGF0ZVg9ZnVuY3Rpb24oZSx0LG4scil7dmFyIGk9W10scz1bXTtyZXR1cm4gaVswXT10WzBdLW5bMF0saVsxXT10WzFdLW5bMV0saVsyXT10WzJdLW5bMl0sc1swXT1pWzBdLHNbMV09aVsxXSpNYXRoLmNvcyhyKS1pWzJdKk1hdGguc2luKHIpLHNbMl09aVsxXSpNYXRoLnNpbihyKStpWzJdKk1hdGguY29zKHIpLGVbMF09c1swXStuWzBdLGVbMV09c1sxXStuWzFdLGVbMl09c1syXStuWzJdLGV9LHUucm90YXRlWT1mdW5jdGlvbihlLHQsbixyKXt2YXIgaT1bXSxzPVtdO3JldHVybiBpWzBdPXRbMF0tblswXSxpWzFdPXRbMV0tblsxXSxpWzJdPXRbMl0tblsyXSxzWzBdPWlbMl0qTWF0aC5zaW4ocikraVswXSpNYXRoLmNvcyhyKSxzWzFdPWlbMV0sc1syXT1pWzJdKk1hdGguY29zKHIpLWlbMF0qTWF0aC5zaW4ociksZVswXT1zWzBdK25bMF0sZVsxXT1zWzFdK25bMV0sZVsyXT1zWzJdK25bMl0sZX0sdS5yb3RhdGVaPWZ1bmN0aW9uKGUsdCxuLHIpe3ZhciBpPVtdLHM9W107cmV0dXJuIGlbMF09dFswXS1uWzBdLGlbMV09dFsxXS1uWzFdLGlbMl09dFsyXS1uWzJdLHNbMF09aVswXSpNYXRoLmNvcyhyKS1pWzFdKk1hdGguc2luKHIpLHNbMV09aVswXSpNYXRoLnNpbihyKStpWzFdKk1hdGguY29zKHIpLHNbMl09aVsyXSxlWzBdPXNbMF0rblswXSxlWzFdPXNbMV0rblsxXSxlWzJdPXNbMl0rblsyXSxlfSx1LmZvckVhY2g9ZnVuY3Rpb24oKXt2YXIgZT11LmNyZWF0ZSgpO3JldHVybiBmdW5jdGlvbih0LG4scixpLHMsbyl7dmFyIHUsYTtufHwobj0zKSxyfHwocj0wKSxpP2E9TWF0aC5taW4oaSpuK3IsdC5sZW5ndGgpOmE9dC5sZW5ndGg7Zm9yKHU9cjt1PGE7dSs9billWzBdPXRbdV0sZVsxXT10W3UrMV0sZVsyXT10W3UrMl0scyhlLGUsbyksdFt1XT1lWzBdLHRbdSsxXT1lWzFdLHRbdSsyXT1lWzJdO3JldHVybiB0fX0oKSx1LnN0cj1mdW5jdGlvbihlKXtyZXR1cm5cInZlYzMoXCIrZVswXStcIiwgXCIrZVsxXStcIiwgXCIrZVsyXStcIilcIn0sdHlwZW9mIGUhPVwidW5kZWZpbmVkXCImJihlLnZlYzM9dSk7dmFyIGE9e307YS5jcmVhdGU9ZnVuY3Rpb24oKXt2YXIgZT1uZXcgbig0KTtyZXR1cm4gZVswXT0wLGVbMV09MCxlWzJdPTAsZVszXT0wLGV9LGEuY2xvbmU9ZnVuY3Rpb24oZSl7dmFyIHQ9bmV3IG4oNCk7cmV0dXJuIHRbMF09ZVswXSx0WzFdPWVbMV0sdFsyXT1lWzJdLHRbM109ZVszXSx0fSxhLmZyb21WYWx1ZXM9ZnVuY3Rpb24oZSx0LHIsaSl7dmFyIHM9bmV3IG4oNCk7cmV0dXJuIHNbMF09ZSxzWzFdPXQsc1syXT1yLHNbM109aSxzfSxhLmNvcHk9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gZVswXT10WzBdLGVbMV09dFsxXSxlWzJdPXRbMl0sZVszXT10WzNdLGV9LGEuc2V0PWZ1bmN0aW9uKGUsdCxuLHIsaSl7cmV0dXJuIGVbMF09dCxlWzFdPW4sZVsyXT1yLGVbM109aSxlfSxhLmFkZD1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXStuWzBdLGVbMV09dFsxXStuWzFdLGVbMl09dFsyXStuWzJdLGVbM109dFszXStuWzNdLGV9LGEuc3VidHJhY3Q9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0tblswXSxlWzFdPXRbMV0tblsxXSxlWzJdPXRbMl0tblsyXSxlWzNdPXRbM10tblszXSxlfSxhLnN1Yj1hLnN1YnRyYWN0LGEubXVsdGlwbHk9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPXRbMF0qblswXSxlWzFdPXRbMV0qblsxXSxlWzJdPXRbMl0qblsyXSxlWzNdPXRbM10qblszXSxlfSxhLm11bD1hLm11bHRpcGx5LGEuZGl2aWRlPWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gZVswXT10WzBdL25bMF0sZVsxXT10WzFdL25bMV0sZVsyXT10WzJdL25bMl0sZVszXT10WzNdL25bM10sZX0sYS5kaXY9YS5kaXZpZGUsYS5taW49ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPU1hdGgubWluKHRbMF0sblswXSksZVsxXT1NYXRoLm1pbih0WzFdLG5bMV0pLGVbMl09TWF0aC5taW4odFsyXSxuWzJdKSxlWzNdPU1hdGgubWluKHRbM10sblszXSksZX0sYS5tYXg9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlWzBdPU1hdGgubWF4KHRbMF0sblswXSksZVsxXT1NYXRoLm1heCh0WzFdLG5bMV0pLGVbMl09TWF0aC5tYXgodFsyXSxuWzJdKSxlWzNdPU1hdGgubWF4KHRbM10sblszXSksZX0sYS5zY2FsZT1mdW5jdGlvbihlLHQsbil7cmV0dXJuIGVbMF09dFswXSpuLGVbMV09dFsxXSpuLGVbMl09dFsyXSpuLGVbM109dFszXSpuLGV9LGEuc2NhbGVBbmRBZGQ9ZnVuY3Rpb24oZSx0LG4scil7cmV0dXJuIGVbMF09dFswXStuWzBdKnIsZVsxXT10WzFdK25bMV0qcixlWzJdPXRbMl0rblsyXSpyLGVbM109dFszXStuWzNdKnIsZX0sYS5kaXN0YW5jZT1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0tZVswXSxyPXRbMV0tZVsxXSxpPXRbMl0tZVsyXSxzPXRbM10tZVszXTtyZXR1cm4gTWF0aC5zcXJ0KG4qbityKnIraSppK3Mqcyl9LGEuZGlzdD1hLmRpc3RhbmNlLGEuc3F1YXJlZERpc3RhbmNlPWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXS1lWzBdLHI9dFsxXS1lWzFdLGk9dFsyXS1lWzJdLHM9dFszXS1lWzNdO3JldHVybiBuKm4rcipyK2kqaStzKnN9LGEuc3FyRGlzdD1hLnNxdWFyZWREaXN0YW5jZSxhLmxlbmd0aD1mdW5jdGlvbihlKXt2YXIgdD1lWzBdLG49ZVsxXSxyPWVbMl0saT1lWzNdO3JldHVybiBNYXRoLnNxcnQodCp0K24qbityKnIraSppKX0sYS5sZW49YS5sZW5ndGgsYS5zcXVhcmVkTGVuZ3RoPWZ1bmN0aW9uKGUpe3ZhciB0PWVbMF0sbj1lWzFdLHI9ZVsyXSxpPWVbM107cmV0dXJuIHQqdCtuKm4rcipyK2kqaX0sYS5zcXJMZW49YS5zcXVhcmVkTGVuZ3RoLGEubmVnYXRlPWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF09LXRbMF0sZVsxXT0tdFsxXSxlWzJdPS10WzJdLGVbM109LXRbM10sZX0sYS5ub3JtYWxpemU9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLHI9dFsxXSxpPXRbMl0scz10WzNdLG89bipuK3IqcitpKmkrcypzO3JldHVybiBvPjAmJihvPTEvTWF0aC5zcXJ0KG8pLGVbMF09dFswXSpvLGVbMV09dFsxXSpvLGVbMl09dFsyXSpvLGVbM109dFszXSpvKSxlfSxhLmRvdD1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdKnRbMF0rZVsxXSp0WzFdK2VbMl0qdFsyXStlWzNdKnRbM119LGEubGVycD1mdW5jdGlvbihlLHQsbixyKXt2YXIgaT10WzBdLHM9dFsxXSxvPXRbMl0sdT10WzNdO3JldHVybiBlWzBdPWkrciooblswXS1pKSxlWzFdPXMrciooblsxXS1zKSxlWzJdPW8rciooblsyXS1vKSxlWzNdPXUrciooblszXS11KSxlfSxhLnJhbmRvbT1mdW5jdGlvbihlLHQpe3JldHVybiB0PXR8fDEsZVswXT1yKCksZVsxXT1yKCksZVsyXT1yKCksZVszXT1yKCksYS5ub3JtYWxpemUoZSxlKSxhLnNjYWxlKGUsZSx0KSxlfSxhLnRyYW5zZm9ybU1hdDQ9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM107cmV0dXJuIGVbMF09blswXSpyK25bNF0qaStuWzhdKnMrblsxMl0qbyxlWzFdPW5bMV0qcituWzVdKmkrbls5XSpzK25bMTNdKm8sZVsyXT1uWzJdKnIrbls2XSppK25bMTBdKnMrblsxNF0qbyxlWzNdPW5bM10qcituWzddKmkrblsxMV0qcytuWzE1XSpvLGV9LGEudHJhbnNmb3JtUXVhdD1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89blswXSx1PW5bMV0sYT1uWzJdLGY9blszXSxsPWYqcit1KnMtYSppLGM9ZippK2Eqci1vKnMsaD1mKnMrbyppLXUqcixwPS1vKnItdSppLWEqcztyZXR1cm4gZVswXT1sKmYrcCotbytjKi1hLWgqLXUsZVsxXT1jKmYrcCotdStoKi1vLWwqLWEsZVsyXT1oKmYrcCotYStsKi11LWMqLW8sZX0sYS5mb3JFYWNoPWZ1bmN0aW9uKCl7dmFyIGU9YS5jcmVhdGUoKTtyZXR1cm4gZnVuY3Rpb24odCxuLHIsaSxzLG8pe3ZhciB1LGE7bnx8KG49NCkscnx8KHI9MCksaT9hPU1hdGgubWluKGkqbityLHQubGVuZ3RoKTphPXQubGVuZ3RoO2Zvcih1PXI7dTxhO3UrPW4pZVswXT10W3VdLGVbMV09dFt1KzFdLGVbMl09dFt1KzJdLGVbM109dFt1KzNdLHMoZSxlLG8pLHRbdV09ZVswXSx0W3UrMV09ZVsxXSx0W3UrMl09ZVsyXSx0W3UrM109ZVszXTtyZXR1cm4gdH19KCksYS5zdHI9ZnVuY3Rpb24oZSl7cmV0dXJuXCJ2ZWM0KFwiK2VbMF0rXCIsIFwiK2VbMV0rXCIsIFwiK2VbMl0rXCIsIFwiK2VbM10rXCIpXCJ9LHR5cGVvZiBlIT1cInVuZGVmaW5lZFwiJiYoZS52ZWM0PWEpO3ZhciBmPXt9O2YuY3JlYXRlPWZ1bmN0aW9uKCl7dmFyIGU9bmV3IG4oNCk7cmV0dXJuIGVbMF09MSxlWzFdPTAsZVsyXT0wLGVbM109MSxlfSxmLmNsb25lPWZ1bmN0aW9uKGUpe3ZhciB0PW5ldyBuKDQpO3JldHVybiB0WzBdPWVbMF0sdFsxXT1lWzFdLHRbMl09ZVsyXSx0WzNdPWVbM10sdH0sZi5jb3B5PWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGVbMF09dFswXSxlWzFdPXRbMV0sZVsyXT10WzJdLGVbM109dFszXSxlfSxmLmlkZW50aXR5PWZ1bmN0aW9uKGUpe3JldHVybiBlWzBdPTEsZVsxXT0wLGVbMl09MCxlWzNdPTEsZX0sZi50cmFuc3Bvc2U9ZnVuY3Rpb24oZSx0KXtpZihlPT09dCl7dmFyIG49dFsxXTtlWzFdPXRbMl0sZVsyXT1ufWVsc2UgZVswXT10WzBdLGVbMV09dFsyXSxlWzJdPXRbMV0sZVszXT10WzNdO3JldHVybiBlfSxmLmludmVydD1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9dFsyXSxzPXRbM10sbz1uKnMtaSpyO3JldHVybiBvPyhvPTEvbyxlWzBdPXMqbyxlWzFdPS1yKm8sZVsyXT0taSpvLGVbM109bipvLGUpOm51bGx9LGYuYWRqb2ludD1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF07cmV0dXJuIGVbMF09dFszXSxlWzFdPS10WzFdLGVbMl09LXRbMl0sZVszXT1uLGV9LGYuZGV0ZXJtaW5hbnQ9ZnVuY3Rpb24oZSl7cmV0dXJuIGVbMF0qZVszXS1lWzJdKmVbMV19LGYubXVsdGlwbHk9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT1uWzBdLGE9blsxXSxmPW5bMl0sbD1uWzNdO3JldHVybiBlWzBdPXIqdStzKmEsZVsxXT1pKnUrbyphLGVbMl09cipmK3MqbCxlWzNdPWkqZitvKmwsZX0sZi5tdWw9Zi5tdWx0aXBseSxmLnJvdGF0ZT1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PU1hdGguc2luKG4pLGE9TWF0aC5jb3Mobik7cmV0dXJuIGVbMF09ciphK3MqdSxlWzFdPWkqYStvKnUsZVsyXT1yKi11K3MqYSxlWzNdPWkqLXUrbyphLGV9LGYuc2NhbGU9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT1uWzBdLGE9blsxXTtyZXR1cm4gZVswXT1yKnUsZVsxXT1pKnUsZVsyXT1zKmEsZVszXT1vKmEsZX0sZi5zdHI9ZnVuY3Rpb24oZSl7cmV0dXJuXCJtYXQyKFwiK2VbMF0rXCIsIFwiK2VbMV0rXCIsIFwiK2VbMl0rXCIsIFwiK2VbM10rXCIpXCJ9LGYuZnJvYj1mdW5jdGlvbihlKXtyZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KGVbMF0sMikrTWF0aC5wb3coZVsxXSwyKStNYXRoLnBvdyhlWzJdLDIpK01hdGgucG93KGVbM10sMikpfSxmLkxEVT1mdW5jdGlvbihlLHQsbixyKXtyZXR1cm4gZVsyXT1yWzJdL3JbMF0sblswXT1yWzBdLG5bMV09clsxXSxuWzNdPXJbM10tZVsyXSpuWzFdLFtlLHQsbl19LHR5cGVvZiBlIT1cInVuZGVmaW5lZFwiJiYoZS5tYXQyPWYpO3ZhciBsPXt9O2wuY3JlYXRlPWZ1bmN0aW9uKCl7dmFyIGU9bmV3IG4oNik7cmV0dXJuIGVbMF09MSxlWzFdPTAsZVsyXT0wLGVbM109MSxlWzRdPTAsZVs1XT0wLGV9LGwuY2xvbmU9ZnVuY3Rpb24oZSl7dmFyIHQ9bmV3IG4oNik7cmV0dXJuIHRbMF09ZVswXSx0WzFdPWVbMV0sdFsyXT1lWzJdLHRbM109ZVszXSx0WzRdPWVbNF0sdFs1XT1lWzVdLHR9LGwuY29weT1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdPXRbMF0sZVsxXT10WzFdLGVbMl09dFsyXSxlWzNdPXRbM10sZVs0XT10WzRdLGVbNV09dFs1XSxlfSxsLmlkZW50aXR5PWZ1bmN0aW9uKGUpe3JldHVybiBlWzBdPTEsZVsxXT0wLGVbMl09MCxlWzNdPTEsZVs0XT0wLGVbNV09MCxlfSxsLmludmVydD1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9dFsyXSxzPXRbM10sbz10WzRdLHU9dFs1XSxhPW4qcy1yKmk7cmV0dXJuIGE/KGE9MS9hLGVbMF09cyphLGVbMV09LXIqYSxlWzJdPS1pKmEsZVszXT1uKmEsZVs0XT0oaSp1LXMqbykqYSxlWzVdPShyKm8tbip1KSphLGUpOm51bGx9LGwuZGV0ZXJtaW5hbnQ9ZnVuY3Rpb24oZSl7cmV0dXJuIGVbMF0qZVszXS1lWzFdKmVbMl19LGwubXVsdGlwbHk9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT10WzRdLGE9dFs1XSxmPW5bMF0sbD1uWzFdLGM9blsyXSxoPW5bM10scD1uWzRdLGQ9bls1XTtyZXR1cm4gZVswXT1yKmYrcypsLGVbMV09aSpmK28qbCxlWzJdPXIqYytzKmgsZVszXT1pKmMrbypoLGVbNF09cipwK3MqZCt1LGVbNV09aSpwK28qZCthLGV9LGwubXVsPWwubXVsdGlwbHksbC5yb3RhdGU9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT10WzRdLGE9dFs1XSxmPU1hdGguc2luKG4pLGw9TWF0aC5jb3Mobik7cmV0dXJuIGVbMF09cipsK3MqZixlWzFdPWkqbCtvKmYsZVsyXT1yKi1mK3MqbCxlWzNdPWkqLWYrbypsLGVbNF09dSxlWzVdPWEsZX0sbC5zY2FsZT1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PXRbNF0sYT10WzVdLGY9blswXSxsPW5bMV07cmV0dXJuIGVbMF09cipmLGVbMV09aSpmLGVbMl09cypsLGVbM109bypsLGVbNF09dSxlWzVdPWEsZX0sbC50cmFuc2xhdGU9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT10WzRdLGE9dFs1XSxmPW5bMF0sbD1uWzFdO3JldHVybiBlWzBdPXIsZVsxXT1pLGVbMl09cyxlWzNdPW8sZVs0XT1yKmYrcypsK3UsZVs1XT1pKmYrbypsK2EsZX0sbC5zdHI9ZnVuY3Rpb24oZSl7cmV0dXJuXCJtYXQyZChcIitlWzBdK1wiLCBcIitlWzFdK1wiLCBcIitlWzJdK1wiLCBcIitlWzNdK1wiLCBcIitlWzRdK1wiLCBcIitlWzVdK1wiKVwifSxsLmZyb2I9ZnVuY3Rpb24oZSl7cmV0dXJuIE1hdGguc3FydChNYXRoLnBvdyhlWzBdLDIpK01hdGgucG93KGVbMV0sMikrTWF0aC5wb3coZVsyXSwyKStNYXRoLnBvdyhlWzNdLDIpK01hdGgucG93KGVbNF0sMikrTWF0aC5wb3coZVs1XSwyKSsxKX0sdHlwZW9mIGUhPVwidW5kZWZpbmVkXCImJihlLm1hdDJkPWwpO3ZhciBjPXt9O2MuY3JlYXRlPWZ1bmN0aW9uKCl7dmFyIGU9bmV3IG4oOSk7cmV0dXJuIGVbMF09MSxlWzFdPTAsZVsyXT0wLGVbM109MCxlWzRdPTEsZVs1XT0wLGVbNl09MCxlWzddPTAsZVs4XT0xLGV9LGMuZnJvbU1hdDQ9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gZVswXT10WzBdLGVbMV09dFsxXSxlWzJdPXRbMl0sZVszXT10WzRdLGVbNF09dFs1XSxlWzVdPXRbNl0sZVs2XT10WzhdLGVbN109dFs5XSxlWzhdPXRbMTBdLGV9LGMuY2xvbmU9ZnVuY3Rpb24oZSl7dmFyIHQ9bmV3IG4oOSk7cmV0dXJuIHRbMF09ZVswXSx0WzFdPWVbMV0sdFsyXT1lWzJdLHRbM109ZVszXSx0WzRdPWVbNF0sdFs1XT1lWzVdLHRbNl09ZVs2XSx0WzddPWVbN10sdFs4XT1lWzhdLHR9LGMuY29weT1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdPXRbMF0sZVsxXT10WzFdLGVbMl09dFsyXSxlWzNdPXRbM10sZVs0XT10WzRdLGVbNV09dFs1XSxlWzZdPXRbNl0sZVs3XT10WzddLGVbOF09dFs4XSxlfSxjLmlkZW50aXR5PWZ1bmN0aW9uKGUpe3JldHVybiBlWzBdPTEsZVsxXT0wLGVbMl09MCxlWzNdPTAsZVs0XT0xLGVbNV09MCxlWzZdPTAsZVs3XT0wLGVbOF09MSxlfSxjLnRyYW5zcG9zZT1mdW5jdGlvbihlLHQpe2lmKGU9PT10KXt2YXIgbj10WzFdLHI9dFsyXSxpPXRbNV07ZVsxXT10WzNdLGVbMl09dFs2XSxlWzNdPW4sZVs1XT10WzddLGVbNl09cixlWzddPWl9ZWxzZSBlWzBdPXRbMF0sZVsxXT10WzNdLGVbMl09dFs2XSxlWzNdPXRbMV0sZVs0XT10WzRdLGVbNV09dFs3XSxlWzZdPXRbMl0sZVs3XT10WzVdLGVbOF09dFs4XTtyZXR1cm4gZX0sYy5pbnZlcnQ9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLHI9dFsxXSxpPXRbMl0scz10WzNdLG89dFs0XSx1PXRbNV0sYT10WzZdLGY9dFs3XSxsPXRbOF0sYz1sKm8tdSpmLGg9LWwqcyt1KmEscD1mKnMtbyphLGQ9bipjK3IqaCtpKnA7cmV0dXJuIGQ/KGQ9MS9kLGVbMF09YypkLGVbMV09KC1sKnIraSpmKSpkLGVbMl09KHUqci1pKm8pKmQsZVszXT1oKmQsZVs0XT0obCpuLWkqYSkqZCxlWzVdPSgtdSpuK2kqcykqZCxlWzZdPXAqZCxlWzddPSgtZipuK3IqYSkqZCxlWzhdPShvKm4tcipzKSpkLGUpOm51bGx9LGMuYWRqb2ludD1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9dFsyXSxzPXRbM10sbz10WzRdLHU9dFs1XSxhPXRbNl0sZj10WzddLGw9dFs4XTtyZXR1cm4gZVswXT1vKmwtdSpmLGVbMV09aSpmLXIqbCxlWzJdPXIqdS1pKm8sZVszXT11KmEtcypsLGVbNF09bipsLWkqYSxlWzVdPWkqcy1uKnUsZVs2XT1zKmYtbyphLGVbN109ciphLW4qZixlWzhdPW4qby1yKnMsZX0sYy5kZXRlcm1pbmFudD1mdW5jdGlvbihlKXt2YXIgdD1lWzBdLG49ZVsxXSxyPWVbMl0saT1lWzNdLHM9ZVs0XSxvPWVbNV0sdT1lWzZdLGE9ZVs3XSxmPWVbOF07cmV0dXJuIHQqKGYqcy1vKmEpK24qKC1mKmkrbyp1KStyKihhKmktcyp1KX0sYy5tdWx0aXBseT1mdW5jdGlvbihlLHQsbil7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PXRbNF0sYT10WzVdLGY9dFs2XSxsPXRbN10sYz10WzhdLGg9blswXSxwPW5bMV0sZD1uWzJdLHY9blszXSxtPW5bNF0sZz1uWzVdLHk9bls2XSxiPW5bN10sdz1uWzhdO3JldHVybiBlWzBdPWgqcitwKm8rZCpmLGVbMV09aCppK3AqdStkKmwsZVsyXT1oKnMrcCphK2QqYyxlWzNdPXYqcittKm8rZypmLGVbNF09dippK20qdStnKmwsZVs1XT12KnMrbSphK2cqYyxlWzZdPXkqcitiKm8rdypmLGVbN109eSppK2IqdSt3KmwsZVs4XT15KnMrYiphK3cqYyxlfSxjLm11bD1jLm11bHRpcGx5LGMudHJhbnNsYXRlPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz10WzNdLHU9dFs0XSxhPXRbNV0sZj10WzZdLGw9dFs3XSxjPXRbOF0saD1uWzBdLHA9blsxXTtyZXR1cm4gZVswXT1yLGVbMV09aSxlWzJdPXMsZVszXT1vLGVbNF09dSxlWzVdPWEsZVs2XT1oKnIrcCpvK2YsZVs3XT1oKmkrcCp1K2wsZVs4XT1oKnMrcCphK2MsZX0sYy5yb3RhdGU9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT10WzRdLGE9dFs1XSxmPXRbNl0sbD10WzddLGM9dFs4XSxoPU1hdGguc2luKG4pLHA9TWF0aC5jb3Mobik7cmV0dXJuIGVbMF09cCpyK2gqbyxlWzFdPXAqaStoKnUsZVsyXT1wKnMraCphLGVbM109cCpvLWgqcixlWzRdPXAqdS1oKmksZVs1XT1wKmEtaCpzLGVbNl09ZixlWzddPWwsZVs4XT1jLGV9LGMuc2NhbGU9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPW5bMF0saT1uWzFdO3JldHVybiBlWzBdPXIqdFswXSxlWzFdPXIqdFsxXSxlWzJdPXIqdFsyXSxlWzNdPWkqdFszXSxlWzRdPWkqdFs0XSxlWzVdPWkqdFs1XSxlWzZdPXRbNl0sZVs3XT10WzddLGVbOF09dFs4XSxlfSxjLmZyb21NYXQyZD1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdPXRbMF0sZVsxXT10WzFdLGVbMl09MCxlWzNdPXRbMl0sZVs0XT10WzNdLGVbNV09MCxlWzZdPXRbNF0sZVs3XT10WzVdLGVbOF09MSxlfSxjLmZyb21RdWF0PWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSxyPXRbMV0saT10WzJdLHM9dFszXSxvPW4rbix1PXIrcixhPWkraSxmPW4qbyxsPXIqbyxjPXIqdSxoPWkqbyxwPWkqdSxkPWkqYSx2PXMqbyxtPXMqdSxnPXMqYTtyZXR1cm4gZVswXT0xLWMtZCxlWzNdPWwtZyxlWzZdPWgrbSxlWzFdPWwrZyxlWzRdPTEtZi1kLGVbN109cC12LGVbMl09aC1tLGVbNV09cCt2LGVbOF09MS1mLWMsZX0sYy5ub3JtYWxGcm9tTWF0ND1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9dFsyXSxzPXRbM10sbz10WzRdLHU9dFs1XSxhPXRbNl0sZj10WzddLGw9dFs4XSxjPXRbOV0saD10WzEwXSxwPXRbMTFdLGQ9dFsxMl0sdj10WzEzXSxtPXRbMTRdLGc9dFsxNV0seT1uKnUtcipvLGI9biphLWkqbyx3PW4qZi1zKm8sRT1yKmEtaSp1LFM9cipmLXMqdSx4PWkqZi1zKmEsVD1sKnYtYypkLE49bCptLWgqZCxDPWwqZy1wKmQsaz1jKm0taCp2LEw9YypnLXAqdixBPWgqZy1wKm0sTz15KkEtYipMK3cqaytFKkMtUypOK3gqVDtyZXR1cm4gTz8oTz0xL08sZVswXT0odSpBLWEqTCtmKmspKk8sZVsxXT0oYSpDLW8qQS1mKk4pKk8sZVsyXT0obypMLXUqQytmKlQpKk8sZVszXT0oaSpMLXIqQS1zKmspKk8sZVs0XT0obipBLWkqQytzKk4pKk8sZVs1XT0ocipDLW4qTC1zKlQpKk8sZVs2XT0odip4LW0qUytnKkUpKk8sZVs3XT0obSp3LWQqeC1nKmIpKk8sZVs4XT0oZCpTLXYqdytnKnkpKk8sZSk6bnVsbH0sYy5zdHI9ZnVuY3Rpb24oZSl7cmV0dXJuXCJtYXQzKFwiK2VbMF0rXCIsIFwiK2VbMV0rXCIsIFwiK2VbMl0rXCIsIFwiK2VbM10rXCIsIFwiK2VbNF0rXCIsIFwiK2VbNV0rXCIsIFwiK2VbNl0rXCIsIFwiK2VbN10rXCIsIFwiK2VbOF0rXCIpXCJ9LGMuZnJvYj1mdW5jdGlvbihlKXtyZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KGVbMF0sMikrTWF0aC5wb3coZVsxXSwyKStNYXRoLnBvdyhlWzJdLDIpK01hdGgucG93KGVbM10sMikrTWF0aC5wb3coZVs0XSwyKStNYXRoLnBvdyhlWzVdLDIpK01hdGgucG93KGVbNl0sMikrTWF0aC5wb3coZVs3XSwyKStNYXRoLnBvdyhlWzhdLDIpKX0sdHlwZW9mIGUhPVwidW5kZWZpbmVkXCImJihlLm1hdDM9Yyk7dmFyIGg9e307aC5jcmVhdGU9ZnVuY3Rpb24oKXt2YXIgZT1uZXcgbigxNik7cmV0dXJuIGVbMF09MSxlWzFdPTAsZVsyXT0wLGVbM109MCxlWzRdPTAsZVs1XT0xLGVbNl09MCxlWzddPTAsZVs4XT0wLGVbOV09MCxlWzEwXT0xLGVbMTFdPTAsZVsxMl09MCxlWzEzXT0wLGVbMTRdPTAsZVsxNV09MSxlfSxoLmNsb25lPWZ1bmN0aW9uKGUpe3ZhciB0PW5ldyBuKDE2KTtyZXR1cm4gdFswXT1lWzBdLHRbMV09ZVsxXSx0WzJdPWVbMl0sdFszXT1lWzNdLHRbNF09ZVs0XSx0WzVdPWVbNV0sdFs2XT1lWzZdLHRbN109ZVs3XSx0WzhdPWVbOF0sdFs5XT1lWzldLHRbMTBdPWVbMTBdLHRbMTFdPWVbMTFdLHRbMTJdPWVbMTJdLHRbMTNdPWVbMTNdLHRbMTRdPWVbMTRdLHRbMTVdPWVbMTVdLHR9LGguY29weT1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdPXRbMF0sZVsxXT10WzFdLGVbMl09dFsyXSxlWzNdPXRbM10sZVs0XT10WzRdLGVbNV09dFs1XSxlWzZdPXRbNl0sZVs3XT10WzddLGVbOF09dFs4XSxlWzldPXRbOV0sZVsxMF09dFsxMF0sZVsxMV09dFsxMV0sZVsxMl09dFsxMl0sZVsxM109dFsxM10sZVsxNF09dFsxNF0sZVsxNV09dFsxNV0sZX0saC5pZGVudGl0eT1mdW5jdGlvbihlKXtyZXR1cm4gZVswXT0xLGVbMV09MCxlWzJdPTAsZVszXT0wLGVbNF09MCxlWzVdPTEsZVs2XT0wLGVbN109MCxlWzhdPTAsZVs5XT0wLGVbMTBdPTEsZVsxMV09MCxlWzEyXT0wLGVbMTNdPTAsZVsxNF09MCxlWzE1XT0xLGV9LGgudHJhbnNwb3NlPWZ1bmN0aW9uKGUsdCl7aWYoZT09PXQpe3ZhciBuPXRbMV0scj10WzJdLGk9dFszXSxzPXRbNl0sbz10WzddLHU9dFsxMV07ZVsxXT10WzRdLGVbMl09dFs4XSxlWzNdPXRbMTJdLGVbNF09bixlWzZdPXRbOV0sZVs3XT10WzEzXSxlWzhdPXIsZVs5XT1zLGVbMTFdPXRbMTRdLGVbMTJdPWksZVsxM109byxlWzE0XT11fWVsc2UgZVswXT10WzBdLGVbMV09dFs0XSxlWzJdPXRbOF0sZVszXT10WzEyXSxlWzRdPXRbMV0sZVs1XT10WzVdLGVbNl09dFs5XSxlWzddPXRbMTNdLGVbOF09dFsyXSxlWzldPXRbNl0sZVsxMF09dFsxMF0sZVsxMV09dFsxNF0sZVsxMl09dFszXSxlWzEzXT10WzddLGVbMTRdPXRbMTFdLGVbMTVdPXRbMTVdO3JldHVybiBlfSxoLmludmVydD1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9dFsyXSxzPXRbM10sbz10WzRdLHU9dFs1XSxhPXRbNl0sZj10WzddLGw9dFs4XSxjPXRbOV0saD10WzEwXSxwPXRbMTFdLGQ9dFsxMl0sdj10WzEzXSxtPXRbMTRdLGc9dFsxNV0seT1uKnUtcipvLGI9biphLWkqbyx3PW4qZi1zKm8sRT1yKmEtaSp1LFM9cipmLXMqdSx4PWkqZi1zKmEsVD1sKnYtYypkLE49bCptLWgqZCxDPWwqZy1wKmQsaz1jKm0taCp2LEw9YypnLXAqdixBPWgqZy1wKm0sTz15KkEtYipMK3cqaytFKkMtUypOK3gqVDtyZXR1cm4gTz8oTz0xL08sZVswXT0odSpBLWEqTCtmKmspKk8sZVsxXT0oaSpMLXIqQS1zKmspKk8sZVsyXT0odip4LW0qUytnKkUpKk8sZVszXT0oaCpTLWMqeC1wKkUpKk8sZVs0XT0oYSpDLW8qQS1mKk4pKk8sZVs1XT0obipBLWkqQytzKk4pKk8sZVs2XT0obSp3LWQqeC1nKmIpKk8sZVs3XT0obCp4LWgqdytwKmIpKk8sZVs4XT0obypMLXUqQytmKlQpKk8sZVs5XT0ocipDLW4qTC1zKlQpKk8sZVsxMF09KGQqUy12KncrZyp5KSpPLGVbMTFdPShjKnctbCpTLXAqeSkqTyxlWzEyXT0odSpOLW8qay1hKlQpKk8sZVsxM109KG4qay1yKk4raSpUKSpPLGVbMTRdPSh2KmItZCpFLW0qeSkqTyxlWzE1XT0obCpFLWMqYitoKnkpKk8sZSk6bnVsbH0saC5hZGpvaW50PWZ1bmN0aW9uKGUsdCl7dmFyIG49dFswXSxyPXRbMV0saT10WzJdLHM9dFszXSxvPXRbNF0sdT10WzVdLGE9dFs2XSxmPXRbN10sbD10WzhdLGM9dFs5XSxoPXRbMTBdLHA9dFsxMV0sZD10WzEyXSx2PXRbMTNdLG09dFsxNF0sZz10WzE1XTtyZXR1cm4gZVswXT11KihoKmctcCptKS1jKihhKmctZiptKSt2KihhKnAtZipoKSxlWzFdPS0ociooaCpnLXAqbSktYyooaSpnLXMqbSkrdiooaSpwLXMqaCkpLGVbMl09ciooYSpnLWYqbSktdSooaSpnLXMqbSkrdiooaSpmLXMqYSksZVszXT0tKHIqKGEqcC1mKmgpLXUqKGkqcC1zKmgpK2MqKGkqZi1zKmEpKSxlWzRdPS0obyooaCpnLXAqbSktbCooYSpnLWYqbSkrZCooYSpwLWYqaCkpLGVbNV09biooaCpnLXAqbSktbCooaSpnLXMqbSkrZCooaSpwLXMqaCksZVs2XT0tKG4qKGEqZy1mKm0pLW8qKGkqZy1zKm0pK2QqKGkqZi1zKmEpKSxlWzddPW4qKGEqcC1mKmgpLW8qKGkqcC1zKmgpK2wqKGkqZi1zKmEpLGVbOF09byooYypnLXAqdiktbCoodSpnLWYqdikrZCoodSpwLWYqYyksZVs5XT0tKG4qKGMqZy1wKnYpLWwqKHIqZy1zKnYpK2QqKHIqcC1zKmMpKSxlWzEwXT1uKih1KmctZip2KS1vKihyKmctcyp2KStkKihyKmYtcyp1KSxlWzExXT0tKG4qKHUqcC1mKmMpLW8qKHIqcC1zKmMpK2wqKHIqZi1zKnUpKSxlWzEyXT0tKG8qKGMqbS1oKnYpLWwqKHUqbS1hKnYpK2QqKHUqaC1hKmMpKSxlWzEzXT1uKihjKm0taCp2KS1sKihyKm0taSp2KStkKihyKmgtaSpjKSxlWzE0XT0tKG4qKHUqbS1hKnYpLW8qKHIqbS1pKnYpK2QqKHIqYS1pKnUpKSxlWzE1XT1uKih1KmgtYSpjKS1vKihyKmgtaSpjKStsKihyKmEtaSp1KSxlfSxoLmRldGVybWluYW50PWZ1bmN0aW9uKGUpe3ZhciB0PWVbMF0sbj1lWzFdLHI9ZVsyXSxpPWVbM10scz1lWzRdLG89ZVs1XSx1PWVbNl0sYT1lWzddLGY9ZVs4XSxsPWVbOV0sYz1lWzEwXSxoPWVbMTFdLHA9ZVsxMl0sZD1lWzEzXSx2PWVbMTRdLG09ZVsxNV0sZz10Km8tbipzLHk9dCp1LXIqcyxiPXQqYS1pKnMsdz1uKnUtcipvLEU9biphLWkqbyxTPXIqYS1pKnUseD1mKmQtbCpwLFQ9Zip2LWMqcCxOPWYqbS1oKnAsQz1sKnYtYypkLGs9bCptLWgqZCxMPWMqbS1oKnY7cmV0dXJuIGcqTC15KmsrYipDK3cqTi1FKlQrUyp4fSxoLm11bHRpcGx5PWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz10WzNdLHU9dFs0XSxhPXRbNV0sZj10WzZdLGw9dFs3XSxjPXRbOF0saD10WzldLHA9dFsxMF0sZD10WzExXSx2PXRbMTJdLG09dFsxM10sZz10WzE0XSx5PXRbMTVdLGI9blswXSx3PW5bMV0sRT1uWzJdLFM9blszXTtyZXR1cm4gZVswXT1iKnIrdyp1K0UqYytTKnYsZVsxXT1iKmkrdyphK0UqaCtTKm0sZVsyXT1iKnMrdypmK0UqcCtTKmcsZVszXT1iKm8rdypsK0UqZCtTKnksYj1uWzRdLHc9bls1XSxFPW5bNl0sUz1uWzddLGVbNF09YipyK3cqdStFKmMrUyp2LGVbNV09YippK3cqYStFKmgrUyptLGVbNl09YipzK3cqZitFKnArUypnLGVbN109YipvK3cqbCtFKmQrUyp5LGI9bls4XSx3PW5bOV0sRT1uWzEwXSxTPW5bMTFdLGVbOF09YipyK3cqdStFKmMrUyp2LGVbOV09YippK3cqYStFKmgrUyptLGVbMTBdPWIqcyt3KmYrRSpwK1MqZyxlWzExXT1iKm8rdypsK0UqZCtTKnksYj1uWzEyXSx3PW5bMTNdLEU9blsxNF0sUz1uWzE1XSxlWzEyXT1iKnIrdyp1K0UqYytTKnYsZVsxM109YippK3cqYStFKmgrUyptLGVbMTRdPWIqcyt3KmYrRSpwK1MqZyxlWzE1XT1iKm8rdypsK0UqZCtTKnksZX0saC5tdWw9aC5tdWx0aXBseSxoLnRyYW5zbGF0ZT1mdW5jdGlvbihlLHQsbil7dmFyIHI9blswXSxpPW5bMV0scz1uWzJdLG8sdSxhLGYsbCxjLGgscCxkLHYsbSxnO3JldHVybiB0PT09ZT8oZVsxMl09dFswXSpyK3RbNF0qaSt0WzhdKnMrdFsxMl0sZVsxM109dFsxXSpyK3RbNV0qaSt0WzldKnMrdFsxM10sZVsxNF09dFsyXSpyK3RbNl0qaSt0WzEwXSpzK3RbMTRdLGVbMTVdPXRbM10qcit0WzddKmkrdFsxMV0qcyt0WzE1XSk6KG89dFswXSx1PXRbMV0sYT10WzJdLGY9dFszXSxsPXRbNF0sYz10WzVdLGg9dFs2XSxwPXRbN10sZD10WzhdLHY9dFs5XSxtPXRbMTBdLGc9dFsxMV0sZVswXT1vLGVbMV09dSxlWzJdPWEsZVszXT1mLGVbNF09bCxlWzVdPWMsZVs2XT1oLGVbN109cCxlWzhdPWQsZVs5XT12LGVbMTBdPW0sZVsxMV09ZyxlWzEyXT1vKnIrbCppK2Qqcyt0WzEyXSxlWzEzXT11KnIrYyppK3Yqcyt0WzEzXSxlWzE0XT1hKnIraCppK20qcyt0WzE0XSxlWzE1XT1mKnIrcCppK2cqcyt0WzE1XSksZX0saC5zY2FsZT1mdW5jdGlvbihlLHQsbil7dmFyIHI9blswXSxpPW5bMV0scz1uWzJdO3JldHVybiBlWzBdPXRbMF0qcixlWzFdPXRbMV0qcixlWzJdPXRbMl0qcixlWzNdPXRbM10qcixlWzRdPXRbNF0qaSxlWzVdPXRbNV0qaSxlWzZdPXRbNl0qaSxlWzddPXRbN10qaSxlWzhdPXRbOF0qcyxlWzldPXRbOV0qcyxlWzEwXT10WzEwXSpzLGVbMTFdPXRbMTFdKnMsZVsxMl09dFsxMl0sZVsxM109dFsxM10sZVsxNF09dFsxNF0sZVsxNV09dFsxNV0sZX0saC5yb3RhdGU9ZnVuY3Rpb24oZSxuLHIsaSl7dmFyIHM9aVswXSxvPWlbMV0sdT1pWzJdLGE9TWF0aC5zcXJ0KHMqcytvKm8rdSp1KSxmLGwsYyxoLHAsZCx2LG0sZyx5LGIsdyxFLFMseCxULE4sQyxrLEwsQSxPLE0sXztyZXR1cm4gTWF0aC5hYnMoYSk8dD9udWxsOihhPTEvYSxzKj1hLG8qPWEsdSo9YSxmPU1hdGguc2luKHIpLGw9TWF0aC5jb3MociksYz0xLWwsaD1uWzBdLHA9blsxXSxkPW5bMl0sdj1uWzNdLG09bls0XSxnPW5bNV0seT1uWzZdLGI9bls3XSx3PW5bOF0sRT1uWzldLFM9blsxMF0seD1uWzExXSxUPXMqcypjK2wsTj1vKnMqYyt1KmYsQz11KnMqYy1vKmYsaz1zKm8qYy11KmYsTD1vKm8qYytsLEE9dSpvKmMrcypmLE89cyp1KmMrbypmLE09byp1KmMtcypmLF89dSp1KmMrbCxlWzBdPWgqVCttKk4rdypDLGVbMV09cCpUK2cqTitFKkMsZVsyXT1kKlQreSpOK1MqQyxlWzNdPXYqVCtiKk4reCpDLGVbNF09aCprK20qTCt3KkEsZVs1XT1wKmsrZypMK0UqQSxlWzZdPWQqayt5KkwrUypBLGVbN109diprK2IqTCt4KkEsZVs4XT1oKk8rbSpNK3cqXyxlWzldPXAqTytnKk0rRSpfLGVbMTBdPWQqTyt5Kk0rUypfLGVbMTFdPXYqTytiKk0reCpfLG4hPT1lJiYoZVsxMl09blsxMl0sZVsxM109blsxM10sZVsxNF09blsxNF0sZVsxNV09blsxNV0pLGUpfSxoLnJvdGF0ZVg9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPU1hdGguc2luKG4pLGk9TWF0aC5jb3Mobikscz10WzRdLG89dFs1XSx1PXRbNl0sYT10WzddLGY9dFs4XSxsPXRbOV0sYz10WzEwXSxoPXRbMTFdO3JldHVybiB0IT09ZSYmKGVbMF09dFswXSxlWzFdPXRbMV0sZVsyXT10WzJdLGVbM109dFszXSxlWzEyXT10WzEyXSxlWzEzXT10WzEzXSxlWzE0XT10WzE0XSxlWzE1XT10WzE1XSksZVs0XT1zKmkrZipyLGVbNV09byppK2wqcixlWzZdPXUqaStjKnIsZVs3XT1hKmkraCpyLGVbOF09ZippLXMqcixlWzldPWwqaS1vKnIsZVsxMF09YyppLXUqcixlWzExXT1oKmktYSpyLGV9LGgucm90YXRlWT1mdW5jdGlvbihlLHQsbil7dmFyIHI9TWF0aC5zaW4obiksaT1NYXRoLmNvcyhuKSxzPXRbMF0sbz10WzFdLHU9dFsyXSxhPXRbM10sZj10WzhdLGw9dFs5XSxjPXRbMTBdLGg9dFsxMV07cmV0dXJuIHQhPT1lJiYoZVs0XT10WzRdLGVbNV09dFs1XSxlWzZdPXRbNl0sZVs3XT10WzddLGVbMTJdPXRbMTJdLGVbMTNdPXRbMTNdLGVbMTRdPXRbMTRdLGVbMTVdPXRbMTVdKSxlWzBdPXMqaS1mKnIsZVsxXT1vKmktbCpyLGVbMl09dSppLWMqcixlWzNdPWEqaS1oKnIsZVs4XT1zKnIrZippLGVbOV09bypyK2wqaSxlWzEwXT11KnIrYyppLGVbMTFdPWEqcitoKmksZX0saC5yb3RhdGVaPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj1NYXRoLnNpbihuKSxpPU1hdGguY29zKG4pLHM9dFswXSxvPXRbMV0sdT10WzJdLGE9dFszXSxmPXRbNF0sbD10WzVdLGM9dFs2XSxoPXRbN107cmV0dXJuIHQhPT1lJiYoZVs4XT10WzhdLGVbOV09dFs5XSxlWzEwXT10WzEwXSxlWzExXT10WzExXSxlWzEyXT10WzEyXSxlWzEzXT10WzEzXSxlWzE0XT10WzE0XSxlWzE1XT10WzE1XSksZVswXT1zKmkrZipyLGVbMV09byppK2wqcixlWzJdPXUqaStjKnIsZVszXT1hKmkraCpyLGVbNF09ZippLXMqcixlWzVdPWwqaS1vKnIsZVs2XT1jKmktdSpyLGVbN109aCppLWEqcixlfSxoLmZyb21Sb3RhdGlvblRyYW5zbGF0aW9uPWZ1bmN0aW9uKGUsdCxuKXt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz10WzNdLHU9cityLGE9aStpLGY9cytzLGw9cip1LGM9ciphLGg9cipmLHA9aSphLGQ9aSpmLHY9cypmLG09byp1LGc9byphLHk9bypmO3JldHVybiBlWzBdPTEtKHArdiksZVsxXT1jK3ksZVsyXT1oLWcsZVszXT0wLGVbNF09Yy15LGVbNV09MS0obCt2KSxlWzZdPWQrbSxlWzddPTAsZVs4XT1oK2csZVs5XT1kLW0sZVsxMF09MS0obCtwKSxlWzExXT0wLGVbMTJdPW5bMF0sZVsxM109blsxXSxlWzE0XT1uWzJdLGVbMTVdPTEsZX0saC5mcm9tUXVhdD1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9dFsyXSxzPXRbM10sbz1uK24sdT1yK3IsYT1pK2ksZj1uKm8sbD1yKm8sYz1yKnUsaD1pKm8scD1pKnUsZD1pKmEsdj1zKm8sbT1zKnUsZz1zKmE7cmV0dXJuIGVbMF09MS1jLWQsZVsxXT1sK2csZVsyXT1oLW0sZVszXT0wLGVbNF09bC1nLGVbNV09MS1mLWQsZVs2XT1wK3YsZVs3XT0wLGVbOF09aCttLGVbOV09cC12LGVbMTBdPTEtZi1jLGVbMTFdPTAsZVsxMl09MCxlWzEzXT0wLGVbMTRdPTAsZVsxNV09MSxlfSxoLmZydXN0dW09ZnVuY3Rpb24oZSx0LG4scixpLHMsbyl7dmFyIHU9MS8obi10KSxhPTEvKGktciksZj0xLyhzLW8pO3JldHVybiBlWzBdPXMqMip1LGVbMV09MCxlWzJdPTAsZVszXT0wLGVbNF09MCxlWzVdPXMqMiphLGVbNl09MCxlWzddPTAsZVs4XT0obit0KSp1LGVbOV09KGkrcikqYSxlWzEwXT0obytzKSpmLGVbMTFdPS0xLGVbMTJdPTAsZVsxM109MCxlWzE0XT1vKnMqMipmLGVbMTVdPTAsZX0saC5wZXJzcGVjdGl2ZT1mdW5jdGlvbihlLHQsbixyLGkpe3ZhciBzPTEvTWF0aC50YW4odC8yKSxvPTEvKHItaSk7cmV0dXJuIGVbMF09cy9uLGVbMV09MCxlWzJdPTAsZVszXT0wLGVbNF09MCxlWzVdPXMsZVs2XT0wLGVbN109MCxlWzhdPTAsZVs5XT0wLGVbMTBdPShpK3IpKm8sZVsxMV09LTEsZVsxMl09MCxlWzEzXT0wLGVbMTRdPTIqaSpyKm8sZVsxNV09MCxlfSxoLm9ydGhvPWZ1bmN0aW9uKGUsdCxuLHIsaSxzLG8pe3ZhciB1PTEvKHQtbiksYT0xLyhyLWkpLGY9MS8ocy1vKTtyZXR1cm4gZVswXT0tMip1LGVbMV09MCxlWzJdPTAsZVszXT0wLGVbNF09MCxlWzVdPS0yKmEsZVs2XT0wLGVbN109MCxlWzhdPTAsZVs5XT0wLGVbMTBdPTIqZixlWzExXT0wLGVbMTJdPSh0K24pKnUsZVsxM109KGkrcikqYSxlWzE0XT0obytzKSpmLGVbMTVdPTEsZX0saC5sb29rQXQ9ZnVuY3Rpb24oZSxuLHIsaSl7dmFyIHMsbyx1LGEsZixsLGMscCxkLHYsbT1uWzBdLGc9blsxXSx5PW5bMl0sYj1pWzBdLHc9aVsxXSxFPWlbMl0sUz1yWzBdLHg9clsxXSxUPXJbMl07cmV0dXJuIE1hdGguYWJzKG0tUyk8dCYmTWF0aC5hYnMoZy14KTx0JiZNYXRoLmFicyh5LVQpPHQ/aC5pZGVudGl0eShlKTooYz1tLVMscD1nLXgsZD15LVQsdj0xL01hdGguc3FydChjKmMrcCpwK2QqZCksYyo9dixwKj12LGQqPXYscz13KmQtRSpwLG89RSpjLWIqZCx1PWIqcC13KmMsdj1NYXRoLnNxcnQocypzK28qbyt1KnUpLHY/KHY9MS92LHMqPXYsbyo9dix1Kj12KToocz0wLG89MCx1PTApLGE9cCp1LWQqbyxmPWQqcy1jKnUsbD1jKm8tcCpzLHY9TWF0aC5zcXJ0KGEqYStmKmYrbCpsKSx2Pyh2PTEvdixhKj12LGYqPXYsbCo9dik6KGE9MCxmPTAsbD0wKSxlWzBdPXMsZVsxXT1hLGVbMl09YyxlWzNdPTAsZVs0XT1vLGVbNV09ZixlWzZdPXAsZVs3XT0wLGVbOF09dSxlWzldPWwsZVsxMF09ZCxlWzExXT0wLGVbMTJdPS0ocyptK28qZyt1KnkpLGVbMTNdPS0oYSptK2YqZytsKnkpLGVbMTRdPS0oYyptK3AqZytkKnkpLGVbMTVdPTEsZSl9LGguc3RyPWZ1bmN0aW9uKGUpe3JldHVyblwibWF0NChcIitlWzBdK1wiLCBcIitlWzFdK1wiLCBcIitlWzJdK1wiLCBcIitlWzNdK1wiLCBcIitlWzRdK1wiLCBcIitlWzVdK1wiLCBcIitlWzZdK1wiLCBcIitlWzddK1wiLCBcIitlWzhdK1wiLCBcIitlWzldK1wiLCBcIitlWzEwXStcIiwgXCIrZVsxMV0rXCIsIFwiK2VbMTJdK1wiLCBcIitlWzEzXStcIiwgXCIrZVsxNF0rXCIsIFwiK2VbMTVdK1wiKVwifSxoLmZyb2I9ZnVuY3Rpb24oZSl7cmV0dXJuIE1hdGguc3FydChNYXRoLnBvdyhlWzBdLDIpK01hdGgucG93KGVbMV0sMikrTWF0aC5wb3coZVsyXSwyKStNYXRoLnBvdyhlWzNdLDIpK01hdGgucG93KGVbNF0sMikrTWF0aC5wb3coZVs1XSwyKStNYXRoLnBvdyhlWzZdLDIpK01hdGgucG93KGVbNl0sMikrTWF0aC5wb3coZVs3XSwyKStNYXRoLnBvdyhlWzhdLDIpK01hdGgucG93KGVbOV0sMikrTWF0aC5wb3coZVsxMF0sMikrTWF0aC5wb3coZVsxMV0sMikrTWF0aC5wb3coZVsxMl0sMikrTWF0aC5wb3coZVsxM10sMikrTWF0aC5wb3coZVsxNF0sMikrTWF0aC5wb3coZVsxNV0sMikpfSx0eXBlb2YgZSE9XCJ1bmRlZmluZWRcIiYmKGUubWF0ND1oKTt2YXIgcD17fTtwLmNyZWF0ZT1mdW5jdGlvbigpe3ZhciBlPW5ldyBuKDQpO3JldHVybiBlWzBdPTAsZVsxXT0wLGVbMl09MCxlWzNdPTEsZX0scC5yb3RhdGlvblRvPWZ1bmN0aW9uKCl7dmFyIGU9dS5jcmVhdGUoKSx0PXUuZnJvbVZhbHVlcygxLDAsMCksbj11LmZyb21WYWx1ZXMoMCwxLDApO3JldHVybiBmdW5jdGlvbihyLGkscyl7dmFyIG89dS5kb3QoaSxzKTtyZXR1cm4gbzwtMC45OTk5OTk/KHUuY3Jvc3MoZSx0LGkpLHUubGVuZ3RoKGUpPDFlLTYmJnUuY3Jvc3MoZSxuLGkpLHUubm9ybWFsaXplKGUsZSkscC5zZXRBeGlzQW5nbGUocixlLE1hdGguUEkpLHIpOm8+Ljk5OTk5OT8oclswXT0wLHJbMV09MCxyWzJdPTAsclszXT0xLHIpOih1LmNyb3NzKGUsaSxzKSxyWzBdPWVbMF0sclsxXT1lWzFdLHJbMl09ZVsyXSxyWzNdPTErbyxwLm5vcm1hbGl6ZShyLHIpKX19KCkscC5zZXRBeGVzPWZ1bmN0aW9uKCl7dmFyIGU9Yy5jcmVhdGUoKTtyZXR1cm4gZnVuY3Rpb24odCxuLHIsaSl7cmV0dXJuIGVbMF09clswXSxlWzNdPXJbMV0sZVs2XT1yWzJdLGVbMV09aVswXSxlWzRdPWlbMV0sZVs3XT1pWzJdLGVbMl09LW5bMF0sZVs1XT0tblsxXSxlWzhdPS1uWzJdLHAubm9ybWFsaXplKHQscC5mcm9tTWF0Myh0LGUpKX19KCkscC5jbG9uZT1hLmNsb25lLHAuZnJvbVZhbHVlcz1hLmZyb21WYWx1ZXMscC5jb3B5PWEuY29weSxwLnNldD1hLnNldCxwLmlkZW50aXR5PWZ1bmN0aW9uKGUpe3JldHVybiBlWzBdPTAsZVsxXT0wLGVbMl09MCxlWzNdPTEsZX0scC5zZXRBeGlzQW5nbGU9ZnVuY3Rpb24oZSx0LG4pe24qPS41O3ZhciByPU1hdGguc2luKG4pO3JldHVybiBlWzBdPXIqdFswXSxlWzFdPXIqdFsxXSxlWzJdPXIqdFsyXSxlWzNdPU1hdGguY29zKG4pLGV9LHAuYWRkPWEuYWRkLHAubXVsdGlwbHk9ZnVuY3Rpb24oZSx0LG4pe3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT1uWzBdLGE9blsxXSxmPW5bMl0sbD1uWzNdO3JldHVybiBlWzBdPXIqbCtvKnUraSpmLXMqYSxlWzFdPWkqbCtvKmErcyp1LXIqZixlWzJdPXMqbCtvKmYrciphLWkqdSxlWzNdPW8qbC1yKnUtaSphLXMqZixlfSxwLm11bD1wLm11bHRpcGx5LHAuc2NhbGU9YS5zY2FsZSxwLnJvdGF0ZVg9ZnVuY3Rpb24oZSx0LG4pe24qPS41O3ZhciByPXRbMF0saT10WzFdLHM9dFsyXSxvPXRbM10sdT1NYXRoLnNpbihuKSxhPU1hdGguY29zKG4pO3JldHVybiBlWzBdPXIqYStvKnUsZVsxXT1pKmErcyp1LGVbMl09cyphLWkqdSxlWzNdPW8qYS1yKnUsZX0scC5yb3RhdGVZPWZ1bmN0aW9uKGUsdCxuKXtuKj0uNTt2YXIgcj10WzBdLGk9dFsxXSxzPXRbMl0sbz10WzNdLHU9TWF0aC5zaW4obiksYT1NYXRoLmNvcyhuKTtyZXR1cm4gZVswXT1yKmEtcyp1LGVbMV09aSphK28qdSxlWzJdPXMqYStyKnUsZVszXT1vKmEtaSp1LGV9LHAucm90YXRlWj1mdW5jdGlvbihlLHQsbil7bio9LjU7dmFyIHI9dFswXSxpPXRbMV0scz10WzJdLG89dFszXSx1PU1hdGguc2luKG4pLGE9TWF0aC5jb3Mobik7cmV0dXJuIGVbMF09ciphK2kqdSxlWzFdPWkqYS1yKnUsZVsyXT1zKmErbyp1LGVbM109byphLXMqdSxlfSxwLmNhbGN1bGF0ZVc9ZnVuY3Rpb24oZSx0KXt2YXIgbj10WzBdLHI9dFsxXSxpPXRbMl07cmV0dXJuIGVbMF09bixlWzFdPXIsZVsyXT1pLGVbM109LU1hdGguc3FydChNYXRoLmFicygxLW4qbi1yKnItaSppKSksZX0scC5kb3Q9YS5kb3QscC5sZXJwPWEubGVycCxwLnNsZXJwPWZ1bmN0aW9uKGUsdCxuLHIpe3ZhciBpPXRbMF0scz10WzFdLG89dFsyXSx1PXRbM10sYT1uWzBdLGY9blsxXSxsPW5bMl0sYz1uWzNdLGgscCxkLHYsbTtyZXR1cm4gcD1pKmErcypmK28qbCt1KmMscDwwJiYocD0tcCxhPS1hLGY9LWYsbD0tbCxjPS1jKSwxLXA+MWUtNj8oaD1NYXRoLmFjb3MocCksZD1NYXRoLnNpbihoKSx2PU1hdGguc2luKCgxLXIpKmgpL2QsbT1NYXRoLnNpbihyKmgpL2QpOih2PTEtcixtPXIpLGVbMF09dippK20qYSxlWzFdPXYqcyttKmYsZVsyXT12Km8rbSpsLGVbM109dip1K20qYyxlfSxwLmludmVydD1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0scj10WzFdLGk9dFsyXSxzPXRbM10sbz1uKm4rcipyK2kqaStzKnMsdT1vPzEvbzowO3JldHVybiBlWzBdPS1uKnUsZVsxXT0tcip1LGVbMl09LWkqdSxlWzNdPXMqdSxlfSxwLmNvbmp1Z2F0ZT1mdW5jdGlvbihlLHQpe3JldHVybiBlWzBdPS10WzBdLGVbMV09LXRbMV0sZVsyXT0tdFsyXSxlWzNdPXRbM10sZX0scC5sZW5ndGg9YS5sZW5ndGgscC5sZW49cC5sZW5ndGgscC5zcXVhcmVkTGVuZ3RoPWEuc3F1YXJlZExlbmd0aCxwLnNxckxlbj1wLnNxdWFyZWRMZW5ndGgscC5ub3JtYWxpemU9YS5ub3JtYWxpemUscC5mcm9tTWF0Mz1mdW5jdGlvbihlLHQpe3ZhciBuPXRbMF0rdFs0XSt0WzhdLHI7aWYobj4wKXI9TWF0aC5zcXJ0KG4rMSksZVszXT0uNSpyLHI9LjUvcixlWzBdPSh0WzddLXRbNV0pKnIsZVsxXT0odFsyXS10WzZdKSpyLGVbMl09KHRbM10tdFsxXSkqcjtlbHNle3ZhciBpPTA7dFs0XT50WzBdJiYoaT0xKSx0WzhdPnRbaSozK2ldJiYoaT0yKTt2YXIgcz0oaSsxKSUzLG89KGkrMiklMztyPU1hdGguc3FydCh0W2kqMytpXS10W3MqMytzXS10W28qMytvXSsxKSxlW2ldPS41KnIscj0uNS9yLGVbM109KHRbbyozK3NdLXRbcyozK29dKSpyLGVbc109KHRbcyozK2ldK3RbaSozK3NdKSpyLGVbb109KHRbbyozK2ldK3RbaSozK29dKSpyfXJldHVybiBlfSxwLnN0cj1mdW5jdGlvbihlKXtyZXR1cm5cInF1YXQoXCIrZVswXStcIiwgXCIrZVsxXStcIiwgXCIrZVsyXStcIiwgXCIrZVszXStcIilcIn0sdHlwZW9mIGUhPVwidW5kZWZpbmVkXCImJihlLnF1YXQ9cCl9KHQuZXhwb3J0cyl9KSh0aGlzKTtcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiMVlpWjVTXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvbGliL2dsLW1hdHJpeC1taW4uanNcIixcIi9saWJcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgTGlnaHRNYXAgPSByZXF1aXJlKCdnbC9saWdodG1hcCcpO1xudmFyIEJzcCA9IHJlcXVpcmUoJ2Zvcm1hdHMvYnNwJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCd1dGlscycpO1xuXG52YXIgbWF4TGlnaHRNYXBzID0gNjQ7XG52YXIgbGlnaHRNYXBCeXRlcyA9IDE7XG52YXIgYmxvY2tXaWR0aCA9IDUxMjtcbnZhciBibG9ja0hlaWdodCA9IDUxMjtcblxudmFyIExpZ2h0TWFwcyA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuYWxsb2NhdGVkID0gdXRpbHMuYXJyYXkyZChibG9ja1dpZHRoLCBtYXhMaWdodE1hcHMpO1xuICAgIHRoaXMubGlnaHRNYXBzRGF0YSA9IFtdO1xufTtcblxuTGlnaHRNYXBzLnByb3RvdHlwZS5idWlsZExpZ2h0TWFwID0gZnVuY3Rpb24oYnNwLCBzdXJmYWNlLCBvZmZzZXQpIHtcbiAgICB2YXIgd2lkdGggPSAoc3VyZmFjZS5leHRlbnRzWzBdID4+IDQpICsgMTtcbiAgICB2YXIgaGVpZ2h0ID0gKHN1cmZhY2UuZXh0ZW50c1sxXSA+PiA0KSArIDE7XG4gICAgdmFyIHNpemUgPSB3aWR0aCAqIGhlaWdodDtcbiAgICB2YXIgYmxvY2tMaWdodHMgPSB1dGlscy5hcnJheTFkKDE4ICogMTgpO1xuICAgIHZhciBsaWdodE1hcE9mZnNldCA9IHN1cmZhY2UubGlnaHRNYXBPZmZzZXQ7XG5cbiAgICBmb3IgKHZhciBtYXAgPSAwOyBtYXAgPCBtYXhMaWdodE1hcHM7IG1hcCsrKSB7XG4gICAgICAgIGlmIChzdXJmYWNlLmxpZ2h0U3R5bGVzW21hcF0gPT09IDI1NSlcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIC8vIFRPRE86IEFkZCBsaWdodHN0eWxlcywgdXNlZCBmb3IgZmxpY2tlcmluZywgYW5kIG90aGVyIGxpZ2h0IGFuaW1hdGlvbnMuXG4gICAgICAgIHZhciBzY2FsZSA9IDI2NDtcbiAgICAgICAgZm9yICh2YXIgYmwgPSAwOyBibCA8IHNpemU7IGJsKyspIHtcbiAgICAgICAgICAgIGJsb2NrTGlnaHRzW2JsXSArPSBic3AubGlnaHRNYXBzW2xpZ2h0TWFwT2Zmc2V0ICsgYmxdICogc2NhbGU7XG4gICAgICAgIH1cbiAgICAgICAgbGlnaHRNYXBPZmZzZXQgKz0gc2l6ZTtcbiAgICB9XG5cbiAgICB2YXIgaSA9IDA7XG4gICAgdmFyIHN0cmlkZSA9IGJsb2NrV2lkdGggKiBsaWdodE1hcEJ5dGVzO1xuICAgIGZvciAodmFyIHkgPSAwOyB5IDwgaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCB3aWR0aDsgeCsrKSB7XG4gICAgICAgICAgICB2YXIgcG9zaXRpb24gPSB5ICogc3RyaWRlICsgeDtcbiAgICAgICAgICAgIHRoaXMubGlnaHRNYXBzRGF0YVtvZmZzZXQgKyBwb3NpdGlvbl0gPSAyNTUgLSBNYXRoLm1pbigyNTUsIGJsb2NrTGlnaHRzW2ldID4+IDcpO1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuTGlnaHRNYXBzLnByb3RvdHlwZS5hbGxvY2F0ZUJsb2NrID0gZnVuY3Rpb24gKHdpZHRoLCBoZWlnaHQpIHtcbiAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgZm9yICh2YXIgdGV4SWQgPSAwOyB0ZXhJZCA8IG1heExpZ2h0TWFwczsgdGV4SWQrKykge1xuICAgICAgICB2YXIgYmVzdCA9IGJsb2NrSGVpZ2h0O1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJsb2NrV2lkdGggLSB3aWR0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgYmVzdDIgPSAwO1xuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB3aWR0aDsgaisrKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5hbGxvY2F0ZWRbdGV4SWRdW2kgKyBqXSA+PSBiZXN0KVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5hbGxvY2F0ZWRbdGV4SWRdW2kgKyBqXSA+IGJlc3QyKVxuICAgICAgICAgICAgICAgICAgICBiZXN0MiA9IHRoaXMuYWxsb2NhdGVkW3RleElkXVtpICsgal07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChqID09IHdpZHRoKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnggPSBpO1xuICAgICAgICAgICAgICAgIHJlc3VsdC55ID0gYmVzdCA9IGJlc3QyO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGJlc3QgKyBoZWlnaHQgPiBibG9ja0hlaWdodClcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgd2lkdGg7IGorKylcbiAgICAgICAgICAgIHRoaXMuYWxsb2NhdGVkW3RleElkXVtyZXN1bHQueCArIGpdID0gYmVzdCArIGhlaWdodDtcblxuICAgICAgICByZXN1bHQudGV4SWQgPSB0ZXhJZDtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59O1xuXG5MaWdodE1hcHMucHJvdG90eXBlLmJ1aWxkID0gZnVuY3Rpb24oYnNwKSB7XG4gICAgdmFyIHVzZWRNYXBzID0gMDtcbiAgICBmb3IgKHZhciBtID0gMDsgbSA8IGJzcC5tb2RlbHMubGVuZ3RoOyBtKyspIHtcbiAgICAgICAgdmFyIG1vZGVsID0gYnNwLm1vZGVsc1ttXTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1vZGVsLnN1cmZhY2VDb3VudDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgc3VyZmFjZSA9IGJzcC5zdXJmYWNlc1ttb2RlbC5maXJzdFN1cmZhY2UgKyBpXTtcbiAgICAgICAgICAgIGlmIChzdXJmYWNlLmZsYWdzICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciB3aWR0aCA9IChzdXJmYWNlLmV4dGVudHNbMF0gPj4gNCkgKyAxO1xuICAgICAgICAgICAgdmFyIGhlaWdodCA9IChzdXJmYWNlLmV4dGVudHNbMV0gPj4gNCkgKyAxO1xuXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gdGhpcy5hbGxvY2F0ZUJsb2NrKHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICAgICAgc3VyZmFjZS5saWdodE1hcFMgPSByZXN1bHQueDtcbiAgICAgICAgICAgIHN1cmZhY2UubGlnaHRNYXBUID0gcmVzdWx0Lnk7XG4gICAgICAgICAgICB1c2VkTWFwcyA9IE1hdGgubWF4KHVzZWRNYXBzLCByZXN1bHQudGV4SWQpO1xuICAgICAgICAgICAgdmFyIG9mZnNldCA9IHJlc3VsdC50ZXhJZCAqIGxpZ2h0TWFwQnl0ZXMgKiBibG9ja1dpZHRoICogYmxvY2tIZWlnaHQ7XG4gICAgICAgICAgICBvZmZzZXQgKz0gKHJlc3VsdC55ICogYmxvY2tXaWR0aCArIHJlc3VsdC54KSAqIGxpZ2h0TWFwQnl0ZXM7XG4gICAgICAgICAgICB0aGlzLmJ1aWxkTGlnaHRNYXAoYnNwLCBzdXJmYWNlLCBvZmZzZXQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHRoaXMudGV4dHVyZSA9IG5ldyBMaWdodE1hcCh0aGlzLmxpZ2h0TWFwc0RhdGEsIDAsIGJsb2NrV2lkdGgsIGJsb2NrSGVpZ2h0KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IExpZ2h0TWFwcztcblxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIjFZaVo1U1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2xpZ2h0bWFwcy5qc1wiLFwiL1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbnZhciBUZXh0dXJlID0gcmVxdWlyZSgnZ2wvdGV4dHVyZScpO1xudmFyIExpZ2h0TWFwcyA9IHJlcXVpcmUoJ2xpZ2h0bWFwcycpO1xudmFyIGFzc2V0cyA9IHJlcXVpcmUoJ2Fzc2V0cycpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgndXRpbHMnKTtcbnZhciB3aXJlZnJhbWUgPSBmYWxzZTtcblxudmFyIGJsb2NrV2lkdGggPSA1MTI7XG52YXIgYmxvY2tIZWlnaHQgPSA1MTI7XG5cbnZhciBNYXAgPSBmdW5jdGlvbihic3ApIHtcbiAgICB0aGlzLnRleHR1cmVzID0gW107XG4gICAgdGhpcy5saWdodE1hcHMgPSBuZXcgTGlnaHRNYXBzKCk7XG4gICAgdGhpcy5saWdodE1hcHMuYnVpbGQoYnNwKTtcblxuICAgIGZvciAodmFyIHRleElkIGluIGJzcC50ZXh0dXJlcykge1xuICAgICAgICB2YXIgdGV4dHVyZSA9IGJzcC50ZXh0dXJlc1t0ZXhJZF07XG4gICAgICAgIHZhciBvcHRpb25zID0ge1xuICAgICAgICAgICAgd2lkdGg6IHRleHR1cmUud2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IHRleHR1cmUuaGVpZ2h0LFxuICAgICAgICAgICAgd3JhcDogZ2wuUkVQRUFULFxuICAgICAgICAgICAgcGFsZXR0ZTogYXNzZXRzLnBhbGV0dGVcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy50ZXh0dXJlcy5wdXNoKG5ldyBUZXh0dXJlKHRleHR1cmUuZGF0YSwgb3B0aW9ucykpO1xuICAgIH1cblxuICAgIHZhciBjaGFpbnMgPSBbXTtcbiAgICBmb3IgKHZhciBtIGluIGJzcC5tb2RlbHMpIHtcbiAgICAgICAgdmFyIG1vZGVsID0gYnNwLm1vZGVsc1ttXTtcbiAgICAgICAgZm9yICh2YXIgc2lkID0gbW9kZWwuZmlyc3RTdXJmYWNlOyBzaWQgPCBtb2RlbC5zdXJmYWNlQ291bnQ7IHNpZCsrKSB7XG4gICAgICAgICAgICB2YXIgc3VyZmFjZSA9IGJzcC5zdXJmYWNlc1tzaWRdO1xuICAgICAgICAgICAgdmFyIHRleEluZm8gPSBic3AudGV4SW5mb3Nbc3VyZmFjZS50ZXhJbmZvSWRdO1xuXG4gICAgICAgICAgICB2YXIgY2hhaW4gPSBjaGFpbnNbdGV4SW5mby50ZXh0dXJlSWRdO1xuICAgICAgICAgICAgaWYgKCFjaGFpbikge1xuICAgICAgICAgICAgICAgIGNoYWluID0geyB0ZXhJZDogdGV4SW5mby50ZXh0dXJlSWQsIGRhdGE6IFtdIH07XG4gICAgICAgICAgICAgICAgY2hhaW5zW3RleEluZm8udGV4dHVyZUlkXSA9IGNoYWluO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgaW5kaWNlcyA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgZSA9IHN1cmZhY2UuZWRnZVN0YXJ0OyBlIDwgc3VyZmFjZS5lZGdlU3RhcnQgKyBzdXJmYWNlLmVkZ2VDb3VudDsgZSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGVkZ2VGbGlwcGVkID0gYnNwLmVkZ2VMaXN0W2VdIDwgMDtcbiAgICAgICAgICAgICAgICB2YXIgZWRnZUluZGV4ID0gTWF0aC5hYnMoYnNwLmVkZ2VMaXN0W2VdKTtcbiAgICAgICAgICAgICAgICBpZiAoIWVkZ2VGbGlwcGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGluZGljZXMucHVzaChic3AuZWRnZXNbZWRnZUluZGV4ICogMl0pO1xuICAgICAgICAgICAgICAgICAgICBpbmRpY2VzLnB1c2goYnNwLmVkZ2VzW2VkZ2VJbmRleCAqIDIgKyAxXSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaW5kaWNlcy5wdXNoKGJzcC5lZGdlc1tlZGdlSW5kZXggKiAyICsgMV0pO1xuICAgICAgICAgICAgICAgICAgICBpbmRpY2VzLnB1c2goYnNwLmVkZ2VzW2VkZ2VJbmRleCAqIDJdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbmRpY2VzID0gd2lyZWZyYW1lID8gaW5kaWNlcyA6IHV0aWxzLnRyaWFuZ3VsYXRlKGluZGljZXMpO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbmRpY2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHYgPSBbXG4gICAgICAgICAgICAgICAgICAgIGJzcC52ZXJ0aWNlc1tpbmRpY2VzW2ldXS54LFxuICAgICAgICAgICAgICAgICAgICBic3AudmVydGljZXNbaW5kaWNlc1tpXV0ueSxcbiAgICAgICAgICAgICAgICAgICAgYnNwLnZlcnRpY2VzW2luZGljZXNbaV1dLnpcbiAgICAgICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICAgICAgdmFyIHMgPSB2ZWMzLmRvdCh2LCB0ZXhJbmZvLnZlY3RvclMpICsgdGV4SW5mby5kaXN0UztcbiAgICAgICAgICAgICAgICB2YXIgdCA9IHZlYzMuZG90KHYsIHRleEluZm8udmVjdG9yVCkgKyB0ZXhJbmZvLmRpc3RUO1xuXG4gICAgICAgICAgICAgICAgdmFyIHMxID0gcyAvIHRoaXMudGV4dHVyZXNbdGV4SW5mby50ZXh0dXJlSWRdLndpZHRoO1xuICAgICAgICAgICAgICAgIHZhciB0MSA9IHQgLyB0aGlzLnRleHR1cmVzW3RleEluZm8udGV4dHVyZUlkXS5oZWlnaHQ7XG5cbiAgICAgICAgICAgICAgICAvLyBTaGFkb3cgbWFwIHRleHR1cmUgY29vcmRpbmF0ZXNcbiAgICAgICAgICAgICAgICB2YXIgczIgPSBzO1xuICAgICAgICAgICAgICAgIHMyIC09IHN1cmZhY2UudGV4dHVyZU1pbnNbMF07XG4gICAgICAgICAgICAgICAgczIgKz0gKHN1cmZhY2UubGlnaHRNYXBTICogMTYpO1xuICAgICAgICAgICAgICAgIHMyICs9IDg7XG4gICAgICAgICAgICAgICAgczIgLz0gKGJsb2NrV2lkdGggKiAxNik7XG5cbiAgICAgICAgICAgICAgICB2YXIgdDIgPSB0O1xuICAgICAgICAgICAgICAgIHQyIC09IHN1cmZhY2UudGV4dHVyZU1pbnNbMV07XG4gICAgICAgICAgICAgICAgdDIgKz0gKHN1cmZhY2UubGlnaHRNYXBUICogMTYpO1xuICAgICAgICAgICAgICAgIHQyICs9IDg7XG4gICAgICAgICAgICAgICAgdDIgLz0gKGJsb2NrSGVpZ2h0ICogMTYpO1xuXG4gICAgICAgICAgICAgICAgY2hhaW4uZGF0YS5wdXNoKHZbMF0sIHZbMV0sIHZbMl0sIHMxLCB0MSwgczIsIHQyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciBkYXRhID0gW107XG4gICAgdmFyIG9mZnNldCA9IDA7XG4gICAgdGhpcy5jaGFpbnMgPSBbXTtcbiAgICBmb3IgKHZhciBjIGluIGNoYWlucykge1xuICAgICAgICBmb3IgKHZhciB2ID0gMDsgdiA8IGNoYWluc1tjXS5kYXRhLmxlbmd0aDsgdisrKSB7XG4gICAgICAgICAgICBkYXRhLnB1c2goY2hhaW5zW2NdLmRhdGFbdl0pO1xuICAgICAgICB9XG4gICAgICAgIHZhciBjaGFpbiA9IHtcbiAgICAgICAgICAgIG9mZnNldDogb2Zmc2V0LFxuICAgICAgICAgICAgdGV4SWQ6IGNoYWluc1tjXS50ZXhJZCxcbiAgICAgICAgICAgIGVsZW1lbnRzOiBjaGFpbnNbY10uZGF0YS5sZW5ndGggLyA3XG4gICAgICAgIH07XG4gICAgICAgIG9mZnNldCArPSBjaGFpbi5lbGVtZW50cztcbiAgICAgICAgdGhpcy5jaGFpbnMucHVzaChjaGFpbik7XG4gICAgfVxuICAgIHRoaXMuYnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHRoaXMuYnVmZmVyKTtcbiAgICBnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheShkYXRhKSwgZ2wuU1RBVElDX0RSQVcpO1xuICAgIHRoaXMuYnVmZmVyLnN0cmlkZSA9IDcgKiA0O1xufTtcblxuTWFwLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24ocCwgbSkge1xuICAgIHZhciBzaGFkZXIgPSBhc3NldHMuc2hhZGVycy53b3JsZDtcbiAgICB2YXIgYnVmZmVyID0gdGhpcy5idWZmZXI7XG4gICAgdmFyIG1vZGUgPSB3aXJlZnJhbWUgPyBnbC5MSU5FUyA6IGdsLlRSSUFOR0xFUztcblxuICAgIHNoYWRlci51c2UoKTtcbiAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdGhpcy5idWZmZXIpO1xuXG4gICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoc2hhZGVyLmF0dHJpYnV0ZXMuc2hhZG93VGV4Q29vcmRzQXR0cmlidXRlKTtcblxuICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIoc2hhZGVyLmF0dHJpYnV0ZXMudmVydGV4QXR0cmlidXRlLCAzLCBnbC5GTE9BVCwgZmFsc2UsIGJ1ZmZlci5zdHJpZGUsIDApO1xuICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIoc2hhZGVyLmF0dHJpYnV0ZXMudGV4Q29vcmRzQXR0cmlidXRlLCAyLCBnbC5GTE9BVCwgZmFsc2UsIGJ1ZmZlci5zdHJpZGUsIDEyKTtcbiAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKHNoYWRlci5hdHRyaWJ1dGVzLnNoYWRvd1RleENvb3Jkc0F0dHJpYnV0ZSwgMiwgZ2wuRkxPQVQsIGZhbHNlLCBidWZmZXIuc3RyaWRlLCAyMCk7XG4gICAgZ2wudW5pZm9ybU1hdHJpeDRmdihzaGFkZXIudW5pZm9ybXMucHJvamVjdGlvbk1hdHJpeCwgZmFsc2UsIHApO1xuICAgIGdsLnVuaWZvcm1NYXRyaXg0ZnYoc2hhZGVyLnVuaWZvcm1zLm1vZGVsdmlld01hdHJpeCwgZmFsc2UsIG0pO1xuICAgIGdsLnVuaWZvcm0xaShzaGFkZXIudW5pZm9ybXMudGV4dHVyZU1hcCwgMCk7XG4gICAgZ2wudW5pZm9ybTFpKHNoYWRlci51bmlmb3Jtcy5saWdodE1hcCwgMSk7XG5cbiAgICB0aGlzLmxpZ2h0TWFwcy50ZXh0dXJlLmJpbmQoMSk7XG4gICAgZm9yICh2YXIgYyBpbiB0aGlzLmNoYWlucykge1xuICAgICAgICB2YXIgY2hhaW4gPSB0aGlzLmNoYWluc1tjXTtcbiAgICAgICAgdmFyIHRleHR1cmUgPSB0aGlzLnRleHR1cmVzW2NoYWluLnRleElkXTtcbiAgICAgICAgdGV4dHVyZS5iaW5kKDApO1xuICAgICAgICBnbC5kcmF3QXJyYXlzKG1vZGUsIHRoaXMuY2hhaW5zW2NdLm9mZnNldCwgdGhpcy5jaGFpbnNbY10uZWxlbWVudHMpO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IE1hcDtcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiMVlpWjVTXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvbWFwLmpzXCIsXCIvXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIGFzc2V0cyA9IHJlcXVpcmUoJ2Fzc2V0cycpO1xudmFyIFRleHR1cmUgPSByZXF1aXJlKCdnbC9UZXh0dXJlJyk7XG5cbnZhciBNb2RlbCA9IGZ1bmN0aW9uKG1kbCkge1xuICAgIHRoaXMuc2tpbnMgPSBbXTtcbiAgICBmb3IgKHZhciBza2luSW5kZXggPSAwOyBza2luSW5kZXggPCBtZGwuc2tpbnMubGVuZ3RoOyBza2luSW5kZXgrKykge1xuICAgICAgICB2YXIgc2tpbiA9IG1kbC5za2luc1tza2luSW5kZXhdO1xuICAgICAgICB2YXIgdGV4dHVyZSA9IG5ldyBUZXh0dXJlKHNraW4sIHtcbiAgICAgICAgICAgIHBhbGV0dGU6IGFzc2V0cy5wYWxldHRlLFxuICAgICAgICAgICAgd2lkdGg6IG1kbC5za2luV2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IG1kbC5za2luSGVpZ2h0XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnNraW5zLnB1c2godGV4dHVyZSk7XG4gICAgfVxuXG4gICAgdGhpcy5pZCA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xuICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLmlkKTtcbiAgICB2YXIgZGF0YSA9IG5ldyBGbG9hdDMyQXJyYXkobWRsLmZyYW1lQ291bnQgKiBtZGwuZmFjZUNvdW50ICogMyAqIDUpO1xuICAgIHZhciBvZmZzZXQgPSAwO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbWRsLmZyYW1lQ291bnQ7IGkrKykge1xuICAgICAgICB2YXIgZnJhbWUgPSBtZGwuZnJhbWVzW2ldO1xuICAgICAgICBmb3IgKHZhciBmID0gMDsgZiA8IG1kbC5mYWNlQ291bnQ7IGYrKykge1xuICAgICAgICAgICAgdmFyIGZhY2UgPSBtZGwuZmFjZXNbZl07XG4gICAgICAgICAgICBmb3IgKHZhciB2ID0gMDsgdiA8IDM7IHYrKykge1xuICAgICAgICAgICAgICAgIGRhdGFbb2Zmc2V0KytdID0gZnJhbWUudmVydGljZXNbZmFjZS5pbmRpY2VzW3ZdXVswXTtcbiAgICAgICAgICAgICAgICBkYXRhW29mZnNldCsrXSA9IGZyYW1lLnZlcnRpY2VzW2ZhY2UuaW5kaWNlc1t2XV1bMV07XG4gICAgICAgICAgICAgICAgZGF0YVtvZmZzZXQrK10gPSBmcmFtZS52ZXJ0aWNlc1tmYWNlLmluZGljZXNbdl1dWzJdO1xuXG4gICAgICAgICAgICAgICAgdmFyIHMgPSBtZGwudGV4Q29vcmRzW2ZhY2UuaW5kaWNlc1t2XV0ucztcbiAgICAgICAgICAgICAgICB2YXIgdCA9IG1kbC50ZXhDb29yZHNbZmFjZS5pbmRpY2VzW3ZdXS50O1xuXG4gICAgICAgICAgICAgICAgaWYgKCFmYWNlLmlzRnJvbnRGYWNlICYmIG1kbC50ZXhDb29yZHNbZmFjZS5pbmRpY2VzW3ZdXS5vblNlYW0pXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gdGhpcy5za2luc1swXS53aWR0aCAqIDAuNTsgLy8gb24gYmFjayBzaWRlXG5cbiAgICAgICAgICAgICAgICBkYXRhW29mZnNldCsrXSA9IChzICsgMC41KSAvIHRoaXMuc2tpbnNbMF0ud2lkdGg7XG4gICAgICAgICAgICAgICAgZGF0YVtvZmZzZXQrK10gPSAodCArIDAuNSkgLyB0aGlzLnNraW5zWzBdLmhlaWdodDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBkYXRhLCBnbC5TVEFUSUNfRFJBVyk7XG4gICAgdGhpcy5zdHJpZGUgPSA1ICogNDsgLy8geCwgeSwgeiwgcywgdFxuICAgIHRoaXMuZmFjZUNvdW50ID0gbWRsLmZhY2VDb3VudDtcbiAgICB0aGlzLmFuaW1hdGlvbnMgPSBtZGwuYW5pbWF0aW9ucztcbn07XG5cbk1vZGVsLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24ocCwgbSwgYW5pbWF0aW9uLCBmcmFtZSkge1xuICAgIHZhciBzaGFkZXIgPSBhc3NldHMuc2hhZGVycy5tb2RlbDtcbiAgICBhbmltYXRpb24gPSBhbmltYXRpb24gfCAwO1xuICAgIGZyYW1lID0gZnJhbWUgfCAwO1xuICAgIHNoYWRlci51c2UoKTtcblxuICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLmlkKTtcbiAgICB0aGlzLnNraW5zWzBdLmJpbmQoMCk7XG5cbiAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKHNoYWRlci5hdHRyaWJ1dGVzLnZlcnRleEF0dHJpYnV0ZSwgMywgZ2wuRkxPQVQsIGZhbHNlLCB0aGlzLnN0cmlkZSwgMCk7XG4gICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihzaGFkZXIuYXR0cmlidXRlcy50ZXhDb29yZHNBdHRyaWJ1dGUsIDIsIGdsLkZMT0FULCBmYWxzZSwgdGhpcy5zdHJpZGUsIDEyKTtcbiAgICBnbC51bmlmb3JtTWF0cml4NGZ2KHNoYWRlci51bmlmb3Jtcy5tb2RlbHZpZXdNYXRyaXgsIGZhbHNlLCBtKTtcbiAgICBnbC51bmlmb3JtTWF0cml4NGZ2KHNoYWRlci51bmlmb3Jtcy5wcm9qZWN0aW9uTWF0cml4LCBmYWxzZSwgcCk7XG5cbiAgICBmcmFtZSArPSB0aGlzLmFuaW1hdGlvbnNbYW5pbWF0aW9uXS5maXJzdEZyYW1lO1xuICAgIGlmIChmcmFtZSA+PSB0aGlzLmFuaW1hdGlvbnNbYW5pbWF0aW9uXS5mcmFtZUNvdW50KVxuICAgICAgICBmcmFtZSA9IDA7XG5cbiAgICBnbC51bmlmb3JtMWkoc2hhZGVyLnVuaWZvcm1zLnRleHR1cmVNYXAsIDApO1xuICAgIGdsLmRyYXdBcnJheXMoZ2wuVFJJQU5HTEVTLCB+fmZyYW1lICogKHRoaXMuZmFjZUNvdW50ICogMyksIHRoaXMuZmFjZUNvdW50ICogMyk7XG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIG51bGwpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gTW9kZWw7XG59KS5jYWxsKHRoaXMscmVxdWlyZShcIjFZaVo1U1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL21vZGVsLmpzXCIsXCIvXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuXG52YXIgUHJvdG9jb2wgPSB7XG4gICAgc2VydmVyQmFkOiAwLFxuICAgIHNlcnZlck5vcDogMSxcbiAgICBzZXJ2ZXJEaXNjb25uZWN0OiAyLFxuICAgIHNlcnZlclVwZGF0ZVN0YXQ6IDMsXG4gICAgc2VydmVyVmVyc2lvbjogNCxcbiAgICBzZXJ2ZXJTZXRWaWV3OiA1LFxuICAgIHNlcnZlclNvdW5kOiA2LFxuICAgIHNlcnZlclRpbWU6IDcsXG4gICAgc2VydmVyUHJpbnQ6IDgsXG4gICAgc2VydmVyU3R1ZmZUZXh0OiA5LFxuICAgIHNlcnZlclNldEFuZ2xlOiAxMCxcbiAgICBzZXJ2ZXJJbmZvOiAxMSxcbiAgICBzZXJ2ZXJMaWdodFN0eWxlOiAxMixcbiAgICBzZXJ2ZXJVcGRhdGVOYW1lOiAxMyxcbiAgICBzZXJ2ZXJVcGRhdGVGcmFnczogMTQsXG4gICAgc2VydmVyQ2xpZW50RGF0YTogMTUsXG4gICAgc2VydmVyU3RvcFNvdW5kOiAxNixcbiAgICBzZXJ2ZXJVcGRhdGVDb2xvcnM6IDE3LFxuICAgIHNlcnZlclBhcnRpY2xlOiAxOCxcbiAgICBzZXJ2ZXJEYW1hZ2U6IDE5LFxuICAgIHNlcnZlclNwYXduU3RhdGljOiAyMCxcbiAgICBzZXJ2ZXJTcGF3bkJhc2VsaW5lOiAyMixcbiAgICBzZXJ2ZXJUZW1wRW50aXR5OiAyMyxcbiAgICBzZXJ2ZXJTZXRQYXVzZTogMjQsXG4gICAgc2VydmVyU2lnbm9uTnVtOiAyNSxcbiAgICBzZXJ2ZXJDZW50ZXJQcmludDogMjYsXG4gICAgc2VydmVyS2lsbGVkTW9uc3RlcjogMjcsXG4gICAgc2VydmVyRm91bmRTZWNyZXQ6IDI4LFxuICAgIHNlcnZlclNwYXduU3RhdGljU291bmQ6IDI5LFxuICAgIHNlcnZlckNkVHJhY2s6IDMyLFxuICAgIFxuICAgIGNsaWVudFZpZXdIZWlnaHQ6IDEsXG4gICAgY2xpZW50SWRlYWxQaXRjaDogMixcbiAgICBjbGllbnRQdW5jaDE6IDQsXG4gICAgY2xpZW50UHVuY2gyOiA4LFxuICAgIGNsaWVudFB1bmNoMzogMTYsXG4gICAgY2xpZW50VmVsb2NpdHkxOiAzMixcbiAgICBjbGllbnRWZWxvY2l0eTI6IDY0LFxuICAgIGNsaWVudFZlbG9jaXR5MzogMTI4LFxuICAgIGNsaWVudEFpbWVudDogMjU2LFxuICAgIGNsaWVudEl0ZW1zOiA1MTIsXG4gICAgY2xpZW50T25Hcm91bmQ6IDEwMjQsXG4gICAgY2xpZW50SW5XYXRlcjogMjA0OCxcbiAgICBjbGllbnRXZWFwb25GcmFtZTogNDA5NixcbiAgICBjbGllbnRBcm1vcjogODE5MixcbiAgICBjbGllbnRXZWFwb246IDE2Mzg0LFxuXG4gICAgZmFzdFVwZGF0ZU1vcmVCaXRzOiAxLFxuICAgIGZhc3RVcGRhdGVPcmlnaW4xOiAyLFxuICAgIGZhc3RVcGRhdGVPcmlnaW4yOiA0LFxuICAgIGZhc3RVcGRhdGVPcmlnaW4zOiA4LFxuICAgIGZhc3RVcGRhdGVBbmdsZTI6IDE2LFxuICAgIGZhc3RVcGRhdGVOb0xlcnA6IDMyLFxuICAgIGZhc3RVcGRhdGVGcmFtZTogNjQsXG4gICAgZmFzdFVwZGF0ZVNpZ25hbDogMTI4LFxuICAgIGZhc3RVcGRhdGVBbmdsZTE6IDI1NixcbiAgICBmYXN0VXBkYXRlQW5nbGUzOiA1MTIsXG4gICAgZmFzdFVwZGF0ZU1vZGVsOiAxMDI0LFxuICAgIGZhc3RVcGRhdGVDb2xvck1hcDogMjA0OCxcbiAgICBmYXN0VXBkYXRlU2tpbjogNDA5NixcbiAgICBmYXN0VXBkYXRlRWZmZWN0czogODE5MixcbiAgICBmYXN0VXBkYXRlTG9uZ0VudGl0eTogMTYzODQsXG5cbiAgICBzb3VuZFZvbHVtZTogMSxcbiAgICBzb3VuZEF0dGVudWF0aW9uOiAyLFxuICAgIHNvdW5kTG9vcGluZzogNCxcblxuICAgIHRlbXBTcGlrZTogMCxcbiAgICB0ZW1wU3VwZXJTcGlrZTogMSxcbiAgICB0ZW1wR3VuU2hvdDogMixcbiAgICB0ZW1wRXhwbG9zaW9uOiAzLFxuICAgIHRlbXBUYXJFeHBsb3Npb246IDQsXG4gICAgdGVtcExpZ2h0bmluZzE6IDUsXG4gICAgdGVtcExpZ2h0bmluZzI6IDYsXG4gICAgdGVtcFdpelNwaWtlOiA3LFxuICAgIHRlbXBLbmlnaHRTcGlrZTogOCxcbiAgICB0ZW1wTGlnaHRuaW5nMzogOSxcbiAgICB0ZW1wTGF2YVNwbGFzaDogMTAsXG4gICAgdGVtcFRlbGVwb3J0OiAxMSxcbiAgICB0ZW1wRXhwbG9zaW9uMjogMTJcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IFByb3RvY29sO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIjFZaVo1U1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL3Byb3RvY29sLmpzXCIsXCIvXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuXG52YXIgc2V0dGluZ3MgPSB7XG4gICAgdmVyc2lvbjogJzAuMScsXG4gICAgbWFwTmFtZXM6IHtcbiAgICAgICAgc3RhcnQ6ICdFbnRyYW5jZScsXG4gICAgICAgIGUxbTE6ICdTbGlwZ2F0ZSBDb21wbGV4JyxcbiAgICAgICAgZTFtMjogJ0Nhc3RsZSBvZiB0aGUgRGFtbmVkJyxcbiAgICAgICAgZTFtMzogJ1RoZSBOZWNyb3BvbGlzJyxcbiAgICAgICAgZTFtNDogJ1RoZSBHcmlzbHkgR3JvdHRvJyxcbiAgICAgICAgZTFtNTogJ0dsb29tIEtlZXAnLFxuICAgICAgICBlMW02OiAnVGhlIERvb3IgVG8gQ2h0aG9uJyxcbiAgICAgICAgZTFtNzogJ1RoZSBIb3VzZSBvZiBDaHRob24nLFxuICAgICAgICBlMW04OiAnWmlnZ3VyYXQgVmVydGlnbydcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBzZXR0aW5ncztcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiMVlpWjVTXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvc2V0dGluZ3MuanNcIixcIi9cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgU3ByaXRlcyA9IHJlcXVpcmUoJ2dsL3Nwcml0ZXMnKTtcbnZhciBGb250ID0gcmVxdWlyZSgnZ2wvZm9udCcpO1xudmFyIGFzc2V0cyA9IHJlcXVpcmUoJ2Fzc2V0cycpO1xudmFyIHNldHRpbmdzID0gcmVxdWlyZSgnc2V0dGluZ3MnKTtcblxudmFyIENvbnNvbGUgPSBmdW5jdGlvbigpIHtcbiAgIHZhciBmb250VGV4dHVyZSA9IGFzc2V0cy5sb2FkKCd3YWQvQ09OQ0hBUlMnLCB7IHdpZHRoOiAxMjgsIGhlaWdodDogMTI4LCBhbHBoYTogdHJ1ZSB9KTtcbiAgIHZhciBmb250ID0gbmV3IEZvbnQoZm9udFRleHR1cmUsIDgsIDgpO1xuXG4gICB2YXIgYmFja2dyb3VuZFRleHR1cmUgPSBhc3NldHMubG9hZCgncGFrL2dmeC9jb25iYWNrLmxtcCcpO1xuICAgYmFja2dyb3VuZFRleHR1cmUuZHJhd1RvKGZ1bmN0aW9uKHApIHtcbiAgICAgIGdsLmVuYWJsZShnbC5CTEVORCk7XG4gICAgICB2YXIgdmVyc2lvbiA9ICdXZWJHTCAnICsgc2V0dGluZ3MudmVyc2lvbjtcbiAgICAgIGZvbnQuZHJhd1N0cmluZyhnbC53aWR0aCAqIDAuNywgZ2wuaGVpZ2h0ICogMC45MywgdmVyc2lvbiwgMSk7XG4gICAgICBmb250LnJlbmRlcihhc3NldHMuc2hhZGVycy50ZXh0dXJlMmQsIHApO1xuICAgfSk7XG4gICB2YXIgYmFja2dyb3VuZCA9IG5ldyBTcHJpdGVzKDMyMCwgMjAwKTtcbiAgIGJhY2tncm91bmQudGV4dHVyZXMuYWRkU3ViVGV4dHVyZShiYWNrZ3JvdW5kVGV4dHVyZSk7XG4gICBiYWNrZ3JvdW5kLnRleHR1cmVzLmNvbXBpbGUoYXNzZXRzLnNoYWRlcnMudGV4dHVyZTJkKTtcblxuICAgdGhpcy5mb250ID0gZm9udDtcbiAgIHRoaXMuYmFja2dyb3VuZCA9IGJhY2tncm91bmQ7XG59O1xuXG5Db25zb2xlLnByb3RvdHlwZS5wcmludCA9IGZ1bmN0aW9uKG1zZykge1xuICAgdGhpcy5mb250LmRyYXdTdHJpbmcoNDAsIDQwLCBtc2cpO1xufTtcblxuQ29uc29sZS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKHApIHtcblxuICAgdGhpcy5iYWNrZ3JvdW5kLmNsZWFyKCk7XG4gICB0aGlzLmJhY2tncm91bmQuZHJhd1Nwcml0ZSgwLCAwLCAtNDAwLCBnbC53aWR0aCwgZ2wuaGVpZ2h0LCAxLCAxLCAxLCAxLjApO1xuICAgdGhpcy5iYWNrZ3JvdW5kLnJlbmRlcihhc3NldHMuc2hhZGVycy5jb2xvcjJkLCBwKTtcblxuICAgZ2wuZW5hYmxlKGdsLkJMRU5EKTtcbiAgIHRoaXMuZm9udC5yZW5kZXIoYXNzZXRzLnNoYWRlcnMudGV4dHVyZTJkLCBwKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IENvbnNvbGU7XG59KS5jYWxsKHRoaXMscmVxdWlyZShcIjFZaVo1U1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL3VpL2NvbnNvbGUuanNcIixcIi91aVwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbnZhciBTcHJpdGVzID0gcmVxdWlyZSgnZ2wvc3ByaXRlcycpO1xudmFyIGFzc2V0cyA9IHJlcXVpcmUoJ2Fzc2V0cycpO1xuXG52YXIgU3RhdHVzQmFyID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zcHJpdGVzID0gbmV3IFNwcml0ZXMoNTEyLCA1MTIsIDY0KTtcblxuICAgIHRoaXMuYmFja2dyb3VuZCA9IHRoaXMubG9hZFBpYygnU0JBUicpO1xuICAgIHRoaXMubnVtYmVycyA9IFtdO1xuICAgIHRoaXMucmVkTnVtYmVycyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTA7IGkrKykge1xuICAgICAgICB0aGlzLm51bWJlcnMucHVzaCh0aGlzLmxvYWRQaWMoJ05VTV8nICsgaSkpO1xuICAgICAgICB0aGlzLnJlZE51bWJlcnMucHVzaCh0aGlzLmxvYWRQaWMoJ0FOVU1fJyArIGkpKTtcbiAgICB9XG5cbiAgICB0aGlzLndlYXBvbnMgPSBuZXcgQXJyYXkoNyk7XG4gICAgdGhpcy53ZWFwb25zWzBdID0gdGhpcy5sb2FkV2VhcG9uKCdTSE9UR1VOJyk7XG4gICAgdGhpcy53ZWFwb25zWzFdID0gdGhpcy5sb2FkV2VhcG9uKCdTU0hPVEdVTicpO1xuICAgIHRoaXMud2VhcG9uc1syXSA9IHRoaXMubG9hZFdlYXBvbignTkFJTEdVTicpO1xuICAgIHRoaXMud2VhcG9uc1szXSA9IHRoaXMubG9hZFdlYXBvbignU05BSUxHVU4nKTtcbiAgICB0aGlzLndlYXBvbnNbNF0gPSB0aGlzLmxvYWRXZWFwb24oJ1JMQVVOQ0gnKTtcbiAgICB0aGlzLndlYXBvbnNbNV0gPSB0aGlzLmxvYWRXZWFwb24oJ1NSTEFVTkNIJyk7XG4gICAgdGhpcy53ZWFwb25zWzZdID0gdGhpcy5sb2FkV2VhcG9uKCdMSUdIVE5HJyk7XG5cbiAgICB0aGlzLmZhY2VzID0gbmV3IEFycmF5KDUpO1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDw9IDU7IGkrKylcbiAgICAgICAgdGhpcy5mYWNlc1tpIC0gMV0gPSB7IG5vcm1hbDogdGhpcy5sb2FkUGljKCdGQUNFJyArIGkpLCBwYWluOiB0aGlzLmxvYWRQaWMoJ0ZBQ0VfUCcgKyBpKSB9O1xuXG4gICAgdGhpcy5zcHJpdGVzLnRleHR1cmVzLmNvbXBpbGUoYXNzZXRzLnNoYWRlcnMudGV4dHVyZTJkKTtcbn07XG5cblN0YXR1c0Jhci5wcm90b3R5cGUubG9hZFBpYyA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgdGV4dHVyZSA9IGFzc2V0cy5sb2FkKCd3YWQvJyArIG5hbWUpO1xuICAgIHJldHVybiB0aGlzLnNwcml0ZXMudGV4dHVyZXMuYWRkU3ViVGV4dHVyZSh0ZXh0dXJlKTtcbn07XG5cblN0YXR1c0Jhci5wcm90b3R5cGUuZHJhd1BpYyA9IGZ1bmN0aW9uKGluZGV4LCB4LCB5KSB7XG4gICAgdGhpcy5zcHJpdGVzLmRyYXdTcHJpdGUoaW5kZXgsIHgsIHksIDAsIDAsIDEsIDEsIDEsIDEpO1xufTtcblxuU3RhdHVzQmFyLnByb3RvdHlwZS5sb2FkV2VhcG9uID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB2YXIgd2VhcG9uID0ge307XG4gICAgd2VhcG9uLm93bmVkID0gdGhpcy5sb2FkUGljKCdJTlZfJyArIG5hbWUpO1xuICAgIHdlYXBvbi5hY3RpdmUgPSB0aGlzLmxvYWRQaWMoJ0lOVjJfJyArIG5hbWUpO1xuICAgIHdlYXBvbi5mbGFzaGVzID0gbmV3IEFycmF5KDUpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNTsgaSsrKVxuICAgICAgICB3ZWFwb24uZmxhc2hlc1tpXSA9IHRoaXMubG9hZFBpYygnSU5WQScgKyAoaSArIDEpICsgJ18nICsgbmFtZSk7XG4gICAgcmV0dXJuIHdlYXBvbjtcbn07XG5cblN0YXR1c0Jhci5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKHApIHtcbiAgICB0aGlzLnNwcml0ZXMuY2xlYXIoKTtcblxuICAgIHZhciBsZWZ0ID0gZ2wud2lkdGggLyAyIC0gMTYwO1xuICAgIHRoaXMuZHJhd1BpYyh0aGlzLmJhY2tncm91bmQsIGxlZnQsIGdsLmhlaWdodCAtIDI4KTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDc7IGkrKylcbiAgICAgICAgdGhpcy5kcmF3UGljKHRoaXMud2VhcG9uc1tpXS5vd25lZCwgbGVmdCArIGkgKiAyNCwgZ2wuaGVpZ2h0IC0gNDIpO1xuXG4gICAgdGhpcy5zcHJpdGVzLnJlbmRlcihhc3NldHMuc2hhZGVycy5jb2xvcjJkLCBwKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IFN0YXR1c0Jhcjtcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiMVlpWjVTXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvdWkvc3RhdHVzYmFyLmpzXCIsXCIvdWlcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgVXRpbHMgPSB7fTtcblxuVXRpbHMuZ2V0RXh0ZW5zaW9uID0gZnVuY3Rpb24ocGF0aCkge1xuICAgIHZhciBpbmRleCA9IHBhdGgubGFzdEluZGV4T2YoJy4nKTtcbiAgICBpZiAoaW5kZXggPT09IC0xKSByZXR1cm4gJyc7XG4gICAgcmV0dXJuIHBhdGguc3Vic3RyKGluZGV4ICsgMSk7XG59O1xuXG5VdGlscy50cmlhbmd1bGF0ZSA9IGZ1bmN0aW9uKHBvaW50cykge1xuICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICBwb2ludHMucG9wKCk7XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBwb2ludHMubGVuZ3RoIC0gMjsgaSArPSAyKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKHBvaW50c1tpICsgMl0pO1xuICAgICAgICByZXN1bHQucHVzaChwb2ludHNbaV0pO1xuICAgICAgICByZXN1bHQucHVzaChwb2ludHNbMF0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuVXRpbHMucXVha2VJZGVudGl0eSA9IGZ1bmN0aW9uKGEpIHtcbiAgICBhWzBdID0gMDsgYVs0XSA9IDE7IGFbOF0gPSAwOyBhWzEyXSA9IDA7XG4gICAgYVsxXSA9IDA7IGFbNV0gPSAwOyBhWzldID0gLTE7IGFbMTNdID0gMDtcbiAgICBhWzJdID0gLTE7IGFbNl0gPSAwOyBhWzEwXSA9IDA7IGFbMTRdID0gMDtcbiAgICBhWzNdID0gMDsgYVs3XSA9IDA7IGFbMTFdID0gMDsgYVsxNV0gPSAxO1xuICAgIHJldHVybiBhO1xufTtcblxuVXRpbHMuZGVnMlJhZCA9IGZ1bmN0aW9uKGRlZ3JlZXMpIHtcbiAgICByZXR1cm4gZGVncmVlcyAqIE1hdGguUEkgLyAxODA7XG59O1xuXG5VdGlscy5yYWQyRGVnID0gZnVuY3Rpb24oZGVncmVlcykge1xuICAgIHJldHVybiBkZWdyZWVzIC8gTWF0aC5QSSAqIDE4MDtcbn07XG5cblxuVXRpbHMuaXNQb3dlck9mMiA9IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4gKHggJiAoeCAtIDEpKSA9PSAwO1xufTtcblxuVXRpbHMubmV4dFBvd2VyT2YyID0gZnVuY3Rpb24oeCkge1xuICAgIC0teDtcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IDMyOyBpIDw8PSAxKSB7XG4gICAgICAgIHggPSB4IHwgeCA+PiBpO1xuICAgIH1cbiAgICByZXR1cm4geCArIDE7XG59O1xuXG5VdGlscy5hcnJheTFkID0gZnVuY3Rpb24od2lkdGgpIHtcbiAgICB2YXIgcmVzdWx0ID0gbmV3IEFycmF5KHdpZHRoKTtcbiAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHdpZHRoOyB4KyspIHJlc3VsdFt4XSA9IDA7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cblV0aWxzLmFycmF5MmQgPSBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0KSB7XG4gICAgdmFyIHJlc3VsdCA9IG5ldyBBcnJheShoZWlnaHQpO1xuICAgIGZvciAodmFyIHkgPSAwOyB5IDwgaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgcmVzdWx0W3ldID0gbmV3IEFycmF5KHdpZHRoKTtcbiAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCB3aWR0aDsgeCsrKVxuICAgICAgICAgICAgcmVzdWx0W3ldW3hdID0gMDtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IFV0aWxzO1xuXG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiMVlpWjVTXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvdXRpbHMuanNcIixcIi9cIikiXX0=
