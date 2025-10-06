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
    hoveredCell: { x: number; y: number } | null;
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
            remainingFlags: 40,
            hoveredCell: null
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
            if (!this.state.gameActive) return;
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
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = Math.floor((e.clientX - rect.left) / this.cellSize);
            const y = Math.floor((e.clientY - rect.top) / this.cellSize);
            
            // Update hovered cell if it changed
            if (!this.state.hoveredCell || this.state.hoveredCell.x !== x || this.state.hoveredCell.y !== y) {
                if (x >= 0 && x < this.state.width && y >= 0 && y < this.state.height) {
                    this.state.hoveredCell = { x, y };
                } else {
                    this.state.hoveredCell = null;
                }
                this.draw(); // Redraw to show hover effect
            }
        });
        this.canvas.addEventListener('mouseleave', () => {
            this.state.hoveredCell = null;
            this.draw(); // Remove hover effect
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
        const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--vscode-button-secondaryBackground') || '#c0c0c0';
        const dialogBgColor = getComputedStyle(document.documentElement).getPropertyValue('--vscode-input-background') || '#ffffff';
        const dialogBorderColor = getComputedStyle(document.documentElement).getPropertyValue('--vscode-contrastBorder') || '#333333';
        const winColor = getComputedStyle(document.documentElement).getPropertyValue('--vscode-charts-green') || '#00aa00';
        const loseColor = getComputedStyle(document.documentElement).getPropertyValue('--vscode-errorForeground') || '#aa0000';
        const textColor = getComputedStyle(document.documentElement).getPropertyValue('--vscode-foreground') || '#333333';
        
        this.ctx.fillStyle = bgColor;
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
            this.ctx.fillStyle = dialogBgColor;
            this.ctx.fillRect(msgX, msgY, msgWidth, msgHeight);
            this.ctx.strokeStyle = dialogBorderColor;
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(msgX, msgY, msgWidth, msgHeight);
            this.ctx.fillStyle = this.state.gameWon ? winColor : loseColor;
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            const message = this.state.gameWon ? 'YOU WIN!' : 'GAME OVER!';
            this.ctx.fillText(message, this.canvas.width / 2, msgY + 40);
            this.ctx.fillStyle = textColor;
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
        
        // Check if this cell is being hovered
        const isHovered = this.state.hoveredCell && 
                         this.state.hoveredCell.x === cell.x && 
                         this.state.hoveredCell.y === cell.y &&
                         !cell.isRevealed;
        
        // Minimalist color palette
        const mineBgColor = getComputedStyle(document.documentElement).getPropertyValue('--vscode-errorBackground') || '#ffebee';
        const normalBgColor = getComputedStyle(document.documentElement).getPropertyValue('--vscode-editor-background') || '#ffffff';
        const mineColor = getComputedStyle(document.documentElement).getPropertyValue('--vscode-foreground') || '#000000';
        
        // High contrast colors for better visibility across themes
        const revealedCellColor = getComputedStyle(document.documentElement).getPropertyValue('--vscode-editor-background') || '#fafafa';
        const hiddenCellColor = getComputedStyle(document.documentElement).getPropertyValue('--vscode-button-background') || '#0e639c';
        const hoveredCellColor = getComputedStyle(document.documentElement).getPropertyValue('--vscode-button-hoverBackground') || '#1177bb';
        
        const flagColor = getComputedStyle(document.documentElement).getPropertyValue('--vscode-errorForeground') || '#d32f2f';
        const wrongFlagColor = getComputedStyle(document.documentElement).getPropertyValue('--vscode-errorForeground') || '#d32f2f';
        const cellBorderColor = getComputedStyle(document.documentElement).getPropertyValue('--vscode-panel-border') || '#e0e0e0';
        
        if (cell.isRevealed) {
            if (cell.isMine) {
                // Mine cell - clean design
                this.ctx.fillStyle = this.state.gameOver ? mineBgColor : normalBgColor;
                this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
                
                // Simple mine design
                this.ctx.fillStyle = mineColor;
                this.ctx.beginPath();
                this.ctx.arc(x + this.cellSize / 2, y + this.cellSize / 2, 6, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                // Revealed number cell - pressed in appearance
                this.ctx.fillStyle = revealedCellColor;
                this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
                
                // Add "pressed in" effect for revealed cells
                this.ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--vscode-panel-border') || '#333333';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(x, y);
                this.ctx.lineTo(x, y + this.cellSize);
                this.ctx.lineTo(x + this.cellSize, y + this.cellSize);
                this.ctx.stroke();
                
                this.ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--vscode-editor-background') || '#ffffff';
                this.ctx.beginPath();
                this.ctx.moveTo(x + this.cellSize, y + this.cellSize);
                this.ctx.lineTo(x + this.cellSize, y);
                this.ctx.lineTo(x, y);
                this.ctx.stroke();
                
                // Draw number if there are neighboring mines
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
            // Hidden cell - highly visible design
            this.ctx.fillStyle = isHovered ? hoveredCellColor : hiddenCellColor;
            this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
            
            // Strong 3D raised effect for unrevealed cells
            if (!isHovered) {
                // Bright highlight on top and left (2px thick)
                this.ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--vscode-editor-background') || '#ffffff';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(x, y + this.cellSize - 1);
                this.ctx.lineTo(x, y);
                this.ctx.lineTo(x + this.cellSize - 1, y);
                this.ctx.stroke();
                
                // Dark shadow on bottom and right (2px thick)
                this.ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--vscode-panel-border') || '#333333';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(x + this.cellSize - 1, y + 1);
                this.ctx.lineTo(x + this.cellSize - 1, y + this.cellSize - 1);
                this.ctx.lineTo(x + 1, y + this.cellSize - 1);
                this.ctx.stroke();
                
                // Inner highlight for extra depth
                this.ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--vscode-list-hoverBackground') || '#e8e8e8';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(x + 1, y + this.cellSize - 2);
                this.ctx.lineTo(x + 1, y + 1);
                this.ctx.lineTo(x + this.cellSize - 2, y + 1);
                this.ctx.stroke();
            }
            
            // Strong hover effect
            if (isHovered) {
                this.ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--vscode-focusBorder') || '#007ACC';
                this.ctx.lineWidth = 3;
                this.ctx.strokeRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
                
                // Add inner glow effect
                this.ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--vscode-button-hoverBackground') || '#1177bb';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
            }
            
            // Simple flag design
            if (cell.isFlagged) {
                this.ctx.fillStyle = flagColor;
                this.ctx.font = '16px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('🚩', x + this.cellSize / 2, y + this.cellSize / 2 + 5);
            }
        }
        
        // Show wrong flags when game is over
        if (this.state.gameOver && cell.isFlagged && !cell.isMine) {
            this.ctx.strokeStyle = wrongFlagColor;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(x + 4, y + 4);
            this.ctx.lineTo(x + this.cellSize - 4, y + this.cellSize - 4);
            this.ctx.moveTo(x + this.cellSize - 4, y + 4);
            this.ctx.lineTo(x + 4, y + this.cellSize - 4);
            this.ctx.stroke();
        }
        
        // Strong border for cell definition
        this.ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--vscode-foreground') || '#000000';
        this.ctx.lineWidth = 1;
        this.ctx.globalAlpha = 0.3;
        this.ctx.strokeRect(x, y, this.cellSize, this.cellSize);
        this.ctx.globalAlpha = 1.0;
    }
    private getNumberColor(num: number): string {
        const colors = [
            '', // 0 mines
            getComputedStyle(document.documentElement).getPropertyValue('--vscode-charts-blue') || '#0000ff',
            getComputedStyle(document.documentElement).getPropertyValue('--vscode-charts-green') || '#008000',
            getComputedStyle(document.documentElement).getPropertyValue('--vscode-charts-red') || '#ff0000',
            getComputedStyle(document.documentElement).getPropertyValue('--vscode-charts-purple') || '#800080',
            getComputedStyle(document.documentElement).getPropertyValue('--vscode-terminal-ansiRed') || '#800000',
            getComputedStyle(document.documentElement).getPropertyValue('--vscode-terminal-ansiCyan') || '#008080',
            getComputedStyle(document.documentElement).getPropertyValue('--vscode-foreground') || '#000000',
            getComputedStyle(document.documentElement).getPropertyValue('--vscode-descriptionForeground') || '#808080'
        ];
        return colors[num] || getComputedStyle(document.documentElement).getPropertyValue('--vscode-foreground') || '#000000';
    }
    private formatTime(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    private updateDisplay(): void {
        const mineCountEl = document.getElementById('mineCount');
        const flaggedEl = document.getElementById('flagged');
        const timeEl = document.getElementById('time');
        // Show remaining mines instead of total mines
        if (mineCountEl) mineCountEl.textContent = (this.state.mineCount - this.state.flaggedCount).toString();
        if (flaggedEl) flaggedEl.textContent = this.state.flaggedCount.toString();
        if (timeEl) timeEl.textContent = this.formatTime(this.state.elapsedTime);
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
        // Start the game immediately so it's ready for first click
        (window as any).minesweeperGame.startGame();
    });
} else {
    (window as any).minesweeperGame = new MinesweeperGame();
    // Start the game immediately so it's ready for first click
    (window as any).minesweeperGame.startGame();
}
