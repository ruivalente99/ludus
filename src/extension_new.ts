import * as vscode from 'vscode';
import { GAMES_CONFIG, getGameTitle, getFavorites, toggleFavorite as toggleFavoriteConfig } from './gamesConfig';
import { TemplateManager } from './templateManager';

export class GameProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'ludusView';
    private _view?: vscode.WebviewView;
    private _currentGame: string = 'menu';
    private _templateManager: TemplateManager;

    constructor(private readonly _extensionUri: vscode.Uri) {
        this._templateManager = new TemplateManager(_extensionUri);
        
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

    public clearFavorites(): void {
        if (this._view) {
            this._view.webview.postMessage({
                type: 'clearFavorites'
            });
        }
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;
        this._templateManager.setView(webviewView);

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
            `🎮 ${getGameTitle(game)}`,
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [this._extensionUri]
            }
        );

        // Create a new template manager for the panel
        const panelTemplateManager = new TemplateManager(this._extensionUri);
        panelTemplateManager.setView({ webview: panel.webview } as vscode.WebviewView);

        panel.webview.html = this._getGameHtml(game, true, panelTemplateManager);
        panel.webview.onDidReceiveMessage(data => {
            if (data.type === 'backToMenu') {
                panel.dispose();
            }
        });
    }

    private _getHtmlForWebview(): string {
        if (this._currentGame === 'menu') {
            return this._templateManager.getMenuHTML(GAMES_CONFIG);
        } else {
            return this._getGameHtml(this._currentGame, false, this._templateManager);
        }
    }

    private _getGameHtml(game: string, isNewWindow: boolean = false, templateManager?: TemplateManager): string {
        const manager = templateManager || this._templateManager;
        
        // Try to get the game HTML from template file
        try {
            return manager.getGameHTML(game, isNewWindow);
        } catch (error) {
            console.error(`Failed to load template for game ${game}:`, error);
            // Fallback to menu if template not found
            return manager.getMenuHTML(GAMES_CONFIG);
        }
    }
}

export function activate(context: vscode.ExtensionContext) {
    const provider = new GameProvider(context.extensionUri);
    
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(GameProvider.viewType, provider)
    );

    // Register all game commands
    const commands = [
        { id: 'ludus.openGamePanel', action: () => vscode.commands.executeCommand('workbench.view.extension.ludus') },
        { id: 'ludus.playTicTacToe', game: 'ticTacToe' },
        { id: 'ludus.playRockPaperScissors', game: 'rockPaperScissors' },
        { id: 'ludus.playNumberMerge', game: 'numbers' },
        { id: 'ludus.playPaddleBall', game: 'paddle' },
        { id: 'ludus.playBlockPuzzle', game: 'blocks' },
        { id: 'ludus.playGalaxyDefense', game: 'spaceInvaders' },
        { id: 'ludus.playSnake', game: 'snake' },
        { id: 'ludus.playBreakout', game: 'breakout' },
        { id: 'ludus.playMemory', game: 'memory' },
        { id: 'ludus.playRoadCrosser', game: 'frogger' },
        { id: 'ludus.playAsteroids', game: 'asteroids' },
        { id: 'ludus.playPong', game: 'pong' },
        { id: 'ludus.playMinesweeper', game: 'minesweeper' },
        { id: 'ludus.playWingFlap', game: 'flappyBird' }
    ];

    commands.forEach(cmd => {
        const disposable = vscode.commands.registerCommand(cmd.id, () => {
            vscode.commands.executeCommand('workbench.view.extension.ludus');
            if (cmd.game) {
                provider.setCurrentGame(cmd.game);
            }
            if (cmd.action) {
                cmd.action();
            }
        });
        context.subscriptions.push(disposable);
    });

    // Theme selection command
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

    // Clear favorites command
    const clearFavoritesDisposable = vscode.commands.registerCommand('ludus.clearFavorites', async () => {
        const confirm = await vscode.window.showWarningMessage(
            'Are you sure you want to clear all favorite games?',
            { modal: true },
            'Clear Favorites'
        );

        if (confirm === 'Clear Favorites') {
            // Send message to webview to clear localStorage favorites
            provider.clearFavorites();
            vscode.window.showInformationMessage('All favorite games have been cleared!');
        }
    });

    context.subscriptions.push(selectThemeDisposable, clearFavoritesDisposable);

    vscode.window.showInformationMessage('🎮 Ludus loaded! Open the Games sidebar to play!');
}

export function deactivate() {}
