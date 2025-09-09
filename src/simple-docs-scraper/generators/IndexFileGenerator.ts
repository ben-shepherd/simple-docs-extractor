import fs from 'fs';
import path from 'path';
import { ExtensionReplacer } from '../transformers/ExtensionReplacer.js';

// Configuration for generating index files from a list of file paths
export type IndexGeneratorConfig = {
    template?: string;
    outDir: string;
    baseDir?: string;
    fileNameAsLink?: boolean;
    searchAndReplace: string;
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
    constructor(private config: IndexGeneratorConfig) {
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
            const fileName = this.getFileName(filePath);

            if(this.config.lineCallback) {
                content += this.config.lineCallback(fileName, lineNumber);
            }
            else {
                content += `- ${fileName}\n`;
            }

            lineNumber++;
        }

        templateContent = templateContent.replace(this.config.searchAndReplace, content);

        fs.writeFileSync(outFilePath, templateContent);
    }

    private getTemplateContent(): string {
        if(!this.config.template) {
            return this.config.searchAndReplace;
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
     * @param filePath - The original file path to format
     * @returns Formatted file name, optionally as a markdown link
     */
    getFileName(filePath: string): string {
        if(this.config.fileNameCallback) {
            return this.config.fileNameCallback(filePath);
        }

        const parentDirectory = path.dirname(filePath);

        // remove parent directory
        let formattedFilePath = filePath.replace(parentDirectory, '');

        // remove leading slash
        while(formattedFilePath.startsWith('/') || formattedFilePath.startsWith('\\')) {
            if(formattedFilePath.startsWith('/')) {
                formattedFilePath = formattedFilePath.slice(1);
            }
            if(formattedFilePath.startsWith('\\')) {
                formattedFilePath = formattedFilePath.slice(1);
            }
        }

        // replace all extensions with .md
        formattedFilePath = ExtensionReplacer.replaceAllExtensions(formattedFilePath, 'md');

        if(this.config.fileNameAsLink) {
            return `[${formattedFilePath}](${formattedFilePath})`;
        }

        return formattedFilePath;
    }
}
