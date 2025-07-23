interface AsteroidsPlayer {
    x: number;
    y: number;
    angle: number;
    thrust: boolean;
    velocity: { x: number; y: number };
}
interface Asteroid {
    x: number;
    y: number;
    size: number;
    velocity: { x: number; y: number };
    rotation: number;
    rotationSpeed: number;
}
interface Bullet {
    x: number;
    y: number;
    velocity: { x: number; y: number };
    life: number;
}
interface AsteroidsGameState {
    player: AsteroidsPlayer;
    asteroids: Asteroid[];
    bullets: Bullet[];
    score: number;
    lives: number;
    gameActive: boolean;
    gameOver: boolean;
    level: number;
    invulnerable: number;
}
class AsteroidsGame {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private state: AsteroidsGameState;
    private vscode: any;
    private gameLoop: number | null = null;
    private keys: { [key: string]: boolean } = {};
    private readonly CANVAS_WIDTH = 400;
    private readonly CANVAS_HEIGHT = 400;
    constructor() {
        this.vscode = (window as any).vscode || (window as any).acquireVsCodeApi();
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.state = {
            player: { x: 200, y: 200, angle: 0, thrust: false, velocity: { x: 0, y: 0 } },
            asteroids: [],
            bullets: [],
            score: 0,
            lives: 3,
            gameActive: false,
            gameOver: false,
            level: 1,
            invulnerable: 0
        };
        this.init();
    }
    private init(): void {
        this.canvas.width = this.CANVAS_WIDTH;
        this.canvas.height = this.CANVAS_HEIGHT;
        this.setupControls();
        this.createAsteroids();
        this.updateDisplay();
        this.draw();
    }
    private setupControls(): void {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        this.canvas.addEventListener('click', (e) => {
            if (!this.state.gameActive) return;
            this.shoot();
        });
    }
    private createAsteroids(): void {
        this.state.asteroids = [];
        const count = 4 + this.state.level;
        for (let i = 0; i < count; i++) {
            let x, y;
            do {
                x = Math.random() * this.CANVAS_WIDTH;
                y = Math.random() * this.CANVAS_HEIGHT;
            } while (this.distance(x, y, this.state.player.x, this.state.player.y) < 100);
            this.state.asteroids.push({
                x: x,
                y: y,
                size: 3,
                velocity: {
                    x: (Math.random() - 0.5) * 2,
                    y: (Math.random() - 0.5) * 2
                },
                rotation: 0,
                rotationSpeed: (Math.random() - 0.5) * 0.1
            });
        }
    }
    public startGame(): void {
        this.state.gameActive = true;
        this.state.gameOver = false;
        this.state.score = 0;
        this.state.lives = 3;
        this.state.level = 1;
        this.state.player = { x: 200, y: 200, angle: 0, thrust: false, velocity: { x: 0, y: 0 } };
        this.state.bullets = [];
        this.state.invulnerable = 0;
        this.createAsteroids();
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
        this.state.player = { x: 200, y: 200, angle: 0, thrust: false, velocity: { x: 0, y: 0 } };
        this.state.bullets = [];
        this.state.invulnerable = 0;
        this.createAsteroids();
        this.updateDisplay();
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }
        this.draw();
    }
    private update(): void {
        if (!this.state.gameActive || this.state.gameOver) return;
        this.updatePlayer();
        this.updateBullets();
        this.updateAsteroids();
        this.checkCollisions();
        this.checkGameState();
        this.draw();
        this.updateDisplay();
        if (this.state.invulnerable > 0) {
            this.state.invulnerable--;
        }
        this.gameLoop = requestAnimationFrame(() => this.update());
    }
    private updatePlayer(): void {
        const player = this.state.player;
        if (this.keys['a'] || this.keys['arrowleft']) {
            player.angle -= 0.1;
        }
        if (this.keys['d'] || this.keys['arrowright']) {
            player.angle += 0.1;
        }
        player.thrust = this.keys['w'] || this.keys['arrowup'];
        if (player.thrust) {
            const thrustPower = 0.2;
            player.velocity.x += Math.cos(player.angle) * thrustPower;
            player.velocity.y += Math.sin(player.angle) * thrustPower;
        }
        if (this.keys[' '] || this.keys['spacebar']) {
            this.shoot();
        }
        player.x += player.velocity.x;
        player.y += player.velocity.y;
        player.velocity.x *= 0.99;
        player.velocity.y *= 0.99;
        if (player.x < 0) player.x = this.CANVAS_WIDTH;
        if (player.x > this.CANVAS_WIDTH) player.x = 0;
        if (player.y < 0) player.y = this.CANVAS_HEIGHT;
        if (player.y > this.CANVAS_HEIGHT) player.y = 0;
    }
    private updateBullets(): void {
        this.state.bullets = this.state.bullets.filter(bullet => {
            bullet.x += bullet.velocity.x;
            bullet.y += bullet.velocity.y;
            bullet.life--;
            if (bullet.x < 0) bullet.x = this.CANVAS_WIDTH;
            if (bullet.x > this.CANVAS_WIDTH) bullet.x = 0;
            if (bullet.y < 0) bullet.y = this.CANVAS_HEIGHT;
            if (bullet.y > this.CANVAS_HEIGHT) bullet.y = 0;
            return bullet.life > 0;
        });
    }
    private updateAsteroids(): void {
        for (const asteroid of this.state.asteroids) {
            asteroid.x += asteroid.velocity.x;
            asteroid.y += asteroid.velocity.y;
            asteroid.rotation += asteroid.rotationSpeed;
            if (asteroid.x < 0) asteroid.x = this.CANVAS_WIDTH;
            if (asteroid.x > this.CANVAS_WIDTH) asteroid.x = 0;
            if (asteroid.y < 0) asteroid.y = this.CANVAS_HEIGHT;
            if (asteroid.y > this.CANVAS_HEIGHT) asteroid.y = 0;
        }
    }
    private shoot(): void {
        if (this.state.bullets.length >= 4) return;
        const player = this.state.player;
        const speed = 5;
        this.state.bullets.push({
            x: player.x,
            y: player.y,
            velocity: {
                x: Math.cos(player.angle) * speed,
                y: Math.sin(player.angle) * speed
            },
            life: 60
        });
    }
    private checkCollisions(): void {
        for (let i = this.state.bullets.length - 1; i >= 0; i--) {
            const bullet = this.state.bullets[i];
            for (let j = this.state.asteroids.length - 1; j >= 0; j--) {
                const asteroid = this.state.asteroids[j];
                const radius = asteroid.size * 8;
                if (this.distance(bullet.x, bullet.y, asteroid.x, asteroid.y) < radius) {
                    this.state.bullets.splice(i, 1);
                    this.breakAsteroid(asteroid, j);
                    break;
                }
            }
        }
        if (this.state.invulnerable === 0) {
            for (const asteroid of this.state.asteroids) {
                const radius = asteroid.size * 8;
                if (this.distance(this.state.player.x, this.state.player.y, asteroid.x, asteroid.y) < radius + 5) {
                    this.playerHit();
                    break;
                }
            }
        }
    }
    private breakAsteroid(asteroid: Asteroid, index: number): void {
        const points = asteroid.size === 3 ? 20 : asteroid.size === 2 ? 50 : 100;
        this.state.score += points;
        this.state.asteroids.splice(index, 1);
        if (asteroid.size > 1) {
            for (let i = 0; i < 2; i++) {
                this.state.asteroids.push({
                    x: asteroid.x,
                    y: asteroid.y,
                    size: asteroid.size - 1,
                    velocity: {
                        x: (Math.random() - 0.5) * 3,
                        y: (Math.random() - 0.5) * 3
                    },
                    rotation: 0,
                    rotationSpeed: (Math.random() - 0.5) * 0.2
                });
            }
        }
    }
    private playerHit(): void {
        this.state.lives--;
        this.state.invulnerable = 120;
        this.state.player.velocity = { x: 0, y: 0 };
        if (this.state.lives <= 0) {
            this.endGame();
        }
    }
    private checkGameState(): void {
        if (this.state.asteroids.length === 0) {
            this.state.level++;
            this.createAsteroids();
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
    private distance(x1: number, y1: number, x2: number, y2: number): number {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }
    private draw(): void {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
        this.ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 50; i++) {
            const x = (i * 37) % this.CANVAS_WIDTH;
            const y = (i * 23) % this.CANVAS_HEIGHT;
            this.ctx.fillRect(x, y, 1, 1);
        }
        if (this.state.invulnerable === 0 || Math.floor(this.state.invulnerable / 10) % 2 === 0) {
            this.drawPlayer();
        }
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        for (const asteroid of this.state.asteroids) {
            this.drawAsteroid(asteroid);
        }
        this.ctx.fillStyle = '#ffff00';
        for (const bullet of this.state.bullets) {
            this.ctx.fillRect(bullet.x - 1, bullet.y - 1, 2, 2);
        }
        if (this.state.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
            this.ctx.fillStyle = '#ff0000';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '16px Arial';
            this.ctx.fillText(`Final Score: ${this.state.score}`, this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 + 30);
        }
    }
    private drawPlayer(): void {
        const player = this.state.player;
        this.ctx.save();
        this.ctx.translate(player.x, player.y);
        this.ctx.rotate(player.angle);
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(10, 0);
        this.ctx.lineTo(-8, -6);
        this.ctx.lineTo(-8, 6);
        this.ctx.closePath();
        this.ctx.stroke();
        if (player.thrust) {
            this.ctx.strokeStyle = '#ff8800';
            this.ctx.beginPath();
            this.ctx.moveTo(-8, -3);
            this.ctx.lineTo(-15, 0);
            this.ctx.lineTo(-8, 3);
            this.ctx.stroke();
        }
        this.ctx.restore();
    }
    private drawAsteroid(asteroid: Asteroid): void {
        this.ctx.save();
        this.ctx.translate(asteroid.x, asteroid.y);
        this.ctx.rotate(asteroid.rotation);
        const size = asteroid.size * 8;
        const points = 8;
        this.ctx.beginPath();
        for (let i = 0; i < points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const radius = size + Math.sin(i) * 3;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.closePath();
        this.ctx.stroke();
        this.ctx.restore();
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
function startAsteroidsGame(): void {
    (window as any).asteroidsGame?.startGame();
}
function resetAsteroidsGame(): void {
    (window as any).asteroidsGame?.resetGame();
}
function backToAsteroidsMenu(): void {
    const vscode = (window as any).vscode || (window as any).acquireVsCodeApi();
    vscode.postMessage({
        type: 'backToMenu'
    });
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        (window as any).asteroidsGame = new AsteroidsGame();
    });
} else {
    (window as any).asteroidsGame = new AsteroidsGame();
}
