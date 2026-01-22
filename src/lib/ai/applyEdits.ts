export interface Edit {
  oldString: string;
  newString: string;
}

interface EditError {
  index: number;
  oldString: string;
  reason: "not_found" | "multiple_matches" | "empty_string";
  matchCount?: number;
}

export interface ApplyEditsResult {
  code: string;
  errors: EditError[];
  appliedCount: number;
}

export function applyEdits(code: string, edits: Edit[]): ApplyEditsResult {
  const errors: EditError[] = [];
  let result = code;
  let appliedCount = 0;

  for (let i = 0; i < edits.length; i++) {
    const { oldString, newString } = edits[i];

    if (!oldString) {
      errors.push({ index: i, oldString: "(empty)", reason: "empty_string" });
      continue;
    }

    const matches = result.split(oldString).length - 1;

    if (matches === 0) {
      errors.push({ index: i, oldString: truncate(oldString), reason: "not_found" });
    } else if (matches > 1) {
      errors.push({ index: i, oldString: truncate(oldString), reason: "multiple_matches", matchCount: matches });
    } else {
      result = result.replace(oldString, newString);
      appliedCount++;
    }
  }

  return { code: result, errors, appliedCount };
}

function truncate(str: string, max = 60): string {
  return str.length <= max ? str : str.slice(0, max - 3) + "...";
}

export function formatEditErrors(errors: EditError[]): string {
  return errors.map((e) => {
    const s = JSON.stringify(e.oldString);
    if (e.reason === "not_found") return `Edit ${e.index + 1}: Not found: ${s}`;
    if (e.reason === "multiple_matches") return `Edit ${e.index + 1}: ${s} matches ${e.matchCount}x - add more context`;
    return `Edit ${e.index + 1}: Empty oldString`;
  }).join("\n");
}
