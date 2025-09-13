import { LocalesService } from "@/simple-docs-scraper/services/LocalesService.js";
import { beforeEach, describe, expect, test } from "@jest/globals";
import fs from "fs";
import { deleteOutputFiles } from "./helpers/deleteOutputFiles.js";
import { getOutputPath } from "./helpers/getOutputPath.js";

describe("Locales", () => {

    beforeEach(() => {
        deleteOutputFiles();

        fs.writeFileSync(getOutputPath("test.txt"), "");
    });

    describe("getLocales", () => {
        test("should perform expected behavior", () => {
            const value = new LocalesService(getOutputPath("test.txt")).getLocales();

            expect(value).toBeDefined();
            expect(typeof value.updatedAt === 'string').toBe(true);
            expect(typeof value.fileName === 'string').toBe(true);
            expect(value.fileName).toBe("test.txt");
        })

        describe("getLocalesAsExtractedContents", () => {
            test("should perform expected behavior", () => {
                const extractedContentArray = new LocalesService(getOutputPath("test.txt")).getLocalesAsExtractedContents();

                const updatedAt = extractedContentArray.find(content => content.searchAndReplace === "%locales.updatedAt%");
                const fileName = extractedContentArray.find(content => content.searchAndReplace === "%locales.fileName%");

                expect(updatedAt).toBeDefined();
                expect(fileName).toBeDefined();
                expect(typeof  updatedAt?.content === 'string').toBe(true);
                expect(typeof fileName?.content === 'string').toBe(true);
                expect(updatedAt?.attributes).toEqual({});
                expect(fileName?.attributes).toEqual({});
                expect(updatedAt?.searchAndReplace).toBe("%locales.updatedAt%");
                expect(fileName?.searchAndReplace).toBe("%locales.fileName%");
            })
        })
    });

});
