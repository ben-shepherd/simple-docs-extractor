export type ExcerptExtractorConfig = {
  firstSentenceOnly?: boolean;
  addEllipsis?: boolean;
  length?: number;
};

export const DEFAULT_EXCERPT_CONFIG: ExcerptExtractorConfig = {
  firstSentenceOnly: true,
  addEllipsis: true,
  length: 75,
} as const;

/**
 * <docs>
 * Extracts and formats text excerpts from content with configurable length and formatting options.
 *
 * This utility class provides static methods for creating clean, readable excerpts from longer text content.
 * It automatically removes markdown headings, handles word boundaries, adds ellipsis for truncated content,
 * and ensures excerpts end with complete words and proper punctuation.
 *
 * @example
 * ```typescript
 * // Basic usage with default settings
 * const content = `## Heading 1
 * This is a readable English sentence for testing purposes.
 *
 * ## Heading 2
 * It is intended to verify that the excerpt extraction works correctly.`;
 *
 * const excerpt = ExcerptExtractor.determineExcerpt(content);
 * // Result: "This is a readable English sentence for testing purposes..."
 * ```
 *
 * @example
 * ```typescript
 * // Custom length with ellipsis
 * const excerpt = ExcerptExtractor.determineExcerpt(content, {
 *   length: 50,
 *   addEllipsis: true,
 *   firstSentenceOnly: true
 * });
 * // Result: "This is a readable English sentence for testing..."
 * ```
 * </docs>
 */
export class ExcerptExtractor {
  static determineExcerpt(
    content: string,
    config: ExcerptExtractorConfig = DEFAULT_EXCERPT_CONFIG,
  ): string | undefined {
    // Remove headings
    content = ExcerptExtractor.removeHeadings(content);

    // Extract all non-empty lines from content
    let excerpt = ExcerptExtractor.getSentencesAsString(content);

    // Remove new lines
    excerpt = excerpt.replace(/\n/g, " ");

    // If the first sentence only option is enabled, extract the first sentence
    excerpt = ExcerptExtractor.useFirstSentenceOnly(config, excerpt);

    // Return undefined for empty or whitespace-only content
    if (excerpt.length === 0 || excerpt === " ") {
      return undefined;
    }

    // Ensure sentences spaces are at the end of the sentences
    excerpt = ExcerptExtractor.ensureSpacingAfterSentencePeriod(excerpt);

    // Make sure it ends with a period
    if (!excerpt.endsWith(".")) {
      excerpt += ".";
    }

    // Join the valid lines with spaces and truncate to desired length
    excerpt = excerpt.substring(0, config.length);

    // Ensure excerpt ends with complete words
    excerpt = this.removeSingleLetterAtEndOfSentence(excerpt);

    // Always add ellipsis if the config is set
    if (config.addEllipsis) {
      excerpt = this.addEllipsis(excerpt);
    }

    return excerpt.trim();
  }

  private static ensureSpacingAfterSentencePeriod(excerpt: string) {
    return this.splitIntoSentences(excerpt)
      .map((sentence) => {
        const unwantedSpacesOrTabs = [" ", "\t"];
        while (unwantedSpacesOrTabs.some((space) => sentence.endsWith(space))) {
          sentence = sentence.slice(0, -1);
        }
        while (
          unwantedSpacesOrTabs.some((space) => sentence.startsWith(space))
        ) {
          sentence = sentence.slice(1);
        }
        return sentence;
      })
      .join(" ");
  }

  private static removeHeadings(content: string) {
    const regex = /^([\#]+[\s\w]+\n)/gm;
    const regExp = new RegExp(regex, "gm");
    return content.replace(regExp, "");
  }

  private static splitIntoSentences(content: string) {
    const regex = /\n?([\w,'"-\s]+\.?)/gm;
    const regExp = new RegExp(regex, "gm");
    let matches: string[] = content.match(regExp) ?? [];

    // Trim new lines at the start
    matches = matches.map((m) => {
      while (m.startsWith("\n")) {
        m = m.slice(1);
      }
      return m;
    });
    return matches;
  }

  private static getSentencesAsString(content: string) {
    const sentences = this.splitIntoSentences(content);

    const linesJoined = sentences.join("");
    return linesJoined;
  }

  private static useFirstSentenceOnly(
    config: ExcerptExtractorConfig,
    excerpt: string,
  ) {
    if (!config.firstSentenceOnly) {
      return excerpt;
    }

    const sentences = this.splitIntoSentences(excerpt);
    return sentences[0];
  }

  static removeSingleLetterAtEndOfSentence(excerpt: string) {
    return excerpt.replace(/((?!\w)\s?[\w]{1}\.?)$/, "");
  }

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
