import { ConfigHelper } from "../config/ConfigHelper.js";
import { ExtractedContent } from "../extractors/DocumentContentExtractor.js";
import { Target } from "../services/SimpleDocExtractor.js";

export type TemplateContentExtractionContentMergerConfig = {
    target: Target;
};

/**
 * Merges the extracted content into the template content.
 * 
 * @example
 * ```typescript
 * const templateContent = "# Content\n{{content}}";
 * const extractedContentArray = [{ content: "This is the content", searchAndReplace: "{{content}}", attributes: { name: "John" } }];
 * const templateContentMergedContent = new TemplateContentExtractionContentMerger().handle(templateContent, extractedContentArray);
 * 
 * // Example output:
 * // # Content\nName: "John"\n\nThis is the content"
 * ```
 */
class TemplateContentExtractionContentMerger {
    constructor(private config: TemplateContentExtractionContentMergerConfig) {}

    /**
   * Creates a content string from extraction results by replacing the configured placeholder.
   *
   * @param extractedContentArray - The extraction results to create the content from
   * @returns The content string with injected content
   */
    handle(
        templateContent: string,
        extractedContentArray: ExtractedContent[],
    ): string {

        const grouped = this.getExtractionResultGroupedBySearchAndReplace(extractedContentArray);

        for (const searchAndReplace in grouped) {
            templateContent = this.handleGrouped(grouped, searchAndReplace, templateContent);
        }

        return templateContent;
    }


    /**
     * Handles a grouped extraction result.
     * - Iterate over the grouped extraction results and create a content block for each extraction result
     * - Add the divide by to the content block
     * - Replace the search and replace with the content block
     * - Return the template content
     */
    private handleGrouped(grouped: Record<string, ExtractedContent[]>, searchAndReplace: string, templateContent: string) {
        const extractionResults = grouped[searchAndReplace];
        let contentBlock: string[] = [];

        for (const [i, extractionResult] of extractionResults.entries()) {
            contentBlock = this.handleExtractContent(extractionResult, i, extractionResults, contentBlock);
        }

        // Replace the default search and replace with the content block
        templateContent = templateContent.replace(
            searchAndReplace,
            contentBlock.join("")
        );

        return templateContent;
    }

    /**
     * Handles the extraction content.
     * - Add the divide by to the content block
     * - Add the content to the content block
     * - Return the content block
     */
    private handleExtractContent(extractionResult: ExtractedContent, i: number, extractionResults: ExtractedContent[], contentBlock: string[]) {
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
     * Builds the attributes content.
     * - Add the attributes to the content block, using the attribute format defined in the extraction plugin
     * - If no attribute format is defined, use the default format
     * - Return the content block
     */
    private buildAttributesContent(extractedContent: ExtractedContent, contentBlock: string[]) {
        const attributeFormat = ConfigHelper.getAttributeFormatBySearchAndReplace(this.config.target, extractedContent.searchAndReplace) ?? "*{key}*: {value}\n";

        for (const [key, value] of Object.entries(extractedContent?.attributes ?? {})) {
            contentBlock.push(attributeFormat.replace("{key}", key).replace("{value}", value));
        }

        return contentBlock;
    }

    /**
     * Gets the extraction results grouped by search and replace.
     *
     * @param extractedContentArray - The extraction results to group by search and replace
     * @returns The extraction results grouped by search and replace
     */
    getExtractionResultGroupedBySearchAndReplace(extractedContentArray: ExtractedContent[]): Record<string, ExtractedContent[]> {
        return extractedContentArray.reduce((acc, extractedContent) => {
            acc[extractedContent.searchAndReplace] = [...(acc[extractedContent.searchAndReplace] || []), extractedContent];
            return acc;
        }, {});
    }

    /**
   * Gets the divide by for an extraction result.
   *
   * @param extractionResult - The extraction result to get the divide by for
   * @returns The divide by for the extraction result
   */
    getDivideBy(extractedContent: ExtractedContent): string {
        return extractedContent?.divideBy ?? "\n\n";
    }

}

export default TemplateContentExtractionContentMerger;



