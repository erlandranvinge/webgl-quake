
[vertex]
    attribute vec3 vertexAttribute;
    attribute vec2 texCoordsAttribute;
    attribute vec4 colorsAttribute;
    uniform mat4 projectionMatrix;
    varying vec2 texCoords;
    varying vec4 colors;
    void main(void) {
        gl_Position = projectionMatrix * vec4(vertexAttribute, 1.0);
        texCoords = texCoordsAttribute;
        colors = colorsAttribute;
    }

[fragment]
    precision mediump float;
    varying vec2 texCoords;
    varying vec4 colors;
    uniform sampler2D sampler1;
    void main(void) {
        gl_FragColor = texture2D(sampler1, texCoords.xy) * colors;
    }
