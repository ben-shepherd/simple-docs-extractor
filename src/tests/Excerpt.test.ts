import { describe, expect, test } from "@jest/globals";
import { ExcerptExtractor } from '../simple-docs-scraper/transformers/ExcerptExtractor';

describe("excerpts", () => {
    test("should produce excerpts", async () => {

        const sourceCode =
            `This is a readable English sentence for testing purposes. 

It is intended to verify that the excerpt extraction logic works correctly.
The sentence should be long enough to provide a meaningful excerpt for the test.
By including multiple lines, we can ensure the extractor handles longer content.
This additional text helps simulate a more realistic documentation scenario.`


        const excerpt1 = ExcerptExtractor.determineExcerpt(sourceCode, 17)
        expect(excerpt1).toBe('This is a readabl...')

        const excerpt2 = ExcerptExtractor.determineExcerpt(sourceCode, 5)
        expect(excerpt2).toBe('This...')

        const excerpt3 = ExcerptExtractor.determineExcerpt(sourceCode, 100)
        // 99 characters (the space to be removed, plus ellipsis)
        expect(excerpt3).toBe('This is a readable English sentence for testing purposes. It is intended to verify that the excerpt...')
    });

    test("should ignore lines with symbols", async () => {

        const sourceCode =
            `## Heading 1
This is a readable English sentence for testing purposes. 

## Heading 2
It is intended to verify that the excerpt extraction logic works correctly.
The sentence should be long enough to provide a meaningful excerpt for the test.
By including multiple lines, we can ensure the extractor handles longer content.
This additional text helps simulate a more realistic documentation scenario.`

        const excerpt1 = ExcerptExtractor.determineExcerpt(sourceCode, 17)
        expect(excerpt1).toBe('This is a readabl...')

        const excerpt2 = ExcerptExtractor.determineExcerpt(sourceCode, 5)
        expect(excerpt2).toBe('This...')

        const excerpt3 = ExcerptExtractor.determineExcerpt(sourceCode, 100)
        // 99 characters (the space to be removed, plus ellipsis)
        expect(excerpt3).toBe('This is a readable English sentence for testing purposes. It is intended to verify that the excerpt...')
    })
})