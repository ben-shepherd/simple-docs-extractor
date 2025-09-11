export type ExcerptExtractorConfig = {
  firstSentenceOnly?: boolean;
  addEllipsis?: boolean;
  length?: number;
};

export const DEFAULT_CONFIG: ExcerptExtractorConfig = {
  firstSentenceOnly: true,
  addEllipsis: true,
  length: 75,
} as const;

/**
 * <docs>
 * Extracts and formats text excerpts from content with configurable length.
 *
 * This utility class provides static methods for creating clean, readable excerpts
 * from longer text content. It handles word boundaries, adds ellipsis for truncated
 * content, and ensures excerpts end with complete words.
 *
 * @example
 * ```typescript
 * // Basic usage with default settings
 * const content = `## Heading
 * This is a readable English sentence for testing purposes.
 * It is intended to verify that the excerpt extraction works correctly.`;
 *
 * const excerpt = ExcerptExtractor.determineExcerpt(content, { length: 50, addEllipsis: true, firstSentenceOnly: true });
 * // Result: "This is a readable English sentence for testing..."
 * ```
 *
 * @example
 * ```typescript
 * // Custom configuration - first sentence only without ellipsis
 * const excerpt2 = ExcerptExtractor.determineExcerpt(content, {
 *   length: 100,
 *   firstSentenceOnly: true,
 *   addEllipsis: false
 * });
 * // Result: "This is a readable English sentence for testing purposes."
 * ```
 *
 * @example
 * ```typescript
 * // Multiple sentences with ellipsis
 * const excerpt3 = ExcerptExtractor.determineExcerpt(content, {
 *   length: 100,
 *   firstSentenceOnly: false,
 *   addEllipsis: true
 * });
 * // Result: "This is a readable English sentence for testing purposes. It is intended to verify that the excerpt..."
 * ```
 * </docs>
 */
export class ExcerptExtractor {
  /**
   * Determines and formats an excerpt from the given content using intelligent text extraction.
   *
   * This method extracts a clean, readable excerpt from content by filtering out
   * lines that start with non-word characters (like headings), joining the remaining
   * content, and ensuring the excerpt ends with complete words. It adds ellipsis
   * for truncated content and handles edge cases like empty content.
   *
   * @param content The source content to extract excerpt from
   * @param config Configuration options for excerpt behavior
   * @returns Formatted excerpt string or undefined if content is empty
   */
  static determineExcerpt(
    content: string,
    config: ExcerptExtractorConfig = DEFAULT_CONFIG,
  ): string | undefined {
    // Extract all non-empty lines from content
    const validLines = ExcerptExtractor.findValidLines(content);

    // Join the valid lines with spaces and truncate to desired length
    let excerpt = validLines.substring(0, config.length);

    // If the first sentence only option is enabled, extract the first sentence
    excerpt = ExcerptExtractor.useFirstSentenceOnly(config, excerpt);

    // Return undefined for empty or whitespace-only content
    if (excerpt.length === 0 || excerpt === " ") {
      return undefined;
    }

    // Ensure excerpt ends with complete words
    excerpt = this.onlyUseFullWords(excerpt);

    // Always add ellipsis if the config is set
    if (config.addEllipsis) {
      excerpt = this.addEllipsis(excerpt);
    }

    return excerpt.trim();
  }

  /**
   * Finds valid lines in the content by extracting the first line that does not start with a non-word character
   *
   * @param content The content to find valid lines in
   * @returns The valid lines
   */
  private static findValidLines(content: string) {
    /**
     * This regex matches the first line of content that does NOT start with a non-word character
     * (i.e., it skips lines that start with symbols such as headings like "#", "##", etc.).
     * It then captures a sequence of words, commas, optional spaces, and optional periods.
     * The goal is to extract a readable sentence or phrase, ignoring headings or lines that
     * begin with punctuation or symbols.
     */
    const pattern = new RegExp(
      "^" + // Start of the line
        "(?!\\W)" + // Negative lookahead: line does NOT start with a non-word character
        "(?:" +
        "\\s?" + // Optional leading whitespace
        "[\\w,]{1,}" + // One or more word characters or commas
        "\\s?" + // Optional trailing whitespace
        "\\.?" + // Optional period
        ")+", // Repeat one or more times
    );
    const regExp = new RegExp(pattern, "gm");
    const matches: string[] = content.match(regExp) ?? [];

    // Join lines with spaces and truncate to desired length
    const linesJoined = matches.join(" ");
    return linesJoined;
  }

  /**
   * Uses the first sentence only if the config is set
   * @param config The config to use
   * @param excerpt The excerpt to use
   * @returns The excerpt with the first sentence only
   */
  private static useFirstSentenceOnly(
    config: ExcerptExtractorConfig,
    excerpt: string,
  ) {
    if (config.firstSentenceOnly) {
      excerpt = excerpt.split(".")?.[0] ?? excerpt;
      if (!excerpt.endsWith(".")) {
        excerpt += ".";
      }
    }
    return excerpt;
  }

  /**
   * Ensures excerpt contains only complete words by removing partial words at the end
   * @param excerpt The excerpt string to process
   * @returns Excerpt with only complete words
   */
  static onlyUseFullWords(excerpt: string) {
    // Match complete words with optional surrounding whitespace and periods
    const fullWordsArray = new RegExp(/\s?([\w]{1,})\s?\.?/gm);
    const matches = excerpt.match(fullWordsArray) ?? [];

    // Remove last word if it's shorter than 2 characters (likely incomplete)
    if (
      matches?.[matches.length - 1] &&
      matches?.[matches.length - 1].length < 2
    ) {
      matches.pop();
    }
    return matches.join("");
  }

  /**
   * Adds ellipsis to the end of an excerpt if not already present
   * @param excerpt The excerpt string to add ellipsis to
   * @returns Excerpt with ellipsis appended
   */
  static addEllipsis(excerpt: string) {
    const unwantedSuffixes = [" ", ".", ".."];

    // Remove trailing spaces, periods, and double periods if present
    while (
      excerpt.endsWith(" ") ||
      excerpt.endsWith(".") ||
      excerpt.endsWith("..")
    ) {
      for (const suffix of unwantedSuffixes) {
        if (excerpt.endsWith(suffix)) {
          excerpt = excerpt.slice(0, -suffix.length);
        }
      }
    }

    // Add ellipsis if not already present
    if (!excerpt.endsWith("...")) {
      excerpt += "...";
    }
    return excerpt;
  }
}
