// Desenhos para pintar: só contornos, num quadrado de 400x400.
// Para acrescentar um, basta juntar uma entrada com nome e o SVG (sem a tag <svg>).

export const DESENHOS = [
  {
    nome: 'Casa',
    svg: `
      <path d="M70 195 L200 80 L330 195"/>
      <path d="M260 145 V105 H290 V172"/>
      <rect x="90" y="190" width="220" height="160"/>
      <rect x="175" y="270" width="50" height="80" rx="6"/>
      <circle cx="215" cy="312" r="4"/>
      <rect x="110" y="220" width="45" height="40"/><path d="M132 220 V260 M110 240 H155"/>
      <rect x="245" y="220" width="45" height="40"/><path d="M267 220 V260 M245 240 H290"/>
      <path d="M20 350 H380"/>
      <circle cx="350" cy="55" r="25"/>`,
  },
  {
    nome: 'Sol',
    svg: `
      <circle cx="200" cy="200" r="80"/>
      <path d="M300 200 L350 200 M271 271 L306 306 M200 300 L200 350 M129 271 L94 306 M100 200 L50 200 M129 129 L94 94 M200 100 L200 50 M271 129 L306 94"/>
      <circle cx="172" cy="185" r="9"/><circle cx="228" cy="185" r="9"/>
      <path d="M165 220 Q200 255 235 220"/>`,
  },
  {
    nome: 'Peixe',
    svg: `
      <ellipse cx="180" cy="200" rx="110" ry="70"/>
      <path d="M288 200 L360 140 L360 260 Z"/>
      <circle cx="120" cy="185" r="12"/>
      <path d="M90 225 Q110 240 130 230"/>
      <path d="M170 135 Q200 90 240 140"/>
      <path d="M180 200 Q205 225 180 250"/>
      <circle cx="60" cy="110" r="12"/><circle cx="40" cy="70" r="8"/><circle cx="70" cy="40" r="6"/>`,
  },
  {
    nome: 'Flor',
    svg: `
      <g transform="rotate(0 200 150)"><ellipse cx="200" cy="80" rx="30" ry="36"/></g>
      <g transform="rotate(60 200 150)"><ellipse cx="200" cy="80" rx="30" ry="36"/></g>
      <g transform="rotate(120 200 150)"><ellipse cx="200" cy="80" rx="30" ry="36"/></g>
      <g transform="rotate(180 200 150)"><ellipse cx="200" cy="80" rx="30" ry="36"/></g>
      <g transform="rotate(240 200 150)"><ellipse cx="200" cy="80" rx="30" ry="36"/></g>
      <g transform="rotate(300 200 150)"><ellipse cx="200" cy="80" rx="30" ry="36"/></g>
      <circle cx="200" cy="150" r="34"/>
      <path d="M200 222 V360"/>
      <path d="M200 300 Q150 250 120 280 Q150 320 200 300"/>
      <path d="M200 280 Q250 230 280 260 Q250 300 200 280"/>
      <path d="M40 360 H360"/>`,
  },
  {
    nome: 'Gato',
    svg: `
      <path d="M130 120 L125 45 L185 90"/>
      <path d="M270 120 L275 45 L215 90"/>
      <circle cx="200" cy="170" r="85"/>
      <ellipse cx="168" cy="155" rx="12" ry="16"/><ellipse cx="232" cy="155" rx="12" ry="16"/>
      <path d="M190 190 L210 190 L200 202 Z"/>
      <path d="M200 202 Q190 220 175 212 M200 202 Q210 220 225 212"/>
      <path d="M150 195 L95 185 M150 205 L95 215 M250 195 L305 185 M250 205 L305 215"/>
      <ellipse cx="200" cy="320" rx="90" ry="55"/>
      <path d="M288 325 Q350 320 345 260 Q342 235 325 245"/>`,
  },
  {
    nome: 'Carro',
    svg: `
      <path d="M50 270 V220 Q50 200 80 200 H120 L160 140 H270 L320 200 H340 Q360 200 360 220 V270 H330 A40 40 0 0 0 250 270 H160 A40 40 0 0 0 80 270 Z"/>
      <path d="M135 200 L168 155 H215 V200 Z"/>
      <path d="M230 155 H265 L300 200 H230 Z"/>
      <circle cx="120" cy="270" r="30"/><circle cx="120" cy="270" r="10"/>
      <circle cx="290" cy="270" r="30"/><circle cx="290" cy="270" r="10"/>
      <path d="M335 220 H355"/>
      <path d="M20 305 H380"/>`,
  },
  {
    nome: 'Borboleta',
    svg: `
      <ellipse cx="200" cy="200" rx="12" ry="70"/>
      <circle cx="200" cy="118" r="16"/>
      <path d="M193 106 Q175 60 150 55 M207 106 Q225 60 250 55"/>
      <circle cx="146" cy="53" r="7"/><circle cx="254" cy="53" r="7"/>
      <path d="M188 175 C120 60 30 100 70 180 C90 220 160 210 188 200"/>
      <path d="M212 175 C280 60 370 100 330 180 C310 220 240 210 212 200"/>
      <path d="M188 215 C130 220 80 300 140 312 C180 318 188 260 188 240"/>
      <path d="M212 215 C270 220 320 300 260 312 C220 318 212 260 212 240"/>
      <circle cx="115" cy="150" r="18"/><circle cx="285" cy="150" r="18"/>`,
  },
  {
    nome: 'Árvore',
    svg: `
      <path d="M110 250 A50 50 0 0 1 120 160 A60 60 0 0 1 200 100 A60 60 0 0 1 280 160 A50 50 0 0 1 290 250 Z"/>
      <path d="M180 360 V250 M220 360 V250"/>
      <path d="M200 300 L180 285"/>
      <circle cx="160" cy="190" r="14"/><circle cx="235" cy="160" r="14"/><circle cx="250" cy="220" r="14"/><circle cx="185" cy="225" r="14"/>
      <path d="M20 360 H380"/>
      <path d="M60 360 Q65 335 75 360 M320 360 Q328 330 340 360"/>`,
  },
  {
    nome: 'Foguetão',
    svg: `
      <path d="M200 40 C250 90 255 180 250 280 H150 C145 180 150 90 200 40 Z"/>
      <circle cx="200" cy="150" r="28"/>
      <path d="M152 215 L105 300 L150 280"/>
      <path d="M248 215 L295 300 L250 280"/>
      <path d="M200 280 V300"/>
      <path d="M165 280 Q200 380 235 280"/>
      <path d="M50 80 L60 100 L80 102 L64 115 L70 135 L50 124 L30 135 L36 115 L20 102 L40 100 Z"/>
      <circle cx="340" cy="90" r="8"/><circle cx="330" cy="300" r="6"/><circle cx="70" cy="320" r="7"/>`,
  },
  {
    nome: 'Gelado',
    svg: `
      <path d="M140 200 L200 370 L260 200"/>
      <path d="M140 200 A60 60 0 1 1 260 200 Z"/>
      <path d="M160 245 H240 M172 290 H228 M185 330 H215"/>
      <circle cx="200" cy="124" r="14"/>
      <path d="M200 110 Q205 90 225 85"/>
      <path d="M165 185 Q175 200 185 185 Q195 200 205 185"/>`,
  },
  {
    nome: 'Estrela',
    svg: `
      <polygon points="200,65 236,165 343,169 259,234 288,336 200,277 112,336 141,234 57,169 164,165"/>
      <circle cx="182" cy="200" r="7"/><circle cx="218" cy="200" r="7"/>
      <path d="M180 228 Q200 248 220 228"/>`,
  },
];

/** Escolhe um desenho ao calhas, diferente do atual. */
export function desenhoAoCalhas(atual = -1, random = Math.random) {
  if (DESENHOS.length < 2) return 0;
  let i = atual;
  while (i === atual) i = Math.floor(random() * DESENHOS.length);
  return i;
}
