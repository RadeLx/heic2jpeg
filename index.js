const fs = require('fs-extra');
const path = require('path');
const heicConvert = require('heic-convert');

const inputDir = path.join(__dirname, 'img');
const outputDir = path.join(__dirname, 'out');

fs.ensureDirSync(outputDir);

async function convertHeicToJpg(inputPath, outputPath) {
    const inputBuffer = await fs.readFile(inputPath);
    const outputBuffer = await heicConvert({
        buffer: inputBuffer,
        format: 'JPEG',
        quality: 1
    });
    await fs.writeFile(outputPath, outputBuffer);
}

async function processDirectory(inputDir, outputDir) {
    const items = await fs.readdir(inputDir);

    for (const item of items) {
        const inputPath = path.join(inputDir, item);
        const outputPath = path.join(outputDir, item);

        const stats = await fs.stat(inputPath);

        if (stats.isDirectory()) {
            await fs.ensureDir(outputPath);
            await processDirectory(inputPath, outputPath);
        } else if (stats.isFile() && path.extname(item).toLowerCase() === '.heic') {
            const outputFilePath = path.join(outputDir, `${path.basename(item, path.extname(item))}.jpg`);
            await convertHeicToJpg(inputPath, outputFilePath);
            console.log(`Converted ${inputPath} to ${outputFilePath}`);
        }
    }
}

processDirectory(inputDir, outputDir)
    .then(() => console.log('All HEIC files have been converted.'))
    .catch((error) => console.error('Error converting images:', error));