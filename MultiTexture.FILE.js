// MultiTexture.js (c) 2012 matsuda and kanda
// Edited by Hanming Wang to showcase the HTML Drag and Drop API

// DOM objects
const skyLoaderViewDom = document.getElementById("sky-loader-view");
/** @type {HTMLInputElement} */
const skyLoaderDom = document.getElementById("sky-loader");
const circleLoaderViewDom = document.getElementById("circle-loader-view");
/** @type {HTMLInputElement} */
const circleLoaderDom = document.getElementById("circle-loader");

// Vertex shader program
var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec2 a_TexCoord;
    varying vec2 v_TexCoord;
    void main() {
        gl_Position = a_Position;
        v_TexCoord = a_TexCoord;
    }
`;

// Fragment shader program
var FSHADER_SOURCE = `
    #ifdef GL_ES
    precision mediump float;
    #endif
    uniform sampler2D u_Sampler0;
    uniform sampler2D u_Sampler1;
    varying vec2 v_TexCoord;
    void main() {
        vec4 color0 = texture2D(u_Sampler0, v_TexCoord);
        vec4 color1 = texture2D(u_Sampler1, v_TexCoord);
        gl_FragColor = color0 * color1;
    }
`;

function main() {
    // Retrieve <canvas> element
    var canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // Set the vertex information
    var n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('Failed to set the vertex information');
        return;
    }

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Set texture
    if (!initTextures(gl, n)) {
        console.log('Failed to intialize the texture.');
        return;
    }
}

function initVertexBuffers(gl) {
    var verticesTexCoords = new Float32Array([
        // Vertex coordinate, Texture coordinate
        -0.5, 0.5, 0.0, 1.0,
        -0.5, -0.5, 0.0, 0.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, -0.5, 1.0, 0.0,
    ]);
    var n = 4; // The number of vertices

    // Create a buffer object
    var vertexTexCoordBuffer = gl.createBuffer();
    if (!vertexTexCoordBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    // Write the positions of vertices to a vertex shader
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);

    var FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;
    //Get the storage location of a_Position, assign and enable buffer
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
    gl.enableVertexAttribArray(a_Position);  // Enable the assignment of the buffer object

    // Get the storage location of a_TexCoord
    var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
    if (a_TexCoord < 0) {
        console.log('Failed to get the storage location of a_TexCoord');
        return -1;
    }
    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
    gl.enableVertexAttribArray(a_TexCoord);  // Enable the buffer assignment

    return n;
}

function initTextures(gl, n) {
    // Create a texture object
    var texture0 = gl.createTexture();
    var texture1 = gl.createTexture();
    if (!texture0 || !texture1) {
        console.log('Failed to create the texture object');
        return false;
    }

    // Get the storage location of u_Sampler0 and u_Sampler1
    var u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    var u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if (!u_Sampler0 || !u_Sampler1) {
        console.log('Failed to get the storage location of u_Sampler');
        return false;
    }

    // Method 1: load an image by clicking on a file input button
    // The `change` event is triggered after the user selects a file from the pop-up window.
    skyLoaderDom.addEventListener("change", (event) => {
        // `FileReader` doc: https://developer.mozilla.org/en-US/docs/Web/API/FileReader
        const reader = new FileReader();
        // The `loadend` event is triggered after the file reader finishes loading the file.
        reader.addEventListener("loadend", () => {
            // `Image` doc: https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/Image
            const image = new Image();
            // The `loadend` event is triggered after the image finishes loading.
            image.addEventListener("load", () => {
                loadTexture(gl, n, texture0, u_Sampler0, image, 0);
            })
            // Check the next comment for what `reader.result` stores.
            image.src = reader.result;
        });
        // By calling the `readAsDataURL` method, `reader.result` will store the base-64-encoded-url form of the content of the file being loaded.
        // `FileReader.readAsDataURL` doc: https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL
        // `event.target.files` stores the files loaded.
        reader.readAsDataURL(event.target.files[0]);
    });
    // The codes below are virtually the same as those above:
    circleLoaderDom.addEventListener("change", (event) => {
        const reader = new FileReader();
        reader.addEventListener("loadend", () => {
            const image = new Image();
            image.addEventListener("load", () => {
                loadTexture(gl, n, texture1, u_Sampler1, image, 1);
            })
            image.src = reader.result;
        });
        reader.readAsDataURL(event.target.files[0]);
    });

    // Method 2: load an image by dragging and dropping a file
    // The following codes are merely a simple demonstration of the HTML Drag and Drop API.
    // Check https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API for the complete documentation and best practices.
    // The default behavior of dragging an dropping a file to a browser is to open it with the browser. We'd like to disable that:
    window.addEventListener("dragover", (event) => {
        event.preventDefault();
    });
    window.addEventListener("drop", (event) => {
        event.preventDefault();
    });
    // Now add the `drop` event handlers to the corresponding regions (HTML elements):
    skyLoaderViewDom.addEventListener("drop", (event) => {
        const reader = new FileReader();
        reader.addEventListener("loadend", () => {
            const image = new Image();
            image.addEventListener("load", () => {
                loadTexture(gl, n, texture0, u_Sampler0, image, 0);
            })
            image.src = reader.result;
        });
        // `event.dataTransfer.files` stores the files loaded.
        reader.readAsDataURL(event.dataTransfer.files[0]);
    })
    circleLoaderViewDom.addEventListener("drop", (event) => {
        const reader = new FileReader();
        reader.addEventListener("loadend", () => {
            const image = new Image();
            image.addEventListener("load", () => {
                loadTexture(gl, n, texture1, u_Sampler1, image, 1);
            })
            image.src = reader.result;
        });
        reader.readAsDataURL(event.dataTransfer.files[0]);
    })

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    return true;
}
// Specify whether the texture unit is ready to use
var g_texUnit0 = false, g_texUnit1 = false;
function loadTexture(gl, n, texture, u_Sampler, image, texUnit) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);// Flip the image's y-axis
    // Make the texture unit active
    if (texUnit == 0) {
        gl.activeTexture(gl.TEXTURE0);
        g_texUnit0 = true;
    } else {
        gl.activeTexture(gl.TEXTURE1);
        g_texUnit1 = true;
    }
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the image to texture
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    gl.uniform1i(u_Sampler, texUnit);   // Pass the texture unit to u_Sampler

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (g_texUnit0 && g_texUnit1) {
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);   // Draw the rectangle
    }
}
