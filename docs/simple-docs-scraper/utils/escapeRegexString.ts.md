## escapeRegexString.ts





 Utility function for escaping special regex characters in strings.

 

 This function escapes all special regular expression characters in a string

 so that it can be safely used as a literal string in regex patterns. It's

 commonly used when building dynamic regex patterns from user input or

 configuration values.

 

 @example

 ```typescript
 const userInput = "file.name.js";
 const escaped = escapeRegExpString(userInput);
 const regex = new RegExp(escaped);
 // Now regex will match the literal string "file.name.js"
 ```
 

 @param {string} string - The string to escape for regex use

 @returns {string} The escaped string safe for use in regex patterns

 

 @see https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex

 



---



## Methods



Not available.



---



Last updated: 2025-09-14T15:05:57.638Z



This file is auto generated. Do not edit manually.*



[Back to Index](./index.md)