import { RecommendedFormatters } from "../formatters/RecommendedFormatters.js";
import { SimpleDocExtractor, Target } from "../services/SimpleDocExtractor.js";
import { SimpleDocExtractorConfig, Templates } from "../types/config.t.js";
import { TFormatter } from "../types/formatter.t.js";
import { TargetBuilder } from "./TargetBuilder.js";
import { TemplateBuilder } from "./TemplateBuilder.js";

export type TemplateCallback = (builder: TemplateBuilder) => void;

export type TargetCallback = (builder: TargetBuilder) => void;

export class Builder {
    constructor(
        private _baseDir: string = process.cwd(),
        private _targets: Target[] = [],
        private _templates: Templates = {},
        private _formatters: TFormatter[] = []
    ) { }

    target(callback: TargetCallback) {
        const builder = new TargetBuilder();
        callback(builder);
        this._targets.push(builder.build());
        return this;
    }

    indexTemplate(callback: TemplateCallback) {
        const builder = new TemplateBuilder('index');
        callback(builder);
        this._templates.index = builder.build().index;
        return this;
    }

    documentationTemplate(callback: TemplateCallback) {
        const builder = new TemplateBuilder('documentation');
        callback(builder);
        this._templates.documentation = builder.build().documentation;
        return this;
    }

    addFormatters(formatters: TFormatter | TFormatter[]) {
        this._formatters.push(...(Array.isArray(formatters) ? formatters : [formatters]));
        return this;
    }

    addRecommendedFormatters() {
        this._formatters.push(...RecommendedFormatters.recommended());
        return this;
    }

    buildConfig(): SimpleDocExtractorConfig {
        return {
            baseDir: this._baseDir,
            templates: this._templates,
            targets: this._targets,
            formatters: this._formatters,
        }
    }

    buildService(): SimpleDocExtractor {
        return new SimpleDocExtractor(this.buildConfig());
    }
}
