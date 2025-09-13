# Documentation File Templates

Documentation file templates control how individual documentation files are generated from your source code. These templates define the structure and format of each documentation file, including how extracted content is organized and presented.

## Overview

Documentation file templates are processed by the `DocFileGenerator` and create markdown files for each source file that contains documentation. They use a flexible placeholder system to inject extracted content and metadata into a consistent structure.

## Template Structure

Documentation templates use placeholders that get replaced with extracted content and metadata during the generation process.

### Basic Template Example

```markdown
## %locales.fileName%

%content%

---

## Methods

%methods%

---

Last updated: %locales.updatedAt%

*This file is auto generated. Do not edit manually.*

[Back to Index](./index.md)
```

## Available Placeholders

### Content Placeholders

#### `%content%`

**Description:** The main content extracted from your source files using extractor plugins.

**Source:** Content extracted by `TagExtractorPlugin` with the "docs" tag.

**Example:**
```markdown
## %content%

This is where the main documentation content from your source files will appear.
```

#### `%methods%`

**Description:** Extracted method documentation from your source files.

**Source:** Content extracted by `TagExtractorPlugin` with the "method" tag.

**Example:**
```markdown
## Methods

%methods%

This section will contain all method documentation extracted from your source files.
```

### Locale Placeholders

#### `%locales.fileName%`

**Description:** The basename of the source file being processed.

**Type:** `string`

**Example:** If processing `src/components/Button.tsx`, this would be `Button.tsx`.

**Usage:**
```markdown
## %locales.fileName%

Documentation for the Button component...
```

#### `%locales.updatedAt%`

**Description:** The last modification time of the source file in ISO 8601 format.

**Type:** `string` (ISO 8601 timestamp)

**Example:** `2024-01-15T14:30:25.123Z`

**Usage:**
```markdown
Last updated: %locales.updatedAt%
```

## Configuration

Documentation templates are configured in the `generators.documentation` section of your configuration:

```typescript
generators: {
  documentation: {
    template: path.join(
      process.cwd(),
      "src/templates/documentation.template.md",
    ),
  },
}
```

### Configuration Options

- **`template`** (string): Path to your documentation template file
- **`outDir`** (string, optional): Output directory override (uses target's outDir if not specified)

## Custom Placeholders

You can create custom placeholders by configuring additional extractor plugins in your targets:

```typescript
targets: [
  {
    extraction: [
      new TagExtractorPlugin({
        tag: "docs",
        searchAndReplace: "%content%",
      }),
      new TagExtractorPlugin({
        tag: "method",
        searchAndReplace: "%methods%",
        attributeFormat: "### **{value}**",
      }),
      new TagExtractorPlugin({
        tag: "example",
        searchAndReplace: "%examples%",
        attributeFormat: "#### Example: {value}",
      }),
      new TagExtractorPlugin({
        tag: "param",
        searchAndReplace: "%parameters%",
        attributeFormat: "- **{value}**: ",
      }),
    ],
  },
]
```

Then use these custom placeholders in your template:

```markdown
## %locales.fileName%

%content%

---

## Examples

%examples%

---

## Parameters

%parameters%

---

## Methods

%methods%

---

Last updated: %locales.updatedAt%
```

## Template Examples

### Minimal Template

```markdown
# %locales.fileName%

%content%
```

### Standard Template

```markdown
## %locales.fileName%

%content%

---

## Methods

%methods%

---

Last updated: %locales.updatedAt%

*This file is auto generated. Do not edit manually.*

[Back to Index](./index.md)
```

### Comprehensive Template

```markdown
# %locales.fileName%

%content%

---

## API Reference

### Methods

%methods%

---

## Examples

%examples%

---

## Parameters

%parameters%

---

## Notes

%notes%

---

<div align="right">

*Last updated: %locales.updatedAt%*

[← Back to Index](./index.md)

</div>

---

*This file is auto generated. Do not edit manually.*
```

### Styled Template

```markdown
<div align="center">

# 📚 %locales.fileName%

*Auto-generated documentation*

</div>

---

## 📋 Overview

%content%

---

## 🔧 Methods

%methods%

---

<div align="center">

**Last updated:** %locales.updatedAt%

[← Back to Index](./index.md)

</div>

---

*This file is auto generated. Do not edit manually.*
```

## Advanced Features

### Conditional Content

You can create templates that handle optional content by using multiple extractor plugins:

```typescript
extraction: [
  new TagExtractorPlugin({
    tag: "docs",
    searchAndReplace: "%content%",
  }),
  new TagExtractorPlugin({
    tag: "method",
    searchAndReplace: "%methods%",
  }),
  new TagExtractorPlugin({
    tag: "example",
    searchAndReplace: "%examples%",
  }),
]
```

Template:
```markdown
## %locales.fileName%

%content%

%methods%

%examples%

---

Last updated: %locales.updatedAt%
```

### Custom Formatting

Use the `attributeFormat` option to customize how extracted content is formatted:

```typescript
new TagExtractorPlugin({
  tag: "method",
  searchAndReplace: "%methods%",
  attributeFormat: "### **{value}**\n\n",
})
```

## Best Practices

1. **Consistent Structure:** Use a consistent template structure across all documentation files
2. **Clear Sections:** Organize content into logical sections (Overview, Methods, Examples, etc.)
3. **Navigation:** Include links back to the index for easy navigation
4. **Metadata:** Always include file metadata like last updated time
5. **Auto-generation Notice:** Include a notice that the file is auto-generated
6. **Responsive Design:** Use markdown that works well in different viewers
7. **Accessibility:** Use proper heading hierarchy and descriptive text

## Integration with Extractors

Documentation templates work with various extractor plugins:

### TagExtractorPlugin

Most commonly used for extracting content marked with specific tags:

```typescript
new TagExtractorPlugin({
  tag: "docs",
  searchAndReplace: "%content%",
})
```

### RegexExtractorPlugin

For extracting content using regular expressions:

```typescript
new RegexExtractorPlugin({
  pattern: /\/\*\*\s*([\s\S]*?)\s*\*\//g,
  searchAndReplace: "%content%",
})
```

### CallbackExtractorPlugin

For custom extraction logic:

```typescript
new CallbackExtractorPlugin({
  callback: (content: string) => {
    // Custom extraction logic
    return extractedContent;
  },
  searchAndReplace: "%content%",
})
```

## Troubleshooting

### Common Issues

1. **Template not found:** Ensure the template path in your configuration is correct
2. **Empty placeholders:** Check that your extractor plugins are configured properly
3. **Missing content:** Verify that your source files contain the expected tags or patterns
4. **Formatting issues:** Test your template with sample content to ensure proper formatting

### Debug Tips

- Use simple templates first, then add complexity
- Test individual extractor plugins to ensure they're working
- Check the console output for template processing errors
- Verify that your source files contain the expected documentation tags
- Use the `attributeFormat` option to debug content formatting

## Template Validation

Before using a template in production:

1. **Test with sample content:** Create test files with documentation tags
2. **Verify placeholders:** Ensure all placeholders are properly replaced
3. **Check formatting:** Validate that the generated markdown renders correctly
4. **Test navigation:** Ensure links and navigation elements work properly
5. **Validate accessibility:** Check that the generated content is accessible
