import fs from "fs";
import { ErrorResult, ExtractedContent } from "../index.js";
import { BaseExtractorConfig, ExtractorPlugin } from "../types/extractor.t.js";

export type CopyContentsPluginConfig = BaseExtractorConfig & {
    fileToCopy: string[] | string;
    searchAndReplace: string;
};

/**
 * <docs>
 * Extracts content from the configured file to copy.
 * 
 * @param {CopyContentsPluginConfig} config - The configuration object containing the file to copy and the search and replace text
 * </docs>
 */
export class CopyContentsPlugin implements ExtractorPlugin<CopyContentsPluginConfig> {
    constructor(private config: CopyContentsPluginConfig) {}

    setConfig(config: CopyContentsPluginConfig): this {
        this.config = config;
        return this;
    }

    getConfig(): CopyContentsPluginConfig {
        return this.config;
    }

    /**
     * <method name="extractFromString">
     * Extracts content from the provided string using the configured file to copy.
     * 
     * @param {string} _str - The input string to extract content from
     * @returns {Promise<ExtractedContent[] | ErrorResult>} An array of extracted content objects or an error result
     * </method>
     */
     
    async extractFromString(): Promise<ExtractedContent[] | ErrorResult> {
        const fileToCopy = Array.isArray(this.config.fileToCopy) ? this.config.fileToCopy : [this.config.fileToCopy];
        const results: ExtractedContent[] = [];

        for (const file of fileToCopy) {
            if(!fs.existsSync(file)) {
                return {
                    errorMessage: `Unable to copy file contents. File \'${file}\' not found`,
                    throwable: true,
                };
            }
            const content = fs.readFileSync(file, 'utf8');
            
            results.push({
                content: content,
                attributes: {},
                searchAndReplace: this.config.searchAndReplace,
            });
        }
        return results;
    }
}
