// Main game initialization and coordination
document.addEventListener('DOMContentLoaded', () => {
    // Initialize game engine
    const gameEngine = new GameEngine();
    gameEngine.init();
    
    // UI Manager instance
    const uiManager = new UIManager(gameEngine);
    uiManager.init();
    
    // Game Controller instance
    const gameController = new GameController(gameEngine, uiManager);
    gameController.init();
    
    // Make available globally for debugging
    window.gameEngine = gameEngine;
    window.uiManager = uiManager;
    window.gameController = gameController;
    
    console.log('AI vs HUMAN game initialized successfully!');
});

// UI Manager - Handles all UI updates
class UIManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.elements = {};
    }
    
    init() {
        this.cacheElements();
        this.updateUI();
        this.setupEventListeners();
    }
    
    cacheElements() {
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
            aiTroopElement: document.getElementById('ai-troop-1')
        };
    }
    
    updateUI() {
        const state = this.gameEngine.getGameState();
        const { players, currentTurn, currentPlayer, gameOver, currentQuestion } = state;
        
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
        this.elements.currentPlayer.textContent = currentPlayer === 'human' ? 'Human' : 'AI';
        this.elements.currentPlayer.style.color = currentPlayer === 'human' ? '#3b82f6' : '#ef4444';
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
        turnIndicator.style.borderLeftColor = currentPlayer === 'human' ? '#3b82f6' : '#ef4444';
    }
    
    updateBattleLog(logEntries) {
        this.elements.logContent.innerHTML = '';
        logEntries.slice(-10).forEach(entry => {
            const logEntry = document.createElement('div');
            logEntry.className = 'log-entry';
            logEntry.textContent = entry;
            this.elements.logContent.appendChild(logEntry);
        });
        
        // Scroll to bottom
        this.elements.logContent.scrollTop = this.elements.logContent.scrollHeight;
    }
    
    updateAIStrategyIndicators() {
        const weights = this.gameEngine.aiStrategyWeights;
        
        // Find the dominant strategy
        let dominantStrategy = 'answer';
        if (weights.attack > weights[dominantStrategy]) dominantStrategy = 'attack';
        if (weights.defend > weights[dominantStrategy]) dominantStrategy = 'defend';
        
        // Update indicators
        this.elements.strategyIndicators.forEach(indicator => {
            indicator.classList.remove('active');
            if (indicator.dataset.strategy === dominantStrategy) {
                indicator.classList.add('active');
            }
        });
    }
    
    updateTroopAnimations() {
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
    
    updateButtonStates(gameOver, currentPlayer) {
        const isHumanTurn = currentPlayer === 'human';
        
        // Action buttons
        this.elements.answerQuestionsBtn.disabled = gameOver || !isHumanTurn;
        this.elements.sendTroopsBtn.disabled = gameOver || !isHumanTurn;
        this.elements.defendHouseBtn.disabled = gameOver || !isHumanTurn;
        this.elements.endTurnBtn.disabled = gameOver || !isHumanTurn;
        
        // Answer buttons
        this.elements.answerButtons.forEach(btn => {
            btn.disabled = gameOver || !isHumanTurn;
        });
        
        // Visual feedback
        const actionButtons = [
            this.elements.answerQuestionsBtn,
            this.elements.sendTroopsBtn,
            this.elements.defendHouseBtn,
            this.elements.endTurnBtn
        ];
        
        actionButtons.forEach(btn => {
            if (btn.disabled) {
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
            } else {
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
            }
        });
    }
    
    setupEventListeners() {
        // Answer questions button
        this.elements.answerQuestionsBtn.addEventListener('click', () => {
            document.querySelector('.questions-panel').style.display = 'block';
        });
        
        // Send troops button
        this.elements.sendTroopsBtn.addEventListener('click', () => {
            const troops = Math.min(3, this.gameEngine.players.human.troops);
            if (troops > 0) {
                gameController.humanSendTroops(troops);
            } else {
                alert('No troops available!');
            }
        });
        
        // Defend house button
        this.elements.defendHouseBtn.addEventListener('click', () => {
            gameController.humanDefendHouse();
        });
        
        // End turn button
        this.elements.endTurnBtn.addEventListener('click', () => {
            gameController.endTurn();
        });
        
        // Restart game button
        this.elements.restartGameBtn.addEventListener('click', () => {
            gameController.restartGame();
        });
        
        // How to play button
        this.elements.howToPlayBtn.addEventListener('click', () => {
            const rules = document.querySelector('.rules');
            rules.style.display = rules.style.display === 'none' ? 'block' : 'none';
        });
        
        // Answer buttons
        this.elements.answerButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const answerIndex = parseInt(e.target.dataset.answerIndex);
                gameController.humanAnswerQuestion(answerIndex);
            });
        });
        
        // Difficulty buttons
        this.elements.difficultyButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const difficulty = e.target.textContent.toLowerCase();
                gameController.setDifficulty(difficulty);
                
                // Update active state
                this.elements.difficultyButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }
    
    showMessage(message, type = 'info') {
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
    constructor(gameEngine, uiManager) {
        this.gameEngine = gameEngine;
        this.uiManager = uiManager;
        this.aiThinking = false;
    }
    
    init() {
        console.log('Game controller initialized');
        this.setupCSSAnimations();
    }
    
    setupCSSAnimations() {
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
    humanAnswerQuestion(answerIndex) {
        const result = this.gameEngine.answerQuestion(answerIndex);
        this.uiManager.updateUI();
        
        if (result.success) {
            this.uiManager.showMessage('Correct answer! +10 points', 'success');
        } else {
            this.uiManager.showMessage('Incorrect answer. Try again next turn!', 'error');
        }
        
        this.processAITurn();
    }
    
    humanSendTroops(troops) {
        const result = this.gameEngine.sendTroops(troops);
        this.uiManager.updateUI();
        
        if (result.damage > 0) {
            this.uiManager.showMessage(`Attack successful! Caused ${result.damage} damage`, 'success');
        } else {
            this.uiManager.showMessage('Attack was blocked by defense', 'error');
        }
        
        this.processAITurn();
    }
    
    humanDefendHouse() {
        this.gameEngine.defendHouse();
        this.uiManager.updateUI();
        this.uiManager.showMessage('House defended! Defense increased.', 'success');
        this.processAITurn();
    }
    
    // AI turn processing
    processAITurn() {
        const state = this.gameEngine.getGameState();
        
        if (state.gameOver) {
            this.showGameOver();
            return;
        }
        
        if (state.currentPlayer === 'ai' && !this.aiThinking) {
            this.aiThinking = true;
            this.uiManager.showMessage('AI is thinking...', 'info');
            
            // Simulate AI thinking delay
            setTimeout(() => {
                const result = this.gameEngine.aiTakeTurn();
                this.uiManager.updateUI();
                
                if (result && result.strategy) {
                    this.uiManager.showMessage(`AI chose to ${result.strategy}`, 'info');
                }
                
                this.aiThinking = false;
                
                // Check if game ended after AI turn
                const newState = this.gameEngine.getGameState();
                if (newState.gameOver) {
                    this.showGameOver();
                }
            }, 1000);
        }
    }
    
    // End current turn manually
    endTurn() {
        const success = this.gameEngine.nextTurn();
        if (success) {
            this.uiManager.updateUI();
            this.processAITurn();
        }
    }
    
    // Restart game
    restartGame() {
        this.gameEngine.init();
        this.uiManager.updateUI();
        this.uiManager.showMessage('New game started!', 'success');
    }
    
    // Set difficulty
    setDifficulty(difficulty) {
        this.gameEngine.setDifficulty(difficulty);
        this.uiManager.showMessage(`Difficulty set to ${difficulty}`, 'info');
    }
    
    // Show game over message
    showGameOver() {
        const state = this.gameEngine.getGameState();
        let message = '';
        
        switch(state.winner) {
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
        buttons.forEach(btn => {
            if (btn.id !== 'restart-game') {
                btn.disabled = true;
                btn.style.opacity = '0.5';
            }
        });
    }
}