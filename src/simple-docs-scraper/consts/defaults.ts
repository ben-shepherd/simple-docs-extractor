import { IndexFileGeneratorConfig } from "../generators/IndexFileGenerator.js";
import { MarkdownIndexProcessorConfig } from "../processors/MarkdownIndexProcessor.js";
import { ExcerptExtractorConfig } from "../transformers/ExcerptExtractor.js";

type Defaults = {
    INDEX_FILE_GENERATOR: Partial<IndexFileGeneratorConfig>;
    MARKDOWN_INDEX_PROCESSOR: Pick<Partial<MarkdownIndexProcessorConfig>, "recursive">;
    EXCERPT_EXTRACTOR: ExcerptExtractorConfig;
}

export const DEFAULT_EXCERPT_CONFIG: ExcerptExtractorConfig = {
    firstSentenceOnly: true,
    addEllipsis: true,
    length: 75,
} as const;

export const DEFAULTS: Defaults = {
    INDEX_FILE_GENERATOR: {
        flatten: false,
        recursive: true,
        markdownLinks: true,
        filesHeading: undefined,
        directoryHeading: undefined,
        excerpt: DEFAULT_EXCERPT_CONFIG,
        plugins: [],
        lineCallback: undefined,
        fileNameCallback: undefined,
    },
    MARKDOWN_INDEX_PROCESSOR: {
        recursive: true,
    },
    EXCERPT_EXTRACTOR: DEFAULT_EXCERPT_CONFIG,
} as const 