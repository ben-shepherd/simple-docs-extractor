## IndexContenGenerator.ts





 Generates markdown content for index files from processed directory entries.



 This class creates structured markdown content that lists files and directories

 in a hierarchical format. It supports custom formatting through callbacks,

 excerpt generation, and configurable headings for files and directories.

 The content can be flattened to show all entries in a single list or maintain

 the original directory structure.



 @example

 ```typescript
 const generator = new IndexContentGenerator({
   lineCallback: (name, line, excerpt) => `- ${name}`,
   directoryHeading: '# Directories',
   filesHeading: '# Files',
   flatten: false,
   markdownLink: true
 });

 const content = generator.generate(processedEntries);
 // Returns formatted markdown content
 ```
 



---



## Methods



### **constructor**

 Creates a new IndexContentGenerator instance.



 @param {IndexFileGeneratorConfig} config - Configuration for content generation

 



---



### **getDefaultState**

 Creates a default state object for content generation.



 This method initializes the state with default values and calculates

 the total counts of files and directories from the processed array.

 It allows for partial overrides of both configuration and state properties.



 @param {DirectoryMarkdownScannerEntry[]} processedArray - Array of processed entries

 @param {Partial<IndexContentGeneratorConfig>} [overwriteConfig] - Optional config overrides

 @param {Partial<State>} [overwriteState] - Optional state overrides

 @returns {State} Initialized state object

 



---



### **generate**

 Generates markdown content from processed directory entries.



 This method processes each entry in the array and generates formatted

 markdown content. It handles both regular entries and flattened entries

 based on the configuration.



 @param {DirectoryMarkdownScannerEntry[]} processedArray - Array of processed entries

 @returns {string} Generated markdown content

 



---



### **generateEntry**

 Generates content for a single entry and updates the state.



 This method processes a single entry by creating excerpts, headings,

 and formatted lines, then updates the processing counters.



 @param {State} state - Current generation state

 @param {DirectoryMarkdownScannerEntry} entry - Entry to process

 @returns {State} Updated state after processing the entry

 



---



### **generateFlatEntriesRecursively**

 Recursively generates flattened entries for nested directory structures.



 This method processes nested entries when flattening is enabled,

 creating a single-level list of all files and directories with

 proper path information.



 @param {State} state - Current generation state

 @param {DirectoryMarkdownScannerEntry} entry - Entry to process recursively

 @param {string} currentEntryName - Current path to the entry

 



---



### **appendEntryName**

 Appends a sub-entry name to the current path.



 This method constructs the full path to a sub-entry by combining

 the current path with the sub-entry name, handling trailing slashes.



 @param {DirectoryMarkdownScannerEntry} subEntry - The sub-entry to append

 @param {string} pathToEntryName - Current path to append to

 @returns {string} Updated path with sub-entry name

 



---



### **updateProcessedCount**

 Updates the processed count for files or directories.



 This method increments the appropriate counter based on whether

 the entry is a file or directory.



 @param {State} state - Current generation state

 @param {DirectoryMarkdownScannerEntry} entry - Entry to count

 



---



### **createFileHeading**

 Creates a heading for files section if needed.



 This method adds a files heading to the content when processing

 the first file and a files heading is configured.



 @param {State} state - Current generation state

 @param {DirectoryMarkdownScannerEntry} entry - Current entry being processed

 



---



### **createDirectoryHeading**

 Creates a heading for directories section if needed.



 This method adds a directory heading to the content when processing

 the first directory and a directory heading is configured.



 @param {State} state - Current generation state

 @param {DirectoryMarkdownScannerEntry} entry - Current entry being processed

 



---



### **createLine**

 Creates a formatted line for an entry.



 This method generates a formatted line for the entry, either using

 a custom callback or creating a standard markdown list item with

 optional excerpt and indentation.



 @param {State} state - Current generation state

 @param {DirectoryMarkdownScannerEntry} entry - Entry to create line for

 



---



### **buildDirectoryPath**

 Builds the complete path for a directory entry when in recursive mode.



 This method constructs the full path to a directory's index file by

 appending "/index.md" to the directory path when recursive mode is enabled.

 It ensures the path ends with a slash before adding the index filename.



 @param {DirectoryMarkdownScannerEntry} entry - Entry to build path for

 @param {State} state - Current generation state

 @returns {string} Complete path to the entry

 



---



### **createIndenterPrefix**

 Creates indentation prefix based on the current indent level.



 This method generates the appropriate number of spaces for indentation

 based on the current indent level in the state.



 @param {State} state - Current generation state

 @returns {string} Indentation prefix string

 



---



### **createExcerpt**

 Creates an excerpt for a file entry.



 This method generates an excerpt from file content if the entry is a file

 and excerpt configuration is provided. It reads the file and extracts

 the excerpt using the configured extractor.



 @param {State} state - Current generation state

 @param {DirectoryMarkdownScannerEntry} entry - Entry to create excerpt for

 @returns {string | undefined} Generated excerpt or undefined

 



---



Last updated: 2025-09-16T21:51:51.929Z



This file is auto generated. Do not edit manually.*



[Back to Index](./index.md)