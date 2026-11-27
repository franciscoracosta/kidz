# Jogos para crianças 🎈

Uma web app com jogos para crianças, feita para jogar no iPad (e também no telemóvel ou computador). A criança abre a app, vê os jogos disponíveis e escolhe um.

Jogos disponíveis:

- **Jogo do Galo**: 3 em linha num tabuleiro 3x3.
- **5 em Linha**: 5 peças seguidas num tabuleiro 10x10.
- **Pintar**: escolhe-se a cor e a largura do pincel e pinta-se um desenho escolhido ao calhas.
- **Letras**: sai uma letra ao calhas em sombreado e a criança escreve-a por cima. Quando cobre bem a letra ganha uma estrela.
- **Memória**: virar cartas e encontrar os pares (3 níveis, temas ao calhas).
- **Sequências**: descobrir o que vem a seguir numa fila de cores, bichos ou frutas. Sobe de nível sozinho.
- **Sons dos Animais**: ouve-se o som (voz do aparelho) e toca-se no animal certo.
- **Diz uma Palavra**: sai uma letra (B) ou um par de letras (BA) e a criança diz uma palavra que comece assim. Se o aparelho deixar usar o microfone, a app ouve e confirma a palavra; se não, carrega-se em "Já disse!". O botão "Ajuda" mostra exemplos com desenho e lê-os.
- **Adivinha a Palavra**: aparecem as 2 primeiras letras de uma palavra e os outros quadrados escondidos. Carrega-se em "Mais uma letra" para ver a seguinte, até adivinhar. Dá 3 estrelas se adivinhar só com 2 letras. Pode-se dizer a palavra ao microfone ou carregar em "Acertei!".
- **7 Diferenças**: dois desenhos quase iguais (jardim, fundo do mar, espaço ou quinta) e a criança toca nas 7 coisas que mudaram. No nível fácil falta um boneco ou trocou; no difícil também muda de tamanho ou está virado. Há um botão de ajuda.
- **Esconde a Bola**: um quadro cheio de brinquedos. Uma pessoa arrasta a bola para cima do quadro e carrega em Iniciar: a bola fica escondida por baixo de tudo. Depois outra pessoa vai arrastando os brinquedos para o lado até a encontrar. Também dá para ser o iPad a esconder.
- **Leva a Água**: quebra-cabeças de lógica com canos. Toca-se num cano para o rodar e tem de se levar a água da torneira até às flores. São 9 níveis: começa num 3x3 com uma flor e vai até 7x7 com 4 flores e canos a mais para enganar. Sobe de nível a cada 2 puzzles (ou toca-se no nível para escolher). Há um botão de ajuda que acerta um cano.

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
