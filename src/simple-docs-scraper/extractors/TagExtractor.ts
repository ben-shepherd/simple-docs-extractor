import { ErrorResult, ExtractedContent } from "../index.js";

export type TagExtractorConfig = {
    tag: string;
}

export class TagExtractor {
    constructor(private config: TagExtractorConfig) {}
    
    /**
     * Extracts documentation using start and end tags.
     *
     * @param str - The content of the file to extract from
     * @returns Extraction result with content between tags or error details
     *
     * For regex101 example:
     * @see https://regex101.com/r/UzcvAj/2
     */
    extractFromString(str: string): ExtractedContent[] | ErrorResult {

        const rawTag = this.getRawTag(this.config.tag);
        const regExp = this.composeRegExp(rawTag)
        const result = [...(str.matchAll(regExp) ?? [])]

        if(null === result) {
            return {
                errorMessage: "Content not found between tags",
                nonThrowing: true,
            };
        }

        return result.map(item => {
            const startTag = item[1]
            const content = item[2]
            const attributes = this.getAttributesOrUndefined(startTag)

            return {
                content,
                attributes,
            }
        }) as ExtractedContent[]
    }

    static applyTagSymbols(startTag: string, endTag: string): { startTag: string; endTag: string } {
        if(!startTag.startsWith("<")) {
            startTag = `<${startTag}`;
        }
        if(!startTag.endsWith(">")) {
            startTag = `${startTag}>`;
        }

        if(!endTag.startsWith("</")) {
            endTag = `</${endTag}`;
        }
        if(!endTag.endsWith(">")) {
            endTag = `${endTag}>`;
        }

        return {
            startTag, 
            endTag,
        };
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

    getStartTagPattern(tag: string) {
        return `(<${tag}[^\>]*?>)`
    }

    getAttributesPattern() {
        return '(?:([\\w_]+)="([^"]+)")'
    }

    getInsideTagPattern() {
        return '([.\\n\\s\\w\\W\\d]*?)'
    }

    getEndTagPattern(endTag: string) {
        return `(<\/${endTag}>)`;
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