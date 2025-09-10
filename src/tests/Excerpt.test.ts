import { describe, expect, test } from "@jest/globals";
import { ExcerptExtractor } from '../simple-docs-scraper/transformers/ExcerptExtractor';

describe("excerpts", () => {
    const text =
    `## Heading 1
This is a readable English sentence for testing purposes. 

## Heading 2
It is intended to verify that the excerpt extraction logic works correctly.
The sentence should be long enough to provide a meaningful excerpt for the test.
By including multiple lines, we can ensure the extractor handles longer content.
This additional text helps simulate a more realistic documentation scenario.`

    test("should produce excerpts", async () => {

        const excerpt1 = ExcerptExtractor.determineExcerpt(text, { length: 17,
            addEllipsis: true
        })
        expect(excerpt1).toBe('This is a readabl...')

        const excerpt2 = ExcerptExtractor.determineExcerpt(text, { length: 5,
            addEllipsis: true
        })
        expect(excerpt2).toBe('This...')

        const excerpt3 = ExcerptExtractor.determineExcerpt(text, { 
            length: 100,
            firstSentenceOnly: false,
            addEllipsis: true
        })
        expect(excerpt3).toBe('This is a readable English sentence for testing purposes. It is intended to verify that the excerpt...')
    });

    test("should ignore lines with symbols", async () => {

        const excerpt1 = ExcerptExtractor.determineExcerpt(text, { 
            length: 17,
            addEllipsis: true
        })
        expect(excerpt1).toBe('This is a readabl...')

        const excerpt2 = ExcerptExtractor.determineExcerpt(text, { 
            length: 5,
            addEllipsis: true
        })
        expect(excerpt2).toBe('This...')

        const excerpt3 = ExcerptExtractor.determineExcerpt(text, {
            length: 100,
            firstSentenceOnly: false,
            addEllipsis: true
        })
        expect(excerpt3).toBe('This is a readable English sentence for testing purposes. It is intended to verify that the excerpt...')
    })

    test("should capture only the first sentence", async () => {

        const excerpt1 = ExcerptExtractor.determineExcerpt(text, {
            length: 100,
            firstSentenceOnly: true
        })
        expect(excerpt1).toBe('This is a readable English sentence for testing purposes.')

        const excerpt2 = ExcerptExtractor.determineExcerpt(text, {
            length: 4,
            firstSentenceOnly: true,
            addEllipsis: true
        })
        expect(excerpt2).toBe('This...')
        
        const excerpt3 = ExcerptExtractor.determineExcerpt(text, {
            length: 4,
            firstSentenceOnly: true,
            addEllipsis: false
        })
        expect(excerpt3).toBe('This.')
    })
})