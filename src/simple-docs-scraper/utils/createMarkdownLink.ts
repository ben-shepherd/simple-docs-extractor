export const createMarkdownLink = (createAsLink: boolean, display: string, link: string, excerpt?: string) => {
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
      result += `(${link} - ${excerpt})`;
    } else {
      result += `(${link})`;
    }

    return result;
  }