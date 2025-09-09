import fs from 'fs';
import path from 'path';
import { ExtensionReplacer } from './ExtensionReplacer.js';
export type IndexGeneratorConfig = {
    template: string;
    outDir: string;
    baseDir?: string;
    fileNameAsLink?: boolean;
    lineCallback?: (fileNameEntry: string, lineNumber: number) => string;
    fileNameCallback?: (filePath: string) => string;
}

export class IndexGenerator {
    constructor(private config: IndexGeneratorConfig) {
    }

    generateContent(filePaths: string[]): void {
        
        // Check if the out directory exists
        if (!fs.existsSync(this.config.outDir)) {
            fs.mkdirSync(this.config.outDir, { recursive: true });
        }

        // Check if the template file exists
        if (!fs.existsSync(this.config.template)) {
            throw new Error('Template file not found');
        }

        let templateContent = fs.readFileSync(this.config.template, 'utf8');
        let content = ''
        let lineNumber = 1;
        const outFilePath = path.join(this.config.outDir, 'index.md');

        for(const filePath of filePaths) {
            const fileName = this.getFileName(filePath, outFilePath);

            if(this.config.lineCallback) {
                content += this.config.lineCallback(fileName, lineNumber);
            }
            else {
                content += `- ${fileName}\n`;
            }

            lineNumber++;
        }

        templateContent = templateContent.replace('%content%', content);

        fs.writeFileSync(outFilePath, templateContent);
    }
    
    getFileName(filePath: string, outFilePath: string): string {
        if(this.config.fileNameCallback) {
            return this.config.fileNameCallback(filePath);
        }

        const parentDirectory = path.dirname(filePath);

        // remove parent directory
        let formattedFilePath = filePath.replace(parentDirectory, '');

        // remove leading slash
        formattedFilePath = formattedFilePath.replace(/^\//, '');

        // replace all extensions with .md
        formattedFilePath = ExtensionReplacer.replaceAllExtensions(formattedFilePath, 'md');

        if(this.config.fileNameAsLink) {
            return `[${formattedFilePath}](${formattedFilePath})`;
        }

        return formattedFilePath;
    }
}
