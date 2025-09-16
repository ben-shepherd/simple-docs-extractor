import fs from "fs";
import path from "path";
import { DEFAULTS } from "../consts/defaults.js";
import { ExtractedContent } from "../plugins/DocumentContentExtractor.js";
import { DirectoryMarkdownScannerEntry } from "../processors/DirectoryMarkdownScanner.js";
import {
  ExcerptExtractor,
  ExcerptExtractorConfig,
} from "../transformers/ExcerptExtractor.js";
import TemplateContentExtractionContentMerger from "../transformers/TemplateContentExtractionContentMerger.js";
import {
  FileNameCallback,
  LineCallback,
  TemplatePathConfig,
} from "../types/config.t.js";
import { ExtractorPlugin } from "../types/extractor.t.js";
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
 *   excerpt: true,
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

    // Get the output file path
    const outFilePath = path.join(this.config.outDir, "index.md");

    // Generate the content
    const content = this.indexContentGenerator.generate(processedArray);

    // for (const current of processedArray) {
    //   const { entryName, markdownLink } = current;

    //   // If we're a file, genereate an excerpt
    //   excerpt = this.createExcerpt(excerpt, current);

    //   // We should only consider creating a file heading once we have reached the files
    //   if (false === current.isDir) {
    //     content = this.createFileHeading(
    //       filesProcessed,
    //       filesTotalCount,
    //       content,
    //     );
    //   }

    //   // We should only consider creating a directory heading once all files have been rendered
    //   if (filesProcessed === filesTotalCount) {
    //     content = this.createDirectoryHeading(
    //       dirsProcessed,
    //       dirsTotalCount,
    //       content,
    //     );
    //   }

    //   if (this.config.lineCallback) {
    //     content += this.config.lineCallback(entryName, lineNumber, excerpt);
    //   } else {
    //     let line = `- ${markdownLink ?? entryName}`;
    //     if (excerpt) {
    //       line += ` - ${excerpt}`;
    //     }
    //     content += `${line}\n`;
    //   }

    //   lineNumber++;

    //   if (false === current.isDir) {
    //     filesProcessed++;
    //   } else {
    //     dirsProcessed++;
    //   }
    // }

    
    // Store the template content
    let templateContent = this.getTemplateContent();

    // Replace the search and replace with the content
    templateContent = templateContent.replace(
      this.getSearchAndReplace(),
      content,
    );

    // Apply plugins to the template content
    templateContent = await this.applyPlugins(templateContent);

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
   * <method name="createExcerpt">
   * Creates an excerpt for a file entry.
   *
   * This method generates an excerpt from file content if the entry is a file.
   * It reads the file and extracts the excerpt using the configured extractor.
   *
   * @param {string | undefined} excerpt - Current excerpt value
   * @param {DirectoryMarkdownScannerEntry} current - Entry to create excerpt for
   * @returns {string | undefined} Generated excerpt or undefined
   * </method>
   */
  private createExcerpt(
    excerpt: string | undefined,
    current: DirectoryMarkdownScannerEntry,
  ) {
    excerpt = undefined;
    if (false === current.isDir) {
      const fileContents = fs.readFileSync(current.src, "utf8");
      excerpt = this.generateExcerpt(fileContents);
    }
    return excerpt;
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
   * <method name="createFileHeading">
   * Creates a heading for the files section.
   *
   * This method adds a files heading to the content when processing the first file
   * and a files heading is configured.
   *
   * @param {number} processedFiles - Number of files already processed
   * @param {number} totalCount - Total number of files to process
   * @param {string} [content=""] - Current content string to append to
   * @returns {string} Updated content with heading if applicable
   * </method>
   */
  protected createFileHeading(
    processedFiles: number,
    totalCount: number,
    content: string = "",
  ) {
    if (this.config.filesHeading && processedFiles === 0 && totalCount > 0) {
      content += this.config.filesHeading + "\n";
    }

    return content;
  }

  /**
   * <method name="createDirectoryHeading">
   * Creates a heading for the directories section.
   *
   * This method adds a directory heading to the content when processing the first
   * directory and a directory heading is configured.
   *
   * @param {number} processedDirs - Number of directories already processed
   * @param {number} totalCount - Total number of directories to process
   * @param {string} [content=""] - Current content string to append to
   * @returns {string} Updated content with heading if applicable
   * </method>
   */
  protected createDirectoryHeading(
    processedDirs: number,
    totalCount: number,
    content: string = "",
  ) {
    if (this.config.directoryHeading && processedDirs === 0 && totalCount > 0) {
      content += this.config.directoryHeading + "\n";
    }

    return content;
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
