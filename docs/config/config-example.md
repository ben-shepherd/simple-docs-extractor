# Configuration Example

This document provides a simple example of how to configure the SimpleDocsExtractor.

## Basic Configuration

Here's a minimal configuration that processes TypeScript and JavaScript files:

```typescript
import { TagExtractorPlugin } from "@/simple-docs-scraper/extractors/TagExtractorPlugin.js";
import { RecommendedFormatters } from "@/simple-docs-scraper/formatters/RecommendedFormatters.js";
import { SimpleDocExtractorConfig } from "@/simple-docs-scraper/types/config.js";
import path from "path";

const config: SimpleDocExtractorConfig = {
  baseDir: process.cwd(),
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
      ],
    },
  ],
  formatters: RecommendedFormatters.recommended(),
};
```

## Configuration Breakdown

### Required Properties

- **`baseDir`**: The base directory for your project (usually `process.cwd()`)
- **`targets`**: Array of target configurations defining what files to process

### Target Configuration

Each target specifies:
- **`globOptions`**: File matching rules
  - `cwd`: Directory to search in
  - `extensions`: File types to process (e.g., `"**/*.{js,ts}"`)
  - `ignore`: Patterns to exclude (e.g., `["**/tests/**"]`)
- **`outDir`**: Where to save generated documentation
- **`createIndexFile`**: Whether to create an index.md file
- **`extraction`**: How to extract documentation from source files

### Extractor Plugins

The most common extractor is `TagExtractorPlugin`, which extracts content between HTML-like tags:

```typescript
// In your source code:
/**
 * <docs>
 * This documentation will be extracted.
 * </docs>
 */

// In your config:
new TagExtractorPlugin({
  tag: "docs",
  searchAndReplace: "%content%",
})
```

### Formatters

Formatters clean up the extracted content. Common ones include:
- `RemoveMultiLineCommentAsterisks`: Removes comment formatting
- `AddDoubleLinesFormatter`: Adds spacing between content

### Alternative, you can use the recommended formatters which include the above formatters.

Use the `RecommendedFormatters` class to get the recommended formatters.

## Usage

```typescript
import { SimpleDocExtractor } from "@/simple-docs-scraper/index.js";

const extractor = new SimpleDocExtractor(config);
const result = await extractor.start();
```

For more advanced configuration options, see [advanced-config.md](./advanced-config.md).
