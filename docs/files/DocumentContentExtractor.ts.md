Extracts documentation from source files using various methods.This class provides flexible documentation extraction capabilities supportingthree different extraction methods: tag-based extraction, regex pattern matching,and custom callback functions. It handles file validation, error reporting,and content cleaning.@example```typescript// Extract using tagsconst extractor = new DocumentContentExtractor('example.js', {  extractMethod: 'tags',  startTag: '<docs>',  endTag: '

---

*This file is auto generated. Do not edit manually.*