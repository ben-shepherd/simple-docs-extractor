## AddDoubleLinesFormatter.ts





 DoubleLinesFormatter inserts an extra blank line between each line of the input content.



 This formatter is useful for increasing the vertical spacing in generated documentation

 or text files, making the output more readable or visually distinct.



 Example:

 ```typescript
 const input = "Line 1\nLine 2\nLine 3";
 const output = DoubleLinesFormatter({ content: input });
 // output:
 // Line 1
 //
 // Line 2
 //
 // Line 3
 ```


 @param {Object} config - Configuration object containing the content to format

 @param {string} config.content - The text content to be formatted

 @returns {string} The formatted content with double line spacing

 



---



## Methods



%methods%



---



Last updated: 2025-09-13T14:56:39.996Z



This file is auto generated. Do not edit manually.*



[Back to Index](./index.md)