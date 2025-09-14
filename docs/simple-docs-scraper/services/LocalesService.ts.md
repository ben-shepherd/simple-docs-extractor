## LocalesService.ts





 Service for extracting and managing locale information from files.

 

 Provides functionality to get file metadata (last modified time and filename)

 and convert it to extracted content format for template processing.

 

 @param {string} file - The file path to extract locale information from

 



---



## Methods



### **toExtractedContents**

 Converts locale information to extracted content format for template processing.

 

 @param {Locales} locales - The locale information to convert

 @returns {ExtractedContent[]} Array of extracted content objects with search and replace patterns

 



---



### **getLocales**

 Retrieves locale information from the file including last modified time and filename.

 

 @returns {Locales} Object containing updatedAt timestamp and fileName

 



---



### **getLocalesAsExtractedContents**

 Gets locale information and converts it to extracted content format.

 

 @returns {ExtractedContent[]} Array of extracted content objects ready for template processing

 



---



Last updated: 2025-09-14T20:37:20.246Z



This file is auto generated. Do not edit manually.*



[Back to Index](./index.md)