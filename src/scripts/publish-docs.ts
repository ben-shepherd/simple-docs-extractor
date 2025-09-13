import { TagExtractorPlugin } from "@/simple-docs-scraper/extractors/TagExtractorPlugin.js";
import {
  SimpleDocExtractor
} from "@/simple-docs-scraper/index.js";
import { SimpleDocExtractorConfig } from "@/simple-docs-scraper/types/config.t.js";
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
export const DEFAULT_CONFIG: SimpleDocExtractorConfig = SimpleDocExtractor
  .create(process.cwd())
    .indexTemplate((template) => {
      template.useFile(path.join(process.cwd(), "src/templates/index.template.md"));
      template.useMarkdownLinks();
    })
    .documentationTemplate((template) => {
      template.useFile(path.join(process.cwd(), "src/templates/documentation.template.md"));
    })
  .target((target) => {
    target.cwd(path.join(process.cwd(), 'src'))
    target.patterns("**/*.{js,ts}")
    target.ignores(["**/tests/**", "**/scripts/**"])
    target.outDir(path.join(process.cwd(), "docs"))
    target.createIndexFiles()
    target.plugins([
      new TagExtractorPlugin({
        tag: "docs",
        searchAndReplace: "%content%",
      }),
      new TagExtractorPlugin({
        tag: "method",
        searchAndReplace: "%methods%",
        attributeFormat: "### **{value}**",
      }),
    ])
  })
  .addRecommendedFormatters()
  .buildConfig();

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

  // Remove types and index.files from the missing documentation files
  const missingDocumentationFiles = result.missingDocumentationFiles.filter((file) => {
    return !file.includes("t.ts")
      && !file.endsWith("index.ts")
      && !file.endsWith("index.js")
  });

  if(missingDocumentationFiles.length > 0) {
    console.log("These files files should be documented: ", missingDocumentationFiles.map((file) => path.basename(file)).join(", "));
    process.exit(1);
  }

  return result;
};
