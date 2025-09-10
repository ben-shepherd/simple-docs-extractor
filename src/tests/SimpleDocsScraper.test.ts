import { beforeEach, describe, expect, test } from "@jest/globals";
import fs from 'fs';
import path from "path";
import { SimpleDocsScraper, SimpleDocsScraperConfig } from "../simple-docs-scraper/services/SimpleDocsScraper.js";
import { deleteOutputFiles } from "./helpers/deleteOutputFiles.js";
import { getOutputPath } from "./helpers/getOutputPath.js";


const jsFilesTarget = {
    globOptions: {
        cwd: path.join(process.cwd(), 'src/tests/files/js-files'),
        extensions: '**/*.{js,ts}',
    },
    outDir: getOutputPath('js-files'),
    createIndexFile: true,
}

const twigFilesTarget = {
    globOptions: {
        cwd: path.join(process.cwd(), 'src/tests/files/twig-files'),
        extensions: '**/*.html.twig',
    },
    outDir: getOutputPath('twig-files'),
    createIndexFile: true,
}

const defaultConfig: SimpleDocsScraperConfig = {
    baseDir: path.join(process.cwd(), 'src/tests/files'),
    extraction: {
        extractMethod: 'tags',
        startTag: '<docs>',
        endTag: '</docs>',
    },
    searchAndReplace: {
        replace: '%content%',
    },
    generators: {
        index: {
            template: getOutputPath('index.template.md'),
        },
        documentation: {
            template: getOutputPath('documentation.template.md'),
        }
    },
    targets: [jsFilesTarget, twigFilesTarget]
}

describe("Example Test Suite", () => {
    let scraper!: SimpleDocsScraper;

    beforeEach(() => {
        deleteOutputFiles();

        scraper = new SimpleDocsScraper(defaultConfig);

        // Create a mock template file
        fs.writeFileSync(getOutputPath('index.template.md'), (
`Start.
%content%
End.    `
        ));
        fs.writeFileSync(getOutputPath('documentation.template.md'), (
`Start.
%content%
End.`
        ));
    });

    // afterEach(() => {
    //     deleteOutputFiles();
    // })

    // afterAll(() => {
    //     deleteOutputFiles();
    // })

    describe("config", () => {
        test("should be able to configure the scraper", () => {
            const config = scraper.getConfig();

            expect(config).toBe(defaultConfig);
        })
    });

    describe("start", () => {
        test("should be able to run the scraper", async () => {
            const result = await scraper.start();

            const jsFiles = fs.readdirSync(getOutputPath('js-files'));
            const twigFiles = fs.readdirSync(getOutputPath('twig-files'));

            const expectedJsFilesCount = 4; // 3 plus the index file
            const expectedTwigFilesCount = 2; // 1 plus the index file

            expect(result.successCount).toBe(4);
            expect(result.totalCount).toBe(5);
            expect(result.logs.some(log => log.includes('Error: noStartOrEndTags in file'))).toBe(true);
            expect(result.logs.some(log => log.includes('exampleFuncNoDocs.js'))).toBe(true);
            expect(jsFiles).toHaveLength(expectedJsFilesCount);
            expect(twigFiles).toHaveLength(expectedTwigFilesCount);
        })

        test('should generate logs', async () => {
            scraper = new SimpleDocsScraper({
                ...defaultConfig,
                targets: [jsFilesTarget],
            });
            
            const result = await scraper.start();
    
            expect(result.successCount >= 1).toBe(true);
            expect(result.logs.length >= 1).toBe(true);
        })
    
        test("should ignore files", async () => {
            scraper = new SimpleDocsScraper({
                ...defaultConfig,
                targets: [
                    {
                        globOptions: {
                            ...jsFilesTarget.globOptions,
                            cwd: path.join(process.cwd(), 'src/tests/files'),
                            ignore: ['ignored-files/**'],
                        },
                        outDir: getOutputPath('output-files'),
                        createIndexFile: true,
                    }
                ],
            });
            
            const result = await scraper.start();
            const jsFiles = fs.readdirSync(getOutputPath('output-files/js-files'));
        
            expect(result.successCount).toBeGreaterThan(1);
            expect(jsFiles.some(file => file === 'exampleFunc.md')).toBe(true);
            expect(jsFiles.some(file => file === 'ignoreFunc.md')).toBe(false);
        })
    })
});
