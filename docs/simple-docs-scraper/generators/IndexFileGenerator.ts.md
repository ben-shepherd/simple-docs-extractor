## IndexFileGenerator.ts





 Generates index files from processed directory entries with configurable templates and formatting.



 This class creates markdown index files that list files and directories in a structured format.

 It supports custom templates, search-and-replace patterns, excerpt generation, and flexible

 formatting through callback functions. The generated index files help organize documentation

 by providing navigation links and summaries.



 @example

 ```typescript
 const generator = new IndexFileGenerator({
   outDir: './docs',
   template: './templates/index.md',
   searchAndReplace: '{{CONTENT}}',
   excerpt: true,
   excerptLength: 100
 });

 generator.saveIndexFile(processedEntries);
 // Creates index.md with formatted file listings
 ```
 



---



## Methods



### **saveIndexFile**

 Saves an index file by processing entries and generating formatted content.



 This method creates a markdown index file that lists files and directories

 in a structured format. It handles excerpt generation, custom formatting

 through callbacks, and template injection to create the final index file.



 @param processedArray - Array of processed directory entries to include in the index

 



---



### **applyPlugins**

 Applies plugins to the template content.



 @param {string} templateContent - The template content to apply plugins to

 



---



Last updated: 2025-09-14T12:20:55.817Z



This file is auto generated. Do not edit manually.*



[Back to Index](./index.md)