import fs from 'fs';
import path from 'path';
import { ExtensionReplacer } from '../transformers/ExtensionReplacer.js';

// Configuration for generating index files from a list of file paths
export type IndexFileGeneratorConfig = {
    outDir: string;
    searchAndReplace?: string;
    template?: string;
    baseDir?: string;
    markdownLink?: boolean;
    lineCallback?: (fileNameEntry: string, lineNumber: number) => string;
    fileNameCallback?: (filePath: string) => string;
}

/**
 * <docs>
 * Generates index files from a list of file paths using templates.
 * 
 * This class creates index files (typically index.md) that list all the files
 * in a directory structure. It supports custom formatting through callbacks,
 * link generation, and template-based content generation.
 * 
 * @example
 * ```typescript
 * const generator = new IndexFileGenerator({
 *   template: './templates/index.template.md',
 *   outDir: './docs',
 *   fileNameAsLink: true,
 *   lineCallback: (fileName, lineNumber) => `${lineNumber}. ${fileName}\n`
 * });
 * 
 * generator.generateContent(['file1.js', 'file2.ts']);
 * // Creates ./docs/index.md with formatted file list
 * ```
 * </docs>
 */
export class IndexFileGenerator {
    constructor(private config: IndexFileGeneratorConfig) {
    }

    /**
     * Generates an index file from a list of file paths.
     * 
     * @param filePaths - Array of file paths to include in the index
     * @throws {Error} When the template file is not found
     */
    generateContent(filePaths: string[]): void {
        
        // Check if the out directory exists
        if (!fs.existsSync(this.config.outDir)) {
            fs.mkdirSync(this.config.outDir, { recursive: true });
        }

        let templateContent = this.getTemplateContent();
        let content = ''
        let lineNumber = 1;
        const outFilePath = path.join(this.config.outDir, 'index.md');

        for(const filePath of filePaths) {
            const fileName = this.getRenderedEntryString(filePath);

            if(!fileName) {
                continue;
            }

            if(this.config.lineCallback) {
                content += this.config.lineCallback(fileName, lineNumber);
            }
            else {
                content += `- ${fileName}\n`;
            }

            lineNumber++;
        }

        templateContent = templateContent.replace(this.getSearchAndReplace(), content);

        fs.writeFileSync(outFilePath, templateContent);
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
     * Formats a file path for display in the index.
     * 
     * @param entry - The original file path to format
     * @returns Formatted file name, optionally as a markdown link
     */
    getRenderedEntryString(entry: string): string | null {
        if(this.config.fileNameCallback) {
            return this.config.fileNameCallback(entry);
        }

        // Ignore invalid entries
        if(['.', '..'].includes(entry)) {
            return null;
        }

        const parentDirectory = path.dirname(entry);

        // remove parent directory
        let formattedFilePath = entry.replace(parentDirectory, '');

        // remove leading slash
        while(formattedFilePath.startsWith('/') || formattedFilePath.startsWith('\\')) {
            if(formattedFilePath.startsWith('/')) {
                formattedFilePath = formattedFilePath.slice(1);
            }
            if(formattedFilePath.startsWith('\\')) {
                formattedFilePath = formattedFilePath.slice(1);
            }
        }

        // Check if it's a directory
        if(fs.statSync(path.join(parentDirectory, formattedFilePath)).isDirectory()) {

            // Check if the directory has an index.md file
            if(fs.existsSync(path.join(parentDirectory, formattedFilePath, 'index.md'))) {
                return this.toMarkdownLink(formattedFilePath + '/index.md');
            }

            // No index.md file found, return the directory name
            return formattedFilePath;
        }

        // replace all extensions with .md
        formattedFilePath = ExtensionReplacer.replaceAllExtensions(formattedFilePath, 'md');

        // Ignore empty file names
        if(formattedFilePath === '.md') {
            return null;
        }

        if(this.config.markdownLink) {
            return this.toMarkdownLink(formattedFilePath);
        }

        return formattedFilePath;
    }

    private toMarkdownLink(entry: string): string {
        return `[${entry}](${entry})`;
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
