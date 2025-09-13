import { ConfigHelper } from "@/simple-docs-scraper/config/ConfigHelper.js";
import { Target } from "@/simple-docs-scraper/services/SimpleDocExtractor.js";
import { ExtractorPlugin } from "@/simple-docs-scraper/types/extractor.t.js";
import { beforeEach, describe, expect, test } from "@jest/globals";

describe("ConfigHelper Test Suite", () => {
  let mockExtractorPlugin: ExtractorPlugin;
  let mockTarget: Target;

  beforeEach(() => {
    mockExtractorPlugin = {
      getConfig: () => ({
        searchAndReplace: "%content%",
        attributeFormat: "*{key}*: {value}",
      }),
    } as ExtractorPlugin;

    mockTarget = {
      globOptions: {
        cwd: process.cwd(),
        patterns: "**/*.js",
      },
      outDir: process.cwd() + "/src/tests/output",
      createIndexFile: false,
      plugins: [mockExtractorPlugin],
    };
  });

  describe("getPluginBySearchAndReplace", () => {
    test("should perform expected behavior", () => {
      const value = ConfigHelper.getPluginBySearchAndReplace(
        mockTarget,
        "%content%",
      );

      expect(value).toBe(mockExtractorPlugin);
    });
  });

  describe("getAttributeFormatBySearchAndReplace", () => {
    test("should perform expected behavior", () => {
      const value = ConfigHelper.getAttributeFormatBySearchAndReplace(
        mockTarget,
        "%content%",
      );

      expect(value).toBe("*{key}*: {value}");
    });
  });
});
