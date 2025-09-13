import { ExcerptExtractorConfig } from "../transformers/ExcerptExtractor.js";
import { FileNameCallback, LineCallback, Templates } from "../types/config.t.js";

export class TemplateBuilder {
    constructor(
        private _type: 'index' | 'documentation',
        private _templatePath?: string,
        private _markdownLinks: boolean = true,
        private _filesHeading: string = "\n## Files\n",
        private _directoryHeading: string = "\n## Folders\n",
        private _excerpt?: ExcerptExtractorConfig,
        private _lineCallback?: LineCallback,
        private _fileNameCallback?: FileNameCallback
    ) {}

    useFile(file: string) {
        this._templatePath = file;
        return this;
    }

    useMarkdownLinks() {
        this._markdownLinks = true;
        return this;
    }

    filesHeading(filesHeading: string) {
        this._filesHeading = filesHeading;
        return this;
    }
    
    directoryHeading(directoryHeading: string) {
        this._directoryHeading = directoryHeading;
        return this;
    }

    excerpt(excerpt: ExcerptExtractorConfig) {
        this._excerpt = excerpt;
        return this;
    }

    lineCallback(lineCallback: LineCallback) {
        this._lineCallback = lineCallback;
        return this;
    }

    fileNameCallback(fileNameCallback: FileNameCallback) {
        this._fileNameCallback = fileNameCallback;
        return this;
    }

    build(): Templates {
        return {
            [this._type]: {
                templatePath: this._templatePath,
                markdownLinks: this._markdownLinks,
                filesHeading: this._filesHeading,
                directoryHeading: this._directoryHeading,
                excerpt: this._excerpt,
                lineCallback: this._lineCallback,
                fileNameCallback: this._fileNameCallback
            }
        }
    }
}