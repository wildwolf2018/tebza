import {toRadian, identity, rotate, lookAt, perspective} from "./maths.js"

const vertexShaderSource = ["precision mediump float;", "", "attribute vec3 vertexPos;", "", "attribute vec2 a_TextCoords;", "", "uniform mat4 mProj;", "", "uniform mat4 mView;", "", "uniform mat4 mWorld;", "","varying vec2 textCoords;", "", "void main()", "{", "textCoords = a_TextCoords;", "gl_Position = mProj * mView * mWorld * vec4(vertexPos, 1.0);}"].join('\n')

const fragmentShaderSource = [	"precision mediump float;", "", "varying vec2 textCoords;","","uniform sampler2D sampler;", "", "void main()", "{", "gl_FragColor = texture2D(sampler, textCoords);", "}"].join('\n')

const canvas = document.querySelector("#drawing_surface")

const gl = canvas.getContext("webgl")
if(!gl){
				console.log("Failed to get rendering context for WebGL")
}

// Initialize WebGL
gl.enable(gl.DEPTH_TEST)
gl.enable(gl.CULL_FACE)
gl.frontFace(gl.CCW)
gl.cullFace(gl.BACK)
				
// Creating shaders
let vertexShader = gl.createShader(gl.VERTEX_SHADER)
let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)

gl.shaderSource(vertexShader, vertexShaderSource)
gl.shaderSource(fragmentShader, fragmentShaderSource)

// Compiling shaders
gl.compileShader(vertexShader)
if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
				console.error("Error in compiling vertex shader", gl.getShaderInfoLog(vertexShader))
}

gl.compileShader(fragmentShader)
if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
				console.error("Error in compiling fragment shader", gl.getShaderInfoLog(fragmentShader))
}

// Creating ang linking program
let program = gl.createProgram()
gl.attachShader(program, vertexShader)
gl.attachShader(program, fragmentShader)
gl.linkProgram(program)

if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
				console.error("Error in linking program", gl.getProgramInfoLog(program))
}
gl.validateProgram(program)
if(!gl.getProgramParameter(program, gl.VALIDATE_STATUS)){
				console.error("Error in validating program", gl.getProgramInfoLog(program))
}

let vertices = new Float32Array([/*Back*/1.0, 1.0, 1.0, 1.0, 1.0,   -1.0, 1.0, 1.0, 0.0, 1.0,   -1.0, -1.0, 1.0, 0.0, 0.0,   1.0, -1.0, 1.0, 1.0, 0.0,/*Right*/1.0, 1.0, 1.0, 0.0, 1.0,   1.0, -1.0, 1.0, 0.0, 0.0,   1.0, -1.0, -1.0, 1.0, 0.0,   1.0, 1.0, -1.0, 1.0, 1.0,/*Up*/1.0, 1.0, 1.0, 0.0, 1.0,   1.0, 1.0, -1.0, 0.0, 0.0,   -1.0, 1.0, -1.0, 1.0, 0.0,   -1.0, 1.0, 1.0, 1.0, 1.0,/*Left*/  -1.0, 1.0, 1.0, 1.0, 1.0,   -1.0, 1.0, -1.0, 0.0, 1.0,   -1.0, -1.0, -1.0, 0.0, 0.0,   -1.0, -1.0, 1.0, 1.0, 0.0,/*Bottom*/ -1.0, -1.0, 1.0, 1.0, 0.0,   -1.0, -1.0, -1.0, 1.0, 1.0,  1.0, -1.0, -1.0, 0.0, 1.0,  1.0, -1.0, 1.0, 0.0, 0.0,/*Front*/1.0, -1.0, -1.0, 0.0, 0.0,   -1.0, -1.0, -1.0, 1.0, 0.0,   -1.0, 1.0, -1.0, 1.0, 1.0,   1.0, 1.0, -1.0, 0.0, 1.0]);
 
let colors = new Float32Array([/*Back*/0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,/*Right*/0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,/*Up*/ 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,/*Left*/  1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0,/*Bottom*/ 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,/*Front*/  0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0]);

let indices = new Uint8Array([/*Back*/0, 1, 2,  0, 2, 3,/*Right*/   4, 5, 6,  4, 6, 7,/*Up*/   8, 9, 10, 8, 10, 11,/*Left*/   12, 13, 14,  12, 14, 15,/*Bottom*/   16, 17, 18,  16, 18, 19,/*Front*/   20, 21, 22,  20, 22, 23]);

// Write position data to the vertex buffer
let vertexBufferObj = gl.createBuffer()  
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObj) 
// Send vertex data to WebGL buffer
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW) 
// Get locations of attributes in vertex shader
const vertexPos = gl.getAttribLocation(program, "vertexPos")
// Bind buffer to attributes in shader
gl.vertexAttribPointer(vertexPos, 3, gl.FLOAT, false, 5 * Float32Array.BYTES_PER_ELEMENT, 0)
// Enable the attributes bindings
gl.enableVertexAttribArray(vertexPos);

// Bind buffer to attributes in shader
const a_TextCoords = gl.getAttribLocation(program, "a_TextCoords")
gl.vertexAttribPointer(a_TextCoords, 2, gl.FLOAT, false, 5 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT)
// Enable the attributes bindings
gl.enableVertexAttribArray(a_TextCoords);



// Write data into the color buffer
//let colorBuffer = gl.createBuffer()
//gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)

//gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW) 

//const vertexColor = gl.getAttribLocation(program, "vertexColor")
// Bind buffer to attributes in shader
//gl.vertexAttribPointer(vertexColor, 3, gl.FLOAT, false, 3 * Float32Array.BYTES_PER_ELEMENT, 0)
//gl.enableVertexAttribArray(vertexColor);

/* Write the indices data to the indices buffer*/
let indexBuffer = gl.createBuffer()
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

// Get locations of uniforms
gl.useProgram(program)
 let sampler = gl.getUniformLocation(program, "sampler")
let mProj = gl.getUniformLocation(program, "mProj")
let mView = gl.getUniformLocation(program, "mView")
let mWorld = gl.getUniformLocation(program, "mWorld")

// Create texture.
let textureObj = gl.createTexture()
let image = new Image()
image.src ="./hunter_shot.jpg"
image.onload = () => {
  loadTexture(textureObj, image)
}

function loadTexture(textureObj){
// Flip theimage's y axis
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1) 

gl.activeTexture(gl.TEXTURE0)
gl.bindTexture(gl.TEXTURE_2D, textureObj)
// Set texture parameters
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR) 
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);  
   
// Set the texture image      
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image)
gl.bindTexture(gl.TEXTURE_2D, null)
}
// Set tuxture unit 0 to the sampler
gl.uniform1i(sampler, 0);

let projMatrix = new Float32Array(16) // Projection matrix
let viewMatrix = new Float32Array(16) // View matrix
let worldMatrix = new Float32Array(16) // World matrix

identity(worldMatrix)
lookAt(viewMatrix, [0, 0, -5], [0, 0, 0], [0, 1, 0])
perspective(projMatrix, toRadian(45), canvas.width / canvas.height, 0.1, 1000.0)
// Send data to uniforms in vertex shader
   gl.uniformMatrix4fv(mProj, false, projMatrix);
   gl.uniformMatrix4fv(mView, false, viewMatrix);
 
let identityM = new Float32Array(16)
identity(identityM)
let angle = 0	
 
function loop(){
    angle = performance.now() / 1000 / 6 * 2 * Math.PI
   rotate(worldMatrix, identityM, angle, [1, 1, 1])
    gl.uniformMatrix4fv(mWorld, false, worldMatrix);
      
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT| gl.DEPTH_BUFFER_BIT)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, textureObj)
    
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0)
    requestAnimationFrame(loop)
}
requestAnimationFrame(loop)





