import { IndexFileGeneratorConfig } from "../generators/IndexFileGenerator.js";
import { DEFAULT_EXCERPT_CONFIG } from "../transformers/ExcerptExtractor.js";

type Defaults = {
    INDEX_FILE_GENERATOR: Partial<IndexFileGeneratorConfig>;
}

export const DEFAULTS: Defaults = {
    INDEX_FILE_GENERATOR: {
        flatten: false,
        recursive: true,
        markdownLinks: true,
        filesHeading: undefined,
        directoryHeading: undefined,
        // TODO: Move default excerpts to this file
        excerpt: DEFAULT_EXCERPT_CONFIG,
        plugins: [],
        lineCallback: undefined,
        fileNameCallback: undefined,
    }
} as const 