import fs from "fs";
import path from "path";

export const deleteOutputFiles = () => {
  const outDir = path.join(process.cwd(), "/src/tests/output");

  if (fs.existsSync(outDir)) {
    fs.rmSync(outDir, { recursive: true, force: true });
  }

  fs.mkdirSync(outDir);
};
