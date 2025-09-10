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
            docsExtractor = new DocumentContentExtractor({
                extractMethod: 'invalid',
            } as any);

            await expect(docsExtractor.extractFromFile(fileWithDocs)).rejects.toThrow('Error in extraction method 0: Invalid extraction method');
        })

        test('should accept a valid extract tags method', async () => {
            docsExtractor = new DocumentContentExtractor({
                extractMethod: 'tags',
                startTag: '<docs>',
                endTag: '</docs>',
                searchAndReplace: '%content%',
            });

            await expect(docsExtractor.extractFromFile(fileWithDocs)).resolves.not.toThrow();
        })

        test('should accept regex extract method', async () => {
            docsExtractor = new DocumentContentExtractor({
                extractMethod: 'regex',
                pattern: new RegExp('/<docs>(.*?)<\/docs>/s'),
                searchAndReplace: '%content%',
            });
            
            await expect(docsExtractor.extractFromFile(fileWithDocs)).resolves.not.toThrow();
        })

        test('should accept callback extract method', async () => {
            docsExtractor = new DocumentContentExtractor({
                extractMethod: 'callback',
                callback: async (fileContent) => {
                    return fileContent.match(/<docs>(.*?)<\/docs>/s)?.[1];
                },
                searchAndReplace: '%content%',
            });
            
            await expect(docsExtractor.extractFromFile(fileWithDocs)).resolves.not.toThrow();
        })
    });

    describe("extract using tags", () => {
        test("should perform expected behavior", async () => {
            docsExtractor = new DocumentContentExtractor({
                extractMethod: 'tags',
                startTag: '<docs>',
                endTag: '</docs>',
                searchAndReplace: '%content%',
            });

            const result = await docsExtractor.extractFromFile(fileWithDocs);

            expect(result[0].content[0]).toContain('#exampleFunc.js');
        })

        test("should not throw an error if the file does not contain the start and end tags", async () => {
            docsExtractor = new DocumentContentExtractor({
                extractMethod: 'tags',
                startTag: '<docs>',
                endTag: '</docs>',
                searchAndReplace: '%content%',
            });

            await expect(docsExtractor.extractFromFile(fileWithoutDocs)).resolves.not.toThrow();
        })


        test("should throw an error if the file does not exist", async () => {
            docsExtractor = new DocumentContentExtractor({
                extractMethod: 'tags',
                startTag: '<docs>',
                endTag: '</docs>',
                searchAndReplace: '%content%',
            });

            await expect(() => docsExtractor.extractFromFile('path-to-nonexistent-file.js')).rejects.toThrow('File not found');
        })
    });

    describe("extract using regex", () => {
        test("should extract the content using the regex", async () => {
            docsExtractor = new DocumentContentExtractor({
                extractMethod: 'regex',
                pattern: new RegExp(/<docs>(.*?)<\/docs>/s),
                searchAndReplace: '%content%',
            });

            const result = await docsExtractor.extractFromFile(fileWithDocs);

            expect(result[0].content[0]).toContain('#exampleFunc.js');
        });

        test("should not throw an error if the file does not contain the regex", async () => {
            docsExtractor = new DocumentContentExtractor({
                extractMethod: 'regex',
                pattern: new RegExp('/<docs>(.*?)<\/docs>/s'),
                searchAndReplace: '%content%',
            });

            await expect(docsExtractor.extractFromFile(fileWithoutDocs)).resolves.not.toThrow();
        });
    });

    describe("extract using callback", () => {
        test("should perform expected behavior", async () => {
            docsExtractor = new DocumentContentExtractor({
                extractMethod: 'callback',
                callback: async (fileContent) => {
                    return new RegExp(/<docs>(.*?)<\/docs>/s).exec(fileContent)?.[1];
                },
                searchAndReplace: '%content%',
            });

            const result = await docsExtractor.extractFromFile(fileWithDocs);

            expect(result[0].content[0]).toContain('#exampleFunc.js');
        });

        test("should return an error if the file does not contain the callback", async () => {
            docsExtractor = new DocumentContentExtractor({
                extractMethod: 'callback',
                callback: async (fileContent) => {
                    return undefined;
                },
                searchAndReplace: '%content%',
            });

            await expect(docsExtractor.extractFromFile(fileWithoutDocs)).rejects.toThrow('Callback function returned no content'); 
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

            docsExtractor = new DocumentContentExtractor({
                extractMethod: 'tags',
                startTag: '<docs>',
                endTag: '</docs>',
                searchAndReplace: '%content%'
            });
            let result =  await docsExtractor.extractFromFile(getOutputPath('code-block-check/example.js'))
            const extractedContent = MultiLineCommentClear({
                filePath: '',
                outFile: '',
                content: result[0].content[0]
            })

            expect(extractedContent.endsWith('```\n')).toBe(true)
        })
    })

    describe("variable extraction", () => {
        test("should accept an array of extraction methods", async () => {
            expect(() => new DocumentContentExtractor([
                {
                    extractMethod: 'tags',
                    startTag: '<docs>',
                    endTag: '</docs>',
                    searchAndReplace: '%content%'
                },
                {
                    extractMethod: 'tags',
                    startTag: '<method>',
                    endTag: '</method>',
                    searchAndReplace: '%methods%'
                }
            ])).not.toThrow();
        })

        test("should multiple extraction methods work together", async () => {
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
class Example {

    /**
     * <method>
     * This is a method
     * @param {string} str - The string to print
     * @param {number} num - The number to print
     * @returns {string} 'method'
     * </method>
     */
    static method(str: string, num: number) {
        return 'method';
    }

}`
            docsExtractor = new DocumentContentExtractor([
                {
                    extractMethod: 'tags',
                    startTag: '<docs>',
                    endTag: '</docs>',
                    searchAndReplace: '%content%'
                },
                {
                    extractMethod: 'tags',
                    startTag: '<method>',
                    endTag: '</method>',
                    searchAndReplace: '%methods%'
                }
            ])

            const results = await docsExtractor.extractFromString(sourceCode);

            const docTags = results.find(result => result.extractMethod === 'tags' && result.startTag === '<docs>');
            const methodTags = results.find(result => result.extractMethod === 'tags' && result.startTag === '<method>');

            expect(docTags?.content[0]).toContain('Some description here');
            expect(methodTags?.content[0]).toContain('This is a method');
        })
    })

    describe("array content", () => {

        test("should allow for multiple matches for tag extraction methods", async () => {
            const sourceCode: string = 
`class Example {

    /**
     * <method>
     * This is a method #1
     * @param {string} str - The string to print
     * @param {number} num - The number to print
     * @returns {string} 'method'
     * </method>
     */
    static method(str: string, num: number) {
        return 'method';
    }

     /**
     * <method>
     * This is a method #2
     * @param {string} str - The string to print
     * @param {number} num - The number to print
     * @returns {string} 'method'
     * </method>
     */
    static method2(str: string, num: number) {
        return 'method2';
    }

}`
            docsExtractor = new DocumentContentExtractor([
                {
                    extractMethod: 'tags',
                    startTag: '<method>',
                    endTag: '</method>',
                    searchAndReplace: '%methods%'
                }
            ])

            const results = await docsExtractor.extractFromString(sourceCode);
            expect(results).toHaveLength(1);

            const methodResult = results.find(result => result.extractMethod === 'tags' && result.startTag === '<method>');
            const methodResultContentArray = methodResult?.content;

            expect(methodResultContentArray).toHaveLength(2);
            expect(methodResultContentArray?.[0]).toContain('This is a method #1');
            expect(methodResultContentArray?.[1]).toContain('This is a method #2');
            
        })
    })
});
