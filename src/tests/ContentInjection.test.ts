import { Target } from "@/simple-docs-scraper/index.js";
import { ExtractorPlugin } from "@/simple-docs-scraper/types/extractor.t.js";
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
} from "@jest/globals";
import fs from "fs";
import { ContentInjection } from "../simple-docs-scraper/transformers/ContentInjection.js";
import { deleteOutputFiles } from "./helpers/deleteOutputFiles.js";
import { getOutputPath } from "./helpers/getOutputPath.js";

describe("Injection", () => {
  let injection!: ContentInjection;
  const outDir = process.cwd() + "/src/tests/output";

  let mockTarget: Target;
  let mockExtractorPlugin: ExtractorPlugin;

  beforeEach(() => {
    deleteOutputFiles();

    // Create a mock target
    mockExtractorPlugin = {
      getConfig: () => ({
        searchAndReplace: "%content%",
        attributeFormat: "*{key}*: {value}",
      }),
    } as ExtractorPlugin;

    mockTarget = {
      globOptions: {
        cwd: process.cwd(),
        extensions: "**/*.js",
      },
      outDir,
      createIndexFile: false,
      extraction: [mockExtractorPlugin],
    };

    // Create a mock template file
    fs.writeFileSync(
      getOutputPath("test.template.txt"),
      "Start. %content% End.",
    );
  });

  afterEach(() => {
    deleteOutputFiles();
  });

  afterAll(() => {
    deleteOutputFiles();
  });

  describe("config", () => {
    test("should be able to configure the docs injection", () => {
      expect(
        () =>
          new ContentInjection(
            {
              template: getOutputPath("test.template.txt"),
              outDir,
            },
            mockTarget,
          ),
      );
    });
  });

  describe("inject", () => {
    test("should be able to inject the docs into the content", () => {
      injection = new ContentInjection(
        {
          template: getOutputPath("test.template.txt"),
          outDir,
        },
        mockTarget,
      );

      const result = injection.getTemplateContentWithReplaceString(
        "This is a test string.",
        "%content%",
      );

      expect(result).toContain("Start.");
      expect(result).toContain("This is a test string.");
      expect(result).toContain("End.");
    });
  });

  describe("injectIntoFile", () => {
    test("should be able to inject the docs into the file", () => {
      injection = new ContentInjection(
        {
          template: getOutputPath("test.template.txt"),
          outDir,
        },
        mockTarget,
      );

      const content = injection.getTemplateContentWithReplaceString(
        "This is a test string.",
        "%content%",
      );
      injection.writeFile(content, "test.txt");

      // Make folder recursively if it doesn't exist
      if (!fs.existsSync(process.cwd() + "/src/tests/output")) {
        fs.mkdirSync(process.cwd() + "/src/tests/output", { recursive: true });
      }

      // Check if the file exists
      if (!fs.existsSync(getOutputPath("test.txt"))) {
        throw new Error("File not found");
      }

      const fileContents = fs.readFileSync(getOutputPath("test.txt"), "utf8");

      expect(fileContents).toContain("Start.");
      expect(fileContents).toContain("This is a test string.");
      expect(fileContents).toContain("End.");
    });
  });

  describe("mergeExtractionResultsIntoTemplateString", () => {
    test("should be able to merge extraction results into the template string", () => {
      // Create a mock template file
      fs.writeFileSync(
        getOutputPath("test.template.txt"),
        "Start. %content% End.",
      );

      injection = new ContentInjection(
        {
          template: getOutputPath("test.template.txt"),
          outDir,
        },
        mockTarget,
      );

      const result = injection.mergeExtractedContentsIntoTemplateString([
        {
          content: "This is a test string.",
          searchAndReplace: "%content%",
          attributes: {},
        },
      ]);

      expect(result).toContain("Start.");
      expect(result).toContain("This is a test string.");
      expect(result).toContain("End.");
    });

    test("should be able to create multiple blocks of content with the same search and replace", () => {
      injection = new ContentInjection(
        {
          template: getOutputPath("test.template.txt"),
          outDir,
        },
        mockTarget,
      );

      const result = injection.mergeExtractedContentsIntoTemplateString([
        {
          content: "This is a test string.",
          searchAndReplace: "%content%",
          attributes: {},
        },
        {
          content: "This is a test string 2.",
          searchAndReplace: "%content%",
          attributes: {},
        },
      ]);

      expect(result).toContain("Start.");
      expect(result).toContain("This is a test string.");
      expect(result).toContain("This is a test string 2.");
      expect(result).toContain("End.");
    });

    test("should not add the divide by to the last block", () => {
      injection = new ContentInjection(
        {
          template: getOutputPath("test.template.txt"),
          outDir,
        },
        mockTarget,
      );

      const result = injection.mergeExtractedContentsIntoTemplateString([
        {
          content: "This is a test string.",
          searchAndReplace: "%content%",
          attributes: {},
          divideBy: "\n---\n",
        },
        {
          content: "This is a test string 2.",
          searchAndReplace: "%content%",
          attributes: {},
          divideBy: "\n---\n",
        },
      ]);

      expect(result).toContain(
        "This is a test string.\n---\nThis is a test string 2. End.",
      );
    });

    test("should be placed in the correct order", () => {
      // Create a mock template file
      fs.writeFileSync(
        getOutputPath("test.template.txt"),
        `StartDocs
%content%
EndDocs
StartMethods
%methods%
EndMethods`,
      );

      injection = new ContentInjection(
        {
          template: getOutputPath("test.template.txt"),
          outDir,
        },
        mockTarget,
      );

      const result = injection.mergeExtractedContentsIntoTemplateString([
        {
          content: "This a content block",
          searchAndReplace: "%content%",
          attributes: {},
        },
        {
          content: "This is a methods block",
          searchAndReplace: "%methods%",
          attributes: {},
        },
      ]);

      expect(result).toContain(
        "StartDocs\nThis a content block\nEndDocs\nStartMethods\nThis is a methods block\nEndMethods",
      );
    });

    test("should place default text when no extraction results are provided", () => {
      // Create a mock template file
      fs.writeFileSync(
        getOutputPath("test.template.txt"),
        `StartDocs
%content%
EndDocs`,
      );

      injection = new ContentInjection(
        {
          template: getOutputPath("test.template.txt"),
          outDir,
        },
        mockTarget,
      );

      // Create a mock extractor plugin
      const mockExtractorPlugin = {
        getConfig: (): ReturnType<ExtractorPlugin["getConfig"]> => ({
          searchAndReplace: "%content%",
          defaultText: "No content found.",
        }),
      } as ExtractorPlugin;

      // This should just return the template content, with no other changes
      let result = injection.mergeExtractedContentsIntoTemplateString([]);
      // We can then apply the default text
      result = injection.applyDefaultText(result, [mockExtractorPlugin]);

      expect(result).toContain("StartDocs\nNo content found.\nEndDocs");
    });
  });

  describe("content attributes", () => {
    test("should be able to format the attributes", () => {
      // Create a mock template file
      fs.writeFileSync(
        getOutputPath("test.template.txt"),
        `StartDocs
%content%
EndDocs`,
      );

      // Note: The format of the attributes is defined in the mock target
      injection = new ContentInjection(
        {
          template: getOutputPath("test.template.txt"),
          outDir,
        },
        mockTarget,
      );

      // This should just return the template content, with no other changes
      const result = injection.mergeExtractedContentsIntoTemplateString([
        {
          content: "This a content block",
          searchAndReplace: "%content%",
          attributes: {
            name: "John Doe",
            age: "30",
          },
        },
      ]);
      expect(result).toContain(
        "StartDocs\n*name*: John Doe*age*: 30This a content block\nEndDocs",
      );
    });
  });
});
