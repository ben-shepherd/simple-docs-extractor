import fs from "fs";
import { escapeRegExpString } from "../utils/escapeRegexString.js";

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

export type ExtractionResult = {
  content: string[];
} & ExtractionMethod;

export type ErrorResult = {
  errorMessage: string;
  nonThrowing?: boolean; // if true, the error will not be thrown
};

export type DocumentContentExtractorConfig =
  | ExtractionMethod
  | ExtractionMethod[];

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
  async extractFromFile(file: string): Promise<ExtractionResult[]> {
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
  async extractFromString(contents: string): Promise<ExtractionResult[]> {
    const extractionMethodsArray = Array.isArray(this.config)
      ? this.config
      : [this.config];
    let results: ExtractionResult[] = [];

    for (const i in extractionMethodsArray) {
      const method = extractionMethodsArray[i];
      await this.handleExtractionMethod(method, contents, i, results);
    }

    return results;
  }

  /**
   * Handles the extraction method based on the method type.
   *
   * @param method - The extraction method to handle
   * @param fileContent - The content of the file to extract from
   * @param i - The index of the method
   * @param results - The results array
   */
  private async handleExtractionMethod(
    method: ExtractionMethod,
    fileContent: string,
    i: string,
    results: ExtractionResult[],
  ) {
    let result: ExtractionResult | ErrorResult = {
      searchAndReplace: method.searchAndReplace,
    } as ExtractionResult | ErrorResult;

    if (method.extractMethod === "tags" && method.startTag && method.endTag) {
      result = this.extractUsingTags(method, fileContent);
    } else if (method.extractMethod === "regex" && method.pattern) {
      result = this.extractUsingRegex(method, fileContent);
    } else if (
      method.extractMethod === "callback" &&
      typeof method.callback === "function"
    ) {
      result = await this.extractUsingCallback(method, fileContent);
    } else {
      result = {
        errorMessage: `Error in extraction method ${i}: Invalid extraction method`,
      };
    }

    // if the result is an error, throw an error
    if ("errorMessage" in result) {
      if (true === result.nonThrowing) {
        return;
      }
      throw new Error(result.errorMessage);
    }

    // Ensure the content is an array to avoid unexpected behavior
    if (!Array.isArray(result.content)) {
      result.content = [result.content];
    }

    // trim spaces and empty lines
    this.trimContent(result);

    // add the result to the results array
    results.push(result as ExtractionResult);
  }

  private trimContent(result: ExtractionResult) {
    const trimCallback = (content: string) =>
      content.trim().replace(/\n\s*\n/g, "\n");
    result.content = result.content.map((content) => trimCallback(content));
  }

  /**
   * Extracts documentation using a regular expression pattern.
   *
   * @param fileContent - The content of the file to extract from
   * @returns Extraction result with matched documentation or error details
   */
  protected extractUsingRegex(
    method: MethodRegex,
    fileContent: string,
  ): ExtractionResult | ErrorResult {
    const regex = new RegExp(method.pattern);
    const matches = fileContent.match(regex);

    if (!matches) {
      return {
        errorMessage: "No content found in the file",
        nonThrowing: true,
      };
    }

    const match = matches[1];

    return {
      content: match,
      ...method,
    } as unknown as ExtractionResult;
  }

  /**
   * Extracts documentation using a custom callback function.
   *
   * @param fileContent - The content of the file to extract from
   * @returns Promise resolving to extraction result with callback-generated documentation or error details
   */
  protected async extractUsingCallback(
    method: MethodCallback,
    fileContent: string,
  ): Promise<ExtractionResult | ErrorResult> {
    const content = await method.callback(fileContent);

    if (!content) {
      return {
        errorMessage: "Callback function returned no content",
        nonThrowing: false,
      };
    }

    return {
      content: Array.isArray(content) ? content : [content],
      ...method,
    } as unknown as ExtractionResult;
  }

  /**
   * Extracts documentation using start and end tags.
   *
   * @param fileContent - The content of the file to extract from
   * @returns Extraction result with content between tags or error details
   *
   * For regex101 example:
   * @see https://regex101.com/r/UzcvAj/2
   */
  protected extractUsingTags(
    method: MethodTags,
    fileContent: string,
  ): ExtractionResult | ErrorResult {
    // Check if the file contains the start and end tags
    if (
      !fileContent.includes(method.startTag) ||
      !fileContent.includes(method.endTag)
    ) {
      return {
        errorMessage: "Content not found between tags",
        nonThrowing: true,
      };
    }

    /**
     * This regex matches any character, including whitespace, word characters, and non-word characters.
     */
    const inBetweenTagsPattern = [
      "([", // start of group
      "\\s", // whitespace
      "\\w", // word characters
      "\\W", // non-word characters
      "\\d", // digits
      ".]+?)", // any character (dot), non-greedy, end of group
    ].join("");
    /**
     * g modifier: global. All matches (don't return after first match)
     * m modifier: multi line. Causes ^ and $ to match the begin/end of each line (not only begin/end of string)
     */
    const flags = "gm";

    // final regex to match the start and end tags and the content inside the tags
    const startTagPattern = escapeRegExpString(method.startTag);
    const endTagPattern = escapeRegExpString(method.endTag);
    const finalRegex = new RegExp(
      `${startTagPattern}(${inBetweenTagsPattern}*?)${endTagPattern}`,
      flags,
    );

    // match the final regex
    const matches = fileContent.match(finalRegex);

    // Remove the start and end tags from each match
    const matchesWithoutTags = matches?.map((match) =>
      match?.replace(method.startTag, "").replace(method.endTag, ""),
    );

    return {
      content: matchesWithoutTags ?? [],
      ...method,
    } as unknown as ExtractionResult;
  }
}
