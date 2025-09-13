## CodeFileProcessor.ts





 Processes individual files to extract documentation and generate output files.



 This class handles the complete file processing pipeline including documentation

 extraction, content injection into templates, formatter application, and output

 file generation. It coordinates between various components to transform source

 files into formatted documentation.



 @example

 ```typescript
 const processor = new FileProcessor(config);

 const result = await processor.preProcess('./src/example.js', target);

 if ('content' in result) {
   // Example result structure:
   // {
   //   content: '...generated markdown...',
   //   outDir: './docs',
   //   fileName: 'example.js',
   //   loggableFileName: 'src/example.js'
   // }
   await processor.processFile(result, target);
 } else if ('error' in result) {
   // Handle the error, e.g.:
   console.error(result.error);
 }
 ```
 



---



## Methods



### **preProcess**

 Pre-processes a file by extracting documentation and preparing it for output generation.



 @param file - The source file path to process

 @param target - The target configuration containing output directory and options

 @returns Promise resolving to processing result with content or error details

 



---



### **addLocalesToExtractedContent**

 Adds the locales to the extracted content

 @param file - The file path

 @param extractionResults - The extracted content

 @returns The locales

 



---



### **buildOutputPath**

 Builds the output directory path by preserving the source file's directory structure.

 

 Takes a source file path and maps it to the corresponding output directory,

 maintaining the relative folder structure from the target's working directory.

 

 @param file - The source file path

 @param target - The target configuration containing output directory and glob options

 @returns The complete output directory path

 



---



### **processFile**

 Processes a single file by extracting documentation and generating output.



 @param processedResult - The file path to process

 @param target - The target configuration containing output directory

 



---



Last updated: 2025-09-13T16:45:22.399Z



This file is auto generated. Do not edit manually.*



[Back to Index](./index.md)