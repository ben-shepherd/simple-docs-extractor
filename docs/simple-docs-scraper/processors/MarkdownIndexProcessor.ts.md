## MarkdownIndexProcessor.ts





 Processes directories recursively to generate index files for documentation.



 This class traverses directory structures and creates index files (typically index.md)

 that list all markdown files found in each directory. It supports custom templates

 and search-and-replace patterns for flexible index file generation.



 @example

 ```typescript
 const processor = new IndexProcessor({
   baseDir: './docs',
   template: './templates/index.template.md',
   searchAndReplace: '{{CONTENT}}'
 });

 await processor.handle();
 // Creates index.md files in all subdirectories of ./docs
 ```
 



---



## Methods



### **handle**

 Starts the index file generation process for the configured base directory.

 

 @param baseDir - The directory path to process

 



---



### **handleSingleDirectory**

 Handles a single directory and creates an index file for it.

 

 @param directory - The directory path to process

 



---



### **getProcessedEntries**

 Gets the processed entries for a directory.

 

 @param directory - The directory path to process

 



---



### **recursivelyAddSubEntries**

 Recursively adds sub-entries to a directory.

 

 @param entries - The entries to add sub-entries to

 



---



Last updated: 2025-09-16T21:51:51.930Z



This file is auto generated. Do not edit manually.*



[Back to Index](./index.md)