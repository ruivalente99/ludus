export interface GameConfig {
    id: string;
    name: string;
    emoji: string;
    description?: string;
}
export const GAMES_CONFIG: GameConfig[] = [
    {
        id: 'ticTacToe',
        name: 'Tic Tac Toe',
        emoji: '⭕',
        description: 'Classic 3x3 grid game'
    },
    {
        id: 'rockPaperScissors',
        name: 'Rock Paper Scissors',
        emoji: '✂️',
        description: 'The timeless hand game'
    },
    {
        id: 'numbers',
        name: 'Number Merge',
        emoji: '🔢',
        description: 'Combine tiles to reach the highest score'
    },
    {
        id: 'paddle',
        name: 'Paddle Ball',
        emoji: '🏓',
        description: 'Keep the ball bouncing'
    },
    {
        id: 'blocks',
        name: 'Block Puzzle',
        emoji: '🧩',
        description: 'Fit the blocks perfectly'
    },
    {
        id: 'spaceInvaders',
        name: 'Galaxy Defense',
        emoji: '👾',
        description: 'Defend Earth from alien invasion'
    },
    {
        id: 'snake',
        name: 'Snake',
        emoji: '🐍',
        description: 'Grow your snake by eating food'
    },
    {
        id: 'breakout',
        name: 'Breakout',
        emoji: '🧱',
        description: 'Break all the bricks'
    },
    {
        id: 'memory',
        name: 'Memory Match',
        emoji: '🧠',
        description: 'Match pairs of cards'
    },
    {
        id: 'frogger',
        name: 'Road Crosser',
        emoji: '🐸',
        description: 'Help the frog cross safely'
    },
    {
        id: 'asteroids',
        name: 'Asteroids',
        emoji: '🚀',
        description: 'Navigate through space debris'
    },
    {
        id: 'pong',
        name: 'Pong',
        emoji: '🏓',
        description: 'The original arcade tennis'
    },
    {
        id: 'minesweeper',
        name: 'Minesweeper',
        emoji: '💣',
        description: 'Clear the field without hitting mines'
    },
    {
        id: 'flappyBird',
        name: 'Wing Flap',
        emoji: '🐦',
        description: 'Navigate through obstacles by tapping'
    }
];
export function getGameConfig(gameId: string): GameConfig | undefined {
    return GAMES_CONFIG.find(game => game.id === gameId);
}
export function getGameTitle(gameId: string): string {
    const game = getGameConfig(gameId);
    return game ? game.name : 'Game';
}
import * as vscode from 'vscode';
export function getFavorites(): string[] {
    const config = vscode.workspace.getConfiguration('ludus');
    return config.get('favorites', []);
}
export async function addFavorite(gameId: string): Promise<void> {
    const config = vscode.workspace.getConfiguration('ludus');
    const favorites = getFavorites();
    if (!favorites.includes(gameId)) {
        favorites.push(gameId);
        await config.update('favorites', favorites, vscode.ConfigurationTarget.Global);
    }
}
export async function removeFavorite(gameId: string): Promise<void> {
    const config = vscode.workspace.getConfiguration('ludus');
    const favorites = getFavorites();
    const index = favorites.indexOf(gameId);
    if (index > -1) {
        favorites.splice(index, 1);
        await config.update('favorites', favorites, vscode.ConfigurationTarget.Global);
    }
}
export async function toggleFavorite(gameId: string): Promise<boolean> {
    const favorites = getFavorites();
    const isFavorited = favorites.includes(gameId);
    if (isFavorited) {
        await removeFavorite(gameId);
        return false;
    } else {
        await addFavorite(gameId);
        return true;
    }
}
export function isFavorite(gameId: string): boolean {
    return getFavorites().includes(gameId);
}
