## RemoveMultiLineCommentAsterisks.ts





 MultiLineCommentClear formatter removes leading asterisks and whitespace from multi-line comments.



 This formatter is designed to clean up JSDoc-style multi-line comments by removing

 the leading asterisks (*) and associated whitespace that are commonly used in

 multi-line comment blocks. It preserves the actual content while removing the

 formatting markers.



 Example:

 ```typescript
 const input = " * This is a comment line";
 const output = MultiLineCommentClear(input);
 console.log(output); // "This is a comment line"
 ```


 @param {Object} config - Configuration object containing the content to format

 @param {string} config.content - The text content to be formatted

 @returns {string} The formatted content with asterisks and leading whitespace removed

 



---



## Methods



Not available.



---



Last updated: 2025-09-14T20:26:24.362Z



This file is auto generated. Do not edit manually.*



[Back to Index](./index.md)