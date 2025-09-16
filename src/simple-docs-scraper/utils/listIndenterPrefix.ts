export const createIndenterPrefix = (indentLevel: number) => {
    if (indentLevel === 0) {
        return "";
    }

    return " ".repeat(indentLevel * 2);
}