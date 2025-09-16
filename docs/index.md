## Simple Docs Extractor

Below you will find the table of contents and links to all generated documentation files.

---


## Folders

- [config/](config/index.md)
  - [advanced-config.md](config/advanced-config.md)
  - [basic-example.md](config/basic-example.md)
  - [builder-example.md](config/builder-example.md)
- [flow/](flow/index.md)
  - [flow.md](flow/flow.md)
- [github-actions/](github-actions/index.md)
  - [automate-publishing.md](github-actions/automate-publishing.md)
- [plugins/](plugins/index.md)
  - [CreatingCustomPlugins.md](plugins/CreatingCustomPlugins.md)
  - [usage.md](plugins/usage.md)
  - [built-in-plugins/](plugins/built-in-plugins/index.md)
    - [CallbackExtractorPlugin.md](plugins/built-in-plugins/CallbackExtractorPlugin.md)
    - [CopyContentsPlugin.md](plugins/built-in-plugins/CopyContentsPlugin.md)
    - [RegexExtractorPlugin.md](plugins/built-in-plugins/RegexExtractorPlugin.md)
    - [TagExtractorPlugin.md](plugins/built-in-plugins/TagExtractorPlugin.md)
- [simple-docs-scraper/](simple-docs-scraper/index.md)
  - [builder/](simple-docs-scraper/builder/index.md)
    - [Builder.ts.md](simple-docs-scraper/builder/Builder.ts.md)
    - [TargetBuilder.ts.md](simple-docs-scraper/builder/TargetBuilder.ts.md)
    - [TemplateBuilder.ts.md](simple-docs-scraper/builder/TemplateBuilder.ts.md)
  - [config/](simple-docs-scraper/config/index.md)
    - [ConfigHelper.ts.md](simple-docs-scraper/config/ConfigHelper.ts.md)
  - [consts/](simple-docs-scraper/consts/index.md)
    - [defaults.ts.md](simple-docs-scraper/consts/defaults.ts.md)
  - [content/](simple-docs-scraper/content/index.md)
    - [ContentInjection.ts.md](simple-docs-scraper/content/ContentInjection.ts.md)
    - [TemplateContentExtractionContentMerger.ts.md](simple-docs-scraper/content/TemplateContentExtractionContentMerger.ts.md)
  - [formatters/](simple-docs-scraper/formatters/index.md)
    - [AddDoubleLinesFormatter.ts.md](simple-docs-scraper/formatters/AddDoubleLinesFormatter.ts.md)
    - [RecommendedFormatters.ts.md](simple-docs-scraper/formatters/RecommendedFormatters.ts.md)
    - [RemoveMultiLineCommentAsterisks.ts.md](simple-docs-scraper/formatters/RemoveMultiLineCommentAsterisks.ts.md)
  - [generators/](simple-docs-scraper/generators/index.md)
    - [DocFileGenerator.ts.md](simple-docs-scraper/generators/DocFileGenerator.ts.md)
    - [IndexContenGenerator.ts.md](simple-docs-scraper/generators/IndexContenGenerator.ts.md)
    - [IndexFileGenerator.ts.md](simple-docs-scraper/generators/IndexFileGenerator.ts.md)
  - [plugins/](simple-docs-scraper/plugins/index.md)
    - [CallbackExtractorPlugin.ts.md](simple-docs-scraper/plugins/CallbackExtractorPlugin.ts.md)
    - [CopyContentsPlugin.ts.md](simple-docs-scraper/plugins/CopyContentsPlugin.ts.md)
    - [DocumentContentExtractor.ts.md](simple-docs-scraper/plugins/DocumentContentExtractor.ts.md)
    - [RegexExtractorPlugin.ts.md](simple-docs-scraper/plugins/RegexExtractorPlugin.ts.md)
    - [TagExtractorPlugin.ts.md](simple-docs-scraper/plugins/TagExtractorPlugin.ts.md)
  - [processors/](simple-docs-scraper/processors/index.md)
    - [DocumentationCodeFileProcessor.ts.md](simple-docs-scraper/processors/DocumentationCodeFileProcessor.ts.md)
    - [MarkdownIndexProcessor.ts.md](simple-docs-scraper/processors/MarkdownIndexProcessor.ts.md)
  - [scanning/](simple-docs-scraper/scanning/index.md)
    - [DirectoryMarkdownScanner.ts.md](simple-docs-scraper/scanning/DirectoryMarkdownScanner.ts.md)
    - [FileScanner.ts.md](simple-docs-scraper/scanning/FileScanner.ts.md)
  - [services/](simple-docs-scraper/services/index.md)
    - [LocalesService.ts.md](simple-docs-scraper/services/LocalesService.ts.md)
    - [SimpleDocExtractor.ts.md](simple-docs-scraper/services/SimpleDocExtractor.ts.md)
  - [utils/](simple-docs-scraper/utils/index.md)
    - [createMarkdownLink.ts.md](simple-docs-scraper/utils/createMarkdownLink.ts.md)
    - [escapeRegexString.ts.md](simple-docs-scraper/utils/escapeRegexString.ts.md)
    - [ExcerptExtractor.ts.md](simple-docs-scraper/utils/ExcerptExtractor.ts.md)
    - [ExtensionReplacer.ts.md](simple-docs-scraper/utils/ExtensionReplacer.ts.md)
    - [listIndenterPrefix.ts.md](simple-docs-scraper/utils/listIndenterPrefix.ts.md)
- [templates/](templates/index.md)
  - [documentation-template.md](templates/documentation-template.md)
  - [index-template.md](templates/index-template.md)
  - [locales.md](templates/locales.md)


---

## About

A lightweight TypeScript library for extracting documentation from source files and organizing them into a structured output directory.

*Having trouble getting started? Send me an [email](mailto:ben.shepherd@gmx.com) or create an [issue](https://github.com/ben-shepherd/simple-docs-extractor/issues)*.

## Why this approach?

I built this library so I could write documentation directly in my source code, and have it automatically pulled out and organized for me.

This way, I can focus on coding while the library takes care of collecting and structuring the docs.

With GitHub Actions, the documentation is published to GitHub Pages automatically, so everything stays up to date with no extra effort.

## Documentation

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

### Basic Configuration with Minimal Configuration

```typescript
const service = SimpleDocExtractor
  .create(process.cwd())
  .target((target) => {
    target.cwd(path.join(process.cwd(), 'src'))
    target.outDir(path.join(process.cwd(), "docs"))
    target.patterns("**/*")
    target.createIndexFiles()
  })
  .addRecommendedFormatters()
  .buildService();

await service.start();
```

## Simple Doc Configuration Example

This is the same example as used in our [publish-docs.ts](./src/scripts/publish-docs.ts) script.

- Extracts content from <docs> from the top of the classes.
- Extracts content from <method> from the top of the methods.
- It also copies the README.md file to the root index file.
- It only targets js/ts files.

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

This file is auto generated. Do not edit manually.