# Documentation File Templates

Documentation file templates control how individual documentation files are generated from your source code. These templates define the structure and format of each documentation file, including how extracted content is organized and presented.

## Table of Contents

- [Overview](#overview)
- [Template Structure](#template-structure)
- [Placeholders](#placeholders)
- [Configuration](#configuration)
- [Attribute Formatting](#attribute-formatting)
- [Tips](#tips)


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

## Placeholders

The placeholders available in your documentation template are determined by the options you provide to your extractor plugins. For example, when using the `TagExtractorPlugin`, you can specify which tags to extract and what placeholder names to use for their content.

#### Example

```typescript
new TagExtractorPlugin({
  tag: "docs",
  searchAndReplace: "%content%",
})
```

**Template Example**

```markdown
## %locales.fileName%

---

%content%

---

Last updated: %locales.updatedAt%
```

**MyFile.js**
```typescript
/**
 * <docs>
 * This is documentation content.
 * </docs>
 */
```

**Output**

```markdown
## MyFile.js

This is documentation content.

---

Last updated: 2025-14-09T21:00:25.123Z
```

## Configuration

Documentation templates are configured in the `generators.documentation` section of your configuration:

```typescript
const service = SimpleDocExtractor
  .create(process.cwd())
  .documentationTemplate((template) => {
    template.useFile(path.join(process.cwd(), "src/templates/documentation.template.md"));
  })
```


### Attribute Formatting

Use the `attributeFormat` option to customize how extracted content is formatted:

```typescript
new TagExtractorPlugin({
  tag: "method",
  searchAndReplace: "%methods%",
  attributeFormat: "### **{value}**\n\n",
})
```

**Template Example**

```markdown
## Attributes
%methods%
```

**MyFile.js**
```typescript
/**
 * <docs nameOfAttribute="the is the value">
 * This is documentation content.
 * </docs>
 */
```

**Output**

```markdown
## Attributes
### **nameOfAttribute**: the is the value
```

### Tips

- Use simple templates first, then add complexity
- Test individual extractor plugins to ensure they're working
- Check the console output for template processing errors
- Verify that your source files contain the expected documentation tags

