import fs from "fs";
import path from "path";
import { ExtractedContent } from "../extractors/DocumentContentExtractor.js";

// Type representing locale information extracted from a file
export type Locales = {
  updatedAt: string;
  fileName: string;
};

/**
 * <docs>
 * Service for extracting and managing locale information from files.
 * 
 * Provides functionality to get file metadata (last modified time and filename)
 * and convert it to extracted content format for template processing.
 * 
 * @param {string} file - The file path to extract locale information from
 * </docs>
 */
export class LocalesService {
  constructor(private file: string) {}

  /**
   * <method name="toExtractedContents">
   * Converts locale information to extracted content format for template processing.
   * 
   * @param {Locales} locales - The locale information to convert
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
   * Retrieves locale information from the file including last modified time and filename.
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
   * Gets locale information and converts it to extracted content format.
   * 
   * @returns {ExtractedContent[]} Array of extracted content objects ready for template processing
   * </method>
   */
  getLocalesAsExtractedContents(): ExtractedContent[] {
    const locales = this.getLocales();
    return LocalesService.toExtractedContents(locales);
  }
}
