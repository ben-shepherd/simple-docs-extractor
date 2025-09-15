import { TagExtractorPlugin } from "@/simple-docs-scraper/plugins/TagExtractorPlugin.js";
import { LocalesService } from "@/simple-docs-scraper/services/LocalesService.js";
import { beforeEach, describe, expect, test } from "@jest/globals";
import fs from "fs";
import path from "path";
import {
  SimpleDocExtractor,
  Target,
} from "../simple-docs-scraper/services/SimpleDocExtractor.js";
import { SimpleDocExtractorConfig } from "../simple-docs-scraper/types/config.t.js";
import { deleteOutputFiles } from "./helpers/deleteOutputFiles.js";
import { getOutputPath } from "./helpers/getOutputPath.js";

const TEMPLATE_CONTENT = `Start.
%content%
End.`;
const TEMPLATE_CONTENT2 = `Begin.
%content%
Finish.`;

const plugins = [
  new TagExtractorPlugin({
    searchAndReplace: "%content%",
    tag: "docs",
  }),
];

const jsFilesTarget: Target = {
  globOptions: {
    cwd: path.join(process.cwd(), "src/tests/files/js-files"),
    patterns: "**/*.{js,ts}",
  },
  outDir: getOutputPath("js-files"),
  createIndexFile: true,
  plugins,
};

const twigFilesTarget: Target = {
  globOptions: {
    cwd: path.join(process.cwd(), "src/tests/files/twig-files"),
    patterns: "**/*.html.twig",
  },
  outDir: getOutputPath("twig-files"),
  createIndexFile: true,
  plugins,
};

export const defaultConfig: SimpleDocExtractorConfig = {
  baseDir: path.join(process.cwd(), "src/tests/files"),
  templates: {
    index: {
      templatePath: getOutputPath("index.template.md"),
    },
    documentation: {
      templatePath: getOutputPath("documentation.template.md"),
    },
  },
  targets: [jsFilesTarget, twigFilesTarget],
};

describe("Example Test Suite", () => {
  let scraper!: SimpleDocExtractor;

  beforeEach(() => {
    deleteOutputFiles();

    scraper = new SimpleDocExtractor(defaultConfig);

    // Create a mock template file
    fs.writeFileSync(getOutputPath("index.template.md"), TEMPLATE_CONTENT);
    fs.writeFileSync(
      getOutputPath("documentation.template.md"),
      TEMPLATE_CONTENT,
    );

    // Createa second mock template file
    fs.writeFileSync(getOutputPath("index2.template.md"), TEMPLATE_CONTENT2);
    fs.writeFileSync(
      getOutputPath("documentation2.template.md"),
      TEMPLATE_CONTENT2,
    );
  });

  describe("config", () => {
    test("should be able to configure the scraper", () => {
      const config = scraper.getConfig();

      expect(config).toBe(defaultConfig);
    });

    test("should be able to configure target with it's own templates", async () => {
      scraper = new SimpleDocExtractor({
        ...defaultConfig,
        targets: [
          {
            ...jsFilesTarget,
            templates: {
              documentation: {
                templatePath: getOutputPath("documentation2.template.md"),
              },
              index: {
                templatePath: getOutputPath("index2.template.md"),
              },
            },
          },
        ],
      });
      await scraper.start();

      const indexContent = fs.readFileSync(
        getOutputPath("js-files/index.md"),
        "utf8",
      );
      const documentationContent = fs.readFileSync(
        getOutputPath("js-files/exampleFunc.js.md"),
        "utf8",
      );

      expect(indexContent).toContain("Begin.");
      expect(indexContent).toContain("Finish.");
      expect(documentationContent).toContain("Begin.");
      expect(documentationContent).toContain("Finish.");
    });

    test("should be able to configure target with it's own extraction methods", async () => {
      // Create a new code file with different tags
      fs.mkdirSync(getOutputPath("js-files"));
      fs.writeFileSync(
        getOutputPath("js-files/exampleFunc2.js"),
        `/**
         * <method>
         * This is a test block wrapped in method tags
         * </method>
         * <docs>
         * This block should be ignored
         * </docs>
         */
        `,
      );

      scraper = new SimpleDocExtractor({
        ...defaultConfig,
        targets: [
          {
            ...jsFilesTarget,
            globOptions: {
              cwd: getOutputPath("js-files"),
              patterns: "**/*.{js,ts}",
            },
            plugins: [
              new TagExtractorPlugin({
                searchAndReplace: "%content%",
                tag: "method",
              }),
            ],
          },
        ],
      });
      await scraper.start();

      const documentationContent = fs.readFileSync(
        getOutputPath("js-files/exampleFunc2.js.md"),
        "utf8",
      );

      expect(documentationContent).toContain(
        "This is a test block wrapped in method tags",
      );
      expect(documentationContent).not.toContain(
        "This block should be ignored",
      );
    });
  });

  describe("start", () => {
    test("should be able to run the scraper with default config", async () => {
      const result = await scraper.start();

      const jsFiles = fs.readdirSync(getOutputPath("js-files"));
      const jsFilesNested = fs.readdirSync(
        getOutputPath("js-files/nested-js-files"),
      );
      const twigFiles = fs.readdirSync(getOutputPath("twig-files"));

      expect(result.successCount).toBe(4);
      expect(result.totalCount).toBe(5); // exampleFuncNoDocs.js should be ignored as there is no documentation

      expect(jsFiles).toContain("exampleFunc.js.md");
      expect(jsFiles).toContain("exampleTsFunc.ts.md");
      expect(jsFiles).toContain("nested-js-files");
      expect(jsFilesNested).toContain("index.md");
      expect(jsFilesNested).toContain("nestedFunc.js.md");

      expect(twigFiles).toContain("example.html.twig.md");
    });

    test("should generate logs", async () => {
      scraper = new SimpleDocExtractor({
        ...defaultConfig,
        targets: [jsFilesTarget],
      });

      const result = await scraper.start();

      expect(result.successCount >= 1).toBe(true);
      expect(result.logs.length >= 1).toBe(true);
    });

    test("should ignore files", async () => {
      scraper = new SimpleDocExtractor({
        ...defaultConfig,
        targets: [
          {
            globOptions: {
              ...jsFilesTarget.globOptions,
              cwd: path.join(process.cwd(), "src/tests/files"),
              ignore: ["ignored-files/**"],
            },
            outDir: getOutputPath("output-files"),
            createIndexFile: true,
            plugins: plugins,
          },
        ],
      });

      const result = await scraper.start();
      const jsFiles = fs.readdirSync(getOutputPath("output-files/js-files"));

      expect(result.successCount).toBeGreaterThan(1);
      expect(jsFiles.some((file) => file === "exampleFunc.js.md")).toBe(true);
      expect(jsFiles.some((file) => file === "ignoreFunc.js.md")).toBe(false);
    });

    test("should preserve file extensions", async () => {
      scraper = new SimpleDocExtractor({
        ...defaultConfig,
        targets: [
          {
            globOptions: {
              ...jsFilesTarget.globOptions,
              cwd: path.join(process.cwd(), "src/tests/files"),
            },
            outDir: getOutputPath("output-files"),
            createIndexFile: true,
            plugins: plugins,
          },
        ],
      });

      const result = await scraper.start();

      const jsFiles = fs.readdirSync(getOutputPath("output-files/js-files"));

      expect(result.successCount).toBeGreaterThan(1);
      expect(jsFiles.some((file) => file === "exampleFunc.js.md")).toBe(true);
    });
  });

  describe("content generation", () => {
    test("should generate multiple content for extraction methods that exist multiple times", async () => {
      // Create a new code file with different tags
      fs.mkdirSync(getOutputPath("js-files"));
      fs.writeFileSync(
        getOutputPath("js-files/methodsTest.js"),
        `<method>
This is the first block
</method>
<method>
This is the second block
</method>
`,
      );

      // Create a template file with the correct tags
      fs.writeFileSync(
        getOutputPath("documentation.template.md"),
        `Start.
  %methods%
  End.`,
      );

      scraper = new SimpleDocExtractor({
        ...defaultConfig,
        targets: [
          {
            globOptions: {
              cwd: getOutputPath("js-files"),
              patterns: "**/*.{js,ts}",
            },
            outDir: getOutputPath("js-files"),
            createIndexFile: true,
            templates: {
              documentation: {
                templatePath: getOutputPath("documentation.template.md"),
              },
            },
            plugins: [
              new TagExtractorPlugin({
                searchAndReplace: "%methods%",
                tag: "method",
                divideBy: "---",
              }),
            ],
          },
        ],
      });

      await scraper.start();

      const documentationContent = fs.readFileSync(
        getOutputPath("js-files/methodsTest.js.md"),
        "utf8",
      );

      expect(documentationContent).toContain("This is the first block");
      expect(documentationContent).toContain("This is the second block");
    });
  });

  describe("locales variables", () => {
    test("should be able to use the variables in the template", async () => {
      // Create a template file with the correct tags
      fs.writeFileSync(
        getOutputPath("documentation.template.md"),
        `%content%
@updatedAt %locales.updatedAt%
@fileName %locales.fileName%`,
      );

      fs.mkdirSync(getOutputPath("example"));
      fs.writeFileSync(
        getOutputPath("example/sample.js"),
        `/**
* <docs>
* This is a test block
* </docs>
*/`,
      );
      const locales = new LocalesService(
        getOutputPath("example/sample.js"),
      ).getLocales();

      scraper = new SimpleDocExtractor({
        ...defaultConfig,
        targets: [
          {
            ...jsFilesTarget,
            outDir: getOutputPath("example"),
            globOptions: {
              cwd: getOutputPath("example"),
              patterns: "**/*.{js,ts}",
            },
          },
        ],
        templates: {
          documentation: {
            templatePath: getOutputPath("documentation.template.md"),
          },
        },
      });
      await scraper.start();

      const documentationContent = fs.readFileSync(
        getOutputPath("example/sample.js.md"),
        "utf8",
      );

      expect(documentationContent).toContain("This is a test block");
      expect(documentationContent).toContain(locales.updatedAt);
      expect(documentationContent).toContain(locales.fileName);
    });
  });

  describe("dry run", () => {
    test("should be able to run the scraper in dry run mode", async () => {
      scraper = new SimpleDocExtractor({
        ...defaultConfig,
        dryRun: true,
      });

      const result = await scraper.start();

      const outputDirEntries = fs.readdirSync(getOutputPath());
      const shouldNotHaveEntries = ["js-files", "twig-files"];
      const missingDocumentationFiles = result.missingDocumentationFiles;

      expect(outputDirEntries).not.toContain(shouldNotHaveEntries);
      expect(missingDocumentationFiles.length).toBeGreaterThan(0);
    });
  });

  describe("missing documentation", () => {
    test("should produce warnings for missing documentation", async () => {
      fs.mkdirSync(getOutputPath("missing-documentation"));
      fs.writeFileSync(
        getOutputPath("missing-documentation/sample.js"),
        `/**
        * This is a test block
        */`,
      );

      scraper = new SimpleDocExtractor({
        ...defaultConfig,
        dryRun: true,
        targets: [
          {
            ...jsFilesTarget,
            outDir: getOutputPath("missing-documentation"),
            globOptions: {
              cwd: getOutputPath("missing-documentation"),
              patterns: "**/*.{js,ts}",
            },
          },
        ],
      });

      const results = await scraper.start();

      expect(results.missingDocumentationCount).toBeGreaterThan(0);
      expect(
        results.logs.some((log) =>
          log.includes("Found 1 file(s) with no documentation"),
        ),
      ).toBe(true);
    });
  });

  describe("documentation files", () => {
    test("should not generate documentation files for no extracted content", async () => {
      fs.mkdirSync(getOutputPath("js-files"));
      fs.writeFileSync(
        getOutputPath("js-files/no-extracted-content.js"),
        "/**\n* This is a test block\n*/\n",
      );

      scraper = new SimpleDocExtractor({
        ...defaultConfig,
        targets: [
          {
            ...jsFilesTarget,
            globOptions: {
              ...jsFilesTarget.globOptions,
              cwd: getOutputPath("js-files"),
            },
            outDir: getOutputPath("js-files"),
          },
        ],
      });

      const results = await scraper.start();

      const fileExists = fs.existsSync(
        getOutputPath("no-extracted-content.js.md"),
      );

      expect(fileExists).toBe(false);
      expect(results.missingDocumentationFiles).toContain(
        getOutputPath("js-files/no-extracted-content.js"),
      );
    });
  });

  describe("index files", () => {
    test("should generate the index files for the root directory", async () => {
      fs.writeFileSync(
        getOutputPath("root-index.template.md"),
        TEMPLATE_CONTENT + "\nRoot Index",
      );

      scraper = new SimpleDocExtractor({
        ...defaultConfig,
        targets: [
          {
            ...jsFilesTarget,
            templates: {
              ...jsFilesTarget.templates,
              rootIndex: {
                templatePath: getOutputPath("root-index.template.md"),
              },
            },
          },
          twigFilesTarget,
        ],
      });

      await scraper.start();

      const rootIndexFileContent = fs.readFileSync(
        getOutputPath("js-files/index.md"),
        "utf8",
      );
      const twigFilesIndexFileContent = fs.readFileSync(
        getOutputPath("twig-files/index.md"),
        "utf8",
      );

      expect(rootIndexFileContent).toContain("Root Index");
      expect(twigFilesIndexFileContent).not.toContain("Root Index");
    });
  });
});
