import { afterAll, afterEach, beforeEach, describe, expect, test } from "@jest/globals";
import fs from 'fs';
import { DocGenerator } from "../simple-docs-scraper/services/DocGenerator";
import { deleteOutputFiles } from "./helpers/deleteOutputFiles";
import { getOutputFilePath } from "./helpers/getOutputFilePath";

describe("Doc Generator", () => {
    let docGenerator!: DocGenerator;

    beforeEach(() => {
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
            expect(() => docGenerator = new DocGenerator({
                template: getOutputFilePath('test.template.md'),
                outDir: process.cwd() + '/src/tests/output',
                searchAndReplace: '%content%',
            })).not.toThrow();
        })
    });

    describe("generateContent", () => {
        test("should generate the content", () => {
            docGenerator = new DocGenerator({
                template: getOutputFilePath('test.template.md'),
                outDir: process.cwd() + '/src/tests/output',
                searchAndReplace: '%content%',
            });

            docGenerator.generateContent('This is a test string.', 'test.md');

            const fileContent = fs.readFileSync(getOutputFilePath('test.md'), 'utf8');

            expect(fileContent).toContain('Start.');
            expect(fileContent).toContain('This is a test string.');
            expect(fileContent).toContain('End.');
        })
    });

    describe("errors", () => {
        test("should throw an error if the template file does not exist", () => {
            docGenerator = new DocGenerator({
                template: 'nonexistent.md',
                outDir: process.cwd() + '/src/tests/output',
                searchAndReplace: '%content%',
            });

            expect(() => docGenerator.generateContent('This is a test string.', 'test.md')).toThrow('Template file not found');
        })
    })
});
