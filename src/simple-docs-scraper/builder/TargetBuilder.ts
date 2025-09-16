import { TemplateCallback } from "@/simple-docs-scraper/builder/Builder.js";
import { TemplateBuilder } from "@/simple-docs-scraper/builder/TemplateBuilder.js";
import { Target } from "@/simple-docs-scraper/services/SimpleDocExtractor.js";
import { Templates } from "@/simple-docs-scraper/types/config.t.js";
import { ExtractorPlugin } from "@/simple-docs-scraper/types/extractor.t.js";
import { GlobOptions } from "glob";
import path from "path";

/**
 * <docs>
 * A builder class for configuring target settings for documentation extraction.
 *
 * This class provides a fluent interface for configuring targets that define
 * which files to process, where to output documentation, and how to handle
 * templates and plugins for the extraction process.
 *
 * @param {string | string[]} _patterns - Glob patterns for file matching
 * @param {string} _cwd - Current working directory for file operations
 * @param {string | string[]} _ignore - Patterns to ignore during file matching
 * @param {string} _outDir - Output directory for generated docs
 * @param {GlobOptions} _globOptions - Additional options for glob pattern matching
 * @param {boolean} _createIndexFile - Whether to create index files
 * @param {Templates} _templates - Template configurations for documentation generation
 * @param {ExtractorPlugin[]} _plugins - Plugins to use during extraction
 * </docs>
 */
export class TargetBuilder {
  constructor(
    private _patterns: string | string[] = "**/*.*",
    private _cwd: string = process.cwd(),
    private _ignore: string | string[] = [],
    private _outDir: string = path.join(process.cwd(), "docs"),
    private _globOptions: GlobOptions = {},
    private _createIndexFile: boolean = false,
    private _templates: Templates = {},
    private _plugins: ExtractorPlugin[] = [],
  ) {}

  /**
   * <method name="patterns">
   * Sets the glob patterns for file matching.
   *
   * @param {string | string[]} patterns - The glob patterns to match files
   * @returns {TargetBuilder} This builder instance for method chaining
   * </method>
   */
  patterns(patterns: string | string[]) {
    this._patterns = patterns;
    return this;
  }

  /**
   * <method name="cwd">
   * Sets the current working directory for file operations.
   *
   * @param {string} cwd - The current working directory path
   * @returns {TargetBuilder} This builder instance for method chaining
   * </method>
   */
  cwd(cwd: string) {
    this._cwd = cwd;
    return this;
  }

  /**
   * <method name="ignores">
   * Sets the patterns to ignore during file matching.
   *
   * @param {string | string[]} ignore - The patterns to ignore
   * @returns {TargetBuilder} This builder instance for method chaining
   * </method>
   */
  ignores(ignore: string | string[]) {
    this._ignore = ignore;
    return this;
  }

  /**
   * <method name="outDir">
   * Sets the output directory for generated documentation.
   *
   * @param {string} outDir - The output directory path
   * @returns {TargetBuilder} This builder instance for method chaining
   * </method>
   */
  outDir(outDir: string) {
    this._outDir = outDir;
    return this;
  }

  /**
   * <method name="globOptions">
   * Sets additional options for glob pattern matching.
   *
   * @param {GlobOptions} globOptions - The glob options to use
   * @returns {TargetBuilder} This builder instance for method chaining
   * </method>
   */
  globOptions(globOptions: GlobOptions) {
    this._globOptions = globOptions;
    return this;
  }

  /**
   * <method name="createIndexFiles">
   * Enables creation of index files for the target.
   *
   * @returns {TargetBuilder} This builder instance for method chaining
   * </method>
   */
  createIndexFiles() {
    this._createIndexFile = true;
    return this;
  }

  /**
   * <method name="indexTemplate">
   * Configures the index template using a callback function.
   *
   * @param {TemplateCallback} callback - The callback function to configure the template
   * @returns {TargetBuilder} This builder instance for method chaining
   * </method>
   */
  indexTemplate(callback: TemplateCallback) {
    const builder = new TemplateBuilder("index");
    callback(builder);
    this._templates.index = builder.build().index;
    return this;
  }

  /**
   * <method name="useDocumentationTemplate">
   * Sets a documentation template file path.
   *
   * @param {string} templatePath - The path to the documentation template file
   * @returns {TargetBuilder} This builder instance for method chaining
   * </method>
   */
  useDocumentationTemplate(templatePath: string) {
    this.documentationTemplate((t) => {
      t.useFile(templatePath);
    });
    return this;
  }

  /**
   * <method name="useRootIndexTemplate">
   * Sets a root index template file path.
   *
   * @param {string} templatePath - The path to the root index template file
   * @returns {TargetBuilder} This builder instance for method chaining
   * </method>
   */
  rootIndexTemplate(callback: TemplateCallback) {
    const builder = new TemplateBuilder("rootIndex");
    callback(builder);
    this._templates.rootIndex = builder.build().rootIndex;
    return this;
  }

  /**
   * <method name="documentationTemplate">
   * Configures the documentation template using a callback function.
   *
   * @param {TemplateCallback} callback - The callback function to configure the template
   * @returns {TargetBuilder} This builder instance for method chaining
   * </method>
   */
  documentationTemplate(callback: TemplateCallback) {
    const builder = new TemplateBuilder("documentation");
    callback(builder);
    this._templates.documentation = builder.build().documentation;
    return this;
  }

  /**
   * <method name="plugins">
   * Sets the plugins to use during extraction.
   *
   * @param {ExtractorPlugin[] | ExtractorPlugin} plugins - The plugin(s) to use
   * @returns {TargetBuilder} This builder instance for method chaining
   * </method>
   */
  plugins(plugins: ExtractorPlugin[] | ExtractorPlugin) {
    this._plugins = Array.isArray(plugins) ? plugins : [plugins];
    return this;
  }

  /**
   * <method name="build">
   * Builds and returns the target configuration object.
   *
   * @returns {Target} The target configuration object
   * </method>
   */
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
      plugins: this._plugins,
    };
  }
}
