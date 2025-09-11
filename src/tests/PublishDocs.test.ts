import { beforeEach, describe, expect, test } from "@jest/globals";
import fs from "fs";
import { glob } from "glob";
import path from "path";
import { DEFAULT_CONFIG, publishDocs } from "../scripts/publish-docs.js";
import { SimpleDocExtractorConfig } from "../simple-docs-scraper/types/config.js";
import { deleteOutputFiles } from "./helpers/deleteOutputFiles.js";
import { getOutputPath } from "./helpers/getOutputPath.js";

describe("Publish Docs", () => {
  beforeEach(() => {
    deleteOutputFiles();

    // Mock console.log to suppress output during test
    console.log = (...args: any[]) => {};
  });

  // afterEach(() => {
  //     deleteOutputFiles();
  // });

  // afterAll(() => {
  //     deleteOutputFiles();
  // });

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

      const pathToSimpleDocsScraper = path.join(
        getOutputPath(),
        "docs/simple-docs-scraper/services/SimpleDocExtractor.ts.md",
      );
      const pathToDocFileGenerator = path.join(
        getOutputPath(),
        "docs/simple-docs-scraper/generators/DocFileGenerator.ts.md",
      );

      expect(fs.existsSync(pathToSimpleDocsScraper)).toBe(true);
      expect(fs.existsSync(pathToDocFileGenerator)).toBe(true);
    });
  });
});
