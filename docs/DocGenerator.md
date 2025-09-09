Generates documentation files from content using a template.

This class takes content and generates markdown documentation files by injecting
the content into a template file. It handles file path creation, directory creation,
and extension replacement to ensure proper markdown output.

@example
```typescript
const generator = new DocGenerator({
  template: './templates/doc.template.md',
  outDir: './docs',
  searchAndReplace: '{{CONTENT}}'
});

generator.generateContent('Some documentation content', 'example.js');
// Creates ./docs/example.md with content injected into template
```


---

*This file is auto generated. Do not edit manually.*