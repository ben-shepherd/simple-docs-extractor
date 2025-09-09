import fs from 'fs';
import { GlobOptions } from "glob";
import { DocsExtractorConfig } from "../files/Extractor.js";
import { FileScanner } from "../files/FileScanner.js";
import { DocGeneratorConfig } from "../generators/DocGenerator.js";
import { IndexGenerator, IndexGeneratorConfig } from "../generators/IndexGenerator.js";
import { TFormatter } from '../types/formatter.t.js';
import { FileProcesser, PreProcessFileErrorResult, PreProcessFileResult } from './FileProcesser.js';

// Configuration for a single target directory to process
export type Target = {
    globOptions: GlobOptions & { cwd: string; extensions: string | string[] };
    outDir: string;
    createIndexFile: boolean;
}

// Main configuration interface for the SimpleDocsScraper
export interface SimpleDocsScraperConfig {
    baseDir: string;
    extraction: DocsExtractorConfig;
    searchAndReplace: {
        replace: string;
    };
    generators?: {
        index?: {
            template: string;
        } & Partial<IndexGeneratorConfig>;
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
 *     startTag: '<docs>',
 *     endTag: '</docs>'
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
     */
    getConfig(): SimpleDocsScraperConfig {
        return this.config;
    }

    /**
     * Starts the documentation generation process for all configured targets.
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
     */
    async handleTarget(target: Target, targetIndex: number) {

        const fileProcessor = new FileProcesser(this.config)

        this.logs.push(`targets[${targetIndex}]: Starting target`);

        // Check if cwd exists
        if (!fs.existsSync(target.globOptions.cwd)) {
            this.logs.push(`targets[${targetIndex}]: Cwd ${target.globOptions.cwd} not found`);
            return;
        }

        const files = await this.getFiles(target);
        let preProcessedFiles: PreProcessFileResult[] = [];

        for(const file of files) {
            await this.processSingleFile(file, target, targetIndex, preProcessedFiles, fileProcessor);
        }

        // Create the index file
        await this.createIndexFile(files, preProcessedFiles, target, targetIndex);
    }

    /**
     * Processes a single file by extracting documentation and generating output.
     */
    private async processSingleFile(
        file: string,
        target: Target,
        targetIndex: number,
        preProcessedFiles: PreProcessFileResult[],
        fileProcessor: FileProcesser
    ) {
        const processedResult = await new FileProcesser(this.config).preProcess(file, target)
        this.total++;

        // If there is an error, log it and return
        if('error' in processedResult) {
            this.logs.push(`Error: ${(processedResult as unknown as PreProcessFileErrorResult).error}`);
            return;
        }
        
        // Process the file
        preProcessedFiles.push(processedResult);
        await fileProcessor.processFile(processedResult, target, targetIndex)

        // Log the success
        this.logs.push(`targets[${targetIndex}]: Generated documentation file for ${processedResult.loggableFileName}`);
        this.success++;
    }

    /**
     * Creates an index file for the target.
     */
    private async createIndexFile(
        files: string[],
        preProcessedFiles: PreProcessFileResult[],
        target: Target,
        targetIndex: number
    ) {
        const shouldCreateIndexFile = target.createIndexFile 
            && typeof this.config.generators?.index?.template === 'string'
            && preProcessedFiles.length > 0;

        if(shouldCreateIndexFile) {
            this.logs.push(`targets[${targetIndex}]: Creating index file`);

            const indexGenerator = new IndexGenerator({
                ...(this.config.generators?.index ?? {}),
                baseDir: this.config.baseDir,
                template: this.config.generators?.index?.template as string,
                outDir: target.outDir,
            });

            indexGenerator.generateContent(files);
        }
    }

    /**
     * Gets the files for the target.
     */
    private async getFiles(target: Target) {
        const fileScanner = new FileScanner({
            cwd: target.globOptions.cwd,
            extensions: target.globOptions.extensions,
        });

        return await fileScanner.collect(target.globOptions);
    }
}
