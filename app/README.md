# WoodWyze prototype

A clickable prototype of WoodWyze: the marketing site, the quote calculator for custom shops, the home shop planner, a shop dashboard, the supplier portal, the one-click discovery survey and the outreach admin. Everything runs in the browser on sample data. Nothing is sent anywhere, and no Rockler code or data is in here.

## Run it

```
npm install
npm run dev      # http://localhost:5173
npm test         # engine tests (nesting, pricing, DXF)
npm run build    # one self-contained dist/index.html
```

## Where things are

| Path | What it is |
| --- | --- |
| `src/engine/` | The parametric engine. Pure TypeScript, no React. Templates turn dimensions into parts, `nest.ts` lays parts out on sheets, `price.ts` turns it into a quote, `dxf.ts` exports the sheet layouts. This is the piece that carries over to the real product unchanged. |
| `src/engine/templates.ts` | The four templates: base cabinet run, vanity, bookcase, built-in shelving wall. Add a template by adding an entry here. |
| `src/engine/materials.ts` | Sample sheet prices, kerf. Shops override prices on the Rates and prices page. |
| `src/components/Workspace.tsx` | The shared calculator screen, in shop mode (quote) and home mode (plan). |
| `src/pages/` | Home (marketing), Shop (dashboard and job board), Suppliers (directory and portal), Survey, Admin (outreach), Settings. |
| `src/lib/store.ts` | All persistence. Uses localStorage today; swap these functions for Supabase calls and the pages don't change. |
| `src/data/sample.ts` | Invented sample shops, suppliers, listings and the survey email text. |

## Routes

`#/` home · `#/quote` quote a job · `#/plan` plan a build · `#/shop` my shop · `#/suppliers` suppliers · `#/survey?t=demo-1042&a=over2h` survey as a shop lands from the email · `#/admin` outreach · `#/settings` rates and prices

`#/quote?t=vanity` opens the calculator preloaded with a template, which is how the outreach emails would link in.

## Known gaps

- Engine assumptions are reasonable defaults, not validated with shops yet: frameless construction, full-overlay doors, 4" toe kick, labor hours per box and door.
- Nesting is strip packing a shop can cut on a table saw. It is not an optimal nest.
- No 3D preview yet; the front view is a to-scale elevation.
- No accounts, no sending, no payments. Those come with Supabase, Resend and Stripe.
- The hosted demo hides Download DXF and Print, because the artifact viewer blocks downloads and the print dialog. Both work in `npm run dev`.
