// Helper utilities for AI vs HUMAN game

const GameHelpers = {
  // Sound control
  soundMuted: (() => {
    try {
      const saved = localStorage.getItem('ai_vs_human_sound_muted');
      return saved ? JSON.parse(saved) : false;
    } catch (e) {
      return false;
    }
  })(),

  // Format number with commas
  formatNumber: (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },

  // Generate random integer between min and max (inclusive)
  randomInt: (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // Clamp value between min and max
  clamp: (value, min, max) => {
    return Math.max(min, Math.min(max, value));
  },

  // Calculate percentage
  percentage: (part, total) => {
    if (total === 0) return 0;
    return (part / total) * 100;
  },

  // Shuffle array (Fisher-Yates)
  shuffleArray: (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  },

  // Debounce function
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction (...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Format time in MM:SS
  formatTime: (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },

  // Check if running on mobile
  isMobile: () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
  },

  // Save to localStorage
  saveToStorage: (key, value) => {
    try {
      localStorage.setItem(`ai_vs_human_${key}`, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
      return false;
    }
  },

  // Load from localStorage
  loadFromStorage: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(`ai_vs_human_${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
      return defaultValue;
    }
  },

  // Remove from localStorage
  removeFromStorage: (key) => {
    try {
      localStorage.removeItem(`ai_vs_human_${key}`);
      return true;
    } catch (e) {
      console.error('Failed to remove from localStorage:', e);
      return false;
    }
  },

  // Generate unique ID
  generateId: (length = 8) => {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  // Calculate distance between two points
  distance: (x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  },

  // Parse query parameters
  getQueryParam: (param) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  },

  // Set query parameter
  setQueryParam: (param, value) => {
    const url = new URL(window.location);
    url.searchParams.set(param, value);
    window.history.pushState({}, '', url);
  },

  // Copy text to clipboard
  copyToClipboard: async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Failed to copy:', err);
      return false;
    }
  },

  // Play sound (if available)
  playSound: (soundUrl) => {
    try {
      const audio = new Audio(soundUrl);
      audio.play().catch((e) => console.log('Audio play failed:', e));
    } catch (e) {
      console.log('Sound not supported:', e);
    }
  },

  // Play sound effect using Web Audio API
  playSoundEffect: (effectName) => {
    if (GameHelpers.soundMuted) return;
    try {
      // Create audio context if not exists
      if (!window.GameHelpersAudioContext) {
        window.GameHelpersAudioContext = new (
          window.AudioContext || window.webkitAudioContext
        )();
      }
      const audioContext = window.GameHelpersAudioContext;

      // Define sound parameters based on effect
      let frequency = 440;
      let duration = 0.2;
      let type = 'sine';
      let volume = 0.3;

      switch (effectName) {
      case 'buttonClick':
        frequency = 523.25;
        duration = 0.1;
        type = 'sine';
        volume = 0.2;
        break;
      case 'correctAnswer':
        frequency = 659.25;
        duration = 0.3;
        type = 'triangle';
        volume = 0.4;
        break;
      case 'incorrectAnswer':
        frequency = 220;
        duration = 0.4;
        type = 'square';
        volume = 0.3;
        break;
      case 'troopSend':
        frequency = 349.23;
        duration = 0.5;
        type = 'sawtooth';
        volume = 0.25;
        break;
      case 'defend':
        frequency = 392;
        duration = 0.6;
        type = 'sine';
        volume = 0.35;
        break;
      case 'gameOverWin':
        frequency = 523.25;
        duration = 0.8;
        type = 'sine';
        volume = 0.5;
        break;
      case 'gameOverLose':
        frequency = 220;
        duration = 1.0;
        type = 'sawtooth';
        volume = 0.4;
        break;
      case 'troopExplosion':
        frequency = 150;
        duration = 0.3;
        type = 'square';
        volume = 0.3;
        break;
      default:
        frequency = 440;
        duration = 0.2;
      }

      // Create oscillator and gain node
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = type;

      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + duration,
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);

      // Resume audio context if suspended (browser policy)
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
    } catch (e) {
      console.log('Web Audio not supported:', e);
    }
  },

  // Vibrate device (if available)
  vibrate: (pattern) => {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  },

  // Create particle effect for explosions/attacks
  createParticleEffect: (options) => {
    const {
      x,
      y,
      count = 15,
      colors = ['#ff6b6b', '#ffa726', '#ffee58', '#4ecdc4', '#45b7d1'],
      size = 6,
      speed = 2,
      spread = 100,
      container = document.body,
    } = options;

    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.style.position = 'absolute';
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.borderRadius = '50%';
      particle.style.backgroundColor =
        colors[Math.floor(Math.random() * colors.length)];
      particle.style.pointerEvents = 'none';
      particle.style.zIndex = '1000';
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.boxShadow = '0 0 8px currentColor';
      particle.style.opacity = '0.9';
      particle.style.transform = 'translate(-50%, -50%)';

      container.appendChild(particle);

      const angle = Math.random() * Math.PI * 2;
      const velocity = speed * (0.5 + Math.random() * 0.5);
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity;
      const life = 0.5 + Math.random() * 0.5;

      const startTime = Date.now();

      const animate = () => {
        const elapsed = (Date.now() - startTime) / 1000;
        if (elapsed > life) {
          particle.remove();
          return;
        }

        const progress = elapsed / life;
        const currentX = x + vx * elapsed * spread;
        const currentY = y + vy * elapsed * spread;
        particle.style.left = `${currentX}px`;
        particle.style.top = `${currentY}px`;
        particle.style.opacity = `${0.9 * (1 - progress)}`;
        particle.style.transform = `translate(-50%, -50%) scale(${1 + progress * 0.5})`;

        requestAnimationFrame(animate);
      };

      requestAnimationFrame(animate);
    }
  },
};

// Export for use in other modules
if (typeof window !== 'undefined') window.GameHelpers = GameHelpers;

export default GameHelpers;
