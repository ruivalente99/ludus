type Choice = 'rock' | 'paper' | 'scissors';
type GameResult = 'win' | 'lose' | 'tie';
interface RockPaperScissorsState {
    playerScore: number;
    botScore: number;
}
class RockPaperScissorsGame {
    private state: RockPaperScissorsState;
    private vscode: any;
    private readonly choices: Choice[] = ['rock', 'paper', 'scissors'];
    private readonly handEmojis: Record<Choice, string> = {
        rock: '✊',
        paper: '✋',
        scissors: '✌️'
    };
    constructor() {
        this.vscode = (window as any).vscode || (window as any).acquireVsCodeApi();
        this.state = {
            playerScore: 0,
            botScore: 0
        };
    }
    public playChoice(playerChoice: Choice): void {
        const buttons = document.querySelectorAll('.choice-btn');
        buttons.forEach(btn => btn.classList.add('selecting'));
        const resultEl = document.getElementById('result');
        if (resultEl) {
            resultEl.classList.remove('winner', 'loser', 'tie');
        }
        setTimeout(() => {
            buttons.forEach(btn => btn.classList.remove('selecting'));
            const botChoice = this.choices[Math.floor(Math.random() * 3)];
            const result = this.getResult(playerChoice, botChoice);
            this.displayResult(playerChoice, botChoice, result);
            this.updateScore(result);
        }, 500);
    }
    private getResult(player: Choice, bot: Choice): GameResult {
        if (player === bot) return 'tie';
        const winConditions: Record<Choice, Choice> = {
            rock: 'scissors',
            paper: 'rock',
            scissors: 'paper'
        };
        return winConditions[player] === bot ? 'win' : 'lose';
    }
    private displayResult(playerChoice: Choice, botChoice: Choice, result: GameResult): void {
        const resultEl = document.getElementById('result');
        if (!resultEl) return;
        const resultText: Record<GameResult, string> = {
            win: 'You win! 🎉',
            lose: 'Bot wins! 🤖',
            tie: "It's a tie! 🤝"
        };
        resultEl.classList.add(result === 'win' ? 'winner' : result === 'lose' ? 'loser' : 'tie');
        resultEl.innerHTML = `
            <div class="result-choices">
                ${this.handEmojis[playerChoice]} <span class="vs-text">vs</span> ${this.handEmojis[botChoice]}
            </div>
            <div>${resultText[result]}</div>
        `;
    }
    private updateScore(result: GameResult): void {
        if (result === 'win') {
            this.state.playerScore++;
            this.updateScoreDisplay('playerScore', this.state.playerScore);
        } else if (result === 'lose') {
            this.state.botScore++;
            this.updateScoreDisplay('botScore', this.state.botScore);
        }
    }
    private updateScoreDisplay(elementId: string, score: number): void {
        const scoreEl = document.getElementById(elementId);
        if (scoreEl) {
            scoreEl.textContent = score.toString();
        }
    }
    public resetGame(): void {
        this.state.playerScore = 0;
        this.state.botScore = 0;
        this.updateScoreDisplay('playerScore', this.state.playerScore);
        this.updateScoreDisplay('botScore', this.state.botScore);
        const resultEl = document.getElementById('result');
        if (resultEl) {
            resultEl.classList.remove('winner', 'loser', 'tie');
            resultEl.innerHTML = `
                <div class="result-choices">Choose your hand! 🎮</div>
                <div>Click any option above to start playing</div>
            `;
        }
    }
    public backToMenu(): void {
        this.vscode.postMessage({ type: 'backToMenu' });
    }
}
let rpsGame: RockPaperScissorsGame;
function playChoice(choice: string): void {
    rpsGame.playChoice(choice as Choice);
}
function resetGameRPS(): void {
    rpsGame.resetGame();
}
function backToMenuRPS(): void {
    rpsGame.backToMenu();
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        rpsGame = new RockPaperScissorsGame();
    });
} else {
    rpsGame = new RockPaperScissorsGame();
}
