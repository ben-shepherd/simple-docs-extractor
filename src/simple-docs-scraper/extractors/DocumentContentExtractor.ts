import fs from "fs";
import { ExtractorPlugin } from "../types/extractor.t.js";

// Configuration for extracting documentation using start and end tags
export type MethodTags = {
  extractMethod: "tags";
  startTag: string;
  endTag: string;
};

// Configuration for extracting documentation using regular expressions
export type MethodRegex = {
  extractMethod: "regex";
  pattern: RegExp;
};

// Configuration for extracting documentation using a custom callback function
export type MethodCallback = {
  extractMethod: "callback";
  callback: (
    fileContent: string,
  ) => Promise<string | string[] | undefined> | (string | string[] | undefined);
};

// Union type for all possible extraction methods
export type ExtractionMethod = (MethodTags | MethodRegex | MethodCallback) & {
  searchAndReplace: string;
};

export type ExtractionResultLegacy = {
  content: string[];
  attributes?: Record<string, string>;
} & ExtractionMethod;

export type ExtractedContent = {
  content: string;
  attributes: Record<string, string>;
  searchAndReplace: string;
};

export type ErrorResult = {
  errorMessage: string;
  nonThrowing?: boolean; // if true, the error will not be thrown
};

export type DocumentContentExtractorConfig = ExtractorPlugin[];

/**
 * <docs>
 * Extracts documentation from source files using various methods.
 *
 * This class provides flexible documentation extraction capabilities supporting
 * three different extraction methods: tag-based extraction, regex pattern matching,
 * and custom callback functions. It handles file validation, error reporting,
 * and content cleaning.
 *
 * @example
 * ```typescript
 * // Extract using tags
 * const extractor = new DocumentContentExtractor('example.js', {
 *   extractMethod: 'tags',
 *   startTag: '#START',
 *   endTag: '#END'
 * });
 *
 * // Extract using regex
 * const extractor = new DocumentContentExtractor('example.js', {
 *   extractMethod: 'regex',
 *   pattern: /\/\*\*([\s\S]*?)\*\//g
 * });
 *
 * const result = await extractor.extract();
 * ```
 * </docs>
 */
export class DocumentContentExtractor {
  constructor(private config: DocumentContentExtractorConfig) {}

  /**
   * Extracts documentation from the configured file using the specified method.
   *
   * @returns Promise resolving to extraction result with documentation content or error details
   * @throws {Error} When an invalid extraction method is configured
   */
  async extractFromFile(file: string): Promise<ExtractedContent[]> {
    if (!fs.existsSync(file)) {
      throw new Error("File not found");
    }
    const fileContent = fs.readFileSync(file, "utf8");
    return this.extractFromString(fileContent);
  }

  /**
   * Extracts documentation from a string using the specified method.
   *
   * @param contents - The content of the file to extract from
   * @returns Promise resolving to extraction result with documentation content or error details
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
        results,
        parseInt(i),
      );

      for (const extractedContent of extractedContentArray) {
        results.push(extractedContent);
      }
    }

    return results;
  }

  /**
   * Handles the extraction method based on the method type.
   *
   * @param method - The extraction method to handle
   * @param str - The content of the file to extract from
   * @param i - The index of the method
   * @param results - The results array
   */
  private async handleExtractionMethod(
    plugin: ExtractorPlugin,
    str: string,
    results: ExtractedContent[],
    i: number,
  ) {
    if (typeof plugin?.extractFromString !== "function") {
      throw new Error(
        "Error in extraction method " + i + ": Invalid extraction method",
      );
    }

    const extractedContentArray = await plugin.extractFromString(str);

    // if the result is an error, throw an error
    if ("errorMessage" in extractedContentArray) {
      if (extractedContentArray.nonThrowing) {
        return results;
      }
      throw new Error(extractedContentArray.errorMessage);
    }

    // trim spaces and empty lines
    this.trimContent(extractedContentArray);

    return extractedContentArray;
  }

  private trimContent(result: ExtractedContent[]) {
    const trimCallback = (content: string) =>
      content.trim().replace(/\n\s*\n/g, "\n");
    result.forEach((content) => trimCallback(content.content));
  }
}
