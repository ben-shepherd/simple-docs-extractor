import fs from 'fs';
import path from 'path';

type IndexStructurePreProcessorConfig = {
    markdownLink?: boolean;
}

export type IndexStructurePreProcessorEntry = {
    src: string;
    entryName: string;
    isDir: boolean;
    basename: string;
    markdownLink: string;
}

export class IndexStructurePreProcessor {

    constructor(private config: IndexStructurePreProcessorConfig = {}) {}

    async scanDirectory(baseDir: string): Promise<string[]> {
        return fs.readdirSync(baseDir)
            .filter(entry => false === ['.', '..'].includes(entry))
            .map(entry => {
                return path.join(baseDir, entry)
            })
    }

    async process(baseDir: string): Promise<IndexStructurePreProcessorEntry[]> {
        const srcArray = await this.scanDirectory(baseDir)
        let results: IndexStructurePreProcessorEntry[] = []

        for(const src of srcArray) {
            // const parentDirectory = path.dirname(entry);
            const excerpt = undefined
            const basename = path.basename(src)
            
            let result: Partial<IndexStructurePreProcessorEntry> = {
                src: src,
                isDir: false,
                basename
            }
            
            if(fs.statSync(src).isDirectory()) {
                result.isDir = true;
                result.entryName = this.getDirEntryName(basename)
                result.markdownLink = this.markdownLink(result.entryName, result.entryName, excerpt)

                // If the directory contains an index.md, append it to the markdown link
                this.appendIndexMdIfFound(result, excerpt)
            }
            else {
                result.entryName = this.getFileEntryName(basename)
                result.markdownLink = this.markdownLink(result.entryName, result.entryName, excerpt)
            }
    
            results.push(result as IndexStructurePreProcessorEntry)
        }

        return results
    }

    private appendIndexMdIfFound(result: Partial<IndexStructurePreProcessorEntry>, excerpt?: string): void {
        const directoryContainsIndex = fs.existsSync(path.join(result.src as string, 'index.md'));

        if(!directoryContainsIndex) {
            return;
        }

        let entryNameSuffix = ''

        if(entryNameSuffix?.endsWith('/')) {
            entryNameSuffix += '/'
        }

        entryNameSuffix += 'index.md'

        result.markdownLink = this.markdownLink(
            result.entryName as string,
            (result.entryName as string) + entryNameSuffix,
            excerpt
        );
    }

    protected getDirEntryName(baseName: string) {
        if(!baseName.endsWith('/')) {
            baseName += '/'
        }
        return baseName
    }

    protected getFileEntryName(baseName: string) {
        if(!baseName.endsWith('.md')) {
            baseName += '.md'
        }
        return baseName
    }

    protected markdownLink(display: string, link: string, excerpt?: string) {
        let result = ''

        if(!this.config.markdownLink) {
            result = `${display}`

            if(excerpt) {
                result += ` - ${excerpt}`
            }

            return result
        }

        result = `[${display}]`

        if(excerpt) {
            result += `(${link} - ${excerpt})`
        }
        else {
            result += `(${link})`
        }

        return result
    }
    
    formatEntry(entry: string) {
        const parentDirectory = path.dirname(entry);

        // remove parent directory
        let formattedFilePath = entry.replace(parentDirectory, '');

        // remove leading slash
        while(formattedFilePath.startsWith('/') || formattedFilePath.startsWith('\\')) {
            if(formattedFilePath.startsWith('/')) {
                formattedFilePath = formattedFilePath.slice(1);
            }
            if(formattedFilePath.startsWith('\\')) {
                formattedFilePath = formattedFilePath.slice(1);
            }
        }

        return formattedFilePath
    }
}