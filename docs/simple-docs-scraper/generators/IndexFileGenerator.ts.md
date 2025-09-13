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



%methods%



---



Last updated: 2025-09-13T15:05:02.038Z



This file is auto generated. Do not edit manually.*



[Back to Index](./index.md)