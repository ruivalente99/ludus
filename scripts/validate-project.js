#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
console.log('🔍 Validating project structure...');
const requiredFiles = [
    'package.json',
    'tsconfig.json',
    '.gitignore',
    '.eslintrc.json',
    'README.md',
    'src/extension.ts'
];
const requiredGameFiles = [
    'src/games/ticTacToe.ts',
    'src/games/rockPaperScissors.ts',
    'src/games/numbers.ts',
    'src/games/paddle.ts',
    'src/games/blocks.ts'
];
const requiredTestFiles = [
    'src/test/runTest.ts',
    'src/test/unit/games.test.ts',
    'src/test/integration/extension.test.ts'
];
let allValid = true;
function checkFile(filePath) {
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${filePath}`);
        return true;
    } else {
        console.log(`❌ ${filePath} - Missing`);
        return false;
    }
}
console.log('\n📁 Core files:');
requiredFiles.forEach(file => {
    if (!checkFile(file)) allValid = false;
});
console.log('\n🎮 Game files:');
requiredGameFiles.forEach(file => {
    if (!checkFile(file)) allValid = false;
});
console.log('\n🧪 Test files:');
requiredTestFiles.forEach(file => {
    if (!checkFile(file)) allValid = false;
});
console.log('\n📦 package.json validation:');
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (packageJson.scripts && packageJson.scripts.compile) {
        console.log('✅ Compile script found');
    } else {
        console.log('❌ Compile script missing');
        allValid = false;
    }
    if (packageJson.scripts && packageJson.scripts.test) {
        console.log('✅ Test script found');
    } else {
        console.log('❌ Test script missing');
        allValid = false;
    }
    if (packageJson.devDependencies && packageJson.devDependencies.typescript) {
        console.log('✅ TypeScript dependency found');
    } else {
        console.log('❌ TypeScript dependency missing');
        allValid = false;
    }
} catch (error) {
    console.log('❌ package.json parsing failed:', error.message);
    allValid = false;
}
if (allValid) {
    console.log('\n🎉 Project structure validation passed!');
    process.exit(0);
} else {
    console.log('\n💥 Project structure validation failed!');
    process.exit(1);
}
