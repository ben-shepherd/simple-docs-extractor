import fs from "fs";
import path from "path";
import { ExtractedContent } from "../extractors/DocumentContentExtractor.js";

export type Locales = {
  updatedAt: string;
  fileName: string;
};

/**
 * <docs>
 * Service for generating locale variables from file metadata.
 * 
 * This service extracts file metadata such as modification time and filename
 * and converts them into locale variables that can be used in documentation
 * templates. It provides both direct locale access and conversion to extracted
 * content format for template injection.
 * 
 * @example
 * ```typescript
 * const localesService = new LocalesService('./src/example.js');
 * const locales = localesService.getLocales();
 * // Returns: { updatedAt: '2023-12-01T10:30:00.000Z', fileName: 'example.js' }
 * 
 * const extractedContents = localesService.getLocalesAsExtractedContents();
 * // Returns array of ExtractedContent objects for template injection
 * ```
 * 
 * @param {string} file - The file path to extract metadata from
 * </docs>
 */
export class LocalesService {
  constructor(private file: string) {}

  /**
   * <method name="toExtractedContents">
   * Converts locale data into extracted content format for template injection.
   * 
   * @param {Locales} locales - The locale data to convert
   * @returns {ExtractedContent[]} Array of extracted content objects with search and replace patterns
   * </method>
   */
  static toExtractedContents(locales: Locales): ExtractedContent[] {
    return [
      {
        content: locales.updatedAt,
        attributes: {},
        searchAndReplace: "%locales.updatedAt%",
      },
      {
        content: locales.fileName,
        attributes: {},
        searchAndReplace: "%locales.fileName%",
      },
    ];
  }

  /**
   * <method name="getLocales">
   * Extracts locale data from the configured file.
   * 
   * @returns {Locales} Object containing updatedAt timestamp and fileName
   * </method>
   */
  getLocales() {
    const fileStat = fs.statSync(this.file);
    const updatedAt = fileStat.mtime.toISOString();
    const fileName = path.basename(this.file);

    return {
      updatedAt,
      fileName,
    };
  }

  /**
   * <method name="getLocalesAsExtractedContents">
   * Gets locale data converted to extracted content format.
   * 
   * @returns {ExtractedContent[]} Array of extracted content objects ready for template injection
   * </method>
   */
  getLocalesAsExtractedContents(): ExtractedContent[] {
    const locales = this.getLocales();
    return LocalesService.toExtractedContents(locales);
  }
}
