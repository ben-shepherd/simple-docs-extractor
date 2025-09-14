# Simple Docs Extractor

A lightweight TypeScript library for extracting documentation from source files and organizing them into a structured output directory.

*Having trouble getting started? Send me an [email](mailto:ben.shepherd@gmx.com) or create an [issue](https://github.com/ben-shepherd/simple-docs-extractor/issues).

## Why this approach?

I built this library so I could write documentation directly in my source code, and have it automatically pulled out and organized for me.

This way, I can focus on coding while the library takes care of collecting and structuring the docs.

With GitHub Actions, the documentation is published to GitHub Pages automatically, so everything stays up to date with no extra effort.

## Documentation

Read more [here](docs/index.md).

View the documentation on [GitHub Pages](https://ben-shepherd.github.io/simple-docs-extractor/).

## Features

- **Easy Documentation Writing** - Write docs directly in your code using simple tags like `<docs>` and `<method>`
- **Beautiful Output** - Automatically creates clean, organized documentation files with your own custom templates
- **Smart Organization** - Keeps your docs organized by automatically creating index pages and preserving your folder structure
- **Works with Any Code** - Extract documentation from JavaScript, TypeScript, and other files using flexible patterns
- **Clean Content** - Automatically removes messy comment formatting and makes your docs look professional
- **Simple Setup** - Easy-to-use builder pattern that lets you configure everything in just a few lines
- **TypeScript Ready** - Built with TypeScript for better development experience and fewer errors
- **Multiple Projects** - Handle different parts of your codebase with separate documentation setups

## Proof is in the pudding

- The entirity of this project's documentation is powered by this library.
- (Apart from some pages that are manually written )

## Examples

### Basic Configuration Using the Builder Pattern

```typescript
import path from "path";
import { SimpleDocExtractor } from "@/simple-docs-scraper/index.js";
import { TagExtractorPlugin } from "@/simple-docs-scraper/extractors/TagExtractorPlugin.js";
import { CopyContentsPlugin } from "@/simple-docs-scraper/extractors/CopyContentsPlugin.js";

export const DEFAULT_CONFIG = SimpleDocExtractor
  .create(process.cwd())
    // Define our global templates (This can also be done on a target level)
    .indexTemplate((template) => {
      template.useFile(path.join(process.cwd(), "src/templates/index.template.md"));
      template.useMarkdownLinks();
    })
    .documentationTemplate((template) => {
      template.useFile(path.join(process.cwd(), "src/templates/documentation.template.md"));
    })
  // Define our target(s) to extract documentation from
  .target((target) => {
    target.cwd(path.join(process.cwd(), 'src')) // The directory to search for files to extract documentation from
    target.outDir(path.join(process.cwd(), "docs")) // The directory to output the generated documentation to
    target.patterns("**/*.{js,ts}") // The patterns to match files to extract documentation from
    target.ignores(["**/tests/**", "**/scripts/**"]) // The patterns to ignore when searching for files to extract documentation from
    target.createIndexFiles() // Whether to create an index.md file for this target
    target.plugins([ // The plugins to use when extracting documentation
      new TagExtractorPlugin({
        tag: "docs",
        searchAndReplace: "%content%",
      }),
      new TagExtractorPlugin({
        tag: "method",
        searchAndReplace: "%methods%",
        attributeFormat: "### **{value}**",
      })
    ])
    // Define the template to use for the root index file
    target.rootIndexTemplate((template) => {
      template.useFile(path.join(process.cwd(), "src/templates/root-index.template.md")); // The template to use for the root index file
      template.useMarkdownLinks(); // Whether to use markdown links in the root index file
      template.plugins( // The plugins to use when generating the root index file
        new CopyContentsPlugin({
          fileToCopy: path.join(process.cwd(), "README.md"),
          searchAndReplace: "%readme%",
        }),
      )
    })
  })
  .addRecommendedFormatters() // Add the recommended formatters to the configuration
  .buildConfig(); // Build the configuration

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

---

## Table of Contents

This is the index file for the generated documentation. Below you will find the table of contents and links to all generated documentation files.

---


## Files

- [automate-publishing.md](automate-publishing.md)



---

This file is auto generated. Do not edit manually.