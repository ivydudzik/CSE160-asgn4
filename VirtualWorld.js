// HelloCube.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;

  attribute vec4 a_Position;
  attribute vec2 a_UV;

  varying vec2 v_UV;
  void main() {
    v_UV = a_UV;
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  
  uniform sampler2D u_Texture0;
  uniform sampler2D u_Texture1;
  uniform sampler2D u_Texture2;

  uniform int u_SelectedTexture;

  uniform vec4 u_FragColor;

  uniform float u_ColorWeight;

  varying vec2 v_UV;

  void main() {
  if (u_SelectedTexture == 0) {
    gl_FragColor = (u_FragColor * u_ColorWeight) + ((1.0 - u_ColorWeight) * texture2D(u_Texture0, v_UV));
  } else if (u_SelectedTexture == 1) {
    gl_FragColor = (u_FragColor * u_ColorWeight) + ((1.0 - u_ColorWeight) * texture2D(u_Texture1, v_UV));
  } else {
    gl_FragColor = (u_FragColor * u_ColorWeight) + ((1.0 - u_ColorWeight) * texture2D(u_Texture2, v_UV));
  }
  }`;

// Global Vars
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let a_UV;

let u_Texture0;
let u_Texture1;
let u_Texture2;

let u_SelectedTexture;

let u_ColorWeight;

let skyCube;
let groundCube;
let groundCube2;
let groundCube3;
let groundCube4;
let wallCubes = [];
let meteorCubes = [];
let meteorExplosionCubes = [];
let camera;

let maxWallHeight = 5;

// INIT FUNCTIONS //
function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.viewport(0, 0, canvas.width, canvas.height);

  window.addEventListener("resize", (e) => {
    gl.canvas.width = window.innerWidth;
    gl.canvas.height = window.innerHeight;

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  });

  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_ColorWeight
  u_ColorWeight = gl.getUniformLocation(gl.program, 'u_ColorWeight');
  if (!u_ColorWeight) {
    console.log('Failed to get the storage location of u_ColorWeight');
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  // Get the storage location of u_Texture0
  u_Texture0 = gl.getUniformLocation(gl.program, 'u_Texture0');
  if (!u_Texture0) {
    console.log('Failed to get the storage location of u_Texture0');
    return;
  }

  // Get the storage location of u_Texture1
  u_Texture1 = gl.getUniformLocation(gl.program, 'u_Texture1');
  if (!u_Texture1) {
    console.log('Failed to get the storage location of u_Texture1');
    return;
  }

  // Get the storage location of u_Texture0
  u_Texture2 = gl.getUniformLocation(gl.program, 'u_Texture2');
  if (!u_Texture2) {
    console.log('Failed to get the storage location of u_Texture2');
    return;
  }

  // Get the storage location of u_SelectedTexture
  u_SelectedTexture = gl.getUniformLocation(gl.program, 'u_SelectedTexture');
  if (!u_SelectedTexture) {
    console.log('Failed to get the storage location of u_SelectedTexture');
    return;
  }

  // Get the storage location of a_UV
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (!a_UV) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }
}

// HTML FUNCTIONS //

// UI Globals
let g_viewAngleY = 45;
let g_viewAngleX = -5;

// Set up actions for HTML UI elements
function addActionsForHtmlUI() {
}

function main() {
  // Set up canvas and gl vars
  setupWebGL();

  // Set up GLSL shader program and connect vars
  connectVariablesToGLSL();

  // Add HTML UI Actions
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onclick = click;
  document.onkeydown = keydown;
  canvas.onmousemove = function (ev) { if (ev.buttons == 1) { click(ev) } };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  camera = new Camera();

  createWorldObjects();

  requestAnimationFrame(tick);
}

function tick() {
  renderScene();

  requestAnimationFrame(tick);
}

function updatePerformanceIndicator(frameStartTime) {
  let perfText = document.getElementById('performanceText');
  perfText.innerHTML = "MS: " + Math.floor((performance.now() - frameStartTime) * 10) / 10 + " | FPS: " + Math.floor(10000 / (performance.now() - frameStartTime) / 10);
}

function click(ev) {

}

function keydown(ev) {
  switch (ev.keyCode) {
    case 87: camera.moveForward(); break;
    case 65: camera.moveLeft(); break;
    case 68: camera.moveRight(); break;
    case 83: camera.moveBackwards(); break;
    case 81: camera.panHorizontal(.1); break;
    case 69: camera.panHorizontal(-.1); break;
    case 70: {
      placeBlock();
      break;
    }
    case 71: {
      breakBlock();
      break;
    }
  }
}

function getForwardCoords() {
  let f = new Vector3();
  f.set(camera.goalTarget);
  f.sub(camera.goalPosition);
  f.normalize();
  f.add(camera.goalPosition);
  // console.log(f.elements[0], f.elements[1], f.elements[2]);
  let f_rounded = new Vector3([Math.round(f.elements[0]), Math.round(f.elements[1]), Math.round(f.elements[2])])
  return f_rounded.elements;
}

function placeBlock() {
  // Add Block
  console.log("attempting to add...");
  let targetCoord = new Vector3(getForwardCoords());
  console.log(targetCoord);
  let wall = new Cube();
  wall.position = new Vector3([targetCoord.elements[0], targetCoord.elements[1], targetCoord.elements[2]]);
  wall.color = [0.35, 0.25, 0.15, 1.0];
  wall.solidColorWeight = Math.random() * 0.75;
  wallCubes.push(wall);
  console.log("added block at ", targetCoord.elements[0], targetCoord.elements[1], targetCoord.elements[2]);
}


function breakBlock() {
  // Delete Block
  console.log("attempting to remove...");
  let targetCoord = new Vector3(getForwardCoords());
  console.log(targetCoord);
  for (let i = 0; i < wallCubes.length; i++) {
    // console.log(targetCoord.elements[0], targetCoord.elements[1], targetCoord.elements[2], " | ", wallCubes[i].position.elements[0], wallCubes[i].position.elements[1], wallCubes[i].position.elements[2]);
    if (
      targetCoord.elements[0] == wallCubes[i].position.elements[0] &&
      targetCoord.elements[1] == wallCubes[i].position.elements[1] &&
      targetCoord.elements[2] == wallCubes[i].position.elements[2]
    ) {
      wallCubes.splice(i, 1);
      console.log("removed block");
    }

  }
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  return ([x, y]);
}

function createWorldObjects() {
  // Set Texture Images
  var sunspotsImagePath = './Sunspots.png';
  var skyImagePath = './Sky.png';
  var debugImagePath = './Debug.png';
  Cube.setTexture0(gl, sunspotsImagePath);
  Cube.setTexture1(gl, skyImagePath);
  Cube.setTexture2(gl, debugImagePath);

  // SKY //
  skyCube = new Cube();
  skyCube.color = [0.1, 0.1, 0.1, 1.0];
  skyCube.solidColorWeight = 0.5;
  skyCube.scale.mul(999);

  // GROUND //
  groundCube = new Cube();
  groundCube.color = [0.35, 0.25, 0.15, 1.0];
  groundCube.solidColorWeight = 1.0;
  // Flatten and widen floor
  groundCube.scale.elements[0] *= 32;
  groundCube.scale.elements[1] *= 0.01;
  groundCube.scale.elements[2] *= 32;
  // Move floor 
  groundCube.position.elements[0] = 16 - 0.5;
  groundCube.position.elements[1] = 4.505;
  groundCube.position.elements[2] = -16 - 0.5;

  groundCube2 = new Cube();
  groundCube2.color = [0.35, 0.25, 0.15, 1.0];
  groundCube2.solidColorWeight = 1.0;
  // Flatten and widen floor
  groundCube2.scale.elements[0] *= 32;
  groundCube2.scale.elements[1] *= 0.01;
  groundCube2.scale.elements[2] *= 96;
  // Move floor 
  groundCube2.position.elements[0] = 48 - 0.5;
  groundCube2.position.elements[1] = 4.505;
  groundCube2.position.elements[2] = 16 - 0.5;

  groundCube3 = new Cube();
  groundCube3.color = [0.35, 0.25, 0.15, 1.0];
  groundCube3.solidColorWeight = 1.0;
  // Flatten and widen floor
  groundCube3.scale.elements[0] *= 32;
  groundCube3.scale.elements[1] *= 0.01;
  groundCube3.scale.elements[2] *= 32;
  // Move floor 
  groundCube3.position.elements[0] = 16 - 0.5;
  groundCube3.position.elements[1] = 4.505;
  groundCube3.position.elements[2] = 48 - 0.5;

  groundCube4 = new Cube();
  groundCube4.color = [0.35, 0.25, 0.15, 1.0];
  groundCube4.solidColorWeight = 1.0;
  // Flatten and widen floor
  groundCube4.scale.elements[0] *= 32;
  groundCube4.scale.elements[1] *= 0.01;
  groundCube4.scale.elements[2] *= 96;
  // Move floor 
  groundCube4.position.elements[0] = -16 - 0.5;
  groundCube4.position.elements[1] = 4.505;
  groundCube4.position.elements[2] = 16 - 0.5;

  // Map
  // In its own file Map.js

  // WALLS //

  for (let i = 0; i < 32; i++) {
    for (let j = 0; j < 32; j++) {
      let wallHeight = map[i][j];
      while (wallHeight > 0) {
        let wall = new Cube();
        wall.position = new Vector3([i, wallHeight - 1, j]);
        wall.color = [0.35, 0.25, 0.15, 1.0];
        let centerness = (Math.abs(15.5 - i) / 15.5 + Math.abs(15.5 - j) / 15.5) / 2
        wall.solidColorWeight = centerness * 0.9 + Math.random() * 0.1;
        wallCubes.push(wall);
        // console.log("wall at ", i, " , ", wallHeight - 1, " , ", j);
        wallHeight--;
      }
    }
  }

  // METEORS //

  for (let i = 0; i < 16; i++) {
    for (let j = 0; j < 16; j++) {
      let meteor = new Cube();
      meteor.position = new Vector3([i * 2, Math.random() * 500 + 250, j * 2]);
      meteor.rotation = new Vector3([45, 0, 45]);
      let metScale = (Math.random() * 2);
      meteor.scale.elements[0] *= metScale;
      meteor.scale.elements[1] *= metScale;
      meteor.scale.elements[2] *= metScale;
      meteorCubes.push(meteor);
    }
  }
}

function renderScene() {
  let tickStartTime = performance.now();

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.clear(gl.DEPTH_BUFFER_BIT);

  // (COULD SWITCH TEXTURE SELECTION TO HAPPEN INSIDE CUBE BASED ON A PARAM)

  // Select sky texture in shader uniform
  gl.uniform1i(u_SelectedTexture, 1);
  skyCube.render(gl, camera);

  // Select debug texture in shader uniform (will be covered by colorweight)
  gl.uniform1i(u_SelectedTexture, 2);
  groundCube.render(gl, camera);
  groundCube2.render(gl, camera);
  groundCube3.render(gl, camera);
  groundCube4.render(gl, camera);

  // Select sunspot texture in shader uniform 
  gl.uniform1i(u_SelectedTexture, 0);
  // Cubes
  for (let i = 0; i < wallCubes.length; i++) {
    wallCubes[i].render(gl, camera);
  }

  // Meteors
  for (let i = 0; i < meteorCubes.length; i++) {
    meteorCubes[i].position.elements[1] -= 0.5;
    if (meteorCubes[i].position.elements[1] < -1) {
      meteorCubes[i].position.elements[1] = Math.random() * 500 + 250;
    }
    meteorCubes[i].render(gl, camera);
  }

  camera.update();

  updatePerformanceIndicator(tickStartTime)
}

