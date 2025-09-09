import { describe, expect, test } from "@jest/globals";
import { ExtensionReplacer } from "../simple-docs-scraper/transformers/ExtensionReplacer.js";

describe("Extension Replacer", () => {
    describe("replace", () => {
        test("should replace the extension with the given extension", () => {
            const value = ExtensionReplacer.replaceAllExtensions('example.js', 'md');

            expect(value).toBe('example.md')
        })

        test("should replace the complex extension with the given extension", () => {
            const value = ExtensionReplacer.replaceAllExtensions('example.complex.js', 'md');

            expect(value).toBe('example.md')
        })

        test("should replace the  html.twig extension with the given extension", () => {
            const value = ExtensionReplacer.replaceAllExtensions('example.html.twig', 'md');

            expect(value).toBe('example.md')
        })
    });
});
