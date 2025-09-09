/**
 * <docs>
 * Utility class for replacing file extensions.
 * 
 * This class provides static methods to manipulate file paths by replacing
 * all extensions with a specified new extension. It's commonly used to
 * convert source files to markdown documentation files.
 * 
 * @example
 * ```typescript
 * const newPath = ExtensionReplacer.replaceAllExtensions('example.js.ts', 'md');
 * // Returns 'example.md'
 * ```
 * </docs>
 */
export class ExtensionReplacer {
    /**
     * Replaces all extensions in a file path with a new extension.
     * 
     * @param filePath - The file path to modify
     * @param replaceWith - The new extension to use (defaults to 'md')
     * @returns The file path with the new extension
     */
    static replaceAllExtensions(filePath: string, replaceWith: string = 'md'): string {
        const split = filePath.split('.');
        return `${split[0]}.${replaceWith}`;
    }
}
