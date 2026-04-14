# CliB Agency — Demo Site

## Project Overview

Landing page for **CliB Agency**, a YouTube thumbnail and channel packaging studio. The site is a static HTML/CSS/JS build with no framework or bundler.

## File Structure

```
index.html          — Single-page layout (all sections)
styles.css          — All styles (CSS custom properties, no preprocessor)
script.js           — Vanilla JS (animations, gallery, interactions)
logo/               — SVG logo assets
avatars/            — Client avatar images
channels/           — YouTube channel art examples
results/            — Before/after result images
thumbs businnes/    — Business niche thumbnail samples
thumbs lifestyle/   — Lifestyle niche thumbnail samples
thumbs podcast/     — Podcast niche thumbnail samples
thumbs trading/     — Trading niche thumbnail samples
How we work/        — Process step images
```

## Tech Stack

- Pure HTML5 / CSS3 / Vanilla JS — no frameworks, no build step
- Google Fonts: Inter (400–900)
- CSS custom properties for theming (defined in `:root`)
- Canvas-based animated grid background

## Design Tokens (CSS Variables)

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#0D0A19` | Page background |
| `--accent` | `#5900FF` | Primary purple accent |
| `--accent-soft` | `#7863FF` | Hover states |
| `--text` | `#FFFFFF` | Primary text |
| `--text-secondary` | `rgba(255,255,255,0.65)` | Body copy |
| `--radius-lg` | `24px` | Card border radius |

## Key Conventions

- All styles live in `styles.css` — do not add `<style>` blocks to `index.html`
- All JS lives in `script.js` — do not add inline `<script>` blocks
- Keep the single-file structure — no splitting into components
- Accessibility: maintain `aria-*` attributes and `.skip-link` on changes
- Images use descriptive `alt` text; decorative elements use `aria-hidden="true"`

## Browser Target

Modern evergreen browsers (Chrome, Firefox, Safari, Edge). No IE support needed.
