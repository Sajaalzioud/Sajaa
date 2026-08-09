import { chromium } from 'playwright';
import fs from 'node:fs';
import { topFrontSVG, topBackSVG, pantsFrontSVG, pantsBackSVG } from './garment.mjs';
import { designs } from './designs-data.mjs';

const PAGE_W = 1700;
const PAGE_H = 2080;

function garmentCard(label, svg) {
  return `<div class="gcard">
    <div class="gcard-inner">${svg}</div>
    <div class="glabel">${label}</div>
  </div>`;
}

function pageHTML(d, index, total) {
  const topF = topFrontSVG({ ...d.colors, collar: d.collar, pocket: d.pocket, logo: d.logo });
  const topB = topBackSVG(d.colors);
  const pantF = pantsFrontSVG({ ...d.colors, cargo: d.cargo });
  const pantB = pantsBackSVG(d.colors);

  const swatches = d.palette.map(p => `
    <div class="swatch">
      <div class="swatch-chip" style="background:${p.hex}"></div>
      <div class="swatch-text">
        <div class="swatch-name">${p.name}</div>
        <div class="swatch-hex">${p.hex.toUpperCase()}</div>
      </div>
    </div>`).join('');

  const notes = d.notes.map(n => `<li>${n}</li>`).join('');

  return `<!doctype html><html><head><meta charset="utf-8"><style>
    @font-face { font-family: 'HeaderSerif'; src: local('Liberation Serif'); }
    * { box-sizing: border-box; }
    body {
      margin: 0; width: ${PAGE_W}px; height: ${PAGE_H}px;
      background: #FAF8F4;
      font-family: 'Liberation Sans', 'DejaVu Sans', sans-serif;
      color: #22201C;
      position: relative;
    }
    .frame { position: absolute; inset: 28px; border: 1px solid #C9C0AE; }
    .frame-inner { position: absolute; inset: 34px; border: 1px solid #C9C0AE; }
    .content { position: relative; padding: 78px 90px 60px 90px; }
    .brandrow { display: flex; justify-content: space-between; align-items: baseline;
      font-size: 15px; letter-spacing: 4px; color: #8A8272; text-transform: uppercase; }
    .rule { height: 1px; background: #C9C0AE; margin: 18px 0 34px 0; }
    .titlerow { display:flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px;}
    .designname { font-family: 'Liberation Serif', 'DejaVu Serif', serif; font-size: 64px;
      letter-spacing: 1px; margin: 0; color: #17150F; }
    .designnum { font-family: 'Liberation Serif', serif; font-size: 22px; color: #8A8272; }
    .tagline { font-size: 19px; color: #55503f; font-style: italic; margin-top: 6px; }

    .garments { display: grid; grid-template-columns: 1fr 1fr; gap: 26px; margin-top: 10px; }
    .gcard { background: #fff; border: 1px solid #E4DFD3; border-radius: 4px; padding: 20px 20px 14px 20px; }
    .gcard-inner { display: flex; justify-content: center; }
    .gcard-inner svg { width: 62%; height: auto; display: block; }
    .glabel { text-align: center; font-size: 14px; letter-spacing: 3px; color: #8A8272;
      text-transform: uppercase; margin-top: 8px; }

    .lower { display: grid; grid-template-columns: 1.05fr 1fr; gap: 60px; margin-top: 50px; }
    .section-label { font-size: 13px; letter-spacing: 3px; color: #8A8272; text-transform: uppercase;
      margin-bottom: 16px; }
    .palette { display: grid; grid-template-columns: 1fr 1fr; gap: 18px 26px; }
    .swatch { display: flex; align-items: center; gap: 14px; }
    .swatch-chip { width: 46px; height: 46px; border-radius: 50%; border: 1px solid rgba(0,0,0,0.12); flex: none; }
    .swatch-name { font-size: 15px; font-weight: 600; }
    .swatch-hex { font-size: 13px; color: #8A8272; letter-spacing: 1px; margin-top: 2px; }

    .notes { font-size: 15px; line-height: 1.65; color: #33301f; padding-left: 18px; margin: 0; }
    .notes li { margin-bottom: 9px; }

    .footer { position: absolute; bottom: 46px; left: 90px; right: 90px;
      display: flex; justify-content: space-between; font-size: 12.5px; letter-spacing: 2px;
      color: #A39A87; text-transform: uppercase; }
  </style></head>
  <body>
    <div class="frame"></div><div class="frame-inner"></div>
    <div class="content">
      <div class="brandrow">
        <span>Sajaa &mdash; Luxury Medical Uniform Collection</span>
        <span>Manufacturer Reference Sheet</span>
      </div>
      <div class="rule"></div>
      <div class="titlerow">
        <div>
          <h1 class="designname">${d.name}</h1>
          <div class="tagline">${d.tagline}</div>
        </div>
        <div class="designnum">Design ${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}</div>
      </div>

      <div class="garments">
        ${garmentCard('Top &mdash; Front', topF)}
        ${garmentCard('Top &mdash; Back', topB)}
        ${garmentCard('Pants &mdash; Front', pantF)}
        ${garmentCard('Pants &mdash; Back', pantB)}
      </div>

      <div class="lower">
        <div>
          <div class="section-label">Colour Palette</div>
          <div class="palette">${swatches}</div>
        </div>
        <div>
          <div class="section-label">Construction Notes</div>
          <ul class="notes">${notes}</ul>
        </div>
      </div>
    </div>
    <div class="footer">
      <span>Sajaa Scrub Collection &copy; 2026</span>
      <span>${d.name} &mdash; ${d.slug}</span>
    </div>
  </body></html>`;
}

function coverHTML() {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    body { margin:0; width:${PAGE_W}px; height:${PAGE_H}px; background:#17150F;
      font-family:'Liberation Sans','DejaVu Sans',sans-serif; color:#F3EFE7; position:relative; }
    .frame { position:absolute; inset:34px; border:1px solid #B7A369; }
    .center { position:absolute; top:50%; left:0; right:0; transform:translateY(-50%); text-align:center; }
    .eyebrow { font-size:16px; letter-spacing:8px; text-transform:uppercase; color:#B7A369; margin-bottom:26px; }
    h1 { font-family:'Liberation Serif','DejaVu Serif',serif; font-size:92px; margin:0 0 18px 0; letter-spacing:2px; }
    .sub { font-size:20px; font-style:italic; color:#D8D0BE; margin-bottom:70px; }
    .rule { width:120px; height:1px; background:#B7A369; margin:0 auto 40px auto; }
    .list { font-size:16px; letter-spacing:2px; color:#C9C0AE; line-height:2.4; text-transform:uppercase; }
    .footer { position:absolute; bottom:70px; left:0; right:0; text-align:center; font-size:13px;
      letter-spacing:3px; color:#8A8272; text-transform:uppercase; }
  </style></head><body>
    <div class="frame"></div>
    <div class="center">
      <div class="eyebrow">Manufacturer Presentation</div>
      <h1>Sajaa</h1>
      <div class="sub">Luxury Medical Uniform Collection &mdash; Five Signature Scrub Designs</div>
      <div class="rule"></div>
      <div class="list">
        Onyx Prestige &nbsp;&middot;&nbsp; Sage Serenity &nbsp;&middot;&nbsp; Rose Quartz<br/>
        Midnight Aviator &nbsp;&middot;&nbsp; Ivory Prestige
      </div>
    </div>
    <div class="footer">Front &amp; Back Technical Flats &nbsp;&mdash;&nbsp; Colour Specification &nbsp;&mdash;&nbsp; Construction Notes</div>
  </body></html>`;
}

const outDir = '/home/user/Sajaa/designs';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: PAGE_W, height: PAGE_H }, deviceScaleFactor: 2 });

await page.setContent(coverHTML());
await page.screenshot({ path: `${outDir}/00-cover.png` });

for (let i = 0; i < designs.length; i++) {
  const d = designs[i];
  await page.setContent(pageHTML(d, i, designs.length));
  const fname = `${outDir}/${String(i + 1).padStart(2, '0')}-${d.slug}.png`;
  await page.screenshot({ path: fname });
  console.log('rendered', fname);
}

await browser.close();
console.log('all done');
