## RegexExtractorPlugin.ts





 Extracts content from strings using regular expression patterns.



 This extractor plugin uses a configured regular expression to find and extract

 content from strings. The regex should have at least one capture group, and

 the content from the first capture group will be extracted.



 Example usage:

 ```typescript
 const extractor = new RegexExtractorPlugin({
   pattern: /\/\*\*([\s\S]*?)\*\//g,
   searchAndReplace: ''
 });

 // Will extract content from: \/*\* This is documentation \*
 const result = await extractor.extractFromString('/** This is documentation *\/');
 ```


 @param {RegexExtractorPluginConfig} config - The configuration object containing the regex pattern and options

 



---



## Methods



### **setConfig**

 Updates the configuration for this extractor.



 @param {RegexExtractorPluginConfig} config - The new configuration object

 @returns {this} The current instance for method chaining

 



---



### **getConfig**

 Retrieves the current configuration of this extractor.



 @returns {RegexExtractorPluginConfig} The current configuration object

 



---



### **extractFromString**

 Extracts content from the provided string using the configured regex pattern.



 Applies the regex pattern to the input string and extracts the content from

 the first capture group. Returns an error if no matches are found or if the

 first capture group is not a string.



 @param {string} str - The content string to extract from

 @returns {Promise<ExtractedContent[] | ErrorResult>} Array containing one extracted content object or error result

 



---



Last updated: 2025-09-16T21:18:53.214Z



This file is auto generated. Do not edit manually.*



[Back to Index](./index.md)