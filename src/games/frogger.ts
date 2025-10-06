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
    private isMoving: boolean = false;
    private moveStartTime: number = 0;
    private moveStartPos: { x: number; y: number } = { x: 0, y: 0 };
    private moveTargetPos: { x: number; y: number } = { x: 0, y: 0 };
    private moveDuration: number = 100; // milliseconds

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

        // Create vehicles (cars) with better spacing and guaranteed gaps
        const vehicleRows = [340, 300, 260, 220, 180]; // Complete coverage of road zone
        vehicleRows.forEach((y, index) => {
            const speed = (index % 2 === 0 ? 1 : -1) * (1 + this.state.level * 0.3);
            const direction = speed > 0 ? 1 : -1;
            const vehicleWidth = 40;
            const gapSize = 60 + (Math.random() * 40); // Random gap between 60-100 pixels
            
            // Calculate positions to ensure there are always passable gaps
            const spacing = vehicleWidth + gapSize;
            const numVehicles = Math.ceil((this.CANVAS_WIDTH + 200) / spacing);
            
            for (let i = 0; i < numVehicles; i++) {
                const startX = direction > 0 ? -100 : this.CANVAS_WIDTH + 60;
                this.state.vehicles.push({
                    x: startX + i * direction * spacing,
                    y: y,
                    width: vehicleWidth,
                    height: 20,
                    speed: speed,
                    color: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'][index]
                });
            }
        });

        // Create logs with better spacing and guaranteed platforms
        const logRows = [120, 100, 80, 60, 40, 25]; // Complete coverage of water zone
        logRows.forEach((y, index) => {
            const speed = (index % 2 === 0 ? -1 : 1) * (0.8 + this.state.level * 0.2);
            const direction = speed > 0 ? 1 : -1;
            const logWidth = 80;
            const gapSize = 50 + (Math.random() * 30); // Random gap between 50-80 pixels
            
            // Calculate positions to ensure there are always platforms to jump on
            const spacing = logWidth + gapSize;
            const numLogs = Math.ceil((this.CANVAS_WIDTH + 200) / spacing);
            
            for (let i = 0; i < numLogs; i++) {
                const startX = direction > 0 ? -120 : this.CANVAS_WIDTH + 80;
                this.state.logs.push({
                    x: startX + i * direction * spacing,
                    y: y,
                    width: logWidth,
                    height: 20,
                    speed: speed
                });
            }
        });
    }

    private movePlayer(dx: number, dy: number): void {
        // Prevent movement if already moving
        if (this.isMoving) return;
        
        const newX = Math.max(0, Math.min(this.CANVAS_WIDTH - this.state.player.width, this.state.player.x + dx));
        const newY = Math.max(0, Math.min(this.CANVAS_HEIGHT - this.state.player.height, this.state.player.y + dy));

        // Start smooth movement animation
        this.isMoving = true;
        this.moveStartTime = Date.now();
        this.moveStartPos = { x: this.state.player.x, y: this.state.player.y };
        this.moveTargetPos = { x: newX, y: newY };
    }

    private updatePlayerMovement(): void {
        if (!this.isMoving) return;

        const elapsed = Date.now() - this.moveStartTime;
        const progress = Math.min(elapsed / this.moveDuration, 1);

        // Easing function for smoother movement
        const easedProgress = 1 - Math.pow(1 - progress, 3);

        this.state.player.x = this.moveStartPos.x + (this.moveTargetPos.x - this.moveStartPos.x) * easedProgress;
        this.state.player.y = this.moveStartPos.y + (this.moveTargetPos.y - this.moveStartPos.y) * easedProgress;

        if (progress >= 1) {
            this.isMoving = false;
            this.state.player.x = this.moveTargetPos.x;
            this.state.player.y = this.moveTargetPos.y;

            // Check if reached the top
            if (this.state.player.y <= 20) {
                this.state.score += 100;
                this.resetPlayerPosition();

                // Check for level completion
                if (this.state.score % 500 === 0) {
                    this.nextLevel();
                }
            }
        }
    }

    private resetPlayerPosition(): void {
        this.state.player.x = 190;
        this.state.player.y = 380;
        this.state.playerOnLog = null;
        this.isMoving = false; // Reset movement state
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

        this.updatePlayerMovement();
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

            // Wrap around screen with better spacing
            if (vehicle.speed > 0 && vehicle.x > this.CANVAS_WIDTH + 50) {
                vehicle.x = -vehicle.width - 50;
            } else if (vehicle.speed < 0 && vehicle.x < -vehicle.width - 50) {
                vehicle.x = this.CANVAS_WIDTH + 50;
            }
        }
    }

    private updateLogs(): void {
        this.state.playerOnLog = null;

        for (const log of this.state.logs) {
            log.x += log.speed;

            // Check if player is on this log (with some tolerance for easier gameplay)
            if (this.isPlayerInWater() && this.isOnLog(this.state.player, log)) {
                this.state.playerOnLog = log;
                // Move player with log, but keep within canvas bounds
                const newPlayerX = this.state.player.x + log.speed;
                this.state.player.x = Math.max(0, Math.min(this.CANVAS_WIDTH - this.state.player.width, newPlayerX));
            }

            // Wrap around screen
            if (log.speed > 0 && log.x > this.CANVAS_WIDTH + 50) {
                log.x = -log.width - 50;
            } else if (log.speed < 0 && log.x < -log.width - 50) {
                log.x = this.CANVAS_WIDTH + 50;
            }
        }
    }

    private isOnLog(player: FroggerPlayer, log: Log): boolean {
        // More forgiving collision detection for logs
        const tolerance = 5;
        return player.x + tolerance < log.x + log.width &&
            player.x + player.width - tolerance > log.x &&
            player.y + tolerance < log.y + log.height &&
            player.y + player.height - tolerance > log.y;
    }

    private isPlayerInWater(): boolean {
        // Check if player is in the water zone (between logs area, excluding middle safe zone)
        return this.state.player.y >= 20 && this.state.player.y < 140;
    }

    private isPlayerOnRoad(): boolean {
        // Check if player is on the road (vehicle area, excluding safe zones)
        return this.state.player.y > 160 && this.state.player.y < 360;
    }

    private isPlayerInSafeZone(): boolean {
        // Check if player is in any safe zone
        return (this.state.player.y >= 360) || // Bottom safe zone
               (this.state.player.y >= 140 && this.state.player.y <= 160) || // Middle safe zone
               (this.state.player.y <= 20); // Goal area
    }

    private checkCollisions(): void {
        // Check vehicle collisions (only when on road)
        if (this.isPlayerOnRoad()) {
            for (const vehicle of this.state.vehicles) {
                if (this.isColliding(this.state.player, vehicle)) {
                    this.playerHit();
                    return;
                }
            }
        }

        // Check if player is in water without a log
        if (this.isPlayerInWater() && !this.state.playerOnLog) {
            this.playerHit();
            return;
        }

        // Check if player falls off the side while on a log (with some tolerance)
        if (this.state.playerOnLog && 
            (this.state.player.x < -5 || this.state.player.x > this.CANVAS_WIDTH - this.state.player.width + 5)) {
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

        // Safe zone (middle) - between road and water
        this.ctx.fillStyle = '#90EE90';
        this.ctx.fillRect(0, 140, this.CANVAS_WIDTH, 20);

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
