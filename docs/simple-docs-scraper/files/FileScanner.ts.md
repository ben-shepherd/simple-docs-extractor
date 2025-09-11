## File Name
 Scans directories for files matching specified extensions using glob patterns.

 This class provides file discovery capabilities by scanning directories
 for files that match the configured extensions. It supports both relative
 and absolute paths and integrates with the glob library for pattern matching.

 @example
 ```typescript
 const scanner = new FileScanner({
   cwd: './src',
   extensions: ['*.js', '*.ts']
 });

 const files = await scanner.collect();
 // Returns array of matching file paths
 ```


---
This file is auto generated. Do not edit manually.*
