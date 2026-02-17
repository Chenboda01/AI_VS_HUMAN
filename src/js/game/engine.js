// Game Engine - Core game state and turn management
class GameEngine {
  constructor () {
    this.state = {
      currentTurn: 1,
      maxTurns: 20,
      currentPlayer: 'human',
      gameOver: false,
      winner: null,
      difficulty: 'medium',
      playerRole: 'human', // 'human' or 'ai' - which side the player controls
    };

    this.players = {
      human: {
        score: 0,
        health: 100,
        defense: 50,
        troops: 10,
        knowledge: 0,
        houseDefended: false,
      },
      ai: {
        score: 0,
        health: 100,
        defense: 50,
        troops: 10,
        knowledge: 0,
        houseDefended: false,
      },
    };

    this.questions = [
      {
        question: 'What is the capital of France?',
        answers: ['Paris', 'London', 'Berlin', 'Madrid'],
        correct: 0,
      },
      {
        question: 'Which planet is known as the Red Planet?',
        answers: ['Earth', 'Mars', 'Jupiter', 'Venus'],
        correct: 1,
      },
      {
        question: 'What is the largest mammal in the world?',
        answers: ['Elephant', 'Blue Whale', 'Giraffe', 'Polar Bear'],
        correct: 1,
      },
      {
        question: 'Who painted the Mona Lisa?',
        answers: ['Van Gogh', 'Picasso', 'Da Vinci', 'Rembrandt'],
        correct: 2,
      },
      {
        question: 'What is the chemical symbol for Gold?',
        answers: ['Go', 'Gd', 'Au', 'Ag'],
        correct: 2,
      },
      {
        question: 'How many continents are there?',
        answers: ['5', '6', '7', '8'],
        correct: 2,
      },
      {
        question: 'What is the smallest prime number?',
        answers: ['0', '1', '2', '3'],
        correct: 2,
      },
      {
        question: 'Which element is the most abundant in Earth\'s atmosphere?',
        answers: ['Oxygen', 'Carbon', 'Nitrogen', 'Hydrogen'],
        correct: 2,
      },
      {
        question: 'Who wrote \'Romeo and Juliet\'?',
        answers: [
          'Charles Dickens',
          'William Shakespeare',
          'Mark Twain',
          'Jane Austen',
        ],
        correct: 1,
      },
      {
        question: 'What is the speed of light in vacuum (m/s)?',
        answers: ['299,792,458', '300,000,000', '299,792', '299,792,459'],
        correct: 0,
      },
    ];

    this.currentQuestionIndex = 0;
    this.battleLog = [];
    this.aiStrategyWeights = { answer: 0.4, attack: 0.4, defend: 0.2 };
  }

  // Initialize a new game
  init () {
    this.state = {
      currentTurn: 1,
      maxTurns: 20,
      currentPlayer: 'human',
      gameOver: false,
      winner: null,
      difficulty: 'medium',
      playerRole: this.state.playerRole || 'human', // Preserve existing role or default to human
    };

    this.players = {
      human: {
        score: 0,
        health: 100,
        defense: 50,
        troops: 10,
        knowledge: 0,
        houseDefended: false,
      },
      ai: {
        score: 0,
        health: 100,
        defense: 50,
        troops: 10,
        knowledge: 0,
        houseDefended: false,
      },
    };

    this.currentQuestionIndex = Math.floor(
      Math.random() * this.questions.length,
    );
    this.battleLog = ['Game started! Human goes first.'];
    this.aiStrategyWeights = { answer: 0.4, attack: 0.4, defend: 0.2 };

    this.logEvent('Game initialized. Ready to play!');
    return this;
  }

  // Get current game state
  getGameState () {
    return {
      ...this.state,
      players: { ...this.players },
      currentQuestion: this.questions[this.currentQuestionIndex],
      battleLog: [...this.battleLog],
    };
  }

  // Switch to next player/turn
  nextTurn () {
    if (this.state.gameOver) return false;

    if (this.state.currentPlayer === 'human') {
      this.state.currentPlayer = 'ai';
    } else {
      this.state.currentPlayer = 'human';
      this.state.currentTurn++;

      if (this.state.currentTurn > this.state.maxTurns) {
        this.endGame();
        return false;
      }
    }

    this.players.human.houseDefended = false;
    this.players.ai.houseDefended = false;

    this.logEvent(
      `Turn ${this.state.currentTurn}: ${this.state.currentPlayer.toUpperCase()}'s turn`,
    );
    return true;
  }

  // Human action: Answer current question
  answerQuestion (answerIndex) {
    if (this.state.currentPlayer !== 'human' || this.state.gameOver) {
      return false;
    }

    const question = this.questions[this.currentQuestionIndex];
    const isCorrect = answerIndex === question.correct;
    let points = 0;

    if (isCorrect) {
      points = 10;
      this.players.human.knowledge += 5;
      this.players.human.score += points;
      this.logEvent(
        `Human answered correctly! +${points} points. Knowledge increased.`,
      );
    } else {
      this.logEvent('Human answered incorrectly. No points gained.');
    }

    this.currentQuestionIndex =
      (this.currentQuestionIndex + 1) % this.questions.length;
    this.nextTurn();

    return { success: isCorrect, points };
  }

  // Human action: Send troops to attack AI
  sendTroops (humanTroopsCount) {
    if (this.state.currentPlayer !== 'human' || this.state.gameOver) {
      return false;
    }

    const troops = Math.min(humanTroopsCount, this.players.human.troops);
    if (troops <= 0) {
      this.logEvent('Human has no troops to send!');
      return false;
    }

    this.players.human.troops -= troops;
    let damage = troops * 10;

    if (this.players.ai.houseDefended) {
      damage = Math.floor(damage * 0.5);
      this.logEvent(
        `Human sent ${troops} troops! AI's defense reduced damage by 50%.`,
      );
    } else {
      this.logEvent(`Human sent ${troops} troops! Attacking AI's house.`);
    }

    const actualDamage = Math.max(0, damage - this.players.ai.defense);
    this.players.ai.health -= actualDamage;
    this.players.human.score += actualDamage * 0.5;

    if (actualDamage > 0) {
      this.logEvent(`Attack successful! AI lost ${actualDamage} health.`);
    } else {
      this.logEvent('Attack blocked by AI\'s defense.');
    }

    this.nextTurn();
    return { troops, damage: actualDamage };
  }

  // Human action: Defend house
  defendHouse () {
    if (this.state.currentPlayer !== 'human' || this.state.gameOver) {
      return false;
    }

    this.players.human.houseDefended = true;
    this.players.human.defense += 20;
    this.logEvent('Human fortified their house! Defense increased.');

    this.nextTurn();
    return true;
  }

  // AI makes a decision based on strategy weights
  aiTakeTurn () {
    if (this.state.currentPlayer !== 'ai' || this.state.gameOver) return false;

    const strategy = this.chooseAIStrategy();
    let result;

    switch (strategy) {
    case 'answer':
      result = this.aiAnswerQuestion();
      break;
    case 'attack':
      result = this.aiSendTroops();
      break;
    case 'defend':
      result = this.aiDefendHouse();
      break;
    }

    this.updateAIStrategyWeights(strategy, result);
    this.nextTurn();
    return { strategy, result };
  }

  // AI chooses strategy based on weights and game state
  chooseAIStrategy () {
    const weights = this.aiStrategyWeights;

    if (this.players.ai.health < 30) {
      weights.defend = 0.6;
      weights.attack = 0.2;
      weights.answer = 0.2;
    } else if (this.players.human.health < 30) {
      weights.attack = 0.6;
      weights.defend = 0.2;
      weights.answer = 0.2;
    } else if (this.players.ai.knowledge < 20) {
      weights.answer = 0.6;
      weights.attack = 0.3;
      weights.defend = 0.1;
    }

    const total = weights.answer + weights.attack + weights.defend;
    const rand = Math.random() * total;

    if (rand < weights.answer) return 'answer';
    if (rand < weights.answer + weights.attack) return 'attack';
    return 'defend';
  }

  // AI answers question
  aiAnswerQuestion () {
    const aiCorrectChance = this.getAICorrectChance();
    const isCorrect = Math.random() < aiCorrectChance;

    if (isCorrect) {
      const points = 10;
      this.players.ai.knowledge += 5;
      this.players.ai.score += points;
      this.logEvent(
        `AI answered correctly! +${points} points. Knowledge increased.`,
      );
    } else {
      this.logEvent('AI answered incorrectly. No points gained.');
    }

    this.currentQuestionIndex =
      (this.currentQuestionIndex + 1) % this.questions.length;
    return { success: isCorrect };
  }

  // AI sends troops
  aiSendTroops () {
    const maxTroops = Math.min(5, this.players.ai.troops);
    const troops = Math.floor(maxTroops * (0.3 + Math.random() * 0.7));

    if (troops <= 0) {
      this.logEvent('AI has no troops to send!');
      return { troops: 0, damage: 0 };
    }

    this.players.ai.troops -= troops;
    let damage = troops * 10;

    if (this.players.human.houseDefended) {
      damage = Math.floor(damage * 0.5);
      this.logEvent(
        `AI sent ${troops} troops! Human's defense reduced damage by 50%.`,
      );
    } else {
      this.logEvent(`AI sent ${troops} troops! Attacking human's house.`);
    }

    const actualDamage = Math.max(0, damage - this.players.human.defense);
    this.players.human.health -= actualDamage;
    this.players.ai.score += actualDamage * 0.5;

    if (actualDamage > 0) {
      this.logEvent(`Attack successful! Human lost ${actualDamage} health.`);
    } else {
      this.logEvent('Attack blocked by human\'s defense.');
    }

    return { troops, damage: actualDamage };
  }

  // AI defends house
  aiDefendHouse () {
    this.players.ai.houseDefended = true;
    this.players.ai.defense += 20;
    this.logEvent('AI fortified their house! Defense increased.');
    return true;
  }

  // Update AI strategy weights based on outcome
  updateAIStrategyWeights (strategy, result) {
    const adjustment = 0.05;

    if (strategy === 'answer' && result.success) {
      this.aiStrategyWeights.answer += adjustment;
    } else if (strategy === 'attack' && result.damage > 0) {
      this.aiStrategyWeights.attack += adjustment;
    } else if (strategy === 'defend') {
      this.aiStrategyWeights.defend += adjustment;
    }

    const total =
      this.aiStrategyWeights.answer +
      this.aiStrategyWeights.attack +
      this.aiStrategyWeights.defend;
    this.aiStrategyWeights.answer /= total;
    this.aiStrategyWeights.attack /= total;
    this.aiStrategyWeights.defend /= total;
  }

  // Get AI's chance to answer correctly based on difficulty
  getAICorrectChance () {
    const baseChance = { easy: 0.6, medium: 0.75, hard: 0.9 };
    return baseChance[this.state.difficulty] || 0.75;
  }

  // End the game and determine winner
  endGame () {
    this.state.gameOver = true;

    if (this.players.human.score > this.players.ai.score) {
      this.state.winner = 'human';
      this.logEvent(
        `Game over! Human wins with ${this.players.human.score} points!`,
      );
    } else if (this.players.ai.score > this.players.human.score) {
      this.state.winner = 'ai';
      this.logEvent(`Game over! AI wins with ${this.players.ai.score} points!`);
    } else {
      this.state.winner = 'draw';
      this.logEvent(
        `Game over! It's a draw with ${this.players.human.score} points each!`,
      );
    }
  }

  // Add message to battle log
  logEvent (message) {
    const timestamp = new Date().toLocaleTimeString();
    this.battleLog.push(`[${timestamp}] ${message}`);

    if (this.battleLog.length > 20) {
      this.battleLog.shift();
    }
  }

  // Set which side the player controls (human or ai)
  setPlayerRole (role) {
    if (['human', 'ai'].includes(role)) {
      this.state.playerRole = role;
      this.logEvent(`Player now controls ${role.toUpperCase()} side`);
      return true;
    }
    return false;
  }

  // Swap human and AI player data (used when player chooses to control AI side)
  swapPlayerControls () {
    const temp = this.players.human;
    this.players.human = this.players.ai;
    this.players.ai = temp;
    this.logEvent(
      'Player controls swapped - human side is now AI-controlled and vice versa',
    );
  }

  // Set game difficulty
  setDifficulty (difficulty) {
    if (['easy', 'medium', 'hard'].includes(difficulty)) {
      this.state.difficulty = difficulty;
      this.logEvent(`Difficulty set to ${difficulty}`);
      return true;
    }
    return false;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameEngine;
}
