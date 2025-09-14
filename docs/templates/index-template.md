# Index Templates

Index templates are used to generate table of contents files that provide navigation for your documentation. These templates control how index files are structured and what content they contain.

## Table of Contents

- [Overview](#overview)
- [Template Structure](#template-structure)
- [Basic Template Example](#basic-template-example)
- [Configuration](#configuration)
- [Configuration Options](#configuration-options)
- [Advanced Customization](#advanced-customization)
- [Custom Line Formatting](#custom-line-formatting)
- [Custom File Name Formatting](#custom-file-name-formatting)
- [Tips](#tips)



## Template Structure

Index templates use a simple placeholder system where `%content%` is replaced with the generated table of contents.

### Basic Template Example

```markdown
## Table of Contents

Below you will find the table of contents and links to all generated documentation files.

---

%content%

---

This file is auto generated. Do not edit manually.
```


## Configuration

Index templates are configured in the `generators.index` section of your configuration:

```typescript
const service = SimpleDocExtractor
  .create(process.cwd())
  .indexTemplate((template) => {
    template.useFile(path.join(process.cwd(), "src/templates/index.template.md"));
    template.useMarkdownLinks();.
    template.filesHeading("\n## Files\n")
    template.directoryHeading("\n## Folders\n")
    template.excerpt({
      length: 120,
      addEllipsis: false,
      firstSentenceOnly: true,
    })
    template.lineCallback((fileNameEntry, lineNumber, excerpt) => {
      return `- **${fileNameEntry}** - ${excerpt || 'No description available'}`;
    })
    template.fileNameCallback((filePath) => {
      return path.basename(filePath, path.extname(filePath));
    })
    template.plugins([
      new CopyContentsPlugin({
        fileToCopy: "README.md",
        searchAndReplace: "%readme%",
      }),
    ])
  })
  .buildService();
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
- **`lineCallback`** (function): Custom function to format each line in the index
- **`fileNameCallback`** (function): Custom function to format file names
- **`plugins`** (array): Array of extractor plugins to use

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

### Tips

- Check the console output for template processing errors
- Verify your template file exists and is readable
- Test with a simple template first, then add complexity