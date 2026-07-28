# TRIAD Rehabilitation Center — Investor Business Proposal

Investor-ready business proposal for a multidisciplinary rehabilitation and
therapy center in New Cairo (Fifth Settlement), Egypt, founded by Nagham Reda
(Orthopaedic & Sports Rehabilitation), Saja Khader (Adult Neurological
Rehabilitation) and Saja Ali (Pediatric Rehabilitation).

## Contents

| File | Description |
|---|---|
| **Full Proposals** | |
| `en/Business_Proposal_EN.md` | Full English proposal (source of truth, Markdown) |
| `ar/Business_Proposal_AR.md` | Full Arabic proposal (source of truth, Markdown, RTL) |
| `TRIAD_Business_Proposal_EN.docx` / `.pdf` | Polished Word/PDF version — English (63 pages) |
| `TRIAD_Business_Proposal_AR.docx` / `.pdf` | Polished Word/PDF version — Arabic (63 pages) |
| **Executive Summaries** | |
| `TRIAD_Executive_Summary_EN.md` | One-page executive summary — English (source, Markdown) |
| `TRIAD_Executive_Summary_AR.md` | One-page executive summary — Arabic (source, Markdown, RTL) |
| `TRIAD_Executive_Summary_EN.docx` / `.pdf` | One-page summary Word/PDF — English (14 pages formatted) |
| `TRIAD_Executive_Summary_AR.docx` / `.pdf` | One-page summary Word/PDF — Arabic (14 pages formatted) |
| **Templates & Build** | |
| `build/ref_en.docx`, `build/ref_ar.docx` | Pandoc reference-doc templates (branding, fonts, theme colors) used to style the Word output |

The proposal covers: executive summary, vision/mission/values, company
overview, market and competitor analysis, SWOT, clinical services, department
structure, org chart, staffing plan, facility layout, equipment lists,
technology, operations, policies/SOPs, marketing and branding strategy, and
three fully-costed financial scenarios (Low / Moderate / Luxury budget) with
start-up costs, opex, revenue projections, break-even analysis, 3-year P&L,
ROI/payback, risk assessment, expansion strategy and an implementation
timeline.

All financial figures are indicative planning estimates (EGP, with USD
equivalents at ≈50 EGP/USD, July 2026) pending a formal feasibility study and
vendor quotations — see the Appendix in each document for assumptions.

## Regenerating the Word/PDF documents

The `.md` files are the source of truth. To rebuild the `.docx`/`.pdf` after
editing them:

```bash
# from the proposal/ directory
pandoc en/Business_Proposal_EN.md \
  --from markdown+yaml_metadata_block --to docx \
  --reference-doc=build/ref_en.docx \
  --metadata title="TRIAD Multidisciplinary Rehabilitation & Therapy Center" \
  -o TRIAD_Business_Proposal_EN.docx

pandoc ar/Business_Proposal_AR.md \
  --from markdown+yaml_metadata_block --to docx \
  --reference-doc=build/ref_ar.docx \
  -o TRIAD_Business_Proposal_AR.docx

# optional: render to PDF for a quick preview (requires LibreOffice with the Writer component)
soffice --headless --convert-to pdf TRIAD_Business_Proposal_EN.docx
soffice --headless --convert-to pdf TRIAD_Business_Proposal_AR.docx
```

Note: in Markdown, a numbered/bulleted list must be preceded by a blank line
when it follows a plain paragraph (bold label lines like `**Patient flow:**`
included) — otherwise pandoc merges it into the paragraph as running text
instead of a list.
