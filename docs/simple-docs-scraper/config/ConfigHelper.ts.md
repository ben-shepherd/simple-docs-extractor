## ConfigHelper.ts





 Helper class for retrieving configuration values from target configurations.

 

 This utility class provides static methods to extract specific configuration

 values from target objects, particularly for finding extraction plugins and

 their associated attribute formats by search and replace patterns.

 

 @example

 ```typescript
 const plugin = ConfigHelper.getPluginBySearchAndReplace(target, 'Not available.');
 const attributeFormat = ConfigHelper.getAttributeFormatBySearchAndReplace(target, '%content%');
 ```
 



---



## Methods



### **getPluginBySearchAndReplace**

 Finds an extraction plugin by its search and replace pattern.

 

 @param {Target} target - The target configuration containing extraction plugins

 @param {string} searchAndReplace - The search and replace pattern to match

 @returns {ExtractorPlugin | undefined} The matching plugin or undefined if not found

 



---



### **getAttributeFormatBySearchAndReplace**

 Retrieves the attribute format for a specific search and replace pattern.

 

 @param {Target} target - The target configuration containing extraction plugins

 @param {string} searchAndReplace - The search and replace pattern to match

 @returns {string | undefined} The attribute format string or undefined if not found

 



---



Last updated: 2025-09-14T15:31:22.608Z



This file is auto generated. Do not edit manually.*



[Back to Index](./index.md)