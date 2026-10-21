// Commit messages follow Conventional Commits with the types in docs/workflow.md §5.
// Checked by the commit-msg hook (.husky/commit-msg).
const config = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [2, "always", ["feat", "fix", "docs", "refactor", "test", "chore", "ci"]],
  },
};

export default config;
