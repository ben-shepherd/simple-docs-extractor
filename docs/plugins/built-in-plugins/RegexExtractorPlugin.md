### Regex Extractor Plugin

[Back to Index](../index.md)

Extracts content using regular expression patterns.

```typescript
import { RegexExtractorPlugin } from 'simple-docs-scraper/extractors';

const extractor = new RegexExtractorPlugin({
  pattern: /\/\*\*([\s\S]*?)\*\//g,
  searchAndReplace: '/* DOCS */'
});
```

**Configuration:**
- `pattern` (RegExp): Regular expression with capture groups
- `searchAndReplace` (string): Replacement text for the extracted content
- `defaultText` (optional): Default text when no content is found

**Example usage:**
```javascript
// Input
/**
 * This is JSDoc documentation
 */

// Output
/* DOCS */
This is JSDoc documentation
```