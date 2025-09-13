import fs from "fs";
import { ExtractorPlugin } from "../types/extractor.t.js";

export type ExtractedContent = {
  content: string;
  attributes: Record<string, string>;
  searchAndReplace: string;
  divideBy?: string;
  defaultText?: string;
};

export type ErrorResult = {
  errorMessage: string;
  throwable?: boolean; // if true, the error will not be thrown
};

/**
 * @deprecated Use ExtractorPlugin[] instead
 */
export type DocumentContentExtractorConfig = ExtractorPlugin[];

/**
 * <docs>
 * Extracts documentation from source files using various extractor plugins.
 *
 * This class provides flexible documentation extraction capabilities by orchestrating
 * multiple extractor plugins. It supports tag-based extraction, regex pattern matching,
 * and custom callback functions. The class handles file validation, error reporting,
 * and content cleaning across all configured extractors.
 *
 * Example usage:
 * ```typescript
 * const extractors = [
 *   new TagExtractorPlugin({ tag: 'docs', searchAndReplace: '' }),
 *   new RegexExtractorPlugin({ pattern: /\/\*\*([\s\S]*?)\*\//g, searchAndReplace: '' })
 * ];
 * 
 * const extractor = new DocumentContentExtractor(extractors);
 * const result = await extractor.extractFromFile('example.js');
 * ```
 * 
 * @param {DocumentContentExtractorConfig} config - Array of extractor plugins to use for extraction
 * </docs>
 */
export class DocumentContentExtractor {
  constructor(private config: DocumentContentExtractorConfig) {}

  /**
   * <method name="extractFromFile">
   * Extracts documentation from a file using the configured extractor plugins.
   * 
   * Reads the file content and delegates to extractFromString for processing.
   * Throws an error if the file does not exist.
   * 
   * @param {string} file - The path to the file to extract documentation from
   * @returns {Promise<ExtractedContent[]>} Promise resolving to array of extracted content objects
   * @throws {Error} When the file is not found
   * </method>
   */
  async extractFromFile(file: string): Promise<ExtractedContent[]> {
    if (!fs.existsSync(file)) {
      throw new Error("File not found");
    }
    const fileContent = fs.readFileSync(file, "utf8");
    return this.extractFromString(fileContent);
  }

  /**
   * <method name="extractFromString">
   * Extracts documentation from a string using all configured extractor plugins.
   * 
   * Processes the input string through each configured extractor plugin sequentially
   * and combines all results into a single array. Each plugin can extract different
   * types of content from the same input.
   * 
   * @param {string} contents - The content string to extract documentation from
   * @returns {Promise<ExtractedContent[]>} Promise resolving to array of all extracted content objects
   * </method>
   */
  async extractFromString(contents: string): Promise<ExtractedContent[]> {
    const extractionMethodsArray = Array.isArray(this.config)
      ? this.config
      : [this.config];

    const results: ExtractedContent[] = [];

    for (const i in extractionMethodsArray) {
      const method = extractionMethodsArray[i];
      const extractedContentArray = await this.handleExtractionMethod(
        method,
        contents,
        parseInt(i),
      );

      for (const extractedContent of extractedContentArray ?? []) {
        results.push(extractedContent);
      }
    }

    return results;
  }

  /**
   * <method name="handleExtractionMethod">
   * Handles the extraction process for a single extractor plugin.
   * 
   * Validates the plugin, executes the extraction, handles errors appropriately,
   * and cleans the extracted content by trimming whitespace and empty lines.
   * 
   * @param {ExtractorPlugin} plugin - The extractor plugin to execute
   * @param {string} str - The content string to extract from
   * @param {number} i - The index of the plugin for error reporting
   * @returns {Promise<ExtractedContent[] | undefined>} Array of extracted content or undefined if error is not throwable
   * @throws {Error} When plugin is invalid or extraction fails with throwable error
   * </method>
   */
  private async handleExtractionMethod(
    plugin: ExtractorPlugin,
    str: string,
    i: number,
  ) {
    if (typeof plugin?.extractFromString !== "function") {
      throw new Error(
        "Error in extraction method " + i + ": Invalid extraction method",
      );
    }

    const extractedContentArray = await plugin.extractFromString(str);

    // if the result is an error, throw an error
    // otherwise, it is safe to continue
    if ("errorMessage" in extractedContentArray) {
      if (false === extractedContentArray.throwable) {
        return undefined;
      }
      throw new Error(extractedContentArray.errorMessage);
    }

    // trim spaces and empty lines
    this.trimContent(extractedContentArray);

    return extractedContentArray;
  }

  /**
   * <method name="trimContent">
   * Cleans extracted content by trimming whitespace and removing excessive empty lines.
   * 
   * @param {ExtractedContent[]} result - Array of extracted content objects to clean
   * </method>
   */
  private trimContent(result: ExtractedContent[]) {
    const trimCallback = (content: string) =>
      content.trim().replace(/\n\s*\n/g, "\n");
    result.forEach((content) => trimCallback(content.content));
  }
}
