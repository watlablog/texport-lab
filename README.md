# TeXport

TeXport is a small static web app for rendering LaTeX equations with MathJax and exporting them as SVG or PNG images.

- No backend
- No login
- No external API
- No CDN dependency
- MathJax bundled via npm
- SVG and PNG export

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Upload the contents of `dist/` to a static host. The Vite base path is relative, so the build can be placed under a subdirectory such as `/texport/`.

## Sample Authoring Notes

Samples are inserted at the current editor selection or cursor position. They should be written as reusable LaTeX snippets unless the sample is specifically demonstrating a complete equation.

- Prefer the smallest renderable expression for building-block samples, such as `\sum_{k=1}^{n} k`, `\int_{0}^{1} x^2\,\mathrm{d}x`, `\mathbf{x}`, or a matrix environment.
- Do not force building-block samples to include `= ...` just to make them look complete.
- Keep full-equation samples for cases where the complete structure matters, such as aligned derivations, systems of equations, differential equations, `cases`, and matrix products.
- Keep snippet text free of leading/trailing punctuation or decorative spacing so insertion works cleanly inside an existing expression.
- Do not move toolbar responsibilities into Samples. Formatting wrappers such as `\boldsymbol{...}`, `\mathrm{...}`, `\mathit{...}`, and the WordPress scroll wrapper should remain toolbar-driven.
