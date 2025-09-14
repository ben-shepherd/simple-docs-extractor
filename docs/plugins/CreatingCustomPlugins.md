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
- **File Inclusion**: Copy entire file contents (README, CHANGELOG, LICENSE, etc.)
