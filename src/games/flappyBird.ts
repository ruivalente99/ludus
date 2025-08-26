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
    private readonly BIRD_SIZE = 15;
    
    // VS Code theme colors - will be set dynamically
    private backgroundColor: string = '';
    private birdColor: string = '';
    private pipeColor: string = '';
    private textColor: string = '';
    constructor() {
        this.init();
    }
    private init(): void {
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.initThemeColors();
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
    private initThemeColors(): void {
        // Get computed styles from document root to access CSS custom properties
        const rootStyles = getComputedStyle(document.documentElement);
        
        // Use VS Code theme colors
        this.backgroundColor = rootStyles.getPropertyValue('--vscode-editor-background').trim() || '#1e1e1e';
        this.birdColor = rootStyles.getPropertyValue('--vscode-foreground').trim() || '#cccccc';
        this.pipeColor = rootStyles.getPropertyValue('--vscode-input-border').trim() || '#6f6f6f';
        this.textColor = rootStyles.getPropertyValue('--vscode-foreground').trim() || '#cccccc';
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
        const maxHeight = this.canvas.height - this.PIPE_GAP - minHeight;
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
        // Check bounds - top and bottom of canvas
        if (bird.y + bird.radius > this.canvas.height || bird.y - bird.radius < 0) {
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
        // Clean background - solid color
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Simple pipes - just rectangles, no caps
        this.ctx.fillStyle = this.pipeColor;
        this.state.pipes.forEach(pipe => {
            this.ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);
            this.ctx.fillRect(pipe.x, pipe.bottomY, pipe.width, this.canvas.height - pipe.bottomY);
        });
        
        this.drawBird();
        
        if (!this.state.gameStarted) {
            // Semi-transparent overlay using theme colors
            const bgColor = this.backgroundColor;
            // Extract RGB values from hex color and create rgba
            const r = parseInt(bgColor.slice(1, 3), 16);
            const g = parseInt(bgColor.slice(3, 5), 16);
            const b = parseInt(bgColor.slice(5, 7), 16);
            this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.85)`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = this.textColor;
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Click or Press SPACE to Start', this.canvas.width / 2, this.canvas.height / 2);
        }
    }
    private drawBird(): void {
        const bird = this.state.bird;
        
        // Simple circle - no rotation, no details
        this.ctx.fillStyle = this.birdColor;
        this.ctx.beginPath();
        this.ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
        this.ctx.fill();
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
    // Flappy Bird uses press-to-start (click or space)
});
