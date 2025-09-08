import { beforeEach, describe, expect, test } from "@jest/globals";
import { SimpleDocsScraper, SimpleDocsScraperConfig } from "../simple-docs-scraper/services/SimpleDocsScraper.js";

const defaultConfig: SimpleDocsScraperConfig = {
    extraction: {
        extractMethod: 'tags',
        startTag: '<docs>',
        endTag: '</docs>',
    },
    injection: {
        injectInto: '%content%',
        outDir: './docs/js-files',
        template: './templates/index.template.md',
    },
    templates: {
        index: './templates/index.template.md',
        documentation: './templates/documentation.template.md',
    },
    targets: [
        {
            globOptions: {
                cwd: './js-files',
                extensions: '^.+\\.(js|ts)$',
            },
            outDir: './docs/js-files',
            createIndexFile: true,
        },
        {
            globOptions: {
                cwd: './twig-files',
                extensions: '^.+\\.(twig)$',
            },
            outDir: './docs/twig-files',
            createIndexFile: true,
        }
    ]
}

describe("Example Test Suite", () => {
    let scraper!: SimpleDocsScraper;

    beforeEach(() => {
        scraper = new SimpleDocsScraper(defaultConfig);
    });

    describe("config", () => {
        test("should be able to configure the scraper", () => {
            const config = scraper.getConfig();

            expect(config).toBe(defaultConfig);
        })
    });

});
