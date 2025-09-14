import { CallbackExtractor } from "@/simple-docs-scraper/plugins/CallbackExtractorPlugin.js";
import { ErrorResult } from "@/simple-docs-scraper/plugins/DocumentContentExtractor.js";
import { beforeEach, describe, expect, test } from "@jest/globals";

describe("Callback Extractor", () => {
  let callbackExtractor!: CallbackExtractor;

  beforeEach(() => {
    callbackExtractor = new CallbackExtractor({
      callback: async (str) => str,
      searchAndReplace: "%content%",
    });
  });

  describe("config", () => {
    test("constructor should set config", () => {
      expect(
        () =>
          new CallbackExtractor({
            callback: async (str) => str,
            searchAndReplace: "%content%",
          }),
      ).not.toThrow();
    });

    test("should set config", () => {
      expect(() =>
        callbackExtractor.setConfig({
          callback: async (str) => str,
          searchAndReplace: "%content%",
        }),
      ).not.toThrow();
    });

    test("should get config", () => {
      expect(() => callbackExtractor.getConfig()).not.toThrow();
      expect(callbackExtractor.getConfig().searchAndReplace).toBe("%content%");
      expect(callbackExtractor.getConfig().callback("string"));
    });
  });

  describe("extract using callback", () => {
    test("should return the expected content", async () => {
      const result =
        await callbackExtractor.extractFromString("This is a test");

      expect(result[0].content).toContain("This is a test");
    });

    test("should return an error if the file does not contain the callback", async () => {
      callbackExtractor.setConfig({
        callback: async () => {
          return undefined;
        },
        searchAndReplace: "%content%",
      });
      const result =
        await callbackExtractor.extractFromString("This is a test");

      expect(result).toHaveProperty("errorMessage");
      expect((result as ErrorResult).throwable).toBe(true);
      expect((result as ErrorResult).errorMessage).toContain(
        "Callback function returned no content",
      );
    });
  });
});
