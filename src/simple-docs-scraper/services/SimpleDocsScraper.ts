import { GlobOptions } from "glob";
import { DocsExtractorConfig } from "./Extractor.js";
import { FileScanner } from "./FileScanner.js";
import { InjectionConfig } from "./Injection.js";

export type Target = {
    globOptions: GlobOptions;
    outDir: string;
    createIndexFile: boolean;
}

export interface SimpleDocsScraperConfig {
    extraction: DocsExtractorConfig;
    injection: InjectionConfig;
    templates: {
        index: string;
        documentation: string;
    };
    targets: Target[];
}


export class SimpleDocsScraper {

    constructor(
        private config: SimpleDocsScraperConfig
    ) {
    }

    getConfig(): SimpleDocsScraperConfig {
        return this.config;
    }

    start(): void {
        this.config.targets.forEach((target) => {
            const fileCollector = new FileScanner(target);
            const results = fileCollector.collect();

            results.forEach((result) => {
                console.log(result);
            });
        });
    }

    collectFiles(): string[] {
        return this.config.targets.map((target) => target.path);
    }
}
