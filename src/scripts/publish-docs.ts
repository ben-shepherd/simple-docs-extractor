import { MultiLineCommentClear, SimpleDocsScraper, SimpleDocsScraperConfig } from '@/simple-docs-scraper/index.js';
import path from 'path';

export const DEFAULT_CONFIG: SimpleDocsScraperConfig = {
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
            template: path.join(process.cwd(), 'src/templates/index.template.md'),
            markdownLink: true,
            filesHeading: '\n## Files\n',
            directoryHeading: '\n## Folders\n',
            excerpt: {
                length: 75,
                addEllipsis: false,
                firstSentenceOnly: true
            },
        },
        documentation: {
            template: path.join(process.cwd(), 'src/templates/documentation.template.md'),
        },
    },
    targets: [{
        globOptions: {
            cwd: path.join(process.cwd(), 'src'),
            extensions: '**/*.{js,ts}',
            ignore: ['**/tests/**', '**/scripts/**'],
        },
        outDir: path.join(process.cwd(), 'docs'),
        createIndexFile: true,
    }],
    formatters: [MultiLineCommentClear],
};

export const publishDocs = async (config: SimpleDocsScraperConfig = DEFAULT_CONFIG) => {

    const result = await new SimpleDocsScraper(config).start()
    console.log('Success count: ', result.successCount);
    console.log('Total count: ', result.totalCount);
    console.log('Logs:');

    result.logs.forEach(log => {
        console.log(log);
    });

    return result
}