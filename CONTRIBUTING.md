# Contributing

Thanks for helping. Bug reports, accessibility findings, docs fixes and pull requests are all welcome.

## Setup

You need Node 22 or newer.

```bash
npm install
```

```bash
npx playwright install chromium
```

```bash
npm run dev
```

`npm run dev` starts the site and playground on Vite. It is the quickest way to see a change.

## Workflow

1. Open an issue first for anything larger than a small fix, so we can agree on the approach.
2. Write the failing test first, then the change. Unit and integration tests live next to the code in `src/*.test.ts(x)`; browser tests live in `e2e/`.
3. Keep the package free of runtime dependencies. Anything the site needs goes in `devDependencies`.
4. Every visible string, icon, color and timing must stay replaceable through `labels`, `icons`, `render` or a `--eg-*` variable.
5. Run the checks before opening a pull request:

```bash
npm run format
```

```bash
npm run lint && npm run typecheck && npm run test && npm run e2e
```

```bash
npm run build && npm run size && npm run check:package
```

## Code style

- TypeScript in strict mode; public exports have explicit types and a doc comment.
- Only documentation comments. A short comment is fine when it explains a non-obvious reason the code cannot show.
- Animations use `transform` and `opacity` only and respect `prefers-reduced-motion`.
- No em dashes in prose, code comments or commit messages.
- Commit messages follow Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`).

## Accessibility

Changes to the viewer must keep it usable with a keyboard and a screen reader. Check focus order, focus return, labels and announcements in a real browser, and add an end-to-end test when behavior changes.

## Releases

Maintainers release through GitHub; see [PUBLISHING.md](./PUBLISHING.md).
