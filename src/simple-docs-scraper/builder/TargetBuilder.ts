import { GlobOptions } from "glob";
import path from "path";
import { DocumentContentExtractorConfig } from "../extractors/DocumentContentExtractor.js";
import { Target } from "../services/SimpleDocExtractor.js";
import { Templates } from "../types/config.t.js";
import { ExtractorPlugin } from "../types/extractor.t.js";
import { TemplateCallback } from "./Builder.js";
import { TemplateBuilder } from "./TemplateBuilder.js";

export class TargetBuilder {
    constructor(
        private _patterns: string | string[] = '**/*.*',
        private _cwd: string = process.cwd(),
        private _ignore: string | string[] = [],
        private _outDir: string = path.join(process.cwd(), 'docs'),
        private _globOptions: GlobOptions = {},
        private _createIndexFile: boolean = false,
        private _templates: Templates = {},
        private _plugins: ExtractorPlugin[] = []
    ) {}

    patterns(patterns: string | string[]) {
        this._patterns = patterns;
        return this;
    }

    cwd(cwd: string) {
        this._cwd = cwd;
        return this;
    }

    ignores(ignore: string | string[]) {
        this._ignore = ignore;
        return this;
    }

    outDir(outDir: string) {
        this._outDir = outDir;
        return this;
    }

    globOptions(globOptions: GlobOptions) {
        this._globOptions = globOptions;
        return this;
    }

    createIndexFiles() {
        this._createIndexFile = true;
        return this;
    }

    indexTemplate(callback: TemplateCallback) {
        const builder = new TemplateBuilder('index');
        callback(builder);
        this._templates.index = builder.build().index;
        return this;
    }

    useDocumentationTemplate(templatePath: string) {
        this.documentationTemplate((t) => {
            t.useFile(templatePath);
        });
        return this;
    }

    documentationTemplate(callback: TemplateCallback) {
        const builder = new TemplateBuilder('documentation');
        callback(builder);
        this._templates.documentation = builder.build().documentation;
        return this;
    }

    plugins(plugins: DocumentContentExtractorConfig) {
        this._plugins = plugins;
        return this;
    }
    
    build(): Target {
        return {
            outDir: this._outDir,
            globOptions: {
                ...this._globOptions,
                cwd: this._cwd,
                patterns: this._patterns,
                ignore: this._ignore,
            },
            createIndexFile: this._createIndexFile,
            templates: this._templates,
            plugins: this._plugins
        }
    }
    

}