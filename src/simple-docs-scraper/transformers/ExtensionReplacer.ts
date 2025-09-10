/**
 * <docs>
 * Utility class for replacing file extensions.
 * 
 * This class provides static methods to manipulate file paths by replacing
 * all extensions with a specified new extension. It's commonly used to
 * convert source files to markdown documentation files.
 * 
 * @example Replacing extensions
 * ```typescript
 * const newPath = ExtensionReplacer.replaceAllExtensions('example.js.ts', 'md');
 * // Returns 'example.md'
 * ```
 * 
 * @example Appending .md extension
 * ```typescript
 * const mdPath = ExtensionReplacer.appendMdExtension('notes.txt');
 * // Returns 'notes.txt.md'
 * 
 * const alreadyMd = ExtensionReplacer.appendMdExtension('readme.md');
 * // Returns 'readme.md'
 * ```
 * 
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

    /**
     * Appends a '.md' extension to a file path if it doesn't already end with '.md'.
     * 
     * @param filePath - The file path to modify
     * @returns The file path with the '.md' extension
     */
    static appendMdExtension(filePath: string): string {
        if(!filePath.endsWith('.md')) {
            filePath += '.md'
        }
        return filePath
    }
}
