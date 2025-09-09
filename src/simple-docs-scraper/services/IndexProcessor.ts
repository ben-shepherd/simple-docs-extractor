import fs from 'fs';
import path from 'path';
import { IndexFileGenerator } from '../generators/IndexFileGenerator.js';

export type IndexProcessorConfig = {
    baseDir: string;
    template?: string;
    searchAndReplace?: string;
}

/**
 * <docs>
 * Processes directories recursively to generate index files for documentation.
 * 
 * This class traverses directory structures and creates index files (typically index.md)
 * that list all markdown files found in each directory. It supports custom templates
 * and search-and-replace patterns for flexible index file generation.
 * 
 * @example
 * ```typescript
 * const processor = new IndexProcessor({
 *   baseDir: './docs',
 *   template: './templates/index.template.md',
 *   searchAndReplace: '{{CONTENT}}'
 * });
 * 
 * await processor.handle();
 * // Creates index.md files in all subdirectories of ./docs
 * ```
 * </docs>
 */
export class IndexProcessor {
    constructor(private config: IndexProcessorConfig) {}

    /**
     * Starts the index file generation process for the configured base directory.
     */
    async handle() {
        await this.handleDirectoryRecusrively(this.config.baseDir);
    }

    /**
     * Recursively processes a directory and all its subdirectories to create index files.
     * 
     * @param directory - The directory path to process
     */
    async handleDirectoryRecusrively(directory: string) {
        const entries = fs.readdirSync(directory);
        const absoluteEntries = entries.map(entry => path.join(directory, entry));
        
        const files = absoluteEntries.filter(file => file.endsWith('.md'));
        const directories = absoluteEntries.filter(file => fs.statSync(file).isDirectory());

        await this.handleSaveIndexFile(directory, files);

        for(const directory of directories) {
            await this.handleDirectoryRecusrively(directory);
        }
    }

    /**
     * Creates an index file for the specified directory containing the provided files.
     * 
     * @param outDir - The output directory where the index file should be created
     * @param files - Array of markdown file paths to include in the index
     */
    async handleSaveIndexFile(outDir: string, files: string[]) {
        const indexGenerator = new IndexFileGenerator({
            template: this.config.template,
            outDir: outDir,
            searchAndReplace: this.getSearchAndReplace(),
        });
        indexGenerator.generateContent(files);
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