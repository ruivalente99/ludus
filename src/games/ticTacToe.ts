interface TicTacToeState {
    board: string[];
    currentPlayer: 'X' | 'O';
    gameActive: boolean;
    vsBot: boolean;
}
class TicTacToeGame {
    private state: TicTacToeState;
    private vscode: any;
    constructor() {
        this.vscode = (window as any).vscode || (window as any).acquireVsCodeApi();
        this.state = {
            board: Array(9).fill(''),
            currentPlayer: 'X',
            gameActive: true,
            vsBot: true
        };
        this.init();
    }
    private init(): void {
        if (document.getElementById('board')) {
            this.createBoard();
            this.updateStatus();
        } else {
            setTimeout(() => this.init(), 100);
        }
    }
    private createBoard(): void {
        const boardEl = document.getElementById('board');
        if (!boardEl) return;
        boardEl.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('button');
            cell.className = 'cell';
            cell.onclick = () => this.makeMove(i);
            cell.textContent = this.state.board[i];
            if (this.state.board[i]) {
                cell.classList.add('taken');
            }
            boardEl.appendChild(cell);
        }
    }
    private makeMove(index: number): void {
        if (this.state.board[index] || !this.state.gameActive ||
            (this.state.vsBot && this.state.currentPlayer === 'O')) {
            return;
        }
        this.state.board[index] = this.state.currentPlayer;
        this.createBoard();
        if (this.checkWinner()) {
            const winner = this.state.vsBot
                ? (this.state.currentPlayer === 'X' ? 'You win!' : 'Bot wins!')
                : `Player ${this.state.currentPlayer} wins!`;
            this.updateStatus(`${winner} 🎉`);
            this.state.gameActive = false;
            return;
        }
        if (this.state.board.every(cell => cell)) {
            this.updateStatus("It's a tie! 🤝");
            this.state.gameActive = false;
            return;
        }
        this.state.currentPlayer = this.state.currentPlayer === 'X' ? 'O' : 'X';
        if (this.state.vsBot && this.state.currentPlayer === 'O') {
            this.updateStatus('Bot thinking...');
            setTimeout(() => this.makeBotMove(), 500);
        } else {
            this.updateStatus();
        }
    }
    private makeBotMove(): void {
        if (!this.state.gameActive) return;
        const bestMove = this.getBestMove();
        if (bestMove !== -1) {
            this.state.board[bestMove] = 'O';
            this.createBoard();
            if (this.checkWinner()) {
                this.updateStatus('Bot wins! 🤖');
                this.state.gameActive = false;
                return;
            }
            if (this.state.board.every(cell => cell)) {
                this.updateStatus("It's a tie! 🤝");
                this.state.gameActive = false;
                return;
            }
            this.state.currentPlayer = 'X';
            this.updateStatus();
        }
    }
    private getBestMove(): number {
        for (let i = 0; i < 9; i++) {
            if (!this.state.board[i]) {
                this.state.board[i] = 'O';
                if (this.checkWinner()) {
                    this.state.board[i] = '';
                    return i;
                }
                this.state.board[i] = '';
            }
        }
        for (let i = 0; i < 9; i++) {
            if (!this.state.board[i]) {
                this.state.board[i] = 'X';
                if (this.checkWinner()) {
                    this.state.board[i] = '';
                    return i;
                }
                this.state.board[i] = '';
            }
        }
        if (!this.state.board[4]) return 4;
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(i => !this.state.board[i]);
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }
        for (let i = 0; i < 9; i++) {
            if (!this.state.board[i]) return i;
        }
        return -1;
    }
    private checkWinner(): boolean {
        const wins = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        return wins.some(combo =>
            combo.every(index => this.state.board[index] === this.state.currentPlayer)
        );
    }
    private updateStatus(customMessage?: string): void {
        const statusEl = document.getElementById('status');
        if (!statusEl) return;
        if (customMessage) {
            statusEl.textContent = customMessage;
        } else {
            const statusText = this.state.vsBot
                ? 'Your turn (X)'
                : `Player ${this.state.currentPlayer}'s turn`;
            statusEl.textContent = statusText;
        }
    }
    public toggleGameMode(): void {
        this.state.vsBot = !this.state.vsBot;
        const modeBtn = document.getElementById('modeBtn') as HTMLButtonElement;
        if (modeBtn) {
            modeBtn.textContent = this.state.vsBot ? 'Switch to vs Player' : 'Switch to vs Bot';
        }
        this.resetGame();
    }
    public resetGame(): void {
        this.state.board = Array(9).fill('');
        this.state.currentPlayer = 'X';
        this.state.gameActive = true;
        this.createBoard();
        this.updateStatus();
    }
    public backToMenu(): void {
        this.vscode.postMessage({ type: 'backToMenu' });
    }
}
let ticTacToeGame: TicTacToeGame;
function toggleGameMode(): void {
    ticTacToeGame.toggleGameMode();
}
function resetGameTTT(): void {
    ticTacToeGame.resetGame();
}
function backToMenuTTT(): void {
    ticTacToeGame.backToMenu();
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        ticTacToeGame = new TicTacToeGame();
    });
} else {
    ticTacToeGame = new TicTacToeGame();
}
