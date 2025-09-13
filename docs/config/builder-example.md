# Builder Pattern Configuration

The SimpleDocsExtractor provides a fluent builder pattern API that makes configuration more readable and maintainable. This approach allows you to chain configuration methods together, making complex setups easier to understand and modify.

## Overview

The builder pattern consists of three main builder classes:

- **`Builder`**: Main configuration builder for the entire extractor
- **`TargetBuilder`**: Configures individual processing targets
- **`TemplateBuilder`**: Configures template settings for index and documentation files

## Basic Usage

### Creating a Simple Configuration

```typescript
import { SimpleDocExtractor } from "@/simple-docs-scraper/index.js";
import { TagExtractorPlugin } from "@/simple-docs-scraper/extractors/TagExtractorPlugin.js";

const config = SimpleDocExtractor
    .create(process.cwd())
    .target((target) => {
        target.cwd("src")
        target.patterns("**/*.{js,ts}")
        target.outDir("docs")
        target.createIndexFiles()
        target.plugins([
            new TagExtractorPlugin({
                tag: "docs",
                searchAndReplace: "%content%",
            }),
        ])
    })
    .addRecommendedFormatters()
    .buildConfig();

const extractor = new SimpleDocExtractor(config);
const result = await extractor.start();
```

### Direct Service Creation

You can also build the service directly without creating a config object:

```typescript
const extractor = SimpleDocExtractor
    .create(process.cwd())
    .target((target) => {
        target.cwd("src")
        target.patterns("**/*.{js,ts}")
        target.outDir("docs")
        target.createIndexFiles()
    })
    .addRecommendedFormatters()
    .buildService();

const result = await extractor.start();
```

## Builder Methods

### Main Builder (`Builder`)

The main builder provides methods to configure the overall extractor behavior:

#### `target(callback: TargetCallback)`
Adds a new processing target. Each target defines a set of files to process and where to output the results.

```typescript
.target((target) => {
    target.cwd("src")
    target.patterns("**/*.{js,ts}")
    target.outDir("docs")
})
```

#### `indexTemplate(callback: TemplateCallback)`
Configures the global index template used for generating index files.

```typescript
.indexTemplate((template) => {
    template.useFile("src/templates/index.template.md")
    template.useMarkdownLinks()
    template.filesHeading("\n## Files\n")
    template.directoryHeading("\n## Folders\n")
})
```

#### `documentationTemplate(callback: TemplateCallback)`
Configures the global documentation template used for generating individual documentation files.

```typescript
.documentationTemplate((template) => {
    template.useFile("src/templates/documentation.template.md")
})
```

#### `addFormatters(formatters: TFormatter | TFormatter[])`
Adds custom formatters to process the extracted content.

```typescript
.addFormatters(customFormatter)
.addFormatters([formatter1, formatter2])
```

#### `addRecommendedFormatters()`
Adds the recommended set of formatters that handle common formatting tasks.

```typescript
.addRecommendedFormatters()
```

#### `buildConfig(): SimpleDocExtractorConfig`
Builds and returns the configuration object.

#### `buildService(): SimpleDocExtractor`
Builds and returns a configured SimpleDocExtractor instance.

### Target Builder (`TargetBuilder`)

The target builder configures individual processing targets:

#### `patterns(patterns: string | string[])`
Sets the file patterns to match. Uses glob syntax.

```typescript
target.patterns("**/*.{js,ts}")
target.patterns(["**/*.js", "**/*.ts"])
```

#### `cwd(cwd: string)`
Sets the current working directory for file searching.

```typescript
target.cwd("src")
```

#### `ignores(ignore: string | string[])`
Sets patterns to ignore during file processing.

```typescript
target.ignores(["**/tests/**", "**/scripts/**"])
```

#### `outDir(outDir: string)`
Sets the output directory for generated documentation.

```typescript
target.outDir("docs/js")
```

#### `globOptions(globOptions: GlobOptions)`
Sets additional glob options for file matching.

```typescript
target.globOptions({ dot: true, follow: true })
```

#### `createIndexFiles()`
Enables automatic creation of index files for directories.

```typescript
target.createIndexFiles()
```

#### `plugins(plugins: ExtractorPlugin[] | ExtractorPlugin)`
Adds extractor plugins to process files.

```typescript
target.plugins([
    new TagExtractorPlugin({
        tag: "docs",
        searchAndReplace: "%content%",
    }),
])
```

#### `indexTemplate(callback: TemplateCallback)`
Configures a target-specific index template.

```typescript
target.indexTemplate((template) => {
    template.useFile("src/templates/custom-index.template.md")
    template.useMarkdownLinks()
})
```

#### `documentationTemplate(callback: TemplateCallback)`
Configures a target-specific documentation template.

```typescript
target.documentationTemplate((template) => {
    template.useFile("src/templates/custom-doc.template.md")
})
```

#### `useDocumentationTemplate(templatePath: string)`
Convenience method to set a documentation template by file path.

```typescript
target.useDocumentationTemplate("src/templates/documentation.template.md")
```

### Template Builder (`TemplateBuilder`)

The template builder configures template settings:

#### `useFile(file: string)`
Sets the template file path.

```typescript
template.useFile("src/templates/index.template.md")
```

#### `useMarkdownLinks()`
Enables markdown link generation.

```typescript
template.useMarkdownLinks()
```

#### `filesHeading(filesHeading: string)`
Sets the heading text for files sections.

```typescript
template.filesHeading("\n## Files\n")
```

#### `directoryHeading(directoryHeading: string)`
Sets the heading text for directory sections.

```typescript
template.directoryHeading("\n## Folders\n")
```

#### `excerpt(excerpt: ExcerptExtractorConfig)`
Configures excerpt extraction settings.

```typescript
template.excerpt({
    length: 120,
    addEllipsis: false,
    firstSentenceOnly: true,
})
```

#### `lineCallback(lineCallback: LineCallback)`
Sets a callback function to process individual lines.

```typescript
template.lineCallback((line) => line.trim())
```

#### `fileNameCallback(fileNameCallback: FileNameCallback)`
Sets a callback function to process file names.

```typescript
template.fileNameCallback((fileName) => fileName.replace('.ts', ''))
```

## Advanced Examples

### Multiple Targets with Different Configurations

```typescript
const config = SimpleDocExtractor
    .create(process.cwd())
    .target((target) => {
        target.cwd("src")
        target.patterns("**/*.{js,ts}")
        target.ignores(["**/tests/**", "**/scripts/**"])
        target.outDir("docs/js")
        target.createIndexFiles()
        target.plugins([
            new TagExtractorPlugin({
                tag: "docs",
                searchAndReplace: "%content%",
            }),
        ])
    })
    .target((target) => {
        target.cwd('scripts')
        target.patterns("**/*.js")
        target.outDir("docs/scripts")
        target.indexTemplate((template) => {
            template.useFile("src/templates/script-index.template.md")
            template.useMarkdownLinks()
        })
        target.documentationTemplate((template) => {
            template.useFile("src/templates/script-doc.template.md")
        })
    })
    .addRecommendedFormatters()
    .buildConfig();
```

### Custom Formatters

```typescript
const customFormatter: TFormatter = (config: FormatterConfig) => {
    // Custom formatting logic
    return config.content.toUpperCase();
};

const config = SimpleDocExtractor
    .create(process.cwd())
    .target((target) => {
        target.cwd("src")
        target.patterns("**/*.{js,ts}")
        target.outDir("docs")
    })
    .addRecommendedFormatters()
    .addFormatters(customFormatter)
    .buildConfig();
```

## Benefits of the Builder Pattern

1. **Readability**: Method chaining makes the configuration flow clear and easy to follow
2. **Flexibility**: Easy to add or remove configuration options
3. **Type Safety**: Full TypeScript support with autocomplete
4. **Maintainability**: Configuration is self-documenting and easy to modify
5. **Reusability**: Can easily create multiple configurations for different scenarios

## Migration from Object Configuration

If you're migrating from object-based configuration, the builder pattern provides the same functionality with improved readability:

**Before (Object Configuration):**
```typescript
const config: SimpleDocExtractorConfig = {
  baseDir: process.cwd(),
  targets: [
    {
      globOptions: {
        cwd: "src",
        patterns: "**/*.{js,ts}",
        ignore: ["**/tests/**"],
      },
      outDir: "docs",
      createIndexFile: true,
      plugins: [
        new TagExtractorPlugin({
          tag: "docs",
          searchAndReplace: "%content%",
        }),
      ],
    },
  ],
  formatters: RecommendedFormatters.recommended(),
};
```

**After (Builder Pattern):**
```typescript
const config = SimpleDocExtractor
    .create(process.cwd())
    .target((target) => {
        target.cwd("src")
        target.patterns("**/*.{js,ts}")
        target.ignores(["**/tests/**"])
        target.outDir("docs")
        target.createIndexFiles()
        target.plugins([
            new TagExtractorPlugin({
                tag: "docs",
                searchAndReplace: "%content%",
            }),
        ])
    })
    .addRecommendedFormatters()
    .buildConfig();
```

The builder pattern makes the configuration more readable and easier to understand at a glance.
