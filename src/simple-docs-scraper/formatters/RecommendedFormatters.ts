import { TFormatter } from "../types/formatter.t.js";
import { AddDoubleLinesFormatter } from "./AddDoubleLinesFormatter.js";
import { RemoveMultiLineCommentAsterisks } from "./RemoveMultiLineCommentAsterisks.js";

/**
 * <docs>
 * RecommendedFormatters is a class that contains the recommended formatters for the SimpleDocsExtractor.
 * </docs>
 */
export class RecommendedFormatters {
  
    /**
     * <method name="recommended">
     * This method returns the recommended formatters for the SimpleDocsExtractor.
     * - RemoveMultiLineCommentAsterisks (Removes comment formatting)
     * - AddDoubleLinesFormatter (Adds spacing between content lines)
     * 
     * @returns {TFormatter[]} The recommended formatters for the SimpleDocsExtractor.
     * </method>
     */
    static recommended(): TFormatter[] {
        return [
            RemoveMultiLineCommentAsterisks,
            AddDoubleLinesFormatter,
        ]
    }
}