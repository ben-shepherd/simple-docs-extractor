## defaults.ts





 Default configuration values for core components of the documentation generator.



 This module provides default settings for the index file generator,

 markdown index processor, and excerpt extractor. These defaults ensure

 consistent behavior across the documentation extraction and generation

 process, while allowing for customization as needed.



 @example

 import { DEFAULTS } from "./consts/defaults";

 const config = {

   ...DEFAULTS.INDEX_FILE_GENERATOR,

   filesHeading: "Files",

 };



 @typedef {Object} Defaults

 @property {Partial<IndexFileGeneratorConfig>} INDEX_FILE_GENERATOR - Default config for index file generation

 @property {Pick<Partial<MarkdownIndexProcessorConfig>, "recursive">} MARKDOWN_INDEX_PROCESSOR - Default config for markdown index processing

 @property {ExcerptExtractorConfig} EXCERPT_EXTRACTOR - Default config for excerpt extraction

 



---



## Methods



Not available.



---



Last updated: 2025-09-16T21:06:50.053Z



This file is auto generated. Do not edit manually.*



[Back to Index](./index.md)