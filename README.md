# 🎮 Ludus - Your VS Code Gaming Sanctuary

> **Take a break, recharge your mind, and boost your productivity with classic games right in your editor.**

Ludus transforms your VS Code sidebar into a nostalgic arcade, featuring 15+ timeless games that help you relax, refocus, and return to coding with fresh energy. No context switching, no external apps – just pure gaming bliss within your favorite editor.

![VS Code Version](https://img.shields.io/badge/VS%20Code-v1.74%2B-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![TypeScript](https://img.shields.io/badge/Built%20with-TypeScript-blue)
![Games](https://img.shields.io/badge/Games-15%2B-orange)

## ✨ Why Ludus?

**🧠 Mental Health Matters**
- Combat coding fatigue with quick mental breaks
- Reduce stress with familiar, comforting gameplay
- Boost creativity through playful problem-solving

**⚡ Zero Friction**
- Instant access from VS Code sidebar
- No installation overhead or external dependencies
- Seamlessly integrated with your development workflow

**🎯 Productivity Focused**
- Short game sessions perfect for Pomodoro breaks
- Quick mental reset between complex coding tasks
- Return to work refreshed and focused

## 🎲 Game Collection

### 🧩 **Puzzle & Strategy**
| Game | Description | Perfect For |
|------|-------------|-------------|
| **🔢 Number Merge** | Combine tiles to reach the ultimate score | Logic training & pattern recognition |
| **🧱 Breakout** | Demolish brick walls with precision | Hand-eye coordination & focus |
| **🧩 Block Puzzle** | Classic falling blocks challenge | Spatial awareness & quick thinking |
| **💣 Minesweeper** | Navigate hidden dangers with logic | Deductive reasoning & patience |
| **🧠 Memory Match** | Test your recall with card matching | Memory training & concentration |

### ⚡ **Action & Reflexes**
| Game | Description | Perfect For |
|------|-------------|-------------|
| **🐍 Snake** | Grow your serpent while avoiding walls | Quick reflexes & planning |
| **🐦 Wing Flap** | Navigate through challenging obstacles | Timing & precision |
| **🚀 Asteroids** | Pilot through dangerous space debris | Multitasking & spatial awareness |
| **🛡️ Galaxy Defense** | Defend Earth from alien invasion | Strategic thinking & reaction time |
| **🐸 Road Crosser** | Help the frog cross busy streets safely | Timing & risk assessment |

### 🎯 **Classic Arcade**
| Game | Description | Perfect For |
|------|-------------|-------------|
| **⭕ Tic Tac Toe** | Challenge the AI in this timeless strategy game | Quick strategic thinking |
| **✂️ Rock Paper Scissors** | Test your luck and psychology skills | Decision making & probability |
| **🏓 Paddle Ball** | Keep the ball bouncing with perfect timing | Concentration & reflexes |
| **🏓 Pong** | The original arcade tennis experience | Competitive spirit & focus |

## 🚀 Get Started in 30 Seconds

### 1. **Install**
```bash
# From VS Code Marketplace
ext install ruivalente.ludus
```
*Or search "Ludus" in VS Code Extensions*

### 2. **Launch**
- Look for the 🎮 icon in your sidebar
- Click to open your gaming sanctuary

### 3. **Play**
- Choose any game from the beautiful menu
- Use keyboard shortcuts for lightning-fast access
- Enjoy seamless theme integration

## 🎨 Beautiful & Adaptive Design

Ludus doesn't just feel like VS Code – it **IS** VS Code. Every game automatically adapts to:

- **🌙 Your theme** (Dark, Light, High Contrast)
- **🎨 Your color scheme** 
- **📱 Your window size**
- **⌨️ Your preferred controls**

## ⌨️ Keyboard Shortcuts

### Universal Controls
- `Ctrl+Shift+P` → "Ludus: Open Games" for instant access
- `Escape` → Return to game menu from any game
- `R` → Restart current game

### Game-Specific Controls
```
🔢 Number Merge     │ WASD or Arrow Keys to merge tiles
🐍 Snake           │ WASD for direction control  
🧩 Block Puzzle    │ WASD to move, Space to drop
🏓 Paddle Games    │ A/D or Mouse for paddle control
🎯 All Games       │ Intuitive click & keyboard controls
```

## 🏆 Features That Developers Love

### 🔒 **Privacy First**
- **Zero data collection** – your gaming is private
- **Offline functionality** – works without internet
- **No external requests** – completely self-contained

### 🛠️ **Developer Experience**
- **TypeScript powered** for reliability and performance
- **Modular architecture** for easy customization
- **Comprehensive testing** ensuring quality gameplay
- **Open source** – contribute and customize freely

### 📈 **Performance Optimized**
- **Lightweight** – minimal impact on VS Code performance  
- **Efficient rendering** with optimized canvas operations
- **Memory conscious** – automatic cleanup and resource management
- **Responsive UI** – smooth 60fps gameplay

## 🎯 Perfect Use Cases

### 🍅 **Pomodoro Breaks**
*Take 5-minute gaming breaks between focused work sessions*

### 🧠 **Context Switching**
*Clear your mind when switching between complex projects*

### ⏰ **Waiting Periods**
*Stay engaged during builds, deployments, or downloads*

### 🤝 **Team Building**
*Share high scores and challenge colleagues*

### 😌 **Stress Relief**
*Decompress after debugging or difficult problem-solving*

## 📊 Real Developer Feedback

> *"Ludus has become an essential part of my development workflow. Quick Snake games between coding sessions help me maintain focus for hours."* – **Senior Developer**

> *"Finally, a gaming extension that doesn't feel out of place in VS Code. The theming integration is perfect."* – **UI/UX Engineer**

> *"The TypeScript codebase is beautiful. I've contributed two games already – it's so easy to extend!"* – **Open Source Contributor**

## 🛠️ For Developers & Contributors

### Quick Development Setup
```bash
# Clone the repository
git clone https://github.com/ruivalente99/ludus

# Install dependencies
npm install

# Start development mode
npm run watch

# Launch Extension Development Host
# Press F5 in VS Code
```

### Project Architecture
```
🏗️ Modern TypeScript Architecture
├── 🎮 /src/games/          # Individual game implementations
├── ⚙️ /src/extension.ts    # Main extension logic
├── 🧪 /src/test/           # Comprehensive test suite
├── 📦 /out/                # Compiled JavaScript
└── 🎨 /assets/             # Icons and resources
```

### Contributing New Games
Adding games is straightforward with our modular architecture:

```typescript
// 1. Create your game class
class MyAwesomeGame {
    constructor() {
        // Game initialization
    }
    
    render() {
        // Game rendering logic
    }
}

// 2. Register in extension.ts
// 3. Add to menu system
// 4. Submit PR!
```

## 📈 Roadmap

### 🔜 Coming Soon
- **🏆 Achievement system** with unlockable content
- **📊 Advanced statistics** and progress tracking  
- **🎵 Sound effects** (with toggle option)
- **🎮 More classic games** (Pac-Man style, Chess, etc.)
- **🏅 Leaderboards** for competitive players

### 💡 Community Requests
- **🎨 Custom themes** for individual games
- **⏱️ Timer challenges** and speed modes
- **🔧 Game customization** options
- **📱 Mobile-friendly** controls

## 🤝 Join the Community

### 🐛 Found a Bug?
[Report issues on GitHub](https://github.com/ruivalente99/ludus/issues) – we fix them fast!

### 💡 Have an Idea?
[Join discussions](https://github.com/ruivalente99/ludus/discussions) and shape the future of Ludus

### 🏗️ Want to Contribute?
Check our [Contributing Guide](CONTRIBUTING.md) – all skill levels welcome!

### ⭐ Love Ludus?
- **Star the repository** on GitHub
- **Rate the extension** in VS Code Marketplace  
- **Share with fellow developers** – spread the joy!

---

## 📄 License & Credits

**MIT License** – Free to use, modify, and distribute

**Created with ❤️ by developers, for developers**

*Ludus: Where productivity meets playfulness* 🎮✨

---

<div align="center">

**[⬇️ Install Now](https://marketplace.visualstudio.com/items?itemName=ruivalente.ludus)** | **[📖 Documentation](https://github.com/ruivalente99/ludus/wiki)** | **[🐛 Report Issues](https://github.com/ruivalente99/ludus/issues)** | **[💬 Join Community](https://github.com/ruivalente99/ludus/discussions)**

*Happy Coding, Happy Gaming!* 🚀

</div>
