import { TagExtractorPlugin } from "@/simple-docs-scraper/extractors/TagExtractorPlugin.js";
import { beforeEach, describe, expect, test } from "@jest/globals";
import fs from "fs";
import path from "path";
import { SimpleDocExtractor } from "../simple-docs-scraper/services/SimpleDocExtractor.js";
import { SimpleDocExtractorConfig } from "../simple-docs-scraper/types/config.js";
import { deleteOutputFiles } from "./helpers/deleteOutputFiles.js";
import { getOutputPath } from "./helpers/getOutputPath.js";

const TEMPLATE_CONTENT = `Start.
%content%
End.`;
const TEMPLATE_CONTENT2 = `Begin.
%content%
Finish.`;

const jsFilesTarget = {
  globOptions: {
    cwd: path.join(process.cwd(), "src/tests/files/js-files"),
    extensions: "**/*.{js,ts}",
  },
  outDir: getOutputPath("js-files"),
  createIndexFile: true,
};

const twigFilesTarget = {
  globOptions: {
    cwd: path.join(process.cwd(), "src/tests/files/twig-files"),
    extensions: "**/*.html.twig",
  },
  outDir: getOutputPath("twig-files"),
  createIndexFile: true,
};

const defaultConfig: SimpleDocExtractorConfig = {
  baseDir: path.join(process.cwd(), "src/tests/files"),
  extraction: [
    new TagExtractorPlugin({
      searchAndReplace: "%content%",
      tag: "<docs>",
    }),
  ],
  generators: {
    index: {
      template: getOutputPath("index.template.md"),
    },
    documentation: {
      template: getOutputPath("documentation.template.md"),
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
            generators: {
              documentation: {
                template: getOutputPath("documentation2.template.md"),
              },
              index: {
                template: getOutputPath("index2.template.md"),
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
              extensions: "**/*.{js,ts}",
            },
            extraction: [
              new TagExtractorPlugin({
                searchAndReplace: "%content%",
                tag: "method",
              }),
            ]
          },
        ],
      });
      await scraper.start();

      const documentationContent = fs.readFileSync(
        getOutputPath("js-files/exampleFunc2.js.md"),
        "utf8",
      );

      expect(documentationContent).toContain("This is a test block wrapped in method tags");
      expect(documentationContent).not.toContain("This block should be ignored");
    });
  });

  describe("start", () => {
    test("should be able to run the scraper", async () => {
      const result = await scraper.start();

      const jsFiles = fs.readdirSync(getOutputPath("js-files"));
      const twigFiles = fs.readdirSync(getOutputPath("twig-files"));

      const expectedJsFilesCount = 4; // 4 files, plus 1 folder
      const expectedTwigFilesCount = 2; // 1 plus the index file

      expect(result.successCount).toBe(4);
      expect(result.totalCount).toBe(5);
      expect(jsFiles).toHaveLength(expectedJsFilesCount);
      expect(twigFiles).toHaveLength(expectedTwigFilesCount);
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
        targets: [{
          globOptions: {
            cwd: getOutputPath("js-files"),
            extensions: "**/*.{js,ts}",
          },
          outDir: getOutputPath("js-files"),
          createIndexFile: true,
          generators: {
            documentation: {
              template: getOutputPath("documentation.template.md"),
            },
          },
          extraction: [
            new TagExtractorPlugin({
              searchAndReplace: "%methods%",
              tag: "method",
              divideBy: "---",
            }),
          ]
        }],
      });
      
      await scraper.start();

      const documentationContent = fs.readFileSync(
        getOutputPath("js-files/methodsTest.js.md"),
        "utf8",
      );

      expect(documentationContent).toContain("This is the first block");
      expect(documentationContent).toContain("This is the second block");
    })
  })
});
