export interface GameConfig {
    autoStart?: boolean;
    pressToStart?: boolean;
    startDelay?: number;
}

export abstract class GameBase {
    protected vscode: any;
    protected gameStarted: boolean = false;
    protected gameActive: boolean = false;
    protected config: GameConfig;

    constructor(config: GameConfig = {}) {
        this.vscode = (window as any).vscode || (window as any).acquireVsCodeApi();
        this.config = {
            autoStart: true,
            pressToStart: true,
            startDelay: 500,
            ...config
        };
        this.init();
    }

    protected init(): void {
        this.setupBaseControls();
        this.initializeGame();
        
        if (this.config.autoStart) {
            setTimeout(() => {
                this.startGame();
            }, this.config.startDelay);
        } else if (this.config.pressToStart) {
            this.showPressToStart();
        }
    }

    protected setupBaseControls(): void {
        // Listen for space bar or click to start
        document.addEventListener('keydown', (e) => {
            if ((e.key === ' ' || e.key === 'Enter') && !this.gameStarted && this.config.pressToStart) {
                e.preventDefault();
                this.startGame();
            }
        });

        // Canvas click to start (if canvas exists)
        const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        if (canvas && this.config.pressToStart) {
            canvas.addEventListener('click', () => {
                if (!this.gameStarted) {
                    this.startGame();
                }
            });
        }
    }

    protected showPressToStart(): void {
        const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Draw "Press to Start" message
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 24px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Press SPACE or Click to Start', canvas.width / 2, canvas.height / 2);
                
                ctx.font = '16px Arial';
                ctx.fillText('🎮', canvas.width / 2, canvas.height / 2 + 40);
            }
        }
    }

    public startGame(): void {
        if (this.gameStarted) return;
        
        this.gameStarted = true;
        this.gameActive = true;
        this.onGameStart();
    }

    public resetGame(): void {
        this.gameStarted = false;
        this.gameActive = false;
        this.onGameReset();
        
        if (this.config.pressToStart && !this.config.autoStart) {
            this.showPressToStart();
        }
    }

    public backToMenu(): void {
        if (this.vscode) {
            this.vscode.postMessage({
                type: 'backToMenu'
            });
        }
    }

    // Abstract methods that games must implement
    protected abstract initializeGame(): void;
    protected abstract onGameStart(): void;
    protected abstract onGameReset(): void;
}
