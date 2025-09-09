# Simple Docs Scraper

A lightweight TypeScript library for extracting documentation from source files and organizing them into a structured output directory.

*This project is currently in development.*

## Documentation

Documentation is available [here](docs/index.md).

## Example Publish Docs Script

```typescript
import path from 'path';
import { SimpleDocsScraper, MultiLineCommentClear } from '../../dist/index.js';

const config = {
    baseDir: process.cwd(),
    extraction: {
        extractMethod: 'tags',
        startTag: '<docs>',
        endTag: '</docs>',
    },
    searchAndReplace: {
        replace: '%content%',
    },
    generators: {
        index: {
            template: path.join(process.cwd(), 'templates/index.template.md'),
            fileNameAsLink: true,
        },
        documentation: {
            template: path.join(process.cwd(), 'templates/documentation.template.md'),
        },
    },
    targets: [{
        globOptions: {
            cwd: path.join(process.cwd(), 'src/simple-docs-scraper'),
            extensions: '**/*.{js,ts}',
        },
        outDir: path.join(process.cwd(), 'docs'),
        createIndexFile: true,
    }],
    formatters: [MultiLineCommentClear],
};

new SimpleDocsScraper(config).start().then(result => {
    console.log('Success count: ', result.successCount);
    console.log('Total count: ', result.totalCount);
    console.log('Logs:');
    result.logs.forEach(log => {
        console.log(log);
    });
});

```

## Planned features

- Copy documents from existing directory to desired directory
- Add support for methods, types, interfaces by extending tags, or another appropriate format
- Add the ability to add plugins for generating documentation for specific languages
