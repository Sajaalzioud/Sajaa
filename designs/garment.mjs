// Reusable scrub garment flat-sketch SVG geometry (front/back, top/pants).
// Coordinates are hand-authored on a 640-wide canvas per garment view.

export function topFrontSVG({ primary, accent, piping, line, collar, pocket, logo }) {
  const collarPath = collar === 'mandarin'
    ? `<path d="M282,90 Q320,64 358,90" fill="none" stroke="${piping}" stroke-width="9" stroke-linecap="round"/>
       <path d="M282,90 Q320,64 358,90" fill="none" stroke="${line}" stroke-width="1" opacity="0.4"/>`
    : `<path d="M270,75 L320,168 L370,75" fill="none" stroke="${line}" stroke-width="2"/>
       <path d="M270,75 C285,95 305,95 320,168" fill="none" stroke="${piping}" stroke-width="5" stroke-linecap="round"/>
       <path d="M370,75 C355,95 335,95 320,168" fill="none" stroke="${piping}" stroke-width="5" stroke-linecap="round"/>`;

  const neckBottom = collar === 'mandarin' ? 100 : 168;

  const body = `M150,90
    C140,180 140,140 150,90
    L150,90
    C230,72 270,75 270,75
    Q320,${neckBottom} 370,75
    C370,75 410,72 490,90
    C500,140 500,180 500,230
    C498,300 470,360 455,420
    C445,470 480,500 500,560
    C500,580 495,600 485,610
    L155,610
    C145,600 150,580 140,560
    C120,500 155,470 185,420
    C170,360 142,300 140,230
    C140,180 140,140 150,90 Z`;

  const sleeveL = `M150,90
    C80,150 55,220 55,300
    C55,400 42,500 40,590
    L95,590
    C100,520 112,420 115,320
    C118,280 128,255 140,230
    C118,280 145,130 150,90 Z`;

  const sleeveR = `M490,90
    C560,150 585,220 585,300
    C585,400 598,500 600,590
    L545,590
    C540,520 528,420 525,320
    C522,280 512,255 500,230
    C522,280 495,130 490,90 Z`;

  const cuffL = `<path d="M40,585 L95,585" stroke="${line}" stroke-width="1.5" opacity="0.5"/>`;
  const cuffR = `<path d="M545,585 L600,585" stroke="${line}" stroke-width="1.5" opacity="0.5"/>`;

  const seams = `
    <path d="M232,150 C212,300 217,450 232,600" fill="none" stroke="${line}" stroke-width="1.3" opacity="0.45"/>
    <path d="M408,150 C428,300 423,450 408,600" fill="none" stroke="${line}" stroke-width="1.3" opacity="0.45"/>`;

  const vents = `
    <path d="M150,585 L150,608 M140,596 L160,596" stroke="${line}" stroke-width="1.5" opacity="0.5"/>
    <path d="M490,585 L490,608 M480,596 L500,596" stroke="${line}" stroke-width="1.5" opacity="0.5"/>`;

  const pocketShape = pocket === 'besom'
    ? `<path d="M348,208 L432,208" stroke="${line}" stroke-width="4" stroke-linecap="round"/>
       <path d="M348,208 L432,208" stroke="${piping}" stroke-width="1.5"/>`
    : `<path d="M345,205 L435,205 L435,258 C435,270 424,278 390,278 C356,278 345,270 345,258 Z"
         fill="${accent}" stroke="${line}" stroke-width="1.5"/>
       <path d="M353,213 L427,213" stroke="${line}" stroke-width="1" stroke-dasharray="3,3" opacity="0.6"/>`;

  const logoMark = logo
    ? `<g transform="translate(390,182)">
         <circle r="15" fill="none" stroke="${piping}" stroke-width="2"/>
         <text x="0" y="7" font-family="Georgia, 'Times New Roman', serif" font-size="18" font-style="italic"
           text-anchor="middle" fill="${piping}">S</text>
       </g>`
    : '';

  return `<svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg">
    <path d="${sleeveL}" fill="${primary}" stroke="${line}" stroke-width="2"/>
    <path d="${sleeveR}" fill="${primary}" stroke="${line}" stroke-width="2"/>
    ${cuffL}${cuffR}
    <path d="${body}" fill="${primary}" stroke="${line}" stroke-width="2.2"/>
    ${seams}
    ${collarPath}
    ${pocketShape}
    ${logoMark}
    ${vents}
  </svg>`;
}

export function topBackSVG({ primary, piping, line }) {
  const body = `M150,90
    C140,180 140,140 150,90
    C230,72 270,68 320,68
    C370,68 410,72 490,90
    C500,140 500,180 500,230
    C498,300 470,360 455,420
    C445,470 480,500 500,560
    C500,580 495,600 485,610
    L155,610
    C145,600 150,580 140,560
    C120,500 155,470 185,420
    C170,360 142,300 140,230
    C140,180 140,140 150,90 Z`;

  const sleeveL = `M150,90
    C80,150 55,220 55,300
    C55,400 42,500 40,590
    L95,590
    C100,520 112,420 115,320
    C118,280 128,255 140,230
    C118,280 145,130 150,90 Z`;

  const sleeveR = `M490,90
    C560,150 585,220 585,300
    C585,400 598,500 600,590
    L545,590
    C540,520 528,420 525,320
    C522,280 512,255 500,230
    C522,280 495,130 490,90 Z`;

  const yoke = `M150,135 C230,168 410,168 490,135` ;
  const centerBack = `M320,150 L320,608`;
  const darts = `
    <path d="M255,330 C250,380 253,430 258,470" fill="none" stroke="${line}" stroke-width="1.2" opacity="0.4"/>
    <path d="M385,330 C390,380 387,430 382,470" fill="none" stroke="${line}" stroke-width="1.2" opacity="0.4"/>`;
  const vents = `
    <path d="M150,585 L150,608 M140,596 L160,596" stroke="${line}" stroke-width="1.5" opacity="0.5"/>
    <path d="M490,585 L490,608 M480,596 L500,596" stroke="${line}" stroke-width="1.5" opacity="0.5"/>`;

  return `<svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg">
    <path d="${sleeveL}" fill="${primary}" stroke="${line}" stroke-width="2"/>
    <path d="${sleeveR}" fill="${primary}" stroke="${line}" stroke-width="2"/>
    <path d="${body}" fill="${primary}" stroke="${line}" stroke-width="2.2"/>
    <path d="${yoke}" fill="none" stroke="${piping}" stroke-width="1.6" opacity="0.85"/>
    <path d="${centerBack}" fill="none" stroke="${line}" stroke-width="1" stroke-dasharray="4,4" opacity="0.4"/>
    ${darts}
    ${vents}
  </svg>`;
}

export function pantsFrontSVG({ primary, accent, piping, line, cargo }) {
  const waistband = `M175,40 L465,40 C475,40 480,46 480,56 L480,88 C480,96 474,100 465,100 L175,100 C166,100 160,96 160,88 L160,56 C160,46 165,40 175,40 Z`;

  const legs = `M162,98
    C150,150 140,210 148,270
    C152,300 165,318 190,330
    C220,335 300,338 320,340
    C340,338 420,335 450,330
    C475,318 488,300 492,270
    C500,210 490,150 478,98
    C440,108 380,112 320,112
    C260,112 200,108 162,98 Z`;

  const leftLeg = `M255,335
    C240,450 232,600 228,750
    C226,830 224,900 222,955
    L285,955
    C288,900 292,830 296,750
    C300,600 305,450 315,338
    C295,340 270,338 255,335 Z`;

  const rightLeg = `M385,335
    C400,450 408,600 412,750
    C414,830 416,900 418,955
    L355,955
    C352,900 348,830 344,750
    C340,600 335,450 325,338
    C345,340 370,338 385,335 Z`;

  const inseams = `
    <path d="M296,345 C300,500 302,650 300,800" fill="none" stroke="${line}" stroke-width="1.2" opacity="0.4"/>
    <path d="M344,345 C340,500 338,650 340,800" fill="none" stroke="${line}" stroke-width="1.2" opacity="0.4"/>`;

  const pocketSeams = `
    <path d="M172,108 C185,140 205,165 235,180" fill="none" stroke="${line}" stroke-width="1.4" opacity="0.5"/>
    <path d="M468,108 C455,140 435,165 405,180" fill="none" stroke="${line}" stroke-width="1.4" opacity="0.5"/>`;

  const drawstring = `
    <path d="M270,70 C290,85 350,85 370,70" fill="none" stroke="${piping}" stroke-width="2"/>
    <circle cx="270" cy="70" r="3" fill="${line}" opacity="0.6"/>
    <circle cx="370" cy="70" r="3" fill="${line}" opacity="0.6"/>
    <path d="M300,80 L295,95 M340,80 L345,95" stroke="${piping}" stroke-width="2" stroke-linecap="round"/>`;

  const hemCuffs = `
    <path d="M222,955 L285,955" stroke="${line}" stroke-width="1.5" opacity="0.6"/>
    <path d="M355,955 L418,955" stroke="${line}" stroke-width="1.5" opacity="0.6"/>`;

  const cargoPocket = cargo
    ? `<g>
        <path d="M340,420 L430,420 L430,530 L340,530 Z" fill="${accent}" stroke="${line}" stroke-width="1.5"/>
        <path d="M340,448 L430,448" stroke="${line}" stroke-width="1" opacity="0.55"/>
        <path d="M368,420 L368,448 M402,420 L402,448" stroke="${line}" stroke-width="1" opacity="0.45"/>
        <circle cx="385" cy="434" r="3" fill="${line}" opacity="0.6"/>
      </g>`
    : '';

  return `<svg viewBox="0 0 640 980" xmlns="http://www.w3.org/2000/svg">
    <path d="${leftLeg}" fill="${primary}" stroke="${line}" stroke-width="2"/>
    <path d="${rightLeg}" fill="${primary}" stroke="${line}" stroke-width="2"/>
    <path d="${legs}" fill="${primary}" stroke="${line}" stroke-width="2"/>
    <path d="${waistband}" fill="${accent}" stroke="${line}" stroke-width="1.8"/>
    ${drawstring}
    ${pocketSeams}
    ${inseams}
    ${cargoPocket}
    ${hemCuffs}
  </svg>`;
}

export function pantsBackSVG({ primary, accent, piping, line }) {
  const waistband = `M175,40 L465,40 C475,40 480,46 480,56 L480,88 C480,96 474,100 465,100 L175,100 C166,100 160,96 160,88 L160,56 C160,46 165,40 175,40 Z`;

  const legs = `M162,98
    C150,150 140,210 148,270
    C152,300 165,318 190,330
    C220,335 300,338 320,340
    C340,338 420,335 450,330
    C475,318 488,300 492,270
    C500,210 490,150 478,98
    C440,108 380,112 320,112
    C260,112 200,108 162,98 Z`;

  const leftLeg = `M255,335
    C240,450 232,600 228,750
    C226,830 224,900 222,955
    L285,955
    C288,900 292,830 296,750
    C300,600 305,450 315,338
    C295,340 270,338 255,335 Z`;

  const rightLeg = `M385,335
    C400,450 408,600 412,750
    C414,830 416,900 418,955
    L355,955
    C352,900 348,830 344,750
    C340,600 335,450 325,338
    C345,340 370,338 385,335 Z`;

  const yoke = `M165,105 C230,130 410,130 475,105`;
  const centerBack = `M320,112 C318,220 320,280 320,340`;
  const inseams = `
    <path d="M296,345 C300,500 302,650 300,800" fill="none" stroke="${line}" stroke-width="1.2" opacity="0.4"/>
    <path d="M344,345 C340,500 338,650 340,800" fill="none" stroke="${line}" stroke-width="1.2" opacity="0.4"/>`;
  const elastic = `<path d="M168,70 L472,70" stroke="${line}" stroke-width="1" stroke-dasharray="5,4" opacity="0.4"/>`;
  const hemCuffs = `
    <path d="M222,955 L285,955" stroke="${line}" stroke-width="1.5" opacity="0.6"/>
    <path d="M355,955 L418,955" stroke="${line}" stroke-width="1.5" opacity="0.6"/>`;

  return `<svg viewBox="0 0 640 980" xmlns="http://www.w3.org/2000/svg">
    <path d="${leftLeg}" fill="${primary}" stroke="${line}" stroke-width="2"/>
    <path d="${rightLeg}" fill="${primary}" stroke="${line}" stroke-width="2"/>
    <path d="${legs}" fill="${primary}" stroke="${line}" stroke-width="2"/>
    <path d="${waistband}" fill="${accent}" stroke="${line}" stroke-width="1.8"/>
    ${elastic}
    <path d="${yoke}" fill="none" stroke="${piping}" stroke-width="1.6" opacity="0.85"/>
    <path d="${centerBack}" fill="none" stroke="${line}" stroke-width="1" stroke-dasharray="4,4" opacity="0.4"/>
    ${inseams}
    ${hemCuffs}
  </svg>`;
}
