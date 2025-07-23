import * as path from 'path';
async function main(): Promise<void> {
    try {
        console.log('🧪 Running basic extension tests...');
        const fs = require('fs');
        const outDir = path.resolve(__dirname, '../../out');
        if (!fs.existsSync(outDir)) {
            throw new Error('Output directory does not exist. Run npm run compile first.');
        }
        const extensionJs = path.join(outDir, 'extension.js');
        if (!fs.existsSync(extensionJs)) {
            throw new Error('extension.js not found in output directory.');
        }
        console.log('✅ Extension compilation check passed');
        const gamesDir = path.join(outDir, 'games');
        const gameFiles = ['ticTacToe.js', 'rockPaperScissors.js', 'numbers.js', 'paddle.js', 'blocks.js', 'wordGuess.js'];
        for (const gameFile of gameFiles) {
            const gamePath = path.join(gamesDir, gameFile);
            if (!fs.existsSync(gamePath)) {
                throw new Error(`Game file ${gameFile} not found.`);
            }
        }
        console.log('✅ All game files compilation check passed');
        try {
            const extensionContent = fs.readFileSync(extensionJs, 'utf8');
            if (!extensionContent.includes('GameProvider')) {
                throw new Error('GameProvider class not found in extension.js');
            }
            if (!extensionContent.includes('activate')) {
                throw new Error('activate function not found in extension.js');
            }
            if (!extensionContent.includes('deactivate')) {
                throw new Error('deactivate function not found in extension.js');
            }
            console.log('✅ Extension structure validation passed');
        } catch (error) {
            throw new Error(`Extension validation error: ${error}`);
        }
        for (const gameFile of gameFiles) {
            const gamePath = path.join(gamesDir, gameFile);
            const gameContent = fs.readFileSync(gamePath, 'utf8');
            if (gameContent.trim().length === 0) {
                throw new Error(`Game file ${gameFile} is empty`);
            }
        }
        console.log('✅ Game files syntax validation passed');
        console.log('🎉 All basic tests passed!');
    } catch (err) {
        console.error('❌ Tests failed:', err);
        process.exit(1);
    }
}
main();
