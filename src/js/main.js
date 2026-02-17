document.addEventListener('DOMContentLoaded', () => {
  const roleModal = document.getElementById('role-selection-modal');
  const roleOptions = document.querySelectorAll('.role-select-btn');

  function startGameWithRole (selectedRole) {
    roleModal.style.display = 'none';

    const gameEngine = new GameEngine();
    gameEngine.init();
    gameEngine.setPlayerRole(selectedRole);

    if (selectedRole === 'ai') {
      gameEngine.swapPlayerControls();

      document.querySelector('.human-side h2').innerHTML =
        '<i class="fas fa-robot"></i> AI (Opponent)';
      document.querySelector('.ai-side h2').innerHTML =
        '<i class="fas fa-user"></i> Player (AI Side)';
      document.querySelector('.human-side .player-header h2').innerHTML =
        '<i class="fas fa-robot"></i> AI Opponent';
      document.querySelector('.ai-side .player-header h2').innerHTML =
        '<i class="fas fa-user"></i> Player (AI)';

      // Move action panel from human side to AI side
      const humanSide = document.querySelector('.human-side');
      const aiSide = document.querySelector('.ai-side');
      const actionPanel = document.querySelector('.action-panel');
      const aiInfo = document.querySelector('.ai-info');

      if (actionPanel && aiInfo) {
        humanSide.removeChild(actionPanel);
        aiSide.insertBefore(actionPanel, aiInfo);
      }
    }

    const uiManager = new UIManager(gameEngine);
    uiManager.init();

    const gameController = new GameController(gameEngine, uiManager);
    gameController.init();

    window.gameEngine = gameEngine;
    window.uiManager = uiManager;
    window.gameController = gameController;

    console.log(
      `AI vs HUMAN game initialized with player controlling ${selectedRole.toUpperCase()} side!`,
    );
  }

  roleOptions.forEach((btn) => {
    btn.addEventListener('click', () => {
      const role = btn.dataset.role;
      startGameWithRole(role);
    });
  });

  setTimeout(() => {
    if (roleModal.style.display !== 'none') {
      console.log('Auto-starting as human for debugging');
      startGameWithRole('human');
    }
  }, 1000);
});

// UI Manager - Handles all UI updates
class UIManager {
  constructor (gameEngine) {
    this.gameEngine = gameEngine;
    this.elements = {};
  }

  init () {
    this.cacheElements();
    this.updateUI();
    this.setupEventListeners();
  }

  cacheElements () {
    this.elements = {
      // Scores and stats
      humanScore: document.getElementById('human-score'),
      aiScore: document.getElementById('ai-score'),
      humanHealth: document.getElementById('human-health'),
      aiHealth: document.getElementById('ai-health'),
      humanDefense: document.getElementById('human-defense'),
      aiDefense: document.getElementById('ai-defense'),
      humanTroops: document.getElementById('human-troops'),
      aiTroops: document.getElementById('ai-troops'),

      // Turn info
      currentPlayer: document.getElementById('current-player'),
      turnNumber: document.getElementById('turn-number'),

      // Questions
      currentQuestion: document.getElementById('current-question'),
      answerButtons: document.querySelectorAll('.answer-btn'),

      // Battle log
      logContent: document.getElementById('log-content'),

      // Action buttons
      answerQuestionsBtn: document.getElementById('answer-questions'),
      sendTroopsBtn: document.getElementById('send-troops'),
      defendHouseBtn: document.getElementById('defend-house'),
      endTurnBtn: document.getElementById('end-turn'),
      restartGameBtn: document.getElementById('restart-game'),
      howToPlayBtn: document.getElementById('how-to-play'),

      // Difficulty buttons
      difficultyButtons: document.querySelectorAll('.diff-btn'),

      // Strategy indicators
      strategyIndicators: document.querySelectorAll('.strategy'),

      // Troop elements
      humanTroopElement: document.getElementById('human-troop-1'),
      aiTroopElement: document.getElementById('ai-troop-1'),
    };
  }

  updateUI () {
    const state = this.gameEngine.getGameState();
    const { players, currentTurn, currentPlayer, gameOver, currentQuestion } =
      state;

    // Update scores and stats
    this.elements.humanScore.textContent = players.human.score;
    this.elements.aiScore.textContent = players.ai.score;
    this.elements.humanHealth.textContent = Math.max(0, players.human.health);
    this.elements.aiHealth.textContent = Math.max(0, players.ai.health);
    this.elements.humanDefense.textContent = players.human.defense;
    this.elements.aiDefense.textContent = players.ai.defense;
    this.elements.humanTroops.textContent = players.human.troops;
    this.elements.aiTroops.textContent = players.ai.troops;

    // Update turn info
    this.elements.currentPlayer.textContent =
      currentPlayer === 'human' ? 'Human' : 'AI';
    this.elements.currentPlayer.style.color =
      currentPlayer === 'human' ? '#3b82f6' : '#ef4444';
    this.elements.turnNumber.textContent = currentTurn;

    // Update question
    if (currentQuestion) {
      this.elements.currentQuestion.textContent = currentQuestion.question;

      // Update answer buttons
      this.elements.answerButtons.forEach((btn, index) => {
        btn.textContent = currentQuestion.answers[index];
        btn.dataset.answerIndex = index;
      });
    }

    // Update battle log
    this.updateBattleLog(state.battleLog);

    // Update AI strategy indicators
    this.updateAIStrategyIndicators();

    // Update troop positions
    this.updateTroopAnimations();

    // Update button states
    this.updateButtonStates(gameOver, currentPlayer);

    // Update turn indicator border
    const turnIndicator = document.querySelector('.turn-indicator');
    turnIndicator.style.borderLeftColor =
      currentPlayer === 'human' ? '#3b82f6' : '#ef4444';
  }

  updateBattleLog (logEntries) {
    this.elements.logContent.innerHTML = '';
    logEntries.slice(-10).forEach((entry) => {
      const logEntry = document.createElement('div');
      logEntry.className = 'log-entry';
      logEntry.textContent = entry;
      this.elements.logContent.appendChild(logEntry);
    });

    // Scroll to bottom
    this.elements.logContent.scrollTop = this.elements.logContent.scrollHeight;
  }

  updateAIStrategyIndicators () {
    const weights = this.gameEngine.aiStrategyWeights;

    // Find the dominant strategy
    let dominantStrategy = 'answer';
    if (weights.attack > weights[dominantStrategy]) dominantStrategy = 'attack';
    if (weights.defend > weights[dominantStrategy]) dominantStrategy = 'defend';

    // Update indicators
    this.elements.strategyIndicators.forEach((indicator) => {
      indicator.classList.remove('active');
      if (indicator.dataset.strategy === dominantStrategy) {
        indicator.classList.add('active');
      }
    });
  }

  updateTroopAnimations () {
    const state = this.gameEngine.getGameState();
    const { players } = state;

    // Simple troop position based on health difference
    const healthDiff = players.human.health - players.ai.health;
    let humanTroopPos = 50;
    let aiTroopPos = 50;

    if (healthDiff > 20) {
      humanTroopPos = 70;
      aiTroopPos = 30;
    } else if (healthDiff < -20) {
      humanTroopPos = 30;
      aiTroopPos = 70;
    }

    this.elements.humanTroopElement.style.left = `${humanTroopPos}%`;
    this.elements.aiTroopElement.style.left = `${aiTroopPos}%`;
  }

  animateTroopSend (fromSide, toSide, troopCount) {
    const battlefield = document.querySelector('.field-content');

    for (let i = 0; i < Math.min(troopCount, 5); i++) {
      setTimeout(() => {
        const troop = document.createElement('div');
        troop.className = `troop ${fromSide}-troop troop-moving ${fromSide}-to-${toSide}`;
        troop.innerHTML = fromSide === 'human' ? '🚶' : '🤖';

        const verticalOffset = Math.random() * 40 - 20;
        troop.style.top = `calc(50% + ${verticalOffset}px)`;

        battlefield.appendChild(troop);

        setTimeout(() => {
          troop.classList.add('troop-explosion');
          setTimeout(() => {
            if (troop.parentNode) troop.parentNode.removeChild(troop);
          }, 500);
        }, 1500);
      }, i * 200);
    }
  }

  updateButtonStates (gameOver, currentPlayer) {
    const playerRole = this.gameEngine.state.playerRole || 'human';
    const isPlayerTurn = currentPlayer === playerRole;

    // Action buttons
    this.elements.answerQuestionsBtn.disabled = gameOver || !isPlayerTurn;
    this.elements.sendTroopsBtn.disabled = gameOver || !isPlayerTurn;
    this.elements.defendHouseBtn.disabled = gameOver || !isPlayerTurn;
    this.elements.endTurnBtn.disabled = gameOver || !isPlayerTurn;

    // Answer buttons
    this.elements.answerButtons.forEach((btn) => {
      btn.disabled = gameOver || !isPlayerTurn;
    });

    // Visual feedback
    const actionButtons = [
      this.elements.answerQuestionsBtn,
      this.elements.sendTroopsBtn,
      this.elements.defendHouseBtn,
      this.elements.endTurnBtn,
    ];

    actionButtons.forEach((btn) => {
      if (btn.disabled) {
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
      } else {
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
      }
    });
  }

  setupEventListeners () {
    // Answer questions button
    this.elements.answerQuestionsBtn.addEventListener('click', () => {
      document.querySelector('.questions-panel').style.display = 'block';
    });

    // Send troops button
    this.elements.sendTroopsBtn.addEventListener('click', () => {
      const troops = Math.min(3, this.gameEngine.players.human.troops);
      if (troops > 0) {
        window.gameController.humanSendTroops(troops);
      } else {
        alert('No troops available!');
      }
    });

    // Defend house button
    this.elements.defendHouseBtn.addEventListener('click', () => {
      window.gameController.humanDefendHouse();
    });

    // End turn button
    this.elements.endTurnBtn.addEventListener('click', () => {
      window.gameController.endTurn();
    });

    // Restart game button
    this.elements.restartGameBtn.addEventListener('click', () => {
      window.gameController.restartGame();
    });

    // How to play button
    this.elements.howToPlayBtn.addEventListener('click', () => {
      const rules = document.querySelector('.rules');
      rules.style.display = rules.style.display === 'none' ? 'block' : 'none';
    });

    // Answer buttons
    this.elements.answerButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const answerIndex = parseInt(e.target.dataset.answerIndex);
        window.gameController.humanAnswerQuestion(answerIndex);
      });
    });

    // Difficulty buttons
    this.elements.difficultyButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const difficulty = e.target.textContent.toLowerCase();
        window.gameController.setDifficulty(difficulty);

        // Update active state
        this.elements.difficultyButtons.forEach((b) =>
          b.classList.remove('active'),
        );
        e.target.classList.add('active');
      });
    });
  }

  showMessage (message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            border-radius: 8px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

    document.body.appendChild(messageDiv);

    setTimeout(() => {
      messageDiv.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => messageDiv.remove(), 300);
    }, 3000);
  }
}

// Game Controller - Orchestrates game flow
class GameController {
  constructor (gameEngine, uiManager) {
    this.gameEngine = gameEngine;
    this.uiManager = uiManager;
    this.aiThinking = false;
  }

  init () {
    console.log('Game controller initialized');
    this.setupCSSAnimations();
  }

  setupCSSAnimations () {
    const style = document.createElement('style');
    style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
        `;
    document.head.appendChild(style);
  }

  // Human actions
  humanAnswerQuestion (answerIndex) {
    const result = this.gameEngine.answerQuestion(answerIndex);
    this.uiManager.updateUI();

    if (result.success) {
      this.uiManager.showMessage('Correct answer! +10 points', 'success');
    } else {
      this.uiManager.showMessage(
        'Incorrect answer. Try again next turn!',
        'error',
      );
    }

    this.processAITurn();
  }

  humanSendTroops (troops) {
    const result = this.gameEngine.sendTroops(troops);
    this.uiManager.updateUI();

    if (result.damage > 0) {
      this.uiManager.showMessage(
        `Attack successful! Caused ${result.damage} damage`,
        'success',
      );
    } else {
      this.uiManager.showMessage('Attack was blocked by defense', 'error');
    }

    if (result && result.troops) {
      this.uiManager.animateTroopSend('human', 'ai', result.troops);
    }

    this.processAITurn();
  }

  humanDefendHouse () {
    this.gameEngine.defendHouse();
    this.uiManager.updateUI();
    this.uiManager.showMessage('House defended! Defense increased.', 'success');
    this.processAITurn();
  }

  // AI turn processing
  processAITurn () {
    const state = this.gameEngine.getGameState();
    console.log('processAITurn called', {
      currentPlayer: state.currentPlayer,
      aiThinking: this.aiThinking,
      gameOver: state.gameOver,
    });

    // Reset AI thinking flag if it's human's turn (safety)
    if (state.currentPlayer === 'human') {
      this.aiThinking = false;
    }

    if (state.gameOver) {
      this.showGameOver();
      return;
    }

    if (state.currentPlayer === 'ai' && !this.aiThinking) {
      console.log('Starting AI turn');
      this.aiThinking = true;
      this.uiManager.showMessage('AI is thinking...', 'info');

      // Simulate AI thinking delay
      setTimeout(() => {
        console.log('AI thinking timeout elapsed, taking turn');
        const result = this.gameEngine.aiTakeTurn();
        console.log('AI turn result:', result);
        this.uiManager.updateUI();

        if (result && result.strategy) {
          this.uiManager.showMessage(`AI chose to ${result.strategy}`, 'info');

          if (
            result.strategy === 'attack' &&
            result.result &&
            result.result.troops
          ) {
            this.uiManager.animateTroopSend(
              'ai',
              'human',
              result.result.troops,
            );
          }
        }

        this.aiThinking = false;

        // Check if game ended after AI turn
        const newState = this.gameEngine.getGameState();
        if (newState.gameOver) {
          this.showGameOver();
        }
      }, 1000);
    } else {
      console.log('AI turn not triggered:', {
        currentPlayer: state.currentPlayer,
        aiThinking: this.aiThinking,
      });
    }
  }

  // End current turn manually
  endTurn () {
    const success = this.gameEngine.nextTurn();
    if (success) {
      this.uiManager.updateUI();
      this.processAITurn();
    }
  }

  // Restart game
  restartGame () {
    this.gameEngine.init();
    this.uiManager.updateUI();
    this.uiManager.showMessage('New game started!', 'success');
  }

  // Set difficulty
  setDifficulty (difficulty) {
    this.gameEngine.setDifficulty(difficulty);
    this.uiManager.showMessage(`Difficulty set to ${difficulty}`, 'info');
  }

  // Show game over message
  showGameOver () {
    const state = this.gameEngine.getGameState();
    let message = '';

    switch (state.winner) {
    case 'human':
      message = `Congratulations! You won with ${state.players.human.score} points!`;
      break;
    case 'ai':
      message = `AI won with ${state.players.ai.score} points. Better luck next time!`;
      break;
    case 'draw':
      message = `It's a draw! Both players scored ${state.players.human.score} points.`;
      break;
    }

    this.uiManager.showMessage(`Game Over! ${message}`, 'success');

    // Disable all action buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach((btn) => {
      if (btn.id !== 'restart-game') {
        btn.disabled = true;
        btn.style.opacity = '0.5';
      }
    });
  }
}
