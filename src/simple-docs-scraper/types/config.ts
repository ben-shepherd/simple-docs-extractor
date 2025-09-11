import { DocumentContentExtractorConfig } from "../files/DocumentContentExtractor.js";
import { DocFileGeneratorConfig } from "../generators/DocFileGenerator.js";
import { IndexFileGeneratorConfig } from "../generators/IndexFileGenerator.js";
import { Target } from "../services/SimpleDocExtractor.js";
import { TFormatter } from "./formatter.t.js";

export type IndexGeneratorConfig = {
  template: string;
} & Partial<IndexFileGeneratorConfig>;

export type DocumentationGeneratorConfig = {
  template: string;
} & Partial<DocFileGeneratorConfig>;

export interface SimpleDocExtractorConfig {
  baseDir: string;
  extraction: DocumentContentExtractorConfig;
  generators?: {
    index?: IndexGeneratorConfig;
    documentation?: DocumentationGeneratorConfig;
  };
  targets: Target[];
  formatters?: TFormatter[];
}
