## ExcerptExtractor.ts





 Extracts and formats text excerpts from content with configurable length and formatting options.



 This utility class provides static methods for creating clean, readable excerpts from longer text content.

 It automatically removes markdown headings, handles word boundaries, adds ellipsis for truncated content,

 and ensures excerpts end with complete words and proper punctuation.



 @example

 ```typescript
 // Basic usage with default settings
 const content = `## Heading 1
 This is a readable English sentence for testing purposes.

 ## Heading 2
 It is intended to verify that the excerpt extraction works correctly.`;

 const excerpt = ExcerptExtractor.determineExcerpt(content);
 // Result: "This is a readable English sentence for testing purposes..."
 ```


 @example

 ```typescript
 // Custom length with ellipsis
 const excerpt = ExcerptExtractor.determineExcerpt(content, {
   length: 50,
   addEllipsis: true,
   firstSentenceOnly: true
 });
 // Result: "This is a readable English sentence for testing..."
 ```
 



---



## Methods



Not available.



---



Last updated: 2025-09-16T18:03:08.531Z



This file is auto generated. Do not edit manually.*



[Back to Index](./index.md)