# Publishing

How to put `@esdrassantos06/gallery` on npm the first time, and how to release every later version from GitHub Actions without a stored npm token.

> Written without access to npm's online documentation. Steps marked **Check** depend on npm's website or policies, which change; confirm them on npmjs.com before relying on them.

## Before the first release

### 1. Create an npm account

Sign up at npmjs.com with the username `esdrassantos06`. The package is scoped to `@esdrassantos06`, so the scope must match your username (or an npm organization you own). Turn on two-factor authentication in your account settings.

### 2. Log in from the terminal

```bash
npm login
```

```bash
npm whoami
```

`npm whoami` must print `esdrassantos06`.

### 3. Check the name

```bash
npm view @esdrassantos06/gallery
```

A `404` means the name is free. Scoped names can only be taken by the scope owner, so nobody else can claim it.

### 4. Confirm the metadata

`package.json` already has the fields npm shows:

| Field                                                | Value                                                           |
| ---------------------------------------------------- | --------------------------------------------------------------- |
| `name`                                               | `@esdrassantos06/gallery`                                       |
| `version`                                            | `1.0.0`                                                         |
| `description`, `keywords`, `license` (MIT), `author` | set                                                             |
| `repository`, `homepage`, `bugs`                     | `github.com/esdrassantos06/gallery`                             |
| `exports`                                            | `.` (ESM and types) and `./styles.css`                          |
| `files`                                              | `dist` (npm adds `README.md`, `LICENSE` and `package.json`)     |
| `peerDependencies`                                   | `react` and `react-dom` 18 or 19                                |
| `publishConfig.access`                               | `public`, required the first time a scoped package is published |

Push the repository to GitHub before publishing so the links on the npm page work. The README images use relative paths, which npm resolves against `repository`.

### 5. Check the package

```bash
npm run check:package
```

```bash
npm pack
```

`npm pack` builds `esdrassantos06-gallery-1.0.0.tgz`, the exact file npm would receive. On the current tree it contains six files: `LICENSE`, `README.md`, `package.json`, `dist/index.js`, `dist/index.d.ts` and `dist/styles.css` (about 40 kB packed).

### 6. Test the tarball in a real project

In the Next.js site, install the tarball instead of the registry version:

```bash
npm install "/Volumes/Z Code/programming/@esdrassantos06-gallery/esdrassantos06-gallery-1.0.0.tgz"
```

Then import it as users will, run the site's own build and click through a gallery:

```tsx
import { Lightbox } from "@esdrassantos06/gallery";
import "@esdrassantos06/gallery/styles.css";
```

```bash
npm run build
```

Remove the tarball dependency afterwards (or reinstall from npm once published).

## First release (manual)

### 7. Publish

From a clean checkout of the commit you want to release:

```bash
npm publish
```

`prepublishOnly` runs the typecheck, the unit tests and the build first, so a broken tree cannot be published. `publishConfig.access` makes the scoped package public; `npm publish --access public` does the same if you prefer to be explicit. npm asks for a one-time password from your authenticator.

Then tag the commit:

```bash
git tag v1.0.0
```

```bash
git push origin v1.0.0
```

## Automated releases with Trusted Publishing

### 8. Connect the package to GitHub (OIDC)

Trusted Publishing lets a GitHub Actions workflow publish with a short-lived token that GitHub and npm agree on through OpenID Connect. No `NPM_TOKEN` secret is stored anywhere.

On npmjs.com, open the package, go to **Settings**, find **Trusted publishing** and add a GitHub Actions publisher with:

| Field                | Value                                                     |
| -------------------- | --------------------------------------------------------- |
| Organization or user | `esdrassantos06`                                          |
| Repository           | `gallery`                                                 |
| Workflow filename    | `publish.yml`                                             |
| Environment          | `npm` (optional, but lets you require approval in GitHub) |

**Check:** the exact menu names, whether the package must already exist (it does after step 7), and the minimum npm CLI version that supports OIDC publishing (it was 11.5.1 when the feature launched; the workflow below upgrades npm to be safe).

After the first automated release works, set the package's publishing access to require two-factor authentication and disallow tokens, so only the workflow and you can publish.

### 9. The GitHub Actions workflow

Phase 7 adds this file to the repository; it is shown here so the setup in step 8 is complete.

```yaml
# .github/workflows/publish.yml
name: Publish

on:
  release:
    types: [published]

permissions:
  contents: read
  id-token: write

jobs:
  publish:
    runs-on: ubuntu-latest
    environment: npm
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          registry-url: https://registry.npmjs.org
      - run: npm install -g npm@latest
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run lint
      - run: npm run e2e
      - run: npm run check:package
      - run: npm publish
```

- `id-token: write` is what lets the job request the OIDC token. Without it npm falls back to looking for a token and fails.
- With Trusted Publishing, npm attaches a provenance statement automatically, linking the published version to this workflow run and commit.
- **Check:** the action major versions (`checkout`, `setup-node`) current at the time you add the file.

To release a new version:

```bash
npm version minor
```

```bash
git push --follow-tags
```

Then create a GitHub release from the new tag; publishing the release starts the workflow.

## 10. Manual versus automated

|                     | Manual (`npm publish` on your machine)             | Automated (Trusted Publishing)                                 |
| ------------------- | -------------------------------------------------- | -------------------------------------------------------------- |
| Credentials         | Your npm login and an authenticator code each time | None stored; GitHub issues a short-lived OIDC token per run    |
| What gets published | Whatever is in your working tree                   | A clean checkout of the tagged commit                          |
| Checks              | `prepublishOnly` (typecheck, unit tests, build)    | The full workflow: lint, unit, end to end, package checks      |
| Provenance          | Not available from a laptop                        | Attached automatically                                         |
| Risk                | A leaked or reused token, or a dirty tree          | Limited to who can push tags and approve the `npm` environment |
| When to use         | The very first release, so the package exists      | Every release after that                                       |
