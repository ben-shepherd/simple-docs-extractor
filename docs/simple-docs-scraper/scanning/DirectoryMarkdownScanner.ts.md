## DirectoryMarkdownScanner.ts





 Prepares a array of entries for index file generation.



 This class scans directories and processes file and directory entries to create

 structured data suitable for index file generation. It handles markdown file filtering,

 directory detection, entry name formatting, and markdown link generation with

 configurable options for link formatting.



 @example

 ```typescript
 const processor = new DirectoryMarkdownScanner({
   markdownLink: true
 });

 const entries = await processor.process('./docs');
 // Returns array of processed entries with formatted names and links
 ```
 



---



## Methods



### **getDirectoryEntries**

 Retrieves directory entries filtered for markdown files and directories.



 This method scans a directory and returns only markdown files and all

 subdirectories, filtering out other file types. It's used to prepare

 entries for index file generation.



 @param baseDir - The directory path to scan

 @returns Promise resolving to array of filtered file and directory paths

 



---



### **process**

 Processes a directory and returns structured entries for index generation.



 This method scans a directory, processes each entry (file or directory),

 formats entry names, generates markdown links, and sorts the results

 with files appearing before directories.



 @param baseDir - The directory path to process

 @returns Promise resolving to array of processed entries ready for index generation

 



---



### **sortWithFilesAppearingFirst**

 Sorts the processed entries so files appear first.



 This method sorts the processed entries so files appear first.



 @param processedEntries - The processed entries to sort

 @returns The sorted processed entries

 



---



### **appendIndexMdIfFound**

 Appends 'index.md' to the markdown link if the directory contains an index file.



 This method checks if a directory contains an index.md file and updates the

 markdown link to point to that index file instead of just the directory name.



 @param result - The partial entry result to update

 @param excerpt - Optional excerpt to include in the link

 



---



### **getDirEntryName**

 Gets the entry name for a directory.

 - Adds a trailing slash to the base name



 @param baseName - The base name of the directory

 @returns The entry name for the directory

 



---



### **getFileEntryName**

 Gets the entry name for a file.

 - Adds a .md extension to the base name



 @param baseName - The base name of the file

 @returns The entry name for the file

 



---



### **formatEntry**

 Formats the entry path.

 - Removes the parent directory



 @param entry - The entry path to format

 @returns The formatted entry path

 



---



### **markdownLink**

 Generates a markdown link or plain text based on configuration.



 This method creates either a markdown link or plain text based on the

 markdownLink configuration. It handles optional excerpts and formats

 the output accordingly.



 @param display - The text to display

 @param link - The link target

 @param excerpt - Optional excerpt to include

 @returns Formatted markdown link or plain text

 



---



Last updated: 2025-09-16T20:59:41.533Z



This file is auto generated. Do not edit manually.*



[Back to Index](./index.md)