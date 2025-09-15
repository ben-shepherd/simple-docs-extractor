import {
  IndexFileGenerator,
  IndexFileGeneratorConfig,
} from "../generators/IndexFileGenerator.js";
import { IndexStructurePreProcessor } from "./IndexStructurePreProcessor.js";

export type MarkdownIndexProcessorConfig = Omit<
  IndexFileGeneratorConfig,
  "outDir"
> & {
  recursive: boolean;
};

export const MARKDOWN_INDEX_PROCESSOR_DEFAULTS: MarkdownIndexProcessorConfig = {
  recursive: true,
};

/**
 * <docs>
 * Processes directories recursively to generate index files for documentation.
 *
 * This class traverses directory structures and creates index files (typically index.md)
 * that list all markdown files found in each directory. It supports custom templates
 * and search-and-replace patterns for flexible index file generation.
 *
 * @example
 * ```typescript
 * const processor = new IndexProcessor({
 *   baseDir: './docs',
 *   template: './templates/index.template.md',
 *   searchAndReplace: '{{CONTENT}}'
 * });
 *
 * await processor.handle();
 * // Creates index.md files in all subdirectories of ./docs
 * ```
 * </docs>
 */
export class MarkdownIndexProcessor {
  constructor(
    private config: MarkdownIndexProcessorConfig = MARKDOWN_INDEX_PROCESSOR_DEFAULTS,
  ) {}

  /**
   * <method name="handle">
   * Starts the index file generation process for the configured base directory.
   * </method>
   */
  async handle(baseDir: string) {
    await this.handleDirectoryRecusrively(baseDir);
  }

  /**
   * <method name="handleDirectoryRecusrively">
   * Recursively processes a directory and all its subdirectories to create index files.
   *
   * @param directory - The directory path to process
   * </method>
   */
  async handleDirectoryRecusrively(directory: string) {
    // Process files and folders
    let processedEntries = await new IndexStructurePreProcessor({
      markdownLink: this.config?.markdownLinks,
    }).process(directory);

    // If no md files are found, return
    if (processedEntries.length === 0) {
      return;
    }

    if (this.config?.recursive) {
      // Handle directories recursively
      const directoryEntries = processedEntries.filter((entry) => entry.isDir);
      for (const dirEntry of directoryEntries) {
        await this.handleDirectoryRecusrively(dirEntry.src);
      }

      // Re-process entries
      processedEntries = await new IndexStructurePreProcessor({
        markdownLink: this.config?.markdownLinks,
      }).process(directory);
    }

    // Save the index.md file
    await new IndexFileGenerator({
      ...(this.config ?? {}),
      outDir: directory,
    }).saveIndexFile(processedEntries);
  }
}
