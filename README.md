# Algoritmo de Busca Heurística A* (Trabalho IA)

Este repositório contém a implementação de um algoritmo de busca heurística tipo A* (A-estrela), desenvolvido como parte da disciplina de Inteligência Artificial.

---

##  Visão Geral

- **Objetivo**: Implementar o algoritmo A* para encontrar caminhos ótimos em um mapa ou grafo, utilizando heurísticas admissíveis.
- **Idioma / Tecnologias**:
  - `JavaScript` — código-fonte principal
  - `HTML` & `CSS` — interface gráfica / visualização
  - Estrutura do projeto:
    - `AStar.js` — implementação do algoritmo A*
    - `Game.js`, `GameState.js`, `MapGenerator.js`, `MapEditor.js`, `UIManager.js`, `app.js` — lógica do jogo e interface
    - `index.html`, `styles.css` — frontend para visualização
    - `cidadeBarbie.txt` — (explicar o propósito: exemplo de mapa/cidade)

---

##  Estrutura de Arquivos

| Arquivo / Pasta          | Descrição                                               |
|--------------------------|----------------------------------------------------------|
| `AStar.js`               | Lógica do algoritmo A* (cálculo de f(n) = g(n) + h(n))   |
| `Game.js`, `GameState.js`| Gerência do estado do jogo / mundo                      |
| `MapGenerator.js`, `MapEditor.js` | Criação e edição visual do mapa                   |
| `UIManager.js`, `app.js` | Integração da lógica com a interface de usuário         |
| `index.html`, `styles.css` | Interface visual (HTML + estilos CSS)                |
| `cidadeBarbie.txt`       | Mapa ou dados de exemplo utilizados no projeto          |

---

##  Como Executar

1. Clone este repositório:
   ```bash
   git clone https://github.com/RennaSag/Algoritmo-de-busca-Heur-stica-A-.git
   cd Algoritmo-de-busca-Heur-stica-A-
