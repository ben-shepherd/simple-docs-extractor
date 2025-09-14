## DocFileGenerator.ts





 Generates documentation files by injecting content into templates.



 This class handles the creation of markdown documentation files by taking

 content and injecting it into a template file. It can save the generated

 content to files with proper markdown extensions and directory structure.



 @param {DocFileGeneratorConfig} config - Configuration object containing template path, output directory, and search/replace pattern

 



---



## Methods



### **saveToMarkdownFile**

 Generates a documentation file by injecting content into a template.



 @param injectedContent - The documentation content to inject into the template

 @param outFile - The original file path used to determine the output filename

 @throws {Error} When the template file is not found

 



---



### **getTemplateContent**

 Retrieves the template content from the configured template file.



 @returns The template content as a string

 @throws {Error} When the template file is not found

 



---



Last updated: 2025-09-14T12:20:43.202Z



This file is auto generated. Do not edit manually.*



[Back to Index](./index.md)