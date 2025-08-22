interface BlocksGameState {
    grid: number[][];
    currentPiece: BlockPiece | null;
    nextPiece: BlockPiece;
    score: number;
    level: number;
    lines: number;
    gameRunning: boolean;
    fallTimer: number;
    fallSpeed: number;
}
interface BlockPiece {
    shape: number[][];
    x: number;
    y: number;
    color: number;
}
class BlocksGame {
    private state!: BlocksGameState;
    private vscode: any;
    private gameInterval?: number;
    private readonly GRID_WIDTH = 10;
    private readonly GRID_HEIGHT = 20;
    private readonly pieces = [
        [[1, 1, 1, 1]],
        [[1, 1], [1, 1]],
        [[0, 1, 0], [1, 1, 1]],
        [[0, 1, 1], [1, 1, 0]],
        [[1, 1, 0], [0, 1, 1]],
        [[1, 0, 0], [1, 1, 1]],
        [[0, 0, 1], [1, 1, 1]]
    ];
    private readonly colors = [
        '#000000', '#ff0000', '#00ff00', '#0000ff',
        '#ffff00', '#ff00ff', '#00ffff', '#ffffff'
    ];
    constructor() {
        this.vscode = (window as any).vscode || (window as any).acquireVsCodeApi();
        this.init();
    }
    private init(): void {
        this.state = {
            grid: Array(this.GRID_HEIGHT).fill(null).map(() => Array(this.GRID_WIDTH).fill(0)),
            currentPiece: null,
            nextPiece: this.createPiece(),
            score: 0,
            level: 1,
            lines: 0,
            gameRunning: false,
            fallTimer: 0,
            fallSpeed: 500
        };
        this.setupEventListeners();
        this.draw();
    }
    private setupEventListeners(): void {
        document.addEventListener('keydown', (e) => {
            if (!this.state.gameRunning || !this.state.currentPiece) return;
            switch (e.key) {
                case 'ArrowLeft':
                case 'a':
                    e.preventDefault();
                    this.movePiece(-1, 0);
                    break;
                case 'ArrowRight':
                case 'd':
                    e.preventDefault();
                    this.movePiece(1, 0);
                    break;
                case 'ArrowDown':
                case 's':
                    e.preventDefault();
                    this.movePiece(0, 1);
                    break;
                case 'ArrowUp':
                case 'w':
                    e.preventDefault();
                    this.rotatePiece();
                    break;
                case ' ':
                    e.preventDefault();
                    this.dropPiece();
                    break;
            }
        });
    }
    private createPiece(): BlockPiece {
        const pieceIndex = Math.floor(Math.random() * this.pieces.length);
        return {
            shape: this.pieces[pieceIndex],
            x: Math.floor(this.GRID_WIDTH / 2) - Math.floor(this.pieces[pieceIndex][0].length / 2),
            y: 0,
            color: pieceIndex + 1
        };
    }
    private movePiece(dx: number, dy: number): boolean {
        if (!this.state.currentPiece) return false;
        const newX = this.state.currentPiece.x + dx;
        const newY = this.state.currentPiece.y + dy;
        if (this.isValidPosition(this.state.currentPiece.shape, newX, newY)) {
            this.state.currentPiece.x = newX;
            this.state.currentPiece.y = newY;
            this.draw();
            return true;
        }
        return false;
    }
    private rotatePiece(): void {
        if (!this.state.currentPiece) return;
        const rotated = this.rotateMatrix(this.state.currentPiece.shape);
        if (this.isValidPosition(rotated, this.state.currentPiece.x, this.state.currentPiece.y)) {
            this.state.currentPiece.shape = rotated;
            this.draw();
        }
    }
    private rotateMatrix(matrix: number[][]): number[][] {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const rotated = Array(cols).fill(null).map(() => Array(rows).fill(0));
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                rotated[j][rows - 1 - i] = matrix[i][j];
            }
        }
        return rotated;
    }
    private dropPiece(): void {
        if (!this.state.currentPiece) return;
        while (this.movePiece(0, 1)) {
        }
    }
    private isValidPosition(shape: number[][], x: number, y: number): boolean {
        for (let i = 0; i < shape.length; i++) {
            for (let j = 0; j < shape[i].length; j++) {
                if (shape[i][j]) {
                    const newX = x + j;
                    const newY = y + i;
                    if (newX < 0 || newX >= this.GRID_WIDTH ||
                        newY >= this.GRID_HEIGHT ||
                        (newY >= 0 && this.state.grid[newY][newX])) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    private placePiece(): void {
        if (!this.state.currentPiece) return;
        const { shape, x, y, color } = this.state.currentPiece;
        for (let i = 0; i < shape.length; i++) {
            for (let j = 0; j < shape[i].length; j++) {
                if (shape[i][j]) {
                    this.state.grid[y + i][x + j] = color;
                }
            }
        }
        this.clearLines();
        this.spawnNewPiece();
    }
    private clearLines(): void {
        let linesCleared = 0;
        for (let i = this.GRID_HEIGHT - 1; i >= 0; i--) {
            if (this.state.grid[i].every(cell => cell !== 0)) {
                this.state.grid.splice(i, 1);
                this.state.grid.unshift(Array(this.GRID_WIDTH).fill(0));
                linesCleared++;
                i++;
            }
        }
        if (linesCleared > 0) {
            this.state.lines += linesCleared;
            this.state.score += linesCleared * 100 * this.state.level;
            this.state.level = Math.floor(this.state.lines / 10) + 1;
            this.state.fallSpeed = Math.max(50, 500 - (this.state.level - 1) * 50);
            this.updateUI();
        }
    }
    private spawnNewPiece(): void {
        this.state.currentPiece = this.state.nextPiece;
        this.state.nextPiece = this.createPiece();
        if (!this.isValidPosition(this.state.currentPiece.shape, this.state.currentPiece.x, this.state.currentPiece.y)) {
            this.gameOver();
        }
    }
    private update(): void {
        if (!this.state.gameRunning) return;
        this.state.fallTimer += 16;
        if (this.state.fallTimer >= this.state.fallSpeed) {
            this.state.fallTimer = 0;
            if (!this.movePiece(0, 1)) {
                this.placePiece();
            }
        }
    }
    private draw(): void {
        const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;
        const cellSize = 20;
        canvas.width = this.GRID_WIDTH * cellSize;
        canvas.height = this.GRID_HEIGHT * cellSize;
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#333333';
        for (let i = 0; i <= this.GRID_WIDTH; i++) {
            ctx.beginPath();
            ctx.moveTo(i * cellSize, 0);
            ctx.lineTo(i * cellSize, canvas.height);
            ctx.stroke();
        }
        for (let i = 0; i <= this.GRID_HEIGHT; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * cellSize);
            ctx.lineTo(canvas.width, i * cellSize);
            ctx.stroke();
        }
        for (let i = 0; i < this.GRID_HEIGHT; i++) {
            for (let j = 0; j < this.GRID_WIDTH; j++) {
                if (this.state.grid[i][j]) {
                    ctx.fillStyle = this.colors[this.state.grid[i][j]];
                    ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
                }
            }
        }
        if (this.state.currentPiece) {
            const { shape, x, y, color } = this.state.currentPiece;
            ctx.fillStyle = this.colors[color];
            for (let i = 0; i < shape.length; i++) {
                for (let j = 0; j < shape[i].length; j++) {
                    if (shape[i][j]) {
                        ctx.fillRect((x + j) * cellSize, (y + i) * cellSize, cellSize, cellSize);
                    }
                }
            }
        }
    }
    private updateUI(): void {
        const scoreEl = document.getElementById('score');
        const levelEl = document.getElementById('level');
        const linesEl = document.getElementById('lines');
        if (scoreEl) scoreEl.textContent = this.state.score.toString();
        if (levelEl) levelEl.textContent = this.state.level.toString();
        if (linesEl) linesEl.textContent = this.state.lines.toString();
    }
    private gameLoop = (): void => {
        this.update();
        this.draw();
        if (this.state.gameRunning) {
            requestAnimationFrame(this.gameLoop);
        }
    };
    private gameOver(): void {
        this.state.gameRunning = false;
        alert(`Game Over! Final Score: ${this.state.score}`);
    }
    public startGame(): void {
        this.state.gameRunning = true;
        this.state.currentPiece = this.state.nextPiece;
        this.state.nextPiece = this.createPiece();
        this.gameLoop();
    }
    public pauseGame(): void {
        this.state.gameRunning = !this.state.gameRunning;
        if (this.state.gameRunning) {
            this.gameLoop();
        }
    }
    public resetGame(): void {
        this.state.gameRunning = false;
        this.state.grid = Array(this.GRID_HEIGHT).fill(null).map(() => Array(this.GRID_WIDTH).fill(0));
        this.state.score = 0;
        this.state.level = 1;
        this.state.lines = 0;
        this.state.fallTimer = 0;
        this.state.fallSpeed = 500;
        this.state.nextPiece = this.createPiece();
        this.state.currentPiece = null;
        this.updateUI();
        this.draw();
    }
    public backToMenu(): void {
        this.state.gameRunning = false;
        this.vscode.postMessage({ type: 'backToMenu' });
    }
}
let blocksGame: BlocksGame;
function startBlocksGame(): void {
    blocksGame.startGame();
}
function pauseBlocksGame(): void {
    blocksGame.pauseGame();
}
function resetBlocksGame(): void {
    blocksGame.resetGame();
}
function backToBlocksMenu(): void {
    blocksGame.backToMenu();
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        blocksGame = new BlocksGame();
        // Auto-start the game after a brief delay
        setTimeout(() => {
            blocksGame.startGame();
        }, 500);
    });
} else {
    blocksGame = new BlocksGame();
    // Auto-start the game after a brief delay
    setTimeout(() => {
        blocksGame.startGame();
    }, 500);
}
