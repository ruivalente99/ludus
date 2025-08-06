# Ludus Extension - Template System

This document explains the new template-based architecture for the Ludus VS Code extension.

## Project Structure

```
src/
├── extension.ts          # Main extension file (streamlined)
├── templateManager.ts    # Template loading and rendering system
├── gamesConfig.ts        # Game configuration and utilities
├── styles/               # CSS files
│   ├── common.css        # Common styles for all games
│   └── themes.css        # Theme-specific styles
└── templates/            # HTML templates
    ├── menu.html         # Main menu template
    ├── ticTacToe.html    # Tic Tac Toe game template
    ├── flappyBird.html   # Flappy Bird game template
    ├── rockPaperScissors.html # Rock Paper Scissors template
    ├── numbers.html      # 2048 game template
    └── ...               # Additional game templates
```

## Template System

### TemplateManager Class

The `TemplateManager` class handles:
- Loading HTML templates from files
- Loading CSS from separate files
- Template variable substitution
- Resource URI resolution (scripts, images)
- Theme management

### Template Syntax

Templates use a simple variable substitution syntax:

- `{{variable}}` - Simple variable replacement
- `{{#condition}}...{{/condition}}` - Conditional sections
- `{{gameScript:gameName}}` - Game script URI
- `{{logoUri}}` - Logo image URI

### CSS Structure

#### common.css
Contains base styles used across all games:
- Layout styles (headers, buttons, controls)
- Game canvas styles
- Score and status styles
- Common animations

#### themes.css
Contains theme-specific overrides:
- Dark theme (`.theme-dark`)
- Light theme (`.theme-light`)
- Matrix theme (`.theme-matrix`)

## Benefits of This Architecture

1. **Maintainability**: HTML and CSS are separated from TypeScript code
2. **Reusability**: Common styles are shared across all games
3. **Flexibility**: Easy to add new games by creating new templates
4. **Performance**: Templates are loaded from disk (could be cached)
5. **Theming**: Centralized theme management
6. **Smaller Files**: Main extension.ts is much smaller and focused

## Adding a New Game

To add a new game:

1. Create a new HTML template in `src/templates/[gameName].html`
2. Follow the existing template structure
3. Add game-specific CSS within the template or in common.css
4. The game will be automatically handled by the template system

## Template Variables

Common variables available in all templates:
- `{{themeClass}}` - Current theme CSS class
- `{{themeCSS}}` - Theme-specific CSS
- `{{commonCSS}}` - Common CSS
- `{{showNewWindowBtn}}` - Whether to show "New Window" button
- `{{gameId}}` - Current game identifier

## Migration Status

- ✅ TemplateManager created
- ✅ CSS files separated
- ✅ Common styles extracted
- ✅ Theme system implemented
- ✅ Main extension.ts streamlined
- ✅ Sample templates created (menu, ticTacToe, flappyBird, rockPaperScissors, numbers)
- ⏳ Remaining game templates need to be created

## Next Steps

1. Create templates for remaining games
2. Test the template system
3. Add template caching for better performance
4. Consider adding a template compilation step for production builds
