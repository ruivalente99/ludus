# Ludus Extension - Minimalist VS Code Design System

This document explains the minimalist VS Code-inspired design architecture for the Ludus extension.

## Design Philosophy

Ludus games follow a **minimalist design philosophy** that seamlessly integrates with VS Code's native interface:

- **VS Code Native Integration**: Uses VS Code CSS variables for perfect theme compatibility
- **Minimalist Components**: Clean, functional elements without unnecessary decorations  
- **Consistent Typography**: Follows VS Code's font hierarchy and sizing
- **Accessible Design**: High contrast support and keyboard navigation
- **Responsive Layout**: Works across different panel sizes and orientations

## Design System

### Color Palette

All colors use VS Code's native CSS variables for automatic theme adaptation:

```css
/* Background Colors */
--vscode-editor-background      /* Main content background */
--vscode-sideBar-background     /* Secondary surfaces */
--vscode-input-background       /* Form elements */

/* Foreground Colors */
--vscode-foreground             /* Primary text */
--vscode-descriptionForeground  /* Secondary text */
--vscode-titleBar-activeForeground /* Headings */

/* Interactive Colors */
--vscode-button-background      /* Primary buttons */
--vscode-button-secondaryBackground /* Secondary buttons */
--vscode-list-hoverBackground   /* Hover states */
--vscode-focusBorder           /* Focus indicators */

/* Status Colors */
--vscode-charts-blue           /* Info/scores */
--vscode-charts-green          /* Success states */
--vscode-charts-orange         /* Warnings */
--vscode-charts-red            /* Errors */

/* Borders */
--vscode-panel-border          /* Main borders */
--vscode-input-border          /* Form borders */
--vscode-widget-border         /* Component borders */
```

### Typography Scale

```css
/* Headings */
h1: 22px, font-weight: 600    /* Page titles */
h2: 18px, font-weight: 500    /* Section titles */  
h3: 16px, font-weight: 500    /* Subsection titles */

/* Body Text */
body: 13px, font-weight: 400  /* Default text */
small: 12px                   /* Helper text */
code: 11px                    /* Code snippets */

/* Interactive Elements */
button: 13px, font-weight: 400
input: 13px
```

### Spacing System

Based on 4px grid system:

- **4px**: Minimal spacing
- **8px**: Small spacing  
- **12px**: Medium spacing
- **16px**: Default spacing
- **20px**: Large spacing
- **24px**: Extra large spacing
- **32px**: Section spacing

### Component Architecture

#### Buttons

```css
.btn-primary    /* Main actions - blue background */
.btn-secondary  /* Secondary actions - gray background */
```

#### Layout Components

```css
.header         /* Top navigation bar */
.header-center  /* Centered header layout */
.menu-grid      /* Game selection grid */
.game-board     /* Game playing surface */
.controls       /* Action button groups */
```

#### Data Display

```css
.game-info      /* Information panels */
.stats          /* Statistics display */
.scoreboard     /* Score tables */
.game-status    /* Current game state */
```

## Project Structure

```text
src/
├── styles/
│   ├── common.css        # Base design system
│   └── themes.css        # Theme-specific overrides
└── templates/
    ├── menu.html         # Main game menu
    ├── ticTacToe.html    # Game template example
    └── ...               # Other game templates
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

### Template Variables

Common variables available in all templates:

- `{{themeClass}}` - Current theme CSS class
- `{{themeCSS}}` - Theme-specific CSS
- `{{commonCSS}}` - Common CSS
- `{{showNewWindowBtn}}` - Whether to show "New Window" button
- `{{gameId}}` - Current game identifier

## Benefits of This Architecture

1. **Native Integration**: Perfect VS Code theme compatibility
2. **Maintainability**: Separation of concerns between HTML, CSS, and TypeScript
3. **Consistency**: Unified design language across all games
4. **Accessibility**: Built-in support for high contrast and keyboard navigation
5. **Performance**: Optimized for VS Code's webview environment
6. **Scalability**: Easy to add new games following established patterns

## Adding a New Game

To add a new game following the minimalist design:

1. **Create HTML Template**: Use `src/templates/ticTacToe.html` as reference
2. **Follow Design System**: Use established CSS classes and VS Code variables
3. **Implement Accessibility**: Include proper focus management and ARIA labels
4. **Add Statistics**: Include game statistics using the standard format
5. **Test Themes**: Verify appearance in Dark, Light, and Matrix themes

## Implementation Guidelines

### CSS Best Practices

- Use VS Code CSS variables exclusively for colors
- Follow the 4px grid spacing system
- Implement hover and focus states for all interactive elements
- Ensure high contrast mode compatibility
- Support reduced motion preferences

### HTML Structure

- Use semantic HTML elements
- Include proper ARIA labels for screen readers
- Follow consistent naming conventions
- Implement keyboard navigation
- Use the standard header and controls layout

### JavaScript Patterns

- Store game state in localStorage with consistent naming
- Implement VS Code message passing for navigation
- Use modern ES6+ features
- Handle errors gracefully
- Optimize for performance

## Migration Status

- ✅ Minimalist design system implemented
- ✅ VS Code CSS variables integration
- ✅ Common CSS architecture updated
- ✅ Theme system enhanced
- ✅ Menu template redesigned
- ✅ Tic Tac Toe template updated
- ⏳ Remaining game templates to be updated
- ⏳ Extension testing and validation

## Next Steps

1. Update remaining game templates with new design system
2. Test all games across different VS Code themes
3. Validate accessibility compliance
4. Performance optimization for webview environment
5. User testing and feedback collection
