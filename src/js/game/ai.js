// AI Module - Multi-objective AI decision making
class AIPlayer {
  constructor(difficulty = 'medium') {
    this.difficulty = difficulty;
    this.strategyWeights = {
      answer: 0.4, // Answer questions
      attack: 0.4, // Send troops
      defend: 0.2, // Defend house
    };
    this.knowledge = 0;
    this.aggression = 0.5;
    this.defensiveness = 0.5;
  }

  // Choose action based on game state
  chooseAction(gameState) {
    const { ai, human, currentTurn, maxTurns } = gameState;

    this.adaptStrategy(ai, human, currentTurn, maxTurns);

    const strategy = this.selectStrategy();
    const action = this.generateAction(strategy, ai, human);

    return {
      strategy,
      action,
      weights: { ...this.strategyWeights },
    };
  }

  // Adapt strategy based on current situation
  adaptStrategy(aiState, humanState, currentTurn, maxTurns) {
    const turnRatio = currentTurn / maxTurns;
    const healthRatio = aiState.health / 100;

    // Adjust weights based on game state
    if (aiState.health < 30) {
      this.strategyWeights.defend = 0.6;
      this.strategyWeights.attack = 0.2;
      this.strategyWeights.answer = 0.2;
    } else if (humanState.health < 30) {
      this.strategyWeights.attack = 0.6;
      this.strategyWeights.defend = 0.2;
      this.strategyWeights.answer = 0.2;
    } else if (this.knowledge < 20) {
      this.strategyWeights.answer = 0.6;
      this.strategyWeights.attack = 0.3;
      this.strategyWeights.defend = 0.1;
    } else if (turnRatio > 0.7) {
      this.strategyWeights.attack = 0.5;
      this.strategyWeights.answer = 0.3;
      this.strategyWeights.defend = 0.2;
    } else if (healthRatio < 0.5) {
      this.strategyWeights.defend = 0.5;
      this.strategyWeights.attack = 0.3;
      this.strategyWeights.answer = 0.2;
    }

    this.normalizeWeights();
  }

  // Select strategy based on current weights
  selectStrategy() {
    const total =
      this.strategyWeights.answer +
      this.strategyWeights.attack +
      this.strategyWeights.defend;
    const rand = Math.random() * total;

    if (rand < this.strategyWeights.answer) return 'answer';
    if (rand < this.strategyWeights.answer + this.strategyWeights.attack) {
      return 'attack';
    }
    return 'defend';
  }

  // Generate specific action for chosen strategy
  generateAction(strategy, aiState, humanState) {
    switch (strategy) {
      case 'answer': {
        return {
          type: 'answer',
          confidence: this.getAnswerConfidence(),
        };
      }

      case 'attack': {
        const maxTroops = Math.min(5, aiState.troops);
        const troops = Math.floor(maxTroops * (0.3 + Math.random() * 0.7));
        return {
          type: 'attack',
          troops: Math.max(1, troops),
          target: 'human',
        };
      }

      case 'defend': {
        return {
          type: 'defend',
          boost: 20,
        };
      }

      default:
        return { type: 'answer', confidence: 0.7 };
    }
  }

  // Get AI's chance to answer correctly based on difficulty
  getAnswerConfidence() {
    const baseConfidence = {
      easy: 0.6,
      medium: 0.75,
      hard: 0.9,
    };
    return baseConfidence[this.difficulty] || 0.75;
  }

  // Update strategy weights based on action outcome
  updateWeights(strategy, outcome) {
    const learningRate = 0.05;

    if (strategy === 'answer' && outcome.success) {
      this.strategyWeights.answer += learningRate;
      this.knowledge += 5;
    } else if (strategy === 'attack' && outcome.damage > 0) {
      this.strategyWeights.attack += learningRate;
      this.aggression = Math.min(1, this.aggression + 0.1);
    } else if (strategy === 'defend' && outcome.defended) {
      this.strategyWeights.defend += learningRate;
      this.defensiveness = Math.min(1, this.defensiveness + 0.1);
    }

    this.normalizeWeights();
  }

  // Normalize weights to sum to 1
  normalizeWeights() {
    const total =
      this.strategyWeights.answer +
      this.strategyWeights.attack +
      this.strategyWeights.defend;
    if (total > 0) {
      this.strategyWeights.answer /= total;
      this.strategyWeights.attack /= total;
      this.strategyWeights.defend /= total;
    }
  }

  // Set difficulty level
  setDifficulty(difficulty) {
    if (['easy', 'medium', 'hard'].includes(difficulty)) {
      this.difficulty = difficulty;
      return true;
    }
    return false;
  }

  // Get AI personality traits
  getPersonality() {
    return {
      knowledge: this.knowledge,
      aggression: this.aggression,
      defensiveness: this.defensiveness,
      adaptability: 0.7,
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIPlayer;
}
