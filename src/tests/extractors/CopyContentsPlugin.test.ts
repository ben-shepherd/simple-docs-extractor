import { CopyContentsPlugin } from "@/simple-docs-scraper/extractors/CopyContentsPlugin.js";
import { ErrorResult } from "@/simple-docs-scraper/index.js";
import { beforeEach, describe, expect, test } from "@jest/globals";
import fs from "fs";
import { deleteOutputFiles } from "../helpers/deleteOutputFiles.js";
import { getOutputPath } from "../helpers/getOutputPath.js";

describe("CopyContentsPlugin", () => {

    beforeEach(() => {
        deleteOutputFiles();
    });

    describe("extractFromString", () => {
        test("should copy the contents of the file", async () => {

            // Create a sample file
            fs.writeFileSync(getOutputPath("sample.txt"), "This is a sample file");

            const results = await new CopyContentsPlugin({ 
                fileToCopy: getOutputPath("sample.txt"),
                searchAndReplace: "%content%" 
            })
            .extractFromString();

            expect(results).toHaveLength(1);
            expect(results[0].content).toBe("This is a sample file");
            expect(results[0].searchAndReplace).toBe("%content%");
        });

        test("should contain results for multiple files", async () => {

            // Create sample files
            fs.writeFileSync(getOutputPath("sample.txt"), "This is a sample file");
            fs.writeFileSync(getOutputPath("sample2.txt"), "This is a sample file 2");

            const results = await new CopyContentsPlugin({ 
                fileToCopy: [
                    getOutputPath("sample.txt"),
                    getOutputPath("sample2.txt")
                ],
                searchAndReplace: "%content%" 
            })
            .extractFromString();

            expect(results).toHaveLength(2);
            expect(results[0].content).toBe("This is a sample file");
            expect(results[0].searchAndReplace).toBe("%content%");
            expect(results[1].content).toBe("This is a sample file 2");
            expect(results[1].searchAndReplace).toBe("%content%");
        });

        test("should return an error if the file does not exist", async () => {

            const results = await new CopyContentsPlugin({ fileToCopy: "nonexistent.txt", searchAndReplace: "%content%" }).extractFromString();

            expect(results).toHaveProperty("errorMessage");
            expect((results as ErrorResult).throwable).toBe(true);
            expect((results as ErrorResult).errorMessage).toContain("Unable to copy file contents. File 'nonexistent.txt' not found");
        });
    });
});
