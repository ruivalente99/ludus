interface SnakeGameState {
    snake: Array<{ x: number; y: number }>;
    food: { x: number; y: number };
    direction: { x: number; y: number };
    score: number;
    gameActive: boolean;
    gameOver: boolean;
    gameStarted: boolean;
    gridSize: number;
    canvasWidth: number;
    canvasHeight: number;
}
class SnakeGame {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private state: SnakeGameState;
    private vscode: any;
    private gameLoop: NodeJS.Timeout | null = null;
    constructor() {
        this.vscode = (window as any).vscode || (window as any).acquireVsCodeApi();
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.state = {
            snake: [{ x: 10, y: 10 }],
            food: { x: 15, y: 15 },
            direction: { x: 0, y: 0 },
            score: 0,
            gameActive: false,
            gameOver: false,
            gameStarted: false,
            gridSize: 20,
            canvasWidth: 400,
            canvasHeight: 400
        };
        this.init();
    }
    private init(): void {
        this.canvas.width = this.state.canvasWidth;
        this.canvas.height = this.state.canvasHeight;
        this.setupControls();
        this.generateFood();
        this.updateDisplay();
        this.draw();
    }
    private setupControls(): void {
        document.addEventListener('keydown', (e) => {
            // Start game on first movement key if not already active
            if (!this.state.gameActive && !this.state.gameStarted) {
                const movementKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'W', 's', 'S', 'a', 'A', 'd', 'D'];
                if (movementKeys.includes(e.key)) {
                    this.startGame();
                }
            }
            if (!this.state.gameActive) return;
            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    if (this.state.direction.y === 0) {
                        this.state.direction = { x: 0, y: -1 };
                    }
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    if (this.state.direction.y === 0) {
                        this.state.direction = { x: 0, y: 1 };
                    }
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    if (this.state.direction.x === 0) {
                        this.state.direction = { x: -1, y: 0 };
                    }
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    if (this.state.direction.x === 0) {
                        this.state.direction = { x: 1, y: 0 };
                    }
                    break;
            }
        });
        this.canvas.addEventListener('click', (e) => {
            if (!this.state.gameActive) return;
            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            const head = this.state.snake[0];
            const headPixelX = head.x * this.state.gridSize;
            const headPixelY = head.y * this.state.gridSize;
            const deltaX = clickX - headPixelX;
            const deltaY = clickY - headPixelY;
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 0 && this.state.direction.x === 0) {
                    this.state.direction = { x: 1, y: 0 };
                } else if (deltaX < 0 && this.state.direction.x === 0) {
                    this.state.direction = { x: -1, y: 0 };
                }
            } else {
                if (deltaY > 0 && this.state.direction.y === 0) {
                    this.state.direction = { x: 0, y: 1 };
                } else if (deltaY < 0 && this.state.direction.y === 0) {
                    this.state.direction = { x: 0, y: -1 };
                }
            }
        });
    }
    public startGame(): void {
        this.state.gameStarted = true;
        this.state.gameActive = true;
        this.state.gameOver = false;
        this.state.score = 0;
        this.state.snake = [{ x: 10, y: 10 }];
        this.state.direction = { x: 0, y: 0 };
        this.generateFood();
        this.updateDisplay();
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
        this.gameLoop = setInterval(() => this.update(), 150);
    }

    public resetGame(): void {
        this.state.gameStarted = false;
        this.state.gameActive = false;
        this.state.gameOver = false;
        this.state.score = 0;
        this.state.snake = [{ x: 10, y: 10 }];
        this.state.direction = { x: 0, y: 0 };
        this.generateFood();
        this.updateDisplay();
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        this.draw();
    }
    private generateFood(): void {
        const gridWidth = this.state.canvasWidth / this.state.gridSize;
        const gridHeight = this.state.canvasHeight / this.state.gridSize;
        let newFood: { x: number; y: number };
        do {
            newFood = {
                x: Math.floor(Math.random() * gridWidth),
                y: Math.floor(Math.random() * gridHeight)
            };
        } while (this.state.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        this.state.food = newFood;
    }
    private update(): void {
        if (!this.state.gameActive || this.state.gameOver) return;
        if (this.state.direction.x === 0 && this.state.direction.y === 0) return;
        const head = { ...this.state.snake[0] };
        head.x += this.state.direction.x;
        head.y += this.state.direction.y;
        const gridWidth = this.state.canvasWidth / this.state.gridSize;
        const gridHeight = this.state.canvasHeight / this.state.gridSize;
        if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
            this.endGame();
            return;
        }
        if (this.state.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.endGame();
            return;
        }
        this.state.snake.unshift(head);
        if (head.x === this.state.food.x && head.y === this.state.food.y) {
            this.state.score += 10;
            this.generateFood();
        } else {
            this.state.snake.pop();
        }
        this.draw();
        this.updateDisplay();
    }
    private endGame(): void {
        this.state.gameActive = false;
        this.state.gameOver = true;
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        this.draw();
    }
    private draw(): void {
        // Get VS Code theme colors
        const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--vscode-terminal-background') || '#000';
        const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--vscode-panel-border') || '#333';
        const snakeHeadColor = getComputedStyle(document.documentElement).getPropertyValue('--vscode-charts-green') || '#00ff00';
        const snakeBodyColor = getComputedStyle(document.documentElement).getPropertyValue('--vscode-list-activeSelectionBackground') || '#90EE90';
        const foodColor = getComputedStyle(document.documentElement).getPropertyValue('--vscode-charts-red') || '#ff0000';
        
        // Draw background
        this.ctx.fillStyle = bgColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.ctx.strokeStyle = gridColor;
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= this.state.canvasWidth; i += this.state.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.state.canvasHeight);
            this.ctx.stroke();
        }
        for (let i = 0; i <= this.state.canvasHeight; i += this.state.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(this.state.canvasWidth, i);
            this.ctx.stroke();
        }
        
        // Draw snake with theme colors
        this.state.snake.forEach((segment, index) => {
            this.ctx.fillStyle = index === 0 ? snakeHeadColor : snakeBodyColor;
            this.ctx.fillRect(
                segment.x * this.state.gridSize + 1,
                segment.y * this.state.gridSize + 1,
                this.state.gridSize - 2,
                this.state.gridSize - 2
            );
        });
        
        // Draw food with theme color
        this.ctx.fillStyle = foodColor;
        this.ctx.fillRect(
            this.state.food.x * this.state.gridSize + 1,
            this.state.food.y * this.state.gridSize + 1,
            this.state.gridSize - 2,
            this.state.gridSize - 2
        );
        if (this.state.gameOver) {
            // Semi-transparent overlay
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Game over text with theme colors
            const errorColor = getComputedStyle(document.documentElement).getPropertyValue('--vscode-errorForeground') || '#ff0000';
            const foregroundColor = getComputedStyle(document.documentElement).getPropertyValue('--vscode-foreground') || '#ffffff';
            const descriptionColor = getComputedStyle(document.documentElement).getPropertyValue('--vscode-descriptionForeground') || '#cccccc';
            
            this.ctx.fillStyle = errorColor;
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 10);
            
            this.ctx.fillStyle = foregroundColor;
            this.ctx.font = '16px Arial';
            this.ctx.fillText(`Final Score: ${this.state.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
            this.ctx.fillText(`Snake Length: ${this.state.snake.length}`, this.canvas.width / 2, this.canvas.height / 2 + 40);
            
            this.ctx.fillStyle = descriptionColor;
            this.ctx.font = '14px Arial';
            this.ctx.fillText('Press Space to Play Again', this.canvas.width / 2, this.canvas.height / 2 + 65);
        }
    }
    private updateDisplay(): void {
        const scoreEl = document.getElementById('score');
        const lengthEl = document.getElementById('length');
        if (scoreEl) scoreEl.textContent = this.state.score.toString();
        if (lengthEl) lengthEl.textContent = this.state.snake.length.toString();
    }
}
function startSnakeGame(): void {
    (window as any).snakeGame?.startGame();
}
function resetSnakeGame(): void {
    (window as any).snakeGame?.resetGame();
}
function backToSnakeMenu(): void {
    const vscode = (window as any).vscode || (window as any).acquireVsCodeApi();
    vscode.postMessage({
        type: 'backToMenu'
    });
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        (window as any).snakeGame = new SnakeGame();
        // Snake starts on first key press (WASD/Arrow keys)
    });
} else {
    (window as any).snakeGame = new SnakeGame();
    // Snake starts on first key press (WASD/Arrow keys)
}
