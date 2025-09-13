import { afterAll, beforeEach, describe, expect, jest, test } from "@jest/globals";
import fs from "fs";
import { glob } from "glob";
import path from "path";
import { DEFAULT_CONFIG, publishDocs } from "../scripts/publish-docs.js";
import { SimpleDocExtractorConfig } from "../simple-docs-scraper/types/config.t.js";
import { deleteOutputFiles } from "./helpers/deleteOutputFiles.js";
import { getOutputPath } from "./helpers/getOutputPath.js";

describe("Publish Docs", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let exitSpy: any
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
    console.log = (...args: any[]) => { };

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
    if (fs.existsSync(path.join(process.cwd(), "src/sample-missing-documentation.js"))) {
      fs.unlinkSync(path.join(process.cwd(), "src/sample-missing-documentation.js"));
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
      await publishDocs({
        ...testConfig,
      });

      expect(exitSpy).toHaveBeenCalledWith(1);
    });
  });
});
