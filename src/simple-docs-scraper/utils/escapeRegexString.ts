/**
 * Escapes a string for use in a regular expression.
 * 
 * @see https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
 */
export const escapeRegExpString = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}