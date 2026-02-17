// Controls UI management for AI vs HUMAN game

class ControlsManager {
  constructor(gameController) {
    this.gameController = gameController;
    this.buttons = {};
  }

  // Initialize controls
  init() {
    this.cacheButtons();
    this.setupEventListeners();
    this.updateButtonStates();
  }

  // Cache button elements
  cacheButtons() {
    this.buttons = {
      answerQuestions: document.getElementById('answer-questions'),
      sendTroops: document.getElementById('send-troops'),
      defendHouse: document.getElementById('defend-house'),
      endTurn: document.getElementById('end-turn'),
      restartGame: document.getElementById('restart-game'),
      howToPlay: document.getElementById('how-to-play'),
      difficultyButtons: document.querySelectorAll('.diff-btn'),
      answerButtons: document.querySelectorAll('.answer-btn'),
    };
  }

  // Setup event listeners
  setupEventListeners() {
    // Action buttons
    this.buttons.answerQuestions.addEventListener('click', () => {
      this.gameController.showQuestionPanel();
    });

    this.buttons.sendTroops.addEventListener('click', () => {
      this.gameController.sendTroopsAction();
    });

    this.buttons.defendHouse.addEventListener('click', () => {
      this.gameController.defendHouseAction();
    });

    this.buttons.endTurn.addEventListener('click', () => {
      this.gameController.endTurnAction();
    });

    this.buttons.restartGame.addEventListener('click', () => {
      this.gameController.restartGameAction();
    });

    this.buttons.howToPlay.addEventListener('click', () => {
      this.toggleHowToPlay();
    });

    // Difficulty buttons
    this.buttons.difficultyButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const difficulty = e.target.textContent.toLowerCase();
        this.setDifficulty(difficulty);
        this.updateDifficultyButtons(difficulty);
      });
    });

    // Answer buttons
    this.buttons.answerButtons.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        this.gameController.answerQuestionAction(index);
      });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      this.handleKeyboardShortcut(e);
    });
  }

  // Update button states based on game state
  updateButtonStates(gameState) {
    const isHumanTurn = gameState && gameState.currentPlayer === 'human';
    const gameOver = gameState && gameState.gameOver;

    // Enable/disable buttons
    this.buttons.answerQuestions.disabled = gameOver || !isHumanTurn;
    this.buttons.sendTroops.disabled = gameOver || !isHumanTurn;
    this.buttons.defendHouse.disabled = gameOver || !isHumanTurn;
    this.buttons.endTurn.disabled = gameOver || !isHumanTurn;

    // Visual feedback
    const actionButtons = [
      this.buttons.answerQuestions,
      this.buttons.sendTroops,
      this.buttons.defendHouse,
      this.buttons.endTurn,
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

    // Update answer buttons
    this.buttons.answerButtons.forEach((btn) => {
      btn.disabled = gameOver || !isHumanTurn;
    });
  }

  // Update difficulty buttons
  updateDifficultyButtons(activeDifficulty) {
    this.buttons.difficultyButtons.forEach((btn) => {
      btn.classList.remove('active');
      if (btn.textContent.toLowerCase() === activeDifficulty) {
        btn.classList.add('active');
      }
    });
  }

  // Set difficulty
  setDifficulty(difficulty) {
    this.gameController.setDifficulty(difficulty);
  }

  // Toggle how to play panel
  toggleHowToPlay() {
    const rulesPanel = document.querySelector('.rules');
    if (rulesPanel) {
      rulesPanel.style.display =
        rulesPanel.style.display === 'none' ? 'block' : 'none';
    }
  }

  // Handle keyboard shortcuts
  handleKeyboardShortcut(event) {
    // Only handle if not in input field
    if (
      event.target.tagName === 'INPUT' ||
      event.target.tagName === 'TEXTAREA'
    ) {
      return;
    }

    switch (event.key.toLowerCase()) {
      case '1':
      case 'a':
        if (!this.buttons.answerQuestions.disabled) {
          this.gameController.showQuestionPanel();
        }
        break;

      case '2':
      case 's':
        if (!this.buttons.sendTroops.disabled) {
          this.gameController.sendTroopsAction();
        }
        break;

      case '3':
      case 'd':
        if (!this.buttons.defendHouse.disabled) {
          this.gameController.defendHouseAction();
        }
        break;

      case ' ':
      case 'enter':
        if (!this.buttons.endTurn.disabled) {
          this.gameController.endTurnAction();
        }
        break;

      case 'r':
        if (event.ctrlKey || event.metaKey) {
          this.gameController.restartGameAction();
        }
        break;

      case 'h':
        this.toggleHowToPlay();
        break;

      case 'escape':
        this.hideQuestionPanel();
        break;
    }
  }

  // Show question panel
  showQuestionPanel() {
    const questionPanel = document.querySelector('.questions-panel');
    if (questionPanel) {
      questionPanel.style.display = 'block';
    }
  }

  // Hide question panel
  hideQuestionPanel() {
    const questionPanel = document.querySelector('.questions-panel');
    if (questionPanel) {
      questionPanel.style.display = 'none';
    }
  }

  // Show feedback message
  showFeedback(message, type = 'info') {
    // Create feedback element
    const feedback = document.createElement('div');
    feedback.className = `feedback feedback-${type}`;
    feedback.textContent = message;
    feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            border-radius: 8px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

    document.body.appendChild(feedback);

    // Remove after 3 seconds
    setTimeout(() => {
      feedback.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => feedback.remove(), 300);
    }, 3000);
  }

  // Add CSS for animations
  addAnimationStyles() {
    if (!document.querySelector('#controls-animations')) {
      const style = document.createElement('style');
      style.id = 'controls-animations';
      style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
                .feedback { font-weight: 500; }
                .feedback-success { background: #10b981; }
                .feedback-error { background: #ef4444; }
                .feedback-info { background: #3b82f6; }
            `;
      document.head.appendChild(style);
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ControlsManager;
}
