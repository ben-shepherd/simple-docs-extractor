import { TFormatter } from "../types/formatter.t.js";

/**
 * <docs>
 * DoubleLinesFormatter inserts an extra blank line between each line of the input content.
 *
 * This formatter is useful for increasing the vertical spacing in generated documentation
 * or text files, making the output more readable or visually distinct.
 *
 * Example:
 * ```typescript
 * const input = "Line 1\nLine 2\nLine 3";
 * const output = DoubleLinesFormatter({ content: input });
 * // output:
 * // Line 1
 * //
 * // Line 2
 * //
 * // Line 3
 * ```
 *
 * @param {Object} config - Configuration object containing the content to format
 * @param {string} config.content - The text content to be formatted
 * @returns {string} The formatted content with double line spacing
 * </docs>
 */

export const AddDoubleLinesFormatter: TFormatter = (config) => {
  let lines = config.content.split("\n")
  let insideCodeBlock = false;
  
  // Add a blank line between each line of the content, except inside code blocks
  lines = lines.map((line, index) => {
    if(line.includes("```") || index === lines.length - 1) {
      insideCodeBlock = !insideCodeBlock;
      return line
    }
    if( !insideCodeBlock) {
      line = `${line}\n`;
    }
    return line;
  });

  return lines.join("\n");
};
