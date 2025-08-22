interface BreakoutGameState {
    paddle: { x: number; y: number; width: number; height: number };
    ball: { x: number; y: number; radius: number; dx: number; dy: number };
    bricks: Array<{ x: number; y: number; width: number; height: number; visible: boolean; color: string }>;
    score: number;
    lives: number;
    gameActive: boolean;
    gameOver: boolean;
    gameWon: boolean;
    level: number;
}
class BreakoutGame {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private state: BreakoutGameState;
    private vscode: any;
    private gameLoop: number | null = null;
    private keys: { [key: string]: boolean } = {};
    constructor() {
        this.vscode = (window as any).vscode || (window as any).acquireVsCodeApi();
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.state = {
            paddle: { x: 175, y: 350, width: 80, height: 10 },
            ball: { x: 200, y: 300, radius: 8, dx: 3, dy: -3 },
            bricks: [],
            score: 0,
            lives: 3,
            gameActive: false,
            gameOver: false,
            gameWon: false,
            level: 1
        };
        this.init();
    }
    private init(): void {
        this.canvas.width = 400;
        this.canvas.height = 400;
        this.setupControls();
        this.createBricks();
        this.updateDisplay();
        this.draw();
    }
    private setupControls(): void {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.state.gameActive) return;
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            this.state.paddle.x = Math.max(0, Math.min(this.canvas.width - this.state.paddle.width, mouseX - this.state.paddle.width / 2));
        });
        this.canvas.addEventListener('touchmove', (e) => {
            if (!this.state.gameActive) return;
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const touchX = touch.clientX - rect.left;
            this.state.paddle.x = Math.max(0, Math.min(this.canvas.width - this.state.paddle.width, touchX - this.state.paddle.width / 2));
        });
    }
    private createBricks(): void {
        this.state.bricks = [];
        const brickRowCount = 5;
        const brickColumnCount = 8;
        const brickWidth = 40;
        const brickHeight = 20;
        const brickPadding = 5;
        const brickOffsetTop = 50;
        const brickOffsetLeft = 15;
        const colors = ['#ff0000', '#ff8800', '#ffff00', '#88ff00', '#0088ff'];
        for (let r = 0; r < brickRowCount; r++) {
            for (let c = 0; c < brickColumnCount; c++) {
                this.state.bricks.push({
                    x: c * (brickWidth + brickPadding) + brickOffsetLeft,
                    y: r * (brickHeight + brickPadding) + brickOffsetTop,
                    width: brickWidth,
                    height: brickHeight,
                    visible: true,
                    color: colors[r]
                });
            }
        }
    }
    public startGame(): void {
        this.state.gameActive = true;
        this.state.gameOver = false;
        this.state.gameWon = false;
        this.state.score = 0;
        this.state.lives = 3;
        this.state.level = 1;
        this.resetBall();
        this.createBricks();
        this.updateDisplay();
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
        }
        this.gameLoop = requestAnimationFrame(() => this.update());
    }
    public resetGame(): void {
        this.state.gameActive = false;
        this.state.gameOver = false;
        this.state.gameWon = false;
        this.state.score = 0;
        this.state.lives = 3;
        this.state.level = 1;
        this.resetBall();
        this.createBricks();
        this.updateDisplay();
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }
        this.draw();
    }
    private resetBall(): void {
        this.state.ball.x = this.canvas.width / 2;
        this.state.ball.y = this.canvas.height - 100;
        this.state.ball.dx = (Math.random() > 0.5 ? 1 : -1) * (2 + this.state.level * 0.5);
        this.state.ball.dy = -Math.abs(this.state.ball.dx);
        this.state.paddle.x = (this.canvas.width - this.state.paddle.width) / 2;
    }
    private update(): void {
        if (!this.state.gameActive || this.state.gameOver || this.state.gameWon) return;
        this.updatePaddle();
        this.updateBall();
        this.checkCollisions();
        this.checkGameState();
        this.draw();
        this.updateDisplay();
        this.gameLoop = requestAnimationFrame(() => this.update());
    }
    private updatePaddle(): void {
        const speed = 7;
        if (this.keys['a'] || this.keys['arrowleft']) {
            this.state.paddle.x = Math.max(0, this.state.paddle.x - speed);
        }
        if (this.keys['d'] || this.keys['arrowright']) {
            this.state.paddle.x = Math.min(this.canvas.width - this.state.paddle.width, this.state.paddle.x + speed);
        }
    }
    private updateBall(): void {
        this.state.ball.x += this.state.ball.dx;
        this.state.ball.y += this.state.ball.dy;
        if (this.state.ball.x - this.state.ball.radius < 0 || this.state.ball.x + this.state.ball.radius > this.canvas.width) {
            this.state.ball.dx = -this.state.ball.dx;
        }
        if (this.state.ball.y - this.state.ball.radius < 0) {
            this.state.ball.dy = -this.state.ball.dy;
        }
        if (this.state.ball.y + this.state.ball.radius > this.canvas.height) {
            this.state.lives--;
            if (this.state.lives <= 0) {
                this.endGame();
            } else {
                this.resetBall();
            }
        }
    }
    private checkCollisions(): void {
        if (this.state.ball.y + this.state.ball.radius > this.state.paddle.y &&
            this.state.ball.x > this.state.paddle.x &&
            this.state.ball.x < this.state.paddle.x + this.state.paddle.width) {
            const hitPos = (this.state.ball.x - this.state.paddle.x) / this.state.paddle.width;
            const angle = (hitPos - 0.5) * Math.PI / 3;
            const speed = Math.sqrt(this.state.ball.dx * this.state.ball.dx + this.state.ball.dy * this.state.ball.dy);
            this.state.ball.dx = speed * Math.sin(angle);
            this.state.ball.dy = -Math.abs(speed * Math.cos(angle));
        }
        for (const brick of this.state.bricks) {
            if (!brick.visible) continue;
            if (this.state.ball.x + this.state.ball.radius > brick.x &&
                this.state.ball.x - this.state.ball.radius < brick.x + brick.width &&
                this.state.ball.y + this.state.ball.radius > brick.y &&
                this.state.ball.y - this.state.ball.radius < brick.y + brick.height) {
                brick.visible = false;
                this.state.ball.dy = -this.state.ball.dy;
                this.state.score += 10;
                break;
            }
        }
    }
    private checkGameState(): void {
        const remainingBricks = this.state.bricks.filter(brick => brick.visible);
        if (remainingBricks.length === 0) {
            this.state.gameWon = true;
            this.state.gameActive = false;
            if (this.gameLoop) {
                cancelAnimationFrame(this.gameLoop);
                this.gameLoop = null;
            }
        }
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
        this.ctx.fillStyle = '#001122';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#00aaff';
        this.ctx.fillRect(this.state.paddle.x, this.state.paddle.y, this.state.paddle.width, this.state.paddle.height);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(this.state.ball.x, this.state.ball.y, this.state.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        for (const brick of this.state.bricks) {
            if (brick.visible) {
                this.ctx.fillStyle = brick.color;
                this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
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
        } else if (this.state.gameWon) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#00ff00';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('YOU WIN!', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '16px Arial';
            this.ctx.fillText(`Final Score: ${this.state.score}`, this.canvas.width / 2, this.canvas.height / 2 + 30);
        }
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
function startBreakoutGame(): void {
    (window as any).breakoutGame?.startGame();
}
function resetBreakoutGame(): void {
    (window as any).breakoutGame?.resetGame();
}
function backToBreakoutMenu(): void {
    const vscode = (window as any).vscode || (window as any).acquireVsCodeApi();
    vscode.postMessage({
        type: 'backToMenu'
    });
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        (window as any).breakoutGame = new BreakoutGame();
        // Auto-start the game after a brief delay
        setTimeout(() => {
            (window as any).breakoutGame.startGame();
        }, 500);
    });
} else {
    (window as any).breakoutGame = new BreakoutGame();
    // Auto-start the game after a brief delay
    setTimeout(() => {
        (window as any).breakoutGame.startGame();
    }, 500);
}
