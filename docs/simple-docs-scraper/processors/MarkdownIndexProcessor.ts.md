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

 



---



### **handleDirectoryRecusrively**

 Recursively processes a directory and all its subdirectories to create index files.



 @param directory - The directory path to process

 



---



Last updated: 2025-09-14T00:59:27.213Z



This file is auto generated. Do not edit manually.*



[Back to Index](./index.md)