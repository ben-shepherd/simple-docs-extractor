import { ErrorResult, ExtractedContent, ExtractionMethod, ExtractionResultLegacy } from "../index.js";
import { BaseExtractorConfig, ExtractorPlugin } from "../types/extractor.t.js";

export type TagExtractorPluginConfig = BaseExtractorConfig & {
    tag: string;
}

export class TagExtractorPlugin implements ExtractorPlugin<TagExtractorPluginConfig> {
    constructor(private config: TagExtractorPluginConfig) {
        if(config) {
            this.setConfig(config);
        }
    }

    setConfig(config: TagExtractorPluginConfig): this {
        this.config = config;
        return this
    }

    getConfig(): TagExtractorPluginConfig {
        return this.config;
    }

    /**
     * Extracts documentation using start and end tags.
     *
     * @param str - The content of the file to extract from
     * @returns Extraction result with content between tags or error details
     *
     * For regex101 example:
     * @see https://regex101.com/r/UzcvAj/2
     */
    async extractFromString(str: string): Promise<ExtractedContent[] | ErrorResult> {

        const rawTag = this.getRawTag(this.config.tag);
        const regExp = this.composeRegExp(rawTag)
        const result = [...(str.matchAll(regExp) ?? [])]

        if(Array.isArray(result) && result.length === 0) {
            return {
                errorMessage: "Content not found between tags",
                nonThrowing: true,
            };
        }

        return result.map((item) => {
            const startTag = item[1]
            const content = item[2]
            const attributes = this.getAttributesOrUndefined(startTag)

            return {
                content,
                attributes,
                searchAndReplace: this.config.searchAndReplace,
            }
        }) as ExtractedContent[]
    }

    /**
     * @deprecated Use extractFromString instead
     */
    async legacy(str: string, method: ExtractionMethod): Promise<ExtractionResultLegacy> {
        const result = await this.extractFromString(str)

        if("errorMessage" in result) {
            return result as unknown as ExtractionResultLegacy;
        }

        return {
            content: result.map(item => item.content),
            attributes: undefined,
            ...method,
        }
    }

    composeRegExp(rawTag: string): RegExp {
        return new RegExp(`${this.getStartTagPattern(rawTag)}${this.getInsideTagPattern()}${this.getEndTagPattern(rawTag)}`, "gm")
    }

    getAttributesOrUndefined(startTag: string): Record<string, string> | undefined {
        const attributesPattern = new RegExp(this.getAttributesPattern(), 'g')
        const attributes = [...startTag.matchAll(attributesPattern)]

        const result = attributes.reduce((acc, item) => {
            acc[item[1]] = item[2]
            return acc
        }, {})

        if(Object.keys(result).length === 0) {
            return undefined
        }

        return result
    }

    getStartTagPattern(rawTag: string) {
        return `(<${rawTag}[^\>]*?>)`
    }

    getAttributesPattern() {
        return '(?:([\\w_]+)="([^"]+)")'
    }

    getInsideTagPattern() {
        return '([.\\n\\s\\w\\W\\d]*?)'
    }

    getEndTagPattern(rawTag: string) {
        return `(<\/${rawTag}>)`;
    }

    getRawTag(startTag: string) {
        const removeNonCharactersPattern = /([^\w]+)/g
        const result = startTag.replace(removeNonCharactersPattern, '')
        
        if(typeof result !== "string" || (typeof result === "string" && result.length === 0)) {
            throw new Error("Invalid tag");
        }

        return result;
    }
}