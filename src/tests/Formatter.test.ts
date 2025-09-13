import { TagExtractorPlugin } from "@/simple-docs-scraper/extractors/TagExtractorPlugin.js";
import { AddDoubleLinesFormatter } from "@/simple-docs-scraper/formatters/AddDoubleLinesFormatter.js";
import { beforeEach, describe, expect, test } from "@jest/globals";
import fs from "fs";
import path from "path";
import { RemoveMultiLineCommentAsterisks } from "../simple-docs-scraper/formatters/RemoveMultiLineCommentAsterisks.js";
import { SimpleDocExtractor } from "../simple-docs-scraper/index.js";
import { SimpleDocExtractorConfig } from "../simple-docs-scraper/types/config.js";
import { deleteOutputFiles } from "./helpers/deleteOutputFiles.js";
import { getOutputPath } from "./helpers/getOutputPath.js";


const extraction = [
  new TagExtractorPlugin({
    searchAndReplace: "%content%",
    tag: "<docs>",
  }),
];

const defaultConfig: SimpleDocExtractorConfig = {
  baseDir: process.cwd(),
  generators: {
    documentation: {
      template: getOutputPath("documentation.template.md"),
    },
  },
  targets: [
    {
      globOptions: {
        cwd: path.join(process.cwd(), "src/tests/output"),
        extensions: "**/exampleFunc.js",
      },
      outDir: getOutputPath("js-files"),
      createIndexFile: false,
      extraction,
    },
  ],
};

describe("Formatter", () => {
  beforeEach(() => {
    deleteOutputFiles();

    // Create a mock template file
    fs.writeFileSync(getOutputPath("documentation.template.md"), "%content%");

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
            formatters: [RemoveMultiLineCommentAsterisks],
          }),
      ).not.toThrow();
    });

    test("should apply multi line comment clear formatter", async () => {
      const scraper = new SimpleDocExtractor({
        ...defaultConfig,
        formatters: [RemoveMultiLineCommentAsterisks],
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

  describe("AddDoubleLinesFormatter", () => {
    test("should add double lines formatter", async () => {
      const sourceCode = 
`This is the first line
This is the second line`

      const formattedCode = AddDoubleLinesFormatter({
        filePath: "",
        outFile: "",
        content: sourceCode,
      });

      expect(formattedCode).toBe("This is the first line\n\nThis is the second line");
    });

    test("should add double lines and ignore code blocks", async () => {
      const sourceCode = 
`This is the first line
\`\`\`
This is the second line
This is the third line
\`\`\``

      const formattedCode = AddDoubleLinesFormatter({
        filePath: "",
        outFile: "",
        content: sourceCode,
      });

      expect(formattedCode).toBe("This is the first line\n\n```\nThis is the second line\nThis is the third line\n```");
    });
  });
});
  