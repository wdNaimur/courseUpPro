# Releases

This repository uses [release-please](https://github.com/googleapis/release-please) to automate versioning and changelog management for the app.

## What Happens

- Pushes to `main` trigger the GitHub Actions workflow in `.github/workflows/release-please.yml`.
- `release-please` reads Conventional Commit messages since the last release.
- If releasable changes are found, it opens or updates a Release PR.
- The Release PR updates `package.json`, `package-lock.json`, `.release-please-manifest.json`, and `CHANGELOG.md`.
- When that Release PR is merged into `main`, `release-please` creates the GitHub Release automatically.

## Commit Format

Use Conventional Commits so the correct version bump is calculated:

- `feat: add pricing toggle`
- `fix: resolve checkout redirect bug`
- `feat!: change API response format`

Version impact:

- `fix:` creates a patch release, for example `1.2.3` -> `1.2.4`
- `feat:` creates a minor release, for example `1.2.3` -> `1.3.0`
- `feat!:` or a commit with a `BREAKING CHANGE:` footer creates a major release, for example `1.2.3` -> `2.0.0`

Non-releasable commit types such as `docs:`, `chore:`, or `ci:` are still useful, but they do not create a release by themselves.

## Netlify Notes

- Keep Netlify as the deployment platform for this project.
- Netlify Deploy Previews should be used to review Release PRs before they are merged.
- Production deploys should continue to come from the `main` branch after merge.
- This release workflow does not replace or duplicate Netlify deploy behavior.

## First Release

The repository currently starts from version `0.0.0` in `package.json` and `.release-please-manifest.json`.

After the first releasable commit reaches `main`, `release-please` will open the initial Release PR and establish the changelog and release history from there.
