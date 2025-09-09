* Extracts documentation from source files using various methods.
 * 
 * This class provides flexible documentation extraction capabilities supporting
 * three different extraction methods: tag-based extraction, regex pattern matching,
 * and custom callback functions. It handles file validation, error reporting,
 * and content cleaning.
 * 
 * @example
 * ```typescript
 * // Extract using tags
 * const extractor = new DocsExtractor('example.js', {
 *   extractMethod: 'tags',
 *   startTag: '&lt;docs&gt;',
 *   endTag: '&lt;/docs&gt;'
 * });
 * 
 * // Extract using regex
 * const extractor = new DocsExtractor('example.js', {
 *   extractMethod: 'regex',
 *   pattern: /\/\*\*([\s\S]*?)\*\//g
 * });
 * 
 * const result = await extractor.extract();
 * ```
 *

---

*This file is auto generated. Do not edit manually.*