// Regras do "Esconde a Bola", sem nada de ecrã.
//
// Tudo é medido em "quadrados": o quadro do meio vai de 0 a 1 nos dois eixos.
// Um objeto pode estar fora do quadro (x < 0 ou x > 1) quando é arrastado para o lado.

export const OBJETOS = ['🧸', '🚗', '📦', '🧱', '📚', '🦆', '🎁', '👟', '🧦', '🥁', '🎈', '🧩',
  '🦖', '🚂', '🍎', '🎒', '🐻', '🍌', '🎩', '🚜', '🪀', '🦒', '🍉', '🏰', '🛴'];

export const BOLA = '⚽';

/** Tamanho (lado da caixa) de cada objeto e da bola, em quadrados. */
export const TAM_OBJETO = 0.26;
export const TAM_BOLA = 0.15;

/** Raio do desenho dentro da caixa: os emojis não enchem a caixa toda. */
export const RAIO_OBJETO = TAM_OBJETO * 0.42;
export const RAIO_BOLA = TAM_BOLA * 0.46;

/** Quanto da bola tem de se ver para contar como encontrada. */
export const VISIVEL_PARA_ACHAR = 0.55;

export const NIVEIS = [
  { id: 1, nome: 'Poucas coisas', grelha: 4, pilha: 2 },
  { id: 2, nome: 'Muitas coisas', grelha: 5, pilha: 3 },
  { id: 3, nome: 'Montanha', grelha: 5, pilha: 6 },
];

/** Pontos dentro do círculo da bola, usados para ver quanto dela se vê. */
const AMOSTRAS = (() => {
  const pts = [];
  const n = 9;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const dx = (i + 0.5) / n * 2 - 1;
      const dy = (j + 0.5) / n * 2 - 1;
      if (dx * dx + dy * dy <= 1) pts.push([dx, dy]);
    }
  }
  return pts;
})();

function baralhar(lista, rng) {
  const a = lista.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Enche o quadro de objetos: uma grelha com cada objeto um pouco fora do sítio
 * e rodado, para parecer um monte de brinquedos.
 */
export function encherQuadro(nivel = 1, rng = Math.random) {
  const { grelha } = NIVEIS[nivel - 1] || NIVEIS[0];
  const figuras = baralhar(OBJETOS, rng);
  const passo = 1 / grelha;
  const objetos = [];
  for (let r = 0; r < grelha; r++) {
    for (let c = 0; c < grelha; c++) {
      const solto = passo * 0.22;
      objetos.push({
        id: objetos.length,
        emoji: figuras[objetos.length % figuras.length],
        x: dentro((c + 0.5) * passo + (rng() * 2 - 1) * solto),
        y: dentro((r + 0.5) * passo + (rng() * 2 - 1) * solto),
        rot: Math.round((rng() * 2 - 1) * 25),
      });
    }
  }
  return objetos;
}

/** Mantém o centro de um objeto dentro do quadro. */
function dentro(v) {
  const m = TAM_OBJETO * 0.4;
  return Math.min(1 - m, Math.max(m, v));
}

export function bolaNoQuadro(bola) {
  return bola.x >= 0 && bola.x <= 1 && bola.y >= 0 && bola.y <= 1;
}

function tapa(obj, px, py) {
  const dx = px - obj.x;
  const dy = py - obj.y;
  return dx * dx + dy * dy <= RAIO_OBJETO * RAIO_OBJETO;
}

/** Que parte da bola se vê (0 = toda tapada, 1 = toda à vista). */
export function parteVisivel(bola, objetos) {
  let vistos = 0;
  for (const [dx, dy] of AMOSTRAS) {
    const px = bola.x + dx * RAIO_BOLA;
    const py = bola.y + dy * RAIO_BOLA;
    if (!objetos.some((o) => tapa(o, px, py))) vistos++;
  }
  return vistos / AMOSTRAS.length;
}

export function encontrou(bola, objetos) {
  return parteVisivel(bola, objetos) >= VISIVEL_PARA_ACHAR;
}

/**
 * Esconde a bola: mexe um pouco todos os objetos (para não se saber onde ela
 * ficou) e depois empilha alguns por cima dela até ficar toda tapada.
 * Devolve os objetos na nova ordem: o último é o que fica por cima.
 */
export function esconder(bola, objetos, nivel = 1, rng = Math.random) {
  const { pilha } = NIVEIS[nivel - 1] || NIVEIS[0];
  const mexidos = objetos.map((o) => ({
    ...o,
    x: dentro(o.x + (rng() * 2 - 1) * 0.04),
    y: dentro(o.y + (rng() * 2 - 1) * 0.04),
    rot: o.rot + Math.round((rng() * 2 - 1) * 15),
  }));
  // Os que ficam por cima da bola são os mais longe dela (assim o resto do quadro não fica vazio por baixo).
  const porDistancia = mexidos
    .map((o) => ({ o, d: (o.x - bola.x) ** 2 + (o.y - bola.y) ** 2 }))
    .sort((a, b) => a.d - b.d);
  const pilhaObjs = [];
  const folga = RAIO_OBJETO - RAIO_BOLA;
  for (let k = 0; k < pilha && k < porDistancia.length; k++) {
    const o = porDistancia[porDistancia.length - 1 - k].o;
    // Os primeiros tapam a bola de certeza; os outros ficam meio por cima, como num monte.
    const raio = k === 0 ? folga * 0.6 : RAIO_OBJETO * (0.4 + rng() * 0.5);
    const ang = rng() * Math.PI * 2;
    o.x = dentro(bola.x + Math.cos(ang) * raio);
    o.y = dentro(bola.y + Math.sin(ang) * raio);
    pilhaObjs.push(o);
  }
  let resto = mexidos.filter((o) => !pilhaObjs.includes(o));
  // Montes de enganar noutros sítios, para o monte da bola não dar nas vistas.
  const enganos = [];
  const quantosMontes = resto.length >= 8 ? 2 : resto.length >= 5 ? 1 : 0;
  for (let m = 0; m < quantosMontes; m++) {
    let c = null;
    for (let t = 0; t < 30 && !c; t++) {
      const p = sitioAoCalhas(rng);
      const longe = (q) => (p.x - q.x) ** 2 + (p.y - q.y) ** 2 > 0.33 ** 2;
      if (longe(bola) && enganos.every((e) => longe(e.c))) c = p;
    }
    if (!c) break;
    const perto = resto
      .filter((o) => !enganos.some((e) => e.objs.includes(o)))
      .sort((a, b) => ((a.x - c.x) ** 2 + (a.y - c.y) ** 2) - ((b.x - c.x) ** 2 + (b.y - c.y) ** 2))
      .slice(0, Math.min(pilha, 3));
    for (const o of perto) {
      const ang = rng() * Math.PI * 2;
      const raio = RAIO_OBJETO * (0.2 + rng() * 0.6);
      o.x = dentro(c.x + Math.cos(ang) * raio);
      o.y = dentro(c.y + Math.sin(ang) * raio);
    }
    enganos.push({ c, objs: perto });
  }
  const deEnganar = enganos.flatMap((e) => e.objs);
  resto = [...resto.filter((o) => !deEnganar.includes(o)), ...deEnganar];
  // Se mesmo assim se vir um bocadinho (bola encostada à borda), põe mais um por cima.
  const ordem = () => [...resto, ...pilhaObjs.slice().reverse()];
  let guarda = 0;
  while (parteVisivel(bola, ordem()) > 0 && guarda++ < 20) {
    const o = resto.length ? resto.pop() : pilhaObjs[pilhaObjs.length - 1];
    o.x = bola.x;
    o.y = bola.y;
    if (!pilhaObjs.includes(o)) pilhaObjs.push(o);
  }
  return ordem();
}

/** Sítio ao calhas para o iPad esconder a bola (longe das bordas). */
export function sitioAoCalhas(rng = Math.random) {
  const m = 0.18;
  return { x: m + rng() * (1 - 2 * m), y: m + rng() * (1 - 2 * m) };
}

/** Quando se larga a bola no quadro, fica toda lá dentro (não pendurada na borda). */
export function pousarBola(bola) {
  const m = RAIO_BOLA + 0.01;
  return { x: Math.min(1 - m, Math.max(m, bola.x)), y: Math.min(1 - m, Math.max(m, bola.y)) };
}
