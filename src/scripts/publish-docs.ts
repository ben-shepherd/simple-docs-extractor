import { TagExtractorPlugin } from "@/simple-docs-scraper/extractors/TagExtractorPlugin.js";
import { AddDoubleLinesFormatter } from "@/simple-docs-scraper/formatters/AddDoubleLinesFormatter.js";
import {
  RemoveMultiLineCommentAsterisks,
  SimpleDocExtractor,
} from "@/simple-docs-scraper/index.js";
import { SimpleDocExtractorConfig } from "@/simple-docs-scraper/types/config.js";
import path from "path";

/**
 * <docs>
 * Publish documentation by running the SimpleDocExtractor with the provided configuration.
 *
 * This function sets up the extractor to process JavaScript and TypeScript files
 * in the src directory, excluding tests and scripts folders. It uses the TagExtractorPlugin
 * to extract content marked with "docs" tags and generates documentation files using
 * custom templates. It then publishes the documentation to the docs directory.
 *
 * @example
 * ```typescript
 * const extractor = new SimpleDocExtractor(DEFAULT_CONFIG);
 * const result = await extractor.start();
 * ```
 * </docs>
 */
export const DEFAULT_CONFIG: SimpleDocExtractorConfig = {
  baseDir: process.cwd(),
  extraction: [],
  generators: {
    index: {
      template: path.join(process.cwd(), "src/templates/index.template.md"),
      markdownLink: true,
      filesHeading: "\n## Files\n",
      directoryHeading: "\n## Folders\n",
      excerpt: {
        length: 75,
        addEllipsis: false,
        firstSentenceOnly: true,
      },
    },
    documentation: {
      template: path.join(
        process.cwd(),
        "src/templates/documentation.template.md",
      ),
    },
  },
  targets: [
    {
      globOptions: {
        cwd: path.join(process.cwd(), "src"),
        extensions: "**/*.{js,ts}",
        ignore: ["**/tests/**", "**/scripts/**"],
      },
      outDir: path.join(process.cwd(), "docs"),
      createIndexFile: true,
      extraction: [
        new TagExtractorPlugin({
          tag: "docs",
          searchAndReplace: "%content%",
        }),
        new TagExtractorPlugin({
          tag: "method",
          searchAndReplace: "%methods%",
          attributeFormat: "### **{value}**",
        }),
      ],
    },
  ],
  formatters: [RemoveMultiLineCommentAsterisks, AddDoubleLinesFormatter],
};

export const publishDocs = async (
  config: SimpleDocExtractorConfig = DEFAULT_CONFIG,
) => {
  const result = await new SimpleDocExtractor(config).start();
  console.log("Success count: ", result.successCount);
  console.log("Total count: ", result.totalCount);
  console.log("Logs:");

  result.logs.forEach((log) => {
    console.log(log);
  });

  return result;
};
