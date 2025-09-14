# Extractor Plugins

Extractor plugins are the core components that extract documentation content from source files. They provide flexible ways to identify and extract documentation using different methods.

## Table of Contents

- [Example Builder Pattern Configuration](#example-builder-pattern-configuration)
- [Using Extractor Plugins Directly](#using-extractor-plugins-directly)


## Built-in Plugins Documentation

- [TagExtractorPlugin](./built-in-plugins/TagExtractorPlugin.md)
- [RegexExtractorPlugin](./built-in-plugins/RegexExtractorPlugin.md)
- [CallbackExtractorPlugin](./built-in-plugins/CallbackExtractorPlugin.md)
- [CopyContentsPlugin](./built-in-plugins/CopyContentsPlugin.md)


## Source Code Links

- [/src/simple-docs-scraper/plugins/TagExtractorPlugin.ts](https://github.com/ben-shepherd/simple-docs-extractor/blob/main/src/simple-docs-scraper/plugins/TagExtractorPlugin.ts)
- [/src/simple-docs-scraper/plugins/RegexExtractorPlugin.ts](https://github.com/ben-shepherd/simple-docs-extractor/blob/main/src/simple-docs-scraper/plugins/RegexExtractorPlugin.ts)
- [/src/simple-docs-scraper/plugins/CallbackExtractorPlugin.ts](https://github.com/ben-shepherd/simple-docs-extractor/blob/main/src/simple-docs-scraper/plugins/CallbackExtractorPlugin.ts)
- [/src/simple-docs-scraper/plugins/CopyContentsPlugin.ts](https://github.com/ben-shepherd/simple-docs-extractor/blob/main/src/simple-docs-scraper/plugins/CopyContentsPlugin.ts)


## Example Builder Pattern Configuration

```typescript
const service = SimpleDocExtractor
  .create(process.cwd())
  .target((target) => {
    target.plugins([
      new TagExtractorPlugin({
        tag: 'docs',
        searchAndReplace: '%docs%'
      })
    ])
  })
  .buildService();

await service.start();
```


## Using Extractor Plugins Directly

Plugins are used through the `DocumentContentExtractor` class:

```typescript
import { DocumentContentExtractor } from 'simple-docs-scraper/extractors';
import { TagExtractorPlugin } from 'simple-docs-scraper/extractors';

// Single plugin
const extractor = new DocumentContentExtractor([
  new TagExtractorPlugin({
    tag: 'docs',
    searchAndReplace: '<!-- DOCS -->'
  })
]);

// Multiple plugins
const extractor = new DocumentContentExtractor([
  new TagExtractorPlugin({
    tag: 'docs',
    searchAndReplace: '<!-- DOCS -->'
  }),
  new RegexExtractorPlugin({
    pattern: /\/\*\*([\s\S]*?)\*\//g,
    searchAndReplace: '/* DOCS */'
  })
]);

// Extract from file
const results = await extractor.extractFromFile('example.js');

// Extract from string
const results = await extractor.extractFromString(fileContent);
```
