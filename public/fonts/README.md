# Font Files

Place your purchased/licensed font files here. The CSS `@font-face` declarations
in `src/index.css` expect the following filenames:

## LEMON MILK (Primary Font)
| File | Weight | Usage |
|------|--------|-------|
| `LemonMilk-Regular.woff2` | 400 | Headings, display text |
| `LemonMilk-Regular.woff` | 400 | Headings, display text (fallback) |
| `LemonMilk-Bold.woff2` | 700 | Bold headings |
| `LemonMilk-Bold.woff` | 700 | Bold headings (fallback) |

> LEMON MILK by Marsnev — available at https://www.dafont.com/lemon-milk.font

## ITC Avant Garde Gothic BT (Secondary Font)
| File | Weight | Usage |
|------|--------|-------|
| `AvantGardeBT-Book.woff2` | 300–400 | Body text, UI labels |
| `AvantGardeBT-Book.woff` | 300–400 | Body text (fallback) |
| `AvantGardeBT-Medium.woff2` | 500–700 | Semi-bold UI text |
| `AvantGardeBT-Medium.woff` | 500–700 | Semi-bold UI text (fallback) |

> ITC Avant Garde Gothic BT is a commercial font.
> Convert TTF/OTF files to WOFF2/WOFF using https://cloudconvert.com/ttf-to-woff2

## Fallback Fonts
Until the font files are added, browsers will fall back to:
- **LEMON MILK** → system `sans-serif`
- **ITC Avant Garde Gothic BT** → Century Gothic → Trebuchet MS → `sans-serif`
