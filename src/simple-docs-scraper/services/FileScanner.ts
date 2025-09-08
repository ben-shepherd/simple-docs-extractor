import { glob, GlobOptions } from "glob";
import path from "path";

export type FileScannerConfig = {
    cwd: string;
    extensions: string | string[];
}

export class FileScanner {
    constructor(private target: FileScannerConfig) {
    }

    async collect(globOptions: GlobOptions = {}): Promise<string[]> {

        const targetPath = path.join(process.cwd(), this.target.cwd);

        const files = await glob(this.target.extensions, {
            absolute: true,
            cwd: targetPath,
            nodir: true,
            ...globOptions ?? {},
        });

        return files.map((file) => file.toString());
    }
}
