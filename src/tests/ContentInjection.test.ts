import { afterAll, afterEach, beforeEach, describe, expect, test } from "@jest/globals";
import fs from 'fs';
import { ContentInjection } from "../simple-docs-scraper/transformers/ContentInjection.js";
import { deleteOutputFiles } from "./helpers/deleteOutputFiles.js";
import { getOutputPath } from "./helpers/getOutputPath.js";

describe("Injection", () => {
    let injection!: ContentInjection;
    const outDir = process.cwd() + '/src/tests/output';

    beforeEach(() => {
        // Create a mock template file
        fs.writeFileSync(getOutputPath('test.template.txt'), 'Start. %content% End.');
    })

    afterEach(() => {
        deleteOutputFiles();
    })

    afterAll(() => {
        deleteOutputFiles();
    })

    describe("config", () => {
        test("should be able to configure the docs injection", () => {
            expect(() => new ContentInjection({
                template: getOutputPath('test.template.txt'),
                outDir,
                searchAndReplace: '%content%',
            }))
        })
    });

    describe("inject", () => {
        test("should be able to inject the docs into the content", () => {
            const testString = `
                Start.
                %content%
                End.`;

            injection = new ContentInjection({
                template: getOutputPath('test.template.txt'),
                outDir,
                searchAndReplace: '%content%',
            });

            const result = injection.injectIntoString(testString, 'This is a test string.');

            expect(result).toContain('Start.');
            expect(result).toContain('This is a test string.');
            expect(result).toContain('End.');
        })
    })

    describe("injectIntoFile", () => {
        test("should be able to inject the docs into the file", () => {
            injection = new ContentInjection({
                template: getOutputPath('test.template.txt'),
                searchAndReplace: '%content%',
                outDir,
            });
            
            injection.injectIntoFile('This is a test string.', 'test.txt');

            // Make folder recursively if it doesn't exist
            if (!fs.existsSync(process.cwd() + '/src/tests/output')) {
                fs.mkdirSync(process.cwd() + '/src/tests/output', { recursive: true });
            }

            // Check if the file exists
            if (!fs.existsSync(getOutputPath('test.txt'))) {
                throw new Error('File not found');
            }

            const fileContents = fs.readFileSync(getOutputPath('test.txt'), 'utf8');

            expect(fileContents).toContain('Start.');
            expect(fileContents).toContain('This is a test string.');
            expect(fileContents).toContain('End.');
        })
    })
    
    describe("errors", () => {
        test("should throw an error if the template file does not exist", () => {
            injection = new ContentInjection({
                template: 'nonexistent.txt',
                outDir,
                searchAndReplace: '%content%',
            });

            expect(() => injection.injectIntoFile('This is a test string.', 'test.txt')).toThrow('Template file not found');
        })
    })
});
