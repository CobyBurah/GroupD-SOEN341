# GitHub maintenance

Issues, pull requests and workflows are managed in the [repository](https://github.com/CobyBurah/GroupD-SOEN341). Use the issue/PR templates and [review guide](../../docs/quality/code-review.md). Assign owners, add a type label and sprint milestone, link related stories and preserve evidence.

Earlier logs and issue bodies mention `scripts/github/sprint4-github.mjs`, but that automation is not present in the tracked repository. This directory does not recreate its issue-generation or branch-protection operations. Use the GitHub UI for those tasks until its original author supplies the reviewed source. Do not infer active branch protection from historical documentation; inspect repository settings when needed.

Read-only CLI examples, if GitHub CLI is installed and authenticated:

```sh
gh issue list --repo CobyBurah/GroupD-SOEN341 --assignee @me
gh pr checks <pr-number> --repo CobyBurah/GroupD-SOEN341
```

The CI workflows themselves remain in `.github/workflows/`.
