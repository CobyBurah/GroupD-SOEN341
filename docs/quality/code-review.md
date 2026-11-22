# Code review

Work on a branch named `<type>/<short-description>` (for example `chore/repo-organization`, `fix/notification-count` or `docs/sprint4-report`). Link the issue with `Closes #123`, or `Part of #123` for partial work. Add a type label and the sprint milestone, and complete the PR template with the reason for the change and actual validation.

Request review from a teammate other than the author. Review the final diff, including SQL, workflows, dependencies and documentation. Leave actionable comments, resolve discussions and rerun checks affected by follow-up changes. Do not self-approve or treat a green workflow as a substitute for teammate review.

## Reviewer checklist

- **Correctness:** behavior matches the issue and acceptance criteria; edge cases and errors are handled.
- **Maintainability:** naming and structure are clear, code fits existing conventions, and duplication is reasonable.
- **Security:** authentication, recipient/owner boundaries, input validation, RLS and secrets are handled correctly; migrations preserve required access restrictions.
- **Performance:** queries, pagination, polling, network and model calls have suitable bounds; unnecessary work is avoided.
- **Testing:** evidence matches the change and revision; failures and privacy boundaries are covered where relevant; local fixtures are identified separately from live tests.
- **Documentation:** setup, paths, feature behavior, migrations and usage remain accurate; AI usage is recorded when applicable.

For documentation or file moves, check relative links, references, tracked file paths and file contents. Run checks relevant to any changed scripts or configuration. For application/database changes, run the applicable lint, typecheck, unit/database, build and browser checks. CI workflows and their path filters are documented in [CI/CD](ci-cd.md).

Before merge, obtain teammate approval, resolve conversations and confirm applicable CI checks pass. Follow any stronger repository protection rules. After merging, verify the linked issue closes, update its project-board status if attached, and preserve the test evidence. A live acceptance issue is not complete solely because synthetic tests passed.
