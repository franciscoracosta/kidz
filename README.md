# Jogos para crianças 🎈

Uma web app com jogos para crianças, feita para jogar no iPad (e também no telemóvel ou computador). A criança abre a app, vê os jogos disponíveis e escolhe um.

Jogos disponíveis:

- **Jogo do Galo**: 3 em linha num tabuleiro 3x3.
- **5 em Linha**: 5 peças seguidas num tabuleiro 10x10.
- **Pintar**: escolhe-se a cor e a largura do pincel e pinta-se um desenho escolhido ao calhas.

O Jogo do Galo e o 5 em Linha dão para jogar a dois no mesmo aparelho ou contra o computador (nível fácil ou difícil). Os desenhos para pintar estão em `games/pintar/desenhos.js` e é fácil acrescentar mais.

## Como experimentar

Não há nada para instalar: são só ficheiros HTML, CSS e JavaScript.

```bash
npm start        # abre um servidor em http://localhost:8080
npm test         # testa as regras dos jogos
```

O `npm start` também mostra um endereço para abrir no iPad, se estiver na mesma rede Wi-Fi.

### Pôr no ecrã principal do iPad

Depois de publicada (por exemplo no GitHub Pages, Netlify ou Vercel), abre a app no Safari, toca em **Partilhar → Adicionar ao ecrã principal**. Abre em ecrã inteiro, como uma app, e funciona sem internet depois da primeira visita.

## Estrutura

```
index.html            página principal
css/style.css         aspeto de toda a app
js/app.js             ecrã inicial e navegação entre jogos
js/games.js           lista de jogos (é aqui que se acrescentam novos)
js/ui.js              peças partilhadas: sons, confetis, escolha de modo, placar
games/<jogo>/         cada jogo na sua pasta
  <jogo>.js           o ecrã do jogo
  logic.js            as regras, sem nada de ecrã (testáveis)
tests/                testes das regras
sw.js                 guarda a app para funcionar offline
```

## Acrescentar um jogo novo

1. Cria `games/meujogo/meujogo.js` com uma função `mount(root, ctx)` que desenha o jogo dentro de `root` e devolve uma função de limpeza. O `ctx` traz `sound`, `celebrate`, `chooseMode`, `scoreboard` e `el` (vê `games/galo/galo.js`).
2. Acrescenta uma entrada a `js/games.js` com título, emoji, descrição, cor e etiqueta (por exemplo "Estratégia", "Aprender", "Memória").
3. Acrescenta os ficheiros novos à lista em `sw.js` e sobe a `VERSION`.
