import fs from "fs";
import path from "path";
import { ExtractedContent } from "../plugins/DocumentContentExtractor.js";
import { IndexStructurePreProcessorEntry } from "../processors/IndexStructurePreProcessor.js";
import {
  DEFAULT_EXCERPT_CONFIG,
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
};

// TODO: Define defaults for all optional properties
// Note: This will most likely affect existing tests
const INDEX_FILE_GENERATOR_DEFAULTS: Partial<IndexFileGeneratorConfig> = {
  // searchAndReplace: "%content%",
  // markdownLinks: true,
  // filesHeading: '# Files',
  // directoryHeading: '# Folders',
  // flatten: false,
  // excerpt: DEFAULT_EXCERPT_CONFIG,
  // plugins: [],
  // lineCallback: undefined,
  // fileNameCallback: undefined,
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

  constructor(private config: IndexFileGeneratorConfig) {
    this.config = {
      ...INDEX_FILE_GENERATOR_DEFAULTS,
      ...this.config,
    };
    this.indexContentGenerator = new IndexContentGenerator({
      lineCallback: this.config.lineCallback,
      fileNameCallback: this.config.fileNameCallback,
      directoryHeading: this.config.directoryHeading,
      filesHeading: this.config.filesHeading,
      excerpt: this.config.excerpt,
      flatten: this.config.flatten ?? false,
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
  async saveIndexFile(processedArray: IndexStructurePreProcessorEntry[]) {
    // Check if the out directory exists
    if (!fs.existsSync(this.config.outDir)) {
      fs.mkdirSync(this.config.outDir, { recursive: true });
    }

    // Get the output file path
    const outFilePath = path.join(this.config.outDir, "index.md");

    // Generate the content
    const content = this.indexContentGenerator.handle(processedArray);

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

  private createExcerpt(
    excerpt: string | undefined,
    current: IndexStructurePreProcessorEntry,
  ) {
    excerpt = undefined;
    if (false === current.isDir) {
      const fileContents = fs.readFileSync(current.src, "utf8");
      excerpt = this.generateExcerpt(fileContents);
    }
    return excerpt;
  }

  protected generateExcerpt(content: string) {
    if (!this.config.excerpt) {
      return undefined;
    }

    return ExcerptExtractor.determineExcerpt(
      content,
      this.config?.excerpt ?? DEFAULT_EXCERPT_CONFIG,
    );
  }

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
   * Gets the search and replace pattern for template injection.
   *
   * @returns The search and replace pattern, defaults to '%content%' if not configured
   */
  private getSearchAndReplace() {
    if (!this.config.searchAndReplace) {
      return "%content%";
    }

    return this.config.searchAndReplace;
  }
}
