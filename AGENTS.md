# AI_VS_HUMAN - Agent Guidelines

This document provides comprehensive guidelines for autonomous coding agents working on the AI_VS_HUMAN project. It documents build/lint/test commands, code style conventions, and project-specific patterns.

## Project Overview

- **Type**: Web-based turn-based game (similar to Plants vs Zombies)
- **Technologies**: HTML5, CSS3, JavaScript (ES6+)
- **Deployment**: GitHub Pages
- **Target URL**: https://chenboda01.github.io/AI_VS_HUMAN/
- **Repository Structure**: Greenfield project with initial README only

## Build System & Development Commands

### Package Manager

This project uses **npm** as the package manager. Initialize with:

```bash
npm init -y
```

### Development Server

For local development, we recommend using **Vite** for fast hot module replacement:

```bash
npm install --save-dev vite
```

Add to `package.json` scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

**Run development server**:

```bash
npm run dev
```

**Build for production**:

```bash
npm run build
```

**Preview production build**:

```bash
npm run preview
```

### Alternative: Simple HTTP Server

If no build step is needed:

```bash
npm install --save-dev http-server
```

Add to `package.json` scripts:

```json
{
  "scripts": {
    "start": "http-server . -p 3000"
  }
}
```

## Linting & Code Quality

### ESLint Configuration

Install ESLint with standard configuration:

```bash
npm install --save-dev eslint eslint-config-standard
```

Create `.eslintrc.json`:

```json
{
  "extends": "standard",
  "rules": {
    "semi": ["error", "always"],
    "quotes": ["error", "single"],
    "indent": ["error", 2],
    "comma-dangle": ["error", "always-multiline"]
  }
}
```

**Lint command**:

```bash
npm run lint
```

Add to `package.json` scripts:

```json
{
  "scripts": {
    "lint": "eslint . --ext .js",
    "lint:fix": "eslint . --ext .js --fix"
  }
}
```

### Prettier Configuration

Install Prettier:

```bash
npm install --save-dev prettier
```

Create `.prettierrc`:

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80
}
```

**Format command**:

```bash
npm run format
```

Add to `package.json` scripts:

```json
{
  "scripts": {
    "format": "prettier --write \"**/*.{js,html,css,md}\"",
    "format:check": "prettier --check \"**/*.{js,html,css,md}\""
  }
}
```

## Testing Framework

### Jest Configuration

Install Jest for unit testing:

```bash
npm install --save-dev jest @testing-library/jest-dom
```

Create `jest.config.js`:

```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
  ],
};
```

**Run all tests**:

```bash
npm test
```

**Run tests in watch mode**:

```bash
npm test -- --watch
```

**Run tests with coverage**:

```bash
npm test -- --coverage
```

### Running a Single Test

**By test name (description)**:

```bash
npm test -- -t "should calculate score correctly"
```

**By filename**:

```bash
npm test -- src/game/logic.test.js
```

**Using npx directly**:

```bash
npx jest -t "renders game board"
```

**For specific test suites**:

```bash
npm test -- --testNamePattern="Game Logic"
```

### Test File Structure

Test files should be colocated with source files or in `__tests__` directories:

```
src/
  game/
    logic.js
    logic.test.js  # Colocated test file
  __tests__/
    ui.test.js     # Separate test directory
```

## Code Style Guidelines

### JavaScript/ES6+ Conventions

**General Rules**:

- Use **camelCase** for variables, functions, and object properties
- Use **PascalCase** for classes and constructor functions
- Use **UPPER_SNAKE_CASE** for constants
- Always use `const` for variables that won't be reassigned, `let` for mutable variables
- Never use `var`

**Example**:

```javascript
// Good
const MAX_TURNS = 10;
let currentTurn = 0;

function calculateScore(player) {
  return player.points * player.multiplier;
}

class GameEngine {
  constructor() {
    this.state = {};
  }
}

// Bad
var max_turns = 10;
function Calculate_Score(player) {
  return player.Points * player.Multiplier;
}
```

**Semicolons**: Always use semicolons
**Quotes**: Use single quotes for strings, backticks for template literals
**Indentation**: 2 spaces (no tabs)

### Import/Export Patterns

**ES6 Modules** (preferred):

```javascript
// Named imports
import { Game, Player } from './game/engine.js';
import { calculateScore as calcScore } from './utils/scoring.js';

// Default import
import GameEngine from './engine/GameEngine.js';

// Named exports
export const MAX_TURNS = 10;
export function initializeGame() {
  /* ... */
}
export default class Game {
  /* ... */
}
```

**Avoid CommonJS**: Don't use `require()` or `module.exports`

### Error Handling

**Use try/catch for async operations**:

```javascript
async function loadGameState() {
  try {
    const response = await fetch('/api/game-state');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to load game state:', error);
    throw new GameLoadError('Could not load game', { cause: error });
  }
}
```

**Create custom error classes**:

```javascript
class GameError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'GameError';
    this.code = code;
  }
}
```

### HTML/CSS Conventions

**HTML Structure**:

- Use semantic HTML5 elements (`<header>`, `<main>`, `<section>`, `<article>`)
- Include proper ARIA labels for accessibility
- Use kebab-case for CSS class names and IDs
- Always include `alt` attributes for images

**CSS Guidelines**:

- Use BEM (Block Element Modifier) naming convention
- Organize CSS with logical sections (typography, layout, components, utilities)
- Use CSS custom properties (variables) for theming
- Prefer Flexbox/Grid over floats

**Example**:

```css
/* BEM Example */
.game-board {
  display: grid;
  gap: 1rem;
}

.game-board__cell {
  border: 1px solid #ccc;
}

.game-board__cell--active {
  background-color: #e0f7fa;
}
```

## Project Structure

Recommended structure:

```
AI_VS_HUMAN/
├── index.html              # Main entry point
├── src/
│   ├── assets/            # Images, fonts, sounds
│   ├── css/              # Stylesheets
│   │   ├── main.css
│   │   ├── components/
│   │   └── utilities/
│   ├── js/               # JavaScript modules
│   │   ├── game/
│   │   │   ├── engine.js
│   │   │   ├── player.js
│   │   │   └── ai.js
│   │   ├── ui/
│   │   │   ├── board.js
│   │   │   └── controls.js
│   │   └── utils/
│   │       ├── scoring.js
│   │       └── helpers.js
│   └── __tests__/        # Test files
├── public/               # Static files for GitHub Pages
├── package.json
├── vite.config.js       # Build configuration
├── .eslintrc.json
├── .prettierrc
└── AGENTS.md            # This file
```

## GitHub Pages Deployment

### Automatic Deployment

Configure in `package.json`:

```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

Install gh-pages:

```bash
npm install --save-dev gh-pages
```

**Deploy command**:

```bash
npm run deploy
```

### Manual Deployment

1. Build the project: `npm run build`
2. Commit the `dist/` directory to the `gh-pages` branch
3. Push to GitHub

## AI Assistant Rules

### Cursor Rules (.cursorrules)

If using Cursor, create `.cursorrules` with:

```
- Follow the project's code style guidelines exactly
- Write comprehensive tests for new features
- Use semantic commit messages
- Keep functions small and focused (max 20 lines)
- Add JSDoc comments for public APIs
```

### GitHub Copilot Instructions

Create `.github/copilot-instructions.md` with:

```markdown
# Project Guidelines for AI_VS_HUMAN

## Game-Specific Patterns

- The game is turn-based with 10 turns per player
- AI uses a multi-objective algorithm (answer questions, send troops, defend)
- Human player has the same capabilities as AI

## Code Style

- Use ES6+ features (arrow functions, destructuring, async/await)
- Write pure functions when possible
- Keep UI logic separate from game logic
- Use event delegation for dynamic elements
```

## Troubleshooting

### Common Issues

**Tests not running**:

- Ensure Jest is installed: `npm install --save-dev jest`
- Check `jest.config.js` exists and is properly configured
- Verify test files match pattern: `*.test.js` or `*.spec.js`

**ESLint errors**:

- Run `npm run lint:fix` to auto-fix issues
- Check `.eslintrc.json` for rule configurations
- Ensure all team members have the same ESLint version

**Build failures**:

- Clear node_modules: `rm -rf node_modules && npm install`
- Check for syntax errors: `node -c src/**/*.js`
- Verify Vite configuration if using build system

## Agent Workflow

### When Making Changes

1. Run tests before and after changes
2. Check linting with `npm run lint`
3. Format code with `npm run format`
4. Verify build succeeds: `npm run build`

### Adding New Features

1. Create corresponding test file
2. Implement feature following style guidelines
3. Update documentation if needed
4. Ensure all tests pass

### Fixing Bugs

1. Write a failing test that reproduces the bug
2. Fix the bug
3. Verify the test passes
4. Ensure no regression in other tests

---

_This document is living and should be updated as the project evolves. Last updated: 2025-02-16_
