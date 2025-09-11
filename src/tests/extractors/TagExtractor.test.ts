import { TagExtractor } from "@/simple-docs-scraper/extractors/TagExtractor.js";
import { ExtractionResult } from "@/simple-docs-scraper/index.js";
import { beforeEach, describe, expect, test } from "@jest/globals";

describe("Tag Extractor", () => {
    const sampleText = 
`<docs>
    This is a test
</docs>`;
    const sampleSingleAttributeText = 
`<docs name="nameValue">
    This is a test
</docs>`;

    beforeEach(() => {
        // Setup code here
    });

    describe("methods", () => {
        test("should extract raw tags", () => {
            expect(TagExtractor.getRawTag("docs")).toBe("docs");
            expect(TagExtractor.getRawTag("<docs>")).toBe("docs");
            expect(TagExtractor.getRawTag("</docs>")).toBe("docs");
        })

        test("should get start tag pattern", () => {

            const regExp1 = new RegExp(TagExtractor.getStartTagPattern("docs"), 'gm');
            const result1 = "<docs>".match(regExp1);
            expect(result1?.[0]).toBe('<docs>');

            const regExp2 = new RegExp(TagExtractor.getStartTagPattern("docs"), 'gm');
            const result2 = '<docs name="nameValue">'.match(regExp2);
            expect(result2?.[0]).toBe('<docs name="nameValue">');

            const regExp3 = new RegExp(TagExtractor.getStartTagPattern("docs"), 'gm');
            const result3 = '<docs name="nameValue" other="otherValue" with_underscore="with_underscoreValue">'.match(regExp3);
            expect(result3?.[0]).toBe('<docs name="nameValue" other="otherValue" with_underscore="with_underscoreValue">');

        })

        test("should extract attributes", () => {
            const regExp1 = new RegExp(TagExtractor.getAttributesPattern(), 'g');
            const result1 = 'name="nameValue" other="otherValue" with_underscore="with_underscoreValue"'.match(regExp1);
            expect(result1?.[0]).toBe('name="nameValue" other="otherValue" with_underscore="with_underscoreValue"');
        })

        test("should get end tag pattern", () => {
            const regExp1 = new RegExp(TagExtractor.getEndTagPattern("docs"), 'gm');
            const result1 = "</docs>".match(regExp1);
            expect(result1?.[0]).toBe("</docs>");
        })

        test("should get inside tag pattern", () => {
            const text = "This is a test";
            const regExp1 = new RegExp(TagExtractor.getInsideTagPattern(), 'gm');
            const result1 = text.match(regExp1);
            expect(result1?.[0]).toBe("This is a test");

            const multiLineText = "<docs>This is a test\nThis is a test</docs>";
            const regExp2 = new RegExp(TagExtractor.getInsideTagPattern(), 'gm');
            const result2 = multiLineText.match(regExp2);
            expect(result2?.[0]).toBe("This is a test\nThis is a test");

            const multiLineTextWithAttributes = 
`This is the first line
This is the second line with symbols! . , 123-
This is the second line`;
            const regExp3 = new RegExp(TagExtractor.getInsideTagPattern(), 'gm');
            const result3 = multiLineTextWithAttributes.match(regExp3);
            expect(result3?.[0]).toContain("This is the first line\nThis is the second line with symbols! . , 123-");
            expect(result3?.[0]).toContain("This is the second line");
        })

        test("pattern behaviours should be as expected", () => {

            const startTag_REGEXP = new RegExp(TagExtractor.getStartTagPattern("docs"), 'gm');
            const StartTag_RESULT = sampleText.match(startTag_REGEXP);
            expect(StartTag_RESULT).toHaveLength(1);

            const endTagPattern = TagExtractor.getEndTagPattern("docs");
            const insideTagPattern = TagExtractor.getInsideTagPattern();
            // const fullPattern = `${startTagREGEXP}(${insideTagPattern})${endTagPattern}`;

            const regExp = TagExtractor.composeRegExp("docs");
            const matches = sampleText.match(regExp);

            expect(matches).toHaveLength(1);
            expect(matches?.[0]).toBe(sampleText);
        })
    })

    describe("extractUsingTags", () => {
        test("should extract the content between the start and end tags", () => {

            const result = TagExtractor.extractUsingTags({
                extractMethod: "tags",
                startTag: "docs",
                endTag: "docs",
            }, sampleText) as unknown as ExtractionResult;

            expect(result).not.toHaveProperty("errorMessage");
            expect(result.content).toHaveLength(1);
            expect(result.content[0]).toContain("This is a test");
            expect(result.content[0]).not.toContain("<docs>");
            expect(result.content[0]).not.toContain("</docs>");

        })
    });

    describe("attributes", () => {
        test("should extract attributes from tags", () => {

            const result = TagExtractor.extractUsingTags({
                extractMethod: "tags",
                startTag: "docs",
                endTag: "docs",
            }, sampleSingleAttributeText) as unknown as ExtractionResult;

            expect(result).not.toHaveProperty("errorMessage");
            expect(result.content).toHaveLength(1);
            expect(result.content[0]).toContain("This is a test");
            expect(result.content[0]).not.toContain("<docs>");
            expect(result.content[0]).not.toContain("</docs>");

            expect(result.attributes?.name).toBeDefined()
            expect(result.attributes?.name).toBe("nameValue")

        }) 
    })
});
