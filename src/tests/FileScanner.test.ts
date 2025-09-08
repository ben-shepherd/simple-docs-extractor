import { beforeEach, describe, expect, test } from "@jest/globals";
import { FileCollector } from "../simple-docs-scraper/services/FileCollector.js";

describe("File Collector", () => {
    let fileCollector!: FileCollector;

    describe("collect", () => {
        test("should collect the files", async () => {
            fileCollector = new FileCollector({
                path: 'src/tests/js-files',
                extensionsPattern: '**/*.js'
            });

            const files = await fileCollector.collect();

            expect(files).toContain(process.cwd() + '/src/tests/js-files/exampleFunc.js');
        })

        test("should collect the files with the correct extensions", async () => {
            fileCollector = new FileCollector({
                path: 'src/tests/js-files',
                extensionsPattern: '**/*.{js,ts}',
            });

            const files = await fileCollector.collect();

            console.log(3, files, process.cwd());

            expect(files).toContain(process.cwd() + '/src/tests/js-files/exampleFunc.js');
            expect(files).toContain(process.cwd() + '/src/tests/js-files/exampleTsFunc.ts');
        })

        test("should collect the files from a nested directory", async () => {
            fileCollector = new FileCollector({
                path: 'src/tests/js-files',
                extensionsPattern: '**/*.js',
            });

            const files = await fileCollector.collect();

            expect(files).toContain(process.cwd() + '/src/tests/js-files/nested-js-files/nestedFunc.js');
        })
    });
});
