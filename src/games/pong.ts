interface PongPaddle {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
}
interface PongBall {
    x: number;
    y: number;
    radius: number;
    velocity: { x: number; y: number };
}
interface PongGameState {
    playerPaddle: PongPaddle;
    aiPaddle: PongPaddle;
    ball: PongBall;
    playerScore: number;
    aiScore: number;
    gameActive: boolean;
    gameOver: boolean;
    winScore: number;
    difficulty: number;
}
class PongGame {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private state: PongGameState;
    private vscode: any;
    private gameLoop: number | null = null;
    private keys: { [key: string]: boolean } = {};
    private readonly CANVAS_WIDTH = 400;
    private readonly CANVAS_HEIGHT = 300;
    constructor() {
        this.vscode = (window as any).vscode || (window as any).acquireVsCodeApi();
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.state = {
            playerPaddle: { x: 20, y: 125, width: 10, height: 50, speed: 5 },
            aiPaddle: { x: 370, y: 125, width: 10, height: 50, speed: 3 },
            ball: { x: 200, y: 150, radius: 8, velocity: { x: 3, y: 2 } },
            playerScore: 0,
            aiScore: 0,
            gameActive: false,
            gameOver: false,
            winScore: 5,
            difficulty: 1
        };
        this.init();
    }
    private init(): void {
        this.canvas.width = this.CANVAS_WIDTH;
        this.canvas.height = this.CANVAS_HEIGHT;
        this.setupControls();
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
            const mouseY = e.clientY - rect.top;
            this.state.playerPaddle.y = Math.max(0, Math.min(this.CANVAS_HEIGHT - this.state.playerPaddle.height, mouseY - this.state.playerPaddle.height / 2));
        });
        this.canvas.addEventListener('touchmove', (e) => {
            if (!this.state.gameActive) return;
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const touchY = touch.clientY - rect.top;
            this.state.playerPaddle.y = Math.max(0, Math.min(this.CANVAS_HEIGHT - this.state.playerPaddle.height, touchY - this.state.playerPaddle.height / 2));
        });
    }
    public startGame(): void {
        this.state.gameActive = true;
        this.state.gameOver = false;
        this.state.playerScore = 0;
        this.state.aiScore = 0;
        this.resetBall();
        this.updateDisplay();
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
        }
        this.gameLoop = requestAnimationFrame(() => this.update());
    }
    public resetGame(): void {
        this.state.gameActive = false;
        this.state.gameOver = false;
        this.state.playerScore = 0;
        this.state.aiScore = 0;
        this.resetBall();
        this.updateDisplay();
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }
        this.draw();
    }
    private resetBall(): void {
        this.state.ball.x = this.CANVAS_WIDTH / 2;
        this.state.ball.y = this.CANVAS_HEIGHT / 2;
        const direction = Math.random() < 0.5 ? -1 : 1;
        const speed = 3 + this.state.difficulty * 0.5;
        this.state.ball.velocity.x = direction * speed;
        this.state.ball.velocity.y = (Math.random() - 0.5) * speed;
    }
    private update(): void {
        if (!this.state.gameActive || this.state.gameOver) return;
        this.updatePlayer();
        this.updateAI();
        this.updateBall();
        this.checkCollisions();
        this.checkScore();
        this.draw();
        this.updateDisplay();
        this.gameLoop = requestAnimationFrame(() => this.update());
    }
    private updatePlayer(): void {
        const paddle = this.state.playerPaddle;
        if (this.keys['w'] || this.keys['arrowup']) {
            paddle.y = Math.max(0, paddle.y - paddle.speed);
        }
        if (this.keys['s'] || this.keys['arrowdown']) {
            paddle.y = Math.min(this.CANVAS_HEIGHT - paddle.height, paddle.y + paddle.speed);
        }
    }
    private updateAI(): void {
        const paddle = this.state.aiPaddle;
        const ball = this.state.ball;
        const paddleCenter = paddle.y + paddle.height / 2;
        const ballY = ball.y;
        if (paddleCenter < ballY - 10) {
            paddle.y = Math.min(this.CANVAS_HEIGHT - paddle.height, paddle.y + paddle.speed);
        } else if (paddleCenter > ballY + 10) {
            paddle.y = Math.max(0, paddle.y - paddle.speed);
        }
    }
    private updateBall(): void {
        const ball = this.state.ball;
        ball.x += ball.velocity.x;
        ball.y += ball.velocity.y;
        if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= this.CANVAS_HEIGHT) {
            ball.velocity.y = -ball.velocity.y;
        }
    }
    private checkCollisions(): void {
        const ball = this.state.ball;
        const playerPaddle = this.state.playerPaddle;
        const aiPaddle = this.state.aiPaddle;
        if (ball.x - ball.radius <= playerPaddle.x + playerPaddle.width &&
            ball.x + ball.radius >= playerPaddle.x &&
            ball.y >= playerPaddle.y &&
            ball.y <= playerPaddle.y + playerPaddle.height &&
            ball.velocity.x < 0) {
            ball.velocity.x = -ball.velocity.x;
            const hitPos = (ball.y - playerPaddle.y) / playerPaddle.height;
            ball.velocity.y = (hitPos - 0.5) * 8;
        }
        if (ball.x + ball.radius >= aiPaddle.x &&
            ball.x - ball.radius <= aiPaddle.x + aiPaddle.width &&
            ball.y >= aiPaddle.y &&
            ball.y <= aiPaddle.y + aiPaddle.height &&
            ball.velocity.x > 0) {
            ball.velocity.x = -ball.velocity.x;
            const hitPos = (ball.y - aiPaddle.y) / aiPaddle.height;
            ball.velocity.y = (hitPos - 0.5) * 8;
        }
    }
    private checkScore(): void {
        const ball = this.state.ball;
        if (ball.x < 0) {
            this.state.aiScore++;
            this.resetBall();
        } else if (ball.x > this.CANVAS_WIDTH) {
            this.state.playerScore++;
            this.resetBall();
        }
        if (this.state.playerScore >= this.state.winScore || this.state.aiScore >= this.state.winScore) {
            this.endGame();
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
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
        this.ctx.setLineDash([5, 5]);
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.CANVAS_WIDTH / 2, 0);
        this.ctx.lineTo(this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(this.state.playerPaddle.x, this.state.playerPaddle.y, this.state.playerPaddle.width, this.state.playerPaddle.height);
        this.ctx.fillRect(this.state.aiPaddle.x, this.state.aiPaddle.y, this.state.aiPaddle.width, this.state.aiPaddle.height);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(this.state.ball.x, this.state.ball.y, this.state.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.state.playerScore.toString(), this.CANVAS_WIDTH / 4, 40);
        this.ctx.fillText(this.state.aiScore.toString(), (this.CANVAS_WIDTH * 3) / 4, 40);
        if (this.state.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
            const winner = this.state.playerScore >= this.state.winScore ? 'YOU WIN!' : 'AI WINS!';
            this.ctx.fillStyle = this.state.playerScore >= this.state.winScore ? '#00ff00' : '#ff0000';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(winner, this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '14px Arial';
            this.ctx.fillText(`Final Score: ${this.state.playerScore} - ${this.state.aiScore}`, this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 + 30);
        }
    }
    private updateDisplay(): void {
        const playerScoreEl = document.getElementById('playerScore');
        const aiScoreEl = document.getElementById('aiScore');
        if (playerScoreEl) playerScoreEl.textContent = this.state.playerScore.toString();
        if (aiScoreEl) aiScoreEl.textContent = this.state.aiScore.toString();
    }
}
function startPongGame(): void {
    (window as any).pongGame?.startGame();
}
function resetPongGame(): void {
    (window as any).pongGame?.resetGame();
}
function backToPongMenu(): void {
    const vscode = (window as any).vscode || (window as any).acquireVsCodeApi();
    vscode.postMessage({
        type: 'backToMenu'
    });
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        (window as any).pongGame = new PongGame();
    });
} else {
    (window as any).pongGame = new PongGame();
}
