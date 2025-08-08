class Particle{

    constructor(size, color, alpha, lifetime, parentSet){
        this.parent = parentSet; // Store reference to parent ParticleSet
        let RANGE = this.parent.spawnSpillover;
        this.pos = createVector(random(-RANGE, width + RANGE), random(-RANGE, height + RANGE) );
        this.vel = createVector(0,0);
        this.acc = createVector(0,0);
        this.maxspeed = this.parent.globalSpeedLimit;
        this.size = size;
        this.color = color;
        this.alpha = alpha
        this.prevPos = this.pos.copy();
        this.method = this.parent.globalMoveMethod;
        this.lifetime = lifetime;
        this.fullLife = lifetime;
    }

    update(method = this.method){
        if(method === "physics"){
            this.updatePhysics();
        } else if(method === "direct"){
            this.updateDirect();
        }
        this.lifetime--;
    }

    updatePhysics(){
        this.prevPos = this.pos.copy();
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.vel.limit(this.maxspeed);
        this.acc.mult(0);
    }

    updateDirect(){
        if (this.pos.x >= width) {
            this.pos.x -= width;
            this.prevPos.x -= width;
        } else if (this.pos.x < 0) {
            this.pos.x += width;
            this.prevPos.x += width;
        }
        
        if (this.pos.y >= height) {
            this.pos.y -= height;
            this.prevPos.y -= height;
        } else if (this.pos.y < 0) {
            this.pos.y += height;
            this.prevPos.y += height;
        }
    }

    applyForce(force) {
        this.acc.add(force);
    }

    updatePrev(){
        this.prevPos.x = this.pos.x
        this.prevPos.y = this.pos.y
    }
    
    edges(){
        if(this.pos.x > width){
            this.pos.x = 0;
            this.updatePrev();
        }
        if(this.pos.x < 0){
            this.pos.x = width;
            this.updatePrev();
        }
        if(this.pos.y > height){
            this.pos.y = 0;
            this.updatePrev();
        }
        if(this.pos.y < 0){
            this.pos.y = height;
            this.updatePrev();
        }
    }

    follow(vectors, method = this.method){
        if(method === "physics"){
            this.followPhysics(vectors);
        } else if(method === "direct"){
            this.followDirect(vectors);
        }
    }

    followPhysics(vectors){
        // Physics simulation with acc / vel
        let x = floor(this.pos.x / this.parent.scl);
        let y = floor(this.pos.y / this.parent.scl);
        let index = x + y * cols;
        let force = vectors[index];
        this.applyForce(force);
    }

    followDirect(vectors){  
        // Direct movement version
        this.prevPos.x = this.pos.x;
        this.prevPos.y = this.pos.y;
        
        let angle = noise(this.pos.x * this.parent.noiseScale, this.pos.y * this.parent.noiseScale) * this.parent.angleMult * TWO_PI;
        let force = p5.Vector.fromAngle(angle);
        force.setMag(this.parent.magnitude);
        
        this.pos.x += force.x;
        this.pos.y += force.y;
    }

    show(){
        stroke(this.color.x, this.color.y, this.color.z, this.alpha);
        strokeWeight(this.size);
        let r;
        fill(this.parent.shapeFill.x, this.parent.shapeFill.y, this.parent.shapeFill.z);

        if(this.parent.drawShape == "line"){
            line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
        }else if(this.parent.drawShape == "arc"){
            if(this.parent.shrink){
                if(this.parent.shapeSize == "relative"){
                    r = map(this.lifetime, 0, this.fullLife, 0, this.size);
                }else if(this.parent.shapeSize == "direct"){
                    r = this.lifetime;
                }
            } else {
               r = this.size; 
            }
            arc(this.pos.x, this.pos.y, r, r, 0, PI);
        }else if(this.parent.drawShape == "circle"){
            if(this.parent.shrink){
                ellipse(this.pos.x, this.pos.y, this.lifetime, this.lifetime);
            } else {
                ellipse(this.pos.x, this.pos.y, this.size, this.size);
            }
        }
    }
}