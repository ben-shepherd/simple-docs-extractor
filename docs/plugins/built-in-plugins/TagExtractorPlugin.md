### Tag Extractor Plugin

[Back to Index](../index.md)

Extracts content between HTML-like tags with optional attributes.

```typescript
import { TagExtractorPlugin } from 'simple-docs-scraper/extractors';

const extractor = new TagExtractorPlugin({
  tag: 'docs',
  searchAndReplace: '%docs%',
  defaultText: 'No documentation found'
});
```

**Configuration:**
- `tag` (string): The tag name to extract content from
- `searchAndReplace` (string): Replacement text for the extracted content
- `defaultText` (optional): Default text when no content is found
- `attributeFormat` (optional): Format for tag attributes

**Example usage:**
```html
<!-- Input -->
<docs>
This is documentation content.
</docs>

<!-- Output -->
This is documentation content.
```
