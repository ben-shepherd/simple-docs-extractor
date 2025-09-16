import { listIndentPrefix } from "@/simple-docs-scraper/utils/listIndenterPrefix.js";
import { beforeEach, describe, expect, test } from "@jest/globals";
import fs from "fs";
import path from "path";
import { DirectoryMarkdownScanner } from "../simple-docs-scraper/processors/DirectoryMarkdownScanner.js";
import { MarkdownIndexProcessor } from "../simple-docs-scraper/processors/MarkdownIndexProcessor.js";
import { deleteOutputFiles } from "./helpers/deleteOutputFiles.js";
import { getOutputPath } from "./helpers/getOutputPath.js";

describe("Example Test Suite", () => {
  const docsPath = getOutputPath("docs");
  let indexProcessor: MarkdownIndexProcessor;
  let indexStructurePreProcessor: DirectoryMarkdownScanner;

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

    indexProcessor = new MarkdownIndexProcessor();
    indexStructurePreProcessor = new DirectoryMarkdownScanner();
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
        "utf8",
      );
      expect(indexFileContents).not.toContain("- index.md");
      expect(indexFileContents).not.toContain("- [index.md](index.md)");
    });

    test("should not create an index.md of itself after reprocessing", async () => {
      await indexProcessor.handle(docsPath);
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
        "utf8",
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
      indexStructurePreProcessor = new DirectoryMarkdownScanner({
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
      indexStructurePreProcessor = new DirectoryMarkdownScanner({
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
      indexStructurePreProcessor = new DirectoryMarkdownScanner({
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
      const indexDirectoryProcessor = new DirectoryMarkdownScanner();
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
      const indexProcessor = new MarkdownIndexProcessor({
        markdownLinks: true,
        templatePath: getOutputPath("templates/index.template.md"),
        recursive: true,
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

      const indexProcessor = new MarkdownIndexProcessor({
        markdownLinks: true,
        recursive: true,
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

      const indexProcessor = new MarkdownIndexProcessor({
        markdownLinks: true,
        recursive: true,
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

      const indexProcessor = new MarkdownIndexProcessor({
        markdownLinks: true,
        recursive: true,
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

      indexProcessor = new MarkdownIndexProcessor({
        filesHeading: undefined,
        directoryHeading: undefined,
        recursive: true,
        markdownLinks: false,
      });
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
      indexProcessor = new MarkdownIndexProcessor({
        filesHeading: "## Files",
        recursive: true,
        markdownLinks: false,
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
      indexProcessor = new MarkdownIndexProcessor({
        directoryHeading: "## Folders",
        recursive: true,
        markdownLinks: false,
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
      indexProcessor = new MarkdownIndexProcessor({
        directoryHeading: "## Folders",
        filesHeading: "## Files",
        recursive: true,
        markdownLinks: false,
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

      indexProcessor = new MarkdownIndexProcessor({
        excerpt: {
          length: 75,
          addEllipsis: true,
          firstSentenceOnly: false,
        },
        recursive: true,
        markdownLinks: false,
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

  describe("creation with no md files found", () => {
    test("should not create an index.md file when no md files are found", async () => {
      fs.mkdirSync(getOutputPath("docs-no-md"), { recursive: true });
      fs.writeFileSync(getOutputPath("docs-no-md/styles.scss"), "");

      await indexProcessor.handle(getOutputPath("docs-no-md"));

      expect(fs.existsSync(getOutputPath("docs-no-md/index.md"))).toBe(false);
    });
  });

  describe("flatten", () => {
    test("should flatten the index.md file", async () => {

      fs.mkdirSync(getOutputPath("docs-flatten/sub-folder/sub-folder2"), { recursive: true });
      fs.writeFileSync(getOutputPath("docs-flatten/a.md"), "");
      fs.writeFileSync(getOutputPath("docs-flatten/sub-folder/b.md"), "");
      fs.writeFileSync(getOutputPath("docs-flatten/sub-folder/sub-folder2/c.md"), "");

      indexProcessor = new MarkdownIndexProcessor({
        flatten: true,
        recursive: true,
        markdownLinks: false,
      });
      await indexProcessor.handle(getOutputPath("docs-flatten"));

      const indexFileContent = fs.readFileSync(
        getOutputPath("docs-flatten/index.md"),
        "utf8",
      );

      const indenter = (level: number) => {
        return listIndentPrefix(level);
      }

      expect(indexFileContent).toBe(
        `${indenter(0)}- a.md\n` +
        `${indenter(0)}- sub-folder/\n` +
          `${indenter(1)}- b.md\n` +
          `${indenter(1)}- sub-folder2/\n` +
            `${indenter(2)}- c.md\n`
      );
    });

    test("should flatten the index.md file with markdown links", async () => {

      fs.mkdirSync(getOutputPath("docs-flatten/sub-folder/sub-folder2"), { recursive: true });
      fs.writeFileSync(getOutputPath("docs-flatten/a.md"), "");
      fs.writeFileSync(getOutputPath("docs-flatten/sub-folder/b.md"), "");
      fs.writeFileSync(getOutputPath("docs-flatten/sub-folder/sub-folder2/c.md"), "");

      indexProcessor = new MarkdownIndexProcessor({
        flatten: true,
        recursive: true,
        markdownLinks: true,
      });
      await indexProcessor.handle(getOutputPath("docs-flatten"));

      const indexFileContent = fs.readFileSync(
        getOutputPath("docs-flatten/index.md"),
        "utf8",
      );

      const indenter = (level: number) => {
        return listIndentPrefix(level);
      }

      expect(indexFileContent).toBe(
        `${indenter(0)}- [a.md](a.md)\n` +
        `${indenter(0)}- [sub-folder/](sub-folder/index.md)\n` +
          `${indenter(1)}- [b.md](sub-folder/b.md)\n` +
          `${indenter(1)}- [sub-folder2/](sub-folder/sub-folder2/index.md)\n` +
            `${indenter(2)}- [c.md](sub-folder/sub-folder2/c.md)\n`
      );
    });
  })

  describe("recursion", () => {
    test("should add the index.md to the path when isRootConfig is true, recursive is false and flatten is true", async () => {

      fs.mkdirSync(getOutputPath("docs-recursion/sub-folder/sub-folder2"), { recursive: true });
      fs.writeFileSync(getOutputPath("docs-recursion/a.md"), "");
      fs.writeFileSync(getOutputPath("docs-recursion/sub-folder/b.md"), "");
      fs.writeFileSync(getOutputPath("docs-recursion/sub-folder/sub-folder2/c.md"), "");

      indexProcessor = new MarkdownIndexProcessor({
        isRootConfig: true,
        recursive: false,
        flatten: true,
        markdownLinks: true,
      });
      await indexProcessor.handle(getOutputPath("docs-recursion"));

      const indexFileContent = fs.readFileSync(
        getOutputPath("docs-recursion/index.md"),
        "utf8",
      );

      const indenter = (level: number) => {
        return listIndentPrefix(level);
      }

      expect(indexFileContent).toBe(
        `${indenter(0)}- [a.md](a.md)\n` +
        `${indenter(0)}- [sub-folder/](sub-folder/index.md)\n` +
          `${indenter(1)}- [b.md](sub-folder/b.md)\n` +
          `${indenter(1)}- [sub-folder2/](sub-folder/sub-folder2/index.md)\n` +
            `${indenter(2)}- [c.md](sub-folder/sub-folder2/c.md)\n`
      );

    });

    test("should not process nested index.md files when recursive is false", async () => {

      fs.mkdirSync(getOutputPath("docs-recursion/sub-folder/sub-folder2"), { recursive: true });
      fs.writeFileSync(getOutputPath("docs-recursion/a.md"), "");
      fs.writeFileSync(getOutputPath("docs-recursion/sub-folder/b.md"), "");
      fs.writeFileSync(getOutputPath("docs-recursion/sub-folder/sub-folder2/c.md"), "");

      indexProcessor = new MarkdownIndexProcessor({
        recursive: false,
        flatten: true,
        markdownLinks: true,
      });
      await indexProcessor.handle(getOutputPath("docs-recursion"));

      const indexFileExists = fs.existsSync(getOutputPath("docs-recursion/index.md"));
      const subFolderIndexFileExists = fs.existsSync(getOutputPath("docs-recursion/sub-folder/index.md"));
      const subFolder2IndexFileExists = fs.existsSync(getOutputPath("docs-recursion/sub-folder/sub-folder2/index.md"));

      expect(indexFileExists).toBe(true);
      expect(subFolderIndexFileExists).toBe(false);
      expect(subFolder2IndexFileExists).toBe(false);
    });
  });
});
