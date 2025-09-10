import fs from 'fs';
import path from 'path';
import { IndexStructurePreProcessorEntry } from '../processors/IndexStructurePreProcessor.js';

// Configuration for generating index files from a list of file paths
export type IndexFileGeneratorConfig = {
    outDir: string;
    searchAndReplace?: string;
    template?: string;
    baseDir?: string;
    markdownLink?: boolean;
    filesHeading?: string;
    directoryHeading?: string;
    lineCallback?: (fileNameEntry: string, lineNumber: number) => string;
    fileNameCallback?: (filePath: string) => string;
}

export class IndexFileGenerator {
    constructor(private config: IndexFileGeneratorConfig) {
    }

    saveIndexFile(processedArray: IndexStructurePreProcessorEntry[]) {

        // Check if the out directory exists
        if (!fs.existsSync(this.config.outDir)) {
            fs.mkdirSync(this.config.outDir, { recursive: true });
        }

        let templateContent = this.getTemplateContent();
        let content = ''
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

            // We should only consider creating a file heading once we have reached the files
            if(false === current.isDir) {
                content = this.createFileHeading(filesProcessed, filesTotalCount, content)
            }

            // We should only consider creating a directory heading once all files have been rendered
            if(filesProcessed === filesTotalCount) {
                content = this.createDirectoryHeading(dirsProcessed, dirsTotalCount, content)
            }

            if(this.config.lineCallback) {
                content += this.config.lineCallback(entryName, lineNumber);
            }
            else {
                content += `- ${markdownLink ?? entryName}\n`;
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
