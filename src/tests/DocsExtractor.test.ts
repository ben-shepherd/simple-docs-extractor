import { beforeEach, describe, expect, test } from "@jest/globals";
import { DocsExtractor } from "../simple-docs-scraper/services/DocsExtractor.js";

describe("Docs Extractor", () => {
    let docsExtractor!: DocsExtractor;
    let files!: string[];

    beforeEach(() => {
        files = [
            process.cwd() + '/src/tests/js-files/exampleFunc.js',
            process.cwd() + '/src/tests/js-files/exampleTsFunc.ts',
            process.cwd() + '/src/tests/js-files/nested-js-files/nestedFunc.js',
            process.cwd() + '/src/tests/js-files/exampleFuncNoDocs.js',
        ];
    });

    describe("extract", () => {
        test("should perform expected behavior", () => {
            docsExtractor = new DocsExtractor(files[0], {
                tags: {
                    startDocs: '<docs>',
                    endDocs: '</docs>',
                }
            });

            const result = docsExtractor.extract();

            console.log(1, result.docs);

            expect(result.sucess).toBe(true);
            expect(result.docs).toContain('#exampleFunc.js');
        })

        test("should return an error if the file does not contain the start and end tags", () => {
            docsExtractor = new DocsExtractor(files[3], {
                tags: {
                    startDocs: '<docs>',
                    endDocs: '</docs>',
                }
            });

            const result = docsExtractor.extract();

            expect(result.sucess).toBe(false);
            expect(result.errorType).toBe('noStartOrEndTags');
        })


        test("should return an error if the file does not exist", () => {
            docsExtractor = new DocsExtractor('path-to-nonexistent-file.js', {
                tags: {
                    startDocs: '<docs>',
                    endDocs: '</docs>',
                }
            });

            const result = docsExtractor.extract();

            expect(result.sucess).toBe(false);
            expect(result.errorType).toBe('fileNotFound');
        })
    });
});
