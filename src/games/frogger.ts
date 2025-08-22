interface FroggerPlayer {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface Vehicle {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    color: string;
}

interface Log {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
}

interface FroggerGameState {
    player: FroggerPlayer;
    vehicles: Vehicle[];
    logs: Log[];
    score: number;
    lives: number;
    gameActive: boolean;
    gameOver: boolean;
    level: number;
    playerOnLog: Log | null;
}

class FroggerGame {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private state: FroggerGameState;
    private vscode: any;
    private gameLoop: number | null = null;
    private keys: { [key: string]: boolean } = {};

    private readonly GRID_SIZE = 20;
    private readonly CANVAS_WIDTH = 400;
    private readonly CANVAS_HEIGHT = 400;

    constructor() {
        this.vscode = (window as any).vscode || (window as any).acquireVsCodeApi();
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;

        this.state = {
            player: { x: 190, y: 380, width: 20, height: 20 },
            vehicles: [],
            logs: [],
            score: 0,
            lives: 3,
            gameActive: false,
            gameOver: false,
            level: 1,
            playerOnLog: null
        };

        this.init();
    }

    private init(): void {
        this.canvas.width = this.CANVAS_WIDTH;
        this.canvas.height = this.CANVAS_HEIGHT;
        this.setupControls();
        this.createObstacles();
        this.updateDisplay();
        this.draw();
    }

    private setupControls(): void {
        document.addEventListener('keydown', (e) => {
            if (!this.state.gameActive) return;

            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    this.movePlayer(0, -this.GRID_SIZE);
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    this.movePlayer(0, this.GRID_SIZE);
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    this.movePlayer(-this.GRID_SIZE, 0);
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    this.movePlayer(this.GRID_SIZE, 0);
                    break;
            }
        });

        // Touch controls for mobile-like experience
        this.canvas.addEventListener('click', (e) => {
            if (!this.state.gameActive) return;

            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;

            const playerCenterX = this.state.player.x + this.state.player.width / 2;
            const playerCenterY = this.state.player.y + this.state.player.height / 2;

            const deltaX = clickX - playerCenterX;
            const deltaY = clickY - playerCenterY;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal movement
                if (deltaX > 0) {
                    this.movePlayer(this.GRID_SIZE, 0);
                } else {
                    this.movePlayer(-this.GRID_SIZE, 0);
                }
            } else {
                // Vertical movement
                if (deltaY > 0) {
                    this.movePlayer(0, this.GRID_SIZE);
                } else {
                    this.movePlayer(0, -this.GRID_SIZE);
                }
            }
        });
    }

    private createObstacles(): void {
        this.state.vehicles = [];
        this.state.logs = [];

        // Create vehicles (cars)
        const vehicleRows = [300, 260, 220, 180];
        vehicleRows.forEach((y, index) => {
            const speed = (index % 2 === 0 ? 1 : -1) * (1 + this.state.level * 0.5);
            const direction = speed > 0 ? 1 : -1;
            const startX = direction > 0 ? -60 : this.CANVAS_WIDTH + 20;

            for (let i = 0; i < 3; i++) {
                this.state.vehicles.push({
                    x: startX + i * direction * 120,
                    y: y,
                    width: 40,
                    height: 20,
                    speed: speed,
                    color: ['#ff0000', '#00ff00', '#0000ff', '#ffff00'][index]
                });
            }
        });

        // Create logs
        const logRows = [140, 100, 60, 20];
        logRows.forEach((y, index) => {
            const speed = (index % 2 === 0 ? -1 : 1) * (0.8 + this.state.level * 0.3);
            const direction = speed > 0 ? 1 : -1;
            const startX = direction > 0 ? -80 : this.CANVAS_WIDTH + 40;

            for (let i = 0; i < 2; i++) {
                this.state.logs.push({
                    x: startX + i * direction * 150,
                    y: y,
                    width: 80,
                    height: 20,
                    speed: speed
                });
            }
        });
    }

    private movePlayer(dx: number, dy: number): void {
        const newX = Math.max(0, Math.min(this.CANVAS_WIDTH - this.state.player.width, this.state.player.x + dx));
        const newY = Math.max(0, Math.min(this.CANVAS_HEIGHT - this.state.player.height, this.state.player.y + dy));

        this.state.player.x = newX;
        this.state.player.y = newY;

        // Check if reached the top
        if (this.state.player.y <= 20) {
            this.state.score += 100;
            this.resetPlayerPosition();

            // Check for level completion
            if (this.state.score % 500 === 0) {
                this.nextLevel();
            }
        }

        this.draw();
    }

    private resetPlayerPosition(): void {
        this.state.player.x = 190;
        this.state.player.y = 380;
        this.state.playerOnLog = null;
    }

    private nextLevel(): void {
        this.state.level++;
        this.createObstacles();
    }

    public startGame(): void {
        this.state.gameActive = true;
        this.state.gameOver = false;
        this.state.score = 0;
        this.state.lives = 3;
        this.state.level = 1;
        this.resetPlayerPosition();
        this.createObstacles();
        this.updateDisplay();

        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
        }
        this.gameLoop = requestAnimationFrame(() => this.update());
    }

    public resetGame(): void {
        this.state.gameActive = false;
        this.state.gameOver = false;
        this.state.score = 0;
        this.state.lives = 3;
        this.state.level = 1;
        this.resetPlayerPosition();
        this.createObstacles();
        this.updateDisplay();

        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }
        this.draw();
    }

    private update(): void {
        if (!this.state.gameActive || this.state.gameOver) return;

        this.updateVehicles();
        this.updateLogs();
        this.checkCollisions();
        this.draw();
        this.updateDisplay();

        this.gameLoop = requestAnimationFrame(() => this.update());
    }

    private updateVehicles(): void {
        for (const vehicle of this.state.vehicles) {
            vehicle.x += vehicle.speed;

            // Wrap around screen
            if (vehicle.speed > 0 && vehicle.x > this.CANVAS_WIDTH) {
                vehicle.x = -vehicle.width;
            } else if (vehicle.speed < 0 && vehicle.x < -vehicle.width) {
                vehicle.x = this.CANVAS_WIDTH;
            }
        }
    }

    private updateLogs(): void {
        this.state.playerOnLog = null;

        for (const log of this.state.logs) {
            log.x += log.speed;

            // Check if player is on this log
            if (this.isPlayerInWater() && this.isColliding(this.state.player, log)) {
                this.state.playerOnLog = log;
                this.state.player.x += log.speed; // Move player with log
            }

            // Wrap around screen
            if (log.speed > 0 && log.x > this.CANVAS_WIDTH) {
                log.x = -log.width;
            } else if (log.speed < 0 && log.x < -log.width) {
                log.x = this.CANVAS_WIDTH;
            }
        }
    }

    private isPlayerInWater(): boolean {
        return this.state.player.y >= 20 && this.state.player.y <= 140;
    }

    private checkCollisions(): void {
        // Check vehicle collisions
        for (const vehicle of this.state.vehicles) {
            if (this.isColliding(this.state.player, vehicle)) {
                this.playerHit();
                return;
            }
        }

        // Check if player is in water without a log
        if (this.isPlayerInWater() && !this.state.playerOnLog) {
            this.playerHit();
            return;
        }

        // Check if player falls off the side while on a log
        if (this.state.player.x < 0 || this.state.player.x > this.CANVAS_WIDTH - this.state.player.width) {
            this.playerHit();
            return;
        }
    }

    private isColliding(rect1: any, rect2: any): boolean {
        return rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y;
    }

    private playerHit(): void {
        this.state.lives--;
        this.resetPlayerPosition();

        if (this.state.lives <= 0) {
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
        // Clear canvas
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);

        // Draw zones
        // Safe zone (bottom)
        this.ctx.fillStyle = '#90EE90';
        this.ctx.fillRect(0, 360, this.CANVAS_WIDTH, 40);

        // Road
        this.ctx.fillStyle = '#555555';
        this.ctx.fillRect(0, 160, this.CANVAS_WIDTH, 160);

        // Water
        this.ctx.fillStyle = '#0066cc';
        this.ctx.fillRect(0, 20, this.CANVAS_WIDTH, 120);

        // Goal (top)
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillRect(0, 0, this.CANVAS_WIDTH, 20);

        // Draw road lines
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        for (let y = 180; y < 320; y += 40) {
            this.ctx.setLineDash([10, 10]);
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.CANVAS_WIDTH, y);
            this.ctx.stroke();
        }
        this.ctx.setLineDash([]);

        // Draw vehicles
        for (const vehicle of this.state.vehicles) {
            this.ctx.fillStyle = vehicle.color;
            this.ctx.fillRect(vehicle.x, vehicle.y, vehicle.width, vehicle.height);
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(vehicle.x, vehicle.y, vehicle.width, vehicle.height);
        }

        // Draw logs
        this.ctx.fillStyle = '#8B4513';
        for (const log of this.state.logs) {
            this.ctx.fillRect(log.x, log.y, log.width, log.height);
            this.ctx.strokeStyle = '#654321';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(log.x, log.y, log.width, log.height);
        }

        // Draw player (frog)
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(this.state.player.x, this.state.player.y, this.state.player.width, this.state.player.height);
        this.ctx.strokeStyle = '#008800';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(this.state.player.x, this.state.player.y, this.state.player.width, this.state.player.height);

        // Draw eyes
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(this.state.player.x + 3, this.state.player.y + 3, 3, 3);
        this.ctx.fillRect(this.state.player.x + 14, this.state.player.y + 3, 3, 3);

        // Draw game over message
        if (this.state.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.ctx.fillStyle = '#ff0000';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);

            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '16px Arial';
            this.ctx.fillText(`Final Score: ${this.state.score}`, this.canvas.width / 2, this.canvas.height / 2 + 30);
        }
    }

    private updateDisplay(): void {
        const scoreEl = document.getElementById('score');
        const livesEl = document.getElementById('lives');
        const levelEl = document.getElementById('level');

        if (scoreEl) scoreEl.textContent = this.state.score.toString();
        if (livesEl) livesEl.textContent = this.state.lives.toString();
        if (levelEl) levelEl.textContent = this.state.level.toString();
    }
}

// Global functions for HTML buttons
function startFroggerGame(): void {
    (window as any).froggerGame?.startGame();
}

function resetFroggerGame(): void {
    (window as any).froggerGame?.resetGame();
}

function backToFroggerMenu(): void {
    const vscode = (window as any).vscode || (window as any).acquireVsCodeApi();
    vscode.postMessage({
        type: 'backToMenu'
    });
}

// Initialize game when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        (window as any).froggerGame = new FroggerGame();
        // Auto-start the game after a brief delay
        setTimeout(() => {
            (window as any).froggerGame.startGame();
        }, 500);
    });
} else {
    (window as any).froggerGame = new FroggerGame();
    // Auto-start the game after a brief delay
    setTimeout(() => {
        (window as any).froggerGame.startGame();
    }, 500);
}
