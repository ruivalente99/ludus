interface SpaceInvadersState {
    player: { x: number; y: number; width: number; height: number };
    bullets: Array<{ x: number; y: number; width: number; height: number; speed: number }>;
    invaders: Array<{ x: number; y: number; width: number; height: number; alive: boolean }>;
    score: number;
    lives: number;
    gameActive: boolean;
    gameOver: boolean;
    gameStarted: boolean;
    level: number;
    invaderDirection: number;
    invaderSpeed: number;
    lastShot: number;
}

class SpaceInvadersGame {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private state: SpaceInvadersState;
    private vscode: any;
    private gameLoop: number | null = null;
    private keys: { [key: string]: boolean } = {};

    constructor() {
        this.vscode = (window as any).vscode || (window as any).acquireVsCodeApi();
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;

        this.state = {
            player: { x: 200, y: 350, width: 40, height: 20 },
            bullets: [],
            invaders: [],
            score: 0,
            lives: 3,
            gameActive: false,
            gameOver: false,
            gameStarted: false,
            level: 1,
            invaderDirection: 1,
            invaderSpeed: 1,
            lastShot: 0
        };

        this.init();
    }

    private init(): void {
        this.setupControls();
        this.createInvaders();
        this.updateDisplay();
        this.draw();
        this.showPressToStart();
    }

    private showPressToStart(): void {
        if (!this.state.gameStarted) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#00ff00';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('SPACE INVADERS', this.canvas.width / 2, this.canvas.height / 2 - 40);
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '16px Arial';
            this.ctx.fillText('Press SPACE or Click to Start', this.canvas.width / 2, this.canvas.height / 2);
            
            this.ctx.font = '12px Arial';
            this.ctx.fillText('Use A/D or Arrow Keys to move • SPACE to shoot', this.canvas.width / 2, this.canvas.height / 2 + 30);
        }
    }

    private setupControls(): void {
        document.addEventListener('keydown', (e) => {
            if (!this.state.gameStarted && (e.key === ' ' || e.key === 'Enter')) {
                e.preventDefault();
                this.startGame();
                return;
            }
            
            this.keys[e.key.toLowerCase()] = true;
            if (e.key === ' ') {
                e.preventDefault();
                this.shoot();
            }
        });
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        this.canvas.addEventListener('click', (e) => {
            if (!this.state.gameStarted) {
                this.startGame();
                return;
            }
            
            if (!this.state.gameActive) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            if (clickX < this.state.player.x) {
                this.state.player.x = Math.max(0, this.state.player.x - 30);
            } else if (clickX > this.state.player.x + this.state.player.width) {
                this.state.player.x = Math.min(this.canvas.width - this.state.player.width, this.state.player.x + 30);
            }
            this.shoot();
        });
    }
    private createInvaders(): void {
        this.state.invaders = [];
        const rows = 5;
        const cols = 8;
        const invaderWidth = 30;
        const invaderHeight = 20;
        const spacing = 10;
        const startX = 50;
        const startY = 50;
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                this.state.invaders.push({
                    x: startX + col * (invaderWidth + spacing),
                    y: startY + row * (invaderHeight + spacing),
                    width: invaderWidth,
                    height: invaderHeight,
                    alive: true
                });
            }
        }
    }
    public startGame(): void {
        this.state.gameStarted = true;
        this.state.gameActive = true;
        this.state.gameOver = false;
        this.state.score = 0;
        this.state.lives = 3;
        this.state.level = 1;
        this.createInvaders();
        this.updateDisplay();
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
        }
        this.gameLoop = requestAnimationFrame(() => this.update());
    }

    public resetGame(): void {
        this.state.gameStarted = false;
        this.state.gameActive = false;
        this.state.gameOver = false;
        this.state.score = 0;
        this.state.lives = 3;
        this.state.level = 1;
        this.state.bullets = [];
        this.state.player.x = 200;
        this.createInvaders();
        this.updateDisplay();
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }
        this.draw();
        this.showPressToStart();
    }
    private shoot(): void {
        if (!this.state.gameActive) return;
        const now = Date.now();
        if (now - this.state.lastShot < 200) return;
        this.state.bullets.push({
            x: this.state.player.x + this.state.player.width / 2 - 2,
            y: this.state.player.y,
            width: 4,
            height: 10,
            speed: 5
        });
        this.state.lastShot = now;
    }
    private update(): void {
        if (!this.state.gameActive || this.state.gameOver) return;
        this.updatePlayer();
        this.updateBullets();
        this.updateInvaders();
        this.checkCollisions();
        this.checkGameState();
        this.draw();
        this.updateDisplay();
        this.gameLoop = requestAnimationFrame(() => this.update());
    }
    private updatePlayer(): void {
        const speed = 5;
        if (this.keys['a'] || this.keys['arrowleft']) {
            this.state.player.x = Math.max(0, this.state.player.x - speed);
        }
        if (this.keys['d'] || this.keys['arrowright']) {
            this.state.player.x = Math.min(this.canvas.width - this.state.player.width, this.state.player.x + speed);
        }
    }
    private updateBullets(): void {
        this.state.bullets = this.state.bullets.filter(bullet => {
            bullet.y -= bullet.speed;
            return bullet.y > -bullet.height;
        });
    }
    private updateInvaders(): void {
        let moveDown = false;
        const speed = this.state.invaderSpeed;
        for (const invader of this.state.invaders) {
            if (!invader.alive) continue;
            if ((invader.x <= 0 && this.state.invaderDirection === -1) ||
                (invader.x + invader.width >= this.canvas.width && this.state.invaderDirection === 1)) {
                moveDown = true;
                break;
            }
        }
        if (moveDown) {
            this.state.invaderDirection *= -1;
            for (const invader of this.state.invaders) {
                if (invader.alive) {
                    invader.y += 20;
                }
            }
        } else {
            for (const invader of this.state.invaders) {
                if (invader.alive) {
                    invader.x += this.state.invaderDirection * speed;
                }
            }
        }
    }
    private checkCollisions(): void {
        for (let i = this.state.bullets.length - 1; i >= 0; i--) {
            const bullet = this.state.bullets[i];
            for (const invader of this.state.invaders) {
                if (!invader.alive) continue;
                if (this.isColliding(bullet, invader)) {
                    invader.alive = false;
                    this.state.bullets.splice(i, 1);
                    this.state.score += 10;
                    break;
                }
            }
        }
        for (const invader of this.state.invaders) {
            if (!invader.alive) continue;
            if (invader.y + invader.height >= this.state.player.y) {
                this.state.lives--;
                if (this.state.lives <= 0) {
                    this.endGame();
                } else {
                    this.resetLevel();
                }
                break;
            }
        }
    }
    private isColliding(rect1: any, rect2: any): boolean {
        return rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y;
    }
    private checkGameState(): void {
        const aliveInvaders = this.state.invaders.filter(inv => inv.alive);
        if (aliveInvaders.length === 0) {
            this.nextLevel();
        }
    }
    private nextLevel(): void {
        this.state.level++;
        this.state.invaderSpeed += 0.5;
        this.createInvaders();
        this.state.bullets = [];
        this.state.player.x = 200;
    }
    private resetLevel(): void {
        this.createInvaders();
        this.state.bullets = [];
        this.state.player.x = 200;
    }
    private endGame(): void {
        this.state.gameActive = false;
        this.state.gameOver = true;
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }
    }
    private draw(): void {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawStars();
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(this.state.player.x, this.state.player.y, this.state.player.width, this.state.player.height);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(this.state.player.x + 15, this.state.player.y - 10, 10, 10);
        this.ctx.fillStyle = '#ffff00';
        for (const bullet of this.state.bullets) {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }
        for (const invader of this.state.invaders) {
            if (invader.alive) {
                this.drawInvader(invader);
            }
        }
        if (this.state.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#ff0000';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '16px Arial';
            this.ctx.fillText(`Final Score: ${this.state.score}`, this.canvas.width / 2, this.canvas.height / 2 + 30);
        }
    }
    private drawStars(): void {
        this.ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 50; i++) {
            const x = (i * 37) % this.canvas.width;
            const y = (i * 23) % this.canvas.height;
            this.ctx.fillRect(x, y, 1, 1);
        }
    }
    private drawInvader(invader: any): void {
        this.ctx.fillStyle = '#ff0080';
        this.ctx.fillRect(invader.x, invader.y, invader.width, invader.height);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(invader.x + 5, invader.y + 5, 4, 4);
        this.ctx.fillRect(invader.x + 21, invader.y + 5, 4, 4);
        this.ctx.fillRect(invader.x + 10, invader.y + 12, 10, 3);
    }
    private updateDisplay(): void {
        const scoreEl = document.getElementById('score');
        const livesEl = document.getElementById('lives');
        const levelEl = document.getElementById('level');
        if (scoreEl) scoreEl.textContent = this.state.score.toString();
        if (livesEl) livesEl.textContent = this.state.lives.toString();
        if (levelEl) levelEl.textContent = this.state.level.toString();
    }
}
function startSpaceInvadersGame(): void {
    (window as any).spaceInvadersGame?.startGame();
}
function resetSpaceInvadersGame(): void {
    (window as any).spaceInvadersGame?.resetGame();
}
function backToSpaceInvadersMenu(): void {
    const vscode = (window as any).vscode || (window as any).acquireVsCodeApi();
    vscode.postMessage({
        type: 'backToMenu'
    });
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        (window as any).spaceInvadersGame = new SpaceInvadersGame();
        // Space Invaders now shows "Press to Start" instead of auto-starting
    });
} else {
    (window as any).spaceInvadersGame = new SpaceInvadersGame();
    // Space Invaders now shows "Press to Start" instead of auto-starting
}
