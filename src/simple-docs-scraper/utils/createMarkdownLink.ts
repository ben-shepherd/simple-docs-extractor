export const createMarkdownLink = (createAsLink: boolean, display: string, path: string, excerpt?: string) => {
    let result = "";

    if (false === createAsLink) {
      result = `${display}`;

      if (excerpt) {
        result += ` - ${excerpt}`;
      }

      return result;
    }

    result = `[${display}]`;

    if (excerpt) {
      result += `(${path} - ${excerpt})`;
    } else {
      result += `(${path})`;
    }

    return result;
  }