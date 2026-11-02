# Security

## Supported versions

Only the latest published version receives fixes.

## Reporting a vulnerability

Please do not open a public issue. Use GitHub's **Report a vulnerability** button in the repository's Security tab, or email esdrasirion1@gmail.com with the steps to reproduce and the impact.

You will get an answer within a week. Once a fix is released, the report is credited in the changelog unless you prefer otherwise.

## Scope

The package renders content you pass in `slides`. Captions and `render` functions are React nodes, so they are escaped by React; the package never uses `dangerouslySetInnerHTML`. Iframe slides (`type: "iframe"`, YouTube, Vimeo) load third-party pages: only pass URLs you trust, and restrict them with `frame-src` in your Content Security Policy.
