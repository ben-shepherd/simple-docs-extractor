### Copy Contents Plugin

[Back to Index](../index.md)

Copies the entire contents of specified files into the documentation. This is useful for including external files like README files, configuration examples, or other documentation files.

```typescript
import { CopyContentsPlugin } from 'simple-docs-scraper/extractors';

const extractor = new CopyContentsPlugin({
  fileToCopy: 'README.md',
  searchAndReplace: '%readme%'
});
```

**Configuration:**
- `fileToCopy` (string | string[]): Path(s) to the file(s) to copy
- `searchAndReplace` (string): Replacement text for the copied content

**Example usage:**
```typescript
// Single file
const extractor = new CopyContentsPlugin({
  fileToCopy: 'docs/installation.md',
  searchAndReplace: '%installation%'
});

// Multiple files
const extractor = new CopyContentsPlugin({
  fileToCopy: ['README.md', 'CHANGELOG.md', 'LICENSE'],
  searchAndReplace: '%project-files%'
});
```

**Error handling:**
The plugin will return an error if any of the specified files cannot be found:
```typescript
{
  errorMessage: "Unable to copy file contents. File 'missing-file.md' not found",
  throwable: true
}
```