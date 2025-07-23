import * as assert from 'assert';
import * as vscode from 'vscode';
import { GameProvider } from '../../extension';
suite('Extension Integration Tests', () => {
    vscode.window.showInformationMessage('Start integration tests.');
    test('Extension should be present', () => {
        assert.ok(vscode.extensions.getExtension('ruivalente99.ludus'));
    });
    test('GameProvider should be instantiable', () => {
        const extensionUri = vscode.Uri.file(__dirname);
        const provider = new GameProvider(extensionUri);
        assert.ok(provider);
    });
    test('All game commands should be registered', async () => {
        const commands = await vscode.commands.getCommands(true);
        assert.ok(commands.includes('ludus.openGamePanel'));
        assert.ok(commands.includes('ludus.playTicTacToe'));
        assert.ok(commands.includes('ludus.playRockPaperScissors'));
        assert.ok(commands.includes('ludus.playNumberMerge'));
        assert.ok(commands.includes('ludus.playPaddleBall'));
        assert.ok(commands.includes('ludus.playBlockPuzzle'));
        assert.ok(commands.includes('ludus.playGalaxyDefense'));
        assert.ok(commands.includes('ludus.playSnake'));
        assert.ok(commands.includes('ludus.playBreakout'));
        assert.ok(commands.includes('ludus.playMemory'));
        assert.ok(commands.includes('ludus.playRoadCrosser'));
        assert.ok(commands.includes('ludus.playAsteroids'));
        assert.ok(commands.includes('ludus.playPong'));
        assert.ok(commands.includes('ludus.playMinesweeper'));
        assert.ok(commands.includes('ludus.playWingFlap'));
        assert.ok(commands.includes('ludus.selectTheme'));
        assert.ok(commands.includes('ludus.clearFavorites'));
    });
    test('WebviewView should be registered', () => {
        assert.strictEqual(GameProvider.viewType, 'ludusView');
    });
    test('Configuration properties should be available', () => {
        const config = vscode.workspace.getConfiguration('ludus');
        assert.ok(config.has('theme'));
        assert.ok(config.has('animations'));
        assert.ok(config.has('favorites'));
        assert.ok(config.has('soundEffects'));
        assert.strictEqual(config.get('theme'), 'default');
        assert.strictEqual(config.get('animations'), true);
        assert.strictEqual(config.get('soundEffects'), false);
        assert.ok(Array.isArray(config.get('favorites')));
    });
    test('GameProvider methods should be accessible', () => {
        const extensionUri = vscode.Uri.file(__dirname);
        const provider = new GameProvider(extensionUri);
        assert.ok(typeof provider.setCurrentGame === 'function');
        assert.ok(typeof provider.getThemeCSS === 'function');
        assert.ok(typeof provider.resolveWebviewView === 'function');
    });
});
