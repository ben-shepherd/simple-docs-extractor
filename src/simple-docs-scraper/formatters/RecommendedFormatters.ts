import { TFormatter } from "../types/formatter.t.js";
import { AddDoubleLinesFormatter } from "./AddDoubleLinesFormatter.js";
import { RemoveMultiLineCommentAsterisks } from "./RemoveMultiLineCommentAsterisks.js";

/**
 * <docs>
 * RecommendedFormatters is a class that contains the recommended formatters for the SimpleDocsExtractor.
 * - RemoveMultiLineCommentAsterisks
 * - AddDoubleLinesFormatter
 * </docs>
 */
export class RecommendedFormatters {
  
    /**
     * <method name="recommended">
     * recommended returns the recommended formatters for the SimpleDocsExtractor.
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