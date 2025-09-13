import { ConfigHelper } from "../config/ConfigHelper.js";
import { ExtractedContent } from "../extractors/DocumentContentExtractor.js";
import { Target } from "../services/SimpleDocExtractor.js";

export type TemplateContentExtractionContentMergerConfig = {
  target: Target;
};

/**
 * <docs>
 * Merges extracted content into template content with attribute formatting and content separation.
 * 
 * This class handles the complex process of merging multiple extracted content pieces
 * into a single template string. It groups content by search and replace patterns,
 * formats attributes according to configured patterns, and applies content dividers
 * between multiple content blocks.
 * 
 * @example
 * ```typescript
 * const merger = new TemplateContentExtractionContentMerger({ target });
 * const templateContent = "# Content\n{{content}}";
 * const extractedContentArray = [
 *   { 
 *     content: "This is the content", 
 *     searchAndReplace: "{{content}}", 
 *     attributes: { name: "John" } 
 *   }
 * ];
 * const result = merger.handle(templateContent, extractedContentArray);
 * // Result: "# Content\n### *name*: John\n\nThis is the content"
 * ```
 * 
 * @param {TemplateContentExtractionContentMergerConfig} config - Configuration containing the target for attribute format lookup
 * </docs>
 */
class TemplateContentExtractionContentMerger {
  constructor(private config: TemplateContentExtractionContentMergerConfig) {}

  /**
   * <method name="handle">
   * Merges extracted content into template content by replacing placeholders.
   * 
   * Groups extracted content by search and replace patterns, then processes each
   * group to replace the corresponding placeholders in the template with formatted
   * content including attributes and dividers.
   * 
   * @param {string} templateContent - The template string containing placeholders
   * @param {ExtractedContent[]} extractedContentArray - Array of extracted content to merge
   * @returns {string} The template content with all placeholders replaced by formatted content
   * </method>
   */
  handle(
    templateContent: string,
    extractedContentArray: ExtractedContent[],
  ): string {
    const grouped = this.getExtractionResultGroupedBySearchAndReplace(
      extractedContentArray,
    );

    for (const searchAndReplace in grouped) {
      templateContent = this.handleGrouped(
        grouped,
        searchAndReplace,
        templateContent,
      );
    }

    return templateContent;
  }

  /**
   * <method name="handleGrouped">
   * Handles a grouped extraction result.
   * - Iterate over the grouped extraction results and create a content block for each extraction result
   * - Add the divide by to the content block
   * - Replace the search and replace with the content block
   * - Return the template content
   * </method>
   */
  private handleGrouped(
    grouped: Record<string, ExtractedContent[]>,
    searchAndReplace: string,
    templateContent: string,
  ) {
    const extractionResults = grouped[searchAndReplace];
    let contentBlock: string[] = [];

    for (const [i, extractionResult] of extractionResults.entries()) {
      contentBlock = this.handleExtractContent(
        extractionResult,
        i,
        extractionResults,
        contentBlock,
      );
    }

    // Replace the default search and replace with the content block
    templateContent = templateContent.replace(
      searchAndReplace,
      contentBlock.join(""),
    );

    return templateContent;
  }

  /**
   * <method name="handleExtractContent">
   * Handles the extraction content.
   * - Add the divide by to the content block
   * - Add the content to the content block
   * - Return the content block
   * </method>
   */
  private handleExtractContent(
    extractionResult: ExtractedContent,
    i: number,
    extractionResults: ExtractedContent[],
    contentBlock: string[],
  ) {
    const content = extractionResult.content;
    const divideBy = this.getDivideBy(extractionResult);

    // Add attributes to the content block
    contentBlock = this.buildAttributesContent(extractionResult, contentBlock);

    // We don't want to add the divide by to the last block
    if (i === extractionResults.length - 1) {
      contentBlock.push(content);
    } else {
      contentBlock.push(content + divideBy);
    }

    return contentBlock;
  }

  /**
   * <method name="buildAttributesContent">
   * Builds the attributes content.
   * - Add the attributes to the content block, using the attribute format defined in the extraction plugin
   * - If no attribute format is defined, use the default format
   * - Return the content block
   * </method>
   */
  private buildAttributesContent(
    extractedContent: ExtractedContent,
    contentBlock: string[],
  ) {
    const attributes = extractedContent?.attributes ?? {};
    const attributeFormat =
      ConfigHelper.getAttributeFormatBySearchAndReplace(
        this.config.target,
        extractedContent.searchAndReplace,
      ) ?? "### *{key}*: {value}\n";

    for (const [key, value] of Object.entries(attributes)) {
      contentBlock.push(
        attributeFormat.replace("{key}", key).replace("{value}", value),
      );
    }

    return contentBlock;
  }

  /**
   * <method name="getExtractionResultGroupedBySearchAndReplace">
   * Gets the extraction results grouped by search and replace.
   *
   * @param extractedContentArray - The extraction results to group by search and replace
   * @returns The extraction results grouped by search and replace
   * </method>
   */
  getExtractionResultGroupedBySearchAndReplace(
    extractedContentArray: ExtractedContent[],
  ): Record<string, ExtractedContent[]> {
    return extractedContentArray.reduce((acc, extractedContent) => {
      acc[extractedContent.searchAndReplace] = [
        ...(acc[extractedContent.searchAndReplace] || []),
        extractedContent,
      ];
      return acc;
    }, {});
  }

  /**
   * <method name="getDivideBy">
   * Gets the divide by for an extraction result.
   *
   * @param extractionResult - The extraction result to get the divide by for
   * @returns The divide by for the extraction result
   * </method>
   */
  getDivideBy(extractedContent: ExtractedContent): string {
    return extractedContent?.divideBy ?? "\n\n---\n\n";
  }
}

export default TemplateContentExtractionContentMerger;
