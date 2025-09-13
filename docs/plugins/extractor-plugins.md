# Extractor Plugins

Extractor plugins are the core components that extract documentation content from source files. They provide flexible ways to identify and extract documentation using different methods.

## Files

- [TagExtractorPlugin](./simple-docs-scraper/extractors/TagExtractorPlugin.ts.md)
- [RegexExtractorPlugin](./simple-docs-scraper/extractors/RegexExtractorPlugin.ts.md)
- [CallbackExtractorPlugin](./simple-docs-scraper/extractors/CallbackExtractorPlugin.ts.md)

## Built-in Plugins

### Tag Extractor Plugin

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

### Regex Extractor Plugin

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

### Callback Extractor Plugin

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

## Creating Custom Extractor Plugins

To create your own extractor plugin, implement the `ExtractorPlugin` interface:

```typescript
import { ExtractorPlugin, BaseExtractorConfig } from 'simple-docs-scraper/types';

interface MyCustomConfig extends BaseExtractorConfig {
  customOption: string;
}

export class MyCustomExtractor implements ExtractorPlugin<MyCustomConfig> {
  constructor(private config: MyCustomConfig) {}

  setConfig(config: MyCustomConfig): this {
    this.config = config;
    return this;
  }

  getConfig(): MyCustomConfig {
    return this.config;
  }

  async extractFromString(str: string): Promise<ExtractedContent[] | ErrorResult> {
    // Your custom extraction logic here
    const content = this.extractContent(str);
    
    if (!content) {
      return {
        errorMessage: 'No content found',
        throwable: false
      };
    }

    return [{
      content: content,
      attributes: {},
      searchAndReplace: this.config.searchAndReplace
    }];
  }

  private extractContent(str: string): string | undefined {
    // Implement your extraction logic
    return undefined;
  }
}
```

### Required Methods

- `setConfig(config)`: Updates the plugin configuration
- `getConfig()`: Returns the current configuration
- `extractFromString(str)`: Extracts content from a string

### Return Types

**Success:** Return an array of `ExtractedContent` objects:
```typescript
{
  content: string;           // The extracted documentation
  attributes: Record<string, string>; // Optional attributes
  searchAndReplace: string;  // Replacement text
}
```

**Error:** Return an `ErrorResult` object:
```typescript
{
  errorMessage: string;      // Error description
  throwable: boolean;        // Whether to throw the error
}
```

## Using Extractor Plugins

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

## Best Practices

1. **Error Handling**: Always handle cases where no content is found
2. **Performance**: Use efficient regex patterns and avoid complex operations
3. **Flexibility**: Design plugins to be configurable and reusable
4. **Documentation**: Include clear examples and configuration options
5. **Testing**: Test your plugins with various input formats

## Common Use Cases

- **JSDoc Comments**: Extract `/** */` style documentation
- **HTML Comments**: Extract `<!-- -->` style documentation
- **Custom Tags**: Extract content between custom XML/HTML tags
- **Code Comments**: Extract single-line or multi-line comments
- **Markdown**: Extract content from markdown files
- **API Documentation**: Extract OpenAPI/Swagger documentation
