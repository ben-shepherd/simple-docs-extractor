import { ErrorResult, ExtractedContent } from "../index.js";
import { BaseExtractorConfig, ExtractorPlugin } from "../types/extractor.t.js";

/**
 * Configuration for the TagExtractorPlugin.
 *
 * @param {string} tag - The HTML/XML tag name to extract content from (e.g., 'docs', 'example')
 * @param {string} [divideBy] - Optional delimiter for dividing content into sections
 */
export type TagExtractorPluginConfig = BaseExtractorConfig & {
  tag: string;
  divideBy?: string;
};

/**
 * <docs>
 * Extracts content from HTML/XML-like tags in source files.
 *
 * This extractor plugin searches for content between opening and closing tags,
 * such as `<documentation>content</documentation>` or `<example>code</example>`. It supports
 * extracting attributes from the opening tag and can handle multiple tag
 * instances in a single file.
 *
 * Example usage:
 * ```typescript
 * const extractor = new TagExtractorPlugin({
 *   tag: 'docs',
 *   searchAndReplace: ''
 * });
 *
 * // Will extract content from: <documentation>This is documentation</documentation>
 * const result = await extractor.extractFromString('<documentation>This is documentation</documentation>');
 * ```
 *
 * @param {TagExtractorPluginConfig} config - The configuration object containing the tag name and options
 * </docs>
 */
export class TagExtractorPlugin
  implements ExtractorPlugin<TagExtractorPluginConfig>
{
  constructor(private config: TagExtractorPluginConfig) {}

  /**
   * <method name="setConfig">
   * Updates the configuration for this extractor.
   *
   * @param {TagExtractorPluginConfig} config - The new configuration object
   * @returns {this} The current instance for method chaining
   * </method>
   */
  setConfig(config: TagExtractorPluginConfig): this {
    this.config = config;
    return this;
  }

  /**
   * <method name="getConfig">
   * Retrieves the current configuration of this extractor.
   *
   * @returns {TagExtractorPluginConfig} The current configuration object
   * </method>
   */
  getConfig(): TagExtractorPluginConfig {
    return this.config;
  }

  /**
   * <method name="extractFromString">
   * Extracts content from HTML/XML-like tags in the provided string.
   *
   * Searches for all instances of the configured tag and extracts the content
   * between the opening and closing tags. Also extracts any attributes from
   * the opening tag. Returns an error if no matching tags are found.
   *
   * @param {string} str - The content string to extract from
   * @returns {Promise<ExtractedContent[] | ErrorResult>} Array of extracted content objects or error result
   *
   * For regex101 example:
   * @see https://regex101.com/r/UzcvAj/2
   * </method>
   */
  async extractFromString(
    str: string,
  ): Promise<ExtractedContent[] | ErrorResult> {
    const rawTag = this.getRawTag(this.config.tag);
    const regExp = this.composeRegExp(rawTag);
    const result = [...(str.matchAll(regExp) ?? [])];

    if (Array.isArray(result) && result.length === 0) {
      return {
        errorMessage: "Content not found between tags",
        throwable: false,
      };
    }

    return result.map((item) => {
      const startTag = item[1];
      const content = item[2];
      const attributes = this.getAttributesOrUndefined(startTag);

      return {
        content,
        attributes,
        searchAndReplace: this.config.searchAndReplace,
      };
    }) as ExtractedContent[];
  }

  /**
   * <method name="composeRegExp">
   * Composes a regular expression pattern for matching the configured tag.
   *
   * @param {string} rawTag - The cleaned tag name
   * @returns {RegExp} The compiled regular expression for tag matching
   * </method>
   */
  composeRegExp(rawTag: string): RegExp {
    return new RegExp(
      `${this.getStartTagPattern(rawTag)}${this.getInsideTagPattern()}${this.getEndTagPattern(rawTag)}`,
      "gm",
    );
  }

  /**
   * <method name="getAttributesOrUndefined">
   * Extracts attributes from the opening tag string.
   *
   * @param {string} startTag - The opening tag string to extract attributes from
   * @returns {Record<string, string> | undefined} Object containing attribute key-value pairs or undefined if no attributes
   * </method>
   */
  getAttributesOrUndefined(
    startTag: string,
  ): Record<string, string> | undefined {
    const attributesPattern = new RegExp(this.getAttributesPattern(), "g");
    const attributes = [...startTag.matchAll(attributesPattern)];

    const result = attributes.reduce((acc, item) => {
      acc[item[1]] = item[2];
      return acc;
    }, {});

    if (Object.keys(result).length === 0) {
      return undefined;
    }

    return result;
  }

  /**
   * <method name="getStartTagPattern">
   * Returns the pattern for the start tag.
   *
   * @param {string} rawTag - The raw tag name
   * @returns {string} The pattern for the start tag
   * </method>
   */
  getStartTagPattern(rawTag: string) {
    return `(<${rawTag}[^\>]*?>)`;
  }

  /**
   * <method name="getAttributesPattern">
   * Returns the pattern for the attributes.
   *
   * @returns {string} The pattern for the attributes
   * </method>
   */
  getAttributesPattern() {
    return '(?:([\\w_]+)="([^"]+)")';
  }

  /**
   * <method name="getInsideTagPattern">
   * Returns the pattern for the inside tag.
   *
   * @returns {string} The pattern for the inside tag
   * </method>
   */
  getInsideTagPattern() {
    return "([.\\n\\s\\w\\W\\d]*?)";
  }

  /**
   * <method name="getEndTagPattern">
   * Returns the pattern for the end tag.
   *
   * @param {string} rawTag - The raw tag name
   * @returns {string} The pattern for the end tag
   * </method>
   */
  getEndTagPattern(rawTag: string) {
    return `(<\/${rawTag}>)`;
  }

  /**
   * <method name="getRawTag">
   * Cleans the tag name by removing non-word characters.
   *
   * @param {string} startTag - The original tag name
   * @returns {string} The cleaned tag name containing only word characters
   * @throws {Error} When the resulting tag name is empty or invalid
   * </method>
   */
  getRawTag(startTag: string) {
    const removeNonCharactersPattern = /([^\w]+)/g;
    const result = startTag.replace(removeNonCharactersPattern, "");

    if (
      typeof result !== "string" ||
      (typeof result === "string" && result.length === 0)
    ) {
      throw new Error("Invalid tag");
    }

    return result;
  }
}
