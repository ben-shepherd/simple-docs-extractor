import fs from 'fs';

export type InjectionConfig = {
    template: string;
    outFile: string;
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
    
    injectIntoFile(replaceWith: string): void {

        // Check if the template file exists
        if (!fs.existsSync(this.config.template)) {
            throw new Error('Template file not found');
        }

        const fileContent = fs.readFileSync(this.config.template, 'utf8');
        const injectedContent = fileContent.replace(this.config.injectInto, replaceWith);

        // Add the injected content to the file
        fs.writeFileSync(this.config.outFile, injectedContent);
    }
    
}