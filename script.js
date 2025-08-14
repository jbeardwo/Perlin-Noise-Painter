// Global variables for p5.js
let canvas;
let particleSets = [];
let particleSequence = null;
let flowfield = [];
let cols, rows;
let scl = 5;
let noiseScale = 0.01;
let angleMult = 1;
let magnitude = 1;
let isRunning = false;
let fpsCounter;

function toggleSection(header) {
    const section = header.parentNode;
    section.classList.toggle('open');
}

// p5.js sketch
function setup() {
    canvas = createCanvas(720, 720);
    canvas.parent('p5-canvas');
    pixelDensity(1);
    background(0);
    
    cols = floor(width / scl);
    rows = floor(height / scl);
    
    
    
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
            const addButton = document.querySelector('button[type="submit"].btn-success');
            if (addButton) {
                addButton.disabled = false;
            }
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
    
    // Create new sequence with all sets
    particleSequence = new ParticleSequence([...particleSets]);
    
    updateParticleSetsList();
}

function removeParticleSet(id) {
    particleSets = particleSets.filter(set => set.id !== id);
    
    // Recreate sequence with remaining sets
    if (particleSets.length > 0) {
        particleSequence = new ParticleSequence([...particleSets]);
    } else {
        particleSequence = null;
    }
    
    updateParticleSetsList();
}

function updateParticleSetsList() {
    const list = document.getElementById('particle-sets-list');
    list.innerHTML = '';
    
    particleSets.forEach((set, index) => {
        const item = document.createElement('div');
        item.className = 'particle-set-item';
        
        // Check if this is the currently active set
        const isActive = particleSequence && particleSequence.curr === index;
        const statusText = (isActive && isRunning) ? ' (ACTIVE)' : index < (particleSequence ? particleSequence.curr : 0) ? ' (COMPLETED)' : ' (WAITING)';
        const statusColor = isActive ? '#4ade80' : index < (particleSequence ? particleSequence.curr : 0) ? '#6b7280' : '#fbbf24';
        
        item.innerHTML = `
            <div class="particle-set-header">
                <strong>Set ${index + 1}<span style="color: ${statusColor};">${statusText}</span></strong>
                <div class="particle-set-controls">
                    <button class="small-btn btn-danger" onclick="removeParticleSet(${set.id})">Remove</button>
                </div>
            </div>
            <div>
                Particles: ${set.numParticles} | 
                Lifetime: ${Math.max(set.lifetime,0)}/${set.originalLifetime} | 
                Shape: ${set.drawShape}
            </div>
        `;
        list.appendChild(item);
    });
    
    // Add sequence info
    if (particleSequence) {
        const sequenceInfo = document.createElement('div');
        sequenceInfo.style.cssText = 'margin-top: 10px; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 5px; font-size: 14px;';
        sequenceInfo.innerHTML = `
            <strong>Sequence Progress:</strong><br>
            Current Set: ${Math.min(particleSequence.curr + 1, particleSets.length)} of ${particleSets.length}<br>
            Status: ${particleSequence.curr >= particleSets.length ? 'Completed' : 'Running'}
        `;
        list.appendChild(sequenceInfo);
    }
}

function stopAnimation() {
    isRunning = false;
}

function clearCanvas() {
    background(0);
    particleSets = [];
    particleSequence = null;
    updateParticleSetsList();
}

function startAnimation() {
    isRunning = true;
    
    // Disable the add button
    const addButton = document.querySelector('button[type="submit"].btn-success');
    if (addButton) {
        addButton.disabled = true;
    }

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

function restartSequence() {
    if (particleSets.length > 0) {
        // Reset all particle sets to their original state
        particleSets.forEach(set => {
            set.lifetime = set.originalLifetime;
            set.generateParticles();
        });
        
        // Create new sequence
        particleSequence = new ParticleSequence([...particleSets]);
        updateParticleSetsList();
    }
}

// Example presets from original code
function getExamplePresets() {
    return {
        fraud: {
            options: {
                scl: 5, magnitude: 4, angleMult: 1, globalSpeedLimit: 1, noiseScale: 0.01,
                edgeWrap: false, spawnSpillover: 0, globalMoveMethod: "direct", drawShape: "line",
                shapeSize: "relative", shrink: false, shrinkRate: 0.3, fade: false, fadeRate: 1
            },
            sets: [
                {numParticles: 2000, lifetime: 50, size: 24, color: [255, 255, 255], alpha: 2},
                {numParticles: 2000, lifetime: 50, size: 12, color: [255, 255, 255], alpha: 5},
                {numParticles: 3000, lifetime: 50, size: 6, color: [255, 255, 255], alpha: 10},
                {numParticles: 10000, lifetime: 50, size: 3, color: [255, 255, 255], alpha: 20},
                {numParticles: 15000, lifetime: 75, size: 1, color: [255, 255, 255], alpha: 30}
            ]
        },
        
        fraud_physics: {
            options: {
                scl: 10, magnitude: 3, angleMult: 4, globalSpeedLimit: 3, noiseScale: 0.01,
                edgeWrap: false, spawnSpillover: 0, globalMoveMethod: "physics", drawShape: "line",
                shapeSize: "relative", shrink: false, shrinkRate: 0.3, fade: false, fadeRate: 1
            },
            sets: [
                {numParticles: 2000, lifetime: 50, size: 24, color: [255, 255, 255], alpha: 2},
                {numParticles: 2000, lifetime: 50, size: 12, color: [255, 255, 255], alpha: 5},
                {numParticles: 3000, lifetime: 50, size: 6, color: [255, 255, 255], alpha: 10},
                {numParticles: 10000, lifetime: 50, size: 3, color: [255, 255, 255], alpha: 20},
                {numParticles: 15000, lifetime: 75, size: 1, color: [255, 255, 255], alpha: 30}
            ]
        },
        
        fraud_shrink: {
            options: {
                scl: 5, magnitude: 4, angleMult: 1, globalSpeedLimit: 1, noiseScale: 0.01,
                edgeWrap: false, spawnSpillover: 0, globalMoveMethod: "direct", drawShape: "line",
                shapeSize: "relative", shrink: true, shrinkRate: 0.3, fade: false, fadeRate: 1
            },
            sets: [
                {numParticles: 2000, lifetime: 50, size: 24, color: [255, 255, 255], alpha: 2},
                {numParticles: 2000, lifetime: 50, size: 12, color: [255, 255, 255], alpha: 5},
                {numParticles: 3000, lifetime: 50, size: 6, color: [255, 255, 255], alpha: 10},
                {numParticles: 10000, lifetime: 50, size: 3, color: [255, 255, 255], alpha: 20},
                {numParticles: 15000, lifetime: 75, size: 1, color: [255, 255, 255], alpha: 30}
            ]
        },
        
        fraud_meat: {
            options: {
                scl: 5, magnitude: 4, angleMult: 1, globalSpeedLimit: 1, noiseScale: 0.01,
                edgeWrap: false, spawnSpillover: 0, globalMoveMethod: "direct", drawShape: "line",
                shapeSize: "relative", shrink: false, shrinkRate: 0.3, fade: false, fadeRate: 1,
                shapeFill: [207, 124, 105]
            },
            sets: [
                {numParticles: 5000, lifetime: 30, size: 12, color: [55, 19, 49], alpha: 80},
                {numParticles: 2000, lifetime: 30, size: 6, color: [17, 6, 15], alpha: 80},
                {numParticles: 5000, lifetime: 30, size: 3, color: [74, 25, 66], alpha: 100},
                {numParticles: 5000, lifetime: 40, size: 2, color: [93, 31, 83], alpha: 80},
                {numParticles: 10000, lifetime: 30, size: 2, color: [112, 38, 100], alpha: 70},
                {numParticles: 10000, lifetime: 15, size: 1, color: [131, 44, 117], alpha: 50},
                {numParticles: 10000, lifetime: 30, size: 2, color: [238, 238, 238], alpha: 5},
                {numParticles: 3000, lifetime: 30, size: 2, color: [255, 255, 255], alpha: 10}
            ]
        },
        
        pond: {
            options: {
                scl: 5, magnitude: 1, angleMult: 1, globalSpeedLimit: 1, noiseScale: 0.01,
                edgeWrap: false, spawnSpillover: 0, globalMoveMethod: "direct", drawShape: "line",
                shapeSize: "direct", shrink: true, shrinkRate: 0.3, fade: true, fadeRate: 1,
                shapeFill: [100, 150, 255]
            },
            sets: [
                {numParticles: 50, lifetime: 100, size: 24, color: [255, 255, 255], alpha: 100},
                {numParticles: 50, lifetime: 100, size: 12, color: [255, 255, 255], alpha: 100},
                {numParticles: 50, lifetime: 100, size: 6, color: [255, 255, 255], alpha: 100},
                {numParticles: 50, lifetime: 100, size: 3, color: [255, 255, 255], alpha: 100},
                {numParticles: 50, lifetime: 100, size: 2, color: [255, 255, 255], alpha: 100},
                {numParticles: 50, lifetime: 500, size: 1, color: [255, 255, 255], alpha: 100}
            ]
        },
        
        overcrowd: {
            options: {
                scl: 5, magnitude: 4, angleMult: 1, globalSpeedLimit: 1, noiseScale: 0.01,
                edgeWrap: false, spawnSpillover: 0, globalMoveMethod: "direct", drawShape: "line",
                shapeSize: "relative", shrink: true, shrinkRate: 0.3, fade: true, fadeRate: 1,
                shapeFill: [255, 100, 100]
            },
            sets: [
                {numParticles: 800, lifetime: 100, size: 24, color: [255, 255, 255], alpha: 100},
                {numParticles: 800, lifetime: 100, size: 12, color: [255, 255, 255], alpha: 100},
                {numParticles: 800, lifetime: 100, size: 6, color: [255, 255, 255], alpha: 100},
                {numParticles: 800, lifetime: 100, size: 3, color: [255, 255, 255], alpha: 100},
                {numParticles: 800, lifetime: 100, size: 2, color: [255, 255, 255], alpha: 100},
                {numParticles: 800, lifetime: 500, size: 1, color: [255, 255, 255], alpha: 100}
            ]
        },
        
        eex: {
            options: {
                scl: 5, magnitude: 1, angleMult: 1, globalSpeedLimit: 1, noiseScale: 0.01,
                edgeWrap: false, spawnSpillover: 100, globalMoveMethod: "direct", drawShape: "arc",
                shapeSize: "direct", shrink: false, shrinkRate: 0.3, fade: false, fadeRate: 5,
                shapeFill: [0, 0, 0]
            },
            sets: [
                {numParticles: 5000, lifetime: 30, size: 12, color: [55, 19, 49], alpha: 80},
                {numParticles: 2000, lifetime: 30, size: 6, color: [17, 6, 15], alpha: 80},
                {numParticles: 5000, lifetime: 30, size: 3, color: [74, 25, 66], alpha: 100},
                {numParticles: 5000, lifetime: 40, size: 2, color: [93, 31, 83], alpha: 80},
                {numParticles: 10000, lifetime: 30, size: 2, color: [112, 38, 100], alpha: 70}
            ]
        },
        
        eeex: {
            options: {
                scl: 5, magnitude: 1, angleMult: 1, globalSpeedLimit: 1, noiseScale: 0.01,
                edgeWrap: false, spawnSpillover: 100, globalMoveMethod: "direct", drawShape: "arc",
                shapeSize: "direct", shrink: true, shrinkRate: 0.3, fade: false, fadeRate: 1,
                shapeFill: [0, 0, 0]
            },
            sets: [
                {numParticles: 5000, lifetime: 30, size: 12, color: [55, 19, 49], alpha: 80},
                {numParticles: 2000, lifetime: 30, size: 6, color: [17, 6, 15], alpha: 80},
                {numParticles: 5000, lifetime: 30, size: 3, color: [74, 25, 66], alpha: 100},
                {numParticles: 5000, lifetime: 40, size: 2, color: [93, 31, 83], alpha: 80},
                {numParticles: 10000, lifetime: 30, size: 2, color: [112, 38, 100], alpha: 70}
            ]
        },
        
        ef: {
            options: {
                scl: 5, magnitude: 1, angleMult: 1, globalSpeedLimit: 1, noiseScale: 0.01,
                edgeWrap: false, spawnSpillover: 100, globalMoveMethod: "direct", drawShape: "arc",
                shapeSize: "direct", shrink: false, shrinkRate: 0.3, fade: true, fadeRate: 5,
                shapeFill: [0, 0, 0]
            },
            sets: [
                {numParticles: 5000, lifetime: 30, size: 12, color: [55, 19, 49], alpha: 80},
                {numParticles: 2000, lifetime: 30, size: 6, color: [17, 6, 15], alpha: 80},
                {numParticles: 5000, lifetime: 30, size: 3, color: [74, 25, 66], alpha: 100},
                {numParticles: 5000, lifetime: 40, size: 2, color: [93, 31, 83], alpha: 80},
                {numParticles: 10000, lifetime: 30, size: 2, color: [112, 38, 100], alpha: 70}
            ]
        }
    };
}

function loadExample(exampleName) {
    const presets = getExamplePresets();
    const preset = presets[exampleName];
    noiseSeed(frameCount);
    
    if (!preset) {
        console.error('Example not found:', exampleName);
        return;
    }
    
    // Clear existing particle sets
    particleSets = [];
    particleSequence = null;
    
    // Create particle sets from the preset
    preset.sets.forEach(setData => {
        const options = {
            ...preset.options,
            shapeFill: preset.options.shapeFill ? 
                createVector(preset.options.shapeFill[0], preset.options.shapeFill[1], preset.options.shapeFill[2]) :
                createVector(255, 255, 255)
        };
        
        const particleSet = new ParticleSet(
            setData.numParticles,
            setData.lifetime,
            setData.size,
            createVector(setData.color[0], setData.color[1], setData.color[2]),
            setData.alpha,
            options
        );
        
        particleSets.push(particleSet);
    });
    
    // Create sequence
    particleSequence = new ParticleSequence([...particleSets]);
    
    // Update UI
    updateParticleSetsList();
    
    // Auto-start the animation
    isRunning = true;
    
    // Clear canvas for fresh start
    background(0);
}

function randomizeParameters() {
    // Basic parameters
    document.getElementById('numParticles').value = Math.floor(Math.random() * 4000) + 500; // 500-4500
    document.getElementById('lifetime').value = Math.floor(Math.random() * 150) + 25; // 25-175
    document.getElementById('size').value = (Math.random() * 15 + 0.5).toFixed(1); // 0.5-15.5
    document.getElementById('alpha').value = Math.floor(Math.random() * 155) + 100; // 100-255
    
    // Random colors
    const randomColor = () => '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
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
    
    const shapeOptions = ['line', 'arc', 'circle'];
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
            color: {x: set.color.x, y: set.color.y, z: set.color.z},
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
                shapeFill: {x: set.shapeFill.x, y: set.shapeFill.y, z: set.shapeFill.z},
                shrink: set.shrink,
                shrinkRate: set.shrinkRate,
                fade: set.fade,
                fadeRate: set.fadeRate
            }
        }))
    };
    
    const blob = new Blob([JSON.stringify(preset, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'particle_preset.json';
    a.click();
    URL.revokeObjectURL(url);
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('particle-form').addEventListener('submit', function(e) {
        e.preventDefault();
        addParticleSet();
    });
    
    // Initialize
    updateParticleSetsList();
});