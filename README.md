# TeXportLab

Live app: [https://texportlab.com/](https://texportlab.com/)

TeXportLab is a small static web app for rendering LaTeX equations with MathJax and exporting them as SVG or PNG images.

- No backend
- No login
- No external API
- No CDN dependency
- MathJax bundled via npm
- SVG and PNG export

## How to Use

Type a LaTeX equation in the editor. TeXportLab renders automatically after a short delay, so there is no manual render button.

You can write a plain equation such as:

```tex
\frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
```

Display delimiters such as `$$...$$`, `\[...\]`, and `\(...\)` are accepted and stripped before rendering. The editor also normalizes macOS/Japanese `¥` and `￥` characters to `\`.

### Insert Symbols and Samples

- `Samples` opens a categorized LaTeX sample browser. Choose a rendered sample to insert its LaTeX at the current cursor position or replace the selected range.
- `Greek` opens a Greek-letter browser in the official Greek alphabet order. Choose a letter to insert its LaTeX command.
- Sample insertion does not replace the whole editor unless the whole editor is selected.

### Formatting Toolbar

Select text in the editor, then use the toolbar above the input:

- `B`: wrap with `\boldsymbol{...}` for bold symbols, including Greek letters.
- `rm`: wrap with `\mathrm{...}`.
- `I`: wrap with `\mathit{...}`.
- `bf`: wrap with `\mathbf{...}`.
- `bb`: wrap with `\mathbb{...}`.
- `sf`: wrap with `\mathsf{...}`.
- `cal`: wrap with `\mathcal{...}`.
- `fr`: wrap with `\mathfrak{...}`.
- `<>`: wrap with a WordPress-friendly horizontal scroll container.

Clicking the same toolbar button on an already wrapped selection removes that wrapper.

### Preview Colors and Scale

Use the preview controls to adjust:

- `font`: changes the rendered equation color. This color is included in SVG and PNG exports.
- `background`: changes the preview background. Exported SVG and PNG files keep a transparent background unless `Apply background color to output` is enabled.
- `1x / 2x / 4x`: changes the preview size and PNG export scale. The default is `2x`.

### Export

- `Copy LaTeX`: copies the editor contents as text.
- `Copy PNG`: copies a PNG to the clipboard. This requires localhost or HTTPS and a browser with image clipboard support. iOS Safari may still block image clipboard writes in some contexts; use `PNG` download as the fallback when that happens.
- `PNG`: downloads a PNG.
- `SVG`: downloads an SVG.
- `Apply background color to output`: includes the selected preview background color in copied PNG, downloaded PNG, and downloaded SVG output. Leave it unchecked for transparent output.

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
