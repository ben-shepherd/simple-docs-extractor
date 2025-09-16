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



### **constructor**

 Creates a new IndexFileGenerator instance.



 This constructor initializes the generator with the provided configuration,

 merging it with default values and creating an IndexContentGenerator instance.



 @param {IndexFileGeneratorConfig} config - Configuration for file generation

 



---



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



### **createExcerpt**

 Creates an excerpt for a file entry.



 This method generates an excerpt from file content if the entry is a file.

 It reads the file and extracts the excerpt using the configured extractor.



 @param {string | undefined} excerpt - Current excerpt value

 @param {DirectoryMarkdownScannerEntry} current - Entry to create excerpt for

 @returns {string | undefined} Generated excerpt or undefined

 



---



### **generateExcerpt**

 Generates an excerpt from file content.



 This method uses the configured excerpt extractor to generate a summary

 from the provided content string.



 @param {string} content - File content to extract excerpt from

 @returns {string | undefined} Generated excerpt or undefined if not configured

 



---



### **createFileHeading**

 Creates a heading for the files section.



 This method adds a files heading to the content when processing the first file

 and a files heading is configured.



 @param {number} processedFiles - Number of files already processed

 @param {number} totalCount - Total number of files to process

 @param {string} [content=""] - Current content string to append to

 @returns {string} Updated content with heading if applicable

 



---



### **createDirectoryHeading**

 Creates a heading for the directories section.



 This method adds a directory heading to the content when processing the first

 directory and a directory heading is configured.



 @param {number} processedDirs - Number of directories already processed

 @param {number} totalCount - Total number of directories to process

 @param {string} [content=""] - Current content string to append to

 @returns {string} Updated content with heading if applicable

 



---



### **getTemplateContent**

 Retrieves the template content from the configured template file.



 This method reads the template file content if a template path is configured,

 otherwise returns the search and replace pattern as fallback content.



 @returns {string} Template content or search pattern

 @throws {Error} When template file is not found

 



---



### **getSearchAndReplace**

 Gets the search and replace pattern for template injection.



 This method returns the configured search and replace pattern or defaults

 to 'Not available.' if not specified in the configuration.



 @returns {string} The search and replace pattern

 



---



Last updated: 2025-09-16T20:33:10.824Z



This file is auto generated. Do not edit manually.*



[Back to Index](./index.md)