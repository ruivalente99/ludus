# Ludus - VS Code Games Extension

A collection of classic mini-games for relaxation in the VS Code sidebar, now written in TypeScript for better maintainability and performance.

## 🎮 Available Games

- **⭕ Tic Tac Toe** - Classic 3x3 grid game with AI opponent or two-player mode
- **✂️ Rock Paper Scissors** - Quick rounds against the computer with score tracking
- **🔢 Number Merge** - Combine numbered tiles to reach the highest score
- **🏓 Paddle Ball** - Keep the ball bouncing with your paddle
- **🧩 Block Puzzle (Tetris)** - Stack and clear falling blocks
- **� Galaxy Defense** - Defend Earth from alien invasion
- **🐍 Snake** - Grow your snake by eating food
- **🧱 Breakout** - Break all the bricks with your paddle
- **🧠 Memory Match** - Match pairs of cards to test your memory
- **🐸 Road Crosser** - Help the frog cross safely through traffic
- **🚀 Asteroids** - Navigate through space debris
- **🏓 Pong** - The original arcade tennis game
- **💣 Minesweeper** - Clear the field without hitting mines
- **🐦 Wing Flap** - Navigate through obstacles by tapping

## 🚀 Quick Start

1. Install the extension in VS Code
2. Open the Games sidebar panel (look for the 🎮 icon)
3. Click on any game to start playing!

## 🛠️ Development

### Prerequisites

- Node.js (version 16 or higher)
- VS Code
- TypeScript knowledge for modifications

### Setup

```bash
# Clone or download the project
cd pass-time

# Install dependencies
npm install

# Compile TypeScript to JavaScript
npm run compile

# Or watch for changes during development
npm run watch
```

### Project Structure

```bash
src/
├── extension.ts          # Main extension logic and HTML generation
└── games/               # Individual game implementations
    ├── ticTacToe.ts     # Tic Tac Toe game logic
    ├── rockPaperScissors.ts # Rock Paper Scissors game
    ├── numbers.ts       # 2048-style number game
    ├── paddle.ts        # Paddle ball game
    ├── blocks.ts        # Tetris-style block puzzle
    └── wordGuess.ts     # Wordle-style word guessing game
```

### Building

- **Development**: `npm run watch` - Automatically recompiles on file changes
- **Production**: `npm run compile` - One-time compilation

### Testing

1. Press `F5` in VS Code to launch Extension Development Host
2. Open the Games sidebar panel
3. Test each game for functionality

## 🎨 Features

### Code Quality

- **TypeScript**: Fully converted from JavaScript for type safety
- **Modular Design**: Each game is a separate class with clear interfaces
- **Error Handling**: Proper error handling and validation
- **Clean HTML**: Fixed malformed HTML syntax from original version

### Game Features

- **Responsive Design**: Games adapt to VS Code's theme
- **Keyboard Controls**: All games support keyboard navigation
- **Score Tracking**: Persistent scores during game sessions
- **Smooth Animations**: Canvas-based games with smooth rendering

### Developer Experience

- **Easy to Extend**: Clear class structure for adding new games
- **Type Safety**: Full TypeScript interfaces and types
- **Build System**: Automated compilation with npm scripts
- **Task Configuration**: VS Code tasks for building and watching

## 🔧 Adding New Games

To add a new game:

1. Create a new TypeScript file in `src/games/`
2. Implement the game logic as a class
3. Add HTML generation method in `extension.ts`
4. Update the menu in `_getMenuHtml()`
5. Add the game case in `_getGameHtml()`
6. Use unique function names to avoid conflicts

Example template:

```typescript
interface MyGameState {
    // Define game state
}

class MyGame {
    private state: MyGameState;
    private vscode: any;

    constructor() {
        this.vscode = (window as any).acquireVsCodeApi();
        // Initialize game
    }

    public backToMenu(): void {
        this.vscode.postMessage({ type: 'backToMenu' });
    }
}

// Global functions for HTML
let myGame: MyGame;
function backToMenuMyGame(): void {
    myGame.backToMenu();
}
```

## 📦 Distribution

### Packaging

```bash
# Install vsce if not already installed
npm install -g vsce

# Package the extension
vsce package
```

### Publishing

```bash
# Publish to VS Code Marketplace
vsce publish
```

## 🎯 Game Controls

### Tic Tac Toe

- Click cells to place X/O
- Toggle between AI and human opponent

### Rock Paper Scissors

- Click rock, paper, or scissors buttons
- Score tracking across rounds

### Number Grid (2048)

- **WASD** or **Arrow Keys**: Move tiles
- Combine same numbers to reach 2048

### Paddle Ball

- **Mouse**: Move paddle left/right
- **A/D Keys**: Alternative paddle controls

### Block Puzzle

- **WASD** or **Arrow Keys**: Move pieces
- **W/Up**: Rotate piece
- **Space**: Drop piece instantly

### Word Guess

- **Type Letters**: Enter your guess
- **Enter**: Submit word
- **Backspace**: Delete letters

## 🛡️ Error Handling

The extension includes comprehensive error handling:

- Canvas initialization checks
- DOM element validation
- Game state validation
- Graceful fallbacks for missing elements

## 🎨 Theming

All games automatically adapt to VS Code's current theme using CSS variables:

- `--vscode-foreground`: Text color
- `--vscode-background`: Background color
- `--vscode-button-background`: Button colors
- `--vscode-input-border`: Border colors

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

See LICENSE file for details.

## 🔄 Version History

### v1.0.0 (Current)

- Converted all games to TypeScript
- Fixed HTML syntax issues
- Added new games (Paddle Ball, Block Puzzle, Word Guess)
- Improved error handling and type safety
- Enhanced build system with npm scripts
- Better code organization and documentation
