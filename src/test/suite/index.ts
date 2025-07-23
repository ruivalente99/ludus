import * as path from 'path';
import * as Mocha from 'mocha';
export function run(): Promise<void> {
    const mocha = new Mocha({
        ui: 'tdd',
        color: true,
        timeout: 10000
    });
    const testsRoot = path.resolve(__dirname, '..');
    return new Promise((resolve, reject) => {
        const fs = require('fs');
        function findTestFiles(dir: string): string[] {
            const files: string[] = [];
            try {
                const entries = fs.readdirSync(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    if (entry.isDirectory()) {
                        files.push(...findTestFiles(fullPath));
                    } else if (entry.isFile() && entry.name.endsWith('.test.js')) {
                        files.push(fullPath);
                    }
                }
            } catch (error) {
                console.warn(`Could not read directory ${dir}:`, error);
            }
            return files;
        }
        try {
            const testFiles = findTestFiles(testsRoot);
            testFiles.forEach((file: string) => mocha.addFile(file));
            mocha.run((failures: number) => {
                if (failures > 0) {
                    reject(new Error(`${failures} tests failed.`));
                } else {
                    resolve();
                }
            });
        } catch (err) {
            console.error(err);
            reject(err);
        }
    });
}
