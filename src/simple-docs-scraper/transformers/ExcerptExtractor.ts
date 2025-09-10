/**
 * <docs>
 * Extracts and formats text excerpts from content with configurable length.
 * 
 * This utility class provides static methods for creating clean, readable excerpts
 * from longer text content. It handles word boundaries, adds ellipsis for truncated
 * content, and ensures excerpts end with complete words.
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
     * @param length Maximum length of the excerpt (default: 75 characters)
     * @returns Formatted excerpt string or undefined if content is empty
     */
    static determineExcerpt(content: string, length: number = 75): string | undefined {
        // Extract all non-empty lines from content
        /**
         * This regex matches the first line of content that does NOT start with a non-word character
         * (i.e., it skips lines that start with symbols such as headings like "#", "##", etc.).
         * It then captures a sequence of words, commas, optional spaces, and optional periods.
         * The goal is to extract a readable sentence or phrase, ignoring headings or lines that
         * begin with punctuation or symbols.
         */
        const pattern = new RegExp(
            '^' +            // Start of the line
            '(?!\\W)' +      // Negative lookahead: line does NOT start with a non-word character
            '(?:' +
                '\\s?' +         // Optional leading whitespace
                '[\\w,]{1,}' +   // One or more word characters or commas
                '\\s?' +         // Optional trailing whitespace
                '\\.?' +         // Optional period
            ')+'              // Repeat one or more times
        );
        const regExp = new RegExp(pattern, 'gm')
        const matches: string[] = content.match(regExp) ?? []

        // Join lines with spaces and truncate to desired length
        const linesJoined = matches.join(' ')
        let excerpt = linesJoined.substring(0, length)

        // Check if content was truncated
        const contentOverLength = linesJoined.length > length

        // Return undefined for empty or whitespace-only content
        if (excerpt.length === 0 || excerpt === ' ') {
            return undefined
        }

        // Ensure excerpt ends with complete words
        excerpt = this.onlyUseFullWords(excerpt)

        // Add ellipsis if content was truncated
        if (contentOverLength) {
            excerpt = this.addEllipsis(excerpt)
        }

        return excerpt.trim()
    }

    /**
     * Ensures excerpt contains only complete words by removing partial words at the end
     * @param excerpt The excerpt string to process
     * @returns Excerpt with only complete words
     */
    static onlyUseFullWords(excerpt: string) {
        // Match complete words with optional surrounding whitespace and periods
        const fullWordsArray = new RegExp(/\s?([\w]{1,})\s?\.?/gm)
        const matches = excerpt.match(fullWordsArray) ?? []
        
        // Remove last word if it's shorter than 2 characters (likely incomplete)
        if(matches?.[matches.length - 1] && matches?.[matches.length - 1].length < 2) {
            matches.pop()
        }
        return matches.join('')
    }

    /**
     * Adds ellipsis to the end of an excerpt if not already present
     * @param excerpt The excerpt string to add ellipsis to
     * @returns Excerpt with ellipsis appended
     */
    static addEllipsis(excerpt: string) {
        // Remove trailing space if present
        if(excerpt.endsWith(' ')) {
            excerpt = excerpt.slice(0, -1)
        }
        // Add ellipsis if not already present
        if (!excerpt.endsWith('...')) {
            excerpt += '...'
        }
        return excerpt
    }
}