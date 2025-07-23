interface TetrisPiece {
    shape: number[][];
    x: number;
    y: number;
    color: string;
}
interface TetrisGameState {
    board: string[][];
    currentPiece: TetrisPiece | null;
    nextPiece: TetrisPiece | null;
    score: number;
    lines: number;
    level: number;
    gameActive: boolean;
    gameOver: boolean;
    dropTime: number;
    lastDrop: number;
}
class TetrisGame {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private state: TetrisGameState;
    private vscode: any;
    private gameLoop: number | null = null;
    private keys: { [key: string]: boolean } = {};
    private readonly BOARD_WIDTH = 10;
    private readonly BOARD_HEIGHT = 20;
    private readonly CELL_SIZE = 20;
    private readonly PIECES = [
        { shape: [[1, 1, 1, 1]], color: '#00ffff' },
        { shape: [[1, 1], [1, 1]], color: '#ffff00' },
        { shape: [[0, 1, 0], [1, 1, 1]], color: '#800080' },
        { shape: [[0, 1, 1], [1, 1, 0]], color: '#00ff00' },
        { shape: [[1, 1, 0], [0, 1, 1]], color: '#ff0000' },
        { shape: [[1, 0, 0], [1, 1, 1]], color: '#ff8800' },
        { shape: [[0, 0, 1], [1, 1, 1]], color: '#0000ff' }
    ];
    constructor() {
        this.vscode = (window as any).vscode || (window as any).acquireVsCodeApi();
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.state = {
            board: [],
            currentPiece: null,
            nextPiece: null,
            score: 0,
            lines: 0,
            level: 1,
            gameActive: false,
            gameOver: false,
            dropTime: 1000,
            lastDrop: 0
        };
        this.init();
    }
    private init(): void {
        this.canvas.width = 300;
        this.canvas.height = 400;
        this.setupControls();
        this.initBoard();
        this.updateDisplay();
        this.draw();
    }
    private setupControls(): void {
        document.addEventListener('keydown', (e) => {
            if (!this.state.gameActive) return;
            switch (e.key) {
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    this.movePiece(-1, 0);
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    this.movePiece(1, 0);
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    this.movePiece(0, 1);
                    break;
                case 'ArrowUp':
                case 'w':
                case 'W':
                case ' ':
                    this.rotatePiece();
                    break;
            }
        });
    }
    private initBoard(): void {
        this.state.board = [];
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            this.state.board[y] = [];
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                this.state.board[y][x] = '';
            }
        }
    }
    private createPiece(): TetrisPiece {
        const piece = this.PIECES[Math.floor(Math.random() * this.PIECES.length)];
        return {
            shape: piece.shape.map(row => [...row]),
            x: Math.floor(this.BOARD_WIDTH / 2) - Math.floor(piece.shape[0].length / 2),
            y: 0,
            color: piece.color
        };
    }
    public startGame(): void {
        this.state.gameActive = true;
        this.state.gameOver = false;
        this.state.score = 0;
        this.state.lines = 0;
        this.state.level = 1;
        this.state.dropTime = 1000;
        this.initBoard();
        this.state.currentPiece = this.createPiece();
        this.state.nextPiece = this.createPiece();
        this.updateDisplay();
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
        }
        this.state.lastDrop = Date.now();
        this.gameLoop = requestAnimationFrame(() => this.update());
    }
    public resetGame(): void {
        this.state.gameActive = false;
        this.state.gameOver = false;
        this.state.score = 0;
        this.state.lines = 0;
        this.state.level = 1;
        this.state.dropTime = 1000;
        this.initBoard();
        this.state.currentPiece = null;
        this.state.nextPiece = null;
        this.updateDisplay();
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }
        this.draw();
    }
    private update(): void {
        if (!this.state.gameActive || this.state.gameOver) return;
        const now = Date.now();
        if (now - this.state.lastDrop > this.state.dropTime) {
            this.dropPiece();
            this.state.lastDrop = now;
        }
        this.draw();
        this.updateDisplay();
        this.gameLoop = requestAnimationFrame(() => this.update());
    }
    private dropPiece(): void {
        if (!this.state.currentPiece) return;
        if (this.canMovePiece(this.state.currentPiece, 0, 1)) {
            this.state.currentPiece.y++;
        } else {
            this.lockPiece();
            this.clearLines();
            this.spawnNewPiece();
        }
    }
    private movePiece(dx: number, dy: number): void {
        if (!this.state.currentPiece) return;
        if (this.canMovePiece(this.state.currentPiece, dx, dy)) {
            this.state.currentPiece.x += dx;
            this.state.currentPiece.y += dy;
            this.draw();
        }
    }
    private rotatePiece(): void {
        if (!this.state.currentPiece) return;
        const rotated = this.rotateMatrix(this.state.currentPiece.shape);
        const originalShape = this.state.currentPiece.shape;
        this.state.currentPiece.shape = rotated;
        if (!this.canMovePiece(this.state.currentPiece, 0, 0)) {
            this.state.currentPiece.shape = originalShape;
        } else {
            this.draw();
        }
    }
    private rotateMatrix(matrix: number[][]): number[][] {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const rotated: number[][] = [];
        for (let i = 0; i < cols; i++) {
            rotated[i] = [];
            for (let j = 0; j < rows; j++) {
                rotated[i][j] = matrix[rows - 1 - j][i];
            }
        }
        return rotated;
    }
    private canMovePiece(piece: TetrisPiece, dx: number, dy: number): boolean {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    const newX = piece.x + x + dx;
                    const newY = piece.y + y + dy;
                    if (newX < 0 || newX >= this.BOARD_WIDTH ||
                        newY >= this.BOARD_HEIGHT ||
                        (newY >= 0 && this.state.board[newY][newX])) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    private lockPiece(): void {
        if (!this.state.currentPiece) return;
        for (let y = 0; y < this.state.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.state.currentPiece.shape[y].length; x++) {
                if (this.state.currentPiece.shape[y][x]) {
                    const boardY = this.state.currentPiece.y + y;
                    const boardX = this.state.currentPiece.x + x;
                    if (boardY >= 0 && boardY < this.BOARD_HEIGHT &&
                        boardX >= 0 && boardX < this.BOARD_WIDTH) {
                        this.state.board[boardY][boardX] = this.state.currentPiece.color;
                    }
                }
            }
        }
    }
    private clearLines(): void {
        let linesCleared = 0;
        for (let y = this.BOARD_HEIGHT - 1; y >= 0; y--) {
            if (this.state.board[y].every(cell => cell !== '')) {
                this.state.board.splice(y, 1);
                this.state.board.unshift(new Array(this.BOARD_WIDTH).fill(''));
                linesCleared++;
                y++;
            }
        }
        if (linesCleared > 0) {
            this.state.lines += linesCleared;
            this.state.score += linesCleared * 100 * this.state.level;
            this.state.level = Math.floor(this.state.lines / 10) + 1;
            this.state.dropTime = Math.max(100, 1000 - (this.state.level - 1) * 100);
        }
    }
    private spawnNewPiece(): void {
        this.state.currentPiece = this.state.nextPiece;
        this.state.nextPiece = this.createPiece();
        if (this.state.currentPiece && !this.canMovePiece(this.state.currentPiece, 0, 0)) {
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
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (this.state.board[y][x]) {
                    this.ctx.fillStyle = this.state.board[y][x];
                    this.ctx.fillRect(x * this.CELL_SIZE, y * this.CELL_SIZE, this.CELL_SIZE, this.CELL_SIZE);
                    this.ctx.strokeStyle = '#ffffff';
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(x * this.CELL_SIZE, y * this.CELL_SIZE, this.CELL_SIZE, this.CELL_SIZE);
                }
            }
        }
        if (this.state.currentPiece) {
            this.ctx.fillStyle = this.state.currentPiece.color;
            for (let y = 0; y < this.state.currentPiece.shape.length; y++) {
                for (let x = 0; x < this.state.currentPiece.shape[y].length; x++) {
                    if (this.state.currentPiece.shape[y][x]) {
                        const drawX = (this.state.currentPiece.x + x) * this.CELL_SIZE;
                        const drawY = (this.state.currentPiece.y + y) * this.CELL_SIZE;
                        this.ctx.fillRect(drawX, drawY, this.CELL_SIZE, this.CELL_SIZE);
                        this.ctx.strokeStyle = '#ffffff';
                        this.ctx.lineWidth = 1;
                        this.ctx.strokeRect(drawX, drawY, this.CELL_SIZE, this.CELL_SIZE);
                    }
                }
            }
        }
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 0.5;
        for (let x = 0; x <= this.BOARD_WIDTH; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.CELL_SIZE, 0);
            this.ctx.lineTo(x * this.CELL_SIZE, this.BOARD_HEIGHT * this.CELL_SIZE);
            this.ctx.stroke();
        }
        for (let y = 0; y <= this.BOARD_HEIGHT; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.CELL_SIZE);
            this.ctx.lineTo(this.BOARD_WIDTH * this.CELL_SIZE, y * this.CELL_SIZE);
            this.ctx.stroke();
        }
        if (this.state.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#ff0000';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '14px Arial';
            this.ctx.fillText(`Score: ${this.state.score}`, this.canvas.width / 2, this.canvas.height / 2 + 25);
            this.ctx.fillText(`Lines: ${this.state.lines}`, this.canvas.width / 2, this.canvas.height / 2 + 45);
        }
    }
    private updateDisplay(): void {
        const scoreEl = document.getElementById('score');
        const linesEl = document.getElementById('lines');
        const levelEl = document.getElementById('level');
        if (scoreEl) scoreEl.textContent = this.state.score.toString();
        if (linesEl) linesEl.textContent = this.state.lines.toString();
        if (levelEl) levelEl.textContent = this.state.level.toString();
    }
}
function startTetrisGame(): void {
    (window as any).tetrisGame?.startGame();
}
function resetTetrisGame(): void {
    (window as any).tetrisGame?.resetGame();
}
function backToTetrisMenu(): void {
    const vscode = (window as any).vscode || (window as any).acquireVsCodeApi();
    vscode.postMessage({
        type: 'backToMenu'
    });
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        (window as any).tetrisGame = new TetrisGame();
    });
} else {
    (window as any).tetrisGame = new TetrisGame();
}
