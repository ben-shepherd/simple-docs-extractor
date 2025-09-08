import { GlobOptions } from "glob";

export type Target = {
    globOptions: GlobOptions;
    outDir: string;
    createIndexFile: boolean;
}

export interface SimpleDocsScraperConfig {
    tags: {
        startDocs: string;
        endDocs: string;
    };
    replacers: {
        content: string;
    };
    templates: {
        index: string;
        documentation: string;
    };
    targets: Target[];
}
