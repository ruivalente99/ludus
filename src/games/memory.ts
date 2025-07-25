interface MemoryCard {
    id: number;
    symbol: string;
    isFlipped: boolean;
    isMatched: boolean;
    x: number;
    y: number;
}
interface MemoryGameState {
    cards: MemoryCard[];
    flippedCards: MemoryCard[];
    score: number;
    moves: number;
    gameActive: boolean;
    gameWon: boolean;
    gridSize: number;
    cardSize: number;
    cardSpacing: number;
}
class MemoryGame {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private state: MemoryGameState;
    private vscode: any;
    private flipTimeout: NodeJS.Timeout | null = null;
    constructor() {
        this.vscode = (window as any).vscode || (window as any).acquireVsCodeApi();
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.state = {
            cards: [],
            flippedCards: [],
            score: 0,
            moves: 0,
            gameActive: false,
            gameWon: false,
            gridSize: 4,
            cardSize: 70,
            cardSpacing: 10
        };
        this.init();
    }
    private init(): void {
        this.canvas.width = 400;
        this.canvas.height = 400;
        this.setupControls();
        this.createCards();
        this.updateDisplay();
        this.draw();
    }
    private setupControls(): void {
        this.canvas.addEventListener('click', (e) => {
            if (!this.state.gameActive || this.state.flippedCards.length >= 2) return;
            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            const clickedCard = this.getCardAtPosition(clickX, clickY);
            if (clickedCard && !clickedCard.isFlipped && !clickedCard.isMatched) {
                this.flipCard(clickedCard);
            }
        });
    }
    private createCards(): void {
        const symbols = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎸', '🎺'];
        const cardPairs = [...symbols, ...symbols];
        for (let i = cardPairs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cardPairs[i], cardPairs[j]] = [cardPairs[j], cardPairs[i]];
        }
        this.state.cards = [];
        const startX = (this.canvas.width - (this.state.gridSize * this.state.cardSize + (this.state.gridSize - 1) * this.state.cardSpacing)) / 2;
        const startY = (this.canvas.height - (this.state.gridSize * this.state.cardSize + (this.state.gridSize - 1) * this.state.cardSpacing)) / 2;
        for (let i = 0; i < this.state.gridSize; i++) {
            for (let j = 0; j < this.state.gridSize; j++) {
                const index = i * this.state.gridSize + j;
                this.state.cards.push({
                    id: index,
                    symbol: cardPairs[index],
                    isFlipped: false,
                    isMatched: false,
                    x: startX + j * (this.state.cardSize + this.state.cardSpacing),
                    y: startY + i * (this.state.cardSize + this.state.cardSpacing)
                });
            }
        }
    }
    private getCardAtPosition(x: number, y: number): MemoryCard | null {
        return this.state.cards.find(card =>
            x >= card.x && x <= card.x + this.state.cardSize &&
            y >= card.y && y <= card.y + this.state.cardSize
        ) || null;
    }
    private flipCard(card: MemoryCard): void {
        card.isFlipped = true;
        this.state.flippedCards.push(card);
        if (this.state.flippedCards.length === 2) {
            this.state.moves++;
            this.checkMatch();
        }
        this.draw();
        this.updateDisplay();
    }
    private checkMatch(): void {
        const [card1, card2] = this.state.flippedCards;
        if (card1.symbol === card2.symbol) {
            card1.isMatched = true;
            card2.isMatched = true;
            this.state.score += 100;
            this.state.flippedCards = [];
            if (this.state.cards.every(card => card.isMatched)) {
                this.state.gameWon = true;
                this.state.gameActive = false;
                this.state.score += Math.max(0, 1000 - this.state.moves * 10);
            }
        } else {
            this.flipTimeout = setTimeout(() => {
                card1.isFlipped = false;
                card2.isFlipped = false;
                this.state.flippedCards = [];
                this.draw();
            }, 1000);
        }
        this.updateDisplay();
    }
    public startGame(): void {
        this.state.gameActive = true;
        this.state.gameWon = false;
        this.state.score = 0;
        this.state.moves = 0;
        this.state.flippedCards = [];
        this.createCards();
        this.updateDisplay();
        this.draw();
    }
    public resetGame(): void {
        this.state.gameActive = false;
        this.state.gameWon = false;
        this.state.score = 0;
        this.state.moves = 0;
        this.state.flippedCards = [];
        if (this.flipTimeout) {
            clearTimeout(this.flipTimeout);
            this.flipTimeout = null;
        }
        this.createCards();
        this.updateDisplay();
        this.draw();
    }
    private draw(): void {
        this.ctx.fillStyle = '#2a2a2a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        for (const card of this.state.cards) {
            if (card.isMatched) {
                this.ctx.fillStyle = '#00ff00';
                this.ctx.fillRect(card.x - 2, card.y - 2, this.state.cardSize + 4, this.state.cardSize + 4);
                this.ctx.fillStyle = '#88ff88';
                this.ctx.fillRect(card.x, card.y, this.state.cardSize, this.state.cardSize);
                this.ctx.fillStyle = '#000000';
                this.ctx.font = '30px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(
                    card.symbol,
                    card.x + this.state.cardSize / 2,
                    card.y + this.state.cardSize / 2 + 10
                );
            } else if (card.isFlipped) {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillRect(card.x, card.y, this.state.cardSize, this.state.cardSize);
                this.ctx.strokeStyle = '#000000';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(card.x, card.y, this.state.cardSize, this.state.cardSize);
                this.ctx.fillStyle = '#000000';
                this.ctx.font = '30px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(
                    card.symbol,
                    card.x + this.state.cardSize / 2,
                    card.y + this.state.cardSize / 2 + 10
                );
            } else {
                this.ctx.fillStyle = '#4444ff';
                this.ctx.fillRect(card.x, card.y, this.state.cardSize, this.state.cardSize);
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(card.x, card.y, this.state.cardSize, this.state.cardSize);
                this.ctx.fillStyle = '#6666ff';
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        this.ctx.fillRect(
                            card.x + 10 + i * 16,
                            card.y + 10 + j * 16,
                            12,
                            12
                        );
                    }
                }
            }
        }
        if (this.state.gameWon) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#00ff00';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('CONGRATULATIONS!', this.canvas.width / 2, this.canvas.height / 2 - 20);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '16px Arial';
            this.ctx.fillText(`Score: ${this.state.score}`, this.canvas.width / 2, this.canvas.height / 2 + 10);
            this.ctx.fillText(`Moves: ${this.state.moves}`, this.canvas.width / 2, this.canvas.height / 2 + 30);
        }
    }
    private updateDisplay(): void {
        const scoreEl = document.getElementById('score');
        const movesEl = document.getElementById('moves');
        const matchedEl = document.getElementById('matched');
        if (scoreEl) scoreEl.textContent = this.state.score.toString();
        if (movesEl) movesEl.textContent = this.state.moves.toString();
        if (matchedEl) {
            const matched = this.state.cards.filter(card => card.isMatched).length / 2;
            const total = this.state.cards.length / 2;
            matchedEl.textContent = `${matched}/${total}`;
        }
    }
}
function startMemoryGame(): void {
    (window as any).memoryGame?.startGame();
}
function resetMemoryGame(): void {
    (window as any).memoryGame?.resetGame();
}
function backToMemoryMenu(): void {
    const vscode = (window as any).vscode || (window as any).acquireVsCodeApi();
    vscode.postMessage({
        type: 'backToMenu'
    });
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        (window as any).memoryGame = new MemoryGame();
    });
} else {
    (window as any).memoryGame = new MemoryGame();
}
