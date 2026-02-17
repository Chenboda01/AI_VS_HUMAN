// Board UI management for AI vs HUMAN game

class BoardManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.animations = new Map();
        this.animationId = 0;
    }
    
    // Initialize board
    init() {
        this.setupBoardElements();
        this.setupAnimations();
        this.updateBoard();
    }
    
    // Cache board elements
    setupBoardElements() {
        this.elements = {
            humanHouse: document.querySelector('.human-house'),
            aiHouse: document.querySelector('.ai-house'),
            humanTroop: document.querySelector('.human-troop'),
            aiTroop: document.querySelector('.ai-troop'),
            troopMovement: document.querySelector('.troop-movement'),
            battleLog: document.getElementById('log-content'),
            scoreDisplays: {
                human: document.getElementById('human-score'),
                ai: document.getElementById('ai-score')
            },
            healthBars: {
                human: document.getElementById('human-health'),
                ai: document.getElementById('ai-health')
            },
            defenseBars: {
                human: document.getElementById('human-defense'),
                ai: document.getElementById('ai-defense')
            },
            troopCounts: {
                human: document.getElementById('human-troops'),
                ai: document.getElementById('ai-troops')
            }
        };
    }
    
    // Setup CSS animations
    setupAnimations() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes troopMarch {
                0% { transform: translateX(0); }
                100% { transform: translateX(100px); }
            }
            
            @keyframes housePulse {
                0% { transform: scale(1); box-shadow: 0 0 10px currentColor; }
                50% { transform: scale(1.1); box-shadow: 0 0 20px currentColor; }
                100% { transform: scale(1); box-shadow: 0 0 10px currentColor; }
            }
            
            @keyframes damageFlash {
                0% { filter: brightness(1); }
                50% { filter: brightness(1.5); }
                100% { filter: brightness(1); }
            }
            
            @keyframes scorePop {
                0% { transform: scale(1); opacity: 1; }
                100% { transform: scale(1.5); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Update entire board
    updateBoard() {
        const state = this.gameEngine.getGameState();
        this.updateHouses(state);
        this.updateTroops(state);
        this.updateStats(state);
        this.updateBattleLog(state.battleLog);
        this.updateTurnIndicator(state.currentPlayer);
    }
    
    // Update house visuals
    updateHouses(state) {
        const { players } = state;
        
        // Human house
        if (players.human.houseDefended) {
            this.elements.humanHouse.style.borderColor = '#10b981';
            this.elements.humanHouse.style.boxShadow = '0 0 15px #10b981';
        } else {
            this.elements.humanHouse.style.borderColor = '#3b82f6';
            this.elements.humanHouse.style.boxShadow = 'none';
        }
        
        // AI house
        if (players.ai.houseDefended) {
            this.elements.aiHouse.style.borderColor = '#10b981';
            this.elements.aiHouse.style.boxShadow = '0 0 15px #10b981';
        } else {
            this.elements.aiHouse.style.borderColor = '#ef4444';
            this.elements.aiHouse.style.boxShadow = 'none';
        }
        
        // Pulse house if low health
        if (players.human.health < 30) {
            this.animateHouse(this.elements.humanHouse, 'pulse');
        }
        if (players.ai.health < 30) {
            this.animateHouse(this.elements.aiHouse, 'pulse');
        }
    }
    
    // Update troop positions and visuals
    updateTroops(state) {
        const { players } = state;
        
        // Calculate positions based on game state
        const humanStrength = players.human.health + players.human.defense + players.human.troops * 5;
        const aiStrength = players.ai.health + players.ai.defense + players.ai.troops * 5;
        const totalStrength = humanStrength + aiStrength;
        
        let humanPosition = 50;
        let aiPosition = 50;
        
        if (totalStrength > 0) {
            humanPosition = 30 + (humanStrength / totalStrength) * 40;
            aiPosition = 30 + (aiStrength / totalStrength) * 40;
        }
        
        // Update troop positions
        this.elements.humanTroop.style.left = `${humanPosition}%`;
        this.elements.aiTroop.style.left = `${aiPosition}%`;
        
        // Size based on troop count
        const humanTroopSize = 40 + Math.min(players.human.troops, 10) * 2;
        const aiTroopSize = 40 + Math.min(players.ai.troops, 10) * 2;
        
        this.elements.humanTroop.style.width = `${humanTroopSize}px`;
        this.elements.humanTroop.style.height = `${humanTroopSize}px`;
        this.elements.aiTroop.style.width = `${aiTroopSize}px`;
        this.elements.aiTroop.style.height = `${aiTroopSize}px`;
    }
    
    // Update stat displays
    updateStats(state) {
        const { players } = state;
        
        // Update scores
        this.elements.scoreDisplays.human.textContent = players.human.score;
        this.elements.scoreDisplays.ai.textContent = players.ai.score;
        
        // Update health (with color coding)
        this.elements.healthBars.human.textContent = Math.max(0, players.human.health);
        this.elements.healthBars.ai.textContent = Math.max(0, players.ai.health);
        
        this.elements.healthBars.human.style.color = this.getHealthColor(players.human.health);
        this.elements.healthBars.ai.style.color = this.getHealthColor(players.ai.health);
        
        // Update defense
        this.elements.defenseBars.human.textContent = players.human.defense;
        this.elements.defenseBars.ai.textContent = players.ai.defense;
        
        // Update troop counts
        this.elements.troopCounts.human.textContent = players.human.troops;
        this.elements.troopCounts.ai.textContent = players.ai.troops;
    }
    
    // Update battle log
    updateBattleLog(logEntries) {
        this.elements.battleLog.innerHTML = '';
        
        const recentEntries = logEntries.slice(-8);
        recentEntries.forEach(entry => {
            const logEntry = document.createElement('div');
            logEntry.className = 'log-entry';
            
            // Color code log entries
            if (entry.includes('Human')) {
                logEntry.style.borderLeftColor = '#3b82f6';
            } else if (entry.includes('AI')) {
                logEntry.style.borderLeftColor = '#ef4444';
            } else if (entry.includes('Game over') || entry.includes('wins')) {
                logEntry.style.borderLeftColor = '#f59e0b';
                logEntry.style.fontWeight = 'bold';
            }
            
            logEntry.textContent = entry;
            this.elements.battleLog.appendChild(logEntry);
        });
        
        // Scroll to bottom
        this.elements.battleLog.scrollTop = this.elements.battleLog.scrollHeight;
    }
    
    // Update turn indicator
    updateTurnIndicator(currentPlayer) {
        const indicator = document.querySelector('.turn-indicator');
        const playerText = document.getElementById('current-player');
        
        if (currentPlayer === 'human') {
            indicator.style.borderLeftColor = '#3b82f6';
            playerText.textContent = 'Human';
            playerText.style.color = '#3b82f6';
        } else {
            indicator.style.borderLeftColor = '#ef4444';
            playerText.textContent = 'AI';
            playerText.style.color = '#ef4444';
        }
    }
    
    // Animate troop movement
    animateTroopMovement(fromPlayer, toPlayer, count) {
        const troop = document.createElement('div');
        troop.className = `troop ${fromPlayer}-troop-animated`;
        troop.textContent = fromPlayer === 'human' ? '🚶' : '🤖';
        troop.style.cssText = `
            position: absolute;
            font-size: 1.5rem;
            z-index: 10;
            transition: all 1s ease;
        `;
        
        const startX = fromPlayer === 'human' ? '20%' : '80%';
        const endX = fromPlayer === 'human' ? '80%' : '20%';
        
        troop.style.left = startX;
        troop.style.top = '50%';
        
        this.elements.troopMovement.appendChild(troop);
        
        setTimeout(() => {
            troop.style.left = endX;
        }, 100);
        
        setTimeout(() => {
            troop.remove();
            this.animateDamageFlash(toPlayer);
        }, 1100);
    }
    
    // Animate damage flash
    animateDamageFlash(player) {
        const house = player === 'human' ? this.elements.humanHouse : this.elements.aiHouse;
        house.style.animation = 'damageFlash 0.5s ease';
        
        setTimeout(() => {
            house.style.animation = '';
        }, 500);
    }
    
    // Animate house
    animateHouse(houseElement, animationType) {
        if (animationType === 'pulse') {
            houseElement.style.animation = 'housePulse 1s infinite';
        }
    }
    
    // Stop house animation
    stopHouseAnimation(houseElement) {
        houseElement.style.animation = '';
    }
    
    // Show score popup
    showScorePopup(player, points, x, y) {
        const popup = document.createElement('div');
        popup.textContent = `+${points}`;
        popup.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            color: ${player === 'human' ? '#3b82f6' : '#ef4444'};
            font-weight: bold;
            font-size: 1.2rem;
            z-index: 100;
            animation: scorePop 1s ease forwards;
        `;
        
        document.querySelector('.game-area').appendChild(popup);
        
        setTimeout(() => {
            popup.remove();
        }, 1000);
    }
    
    // Get color based on health value
    getHealthColor(health) {
        if (health > 70) return '#10b981';
        if (health > 30) return '#f59e0b';
        return '#ef4444';
    }
    
    // Clear all animations
    clearAnimations() {
        this.animations.forEach((animation, id) => {
            cancelAnimationFrame(id);
        });
        this.animations.clear();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BoardManager;
}