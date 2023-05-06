// ChatGPT generated
// Prompt: could you write a typescript function that is equivalent to the python shlex split function?

export function shlexSplit(s: string): string[] {
  const result: string[] = [];
  let token = "";
  let quoteChar: string | null = null;
  let escapeNext = false;

  for (let i = 0; i < s.length; i++) {
    const c = s[i];

    if (escapeNext) {
      token += c;
      escapeNext = false;
    } else if (c === "\\") {
      escapeNext = true;
    } else if (c === quoteChar) {
      quoteChar = null;
    } else if (quoteChar !== null) {
      token += c;
    } else if (c === '"' || c === "'") {
      quoteChar = c;
    } else if (c === " " || c === "\t" || c === "\n" || c === "\r") {
      if (token !== "") {
        result.push(token);
        token = "";
      }
    } else {
      token += c;
    }
  }

  if (quoteChar !== null) {
    throw new Error("Unmatched quote in input");
  }

  if (token !== "") {
    result.push(token);
  }

  return result;
}

