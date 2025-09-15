import fs from "fs";
import path from "path";

type IndexStructurePreProcessorConfig = {
  markdownLink?: boolean;
};

export type IndexStructurePreProcessorEntry = {
  src: string;
  entryName: string;
  isDir: boolean;
  basename: string;
  markdownLink: string;
  entries?: IndexStructurePreProcessorEntry[];
};

/**
 * <docs>
 * Prepares a array of entries for index file generation.
 *
 * This class scans directories and processes file and directory entries to create
 * structured data suitable for index file generation. It handles markdown file filtering,
 * directory detection, entry name formatting, and markdown link generation with
 * configurable options for link formatting.
 *
 * @example
 * ```typescript
 * const processor = new IndexStructurePreProcessor({
 *   markdownLink: true
 * });
 *
 * const entries = await processor.process('./docs');
 * // Returns array of processed entries with formatted names and links
 * ```
 * </docs>
 */
export class IndexStructurePreProcessor {
  constructor(private config: IndexStructurePreProcessorConfig = {}) {}

  /**
   * <method name="getDirectoryEntries">
   * Retrieves directory entries filtered for markdown files and directories.
   *
   * This method scans a directory and returns only markdown files and all
   * subdirectories, filtering out other file types. It's used to prepare
   * entries for index file generation.
   *
   * @param baseDir - The directory path to scan
   * @returns Promise resolving to array of filtered file and directory paths
   * </method>
   */
  async getDirectoryEntries(baseDir: string): Promise<string[]> {
    if (!fs.existsSync(baseDir)) {
      return [];
    }
    if(fs.statSync(baseDir).isFile()) {
      return [];
    }

    return fs
      .readdirSync(baseDir)
      .filter((entry) => {
        const isDir = fs.statSync(path.join(baseDir, entry)).isDirectory();

        if (false === isDir && path.basename(entry) === "index.md") {
          return false;
        }

        if (false === isDir) {
          return entry.endsWith(".md");
        }

        return true;
      })
      .map((entry) => {
        return path.join(baseDir, entry);
      });
  }

  /**
   * <method name="process">
   * Processes a directory and returns structured entries for index generation.
   *
   * This method scans a directory, processes each entry (file or directory),
   * formats entry names, generates markdown links, and sorts the results
   * with files appearing before directories.
   *
   * @param baseDir - The directory path to process
   * @returns Promise resolving to array of processed entries ready for index generation
   * </method>
   */
  async process(baseDir: string): Promise<IndexStructurePreProcessorEntry[]> {
    const srcArray = await this.getDirectoryEntries(baseDir);

    let results: IndexStructurePreProcessorEntry[] = [];

    for (const src of srcArray) {
      // const parentDirectory = path.dirname(entry);
      const excerpt = undefined;
      const basename = path.basename(src);

      const result: Partial<IndexStructurePreProcessorEntry> = {
        src: src,
        isDir: false,
        basename,
      };

      if (fs.statSync(src).isDirectory()) {
        result.isDir = true;
        result.entryName = this.getDirEntryName(basename);
        result.markdownLink = this.markdownLink(
          result.entryName,
          result.entryName,
          excerpt,
        );

        // If the directory contains an index.md, append it to the markdown link
        this.appendIndexMdIfFound(result, excerpt);
      } else {
        result.entryName = this.getFileEntryName(basename);
        result.markdownLink = this.markdownLink(
          result.entryName,
          result.entryName,
          excerpt,
        );
      }

      results.push(result as IndexStructurePreProcessorEntry);
    }

    // Sort results so files appear first
    results = this.sortWithFilesAppearingFirst(results);

    return results;
  }

  sortWithFilesAppearingFirst(
    processedEntries: IndexStructurePreProcessorEntry[],
  ): IndexStructurePreProcessorEntry[] {
    return processedEntries.sort((a, b) => {
      const aint = a.isDir === false ? 0 : 1;
      const bint = b.isDir === false ? 0 : 1;
      return aint - bint;
    });
  }

  /**
   * <method name="appendIndexMdIfFound">
   * Appends 'index.md' to the markdown link if the directory contains an index file.
   *
   * This method checks if a directory contains an index.md file and updates the
   * markdown link to point to that index file instead of just the directory name.
   *
   * @param result - The partial entry result to update
   * @param excerpt - Optional excerpt to include in the link
   * </method>
   */
  appendIndexMdIfFound(
    result: Partial<IndexStructurePreProcessorEntry>,
    excerpt?: string,
  ): void {
    const directoryContainsIndex = fs.existsSync(
      path.join(result.src as string, "index.md"),
    );

    if (!directoryContainsIndex) {
      return;
    }

    let entryNameSuffix = "";

    if (entryNameSuffix?.endsWith("/")) {
      entryNameSuffix += "/";
    }

    entryNameSuffix += "index.md";

    result.markdownLink = this.markdownLink(
      result.entryName as string,
      (result.entryName as string) + entryNameSuffix,
      excerpt,
    );
  }

  protected getDirEntryName(baseName: string) {
    if (!baseName.endsWith("/")) {
      baseName += "/";
    }
    return baseName;
  }

  protected getFileEntryName(baseName: string) {
    if (!baseName.endsWith(".md")) {
      baseName += ".md";
    }
    return baseName;
  }

  /**
   * <method name="markdownLink">
   * Generates a markdown link or plain text based on configuration.
   *
   * This method creates either a markdown link or plain text based on the
   * markdownLink configuration. It handles optional excerpts and formats
   * the output accordingly.
   *
   * @param display - The text to display
   * @param link - The link target
   * @param excerpt - Optional excerpt to include
   * @returns Formatted markdown link or plain text
   * </method>
   */
  protected markdownLink(display: string, link: string, excerpt?: string) {
    let result = "";

    if (!this.config.markdownLink) {
      result = `${display}`;

      if (excerpt) {
        result += ` - ${excerpt}`;
      }

      return result;
    }

    result = `[${display}]`;

    if (excerpt) {
      result += `(${link} - ${excerpt})`;
    } else {
      result += `(${link})`;
    }

    return result;
  }

  formatEntry(entry: string) {
    const parentDirectory = path.dirname(entry);

    // remove parent directory
    let formattedFilePath = entry.replace(parentDirectory, "");

    // remove leading slash
    while (
      formattedFilePath.startsWith("/") ||
      formattedFilePath.startsWith("\\")
    ) {
      if (formattedFilePath.startsWith("/")) {
        formattedFilePath = formattedFilePath.slice(1);
      }
      if (formattedFilePath.startsWith("\\")) {
        formattedFilePath = formattedFilePath.slice(1);
      }
    }

    return formattedFilePath;
  }
}
