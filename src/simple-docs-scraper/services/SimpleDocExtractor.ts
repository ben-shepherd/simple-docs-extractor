import fs from "fs";
import { GlobOptions } from "glob";
import { DocumentContentExtractorConfig } from "../extractors/DocumentContentExtractor.js";
import { FileScanner } from "../files/FileScanner.js";
import {
  CodeFileProcessor,
  ProcessResult,
  ProcessResultError,
} from "../processors/CodeFileProcessor.js";
import { MarkdownIndexProcessor } from "../processors/MarkdownIndexProcessor.js";
import {
  DocumentationGeneratorConfig,
  IndexGeneratorConfig,
  SimpleDocExtractorConfig,
} from "../types/config.js";

// Configuration for a single target directory to process
export type Target = {
  globOptions: GlobOptions & { cwd: string; extensions: string | string[] };
  outDir: string;
  createIndexFile: boolean;
  generators?: {
    index?: IndexGeneratorConfig;
    documentation?: DocumentationGeneratorConfig;
  };
  extraction?: DocumentContentExtractorConfig;
};

// Result object returned after processing all targets
export type SimpleDocExtractorResult = {
  successCount: number;
  totalCount: number;
  logs: string[];
};

/**
 * <docs>
 * Main orchestrator class for extracting and generating documentation from source files.
 *
 * This class coordinates the entire documentation generation process by scanning files,
 * extracting documentation content, and generating both individual documentation files
 * and index files. It supports multiple targets and provides comprehensive logging.
 *
 * @example
 * ```typescript
 * const scraper = new SimpleDocsExtractor({
 *   baseDir: './src',
 *   extraction: {
 *     extractMethod: 'tags',
 *     startTag: '#START',
 *     endTag: '#END'
 *   },
 *   searchAndReplace: { replace: '{{CONTENT}}' },
 *   generators: {
 *     index: { template: './templates/index.md' },
 *     documentation: { template: './templates/doc.md' }
 *   },
 *   targets: [{
 *     globOptions: { cwd: './src', extensions: '*.js' },
 *     outDir: './docs',
 *     createIndexFile: true
 *   }]
 * });
 *
 * const result = await scraper.start();
 * ```
 * </docs>
 */
export class SimpleDocExtractor {
  constructor(
    private config: SimpleDocExtractorConfig,
    protected logs: string[] = [],
    protected success: number = 0,
    protected total: number = 0,
  ) {}

  /**
   * <method name="getConfig">
   * Returns the current configuration.
   *
   * @returns The current SimpleDocExtractor configuration
   * </method>
   */
  getConfig(): SimpleDocExtractorConfig {
    return this.config;
  }

  /**
   * <method name="start">
   * Starts the documentation generation process for all configured targets.
   *
   * @returns Promise resolving to result object with success count, total count, and logs
   * </method>
   */
  async start(): Promise<SimpleDocExtractorResult> {
    for (const target of this.config.targets) {
      await this.handleTarget(target, this.config.targets.indexOf(target));
    }

    this.logs.push(`Finished. Success: ${this.success} / Total: ${this.total}`);

    return {
      successCount: this.success,
      totalCount: this.total,
      logs: this.logs,
    };
  }

  /**
   * <method name="handleTarget">
   * Processes a single target directory by scanning files and generating documentation.
   *
   * @param target - The target configuration to process
   * @param targetIndex - The index of the target for logging purposes
   * </method>
   */
  async handleTarget(target: Target, targetIndex: number) {
    const fileProcessor = new CodeFileProcessor(this.config);

    this.logs.push(`targets[${targetIndex}]: Starting target`);

    // Check if cwd exists
    if (!fs.existsSync(target.globOptions.cwd)) {
      this.logs.push(
        `targets[${targetIndex}]: Cwd ${target.globOptions.cwd} not found`,
      );
      return;
    }

    const files = await this.getFiles(target);
    const preProcessedFiles: ProcessResult[] = [];

    for (const file of files) {
      await this.processSingleFile(
        file,
        target,
        targetIndex,
        preProcessedFiles,
        fileProcessor,
      );
    }

    // Create the index files
    await this.handleRecursivelyCreateIndexFiles(target);
  }

  /**
   * <method name="processSingleFile">
   * Processes a single file by extracting documentation and generating output.
   *
   * @param file - The file path to process
   * @param target - The target configuration
   * @param targetIndex - The index of the target for logging
   * @param preProcessedFiles - Array to collect processed file results
   * @param fileProcessor - The file processor instance to use
   * </method>
   */
  private async processSingleFile(
    file: string,
    target: Target,
    targetIndex: number,
    preProcessedFiles: ProcessResult[],
    fileProcessor: CodeFileProcessor,
  ) {
    const processedResult = await fileProcessor.preProcess(file, target);
    this.total++;

    // If there is an error, log it and return
    if ("error" in processedResult) {
      this.logs.push(
        `Error: ${(processedResult as unknown as ProcessResultError).error}`,
      );
      return;
    }

    // Process the file
    preProcessedFiles.push(processedResult);
    await fileProcessor.processFile(processedResult, target);

    // Log the success
    this.logs.push(
      `targets[${targetIndex}]: Generated documentation file for ${processedResult.loggableFileName}`,
    );
    this.success++;
  }

  /**
   * <method name="handleRecursivelyCreateIndexFiles">
   * Creates an index file recursively for the target if configured to do so.
   *
   * @param target - The target configuration
   * </method>
   */
  private async handleRecursivelyCreateIndexFiles(target: Target) {
    if (!target.createIndexFile) {
      return;
    }

    await new MarkdownIndexProcessor({
      ...this.getIndexProcessorConfig(target),
    }).handle(target.outDir);
  }

  /**
   * <method name="getIndexProcessorConfig">
   * Gets the index processor config for the target.
   * - Returns the target's index processor config if it exists
   * - Returns the default index processor config if the target's index processor config does not exist
   * - Returns an empty object if the default index processor config does not exist
   *
   * @param target - The target configuration
   * @returns The index processor config
   * </method>
   */
  getIndexProcessorConfig(target: Target) {
    if (target.generators?.index) {
      return target.generators.index;
    }
    if (typeof this.config.generators?.index === "undefined") {
      return {};
    }
    return this.config.generators.index;
  }

  /**
   * <method>
   * Gets the files for the target using the configured file scanner.
   *
   * @param target - The target configuration containing glob options
   * @returns Promise resolving to array of matching file paths
   * </method>
   */
  private async getFiles(target: Target) {
    const fileScanner = new FileScanner({
      cwd: target.globOptions.cwd,
      extensions: target.globOptions.extensions,
    });

    return await fileScanner.collect(target.globOptions);
  }
}
