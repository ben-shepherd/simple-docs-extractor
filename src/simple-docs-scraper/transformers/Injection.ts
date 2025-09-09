import fs from 'fs';
import path from 'path';

// Configuration for content injection operations
export type InjectionConfig = {
    template?: string;
    outDir: string;
    searchAndReplace: string;
}

// Result object for injection operations
export type InjectionResult = {
    sucess: boolean;
    content: string;
}

/**
 * <docs>
 * Handles content injection into templates and files.
 * 
 * This class provides functionality to inject content into templates by replacing
 * placeholder strings. It supports both string-based injection and file-based
 * injection with template file reading and output file writing.
 * 
 * @example
 * ```typescript
 * const injection = new Injection({
 *   template: './templates/doc.md',
 *   outDir: './docs',
 *   injectInto: '{{CONTENT}}'
 * });
 * 
 * // Inject into string
 * const result = injection.injectIntoString('Hello {{CONTENT}}', 'World');
 * // Returns 'Hello World'
 * 
 * // Inject into file
 * injection.injectIntoFile('Documentation content', 'output.md');
 * ```
 * </docs>
 */
export class Injection {
    constructor(private config: InjectionConfig) {
    }

    /**
     * Injects content into a string by replacing the configured placeholder.
     * 
     * @param content - The string content to inject into
     * @param replaceWith - The content to replace the placeholder with
     * @returns The string with injected content
     */
    injectIntoString(content: string, replaceWith: string): string {
        return content.replace(this.config.searchAndReplace, replaceWith);
    }
    
    /**
     * Injects content into a template file and writes the result to an output file.
     * 
     * @param replaceWith - The content to replace the placeholder with
     * @param outFile - The output file path to write the result to
     * @throws {Error} When the template file is not found
     */
    injectIntoFile(replaceWith: string, outFile: string): void {

        const fileContent = this.getTemplateContent();
        const injectedContent = fileContent.replace(this.config.searchAndReplace, replaceWith);
        const outFilePath = path.join(this.config.outDir, outFile);
        
        // Add the injected content to the file
        fs.writeFileSync(outFilePath, injectedContent);
    }

    protected getTemplateContent(): string {
        if (!this.config.template) {
            return this.config.searchAndReplace;
        }

        // Check if the template file exists
        if (!fs.existsSync(this.config.template)) {
            throw new Error('Template file not found');
        }

        return fs.readFileSync(this.config.template, 'utf8');
    }
    
}
