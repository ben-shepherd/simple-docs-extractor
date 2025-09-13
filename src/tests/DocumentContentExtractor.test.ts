import { CallbackExtractor } from "@/simple-docs-scraper/extractors/CallbackExtractorPlugin.js";
import { RegexExtractorPlugin } from "@/simple-docs-scraper/extractors/RegexExtractorPlugin.js";
import { TagExtractorPlugin } from "@/simple-docs-scraper/extractors/TagExtractorPlugin.js";
import { beforeEach, describe, expect, test } from "@jest/globals";
import fs from "fs";
import { DocumentContentExtractor } from "../simple-docs-scraper/extractors/DocumentContentExtractor.js";
import { RemoveMultiLineCommentAsterisks } from "../simple-docs-scraper/formatters/RemoveMultiLineCommentAsterisks.js";
import { deleteOutputFiles } from "./helpers/deleteOutputFiles.js";
import { getOutputPath } from "./helpers/getOutputPath.js";

describe("Docs Extractor", () => {
  let docsExtractor!: DocumentContentExtractor;
  const fileWithDocs =
    process.cwd() + "/src/tests/files/js-files/exampleFunc.js";
  const fileWithoutDocs =
    process.cwd() + "/src/tests/files/js-files/exampleFuncNoDocs.js";

  const docsTagsExtractor = new TagExtractorPlugin({
    tag: "docs",
    searchAndReplace: "%content%",
  });
  const methodTagsExtractor = new TagExtractorPlugin({
    tag: "method",
    searchAndReplace: "%methods%",
  });

  beforeEach(() => {
    deleteOutputFiles();
  });

  describe("config", () => {
    test("should throw an error if the extract method is not valid", async () => {
      docsExtractor = new DocumentContentExtractor({
        extractMethod: "invalid",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      await expect(docsExtractor.extractFromFile(fileWithDocs)).rejects.toThrow(
        "Error in extraction method 0: Invalid extraction method",
      );
    });

    test("should accept a valid extract tags method", async () => {
      docsExtractor = new DocumentContentExtractor([docsTagsExtractor]);

      await expect(
        docsExtractor.extractFromFile(fileWithDocs),
      ).resolves.not.toThrow();
    });

    test("should accept regex extract method", async () => {
      docsExtractor = new DocumentContentExtractor([
        new RegexExtractorPlugin({
          pattern: new RegExp("/<docs>(.*?)<\/docs>/s"),
          searchAndReplace: "%content%",
        }),
      ]);

      await expect(
        docsExtractor.extractFromFile(fileWithDocs),
      ).resolves.not.toThrow();
    });

    test("should accept callback extract method", async () => {
      docsExtractor = new DocumentContentExtractor([
        new CallbackExtractor({
          callback: async (fileContent) => {
            return fileContent.match(/<docs>(.*?)<\/docs>/s)?.[1];
          },
          searchAndReplace: "%content%",
        }),
      ]);

      await expect(
        docsExtractor.extractFromFile(fileWithDocs),
      ).resolves.not.toThrow();
    });
  });

  describe("extract using tags", () => {
    test("should perform expected behavior", async () => {
      docsExtractor = new DocumentContentExtractor([docsTagsExtractor]);

      const result = await docsExtractor.extractFromFile(fileWithDocs);

      expect(result[0].content).toContain("#exampleFunc.js");
    });

    test("should not throw an error if the file does not contain the start and end tags", async () => {
      docsExtractor = new DocumentContentExtractor([docsTagsExtractor]);

      await expect(
        docsExtractor.extractFromFile(fileWithoutDocs),
      ).resolves.not.toThrow();
    });

    test("should throw an error if the file does not exist", async () => {
      docsExtractor = new DocumentContentExtractor([docsTagsExtractor]);

      await expect(() =>
        docsExtractor.extractFromFile("path-to-nonexistent-file.js"),
      ).rejects.toThrow("File not found");
    });
  });

  describe("code block checks", () => {
    test("should correctly extract documentation with code blocks using the tag method", async () => {
      const sourceCode: string = `/**
 * <docs>
 * Some description here
 * 
 * @example
 * \`\`\`typescript
 *  console.log('code block example')
 * \`\`\`
 * </docs>
 */
const example = () => null;`;

      fs.mkdirSync(getOutputPath("code-block-check"));
      fs.writeFileSync(
        getOutputPath("code-block-check/example.js"),
        sourceCode,
      );

      docsExtractor = new DocumentContentExtractor([docsTagsExtractor]);
      const result = await docsExtractor.extractFromFile(
        getOutputPath("code-block-check/example.js"),
      );
      const extractedContent = RemoveMultiLineCommentAsterisks({
        filePath: "",
        outFile: "",
        content: result[0].content,
      });

      expect(extractedContent).toContain(
        "console.log('code block example')\n ```\n",
      );
    });
  });

  describe("variable extraction", () => {
    test("should accept an array of extraction methods", async () => {
      expect(
        () =>
          new DocumentContentExtractor([
            docsTagsExtractor,
            methodTagsExtractor,
          ]),
      ).not.toThrow();
    });

    test("should multiple extraction methods work together", async () => {
      const sourceCode: string = `/**
 * <docs>
 * Some description here
 * 
 * @example
 * \`\`\`typescript
 *  console.log('code block example')
 * \`\`\`
 * </docs>
 */
class Example {

    /**
     * <method>
     * This is a method
     * @param {string} str - The string to print
     * @param {number} num - The number to print
     * @returns {string} 'method'
     * </method>
     */
    static method(str: string, num: number) {
        return 'method';
    }

}`;
      docsExtractor = new DocumentContentExtractor([
        docsTagsExtractor,
        methodTagsExtractor,
      ]);

      const results = await docsExtractor.extractFromString(sourceCode);

      expect(results[0].content).toContain("Some description here");
      expect(results[1].content).toContain("This is a method");
    });
  });

  describe("array content", () => {
    test("should match multiple method extraction methods", async () => {
      const sourceCode: string = `class Example {

    /**
     * <method>
     * This is a method #1
     * @param {string} str - The string to print
     * @param {number} num - The number to print
     * @returns {string} 'method'
     * </method>
     */
    static method(str: string, num: number) {
        return 'method';
    }

     /**
     * <method>
     * This is a method #2
     * @param {string} str - The string to print
     * @param {number} num - The number to print
     * @returns {string} 'method'
     * </method>
     */
    static method2(str: string, num: number) {
        return 'method2';
    }

}`;
      docsExtractor = new DocumentContentExtractor([methodTagsExtractor]);

      const results = await docsExtractor.extractFromString(sourceCode);
      expect(results).toHaveLength(2);
      expect(results[0].content).toContain("This is a method #1");
      expect(results[1].content).toContain("This is a method #2");
    });

    test("should work with multiple extraction methods", async () => {
      const sourceCode: string = `/**
 * <docs>
 * Some description here
 * </docs>
 */
class Example {

    /**
     * <method>
     * This is a method #1
     * @param {string} str - The string to print
     * @param {number} num - The number to print
     * @returns {string} 'method'
     * </method>
     */
    static method(str: string, num: number) {
        return 'method';
    }

     /**
     * <method>
     * This is a method #2
     * @param {string} str - The string to print
     * @param {number} num - The number to print
     * @returns {string} 'method'
     * </method>
     */
    static method2(str: string, num: number) {
        return 'method2';
    }

}`;
      docsExtractor = new DocumentContentExtractor([
        docsTagsExtractor,
        methodTagsExtractor,
      ]);

      const results = await docsExtractor.extractFromString(sourceCode);
      expect(results).toHaveLength(3);

      expect(results[0].content).toContain("Some description here");
      expect(results[1].content).toContain("This is a method #1");
      expect(results[2].content).toContain("This is a method #2");
    });
  });
});
