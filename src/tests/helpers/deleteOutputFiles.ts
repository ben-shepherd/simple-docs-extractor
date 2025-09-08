import fs from 'fs';

export const deleteOutputFiles = () => {
    const outDir = process.cwd() + '/src/tests/output';

    // Check if the output directory exists
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir);
    }

    fs.rmSync(outDir, { recursive: true, force: true});
    fs.mkdirSync(outDir);
    fs.writeFileSync(outDir + '/.gitkeep', '');
}
