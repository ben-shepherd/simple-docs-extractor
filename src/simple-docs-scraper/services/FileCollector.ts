import { Target } from "../types/SimpleDocsScraper.t.js";
import { glob, GlobOptions, Path } from "glob";
import path from "path";

export type FileCollectorConfig = {
    path: string;
    extensionsPattern: string | string[];
}

export class FileCollector {
    constructor(private target: FileCollectorConfig) {
    }

    async collect(globOptions: GlobOptions = {}): Promise<string[]> {

        const targetPath = path.join(process.cwd(), this.target.path);

        const files = await glob(this.target.extensionsPattern, {
            absolute: true,
            cwd: targetPath,
            nodir: true,
            ...globOptions ?? {},
        });

        return files.map((file) => file.toString());
    }
}
