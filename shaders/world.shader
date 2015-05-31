
[vertex]
    precision mediump float;
    attribute vec3 vertexAttribute;
    attribute vec2 texCoordsAttribute;
    attribute vec2 shadowTexCoordsAttribute;
    uniform mat4 modelviewMatrix;
    uniform mat4 projectionMatrix;

    varying vec2 texCoords;
    varying vec2 shadowTexCoords;

    void main(void) {
        gl_Position = projectionMatrix * modelviewMatrix * vec4(vertexAttribute, 1.0);
        texCoords = texCoordsAttribute;
        shadowTexCoords = shadowTexCoordsAttribute;
    }

[fragment]
    precision mediump float;
    varying vec2 texCoords;
    varying vec2 shadowTexCoords;
    uniform sampler2D textureMap;
    uniform sampler2D lightMap;

    void main(void) {
        gl_FragColor = texture2D(textureMap, texCoords);
    }

