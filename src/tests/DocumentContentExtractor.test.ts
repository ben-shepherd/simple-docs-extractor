import { beforeEach, describe, expect, test } from "@jest/globals";
import fs from 'fs';
import { DocumentContentExtractor } from "../simple-docs-scraper/files/DocumentContentExtractor.js";
import { MultiLineCommentClear } from '../simple-docs-scraper/formatters/MultiLineCommentClear.js';
import { deleteOutputFiles } from "./helpers/deleteOutputFiles.js";
import { getOutputPath } from './helpers/getOutputPath.js';

describe("Docs Extractor", () => {
    let docsExtractor!: DocumentContentExtractor;
    const fileWithDocs = process.cwd() + '/src/tests/files/js-files/exampleFunc.js';
    const fileWithoutDocs = process.cwd() + '/src/tests/files/js-files/exampleFuncNoDocs.js';

    beforeEach(() => {
        deleteOutputFiles()
    })

    describe("config", () => {
        test("should throw an error if the extract method is not valid", async () => {
            docsExtractor = new DocumentContentExtractor(fileWithDocs, {
                extractMethod: 'invalid',
            } as any);

            await expect(docsExtractor.extract()).rejects.toThrow('You must provide a valid extract method');
        })

        test('should accept a valid extract tags method', async () => {
            docsExtractor = new DocumentContentExtractor(fileWithDocs, {
                extractMethod: 'tags',
                startTag: '<docs>',
                endTag: '</docs>',
            });

            await expect(docsExtractor.extract()).resolves.not.toThrow();
        })

        test('should accept regex extract method', async () => {
            docsExtractor = new DocumentContentExtractor(fileWithDocs, {
                extractMethod: 'regex',
                pattern: new RegExp('/<docs>(.*?)<\/docs>/s'),
            });
            
            await expect(docsExtractor.extract()).resolves.not.toThrow();
        })

        test('should accept callback extract method', async () => {
            docsExtractor = new DocumentContentExtractor(fileWithDocs, {
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
            docsExtractor = new DocumentContentExtractor(fileWithDocs, {
                extractMethod: 'tags',
                startTag: '<docs>',
                endTag: '</docs>',
            });

            const result = await docsExtractor.extract();

            expect(result.sucess).toBe(true);
            expect(result.docs).toContain('#exampleFunc.js');
        })

        test("should return an error if the file does not contain the start and end tags", async () => {
            docsExtractor = new DocumentContentExtractor(fileWithoutDocs, {
                extractMethod: 'tags',
                startTag: '<docs>',
                endTag: '</docs>',
            });

            const result = await docsExtractor.extract();

            expect(result.sucess).toBe(false);
            expect(result.errorType).toBe('noStartOrEndTags');
        })


        test("should return an error if the file does not exist", async () => {
            docsExtractor = new DocumentContentExtractor('path-to-nonexistent-file.js', {
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
            docsExtractor = new DocumentContentExtractor(fileWithDocs, {
                extractMethod: 'regex',
                pattern: new RegExp(/<docs>(.*?)<\/docs>/s),
            });

            const result = await docsExtractor.extract();

            expect(result.sucess).toBe(true);
            expect(result.docs).toContain('#exampleFunc.js');
        });

        test("should return an error if the file does not contain the regex", async () => {
            docsExtractor = new DocumentContentExtractor(fileWithoutDocs, {
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
            docsExtractor = new DocumentContentExtractor(fileWithDocs, {
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
            docsExtractor = new DocumentContentExtractor(fileWithoutDocs, {
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

    describe("code block checks", () => {
        test("should correctly extract documentation with code blocks using the tag method", async () => {

            const sourceCode: string = 
`/**
 * <docs>
 * Some description here
 * 
 * @example
 * \`\`\`typescript
 *  console.log('code block example')
 * \`\`\`
 * </docs>
 */
const example = () => null;`;

            fs.mkdirSync(getOutputPath('code-block-check'))
            fs.writeFileSync(getOutputPath('code-block-check/example.js'), sourceCode)

            docsExtractor = new DocumentContentExtractor(getOutputPath('code-block-check/example.js'), {
                extractMethod: 'tags',
                startTag: '<docs>',
                endTag: '</docs>'
            });
            let result =  await docsExtractor.extract()
            const extractedContent = MultiLineCommentClear({
                filePath: '',
                outFile: '',
                content: result.docs
            })

            expect(extractedContent.endsWith('```\n')).toBe(true)
        })

        test("should correctly extract documentation with code blocks using known bugged contents", async () => {

            const sourceCode: string = 
`/**
 * <docs>
 * Main orchestrator class for extracting and generating documentation from source files.
 * 
 * This class coordinates the entire documentation generation process by scanning files,
 * extracting documentation content, and generating both individual documentation files
 * and index files. It supports multiple targets and provides comprehensive logging.
 * 
 * @example
 * \`\`\`typescript
 * const scraper = new SimpleDocsScraper({
 *   baseDir: './src',
 *   extraction: {
 *     extractMethod: 'tags',
 *     startTag: '#START',
 *     endTag: '#END'
 *   },
 *   searchAndReplace: { replace: '{{CONTENT}}' },
 *   generators: {
 *     index: { template: './templates/index.md' },
 *     documentation: { template: './templates/doc.md' }
 *   },
 *   targets: [{
 *     globOptions: { cwd: './src', extensions: '*.js' },
 *     outDir: './docs',
 *     createIndexFile: true
 *   }]
 * });
 * 
 * const result = await scraper.start();
 * \`\`\`
 * </docs>
 */
export class SimpleDocsScraper {`;

            fs.mkdirSync(getOutputPath('code-block-check'))
            fs.writeFileSync(getOutputPath('code-block-check/example.js'), sourceCode)

            docsExtractor = new DocumentContentExtractor(getOutputPath('code-block-check/example.js'), {
                extractMethod: 'tags',
                startTag: '<docs>',
                endTag: '</docs>'
            });
            let result =  await docsExtractor.extract()
            const extractedContent = MultiLineCommentClear({
                filePath: '',
                outFile: '',
                content: result.docs
            })

            expect(extractedContent.endsWith('```\n')).toBe(true)
        })
    })
});
