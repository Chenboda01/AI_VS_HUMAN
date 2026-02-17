/* global describe, test, expect, beforeEach, afterEach, jest */
import AIPlayer from './ai.js';

describe('AIPlayer', () => {
  let ai;

  beforeEach(() => {
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
    ai = new AIPlayer('medium');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    test('initializes with default values', () => {
      expect(ai.difficulty).toBe('medium');
      expect(ai.strategyWeights.answer).toBeCloseTo(0.4);
      expect(ai.strategyWeights.attack).toBeCloseTo(0.4);
      expect(ai.strategyWeights.defend).toBeCloseTo(0.2);
      expect(ai.knowledge).toBe(0);
      expect(ai.aggression).toBe(0.5);
      expect(ai.defensiveness).toBe(0.5);
    });

    test('accepts difficulty parameter', () => {
      const aiEasy = new AIPlayer('easy');
      expect(aiEasy.difficulty).toBe('easy');
      const aiHard = new AIPlayer('hard');
      expect(aiHard.difficulty).toBe('hard');
    });
  });

  describe('chooseAction', () => {
    test('returns action with strategy and weights', () => {
      ai.knowledge = 25; // avoid knowledge-based weight adaptation
      const gameState = {
        ai: { health: 100, troops: 10 },
        human: { health: 100, troops: 10 },
        currentTurn: 1,
        maxTurns: 20,
      };
      const result = ai.chooseAction(gameState);
      expect(result.strategy).toBeDefined();
      expect(result.action).toBeDefined();
      expect(result.weights).toBeDefined();
      expect(result.weights.answer).toBeCloseTo(0.4);
    });

    test('adapts strategy based on game state', () => {
      const gameState = {
        ai: { health: 20, troops: 5 },
        human: { health: 100, troops: 10 },
        currentTurn: 1,
        maxTurns: 20,
      };
      const result = ai.chooseAction(gameState);
      // When AI health low, defend weight should be increased
      expect(result.weights.defend).toBeGreaterThan(0.2);
    });
  });

  describe('adaptStrategy', () => {
    test('increases defend weight when AI health low', () => {
      ai.adaptStrategy({ health: 20 }, { health: 100 }, 1, 20);
      expect(ai.strategyWeights.defend).toBeCloseTo(0.6);
      expect(ai.strategyWeights.attack).toBeCloseTo(0.2);
      expect(ai.strategyWeights.answer).toBeCloseTo(0.2);
    });

    test('increases attack weight when human health low', () => {
      ai.adaptStrategy({ health: 100 }, { health: 20 }, 1, 20);
      expect(ai.strategyWeights.attack).toBeCloseTo(0.6);
      expect(ai.strategyWeights.defend).toBeCloseTo(0.2);
      expect(ai.strategyWeights.answer).toBeCloseTo(0.2);
    });

    test('increases answer weight when AI knowledge low', () => {
      ai.knowledge = 10;
      ai.adaptStrategy({ health: 100 }, { health: 100 }, 1, 20);
      expect(ai.strategyWeights.answer).toBeCloseTo(0.6);
      expect(ai.strategyWeights.attack).toBeCloseTo(0.3);
      expect(ai.strategyWeights.defend).toBeCloseTo(0.1);
    });

    test('adjusts weights based on turn ratio', () => {
      ai.knowledge = 25; // avoid knowledge condition
      ai.adaptStrategy({ health: 100 }, { health: 100 }, 15, 20); // turnRatio 0.75
      expect(ai.strategyWeights.attack).toBeCloseTo(0.5);
      expect(ai.strategyWeights.answer).toBeCloseTo(0.3);
      expect(ai.strategyWeights.defend).toBeCloseTo(0.2);
    });

    test('adjusts weights based on health ratio', () => {
      ai.knowledge = 25; // avoid knowledge condition
      ai.adaptStrategy({ health: 40 }, { health: 100 }, 1, 20); // healthRatio 0.4
      expect(ai.strategyWeights.defend).toBeCloseTo(0.5);
      expect(ai.strategyWeights.attack).toBeCloseTo(0.3);
      expect(ai.strategyWeights.answer).toBeCloseTo(0.2);
    });

    test('normalizes weights after adaptation', () => {
      ai.strategyWeights = { answer: 0.8, attack: 0.8, defend: 0.4 }; // sum > 1
      ai.adaptStrategy({ health: 100 }, { health: 100 }, 1, 20);
      const total =
        ai.strategyWeights.answer +
        ai.strategyWeights.attack +
        ai.strategyWeights.defend;
      expect(total).toBeCloseTo(1);
    });
  });

  describe('selectStrategy', () => {
    test('returns answer when random value within answer weight', () => {
      ai.strategyWeights = { answer: 0.5, attack: 0.3, defend: 0.2 };
      Math.random.mockReturnValue(0.2); // less than 0.5
      expect(ai.selectStrategy()).toBe('answer');
    });

    test('returns attack when random value between answer and answer+attack', () => {
      ai.strategyWeights = { answer: 0.5, attack: 0.3, defend: 0.2 };
      Math.random.mockReturnValue(0.6); // 0.5 <= x < 0.8
      expect(ai.selectStrategy()).toBe('attack');
    });

    test('returns defend when random value high', () => {
      ai.strategyWeights = { answer: 0.5, attack: 0.3, defend: 0.2 };
      Math.random.mockReturnValue(0.9); // >= 0.8
      expect(ai.selectStrategy()).toBe('defend');
    });
  });

  describe('generateAction', () => {
    test('generates answer action with confidence', () => {
      const action = ai.generateAction(
        'answer',
        { troops: 10 },
        { troops: 10 }
      );
      expect(action.type).toBe('answer');
      expect(action.confidence).toBeDefined();
      expect(action.confidence).toBeGreaterThanOrEqual(0);
      expect(action.confidence).toBeLessThanOrEqual(1);
    });

    test('generates attack action with troop count', () => {
      const aiState = { troops: 10 };
      Math.random.mockReturnValue(0.5); // troop count calculation
      const action = ai.generateAction('attack', aiState, {});
      expect(action.type).toBe('attack');
      expect(action.troops).toBeGreaterThanOrEqual(1);
      expect(action.troops).toBeLessThanOrEqual(5);
      expect(action.target).toBe('human');
    });

    test('attack troop count respects available troops', () => {
      const aiState = { troops: 2 };
      Math.random.mockReturnValue(0.5);
      const action = ai.generateAction('attack', aiState, {});
      expect(action.troops).toBeLessThanOrEqual(2);
    });

    test('generates defend action with boost', () => {
      const action = ai.generateAction('defend', {}, {});
      expect(action.type).toBe('defend');
      expect(action.boost).toBe(20);
    });

    test('defaults to answer action for unknown strategy', () => {
      const action = ai.generateAction('unknown', {}, {});
      expect(action.type).toBe('answer');
    });
  });

  describe('getAnswerConfidence', () => {
    test('returns correct confidence for easy difficulty', () => {
      ai.setDifficulty('easy');
      expect(ai.getAnswerConfidence()).toBeCloseTo(0.6);
    });

    test('returns correct confidence for medium difficulty', () => {
      ai.setDifficulty('medium');
      expect(ai.getAnswerConfidence()).toBeCloseTo(0.75);
    });

    test('returns correct confidence for hard difficulty', () => {
      ai.setDifficulty('hard');
      expect(ai.getAnswerConfidence()).toBeCloseTo(0.9);
    });

    test('defaults to 0.75 for unknown difficulty', () => {
      ai.difficulty = 'unknown';
      expect(ai.getAnswerConfidence()).toBeCloseTo(0.75);
    });
  });

  describe('updateWeights', () => {
    test('increases answer weight on successful answer', () => {
      const initial = ai.strategyWeights.answer;
      ai.updateWeights('answer', { success: true });
      expect(ai.strategyWeights.answer).toBeGreaterThan(initial);
      expect(ai.knowledge).toBe(5);
    });

    test('increases attack weight on successful attack', () => {
      const initial = ai.strategyWeights.attack;
      ai.updateWeights('attack', { damage: 10 });
      expect(ai.strategyWeights.attack).toBeGreaterThan(initial);
      expect(ai.aggression).toBeCloseTo(0.6);
    });

    test('increases defend weight on successful defend', () => {
      const initial = ai.strategyWeights.defend;
      ai.updateWeights('defend', { defended: true });
      expect(ai.strategyWeights.defend).toBeGreaterThan(initial);
      expect(ai.defensiveness).toBeCloseTo(0.6);
    });

    test('normalizes weights after update', () => {
      ai.strategyWeights = { answer: 0.8, attack: 0.8, defend: 0.4 };
      ai.updateWeights('answer', { success: true });
      const total =
        ai.strategyWeights.answer +
        ai.strategyWeights.attack +
        ai.strategyWeights.defend;
      expect(total).toBeCloseTo(1);
    });
  });

  describe('normalizeWeights', () => {
    test('normalizes weights to sum to 1', () => {
      ai.strategyWeights = { answer: 0.5, attack: 0.5, defend: 0.5 };
      ai.normalizeWeights();
      const total =
        ai.strategyWeights.answer +
        ai.strategyWeights.attack +
        ai.strategyWeights.defend;
      expect(total).toBeCloseTo(1);
    });

    test('handles zero total', () => {
      ai.strategyWeights = { answer: 0, attack: 0, defend: 0 };
      ai.normalizeWeights();
      // Should not divide by zero, weights remain unchanged
      expect(ai.strategyWeights.answer).toBe(0);
      expect(ai.strategyWeights.attack).toBe(0);
      expect(ai.strategyWeights.defend).toBe(0);
    });
  });

  describe('setDifficulty', () => {
    test('sets valid difficulty', () => {
      expect(ai.setDifficulty('hard')).toBe(true);
      expect(ai.difficulty).toBe('hard');
    });

    test('rejects invalid difficulty', () => {
      expect(ai.setDifficulty('impossible')).toBe(false);
      expect(ai.difficulty).toBe('medium'); // unchanged
    });
  });

  describe('getPersonality', () => {
    test('returns personality traits', () => {
      ai.knowledge = 25;
      ai.aggression = 0.8;
      ai.defensiveness = 0.3;
      const personality = ai.getPersonality();
      expect(personality.knowledge).toBe(25);
      expect(personality.aggression).toBeCloseTo(0.8);
      expect(personality.defensiveness).toBeCloseTo(0.3);
      expect(personality.adaptability).toBeCloseTo(0.7);
    });
  });
});
