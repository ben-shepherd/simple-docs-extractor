import { DocFileGeneratorConfig } from "../generators/DocFileGenerator.js";
import { IndexFileGeneratorConfig } from "../generators/IndexFileGenerator.js";
import { Target } from "../services/SimpleDocExtractor.js";
import { TFormatter } from "./formatter.t.js";

export type LineCallback = (
  fileNameEntry: string,
  lineNumber: number,
  excerpt?: string,
) => string;

export type FileNameCallback = (filePath: string) => string;

export type TemplatePathConfig = {
  templatePath?: string;
};

export type IndexTemplateConfig = TemplatePathConfig &
  Partial<IndexFileGeneratorConfig>;

export type DocumentationTemplateConfig = TemplatePathConfig &
  Partial<DocFileGeneratorConfig>;

export type Templates = {
  index?: IndexTemplateConfig;
  rootIndex?: IndexTemplateConfig;
  documentation?: DocumentationTemplateConfig;
};

export interface SimpleDocExtractorConfig {
  dryRun?: boolean;
  baseDir: string;
  targets: Target[];
  templates?: Templates;
  formatters?: TFormatter[];
}
