# Simple Docs Extractor

A lightweight TypeScript library for extracting documentation from source files and organizing them into a structured output directory.

*This project is currently in development.*

## Documentation

Documentation is available [here](docs/index.md).

View on [GitHub Pages](https://ben-shepherd.github.io/simple-docs-extractor/).

## Features

- **Easy Documentation Writing** - Write docs directly in your code using simple tags like `<docs>` and `<method>`
- **Beautiful Output** - Automatically creates clean, organized documentation files with your own custom templates
- **Smart Organization** - Keeps your docs organized by automatically creating index pages and preserving your folder structure
- **Works with Any Code** - Extract documentation from JavaScript, TypeScript, and other files using flexible patterns
- **Clean Content** - Automatically removes messy comment formatting and makes your docs look professional
- **Simple Setup** - Easy-to-use builder pattern that lets you configure everything in just a few lines
- **TypeScript Ready** - Built with TypeScript for better development experience and fewer errors
- **Multiple Projects** - Handle different parts of your codebase with separate documentation setups

## Examples

### Basic Configuration Using the Builder Pattern

```typescript
import path from "path";
import { SimpleDocExtractor } from "@/simple-docs-scraper/index.js";
import { TagExtractorPlugin } from "@/simple-docs-scraper/extractors/TagExtractorPlugin.js";

export const DEFAULT_CONFIG = SimpleDocExtractor
  .create(process.cwd())
    .indexTemplate((template) => {
      template.useFile(path.join(process.cwd(), "src/templates/index.template.md"));
      template.useMarkdownLinks();
    })
    .documentationTemplate((template) => {
      template.useFile(path.join(process.cwd(), "src/templates/documentation.template.md"));
    })
  .target((target) => {
    target.cwd(path.join(process.cwd(), 'src'))
    target.patterns("**/*.{js,ts}")
    target.ignores(["**/tests/**", "**/scripts/**"])
    target.outDir(path.join(process.cwd(), "docs"))
    target.createIndexFiles()
    target.plugins([
      new TagExtractorPlugin({
        tag: "docs",
        searchAndReplace: "%content%",
      }),
      new TagExtractorPlugin({
        tag: "method",
        searchAndReplace: "%methods%",
        attributeFormat: "### **{value}**",
      }),
    ])
  })
  .addRecommendedFormatters()
  .buildConfig();

new SimpleDocExtractor(config).start()
    .then(result => {
        console.log('Success count: ', result.successCount);
        console.log('Total count: ', result.totalCount);
        console.log('Missing documentation files: ', result.missingDocumentationFiles);
        console.log('Logs:');
        result.logs.forEach(log => {
            console.log(log);
        });
    });
```