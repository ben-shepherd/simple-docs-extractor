import { ErrorResult } from "@/simple-docs-scraper/extractors/DocumentContentExtractor.js";
import { RegexExtractorPlugin } from "@/simple-docs-scraper/extractors/RegexExtractorPlugin.js";
import { beforeEach, describe, expect, test } from "@jest/globals";

describe("Regex Extractor", () => {
  let regexExtractor!: RegexExtractorPlugin;

  beforeEach(() => {
    regexExtractor = new RegexExtractorPlugin({
      pattern: new RegExp(/<docs>(.*?)<\/docs>/s),
      searchAndReplace: "%content%",
    });
  });

  describe("config", () => {
    test("constructor should set config", () => {
      expect(
        () =>
          new RegexExtractorPlugin({
            pattern: new RegExp("/<docs>(.*?)<\/docs>/s"),
            searchAndReplace: "%content%",
          }),
      ).not.toThrow();
    });

    test("should set config", () => {
      expect(() =>
        regexExtractor.setConfig({
          pattern: new RegExp(/<docs>(.*?)<\/docs>/s),
          searchAndReplace: "%content%",
        }),
      ).not.toThrow();
    });

    test("should get config", () => {
      expect(regexExtractor.getConfig()).toEqual({
        pattern: new RegExp(/<docs>(.*?)<\/docs>/s),
        searchAndReplace: "%content%",
      });
    });
  });

  describe("extract using regex", () => {
    test("should extract the content using the regex", async () => {
      const result = await regexExtractor.extractFromString(
        "<docs>This is a test</docs>",
      );

      expect(result[0].content).toContain("This is a test");
    });

    test("should return an error if the file does not contain the regex", async () => {
      const result = await regexExtractor.extractFromString("This is a test");

      expect(result).toHaveProperty("errorMessage");
      expect((result as ErrorResult).throwable).toBe(false);
      expect((result as ErrorResult).errorMessage).toContain(
        "No content found in the file",
      );
    });
  });
});
