## ContentInjection.ts





 Handles content injection into templates and files.



 This class provides functionality to inject content into templates by replacing

 placeholder strings. It supports both string-based injection and file-based

 injection with template file reading and output file writing.



 @example

 ```typescript
 const injection = new ContentInjection({
   template: './templates/doc.md',
   outDir: './docs',
   injectInto: '{{CONTENT}}'
 });

 // Inject into string
 const result = injection.injectIntoString('Hello {{CONTENT}}', 'World');
 // Returns 'Hello World'

 // Inject into file
 injection.injectIntoFile('Documentation content: {{CONTENT}}', 'output.md');
 ```
 



---



## Methods



### **getTemplateContentWithReplaceString**

 Gets the template content with the replace string replaced.



 @param replaceWith - The string to replace the replace string with

 @param searchAndReplace - The search and replace string to replace

 @returns The template content with the replace string replaced

 



---



### **mergeExtractedContentsIntoTemplateString**

 Creates a content string from extraction results by replacing the configured placeholder.



 @param extractionResults - The extraction results to create the content from

 @returns The content string with injected content

 



---



### **applyDefaultText**

 Applies the default text to the template content.



 @param templateContent - The template content to apply the default text to

 @returns The template content with the default text applied

 



---



### **writeFile**

 Injects content into a template file and writes the result to an output file.



 @param replaceWith - The content to replace the placeholder with

 @param outFile - The output file path to write the result to

 @throws {Error} When the template file is not found

 



---



Last updated: 2025-09-13T17:26:04.309Z



This file is auto generated. Do not edit manually.*



[Back to Index](./index.md)