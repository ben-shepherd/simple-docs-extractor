import fs from "fs";
import { DEFAULT_EXCERPT_CONFIG, ExcerptExtractor, ExcerptExtractorConfig } from "../index.js";
import { IndexStructurePreProcessorEntry } from "../processors/IndexStructurePreProcessor.js";
import { FileNameCallback, LineCallback } from "../types/index.js";
import { createMarkdownLink } from "../utils/createMarkdownLink.js";

export type IndexContentGeneratorConfig = {
    lineCallback: LineCallback | undefined,
    fileNameCallback: FileNameCallback | undefined,
    directoryHeading: string | undefined,
    filesHeading: string | undefined,
    flatten: boolean,
    markdownLink: boolean,
    excerpt?: ExcerptExtractorConfig,
}

export type State = {
    config: IndexContentGeneratorConfig,
    content: string,
    lineNumber: number,
    filesProcessed: number,
    filesTotalCount: number,
    dirsProcessed: number,
    dirsTotalCount: number,
    excerpt: string | undefined,
    indentLevel: number,
}

export class IndexContentGenerator {

    constructor(private config: IndexContentGeneratorConfig) { }

    getDefaultState(
        processedArray: IndexStructurePreProcessorEntry[],
        overwriteConfig?: Partial<IndexContentGeneratorConfig>,
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

    handle(processedArray: IndexStructurePreProcessorEntry[]): string {
        let state = this.getDefaultState(processedArray);

        for (const entry of processedArray) {
            state = this.handleEntry(state, entry);
            this.handleFlattenedEntries(state, entry, entry.entryName);
        }

        return state.content;
    }

    handleEntry(state: State, entry: IndexStructurePreProcessorEntry): State {
        state.excerpt = this.createExcerpt(state, entry);
        this.createFileHeading(state, entry);
        this.createDirectoryHeading(state, entry);
        this.createLine(state, entry);
        this.updateProcessedCount(state, entry);
        return state;
    }

    private handleFlattenedEntries(state: State, entry: IndexStructurePreProcessorEntry, pathToEntryName: string) {
        if (false === this.config.flatten) {
            return;
        }

        const overwriteConfig: Partial<IndexContentGeneratorConfig> = {
            filesHeading: undefined,
            directoryHeading: undefined,
        };
        const overwriteState: Partial<State> = {
            indentLevel: state.indentLevel + 1,
        };

        if (entry.entries) {
            let subState = this.getDefaultState(entry.entries, overwriteConfig, overwriteState);

            for (const subEntry of entry.entries) {
                // Add the parent entry name to the sub entry name
                subEntry.pathToEntryName = this.buildPathToEntryName(subEntry, pathToEntryName);

                // Handle the sub entries recursively
                subState = this.handleEntry(subState, subEntry);
                this.handleFlattenedEntries(subState, subEntry, subEntry.pathToEntryName);
            }

            state.content += subState.content;
        }
    }


    private buildPathToEntryName(subEntry: IndexStructurePreProcessorEntry, pathToEntryName: string) {
        pathToEntryName = pathToEntryName;

        if(pathToEntryName.endsWith("/")) {
            pathToEntryName = pathToEntryName.slice(0, -1);
        }
        pathToEntryName = pathToEntryName + "/" + subEntry.entryName;
        return pathToEntryName;
    }

    private updateProcessedCount(state: State, entry: IndexStructurePreProcessorEntry) {
        if (entry.isDir) {
            state.dirsProcessed++;
        } else {
            state.filesProcessed++;
        }
    }

    private createFileHeading(state: State, entry: IndexStructurePreProcessorEntry) {
        if (entry.isDir) {
            return;
        }

        if (state.config.filesHeading && state.filesProcessed === 0 && state.filesTotalCount > 0) {
            state.content += this.config.filesHeading + "\n";
        }
    }

    private createDirectoryHeading(state: State, entry: IndexStructurePreProcessorEntry) {
        if (false === entry.isDir) {
            return;
        }

        if (state.config.directoryHeading && state.dirsProcessed === 0 && state.dirsTotalCount > 0) {
            state.content += this.config.directoryHeading + "\n";
        }
    }

    private createLine(state: State, entry: IndexStructurePreProcessorEntry) {
        if (this.config.lineCallback) {
            state.content += this.config.lineCallback(entry.entryName, state.lineNumber, state.excerpt);
        } else {
            const indentPrefix = this.createIndenterPrefix(state);
            const markdownLink = createMarkdownLink(this.config.markdownLink, entry.entryName, entry.pathToEntryName ?? entry.entryName, state.excerpt);
            
            let line = `${indentPrefix}- ${markdownLink}`;
            if (state.excerpt) {
                line += ` - ${state.excerpt}`;
            }
            state.content += `${line}\n`;
        }

        state.lineNumber++;
    }

    createIndenterPrefix(state: State) {
        if (state.indentLevel === 0) {
            return "";
        }

        return " ".repeat(state.indentLevel * 2);
    }

    private createExcerpt(
        state: State,
        entry: IndexStructurePreProcessorEntry,
    ) {
        state.excerpt = undefined;

        if (false === entry.isDir && this.config.excerpt) {

            if(false === fs.existsSync(entry.src)) {
                throw new Error(`Expected file ${entry.src} to exist and be readable`);
            }

            const fileContents = fs.readFileSync(entry.src, "utf8");

            return ExcerptExtractor.determineExcerpt(
                fileContents,
                this.config?.excerpt ?? DEFAULT_EXCERPT_CONFIG,
            );
        }
        return state.excerpt;
    }
}
