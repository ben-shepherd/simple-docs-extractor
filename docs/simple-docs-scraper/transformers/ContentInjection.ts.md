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



Not available.



---



Last updated: 2025-09-13T15:53:49.345Z



This file is auto generated. Do not edit manually.*



[Back to Index](./index.md)