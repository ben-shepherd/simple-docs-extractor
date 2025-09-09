export class ExtensionReplacer {
    static replaceAllExtensions(filePath: string, replaceWith: string = 'md'): string {
        const split = filePath.split('.');
        return `${split[0]}.${replaceWith}`;
    }
}
