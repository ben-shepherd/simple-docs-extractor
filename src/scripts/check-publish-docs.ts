import { DEFAULT_CONFIG, publishDocs } from "./publish-docs.js";

await publishDocs({
  ...DEFAULT_CONFIG,
  dryRun: true,
});
