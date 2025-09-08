import { SimpleDocsScraperConfig } from "../types/SimpleDocsScraper.t.js";
import { FileCollector } from "./FileCollector.js";

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
            const fileCollector = new FileCollector(target);
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
