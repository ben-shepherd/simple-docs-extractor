import { ExcerptExtractorConfig } from "../transformers/ExcerptExtractor.js";
import { FileNameCallback, LineCallback, Templates } from "../types/config.t.js";

/**
 * <docs>
 * A builder class for configuring template settings for documentation generation.
 * 
 * This class provides a fluent interface for configuring templates used in the
 * documentation extraction process. It supports both index and documentation
 * template types with various customization options.
 * 
 * @param {string} _type - The type of template ('index' or 'documentation')
 * @param {string} [_templatePath] - Optional path to a custom template file
 * @param {boolean} [_markdownLinks=true] - Whether to use markdown links in output
 * @param {string} [_filesHeading="\n## Files\n"] - Heading text for files section
 * @param {string} [_directoryHeading="\n## Folders\n"] - Heading text for directories section
 * @param {ExcerptExtractorConfig} [_excerpt] - Optional excerpt extraction configuration
 * @param {LineCallback} [_lineCallback] - Optional callback for processing individual lines
 * @param {FileNameCallback} [_fileNameCallback] - Optional callback for processing file names
 * </docs>
 */
export class TemplateBuilder {
    constructor(
        private _type: 'rootIndex' | 'index' | 'documentation',
        private _templatePath?: string,
        private _markdownLinks: boolean = true,
        private _filesHeading: string = "\n## Files\n",
        private _directoryHeading: string = "\n## Folders\n",
        private _excerpt?: ExcerptExtractorConfig,
        private _lineCallback?: LineCallback,
        private _fileNameCallback?: FileNameCallback
    ) {}

    /**
     * <method name="useFile">
     * Sets the template file path to use for this template.
     * 
     * @param {string} file - The path to the template file
     * @returns {TemplateBuilder} This builder instance for method chaining
     * </method>
     */
    useFile(file: string) {
        this._templatePath = file;
        return this;
    }

    /**
     * <method name="useMarkdownLinks">
     * Enables markdown links in the generated documentation.
     * 
     * @returns {TemplateBuilder} This builder instance for method chaining
     * </method>
     */
    useMarkdownLinks() {
        this._markdownLinks = true;
        return this;
    }

    /**
     * <method name="filesHeading">
     * Sets the heading text for the files section in the template.
     * 
     * @param {string} filesHeading - The heading text for files section
     * @returns {TemplateBuilder} This builder instance for method chaining
     * </method>
     */
    filesHeading(filesHeading: string) {
        this._filesHeading = filesHeading;
        return this;
    }
    
    /**
     * <method name="directoryHeading">
     * Sets the heading text for the directories section in the template.
     * 
     * @param {string} directoryHeading - The heading text for directories section
     * @returns {TemplateBuilder} This builder instance for method chaining
     * </method>
     */
    directoryHeading(directoryHeading: string) {
        this._directoryHeading = directoryHeading;
        return this;
    }

    /**
     * <method name="excerpt">
     * Sets the excerpt extraction configuration for this template.
     * 
     * @param {ExcerptExtractorConfig} excerpt - The excerpt extraction configuration
     * @returns {TemplateBuilder} This builder instance for method chaining
     * </method>
     */
    excerpt(excerpt: ExcerptExtractorConfig) {
        this._excerpt = excerpt;
        return this;
    }

    /**
     * <method name="lineCallback">
     * Sets the callback function for processing individual lines in the template.
     * 
     * @param {LineCallback} lineCallback - The callback function for line processing
     * @returns {TemplateBuilder} This builder instance for method chaining
     * </method>
     */
    lineCallback(lineCallback: LineCallback) {
        this._lineCallback = lineCallback;
        return this;
    }

    /**
     * <method name="fileNameCallback">
     * Sets the callback function for processing file names in the template.
     * 
     * @param {FileNameCallback} fileNameCallback - The callback function for file name processing
     * @returns {TemplateBuilder} This builder instance for method chaining
     * </method>
     */
    fileNameCallback(fileNameCallback: FileNameCallback) {
        this._fileNameCallback = fileNameCallback;
        return this;
    }

    /**
     * <method name="build">
     * Builds and returns the template configuration object.
     * 
     * @returns {Templates} The template configuration object
     * </method>
     */
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