class ParticleSequence{
    constructor(sets){
        this.sets = sets;
        this.curr = 0;
    }

    execute(){
        if (!this.sets[this.curr]) return;
        
        let currentSet = this.sets[this.curr];
        
        // Update current set
        currentSet.show();
        currentSet.update();
        currentSet.follow( );
        currentSet.edges();
        
        
        // Move to next set when current one dies
        if (currentSet.lifetime <= 0) {
            this.curr++;
        }
    }


}