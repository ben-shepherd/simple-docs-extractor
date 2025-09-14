### Callback Extractor Plugin

[Back to Index](../index.md)

Extracts content using custom callback functions for maximum flexibility.

```typescript
import { CallbackExtractorPlugin } from 'simple-docs-scraper/extractors';

const extractor = new CallbackExtractorPlugin({
  callback: (content) => {
    // Custom extraction logic
    const match = content.match(/\/\/ DOCS: (.*)/);
    return match ? match[1] : undefined;
  },
  searchAndReplace: '// DOCS'
});
```

**Configuration:**
- `callback` (function): Custom extraction function
- `searchAndReplace` (string): Replacement text for the extracted content
- `defaultText` (optional): Default text when no content is found