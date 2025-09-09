import fs from 'fs';
import path from 'path';
import { DocsExtractor } from "../files/Extractor.js";
import { DocGenerator } from "../generators/DocGenerator.js";
import { Injection } from "../transformers/Injection.js";
import { SimpleDocsScraperConfig, Target } from "./SimpleDocsScraper.js";

export type PreProcessFileSuccessResult = {
    content: string;
    outDir: string;
    fileName: string;
    loggableFileName: string;
}

export type PreProcessFileErrorResult = {
    error: string;
}

export type PreProcessFileResult = PreProcessFileSuccessResult | PreProcessFileErrorResult;

export class FileProcesser {
    constructor(private config: SimpleDocsScraperConfig) { }

    async preProcess(file: string, target: Target): Promise<PreProcessFileResult> {

        const extractionResult = await new DocsExtractor(file, this.config.extraction).extract();

        if (!extractionResult.sucess) {
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
        if (this.config.formatters) {
            for (const formatter of this.config.formatters) {
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

        // Build the output directory
        const transformedOutDir = this.buildOutputPath(file, target);

        return {
            content: generatedContent,
            fileName: path.basename(file),
            outDir: transformedOutDir,
            loggableFileName: file.replace(this.config.baseDir, ''),
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
        fileParentDir = fileParentDir.replace(target.globOptions.cwd, '');
        const newOutDir = path.join(target.outDir, fileParentDir);
        return newOutDir;
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
        .saveToMarkdownFile(processedResult.content, outFile);

    }
}