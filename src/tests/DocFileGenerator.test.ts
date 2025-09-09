import { afterAll, afterEach, beforeEach, describe, expect, test } from "@jest/globals";
import fs from 'fs';
import { DocFileGenerator } from "../simple-docs-scraper/generators/DocFileGenerator";
import { deleteOutputFiles } from "./helpers/deleteOutputFiles";
import { getOutputPath } from "./helpers/getOutputPath";

describe("Doc File Generator", () => {
    let docGenerator!: DocFileGenerator;

    beforeEach(() => {
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
            expect(() => docGenerator = new DocFileGenerator({
                template: getOutputPath('test.template.md'),
                outDir: process.cwd() + '/src/tests/output',
                searchAndReplace: '%content%',
            })).not.toThrow();
        })

        test("should accept no template file", () => {
            expect(() => docGenerator = new DocFileGenerator({
                outDir: process.cwd() + '/src/tests/output',
                searchAndReplace: '%content%',
            })).not.toThrow();
        })
    });

    describe("generateContent", () => {
        test("should generate the content and save to markdown file", () => {
            docGenerator = new DocFileGenerator({
                template: getOutputPath('test.template.md'),
                outDir: process.cwd() + '/src/tests/output',
                searchAndReplace: '%content%',
            });

            const injectedContent = docGenerator.generateContentString('This is a test string.');
            docGenerator.saveToMarkdownFile(injectedContent, 'test.md');

            const fileContent = fs.readFileSync(getOutputPath('test.md'), 'utf8');

            expect(fileContent).toContain('Start.');
            expect(fileContent).toContain('This is a test string.');
            expect(fileContent).toContain('End.');
        })
    });

    describe("errors", () => {
        test("should throw an error if the template file does not exist", () => {
            docGenerator = new DocFileGenerator({
                template: 'nonexistent.md',
                outDir: process.cwd() + '/src/tests/output',
                searchAndReplace: '%content%',
            });

            expect(() => docGenerator.generateContentString('This is a test string.')).toThrow('Template file not found');
        })
    })
});
