import fs from 'fs';
import path from 'path';
import { ExtensionReplacer } from './ExtensionReplacer.js';


export type DocGeneratorConfig = {
    template?: string;
    outDir: string;
    searchAndReplace: string;
}

/**
 * <docs>
 * Generates documentation files from content using a template.
 * 
 * This class takes content and generates markdown documentation files by injecting
 * the content into a template file. It handles file path creation, directory creation,
 * and extension replacement to ensure proper markdown output.
 * 
 * @example
 * ```typescript
 * const generator = new DocGenerator({
 *   template: './templates/doc.template.md',
 *   outDir: './docs',
 *   searchAndReplace: '{{CONTENT}}'
 * });
 * 
 * generator.generateContent('Some documentation content', 'example.js');
 * // Creates ./docs/example.md with content injected into template
 * ```
 * </docs>
 */
export class DocGenerator {
    constructor(private config: DocGeneratorConfig) {
    }

    /**
     * Generates a documentation file by injecting content into a template.
     * 
     * @param content - The documentation content to inject into the template
     * @param outFile - The original file path used to determine the output filename
     * @throws {Error} When the template file is not found
     */
    generateContent(content: string, outFile: string): void {

        const fileBaseName = path.basename(outFile);
        let outFilePath = path.join(this.config.outDir, fileBaseName);

        // Replace all extensions with .md
        outFilePath = ExtensionReplacer.replaceAllExtensions(outFilePath, 'md');

        // Create the out directory if it doesn't exist
        if (!fs.existsSync(this.config.outDir)) {
            fs.mkdirSync(this.config.outDir, { recursive: true });
        }
        
        fs.writeFileSync(outFilePath, this.generateContentString(content));
    }

    generateContentString(content: string): string {
        const fileContent = this.getTemplateContent();
        const injectedContent = fileContent.replace(this.config.searchAndReplace, content);
    
        return injectedContent;
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
