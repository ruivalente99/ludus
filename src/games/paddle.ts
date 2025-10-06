interface PaddleGameState {
    ballX: number;
    ballY: number;
    ballVelX: number;
    ballVelY: number;
    paddleX: number;
    paddleY: number;
    paddleWidth: number;
    paddleHeight: number;
    score: number;
    gameRunning: boolean;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
}
class PaddleGame {
    private state!: PaddleGameState;
    private vscode: any;
    private animationId: number = 0;
    private keys: { [key: string]: boolean } = {};
    constructor() {
        this.vscode = (window as any).vscode || (window as any).acquireVsCodeApi();
        this.init();
    }
    private init(): void {
        const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) {
            console.error('Canvas not found');
            return;
        }
        canvas.width = 400;
        canvas.height = 300;
        this.state = {
            ballX: canvas.width / 2,
            ballY: canvas.height / 2,
            ballVelX: 2,
            ballVelY: 2,
            paddleX: canvas.width / 2 - 40,
            paddleY: canvas.height - 20,
            paddleWidth: 80,
            paddleHeight: 10,
            score: 0,
            gameRunning: false,
            canvas,
            ctx
        };
        this.setupEventListeners();
        this.draw();
    }
    private setupEventListeners(): void {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        this.state.canvas.addEventListener('mousemove', (e) => {
            const rect = this.state.canvas.getBoundingClientRect();
            this.state.paddleX = e.clientX - rect.left - this.state.paddleWidth / 2;
        });
    }
    private update(): void {
        if (!this.state.gameRunning) return;
        if (this.keys['ArrowLeft'] || this.keys['a']) {
            this.state.paddleX -= 8;
        }
        if (this.keys['ArrowRight'] || this.keys['d']) {
            this.state.paddleX += 8;
        }
        this.state.paddleX = Math.max(0, Math.min(this.state.canvas.width - this.state.paddleWidth, this.state.paddleX));
        this.state.ballX += this.state.ballVelX;
        this.state.ballY += this.state.ballVelY;
        if (this.state.ballX <= 0 || this.state.ballX >= this.state.canvas.width) {
            this.state.ballVelX = -this.state.ballVelX;
        }
        if (this.state.ballY <= 0) {
            this.state.ballVelY = -this.state.ballVelY;
        }
        if (this.state.ballY + 5 >= this.state.paddleY &&
            this.state.ballX >= this.state.paddleX &&
            this.state.ballX <= this.state.paddleX + this.state.paddleWidth) {
            this.state.ballVelY = -this.state.ballVelY;
            this.state.score += 10;
            this.updateScore();
        }
        if (this.state.ballY > this.state.canvas.height) {
            this.gameOver();
        }
    }
    private draw(): void {
        const { ctx, canvas, ballX, ballY, paddleX, paddleY, paddleWidth, paddleHeight } = this.state;
        
        const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--vscode-editor-background') || '#1e1e1e';
        const ballColor = getComputedStyle(document.documentElement).getPropertyValue('--vscode-foreground') || '#ffffff';
        const paddleColor = getComputedStyle(document.documentElement).getPropertyValue('--vscode-button-background') || '#007acc';
        const textColor = getComputedStyle(document.documentElement).getPropertyValue('--vscode-foreground') || '#ffffff';
        
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = ballColor;
        ctx.beginPath();
        ctx.arc(ballX, ballY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = paddleColor;
        ctx.fillRect(paddleX, paddleY, paddleWidth, paddleHeight);
        ctx.fillStyle = textColor;
        ctx.font = '16px Arial';
        if (!this.state.gameRunning) {
            ctx.fillStyle = textColor;
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Click Start to Play!', canvas.width / 2, canvas.height / 2);
            ctx.textAlign = 'left';
        }
    }
    private gameLoop = (): void => {
        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(this.gameLoop);
    };
    private updateScore(): void {
        const scoreEl = document.getElementById('score');
        if (scoreEl) {
            scoreEl.textContent = this.state.score.toString();
        }
    }
    private gameOver(): void {
        this.state.gameRunning = false;
        alert(`Game Over! Final Score: ${this.state.score}`);
    }
    public startGame(): void {
        this.state.gameRunning = true;
        this.gameLoop();
    }
    public stopGame(): void {
        this.state.gameRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    public resetGame(): void {
        this.stopGame();
        this.state.ballX = this.state.canvas.width / 2;
        this.state.ballY = this.state.canvas.height / 2;
        this.state.ballVelX = 2;
        this.state.ballVelY = 2;
        this.state.paddleX = this.state.canvas.width / 2 - 40;
        this.state.score = 0;
        this.updateScore();
        this.draw();
    }
    public backToMenu(): void {
        this.stopGame();
        this.vscode.postMessage({ type: 'backToMenu' });
    }
}
let paddleGame: PaddleGame;
function startGame(): void {
    paddleGame.startGame();
}
function resetPaddleGame(): void {
    paddleGame.resetGame();
}
function backToPaddleMenu(): void {
    paddleGame.backToMenu();
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        paddleGame = new PaddleGame();
        // Auto-start the game after a brief delay
        setTimeout(() => {
            paddleGame.startGame();
        }, 500);
    });
} else {
    paddleGame = new PaddleGame();
    // Auto-start the game after a brief delay
    setTimeout(() => {
        paddleGame.startGame();
    }, 500);
}
