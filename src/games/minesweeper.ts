interface MinesweeperCell {
    isMine: boolean;
    isRevealed: boolean;
    isFlagged: boolean;
    neighborMines: number;
    x: number;
    y: number;
}
interface MinesweeperGameState {
    board: MinesweeperCell[][];
    width: number;
    height: number;
    mineCount: number;
    flaggedCount: number;
    revealedCount: number;
    gameActive: boolean;
    gameOver: boolean;
    gameWon: boolean;
    firstClick: boolean;
    startTime: number;
    elapsedTime: number;
    remainingFlags: number;
}
class MinesweeperGame {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private state: MinesweeperGameState;
    private vscode: any;
    private cellSize: number = 25;
    private gameTimer: number | null = null;
    constructor() {
        this.vscode = (window as any).vscode || (window as any).acquireVsCodeApi();
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.state = {
            board: [],
            width: 16,
            height: 16,
            mineCount: 40,
            flaggedCount: 0,
            revealedCount: 0,
            gameActive: false,
            gameOver: false,
            gameWon: false,
            firstClick: true,
            startTime: 0,
            elapsedTime: 0,
            remainingFlags: 40
        };
        this.init();
    }
    private init(): void {
        this.canvas.width = this.state.width * this.cellSize;
        this.canvas.height = this.state.height * this.cellSize;
        this.setupControls();
        this.initBoard();
        this.updateDisplay();
        this.draw();
    }
    private setupControls(): void {
        this.canvas.addEventListener('click', (e) => {
            if (!this.state.gameActive && !this.state.firstClick) return;
            const rect = this.canvas.getBoundingClientRect();
            const x = Math.floor((e.clientX - rect.left) / this.cellSize);
            const y = Math.floor((e.clientY - rect.top) / this.cellSize);
            this.revealCell(x, y);
        });
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (!this.state.gameActive) return;
            const rect = this.canvas.getBoundingClientRect();
            const x = Math.floor((e.clientX - rect.left) / this.cellSize);
            const y = Math.floor((e.clientY - rect.top) / this.cellSize);
            this.toggleFlag(x, y);
        });
    }
    private initBoard(): void {
        this.state.board = [];
        for (let y = 0; y < this.state.height; y++) {
            this.state.board[y] = [];
            for (let x = 0; x < this.state.width; x++) {
                this.state.board[y][x] = {
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    neighborMines: 0,
                    x: x,
                    y: y
                };
            }
        }
    }
    private placeMines(excludeX: number, excludeY: number): void {
        let minesPlaced = 0;
        while (minesPlaced < this.state.mineCount) {
            const x = Math.floor(Math.random() * this.state.width);
            const y = Math.floor(Math.random() * this.state.height);
            if ((x === excludeX && y === excludeY) || this.state.board[y][x].isMine) {
                continue;
            }
            this.state.board[y][x].isMine = true;
            minesPlaced++;
        }
        this.calculateNumbers();
    }
    private calculateNumbers(): void {
        for (let y = 0; y < this.state.height; y++) {
            for (let x = 0; x < this.state.width; x++) {
                if (!this.state.board[y][x].isMine) {
                    this.state.board[y][x].neighborMines = this.countNeighborMines(x, y);
                }
            }
        }
    }
    private countNeighborMines(x: number, y: number): number {
        let count = 0;
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < this.state.width && ny >= 0 && ny < this.state.height) {
                    if (this.state.board[ny][nx].isMine) {
                        count++;
                    }
                }
            }
        }
        return count;
    }
    public startGame(): void {
        this.state.gameActive = true;
        this.state.gameOver = false;
        this.state.gameWon = false;
        this.state.firstClick = true;
        this.state.flaggedCount = 0;
        this.state.revealedCount = 0;
        this.state.remainingFlags = this.state.mineCount;
        this.state.startTime = Date.now();
        this.state.elapsedTime = 0;
        this.initBoard();
        this.startTimer();
        this.updateDisplay();
        this.draw();
    }
    public resetGame(): void {
        this.stopTimer();
        this.state.gameActive = false;
        this.state.gameOver = false;
        this.state.gameWon = false;
        this.state.firstClick = true;
        this.state.flaggedCount = 0;
        this.state.revealedCount = 0;
        this.state.remainingFlags = this.state.mineCount;
        this.state.elapsedTime = 0;
        this.initBoard();
        this.updateDisplay();
        this.draw();
    }
    private startTimer(): void {
        this.stopTimer();
        this.gameTimer = window.setInterval(() => {
            if (this.state.gameActive) {
                this.state.elapsedTime = Math.floor((Date.now() - this.state.startTime) / 1000);
                this.updateDisplay();
            }
        }, 1000);
    }
    private stopTimer(): void {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
    }
    private revealCell(x: number, y: number): void {
        if (x < 0 || x >= this.state.width || y < 0 || y >= this.state.height) return;
        const cell = this.state.board[y][x];
        if (cell.isRevealed || cell.isFlagged || !this.state.gameActive) return;
        if (this.state.firstClick) {
            this.placeMines(x, y);
            this.state.firstClick = false;
            this.state.gameActive = true;
        }
        cell.isRevealed = true;
        this.state.revealedCount++;
        if (cell.isMine) {
            this.gameOver();
            this.draw();
            this.updateDisplay();
            return;
        }
        if (cell.neighborMines === 0) {
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dx === 0 && dy === 0) continue;
                    this.revealCell(x + dx, y + dy);
                }
            }
        }
        this.checkWin();
        this.draw();
        this.updateDisplay();
    }
    private toggleFlag(x: number, y: number): void {
        if (x < 0 || x >= this.state.width || y < 0 || y >= this.state.height) return;
        const cell = this.state.board[y][x];
        if (cell.isRevealed || !this.state.gameActive) return;
        if (!cell.isFlagged && this.state.remainingFlags <= 0) return;
        cell.isFlagged = !cell.isFlagged;
        this.state.flaggedCount += cell.isFlagged ? 1 : -1;
        this.state.remainingFlags = this.state.mineCount - this.state.flaggedCount;
        this.draw();
        this.updateDisplay();
    }
    private checkWin(): void {
        const totalCells = this.state.width * this.state.height;
        if (this.state.revealedCount === totalCells - this.state.mineCount) {
            this.state.gameWon = true;
            this.state.gameActive = false;
            this.stopTimer();
            for (let y = 0; y < this.state.height; y++) {
                for (let x = 0; x < this.state.width; x++) {
                    const cell = this.state.board[y][x];
                    if (cell.isMine && !cell.isFlagged) {
                        cell.isFlagged = true;
                        this.state.flaggedCount++;
                    }
                }
            }
            this.state.remainingFlags = 0;
        }
    }
    private gameOver(): void {
        this.state.gameOver = true;
        this.state.gameActive = false;
        this.stopTimer();
        for (let y = 0; y < this.state.height; y++) {
            for (let x = 0; x < this.state.width; x++) {
                const cell = this.state.board[y][x];
                if (cell.isMine && !cell.isFlagged) {
                    cell.isRevealed = true;
                }
            }
        }
    }
    private draw(): void {
        this.ctx.fillStyle = '#c0c0c0';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        for (let y = 0; y < this.state.height; y++) {
            for (let x = 0; x < this.state.width; x++) {
                this.drawCell(this.state.board[y][x]);
            }
        }
        if (this.state.gameOver || this.state.gameWon) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            const msgWidth = 300;
            const msgHeight = 120;
            const msgX = (this.canvas.width - msgWidth) / 2;
            const msgY = (this.canvas.height - msgHeight) / 2;
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(msgX, msgY, msgWidth, msgHeight);
            this.ctx.strokeStyle = '#333333';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(msgX, msgY, msgWidth, msgHeight);
            this.ctx.fillStyle = this.state.gameWon ? '#00aa00' : '#aa0000';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            const message = this.state.gameWon ? 'YOU WIN!' : 'GAME OVER!';
            this.ctx.fillText(message, this.canvas.width / 2, msgY + 40);
            this.ctx.fillStyle = '#333333';
            this.ctx.font = '16px Arial';
            const timeText = `Time: ${this.formatTime(this.state.elapsedTime)}`;
            this.ctx.fillText(timeText, this.canvas.width / 2, msgY + 70);
            this.ctx.font = '12px Arial';
            this.ctx.fillText('Click "Start Game" to play again', this.canvas.width / 2, msgY + 95);
        }
    }
    private drawCell(cell: MinesweeperCell): void {
        const x = cell.x * this.cellSize;
        const y = cell.y * this.cellSize;
        if (cell.isRevealed) {
            if (cell.isMine) {
                this.ctx.fillStyle = this.state.gameOver ? '#ff4444' : '#ffffff';
                this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
                this.ctx.fillStyle = '#000000';
                this.ctx.beginPath();
                this.ctx.arc(x + this.cellSize / 2, y + this.cellSize / 2, 8, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.strokeStyle = '#000000';
                this.ctx.lineWidth = 2;
                const centerX = x + this.cellSize / 2;
                const centerY = y + this.cellSize / 2;
                for (let i = 0; i < 8; i++) {
                    const angle = (i * Math.PI) / 4;
                    const startX = centerX + Math.cos(angle) * 4;
                    const startY = centerY + Math.sin(angle) * 4;
                    const endX = centerX + Math.cos(angle) * 10;
                    const endY = centerY + Math.sin(angle) * 10;
                    this.ctx.beginPath();
                    this.ctx.moveTo(startX, startY);
                    this.ctx.lineTo(endX, endY);
                    this.ctx.stroke();
                }
            } else {
                this.ctx.fillStyle = '#f0f0f0';
                this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
                if (cell.neighborMines > 0) {
                    this.ctx.fillStyle = this.getNumberColor(cell.neighborMines);
                    this.ctx.font = 'bold 14px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText(
                        cell.neighborMines.toString(),
                        x + this.cellSize / 2,
                        y + this.cellSize / 2 + 5
                    );
                }
            }
        } else {
            this.ctx.fillStyle = '#c8c8c8';
            this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(x, y, this.cellSize - 1, 2);
            this.ctx.fillRect(x, y, 2, this.cellSize - 1);
            this.ctx.fillStyle = '#808080';
            this.ctx.fillRect(x + this.cellSize - 2, y + 2, 2, this.cellSize - 2);
            this.ctx.fillRect(x + 2, y + this.cellSize - 2, this.cellSize - 2, 2);
            if (cell.isFlagged) {
                this.ctx.fillStyle = '#8B4513';
                this.ctx.fillRect(x + this.cellSize / 2 - 1, y + 4, 2, this.cellSize - 8);
                this.ctx.fillStyle = '#ff0000';
                this.ctx.beginPath();
                this.ctx.moveTo(x + this.cellSize / 2 + 1, y + 4);
                this.ctx.lineTo(x + this.cellSize - 4, y + 6);
                this.ctx.lineTo(x + this.cellSize / 2 + 1, y + 10);
                this.ctx.closePath();
                this.ctx.fill();
            }
        }
        if (this.state.gameOver && cell.isFlagged && !cell.isMine) {
            this.ctx.strokeStyle = '#ff0000';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(x + 3, y + 3);
            this.ctx.lineTo(x + this.cellSize - 3, y + this.cellSize - 3);
            this.ctx.moveTo(x + this.cellSize - 3, y + 3);
            this.ctx.lineTo(x + 3, y + this.cellSize - 3);
            this.ctx.stroke();
        }
        this.ctx.strokeStyle = '#666666';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, this.cellSize, this.cellSize);
    }
    private getNumberColor(num: number): string {
        const colors = ['', '#0000ff', '#008000', '#ff0000', '#800080', '#800000', '#008080', '#000000', '#808080'];
        return colors[num] || '#000000';
    }
    private formatTime(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    private updateDisplay(): void {
        const minesEl = document.getElementById('mines');
        const flaggedEl = document.getElementById('flagged');
        const remainingEl = document.getElementById('remaining');
        const timerEl = document.getElementById('timer');
        if (minesEl) minesEl.textContent = this.state.mineCount.toString();
        if (flaggedEl) flaggedEl.textContent = this.state.flaggedCount.toString();
        if (remainingEl) remainingEl.textContent = this.state.remainingFlags.toString();
        if (timerEl) timerEl.textContent = this.formatTime(this.state.elapsedTime);
    }
}
function startMinesweeperGame(): void {
    (window as any).minesweeperGame?.startGame();
}
function resetMinesweeperGame(): void {
    (window as any).minesweeperGame?.resetGame();
}
function backToMinesweeperMenu(): void {
    const vscode = (window as any).vscode || (window as any).acquireVsCodeApi();
    vscode.postMessage({
        type: 'backToMenu'
    });
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        (window as any).minesweeperGame = new MinesweeperGame();
    });
} else {
    (window as any).minesweeperGame = new MinesweeperGame();
}
