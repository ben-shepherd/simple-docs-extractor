import {
  IndexFileGenerator,
  IndexFileGeneratorConfig,
} from "../generators/IndexFileGenerator.js";
import { IndexStructurePreProcessor, IndexStructurePreProcessorEntry } from "./IndexStructurePreProcessor.js";

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
  ) { }

  /**
   * <method name="handle">
   * Starts the index file generation process for the configured base directory.
   * </method>
   */
  async handle(baseDir: string) {
    if (this.config.flatten) {
      await this.handleFlatten(baseDir);
    } else if (this.config.recursive) {
      await this.handleDirectoryRecusrively(baseDir);
    }
    else {
      await this.handleDirectoryRecusrively(baseDir);
    }
  }

  async handleFlatten(directory: string) {
    // Process files and folders
    let processedEntries = await new IndexStructurePreProcessor({
      markdownLink: this.config?.markdownLinks,
    }).process(directory);

    // If no md files are found, return
    if (processedEntries.length === 0) {
      return;
    }

    const recursivelyAddSubEntries = async (entries: IndexStructurePreProcessorEntry[]) => {
      for (const i in entries) {
        const entry = entries[i]
        
        entries[i].entries = await new IndexStructurePreProcessor({
          markdownLink: this.config?.markdownLinks,
        }).process(entry.src);

        if(false === entry.isDir) {
          continue;
        }
        

        entries[i].entries = await recursivelyAddSubEntries(entries[i].entries);
      }

      return entries
    }

    processedEntries = await recursivelyAddSubEntries(processedEntries);

    // Save the index.md file
    await new IndexFileGenerator({
      ...(this.config ?? {}),
      outDir: directory,
      flatten: true,
    }).saveIndexFile(processedEntries);
  }

  async handleSingleDirectory(directory: string) {

    // Process files and folders
    const processedEntries = await new IndexStructurePreProcessor({
      markdownLink: this.config?.markdownLinks,
    }).process(directory);

    // If no md files are found, return
    if (processedEntries.length === 0) {
      return;
    }

    // Save the index.md file
    await new IndexFileGenerator({
      ...(this.config ?? {}),
      outDir: directory,
    }).saveIndexFile(processedEntries);
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
