# Configuration

The SimpleDocsExtractor uses a comprehensive configuration system to control how documentation is extracted, processed, and generated. This document covers all available configuration options.

## Table of Contents

- [Main Configuration Object](#main-configuration-object)
  - [Required Properties](#required-properties)
  - [Optional Properties](#optional-properties)
- [Target Configuration](#target-configuration)
  - [Target Properties](#target-properties)


## Main Configuration Object

The main configuration is defined by the `SimpleDocExtractorConfig` interface:

```typescript
interface SimpleDocExtractorConfig {
  baseDir: string;
  generators?: {
    index?: IndexGeneratorConfig;
    documentation?: DocumentationGeneratorConfig;
  };
  targets: Target[];
  formatters?: TFormatter[];
}
```

### Required Properties

- **`baseDir`** (string): The base directory for the project. Typically set to `process.cwd()`.
- **`targets`** (Target[]): Array of target configurations defining what files to process

### Optional Properties

- **`generators`** (object): Configuration for documentation and index file generation
- **`formatters`** (TFormatter[]): Array of formatter functions to process extracted content

## Target Configuration

Each target defines a set of files to process and where to output the generated documentation:

```typescript
type Target = {
  globOptions: GlobOptions & { cwd: string; extensions: string | string[] };
  outDir: string;
  createIndexFile: boolean;
  generators?: {
    index?: IndexGeneratorConfig;
    documentation?: DocumentationGeneratorConfig;
  };
  extraction?: DocumentContentExtractorConfig;
};
```

### Target Properties

- **`globOptions`** (object): File matching configuration
  - **`cwd`** (string): Working directory to search for files
  - **`extensions`** (string | string[]): File extensions to match (e.g., `"**/*.{js,ts}"` or `["**/*.js", "**/*.ts"]`)
  - **`ignore`** (string[]): Patterns to ignore (e.g., `["**/tests/**", "**/scripts/**"]`)

- **`outDir`** (string): Output directory for generated documentation files

- **`createIndexFile`** (boolean): Whether to create an index.md file for this target

- **`generators`** (object): Target-specific generator overrides
  - **`index`** (IndexGeneratorConfig): Override for index file generation
  - **`documentation`** (DocumentationGeneratorConfig): Override for documentation file generation

- **`extraction`** (DocumentContentExtractorConfig): Array of extractor plugins to use

## Index Generator Configuration

Controls how index files are generated:

```typescript
type IndexGeneratorConfig = {
  template: string;
  outDir?: string;
  searchAndReplace?: string;
  baseDir?: string;
  markdownLink?: boolean;
  filesHeading?: string;
  directoryHeading?: string;
  excerpt?: ExcerptExtractorConfig;
  lineCallback?: (fileNameEntry: string, lineNumber: number, excerpt?: string) => string;
  fileNameCallback?: (filePath: string) => string;
  flatten?: boolean;
  recursive?: boolean;
};
```

### Index Generator Properties

- **`template`** (string): Path to the template file for index generation
- **`outDir`** (string): Output directory (optional, uses target's outDir if not specified)
- **`searchAndReplace`** (string): Template placeholder to replace with content (default: `"%content%"`)
- **`baseDir`** (string): Base directory for relative path calculations
- **`markdownLink`** (boolean): Whether to generate markdown links for files
- **`filesHeading`** (string): Heading text for the files section (e.g., `"\n## Files\n"`)
- **`directoryHeading`** (string): Heading text for the directories section (e.g., `"\n## Folders\n"`)
- **`excerpt`** (ExcerptExtractorConfig): Configuration for generating file excerpts
- **`lineCallback`** (function): Custom function to format each line in the index
- **`fileNameCallback`** (function): Custom function to format file names
- **`flatten`** (boolean): Whether to flatten nested directory structures into a single list (default: `false`)
- **`recursive`** (boolean): Whether to process subdirectories recursively (default: `true`)

### Flatten Feature

The `flatten` option controls how nested directory structures are displayed in index files:

- **`flatten: true` (default)**: Lists all files and folders from the current directory and all nested subdirectories together in the same `index.md`, showing the entire structure as a single, flattened list (with indentation to indicate depth).
- **`flatten: false`** : Only lists the files and folders directly present in each directory's own `index.md`, maintaining a separate index file for every directory level.

## Documentation Generator Configuration

Controls how individual documentation files are generated:

```typescript
type DocumentationGeneratorConfig = {
  template?: string;
  outDir?: string;
};
```

### Documentation Generator Properties

- **`template`** (string): Path to the template file for documentation generation
- **`outDir`** (string): Output directory (optional, uses target's outDir if not specified)

## Excerpt Configuration

Controls how excerpts are generated for index files:

```typescript
type ExcerptExtractorConfig = {
  firstSentenceOnly?: boolean;
  addEllipsis?: boolean;
  length?: number;
};
```

### Excerpt Properties

- **`firstSentenceOnly`** (boolean): Whether to extract only the first sentence (default: `true`)
- **`addEllipsis`** (boolean): Whether to add ellipsis (...) for truncated content (default: `true`)
- **`length`** (number): Maximum length of the excerpt in characters (default: `75`)

## Extractor Plugins

Extractor plugins define how documentation content is extracted from source files. The system supports multiple extractor types:

### Tag Extractor Plugin

Extracts content between HTML-like tags:

```typescript
new TagExtractorPlugin({
  tag: "docs",
  searchAndReplace: "%content%",
  attributeFormat: "### **{value}**", // Optional
  defaultText: "No documentation available" // Optional
})
```

**Properties:**
- **`tag`** (string): The tag name to search for (e.g., "docs", "method")
- **`searchAndReplace`** (string): Template placeholder to replace with extracted content
- **`attributeFormat`** (string): Format for tag attributes (optional)
- **`defaultText`** (string): Default text when no content is found (optional)

**Example usage in source code:**
```typescript
/**
 * <docs>
 * This is documentation content that will be extracted.
 * </docs>
 */
```

### Regex Extractor Plugin

Extracts content using regular expressions:

```typescript
new RegexExtractorPlugin({
  pattern: /\/\*\*([\s\S]*?)\*\//g,
  searchAndReplace: "%content%",
  defaultText: "No documentation available" // Optional
})
```

**Properties:**
- **`pattern`** (RegExp): Regular expression pattern to match content
- **`searchAndReplace`** (string): Template placeholder to replace with extracted content
- **`defaultText`** (string): Default text when no content is found (optional)

### Callback Extractor Plugin

Uses a custom callback function to extract content:

```typescript
new CallbackExtractor({
  callback: (content: string) => {
    // Custom extraction logic
    return extractedContent;
  },
  searchAndReplace: "%content%",
  defaultText: "No documentation available" // Optional
})
```

**Properties:**
- **`callback`** (function): Custom function to extract content from source
- **`searchAndReplace`** (string): Template placeholder to replace with extracted content
- **`defaultText`** (string): Default text when no content is found (optional)

## Formatters

Formatters process the extracted content before it's written to files. Available formatters include:

### RemoveMultiLineCommentAsterisks

Removes leading asterisks and whitespace from multi-line comments:

```typescript
import { RemoveMultiLineCommentAsterisks } from "@/simple-docs-scraper/formatters/RemoveMultiLineCommentAsterisks.js";

// Usage in config
formatters: [RemoveMultiLineCommentAsterisks]
```

### AddDoubleLinesFormatter

Adds extra blank lines between content lines (except inside code blocks):

```typescript
import { AddDoubleLinesFormatter } from "@/simple-docs-scraper/formatters/AddDoubleLinesFormatter.js";

// Usage in config
formatters: [AddDoubleLinesFormatter]
```

## Example Configuration

Here's a complete example configuration from the `publish-docs.ts` script:

```typescript
export const DEFAULT_CONFIG: SimpleDocExtractorConfig = {
  baseDir: process.cwd(),
  generators: {
    index: {
      template: path.join(process.cwd(), "src/templates/index.template.md"),
      markdownLink: true,
      filesHeading: "\n## Files\n",
      directoryHeading: "\n## Folders\n",
      flatten: false, // Set to true to flatten nested directory structure
      recursive: true,
      excerpt: {
        length: 75,
        addEllipsis: false,
        firstSentenceOnly: true,
      },
    },
    documentation: {
      template: path.join(process.cwd(), "src/templates/documentation.template.md"),
    },
  },
  targets: [
    {
      globOptions: {
        cwd: path.join(process.cwd(), "src"),
        extensions: "**/*.{js,ts}",
        ignore: ["**/tests/**", "**/scripts/**"],
      },
      outDir: path.join(process.cwd(), "docs"),
      createIndexFile: true,
      extraction: [
        new TagExtractorPlugin({
          tag: "docs",
          searchAndReplace: "%content%",
        }),
        new TagExtractorPlugin({
          tag: "method",
          searchAndReplace: "%methods%",
          attributeFormat: "### **{value}**",
        }),
      ],
    },
  ],
  formatters: [RemoveMultiLineCommentAsterisks, AddDoubleLinesFormatter],
};
```

This configuration:
- Processes JavaScript and TypeScript files in the `src` directory
- Excludes test and script files
- Extracts content from `<docs>` and `<method>` tags
- Generates documentation files in the `docs` directory
- Creates index files with custom headings and excerpts
- Applies formatters to clean up the extracted content
