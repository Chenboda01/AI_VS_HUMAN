# AI_VS_HUMAN - Agent Guidelines

Essential guidelines for autonomous coding agents.

## Project Overview
- Web-based turn-based game (Plants vs Zombies style)
- Technologies: HTML5, CSS3, JavaScript (ES6+)
- Deployment: GitHub Pages (https://chenboda01.github.io/AI_VS_HUMAN/)
- Status: Greenfield project

## Build System
### Package Manager
- Use npm: `npm init -y`

### Development Server
- Recommended: Vite
- Install: `npm install --save-dev vite`
- Scripts:
  ```json
  {
    "scripts": {
      "dev": "vite",
      "build": "vite build",
      "preview": "vite preview"
    }
  }
  ```
- Commands: `npm run dev`, `npm run build`, `npm run preview`

### Alternative: HTTP Server
- `npm install --save-dev http-server`
- Script: `"start": "http-server . -p 3000"`

## Linting & Code Quality
### ESLint
- Install: `npm install --save-dev eslint eslint-config-standard`
- Config (`.eslintrc.json`):
  ```json
  {
    "extends": "standard",
    "rules": {
      "semi": ["error", "always"],
      "quotes": ["error", "single"],
      "indent": ["error", 2]
    }
  }
  ```
- Commands: `npm run lint`, `npm run lint:fix`

### Prettier
- Install: `npm install --save-dev prettier`
- Config (`.prettierrc`):
  ```json
  {
    "semi": true,
    "singleQuote": true,
    "tabWidth": 2
  }
  ```
- Commands: `npm run format`, `npm run format:check`

## Testing
### Jest Configuration
- Install: `npm install --save-dev jest @testing-library/jest-dom`
- Config (`jest.config.js`):
  ```javascript
  module.exports = {
    testEnvironment: 'jsdom',
    testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js']
  };
  ```

### Test Commands
- All tests: `npm test`
- Watch mode: `npm test -- --watch`
- Coverage: `npm test -- --coverage`

### Running a Single Test
- By test name: `npm test -- -t "test description"`
- By filename: `npm test -- src/game/logic.test.js`
- Using npx: `npx jest -t "test name"`

## Code Style Guidelines
### JavaScript Conventions
- Variables: `const` (immutable), `let` (mutable), never `var`
- Naming: camelCase (vars/functions), PascalCase (classes), UPPER_SNAKE_CASE (constants)
- Semicolons: Always used
- Quotes: Single quotes for strings, backticks for templates
- Indentation: 2 spaces (no tabs)

### Modules
- Use ES6 modules: `import`/`export`
- Avoid CommonJS (`require`, `module.exports`)

### Error Handling
- Use `try/catch` for async operations
- Create custom error classes for domain-specific errors

### HTML/CSS
- Semantic HTML5 elements
- ARIA labels for accessibility
- kebab-case for CSS class names and IDs
- BEM naming convention for CSS

## AI Assistant Rules
### Cursor Rules (`.cursorrules`)
```
- Follow project code style exactly
- Write tests for new features
- Use semantic commit messages
- Keep functions focused (max 20 lines)
- Add JSDoc for public APIs
```

### GitHub Copilot (`.github/copilot-instructions.md`)
```markdown
# AI_VS_HUMAN Guidelines
- Game: Turn-based, 10 turns per player
- AI: Multi-objective (answer questions, send troops, defend)
- Code: ES6+, pure functions, separate UI/game logic
```

## Agent Workflow
### Making Changes
1. Run tests before and after
2. Lint: `npm run lint`
3. Format: `npm run format`
4. Build: `npm run build`

### Adding Features
1. Create test file first
2. Implement following style guidelines
3. Update documentation
4. Ensure tests pass

### Fixing Bugs
1. Write failing test reproducing bug
2. Fix bug
3. Verify test passes
4. Check for regressions

---

*Document version: 2025-02-16*