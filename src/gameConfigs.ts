export enum GameStartMode {
    AUTO_START = 'autoStart',           // Games that start immediately (Pong, Breakout, etc.)
    PRESS_TO_START = 'pressToStart',    // Games that wait for user input (Space Invaders, etc.)
    MANUAL_START = 'manualStart'        // Games that require clicking "New Game" (Numbers, Memory, etc.)
}

export const GAME_CONFIGS = {
    spaceInvaders: GameStartMode.PRESS_TO_START,
    breakout: GameStartMode.AUTO_START,
    pong: GameStartMode.AUTO_START,
    asteroids: GameStartMode.PRESS_TO_START,
    frogger: GameStartMode.AUTO_START,
    memory: GameStartMode.PRESS_TO_START,         // First-click start
    minesweeper: GameStartMode.PRESS_TO_START,    // First-click start (traditional minesweeper)
    numbers: GameStartMode.MANUAL_START,
    blocks: GameStartMode.AUTO_START,
    paddle: GameStartMode.AUTO_START,
    flappyBird: GameStartMode.PRESS_TO_START,
    snake: GameStartMode.PRESS_TO_START,         // Start on first key press (WASD/Arrow)
    ticTacToe: GameStartMode.MANUAL_START,
    rockPaperScissors: GameStartMode.MANUAL_START,
    tetris: GameStartMode.AUTO_START
};
