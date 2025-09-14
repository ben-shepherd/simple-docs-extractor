## TemplateContentExtractionContentMerger.ts





 Merges extracted content into template content with attribute formatting and content separation.



 This class handles the complex process of merging multiple extracted content pieces

 into a single template string. It groups content by search and replace patterns,

 formats attributes according to configured patterns, and applies content dividers

 between multiple content blocks.



 @example

 ```typescript
 const merger = new TemplateContentExtractionContentMerger({ target });
 const templateContent = "# Content\n{{content}}";
 const extractedContentArray = [
   {
     content: "This is the content",
     searchAndReplace: "{{content}}",
     attributes: { name: "John" }
   }
 ];
 const result = merger.handle(templateContent, extractedContentArray);
 // Result: "# Content\n### *name*: John\n\nThis is the content"
 ```


 @param {TemplateContentExtractionContentMergerConfig} config - Configuration containing the target for attribute format lookup

 



---



## Methods



### **handle**

 Merges extracted content into template content by replacing placeholders.



 Groups extracted content by search and replace patterns, then processes each

 group to replace the corresponding placeholders in the template with formatted

 content including attributes and dividers.



 @param {string} templateContent - The template string containing placeholders

 @param {ExtractedContent[]} extractedContentArray - Array of extracted content to merge

 @returns {string} The template content with all placeholders replaced by formatted content

 



---



### **handleGrouped**

 Handles a grouped extraction result.

 - Iterate over the grouped extraction results and create a content block for each extraction result

 - Add the divide by to the content block

 - Replace the search and replace with the content block

 - Return the template content

 



---



### **handleExtractContent**

 Handles the extraction content.

 - Add the divide by to the content block

 - Add the content to the content block

 - Return the content block

 



---



### **buildAttributesContent**

 Builds the attributes content.

 - Add the attributes to the content block, using the attribute format defined in the extraction plugin

 - If no attribute format is defined, use the default format

 - Return the content block

 



---



### **getExtractionResultGroupedBySearchAndReplace**

 Gets the extraction results grouped by search and replace.



 @param extractedContentArray - The extraction results to group by search and replace

 @returns The extraction results grouped by search and replace

 



---



### **getDivideBy**

 Gets the divide by for an extraction result.



 @param extractionResult - The extraction result to get the divide by for

 @returns The divide by for the extraction result

 



---



Last updated: 2025-09-14T00:08:37.191Z



This file is auto generated. Do not edit manually.*



[Back to Index](./index.md)