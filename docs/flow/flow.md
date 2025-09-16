# Simple Docs Extractor - Application Flow

This document provides a comprehensive overview of how the Simple Docs Extractor application works, designed for new developers who want to understand or contribute to the codebase.

## Overview

Simple Docs Extractor is a documentation generation tool that extracts documentation from source code files and generates organized markdown documentation with index files. The application follows a modular architecture with clear separation of concerns.

## High-Level Architecture

The application is structured around several key components:

1. **Configuration Layer** - Builder pattern for fluent configuration
2. **File Processing Layer** - File discovery and content extraction
3. **Content Processing Layer** - Documentation extraction and transformation
4. **Generation Layer** - Output file creation and formatting
5. **Plugin System** - Extensible extraction and formatting capabilities

## Application Flow

### 1. Configuration Phase

The application starts with configuration using the Builder pattern:

```typescript
const scraper = SimpleDocExtractor.create('./src')
  .target(target => {
    target
      .patterns('**/*.ts')
      .cwd('./src')
      .outDir('./docs')
      .createIndexFiles()
      .useDocumentationTemplate('./templates/doc.md');
  })
  .addRecommendedFormatters()
  .buildService();
```

**Key Classes:**
- `Builder` - Main configuration builder
- `TargetBuilder` - Configures individual processing targets
- `TemplateBuilder` - Configures templates for different output types

### 2. File Discovery Phase

Once configured, the application discovers files to process:

```typescript
// In SimpleDocExtractor.handleTarget()
const files = await this.getFiles(target);
```

**Key Classes:**
- `FileScanner` - Uses glob patterns to find matching files
- `Target` - Contains glob options and output configuration

**Process:**
1. `FileScanner.collect()` scans directories using glob patterns
2. Returns array of absolute file paths matching the criteria
3. Files are processed sequentially

### 3. File Processing Phase

For each discovered file, the application processes it through several stages:

#### 3.1 Pre-Processing (`CodeFileProcessor.preProcess()`)

```typescript
const processedResult = await fileProcessor.preProcess(file, target);
```

**Steps:**
1. **Content Extraction** - Uses `DocumentContentExtractor` with configured plugins
2. **Template Injection** - Injects extracted content into templates via `ContentInjection`
3. **Formatting** - Applies configured formatters to clean up content
4. **Output Path Generation** - Determines where the output file should be saved

#### 3.2 Content Extraction (`DocumentContentExtractor`)

The extraction process uses a plugin-based system:

```typescript
const extractedContentArray = await new DocumentContentExtractor(
  target.plugins ?? []
).extractFromFile(file);
```

**Available Plugins:**
- `TagExtractorPlugin` - Extracts content from HTML/XML-like tags (`<docs>content</docs>`)
- `RegexExtractorPlugin` - Uses regex patterns to extract content
- `CallbackExtractorPlugin` - Custom callback-based extraction
- `CopyContentsPlugin` - Copies entire file content

**Process:**
1. Each plugin processes the file content
2. Plugins return `ExtractedContent[]` with content and metadata
3. Results are combined and cleaned (trimmed, empty lines removed)

#### 3.3 Template Processing (`ContentInjection`)

```typescript
injectedContent = contentInjection.mergeExtractedContentsIntoTemplateString(
  extractedContentArray
);
```

**Process:**
1. Reads template file content
2. Replaces placeholder strings with extracted content
3. Applies default text for missing content
4. Uses `TemplateContentExtractionContentMerger` for complex merging

#### 3.4 Formatting (`TFormatter`)

```typescript
for (const formatter of this.config.formatters) {
  injectedContent = formatter({
    filePath: file,
    outFile: file,
    content: injectedContent,
  });
}
```

**Available Formatters:**
- `RemoveMultiLineCommentAsterisks` - Removes comment formatting
- `AddDoubleLinesFormatter` - Adds spacing between content lines

### 4. File Generation Phase

#### 4.1 Documentation File Generation (`DocFileGenerator`)

```typescript
new DocFileGenerator({
  templatePath: this.getDocFileGeneratorConfig(target).templatePath,
  outDir: transformedOutDir,
}).saveToMarkdownFile(injectedContent, file);
```

**Process:**
1. Creates output directory structure
2. Converts file extension to `.md`
3. Writes processed content to markdown file

#### 4.2 Index File Generation (`MarkdownIndexProcessor`)

After all files are processed, index files are generated:

```typescript
await new MarkdownIndexProcessor({
  ...this.getIndexProcessorConfig(target),
  recursive: true,
}).handle(target.outDir);
```

**Process:**
1. **Directory Scanning** - `IndexStructurePreProcessor` scans directories for markdown files
2. **Content Generation** - `IndexFileGenerator` creates index content with file listings
3. **Template Application** - Applies index templates with search/replace patterns
4. **Recursive Processing** - Handles subdirectories if configured

**Index Types:**
- **Regular Index** - Lists files and folders in each directory
- **Flattened Index** - Shows all files in a flat structure
- **Root Index** - Special index for the root documentation directory

### 5. Output Structure

The application generates a structured documentation output:

```
docs/
├── index.md                    # Root index file
├── src/
│   ├── index.md               # Directory index
│   ├── utils/
│   │   ├── index.md          # Subdirectory index
│   │   ├── helper.ts.md      # Generated documentation
│   │   └── validator.ts.md   # Generated documentation
│   └── services/
│       ├── index.md
│       └── api.ts.md
```

## Key Data Structures

### ExtractedContent
```typescript
type ExtractedContent = {
  content: string;                    // The extracted documentation content
  attributes: Record<string, string>; // Attributes from tags (e.g., class="example")
  searchAndReplace: string;          // Placeholder to replace in templates
  divideBy?: string;                 // Optional delimiter for content sections
  defaultText?: string;              // Default text when no content found
};
```

### ProcessResult
```typescript
type ProcessResult = {
  content: string;           // Generated documentation content
  outDir: string;           // Output directory path
  fileName: string;         // Output filename
  loggableFileName: string; // File path for logging
  locales: Locales;         // Template variables
} | {
  error: string;            // Error message
  noDocumentationFound?: boolean; // Whether documentation was missing
};
```

## Plugin System

The application uses a plugin-based architecture for extensibility:

### ExtractorPlugin Interface
```typescript
interface ExtractorPlugin<Config> {
  setConfig(config: Config): ExtractorPlugin<Config>;
  getConfig(): Config;
  extractFromString(str: string): Promise<ExtractedContent[] | ErrorResult>;
}
```

### Creating Custom Plugins

1. **Extractor Plugins** - Extract content from source files
2. **Formatter Plugins** - Transform extracted content
3. **Template Plugins** - Process template content

## Error Handling

The application handles errors gracefully:

1. **File Not Found** - Logs error and continues with next file
2. **No Documentation Found** - Tracks missing documentation count
3. **Plugin Errors** - Supports throwable vs non-throwable errors
4. **Template Errors** - Validates template files exist

## Configuration Options

### Target Configuration
- **File Patterns** - Glob patterns for file discovery
- **Output Directory** - Where to save generated documentation
- **Templates** - Custom templates for different output types
- **Plugins** - Extraction and formatting plugins
- **Index Creation** - Whether to create index files

### Template Configuration
- **Documentation Templates** - Templates for individual files
- **Index Templates** - Templates for directory listings
- **Root Index Templates** - Templates for root documentation

## Performance Considerations

1. **Sequential Processing** - Files are processed one at a time
2. **Memory Management** - Content is processed in chunks
3. **File System Operations** - Minimal file I/O with caching
4. **Plugin Efficiency** - Plugins can be optimized for specific use cases

## Extension Points

The application provides several extension points:

1. **Custom Extractors** - Implement `ExtractorPlugin` for new extraction methods
2. **Custom Formatters** - Implement `TFormatter` for content transformation
3. **Custom Templates** - Create custom markdown templates
4. **Custom Generators** - Extend generation capabilities

## Best Practices

1. **Use Builder Pattern** - Leverage fluent configuration API
2. **Plugin Composition** - Combine multiple plugins for complex extraction
3. **Template Design** - Create reusable templates with clear placeholders
4. **Error Handling** - Implement proper error handling in custom plugins
5. **Testing** - Test plugins and configurations thoroughly

## Common Use Cases

1. **JSDoc Extraction** - Extract JSDoc comments from JavaScript/TypeScript
2. **Tag-based Documentation** - Use custom tags for documentation
3. **Multi-language Support** - Different extractors for different languages
4. **API Documentation** - Generate API docs from source code
5. **Code Examples** - Extract and format code examples

This flow documentation should help new developers understand the application architecture and contribute effectively to the codebase.
