import fs from "fs";
import path from "path";

import { DEFAULTS } from "@/simple-docs-scraper/consts/defaults.js";
import TemplateContentExtractionContentMerger from "@/simple-docs-scraper/content/TemplateContentExtractionContentMerger.js";
import { ExtractedContent } from "@/simple-docs-scraper/plugins/DocumentContentExtractor.js";
import { DirectoryMarkdownScannerEntry } from "@/simple-docs-scraper/scanning/DirectoryMarkdownScanner.js";
import { FileNameCallback, LineCallback, TemplatePathConfig } from "@/simple-docs-scraper/types/config.t.js";
import { ExtractorPlugin } from "@/simple-docs-scraper/types/extractor.t.js";
import { ExcerptExtractor, ExcerptExtractorConfig } from "@/simple-docs-scraper/utils/ExcerptExtractor.js";
import { IndexContentGenerator } from "./IndexContenGenerator.js";

export type IndexFileGeneratorConfig = TemplatePathConfig & {
  outDir: string;
  baseDir?: string;
  searchAndReplace?: string;
  markdownLinks?: boolean;
  filesHeading?: string;
  directoryHeading?: string;
  excerpt?: ExcerptExtractorConfig;
  lineCallback?: LineCallback;
  fileNameCallback?: FileNameCallback;
  plugins?: ExtractorPlugin[];
  flatten?: boolean;
  recursive?: boolean;
  isRootConfig?: boolean;
};

/**
 * <docs>
 * Generates index files from processed directory entries with configurable templates and formatting.
 *
 * This class creates markdown index files that list files and directories in a structured format.
 * It supports custom templates, search-and-replace patterns, excerpt generation, and flexible
 * formatting through callback functions. The generated index files help organize documentation
 * by providing navigation links and summaries.
 *
 * @example
 * ```typescript
 * const generator = new IndexFileGenerator({
 *   outDir: './docs',
 *   template: './templates/index.md',
 *   searchAndReplace: '{{CONTENT}}',
 *   excerpt: { enabled: true },
 *   excerptLength: 100
 * });
 *
 * generator.saveIndexFile(processedEntries);
 * // Creates index.md with formatted file listings
 * ```
 * </docs>
 */
export class IndexFileGenerator {
  private indexContentGenerator: IndexContentGenerator;

  /**
   * <method name="constructor">
   * Creates a new IndexFileGenerator instance.
   *
   * This constructor initializes the generator with the provided configuration,
   * merging it with default values and creating an IndexContentGenerator instance.
   *
   * @param {IndexFileGeneratorConfig} config - Configuration for file generation
   * </method>
   */
  constructor(private config: IndexFileGeneratorConfig) {
    this.config = {
      ...DEFAULTS.INDEX_FILE_GENERATOR,
      ...this.config,
    };
    this.indexContentGenerator = new IndexContentGenerator({
      ...this.config,
    });
  }

  /**
   * <method name="saveIndexFile">
   * Saves an index file by processing entries and generating formatted content.
   *
   * This method creates a markdown index file that lists files and directories
   * in a structured format. It handles excerpt generation, custom formatting
   * through callbacks, and template injection to create the final index file.
   *
   * @param processedArray - Array of processed directory entries to include in the index
   * </method>
   */
  async saveIndexFile(processedArray: DirectoryMarkdownScannerEntry[]) {
    // Check if the out directory exists
    if (!fs.existsSync(this.config.outDir)) {
      fs.mkdirSync(this.config.outDir, { recursive: true });
    }
    
    // Generate the content
    const content = this.indexContentGenerator.generate(processedArray);
    
    // Store the template content
    let templateContent = this.getTemplateContent();
    
    // Replace the search and replace with the content
    templateContent = templateContent.replace(
      this.getSearchAndReplace(),
      content,
    );
    
    // Apply plugins to the template content
    templateContent = await this.applyPlugins(templateContent);
    
    // Get the output file path
    const outFilePath = path.join(this.config.outDir, "index.md");

    // Write the file
    fs.writeFileSync(outFilePath, templateContent);
  }

  /**
   * <method name="applyPlugins">
   * Applies plugins to the template content.
   *
   * @param {string} templateContent - The template content to apply plugins to
   * </method>
   */
  protected async applyPlugins(templateContent: string) {
    if (this.config.plugins) {
      for (const plugin of this.config.plugins) {
        const results = await plugin.extractFromString(templateContent);

        templateContent = new TemplateContentExtractionContentMerger().handle(
          templateContent,
          results as ExtractedContent[],
        );
      }
    }

    return templateContent;
  }

  /**
   * <method name="generateExcerpt">
   * Generates an excerpt from file content.
   *
   * This method uses the configured excerpt extractor to generate a summary
   * from the provided content string.
   *
   * @param {string} content - File content to extract excerpt from
   * @returns {string | undefined} Generated excerpt or undefined if not configured
   * </method>
   */
  protected generateExcerpt(content: string) {
    if (!this.config.excerpt) {
      return undefined;
    }

    return ExcerptExtractor.determineExcerpt(
      content,
      this.config?.excerpt ?? DEFAULTS.EXCERPT_EXTRACTOR,
    );
  }

  /**
   * <method name="getTemplateContent">
   * Retrieves the template content from the configured template file.
   *
   * This method reads the template file content if a template path is configured,
   * otherwise returns the search and replace pattern as fallback content.
   *
   * @returns {string} Template content or search pattern
   * @throws {Error} When template file is not found
   * </method>
   */
  private getTemplateContent(): string {
    if (!this.config.templatePath) {
      return this.getSearchAndReplace();
    }

    // Check if the template file exists
    if (!fs.existsSync(this.config.templatePath)) {
      throw new Error("Template file not found");
    }

    return fs.readFileSync(this.config.templatePath, "utf8");
  }

  /**
   * <method name="getSearchAndReplace">
   * Gets the search and replace pattern for template injection.
   *
   * This method returns the configured search and replace pattern or defaults
   * to '%content%' if not specified in the configuration.
   *
   * @returns {string} The search and replace pattern
   * </method>
   */
  private getSearchAndReplace() {
    if (!this.config.searchAndReplace) {
      return "%content%";
    }

    return this.config.searchAndReplace;
  }
}
