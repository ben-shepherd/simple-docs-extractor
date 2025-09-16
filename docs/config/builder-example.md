# Builder Pattern Configuration

The SimpleDocsExtractor provides a fluent builder pattern API that makes configuration more readable and maintainable. This approach allows you to chain configuration methods together, making complex setups easier to understand and modify.

## Table of Contents

- [Overview](#overview)
- [Basic Usage](#basic-usage)
  - [Creating a Simple Configuration](#creating-a-simple-configuration)
- [Builder Methods](#builder-methods)
  - [Main Builder (`Builder`)](#main-builder-builder)
  - [Target Builder (`TargetBuilder`)](#target-builder-targetbuilder)
  - [Template Builder (`TemplateBuilder`)](#template-builder-templatebuilder)
- [Benefits of the Builder Pattern](#benefits-of-the-builder-pattern)


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

const builder = SimpleDocExtractor
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
        target.indexTemplate((template) => {
            template.flatten(true) // Enable flattening for this target
        })
    })
    .addRecommendedFormatters()
    .buildConfig();

// Create the service
const config = builder.buildConfig();

// Alternatively, you can build the service directly
const extractor = builder.buildService();

// Start the service
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

#### `flatten(flatten: boolean)`
Sets whether to flatten the template structure, showing all nested files in a single list.

```typescript
template.flatten(true) // Flattens nested directory structure
```

## Benefits of the Builder Pattern

1. **Readability**: Method chaining makes the configuration flow clear and easy to follow
2. **Flexibility**: Easy to add or remove configuration options
3. **Type Safety**: Full TypeScript support with autocomplete
4. **Maintainability**: Configuration is self-documenting and easy to modify
5. **Reusability**: Can easily create multiple configurations for different scenarios
