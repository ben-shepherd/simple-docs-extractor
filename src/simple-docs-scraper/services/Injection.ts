import fs from 'fs';
import path from 'path';

export type InjectionConfig = {
    template: string;
    outDir: string;
    injectInto: string;
}

export type InjectionResult = {
    sucess: boolean;
    content: string;
}

export class Injection {
    constructor(private config: InjectionConfig) {
    }

    injectIntoString(content: string, replaceWith: string): string {
        return content.replace(this.config.injectInto, replaceWith);
    }
    
    injectIntoFile(replaceWith: string, outFile: string): void {

        // Check if the template file exists
        if (!fs.existsSync(this.config.template)) {
            throw new Error('Template file not found');
        }

        const fileContent = fs.readFileSync(this.config.template, 'utf8');
        const injectedContent = fileContent.replace(this.config.injectInto, replaceWith);
        const outFilePath = path.join(this.config.outDir, outFile);
        
        // Add the injected content to the file
        fs.writeFileSync(outFilePath, injectedContent);
    }
    
}