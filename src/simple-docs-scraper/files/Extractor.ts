import fs from 'fs';

// Configuration for extracting documentation using start and end tags
export type MethodTags = {
    extractMethod: 'tags';
    startTag: string;
    endTag: string;
}

// Configuration for extracting documentation using regular expressions
export type MethodRegex = {
    extractMethod: 'regex';
    pattern: RegExp;
}

// Configuration for extracting documentation using a custom callback function
export type MethodCallback = {
    extractMethod: 'callback';
    callback: (fileContent: string) => Promise<string | undefined> | (string | undefined);
}

// Union type for all possible extraction methods
export type DocsExtractorConfig = MethodTags | MethodRegex | MethodCallback;

// Result object returned by the documentation extraction process
export type DocsExtractorResult = {
    docs: string;
    file: string;
    sucess?: boolean;
    errorType?: 'fileNotFound' | 'noStartOrEndTags' | 'noDocs' | 'misconfigured';
    errorMessage?: string;
}

/**
 * <docs>
 * Extracts documentation from source files using various methods.
 * 
 * This class provides flexible documentation extraction capabilities supporting
 * three different extraction methods: tag-based extraction, regex pattern matching,
 * and custom callback functions. It handles file validation, error reporting,
 * and content cleaning.
 * 
 * @example
 * ```typescript
 * // Extract using tags
 * const extractor = new DocsExtractor('example.js', {
 *   extractMethod: 'tags',
 *   startTag: '<docs>',
 *   endTag: '</docs>'
 * });
 * 
 * // Extract using regex
 * const extractor = new DocsExtractor('example.js', {
 *   extractMethod: 'regex',
 *   pattern: /\/\*\*([\s\S]*?)\*\//g
 * });
 * 
 * const result = await extractor.extract();
 * ```
 * </docs>
 */
export class DocsExtractor {

    constructor(
        private file: string,
        private config: DocsExtractorConfig
    ) {
    }

    /**
     * Extracts documentation from the configured file using the specified method.
     * 
     * @returns Promise resolving to extraction result with documentation content or error details
     * @throws {Error} When an invalid extraction method is configured
     */
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


    /**
     * Extracts documentation using a regular expression pattern.
     * 
     * @param fileContent - The content of the file to extract from
     * @returns Extraction result with matched documentation or error details
     */
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

    /**
     * Extracts documentation using a custom callback function.
     * 
     * @param fileContent - The content of the file to extract from
     * @returns Promise resolving to extraction result with callback-generated documentation or error details
     */
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

    /**
     * Extracts documentation using start and end tags.
     * 
     * @param fileContent - The content of the file to extract from
     * @returns Extraction result with content between tags or error details
     */
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
