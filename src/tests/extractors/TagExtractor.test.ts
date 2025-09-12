import { TagExtractor } from "@/simple-docs-scraper/extractors/TagExtractor.js";
import { ErrorResult, ExtractedContent } from "@/simple-docs-scraper/index.js";
import { beforeEach, describe, expect, test } from "@jest/globals";

describe("Tag Extractor", () => {
    const sampleText = 
`<docs>This is a test</docs>`;

    const sampleTextMultiLine = 
`<docs>
This is a test
</docs>`;

    const sampleTextRealLifeComment = 
`/**
 * <docs>
 * MultiLineCommentClear formatter removes leading asterisks and whitespace from multi-line comments.
 *
 * This formatter is designed to clean up JSDoc-style multi-line comments by removing
 * the leading asterisks (*) and associated whitespace that are commonly used in
 * multi-line comment blocks. It preserves the actual content while removing the
 * formatting markers.
 *
 * Example:
 * \`\`\`typescript
 * const input = " * This is a comment line";
 * const output = MultiLineCommentClear(input);
 * console.log(output); // "This is a comment line"
 * \`\`\`
 *
 * @param {Object} config - Configuration object containing the content to format
 * @param {string} config.content - The text content to be formatted
 * @returns {string} The formatted content with asterisks and leading whitespace removed
 * </docs>
 */`;
    const sampleTextMultipleTags = 
`<docs>
This is the first block
</docs>
<docs>
This is the second block
</docs>`;
    const sampleTextWithAttributes = 
`<docs name="nameValue" other="otherValue">
This is the first block
</docs>`;
    const sampleTextWithAttributesMultipleTags = 
`<docs name="nameValue" other="otherValue">
This is the first block
</docs>
<docs>
This is the second block
</docs>`;

    let tagExtractor!: TagExtractor;

    beforeEach(() => {
        tagExtractor = new TagExtractor({
            tag: "docs",
        });
    });

    describe("methods", () => {
        test("should extract raw tags", () => {
            expect(tagExtractor.getRawTag("docs")).toBe("docs");
            expect(tagExtractor.getRawTag("<docs>")).toBe("docs");
            expect(tagExtractor.getRawTag("</docs>")).toBe("docs");
        })

        test("should get start tag pattern", () => {

            const regExp1 = new RegExp(tagExtractor.getStartTagPattern("docs"), 'gm');
            const result1 = "<docs>".match(regExp1);
            expect(result1?.[0]).toBe('<docs>');

            const regExp2 = new RegExp(tagExtractor.getStartTagPattern("docs"), 'gm');
            const result2 = '<docs name="nameValue">'.match(regExp2);
            expect(result2?.[0]).toBe('<docs name="nameValue">');

            const regExp3 = new RegExp(tagExtractor.getStartTagPattern("docs"), 'gm');
            const result3 = '<docs name="nameValue" other="otherValue" with_underscore="with_underscoreValue">'.match(regExp3);
            expect(result3?.[0]).toBe('<docs name="nameValue" other="otherValue" with_underscore="with_underscoreValue">');

        })

        test("should extract attributes", () => {
            const regExp1 = new RegExp(tagExtractor.getAttributesPattern(), 'g');
            const test = 'name="nameValue" other="otherValue" with_underscore="with_underscoreValue"';
            const result1 = [...test.matchAll(regExp1)];
            
            expect(result1).toBeDefined();
            expect(result1.length).toBe(3);
            expect(result1[0][0]).toBe('name="nameValue"');
            expect(result1[0][1]).toBe('name');
            expect(result1[0][2]).toBe('nameValue');
            expect(result1[1][0]).toBe('other="otherValue"');
            expect(result1[1][1]).toBe('other');
            expect(result1[1][2]).toBe('otherValue');
            expect(result1[2][0]).toBe('with_underscore="with_underscoreValue"');
            expect(result1[2][1]).toBe('with_underscore');
            expect(result1[2][2]).toBe('with_underscoreValue');
        })

        test("should get end tag pattern", () => {
            const regExp1 = new RegExp(tagExtractor.getEndTagPattern("docs"), 'gm');
            const result1 = "</docs>".match(regExp1);
            expect(result1?.[0]).toBe("</docs>");
        })

        test("should get inside tag pattern", () => {
            const text = "This is a test";
            const regExp1 = new RegExp(tagExtractor.getInsideTagPattern(), 'gm');
            const result1 = regExp1.exec(text)
            expect(result1?.input).toBe("This is a test");

            const multiLineText = "This is a test\nThis the second test";
            const regExp2 = new RegExp(tagExtractor.getInsideTagPattern(), 'gm');
            const result2 = regExp2.exec(multiLineText)
            expect(result2?.input).toBe("This is a test\nThis the second test");

            const multiLineTextWithAttributes = 
`This is the first line
This is the second line with symbols! . , 123-
This is the third line`;
            const regExp3 = new RegExp(tagExtractor.getInsideTagPattern(), 'gm');
            const result3 = regExp3.exec(multiLineTextWithAttributes)
            expect(result3?.input).toContain("This is the first line\nThis is the second line with symbols! . , 123-\nThis is the third line");
        })

        test("composeRegExp should behave as expected on sampleText", () => {
            const regExp = tagExtractor.composeRegExp("docs");
            const matches = regExp.exec(sampleText)
            expect(matches).toHaveLength(4)
            expect(matches?.[0]).toBe('<docs>This is a test</docs>')
            expect(matches?.[1]).toBe('<docs>')
            expect(matches?.[2]).toBe('This is a test')
            expect(matches?.[3]).toBe('</docs>')
        })

        test("composeRegExp should behave as expected on sampleTextMultiLine", () => {
            const regExp = tagExtractor.composeRegExp("docs");
            const matches = regExp.exec(sampleTextMultiLine)
            expect(matches).toHaveLength(4)
            expect(matches?.[0]).toBe('<docs>\nThis is a test\n</docs>')
            expect(matches?.[1]).toBe('<docs>')
            expect(matches?.[2]).toBe('\nThis is a test\n')
            expect(matches?.[3]).toBe('</docs>')
        })

        test("composeRegExp should behave as expected on sampleTextRealLifeComment", () => {
            const regExp = tagExtractor.composeRegExp("docs");
            const matches = regExp.exec(sampleTextRealLifeComment)

            expect(matches?.[1]).toBe('<docs>')
            expect(matches?.[2]).toContain('MultiLineCommentClear formatter removes')
            expect(matches?.[2]).not.toContain('<docs>')
            expect(matches?.[2]).not.toContain('</docs>')
            expect(matches?.[3]).toBe('</docs>')
        })
    })

    describe("main extractUsingTags logic", () => {
        test("should extract content from main method as expected from sampleText", () => {
            const result = tagExtractor.extractFromString(sampleText) as unknown as ExtractedContent[];

            expect(result).not.toHaveProperty("errorMessage");
            expect(result.length).toBe(1);
            expect(result[0].content).toContain("This is a test");
            expect(result[0].content).not.toContain("<docs>");
            expect(result[0].content).not.toContain("</docs>");

        })

        test("should extract content from main method as expected from sampleTextRealLifeComment", () => {

            const result = tagExtractor.extractFromString(sampleTextRealLifeComment) as unknown as ExtractedContent[];

            expect(result).not.toHaveProperty("errorMessage");
            expect(result.length).toBe(1);
            expect(result[0].content).toContain("MultiLineCommentClear formatter removes leading asterisks and whitespace from multi-line comments");
            expect(result[0].content).toContain("This formatter is designed to clean up JSDoc-style multi-line comments by removing");
            expect(result[0].content).toContain("@param {Object} config - Configuration object containing the content to format");
            expect(result[0].content).not.toContain("<docs>");
            expect(result[0].content).not.toContain("</docs>");

        })

        test("should be able to extract multiple tag contents from a single string", () => {

            const result = tagExtractor.extractFromString(sampleTextMultipleTags) as unknown as ExtractedContent[];

            expect(result).not.toHaveProperty("errorMessage");
            expect(result.length).toBe(2);

            expect(result[0].content).toContain("This is the first block");
            expect(result[0].content).not.toContain("This is the second block");
            expect(result[0].content).not.toContain("<docs>");
            expect(result[0].content).not.toContain("</docs>");

            expect(result[1].content).toContain("This is the second block");
            expect(result[1].content).not.toContain("This is the first block");
            expect(result[1].content).not.toContain("<docs>");
            expect(result[1].content).not.toContain("</docs>");

        })

        test("should be able to extract attributes from tags", () => {

            const result = tagExtractor.extractFromString(sampleTextWithAttributes) as unknown as ExtractedContent[];

            expect(result).not.toHaveProperty("errorMessage");
            expect(result.length).toBe(1);
            
            expect(result[0].content).toContain("This is the first block");
            expect(result[0].content).not.toContain("<docs>");
            expect(result[0].content).not.toContain("</docs>");

            expect(result[0].attributes?.name).toBe("nameValue");
            expect(result[0].attributes?.other).toBe("otherValue");
        })

        test("should be able to extract multiple tags, both with and without attributes", () => {

            const result = tagExtractor.extractFromString(sampleTextWithAttributesMultipleTags) as unknown as ExtractedContent[];

            expect(result).not.toHaveProperty("errorMessage");
            expect(result.length).toBe(2);
            
            expect(result[0].content).toContain("This is the first block");
            expect(result[0].content).not.toContain("<docs>");
            expect(result[0].content).not.toContain("</docs>");
            expect(result[0].attributes?.name).toBe("nameValue");
            expect(result[0].attributes?.other).toBe("otherValue");

            expect(result[1].content).toContain("This is the second block");
            expect(result[1].content).not.toContain("<docs>");
            expect(result[1].content).not.toContain("</docs>");
            expect(result[1].attributes).toBeUndefined();
        })
    });

    describe("pre DocumentContentExtractor refactor", () => {
        test("should convert ExtractedContent[] to ExtractionResultLegacy", () => {
            const result = tagExtractor.extractFromString(sampleText) as unknown as ExtractedContent[] | ErrorResult
            const legacyResult = tagExtractor.legacy(sampleText, {
                extractMethod: "tags",
                startTag: "<docs>",
                endTag: "</docs>",
                searchAndReplace: "%content%",
            });

            expect(result).not.toHaveProperty("errorMessage");
            expect(legacyResult.content.length).toBe(1);
            expect(legacyResult.content[0]).toBe("This is a test");
            expect(legacyResult.attributes).toBeUndefined();
        })

        test("should convert ErrorResult to ExtractionResultLegacy", () => {
            const legacyResult = tagExtractor.legacy('text with no tags should return an error', {
                extractMethod: "tags",
                startTag: "<docs>",
                endTag: "</docs>",
                searchAndReplace: "%content%",
            });

            expect(legacyResult).toHaveProperty("errorMessage");
            expect((legacyResult as unknown as ErrorResult).errorMessage).toBe("Content not found between tags");
        })
    })
});
