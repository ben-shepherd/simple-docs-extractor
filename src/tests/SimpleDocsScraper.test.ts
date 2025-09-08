import { beforeEach, describe, expect, test } from "@jest/globals";
import { SimpleDocsScraper } from "../simple-docs-scraper/services/SimpleDocsScraper.js";

const defaultConfig = {
    extraction: {
        method: 'tags',
        startTag: '<docs>',
        endTag: '</docs>',
    },
    injection: {
        content: '%content%',
    },
    templates: {
        index: './templates/index.template.md',
        documentation: './templates/documentation.template.md',
    },
    targets: [
        {
            globOptions: {
                path: './js-files',
                extensionsPattern: '^.+\\.(js|ts)$',
            },
            outDir: './docs/js-files',
            createIndexFile: true,
        },
        {
            globOptions: {
                path: './twig-files',
                extensionsPattern: '^.+\\.(twig)$',
            },
            outDir: './docs/twig-files',
            createIndexFile: true,
        }
    ]
}

describe("Example Test Suite", () => {
    const scraper!: SimpleDocsScraper;

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
