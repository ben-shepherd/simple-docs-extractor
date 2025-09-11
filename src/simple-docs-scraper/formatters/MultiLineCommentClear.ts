import { TFormatter } from "../types/formatter.t.js";

/**
 * <docs>
 * MultiLineCommentClear formatter removes leading asterisks and whitespace from multi-line comments.
 *
 * This formatter is designed to clean up JSDoc-style multi-line comments by removing
 * the leading asterisks (*) and associated whitespace that are commonly used in
 * multi-line comment blocks. It preserves the actual content while removing the
 * formatting markers.
 *
 * Example:
 * ```typescript
 * const input = " * This is a comment line";
 * const output = MultiLineCommentClear(input);
 * console.log(output); // "This is a comment line"
 * ```
 *
 * @param {Object} config - Configuration object containing the content to format
 * @param {string} config.content - The text content to be formatted
 * @returns {string} The formatted content with asterisks and leading whitespace removed
 * </docs>
 */
export const MultiLineCommentClear: TFormatter = (config) => {
  // Pattern to match lines that start with optional whitespace followed by an asterisk
  // and capture the content after the asterisk (with optional space)
  const pattern = /^(\s*\*\s?)(.*)$/gm;

  // Replace with just the content part (group 2), removing the leading spaces and asterisk
  return config.content.replace(pattern, "$2");
};
