// Player class for AI vs HUMAN game

class Player {
    constructor(type, name = '') {
        this.type = type; // 'human' or 'ai'
        this.name = name || (type === 'human' ? 'Human' : 'AI');
        this.score = 0;
        this.health = 100;
        this.defense = 50;
        this.troops = 10;
        this.knowledge = 0;
        this.houseDefended = false;
        this.actionHistory = [];
        this.traits = this.initializeTraits();
    }
    
    initializeTraits() {
        if (this.type === 'human') {
            return {
                aggression: 0.5,
                caution: 0.5,
                intelligence: 0.7,
                adaptability: 0.8
            };
        } else {
            return {
                aggression: 0.6,
                caution: 0.4,
                intelligence: 0.8,
                adaptability: 0.9
            };
        }
    }
    
    // Record an action
    recordAction(action, outcome) {
        this.actionHistory.push({
            turn: this.actionHistory.length + 1,
            action,
            outcome,
            timestamp: new Date().toISOString()
        });
        
        if (this.actionHistory.length > 20) {
            this.actionHistory.shift();
        }
    }
    
    // Update player stats
    updateStats(stats) {
        Object.keys(stats).forEach(key => {
            if (this[key] !== undefined) {
                this[key] = stats[key];
            }
        });
    }
    
    // Get player state
    getState() {
        return {
            type: this.type,
            name: this.name,
            score: this.score,
            health: this.health,
            defense: this.defense,
            troops: this.troops,
            knowledge: this.knowledge,
            houseDefended: this.houseDefended,
            traits: { ...this.traits }
        };
    }
    
    // Check if player is alive
    isAlive() {
        return this.health > 0;
    }
    
    // Reset player for new game
    reset() {
        this.score = 0;
        this.health = 100;
        this.defense = 50;
        this.troops = 10;
        this.knowledge = 0;
        this.houseDefended = false;
        this.actionHistory = [];
    }
    
    // Calculate player effectiveness (0-100)
    calculateEffectiveness() {
        let effectiveness = 50;
        
        effectiveness += (this.health / 100) * 20;
        effectiveness += (this.knowledge / 50) * 15;
        effectiveness += (this.troops / 20) * 10;
        effectiveness += (this.score / 200) * 15;
        
        return Math.min(100, Math.floor(effectiveness));
    }
    
    // Get player's preferred action based on traits
    getPreferredAction() {
        const rand = Math.random();
        
        if (rand < this.traits.aggression) {
            return 'attack';
        } else if (rand < this.traits.aggression + this.traits.caution) {
            return 'defend';
        } else {
            return 'answer';
        }
    }
    
    // Adjust traits based on game outcome
    adjustTraits(outcome) {
        const learningRate = 0.05;
        
        if (outcome.successful) {
            if (outcome.action === 'attack') {
                this.traits.aggression = Math.min(1, this.traits.aggression + learningRate);
            } else if (outcome.action === 'defend') {
                this.traits.caution = Math.min(1, this.traits.caution + learningRate);
            } else if (outcome.action === 'answer') {
                this.traits.intelligence = Math.min(1, this.traits.intelligence + learningRate);
            }
        } else {
            this.traits.adaptability = Math.min(1, this.traits.adaptability + learningRate);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Player;
}