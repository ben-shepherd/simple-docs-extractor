import { BaseExtractorConfig, ExtractorPlugin } from "../types/extractor.t.js";
import { ErrorResult, ExtractedContent } from "./DocumentContentExtractor.js";

/**
 * Configuration for the CallbackExtractor plugin.
 * 
 * @param {Function} callback - A function that processes the input string and returns extracted content
 */
export type CallbackExtractorConfig = BaseExtractorConfig & {
  callback: (
    str: string,
  ) => Promise<string | string[] | undefined> | (string | string[] | undefined);
};

/**
 * <docs>
 * A flexible extractor plugin that uses a custom callback function to extract content from strings.
 * 
 * This extractor allows you to define custom extraction logic by providing a callback function
 * that processes the input string and returns the extracted content. The callback can be either
 * synchronous or asynchronous and can return a single string, an array of strings, or undefined.
 * 
 * Example usage:
 * ```typescript
 * const extractor = new CallbackExtractor({
 *   callback: (str) => {
 *     // Custom extraction logic
 *     const matches = str.match(/pattern/g);
 *     return matches ? matches.join('\n') : undefined;
 *   }
 * });
 * 
 * const result = await extractor.extractFromString("some text with pattern matches");
 * ```
 * 
 * @param {CallbackExtractorConfig} config - The configuration object containing the callback function
 * </docs>
 */
export class CallbackExtractor
  implements ExtractorPlugin<CallbackExtractorConfig>
{
  constructor(private config: CallbackExtractorConfig) {}

  /**
   * <method name="setConfig">
   * Updates the configuration for this extractor.
   * 
   * @param {CallbackExtractorConfig} config - The new configuration object
   * @returns {this} The current instance for method chaining
   * </method>
   */
  setConfig(config: CallbackExtractorConfig): this {
    this.config = config;
    return this;
  }

  /**
   * <method name="getConfig">
   * Retrieves the current configuration of this extractor.
   * 
   * @returns {CallbackExtractorConfig} The current configuration object
   * </method>
   */
  getConfig(): CallbackExtractorConfig {
    return this.config;
  }

  /**
   * <method name="extractFromString">
   * Extracts content from the provided string using the configured callback function.
   * 
   * The method calls the configured callback function with the input string and processes
   * the result. If the callback returns undefined, an error result is returned. If it returns
   * a single string, it's wrapped in an array. If it returns an array, it's used as-is.
   * 
   * @param {string} str - The input string to extract content from
   * @returns {Promise<ExtractedContent[] | ErrorResult>} An array of extracted content objects or an error result
   * </method>
   */
  async extractFromString(
    str: string,
  ): Promise<ExtractedContent[] | ErrorResult> {
    const content = await this.config.callback(str);

    if (!content) {
      return {
        errorMessage: "Callback function returned no content",
        throwable: true,
      };
    }

    return (Array.isArray(content) ? content : [content]).map((item) => ({
      content: item,
      attributes: {},
      searchAndReplace: this.config.searchAndReplace,
    }));
  }
}
