import fs from 'fs';

export type DocsExtractorConfig = {
    tags: {
        startDocs: string;
        endDocs: string;
    };
}

export type DocsExtractorResult = {
    docs: string;
    file: string;
    sucess?: boolean;
    errorType?: 'fileNotFound' | 'noStartOrEndTags' | 'noDocs';
}

export class DocsExtractor {

    constructor(
        private file: string,
        private config: DocsExtractorConfig
    ) {
    }

    extract(): DocsExtractorResult {

        // Check if the file exists
        if (!fs.existsSync(this.file)) {
            return {
                sucess: false,
                docs: '',
                file: this.file,
                errorType: 'fileNotFound',
            };
        }

        const fileContent = fs.readFileSync(this.file, 'utf8');

        // Check if the file contains the start and end tags
        if (!fileContent.includes(this.config.tags.startDocs) || !fileContent.includes(this.config.tags.endDocs)) {
            return {
                sucess: false,
                docs: '',
                file: this.file,
                errorType: 'noStartOrEndTags',
            };
        }

        const startIndex = fileContent.indexOf(this.config.tags.startDocs);
        const endIndex = fileContent.indexOf(this.config.tags.endDocs);
        let docs = fileContent.substring(startIndex, endIndex);

        // strip the start and end tags
        docs = docs.replace(this.config.tags.startDocs, '')
        docs = docs.replace(this.config.tags.endDocs, '');

        // trim spaces and empty lines
        docs = docs.trim().replace(/\n\s*\n/g, '\n');

        return {
            sucess: true,
            docs: docs,
            file: this.file
        };
    }
}
