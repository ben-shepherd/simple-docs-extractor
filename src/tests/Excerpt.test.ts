import { describe, expect, test } from "@jest/globals";
import { ExcerptExtractor } from "../simple-docs-scraper/transformers/ExcerptExtractor.js";

describe("excerpts", () => {
  const text = `## Heading 1
This is a readable English sentence for testing purposes. 

## Heading 2
It is intended to verify that the excerpt extraction logic works correctly.
The sentence should be long enough to provide a meaningful excerpt for the test.
By including multiple lines, we can ensure the extractor handles longer content.
This additional text helps simulate a more realistic documentation scenario.`;

  test("should produce excerpts", async () => {
    const excerpt1 = ExcerptExtractor.determineExcerpt(text, {
      length: 17,
      addEllipsis: true,
    });
    expect(excerpt1).toBe("This is a readabl...");

    const excerpt2 = ExcerptExtractor.determineExcerpt(text, {
      length: 5,
      addEllipsis: true,
    });
    expect(excerpt2).toBe("This...");

    const excerpt3 = ExcerptExtractor.determineExcerpt(text, {
      length: 100,
      firstSentenceOnly: false,
      addEllipsis: true,
    });
    expect(excerpt3).toBe(
      "This is a readable English sentence for testing purposes. It is intended to verify that the excerpt...",
    );
  });

  test("should ignore lines with symbols", async () => {
    const excerpt1 = ExcerptExtractor.determineExcerpt(text, {
      length: 17,
      addEllipsis: true,
    });
    expect(excerpt1).toBe("This is a readabl...");

    const excerpt2 = ExcerptExtractor.determineExcerpt(text, {
      length: 5,
      addEllipsis: true,
    });
    expect(excerpt2).toBe("This...");

    const excerpt3 = ExcerptExtractor.determineExcerpt(text, {
      length: 100,
      firstSentenceOnly: false,
      addEllipsis: true,
    });
    expect(excerpt3).toBe(
      "This is a readable English sentence for testing purposes. It is intended to verify that the excerpt...",
    );
  });

  test("should capture only the first sentence", async () => {
    const excerpt1 = ExcerptExtractor.determineExcerpt(text, {
      length: 100,
      firstSentenceOnly: true,
    });
    expect(excerpt1).toBe(
      "This is a readable English sentence for testing purposes.",
    );

    const excerpt2 = ExcerptExtractor.determineExcerpt(text, {
      length: 4,
      firstSentenceOnly: true,
      addEllipsis: true,
    });
    expect(excerpt2).toBe("This...");
    
  });

  test("should allow basic grammatical symbols in the first sentence", async () => {
    const text = 
`## Heading

Prevents multiple clicks on elements by adding a 'clicked' class after the first click.
Works in conjunction with confirm-click-controller to provide enhanced click protection.
## HTML Example
Basic usage of ClickOnceController for preventing multiple clicks`

    const excerpt1 = ExcerptExtractor.determineExcerpt(text, {
      length: 100,
      firstSentenceOnly: true,
    });
    expect(excerpt1).toBe(
      "Prevents multiple clicks on elements by adding a 'clicked' class after the first click.",
    );


    const text2 = 
`Automatically enhances links by adding appropriate icons for supported document types
and ensuring they open in new tabs.`
    
        const excerpt2 = ExcerptExtractor.determineExcerpt(text2, {
          length: 100,
          firstSentenceOnly: true,
          addEllipsis: true,
        });
        expect(excerpt2).toBe(
          "Automatically enhances links by adding appropriate icons for supported document types and ensuring...",
        );

      const text3 =
`Automatically scrolls the page to bring the controller's element into view when connected.
Provides smooth scrolling with configurable offset and behavior options.
@example
## HTML Example
Element that triggers automatic scrolling when connected`

    const excerpt3 = ExcerptExtractor.determineExcerpt(text3, {
      length: 100,
      firstSentenceOnly: true,
      addEllipsis: true,
    });
    expect(excerpt3).toBe("Automatically scrolls the page to bring the controller's element into view when connected...");
  });
});
