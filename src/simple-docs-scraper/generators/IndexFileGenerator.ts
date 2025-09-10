import fs from 'fs';
import path from 'path';
import { IndexedDirectoryProcessedEntry } from '../processors/IndexDirectoryProcessor.js';

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

export class IndexFileGenerator {
    constructor(private config: IndexFileGeneratorConfig) {
    }

    saveIndexFile(processedArray: IndexedDirectoryProcessedEntry[]) {

        // Check if the out directory exists
        if (!fs.existsSync(this.config.outDir)) {
            fs.mkdirSync(this.config.outDir, { recursive: true });
        }

        let templateContent = this.getTemplateContent();
        let content = ''
        let lineNumber = 1;
        const outFilePath = path.join(this.config.outDir, 'index.md');

        for(const processed of processedArray) {
            const {
                entryName,
                markdownLink
            } = processed

            if(this.config.lineCallback) {
                content += this.config.lineCallback(entryName, lineNumber);
            }
            else {
                content += `- ${markdownLink ?? entryName}\n`;
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
