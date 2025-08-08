//Default global values (can be overridden per ParticleSet)
let scl = 5;
let magnitude = 1;
let angleMult = 1;
let globalSpeedLimit = 1;
let noiseScale = .01;
let edgeWrap = false;
let spawnSpillover = 0;
let globalMoveMethod = "direct"
let drawShape = "line"
let shapeSize = "relative"
let shapeFill

let cols, rows;
let zoff = 0;
let fr;
let particles;
let flowfield = [];
let particleSeq;

function setup() {
  shapeFill = createVector(255, 255, 255);
  createCanvas(720, 720);
  pixelDensity(1);
  smooth();
  background(0);

  particleSeq = eeex();

  cols = floor(width / scl);
  rows = floor(height/ scl);
  fr = createP('');

  for(let y = 0; y < rows; y++) {
    for(let x = 0; x < cols; x++) {
      let index = x + y * cols;
      let angle = noise(x * noiseScale, y * noiseScale) * angleMult * TWO_PI;
      let v = p5.Vector.fromAngle(angle);
      v.setMag(magnitude);
      flowfield[index] = v;
      }
  }
}

function draw() {
  particleSeq.execute();
  fr.html(floor(frameRate()));
  // if(frameCount > 3600){
  //   noLoop();
  //   saveCanvas();
  // }
}

function fraud(){
  let options = {
    scl: 5,
    magnitude: 4,
    angleMult: 1,
    globalSpeedLimit: 1,
    noiseScale: .01,
    edgeWrap: false,
    spawnSpillover: 0,
    globalMoveMethod: "direct",
    drawShape: "line",
    shapeSize: "relative",
    shapeFill: createVector(255, 255, 255),
    shrink: false,
    shrinkRate: .3,
    fade: false,
    fadeRate: 1
  };
  
  return new ParticleSequence([
    new ParticleSet(2000, 50, 24, createVector(255, 255, 255), 2, options),
    new ParticleSet(2000, 50, 12, createVector(255, 255, 255), 5, options),
    new ParticleSet(3000, 50, 6, createVector(255, 255, 255), 10, options),
    new ParticleSet(10000, 50, 3, createVector(255, 255, 255), 20, options),
    new ParticleSet(15000, 75, 1, createVector(255, 255, 255), 30, options),
  ]);
}

function fraud_physics(){
  let options = {
    scl: 10,
    magnitude: 3,
    angleMult: 4,
    globalSpeedLimit: 3,
    noiseScale: .01,
    edgeWrap: false,
    spawnSpillover: 0,
    globalMoveMethod: "physics",
    drawShape: "line",
    shapeSize: "relative",
    shapeFill: createVector(255, 255, 255),
    shrink: false,
    shrinkRate: .3,
    fade: false,
    fadeRate: 1
  };
  
  return new ParticleSequence([
    new ParticleSet(2000, 50, 24, createVector(255, 255, 255), 2, options),
    new ParticleSet(2000, 50, 12, createVector(255, 255, 255), 5, options),
    new ParticleSet(3000, 50, 6, createVector(255, 255, 255), 10, options),
    new ParticleSet(10000, 50, 3, createVector(255, 255, 255), 20, options),
    new ParticleSet(15000, 75, 1, createVector(255, 255, 255), 30, options)
  ]);
}

function fraud_shrink(){
  let options = {
    scl: 5,
    magnitude: 4,
    angleMult: 1,
    globalSpeedLimit: 1,
    noiseScale: .01,
    edgeWrap: false,
    spawnSpillover: 0,
    globalMoveMethod: "direct",
    drawShape: "line",
    shapeSize: "relative",
    shapeFill: createVector(255, 255, 255),
    shrink: true,
    shrinkRate: .3,
    fade: false,
    fadeRate: 1
  };
  
  return new ParticleSequence([
    new ParticleSet(2000, 50, 24, createVector(255, 255, 255), 2, options),
    new ParticleSet(2000, 50, 12, createVector(255, 255, 255), 5, options),
    new ParticleSet(3000, 50, 6, createVector(255, 255, 255), 10, options),
    new ParticleSet(10000, 50, 3, createVector(255, 255, 255), 20, options),
    new ParticleSet(15000, 75, 1, createVector(255, 255, 255), 30, options),
  ]);
}

function fraud_meat(){
  let options = {
    scl: 5,
    magnitude: 4,
    angleMult: 1,
    globalSpeedLimit: 1,
    noiseScale: .01,
    edgeWrap: false,
    spawnSpillover: 0,
    globalMoveMethod: "direct",
    drawShape: "line",
    shapeSize: "relative",
    shapeFill: createVector(207, 124, 105),
    shrink: false,
    shrinkRate: .3,
    fade: false,
    fadeRate: 1
  };
  
  return new ParticleSequence([
    new ParticleSet(5000, 30, 12, createVector(55, 19, 49), 80, options),
    new ParticleSet(2000, 30, 6, createVector(17, 6, 15), 80, options),
    new ParticleSet(5000, 30, 3, createVector(74, 25, 66), 100, options),
    new ParticleSet(5000, 40, 2, createVector(93, 31, 83), 80, options),
    new ParticleSet(10000, 30, 2, createVector(112, 38, 100), 70, options),
    new ParticleSet(10000, 15, 1, createVector(131, 44, 117), 50, options),
    new ParticleSet(10000, 30, 2, createVector(238, 238, 238), 5, options),
    new ParticleSet(3000, 30, 2, createVector(255, 255, 255), 10, options),
  ]);
}

function pond(){
  let options = {
    scl: 5,
    magnitude: 1,
    angleMult: 1,
    globalSpeedLimit: 1,
    noiseScale: .01,
    edgeWrap: false,
    spawnSpillover: 0,
    globalMoveMethod: "direct",
    drawShape: "line",
    shapeSize: "direct",
    shapeFill: createVector(100, 150, 255),
    shrink: true,
    shrinkRate: .3,
    fade: true,
    fadeRate: 1
  };
  
  let num = 50;
  return new ParticleSequence([
    new ParticleSet(num, 100, 24, createVector(255, 255, 255), 100, options),
    new ParticleSet(num, 100, 12, createVector(255, 255, 255), 100, options),
    new ParticleSet(num, 100, 6, createVector(255, 255, 255), 100, options),
    new ParticleSet(num, 100, 3, createVector(255, 255, 255), 100, options),
    new ParticleSet(num, 100, 2, createVector(255, 255, 255), 100, options),
    new ParticleSet(num, 500, 1, createVector(255, 255, 255), 100, options),
  ]);
}

function overcrowd(){
  let options = {
    scl: 5,
    magnitude: 4,
    angleMult: 1,
    globalSpeedLimit: 1,
    noiseScale: .01,
    edgeWrap: false,
    spawnSpillover: 0,
    globalMoveMethod: "direct",
    drawShape: "line",
    shapeSize: "relative",
    shapeFill: createVector(255, 100, 100),
    shrink: true,
    shrinkRate: .3,
    fade: true,
    fadeRate: 1
  };
  
  let num = 800;
  return new ParticleSequence([
    new ParticleSet(num, 100, 24, createVector(255, 255, 255), 100, options),
    new ParticleSet(num, 100, 12, createVector(255, 255, 255), 100, options),
    new ParticleSet(num, 100, 6, createVector(255, 255, 255), 100, options),
    new ParticleSet(num, 100, 3, createVector(255, 255, 255), 100, options),
    new ParticleSet(num, 100, 2, createVector(255, 255, 255), 100, options),
    new ParticleSet(num, 500, 1, createVector(255, 255, 255), 100, options),
  ]);
}

function eex(){
  let options = {
    scl: 5,
    magnitude: 1,
    angleMult: 1,
    globalSpeedLimit: 1,
    noiseScale: .01,
    edgeWrap: false,
    spawnSpillover: 100,
    globalMoveMethod: "direct",
    drawShape: "arc",
    shapeSize: "direct",
    shapeFill: createVector(0,0,0),
    shrink: false,
    shrinkRate: .3,
    fade: false,
    fadeRate: 5
  };
  
  return new ParticleSequence([
    new ParticleSet(5000, 30, 12, createVector(55, 19, 49), 80, options),
    new ParticleSet(2000, 30, 6, createVector(17, 6, 15), 80, options),
    new ParticleSet(5000, 30, 3, createVector(74, 25, 66), 100, options),
    new ParticleSet(5000, 40, 2, createVector(93, 31, 83), 80, options),
    new ParticleSet(10000, 30, 2, createVector(112, 38, 100), 70, options),
  ]);
}

function eeex(){
  let options = {
    scl: 5,
    magnitude: 1,
    angleMult: 1,
    globalSpeedLimit: 1,
    noiseScale: .01,
    edgeWrap: false,
    spawnSpillover: 100,
    globalMoveMethod: "direct",
    drawShape: "arc",
    shapeSize: "direct",
    shapeFill: createVector(0,0,0),
    shrink: true,
    shrinkRate: .3,
    fade: false,
    fadeRate: 1
  };
  
  return new ParticleSequence([
    new ParticleSet(5000, 30, 12, createVector(55, 19, 49), 80, options),
    new ParticleSet(2000, 30, 6, createVector(17, 6, 15), 80, options),
    new ParticleSet(5000, 30, 3, createVector(74, 25, 66), 100, options),
    new ParticleSet(5000, 40, 2, createVector(93, 31, 83), 80, options),
    new ParticleSet(10000, 30, 2, createVector(112, 38, 100), 70, options),
  ]);
}

function ef(){
  let options = {
    scl: 5,
    magnitude: 1,
    angleMult: 1,
    globalSpeedLimit: 1,
    noiseScale: .01,
    edgeWrap: false,
    spawnSpillover: 100,
    globalMoveMethod: "direct",
    drawShape: "arc",
    shapeSize: "direct",
    shapeFill: createVector(0,0,0),
    shrink: false,
    shrinkRate: .3,
    fade: true,
    fadeRate: 5
  };
  
  return new ParticleSequence([
    new ParticleSet(5000, 30, 12, createVector(55, 19, 49), 80, options),
    new ParticleSet(2000, 30, 6, createVector(17, 6, 15), 80, options),
    new ParticleSet(5000, 30, 3, createVector(74, 25, 66), 100, options),
    new ParticleSet(5000, 40, 2, createVector(93, 31, 83), 80, options),
    new ParticleSet(10000, 30, 2, createVector(112, 38, 100), 70, options),
  ]);
}