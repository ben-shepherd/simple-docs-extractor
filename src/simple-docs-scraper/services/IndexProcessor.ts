import { IndexFileGenerator, IndexFileGeneratorConfig } from '../generators/IndexFileGenerator.js';
import { IndexStructurePreProcessor, IndexStructurePreProcessorEntry } from '../processors/IndexStructurePreProcessor.js';

export type IndexProcessorConfig = Omit<IndexFileGeneratorConfig, 'outDir'>

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
    constructor(private config: IndexProcessorConfig = {}) {}

    /**
     * Starts the index file generation process for the configured base directory.
     */
    async handle(baseDir: string) {
        await this.handleDirectoryRecusrively(baseDir);
    }

    /**
     * Recursively processes a directory and all its subdirectories to create index files.
     * 
     * @param directory - The directory path to process
     */
    async handleDirectoryRecusrively(directory: string) {
        // Process files and folders
        let processedEntries = await new IndexStructurePreProcessor({
            markdownLink: this.config?.markdownLink
        })
        .process(directory)

        // Sort by files then folders
        processedEntries = this.sortWithFilesAppearingFirst(processedEntries)
    
        // Handle directories recursively
        const directoryEntries = processedEntries.filter(entry => entry.isDir)
        for(const dirEntry of directoryEntries) {
            await this.handleDirectoryRecusrively(dirEntry.src)
        }

        // Re-process entries
        processedEntries = await new IndexStructurePreProcessor({
            markdownLink: this.config?.markdownLink
        })
        .process(directory)

        // Save the index.md file
        await new IndexFileGenerator({
            ...(this.config ?? {}),
            outDir: directory,
        })
        .saveIndexFile(processedEntries)
    }

    sortWithFilesAppearingFirst(processedEntries: IndexStructurePreProcessorEntry[]): IndexStructurePreProcessorEntry[] {
        return processedEntries.sort((a, b) => {
            const aint = a.isDir === true ? 1 : 0
            const bint = b.isDir === true ? 1 : 0
            return Math.sign(aint - bint)
        })
    }
}