import { BaseExtractorConfig, ExtractorPlugin } from "../types/extractor.t.js";
import { ErrorResult, ExtractedContent } from "./DocumentContentExtractor.js";

export type RegexExtractorPluginConfig = BaseExtractorConfig & {
  pattern: RegExp;
};

export class RegexExtractorPlugin
  implements ExtractorPlugin<RegexExtractorPluginConfig>
{
  constructor(private config: RegexExtractorPluginConfig) {
    if (config) {
      this.setConfig(config);
    }
  }

  setConfig(config: RegexExtractorPluginConfig): this {
    this.config = config;
    return this;
  }

  getConfig(): RegexExtractorPluginConfig {
    return this.config;
  }

  async extractFromString(
    str: string,
  ): Promise<ExtractedContent[] | ErrorResult> {
    const regex = new RegExp(this.config.pattern);
    const matches = str.match(regex);

    if (!matches || typeof matches[1] !== "string") {
      return {
        errorMessage: "No content found in the file",
        nonThrowing: true,
      };
    }

    const content = matches[1];

    return [
      {
        content: content,
        attributes: {},
        searchAndReplace: this.config.searchAndReplace,
      },
    ];
  }
}
