import { IndexContentGenerator, State } from "@/simple-docs-scraper/generators/IndexContenGenerator.js";
import { IndexFileGeneratorConfig } from "@/simple-docs-scraper/generators/IndexFileGenerator.js";
import {
  afterAll,
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from "@jest/globals";
import fs from "fs";
import { glob } from "glob";
import path from "path";
import { DEFAULT_CONFIG, publishDocs } from "../scripts/publish-docs.js";
import { SimpleDocExtractorConfig } from "../simple-docs-scraper/types/config.t.js";
import { deleteOutputFiles } from "./helpers/deleteOutputFiles.js";
import { getOutputPath } from "./helpers/getOutputPath.js";

describe("Publish Docs", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let exitSpy: any;
  let testConfig: SimpleDocExtractorConfig;

  beforeEach(() => {
    // Overwrite the output directory for each target
    testConfig = {
      ...DEFAULT_CONFIG,
      targets: DEFAULT_CONFIG.targets.map((target) => {
        return {
          ...target,
          outDir: path.join(getOutputPath(), path.basename(target.outDir)),
        };
      }),
    };

    // Delete the output files
    deleteOutputFiles();

    // Mock console.log to suppress output during test
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    console.log = (...args: any[]) => {};

    // Create a sample file with no documentation
    fs.writeFileSync(
      path.join(process.cwd(), "src/sample-missing-documentation.js"),
      `/**
      * This is a test block
      */`,
    );

    // Spy on process.exit so we can check if it was called, but don't actually exit
    exitSpy = jest.spyOn(process, "exit").mockImplementation((): never => {
      return {} as never;
    });
  });

  afterAll(() => {
    // Delete the sample file
    if (
      fs.existsSync(
        path.join(process.cwd(), "src/sample-missing-documentation.js"),
      )
    ) {
      fs.unlinkSync(
        path.join(process.cwd(), "src/sample-missing-documentation.js"),
      );
    }
  });

  describe("publishDocs", () => {
    test("should publish the docs", async () => {
      // Overwrite the output directory for each target
      const testConfig = {
        ...DEFAULT_CONFIG,
        targets: DEFAULT_CONFIG.targets.map((target) => {
          return {
            ...target,
            outDir: path.join(getOutputPath(), path.basename(target.outDir)),
          };
        }),
      };

      const result = await publishDocs(testConfig as SimpleDocExtractorConfig);

      const outputFiles = await glob("**/**.*", {
        absolute: true,
        cwd: path.join(process.cwd(), "src/tests/output/docs"),
        nodir: true,
      });

      expect(result?.successCount).toBeGreaterThanOrEqual(1);
      expect(result?.totalCount).toBeGreaterThanOrEqual(1);
      expect(outputFiles.length).toBeGreaterThanOrEqual(1);
      expect(outputFiles.some((file) => file.includes("index.md"))).toBe(true);

      const pathToSimpleDocExtractor = path.join(
        getOutputPath(),
        "docs/simple-docs-scraper/services/SimpleDocExtractor.ts.md",
      );
      const pathToDocFileGenerator = path.join(
        getOutputPath(),
        "docs/simple-docs-scraper/generators/DocFileGenerator.ts.md",
      );

      expect(fs.existsSync(pathToSimpleDocExtractor)).toBe(true);
      expect(fs.existsSync(pathToDocFileGenerator)).toBe(true);
    });
  });

  describe("publishDocs with missing documentation", () => {
    test("should exit with code 1 if there is missing documentation", async () => {
      // Create a sample file with no documentation
      fs.writeFileSync(
        path.join(process.cwd(), "src/sample-missing-documentation.js"),
        `/**
        * This is a test block
        */`,
      );

      await publishDocs({
        ...testConfig,
      });

      expect(exitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe("no extracted content", () => {
    test("should not generate documentation files for no extracted content", async () => {
      await publishDocs({
        ...testConfig,
      });

      const rootIndexFileContent = fs.existsSync(
        getOutputPath("docs/index.ts.md"),
      );

      expect(rootIndexFileContent).toBe(false);
    });
  });

  describe("publishDocs with plugins", () => {
    test("should copy the README.md file to the root index file", async () => {
      await publishDocs({
        ...testConfig,
      });

      const rootIndexFileContent = fs.readFileSync(
        getOutputPath("docs/index.md"),
        "utf8",
      );

      expect(rootIndexFileContent).toContain("# Simple Docs Extractor");
      expect(rootIndexFileContent).toContain("## About");
      expect(rootIndexFileContent).toContain("## Features");
    });
  });

  describe("uses non-root index template in sub Folders", () => {
    test("should use the non-root index template in sub folders", async () => {
      await publishDocs({
        ...testConfig,
      });

      const rootIndexFileContent = fs.readFileSync(
        getOutputPath("docs/index.md"),
        "utf8",
      );

      expect(rootIndexFileContent).toContain("# Simple Docs Extractor");
      expect(rootIndexFileContent).toContain("## About");
      expect(rootIndexFileContent).toContain("## Features");

      const nonRootIndexFileContent = fs.readFileSync(
        getOutputPath("docs/simple-docs-scraper/index.md"),
        "utf8",
      );

      expect(nonRootIndexFileContent).not.toContain("# Simple Docs Scraper");
      expect(nonRootIndexFileContent).not.toContain("## Features");
      expect(nonRootIndexFileContent).toContain("Table of Contents");
    });
  });

  describe("publishDocs with flattened index", () => {
    test("should flatten the index", async () => {
      testConfig = {
        ...testConfig,
        targets: [
          {
            ...testConfig.targets[0],
            templates: {
              rootIndex: {
                ...(testConfig.targets[0].templates?.rootIndex || {}),
                flatten: true,
                recursive: true,
              }
            }
          }
        ]
      }

      await publishDocs(testConfig);
      
      const rootIndexFileContent = fs.readFileSync(
        getOutputPath("docs/index.md"),
        "utf8",
      );

      const indenter = (level: number) => {
        return new IndexContentGenerator({} as IndexFileGeneratorConfig).createIndenterPrefix({ indentLevel: level } as State);
      }

      expect(rootIndexFileContent).toContain(
        `## Folders\n\n` +  
        `${indenter(0)}- [simple-docs-scraper/](simple-docs-scraper/index.md)\n` +
          `${indenter(1)}- [builder/](simple-docs-scraper/builder/index.md)\n` +
            `${indenter(2)}- [Builder.ts.md](simple-docs-scraper/builder/Builder.ts.md)\n` +
            `${indenter(2)}- [TargetBuilder.ts.md](simple-docs-scraper/builder/TargetBuilder.ts.md)\n` +
            `${indenter(2)}- [TemplateBuilder.ts.md](simple-docs-scraper/builder/TemplateBuilder.ts.md)\n` +
            `${indenter(1)}- [config/](simple-docs-scraper/config/index.md)\n` +
              `${indenter(2)}- [ConfigHelper.ts.md](simple-docs-scraper/config/ConfigHelper.ts.md)\n`
          );
    });
    
  });
});
