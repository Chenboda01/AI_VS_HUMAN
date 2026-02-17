/* global describe, test, expect, beforeEach, afterEach, jest */
import GameEngine from './engine.js';

describe('GameEngine', () => {
  let game;

  beforeEach(() => {
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
    jest
      .spyOn(Date.prototype, 'toLocaleTimeString')
      .mockReturnValue('12:00:00');
    game = new GameEngine();
    game.init();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor and init', () => {
    test('initializes with default state', () => {
      const newGame = new GameEngine();
      expect(newGame.state.currentTurn).toBe(1);
      expect(newGame.state.maxTurns).toBe(20);
      expect(newGame.state.currentPlayer).toBe('human');
      expect(newGame.state.gameOver).toBe(false);
      expect(newGame.state.winner).toBe(null);
      expect(newGame.state.difficulty).toBe('medium');
      expect(newGame.state.playerRole).toBe('human');
      expect(newGame.players.human.score).toBe(0);
      expect(newGame.players.ai.score).toBe(0);
      expect(newGame.questions.length).toBeGreaterThan(0);
    });

    test('init resets state', () => {
      // Modify some state
      game.state.currentTurn = 10;
      game.state.gameOver = true;
      game.players.human.score = 100;
      game.battleLog.push('test');

      game.init();

      expect(game.state.currentTurn).toBe(1);
      expect(game.state.gameOver).toBe(false);
      expect(game.players.human.score).toBe(0);
      expect(game.battleLog).toEqual([
        'Game started! Human goes first.',
        '[12:00:00] Game initialized. Ready to play!',
      ]);
    });

    test('init preserves playerRole', () => {
      game.state.playerRole = 'ai';
      game.init();
      expect(game.state.playerRole).toBe('ai');
    });
  });

  describe('getGameState', () => {
    test('returns a deep copy of game state', () => {
      const state = game.getGameState();
      expect(state.currentTurn).toBe(1);
      expect(state.players.human.score).toBe(0);
      expect(state.currentQuestion).toBeDefined();
      expect(state.battleLog).toEqual([
        'Game started! Human goes first.',
        '[12:00:00] Game initialized. Ready to play!',
      ]);
      // Ensure it's a copy
      state.players.human.score = 999;
      expect(game.players.human.score).toBe(0);
    });
  });

  describe('nextTurn', () => {
    test('switches from human to AI', () => {
      expect(game.state.currentPlayer).toBe('human');
      const result = game.nextTurn();
      expect(result).toBe(true);
      expect(game.state.currentPlayer).toBe('ai');
    });

    test('switches from AI to human and increments turn', () => {
      game.state.currentPlayer = 'ai';
      const result = game.nextTurn();
      expect(result).toBe(true);
      expect(game.state.currentPlayer).toBe('human');
      expect(game.state.currentTurn).toBe(2);
    });

    test('resets houseDefended flag for player whose turn is starting', () => {
      // Human turn ends, AI turn starts
      game.players.human.houseDefended = true;
      game.players.ai.houseDefended = true;
      game.nextTurn(); // switches to AI
      // AI's defense should be cleared (since AI's turn starting)
      expect(game.players.ai.houseDefended).toBe(false);
      // Human's defense should persist (will be cleared when human's turn starts again)
      expect(game.players.human.houseDefended).toBe(true);
    });

    test('ends game after max turns', () => {
      game.state.currentTurn = 20;
      game.state.currentPlayer = 'ai';
      const result = game.nextTurn();
      expect(result).toBe(false);
      expect(game.state.gameOver).toBe(true);
    });

    test('returns false when game already over', () => {
      game.state.gameOver = true;
      expect(game.nextTurn()).toBe(false);
    });
  });

  describe('answerQuestion', () => {
    test('human answers correctly', () => {
      const question = game.questions[game.currentQuestionIndex];
      const result = game.answerQuestion(question.correct);
      expect(result.success).toBe(true);
      expect(result.points).toBe(10);
      expect(game.players.human.score).toBe(10);
      expect(game.players.human.knowledge).toBe(5);
      expect(game.state.currentPlayer).toBe('ai'); // Turn should have switched
    });

    test('human answers incorrectly', () => {
      const wrongAnswer =
        (game.questions[game.currentQuestionIndex].correct + 1) % 4;
      const result = game.answerQuestion(wrongAnswer);
      expect(result.success).toBe(false);
      expect(game.players.human.score).toBe(0);
      expect(game.state.currentPlayer).toBe('ai');
    });

    test('cannot answer when not human turn', () => {
      game.state.currentPlayer = 'ai';
      expect(game.answerQuestion(0)).toBe(false);
    });

    test('cannot answer when game over', () => {
      game.state.gameOver = true;
      expect(game.answerQuestion(0)).toBe(false);
    });
  });

  describe('sendTroops', () => {
    test('human sends troops successfully', () => {
      const initialTroops = game.players.human.troops;
      const result = game.sendTroops(3);
      expect(result.troops).toBe(3);
      expect(result.damage).toBeGreaterThanOrEqual(0);
      expect(game.players.human.troops).toBe(initialTroops - 3);
      expect(game.state.currentPlayer).toBe('ai');
    });

    test('human sends maximum available troops', () => {
      game.players.human.troops = 2;
      const result = game.sendTroops(5);
      expect(result.troops).toBe(2);
      expect(game.players.human.troops).toBe(0);
    });

    test('troops cause damage reduced by defense', () => {
      game.players.ai.defense = 100; // High defense
      const result = game.sendTroops(5);
      expect(result.damage).toBe(0);
    });

    test('damage halved when AI house defended', () => {
      game.players.ai.houseDefended = true;
      const result = game.sendTroops(5);
      // 5 troops * 10 = 50 damage, halved = 25, minus defense (50) = 0
      expect(result.damage).toBe(0);
    });

    test('cannot send troops when not human turn', () => {
      game.state.currentPlayer = 'ai';
      expect(game.sendTroops(1)).toBe(false);
    });

    test('cannot send zero or negative troops', () => {
      game.players.human.troops = 0;
      expect(game.sendTroops(1)).toBe(false);
    });
  });

  describe('defendHouse', () => {
    test('human defends house', () => {
      const initialDefense = game.players.human.defense;
      expect(game.defendHouse()).toBe(true);
      expect(game.players.human.houseDefended).toBe(true);
      expect(game.players.human.defense).toBe(initialDefense + 20);
      expect(game.state.currentPlayer).toBe('ai');
    });

    test('cannot defend when not human turn', () => {
      game.state.currentPlayer = 'ai';
      expect(game.defendHouse()).toBe(false);
    });
  });

  describe('aiTakeTurn', () => {
    test('AI takes turn with answer strategy', () => {
      game.state.currentPlayer = 'ai';
      jest.spyOn(game, 'chooseAIStrategy').mockReturnValue('answer');
      jest.spyOn(game, 'aiAnswerQuestion').mockReturnValue({ success: true });
      jest.spyOn(game, 'updateAIStrategyWeights');

      const result = game.aiTakeTurn();
      expect(result.strategy).toBe('answer');
      expect(result.result.success).toBe(true);
      expect(game.chooseAIStrategy).toHaveBeenCalled();
      expect(game.aiAnswerQuestion).toHaveBeenCalled();
      expect(game.updateAIStrategyWeights).toHaveBeenCalledWith('answer', {
        success: true,
      });
      expect(game.state.currentPlayer).toBe('human');
    });

    test('AI cannot take turn when not AI turn', () => {
      expect(game.aiTakeTurn()).toBe(false);
    });
  });

  describe('chooseAIStrategy', () => {
    test('returns one of answer, attack, defend', () => {
      const strategies = ['answer', 'attack', 'defend'];
      for (let i = 0; i < 10; i++) {
        Math.random.mockReturnValue(i / 10);
        const strategy = game.chooseAIStrategy();
        expect(strategies).toContain(strategy);
      }
    });

    test('adjusts weights when AI health low', () => {
      game.players.ai.health = 20;
      game.chooseAIStrategy();
      expect(game.aiStrategyWeights.defend).toBe(0.6);
      expect(game.aiStrategyWeights.attack).toBe(0.2);
      expect(game.aiStrategyWeights.answer).toBe(0.2);
    });

    test('adjusts weights when human health low', () => {
      game.players.human.health = 20;
      game.chooseAIStrategy();
      expect(game.aiStrategyWeights.attack).toBe(0.6);
      expect(game.aiStrategyWeights.defend).toBe(0.2);
      expect(game.aiStrategyWeights.answer).toBe(0.2);
    });

    test('adjusts weights when AI knowledge low', () => {
      game.players.ai.knowledge = 10;
      game.chooseAIStrategy();
      expect(game.aiStrategyWeights.answer).toBe(0.6);
      expect(game.aiStrategyWeights.attack).toBe(0.3);
      expect(game.aiStrategyWeights.defend).toBe(0.1);
    });
  });

  describe('aiAnswerQuestion', () => {
    test('AI answers correctly based on difficulty chance', () => {
      game.state.difficulty = 'easy';
      Math.random.mockReturnValue(0.5); // below 0.6 chance
      const result = game.aiAnswerQuestion();
      expect(result.success).toBe(true);
      expect(game.players.ai.score).toBe(10);
      expect(game.players.ai.knowledge).toBe(5);
    });

    test('AI answers incorrectly', () => {
      game.state.difficulty = 'easy';
      Math.random.mockReturnValue(0.7); // above 0.6 chance
      const result = game.aiAnswerQuestion();
      expect(result.success).toBe(false);
      expect(game.players.ai.score).toBe(0);
    });
  });

  describe('aiSendTroops', () => {
    test('AI sends troops', () => {
      game.players.ai.troops = 10;
      Math.random.mockReturnValue(0.5); // determines troop count
      const result = game.aiSendTroops();
      expect(result.troops).toBeGreaterThan(0);
      expect(result.damage).toBeGreaterThanOrEqual(0);
      expect(game.players.ai.troops).toBeLessThan(10);
    });

    test('AI has no troops', () => {
      game.players.ai.troops = 0;
      const result = game.aiSendTroops();
      expect(result.troops).toBe(0);
      expect(result.damage).toBe(0);
    });
  });

  describe('aiDefendHouse', () => {
    test('AI defends house', () => {
      const initialDefense = game.players.ai.defense;
      expect(game.aiDefendHouse()).toBe(true);
      expect(game.players.ai.houseDefended).toBe(true);
      expect(game.players.ai.defense).toBe(initialDefense + 20);
    });
  });

  describe('updateAIStrategyWeights', () => {
    test('updates weights for successful answer', () => {
      game.aiStrategyWeights = { answer: 0.4, attack: 0.4, defend: 0.2 };
      game.updateAIStrategyWeights('answer', { success: true });
      expect(game.aiStrategyWeights.answer).toBeGreaterThan(0.4);
      // weights should be normalized
      const total =
        game.aiStrategyWeights.answer +
        game.aiStrategyWeights.attack +
        game.aiStrategyWeights.defend;
      expect(total).toBeCloseTo(1);
    });

    test('updates weights for successful attack', () => {
      game.aiStrategyWeights = { answer: 0.4, attack: 0.4, defend: 0.2 };
      game.updateAIStrategyWeights('attack', { damage: 10 });
      expect(game.aiStrategyWeights.attack).toBeGreaterThan(0.4);
    });

    test('updates weights for defend', () => {
      game.aiStrategyWeights = { answer: 0.4, attack: 0.4, defend: 0.2 };
      game.updateAIStrategyWeights('defend', {});
      expect(game.aiStrategyWeights.defend).toBeGreaterThan(0.2);
    });
  });

  describe('endGame', () => {
    test('human wins with higher score', () => {
      game.players.human.score = 100;
      game.players.ai.score = 50;
      game.endGame();
      expect(game.state.gameOver).toBe(true);
      expect(game.state.winner).toBe('human');
    });

    test('AI wins with higher score', () => {
      game.players.human.score = 30;
      game.players.ai.score = 70;
      game.endGame();
      expect(game.state.winner).toBe('ai');
    });

    test('draw when scores equal', () => {
      game.players.human.score = 50;
      game.players.ai.score = 50;
      game.endGame();
      expect(game.state.winner).toBe('draw');
    });
  });

  describe('setPlayerRole', () => {
    test('sets valid role', () => {
      expect(game.setPlayerRole('ai')).toBe(true);
      expect(game.state.playerRole).toBe('ai');
      expect(game.setPlayerRole('human')).toBe(true);
      expect(game.state.playerRole).toBe('human');
    });

    test('rejects invalid role', () => {
      expect(game.setPlayerRole('invalid')).toBe(false);
      expect(game.state.playerRole).toBe('human'); // unchanged
    });
  });

  describe('swapPlayerControls', () => {
    test('swaps player data', () => {
      game.players.human.score = 100;
      game.players.ai.score = 200;
      game.swapPlayerControls();
      expect(game.players.human.score).toBe(200);
      expect(game.players.ai.score).toBe(100);
    });
  });

  describe('setDifficulty', () => {
    test('sets valid difficulty', () => {
      expect(game.setDifficulty('hard')).toBe(true);
      expect(game.state.difficulty).toBe('hard');
    });

    test('rejects invalid difficulty', () => {
      expect(game.setDifficulty('invalid')).toBe(false);
      expect(game.state.difficulty).toBe('medium');
    });
  });

  describe('logEvent', () => {
    test('adds message to battle log', () => {
      game.logEvent('Test message');
      expect(game.battleLog).toContain('[12:00:00] Test message');
    });

    test('limits battle log length', () => {
      for (let i = 0; i < 25; i++) {
        game.logEvent(`Message ${i}`);
      }
      expect(game.battleLog.length).toBeLessThanOrEqual(20);
    });
  });
});
