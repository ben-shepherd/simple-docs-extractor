import fs from 'fs';

export type MethodTags = {
    extractMethod: 'tags';
    startTag: string;
    endTag: string;
}

export type MethodRegex = {
    extractMethod: 'regex';
    pattern: RegExp;
}

export type MethodCallback = {
    extractMethod: 'callback';
    callback: (fileContent: string) => Promise<string | undefined> | (string | undefined);
}

export type DocsExtractorConfig = MethodTags | MethodRegex | MethodCallback;

export type DocsExtractorResult = {
    docs: string;
    file: string;
    sucess?: boolean;
    errorType?: 'fileNotFound' | 'noStartOrEndTags' | 'noDocs' | 'misconfigured';
    errorMessage?: string;
}

export class DocsExtractor {

    constructor(
        private file: string,
        private config: DocsExtractorConfig
    ) {
    }

    async extract(): Promise<DocsExtractorResult> {

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
        let result: DocsExtractorResult;

        if(this.config.extractMethod === 'tags' && this.config.startTag && this.config.endTag) {
            result = this.extractUsingTags(fileContent);
        }
        else if(this.config.extractMethod === 'regex' && this.config.pattern) {
            result = this.extractUsingRegex(fileContent);
        }
        else if(this.config.extractMethod === 'callback' && typeof this.config.callback === 'function') {
            result = await this.extractUsingCallback(fileContent);
        }
        else {
            throw new Error('You must provide a valid extract method');
        }

        if(!result.sucess) {
            return result;
        }

        // trim spaces and empty lines
        result.docs = result.docs.trim().replace(/\n\s*\n/g, '\n');

        return {
            sucess: true,
            docs: result.docs,
            file: this.file
        };
    }


    protected extractUsingRegex(fileContent: string): DocsExtractorResult {
        const config = this.config as MethodRegex;

        const regex = new RegExp(config.pattern);

        const match = fileContent.match(regex);

        if (!match) {
            return {
                sucess: false,
                docs: '',
                file: this.file,
                errorType: 'noDocs',
            };
        }

        const docs = match[1];

        return {
            sucess: true,
            docs: docs,
            file: this.file
        };
    }

    protected async extractUsingCallback(fileContent: string): Promise<DocsExtractorResult> {
        const config = this.config as MethodCallback;

        const docs = await config.callback(fileContent);

        if(!docs) {
            return {
                sucess: false,
                docs: '',
                file: this.file,
                errorType: 'noDocs',
            };
        }

        return {
            sucess: true,
            docs: docs,
            file: this.file
        };
    }

    protected extractUsingTags(fileContent: string): DocsExtractorResult {
        const config = this.config as MethodTags;

        // Check if the file contains the start and end tags
        if (!fileContent.includes(config.startTag) || !fileContent.includes(config.endTag)) {
            return {
                sucess: false,
                docs: '',
                file: this.file,
                errorType: 'noStartOrEndTags',
            };
        }

        const startIndex = fileContent.indexOf(config.startTag);
        const endIndex = fileContent.indexOf(config.endTag);
        let docs = fileContent.substring(startIndex, endIndex);

        // strip the start and end tags
        docs = docs.replace(config.startTag, '')
        docs = docs.replace(config.endTag, '');

        return {
            sucess: true,
            docs: docs,
            file: this.file
        };
    }
}
