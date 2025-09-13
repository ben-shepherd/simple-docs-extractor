import { glob, GlobOptions } from "glob";
import path from "path";

// Configuration for file scanning operations
export type FileScannerConfig = {
  cwd: string;
  extensions: string | string[];
};

/**
 * <docs>
 * Scans directories for files matching specified extensions using glob patterns.
 *
 * This class provides file discovery capabilities by scanning directories
 * for files that match the configured extensions. It supports both relative
 * and absolute paths and integrates with the glob library for pattern matching.
 *
 * @example
 * ```typescript
 * const scanner = new FileScanner({
 *   cwd: './src',
 *   extensions: ['*.js', '*.ts']
 * });
 *
 * const files = await scanner.collect();
 * // Returns array of matching file paths
 * ```
 * </docs>
 */
export class FileScanner {
  constructor(private target: FileScannerConfig) {}

  /**
   * <method name="collect">
   * Collects all files matching the configured extensions in the target directory.
   *
   * @param globOptions - Additional glob options to override defaults
   * @returns Promise resolving to array of matching file paths
   * </method>
   */
  async collect(globOptions: GlobOptions = {}): Promise<string[]> {
    let targetPath = this.target.cwd;

    if (!path.isAbsolute(targetPath)) {
      targetPath = path.join(process.cwd(), this.target.cwd);
    }

    const files = await glob(this.target.extensions, {
      absolute: true,
      cwd: targetPath,
      nodir: true,
      ...(globOptions ?? {}),
    });

    return files.map((file) => file.toString());
  }
}
