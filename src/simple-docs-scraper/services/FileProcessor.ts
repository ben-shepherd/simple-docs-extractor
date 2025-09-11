import fs from "fs";
import path from "path";
import { DocumentContentExtractor } from "../files/DocumentContentExtractor.js";
import { DocFileGenerator } from "../generators/DocFileGenerator.js";
import { ContentInjection } from "../transformers/ContentInjection.js";
import { SimpleDocsScraperConfig, Target } from "./SimpleDocsScraper.js";

export type ProcessResultSuccess = {
  content: string;
  outDir: string;
  fileName: string;
  loggableFileName: string;
};

export type ProcessResultError = {
  error: string;
};

export type ProcessResult = ProcessResultSuccess | ProcessResultError;

/**
 * <docs>
 * Processes individual files to extract documentation and generate output files.
 *
 * This class handles the complete file processing pipeline including documentation
 * extraction, content injection into templates, formatter application, and output
 * file generation. It coordinates between various components to transform source
 * files into formatted documentation.
 *
 * @example
 * ```typescript
 * const processor = new FileProcessor(config);
 *
 * const result = await processor.preProcess('./src/example.js', target);
 *
 * if ('content' in result) {
 *   // Example result structure:
 *   // {
 *   //   content: '...generated markdown...',
 *   //   outDir: './docs',
 *   //   fileName: 'example.js',
 *   //   loggableFileName: 'src/example.js'
 *   // }
 *   await processor.processFile(result, target);
 * } else if ('error' in result) {
 *   // Handle the error, e.g.:
 *   console.error(result.error);
 * }
 * ```
 * </docs>
 */
export class FileProcessor {
  constructor(private config: SimpleDocsScraperConfig) {}

  /**
   * Pre-processes a file by extracting documentation and preparing it for output generation.
   *
   * @param file - The source file path to process
   * @param target - The target configuration containing output directory and options
   * @returns Promise resolving to processing result with content or error details
   */
  async preProcess(file: string, target: Target): Promise<ProcessResult> {
    const contentInjection = new ContentInjection({
      template: this.config.generators?.documentation?.template ?? "",
      outDir: target.outDir,
    });
    let injectedContent = "";

    const extractionResults = await new DocumentContentExtractor(
      this.config.extraction,
    ).extractFromFile(file);

    if (!extractionResults.length) {
      return {
        error: `Error: No extraction results in file ${file}`,
      };
    }

    // Merge the extraction results into the template string
    injectedContent =
      contentInjection.mergeExtractionResultsIntoTemplateString(
        extractionResults,
      );

    // Apply formatters
    if (this.config.formatters) {
      for (const formatter of this.config.formatters) {
        injectedContent = formatter({
          filePath: file,
          outFile: file,
          content: injectedContent,
        });
      }
    }

    // Build the output directory
    const transformedOutDir = this.buildOutputPath(file, target);

    // Generate the documentation file
    new DocFileGenerator({
      template: this.config.generators?.documentation?.template,
      outDir: transformedOutDir,
    }).saveToMarkdownFile(injectedContent, file);

    return {
      content: injectedContent,
      fileName: path.basename(file),
      outDir: transformedOutDir,
      loggableFileName: file.replace(this.config.baseDir, ""),
    };
  }

  /**
     * Builds the output directory path by preserving the source file's directory structure.
     * 
     * Takes a source file path and maps it to the corresponding output directory,
     * maintaining the relative folder structure from the target's working directory.

     * 
     * @param file - The source file path
     * @param target - The target configuration containing output directory and glob options
     * @returns The complete output directory path
     */
  private buildOutputPath(file: string, target: Target) {
    let fileParentDir = path.dirname(file);
    fileParentDir = fileParentDir.replace(target.globOptions.cwd, "");
    const newOutDir = path.join(target.outDir, fileParentDir);
    return newOutDir;
  }

  /**
   * Processes a single file by extracting documentation and generating output.
   *
   * @param processedResult - The file path to process
   * @param target - The target configuration containing output directory
   */
  async processFile(processedResult: ProcessResultSuccess, target: Target) {
    // Create the out directory if it doesn't exist
    if (!fs.existsSync(target.outDir)) {
      fs.mkdirSync(target.outDir, { recursive: true });
    }

    const outFile = path.join(target.outDir, processedResult.fileName);

    // Generate the documentation file
    new DocFileGenerator({
      template: this.config.generators?.documentation?.template,
      outDir: processedResult.outDir,
    }).saveToMarkdownFile(processedResult.content, outFile);
  }
}
