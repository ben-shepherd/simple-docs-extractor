## DocumentContentExtractor.ts





 Extracts documentation from source files using various extractor plugins.



 This class provides flexible documentation extraction capabilities by orchestrating

 multiple extractor plugins. It supports tag-based extraction, regex pattern matching,

 and custom callback functions. The class handles file validation, error reporting,

 and content cleaning across all configured extractors.



 Example usage:

 ```typescript
 const extractors = [
   new TagExtractorPlugin({ tag: 'docs', searchAndReplace: '' }),
   new RegexExtractorPlugin({ pattern: /\/\*\*([\s\S]*?)\*\//g, searchAndReplace: '' })
 ];
 
 const extractor = new DocumentContentExtractor(extractors);
 const result = await extractor.extractFromFile('example.js');
 ```
 

 @param {DocumentContentExtractorConfig} config - Array of extractor plugins to use for extraction

 



---



## Methods



### **extractFromFile**

 Extracts documentation from a file using the configured extractor plugins.

 

 Reads the file content and delegates to extractFromString for processing.

 Throws an error if the file does not exist.

 

 @param {string} file - The path to the file to extract documentation from

 @returns {Promise<ExtractedContent[]>} Promise resolving to array of extracted content objects

 @throws {Error} When the file is not found

 



---



### **extractFromString**

 Extracts documentation from a string using all configured extractor plugins.

 

 Processes the input string through each configured extractor plugin sequentially

 and combines all results into a single array. Each plugin can extract different

 types of content from the same input.

 

 @param {string} contents - The content string to extract documentation from

 @returns {Promise<ExtractedContent[]>} Promise resolving to array of all extracted content objects

 



---



### **handleExtractionMethod**

 Handles the extraction process for a single extractor plugin.

 

 Validates the plugin, executes the extraction, handles errors appropriately,

 and cleans the extracted content by trimming whitespace and empty lines.

 

 @param {ExtractorPlugin} plugin - The extractor plugin to execute

 @param {string} str - The content string to extract from

 @param {number} i - The index of the plugin for error reporting

 @returns {Promise<ExtractedContent[] | undefined>} Array of extracted content or undefined if error is not throwable

 @throws {Error} When plugin is invalid or extraction fails with throwable error

 



---



### **trimContent**

 Cleans extracted content by trimming whitespace and removing excessive empty lines.

 

 @param {ExtractedContent[]} result - Array of extracted content objects to clean

 



---



Last updated: 2025-09-14T15:05:57.636Z



This file is auto generated. Do not edit manually.*



[Back to Index](./index.md)