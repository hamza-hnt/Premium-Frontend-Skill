# Publishing a release

Ordinary pushes and pull requests run CI. **Publishing a stable GitHub release publishes its matching npm version**, after validation, unit tests and installer checks on Linux, macOS and Windows pass. Draft releases and prereleases do not publish to npm.

The workflow is [`.github/workflows/publish.yml`](https://github.com/hamza-hnt/Premium-Frontend-Skill/blob/main/.github/workflows/publish.yml). It tests and builds the release event's commit, checks the version, then publishes the exact generated installer archive. The repository root stays private. Authentication uses npm trusted publishing (OIDC), with no npm token stored in GitHub secrets.

## One-time npm setup

Push the workflow to GitHub first. In the npm package's **Settings → Trusted Publisher**, choose **GitHub Actions** and enter:

| Field                | Value                    |
| -------------------- | ------------------------ |
| Organization or user | `hamza-hnt`              |
| Repository           | `Premium-Frontend-Skill` |
| Workflow filename    | `publish.yml`            |
| Environment          | Leave empty              |
| Allowed actions      | Enable **`npm publish`** |

Enter the workflow filename only. New configurations allow staged publishing by default; this workflow needs direct `npm publish` permission. Configure it when ready to release: npm requires its first successful publication within two days, otherwise the configuration expires and must be recreated. These requirements are documented in [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/).

The release job uses Node 26.8.1 and npm 12.0.2, with `id-token: write` scoped to that job. GitHub-hosted runners are required. For a public repository and public package, npm automatically adds provenance to OIDC publications. No account settings are changed by the workflow.

## Publish the next version

For example, to release `1.2.1` after `1.2.0`:

1. Update `package.json` and its lockfile together:

   ```bash
   npm version 1.2.1 --no-git-tag-version
   ```

2. Set `metadata.version` in `SKILL.md` to `"1.2.1"`, keeping the existing frontmatter format.
3. Check the version and run the local checks:

   ```bash
   npm run release:check -- --tag v1.2.1
   npm run format:check
   npm run typecheck
   npm test
   npm run validate
   npm run test:installer:package
   ```

4. Commit and push the changes. Let the branch CI pass.
5. In GitHub **Releases → Draft a new release**, create tag **`v1.2.1`** targeting that commit, add release notes, and publish it as a stable release.

The **Publish to npm** workflow reruns the full CI against that commit before publishing. It requires the tag, `package.json`, both root versions in `package-lock.json`, and `SKILL.md` metadata to agree. Stable tags use `vMAJOR.MINOR.PATCH`; prerelease and build suffixes are rejected.

Once the workflow succeeds and npm finishes processing the package, users can update with:

```bash
npx premium-frontend-skill@latest install --update
```

Existing installations update only when users run that command. Publishing a version does not modify anyone's local skill automatically.

## If publication fails

- **Version mismatch:** correct all version files before creating the release tag.
- **Authentication failure:** check the npm trusted publisher fields, its expiry and direct `npm publish` permission. The workflow does not use `npm login` or a token secret.
- **Version already published:** npm versions are immutable. Check npm before rerunning a failed job; if publication succeeded, do not attempt to overwrite that version. Ship changes under the next version.
- **Package still processing:** the registry can take a few minutes to expose an accepted publication. Check `npm view premium-frontend-skill@1.2.1 version` before attempting another publish.

Local checks validate the workflow and package behavior. The OIDC exchange is verified only when the configured GitHub workflow successfully publishes a new version.
