import { afterAll, afterEach, beforeEach, describe, expect, test } from "@jest/globals";
import fs from 'fs';
import { ContentInjection } from "../simple-docs-scraper/transformers/ContentInjection.js";
import { deleteOutputFiles } from "./helpers/deleteOutputFiles.js";
import { getOutputPath } from "./helpers/getOutputPath.js";

describe("Injection", () => {
    let injection!: ContentInjection;
    const outDir = process.cwd() + '/src/tests/output';

    beforeEach(() => {
        deleteOutputFiles();
        
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
            }))
        })
    });

    describe("inject", () => {
        test("should be able to inject the docs into the content", () => {
            injection = new ContentInjection({
                template: getOutputPath('test.template.txt'),
                outDir,
            });

            const result = injection.replace('This is a test string.');

            expect(result).toContain('Start.');
            expect(result).toContain('This is a test string.');
            expect(result).toContain('End.');
        })
    })

    describe("injectIntoFile", () => {
        test("should be able to inject the docs into the file", () => {
            injection = new ContentInjection({
                template: getOutputPath('test.template.txt'),
                outDir,
            });
            
            const content = injection.replace('This is a test string.');
            injection.writeFile(content, 'test.txt');

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
    
});
