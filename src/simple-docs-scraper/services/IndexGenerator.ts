import fs from 'fs';
import path from 'path';
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

        templateContent = templateContent.replace('%content%', content);

        const outFilePath = path.join(this.config.outDir, 'index.md');
        fs.writeFileSync(outFilePath, templateContent);
    }
    
    getFileName(filePath: string): string {
        if(this.config.fileNameCallback) {
            return this.config.fileNameCallback(filePath);
        }

        if(this.config.baseDir) {
            filePath = filePath.replace(this.config.baseDir, '');
        }

        return this.config.fileNameAsLink ? `[${filePath}](${filePath})` : filePath;
    }
}