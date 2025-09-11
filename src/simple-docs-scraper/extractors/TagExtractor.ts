import { ErrorResult, ExtractionResult, MethodTags } from "../index.js";
import { escapeRegExpString } from "../utils/escapeRegexString.js";

export class TagExtractor {
    /**
     * Extracts documentation using start and end tags.
     *
     * @param fileContent - The content of the file to extract from
     * @returns Extraction result with content between tags or error details
     *
     * For regex101 example:
     * @see https://regex101.com/r/UzcvAj/2
     */
    static extractUsingTags(
        method: MethodTags,
        fileContent: string,
    ): ExtractionResult | ErrorResult {
        // Check if the file contains the start and end tags
        if (
            !fileContent.includes(method.startTag) ||
            !fileContent.includes(method.endTag)
        ) {
            return {
                errorMessage: "Content not found between tags",
                nonThrowing: true,
            };
        }

        // Apply tag symbols to the start and end tags 
        // e.g. "docs" -> "<docs>" and "</docs>"
        const { startTag, endTag } = this.applyTagSymbols(method.startTag, method.endTag);
        const rawTag = this.getRawTag(method.startTag);

        /**
         * This regex matches any character, including whitespace, word characters, and non-word characters.
         * // Copyable: ([\s\w\W\d.]+)
         */
        const inBetweenTagsPattern = [
            "([", // start of group
            "\\s", // whitespace
            "\\w", // word characters
            "\\W", // non-word characters
            "\\d", // digits
            ".]+?)", // any character (dot), non-greedy, end of group
        ].join("");
        /**
         * g modifier: global. All matches (don't return after first match)
         * m modifier: multi line. Causes ^ and $ to match the begin/end of each line (not only begin/end of string)
         */
        const flags = "gm";

        // final regex to match the start and end tags and the content inside the tags
        const startTagPattern = escapeRegExpString(startTag);
        const endTagPattern = escapeRegExpString(endTag);
        const finalRegex = new RegExp(
            `${startTagPattern}(${inBetweenTagsPattern}*?)${endTagPattern}`,
            flags,
        );

        // match the final regex
        const matches = fileContent.match(finalRegex);

        // Remove the start and end tags from each match
        const matchesWithoutTags = matches?.map((match) =>
            match?.replace(startTag, "").replace(endTag, ""),
        );

        return {
            content: matchesWithoutTags ?? [],
            ...method,
        } as unknown as ExtractionResult;
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

    static composeRegExp(rawTag: string): RegExp {
        return new RegExp(`${this.getStartTagPattern(rawTag)}(${this.getInsideTagPattern()})${this.getEndTagPattern(rawTag)}`, "gm")
    }

    static getStartTagPattern(tag: string) {
        return `(<${tag}[^\>]*?>)`
    }

    /**
     * This regex matches any attribute name and value.
    *  Example: name="nameValue" other="otherValue" with_underscore="with_underscoreValue"
     */
    static getAttributesPattern() {
        return `((?:([\w_]+)="([^"]+)")\s?)+?`
    }

    static getInsideTagPattern() {
        return [
            "([", // start of group
            "\\s", // whitespace
            "\\w", // word characters
            "\\W", // non-word characters
            "\\d", // digits
            ".]+?)", // any character (dot), non-greedy, end of group
        ].join("");
    }

    static getEndTagPattern(endTag: string) {
        return `<\/${endTag}>`;
    }

    static getRawTag(startTag: string) {
        const removeNonCharactersPattern = /[^\w]/
        return startTag.replace(removeNonCharactersPattern, '')
    }
}