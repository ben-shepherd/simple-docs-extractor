import { afterAll, afterEach, beforeEach, describe, expect, test } from "@jest/globals";
import fs from 'fs';
import path from "path";
import { IndexFileGenerator, IndexFileGeneratorConfig } from "../simple-docs-scraper/generators/IndexFileGenerator.js";
import { ExtensionReplacer } from "../simple-docs-scraper/transformers/ExtensionReplacer.js";
import { deleteOutputFiles } from "./helpers/deleteOutputFiles.js";
import { getOutputPath } from "./helpers/getOutputPath.js";

describe("Index Generator", () => {
    let indexGenerator!: IndexFileGenerator;
    let generatedFilePath: string = getOutputPath('index.md');

    const baseConfig: IndexFileGeneratorConfig = {
        template: getOutputPath('test.template.md'),
        outDir: process.cwd() + '/src/tests/output'
    }

    beforeEach(() => {
        indexGenerator = new IndexFileGenerator(baseConfig);
        // Create a mock template file
        fs.writeFileSync(getOutputPath('test.template.md'), 'Start. %content% End.');
    });

    afterEach(() => {
        deleteOutputFiles();
    })

    afterAll(() => {
        deleteOutputFiles();
    })

    describe("config", () => {
        test("should accept config", () => {
            expect(() => new IndexFileGenerator(baseConfig)).not.toThrow();
        })
    });

    describe("generateContent", () => {
        test("should generate the content", () => {
            
            fs.writeFileSync(getOutputPath('test.md'), 'File 1');
            indexGenerator.generateContent([getOutputPath('test.md')]);

            const fileContent = fs.readFileSync(generatedFilePath, 'utf8');

            expect(fileContent).toContain('Start.');
            expect(fileContent).toContain('- test.md');
            expect(fileContent).toContain('End.');
        })

        test("should generate the content with the line callback", () => {

            indexGenerator = new IndexFileGenerator({
                template: getOutputPath('test.template.md'),
                outDir: process.cwd() + '/src/tests/output',
                lineCallback: (fileNameEntry, lineNumber) => `${lineNumber}. ${ExtensionReplacer.replaceAllExtensions(fileNameEntry, 'md')}`,
            });

            fs.writeFileSync(getOutputPath('test.md'), 'File 1');

            indexGenerator.generateContent([
                getOutputPath('test.md')
            ]);

            const fileContent = fs.readFileSync(generatedFilePath, 'utf8');

            expect(fileContent).toContain('Start.');
            expect(fileContent).toContain('1. test.md');
            expect(fileContent).toContain('End.');
        })

        test("should generate the content with the fileName callback", () => {
            indexGenerator = new IndexFileGenerator({
                ...baseConfig,
                fileNameCallback: (filePath) => filePath.replace('path/to/', ''),
            });

            indexGenerator.generateContent([
                'path/to/test.md',
                'path/to/test2.md',
            ]);

            const fileContent = fs.readFileSync(generatedFilePath, 'utf8');

            expect(fileContent).toContain('Start.');
            expect(fileContent).toContain('- test.md');
            expect(fileContent).toContain('- test2.md');
            expect(fileContent).toContain('End.');
        })

        test("should generate the content with the line callback and the fileName callback", () => {
            indexGenerator = new IndexFileGenerator({
                ...baseConfig,
                lineCallback: (fileNameEntry, lineNumber) => `${lineNumber}. ${fileNameEntry}`,
                fileNameCallback: (filePath) => filePath.replace('path/to/', ''),
            });

            indexGenerator.generateContent([
                'path/to/test.md',
                'path/to/test2.md',
            ]);

            const fileContent = fs.readFileSync(generatedFilePath, 'utf8');

            expect(fileContent).toContain('Start.');
            expect(fileContent).toContain('1. test.md');
            expect(fileContent).toContain('2. test2.md');
            expect(fileContent).toContain('End.');
        })

        test("should generate the content with the fileNameAsLink option", () => {
            indexGenerator = new IndexFileGenerator({
                ...baseConfig,
                markdownLink: true,
            });
            
            fs.mkdirSync('path/to', { recursive: true });
            fs.writeFileSync('path/to/test.md', 'File 1');
            fs.writeFileSync('path/to/test2.md', 'File 1');

            indexGenerator.generateContent([
                'path/to/test.md',
                'path/to/test2.md',
            ]);

            const fileContent = fs.readFileSync(generatedFilePath, 'utf8');

            expect(fileContent).toContain('Start.');
            expect(fileContent).toContain('- [test.md](test.md)');
            expect(fileContent).toContain('- [test2.md](test2.md)');
            expect(fileContent).toContain('End.');
        })

        test("should generate the content with the baseDir option", () => {
            indexGenerator = new IndexFileGenerator({
                ...baseConfig,
                baseDir: 'path/to',
                markdownLink: true,
            });
            
            fs.mkdirSync('path/to', { recursive: true });
            fs.writeFileSync('path/to/test.md', 'File 1');
            fs.writeFileSync('path/to/test2.md', 'File 1');

            indexGenerator.generateContent([
                'path/to/test.md',
                'path/to/test2.md',
            ]);

            const fileContent = fs.readFileSync(generatedFilePath, 'utf8');

            expect(fileContent).toContain('Start.');
            expect(fileContent).toContain('- [test.md](test.md)');
            expect(fileContent).toContain('- [test2.md](test2.md)');
            expect(fileContent).toContain('End.');
        })
    })

    describe("getFileName", () => {
        test("should return the file name", () => {
            indexGenerator = new IndexFileGenerator({
                ...baseConfig,
                fileNameCallback: (filePath) => filePath.replace('path/to/', ''),
            });

            const fileName = indexGenerator.getRenderedEntryString('path/to/file1.md');

            expect(fileName).toBe('file1.md');
        })

        test("should return the file name with the callback", () => {
            indexGenerator = new IndexFileGenerator({
                template: getOutputPath('test.template.md'),
                outDir: process.cwd() + '/src/tests/output',
                fileNameCallback: (filePath) => filePath.replace('path/to/', ''),
            });

            const fileName = indexGenerator.getRenderedEntryString('path/to/file1.md');

            expect(fileName).toBe('file1.md');
        })
    })
    
    describe("sorting", () => {
        
        test("should alphabetically sort the files", async () => {
            const docsPathAlpha = getOutputPath('docs-alpha');
            const outDir = getOutputPath('out-alpha');

            fs.mkdirSync(outDir, { recursive: true });
            fs.mkdirSync(docsPathAlpha, { recursive: true });
            fs.writeFileSync(getOutputPath('docs-alpha/a.md'), 'File 1');
            fs.writeFileSync(getOutputPath('docs-alpha/b.md'), 'File 1');

            const generator = new IndexFileGenerator({
                baseDir: docsPathAlpha,
                outDir: outDir,
            });
            
            generator.generateContent([
                getOutputPath('docs-alpha/a.md'),
                getOutputPath('docs-alpha/b.md'),
            ]);

            const indexFileContent = fs.readFileSync(path.join(outDir, 'index.md'), 'utf8');

            expect(indexFileContent).toBe('- a.md\n- b.md\n');
        })
    })

});
