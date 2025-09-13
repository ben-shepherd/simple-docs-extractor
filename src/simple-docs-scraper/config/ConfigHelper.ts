import { Target } from "../services/SimpleDocExtractor.js";

export class ConfigHelper {

    /**
     * Gets the plugin by search and replace value.
     */
    static getPluginBySearchAndReplace(target: Target, searchAndReplace: string) {
        return target.extraction?.find((plugin) => plugin.getConfig().searchAndReplace === searchAndReplace);
    }

    static getAttributeFormatBySearchAndReplace(target: Target, searchAndReplace: string) {
        const extractionPlugin = ConfigHelper.getPluginBySearchAndReplace(target, searchAndReplace);
        return extractionPlugin?.getConfig().attributeFormat;
    }
}
