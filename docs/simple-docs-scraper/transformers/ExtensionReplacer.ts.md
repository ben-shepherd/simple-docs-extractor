## ExtensionReplacer.ts





 Utility class for replacing file extensions.



 This class provides static methods to manipulate file paths by replacing

 all extensions with a specified new extension. It's commonly used to

 convert source files to markdown documentation files.



 @example Replacing extensions

 ```typescript
 const newPath = ExtensionReplacer.replaceAllExtensions('example.js.ts', 'md');
 // Returns 'example.md'
 ```


 @example Appending .md extension

 ```typescript
 const mdPath = ExtensionReplacer.appendMdExtension('notes.txt');
 // Returns 'notes.txt.md'

 const alreadyMd = ExtensionReplacer.appendMdExtension('readme.md');
 // Returns 'readme.md'
 ```


 



---



## Methods



%methods%



---



Last updated: 2025-09-13T14:56:39.997Z



This file is auto generated. Do not edit manually.*



[Back to Index](./index.md)