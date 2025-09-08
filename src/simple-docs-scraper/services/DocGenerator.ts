import fs from 'fs';
import path from 'path';


export type DocGeneratorConfig = {
    template: string;
    outDir: string;
    injectInto: string;
}

export class DocGenerator {
    constructor(private config: DocGeneratorConfig) {
    }

    generateContent(content: string, outFile: string): void {

        // Create the out directory if it doesn't exist
        if (!fs.existsSync(this.config.outDir)) {
            fs.mkdirSync(this.config.outDir, { recursive: true });
        }
        
        // Check if the template file exists
        if (!fs.existsSync(this.config.template)) {
            throw new Error('Template file not found');
        }

        const fileContent = fs.readFileSync(this.config.template, 'utf8');
        const injectedContent = fileContent.replace(this.config.injectInto, content);
        const outFilePath = path.join(this.config.outDir, outFile);
        
        fs.writeFileSync(outFilePath, injectedContent);
    }
}