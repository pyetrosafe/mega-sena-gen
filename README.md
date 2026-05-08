# mega-sena-gen

Gerador de combinações para a Mega Sena com sincronização de estatísticas históricas.

## Visão geral
Projeto simples em HTML/JS que gera combinações de números para a Mega Sena. Possui um script Node (`sync-mega.js`) que sincroniza as estatísticas de ocorrência de cada número a partir de uma API pública e grava em `mega-sena-stats.json`.

## Requisitos
- Node.js v14+ (recomendado)
- npm

## Scripts úteis (package.json)
- `npm run sync` — sincroniza estatísticas consultando a API e atualiza `mega-sena-stats.json`.
- `npm run start` — serve o diretório atual em `http://localhost:5000` usando `serve` (instalado via npx se necessário).
- `npm test` — placeholder (sem testes configurados).

## Como rodar localmente
1. Instale dependências se necessário:

```bash
npm install
```

2. Sincronize estatísticas (gera/atualiza `mega-sena-stats.json`):

```bash
npm run sync
```

3. Sirva o frontend (recomendado ao invés de abrir `index.html` pelo file://):

```bash
npm run start
```

Abra `http://localhost:5000` no navegador para usar o gerador.

## Observações e recomendações
- Não abra `index.html` diretamente via protocolo `file://`. O frontend usa `fetch('./mega-sena-stats.json')` e requer um servidor HTTP.
- O script `sync-mega.js` usa uma API pública. Se a API ficar indisponível, a sincronização será interrompida — considere implementar retries/backoff ou armazenar um backup externo.
- `mega-sena-stats.json` é um artefato gerado. Se você preferir não versionar constantemente esse arquivo, adicione-o ao `.gitignore` e rode `npm run sync` quando necessário.
- O gerador no frontend contém um modo de teste que pode executar muitas iterações; evite rodar testes massivos no navegador (consome CPU). Prefira mover testes pesados para Node.

## Próximos passos sugeridos
- Melhorar validação de entradas no frontend e tratamento de erros no `sync-mega.js`.
- Adicionar testes unitários para as funções de geração/validação.
- Implantar ou usar storage externo para os dados de estatísticas se for necessário histórico compartilhado.

---

Relatório gerado em maio/2026
