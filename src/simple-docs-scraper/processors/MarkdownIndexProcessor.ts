import { DEFAULTS } from "../consts/defaults.js";
import {
  IndexFileGenerator,
  IndexFileGeneratorConfig,
} from "../generators/IndexFileGenerator.js";
import { IndexStructurePreProcessor, IndexStructurePreProcessorEntry } from "./IndexStructurePreProcessor.js";

export type MarkdownIndexProcessorConfig = Omit<
  IndexFileGeneratorConfig,
  "outDir"
>

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
    private config: MarkdownIndexProcessorConfig = DEFAULTS.MARKDOWN_INDEX_PROCESSOR,
  ) {
    this.config = {
      ...DEFAULTS.MARKDOWN_INDEX_PROCESSOR,
      ...this.config,
    };
  }

  /**
   * <method name="handle">
   * Starts the index file generation process for the configured base directory.
   * 
   * @param baseDir - The directory path to process
   * </method>
   */
  async handle(baseDir: string) {
    await this.handleSingleDirectory(baseDir);
  }

  /**
   * <method name="handleSingleDirectory">
   * Handles a single directory and creates an index file for it.
   * 
   * @param directory - The directory path to process
   * </method>
   */
  async handleSingleDirectory(directory: string) {

    // Process files and folders
    let processedEntries = await this.getProcessedEntries(directory);

    // If no md files are found, return
    if (processedEntries.length === 0) {
      return;
    }

    if (this.config?.recursive) {
      // Handle directories recursively
      const directoryEntries = processedEntries.filter((entry) => entry.isDir);
      for (const dirEntry of directoryEntries) {
        await this.handleSingleDirectory(dirEntry.src);
      }

      // Re-process entries
      processedEntries = await this.getProcessedEntries(directory);
    }

    // Save the index.md file
    await new IndexFileGenerator({
      ...(this.config ?? {}),
      outDir: directory,
    }).saveIndexFile(processedEntries);
  }

  /**
   * <method name="getProcessedEntries">
   * Gets the processed entries for a directory.
   * 
   * @param directory - The directory path to process
   * </method>
   */
  private async getProcessedEntries(directory: string): Promise<IndexStructurePreProcessorEntry[]> {
    // Process files and folders
    let processedEntries = await new IndexStructurePreProcessor({
      markdownLink: this.config?.markdownLinks,
    }).process(directory);


    if(this.config.flatten) {
      processedEntries = await this.recursivelyAddSubEntries(processedEntries);
    }
    
    return processedEntries;
  }

  /**
   * <method name="recursivelyAddSubEntries">
   * Recursively adds sub-entries to a directory.
   * 
   * @param entries - The entries to add sub-entries to
   * </method>
   */
  private async recursivelyAddSubEntries(entries: IndexStructurePreProcessorEntry[]): Promise<IndexStructurePreProcessorEntry[]> {
    for (const i in entries) {
      const entry = entries[i];

      entries[i].entries = await new IndexStructurePreProcessor({
        markdownLink: this.config?.markdownLinks,
      }).process(entry.src);

      if (false === entry.isDir) {
        continue;
      }

      entries[i].entries = await this.recursivelyAddSubEntries(entries[i].entries);
    }

    return entries;
  };
}
