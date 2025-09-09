import { GlobOptions } from "glob";
import { DocsExtractorConfig } from "./Extractor.js";
import { FileScanner } from "./FileScanner.js";
import { DocsExtractor } from "./Extractor.js";
import { Injection } from "./Injection.js";
import { DocGenerator, DocGeneratorConfig } from "./DocGenerator.js";
import fs from 'fs';
import path from 'path';
import { IndexGenerator, IndexGeneratorConfig } from "./IndexGenerator.js";

export type Target = {
    globOptions: GlobOptions & { cwd: string; extensions: string | string[] };
    outDir: string;
    createIndexFile: boolean;
}

export interface SimpleDocsScraperConfig {
    baseDir: string;
    extraction: DocsExtractorConfig;
    searchAndReplace: {
        replace: string;
    };
    generators: {
        index: {
            template: string;
        } & Partial<IndexGeneratorConfig>;
        documentation: {
            template: string;
        } & Partial<DocGeneratorConfig>;
    };
    targets: Target[];
}

export type SimpleDocsScraperResult = {
    success: number;
    total: number;
    logs: string[];
}

export class SimpleDocsScraper {

    constructor(
        private config: SimpleDocsScraperConfig,
        protected logs: string[] = [],
        protected success: number = 0,
        protected total: number = 0
    ) {
    }

    getConfig(): SimpleDocsScraperConfig {
        return this.config;
    }

    async start(): Promise<SimpleDocsScraperResult> {
        for(const target of this.config.targets) {
            await this.startTarget(target, this.config.targets.indexOf(target));
        }

        return {
            success: this.success,
            total: this.total,
            logs: this.logs,
        }
    }

    async startTarget(target: Target, targetIndex: number) {

        // Check if cwd exists
        if (!fs.existsSync(target.globOptions.cwd)) {
            this.logs.push(`targets[${targetIndex}]: Cwd ${target.globOptions.cwd} not found`);
            return;
        }

        const fileScanner = new FileScanner({
            cwd: target.globOptions.cwd,
            extensions: target.globOptions.extensions,
        });

        const files = await fileScanner.collect();

        if(target.createIndexFile && this.config.generators.index.template) {
            const indexGenerator = new IndexGenerator({
                ...this.config.generators.index,
                baseDir: this.config.baseDir,
                template: this.config.generators.index.template,
                outDir: target.outDir,
            });

            indexGenerator.generateContent(files);
        }

        for(const file of files) {
            await this.processFile(file, target);
        }
    }

    async processFile(file: string, target: Target) {
        this.total++;

        const extractionResult = await new DocsExtractor(file, this.config.extraction).extract();

        if(!extractionResult.sucess) {
            this.logs.push(`Error: ${extractionResult.errorType} in file ${file}`);
            return;
        }

        const injectedContent = new Injection({
            template: this.config.generators.documentation.template,
            outDir: target.outDir,
            injectInto: this.config.searchAndReplace.replace,
        })
        .injectIntoString(extractionResult.docs, this.config.searchAndReplace.replace);

        // Create the out directory if it doesn't exist
        if (!fs.existsSync(target.outDir)) {
            fs.mkdirSync(target.outDir, { recursive: true });
        }

        const outFile = path.join(target.outDir, file);

        // Generate the documentation file
        new DocGenerator({
            template: this.config.generators.documentation.template,
            outDir: target.outDir,
            injectInto: this.config.searchAndReplace.replace,
        })
        .generateContent(injectedContent, outFile);
        
        this.success++;
    }
}
