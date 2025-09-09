type FormatterConfig = {
    filePath: string;
    outFile: string;
    content: string;
}

export type TFormatter = (config: FormatterConfig) => string;
