import { IndexFileGeneratorConfig } from "@/simple-docs-scraper/generators/IndexFileGenerator.js";
import { MarkdownIndexProcessorConfig } from "@/simple-docs-scraper/processors/MarkdownIndexProcessor.js";
import { ExcerptExtractorConfig } from "@/simple-docs-scraper/utils/ExcerptExtractor.js";

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

/**
 * <docs>
 * Default configuration values for core components of the documentation generator.
 *
 * This module provides default settings for the index file generator,
 * markdown index processor, and excerpt extractor. These defaults ensure
 * consistent behavior across the documentation extraction and generation
 * process, while allowing for customization as needed.
 *
 * @example
 * import { DEFAULTS } from "./consts/defaults";
 * const config = {
 *   ...DEFAULTS.INDEX_FILE_GENERATOR,
 *   filesHeading: "Files",
 * };
 *
 * @typedef {Object} Defaults
 * @property {Partial<IndexFileGeneratorConfig>} INDEX_FILE_GENERATOR - Default config for index file generation
 * @property {Pick<Partial<MarkdownIndexProcessorConfig>, "recursive">} MARKDOWN_INDEX_PROCESSOR - Default config for markdown index processing
 * @property {ExcerptExtractorConfig} EXCERPT_EXTRACTOR - Default config for excerpt extraction
 * </docs>
 */

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