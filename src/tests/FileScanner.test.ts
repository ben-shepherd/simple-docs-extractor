import { describe, expect, test } from "@jest/globals";
import path from "path";
import { FileScanner } from "../simple-docs-scraper/services/FileScanner.js";

describe("File Collector", () => {
    let fileCollector!: FileScanner;

    describe("collect", () => {
        test("should collect the files", async () => {
            fileCollector = new FileScanner({
                cwd: 'src/tests/files/js-files',
                extensions: '**/*.js'
            });

            const files = await fileCollector.collect();

            expect(files).toContain(path.join(process.cwd(), 'src/tests/files/js-files/exampleFunc.js'));
        })

        test("should collect the files with the correct extensions", async () => {
            fileCollector = new FileScanner({
                cwd: 'src/tests/files/js-files',
                extensions: '**/*.{js,ts}',
            });

            const files = await fileCollector.collect();

            expect(files).toContain(path.join(process.cwd(), 'src/tests/files/js-files/exampleFunc.js'));
            expect(files).toContain(path.join(process.cwd(), 'src/tests/files/js-files/exampleTsFunc.ts'));
        })

        test("should collect the files from a nested directory", async () => {
            fileCollector = new FileScanner({
                cwd: 'src/tests/files/js-files',
                extensions: '**/*.js',
            });

            const files = await fileCollector.collect();

            expect(files).toContain(path.join(process.cwd(), 'src/tests/files/js-files/nested-js-files/nestedFunc.js'));
        })
    });
});
