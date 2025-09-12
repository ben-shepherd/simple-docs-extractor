import { BaseExtractorConfig, ExtractorPlugin } from "../types/extractor.t.js";
import { ErrorResult, ExtractedContent } from "./DocumentContentExtractor.js";

export type CallbackExtractorConfig = BaseExtractorConfig & {
    callback: (
        str: string,
    ) => Promise<string | string[] | undefined> | (string | string[] | undefined);
}

export class CallbackExtractor implements ExtractorPlugin<CallbackExtractorConfig> {
    private config!: CallbackExtractorConfig;

    setConfig(config: CallbackExtractorConfig): this {
        this.config = config;
        return this;
    }

    getConfig(): CallbackExtractorConfig {
        return this.config;
    }

    async extractFromString(str: string): Promise<ExtractedContent[] | ErrorResult> {
        const content = await this.config.callback(str);

        if(!content) {
            return {
                errorMessage: "Callback function returned no content",
                nonThrowing: true,
            };
        }

        return (Array.isArray(content) ? content : [content]).map(item => ({
            content: item,
            attributes: {},
        }))
    }
}