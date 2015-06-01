
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
    const float brightness = 1.4;
    void main(void) {

        float intensity = 1.0 - texture2D(lightMap, shadowTexCoords.xy).x;
        gl_FragColor = vec4(texture2D(textureMap, texCoords).xyz * intensity, 1.0) * brightness;
    }

