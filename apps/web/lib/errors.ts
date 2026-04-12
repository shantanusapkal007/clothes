type IssueLike = {
  path?: Array<string | number>;
  message?: string;
};

function getIssueMessage(issue: IssueLike) {
  const path = issue.path?.length ? `${issue.path.join(".")}: ` : "";
  return `${path}${issue.message || "Invalid value"}`;
}

export function getErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "issues" in error &&
    Array.isArray((error as { issues?: unknown }).issues)
  ) {
    const issues = (error as { issues: IssueLike[] }).issues;
    return issues.length > 0 ? issues.map(getIssueMessage).join("; ") : fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}

export function getApiErrorStatus(error: unknown, fallback = 400) {
  if (
    typeof error === "object" &&
    error !== null &&
    "issues" in error &&
    Array.isArray((error as { issues?: unknown }).issues)
  ) {
    return 422;
  }

  return fallback;
}
