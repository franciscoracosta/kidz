// Desenhos originais para o puzzle (SVG feito à mão, 400x400).
// Os cãezinhos de resgate e o Aranhito foram inventados para esta app.

const TINTA = '#3b2a55';

const g = (t, conteudo) => `<g transform="${t}">${conteudo}</g>`;

function nuvem(x, y, s = 1) {
  return g(`translate(${x} ${y}) scale(${s})`,
    '<g fill="#fff"><ellipse cx="0" cy="0" rx="34" ry="20"/><ellipse cx="-26" cy="8" rx="22" ry="15"/><ellipse cx="28" cy="8" rx="24" ry="15"/><ellipse cx="2" cy="-12" rx="22" ry="16"/></g>');
}

function sol(x, y, r = 30) {
  let raios = '';
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    raios += `<line x1="${(Math.cos(a) * (r + 8)).toFixed(1)}" y1="${(Math.sin(a) * (r + 8)).toFixed(1)}" x2="${(Math.cos(a) * (r + 22)).toFixed(1)}" y2="${(Math.sin(a) * (r + 22)).toFixed(1)}"/>`;
  }
  return g(`translate(${x} ${y})`,
    `<g stroke="#ffc928" stroke-width="7" stroke-linecap="round">${raios}</g><circle r="${r}" fill="#ffd84d"/>
     <circle cx="-9" cy="-4" r="3.5" fill="${TINTA}"/><circle cx="9" cy="-4" r="3.5" fill="${TINTA}"/>
     <path d="M-10 8 Q0 17 10 8" stroke="${TINTA}" stroke-width="3" fill="none" stroke-linecap="round"/>`);
}

function arvore(x, y, s = 1, cor = '#4cb86a') {
  return g(`translate(${x} ${y}) scale(${s})`,
    `<rect x="-8" y="-10" width="16" height="50" rx="5" fill="#9a6a3e"/>
     <circle cx="0" cy="-35" r="30" fill="${cor}"/><circle cx="-22" cy="-15" r="20" fill="${cor}"/><circle cx="22" cy="-15" r="20" fill="${cor}"/>
     <circle cx="-8" cy="-42" r="5" fill="#ff6f91"/><circle cx="12" cy="-25" r="5" fill="#ff6f91"/><circle cx="-18" cy="-18" r="5" fill="#ff6f91"/>`);
}

function flor(x, y, cor) {
  return g(`translate(${x} ${y})`,
    `<line x1="0" y1="0" x2="0" y2="18" stroke="#2f9e57" stroke-width="3"/>
     <g fill="${cor}"><circle cx="0" cy="-7" r="5"/><circle cx="7" cy="0" r="5"/><circle cx="0" cy="7" r="5"/><circle cx="-7" cy="0" r="5"/></g>
     <circle r="4" fill="#ffd84d"/>`);
}

function estrela(x, y, r, cor) {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    d += `${i ? 'L' : 'M'}${(x + Math.cos(a) * rr).toFixed(1)} ${(y + Math.sin(a) * rr).toFixed(1)} `;
  }
  return `<path d="${d}Z" fill="${cor}"/>`;
}

function roda(x, y, r = 22) {
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${TINTA}"/><circle cx="${x}" cy="${y}" r="${r * 0.45}" fill="#d8d0e6"/>`;
}

/**
 * Um cãozinho sentado, de frente. (0,0) é o centro da cabeça; vai de y=-95 (chapéu)
 * até y=162 (patas).
 */
function cao({ x, y, s = 1, pelo, claro, orelha, orelhas = 'caidas', farda, faixa = '#ffe14d', chapeu, corChapeu, coleira = '#ff5d73', mancha = null }) {
  const escuro = 'rgba(0,0,0,0.18)';
  const orelhasAtras = orelhas === 'bicudas'
    ? `<path d="M-62 -6 L-72 -78 L-22 -48 Z" fill="${orelha}"/><path d="M-56 -20 L-62 -62 L-34 -46 Z" fill="#ffc2cf"/>
       <path d="M62 -6 L72 -78 L22 -48 Z" fill="${orelha}"/><path d="M56 -20 L62 -62 L34 -46 Z" fill="#ffc2cf"/>`
    : '';
  const orelhasFrente = orelhas === 'caidas'
    ? `<ellipse cx="-60" cy="8" rx="20" ry="42" transform="rotate(18 -60 8)" fill="${orelha}"/>
       <ellipse cx="60" cy="8" rx="20" ry="42" transform="rotate(-18 60 8)" fill="${orelha}"/>`
    : '';
  let chapeuSvg = '';
  if (chapeu === 'bombeiro') {
    chapeuSvg = `<path d="M-60 -28 Q-62 -96 0 -98 Q62 -96 60 -28 Z" fill="${corChapeu}"/>
      <path d="M0 -98 L0 -30" stroke="${escuro}" stroke-width="8"/>
      <path d="M-80 -30 Q0 -48 80 -30 Q84 -18 74 -16 Q0 -32 -74 -16 Q-84 -18 -80 -30 Z" fill="${corChapeu}" stroke="${escuro}" stroke-width="3"/>
      <path d="M-18 -90 L18 -90 L22 -56 Q0 -44 -22 -56 Z" fill="#fff" stroke="#f5a623" stroke-width="4"/>
      ${estrela(0, -70, 11, '#ff5d73')}`;
  } else if (chapeu === 'policia') {
    chapeuSvg = `<path d="M-64 -46 Q-70 -96 0 -98 Q70 -96 64 -46 Z" fill="${corChapeu}"/>
      <rect x="-60" y="-54" width="120" height="16" rx="4" fill="${TINTA}"/>
      <path d="M-54 -38 Q0 -14 54 -38 L50 -30 Q0 -10 -50 -30 Z" fill="${TINTA}"/>
      <circle cx="0" cy="-74" r="14" fill="#ffd84d" stroke="#f5a623" stroke-width="3"/>${estrela(0, -74, 9, '#f5a623')}`;
  } else if (chapeu === 'piloto') {
    chapeuSvg = `<path d="M-64 -6 Q-70 -94 0 -96 Q70 -94 64 -6 Q52 -40 0 -44 Q-52 -40 -64 -6 Z" fill="${corChapeu}"/>
      <rect x="-56" y="-62" width="112" height="10" rx="5" fill="${TINTA}"/>
      <circle cx="-24" cy="-58" r="17" fill="#bfe6ff" stroke="${TINTA}" stroke-width="6"/>
      <circle cx="24" cy="-58" r="17" fill="#bfe6ff" stroke="${TINTA}" stroke-width="6"/>
      <circle cx="-29" cy="-63" r="5" fill="#fff"/><circle cx="19" cy="-63" r="5" fill="#fff"/>`;
  }
  const manchaSvg = mancha ? `<ellipse cx="24" cy="-4" rx="22" ry="20" fill="${mancha}"/>` : '';
  return g(`translate(${x} ${y}) scale(${s})`, `
    <path d="M44 132 Q100 124 92 68" stroke="${pelo}" stroke-width="18" fill="none" stroke-linecap="round"/>
    <path d="M-52 150 Q-74 62 -34 40 L34 40 Q74 62 52 150 Z" fill="${pelo}"/>
    <path d="M-46 58 Q0 44 46 58 L54 124 Q0 138 -54 124 Z" fill="${farda}"/>
    <path d="M-50 96 Q0 106 50 96 L52 110 Q0 120 -52 110 Z" fill="${faixa}"/>
    <rect x="-40" y="118" width="26" height="34" rx="10" fill="${pelo}"/><rect x="14" y="118" width="26" height="34" rx="10" fill="${pelo}"/>
    <ellipse cx="-27" cy="152" rx="24" ry="13" fill="${claro}"/><ellipse cx="27" cy="152" rx="24" ry="13" fill="${claro}"/>
    <g stroke="${escuro}" stroke-width="3" stroke-linecap="round"><line x1="-33" y1="148" x2="-33" y2="158"/><line x1="-22" y1="148" x2="-22" y2="158"/><line x1="22" y1="148" x2="22" y2="158"/><line x1="33" y1="148" x2="33" y2="158"/></g>
    ${orelhasAtras}
    <ellipse cx="0" cy="0" rx="64" ry="58" fill="${pelo}"/>
    ${manchaSvg}
    <ellipse cx="0" cy="28" rx="36" ry="26" fill="${claro}"/>
    ${orelhasFrente}
    <ellipse cx="-24" cy="-2" rx="12" ry="14" fill="${TINTA}"/><ellipse cx="24" cy="-2" rx="12" ry="14" fill="${TINTA}"/>
    <circle cx="-20" cy="-7" r="4.5" fill="#fff"/><circle cx="28" cy="-7" r="4.5" fill="#fff"/>
    <circle cx="-44" cy="22" r="9" fill="#ff8fa6" opacity="0.55"/><circle cx="44" cy="22" r="9" fill="#ff8fa6" opacity="0.55"/>
    <ellipse cx="0" cy="16" rx="13" ry="9" fill="${TINTA}"/>
    <path d="M-16 31 Q-8 40 0 31 Q8 40 16 31" stroke="${TINTA}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M-7 36 Q0 52 7 36 Z" fill="#ff7b93"/>
    <rect x="-40" y="54" width="80" height="11" rx="5.5" fill="${coleira}"/>
    <circle cx="0" cy="68" r="9" fill="#ffd84d" stroke="#f5a623" stroke-width="3"/>
    ${chapeuSvg}`);
}

/**
 * O Aranhito: menino super-herói inventado para esta app (cara à mostra,
 * mascarilha verde, capa roxa e uma aranha amiga no peito). (0,0) é o centro da cabeça.
 */
function aranhito({ x, y, s = 1, pose = 'pe' }) {
  const fato = '#2fbf71';
  const roxo = '#7b3fe4';
  const pele = '#ffd2a8';
  const cabeca = `
    <circle r="46" fill="${pele}"/>
    <path d="M-46 -4 Q-50 -52 0 -54 Q50 -52 46 -4 Q40 -30 20 -30 Q24 -42 8 -40 Q0 -50 -10 -38 Q-30 -44 -46 -4 Z" fill="#e0762b"/>
    <path d="M-48 -8 Q0 -26 48 -8 L46 14 Q24 4 0 12 Q-24 4 -46 14 Z" fill="${fato}"/>
    <ellipse cx="-20" cy="2" rx="12" ry="10" fill="#fff"/><ellipse cx="20" cy="2" rx="12" ry="10" fill="#fff"/>
    <circle cx="-18" cy="3" r="6" fill="${TINTA}"/><circle cx="22" cy="3" r="6" fill="${TINTA}"/>
    <circle cx="-16" cy="1" r="2" fill="#fff"/><circle cx="24" cy="1" r="2" fill="#fff"/>
    <circle cx="-30" cy="24" r="7" fill="#ff8fa6" opacity="0.6"/><circle cx="30" cy="24" r="7" fill="#ff8fa6" opacity="0.6"/>
    <path d="M-14 24 Q0 38 14 24" stroke="${TINTA}" stroke-width="3.5" fill="#fff" stroke-linecap="round"/>`;
  // Emblema: uma aranha sorridente dentro de um círculo amarelo.
  const emblema = `<circle cx="0" cy="82" r="20" fill="#ffd84d"/>
    <g stroke="${TINTA}" stroke-width="2.5" stroke-linecap="round" fill="none">
      <path d="M-6 80 L-15 72 M-6 85 L-16 85 M-6 90 L-14 97 M6 80 L15 72 M6 85 L16 85 M6 90 L14 97"/></g>
    <circle cx="0" cy="85" r="8" fill="${TINTA}"/>
    <circle cx="-3" cy="83" r="2" fill="#fff"/><circle cx="3" cy="83" r="2" fill="#fff"/>`;
  const capa = pose === 'balanco'
    ? `<path d="M-30 48 Q-90 110 -120 170 Q-70 150 -40 160 Q-20 120 30 48 Z" fill="${roxo}"/>`
    : `<path d="M-30 46 Q-66 120 -58 190 Q0 176 58 190 Q66 120 30 46 Z" fill="${roxo}"/>`;
  const tronco = `
    <path d="M-38 54 Q-40 44 -28 44 L28 44 Q40 44 38 54 L34 128 L-34 128 Z" fill="${fato}"/>
    ${emblema}
    <rect x="-36" y="116" width="72" height="14" rx="6" fill="#ffd84d"/><rect x="-10" y="114" width="20" height="18" rx="4" fill="#f5a623"/>`;
  const membro = (d, w, cor) => `<path d="${d}" stroke="${cor}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  let bracos;
  let pernas;
  if (pose === 'balanco') {
    bracos = membro('M-30 56 L-46 10 L-40 -44', 22, fato) + `<circle cx="-40" cy="-48" r="14" fill="${pele}"/>`
      + membro('M30 56 L64 70 L88 50', 22, fato) + `<circle cx="92" cy="48" r="14" fill="${pele}"/>`;
    pernas = membro('M-16 128 L-40 168 L-20 200', 26, fato) + `<ellipse cx="-14" cy="204" rx="22" ry="13" transform="rotate(20 -14 204)" fill="${roxo}"/>`
      + membro('M16 128 L30 180 L20 214', 26, fato) + `<ellipse cx="24" cy="218" rx="22" ry="13" fill="${roxo}"/>`;
  } else {
    bracos = membro('M-32 56 L-70 24 L-84 -20', 22, fato) + `<circle cx="-86" cy="-26" r="14" fill="${pele}"/>`
      + membro('M32 56 L52 96 L56 128', 22, fato) + `<circle cx="56" cy="132" r="14" fill="${pele}"/>`;
    pernas = membro('M-16 128 L-22 196', 26, fato) + `<rect x="-40" y="186" width="36" height="24" rx="10" fill="${roxo}"/>`
      + membro('M16 128 L22 196', 26, fato) + `<rect x="4" y="186" width="36" height="24" rx="10" fill="${roxo}"/>`;
  }
  return g(`translate(${x} ${y}) scale(${s})`, `${capa}${pernas}${bracos}${tronco}<rect x="-12" y="40" width="24" height="12" fill="${pele}"/>${cabeca}`);
}

function camiaoBombeiros(x, y) {
  let degraus = '';
  for (let i = 0; i < 7; i++) degraus += `<line x1="${20 + i * 22}" y1="-98" x2="${20 + i * 22}" y2="-82"/>`;
  return g(`translate(${x} ${y})`, `
    <rect x="0" y="-80" width="170" height="80" rx="10" fill="#e8434f"/>
    <rect x="10" y="-66" width="40" height="30" rx="5" fill="#ffe0e5"/><rect x="58" y="-66" width="40" height="30" rx="5" fill="#ffe0e5"/>
    <rect x="0" y="-26" width="170" height="10" fill="#ffd84d"/>
    <path d="M170 -60 L205 -60 Q222 -60 226 -40 L230 -10 L230 0 L170 0 Z" fill="#e8434f"/>
    <path d="M178 -52 L203 -52 Q214 -52 217 -38 L219 -30 L178 -30 Z" fill="#bfe6ff"/>
    <rect x="-6" y="-102" width="168" height="8" rx="4" fill="#d8d0e6"/><rect x="-6" y="-86" width="168" height="8" rx="4" fill="#d8d0e6"/>
    <g stroke="#d8d0e6" stroke-width="6">${degraus}</g>
    <rect x="186" y="-72" width="22" height="12" rx="5" fill="#3fa9f5"/>
    <circle cx="118" cy="-50" r="14" fill="#ffd84d"/><circle cx="118" cy="-50" r="7" fill="#f5a623"/>
    ${roda(40, 2)}${roda(130, 2)}${roda(200, 2)}`);
}

function carroPolicia(x, y) {
  return g(`translate(${x} ${y})`, `
    <path d="M0 -10 Q0 -40 30 -44 L60 -76 Q66 -82 80 -82 L140 -82 Q154 -82 162 -72 L188 -44 Q220 -40 222 -12 L222 0 L0 0 Z" fill="#2f6fd6"/>
    <path d="M70 -72 L104 -72 L104 -46 L46 -46 Z" fill="#bfe6ff"/><path d="M114 -72 L146 -72 L170 -46 L114 -46 Z" fill="#bfe6ff"/>
    <rect x="0" y="-34" width="222" height="12" fill="#fff"/>
    <rect x="86" y="-98" width="22" height="16" rx="5" fill="#ff5d73"/><rect x="112" y="-98" width="22" height="16" rx="5" fill="#3fa9f5"/>
    <g stroke="#ffe14d" stroke-width="4" stroke-linecap="round"><line x1="80" y1="-104" x2="72" y2="-114"/><line x1="140" y1="-104" x2="148" y2="-114"/><line x1="110" y1="-106" x2="110" y2="-118"/></g>
    ${estrela(56, -16, 10, '#ffd84d')}
    ${roda(50, 2)}${roda(172, 2)}`);
}

function helicoptero(x, y, s = 1) {
  return g(`translate(${x} ${y}) scale(${s})`, `
    <path d="M60 -10 L190 -24 L196 -6 L70 18 Z" fill="#7b3fe4"/>
    <path d="M182 -58 L200 -58 L204 -20 L186 -18 Z" fill="#7b3fe4"/>
    <circle cx="196" cy="-38" r="16" fill="none" stroke="${TINTA}" stroke-width="4"/>
    <ellipse cx="0" cy="0" rx="92" ry="64" fill="#9b6bf2"/>
    <path d="M-70 -20 Q-60 -58 -6 -58 Q30 -58 38 -20 Z" fill="#bfe6ff"/>
    <rect x="-8" y="-82" width="16" height="22" fill="${TINTA}"/>
    <rect x="-150" y="-92" width="300" height="12" rx="6" fill="${TINTA}"/>
    <path d="M-60 60 L-70 86 M60 60 L70 86" stroke="${TINTA}" stroke-width="8"/>
    <rect x="-100" y="82" width="200" height="10" rx="5" fill="${TINTA}"/>
    <circle cx="60" cy="10" r="10" fill="#ffd84d"/>`);
}

function predios(cores, janelas = '#fff6c2', y0 = 400) {
  let svg = '';
  let x = -10;
  let i = 0;
  while (x < 410) {
    const w = 52 + ((i * 37) % 30);
    const h = 120 + ((i * 53) % 110);
    svg += `<rect x="${x}" y="${y0 - h}" width="${w}" height="${h}" fill="${cores[i % cores.length]}"/>`;
    for (let jy = y0 - h + 14; jy < y0 - 20; jy += 26) {
      for (let jx = x + 9; jx < x + w - 14; jx += 18) {
        if ((jx * 7 + jy * 3 + i) % 5 !== 0) svg += `<rect x="${jx}" y="${jy}" width="9" height="13" rx="2" fill="${janelas}"/>`;
      }
    }
    x += w + 4;
    i++;
  }
  return svg;
}

const ceu = (id, a, b) => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="400" height="400" fill="url(#${id})"/>`;

const FAISCA = { pelo: '#f0a64a', claro: '#ffe3b8', orelha: '#c97a2b', farda: '#e8434f', faixa: '#ffe14d', chapeu: 'bombeiro', corChapeu: '#ffc928', coleira: '#3fa9f5' };
const TROVAO = { pelo: '#9aa8bd', claro: '#ffffff', orelha: '#7a879c', orelhas: 'bicudas', farda: '#2f6fd6', faixa: '#ffffff', chapeu: 'policia', corChapeu: '#2f6fd6', coleira: '#ffd84d', mancha: '#ffffff' };
const PIPOCA = { pelo: '#f6e6c8', claro: '#ffffff', orelha: '#a5683a', farda: '#2bb673', faixa: '#ffd84d', chapeu: 'piloto', corChapeu: '#a5683a', coleira: '#ff6f91', mancha: '#d9a06a' };

function cenaBombeiro() {
  return `${ceu('c1', '#7cc8ff', '#d6f0ff')}
    ${sol(340, 60)}${nuvem(90, 70)}${nuvem(230, 40, 0.8)}
    <path d="M0 260 Q100 220 200 250 Q300 280 400 240 L400 400 L0 400 Z" fill="#8fd36b"/>
    <path d="M0 300 Q120 280 240 300 Q330 316 400 296 L400 400 L0 400 Z" fill="#6cc05a"/>
    ${arvore(40, 250, 0.9)}
    ${camiaoBombeiros(150, 300)}
    <path d="M232 214 Q300 140 372 170" stroke="#3fa9f5" stroke-width="10" fill="none" stroke-linecap="round" stroke-dasharray="2 16"/>
    ${flor(30, 360, '#ff6f91')}${flor(370, 350, '#b46cf0')}${flor(330, 380, '#ffd84d')}
    ${cao({ x: 110, y: 222, s: 0.78, ...FAISCA })}`;
}

function cenaPolicia() {
  return `${ceu('c2', '#a8dcff', '#e8f6ff')}
    ${nuvem(70, 50, 0.9)}${nuvem(300, 80)}
    ${predios(['#c9b8e8', '#b4d6f0', '#f3c6d2', '#c8e6a0'], '#fff6c2', 300)}
    <rect x="0" y="300" width="400" height="100" fill="#6d6880"/>
    <g fill="#fff">${[20, 100, 180, 260, 340].map((xx) => `<rect x="${xx}" y="346" width="44" height="8" rx="4"/>`).join('')}</g>
    <rect x="0" y="292" width="400" height="10" fill="#d8d0e6"/>
    ${carroPolicia(170, 388)}
    ${cao({ x: 100, y: 200, s: 0.8, ...TROVAO })}`;
}

function cenaHelicoptero() {
  return `${ceu('c3', '#ffd2a6', '#bfe6ff')}
    ${sol(70, 70, 26)}${nuvem(320, 60, 0.9)}${nuvem(60, 300, 0.8)}
    <path d="M0 340 L70 260 L130 320 L210 230 L300 330 L350 280 L400 330 L400 400 L0 400 Z" fill="#9c8fc4"/>
    <path d="M190 252 L210 230 L232 256 L220 250 L208 260 L198 250 Z" fill="#fff"/>
    <path d="M0 370 Q200 330 400 370 L400 400 L0 400 Z" fill="#6cc05a"/>
    <g stroke="${TINTA}" stroke-width="3" fill="none" stroke-linecap="round"><path d="M300 150 q8 -8 16 0 q8 -8 16 0"/><path d="M330 120 q6 -6 12 0 q6 -6 12 0"/></g>
    ${helicoptero(190, 200, 0.95)}
    <clipPath id="vidro"><path d="M-70 -20 Q-60 -58 -6 -58 Q30 -58 38 -20 Z" transform="translate(190 200) scale(0.95)"/></clipPath>
    <g clip-path="url(#vidro)">${cao({ x: 175, y: 186, s: 0.42, ...PIPOCA })}</g>
    <path d="M-70 -20 Q-60 -58 -6 -58 Q30 -58 38 -20 Z" transform="translate(190 200) scale(0.95)" fill="#fff" opacity="0.18"/>`;
}

function cenaEquipa() {
  let arco = '';
  ['#ff5d73', '#ffb03a', '#ffe14d', '#4cd97b', '#3fa9f5', '#a77bf3'].forEach((cor, i) => {
    arco += `<path d="M20 230 A180 170 0 0 1 380 230" stroke="${cor}" stroke-width="12" fill="none" transform="translate(0 ${i * 12})"/>`;
  });
  return `${ceu('c4', '#8fd0ff', '#e6f6ff')}
    ${arco}${nuvem(40, 230, 0.9)}${nuvem(360, 230, 0.9)}
    <rect x="170" y="70" width="60" height="200" fill="#f4f0ff"/>
    <path d="M150 80 L200 30 L250 80 Z" fill="#ff8a5b"/>
    <circle cx="200" cy="120" r="20" fill="#bfe6ff" stroke="${TINTA}" stroke-width="4"/>
    <line x1="200" y1="30" x2="200" y2="6" stroke="${TINTA}" stroke-width="4"/><path d="M200 6 L228 14 L200 22 Z" fill="#4cd97b"/>
    <path d="M0 290 Q200 250 400 290 L400 400 L0 400 Z" fill="#8fd36b"/>
    ${flor(190, 380, '#ff6f91')}${flor(210, 390, '#ffd84d')}
    ${cao({ x: 70, y: 268, s: 0.62, ...FAISCA })}
    ${cao({ x: 200, y: 286, s: 0.62, ...PIPOCA })}
    ${cao({ x: 330, y: 268, s: 0.62, ...TROVAO })}`;
}

function cenaAranhitoCidade() {
  let estrelas = '';
  [[40, 40], [120, 90], [260, 30], [350, 110], [200, 70], [90, 150], [300, 160]].forEach(([xx, yy], i) => {
    estrelas += estrela(xx, yy, 5 + (i % 3) * 2, '#fff6c2');
  });
  return `${ceu('c5', '#2c2160', '#6b4fb8')}
    ${estrelas}
    <circle cx="320" cy="70" r="36" fill="#fff6c2"/><circle cx="306" cy="60" r="7" fill="#efe3a8"/><circle cx="330" cy="86" r="5" fill="#efe3a8"/>
    ${predios(['#3d2f7a', '#4a3b8f', '#35296d'], '#ffd84d', 400)}
    <path d="M0 0 L160 196" stroke="#fff" stroke-width="4"/>
    <path d="M0 40 Q20 30 26 12 M0 80 Q40 60 52 30 M0 120 Q60 90 78 50" stroke="#fff" stroke-width="2" fill="none" opacity="0.8"/>
    ${aranhito({ x: 190, y: 230, s: 0.72, pose: 'balanco' })}`;
}

function cenaAranhitoAmiga() {
  let teia = '';
  for (let i = 0; i <= 6; i++) {
    const a = (i * Math.PI) / 12;
    teia += `<line x1="400" y1="0" x2="${(400 - Math.cos(a) * 190).toFixed(1)}" y2="${(Math.sin(a) * 190).toFixed(1)}"/>`;
  }
  for (const r of [50, 95, 140, 185]) teia += `<path d="M${400 - r} 0 A${r} ${r} 0 0 0 400 ${r}"/>`;
  const amiga = g('translate(300 150)', `
    <line x1="0" y1="-150" x2="0" y2="-30" stroke="#fff" stroke-width="3"/>
    <g stroke="${TINTA}" stroke-width="7" fill="none" stroke-linecap="round">
      <path d="M-20 0 Q-50 -30 -64 -6"/><path d="M-22 10 Q-60 0 -70 24"/><path d="M-20 20 Q-50 30 -56 54"/><path d="M-14 28 Q-30 50 -30 70"/>
      <path d="M20 0 Q50 -30 64 -6"/><path d="M22 10 Q60 0 70 24"/><path d="M20 20 Q50 30 56 54"/><path d="M14 28 Q30 50 30 70"/>
    </g>
    <ellipse cx="0" cy="10" rx="32" ry="36" fill="#ff8a5b"/>
    <circle cx="-12" cy="0" r="11" fill="#fff"/><circle cx="12" cy="0" r="11" fill="#fff"/>
    <circle cx="-10" cy="2" r="5.5" fill="${TINTA}"/><circle cx="14" cy="2" r="5.5" fill="${TINTA}"/>
    <path d="M-10 20 Q0 30 10 20" stroke="${TINTA}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <circle cx="-22" cy="16" r="5" fill="#ff5d73" opacity="0.6"/><circle cx="22" cy="16" r="5" fill="#ff5d73" opacity="0.6"/>`);
  return `${ceu('c6', '#ff9f6b', '#ffe0a8')}
    ${sol(80, 300, 50)}
    ${predios(['#c06a8a', '#a8577a', '#d47f8f'], '#ffe7a8', 400)}
    <g stroke="#fff" stroke-width="2.5" fill="none" opacity="0.9">${teia}</g>
    <rect x="40" y="318" width="240" height="82" fill="#7a3f68"/><rect x="34" y="310" width="252" height="14" rx="4" fill="#5c2c50"/>
    ${amiga}
    ${aranhito({ x: 150, y: 136, s: 0.82, pose: 'pe' })}`;
}

function svgCompleto(corpo) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="800" height="800">${corpo}</svg>`;
}

export const IMAGENS = [
  { id: 'bombeiro', nome: 'Faísca, o bombeiro', fala: 'O Faísca, o cãozinho bombeiro', svg: () => svgCompleto(cenaBombeiro()) },
  { id: 'policia', nome: 'Trovão, o polícia', fala: 'O Trovão, o cãozinho polícia', svg: () => svgCompleto(cenaPolicia()) },
  { id: 'helicoptero', nome: 'Pipoca no helicóptero', fala: 'A Pipoca, a cãozinha piloto do helicóptero', svg: () => svgCompleto(cenaHelicoptero()) },
  { id: 'equipa', nome: 'A equipa de resgate', fala: 'A equipa de cãezinhos de resgate', svg: () => svgCompleto(cenaEquipa()) },
  { id: 'aranhito', nome: 'Aranhito na cidade', fala: 'O Aranhito, o super-herói aranha, na cidade', svg: () => svgCompleto(cenaAranhitoCidade()) },
  { id: 'amiga', nome: 'Aranhito e a Aranha Amiga', fala: 'O Aranhito e a aranha amiga', svg: () => svgCompleto(cenaAranhitoAmiga()) },
];

export function svgParaUrl(svg) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
