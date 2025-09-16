/**
 * <docs>
 * Creates a string prefix for indentation based on the given indent level.
 *
 * Each indent level increases the prefix by two spaces. If the indent level
 * is zero, an empty string is returned.
 *
 * @param {number} indentLevel - The level of indentation
 * @returns {string} The indentation prefix string
 * </docs>
 */
export const listIndentPrefix = (indentLevel: number) => {
    if (indentLevel === 0) {
        return "";
    }

    return " ".repeat(indentLevel * 2);
}