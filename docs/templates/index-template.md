# Index Templates

Index templates are used to generate table of contents files that provide navigation for your documentation. These templates control how index files are structured and what content they contain.

## Overview

Index templates are processed by the `IndexFileGenerator` and create markdown files that serve as navigation hubs for your documentation. They automatically generate links to all documentation files and organize them by directories and files.

## Template Structure

Index templates use a simple placeholder system where `%content%` is replaced with the generated table of contents.

### Basic Template Example

```markdown
## Table of Contents

This is the index file for the generated documentation. Below you will find the table of contents and links to all generated documentation files.

---

%content%

---

This file is auto generated. Do not edit manually.
```

## Available Placeholders

### `%content%`

**Description:** The main placeholder that gets replaced with the generated table of contents.

**Content:** Automatically generated list of files and directories with markdown links and excerpts.

**Example output:**
```markdown
## Files

- [Button.tsx](Button.tsx) - A reusable button component with multiple variants
- [Modal.tsx](Modal.tsx) - A modal dialog component with overlay and animations

## Folders

- [components/](components/index.md)
- [utils/](utils/index.md)
```

## Configuration

Index templates are configured in the `generators.index` section of your configuration:

```typescript
generators: {
  index: {
    template: path.join(process.cwd(), "src/templates/index.template.md"),
    markdownLink: true,
    filesHeading: "\n## Files\n",
    directoryHeading: "\n## Folders\n",
    excerpt: {
      length: 120,
      addEllipsis: false,
      firstSentenceOnly: true,
    },
  },
}
```

### Configuration Options

- **`template`** (string): Path to your index template file
- **`markdownLink`** (boolean): Whether to generate markdown links for files
- **`filesHeading`** (string): Heading text for the files section
- **`directoryHeading`** (string): Heading text for the directories section
- **`excerpt`** (object): Configuration for generating file excerpts
  - **`length`** (number): Maximum length of excerpts
  - **`addEllipsis`** (boolean): Whether to add "..." to truncated excerpts
  - **`firstSentenceOnly`** (boolean): Whether to extract only the first sentence

## Advanced Customization

### Custom Line Formatting

You can customize how each line in the index is formatted using the `lineCallback` function:

```typescript
generators: {
  index: {
    template: "path/to/template.md",
    lineCallback: (fileNameEntry: string, lineNumber: number, excerpt?: string) => {
      return `- **${fileNameEntry}** - ${excerpt || 'No description available'}`;
    },
  },
}
```

### Custom File Name Formatting

You can customize how file names are displayed using the `fileNameCallback` function:

```typescript
generators: {
  index: {
    template: "path/to/template.md",
    fileNameCallback: (filePath: string) => {
      return path.basename(filePath, path.extname(filePath));
    },
  },
}
```

## Best Practices

1. **Keep it simple:** Index templates should focus on navigation and organization
2. **Include clear headings:** Use descriptive headings for files and folders sections
3. **Add context:** Include brief descriptions or excerpts to help users understand what each file contains
4. **Maintain consistency:** Use consistent formatting throughout your index files
5. **Auto-generation notice:** Always include a notice that the file is auto-generated

## Example Templates

### Minimal Template

```markdown
# Documentation Index

%content%
```

### Detailed Template

```markdown
# Project Documentation

Welcome to the project documentation. This index provides an overview of all available documentation files.

## Quick Navigation

%content%

---

## Additional Resources

- [Getting Started Guide](./README.md)
- [API Reference](./api/index.md)
- [Contributing Guidelines](./CONTRIBUTING.md)

---

*This index is automatically generated. Do not edit manually.*
```

### Styled Template

```markdown
<div align="center">

# 📚 Documentation Index

*Your comprehensive guide to the project*

</div>

---

## 📁 Contents

%content%

---

<div align="center">

*This file is auto-generated • Last updated: [Current Date]*

</div>
```

## Integration with Documentation Generation

Index templates work seamlessly with the documentation generation process:

1. **Automatic Discovery:** The system automatically discovers all generated documentation files
2. **Hierarchical Organization:** Files are organized by directory structure
3. **Link Generation:** Markdown links are automatically generated for easy navigation
4. **Excerpt Extraction:** Brief descriptions are extracted from documentation files
5. **Recursive Indexing:** Subdirectories get their own index files

## Troubleshooting

### Common Issues

1. **Template not found:** Ensure the template path in your configuration is correct
2. **Empty content:** Check that your documentation files are being generated properly
3. **Broken links:** Verify that the `markdownLink` option is enabled if you want clickable links
4. **Missing excerpts:** Ensure your documentation files have content that can be excerpted

### Debug Tips

- Check the console output for template processing errors
- Verify your template file exists and is readable
- Test with a simple template first, then add complexity
- Use the `lineCallback` and `fileNameCallback` for debugging output formatting
