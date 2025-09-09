import { afterAll, afterEach, beforeEach, describe, expect, test } from "@jest/globals";
import fs from 'fs';
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
            const pathToTestFile = getOutputPath('test.md');
            indexGenerator.generateContent([pathToTestFile]);

            const fileContent = fs.readFileSync(generatedFilePath, 'utf8');

            expect(fileContent).toContain('Start.');
            expect(fileContent).toContain('- test.md');
            expect(fileContent).toContain('End.');
        })

        test("should generate the content with the line callback", () => {
            const pathToTestFile = getOutputPath('test.md');
            indexGenerator = new IndexFileGenerator({
                template: getOutputPath('test.template.md'),
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

            const fileName = indexGenerator.getFileName('path/to/file1.md');

            expect(fileName).toBe('file1.md');
        })

        test("should return the file name with the callback", () => {
            indexGenerator = new IndexFileGenerator({
                template: getOutputPath('test.template.md'),
                outDir: process.cwd() + '/src/tests/output',
                fileNameCallback: (filePath) => filePath.replace('path/to/', ''),
            });

            const fileName = indexGenerator.getFileName('path/to/file1.md');

            expect(fileName).toBe('file1.md');
        })
    })
});
