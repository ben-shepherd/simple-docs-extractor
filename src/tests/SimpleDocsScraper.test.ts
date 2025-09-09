import { beforeEach, describe, expect, test } from "@jest/globals";
import fs from 'fs';
import path from "path";
import { SimpleDocsScraper, SimpleDocsScraperConfig } from "../simple-docs-scraper/services/SimpleDocsScraper.js";
import { deleteOutputFiles } from "./helpers/deleteOutputFiles.js";
import { getOutputFilePath } from "./helpers/getOutputFilePath.js";

const jsFilesTarget = {
    globOptions: {
        cwd: path.join(process.cwd(), 'src/tests/files/js-files'),
        extensions: '**/*.{js,ts}',
    },
    outDir: getOutputFilePath('js-files'),
    createIndexFile: true,
}

const twigFilesTarget = {
    globOptions: {
        cwd: path.join(process.cwd(), 'src/tests/files/twig-files'),
        extensions: '**/*.html.twig',
    },
    outDir: getOutputFilePath('twig-files'),
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
            template: getOutputFilePath('index.template.md'),
        },
        documentation: {
            template: getOutputFilePath('documentation.template.md'),
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
        fs.writeFileSync(getOutputFilePath('index.template.md'), (
`Start.
%content%
End.    `
        ));
        fs.writeFileSync(getOutputFilePath('documentation.template.md'), (
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
        test("should be able to start the scraper", async () => {
            const result = await scraper.start();

            const jsFiles = fs.readdirSync(getOutputFilePath('js-files'));
            const twigFiles = fs.readdirSync(getOutputFilePath('twig-files'));

            const expectedJsFilesCount = 4; // 3 plus the index file
            const expectedTwigFilesCount = 2; // 1 plus the index file

            expect(result.successCount).toBe(4);
            expect(result.totalCount).toBe(5);
            expect(result.logs.some(log => log.includes('Error: noStartOrEndTags in file'))).toBe(true);
            expect(result.logs.some(log => log.includes('exampleFuncNoDocs.js'))).toBe(true);
            expect(jsFiles).toHaveLength(expectedJsFilesCount);
            expect(twigFiles).toHaveLength(expectedTwigFilesCount);
        })

        test("should be able to generate an index file with a line callback", async () => {
            scraper = new SimpleDocsScraper({
                ...defaultConfig,
                generators: {
                    ...defaultConfig.generators,
                    index: {
                        ...defaultConfig.generators.index,
                        lineCallback(fileNameEntry, lineNumber) {
                            return `- ${fileNameEntry} (${lineNumber})`;
                        },
                    }
                },
                targets: [
                    twigFilesTarget
                ]
            });

            const result = await scraper.start();

            const twigFiles = fs.readdirSync(getOutputFilePath('twig-files'));
            const indexFileContent = fs.readFileSync(getOutputFilePath('twig-files/index.md'), 'utf8');

            expect(result.successCount).toBe(1);
            expect(result.totalCount).toBe(1);
            expect(twigFiles).toHaveLength(2);
            expect(indexFileContent).toContain('example.md (1)');
        })

        test("should be able to generate an index file with a fileName callback", async () => {
            scraper = new SimpleDocsScraper({
                ...defaultConfig,
                generators: {
                    ...defaultConfig.generators,
                    index: {
                        ...defaultConfig.generators.index,
                        fileNameCallback(filePath) {
                            filePath = path.basename(filePath);
                            return filePath.replace('example.html.twig', 'example.twig');
                        },
                    }
                },
                targets: [
                    twigFilesTarget
                ]
            });

            const result = await scraper.start();

            const indexFileContent = fs.readFileSync(getOutputFilePath('twig-files/index.md'), 'utf8');

            expect(result.successCount).toBe(1);
            expect(result.totalCount).toBe(1);
            expect(indexFileContent).toContain('- example.twig');
        })

        test('should be able to generate an index file with a fileName callback and a line callback', async () => {
            scraper = new SimpleDocsScraper({
                ...defaultConfig,
                generators: {
                    ...defaultConfig.generators,
                    index: {
                        ...defaultConfig.generators.index,
                        lineCallback(fileNameEntry, lineNumber) {
                            return `- ${fileNameEntry} (${lineNumber})`;
                        },
                        fileNameCallback(filePath) {
                            filePath = path.basename(filePath);
                            return filePath.replace('example.html.twig', 'example.twig');
                        },
                    }
                },
                targets: [twigFilesTarget]
            });

            const result = await scraper.start();

            const indexFileContent = fs.readFileSync(getOutputFilePath('twig-files/index.md'), 'utf8');

            expect(result.successCount).toBe(1);
            expect(result.totalCount).toBe(1);
            expect(indexFileContent).toContain('- example.twig (1)');
        })

        test('should be able to generate an index file with the fileNameAsLink option', async () => {
            scraper = new SimpleDocsScraper({
                ...defaultConfig,
                generators: {
                    ...defaultConfig.generators,
                    index: {
                        ...defaultConfig.generators.index,
                        fileNameAsLink: true,
                    }
                },
                targets: [twigFilesTarget]
            });

            const result = await scraper.start();

            const indexFileContent = fs.readFileSync(getOutputFilePath('twig-files/index.md'), 'utf8');

            expect(result.successCount).toBe(1);
            expect(result.totalCount).toBe(1);
            expect(indexFileContent).toContain('- [example.md](example.md)');
        })
    });

    test('should generate logs', async () => {
        scraper = new SimpleDocsScraper({
            ...defaultConfig,
            targets: [jsFilesTarget],
        });
        
        const result = await scraper.start();

        expect(result.successCount >= 1).toBe(true);
        expect(result.logs.length >= 1).toBe(true);
    })
});
