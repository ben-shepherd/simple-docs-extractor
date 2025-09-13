import fs from "fs";
import path from "path";
import { ExtractedContent } from "../extractors/DocumentContentExtractor.js";
import { ExtractorPlugin } from "../types/extractor.t.js";

// Configuration for content injection operations
export type InjectionConfig = {
  template?: string;
  outDir: string;
};

// Result object for injection operations
export type InjectionResult = {
  sucess: boolean;
  content: string;
};

/**
 * <docs>
 * Handles content injection into templates and files.
 *
 * This class provides functionality to inject content into templates by replacing
 * placeholder strings. It supports both string-based injection and file-based
 * injection with template file reading and output file writing.
 *
 * @example
 * ```typescript
 * const injection = new ContentInjection({
 *   template: './templates/doc.md',
 *   outDir: './docs',
 *   injectInto: '{{CONTENT}}'
 * });
 *
 * // Inject into string
 * const result = injection.injectIntoString('Hello {{CONTENT}}', 'World');
 * // Returns 'Hello World'
 *
 * // Inject into file
 * injection.injectIntoFile('Documentation content: {{CONTENT}}', 'output.md');
 * ```
 * </docs>
 */
export class ContentInjection {
  constructor(private config: InjectionConfig) {}

  /**
   * Gets the template content with the replace string replaced.
   *
   * @param replaceWith - The string to replace the replace string with
   * @param searchAndReplace - The search and replace string to replace
   * @returns The template content with the replace string replaced
   */
  getTemplateContentWithReplaceString(replaceWith: string, searchAndReplace: string): string {
    const templateContent = this.getTemplateContent();
    return templateContent.replace(searchAndReplace, replaceWith);
  }

  /**
   * Creates a content string from extraction results by replacing the configured placeholder.
   *
   * @param extractionResults - The extraction results to create the content from
   * @returns The content string with injected content
   */
  mergeExtractionResultsIntoTemplateString(
    extractionResults: ExtractedContent[],
  ): string {
    let templateContent = this.getTemplateContent();

    // Group the extraction results by search and replace
    // e.g. { "%content%": [{content: "This is a test string.", searchAndReplace: "%content%"}, {content: "This is a test string 2.", searchAndReplace: "%content%"}] }
    const extractionResultGroupedBySearchAndReplace = this.getExtractionResultGroupedBySearchAndReplace(extractionResults);
    
    // Iterate over the grouped extraction results
    // and create a content block for each search and replace
    // Finally, replace the default search and replace with the content block
    for (const searchAndReplace in extractionResultGroupedBySearchAndReplace) {
      const extractionResults = extractionResultGroupedBySearchAndReplace[searchAndReplace];
      const contentBlock: string[] = [];

      for(const [i, extractionResult] of extractionResults.entries()) {
        const content = extractionResult.content;
        const divideBy = this.getDivideBy(extractionResult);

        // We don't want to add the divide by to the last block
        if(i === extractionResults.length - 1) {
          contentBlock.push(content);
        } else {
          contentBlock.push(content + divideBy);
        }
      }

      // Replace the default search and replace with the content block
      templateContent = templateContent.replace(
        searchAndReplace,
        contentBlock.join(""),
      );
    }

    return templateContent;
  }

  /**
   * Applies the default text to the template content.
   *
   * @param templateContent - The template content to apply the default text to
   * @returns The template content with the default text applied
   */
  applyDefaultText(injectedContent: string, extractionPlugins: ExtractorPlugin[]): string {
    for(const extractionPlugin of extractionPlugins) {
      const defaultText = extractionPlugin.getConfig().defaultText ?? "Not available.";
      injectedContent = injectedContent.replace(extractionPlugin.getConfig().searchAndReplace, defaultText);
    }
    return injectedContent;
  }

  /**
   * Gets the extraction results grouped by search and replace.
   *
   * @param extractionResults - The extraction results to group by search and replace
   * @returns The extraction results grouped by search and replace
   */
  getExtractionResultGroupedBySearchAndReplace(extractionResults: ExtractedContent[]): Record<string, ExtractedContent[]> {
    return extractionResults.reduce((acc, extractionResult) => {
      acc[extractionResult.searchAndReplace] = [...(acc[extractionResult.searchAndReplace] || []), extractionResult];
      return acc;
    }, {});
  }

  /**
   * Gets the divide by for an extraction result.
   *
   * @param extractionResult - The extraction result to get the divide by for
   * @returns The divide by for the extraction result
   */
  getDivideBy(extractionResult: ExtractedContent): string {
    return extractionResult?.divideBy ?? "\n\n";
  }

  /**
   * Injects content into a template file and writes the result to an output file.
   *
   * @param replaceWith - The content to replace the placeholder with
   * @param outFile - The output file path to write the result to
   * @throws {Error} When the template file is not found
   */
  writeFile(injectedContent: string, outFile: string): void {
    if (fs.existsSync(outFile)) {
      outFile = path.join(this.config.outDir, outFile);
    }

    // Add the injected content to the file
    fs.writeFileSync(outFile, injectedContent);
  }

  /**
   * Retrieves the template content from the configured template file.
   *
   * @returns The template content as a string
   * @throws {Error} When the template file is not found
   */
  protected getTemplateContent(): string {
    // Check if the template file exists
    if (!fs.existsSync(this.config?.template ?? "")) {
      throw new Error("Documentation template file not found. Did you configure the template file?");
    }

    return fs.readFileSync(this.config?.template ?? "", "utf8");
  }
}
