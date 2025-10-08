// Game Constants
const GRID_SIZE = 20;
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 400;
const MOVE_DURATION = 100;
const PLAYER_SIZE = 20;

// Helper function to get VS Code theme colors
function getVSCodeColor(cssVar: string, fallback: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim() || fallback;
}

// Dynamic color getter
function getGameColors() {
    return {
        grass: getVSCodeColor('--vscode-terminal-ansiGreen', '#2d5016'),
        safeZone: getVSCodeColor('--vscode-charts-green', '#5cb85c'),
        road: getVSCodeColor('--vscode-editor-background', '#3a3a3a'),
        roadLine: getVSCodeColor('--vscode-charts-yellow', '#ffd700'),
        water: getVSCodeColor('--vscode-charts-blue', '#1e90ff'),
        goal: getVSCodeColor('--vscode-charts-yellow', '#ffd700'),
        goalText: getVSCodeColor('--vscode-charts-orange', '#ff4500'),
        log: getVSCodeColor('--vscode-terminal-ansiBrightYellow', '#8b4513'),
        logBorder: getVSCodeColor('--vscode-terminal-ansiYellow', '#654321'),
        frog: getVSCodeColor('--vscode-terminal-ansiBrightGreen', '#7cfc00'),
        frogDark: getVSCodeColor('--vscode-terminal-ansiGreen', '#228b22'),
        vehicles: [
            getVSCodeColor('--vscode-charts-red', '#ff4444'),
            getVSCodeColor('--vscode-charts-green', '#44ff44'),
            getVSCodeColor('--vscode-charts-blue', '#4444ff'),
            getVSCodeColor('--vscode-charts-yellow', '#ffff44'),
            getVSCodeColor('--vscode-charts-purple', '#ff44ff'),
            getVSCodeColor('--vscode-terminal-ansiCyan', '#44ffff')
        ],
        overlay: getVSCodeColor('--vscode-editor-background', '#000000'),
        gameOverText: getVSCodeColor('--vscode-charts-red', '#ff4444'),
        whiteText: getVSCodeColor('--vscode-foreground', '#ffffff'),
        goldText: getVSCodeColor('--vscode-charts-yellow', '#ffd700'),
        vehicleWindow: getVSCodeColor('--vscode-charts-blue', '#64b4ff'),
        border: getVSCodeColor('--vscode-panel-border', '#454545'),
        wave: getVSCodeColor('--vscode-foreground', '#ffffff')
    };
}

// Interfaces
interface Position {
    x: number;
    y: number;
}

interface Size {
    width: number;
    height: number;
}

interface GameObject extends Position, Size {}

interface FroggerPlayer extends GameObject {
    rotation: number; // Track direction for visual feedback
}

interface Vehicle extends GameObject {
    speed: number;
    color: string;
    type: 'car' | 'truck';
}

interface Log extends GameObject {
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
    highScore: number;
}

class FroggerGame {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private state: FroggerGameState;
    private vscode: any;
    private gameLoop: number | null = null;
    private isMoving: boolean = false;
    private moveStartTime: number = 0;
    private moveStartPos: Position = { x: 0, y: 0 };
    private moveTargetPos: Position = { x: 0, y: 0 };
    private colors: ReturnType<typeof getGameColors>;

    constructor() {
        this.vscode = (window as any).vscode || (window as any).acquireVsCodeApi();
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        
        // Get VS Code theme colors
        this.colors = getGameColors();

        // Load high score from localStorage
        const savedHighScore = localStorage.getItem('froggerHighScore');
        const highScore = savedHighScore ? parseInt(savedHighScore) : 0;

        this.state = {
            player: { 
                x: CANVAS_WIDTH / 2 - PLAYER_SIZE / 2, 
                y: CANVAS_HEIGHT - PLAYER_SIZE - 20, 
                width: PLAYER_SIZE, 
                height: PLAYER_SIZE,
                rotation: 0
            },
            vehicles: [],
            logs: [],
            score: 0,
            lives: 3,
            gameActive: false,
            gameOver: false,
            level: 1,
            playerOnLog: null,
            highScore: highScore
        };

        this.init();
    }

    private init(): void {
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;
        this.setupControls();
        this.createObstacles();
        this.updateDisplay();
        this.draw();
    }

    private setupControls(): void {
        document.addEventListener('keydown', (e) => {
            if (!this.state.gameActive || this.state.gameOver) return;

            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    e.preventDefault();
                    this.movePlayer(0, -GRID_SIZE, 0);
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    e.preventDefault();
                    this.movePlayer(0, GRID_SIZE, 180);
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    e.preventDefault();
                    this.movePlayer(-GRID_SIZE, 0, 270);
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    e.preventDefault();
                    this.movePlayer(GRID_SIZE, 0, 90);
                    break;
            }
        });

        // Click/touch controls for better UX
        this.canvas.addEventListener('click', (e) => {
            if (!this.state.gameActive || this.state.gameOver) return;

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
                    this.movePlayer(GRID_SIZE, 0, 90);
                } else {
                    this.movePlayer(-GRID_SIZE, 0, 270);
                }
            } else {
                // Vertical movement
                if (deltaY > 0) {
                    this.movePlayer(0, GRID_SIZE, 180);
                } else {
                    this.movePlayer(0, -GRID_SIZE, 0);
                }
            }
        });
    }

    private createObstacles(): void {
        this.state.vehicles = [];
        this.state.logs = [];

        // Create vehicles with better spacing and guaranteed gaps
        const vehicleRows = [340, 300, 260, 220, 180];
        vehicleRows.forEach((y, index) => {
            const speed = (index % 2 === 0 ? 1 : -1) * (1 + this.state.level * 0.3);
            const direction = speed > 0 ? 1 : -1;
            const isLarge = index % 3 === 0;
            const vehicleWidth = isLarge ? 60 : 40;
            const gapSize = 80 + (Math.random() * 40);
            
            const spacing = vehicleWidth + gapSize;
            const numVehicles = Math.ceil((CANVAS_WIDTH + 200) / spacing);
            
            for (let i = 0; i < numVehicles; i++) {
                const startX = direction > 0 ? -100 : CANVAS_WIDTH + 60;
                this.state.vehicles.push({
                    x: startX + i * direction * spacing,
                    y: y,
                    width: vehicleWidth,
                    height: 20,
                    speed: speed,
                    color: this.colors.vehicles[index % this.colors.vehicles.length],
                    type: isLarge ? 'truck' : 'car'
                });
            }
        });

        // Create logs with better spacing and guaranteed platforms
        const logRows = [120, 100, 80, 60, 40, 25];
        logRows.forEach((y, index) => {
            const speed = (index % 2 === 0 ? -1 : 1) * (0.8 + this.state.level * 0.2);
            const direction = speed > 0 ? 1 : -1;
            const logWidth = 80 + (index % 2 === 0 ? 20 : 0);
            const gapSize = 60 + (Math.random() * 40);
            
            const spacing = logWidth + gapSize;
            const numLogs = Math.ceil((CANVAS_WIDTH + 200) / spacing);
            
            for (let i = 0; i < numLogs; i++) {
                const startX = direction > 0 ? -120 : CANVAS_WIDTH + 80;
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

    private movePlayer(dx: number, dy: number, rotation: number): void {
        // Prevent movement if already moving
        if (this.isMoving) return;
        
        const newX = Math.max(0, Math.min(CANVAS_WIDTH - this.state.player.width, this.state.player.x + dx));
        const newY = Math.max(0, Math.min(CANVAS_HEIGHT - this.state.player.height, this.state.player.y + dy));

        // Update player rotation for visual feedback
        this.state.player.rotation = rotation;

        // Start smooth movement animation
        this.isMoving = true;
        this.moveStartTime = Date.now();
        this.moveStartPos = { x: this.state.player.x, y: this.state.player.y };
        this.moveTargetPos = { x: newX, y: newY };
    }

    private updatePlayerMovement(): void {
        if (!this.isMoving) return;

        const elapsed = Date.now() - this.moveStartTime;
        const progress = Math.min(elapsed / MOVE_DURATION, 1);

        // Easing function for smoother movement
        const easedProgress = 1 - Math.pow(1 - progress, 3);

        this.state.player.x = this.moveStartPos.x + (this.moveTargetPos.x - this.moveStartPos.x) * easedProgress;
        this.state.player.y = this.moveStartPos.y + (this.moveTargetPos.y - this.moveStartPos.y) * easedProgress;

        if (progress >= 1) {
            this.isMoving = false;
            this.state.player.x = this.moveTargetPos.x;
            this.state.player.y = this.moveTargetPos.y;

            // Check if reached the goal
            if (this.state.player.y <= 20) {
                this.state.score += 100 * this.state.level;
                this.resetPlayerPosition();

                // Level up every 3 successful crosses
                if (this.state.score % 300 === 0) {
                    this.nextLevel();
                }
            }
        }
    }

    private resetPlayerPosition(): void {
        this.state.player.x = CANVAS_WIDTH / 2 - PLAYER_SIZE / 2;
        this.state.player.y = CANVAS_HEIGHT - PLAYER_SIZE - 20;
        this.state.player.rotation = 0;
        this.state.playerOnLog = null;
        this.isMoving = false;
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

            // Wrap around screen
            if (vehicle.speed > 0 && vehicle.x > CANVAS_WIDTH + 50) {
                vehicle.x = -vehicle.width - 50;
            } else if (vehicle.speed < 0 && vehicle.x < -vehicle.width - 50) {
                vehicle.x = CANVAS_WIDTH + 50;
            }
        }
    }

    private updateLogs(): void {
        this.state.playerOnLog = null;

        for (const log of this.state.logs) {
            log.x += log.speed;

            // Check if player is on this log
            if (this.isPlayerInWater() && this.isOnLog(this.state.player, log)) {
                this.state.playerOnLog = log;
                // Move player with log, but keep within canvas bounds
                const newPlayerX = this.state.player.x + log.speed;
                this.state.player.x = Math.max(0, Math.min(CANVAS_WIDTH - this.state.player.width, newPlayerX));
            }

            // Wrap around screen
            if (log.speed > 0 && log.x > CANVAS_WIDTH + 50) {
                log.x = -log.width - 50;
            } else if (log.speed < 0 && log.x < -log.width - 50) {
                log.x = CANVAS_WIDTH + 50;
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

        // Check if player falls off the side while on a log
        if (this.state.playerOnLog && 
            (this.state.player.x < -5 || this.state.player.x > CANVAS_WIDTH - this.state.player.width + 5)) {
            this.playerHit();
            return;
        }
    }

    private isColliding(rect1: GameObject, rect2: GameObject): boolean {
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
        
        // Update high score
        if (this.state.score > this.state.highScore) {
            this.state.highScore = this.state.score;
            localStorage.setItem('froggerHighScore', this.state.highScore.toString());
        }
        
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }
        
        this.updateDisplay();
    }

    private draw(): void {
        // Clear canvas with grass background
        this.ctx.fillStyle = this.colors.grass;
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw safe zone (bottom)
        this.ctx.fillStyle = this.colors.safeZone;
        this.ctx.fillRect(0, 360, CANVAS_WIDTH, 40);

        // Draw safe zone (middle)
        this.ctx.fillStyle = this.colors.safeZone;
        this.ctx.fillRect(0, 140, CANVAS_WIDTH, 20);

        // Draw road
        this.ctx.fillStyle = this.colors.road;
        this.ctx.fillRect(0, 160, CANVAS_WIDTH, 180);

        // Draw road lines (simplified)
        this.ctx.strokeStyle = this.colors.roadLine;
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([10, 10]);
        for (let y = 180; y < 340; y += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(CANVAS_WIDTH, y);
            this.ctx.stroke();
        }
        this.ctx.setLineDash([]);

        // Draw water
        this.ctx.fillStyle = this.colors.water;
        this.ctx.fillRect(0, 20, CANVAS_WIDTH, 120);

        // Draw goal zone (simplified - just a line)
        this.ctx.fillStyle = this.colors.goal;
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, 20);

        // Draw vehicles
        for (const vehicle of this.state.vehicles) {
            this.drawVehicle(vehicle);
        }

        // Draw logs
        for (const log of this.state.logs) {
            this.drawLog(log);
        }

        // Draw player (frog)
        this.drawFrog(this.state.player);

        // Draw game over overlay
        if (this.state.gameOver) {
            const overlayColor = this.hexToRgba(this.colors.overlay, 0.75);
            this.ctx.fillStyle = overlayColor;
            this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            this.ctx.fillStyle = this.colors.gameOverText;
            this.ctx.font = 'bold 28px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 15);

            this.ctx.fillStyle = this.colors.whiteText;
            this.ctx.font = '16px Arial';
            this.ctx.fillText(`Score: ${this.state.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
            
            if (this.state.score === this.state.highScore && this.state.score > 0) {
                this.ctx.fillStyle = this.colors.goldText;
                this.ctx.font = '14px Arial';
                this.ctx.fillText('NEW HIGH SCORE', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 45);
            }
        }
    }

    private hexToRgba(hex: string, alpha: number): string {
        // Handle both RGB and RGBA inputs
        if (hex.startsWith('rgb')) {
            // If already rgb/rgba, extract RGB values and apply new alpha
            const match = hex.match(/\d+/g);
            if (match && match.length >= 3) {
                return `rgba(${match[0]}, ${match[1]}, ${match[2]}, ${alpha})`;
            }
        }
        
        // Remove # if present
        hex = hex.replace('#', '');
        
        // Handle 3-digit hex codes
        if (hex.length === 3) {
            hex = hex.split('').map(c => c + c).join('');
        }
        
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    private drawVehicle(vehicle: Vehicle): void {
        // Simple solid rectangle for vehicle
        this.ctx.fillStyle = vehicle.color;
        this.ctx.fillRect(vehicle.x, vehicle.y, vehicle.width, vehicle.height);
    }

    private drawLog(log: Log): void {
        // Simple solid rectangle for log
        this.ctx.fillStyle = this.colors.log;
        this.ctx.fillRect(log.x, log.y, log.width, log.height);
    }

    private drawFrog(player: FroggerPlayer): void {
        this.ctx.save();
        
        // Translate to player center for rotation
        const centerX = player.x + player.width / 2;
        const centerY = player.y + player.height / 2;
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate((player.rotation * Math.PI) / 180);
        this.ctx.translate(-centerX, -centerY);
        
        // Simple solid rectangle for frog
        this.ctx.fillStyle = this.colors.frog;
        this.ctx.fillRect(player.x, player.y, player.width, player.height);
        
        this.ctx.restore();
    }

    private updateDisplay(): void {
        const scoreEl = document.getElementById('score');
        const livesEl = document.getElementById('lives');
        const levelEl = document.getElementById('level');
        const highScoreEl = document.getElementById('highScore');

        if (scoreEl) scoreEl.textContent = this.state.score.toString();
        if (livesEl) livesEl.textContent = this.state.lives.toString();
        if (levelEl) levelEl.textContent = this.state.level.toString();
        if (highScoreEl) highScoreEl.textContent = this.state.highScore.toString();
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
