import { BaseExtractorConfig, ExtractorPlugin } from "../types/extractor.t.js";
import { ErrorResult, ExtractedContent } from "./DocumentContentExtractor.js";

export type RegexExtractorPluginConfig = BaseExtractorConfig & {
  pattern: RegExp;
};

/**
 * <docs>
 * Extracts content from strings using regular expression patterns.
 *
 * This extractor plugin uses a configured regular expression to find and extract
 * content from strings. The regex should have at least one capture group, and
 * the content from the first capture group will be extracted.
 *
 * Example usage:
 * ```typescript
 * const extractor = new RegexExtractorPlugin({
 *   pattern: /\/\*\*([\s\S]*?)\*\//g,
 *   searchAndReplace: ''
 * });
 *
 * // Will extract content from: \/*\* This is documentation \*
 * const result = await extractor.extractFromString('/** This is documentation *\/');
 * ```
 *
 * @param {RegexExtractorPluginConfig} config - The configuration object containing the regex pattern and options
 * </docs>
 */
export class RegexExtractorPlugin
  implements ExtractorPlugin<RegexExtractorPluginConfig>
{
  constructor(private config: RegexExtractorPluginConfig) {}

  /**
   * <method name="setConfig">
   * Updates the configuration for this extractor.
   *
   * @param {RegexExtractorPluginConfig} config - The new configuration object
   * @returns {this} The current instance for method chaining
   * </method>
   */
  setConfig(config: RegexExtractorPluginConfig): this {
    this.config = config;
    return this;
  }

  /**
   * <method name="getConfig">
   * Retrieves the current configuration of this extractor.
   *
   * @returns {RegexExtractorPluginConfig} The current configuration object
   * </method>
   */
  getConfig(): RegexExtractorPluginConfig {
    return this.config;
  }

  /**
   * <method name="extractFromString">
   * Extracts content from the provided string using the configured regex pattern.
   *
   * Applies the regex pattern to the input string and extracts the content from
   * the first capture group. Returns an error if no matches are found or if the
   * first capture group is not a string.
   *
   * @param {string} str - The content string to extract from
   * @returns {Promise<ExtractedContent[] | ErrorResult>} Array containing one extracted content object or error result
   * </method>
   */
  async extractFromString(
    str: string,
  ): Promise<ExtractedContent[] | ErrorResult> {
    const regex = new RegExp(this.config.pattern);
    const matches = str.match(regex);

    if (!matches || typeof matches[1] !== "string") {
      return {
        errorMessage: "No content found in the file",
        throwable: false,
      };
    }

    const content = matches[1];

    return [
      {
        content: content,
        attributes: {},
        searchAndReplace: this.config.searchAndReplace,
      },
    ];
  }
}
