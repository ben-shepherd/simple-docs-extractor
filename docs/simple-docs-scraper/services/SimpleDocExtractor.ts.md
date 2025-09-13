## File Name


 Main orchestrator class for extracting and generating documentation from source files.

 This class coordinates the entire documentation generation process by scanning files,
 extracting documentation content, and generating both individual documentation files
 and index files. It supports multiple targets and provides comprehensive logging.

 @example
 ```typescript
 const scraper = new SimpleDocsScraper({
   baseDir: './src',
   extraction: {
     extractMethod: 'tags',
     startTag: '#START',
     endTag: '#END'
   },
   searchAndReplace: { replace: '{{CONTENT}}' },
   generators: {
     index: { template: './templates/index.md' },
     documentation: { template: './templates/doc.md' }
   },
   targets: [{
     globOptions: { cwd: './src', extensions: '*.js' },
     outDir: './docs',
     createIndexFile: true
   }]
 });

 const result = await scraper.start();
 ```
 

---

## Methods

### *name*: getConfig

 Returns the current configuration.

 @returns The current SimpleDocsScraper configuration
 

---

### *name*: start

 Starts the documentation generation process for all configured targets.

 @returns Promise resolving to result object with success count, total count, and logs
 

---

### *name*: handleTarget

 Processes a single target directory by scanning files and generating documentation.

 @param target - The target configuration to process
 @param targetIndex - The index of the target for logging purposes
 

---

### *name*: processSingleFile

 Processes a single file by extracting documentation and generating output.

 @param file - The file path to process
 @param target - The target configuration
 @param targetIndex - The index of the target for logging
 @param preProcessedFiles - Array to collect processed file results
 @param fileProcessor - The file processor instance to use
 

---

### *name*: handleRecursivelyCreateIndexFiles

 Creates an index file recursively for the target if configured to do so.

 @param target - The target configuration
 

---

### *name*: getIndexProcessorConfig

 Gets the index processor config for the target.
 - Returns the target's index processor config if it exists
 - Returns the default index processor config if the target's index processor config does not exist
 - Returns an empty object if the default index processor config does not exist

 @param target - The target configuration
 @returns The index processor config
 

---


 Gets the files for the target using the configured file scanner.

 @param target - The target configuration containing glob options
 @returns Promise resolving to array of matching file paths
 

---

This file is auto generated. Do not edit manually.*

[Back to Index](./index.md)