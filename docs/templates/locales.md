# Locales

The Locales system provides dynamic file metadata that can be injected into documentation templates. These locales are automatically generated based on the source file being processed and provide useful information about the file's properties.

## Available Locales

The following locales are available for use in documentation templates:

### `%locales.fileName%`

**Description:** The basename of the source file being processed.

**Type:** `string`

**Example:** If processing a file at `src/components/Button.tsx`, this locale would contain `Button.tsx`.

**Usage in templates:**
```markdown
## %locales.fileName%
```

### `%locales.updatedAt%`

**Description:** The last modification time of the source file in ISO 8601 format.

**Type:** `string` (ISO 8601 timestamp)

**Example:** `2024-01-15T14:30:25.123Z`

**Usage in templates:**
```markdown
Last updated: %locales.updatedAt%
```

## Integration with Templates

Locales are automatically injected into documentation templates during the processing phase. The `CodeFileProcessor` adds these locales to the extracted content, making them available for replacement in template files.

**Example template usage:**
```markdown
## %locales.fileName%

[Documentation content here]

---

Last updated: %locales.updatedAt%

*This file is auto generated. Do not edit manually.*
```
