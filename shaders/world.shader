
[vertex]
    precision mediump float;
    attribute vec3 vertexAttribute;
    uniform mat4 modelviewMatrix;
    uniform mat4 projectionMatrix;

    void main(void) {
        gl_Position = projectionMatrix * modelviewMatrix * vec4(vertexAttribute, 1.0);
    }

[fragment]
    precision mediump float;

    void main(void) {
        gl_FragColor = vec4(1.0);//texture2D(textureMap, texCoords);
    }

