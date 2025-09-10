import { beforeEach, describe, expect, test } from "@jest/globals";
import { glob } from 'glob';
import path from "path";
import { DEFAULT_CONFIG, publishDocs } from '../scripts/publish-docs.js';
import { SimpleDocsScraperConfig } from "../simple-docs-scraper/index.js";
import { deleteOutputFiles } from "./helpers/deleteOutputFiles.js";
import { getOutputPath } from "./helpers/getOutputPath.js";

describe("Publish Docs", () => {

    beforeEach(() => {
        deleteOutputFiles();
    });

    // afterEach(() => {
    //     deleteOutputFiles();
    // });

    // afterAll(() => {
    //     deleteOutputFiles();
    // });

    describe("publishDocs", () => {
        test("should publish the docs", async () => {
            
            // Overwrite the output directory for each target
            const testConfig = {
                ...DEFAULT_CONFIG,
                targets: DEFAULT_CONFIG.targets.map(target => {
                    return {
                        ...target,
                        outDir: path.join(getOutputPath(), path.basename(target.outDir))
                    }
                })
            }

            const result = await publishDocs(testConfig as SimpleDocsScraperConfig)
            const files = await glob('**/**.*', {
                absolute: true,
                cwd: path.join(process.cwd(), 'src/tests/output/docs'),
                nodir: true
            });

            expect(result?.successCount).toBeGreaterThanOrEqual(1);
            expect(result?.totalCount).toBeGreaterThanOrEqual(1);
            expect(files.length).toBeGreaterThanOrEqual(1);
            expect(files.some(file => file.includes('index.md'))).toBe(true);
            expect(files.some(file => file.includes('services\\SimpleDocsScraper.ts.md'))).toBe(true);
            expect(files.some(file => file.includes('generators\\DocFileGenerator.ts.md'))).toBe(true);
        })
    });
});
