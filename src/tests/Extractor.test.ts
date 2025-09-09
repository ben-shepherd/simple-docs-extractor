import { describe, expect, test } from "@jest/globals";
import { DocsExtractor } from "../simple-docs-scraper/services/Extractor.js";

describe("Docs Extractor", () => {
    let docsExtractor!: DocsExtractor;
    const fileWithDocs = process.cwd() + '/src/tests/files/js-files/exampleFunc.js';
    const fileWithoutDocs = process.cwd() + '/src/tests/files/js-files/exampleFuncNoDocs.js';

    describe("config", () => {
        test("should throw an error if the extract method is not valid", async () => {
            docsExtractor = new DocsExtractor(fileWithDocs, {
                extractMethod: 'invalid',
            } as any);

            await expect(docsExtractor.extract()).rejects.toThrow('You must provide a valid extract method');
        })

        test('should accept a valid extract tags method', async () => {
            docsExtractor = new DocsExtractor(fileWithDocs, {
                extractMethod: 'tags',
                startTag: '<docs>',
                endTag: '</docs>',
            });

            await expect(docsExtractor.extract()).resolves.not.toThrow();
        })

        test('should accept regex extract method', async () => {
            docsExtractor = new DocsExtractor(fileWithDocs, {
                extractMethod: 'regex',
                pattern: new RegExp('/<docs>(.*?)<\/docs>/s'),
            });
            
            await expect(docsExtractor.extract()).resolves.not.toThrow();
        })

        test('should accept callback extract method', async () => {
            docsExtractor = new DocsExtractor(fileWithDocs, {
                extractMethod: 'callback',
                callback: async (fileContent) => {
                    return fileContent.match('/<docs>(.*?)<\/docs>/s')?.[1];
                },
            });
            
            await expect(docsExtractor.extract()).resolves.not.toThrow();
        })
    });

    describe("extract using tags", () => {
        test("should perform expected behavior", async () => {
            docsExtractor = new DocsExtractor(fileWithDocs, {
                extractMethod: 'tags',
                startTag: '<docs>',
                endTag: '</docs>',
            });

            const result = await docsExtractor.extract();

            expect(result.sucess).toBe(true);
            expect(result.docs).toContain('#exampleFunc.js');
        })

        test("should return an error if the file does not contain the start and end tags", async () => {
            docsExtractor = new DocsExtractor(fileWithoutDocs, {
                extractMethod: 'tags',
                startTag: '<docs>',
                endTag: '</docs>',
            });

            const result = await docsExtractor.extract();

            expect(result.sucess).toBe(false);
            expect(result.errorType).toBe('noStartOrEndTags');
        })


        test("should return an error if the file does not exist", async () => {
            docsExtractor = new DocsExtractor('path-to-nonexistent-file.js', {
                extractMethod: 'tags',
                startTag: '<docs>',
                endTag: '</docs>',
            });

            const result = await docsExtractor.extract();

            expect(result.sucess).toBe(false);
            expect(result.errorType).toBe('fileNotFound');
        })
    });

    describe("extract using regex", () => {
        test("should perform expected behavior", async () => {
            docsExtractor = new DocsExtractor(fileWithDocs, {
                extractMethod: 'regex',
                pattern: new RegExp(/<docs>(.*?)<\/docs>/s),
            });

            const result = await docsExtractor.extract();

            expect(result.sucess).toBe(true);
            expect(result.docs).toContain('#exampleFunc.js');
        });

        test("should return an error if the file does not contain the regex", async () => {
            docsExtractor = new DocsExtractor(fileWithoutDocs, {
                extractMethod: 'regex',
                pattern: new RegExp('/<docs>(.*?)<\/docs>/s'),
            });

            const result = await docsExtractor.extract();

            expect(result.sucess).toBe(false);
            expect(result.errorType).toBe('noDocs');
        });
    });

    describe("extract using callback", () => {
        test("should perform expected behavior", async () => {
            docsExtractor = new DocsExtractor(fileWithDocs, {
                extractMethod: 'callback',
                callback: async (fileContent) => {
                    return new RegExp(/<docs>(.*?)<\/docs>/s).exec(fileContent)?.[1];
                },
            });

            const result = await docsExtractor.extract();

            expect(result.sucess).toBe(true);
            expect(result.docs).toContain('#exampleFunc.js');
        });

        test("should return an error if the file does not contain the callback", async () => {
            docsExtractor = new DocsExtractor(fileWithoutDocs, {
                extractMethod: 'callback',
                callback: async (fileContent) => {
                    return undefined;
                },
            });

            const result = await docsExtractor.extract();

            expect(result.sucess).toBe(false);
            expect(result.errorType).toBe('noDocs');
        });
    });
});
