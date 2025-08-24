// Global variables for p5.js
let canvas;
let particleSets = [];
let particleSequence = null;
let cols, rows;
let noiseScale = 0.01;
let magnitude = 1;
let isRunning = false;
let fpsCounter;
let tooltip = null;



// p5.js sketch
function setup() {

  let canvasSize = 720
  canvas = createCanvas(canvasSize, canvasSize);
  canvas.parent('p5-canvas');
  pixelDensity(1);
  background(0);

  fpsCounter = select('#fps-counter');
}

// p5.js draw function, runs once per frame
function draw() {
  // main loop
  if (isRunning && particleSequence) {
    particleSequence.execute();
    updateParticleSetsList();

    // Stop animation if sequence is completed
    if (particleSequence.curr >= particleSets.length) {
      isRunning = false;

      // Re-enable the buttons
      enableButtons();
      updateParticleSetsList();
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

// Adding a single set through UI
function addParticleSet() {
  const form = document.getElementById('particle-form');
  const formData = new FormData(form);

  // Get color values
  const colorHex = document.getElementById('color').value;
  const shapeFillHex = document.getElementById('shapeFill').value;
  const colorRgb = hexToRgb(colorHex);
  const shapeFillRgb = hexToRgb(shapeFillHex);
  // Get option values
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
  // instantiate Set
  const particleSet = new ParticleSet(
    parseInt(document.getElementById('numParticles').value),
    parseInt(document.getElementById('lifetime').value),
    parseFloat(document.getElementById('size').value),
    createVector(colorRgb.r, colorRgb.g, colorRgb.b),
    parseInt(document.getElementById('alpha').value),
    options
  );
  // add to Sets list and update  UI
  particleSets.push(particleSet);
  updateParticleSetsList();
}

// Remove Set with UI button
function removeParticleSet(id) {
  particleSets = particleSets.filter(set => set.id !== id);
  hideTooltip();
  updateParticleSetsList();
}

// Update the currently visible set UI forms
function updateParticleSetsList() {
  const list = document.getElementById('particle-sets-list');
  // Recreates every time, prevents UI interaction bugs
  list.innerHTML = '';
  // Create each set's UI Form
  particleSets.forEach((set, index) => {
    const item = document.createElement('div');
    item.className = 'particle-set-item';

    // Status (Running, Waiting, Done)
    const isActive = particleSequence && particleSequence.curr === index;
    const statusText = (isActive && isRunning)
      ? ' (ACTIVE)'
      : index < (particleSequence ? particleSequence.curr : 0)
        ? ' (COMPLETED)'
        : ' (WAITING)';
    const statusColor = isActive
      ? '#4ade80'
      : index < (particleSequence ? particleSequence.curr : 0)
        ? '#6b7280'
        : '#fbbf24';

    // Build Set UI Element from HTML
    item.innerHTML = `
      <div class="particle-set-header">
        <strong class="set-title">Set ${index + 1}
          <span class="status-text" style="color: ${statusColor};">
            ${statusText}
          </span>
        </strong>
        <div class="particle-set-controls">
          <button 
            type="button" 
            class="small-btn btn-danger remove-btn ${isRunning ? 'btn-disabled' : ''}" 
            data-id="${set.id}">
            Remove
          </button>
        </div>
      </div>
      <div class="set-details">
        Particles: ${set.numParticles} | 
        Lifetime: <span class="lifetime-text">${Math.max(set.lifetime, 0)}/${set.originalLifetime}</span> | 
        Shape: <span class="shape-info">
          ${set.drawShape} | 
          ${formatColorSquare(set.color, 'Color')} | 
          ${formatColorSquare(set.shapeFill, 'Fill')}
        </span>
      </div>
    `;
    //Event listener for Remove button
    item.querySelector('.remove-btn').addEventListener('click', (e) => {
      const id = parseInt(e.target.getAttribute('data-id'), 10);
      removeParticleSet(id);
    });
    // Event listeners for hover tooltip
    item.addEventListener('mouseenter', (e) => showTooltip(e, set));
    item.addEventListener('mouseleave', hideTooltip);
    item.addEventListener('mousemove', moveTooltip);

    list.appendChild(item);
  });

  //Stats for the whole sequence
  if (particleSequence) {
    const sequenceInfo = document.createElement('div');
    sequenceInfo.className = 'sequence-info';
    sequenceInfo.style.cssText = `
      margin-top: 10px; 
      padding: 10px; 
      background: rgba(255,255,255,0.1); 
      border-radius: 5px; 
      font-size: 14px;
    `;
    sequenceInfo.innerHTML = `
      <strong>Sequence Progress:</strong><br>
      Current Set: ${Math.min(particleSequence.curr + 1, particleSets.length)} of ${particleSets.length}<br>
      Status: ${particleSequence.curr >= particleSets.length ? 'Completed' : 'Running'}
    `;
    list.appendChild(sequenceInfo);
  }
}

//stops Animation, keeps last frame
function stopAnimation() {
  isRunning = false;
  enableButtons();
  updateParticleSetsList();
}

// clears background and the whole sequence
function clearCanvas() {
  background(0);
  particleSets = [];
  particleSequence = null;
  enableButtons();
  isRunning = false;
  updateParticleSetsList();
}

//Disable most UI buttons
function disableButtons() {
  // Disable the add button
  const addButton = document.querySelectorAll('.btn-success');
  for (let button of addButton) {
    button.disabled = true;
    button.classList.add('btn-disabled');
  }
  const removeButtons = document.querySelectorAll('.btn-danger')
  for (let button of removeButtons) {
    button.disabled = true;
    button.classList.add('btn-disabled')
  }
}

//enable the buttons we disabled above
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

//Begin the sequence from the beginning.
// Clears background before starting.
function startAnimation() {
  if (particleSets.length === 0) {
    return;
  }
  isRunning = true;
  disableButtons();
  hideTooltip();

  // Clear canvas and set noise seed
  background(0);
  noiseSeed(frameCount);

  // Reset all particle sets to their original state
  particleSets.forEach(set => {
    set.lifetime = set.originalLifetime;
    set.generateParticles();
  });

  // Always create a new sequence, prevents a lot of issues
  if (particleSets.length > 0) {
    particleSequence = new ParticleSequence([...particleSets]);
  } else {
    particleSequence = null;
  }
  // update ui
  updateParticleSetsList();
}

// function for random button
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

// exports current Sequence and downloads it.
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

// Load preset from user defined file
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

      // Reset file input in case same file uploaded
      e.target.value = '';
    } catch (error) {
      console.error('Error parsing preset file:', error);
      alert('Error loading preset: Invalid JSON format');
    }
  };
  reader.readAsText(file);
}

// Load example preset from path on the website
function loadPresetFromPath(exampleName) {
  // Add a timestamp to bypass cacheing 
  // This makes development of the examples easier
  const url = `/examples/${exampleName}.json?t=${new Date().getTime()}`;

  fetch(url)
    .then(r => r.json())
    .then(preset => {
      loadPresetData(preset);
      startAnimation();
    })
    .catch(error => {
      console.error("Error loading preset:", error);
      alert("Failed to load preset: " + exampleName);
    });
}

//Handles actual loading after file or path validation / fetching
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
      // Validate properties that are required are present
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

      // Initialize the set
      const particleSet = new ParticleSet(
        setData.numParticles,
        setData.lifetime,
        setData.size,
        createVector(setData.color.x, setData.color.y, setData.color.z),
        setData.alpha,
        options
      );

      // Add set to Array that becomes the Sequence
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

// Helper function to format color as a colored square
function formatColorSquare(colorVector, label) {
  const r = Math.round(colorVector.x);
  const g = Math.round(colorVector.y);
  const b = Math.round(colorVector.z);
  return `${label}: <span style="display: inline-block; width: 12px; height: 12px; background-color: rgb(${r}, ${g}, ${b}); border: 1px solid #666; vertical-align: middle; margin-left: 5px;"></span>`;
}

// Reveal Tooltip of currently hovered Set UI Element
function showTooltip(event, set) {
  if (isRunning) {
    return;
  }
  // Remove existing tooltip
  hideTooltip();

  // Create tooltip element
  tooltip = document.createElement('div');
  tooltip.className = 'tooltip';



  // Helper function to format boolean
  function formatBoolean(value) {
    return value ? 'Yes' : 'No';
  }

  // Build tooltip UI element with HTML
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

  // Add the tooltip
  document.body.appendChild(tooltip);

  // Move tooltip to mouse
  moveTooltip(event);

  // Show the tooltip
  setTimeout(() => {
    if (tooltip) {
      tooltip.classList.add('visible');
    }
  }, 10);
}

// Removes the tooltip
function hideTooltip() {
  if (tooltip) {
    tooltip.remove();
    tooltip = null;
  }
}

// Move the tooltip to the mouse.
function moveTooltip(event) {
  if (!tooltip) return;

  const tooltipRect = tooltip.getBoundingClientRect();
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  // Remember to take into account the page scroll
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

// Collapses / uncollapses the collapsable UI Sections.
function toggleSection(header) {
  const section = header.parentNode;
  section.classList.toggle('open');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('particle-form').addEventListener('submit', function (e) {
    e.preventDefault();
    addParticleSet();
  });

  // Initialize Set List UI
  updateParticleSetsList();
});

