class ParticleSet{

    constructor(numParticles, lifetime, size, color, alpha, options = {}){
        this.numParticles = numParticles;
        this.size = size;
        this.lifetime = lifetime;
        this.color = color;
        this.alpha = alpha;

        // Physics and behavior properties (with defaults)
        this.scl = options.scl || 5;
        this.magnitude = options.magnitude || 4;
        this.angleMult = options.angleMult || 1;
        this.globalSpeedLimit = options.globalSpeedLimit || 1;
        this.noiseScale = options.noiseScale || .01;
        this.edgeWrap = options.edgeWrap || false;
        this.spawnSpillover = options.spawnSpillover || 0;
        this.globalMoveMethod = options.globalMoveMethod || "direct";
        this.drawShape = options.drawShape || "line";
        this.shapeSize = options.shapeSize || "relative";
        this.shapeFill = options.shapeFill || createVector(255, 255, 255);
        
        // Animation properties (moved from constructor parameters to options)
        this.shrink = options.shrink || false;
        this.shrinkRate = options.shrinkRate || .3;
        this.fade = options.fade || false;
        this.fadeRate = options.fadeRate || 1;

        this.particles = [];
        this.generateParticles();
        
    }

    generateParticles(){
        for(let i = 0; i < this.numParticles; i++){
            this.particles[i] = new Particle(this.size, this.color, this.alpha, this.lifetime, this);
        }
    };

    update(){
        for(let p of this.particles){
            p.update();
            
            // Apply shrinking if enabled
            if(this.shrink && this.drawShape == "line"){
                p.size -= this.shrinkRate;
           
            }
            
            // Apply fading if enabled
            if(this.fade){
                p.alpha -= this.fadeRate;

            }
        }
        
        this.lifetime--;
        if(this.lifetime === 0){
            this.particles = [];
        }
    }
    
    show(){
        for(let p of this.particles){
            p.show();
        }
    }

    follow(flowfield){
        for(let p of this.particles){
            p.follow(flowfield);
        }
    }

    edges(){
        if(this.edgeWrap == true){
            for(let p of this.particles){
                p.edges();
            }
        }
    }
}