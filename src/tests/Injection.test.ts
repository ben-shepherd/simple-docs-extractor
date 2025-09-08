import { afterAll, afterEach, beforeEach, describe, expect, test } from "@jest/globals";
import fs from 'fs';
import { Injection } from "../simple-docs-scraper/services/Injection.js";
import { deleteOutputFiles } from "./helpers/deleteOutputFiles.js";
import { getOutputFilePath } from "./helpers/getOutputFilePath.js";

describe("Injection", () => {
    let injection!: Injection;

    beforeEach(() => {
        // Create a mock template file
        fs.writeFileSync(getOutputFilePath('test.template.txt'), 'Start. %content% End.');
    })

    afterEach(() => {
        deleteOutputFiles();
    })

    afterAll(() => {
        deleteOutputFiles();
    })

    describe("config", () => {
        test("should be able to configure the docs injection", () => {
            expect(() => new Injection({
                template: getOutputFilePath('test.template.txt'),
                outFile: 'test.txt',
                injectInto: '%content%',
            }))
        })
    });

    describe("inject", () => {
        test("should be able to inject the docs into the content", () => {
            const testString = `
                Start.
                %content%
                End.`;

            injection = new Injection({
                template: getOutputFilePath('test.template.txt'),
                outFile: 'test.txt',
                injectInto: '%content%',
            });

            const result = injection.injectIntoString(testString, 'This is a test string.');

            expect(result).toContain('Start.');
            expect(result).toContain('This is a test string.');
            expect(result).toContain('End.');
        })
    })

    describe("injectIntoFile", () => {
        test("should be able to inject the docs into the file", () => {
            injection = new Injection({
                template: getOutputFilePath('test.template.txt'),
                injectInto: '%content%',
                outFile: getOutputFilePath('test.txt'),
            });
            
            injection.injectIntoFile('This is a test string.');

            // Make folder recursively if it doesn't exist
            if (!fs.existsSync(process.cwd() + '/src/tests/output')) {
                fs.mkdirSync(process.cwd() + '/src/tests/output', { recursive: true });
            }

            // Check if the file exists
            if (!fs.existsSync(getOutputFilePath('test.txt'))) {
                throw new Error('File not found');
            }

            const fileContents = fs.readFileSync(getOutputFilePath('test.txt'), 'utf8');

            expect(fileContents).toContain('Start.');
            expect(fileContents).toContain('This is a test string.');
            expect(fileContents).toContain('End.');
        })
    })
    
    describe("errors", () => {
        test("should throw an error if the template file does not exist", () => {
            injection = new Injection({
                template: 'nonexistent.txt',
                outFile: 'test.txt',
                injectInto: '%content%',
            });

            expect(() => injection.injectIntoFile('This is a test string.')).toThrow('Template file not found');
        })
    })
});
