Generates index files from a list of file paths using templates.This class creates index files (typically index.md) that list all the filesin a directory structure. It supports custom formatting through callbacks,link generation, and template-based content generation.@example```typescriptconst generator = new IndexFileGenerator({  template: './templates/index.template.md',  outDir: './docs',  fileNameAsLink: true,  lineCallback: (fileName, lineNumber) => `${lineNumber}. ${fileName}\n`});generator.generateContent(['file1.js', 'file2.ts']);// Creates ./docs/index.md with formatted file list```

---

*This file is auto generated. Do not edit manually.*