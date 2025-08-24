// Global variables for p5.js
let canvas;
let particleSets = [];
let particleSequence = null;
let cols, rows;
let noiseScale = 0.01;
let magnitude = 1;
let isRunning = false;
let fpsCounter;




// p5.js sketch
function setup() {
  let canvasSize = 720
  canvas = createCanvas(canvasSize, canvasSize);
  canvas.parent('p5-canvas');
  pixelDensity(1);
  background(0);

  fpsCounter = select('#fps-counter');
}



function draw() {
  if (isRunning && particleSequence) {
    particleSequence.execute();
    updateParticleSetsList();

    // Stop animation if sequence is completed
    if (particleSequence.curr >= particleSets.length) {
      isRunning = false;

      // Re-enable the add button
      enableButtons();
    }
  }

  // Update FPS counter
  if (frameCount % 10 === 0) {
    fpsCounter.html('FPS: ' + floor(frameRate()));
  }
}

// UI Functions
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function addParticleSet() {
  const form = document.getElementById('particle-form');
  const formData = new FormData(form);

  // Get color values
  const colorHex = document.getElementById('color').value;
  const shapeFillHex = document.getElementById('shapeFill').value;
  const colorRgb = hexToRgb(colorHex);
  const shapeFillRgb = hexToRgb(shapeFillHex);

  const options = {
    scl: parseFloat(document.getElementById('scl').value),
    magnitude: parseFloat(document.getElementById('magnitude').value),
    angleMult: parseFloat(document.getElementById('angleMult').value),
    globalSpeedLimit: parseFloat(document.getElementById('globalSpeedLimit').value),
    noiseScale: parseFloat(document.getElementById('noiseScale').value),
    edgeWrap: document.getElementById('edgeWrap').value === 'true',
    spawnSpillover: parseInt(document.getElementById('spawnSpillover').value),
    globalMoveMethod: document.getElementById('globalMoveMethod').value,
    drawShape: document.getElementById('drawShape').value,
    shapeSize: document.getElementById('shapeSize').value,
    shapeFill: createVector(shapeFillRgb.r, shapeFillRgb.g, shapeFillRgb.b),
    shrink: document.getElementById('shrink').value === 'true',
    shrinkRate: parseFloat(document.getElementById('shrinkRate').value),
    fade: document.getElementById('fade').value === 'true',
    fadeRate: parseFloat(document.getElementById('fadeRate').value)
  };

  const particleSet = new ParticleSet(
    parseInt(document.getElementById('numParticles').value),
    parseInt(document.getElementById('lifetime').value),
    parseFloat(document.getElementById('size').value),
    createVector(colorRgb.r, colorRgb.g, colorRgb.b),
    parseInt(document.getElementById('alpha').value),
    options
  );

  particleSets.push(particleSet);
  updateParticleSetsList();
}

function removeParticleSet(id) {
  particleSets = particleSets.filter(set => set.id !== id);
  updateParticleSetsList();
}

function updateParticleSetsList() {
  const list = document.getElementById('particle-sets-list');

  // Get existing items
  const existingItems = list.querySelectorAll('.particle-set-item');
  const existingSequenceInfo = list.querySelector('.sequence-info');

  // Update existing particle set items or create new ones
  particleSets.forEach((set, index) => {
    let item = existingItems[index];

    // Create new item if it doesn't exist
    if (!item) {
      item = document.createElement('div');
      item.className = 'particle-set-item';

      // Create the structure once
      item.innerHTML = `
                <div class="particle-set-header">
                    <strong class="set-title">Set ${index + 1}<span class="status-text"></span></strong>
                    <div class="particle-set-controls">
                        <button type="remove" class="small-btn btn-danger" onclick="removeParticleSet(${set.id})">Remove</button>
                    </div>
                </div>
                <div class="set-details">
                    Particles: ${set.numParticles} | 
                    Lifetime: <span class="lifetime-text"></span> | 
                    Shape: <span class="shape-info">${set.drawShape}</span>
                </div>
            `;

      // Add hover events for tooltip (only once when creating)
      item.addEventListener('mouseenter', (e) => showTooltip(e, set));
      item.addEventListener('mouseleave', hideTooltip);
      item.addEventListener('mousemove', moveTooltip);

      list.insertBefore(item, existingSequenceInfo);
    }

    // Update only the changing parts
    const isActive = particleSequence && particleSequence.curr === index;
    const statusText = (isActive && isRunning) ? ' (ACTIVE)' : index < (particleSequence ? particleSequence.curr : 0) ? ' (COMPLETED)' : ' (WAITING)';
    const statusColor = isActive ? '#4ade80' : index < (particleSequence ? particleSequence.curr : 0) ? '#6b7280' : '#fbbf24';

    // Update just the status text and color
    const statusElement = item.querySelector('.status-text');
    statusElement.textContent = statusText;
    statusElement.style.color = statusColor;

    // Update just the lifetime text
    const lifetimeElement = item.querySelector('.lifetime-text');
    lifetimeElement.textContent = `${Math.max(set.lifetime, 0)}/${set.originalLifetime}`;

    // Update the shape info with labeled color squares
    const shapeInfoElement = item.querySelector('.shape-info');
    shapeInfoElement.innerHTML = `${set.drawShape} | ${formatColorSquare(set.color, 'Color')} | ${formatColorSquare(set.shapeFill, 'Fill')}`;

    // Update the tooltip event to reference the current set data
    item.onmouseenter = (e) => showTooltip(e, set);
  });

  // Remove extra items if we have fewer particle sets than before
  for (let i = particleSets.length; i < existingItems.length; i++) {
    existingItems[i].remove();
  }

  // Update or create sequence info
  let sequenceInfo = existingSequenceInfo;
  if (particleSequence) {
    if (!sequenceInfo) {
      sequenceInfo = document.createElement('div');
      sequenceInfo.className = 'sequence-info';
      sequenceInfo.style.cssText = 'margin-top: 10px; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 5px; font-size: 14px;';
      list.appendChild(sequenceInfo);
    }

    sequenceInfo.innerHTML = `
            <strong>Sequence Progress:</strong><br>
            Current Set: ${Math.min(particleSequence.curr + 1, particleSets.length)} of ${particleSets.length}<br>
            Status: ${particleSequence.curr >= particleSets.length ? 'Completed' : 'Running'}
        `;
  } else if (sequenceInfo) {
    sequenceInfo.remove();
  }
}



function stopAnimation() {
  isRunning = false;
  enableButtons();
}

function clearCanvas() {
  background(0);
  particleSets = [];
  particleSequence = null;
  enableButtons();
  isRunning = false;
  updateParticleSetsList();
}

function disableButtons() {
  // Disable the add button
  const addButton = document.querySelectorAll('.btn-success');
  for (let button of addButton) {
    button.disabled = true;
    button.classList.add('btn-disabled');
  }
  const removeButtons = document.querySelectorAll('button[type="remove"].btn-danger')
  for (let button of removeButtons) {
    button.disabled = true;
    button.classList.add('btn-disabled')
  }
}

function enableButtons() {
  const addButtons = document.querySelectorAll('.btn-success');
  for (let button of addButtons) {
    button.disabled = false;
    button.classList.remove('btn-disabled');
  }
  const removeButtons = document.querySelectorAll('button[type="remove"].btn-danger')
  for (let button of removeButtons) {
    button.disabled = false;
    button.classList.remove('btn-disabled')
  }
}

function startAnimation() {
  if (particleSets.length === 0) {
    return;
  }
  isRunning = true;
  disableButtons()

  // Clear canvas and set noise seed
  background(0);
  noiseSeed(frameCount);

  // Reset all particle sets to their original state
  particleSets.forEach(set => {
    set.lifetime = set.originalLifetime;
    set.generateParticles();
  });

  // Always create a new sequence from the current sets
  if (particleSets.length > 0) {
    particleSequence = new ParticleSequence([...particleSets]);
  } else {
    particleSequence = null;
  }
  updateParticleSetsList();
}

function randomizeParameters() {
  // Basic parameters
  document.getElementById('numParticles').value = Math.floor(Math.random() * 4000) + 500; // 500-4500
  document.getElementById('lifetime').value = Math.floor(Math.random() * 150) + 25; // 25-175
  document.getElementById('size').value = (Math.random() * 15 + 0.5).toFixed(1); // 0.5-15.5
  document.getElementById('alpha').value = Math.floor(Math.random() * 155) + 100; // 100-255

  // Random colors
  const randomColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  document.getElementById('color').value = randomColor();
  document.getElementById('shapeFill').value = randomColor();

  // Physics parameters
  document.getElementById('scl').value = (Math.random() * 15 + 2).toFixed(1); // 2-17
  document.getElementById('magnitude').value = (Math.random() * 8 + 0.5).toFixed(1); // 0.5-8.5
  document.getElementById('angleMult').value = (Math.random() * 4 + 0.5).toFixed(1); // 0.5-4.5
  document.getElementById('globalSpeedLimit').value = (Math.random() * 5 + 0.5).toFixed(1); // 0.5-5.5
  document.getElementById('noiseScale').value = (Math.random() * 0.05 + 0.001).toFixed(3); // 0.001-0.051
  document.getElementById('spawnSpillover').value = Math.floor(Math.random() * 200); // 0-199

  // Random selections
  const edgeWrapOptions = ['true', 'false'];
  document.getElementById('edgeWrap').value = edgeWrapOptions[Math.floor(Math.random() * edgeWrapOptions.length)];

  const moveMethodOptions = ['direct', 'physics'];
  document.getElementById('globalMoveMethod').value = moveMethodOptions[Math.floor(Math.random() * moveMethodOptions.length)];

  const shapeOptions = ['square'];
  document.getElementById('drawShape').value = shapeOptions[Math.floor(Math.random() * shapeOptions.length)];

  const sizeOptions = ['relative', 'direct'];
  document.getElementById('shapeSize').value = sizeOptions[Math.floor(Math.random() * sizeOptions.length)];

  // Animation parameters
  const boolOptions = ['true', 'false'];
  document.getElementById('shrink').value = boolOptions[Math.floor(Math.random() * boolOptions.length)];
  document.getElementById('shrinkRate').value = (Math.random() * 1 + 0.1).toFixed(1); // 0.1-1.1
  document.getElementById('fade').value = boolOptions[Math.floor(Math.random() * boolOptions.length)];
  document.getElementById('fadeRate').value = (Math.random() * 3 + 0.5).toFixed(1); // 0.5-3.5
}

function savePreset() {
  const preset = {
    particleSets: particleSets.map(set => ({
      numParticles: set.numParticles,
      lifetime: set.originalLifetime,
      size: set.size,
      color: { x: set.color.x, y: set.color.y, z: set.color.z },
      alpha: set.alpha,
      options: {
        scl: set.scl,
        magnitude: set.magnitude,
        angleMult: set.angleMult,
        globalSpeedLimit: set.globalSpeedLimit,
        noiseScale: set.noiseScale,
        edgeWrap: set.edgeWrap,
        spawnSpillover: set.spawnSpillover,
        globalMoveMethod: set.globalMoveMethod,
        drawShape: set.drawShape,
        shapeSize: set.shapeSize,
        shapeFill: { x: set.shapeFill.x, y: set.shapeFill.y, z: set.shapeFill.z },
        shrink: set.shrink,
        shrinkRate: set.shrinkRate,
        fade: set.fade,
        fadeRate: set.fadeRate
      }
    }))
  };

  const blob = new Blob([JSON.stringify(preset, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'particle_preset.json';
  a.click();
  URL.revokeObjectURL(url);
}

// Load preset from file
function loadPresetFromFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.type !== 'application/json') {
    alert('Please select a valid JSON preset file.');
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const preset = JSON.parse(e.target.result);
      loadPresetData(preset);

      // Reset file input
      event.target.value = '';
    } catch (error) {
      console.error('Error parsing preset file:', error);
      alert('Error loading preset: Invalid JSON format');
    }
  };
  reader.readAsText(file);
}

function loadPresetFromPath(exampleName) {
  fetch("/examples/" + exampleName + ".json")
    .then(r => r.json())
    .then(preset => {
      loadPresetData(preset);
      startAnimation();
    });
}

function loadPresetData(preset) {
  // Validate preset structure
  if (!preset.particleSets || !Array.isArray(preset.particleSets)) {
    alert('Invalid preset format: missing particleSets array');
    return;
  }

  // Clear existing particle sets
  particleSets = [];
  particleSequence = null;

  try {
    // Create particle sets from the preset
    preset.particleSets.forEach(setData => {
      // Validate required properties
      if (!setData.numParticles || !setData.lifetime || !setData.size ||
        !setData.color || !setData.options) {
        throw new Error('Missing required particle set properties');
      }

      // Reconstruct options with proper vector objects
      const options = {
        ...setData.options,
        shapeFill: setData.options.shapeFill ?
          createVector(setData.options.shapeFill.x, setData.options.shapeFill.y, setData.options.shapeFill.z) :
          createVector(255, 255, 255)
      };

      const particleSet = new ParticleSet(
        setData.numParticles,
        setData.lifetime,
        setData.size,
        createVector(setData.color.x, setData.color.y, setData.color.z),
        setData.alpha,
        options
      );

      particleSets.push(particleSet);
    });

    // Create sequence
    if (particleSets.length > 0) {
      particleSequence = new ParticleSequence([...particleSets]);
    }

    // Update UI
    updateParticleSetsList();

    // Clear canvas for fresh start
    background(0);

    console.log(`Loaded preset with ${particleSets.length} particle sets`);

  } catch (error) {
    console.error('Error creating particle sets from preset:', error);
    alert('Error loading preset: ' + error.message);

    // Reset state on error
    particleSets = [];
    particleSequence = null;
    updateParticleSetsList();
  }
}


// Event listeners
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('particle-form').addEventListener('submit', function (e) {
    e.preventDefault();
    addParticleSet();
  });

  // Initialize
  updateParticleSetsList();
});

let tooltip = null;

// Helper function to format color as a colored square
function formatColorSquare(colorVector, label) {
  const r = Math.round(colorVector.x);
  const g = Math.round(colorVector.y);
  const b = Math.round(colorVector.z);
  return `${label}: <span style="display: inline-block; width: 12px; height: 12px; background-color: rgb(${r}, ${g}, ${b}); border: 1px solid #666; vertical-align: middle; margin-left: 5px;"></span>`;
}

function showTooltip(event, set) {
  // Remove existing tooltip
  hideTooltip();

  // Create tooltip element
  tooltip = document.createElement('div');
  tooltip.className = 'tooltip';



  // Helper function to format boolean
  function formatBoolean(value) {
    return value ? 'Yes' : 'No';
  }

  // Create tooltip content
  tooltip.innerHTML = `
        <div class="tooltip-section">
            <div class="tooltip-title">Basic Properties</div>
            Particles: ${set.numParticles}<br>
            Lifetime: ${set.lifetime}/${set.originalLifetime}<br>
            Size: ${set.size}<br>
            ${formatColorSquare(set.color, 'Color')}<br>
            Alpha: ${set.alpha}
        </div>
        
        <div class="tooltip-section">
            <div class="tooltip-title">Physics</div>
            Movement: ${set.globalMoveMethod}<br>
            Scale: ${set.scl}<br>
            Magnitude: ${set.magnitude}<br>
            Angle Mult: ${set.angleMult}<br>
            Speed Limit: ${set.globalSpeedLimit}<br>
            Noise Scale: ${set.noiseScale}<br>
            Spillover: ${set.spawnSpillover}<br>
            Edge Wrap: ${formatBoolean(set.edgeWrap)}
        </div>
        
        <div class="tooltip-section">
            <div class="tooltip-title">Shape & Animation</div>
            Shape: ${set.drawShape}<br>
            Shape Size: ${set.shapeSize}<br>
            ${formatColorSquare(set.shapeFill, 'Shape Fill')}<br>
            Shrink: ${formatBoolean(set.shrink)} (Rate: ${set.shrinkRate})<br>
            Fade: ${formatBoolean(set.fade)} (Rate: ${set.fadeRate})
        </div>
    `;

  // Add tooltip to document
  document.body.appendChild(tooltip);

  // Position tooltip
  moveTooltip(event);

  // Show tooltip with animation
  setTimeout(() => {
    if (tooltip) {
      tooltip.classList.add('visible');
    }
  }, 10);
}

function hideTooltip() {
  if (tooltip) {
    tooltip.remove();
    tooltip = null;
  }
}

function moveTooltip(event) {
  if (!tooltip) return;

  const tooltipRect = tooltip.getBoundingClientRect();
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  let left = window.scrollX + event.clientX - tooltipRect.width - 15;
  let top = window.scrollY + event.clientY + 15;

  // Adjust if tooltip goes beyond bottom of viewport
  if (top + tooltipRect.height - window.scrollY > windowHeight) {
    top = window.scrollY + event.clientY - tooltipRect.height - 15;
  }

  // Adjust if tooltip goes beyond right of viewport
  if (left + tooltipRect.width - window.scrollX > windowWidth) {
    left = window.scrollX + event.clientX - tooltipRect.width - 5;
  }

  // Ensure tooltip doesn't go off-screen
  left = Math.max(window.scrollX + 5, left);
  top = Math.max(window.scrollY + 5, top);

  tooltip.style.left = left + 'px';
  tooltip.style.top = top + 'px';
}
function toggleSection(header) {
  const section = header.parentNode;
  section.classList.toggle('open');
}
