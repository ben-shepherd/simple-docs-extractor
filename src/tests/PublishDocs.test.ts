import { afterAll, afterEach, beforeEach, describe, expect, test } from "@jest/globals";
import fs from "fs";
import path from "path";
import { MultiLineCommentClear, SimpleDocsScraper, SimpleDocsScraperConfig } from "../simple-docs-scraper/index.js";
import { deleteOutputFiles } from "./helpers/deleteOutputFiles.js";

describe("Publish Docs", () => {

    beforeEach(() => {
        deleteOutputFiles();
    });

    afterEach(() => {
        deleteOutputFiles();
    });

    afterAll(() => {
        deleteOutputFiles();
    });

    describe("publishDocs", () => {
        test("should publish the docs", async () => {
            const config: SimpleDocsScraperConfig = {
                baseDir: process.cwd(),
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
                        template: path.join(process.cwd(), 'templates/index.template.md'),
                        fileNameAsLink: true,
                    },
                    documentation: {
                        template: path.join(process.cwd(), 'templates/documentation.template.md'),
                    },
                },
                targets: [{
                    globOptions: {
                        cwd: path.join(process.cwd(), 'src/simple-docs-scraper'),
                        extensions: '**/*.{js,ts}',
                    },
                    outDir: path.join(process.cwd(), 'src/tests/output'),
                    createIndexFile: true,
                }],
                formatters: [MultiLineCommentClear],
            };
            
            const result = await new SimpleDocsScraper(config).start()
            const docFiles = fs.readdirSync(path.join(process.cwd(), 'src/tests/output'));

            expect(result?.successCount).toBeGreaterThanOrEqual(1);
            expect(result?.totalCount).toBeGreaterThanOrEqual(1);
            expect(docFiles.length).toBeGreaterThanOrEqual(1);
            expect(docFiles.some(file => file === 'index.md')).toBe(true);
            expect(docFiles.some(file => file === 'SimpleDocsScraper.md')).toBe(true);
        })
    });
});
