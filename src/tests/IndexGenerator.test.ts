import { afterAll, afterEach, beforeEach, describe, expect, test } from "@jest/globals";
import fs from 'fs';
import { ExtensionReplacer } from "../simple-docs-scraper/services/ExtensionReplacer.js";
import { IndexGenerator, IndexGeneratorConfig } from "../simple-docs-scraper/services/IndexGenerator.js";
import { deleteOutputFiles } from "./helpers/deleteOutputFiles.js";
import { getOutputFilePath } from "./helpers/getOutputFilePath.js";

describe("Index Generator", () => {
    let indexGenerator!: IndexGenerator;
    let generatedFilePath: string = getOutputFilePath('index.md');

    const baseConfig: IndexGeneratorConfig = {
        template: getOutputFilePath('test.template.md'),
        outDir: process.cwd() + '/src/tests/output'
    }

    beforeEach(() => {
        indexGenerator = new IndexGenerator(baseConfig);
        // Create a mock template file
        fs.writeFileSync(getOutputFilePath('test.template.md'), 'Start. %content% End.');
    });

    afterEach(() => {
        deleteOutputFiles();
    })

    afterAll(() => {
        deleteOutputFiles();
    })

    describe("config", () => {
        test("should accept config", () => {
            expect(() => new IndexGenerator(baseConfig)).not.toThrow();
        })
    });

    describe("generateContent", () => {
        test("should generate the content", () => {
            const pathToTestFile = getOutputFilePath('test.md');
            indexGenerator.generateContent([pathToTestFile]);

            const fileContent = fs.readFileSync(generatedFilePath, 'utf8');

            expect(fileContent).toContain('Start.');
            expect(fileContent).toContain('- test.md');
            expect(fileContent).toContain('End.');
        })

        test("should generate the content with the line callback", () => {
            const pathToTestFile = getOutputFilePath('test.md');
            indexGenerator = new IndexGenerator({
                template: getOutputFilePath('test.template.md'),
                outDir: process.cwd() + '/src/tests/output',
                lineCallback: (fileNameEntry, lineNumber) => `${lineNumber}. ${ExtensionReplacer.replaceAllExtensions(fileNameEntry, 'md')}`,
            });

            indexGenerator.generateContent([pathToTestFile]);

            const fileContent = fs.readFileSync(generatedFilePath, 'utf8');

            expect(fileContent).toContain('Start.');
            expect(fileContent).toContain('1. test.md');
            expect(fileContent).toContain('End.');
        })

        test("should generate the content with the fileName callback", () => {
            indexGenerator = new IndexGenerator({
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
            indexGenerator = new IndexGenerator({
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
            indexGenerator = new IndexGenerator({
                ...baseConfig,
                fileNameAsLink: true,
            });

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
            indexGenerator = new IndexGenerator({
                ...baseConfig,
                baseDir: 'path/to',
                fileNameAsLink: true,
            });

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
            indexGenerator = new IndexGenerator({
                ...baseConfig,
                fileNameCallback: (filePath) => filePath.replace('path/to/', ''),
            });

            const fileName = indexGenerator.getFileName('path/to/file1.md', 'path/to/file1.md');

            expect(fileName).toBe('file1.md');
        })

        test("should return the file name with the callback", () => {
            indexGenerator = new IndexGenerator({
                template: getOutputFilePath('test.template.md'),
                outDir: process.cwd() + '/src/tests/output',
                fileNameCallback: (filePath) => filePath.replace('path/to/', ''),
            });

            const fileName = indexGenerator.getFileName('path/to/file1.md', 'path/to/file1.md');

            expect(fileName).toBe('file1.md');
        })
    })
});
