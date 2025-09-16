import { DirectoryMarkdownScanner } from "@/simple-docs-scraper/processors/DirectoryMarkdownScanner.js";
import { beforeEach, describe, expect, test } from "@jest/globals";
import fs from "fs";

import path from "path";
import { deleteOutputFiles } from "./helpers/deleteOutputFiles.js";

describe("Index Structure Pre Processor", () => {
  beforeEach(() => {
    deleteOutputFiles();
  });

  describe("process", () => {
    test("should get directory entries", async () => {
      const indexStructurePreProcessor = new DirectoryMarkdownScanner();
      const entries = await indexStructurePreProcessor.getDirectoryEntries(
        path.join(process.cwd(), "src/tests/files"),
      );

      expect(entries).toContain(
        path.join(process.cwd(), "src/tests/files/js-files"),
      );
      expect(entries).toContain(
        path.join(process.cwd(), "src/tests/files/twig-files"),
      );
      expect(entries).toContain(
        path.join(process.cwd(), "src/tests/files/ignored-files"),
      );
    });

    test("should append index.md if found and set the markdown link", async () => {
      const indexStructurePreProcessor = new DirectoryMarkdownScanner({
        markdownLink: true,
      });

      fs.mkdirSync(path.join(process.cwd(), "src/tests/output/sub-folder"), {
        recursive: true,
      });
      fs.writeFileSync(
        path.join(process.cwd(), "src/tests/output/sub-folder/index.md"),
        "",
      );

      const result = await indexStructurePreProcessor.process(
        path.join(process.cwd(), "src/tests/output"),
      );

      expect(result[0].markdownLink).toBe("[sub-folder/](sub-folder/index.md)");
    });
  });
});
