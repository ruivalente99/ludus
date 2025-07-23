interface FlappyBirdState {
    bird: {
        x: number;
        y: number;
        velocity: number;
        radius: number;
    };
    pipes: Array<{
        x: number;
        topHeight: number;
        bottomY: number;
        width: number;
        gap: number;
        passed: boolean;
    }>;
    score: number;
    bestScore: number;
    gameRunning: boolean;
    gameOver: boolean;
    gameStarted: boolean;
}
class FlappyBirdGame {
    private canvas!: HTMLCanvasElement;
    private ctx!: CanvasRenderingContext2D;
    private state!: FlappyBirdState;
    private animationId: number = 0;
    private readonly GRAVITY = 0.5;
    private readonly JUMP_FORCE = -8;
    private readonly PIPE_WIDTH = 50;
    private readonly PIPE_GAP = 150;
    private readonly PIPE_SPEED = 2;
    private readonly BIRD_SIZE = 20;
    private readonly BIRD_COLOR = '#FFD700';
    private readonly PIPE_COLOR = '#228B22';
    private readonly GROUND_COLOR = '#8B4513';
    constructor() {
        this.init();
    }
    private init(): void {
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.state = {
            bird: {
                x: 80,
                y: this.canvas.height / 2,
                velocity: 0,
                radius: this.BIRD_SIZE
            },
            pipes: [],
            score: 0,
            bestScore: parseInt(localStorage.getItem('flappyBirdBest') || '0'),
            gameRunning: false,
            gameOver: false,
            gameStarted: false
        };
        this.setupEventListeners();
        this.updateBestScore();
        this.draw();
    }
    private setupEventListeners(): void {
        this.canvas.addEventListener('click', () => this.jump());
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.jump();
            }
        });
        (window as any).startFlappyGame = () => this.startGame();
        (window as any).resetFlappyGame = () => this.resetGame();
    }
    private jump(): void {
        if (!this.state.gameStarted) {
            this.startGame();
            return;
        }
        if (this.state.gameRunning && !this.state.gameOver) {
            this.state.bird.velocity = this.JUMP_FORCE;
        }
    }
    private startGame(): void {
        this.state.gameStarted = true;
        this.state.gameRunning = true;
        this.state.gameOver = false;
        this.state.score = 0;
        this.state.pipes = [];
        this.state.bird = {
            x: 80,
            y: this.canvas.height / 2,
            velocity: 0,
            radius: this.BIRD_SIZE
        };
        this.updateScore();
        this.hideGameOver();
        this.gameLoop();
    }
    private resetGame(): void {
        this.state.gameStarted = false;
        this.state.gameRunning = false;
        this.state.gameOver = false;
        this.state.score = 0;
        this.state.pipes = [];
        this.state.bird = {
            x: 80,
            y: this.canvas.height / 2,
            velocity: 0,
            radius: this.BIRD_SIZE
        };
        this.updateScore();
        this.hideGameOver();
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.draw();
    }
    private gameLoop(): void {
        if (!this.state.gameRunning) return;
        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }
    private update(): void {
        this.state.bird.velocity += this.GRAVITY;
        this.state.bird.y += this.state.bird.velocity;
        if (this.state.pipes.length === 0 ||
            this.state.pipes[this.state.pipes.length - 1].x < this.canvas.width - 200) {
            this.generatePipe();
        }
        this.state.pipes.forEach((pipe, index) => {
            pipe.x -= this.PIPE_SPEED;
            if (!pipe.passed && pipe.x + pipe.width < this.state.bird.x) {
                pipe.passed = true;
                this.state.score++;
                this.updateScore();
            }
        });
        this.state.pipes = this.state.pipes.filter(pipe => pipe.x + pipe.width > 0);
        this.checkCollisions();
    }
    private generatePipe(): void {
        const minHeight = 50;
        const maxHeight = this.canvas.height - this.PIPE_GAP - minHeight - 100;
        const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
        this.state.pipes.push({
            x: this.canvas.width,
            topHeight: topHeight,
            bottomY: topHeight + this.PIPE_GAP,
            width: this.PIPE_WIDTH,
            gap: this.PIPE_GAP,
            passed: false
        });
    }
    private checkCollisions(): void {
        const bird = this.state.bird;
        if (bird.y + bird.radius > this.canvas.height - 50 || bird.y - bird.radius < 0) {
            this.endGame();
            return;
        }
        for (const pipe of this.state.pipes) {
            if (this.isColliding(bird, pipe)) {
                this.endGame();
                return;
            }
        }
    }
    private isColliding(bird: any, pipe: any): boolean {
        if (bird.x + bird.radius < pipe.x || bird.x - bird.radius > pipe.x + pipe.width) {
            return false;
        }
        if (bird.y - bird.radius < pipe.topHeight) {
            return true;
        }
        if (bird.y + bird.radius > pipe.bottomY) {
            return true;
        }
        return false;
    }
    private endGame(): void {
        this.state.gameRunning = false;
        this.state.gameOver = true;
        if (this.state.score > this.state.bestScore) {
            this.state.bestScore = this.state.score;
            localStorage.setItem('flappyBirdBest', this.state.bestScore.toString());
            this.updateBestScore();
        }
        this.showGameOver();
    }
    private draw(): void {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98FB98');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = this.GROUND_COLOR;
        this.ctx.fillRect(0, this.canvas.height - 50, this.canvas.width, 50);
        this.ctx.fillStyle = this.PIPE_COLOR;
        this.state.pipes.forEach(pipe => {
            this.ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);
            this.ctx.fillRect(pipe.x, pipe.bottomY, pipe.width, this.canvas.height - pipe.bottomY - 50);
            this.ctx.fillRect(pipe.x - 5, pipe.topHeight - 30, pipe.width + 10, 30);
            this.ctx.fillRect(pipe.x - 5, pipe.bottomY, pipe.width + 10, 30);
        });
        this.drawBird();
        if (!this.state.gameStarted) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Click or Press SPACE to Start!', this.canvas.width / 2, this.canvas.height / 2);
        }
    }
    private drawBird(): void {
        const bird = this.state.bird;
        this.ctx.save();
        this.ctx.translate(bird.x, bird.y);
        const rotation = Math.min(Math.max(bird.velocity * 0.1, -0.5), 0.5);
        this.ctx.rotate(rotation);
        this.ctx.fillStyle = this.BIRD_COLOR;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, bird.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.arc(5, -5, 3, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#FFA500';
        this.ctx.beginPath();
        this.ctx.moveTo(bird.radius - 5, 0);
        this.ctx.lineTo(bird.radius + 5, -3);
        this.ctx.lineTo(bird.radius + 5, 3);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
    }
    private updateScore(): void {
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = this.state.score.toString();
        }
    }
    private updateBestScore(): void {
        const bestScoreElement = document.getElementById('bestScore');
        if (bestScoreElement) {
            bestScoreElement.textContent = this.state.bestScore.toString();
        }
    }
    private showGameOver(): void {
        const gameOverElement = document.getElementById('gameOver');
        const finalScoreElement = document.getElementById('finalScore');
        if (gameOverElement && finalScoreElement) {
            finalScoreElement.textContent = this.state.score.toString();
            gameOverElement.style.display = 'block';
        }
    }
    private hideGameOver(): void {
        const gameOverElement = document.getElementById('gameOver');
        if (gameOverElement) {
            gameOverElement.style.display = 'none';
        }
    }
}
window.addEventListener('load', () => {
    new FlappyBirdGame();
});
