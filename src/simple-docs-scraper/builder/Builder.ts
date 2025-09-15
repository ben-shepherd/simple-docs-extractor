import { RecommendedFormatters } from "../formatters/RecommendedFormatters.js";
import { SimpleDocExtractor, Target } from "../services/SimpleDocExtractor.js";
import { SimpleDocExtractorConfig, Templates } from "../types/config.t.js";
import { TFormatter } from "../types/formatter.t.js";
import { TargetBuilder } from "./TargetBuilder.js";
import { TemplateBuilder } from "./TemplateBuilder.js";

export type TemplateCallback = (builder: TemplateBuilder) => void;

export type TargetCallback = (builder: TargetBuilder) => void;

/**
 * <docs>
 * A main builder class for configuring the SimpleDocExtractor service.
 *
 * This class provides a fluent interface for building complete documentation
 * extraction configurations. It allows configuration of targets, templates,
 * and formatters, and can build both configuration objects and service instances.
 *
 * @param {string} [_baseDir=process.cwd()] - Base directory for the extraction process
 * @param {Target[]} [_targets=[]] - Array of target configurations
 * @param {Templates} [_templates={}] - Global template configurations
 * @param {TFormatter[]} [_formatters=[]] - Array of formatters to use
 * </docs>
 */
export class Builder {
  constructor(
    private _baseDir: string = process.cwd(),
    private _targets: Target[] = [],
    private _templates: Templates = {},
    private _formatters: TFormatter[] = [],
  ) {}

  /**
   * <method name="target">
   * Adds a target configuration using a callback function.
   *
   * @param {TargetCallback} callback - The callback function to configure the target
   * @returns {Builder} This builder instance for method chaining
   * </method>
   */
  target(callback: TargetCallback) {
    const builder = new TargetBuilder();
    callback(builder);
    this._targets.push(builder.build());
    return this;
  }

  /**
   * <method name="indexTemplate">
   * Configures the global index template using a callback function.
   *
   * @param {TemplateCallback} callback - The callback function to configure the template
   * @returns {Builder} This builder instance for method chaining
   * </method>
   */
  indexTemplate(callback: TemplateCallback) {
    const builder = new TemplateBuilder("index");
    callback(builder);
    this._templates.index = builder.build().index;
    return this;
  }

  /**
   * <method name="rootIndexTemplate">
   * Configures the global root index template using a callback function.
   *
   * @param {TemplateCallback} callback - The callback function to configure the template
   * @returns {Builder} This builder instance for method chaining
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
   * Configures the global documentation template using a callback function.
   *
   * @param {TemplateCallback} callback - The callback function to configure the template
   * @returns {Builder} This builder instance for method chaining
   * </method>
   */
  documentationTemplate(callback: TemplateCallback) {
    const builder = new TemplateBuilder("documentation");
    callback(builder);
    this._templates.documentation = builder.build().documentation;
    return this;
  }

  /**
   * <method name="addFormatters">
   * Adds one or more formatters to the configuration.
   *
   * @param {TFormatter | TFormatter[]} formatters - The formatter(s) to add
   * @returns {Builder} This builder instance for method chaining
   * </method>
   */
  addFormatters(formatters: TFormatter | TFormatter[]) {
    this._formatters.push(
      ...(Array.isArray(formatters) ? formatters : [formatters]),
    );
    return this;
  }

  /**
   * <method name="addRecommendedFormatters">
   * Adds the recommended formatters to the configuration.
   *
   * @returns {Builder} This builder instance for method chaining
   * </method>
   */
  addRecommendedFormatters() {
    this._formatters.push(...RecommendedFormatters.recommended());
    return this;
  }

  /**
   * <method name="buildConfig">
   * Builds and returns the complete configuration object.
   *
   * @returns {SimpleDocExtractorConfig} The complete configuration object
   * </method>
   */
  buildConfig(): SimpleDocExtractorConfig {
    return {
      baseDir: this._baseDir,
      templates: this._templates,
      targets: this._targets,
      formatters: this._formatters,
    };
  }

  /**
   * <method name="buildService">
   * Builds and returns a configured SimpleDocExtractor service instance.
   *
   * @returns {SimpleDocExtractor} The configured service instance
   * </method>
   */
  buildService(): SimpleDocExtractor {
    return new SimpleDocExtractor(this.buildConfig());
  }
}
