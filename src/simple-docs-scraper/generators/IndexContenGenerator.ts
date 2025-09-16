import { DEFAULTS } from "@/simple-docs-scraper/consts/defaults.js";
import { DirectoryMarkdownScannerEntry } from "@/simple-docs-scraper/scanning/DirectoryMarkdownScanner.js";
import { ExcerptExtractor } from "@/simple-docs-scraper/utils/ExcerptExtractor.js";
import { createMarkdownLink } from "@/simple-docs-scraper/utils/createMarkdownLink.js";
import { listIndentPrefix } from "@/simple-docs-scraper/utils/listIndenterPrefix.js";
import fs from "fs";
import { IndexFileGeneratorConfig } from "./IndexFileGenerator.js";
    
export type State = {
    config: IndexFileGeneratorConfig,
    content: string,
    lineNumber: number,
    filesProcessed: number,
    filesTotalCount: number,
    dirsProcessed: number,
    dirsTotalCount: number,
    excerpt: string | undefined,
    indentLevel: number,
}

/**
 * <docs>
 * Generates markdown content for index files from processed directory entries.
 *
 * This class creates structured markdown content that lists files and directories
 * in a hierarchical format. It supports custom formatting through callbacks,
 * excerpt generation, and configurable headings for files and directories.
 * The content can be flattened to show all entries in a single list or maintain
 * the original directory structure.
 *
 * @example
 * ```typescript
 * const generator = new IndexContentGenerator({
 *   lineCallback: (name, line, excerpt) => `- ${name}`,
 *   directoryHeading: '# Directories',
 *   filesHeading: '# Files',
 *   flatten: false,
 *   markdownLink: true
 * });
 *
 * const content = generator.generate(processedEntries);
 * // Returns formatted markdown content
 * ```
 * </docs>
 */
export class IndexContentGenerator {

    /**
     * <method name="constructor">
     * Creates a new IndexContentGenerator instance.
     *
     * @param {IndexFileGeneratorConfig} config - Configuration for content generation
     * </method>
     */
    constructor(private config: IndexFileGeneratorConfig) { }

    /**
     * <method name="getDefaultState">
     * Creates a default state object for content generation.
     *
     * This method initializes the state with default values and calculates
     * the total counts of files and directories from the processed array.
     * It allows for partial overrides of both configuration and state properties.
     *
     * @param {DirectoryMarkdownScannerEntry[]} processedArray - Array of processed entries
     * @param {Partial<IndexContentGeneratorConfig>} [overwriteConfig] - Optional config overrides
     * @param {Partial<State>} [overwriteState] - Optional state overrides
     * @returns {State} Initialized state object
     * </method>
     */
    getDefaultState(
        processedArray: DirectoryMarkdownScannerEntry[],
        overwriteConfig?: Partial<IndexFileGeneratorConfig>,
        overwriteState?: Partial<State>
    ): State {
        return {
            config: {
                ...this.config,
                ...(overwriteConfig ?? {}),
            },
            content: "",
            lineNumber: 1,
            filesProcessed: 0,
            filesTotalCount: processedArray.filter(
                (proc) => proc.isDir === false,
            ).length,
            dirsProcessed: 0,
            dirsTotalCount: processedArray.filter(
                (proc) => proc.isDir === true,
            ).length,
            excerpt: undefined,
            indentLevel: 0,
            ...(overwriteState ?? {}),
        }
    }

    /**
     * <method name="generate">
     * Generates markdown content from processed directory entries.
     *
     * This method processes each entry in the array and generates formatted
     * markdown content. It handles both regular entries and flattened entries
     * based on the configuration.
     *
     * @param {DirectoryMarkdownScannerEntry[]} processedArray - Array of processed entries
     * @returns {string} Generated markdown content
     * </method>
     */
    generate(processedArray: DirectoryMarkdownScannerEntry[]): string {
        let state = this.getDefaultState(processedArray);

        for (const entry of processedArray) {
            state = this.generateEntry(state, entry);

            // Handle the flattened entries
            // We need to pass the state and the entry to the handleFlattenedEntries function
            // We should also pass the path to the entry name, this will be recursively updated as we go deeper to make sure the path is correct
            this.generateFlatEntriesRecursively(state, entry, entry.entryName);
        }

        return state.content;
    }

    /**
     * <method name="generateEntry">
     * Generates content for a single entry and updates the state.
     *
     * This method processes a single entry by creating excerpts, headings,
     * and formatted lines, then updates the processing counters.
     *
     * @param {State} state - Current generation state
     * @param {DirectoryMarkdownScannerEntry} entry - Entry to process
     * @returns {State} Updated state after processing the entry
     * </method>
     */
    generateEntry(state: State, entry: DirectoryMarkdownScannerEntry): State {
        state.excerpt = this.createExcerpt(state, entry);
        this.createFileHeading(state, entry);
        this.createDirectoryHeading(state, entry);
        this.createLine(state, entry);
        this.updateProcessedCount(state, entry);
        return state;
    }

    /**
     * <method name="generateFlatEntriesRecursively">
     * Recursively generates flattened entries for nested directory structures.
     *
     * This method processes nested entries when flattening is enabled,
     * creating a single-level list of all files and directories with
     * proper path information.
     *
     * @param {State} state - Current generation state
     * @param {DirectoryMarkdownScannerEntry} entry - Entry to process recursively
     * @param {string} currentEntryName - Current path to the entry
     * </method>
     */
    private generateFlatEntriesRecursively(state: State, entry: DirectoryMarkdownScannerEntry, currentEntryName: string) {
        if (false === this.config.flatten) {
            return;
        }

        // We will overwrite the config and state for the sub entries
        // - Remove the filesHeading and directoryHeading
        // - Increase the indent level
        const overwriteConfig: Partial<IndexFileGeneratorConfig> = {
            filesHeading: undefined,
            directoryHeading: undefined,
        };
        const overwriteState: Partial<State> = {
            indentLevel: state.indentLevel + 1,
        };

        // Generate the sub entries
        if (entry.entries) {
            let subState = this.getDefaultState(entry.entries, overwriteConfig, overwriteState);

            for (const subEntry of entry.entries) {
                
                // This line will append the current entry name to the sub entry name
                // making sure the path to the entry name is correct
                subEntry.pathToEntryName = this.appendEntryName(state, subEntry, currentEntryName);

                // Generate the sub entry recursively
                subState = this.generateEntry(subState, subEntry);
                this.generateFlatEntriesRecursively(subState, subEntry, subEntry.pathToEntryName);
            }

            // Add the sub state content to the state content
            state.content += subState.content;
        }
    }

    /**
     * <method name="appendEntryName">
     * Appends a sub-entry name to the current path.
     *
     * This method constructs the full path to a sub-entry by combining
     * the current path with the sub-entry name, handling trailing slashes.
     *
     * @param {DirectoryMarkdownScannerEntry} subEntry - The sub-entry to append
     * @param {string} pathToEntryName - Current path to append to
     * @returns {string} Updated path with sub-entry name
     * </method>
     */
    private appendEntryName(state: State, subEntry: DirectoryMarkdownScannerEntry, pathToEntryName: string) {
        pathToEntryName = pathToEntryName;

        if(pathToEntryName.endsWith("/")) {
            pathToEntryName = pathToEntryName.slice(0, -1);
        }
        pathToEntryName = pathToEntryName + "/" + subEntry.entryName;
        
        return pathToEntryName;
    }

    /**
     * <method name="updateProcessedCount">
     * Updates the processed count for files or directories.
     *
     * This method increments the appropriate counter based on whether
     * the entry is a file or directory.
     *
     * @param {State} state - Current generation state
     * @param {DirectoryMarkdownScannerEntry} entry - Entry to count
     * </method>
     */
    private updateProcessedCount(state: State, entry: DirectoryMarkdownScannerEntry) {
        if (entry.isDir) {
            state.dirsProcessed++;
        } else {
            state.filesProcessed++;
        }
    }

    /**
     * <method name="createFileHeading">
     * Creates a heading for files section if needed.
     *
     * This method adds a files heading to the content when processing
     * the first file and a files heading is configured.
     *
     * @param {State} state - Current generation state
     * @param {DirectoryMarkdownScannerEntry} entry - Current entry being processed
     * </method>
     */
    private createFileHeading(state: State, entry: DirectoryMarkdownScannerEntry) {
        if (entry.isDir) {
            return;
        }

        if (state.config.filesHeading && state.filesProcessed === 0 && state.filesTotalCount > 0) {
            state.content += this.config.filesHeading + "\n";
        }
    }

    /**
     * <method name="createDirectoryHeading">
     * Creates a heading for directories section if needed.
     *
     * This method adds a directory heading to the content when processing
     * the first directory and a directory heading is configured.
     *
     * @param {State} state - Current generation state
     * @param {DirectoryMarkdownScannerEntry} entry - Current entry being processed
     * </method>
     */
    private createDirectoryHeading(state: State, entry: DirectoryMarkdownScannerEntry) {
        if (false === entry.isDir) {
            return;
        }

        if (state.config.directoryHeading && state.dirsProcessed === 0 && state.dirsTotalCount > 0) {
            state.content += this.config.directoryHeading + "\n";
        }
    }

    /**
     * <method name="createLine">
     * Creates a formatted line for an entry.
     *
     * This method generates a formatted line for the entry, either using
     * a custom callback or creating a standard markdown list item with
     * optional excerpt and indentation.
     *
     * @param {State} state - Current generation state
     * @param {DirectoryMarkdownScannerEntry} entry - Entry to create line for
     * </method>
     */
    private createLine(state: State, entry: DirectoryMarkdownScannerEntry) {
        if (this.config.lineCallback) {
            state.content += this.config.lineCallback(entry.entryName, state.lineNumber, state.excerpt);
        } else {
            const path = this.buildDirectoryPath(entry, state);
            const indentPrefix = this.createIndenterPrefix(state);
            const markdownLink = createMarkdownLink(this.config.markdownLinks ?? false, entry.entryName, path, state.excerpt);
            
            let line = `${indentPrefix}- ${markdownLink}`;
            if (state.excerpt) {
                line += ` - ${state.excerpt}`;
            }
            state.content += `${line}\n`;
        }

        state.lineNumber++;
    }

    /**
     * <method name="buildDirectoryPath">
     * Builds the complete path for a directory entry when in recursive mode.
     *
     * This method constructs the full path to a directory's index file by
     * appending "/index.md" to the directory path when recursive mode is enabled.
     * It ensures the path ends with a slash before adding the index filename.
     *
     * @param {DirectoryMarkdownScannerEntry} entry - Entry to build path for
     * @param {State} state - Current generation state
     * @returns {string} Complete path to the entry
     * </method>
     */
    private buildDirectoryPath(entry: DirectoryMarkdownScannerEntry, state: State): string {
        let pathToEntryName = entry.pathToEntryName ?? entry.entryName;

        // If the entry is a directory and either recursive or isRootConfig is true, then we need to add the index.md to the path
        // This is because the root index file is a special case and we need to add the index.md to the path, as recursive will be false.
        if(entry.isDir && (state.config.recursive || state.config.isRootConfig)) {
            if(!pathToEntryName?.endsWith("/")) {
                pathToEntryName += "/";
            }

            pathToEntryName += "index.md";
        }

        return pathToEntryName;
    }

    /**
     * <method name="createIndenterPrefix">
     * Creates indentation prefix based on the current indent level.
     *
     * This method generates the appropriate number of spaces for indentation
     * based on the current indent level in the state.
     *
     * @param {State} state - Current generation state
     * @returns {string} Indentation prefix string
     * </method>
     */
    createIndenterPrefix(state: State) {
        return listIndentPrefix(state.indentLevel);
    }

    /**
     * <method name="createExcerpt">
     * Creates an excerpt for a file entry.
     *
     * This method generates an excerpt from file content if the entry is a file
     * and excerpt configuration is provided. It reads the file and extracts
     * the excerpt using the configured extractor.
     *
     * @param {State} state - Current generation state
     * @param {DirectoryMarkdownScannerEntry} entry - Entry to create excerpt for
     * @returns {string | undefined} Generated excerpt or undefined
     * </method>
     */
    private createExcerpt(
        state: State,
        entry: DirectoryMarkdownScannerEntry,
    ) {
        state.excerpt = undefined;

        if (false === entry.isDir && this.config.excerpt) {

            if(false === fs.existsSync(entry.src)) {
                throw new Error(`Expected file ${entry.src} to exist and be readable`);
            }

            const fileContents = fs.readFileSync(entry.src, "utf8");

            return ExcerptExtractor.determineExcerpt(
                fileContents,
                this.config?.excerpt ?? DEFAULTS.EXCERPT_EXTRACTOR,
            );
        }
        return state.excerpt;
    }
}
