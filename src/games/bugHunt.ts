interface Bug {
    id: number;
    x: number;
    y: number;
    size: number;
    lifespan: number;
    maxLifespan: number;
    type: 'regular' | 'golden' | 'speedy';
}

interface BugHuntGameState {
    bugs: Bug[];
    score: number;
    gameActive: boolean;
    gameOver: boolean;
    timeLeft: number;
    maxTime: number;
    bugIdCounter: number;
    spawnRate: number;
    level: number;
    lives: number;
    maxLives: number;
}

class BugHuntGame {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private state: BugHuntGameState;
    private vscode: any;
    private gameLoop: NodeJS.Timeout | null = null;
    private spawnLoop: NodeJS.Timeout | null = null;

    constructor() {
        this.vscode = (window as any).vscode || (window as any).acquireVsCodeApi();
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        
        this.state = {
            bugs: [],
            score: 0,
            gameActive: false,
            gameOver: false,
            timeLeft: 60,
            maxTime: 60,
            bugIdCounter: 0,
            spawnRate: 1000,
            level: 1,
            lives: 3,
            maxLives: 3
        };
        
        this.init();
    }

    private init(): void {
        this.canvas.width = 600;
        this.canvas.height = 400;
        this.setupControls();
        this.updateDisplay();
        this.draw();
    }

    private setupControls(): void {
        this.canvas.addEventListener('click', (e) => {
            if (!this.state.gameActive) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            
            this.checkBugClick(clickX, clickY);
        });

        // Prevent context menu on right click
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    private checkBugClick(x: number, y: number): void {
        for (let i = this.state.bugs.length - 1; i >= 0; i--) {
            const bug = this.state.bugs[i];
            const distance = Math.sqrt(
                Math.pow(x - bug.x, 2) + Math.pow(y - bug.y, 2)
            );
            
            if (distance <= bug.size) {
                // Bug hit!
                let points = 10;
                if (bug.type === 'golden') {
                    points = 50;
                } else if (bug.type === 'speedy') {
                    points = 25;
                }
                
                this.state.score += points;
                this.state.bugs.splice(i, 1);
                this.updateDisplay();
                break;
            }
        }
    }

    private spawnBug(): void {
        if (!this.state.gameActive) return;

        const bugType = this.determineBugType();
        const size = this.getBugSize(bugType);
        const lifespan = this.getBugLifespan(bugType);
        
        const bug: Bug = {
            id: this.state.bugIdCounter++,
            x: Math.random() * (this.canvas.width - size * 2) + size,
            y: Math.random() * (this.canvas.height - size * 2) + size,
            size: size,
            lifespan: lifespan,
            maxLifespan: lifespan,
            type: bugType
        };
        
        this.state.bugs.push(bug);
    }

    private determineBugType(): 'regular' | 'golden' | 'speedy' {
        const random = Math.random();
        if (random < 0.05) return 'golden';    // 5% chance
        if (random < 0.2) return 'speedy';     // 15% chance
        return 'regular';                       // 80% chance
    }

    private getBugSize(type: 'regular' | 'golden' | 'speedy'): number {
        switch (type) {
            case 'golden': return 25;
            case 'speedy': return 15;
            default: return 20;
        }
    }

    private getBugLifespan(type: 'regular' | 'golden' | 'speedy'): number {
        switch (type) {
            case 'golden': return 180; // 3 seconds
            case 'speedy': return 120; // 2 seconds
            default: return 240;       // 4 seconds
        }
    }

    private updateBugs(): void {
        for (let i = this.state.bugs.length - 1; i >= 0; i--) {
            const bug = this.state.bugs[i];
            bug.lifespan--;
            
            if (bug.lifespan <= 0) {
                // Bug escaped
                this.state.bugs.splice(i, 1);
                this.state.lives--;
                
                if (this.state.lives <= 0) {
                    this.endGame();
                    return;
                }
                this.updateDisplay();
            }
        }
    }

    private updateTimer(): void {
        if (!this.state.gameActive) return;
        
        this.state.timeLeft--;
        this.updateDisplay();
        
        if (this.state.timeLeft <= 0) {
            this.endGame();
        }
    }

    private draw(): void {
        // Clear canvas
        this.ctx.fillStyle = '#2d4a2d';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw bugs
        this.state.bugs.forEach(bug => {
            this.drawBug(bug);
        });
        
        requestAnimationFrame(() => this.draw());
    }

    private drawBug(bug: Bug): void {
        const alpha = bug.lifespan / bug.maxLifespan;
        
        // Bug body
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        
        if (bug.type === 'golden') {
            this.ctx.fillStyle = '#ffd700';
        } else if (bug.type === 'speedy') {
            this.ctx.fillStyle = '#ff6b6b';
        } else {
            this.ctx.fillStyle = '#4a4a4a';
        }
        
        this.ctx.beginPath();
        this.ctx.arc(bug.x, bug.y, bug.size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Bug spots
        this.ctx.fillStyle = bug.type === 'golden' ? '#b8860b' : '#000';
        this.ctx.beginPath();
        this.ctx.arc(bug.x - bug.size * 0.3, bug.y - bug.size * 0.2, bug.size * 0.15, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(bug.x + bug.size * 0.2, bug.y - bug.size * 0.3, bug.size * 0.12, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Bug antennae
        this.ctx.strokeStyle = bug.type === 'golden' ? '#b8860b' : '#000';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(bug.x - bug.size * 0.2, bug.y - bug.size * 0.8);
        this.ctx.lineTo(bug.x - bug.size * 0.4, bug.y - bug.size * 1.2);
        this.ctx.moveTo(bug.x + bug.size * 0.2, bug.y - bug.size * 0.8);
        this.ctx.lineTo(bug.x + bug.size * 0.4, bug.y - bug.size * 1.2);
        this.ctx.stroke();
        
        // Lifespan indicator
        if (bug.lifespan < bug.maxLifespan * 0.3) {
            this.ctx.strokeStyle = '#ff0000';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(bug.x, bug.y, bug.size + 5, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }

    private updateDisplay(): void {
        const scoreElement = document.getElementById('score');
        const timeElement = document.getElementById('timeLeft');
        const livesElement = document.getElementById('lives');
        
        if (scoreElement) scoreElement.textContent = this.state.score.toString();
        if (timeElement) timeElement.textContent = this.state.timeLeft.toString();
        if (livesElement) livesElement.textContent = this.state.lives.toString();
    }

    public startGame(): void {
        this.state = {
            bugs: [],
            score: 0,
            gameActive: true,
            gameOver: false,
            timeLeft: this.state.maxTime,
            maxTime: this.state.maxTime,
            bugIdCounter: 0,
            spawnRate: 1000,
            level: 1,
            lives: this.state.maxLives,
            maxLives: this.state.maxLives
        };
        
        this.updateDisplay();
        
        // Start game loops
        this.gameLoop = setInterval(() => {
            this.updateBugs();
            this.updateTimer();
        }, 60); // ~16.6 FPS for updates
        
        this.spawnLoop = setInterval(() => {
            this.spawnBug();
        }, this.state.spawnRate);
    }

    public resetGame(): void {
        this.endGame();
        this.state.score = 0;
        this.state.timeLeft = this.state.maxTime;
        this.state.lives = this.state.maxLives;
        this.state.bugs = [];
        this.updateDisplay();
    }

    private endGame(): void {
        this.state.gameActive = false;
        this.state.gameOver = true;
        
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        
        if (this.spawnLoop) {
            clearInterval(this.spawnLoop);
            this.spawnLoop = null;
        }
        
        // Show game over message
        setTimeout(() => {
            const message = this.state.lives <= 0 
                ? `Game Over! Too many bugs escaped!\nFinal Score: ${this.state.score}`
                : `Time's Up!\nFinal Score: ${this.state.score}`;
            alert(message);
        }, 100);
    }
}

// Global functions for the HTML template
(window as any).startBugHuntGame = function() {
    if ((window as any).bugHuntGame) {
        (window as any).bugHuntGame.startGame();
    }
};

(window as any).resetBugHuntGame = function() {
    if ((window as any).bugHuntGame) {
        (window as any).bugHuntGame.resetGame();
    }
};

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    (window as any).bugHuntGame = new BugHuntGame();
    // Auto-start the game after a brief delay
    setTimeout(() => {
        (window as any).bugHuntGame.startGame();
    }, 500);
});
