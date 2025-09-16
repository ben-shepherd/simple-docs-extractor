## Builder.ts





 A main builder class for configuring the SimpleDocExtractor service.



 This class provides a fluent interface for building complete documentation

 extraction configurations. It allows configuration of targets, templates,

 and formatters, and can build both configuration objects and service instances.



 @param {string} [_baseDir=process.cwd()] - Base directory for the extraction process

 @param {Target[]} [_targets=[]] - Array of target configurations

 @param {Templates} [_templates={}] - Global template configurations

 @param {TFormatter[]} [_formatters=[]] - Array of formatters to use

 



---



## Methods



### **target**

 Adds a target configuration using a callback function.



 @param {TargetCallback} callback - The callback function to configure the target

 @returns {Builder} This builder instance for method chaining

 



---



### **indexTemplate**

 Configures the global index template using a callback function.



 @param {TemplateCallback} callback - The callback function to configure the template

 @returns {Builder} This builder instance for method chaining

 



---



### **rootIndexTemplate**

 Configures the global root index template using a callback function.



 @param {TemplateCallback} callback - The callback function to configure the template

 @returns {Builder} This builder instance for method chaining

 



---



### **documentationTemplate**

 Configures the global documentation template using a callback function.



 @param {TemplateCallback} callback - The callback function to configure the template

 @returns {Builder} This builder instance for method chaining

 



---



### **addFormatters**

 Adds one or more formatters to the configuration.



 @param {TFormatter | TFormatter[]} formatters - The formatter(s) to add

 @returns {Builder} This builder instance for method chaining

 



---



### **addRecommendedFormatters**

 Adds the recommended formatters to the configuration.



 @returns {Builder} This builder instance for method chaining

 



---



### **buildConfig**

 Builds and returns the complete configuration object.



 @returns {SimpleDocExtractorConfig} The complete configuration object

 



---



### **buildService**

 Builds and returns a configured SimpleDocExtractor service instance.



 @returns {SimpleDocExtractor} The configured service instance

 



---



Last updated: 2025-09-16T21:18:53.213Z



This file is auto generated. Do not edit manually.*



[Back to Index](./index.md)