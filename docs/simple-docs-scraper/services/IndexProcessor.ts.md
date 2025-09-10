Processes directories recursively to generate index files for documentation.This class traverses directory structures and creates index files (typically index.md)that list all markdown files found in each directory. It supports custom templatesand search-and-replace patterns for flexible index file generation.@example```typescriptconst processor = new IndexProcessor({  baseDir: './docs',  template: './templates/index.template.md',  searchAndReplace: '{{CONTENT}}'});await processor.handle();// Creates index.md files in all subdirectories of ./docs```

---

*This file is auto generated. Do not edit manually.*