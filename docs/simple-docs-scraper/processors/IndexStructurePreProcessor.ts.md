## File Name


 Prepares a array of entries for index file generation.

 This class scans directories and processes file and directory entries to create
 structured data suitable for index file generation. It handles markdown file filtering,
 directory detection, entry name formatting, and markdown link generation with
 configurable options for link formatting.

 @example
 ```typescript
 const processor = new IndexStructurePreProcessor({
   markdownLink: true
 });

 const entries = await processor.process('./docs');
 // Returns array of processed entries with formatted names and links
 ```
 

---

## Methods

Not available.

---

This file is auto generated. Do not edit manually.*

[Back to Index](./index.md)