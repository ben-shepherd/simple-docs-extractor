import { beforeEach, describe, expect, test } from "@jest/globals";
import fs from 'fs';
import path from "path";
import { IndexProcessor } from "../simple-docs-scraper/services/IndexProcessor";
import { deleteOutputFiles } from "./helpers/deleteOutputFiles";
import { getOutputPath } from "./helpers/getOutputPath";

describe("Example Test Suite", () => {
    let docsPath = getOutputPath('docs');

    beforeEach(() => {
        deleteOutputFiles();

        // Make folders
        fs.mkdirSync(getOutputPath('docs/sub-folder/sub-folder2'), { recursive: true });

        // Make test md files
        fs.writeFileSync(getOutputPath('docs/file.md'), 'File 1');
        fs.writeFileSync(getOutputPath('docs/sub-folder/file.md'), 'File 1');
        fs.writeFileSync(getOutputPath('docs/sub-folder/sub-folder2/file.md'), 'File 3');

        // Custom template file
        fs.mkdirSync(getOutputPath('templates'), { recursive: true });
        fs.writeFileSync(getOutputPath('templates/index.template.md'), 'Start. %content% End.');
    });

    // afterEach(() => {
    //     deleteOutputFiles();
    // })
    
    // afterAll(() => {
    //     deleteOutputFiles();
    // })

    describe("handle", () => {
        test("should generate the index files", async () => {
            const indexProcessor = new IndexProcessor({
                baseDir: docsPath,
            });
            
            await indexProcessor.handle();

            expect(fs.existsSync(path.join(docsPath, 'index.md'))).toBe(true);
            expect(fs.existsSync(path.join(docsPath, 'sub-folder/index.md'))).toBe(true);
            expect(fs.existsSync(path.join(docsPath, 'sub-folder/sub-folder2/index.md'))).toBe(true);
        })

        test("should generate the index files with a custom template", async () => {
            const indexProcessor = new IndexProcessor({
                baseDir: docsPath,
                template: getOutputPath('templates/index.template.md'),
            });
            
            await indexProcessor.handle();

            expect(fs.existsSync(path.join(docsPath, 'sub-folder/sub-folder2/index.md'))).toBe(true);

            const indexFileContent = fs.readFileSync(path.join(docsPath, 'sub-folder/sub-folder2/index.md'), 'utf8');
            expect(indexFileContent).toContain('Start.');
            expect(indexFileContent).toContain('- file.md');
            expect(indexFileContent).toContain('End.');
        })
    });
});
