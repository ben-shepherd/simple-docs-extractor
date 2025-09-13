/**
 * <docs>
 * Script entry point for triggering documentation publishing.
 * 
 * This script serves as a simple entry point that immediately executes the
 * documentation publishing process using the default configuration. It's
 * designed to be run directly or as part of build processes to generate
 * documentation from source files.
 * 
 * @example
 * ```bash
 * # Run directly with Node.js
 * node dist/scripts/trigger-publish-docs.js
 * 
 * # Or as part of npm script
 * npm run publish-docs
 * ```
 * </docs>
 */
import { publishDocs } from "./publish-docs.js";

await publishDocs();
