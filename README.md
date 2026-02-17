# AI vs HUMAN - Turn-Based Strategy Game

A web-based turn-based strategy game where humans battle AI across 10 turns each. The player with the highest score after 20 turns wins. Choose your side (Human or AI), select difficulty, and use strategic actions to outscore your opponent.

## Live Demo
- **Play Now**: [https://chenboda01.github.io/AI_VS_HUMAN/](https://chenboda01.github.io/AI_VS_HUMAN/)
- **Repository**: [https://github.com/Chenboda01/AI_VS_HUMAN](https://github.com/Chenboda01/AI_VS_HUMAN)

## Features

### Core Gameplay
- **10 Turns Per Player**: 20 total turns of strategic decision-making
- **Role Selection**: Choose to play as Human or AI (the other side is AI-controlled)
- **Three Actions Per Turn**:
  - **Answer Questions**: Gain knowledge points with trivia questions
  - **Send Troops**: Attack opponent's house to reduce their health
  - **Defend House**: Boost defense to reduce incoming damage
- **Four Difficulty Levels**: Easy, Medium, Hard, Impossible (AI adapts aggression)
- **Score-Based Victory**: Highest score after 20 turns wins

### AI System
- **Multi‑Objective Algorithm**: Balances between answering questions, sending troops, and defending
- **Adaptive Strategy**: AI weights actions based on game state and difficulty
- **"Impossible" Difficulty**: Aggressive AI with optimized decision-making

### User Experience
- **Visual Animations**: Smooth troop movements, explosions, and particle effects
- **Sound Effects**: Web Audio API sound feedback for all game events
- **Mute Toggle**: Persistent sound preference with localStorage
- **Responsive Design**: Optimized for desktop, tablet, and mobile (480px+ breakpoints)
- **Real‑Time Battle Log**: Track game events with auto‑scrolling

### Accessibility
- **ARIA Labels**: All interactive elements labeled for screen readers
- **Skip‑to‑Content Link**: Keyboard navigation shortcut
- **Live Regions**: Dynamic content (scores, turn indicator, battle log) announced to assistive tech
- **High Contrast**: Color‑coded UI with WCAG‑compliant contrast ratios
- **Keyboard Navigation**: Full tab‑based interaction with focus indicators
- **Semantic HTML**: Proper heading structure and landmark regions

## Technology Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+ modules)
- **Build Tools**: Vite (dev server & production builds)
- **Code Quality**: ESLint (Standard config), Prettier, 80+ Jest unit tests
- **Deployment**: GitHub Pages (automatic from main branch)

## Development

### Quick Start
```bash
git clone https://github.com/Chenboda01/AI_VS_HUMAN.git
cd AI_VS_HUMAN/AI_VS_HUMAN
npm install
npm run dev  # local development (http://localhost:5173)
```

### Available Commands
- `npm run dev` – Start Vite development server with HMR
- `npm run build` – Production build to `dist/`
- `npm run preview` – Preview production build locally
- `npm test` – Run 80+ Jest unit tests (engine, AI, utilities)
- `npm run lint` – ESLint code checking
- `npm run lint:fix` – Auto‑fix lint errors
- `npm run format` – Prettier formatting

### Project Structure
```
AI_VS_HUMAN/
├── index.html              # Main entry point
├── src/
│   ├── css/main.css       # All styles (responsive, animations)
│   ├── js/
│   │   ├── game/          # Core game logic (engine, AI, player)
│   │   ├── ui/            # UI components (board, controls)
│   │   └── utils/         # Helpers (sound, particles, storage)
│   └── __tests__/         # Jest test files
├── AGENTS.md              # Comprehensive developer guidelines
└── package.json
```

## Testing & Quality
- **80 Passing Unit Tests**: Engine, AI player, utility functions
- **Cross‑Browser Testing**: Chrome, Firefox, Safari, Edge
- **Mobile Testing**: Responsive layouts verified down to 480px
- **Accessibility Audits**: ARIA attributes, keyboard navigation, screen‑reader compatibility
- **ESLint + Prettier**: Enforced code style and consistency

## Recent Improvements
1. **Role Selection**: Extended timeout to 10 seconds (was 1 second)
2. **Sound System**: Web Audio API with browser autoplay compliance
3. **Mute Persistence**: localStorage saves sound preference
4. **Accessibility**: ARIA labels, live regions, skip link, mobile optimizations
5. **Code Quality**: Fixed 278 ESLint errors, standardized formatting
6. **UI/UX**: Enhanced animations, particle effects, button states

## Deployment
The game is automatically deployed to GitHub Pages from the `main` branch. Any push to `main` updates the live site within minutes.

## License
Open‑source under ISC License. See repository for details.