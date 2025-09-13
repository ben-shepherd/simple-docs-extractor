import fs from "fs";
import path from "path";
import { ExtractedContent } from "../extractors/DocumentContentExtractor.js";

export type Locales = {
  updatedAt: string;
  fileName: string;
};

export class LocalesService {
  constructor(private file: string) {}

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

  getLocales() {
    const fileStat = fs.statSync(this.file);
    const updatedAt = fileStat.mtime.toISOString();
    const fileName = path.basename(this.file);

    return {
      updatedAt,
      fileName,
    };
  }

  getLocalesAsExtractedContents(): ExtractedContent[] {
    const locales = this.getLocales();
    return LocalesService.toExtractedContents(locales);
  }
}
