
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

        var data = file.readString(this.skinWidth * this.skinHeight);
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