## TemplateBuilder.ts





 A builder class for configuring template settings for documentation generation.

 

 This class provides a fluent interface for configuring templates used in the

 documentation extraction process. It supports both index and documentation

 template types with various customization options.

 

 @param {string} _type - The type of template ('index' or 'documentation')

 @param {string} [_templatePath] - Optional path to a custom template file

 @param {boolean} [_markdownLinks=true] - Whether to use markdown links in output

 @param {string} [_filesHeading="\n## Files\n"] - Heading text for files section

 @param {string} [_directoryHeading="\n## Folders\n"] - Heading text for directories section

 @param {ExcerptExtractorConfig} [_excerpt] - Optional excerpt extraction configuration

 @param {LineCallback} [_lineCallback] - Optional callback for processing individual lines

 @param {FileNameCallback} [_fileNameCallback] - Optional callback for processing file names

 



---



## Methods



### **useFile**

 Sets the template file path to use for this template.

 

 @param {string} file - The path to the template file

 @returns {TemplateBuilder} This builder instance for method chaining

 



---



### **useMarkdownLinks**

 Enables markdown links in the generated documentation.

 

 @returns {TemplateBuilder} This builder instance for method chaining

 



---



### **filesHeading**

 Sets the heading text for the files section in the template.

 

 @param {string} filesHeading - The heading text for files section

 @returns {TemplateBuilder} This builder instance for method chaining

 



---



### **directoryHeading**

 Sets the heading text for the directories section in the template.

 

 @param {string} directoryHeading - The heading text for directories section

 @returns {TemplateBuilder} This builder instance for method chaining

 



---



### **excerpt**

 Sets the excerpt extraction configuration for this template.

 

 @param {ExcerptExtractorConfig} excerpt - The excerpt extraction configuration

 @returns {TemplateBuilder} This builder instance for method chaining

 



---



### **lineCallback**

 Sets the callback function for processing individual lines in the template.

 

 @param {LineCallback} lineCallback - The callback function for line processing

 @returns {TemplateBuilder} This builder instance for method chaining

 



---



### **fileNameCallback**

 Sets the callback function for processing file names in the template.

 

 @param {FileNameCallback} fileNameCallback - The callback function for file name processing

 @returns {TemplateBuilder} This builder instance for method chaining

 



---



### **plugins**

 Sets the plugins to use for this template.

 

 @param {ExtractorPlugin[]} plugins - The plugins to use

 @returns {TemplateBuilder} This builder instance for method chaining

 



---



### **build**

 Builds and returns the template configuration object.

 

 @returns {Templates} The template configuration object

 



---



Last updated: 2025-09-14T20:37:20.245Z



This file is auto generated. Do not edit manually.*



[Back to Index](./index.md)