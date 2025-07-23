import * as vscode from 'vscode';
import { GAMES_CONFIG, getGameConfig, getGameTitle, getFavorites, toggleFavorite as toggleFavoriteConfig } from './gamesConfig';

export class GameProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'ludusView';
    private _view?: vscode.WebviewView;
    private _currentGame: string = 'menu';

    constructor(private readonly _extensionUri: vscode.Uri) {
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('ludus')) {
                this._updateView();
            }
        });
    }

    public setCurrentGame(game: string): void {
        this._currentGame = game;
        this._updateView();
    }

    public getThemeCSS(): string {
        const config = vscode.workspace.getConfiguration('ludus');
        const theme = config.get('theme', 'default') as string;
        
        switch (theme) {
            case 'dark':
                return this._getDarkThemeCSS();
            case 'light':
                return this._getLightThemeCSS();
            case 'matrix':
                return this._getMatrixThemeCSS();
            default:
                return '';
        }
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                this._extensionUri
            ]
        };

        webviewView.webview.html = this._getHtmlForWebview();

        webviewView.webview.onDidReceiveMessage(async data => {
            switch (data.type) {
                case 'playGame':
                    this._currentGame = data.game;
                    this._updateView();
                    break;
                case 'backToMenu':
                    this._currentGame = 'menu';
                    this._updateView();
                    break;
                case 'gameAction':
                    this._handleGameAction(data);
                    break;
                case 'openInNewWindow':
                    this._openGameInNewWindow(data.game);
                    break;
                case 'toggleFavorite':
                    const isFavorited = await toggleFavoriteConfig(data.gameId);
                    webviewView.webview.postMessage({
                        type: 'favoriteToggled',
                        gameId: data.gameId,
                        isFavorited: isFavorited
                    });
                    break;
                case 'getFavorites':
                    const favorites = getFavorites();
                    webviewView.webview.postMessage({
                        type: 'favoritesLoaded',
                        favorites: favorites
                    });
                    break;
            }
        });
    }

    private _updateView() {
        if (this._view) {
            this._view.webview.html = this._getHtmlForWebview();
        }
    }

    private _handleGameAction(data: any) {
        this._view?.webview.postMessage({
            type: 'gameResponse',
            game: this._currentGame,
            action: data.action,
            data: data.data
        });
    }

    private _openGameInNewWindow(game: string) {
        const panel = vscode.window.createWebviewPanel(
            'ludusGame',
            `🎮 ${this._getGameTitle(game)}`,
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [this._extensionUri]
            }
        );

        panel.webview.html = this._getGameHtml(game, true);
        panel.webview.onDidReceiveMessage(data => {
            if (data.type === 'backToMenu') {
                panel.dispose();
            }
        });
    }

    private _getGameTitle(game: string): string {
        return getGameTitle(game);
    }

    private _getHtmlForWebview(): string {
        if (this._currentGame === 'menu') {
            return this._getMenuHtml();
        } else {
            return this._getGameHtml(this._currentGame);
        }
    }

    private _getGameHtml(game: string, isNewWindow: boolean = false): string {
        switch (game) {
            case 'ticTacToe': return this._getTicTacToeHtml(isNewWindow);
            case 'rockPaperScissors': return this._getRockPaperScissorsHtml(isNewWindow);
            case 'numbers': return this._getNumbersHtml(isNewWindow);
            case 'paddle': return this._getPaddleHtml(isNewWindow);
            case 'blocks': return this._getBlocksHtml(isNewWindow);
            case 'spaceInvaders': return this._getSpaceInvadersHtml(isNewWindow);
            case 'snake': return this._getSnakeHtml(isNewWindow);
            case 'breakout': return this._getBreakoutHtml(isNewWindow);
            case 'memory': return this._getMemoryHtml(isNewWindow);
            case 'frogger': return this._getFroggerHtml(isNewWindow);
            case 'asteroids': return this._getAsteroidsHtml(isNewWindow);
            case 'pong': return this._getPongHtml(isNewWindow);
            case 'minesweeper': return this._getMinesweeperHtml(isNewWindow);
            case 'flappyBird': return this._getFlappyBirdHtml(isNewWindow);
            default: return this._getMenuHtml();
        }
    }

    private _getMenuHtml(): string {
        const themeCSS = this.getThemeCSS();
        const logoUri = this._view?.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'ludus.png'));
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Games Menu</title>
            <style>
                ${themeCSS}
                body {
                    font-family: var(--vscode-font-family);
                    color: var(--vscode-foreground);
                    background: var(--vscode-editor-background);
                    padding: 16px;
                    margin: 0;
                }
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .logo {
                    width: 64px;
                    height: 64px;
                    margin: 0 auto 8px;
                    display: block;
                }
                h1 {
                    color: var(--vscode-titleBar-activeForeground);
                    margin: 8px 0 4px;
                    font-size: 18px;
                }
                .subtitle {
                    color: var(--vscode-descriptionForeground);
                    font-size: 12px;
                    margin-bottom: 16px;
                }
                .search-container {
                    margin-bottom: 16px;
                    position: relative;
                }
                .search-input {
                    width: 100%;
                    padding: 8px 32px 8px 12px;
                    background: var(--vscode-input-background);
                    border: 1px solid var(--vscode-input-border);
                    border-radius: 6px;
                    color: var(--vscode-input-foreground);
                    font-size: 14px;
                    box-sizing: border-box;
                }
                .search-input:focus {
                    outline: none;
                    border-color: var(--vscode-focusBorder);
                }
                .search-icon {
                    position: absolute;
                    right: 8px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--vscode-input-placeholderForeground);
                    pointer-events: none;
                }
                .section {
                    margin-bottom: 20px;
                }
                .section-title {
                    font-size: 14px;
                    font-weight: bold;
                    color: var(--vscode-titleBar-activeForeground);
                    margin-bottom: 8px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .section-title .count {
                    background: var(--vscode-badge-background);
                    color: var(--vscode-badge-foreground);
                    font-size: 10px;
                    padding: 2px 6px;
                    border-radius: 10px;
                    font-weight: normal;
                }
                .game-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                }
                .game-btn {
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    border-radius: 6px;
                    padding: 12px 8px;
                    cursor: pointer;
                    font-size: 12px;
                    text-align: center;
                    transition: all 0.2s;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                    min-height: 80px;
                    user-select: none;
                }
                .game-btn:hover {
                    background: var(--vscode-button-hoverBackground);
                    transform: translateY(-1px);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                .game-btn:active {
                    transform: translateY(0);
                }
                .game-btn.favorited {
                    border: 2px solid var(--vscode-charts-yellow);
                }
                .emoji {
                    display: block;
                    font-size: 20px;
                    margin-bottom: 4px;
                    pointer-events: none;
                }
                .game-name {
                    font-size: 11px;
                    font-weight: 500;
                    line-height: 1.2;
                    text-align: center;
                    word-wrap: break-word;
                    pointer-events: none;
                }
                .favorite-btn {
                    position: absolute;
                    top: 4px;
                    right: 4px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 12px;
                    color: var(--vscode-input-placeholderForeground);
                    transition: all 0.2s;
                    padding: 2px;
                    z-index: 1;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .favorite-btn:hover {
                    color: var(--vscode-charts-yellow);
                    transform: scale(1.1);
                }
                .favorite-btn.active {
                    color: var(--vscode-charts-yellow);
                }
                .no-results {
                    text-align: center;
                    color: var(--vscode-descriptionForeground);
                    font-style: italic;
                    margin: 20px 0;
                }
                .hidden {
                    display: none !important;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <img src="${logoUri}" alt="Ludus Logo" class="logo">
                <div class="subtitle">Choose your adventure</div>
            </div>
            
            <div class="search-container">
                <input type="text" id="searchInput" class="search-input" placeholder="Search games..." onkeyup="filterGames()">
                <span class="search-icon">🔍</span>
            </div>

            <div id="favoritesSection" class="section">
                <div class="section-title">
                    ⭐ Favorites
                    <span id="favoritesCount" class="count">0</span>
                </div>
                <div id="favoritesGrid" class="game-grid">
                    <div class="no-results">No favorites yet. Click ⭐ to add games!</div>
                </div>
            </div>

            <div id="allGamesSection" class="section">
                <div class="section-title">
                    🎲 All Games
                    <span id="allGamesCount" class="count">${GAMES_CONFIG.length}</span>
                </div>
                <div id="allGamesGrid" class="game-grid">
                    ${GAMES_CONFIG.map(game => `
                        <div class="game-btn" data-game="${game.id}" data-name="${game.name}" onclick="playGame('${game.id}')">
                            <div class="favorite-btn" onclick="toggleFavorite(event, '${game.id}')" title="Add to favorites">☆</div>
                            <span class="emoji">${game.emoji}</span>
                            <span class="game-name">${game.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <script>
                const vscode = acquireVsCodeApi();
                let favorites = [];
                function loadFavorites() {
                    vscode.postMessage({
                        type: 'getFavorites'
                    });
                }
                function toggleFavorite(event, gameId) {
                    event.stopPropagation();
                    
                    vscode.postMessage({
                        type: 'toggleFavorite',
                        gameId: gameId
                    });
                }
                function updateFavoritesDisplay() {
                    const favoritesGrid = document.getElementById('favoritesGrid');
                    const favoritesCount = document.getElementById('favoritesCount');
                    const favoritesSection = document.getElementById('favoritesSection');
                    document.querySelectorAll('.game-btn').forEach(btn => {
                        const gameId = btn.getAttribute('data-game');
                        const favoriteBtn = btn.querySelector('.favorite-btn');
                        const isFavorited = favorites.includes(gameId);
                        
                        if (isFavorited) {
                            btn.classList.add('favorited');
                            favoriteBtn.classList.add('active');
                            favoriteBtn.innerHTML = '⭐';
                            favoriteBtn.title = 'Remove from favorites';
                        } else {
                            btn.classList.remove('favorited');
                            favoriteBtn.classList.remove('active');
                            favoriteBtn.innerHTML = '☆';
                            favoriteBtn.title = 'Add to favorites';
                        }
                    });
                    if (favorites.length === 0) {
                        favoritesGrid.innerHTML = '<div class="no-results">No favorites yet. Click ☆ to add games!</div>';
                        favoritesSection.style.display = 'none';
                    } else {
                        favoritesSection.style.display = 'block';
                        favoritesGrid.innerHTML = '';
                        
                        favorites.forEach(gameId => {
                            const originalBtn = document.querySelector(\`[data-game="\${gameId}"]\`);
                            if (originalBtn) {
                                const clone = originalBtn.cloneNode(true);
                                const cloneFavoriteBtn = clone.querySelector('.favorite-btn');
                                if (cloneFavoriteBtn) {
                                    cloneFavoriteBtn.onclick = (e) => toggleFavorite(e, gameId);
                                }
                                favoritesGrid.appendChild(clone);
                            }
                        });
                    }
                    
                    favoritesCount.textContent = favorites.length;
                }
                window.addEventListener('message', event => {
                    const message = event.data;
                    switch (message.type) {
                        case 'favoritesLoaded':
                            favorites = message.favorites;
                            updateFavoritesDisplay();
                            break;
                        case 'favoriteToggled':
                            if (message.isFavorited) {
                                if (!favorites.includes(message.gameId)) {
                                    favorites.push(message.gameId);
                                }
                            } else {
                                const index = favorites.indexOf(message.gameId);
                                if (index > -1) {
                                    favorites.splice(index, 1);
                                }
                            }
                            updateFavoritesDisplay();
                            break;
                    }
                });
                function filterGames() {
                    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
                    const gameButtons = document.querySelectorAll('#allGamesGrid .game-btn');
                    const allGamesCount = document.getElementById('allGamesCount');
                    let visibleCount = 0;

                    gameButtons.forEach(btn => {
                        const gameName = btn.getAttribute('data-name').toLowerCase();
                        const gameId = btn.getAttribute('data-game').toLowerCase();
                        
                        if (gameName.includes(searchTerm) || gameId.includes(searchTerm)) {
                            btn.classList.remove('hidden');
                            visibleCount++;
                        } else {
                            btn.classList.add('hidden');
                        }
                    });

                    allGamesCount.textContent = visibleCount;
                    const noResults = document.querySelector('#allGamesGrid .no-results');
                    if (noResults) noResults.remove();
                    
                    if (visibleCount === 0 && searchTerm) {
                        const noResultsDiv = document.createElement('div');
                        noResultsDiv.className = 'no-results';
                        noResultsDiv.textContent = \`No games found for "\${searchTerm}"\`;
                        document.getElementById('allGamesGrid').appendChild(noResultsDiv);
                    }
                }

                function playGame(game) {
                    vscode.postMessage({
                        type: 'playGame',
                        game: game
                    });
                }
                window.addEventListener('load', () => {
                    loadFavorites();
                });
                loadFavorites();
            </script>
        </body>
        </html>`;
    }

    private _getTicTacToeHtml(isNewWindow: boolean = false): string {
        const themeCSS = this.getThemeCSS();
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Tic Tac Toe</title>
            <style>
                ${themeCSS}
                body {
                    font-family: var(--vscode-font-family);
                    color: var(--vscode-foreground);
                    background: var(--vscode-editor-background);
                    padding: 16px;
                    margin: 0;
                    text-align: center;
                }
                h1 { font-size: 18px; margin-bottom: 16px; }
                .board {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 4px;
                    width: 200px;
                    height: 200px;
                    margin: 16px auto;
                    background: var(--vscode-input-border);
                    border-radius: 8px;
                    padding: 8px;
                }
                .cell {
                    background: var(--vscode-input-background);
                    border: none;
                    font-size: 28px;
                    font-weight: bold;
                    cursor: pointer;
                    border-radius: 6px;
                    color: var(--vscode-foreground);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                    min-height: 58px;
                    min-width: 58px;
                }
                .cell:hover:not(.taken) {
                    background: var(--vscode-button-hoverBackground);
                    transform: scale(1.05);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                .status { margin: 16px 0; font-weight: bold; }
                .controls { margin-top: 16px; }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }
                .back-btn {
                    background: var(--vscode-button-secondaryBackground);
                    color: var(--vscode-button-secondaryForeground);
                    border: none;
                    border-radius: 4px;
                    padding: 6px 12px;
                    cursor: pointer;
                    font-size: 14px;
                    margin: 0;
                }
                .back-btn:hover { 
                    background: var(--vscode-button-secondaryHoverBackground); 
                }
                .new-window-btn {
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    border-radius: 4px;
                    padding: 6px 12px;
                    cursor: pointer;
                    font-size: 12px;
                    margin: 0;
                }
                .new-window-btn:hover { 
                    background: var(--vscode-button-hoverBackground); 
                }
                button {
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    border-radius: 4px;
                    padding: 8px 16px;
                    cursor: pointer;
                    margin: 4px;
                }
                button:hover { background: var(--vscode-button-hoverBackground); }
            </style>
        </head>
        <body>
            <div class="header">
                <button class="back-btn" onclick="backToMenuTTT()">← Back</button>
                ${!isNewWindow ? '<button class="new-window-btn" onclick="openInNewWindow(\'ticTacToe\')">🗗 New Window</button>' : ''}
            </div>
            <h1>⭕ Tic Tac Toe</h1>
            <div class="board" id="board"></div>
            <div class="status" id="status">Your turn (X)</div>
            <div class="controls">
                <button onclick="resetGameTTT()">New Game</button>
                <button onclick="toggleGameMode()" id="modeBtn">Switch to vs Player</button>
            </div>

            <script>
                const vscode = acquireVsCodeApi();
                function openInNewWindow(game) {
                    vscode.postMessage({
                        type: 'openInNewWindow',
                        game: game
                    });
                }
                window.vscode = vscode;
            </script>
            <script src="${this._view?.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'out', 'games', 'ticTacToe.js'))}"></script>
        </body>
        </html>`;
    }

    private _getRockPaperScissorsHtml(isNewWindow: boolean = false): string {
        const themeCSS = this.getThemeCSS();
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Rock Paper Scissors</title>
            <style>
                ${themeCSS}
                body {
                    font-family: var(--vscode-font-family);
                    color: var(--vscode-foreground);
                    background: var(--vscode-editor-background);
                    padding: 16px;
                    margin: 0;
                    text-align: center;
                }
                h1 { font-size: 18px; margin-bottom: 16px; }
                .choices {
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                    margin: 24px 0;
                    flex-wrap: wrap;
                }
                .choice-btn {
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    border-radius: 12px;
                    padding: 16px 12px;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    min-width: 90px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    position: relative;
                    overflow: hidden;
                }
                .choice-btn::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
                    transition: left 0.5s;
                }
                .choice-btn:hover {
                    background: var(--vscode-button-hoverBackground);
                    transform: scale(1.05) translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                }
                .choice-btn:hover::before {
                    left: 100%;
                }
                .choice-btn:active {
                    transform: scale(0.95) translateY(0);
                    transition: transform 0.1s;
                }
                .hand-emoji {
                    font-size: 36px;
                    animation: bounce 2s infinite;
                    display: block;
                }
                .choice-name {
                    font-size: 12px;
                    font-weight: 500;
                    opacity: 0.8;
                }
                @keyframes bounce {
                    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                    40% { transform: translateY(-4px); }
                    60% { transform: translateY(-2px); }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-3px); }
                    75% { transform: translateX(3px); }
                }
                .choice-btn.selecting {
                    animation: shake 0.5s ease-in-out;
                    background: var(--vscode-button-hoverBackground);
                }
                .result {
                    margin: 24px 0;
                    font-size: 18px;
                    font-weight: bold;
                    min-height: 80px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 16px;
                    border-radius: 8px;
                    background: var(--vscode-input-background);
                    border: 1px solid var(--vscode-input-border);
                    transition: all 0.3s ease;
                }
                .result.winner {
                    background: rgba(0, 255, 0, 0.1);
                    border-color: rgba(0, 255, 0, 0.3);
                    animation: pulse 0.6s ease-in-out;
                }
                .result.loser {
                    background: rgba(255, 0, 0, 0.1);
                    border-color: rgba(255, 0, 0, 0.3);
                }
                .result.tie {
                    background: rgba(255, 255, 0, 0.1);
                    border-color: rgba(255, 255, 0, 0.3);
                }
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
                .result-choices {
                    font-size: 24px;
                    margin: 8px 0;
                }
                .vs-text {
                    font-size: 14px;
                    opacity: 0.7;
                    margin: 0 8px;
                }
                .scoreboard {
                    margin: 16px 0;
                    padding: 16px;
                    background: var(--vscode-input-background);
                    border-radius: 8px;
                    border: 1px solid var(--vscode-input-border);
                }
                .score-row {
                    display: flex;
                    justify-content: space-between;
                    margin: 8px 0;
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }
                .back-btn {
                    background: var(--vscode-button-secondaryBackground);
                    color: var(--vscode-button-secondaryForeground);
                    border: none;
                    border-radius: 4px;
                    padding: 6px 12px;
                    cursor: pointer;
                    font-size: 14px;
                    margin: 0;
                }
                .back-btn:hover { 
                    background: var(--vscode-button-secondaryHoverBackground); 
                }
                .new-window-btn {
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    border-radius: 4px;
                    padding: 6px 12px;
                    cursor: pointer;
                    font-size: 12px;
                    margin: 0;
                }
                .new-window-btn:hover { 
                    background: var(--vscode-button-hoverBackground); 
                }
                button {
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    border-radius: 4px;
                    padding: 8px 16px;
                    cursor: pointer;
                    margin: 4px;
                }
                button:hover { background: var(--vscode-button-hoverBackground); }
            </style>
        </head>
        <body>
            <div class="header">
                <button class="back-btn" onclick="backToMenuRPS()">← Back</button>
                ${!isNewWindow ? '<button class="new-window-btn" onclick="openInNewWindow(\'rockPaperScissors\')">🗗 New Window</button>' : ''}
            </div>
            <h1>✂️ Rock Paper Scissors</h1>
            
            <div class="scoreboard">
                <div class="score-row">
                    <span>You: <span id="playerScore">0</span></span>
                    <span>Bot: <span id="botScore">0</span></span>
                </div>
            </div>
            
            <div class="choices">
                <button class="choice-btn" onclick="playChoice('rock')" data-choice="rock">
                    <span class="hand-emoji">✊</span>
                    <span class="choice-name">Rock</span>
                </button>
                <button class="choice-btn" onclick="playChoice('paper')" data-choice="paper">
                    <span class="hand-emoji">✋</span>
                    <span class="choice-name">Paper</span>
                </button>
                <button class="choice-btn" onclick="playChoice('scissors')" data-choice="scissors">
                    <span class="hand-emoji">✌️</span>
                    <span class="choice-name">Scissors</span>
                </button>
            </div>
            
            <div class="result" id="result">
                <div class="result-choices">✊ <span class="vs-text">vs</span> ✋</div>
                <div>Choose your hand! 🎮</div>
            </div>
            
            <div class="controls">
                <button onclick="resetGameRPS()">Reset Score</button>
            </div>

            <script>
                const vscode = acquireVsCodeApi();
                function openInNewWindow(game) {
                    vscode.postMessage({
                        type: 'openInNewWindow',
                        game: game
                    });
                }
                window.vscode = vscode;
            </script>
            <script src="${this._view?.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'out', 'games', 'rockPaperScissors.js'))}"></script>
        </body>
        </html>`;
    }

    private _getNumbersHtml(isNewWindow: boolean = false): string {
        const themeCSS = this.getThemeCSS();
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>2048 Game</title>
            <style>
                ${themeCSS}
                body {
                    font-family: var(--vscode-font-family);
                    color: var(--vscode-foreground);
                    background: var(--vscode-editor-background);
                    padding: 16px;
                    margin: 0;
                    text-align: center;
                }
                h1 { font-size: 18px; margin-bottom: 16px; }
                .board {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 8px;
                    width: 240px;
                    height: 240px;
                    margin: 16px auto;
                    background: var(--vscode-input-border);
                    padding: 8px;
                    border-radius: 8px;
                }
                .tile {
                    background: var(--vscode-input-background);
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 18px;
                    transition: all 0.15s ease-in-out;
                    transform: scale(1);
                }
                .tile:not(:empty) {
                    animation: tileAppear 0.2s ease-in-out;
                }
                @keyframes tileAppear {
                    0% { transform: scale(0); opacity: 0; }
                    50% { transform: scale(1.1); opacity: 0.8; }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes tileMerge {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.2); }
                    100% { transform: scale(1); }
                }
                .tile-2 { background: #eee4da; color: #776e65; }
                .tile-4 { background: #ede0c8; color: #776e65; }
                .tile-8 { background: #f2b179; color: #f9f6f2; }
                .tile-16 { background: #f59563; color: #f9f6f2; }
                .tile-32 { background: #f67c5f; color: #f9f6f2; }
                .tile-64 { background: #f65e3b; color: #f9f6f2; }
                .tile-128 { background: #edcf72; color: #f9f6f2; font-size: 16px; }
                .tile-256 { background: #edcc61; color: #f9f6f2; font-size: 16px; }
                .tile-512 { background: #edc850; color: #f9f6f2; font-size: 16px; }
                .tile-1024 { background: #edc53f; color: #f9f6f2; font-size: 14px; }
                .tile-2048 { background: #edc22e; color: #f9f6f2; font-size: 14px; }
                .score { font-weight: bold; margin: 8px 0; }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }
                .back-btn {
                    background: var(--vscode-button-secondaryBackground);
                    color: var(--vscode-button-secondaryForeground);
                    border: none;
                    border-radius: 4px;
                    padding: 6px 12px;
                    cursor: pointer;
                    font-size: 14px;
                    margin: 0;
                }
                .back-btn:hover { 
                    background: var(--vscode-button-secondaryHoverBackground); 
                }
                .new-window-btn {
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    border-radius: 4px;
                    padding: 6px 12px;
                    cursor: pointer;
                    font-size: 12px;
                    margin: 0;
                }
                .new-window-btn:hover { 
                    background: var(--vscode-button-hoverBackground); 
                }
                button {
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    border-radius: 4px;
                    padding: 8px 16px;
                    cursor: pointer;
                    margin: 4px;
                }
                button:hover { background: var(--vscode-button-hoverBackground); }
            </style>
        </head>
        <body>
            <div class="header">
                <button class="back-btn" onclick="backToMenuNumbers()">← Back</button>
                ${!isNewWindow ? '<button class="new-window-btn" onclick="openInNewWindow(\'numbers\')">🗗 New Window</button>' : ''}
            </div>
            <h1>🔢 2048</h1>
            <div class="score">Score: <span id="score">0</span></div>
            <div class="board" id="board"></div>
            <div class="controls">
                <button onclick="newGameNumbers()">New Game</button>
            </div>
            <p>Use WASD or Arrow Keys to move tiles</p>

            <script>
                const vscode = acquireVsCodeApi();
                function openInNewWindow(game) {
                    vscode.postMessage({
                        type: 'openInNewWindow',
                        game: game
                    });
                }
                window.vscode = vscode;
            </script>
            <script src="${this._view?.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'out', 'games', 'numbers.js'))}"></script>
        </body>
        </html>`;
    }

    private _getPaddleHtml(isNewWindow: boolean = false): string {
        const themeCSS = this.getThemeCSS();
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Paddle Ball</title>
            <style>
                ${themeCSS}
                body {
                    font-family: var(--vscode-font-family);
                    color: var(--vscode-foreground);
                    background: var(--vscode-editor-background);
                    padding: 16px;
                    margin: 0;
                    text-align: center;
                }
                h1 { font-size: 18px; margin-bottom: 16px; }
                #gameCanvas {
                    border: 2px solid var(--vscode-input-border);
                    border-radius: 8px;
                    margin: 16px auto;
                    display: block;
                }
                .score { font-weight: bold; margin: 8px 0; }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }
                .back-btn {
                    background: var(--vscode-button-secondaryBackground);
                    color: var(--vscode-button-secondaryForeground);
                    border: none;
                    border-radius: 4px;
                    padding: 6px 12px;
                    cursor: pointer;
                    font-size: 14px;
                    margin: 0;
                }
                .back-btn:hover { 
                    background: var(--vscode-button-secondaryHoverBackground); 
                }
                .new-window-btn {
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    border-radius: 4px;
                    padding: 6px 12px;
                    cursor: pointer;
                    font-size: 12px;
                    margin: 0;
                }
                .new-window-btn:hover { 
                    background: var(--vscode-button-hoverBackground); 
                }
                button {
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    border-radius: 4px;
                    padding: 8px 16px;
                    cursor: pointer;
                    margin: 4px;
                }
                button:hover { background: var(--vscode-button-hoverBackground); }
            </style>
        </head>
        <body>
            <div class="header">
                <button class="back-btn" onclick="backToPaddleMenu()">← Back</button>
                ${!isNewWindow ? '<button class="new-window-btn" onclick="openInNewWindow(\'paddle\')">🗗 New Window</button>' : ''}
            </div>
            <h1>🏓 Paddle Ball</h1>
            <div class="score">Score: <span id="score">0</span></div>
            <canvas id="gameCanvas" width="400" height="300"></canvas>
            <div class="controls">
                <button onclick="startGame()">Start Game</button>
                <button onclick="resetPaddleGame()">Reset</button>
            </div>
            <p>Use mouse or A/D keys to move paddle</p>

            <script>
                const vscode = acquireVsCodeApi();
                function openInNewWindow(game) {
                    vscode.postMessage({
                        type: 'openInNewWindow',
                        game: game
                    });
                }
                window.vscode = vscode;
            </script>
            <script src="${this._view?.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'out', 'games', 'paddle.js'))}"></script>
        </body>
        </html>`;
    }

    private _getFlappyBirdHtml(isNewWindow: boolean = false): string {
        const themeCSS = this.getThemeCSS();
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Flappy Bird</title>
            <style>
                ${themeCSS}
                body {
                    font-family: var(--vscode-font-family);
                    color: var(--vscode-foreground);
                    background: var(--vscode-editor-background);
                    padding: 16px;
                    margin: 0;
                    text-align: center;
                    overflow: hidden;
                }
                h1 { font-size: 18px; margin-bottom: 16px; }
                #gameCanvas {
                    border: 2px solid var(--vscode-input-border);
                    border-radius: 8px;
                    margin: 16px auto;
                    display: block;
                    background: linear-gradient(to bottom, #87CEEB, #98FB98);
                }
                .score { 
                    font-weight: bold; 
                    margin: 8px 0; 
                    font-size: 18px;
                    color: var(--vscode-charts-orange);
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }
                .back-btn {
                    background: var(--vscode-button-secondaryBackground);
                    color: var(--vscode-button-secondaryForeground);
                    border: none;
                    border-radius: 4px;
                    padding: 6px 12px;
                    cursor: pointer;
                    font-size: 14px;
                    margin: 0;
                }
                .back-btn:hover { 
                    background: var(--vscode-button-secondaryHoverBackground); 
                }
                .new-window-btn {
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    border-radius: 4px;
                    padding: 6px 12px;
                    cursor: pointer;
                    font-size: 12px;
                    margin: 0;
                }
                .new-window-btn:hover { 
                    background: var(--vscode-button-hoverBackground); 
                }
                button {
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    border-radius: 4px;
                    padding: 8px 16px;
                    cursor: pointer;
                    margin: 4px;
                    font-size: 14px;
                }
                button:hover { background: var(--vscode-button-hoverBackground); }
                .game-over {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(0,0,0,0.8);
                    color: white;
                    padding: 20px;
                    border-radius: 10px;
                    text-align: center;
                    display: none;
                }
                .instructions {
                    font-size: 12px;
                    margin-top: 10px;
                    color: var(--vscode-descriptionForeground);
                }
                .best-score {
                    font-size: 14px;
                    color: var(--vscode-charts-yellow);
                    margin: 5px 0;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <button class="back-btn" onclick="backToFlappyMenu()">← Back</button>
                ${!isNewWindow ? '<button class="new-window-btn" onclick="openInNewWindow(\'flappyBird\')">🗗 New Window</button>' : ''}
            </div>
            <h1>🐦 Flappy Bird</h1>
            <div class="score">Score: <span id="score">0</span></div>
            <div class="best-score">Best: <span id="bestScore">0</span></div>
            <canvas id="gameCanvas" width="400" height="600"></canvas>
            <div class="controls">
                <button onclick="startFlappyGame()" id="startBtn">Start Game</button>
                <button onclick="resetFlappyGame()">Reset</button>
            </div>
            <div class="instructions">
                <p>Click or press SPACE to flap!</p>
                <p>Avoid the pipes and stay in the air</p>
            </div>
            
            <div class="game-over" id="gameOver">
                <h2>Game Over!</h2>
                <p>Score: <span id="finalScore">0</span></p>
                <button onclick="startFlappyGame()">Try Again</button>
            </div>

            <script>
                const vscode = acquireVsCodeApi();
                function openInNewWindow(game) {
                    vscode.postMessage({
                        type: 'openInNewWindow',
                        game: game
                    });
                }
                
                function backToFlappyMenu() {
                    vscode.postMessage({
                        type: 'backToMenu'
                    });
                }
                window.vscode = vscode;
            </script>
            <script src="${this._view?.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'out', 'games', 'flappyBird.js'))}"></script>
        </body>
        </html>`;
    }

    private _getBlocksHtml(isNewWindow: boolean = false): string {
        const themeCSS = this.getThemeCSS();
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Block Puzzle</title>
            <style>
                ${themeCSS}
                body {
                    font-family: var(--vscode-font-family);
                    color: var(--vscode-foreground);
                    background: var(--vscode-editor-background);
                    padding: 16px;
                    margin: 0;
                    text-align: center;
                }
                h1 { font-size: 18px; margin-bottom: 16px; }
                #gameCanvas {
                    border: 2px solid var(--vscode-input-border);
                    border-radius: 8px;
                    margin: 16px auto;
                    display: block;
                }
                .stats {
                    display: flex;
                    justify-content: space-around;
                    margin: 16px 0;
                    padding: 8px;
                    background: var(--vscode-input-background);
                    border-radius: 8px;
                }
                .stat { font-weight: bold; }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }
                .back-btn {
                    background: var(--vscode-button-secondaryBackground);
                    color: var(--vscode-button-secondaryForeground);
                    border: none;
                    border-radius: 4px;
                    padding: 6px 12px;
                    cursor: pointer;
                    font-size: 14px;
                    margin: 0;
                }
                .back-btn:hover { 
                    background: var(--vscode-button-secondaryHoverBackground); 
                }
                .new-window-btn {
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    border-radius: 4px;
                    padding: 6px 12px;
                    cursor: pointer;
                    font-size: 12px;
                    margin: 0;
                }
                .new-window-btn:hover { 
                    background: var(--vscode-button-hoverBackground); 
                }
                button {
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    border-radius: 4px;
                    padding: 8px 16px;
                    cursor: pointer;
                    margin: 4px;
                }
                button:hover { background: var(--vscode-button-hoverBackground); }
            </style>
        </head>
        <body>
            <div class="header">
                <button class="back-btn" onclick="backToBlocksMenu()">← Back</button>
                ${!isNewWindow ? '<button class="new-window-btn" onclick="openInNewWindow(\'blocks\')">🗗 New Window</button>' : ''}
            </div>
            <h1>🧩 Block Puzzle</h1>
            <div class="stats">
                <div class="stat">Score: <span id="score">0</span></div>
                <div class="stat">Level: <span id="level">1</span></div>
                <div class="stat">Lines: <span id="lines">0</span></div>
            </div>
            <canvas id="gameCanvas" width="200" height="400"></canvas>
            <div class="controls">
                <button onclick="startBlocksGame()">Start</button>
                <button onclick="pauseBlocksGame()">Pause</button>
                <button onclick="resetBlocksGame()">Reset</button>
            </div>
            <p>Use WASD or Arrow Keys to move, Space to drop</p>

            <script>
                const vscode = acquireVsCodeApi();
                function openInNewWindow(game) {
                    vscode.postMessage({
                        type: 'openInNewWindow',
                        game: game
                    });
                }
                window.vscode = vscode;
            </script>
                        <script src="${this._view?.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'out', 'games', 'blocks.js'))}"></script>
        </body>
        </html>`;
    }

    private _getSpaceInvadersHtml(isNewWindow: boolean = false): string {
        const themeCSS = this.getThemeCSS();
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Space Invaders</title>
            <style>
                ${themeCSS}
                body {
                    font-family: var(--vscode-font-family);
                    color: var(--vscode-foreground);
                    background: var(--vscode-editor-background);
                    padding: 16px;
                    margin: 0;
                    text-align: center;
                }
                h1 { font-size: 18px; margin-bottom: 16px; }
                #gameCanvas {
                    border: 2px solid var(--vscode-input-border);
                    border-radius: 8px;
                    margin: 16px auto;
                    display: block;
                    background: #000;
                }
                .stats {
                    display: flex;
                    justify-content: space-around;
                    margin: 16px 0;
                    padding: 8px;
                    background: var(--vscode-input-background);
                    border-radius: 8px;
                }
                .stat { 
                    font-weight: bold; 
                    font-size: 14px;
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }
                .back-btn {
                    background: var(--vscode-button-secondaryBackground);
                    color: var(--vscode-button-secondaryForeground);
                    border: none;
                    border-radius: 4px;
                    padding: 6px 12px;
                    cursor: pointer;
                    font-size: 14px;
                    margin: 0;
                }
                .back-btn:hover { 
                    background: var(--vscode-button-secondaryHoverBackground); 
                }
                .new-window-btn {
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    border-radius: 4px;
                    padding: 6px 12px;
                    cursor: pointer;
                    font-size: 12px;
                    margin: 0;
                }
                .new-window-btn:hover { 
                    background: var(--vscode-button-hoverBackground); 
                }
                button {
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    border-radius: 4px;
                    padding: 8px 16px;
                    cursor: pointer;
                    margin: 4px;
                }
                button:hover { background: var(--vscode-button-hoverBackground); }
                .controls {
                    margin-top: 16px;
                }
                .instructions {
                    font-size: 12px;
                    opacity: 0.8;
                    margin-top: 8px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <button class="back-btn" onclick="backToSpaceInvadersMenu()">← Back</button>
                ${!isNewWindow ? '<button class="new-window-btn" onclick="openInNewWindow(\'spaceInvaders\')">🗗 New Window</button>' : ''}
            </div>
            <h1>👾 Space Invaders</h1>
            <div class="stats">
                <div class="stat">Score: <span id="score">0</span></div>
                <div class="stat">Lives: <span id="lives">3</span></div>
                <div class="stat">Level: <span id="level">1</span></div>
            </div>
            <canvas id="gameCanvas" width="400" height="400"></canvas>
            <div class="controls">
                <button onclick="startSpaceInvadersGame()">Start Game</button>
                <button onclick="resetSpaceInvadersGame()">Reset</button>
            </div>
            <div class="instructions">
                <p>Use A/D or Arrow Keys to move • SPACE to shoot • Click canvas to move and shoot</p>
            </div>

            <script>
                const vscode = acquireVsCodeApi();
                function openInNewWindow(game) {
                    vscode.postMessage({
                        type: 'openInNewWindow',
                        game: game
                    });
                }
                window.vscode = vscode;
            </script>
            <script src="${this._view?.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'out', 'games', 'spaceInvaders.js'))}"></script>
        </body>
        </html>`;
    }

    private _getSnakeHtml(isNewWindow: boolean = false): string {
        const themeCSS = this.getThemeCSS();
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Snake Game</title>
            <style>
                ${themeCSS}
                body {
                    font-family: var(--vscode-font-family);
                    color: var(--vscode-foreground);
                    background: var(--vscode-editor-background);
                    padding: 16px;
                    margin: 0;
                    text-align: center;
                }
                h1 { color: var(--vscode-titleBar-activeForeground); margin-bottom: 16px; }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }
                .stats {
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                    margin-bottom: 16px;
                }
                .stat {
                    background: var(--vscode-badge-background);
                    color: var(--vscode-badge-foreground);
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                }
                canvas {
                    border: 2px solid var(--vscode-panel-border);
                    margin: 8px 0;
                    background: #000;
                }
                button {
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    border-radius: 4px;
                    padding: 8px 16px;
                    cursor: pointer;
                    margin: 4px;
                }
                button:hover { background: var(--vscode-button-hoverBackground); }
                .controls { margin-top: 16px; }
                .instructions {
                    font-size: 12px;
                    opacity: 0.8;
                    margin-top: 8px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <button class="back-btn" onclick="backToSnakeMenu()">← Back</button>
                ${!isNewWindow ? '<button class="new-window-btn" onclick="openInNewWindow(\'snake\')">🗗 New Window</button>' : ''}
            </div>
            <h1>🐍 Snake</h1>
            <div class="stats">
                <div class="stat">Score: <span id="score">0</span></div>
                <div class="stat">Length: <span id="length">1</span></div>
            </div>
            <canvas id="gameCanvas" width="400" height="400"></canvas>
            <div class="controls">
                <button onclick="startSnakeGame()">Start Game</button>
                <button onclick="resetSnakeGame()">Reset</button>
            </div>
            <div class="instructions">
                <p>Use WASD or Arrow Keys to move • Click canvas to change direction</p>
            </div>

            <script>
                const vscode = acquireVsCodeApi();
                function openInNewWindow(game) {
                    vscode.postMessage({
                        type: 'openInNewWindow',
                        game: game
                    });
                }
                window.vscode = vscode;
            </script>
            <script src="${this._view?.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'out', 'games', 'snake.js'))}"></script>
        </body>
        </html>`;
    }

    private _getBreakoutHtml(isNewWindow: boolean = false): string {
        const themeCSS = this.getThemeCSS();
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Breakout Game</title>
            <style>
                ${themeCSS}
                body {
                    font-family: var(--vscode-font-family);
                    color: var(--vscode-foreground);
                    background: var(--vscode-editor-background);
                    padding: 16px;
                    margin: 0;
                    text-align: center;
                }
                h1 { color: var(--vscode-titleBar-activeForeground); margin-bottom: 16px; }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }
                .stats {
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                    margin-bottom: 16px;
                }
                .stat {
                    background: var(--vscode-badge-background);
                    color: var(--vscode-badge-foreground);
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                }
                canvas {
                    border: 2px solid var(--vscode-panel-border);
                    margin: 8px 0;
                }
                button {
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    border-radius: 4px;
                    padding: 8px 16px;
                    cursor: pointer;
                    margin: 4px;
                }
                button:hover { background: var(--vscode-button-hoverBackground); }
                .controls { margin-top: 16px; }
                .instructions {
                    font-size: 12px;
                    opacity: 0.8;
                    margin-top: 8px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <button class="back-btn" onclick="backToBreakoutMenu()">← Back</button>
                ${!isNewWindow ? '<button class="new-window-btn" onclick="openInNewWindow(\'breakout\')">🗗 New Window</button>' : ''}
            </div>
            <h1>🧱 Breakout</h1>
            <div class="stats">
                <div class="stat">Score: <span id="score">0</span></div>
                <div class="stat">Lives: <span id="lives">3</span></div>
                <div class="stat">Level: <span id="level">1</span></div>
            </div>
            <canvas id="gameCanvas" width="400" height="400"></canvas>
            <div class="controls">
                <button onclick="startBreakoutGame()">Start Game</button>
                <button onclick="resetBreakoutGame()">Reset</button>
            </div>
            <div class="instructions">
                <p>Use A/D or Arrow Keys to move paddle • Mouse to control paddle • Break all bricks!</p>
            </div>

            <script>
                const vscode = acquireVsCodeApi();
                function openInNewWindow(game) {
                    vscode.postMessage({
                        type: 'openInNewWindow',
                        game: game
                    });
                }
                window.vscode = vscode;
            </script>
            <script src="${this._view?.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'out', 'games', 'breakout.js'))}"></script>
        </body>
        </html>`;
    }

    private _getMemoryHtml(isNewWindow: boolean = false): string {
        const themeCSS = this.getThemeCSS();
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Memory Match Game</title>
            <style>
                ${themeCSS}
                body {
                    font-family: var(--vscode-font-family);
                    color: var(--vscode-foreground);
                    background: var(--vscode-editor-background);
                    padding: 16px;
                    margin: 0;
                    text-align: center;
                }
                h1 { color: var(--vscode-titleBar-activeForeground); margin-bottom: 16px; }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }
                .stats {
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                    margin-bottom: 16px;
                }
                .stat {
                    background: var(--vscode-badge-background);
                    color: var(--vscode-badge-foreground);
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                }
                canvas {
                    border: 2px solid var(--vscode-panel-border);
                    margin: 8px 0;
                    cursor: pointer;
                }
                button {
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    border-radius: 4px;
                    padding: 8px 16px;
                    cursor: pointer;
                    margin: 4px;
                }
                button:hover { background: var(--vscode-button-hoverBackground); }
                .controls { margin-top: 16px; }
                .instructions {
                    font-size: 12px;
                    opacity: 0.8;
                    margin-top: 8px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <button class="back-btn" onclick="backToMemoryMenu()">← Back</button>
                ${!isNewWindow ? '<button class="new-window-btn" onclick="openInNewWindow(\'memory\')">🗗 New Window</button>' : ''}
            </div>
            <h1>🧠 Memory Match</h1>
            <div class="stats">
                <div class="stat">Score: <span id="score">0</span></div>
                <div class="stat">Moves: <span id="moves">0</span></div>
                <div class="stat">Matched: <span id="matched">0/8</span></div>
            </div>
            <canvas id="gameCanvas" width="400" height="400"></canvas>
            <div class="controls">
                <button onclick="startMemoryGame()">Start Game</button>
                <button onclick="resetMemoryGame()">Reset</button>
            </div>
            <div class="instructions">
                <p>Click cards to flip them • Match pairs to score points • Fewer moves = higher score!</p>
            </div>

            <script>
                const vscode = acquireVsCodeApi();
                function openInNewWindow(game) {
                    vscode.postMessage({
                        type: 'openInNewWindow',
                        game: game
                    });
                }
                window.vscode = vscode;
            </script>
            <script src="${this._view?.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'out', 'games', 'memory.js'))}"></script>
        </body>
        </html>`;
    }

    private _getFroggerHtml(isNewWindow: boolean = false): string {
        const themeCSS = this.getThemeCSS();
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Frogger Game</title>
            <style>
                ${themeCSS}
                body {
                    font-family: var(--vscode-font-family);
                    color: var(--vscode-foreground);
                    background: var(--vscode-editor-background);
                    padding: 16px;
                    margin: 0;
                    text-align: center;
                }
                h1 { color: var(--vscode-titleBar-activeForeground); margin-bottom: 16px; }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }
                .stats {
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                    margin-bottom: 16px;
                }
                .stat {
                    background: var(--vscode-badge-background);
                    color: var(--vscode-badge-foreground);
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                }
                canvas {
                    border: 2px solid var(--vscode-panel-border);
                    margin: 8px 0;
                }
                button {
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    border-radius: 4px;
                    padding: 8px 16px;
                    cursor: pointer;
                    margin: 4px;
                }
                button:hover { background: var(--vscode-button-hoverBackground); }
                .controls { margin-top: 16px; }
                .instructions {
                    font-size: 12px;
                    opacity: 0.8;
                    margin-top: 8px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <button class="back-btn" onclick="backToFroggerMenu()">← Back</button>
                ${!isNewWindow ? '<button class="new-window-btn" onclick="openInNewWindow(\'frogger\')">🗗 New Window</button>' : ''}
            </div>
            <h1>🐸 Frogger</h1>
            <div class="stats">
                <div class="stat">Score: <span id="score">0</span></div>
                <div class="stat">Lives: <span id="lives">3</span></div>
                <div class="stat">Level: <span id="level">1</span></div>
            </div>
            <canvas id="gameCanvas" width="400" height="400"></canvas>
            <div class="controls">
                <button onclick="startFroggerGame()">Start Game</button>
                <button onclick="resetFroggerGame()">Reset</button>
            </div>
            <div class="instructions">
                <p>Use WASD or Arrow Keys to move • Click canvas to change direction • Reach the golden goal!</p>
            </div>

            <script>
                const vscode = acquireVsCodeApi();
                function openInNewWindow(game) {
                    vscode.postMessage({
                        type: 'openInNewWindow',
                        game: game
                    });
                }
                window.vscode = vscode;
            </script>
            <script src="${this._view?.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'out', 'games', 'frogger.js'))}"></script>
        </body>
        </html>`;
    }

    private _getAsteroidsHtml(isNewWindow: boolean = false): string {
        const themeCSS = this.getThemeCSS();
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Asteroids Game</title>
            <style>
                ${themeCSS}
                body {
                    font-family: var(--vscode-font-family);
                    color: var(--vscode-foreground);
                    background: var(--vscode-editor-background);
                    padding: 16px;
                    margin: 0;
                    text-align: center;
                }
                h1 { color: var(--vscode-titleBar-activeForeground); margin-bottom: 16px; }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }
                .stats {
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                    margin-bottom: 16px;
                }
                .stat {
                    background: var(--vscode-badge-background);
                    color: var(--vscode-badge-foreground);
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                }
                canvas {
                    border: 2px solid var(--vscode-panel-border);
                    margin: 8px 0;
                    background: #000;
                }
                button {
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    border-radius: 4px;
                    padding: 8px 16px;
                    cursor: pointer;
                    margin: 4px;
                }
                button:hover { background: var(--vscode-button-hoverBackground); }
                .controls { margin-top: 16px; }
                .instructions {
                    font-size: 12px;
                    opacity: 0.8;
                    margin-top: 8px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <button class="back-btn" onclick="backToAsteroidsMenu()">← Back</button>
                ${!isNewWindow ? '<button class="new-window-btn" onclick="openInNewWindow(\'asteroids\')">🗗 New Window</button>' : ''}
            </div>
            <h1>🚀 Asteroids</h1>
            <div class="stats">
                <div class="stat">Score: <span id="score">0</span></div>
                <div class="stat">Lives: <span id="lives">3</span></div>
                <div class="stat">Level: <span id="level">1</span></div>
            </div>
            <canvas id="gameCanvas" width="400" height="400"></canvas>
            <div class="controls">
                <button onclick="startAsteroidsGame()">Start Game</button>
                <button onclick="resetAsteroidsGame()">Reset</button>
            </div>
            <div class="instructions">
                <p>Use A/D to rotate • W to thrust • SPACE to shoot • Click to shoot • Destroy all asteroids!</p>
            </div>

            <script>
                const vscode = acquireVsCodeApi();
                function openInNewWindow(game) {
                    vscode.postMessage({
                        type: 'openInNewWindow',
                        game: game
                    });
                }
                window.vscode = vscode;
            </script>
            <script src="${this._view?.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'out', 'games', 'asteroids.js'))}"></script>
        </body>
        </html>`;
    }

    private _getPongHtml(isNewWindow: boolean = false): string {
        const themeCSS = this.getThemeCSS();
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Pong Game</title>
            <style>
                ${themeCSS}
                body {
                    font-family: var(--vscode-font-family);
                    color: var(--vscode-foreground);
                    background: var(--vscode-editor-background);
                    padding: 16px;
                    margin: 0;
                    text-align: center;
                }
                h1 { color: var(--vscode-titleBar-activeForeground); margin-bottom: 16px; }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }
                .stats {
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                    margin-bottom: 16px;
                }
                .stat {
                    background: var(--vscode-badge-background);
                    color: var(--vscode-badge-foreground);
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                }
                canvas {
                    border: 2px solid var(--vscode-panel-border);
                    margin: 8px 0;
                    background: #000;
                    cursor: crosshair;
                }
                button {
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    border-radius: 4px;
                    padding: 8px 16px;
                    cursor: pointer;
                    margin: 4px;
                }
                button:hover { background: var(--vscode-button-hoverBackground); }
                .controls { margin-top: 16px; }
                .instructions {
                    font-size: 12px;
                    opacity: 0.8;
                    margin-top: 8px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <button class="back-btn" onclick="backToPongMenu()">← Back</button>
                ${!isNewWindow ? '<button class="new-window-btn" onclick="openInNewWindow(\'pong\')">🗗 New Window</button>' : ''}
            </div>
            <h1>🏓 Pong</h1>
            <div class="stats">
                <div class="stat">Player: <span id="playerScore">0</span></div>
                <div class="stat">AI: <span id="aiScore">0</span></div>
            </div>
            <canvas id="gameCanvas" width="400" height="300"></canvas>
            <div class="controls">
                <button onclick="startPongGame()">Start Game</button>
                <button onclick="resetPongGame()">Reset</button>
            </div>
            <div class="instructions">
                <p>Use W/S or Arrow Keys to move • Mouse to control paddle • First to 5 wins!</p>
            </div>

            <script>
                const vscode = acquireVsCodeApi();
                function openInNewWindow(game) {
                    vscode.postMessage({
                        type: 'openInNewWindow',
                        game: game
                    });
                }
                window.vscode = vscode;
            </script>
            <script src="${this._view?.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'out', 'games', 'pong.js'))}"></script>
        </body>
        </html>`;
    }

    private _getMinesweeperHtml(isNewWindow: boolean = false): string {
        const themeCSS = this.getThemeCSS();
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Minesweeper Game</title>
            <style>
                ${themeCSS}
                body {
                    font-family: var(--vscode-font-family);
                    color: var(--vscode-foreground);
                    background: var(--vscode-editor-background);
                    padding: 16px;
                    margin: 0;
                    text-align: center;
                }
                h1 { color: var(--vscode-titleBar-activeForeground); margin-bottom: 16px; }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }
                .stats {
                    display: flex;
                    justify-content: center;
                    gap: 15px;
                    margin-bottom: 16px;
                    flex-wrap: wrap;
                }
                .stat {
                    background: var(--vscode-badge-background);
                    color: var(--vscode-badge-foreground);
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: bold;
                    border: 1px solid var(--vscode-panel-border);
                    min-width: 80px;
                    text-align: center;
                }
                canvas {
                    border: 2px solid var(--vscode-panel-border);
                    margin: 8px 0;
                    cursor: pointer;
                }
                button {
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    border-radius: 4px;
                    padding: 8px 16px;
                    cursor: pointer;
                    margin: 4px;
                }
                button:hover { background: var(--vscode-button-hoverBackground); }
                .controls { margin-top: 16px; }
                .instructions {
                    font-size: 12px;
                    opacity: 0.8;
                    margin-top: 8px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <button class="back-btn" onclick="backToMinesweeperMenu()">← Back</button>
                ${!isNewWindow ? '<button class="new-window-btn" onclick="openInNewWindow(\'minesweeper\')">🗗 New Window</button>' : ''}
            </div>
            <h1>💣 Minesweeper</h1>
            <div class="stats">
                <div class="stat">Mines: <span id="mines">40</span></div>
                <div class="stat">Flagged: <span id="flagged">0</span></div>
                <div class="stat">Remaining: <span id="remaining">40</span></div>
                <div class="stat">Time: <span id="timer">00:00</span></div>
            </div>
            <canvas id="gameCanvas" width="400" height="400"></canvas>
            <div class="controls">
                <button onclick="startMinesweeperGame()">Start Game</button>
                <button onclick="resetMinesweeperGame()">Reset</button>
            </div>
            <div class="instructions">
                <p>Left click to reveal • Right click to flag • Find all mines without clicking them!</p>
            </div>

            <script>
                const vscode = acquireVsCodeApi();
                function openInNewWindow(game) {
                    vscode.postMessage({
                        type: 'openInNewWindow',
                        game: game
                    });
                }
                window.vscode = vscode;
            </script>
            <script src="${this._view?.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'out', 'games', 'minesweeper.js'))}"></script>
        </body>
        </html>`;
    }

    private _getDarkThemeCSS(): string {
        return `
            :root {
                --ludus-bg: #1a1a1a;
                --ludus-fg: #e0e0e0;
                --ludus-primary: #007acc;
                --ludus-secondary: #2d2d30;
                --ludus-hover: #404040;
                --ludus-border: #3c3c3c;
                --ludus-button-bg: #0e639c;
                --ludus-button-hover: #1177bb;
                --ludus-success: #4ec9b0;
                --ludus-warning: #ffcc02;
                --ludus-error: #f44747;
            }
            body {
                background: var(--ludus-bg) !important;
                color: var(--ludus-fg) !important;
            }
            .game-btn, button {
                background: var(--ludus-button-bg) !important;
                color: var(--ludus-fg) !important;
                border: 1px solid var(--ludus-border) !important;
            }
            .game-btn:hover, button:hover {
                background: var(--ludus-button-hover) !important;
            }
        `;
    }

    private _getLightThemeCSS(): string {
        return `
            :root {
                --ludus-bg: #ffffff;
                --ludus-fg: #333333;
                --ludus-primary: #0078d4;
                --ludus-secondary: #f3f2f1;
                --ludus-hover: #e1dfdd;
                --ludus-border: #d1d1d1;
                --ludus-button-bg: #0078d4;
                --ludus-button-hover: #106ebe;
                --ludus-success: #107c10;
                --ludus-warning: #ff8c00;
                --ludus-error: #d13438;
            }
            body {
                background: var(--ludus-bg) !important;
                color: var(--ludus-fg) !important;
            }
            .game-btn, button {
                background: var(--ludus-button-bg) !important;
                color: #ffffff !important;
                border: 1px solid var(--ludus-border) !important;
            }
            .game-btn:hover, button:hover {
                background: var(--ludus-button-hover) !important;
            }
        `;
    }

    private _getMatrixThemeCSS(): string {
        return `
            :root {
                --ludus-bg: #000000;
                --ludus-fg: #00ff00;
                --ludus-primary: #00cc00;
                --ludus-secondary: #001100;
                --ludus-hover: #003300;
                --ludus-border: #00aa00;
                --ludus-button-bg: #003300;
                --ludus-button-hover: #005500;
                --ludus-success: #00ff00;
                --ludus-warning: #ffff00;
                --ludus-error: #ff0000;
            }
            body {
                background: var(--ludus-bg) !important;
                color: var(--ludus-fg) !important;
                font-family: 'Courier New', monospace !important;
                text-shadow: 0 0 5px var(--ludus-fg) !important;
            }
            .game-btn, button {
                background: var(--ludus-button-bg) !important;
                color: var(--ludus-fg) !important;
                border: 1px solid var(--ludus-border) !important;
                text-shadow: 0 0 3px var(--ludus-fg) !important;
            }
            .game-btn:hover, button:hover {
                background: var(--ludus-button-hover) !important;
                box-shadow: 0 0 10px var(--ludus-fg) !important;
            }
            h1 {
                text-shadow: 0 0 10px var(--ludus-fg) !important;
            }
            .board, .scoreboard {
                border: 2px solid var(--ludus-border) !important;
                box-shadow: 0 0 15px var(--ludus-primary) !important;
            }
        `;
    }
}

export function activate(context: vscode.ExtensionContext) {
    const provider = new GameProvider(context.extensionUri);
    
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(GameProvider.viewType, provider)
    );
    const openPanelDisposable = vscode.commands.registerCommand('ludus.openGamePanel', () => {
        vscode.commands.executeCommand('workbench.view.extension.ludus');
    });
    const ticTacToeDisposable = vscode.commands.registerCommand('ludus.playTicTacToe', () => {
        vscode.commands.executeCommand('workbench.view.extension.ludus');
        provider.setCurrentGame('ticTacToe');
    });

    const rockPaperScissorsDisposable = vscode.commands.registerCommand('ludus.playRockPaperScissors', () => {
        vscode.commands.executeCommand('workbench.view.extension.ludus');
        provider.setCurrentGame('rockPaperScissors');
    });

    const numberMergeDisposable = vscode.commands.registerCommand('ludus.playNumberMerge', () => {
        vscode.commands.executeCommand('workbench.view.extension.ludus');
        provider.setCurrentGame('numbers');
    });

    const paddleBallDisposable = vscode.commands.registerCommand('ludus.playPaddleBall', () => {
        vscode.commands.executeCommand('workbench.view.extension.ludus');
        provider.setCurrentGame('paddle');
    });

    const blockPuzzleDisposable = vscode.commands.registerCommand('ludus.playBlockPuzzle', () => {
        vscode.commands.executeCommand('workbench.view.extension.ludus');
        provider.setCurrentGame('blocks');
    });

    const galaxyDefenseDisposable = vscode.commands.registerCommand('ludus.playGalaxyDefense', () => {
        vscode.commands.executeCommand('workbench.view.extension.ludus');
        provider.setCurrentGame('spaceInvaders');
    });

    const snakeDisposable = vscode.commands.registerCommand('ludus.playSnake', () => {
        vscode.commands.executeCommand('workbench.view.extension.ludus');
        provider.setCurrentGame('snake');
    });

    const breakoutDisposable = vscode.commands.registerCommand('ludus.playBreakout', () => {
        vscode.commands.executeCommand('workbench.view.extension.ludus');
        provider.setCurrentGame('breakout');
    });

    const memoryDisposable = vscode.commands.registerCommand('ludus.playMemory', () => {
        vscode.commands.executeCommand('workbench.view.extension.ludus');
        provider.setCurrentGame('memory');
    });

    const roadCrosserDisposable = vscode.commands.registerCommand('ludus.playRoadCrosser', () => {
        vscode.commands.executeCommand('workbench.view.extension.ludus');
        provider.setCurrentGame('frogger');
    });

    const asteroidsDisposable = vscode.commands.registerCommand('ludus.playAsteroids', () => {
        vscode.commands.executeCommand('workbench.view.extension.ludus');
        provider.setCurrentGame('asteroids');
    });

    const pongDisposable = vscode.commands.registerCommand('ludus.playPong', () => {
        vscode.commands.executeCommand('workbench.view.extension.ludus');
        provider.setCurrentGame('pong');
    });

    const minesweeperDisposable = vscode.commands.registerCommand('ludus.playMinesweeper', () => {
        vscode.commands.executeCommand('workbench.view.extension.ludus');
        provider.setCurrentGame('minesweeper');
    });

    const wingFlapDisposable = vscode.commands.registerCommand('ludus.playWingFlap', () => {
        vscode.commands.executeCommand('workbench.view.extension.ludus');
        provider.setCurrentGame('flappyBird');
    });

    const selectThemeDisposable = vscode.commands.registerCommand('ludus.selectTheme', async () => {
        const themes = [
            { label: 'Default', value: 'default', description: 'Use VS Code\'s current theme' },
            { label: 'Dark', value: 'dark', description: 'Dark theme with custom styling' },
            { label: 'Light', value: 'light', description: 'Light theme with custom styling' },
            { label: 'Matrix', value: 'matrix', description: 'Matrix green theme' }
        ];

        const selected = await vscode.window.showQuickPick(themes, {
            placeHolder: 'Select a theme for Ludus',
            matchOnDescription: true
        });

        if (selected) {
            const config = vscode.workspace.getConfiguration('ludus');
            await config.update('theme', selected.value, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage(`Ludus theme changed to: ${selected.label}`);
        }
    });

    const clearFavoritesDisposable = vscode.commands.registerCommand('ludus.clearFavorites', async () => {
        const confirm = await vscode.window.showWarningMessage(
            'Are you sure you want to clear all favorite games?',
            { modal: true },
            'Clear Favorites'
        );

        if (confirm === 'Clear Favorites') {
            const config = vscode.workspace.getConfiguration('ludus');
            await config.update('favorites', [], vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage('All favorite games have been cleared!');
        }
    });

    context.subscriptions.push(
        openPanelDisposable,
        ticTacToeDisposable,
        rockPaperScissorsDisposable,
        numberMergeDisposable,
        paddleBallDisposable,
        blockPuzzleDisposable,
        galaxyDefenseDisposable,
        snakeDisposable,
        breakoutDisposable,
        memoryDisposable,
        roadCrosserDisposable,
        asteroidsDisposable,
        pongDisposable,
        minesweeperDisposable,
        wingFlapDisposable,
        selectThemeDisposable,
        clearFavoritesDisposable
    );

    vscode.window.showInformationMessage('🎮 Ludus loaded! Open the Games sidebar to play!');
}

export function deactivate() {}
