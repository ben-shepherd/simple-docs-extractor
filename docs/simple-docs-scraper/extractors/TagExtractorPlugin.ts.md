## TagExtractorPlugin.ts





 Extracts content from HTML/XML-like tags in source files.



 This extractor plugin searches for content between opening and closing tags,

 such as `<docs>content



---



This is documentation



---



This is documentation



---



## Methods



### **setConfig**

 Updates the configuration for this extractor.



 @param {TagExtractorPluginConfig} config - The new configuration object

 @returns {this} The current instance for method chaining

 



---



### **getConfig**

 Retrieves the current configuration of this extractor.



 @returns {TagExtractorPluginConfig} The current configuration object

 



---



### **extractFromString**

 Extracts content from HTML/XML-like tags in the provided string.



 Searches for all instances of the configured tag and extracts the content

 between the opening and closing tags. Also extracts any attributes from

 the opening tag. Returns an error if no matching tags are found.



 @param {string} str - The content string to extract from

 @returns {Promise<ExtractedContent[] | ErrorResult>} Array of extracted content objects or error result



 For regex101 example:

 @see https://regex101.com/r/UzcvAj/2

 



---



### **composeRegExp**

 Composes a regular expression pattern for matching the configured tag.



 @param {string} rawTag - The cleaned tag name

 @returns {RegExp} The compiled regular expression for tag matching

 



---



### **getAttributesOrUndefined**

 Extracts attributes from the opening tag string.



 @param {string} startTag - The opening tag string to extract attributes from

 @returns {Record<string, string> | undefined} Object containing attribute key-value pairs or undefined if no attributes

 



---



### **getStartTagPattern**

 Returns the pattern for the start tag.



 @param {string} rawTag - The raw tag name

 @returns {string} The pattern for the start tag

 



---



### **getAttributesPattern**

 Returns the pattern for the attributes.



 @returns {string} The pattern for the attributes

 



---



### **getInsideTagPattern**

 Returns the pattern for the inside tag.



 @returns {string} The pattern for the inside tag

 



---



### **getEndTagPattern**

 Returns the pattern for the end tag.



 @param {string} rawTag - The raw tag name

 @returns {string} The pattern for the end tag

 



---



### **getRawTag**

 Cleans the tag name by removing non-word characters.



 @param {string} startTag - The original tag name

 @returns {string} The cleaned tag name containing only word characters

 @throws {Error} When the resulting tag name is empty or invalid

 



---



Last updated: 2025-09-14T00:08:36.990Z



This file is auto generated. Do not edit manually.*



[Back to Index](./index.md)