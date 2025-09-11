import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
} from "@jest/globals";
import fs from "fs";
import { DocFileGenerator } from "../simple-docs-scraper/generators/DocFileGenerator.js";
import { deleteOutputFiles } from "./helpers/deleteOutputFiles.js";
import { getOutputPath } from "./helpers/getOutputPath.js";

describe("Doc File Generator", () => {
  let docGenerator!: DocFileGenerator;

  beforeEach(() => {
    fs.writeFileSync(
      getOutputPath("test.template.md"),
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
    test("should accept config", () => {
      expect(
        () =>
          (docGenerator = new DocFileGenerator({
            template: getOutputPath("test.template.md"),
            outDir: process.cwd() + "/src/tests/output",
          })),
      ).not.toThrow();
    });

    test("should accept no template file", () => {
      expect(
        () =>
          (docGenerator = new DocFileGenerator({
            outDir: process.cwd() + "/src/tests/output",
          })),
      ).not.toThrow();
    });
  });

  describe("generateContent", () => {
    test("should save the content to markdown file", () => {
      docGenerator = new DocFileGenerator({
        template: getOutputPath("test.template.md"),
        outDir: process.cwd() + "/src/tests/output",
      });

      docGenerator.saveToMarkdownFile("This is a test string.", "test.md");

      const fileContent = fs.readFileSync(getOutputPath("test.md"), "utf8");

      expect(fileContent).toContain("This is a test string.");
    });
  });

  describe("getTemplateContent", () => {
    test("should get the template content if file exists", () => {
      const templateContent = docGenerator.getTemplateContent();

      expect(templateContent).toContain("Start.");
      expect(templateContent).toContain("%content%");
      expect(templateContent).toContain("End.");
    });

    test("should use default search and replace if no template file is provided", () => {
      new DocFileGenerator({
        outDir: process.cwd() + "/src/tests/output",
      });

      const templateContent = docGenerator.getTemplateContent();

      expect(templateContent).toContain("%content%");
    });

    test("should throw an error if the template file does not exist", () => {
      const docGenerator = new DocFileGenerator({
        template: "path-to-non-existent.md",
        outDir: process.cwd() + "/src/tests/output",
      });

      expect(() => docGenerator.getTemplateContent()).toThrow(
        "Template file not found",
      );
    });
  });
});
