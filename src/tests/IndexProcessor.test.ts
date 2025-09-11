import { beforeEach, describe, expect, test } from "@jest/globals";
import fs from "fs";
import path from "path";
import { IndexStructurePreProcessor } from "../simple-docs-scraper/processors/IndexStructurePreProcessor";
import { IndexProcessor } from "../simple-docs-scraper/services/IndexProcessor";
import { deleteOutputFiles } from "./helpers/deleteOutputFiles";
import { getOutputPath } from "./helpers/getOutputPath";

describe("Example Test Suite", () => {
  let docsPath = getOutputPath("docs");
  let indexProcessor: IndexProcessor;
  let indexStructurePreProcessor: IndexStructurePreProcessor;

  beforeEach(() => {
    deleteOutputFiles();

    // Make folders
    fs.mkdirSync(getOutputPath("docs/sub-folder/sub-folder2"), {
      recursive: true,
    });
    fs.mkdirSync(getOutputPath("docs/sub-folder"), { recursive: true });

    // Make test md files
    fs.writeFileSync(getOutputPath("docs/file.md"), "");
    fs.writeFileSync(getOutputPath("docs/file.md"), "");
    fs.writeFileSync(getOutputPath("docs/sub-folder/file.md"), "");
    fs.writeFileSync(getOutputPath("docs/sub-folder/sub-folder2/file.md"), "");
    fs.writeFileSync(getOutputPath("docs/sub-folder/sub-folder2/index.md"), "");

    // Custom template file
    fs.mkdirSync(getOutputPath("templates"), { recursive: true });
    fs.writeFileSync(
      getOutputPath("templates/index.template.md"),
      "Start.%content%End.",
    );

    indexProcessor = new IndexProcessor();
    indexStructurePreProcessor = new IndexStructurePreProcessor();
  });

  // afterEach(() => {
  //     deleteOutputFiles();
  // })

  // afterAll(() => {
  //     deleteOutputFiles();
  // })

  describe("files", () => {
    test("should return a list of absolute paths", async () => {
      const entries = await indexStructurePreProcessor.getDirectoryEntries(
        getOutputPath("docs"),
      );

      const file = entries.find(
        (entry) => entry === getOutputPath("docs/file.md"),
      );
      const dir = entries.find(
        (entry) => entry === getOutputPath("docs/sub-folder"),
      );

      expect(file).toBeDefined();
      expect(dir).toBeDefined();
    });

    test("should ignore irrelevant files", async () => {
      fs.mkdirSync(getOutputPath("docs-ignore"));
      fs.writeFileSync(getOutputPath("docs-ignore/picture.png"), "");
      fs.writeFileSync(getOutputPath("docs-ignore/.gitkeep"), "");
      fs.writeFileSync(getOutputPath("docs-ignore/a.md"), "");

      const entries = await indexStructurePreProcessor.getDirectoryEntries(
        getOutputPath("docs-ignore"),
      );

      const picture = entries.find((entry) => entry.includes("picture"));
      const gitkeep = entries.find((entry) => entry.includes("gitkeep"));
      const a = entries.find((entry) => entry.includes("a.md"));

      expect(picture).toBeUndefined();
      expect(gitkeep).toBeUndefined();
      expect(a).toBeDefined();
    });

    test("should not create an index.md of itself", async () => {
      await indexProcessor.handle(docsPath);

      expect(fs.existsSync(path.join(docsPath, "index.md"))).toBe(true);
      expect(fs.existsSync(path.join(docsPath, "sub-folder/index.md"))).toBe(
        true,
      );
      expect(
        fs.existsSync(path.join(docsPath, "sub-folder/sub-folder2/index.md")),
      ).toBe(true);

      const indexFileContents = fs.readFileSync(
        path.join(docsPath, "index.md"),
      );
      expect(indexFileContents).not.toContain("- index.md");
      expect(indexFileContents).not.toContain("- [index.md](index.md)");
    });
  });

  describe("processor", () => {
    test("should pre process directory structure", () => {
      const entry1 = getOutputPath("docs/file.md");
      const formatted1 = indexStructurePreProcessor.formatEntry(entry1);

      const entry2 = getOutputPath("docs/sub-folder/file.md");
      const formatted2 = indexStructurePreProcessor.formatEntry(entry2);

      const entry3 = getOutputPath("docs/sub-folder/sub-folder2/file.md");
      const formatted3 = indexStructurePreProcessor.formatEntry(entry3);

      const dir1 = getOutputPath("docs/sub-folder");
      const formatted4 = indexStructurePreProcessor.formatEntry(dir1);

      expect(formatted1).toBe("file.md");
      expect(formatted2).toBe("file.md");
      expect(formatted3).toBe("file.md");
      expect(formatted4).toBe("sub-folder");
    });

    test("should create plain text entries when markdownLink is disabled", async () => {
      indexStructurePreProcessor = new IndexStructurePreProcessor({
        markdownLink: false,
      });
      const results = await indexStructurePreProcessor.process(docsPath);

      const file1 = results.find(
        (result) => result.src === getOutputPath("docs/file.md"),
      );
      expect(file1?.entryName).toBe("file.md");
      expect(file1?.isDir).toBe(false);
      expect(file1?.markdownLink).toBe("file.md");

      const dir1 = results.find(
        (result) => result.src === getOutputPath("docs/sub-folder"),
      );
      expect(dir1?.entryName).toBe("sub-folder/");
      expect(dir1?.isDir).toBe(true);
      expect(dir1?.markdownLink).toBe("sub-folder/");
    });

    test("should create markdown links for files and folders", async () => {
      indexStructurePreProcessor = new IndexStructurePreProcessor({
        markdownLink: true,
      });
      const results = await indexStructurePreProcessor.process(docsPath);

      const file1 = results.find(
        (result) => result.src === getOutputPath("docs/file.md"),
      );
      expect(file1?.entryName).toBe("file.md");
      expect(file1?.isDir).toBe(false);
      expect(file1?.markdownLink).toBe("[file.md](file.md)");

      const dir1 = results.find(
        (result) => result.src === getOutputPath("docs/sub-folder"),
      );
      expect(dir1?.entryName).toBe("sub-folder/");
      expect(dir1?.isDir).toBe(true);
      expect(dir1?.markdownLink).toBe("[sub-folder/](sub-folder/)");
    });

    test("should format markdown links with sub folders with an index.md", async () => {
      const subFolder2Path = getOutputPath("docs/sub-folder");
      indexStructurePreProcessor = new IndexStructurePreProcessor({
        markdownLink: true,
      });
      const results = await indexStructurePreProcessor.process(subFolder2Path);

      const file1 = results.find(
        (result) => result.src === getOutputPath("docs/sub-folder/file.md"),
      );
      expect(file1?.entryName).toBe("file.md");
      expect(file1?.isDir).toBe(false);
      expect(file1?.markdownLink).toBe("[file.md](file.md)");

      const subfolder2 = results.find(
        (result) => result.src === getOutputPath("docs/sub-folder/sub-folder2"),
      );
      expect(subfolder2?.entryName).toBe("sub-folder2/");
      expect(subfolder2?.isDir).toBe(true);
      expect(subfolder2?.markdownLink).toBe(
        "[sub-folder2/](sub-folder2/index.md)",
      );
    });

    test("should be able to read all md files and directories", async () => {
      const indexDirectoryProcessor = new IndexStructurePreProcessor();
      const entries = await indexDirectoryProcessor.getDirectoryEntries(
        getOutputPath("docs"),
      );

      expect(entries.length).toBe(2);
      expect(entries[0]).toBe(getOutputPath("docs/file.md"));
      expect(entries[1]).toBe(getOutputPath("docs/sub-folder"));
    });
  });

  describe("handle", () => {
    test("should generate the index files recursively", async () => {
      await indexProcessor.handle(docsPath);

      expect(fs.existsSync(path.join(docsPath, "index.md"))).toBe(true);
      expect(fs.existsSync(path.join(docsPath, "sub-folder/index.md"))).toBe(
        true,
      );
      expect(
        fs.existsSync(path.join(docsPath, "sub-folder/sub-folder2/index.md")),
      ).toBe(true);
    });

    test("should generate the index files with a custom template", async () => {
      const indexProcessor = new IndexProcessor({
        markdownLink: true,
        template: getOutputPath("templates/index.template.md"),
      });

      await indexProcessor.handle(docsPath);

      expect(
        fs.existsSync(path.join(docsPath, "sub-folder/sub-folder2/index.md")),
      ).toBe(true);

      const indexFileContent = fs.readFileSync(
        path.join(docsPath, "sub-folder/sub-folder2/index.md"),
        "utf8",
      );
      expect(indexFileContent).toContain("Start.");
      expect(indexFileContent).toContain("- [file.md](file.md)");
      expect(indexFileContent).toContain("End.");
    });

    test("should list the directories", async () => {
      const docsListDirs = getOutputPath("docs-list-dirs");

      fs.mkdirSync(getOutputPath("docs-list-dirs/sub-folder"), {
        recursive: true,
      });
      fs.writeFileSync(getOutputPath("docs-list-dirs/a.md"), "");
      fs.writeFileSync(getOutputPath("docs-list-dirs/b.md"), "");
      fs.writeFileSync(getOutputPath("docs-list-dirs/sub-folder/c.md"), "");

      const indexProcessor = new IndexProcessor({
        markdownLink: true,
      });
      await indexProcessor.handle(docsListDirs);

      const indexFileContent = fs.readFileSync(
        path.join(docsListDirs, "index.md"),
        "utf8",
      );

      expect(indexFileContent).toContain("- [a.md](a.md)");
      expect(indexFileContent).toContain("- [b.md](b.md)");
      expect(indexFileContent).toContain(
        "- [sub-folder/](sub-folder/index.md)",
      );
    });

    test("should only list the folder when no index.md file is found", async () => {
      const docsListDirs = getOutputPath("docs-list-dirs");

      fs.mkdirSync(getOutputPath("docs-list-dirs/sub-folder"), {
        recursive: true,
      });
      fs.writeFileSync(getOutputPath("docs-list-dirs/a.md"), "");
      fs.writeFileSync(getOutputPath("docs-list-dirs/b.md"), "");
      fs.writeFileSync(getOutputPath("docs-list-dirs/sub-folder/c.md"), "");

      const indexProcessor = new IndexProcessor({
        markdownLink: true,
      });

      await indexProcessor.handle(docsListDirs);

      const indexFileContent = fs.readFileSync(
        path.join(docsListDirs, "index.md"),
        "utf8",
      );

      expect(indexFileContent).toContain("- [a.md](a.md)");
      expect(indexFileContent).toContain("- [b.md](b.md)");
      expect(indexFileContent).toContain(
        "- [sub-folder/](sub-folder/index.md)",
      );
    });

    test("should list the directories with a markdown link when an index.md file is found", async () => {
      const docsListDirs = getOutputPath("docs-list-dirs");

      fs.mkdirSync(getOutputPath("docs-list-dirs/sub-folder"), {
        recursive: true,
      });
      fs.writeFileSync(getOutputPath("docs-list-dirs/a.md"), "");
      fs.writeFileSync(getOutputPath("docs-list-dirs/b.md"), "");
      fs.writeFileSync(getOutputPath("docs-list-dirs/sub-folder/index.md"), "");
      fs.writeFileSync(getOutputPath("docs-list-dirs/sub-folder/c.md"), "");

      const indexProcessor = new IndexProcessor({
        markdownLink: true,
      });

      await indexProcessor.handle(docsListDirs);

      const indexFileContent = fs.readFileSync(
        path.join(docsListDirs, "index.md"),
        "utf8",
      );

      expect(indexFileContent).toContain("- [a.md](a.md)");
      expect(indexFileContent).toContain("- [b.md](b.md)");
      expect(indexFileContent).toContain(
        "- [sub-folder/](sub-folder/index.md)",
      );
    });
  });

  describe("sorting", () => {
    test("should sort processed result with files appearing first", async () => {
      fs.mkdirSync(getOutputPath("docs-sorting"), { recursive: true });
      fs.writeFileSync(getOutputPath("docs-sorting/a.md"), "");
      fs.writeFileSync(getOutputPath("docs-sorting/b.md"), "");
      fs.mkdirSync(getOutputPath("docs-sorting/c"));
      fs.mkdirSync(getOutputPath("docs-sorting/d"));

      const results = await indexStructurePreProcessor.process(
        getOutputPath("docs-sorting"),
      );

      expect(results[0].basename).toBe("a.md");
      expect(results[1].basename).toBe("b.md");
      expect(results[2].basename).toBe("c");
      expect(results[3].basename).toBe("d");
    });

    test("should generate the index file with the sorted results", async () => {
      fs.mkdirSync(getOutputPath("docs-sorting"), { recursive: true });
      fs.writeFileSync(getOutputPath("docs-sorting/a.md"), "");
      fs.writeFileSync(getOutputPath("docs-sorting/b.md"), "");
      fs.mkdirSync(getOutputPath("docs-sorting/c"));
      fs.mkdirSync(getOutputPath("docs-sorting/d"));

      await indexProcessor.handle(getOutputPath("docs-sorting"));

      const indexFileContent = fs.readFileSync(
        path.join(getOutputPath("docs-sorting"), "index.md"),
        "utf8",
      );

      expect(indexFileContent).toBe("- a.md\n- b.md\n- c/\n- d/\n");
    });
  });

  describe("heading", () => {
    test("should create files with a heading", async () => {
      indexProcessor = new IndexProcessor({
        filesHeading: "## Files",
      });

      fs.mkdirSync(getOutputPath("docs-heading"), { recursive: true });
      fs.writeFileSync(getOutputPath("docs-heading/a.md"), "");
      fs.writeFileSync(getOutputPath("docs-heading/b.md"), "");

      await indexProcessor.handle(getOutputPath("docs-heading"));

      const indexFileContent = fs.readFileSync(
        getOutputPath("docs-heading/index.md"),
        "utf8",
      );

      expect(indexFileContent).toBe("## Files\n- a.md\n- b.md\n");
    });

    test("should create directories with a heading", async () => {
      indexProcessor = new IndexProcessor({
        directoryHeading: "## Folders",
      });

      fs.mkdirSync(getOutputPath("docs-heading/a"), { recursive: true });
      fs.mkdirSync(getOutputPath("docs-heading/b"), { recursive: true });

      await indexProcessor.handle(getOutputPath("docs-heading"));

      const indexFileContent = fs.readFileSync(
        getOutputPath("docs-heading/index.md"),
        "utf8",
      );

      expect(indexFileContent).toBe("## Folders\n- a/\n- b/\n");
    });

    test("should create both file and directories headings", async () => {
      indexProcessor = new IndexProcessor({
        directoryHeading: "## Folders",
        filesHeading: "## Files",
      });

      fs.mkdirSync(getOutputPath("docs-heading/a"), { recursive: true });
      fs.mkdirSync(getOutputPath("docs-heading/b"), { recursive: true });
      fs.writeFileSync(getOutputPath("docs-heading/c.md"), "");
      fs.writeFileSync(getOutputPath("docs-heading/d.md"), "");

      await indexProcessor.handle(getOutputPath("docs-heading"));

      const indexFileContent = fs.readFileSync(
        getOutputPath("docs-heading/index.md"),
        "utf8",
      );

      expect(indexFileContent).toBe(
        "## Files\n- c.md\n- d.md\n## Folders\n- a/\n- b/\n",
      );
    });
  });

  describe("excerpts", () => {
    test("should produce excerpts", async () => {
      const sourceCode = `## Heading 1
This is a readable English sentence for testing purposes. 

## Heading 2
It is intended to verify that the excerpt extraction logic works correctly.
The sentence should be long enough to provide a meaningful excerpt for the test.
By including multiple lines, we can ensure the extractor handles longer content.
This additional text helps simulate a more realistic documentation scenario.`;

      fs.mkdirSync(getOutputPath("docs-excerpt"), { recursive: true });
      fs.writeFileSync(getOutputPath("docs-excerpt/excerpt.md"), sourceCode);

      indexProcessor = new IndexProcessor({
        excerpt: {
          length: 75,
          addEllipsis: true,
          firstSentenceOnly: false,
        },
      });
      await indexProcessor.handle(getOutputPath("docs-excerpt"));

      const indexFileContent = fs.readFileSync(
        getOutputPath("docs-excerpt/index.md"),
        "utf8",
      );

      expect(indexFileContent).toContain(
        "- excerpt.md - This is a readable English sentence for testing purposes. It is intended to...",
      );
    });
  });
});
