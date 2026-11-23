// Regras do jogo das 7 diferenças (sem DOM).
//
// Gera um desenho com bonecos (emojis) espalhados e uma cópia com 7 coisas
// mudadas. As coordenadas estão num quadro de LARGURA x ALTURA.

export const LARGURA = 400;
export const ALTURA = 300;
export const TOTAL_DIFERENCAS = 7;

export const TEMAS = [
  { nome: 'Jardim', ceu: '#bfe6ff', chao: '#9ee07a', bonecos: ['🌳', '🌷', '🌻', '🐝', '🦋', '🐞', '🐌', '🍄', '🐦', '🐇', '🌼', '🐿️', '🐸', '🐛'] },
  { nome: 'Fundo do mar', ceu: '#7fd3f7', chao: '#f3dc9b', bonecos: ['🐟', '🐠', '🐡', '🦀', '🐙', '🐚', '🐬', '🐳', '🪸', '🐢', '🦑', '🦈', '🦞', '🪼'] },
  { nome: 'Espaço', ceu: '#2a2350', chao: '#4a3f7a', bonecos: ['🚀', '🪐', '🌙', '⭐', '👽', '🛸', '☄️', '🌍', '🛰️', '🌟', '👨‍🚀', '☀️', '🔭', '🌑'] },
  { nome: 'Quinta', ceu: '#cdeeff', chao: '#c8e07a', bonecos: ['🐮', '🐷', '🐔', '🐑', '🐴', '🚜', '🌾', '🏠', '🐶', '🐱', '🦆', '🌽', '🐣', '🐐'] },
];

export const NIVEIS = [
  { id: 'facil', nome: 'Fácil', emoji: '🐣', tipos: ['falta', 'troca'] },
  { id: 'dificil', nome: 'Difícil', emoji: '🦉', tipos: ['falta', 'troca', 'tamanho', 'roda'] },
];

const COLUNAS = 5;
const LINHAS = 3;

const pick = (lista, random) => lista[Math.floor(random() * lista.length)];

export function baralhar(lista, random = Math.random) {
  const a = lista.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Cria um desafio. Devolve { tema, esquerda, direita, diferencas }.
 * `esquerda` e `direita` são listas de bonecos { id, emoji, x, y, tamanho, rodar }.
 * Na direita, um boneco que falta não aparece. `diferencas` é a lista de
 * { id, tipo, x, y, raio } onde se pode tocar para a encontrar.
 */
export function criarDesafio(nivel, random = Math.random, tema = pick(TEMAS, random)) {
  const cfg = typeof nivel === 'object' ? nivel : NIVEIS.find((n) => n.id === nivel) || NIVEIS[0];
  const cw = LARGURA / COLUNAS;
  const ch = ALTURA / LINHAS;
  const esquerda = [];
  for (let l = 0; l < LINHAS; l++) {
    for (let c = 0; c < COLUNAS; c++) {
      const tamanho = 34 + Math.floor(random() * 14);
      const folga = (cw - tamanho) / 2 - 2;
      esquerda.push({
        id: esquerda.length,
        emoji: pick(tema.bonecos, random),
        x: Math.round(c * cw + cw / 2 + (random() * 2 - 1) * folga),
        y: Math.round(l * ch + ch / 2 + (random() * 2 - 1) * (ch - tamanho) / 2.4),
        tamanho,
        rodar: 0,
      });
    }
  }

  const escolhidos = baralhar(esquerda.map((b) => b.id), random).slice(0, TOTAL_DIFERENCAS);
  const tipos = cfg.tipos;
  const mudancas = new Map();
  escolhidos.forEach((id, i) => {
    // Garante que aparecem todos os tipos do nível antes de repetir.
    const tipo = i < tipos.length ? tipos[i] : pick(tipos, random);
    mudancas.set(id, tipo);
  });

  const direita = [];
  const diferencas = [];
  for (const b of esquerda) {
    const tipo = mudancas.get(b.id);
    if (tipo) diferencas.push({ id: b.id, tipo, x: b.x, y: b.y, raio: Math.max(30, b.tamanho * 0.85) });
    if (tipo === 'falta') continue;
    const novo = { ...b };
    if (tipo === 'troca') novo.emoji = pick(tema.bonecos.filter((e) => e !== b.emoji), random);
    if (tipo === 'tamanho') novo.tamanho = b.tamanho >= 40 ? Math.round(b.tamanho * 0.6) : Math.round(b.tamanho * 1.5);
    if (tipo === 'roda') novo.rodar = pick([90, 180, -90], random);
    direita.push(novo);
  }
  return { tema, esquerda, direita, diferencas };
}

/** Que diferença (ainda por encontrar) fica onde se tocou. Devolve o id ou null. */
export function diferencaEm(desafio, x, y, encontradas = new Set()) {
  let melhor = null;
  let melhorDist = Infinity;
  for (const d of desafio.diferencas) {
    if (encontradas.has(d.id)) continue;
    const dist = Math.hypot(d.x - x, d.y - y);
    if (dist <= d.raio && dist < melhorDist) {
      melhor = d.id;
      melhorDist = dist;
    }
  }
  return melhor;
}

/** Estrelas no fim: menos enganos e ajudas, mais estrelas. */
export function estrelas(enganos, ajudas) {
  const pontos = enganos + ajudas * 2;
  if (pontos <= 2) return 3;
  if (pontos <= 6) return 2;
  return 1;
}
