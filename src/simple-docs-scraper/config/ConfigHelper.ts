import { Target } from "../services/SimpleDocExtractor.js";

/**
 * <docs>
 * Helper class for retrieving configuration values from target configurations.
 * 
 * This utility class provides static methods to extract specific configuration
 * values from target objects, particularly for finding extraction plugins and
 * their associated attribute formats by search and replace patterns.
 * 
 * @example
 * ```typescript
 * const plugin = ConfigHelper.getPluginBySearchAndReplace(target, '%content%');
 * const attributeFormat = ConfigHelper.getAttributeFormatBySearchAndReplace(target, '%content%');
 * ```
 * </docs>
 */
export class ConfigHelper {
  /**
   * <method name="getPluginBySearchAndReplace">
   * Finds an extraction plugin by its search and replace pattern.
   * 
   * @param {Target} target - The target configuration containing extraction plugins
   * @param {string} searchAndReplace - The search and replace pattern to match
   * @returns {ExtractorPlugin | undefined} The matching plugin or undefined if not found
   * </method>
   */
  static getPluginBySearchAndReplace(target: Target, searchAndReplace: string) {
    return target.extraction?.find(
      (plugin) => plugin.getConfig().searchAndReplace === searchAndReplace,
    );
  }

  /**
   * <method name="getAttributeFormatBySearchAndReplace">
   * Retrieves the attribute format for a specific search and replace pattern.
   * 
   * @param {Target} target - The target configuration containing extraction plugins
   * @param {string} searchAndReplace - The search and replace pattern to match
   * @returns {string | undefined} The attribute format string or undefined if not found
   * </method>
   */
  static getAttributeFormatBySearchAndReplace(
    target: Target,
    searchAndReplace: string,
  ) {
    const extractionPlugin = ConfigHelper.getPluginBySearchAndReplace(
      target,
      searchAndReplace,
    );
    return extractionPlugin?.getConfig().attributeFormat;
  }
}
