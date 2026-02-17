// Scoring utilities for AI vs HUMAN game

class ScoringSystem {
    constructor() {
        this.scoreWeights = {
            correctAnswer: 10,
            damageDealt: 0.5,      // Points per damage dealt
            houseDefended: 5,      // Points for successful defense
            knowledgeGained: 1,    // Points per knowledge point
            troopsRemaining: 0.2   // Points per remaining troop
        };
    }
    
    // Calculate score for a player based on various factors
    calculatePlayerScore(playerState) {
        let score = playerState.score; // Base score from game engine
        
        // Bonus for knowledge
        score += playerState.knowledge * this.scoreWeights.knowledgeGained;
        
        // Bonus for remaining troops
        score += playerState.troops * this.scoreWeights.troopsRemaining;
        
        // Bonus for health (encourage survival)
        score += playerState.health * 0.1;
        
        return Math.floor(score);
    }
    
    // Calculate damage score
    calculateDamageScore(damageDealt) {
        return damageDealt * this.scoreWeights.damageDealt;
    }
    
    // Calculate answer score
    calculateAnswerScore(isCorrect) {
        return isCorrect ? this.scoreWeights.correctAnswer : 0;
    }
    
    // Calculate defense score
    calculateDefenseScore(defenseValue, wasAttacked) {
        let score = 0;
        if (wasAttacked) {
            // Bonus for successfully defending
            score += this.scoreWeights.houseDefended;
        }
        score += defenseValue * 0.1;
        return score;
    }
    
    // Determine winner between two players
    determineWinner(humanScore, aiScore) {
        if (humanScore > aiScore) return 'human';
        if (aiScore > humanScore) return 'ai';
        return 'draw';
    }
    
    // Calculate win margin percentage
    calculateWinMargin(winnerScore, loserScore) {
        if (loserScore === 0) return 100;
        return Math.round(((winnerScore - loserScore) / loserScore) * 100);
    }
    
    // Get performance rating (0-100)
    calculatePerformanceRating(playerState, totalTurns) {
        let rating = 50; // Base rating
        
        // Score contribution (max 30 points)
        const maxExpectedScore = totalTurns * 15; // Rough estimate
        const scoreRatio = Math.min(playerState.score / maxExpectedScore, 1);
        rating += scoreRatio * 30;
        
        // Health contribution (max 10 points)
        rating += (playerState.health / 100) * 10;
        
        // Knowledge contribution (max 10 points)
        const maxKnowledge = totalTurns * 5;
        const knowledgeRatio = Math.min(playerState.knowledge / maxKnowledge, 1);
        rating += knowledgeRatio * 10;
        
        return Math.min(100, Math.floor(rating));
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScoringSystem;
}