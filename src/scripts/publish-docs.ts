import path from 'path';
import { SimpleDocsScraper, SimpleDocsScraperConfig } from '../simple-docs-scraper/services/SimpleDocsScraper.js';

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
} satisfies SimpleDocsScraperConfig;

console.log('Starting documentation generation...');
console.log('Cwd: ', process.cwd());

const scraper = new SimpleDocsScraper(config);
await scraper.start().then(result => {
    console.log('Success count: ', result.successCount);
    console.log('Total count: ', result.totalCount);
    console.log('Logs:');
    result.logs.forEach(log => {
        console.log(log);
    });
});
