import fs from 'fs';
import { GlobOptions } from "glob";
import { DocumentContentExtractorConfig } from "../files/DocumentContentExtractor.js";
import { FileScanner } from "../files/FileScanner.js";
import { DocGeneratorConfig } from "../generators/DocFileGenerator.js";
import { IndexFileGeneratorConfig } from "../generators/IndexFileGenerator.js";
import { TFormatter } from '../types/formatter.t.js';
import { FileProcessor, ProcessResult, ProcessResultError } from './FileProcessor.js';
import { IndexProcessor } from './IndexProcessor.js';

// Configuration for a single target directory to process
export type Target = {
    globOptions: GlobOptions & { cwd: string; extensions: string | string[] };
    outDir: string;
    createIndexFile: boolean;
}

// Main configuration interface for the SimpleDocsScraper
export interface SimpleDocsScraperConfig {
    baseDir: string;
    extraction: DocumentContentExtractorConfig;
    generators?: {
        index?: {
            template: string;
        } & Partial<IndexFileGeneratorConfig>;
        documentation?: {
            template: string;
        } & Partial<DocGeneratorConfig>;
    };
    targets: Target[];
    formatters?: TFormatter[];
}

// Result object returned after processing all targets
export type SimpleDocsScraperResult = {
    successCount: number;
    totalCount: number;
    logs: string[];
}


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
 * const scraper = new SimpleDocsScraper({
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
export class SimpleDocsScraper {

    constructor(
        private config: SimpleDocsScraperConfig,
        protected logs: string[] = [],
        protected success: number = 0,
        protected total: number = 0,
    ) {
    }

    /**
     * Returns the current configuration.
     * 
     * @returns The current SimpleDocsScraper configuration
     */
    getConfig(): SimpleDocsScraperConfig {
        return this.config;
    }

    /**
     * Starts the documentation generation process for all configured targets.
     * 
     * @returns Promise resolving to result object with success count, total count, and logs
     */
    async start(): Promise<SimpleDocsScraperResult> {
        for(const target of this.config.targets) {
            await this.handleTarget(target, this.config.targets.indexOf(target));
        }

        this.logs.push(`Finished. Success: ${this.success} / Total: ${this.total}`);

        return {
            successCount: this.success,
            totalCount: this.total,
            logs: this.logs,
        }
    }

    /**
     * Processes a single target directory by scanning files and generating documentation.
     * 
     * @param target - The target configuration to process
     * @param targetIndex - The index of the target for logging purposes
     */
    async handleTarget(target: Target, targetIndex: number) {

        const fileProcessor = new FileProcessor(this.config)

        this.logs.push(`targets[${targetIndex}]: Starting target`);

        // Check if cwd exists
        if (!fs.existsSync(target.globOptions.cwd)) {
            this.logs.push(`targets[${targetIndex}]: Cwd ${target.globOptions.cwd} not found`);
            return;
        }

        const files = await this.getFiles(target);
        let preProcessedFiles: ProcessResult[] = [];

        for(const file of files) {
            await this.processSingleFile(file, target, targetIndex, preProcessedFiles, fileProcessor);
        }

        // Create the index files
        await this.handleRecursivelyCreateIndexFiles(target);
    }

    /**
     * Processes a single file by extracting documentation and generating output.
     * 
     * @param file - The file path to process
     * @param target - The target configuration
     * @param targetIndex - The index of the target for logging
     * @param preProcessedFiles - Array to collect processed file results
     * @param fileProcessor - The file processor instance to use
     */
    private async processSingleFile(
        file: string,
        target: Target,
        targetIndex: number,
        preProcessedFiles: ProcessResult[],
        fileProcessor: FileProcessor
    ) {
        const processedResult = await fileProcessor.preProcess(file, target)
        this.total++;

        // If there is an error, log it and return
        if('error' in processedResult) {
            this.logs.push(`Error: ${(processedResult as unknown as ProcessResultError).error}`);
            return;
        }
        
        // Process the file
        preProcessedFiles.push(processedResult);
        await fileProcessor.processFile(processedResult, target)

        // Log the success
        this.logs.push(`targets[${targetIndex}]: Generated documentation file for ${processedResult.loggableFileName}`);
        this.success++;
    }

    /**
     * Creates an index file recursively for the target if configured to do so.
     * 
     * @param target - The target configuration
     */
    private async handleRecursivelyCreateIndexFiles(target: Target) {
        if(!target.createIndexFile) {
            return;
        }

        await new IndexProcessor({
            ...(this.config.generators?.index ?? {}),
        }).handle(target.outDir);
    }

    /**
     * Gets the files for the target using the configured file scanner.
     * 
     * @param target - The target configuration containing glob options
     * @returns Promise resolving to array of matching file paths
     */
    private async getFiles(target: Target) {
        const fileScanner = new FileScanner({
            cwd: target.globOptions.cwd,
            extensions: target.globOptions.extensions,
        });

        return await fileScanner.collect(target.globOptions);
    }
}
