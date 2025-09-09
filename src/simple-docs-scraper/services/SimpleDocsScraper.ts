import fs from 'fs';
import { GlobOptions } from "glob";
import path from 'path';
import { DocsExtractor, DocsExtractorConfig } from "../files/Extractor.js";
import { FileScanner } from "../files/FileScanner.js";
import { DocGenerator, DocGeneratorConfig } from "../generators/DocGenerator.js";
import { IndexGenerator, IndexGeneratorConfig } from "../generators/IndexGenerator.js";
import { Injection } from "../transformers/Injection.js";
import { TFormatter } from '../types/formatter.t.js';

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

type PreProcessFileSuccessResult = {
    content: string;
    outDir: string;
    fileName: string;
    loggableFileName: string;
}
type PreProcessFileErrorResult = {
    error: string;
}
type PreProcessFileResult = PreProcessFileSuccessResult | PreProcessFileErrorResult;

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
        protected total: number = 0
    ) {
    }

    /**
     * Returns the current configuration.
     * 
     * @returns The scraper configuration object
     */
    getConfig(): SimpleDocsScraperConfig {
        return this.config;
    }

    /**
     * Starts the documentation generation process for all configured targets.
     * 
     * @returns Promise resolving to processing results with success count and logs
     */
    async start(): Promise<SimpleDocsScraperResult> {
        for(const target of this.config.targets) {
            await this.startTarget(target, this.config.targets.indexOf(target));
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
     * @param targetIndex - The index of the target in the targets array (for logging)
     */
    async startTarget(target: Target, targetIndex: number) {

        this.logs.push(`targets[${targetIndex}]: Starting target`);

        // Check if cwd exists
        if (!fs.existsSync(target.globOptions.cwd)) {
            this.logs.push(`targets[${targetIndex}]: Cwd ${target.globOptions.cwd} not found`);
            return;
        }

        const fileScanner = new FileScanner({
            cwd: target.globOptions.cwd,
            extensions: target.globOptions.extensions,
        });

        const files = await fileScanner.collect(target.globOptions);
        let preProcessedFiles: PreProcessFileResult[] = [];

        for(const file of files) {
            const preProcessedFile = await this.preProcessFile(file, target);

            if('error' in preProcessedFile) {
                this.logs.push(`Error: ${(preProcessedFile as unknown as PreProcessFileErrorResult).error}`);
                continue;
            }
            
            preProcessedFiles.push(preProcessedFile);
            await this.processFile(preProcessedFile as PreProcessFileSuccessResult, target, targetIndex);
        }

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

    async preProcessFile(file: string, target: Target): Promise<PreProcessFileResult> {

        this.total++;
        
        const extractionResult = await new DocsExtractor(file, this.config.extraction).extract();

        if(!extractionResult.sucess) {
            return {
                error: `Error: ${extractionResult.errorType} in file ${file}`,
            };
        }

        // Inject the content into the template
        let injectedContent = new Injection({
            template: this.config.generators?.documentation?.template ?? '',
            outDir: target.outDir,
            searchAndReplace: this.config.searchAndReplace.replace,
        })
        .injectIntoString(extractionResult.docs, this.config.searchAndReplace.replace);

        // Apply formatters
        if(this.config.formatters) {
            for(const formatter of this.config.formatters) {
                injectedContent = formatter({ filePath: file, outFile: file, content: injectedContent });
            }
        }

        // Generate the documentation file
        const generatedContent = new DocGenerator({
            template: this.config.generators?.documentation?.template,
            outDir: target.outDir,
            searchAndReplace: this.config.searchAndReplace.replace,
        })
        .generateContentString(injectedContent);

        // Transform the out dir to match the files folder location
        // e.g. /services/fileName.js
        // should go to
        // docs/services/fileName.md
        let fileParentDir = path.dirname(file)
        fileParentDir = fileParentDir.replace(target.globOptions.cwd, '')
        const newOutDir = path.join(target.outDir, fileParentDir)

        return {
            content: generatedContent,
            fileName: path.basename(file),
            outDir: newOutDir,
            loggableFileName: file.replace(this.config.baseDir, ''),
        };
    }

    /**
     * Processes a single file by extracting documentation and generating output.
     * 
     * @param processedResult - The file path to process
     * @param target - The target configuration containing output directory
     */
    async processFile(processedResult: PreProcessFileSuccessResult, target: Target, targetIndex: number) {

        // Create the out directory if it doesn't exist
        if (!fs.existsSync(target.outDir)) {
            fs.mkdirSync(target.outDir, { recursive: true });
        }

        const outFile = path.join(target.outDir, processedResult.fileName);

        // Generate the documentation file
        new DocGenerator({
            template: this.config.generators?.documentation?.template,
            outDir: processedResult.outDir,
            searchAndReplace: this.config.searchAndReplace.replace,
        })
        .generateContent(processedResult.content, outFile);

        this.logs.push(`targets[${targetIndex}]: Generated documentation file for ${processedResult.loggableFileName}`);
        
        this.success++;
    }
}
