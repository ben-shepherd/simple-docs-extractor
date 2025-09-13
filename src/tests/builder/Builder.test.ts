import { TagExtractorPlugin } from "@/simple-docs-scraper/extractors/TagExtractorPlugin.js";
import { FormatterConfig, SimpleDocExtractor, TFormatter } from "@/simple-docs-scraper/index.js";
import { beforeEach, describe, expect, test } from "@jest/globals";

describe("Builder", () => {
    let mockFormatter: TFormatter;

    beforeEach(() => {
        mockFormatter = (config: FormatterConfig) => config.content
    });

    describe("config", () => {
        test("should be able to configure the builder", () => {
            const config = SimpleDocExtractor
                .create(process.cwd())
                .indexTemplate((template) => {
                    template.useFile("src/templates/index.template.md")
                    template.useMarkdownLinks()
                    template.filesHeading("\n## Files\n")
                    template.directoryHeading("\n## Folders\n")
                    template.excerpt({
                        length: 120,
                        addEllipsis: false,
                        firstSentenceOnly: true,
                    })
                })
                .documentationTemplate((template) => {
                    template.useFile("src/templates/documentation.template.md")
                })
                .target((target) => {
                    target.cwd("src")
                    target.patterns("**/*.{js,ts}")
                    target.ignores(["**/tests/**", "**/scripts/**"])
                    target.outDir("docs/js")
                    target.createIndexFiles()
                    target.globOptions({})
                    target.plugins([
                        new TagExtractorPlugin({
                            searchAndReplace: "%content%",
                            tag: "docs",
                        }),
                    ])
                })
                .target((target) => {
                    target.cwd('scripts')
                    target.patterns("**/*.js")
                    target.indexTemplate((template) => {
                        template.useFile("src/templates/index.template.md")
                        template.useMarkdownLinks()
                    })
                    target.documentationTemplate((template) => {
                        template.useFile("src/templates/documentation.template.md")
                    })
                })
                .addRecommendedFormatters()
                .addFormatters(mockFormatter)
                .buildConfig();

            expect(config).toBeDefined();
            expect(config.targets).toHaveLength(2);

            expect(config.targets[0].globOptions).toBeDefined();
            expect(config.targets[0].globOptions.cwd).toBe("src");
            expect(config.targets[0].globOptions.patterns).toBe("**/*.{js,ts}");
            expect(config.targets[0].globOptions.ignore).toContain("**/tests/**");
            expect(config.targets[0].globOptions.ignore).toContain("**/scripts/**");
            expect(config.targets[0].outDir).toBe("docs/js");
            expect(config.targets[0].createIndexFile).toBe(true);
            expect(config.targets[0].plugins).toHaveLength(1);

            expect(config.templates?.index).toBeDefined();
            expect(config.templates?.index?.templatePath).toBe("src/templates/index.template.md");
            expect(config.templates?.index?.markdownLinks).toBe(true);
            expect(config.templates?.index?.filesHeading).toBe("\n## Files\n");
            expect(config.templates?.index?.directoryHeading).toBe("\n## Folders\n");
            expect(config.templates?.index?.excerpt).toBeDefined();
            expect(config.templates?.index?.excerpt?.length).toBe(120);
            expect(config.templates?.index?.excerpt?.addEllipsis).toBe(false);
            expect(config.templates?.index?.excerpt?.firstSentenceOnly).toBe(true);

            expect(config.templates?.documentation).toBeDefined();
            expect(config.templates?.documentation?.templatePath).toBe("src/templates/documentation.template.md");

            expect(config.formatters).toHaveLength(3);
        })

        test("should be able to define templates in the target", () => {
            const config = SimpleDocExtractor
                .create(process.cwd())
                .target((target) => {
                    target.indexTemplate((template) => {
                        template.useFile("src/templates/index.template.md")
                        template.useMarkdownLinks()
                    })
                    target.useDocumentationTemplate("src/templates/documentation.template.md")
                })
                .buildConfig();

            expect(config).toBeDefined();
            expect(config.targets).toHaveLength(1);

            expect(config.targets[0].templates?.index).toBeDefined();
            expect(config.targets[0].templates?.index?.templatePath).toBe("src/templates/index.template.md");
            expect(config.targets[0].templates?.index?.markdownLinks).toBe(true);

            expect(config.targets[0].templates?.documentation).toBeDefined();
            expect(config.targets[0].templates?.documentation?.templatePath).toBe("src/templates/documentation.template.md");
        })
    });
});
