type Direction = 'left' | 'right' | 'up' | 'down';
interface NumbersGameState {
    board: number[][];
    score: number;
}
class NumbersGame {
    private state: NumbersGameState;
    private vscode: any;
    constructor() {
        this.vscode = (window as any).vscode || (window as any).acquireVsCodeApi();
        this.state = {
            board: Array(4).fill(null).map(() => Array(4).fill(0)),
            score: 0
        };
        this.init();
    }
    private init(): void {
        this.newGame();
        this.setupKeyListeners();
    }
    private setupKeyListeners(): void {
        document.addEventListener('keydown', (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            if (key === 'arrowleft' || key === 'a') {
                e.preventDefault();
                this.move('left');
            } else if (key === 'arrowright' || key === 'd') {
                e.preventDefault();
                this.move('right');
            } else if (key === 'arrowup' || key === 'w') {
                e.preventDefault();
                this.move('up');
            } else if (key === 'arrowdown' || key === 's') {
                e.preventDefault();
                this.move('down');
            }
        });
    }
    private updateDisplay(): void {
        const boardEl = document.getElementById('board');
        if (!boardEl) return;
        boardEl.innerHTML = '';
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                if (this.state.board[i][j] > 0) {
                    tile.textContent = this.state.board[i][j].toString();
                    tile.classList.add(`tile-${this.state.board[i][j]}`);
                    setTimeout(() => {
                        tile.style.animation = 'none';
                    }, 200);
                }
                boardEl.appendChild(tile);
            }
        }
        const scoreEl = document.getElementById('score');
        if (scoreEl) {
            scoreEl.textContent = this.state.score.toString();
        }
    }
    private addRandomTile(): void {
        const emptyCells: [number, number][] = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.state.board[i][j] === 0) {
                    emptyCells.push([i, j]);
                }
            }
        }
        if (emptyCells.length > 0) {
            const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.state.board[row][col] = Math.random() < 0.9 ? 2 : 4;
        }
    }
    private move(direction: Direction): void {
        let moved = false;
        const newBoard = this.state.board.map(row => [...row]);
        switch (direction) {
            case 'left':
                moved = this.moveLeft(newBoard);
                break;
            case 'right':
                moved = this.moveRight(newBoard);
                break;
            case 'up':
                moved = this.moveUp(newBoard);
                break;
            case 'down':
                moved = this.moveDown(newBoard);
                break;
        }
        if (moved) {
            this.state.board = newBoard;
            this.addRandomTile();
            this.updateDisplay();
            if (this.state.board.some(row => row.includes(2048))) {
                setTimeout(() => alert('You reached 2048! 🎉'), 100);
            }
            if (this.isGameOver()) {
                setTimeout(() => alert('Game Over! No more moves available.'), 100);
            }
        }
    }
    private moveLeft(board: number[][]): boolean {
        let moved = false;
        for (let i = 0; i < 4; i++) {
            const row = board[i].filter(val => val !== 0);
            for (let j = 0; j < row.length - 1; j++) {
                if (row[j] === row[j + 1]) {
                    row[j] *= 2;
                    this.state.score += row[j];
                    row[j + 1] = 0;
                }
            }
            const newRow = row.filter(val => val !== 0);
            while (newRow.length < 4) {
                newRow.push(0);
            }
            for (let j = 0; j < 4; j++) {
                if (board[i][j] !== newRow[j]) {
                    moved = true;
                }
                board[i][j] = newRow[j];
            }
        }
        return moved;
    }
    private moveRight(board: number[][]): boolean {
        let moved = false;
        for (let i = 0; i < 4; i++) {
            const row = board[i].filter(val => val !== 0);
            for (let j = row.length - 1; j > 0; j--) {
                if (row[j] === row[j - 1]) {
                    row[j] *= 2;
                    this.state.score += row[j];
                    row[j - 1] = 0;
                }
            }
            const filtered = row.filter(val => val !== 0);
            const newRow = Array(4 - filtered.length).fill(0).concat(filtered);
            for (let j = 0; j < 4; j++) {
                if (board[i][j] !== newRow[j]) {
                    moved = true;
                }
                board[i][j] = newRow[j];
            }
        }
        return moved;
    }
    private moveUp(board: number[][]): boolean {
        let moved = false;
        for (let j = 0; j < 4; j++) {
            const column = [board[0][j], board[1][j], board[2][j], board[3][j]];
            const filtered = column.filter(val => val !== 0);
            for (let i = 0; i < filtered.length - 1; i++) {
                if (filtered[i] === filtered[i + 1]) {
                    filtered[i] *= 2;
                    this.state.score += filtered[i];
                    filtered[i + 1] = 0;
                }
            }
            const final = filtered.filter(val => val !== 0);
            while (final.length < 4) {
                final.push(0);
            }
            for (let i = 0; i < 4; i++) {
                if (board[i][j] !== final[i]) {
                    moved = true;
                }
                board[i][j] = final[i];
            }
        }
        return moved;
    }
    private moveDown(board: number[][]): boolean {
        let moved = false;
        for (let j = 0; j < 4; j++) {
            const column = [board[0][j], board[1][j], board[2][j], board[3][j]];
            const filtered = column.filter(val => val !== 0);
            for (let i = filtered.length - 1; i > 0; i--) {
                if (filtered[i] === filtered[i - 1]) {
                    filtered[i] *= 2;
                    this.state.score += filtered[i];
                    filtered[i - 1] = 0;
                }
            }
            const final = filtered.filter(val => val !== 0);
            const result = Array(4 - final.length).fill(0).concat(final);
            for (let i = 0; i < 4; i++) {
                if (board[i][j] !== result[i]) {
                    moved = true;
                }
                board[i][j] = result[i];
            }
        }
        return moved;
    }
    private isGameOver(): boolean {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.state.board[i][j] === 0) {
                    return false;
                }
            }
        }
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const current = this.state.board[i][j];
                if (j < 3 && this.state.board[i][j + 1] === current) {
                    return false;
                }
                if (i < 3 && this.state.board[i + 1][j] === current) {
                    return false;
                }
            }
        }
        return true;
    }
    public newGame(): void {
        this.state.board = Array(4).fill(null).map(() => Array(4).fill(0));
        this.state.score = 0;
        this.addRandomTile();
        this.addRandomTile();
        this.updateDisplay();
    }
    public backToMenu(): void {
        this.vscode.postMessage({ type: 'backToMenu' });
    }
}
let numbersGame: NumbersGame;
function newGameNumbers(): void {
    numbersGame.newGame();
}
function backToMenuNumbers(): void {
    numbersGame.backToMenu();
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        numbersGame = new NumbersGame();
        // Auto-start the game after a brief delay
        setTimeout(() => {
            numbersGame.newGame();
        }, 500);
    });
} else {
    numbersGame = new NumbersGame();
    // Auto-start the game after a brief delay
    setTimeout(() => {
        numbersGame.newGame();
    }, 500);
}
