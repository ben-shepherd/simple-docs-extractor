import fs from "fs";
import path from "path";
import { ExtractedContent } from "../extractors/DocumentContentExtractor.js";
import { Target } from "../services/SimpleDocExtractor.js";
import { ExtractorPlugin } from "../types/extractor.t.js";
import TemplateContentExtractionContentMerger from "./TemplateContentExtractionContentMerger.js";

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
  constructor(
    private config: InjectionConfig,
    private target: Target,
  ) {}

  /**
   * Gets the template content with the replace string replaced.
   *
   * @param replaceWith - The string to replace the replace string with
   * @param searchAndReplace - The search and replace string to replace
   * @returns The template content with the replace string replaced
   */
  getTemplateContentWithReplaceString(
    replaceWith: string,
    searchAndReplace: string,
  ): string {
    const templateContent = this.getTemplateContent();
    return templateContent.replace(searchAndReplace, replaceWith);
  }

  /**
   * Creates a content string from extraction results by replacing the configured placeholder.
   *
   * @param extractionResults - The extraction results to create the content from
   * @returns The content string with injected content
   */
  mergeExtractedContentsIntoTemplateString(
    extractionResults: ExtractedContent[],
  ): string {
    const templateContent = this.getTemplateContent();

    const templateContentMergedContent =
      new TemplateContentExtractionContentMerger({
        target: this.target,
      }).handle(templateContent, extractionResults);

    return templateContentMergedContent;
  }

  /**
   * Applies the default text to the template content.
   *
   * @param templateContent - The template content to apply the default text to
   * @returns The template content with the default text applied
   */
  applyDefaultText(
    injectedContent: string,
    extractionPlugins: ExtractorPlugin[],
  ): string {
    for (const extractionPlugin of extractionPlugins) {
      const defaultText =
        extractionPlugin.getConfig().defaultText ?? "Not available.";
      injectedContent = injectedContent.replace(
        extractionPlugin.getConfig().searchAndReplace,
        defaultText,
      );
    }
    return injectedContent;
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
      throw new Error(
        "Documentation template file not found. Did you configure the template file?",
      );
    }

    return fs.readFileSync(this.config?.template ?? "", "utf8");
  }
}
