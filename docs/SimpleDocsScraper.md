Main orchestrator class for extracting and generating documentation from source files.

This class coordinates the entire documentation generation process by scanning files,
extracting documentation content, and generating both individual documentation files
and index files. It supports multiple targets and provides comprehensive logging.

@example
```typescript
const scraper = new SimpleDocsScraper({
  baseDir: './src',
  extraction: {
    extractMethod: 'tags',
    startTag: '<docs>',
    endTag: '

---

*This file is auto generated. Do not edit manually.*