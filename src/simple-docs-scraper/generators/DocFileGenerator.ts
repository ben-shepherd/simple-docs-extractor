import fs from "fs";
import path from "path";
import { ExtensionReplacer } from "../transformers/ExtensionReplacer.js";

export type DocGeneratorConfig = {
  template?: string;
  outDir: string;
};

/**
 * <docs>
 * Generates documentation files by injecting content into templates.
 *
 * This class handles the creation of markdown documentation files by taking
 * content and injecting it into a template file. It can save the generated
 * content to files with proper markdown extensions and directory structure.
 *
 * @param {DocGeneratorConfig} config - Configuration object containing template path, output directory, and search/replace pattern
 * </docs>
 */
export class DocFileGenerator {
  constructor(private config: DocGeneratorConfig) {}

  /**
   * Generates a documentation file by injecting content into a template.
   *
   * @param injectedContent - The documentation content to inject into the template
   * @param outFile - The original file path used to determine the output filename
   * @throws {Error} When the template file is not found
   */
  saveToMarkdownFile(injectedContent: string, outFile: string): void {
    const fileBaseName = path.basename(outFile);
    let outFilePath = path.join(this.config.outDir, fileBaseName);

    // Replace all extensions with .md
    outFilePath = ExtensionReplacer.appendMdExtension(outFilePath);

    // Create the out directory if it doesn't exist
    if (!fs.existsSync(this.config.outDir)) {
      fs.mkdirSync(this.config.outDir, { recursive: true });
    }

    fs.writeFileSync(outFilePath, injectedContent);
  }

  /**
   * Retrieves the template content from the configured template file.
   *
   * @returns The template content as a string
   * @throws {Error} When the template file is not found
   */
  getTemplateContent(searchAndReplace: string = "%content%"): string {
    if (!this.config.template) {
      return searchAndReplace;
    }

    // Check if the template file exists
    if (!fs.existsSync(this.config.template)) {
      throw new Error("Template file not found");
    }

    return fs.readFileSync(this.config.template, "utf8");
  }
}
