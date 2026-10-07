---
name: Workspace package installation
description: Installing dependencies into a single package in a pnpm monorepo.
---

When a dependency belongs in one workspace package, use the package-management skill first. If its installer only targets the workspace root and rejects package filters, install with pnpm's package selector, such as `pnpm --filter @workspace/api-server add <package>`.

**Why:** the generic installer added packages at the monorepo root and rejected `--filter` as a package token, while root installation was blocked by the workspace root safety check.

**How to apply:** use a package-scoped pnpm command after the package-management callback cannot target the intended workspace; keep runtime packages in the server package that imports them.
