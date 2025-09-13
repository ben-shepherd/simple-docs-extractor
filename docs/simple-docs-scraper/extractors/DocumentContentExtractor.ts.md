## DocumentContentExtractor.ts





 Extracts documentation from source files using various methods.



 This class provides flexible documentation extraction capabilities supporting

 three different extraction methods: tag-based extraction, regex pattern matching,

 and custom callback functions. It handles file validation, error reporting,

 and content cleaning.



 @example

 ```typescript
 // Extract using tags
 const extractor = new DocumentContentExtractor('example.js', {
   extractMethod: 'tags',
   startTag: '#START',
   endTag: '#END'
 });

 // Extract using regex
 const extractor = new DocumentContentExtractor('example.js', {
   extractMethod: 'regex',
   pattern: /\/\*\*([\s\S]*?)\*\//g
 });

 const result = await extractor.extract();
 ```
 



---



## Methods



%methods%



---



Last updated: 2025-09-13T15:03:39.865Z



This file is auto generated. Do not edit manually.*



[Back to Index](./index.md)