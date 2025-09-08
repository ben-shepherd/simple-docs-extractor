export const getOutputFilePath = (fileName: string) => {
    return process.cwd() + '/src/tests/output/' + fileName;
}