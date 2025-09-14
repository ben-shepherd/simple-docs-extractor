## TargetBuilder.ts





 A builder class for configuring target settings for documentation extraction.

 

 This class provides a fluent interface for configuring targets that define

 which files to process, where to output documentation, and how to handle

 templates and plugins for the extraction process.

 

 @param {string | string[]} _patterns - Glob patterns for file matching

 @param {string} _cwd - Current working directory for file operations

 @param {string | string[]} _ignore - Patterns to ignore during file matching

 @param {string} _outDir - Output directory for generated docs

 @param {GlobOptions} _globOptions - Additional options for glob pattern matching

 @param {boolean} _createIndexFile - Whether to create index files

 @param {Templates} _templates - Template configurations for documentation generation

 @param {ExtractorPlugin[]} _plugins - Plugins to use during extraction

 



---



## Methods



### **patterns**

 Sets the glob patterns for file matching.

 

 @param {string | string[]} patterns - The glob patterns to match files

 @returns {TargetBuilder} This builder instance for method chaining

 



---



### **cwd**

 Sets the current working directory for file operations.

 

 @param {string} cwd - The current working directory path

 @returns {TargetBuilder} This builder instance for method chaining

 



---



### **ignores**

 Sets the patterns to ignore during file matching.

 

 @param {string | string[]} ignore - The patterns to ignore

 @returns {TargetBuilder} This builder instance for method chaining

 



---



### **outDir**

 Sets the output directory for generated documentation.

 

 @param {string} outDir - The output directory path

 @returns {TargetBuilder} This builder instance for method chaining

 



---



### **globOptions**

 Sets additional options for glob pattern matching.

 

 @param {GlobOptions} globOptions - The glob options to use

 @returns {TargetBuilder} This builder instance for method chaining

 



---



### **createIndexFiles**

 Enables creation of index files for the target.

 

 @returns {TargetBuilder} This builder instance for method chaining

 



---



### **indexTemplate**

 Configures the index template using a callback function.

 

 @param {TemplateCallback} callback - The callback function to configure the template

 @returns {TargetBuilder} This builder instance for method chaining

 



---



### **useDocumentationTemplate**

 Sets a documentation template file path.

 

 @param {string} templatePath - The path to the documentation template file

 @returns {TargetBuilder} This builder instance for method chaining

 



---



### **useRootIndexTemplate**

 Sets a root index template file path.

 

 @param {string} templatePath - The path to the root index template file

 @returns {TargetBuilder} This builder instance for method chaining

 



---



### **documentationTemplate**

 Configures the documentation template using a callback function.

 

 @param {TemplateCallback} callback - The callback function to configure the template

 @returns {TargetBuilder} This builder instance for method chaining

 



---



### **plugins**

 Sets the plugins to use during extraction.

 

 @param {ExtractorPlugin[] | ExtractorPlugin} plugins - The plugin(s) to use

 @returns {TargetBuilder} This builder instance for method chaining

 



---



### **build**

 Builds and returns the target configuration object.

 

 @returns {Target} The target configuration object

 



---



Last updated: 2025-09-14T15:05:57.636Z



This file is auto generated. Do not edit manually.*



[Back to Index](./index.md)