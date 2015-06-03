
[vertex]
attribute vec3 vertexAttribute;
attribute vec2 texCoordsAttribute;
uniform mat4 modelviewMatrix;
uniform mat4 projectionMatrix;
varying vec2 texCoords;
void main(void) {
    gl_Position = projectionMatrix * modelviewMatrix * vec4(vertexAttribute, 1.0);
    texCoords = texCoordsAttribute;
}

[fragment]
    precision mediump float;
    varying vec2 texCoords;
    uniform sampler2D sampler1;
    void main(void) {
        gl_FragColor = texture2D(sampler1, texCoords.xy);
    }