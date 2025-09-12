import { TagExtractorPlugin } from "@/simple-docs-scraper/extractors/TagExtractorPlugin.js";
import {
  MultiLineCommentClear,
  SimpleDocExtractor,
} from "@/simple-docs-scraper/index.js";
import { SimpleDocExtractorConfig } from "@/simple-docs-scraper/types/config.js";
import path from "path";

export const DEFAULT_CONFIG: SimpleDocExtractorConfig = {
  baseDir: process.cwd(),
  extraction: [
    new TagExtractorPlugin({
      tag: "docs",
      searchAndReplace: "%content%",
    }),
  ],
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
    },
  ],
  formatters: [MultiLineCommentClear],
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
