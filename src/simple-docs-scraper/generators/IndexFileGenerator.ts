import fs from 'fs';
import path from 'path';
import { IndexStructurePreProcessorEntry } from '../processors/IndexStructurePreProcessor.js';
import { DEFAULT_CONFIG as DEFAULT_EXCERPT_CONFIG, ExcerptExtractor, ExcerptExtractorConfig } from '../transformers/ExcerptExtractor.js';

export type IndexFileGeneratorConfig = {
    outDir: string;
    searchAndReplace?: string;
    template?: string;
    baseDir?: string;
    markdownLink?: boolean;
    filesHeading?: string;
    directoryHeading?: string;
    excerpt?: ExcerptExtractorConfig;
    lineCallback?: (fileNameEntry: string, lineNumber: number, excerpt?: string) => string;
    fileNameCallback?: (filePath: string) => string;
}

/**
 * <docs>
 * Generates index files from processed directory entries with configurable templates and formatting.
 * 
 * This class creates markdown index files that list files and directories in a structured format.
 * It supports custom templates, search-and-replace patterns, excerpt generation, and flexible
 * formatting through callback functions. The generated index files help organize documentation
 * by providing navigation links and summaries.
 * 
 * @example
 * ```typescript
 * const generator = new IndexFileGenerator({
 *   outDir: './docs',
 *   template: './templates/index.md',
 *   searchAndReplace: '{{CONTENT}}',
 *   excerpt: true,
 *   excerptLength: 100
 * });
 * 
 * generator.saveIndexFile(processedEntries);
 * // Creates index.md with formatted file listings
 * ```
 * </docs>
 */
export class IndexFileGenerator {
    constructor(private config: IndexFileGeneratorConfig) {
    }

    /**
     * Saves an index file by processing entries and generating formatted content.
     * 
     * This method creates a markdown index file that lists files and directories
     * in a structured format. It handles excerpt generation, custom formatting
     * through callbacks, and template injection to create the final index file.
     * 
     * @param processedArray - Array of processed directory entries to include in the index
     */
    saveIndexFile(processedArray: IndexStructurePreProcessorEntry[]) {

        // Check if the out directory exists
        if (!fs.existsSync(this.config.outDir)) {
            fs.mkdirSync(this.config.outDir, { recursive: true });
        }

        let templateContent = this.getTemplateContent();
        let content = ''
        let excerpt: string | undefined = undefined
        let lineNumber = 1;
        const outFilePath = path.join(this.config.outDir, 'index.md');
        
        let filesTotalCount = processedArray.filter(proc => proc.isDir === false).length
        let filesProcessed = 0
        let dirsTotalCount = processedArray.filter(proc => proc.isDir === true).length
        let dirsProcessed = 0
        
        for(const current of processedArray) {
            const {
                entryName,
                markdownLink
            } = current

            // If we're a file, genereate an excerpt
            excerpt = this.createExcerpt(excerpt, current);

            // We should only consider creating a file heading once we have reached the files
            if(false === current.isDir) {
                content = this.createFileHeading(filesProcessed, filesTotalCount, content)
            }

            // We should only consider creating a directory heading once all files have been rendered
            if(filesProcessed === filesTotalCount) {
                content = this.createDirectoryHeading(dirsProcessed, dirsTotalCount, content)
            }

            if(this.config.lineCallback) {
                content += this.config.lineCallback(entryName, lineNumber, excerpt);
            }
            else {
                let line = `- ${markdownLink ?? entryName}`;
                if(excerpt) {
                    line += ` - ${excerpt}`
                }
                content += `${line}\n`;
            }

            lineNumber++;

            if(false === current.isDir) {
                filesProcessed++
            }
            else {
                dirsProcessed++
            }
        }

        templateContent = templateContent.replace(this.getSearchAndReplace(), content);
        fs.writeFileSync(outFilePath, templateContent);
    }

    private createExcerpt(excerpt: string | undefined, current: IndexStructurePreProcessorEntry) {
        excerpt = undefined;
        if (false === current.isDir) {
            const fileContents = fs.readFileSync(current.src, 'utf8');
            excerpt = this.generateExcerpt(fileContents);
        }
        return excerpt;
    }

    protected generateExcerpt(content: string) {
        if(!this.config.excerpt) {
            return undefined
        }

        return ExcerptExtractor.determineExcerpt(content, this.config?.excerpt ?? DEFAULT_EXCERPT_CONFIG)
    }

    protected createFileHeading(processedFiles: number, totalCount: number, content: string = '') {
        if(this.config.filesHeading && processedFiles === 0 && totalCount > 0) {
            content += this.config.filesHeading + '\n'
        }

        return content
    }

    protected createDirectoryHeading(processedDirs: number, totalCount: number, content: string = '') {
        if(this.config.directoryHeading && processedDirs === 0 && totalCount > 0) {
            content += this.config.directoryHeading + '\n'
        }

        return content
    }

    private getTemplateContent(): string {
        if(!this.config.template) {
            return this.getSearchAndReplace();
        }

        // Check if the template file exists
        if (!fs.existsSync(this.config.template)) {
            throw new Error('Template file not found');
        }

        return fs.readFileSync(this.config.template, 'utf8');
    }

    /**
     * Gets the search and replace pattern for template injection.
     * 
     * @returns The search and replace pattern, defaults to '%content%' if not configured
     */
    private getSearchAndReplace() {
        if(!this.config.searchAndReplace) {
            return '%content%';
        }

        return this.config.searchAndReplace;
    }
}
