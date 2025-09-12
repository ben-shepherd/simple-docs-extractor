import { TagExtractorPlugin } from "@/simple-docs-scraper/extractors/TagExtractorPlugin.js";
import { beforeEach, describe, expect, test } from "@jest/globals";
import fs from "fs";
import path from "path";
import { MultiLineCommentClear } from "../simple-docs-scraper/formatters/MultiLineCommentClear.js";
import { SimpleDocExtractor } from "../simple-docs-scraper/index.js";
import { SimpleDocExtractorConfig } from "../simple-docs-scraper/types/config.js";
import { deleteOutputFiles } from "./helpers/deleteOutputFiles.js";
import { getOutputPath } from "./helpers/getOutputPath.js";

const defaultConfig: SimpleDocExtractorConfig = {
  baseDir: process.cwd(),
  extraction: [
    new TagExtractorPlugin({
      searchAndReplace: "%content%",
      tag: "<docs>",
    }),
  ],
  targets: [
    {
      globOptions: {
        cwd: path.join(process.cwd(), "src/tests/output"),
        extensions: "**/exampleFunc.js",
      },
      outDir: getOutputPath("js-files"),
      createIndexFile: false,
    },
  ],
};

describe("Formatter", () => {
  beforeEach(() => {
    deleteOutputFiles();

    // Create a mock js file with a multi line comment
    fs.writeFileSync(
      getOutputPath("exampleFunc.js"),
      `/**
 * <docs>
 * Some documentation here
 * 
 * #exampleFunc.js
 * 
 * @description Example function
 * @returns {string} 'exampleFunc'
 * </docs>
 */
const exampleFunc = () => {
    return 'exampleFunc';
}
`,
    );
  });

  //   afterEach(() => {
  //     deleteOutputFiles();
  //   })

  //   afterAll(() => {
  //     deleteOutputFiles();
  //   })

  describe("Formatter", () => {
    test("should accept formatters", () => {
      expect(
        () =>
          new SimpleDocExtractor({
            ...defaultConfig,
            formatters: [MultiLineCommentClear],
          }),
      ).not.toThrow();
    });

    test("should apply multi line comment clear formatter", async () => {
      const scraper = new SimpleDocExtractor({
        ...defaultConfig,
        formatters: [MultiLineCommentClear],
      });

      const result = await scraper.start();

      const docsFileContent = fs.readFileSync(
        getOutputPath("js-files/exampleFunc.js.md"),
        "utf8",
      );

      expect(result.successCount).toBe(1);
      expect(result.totalCount).toBe(1);
      expect(docsFileContent).not.toContain("*");
      expect(docsFileContent).not.toContain(" *");
      expect(docsFileContent).toContain("Some documentation here");
      expect(docsFileContent).toContain("#exampleFunc.js");
      expect(docsFileContent).toContain("@description Example function");
      expect(docsFileContent).toContain("@returns {string} 'exampleFunc'");
    });
  });
});
