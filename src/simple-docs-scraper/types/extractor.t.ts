import { ErrorResult, ExtractedContent } from "../index.js";

export type ExtractorPluginConstructor = new (
  ...args: unknown[]
) => ExtractorPlugin;

export type BaseExtractorConfig = Record<string, unknown> & {
  searchAndReplace: string;
  defaultText?: string;
};

export type ExtractorPlugin<
  Config extends BaseExtractorConfig = BaseExtractorConfig,
> = {
  setConfig(config: Config): ExtractorPlugin<Config>;
  getConfig(): Config;
  extractFromString(str: string): Promise<ExtractedContent[] | ErrorResult>;
};
