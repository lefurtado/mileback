# Mileback

Aplicação web para **comparar e simular cenários de cashback e milhas**, com foco em quem compra em parceiros, acumula pontos no cartão e transfere milhas com bônus e custo de milheiro.

O objetivo é deixar explícito **quanto vale, em dinheiro, cada caminho** (parceiro × cartão × cotação do dólar × bônus de transferência × custo do milheiro), para apoiar decisões de compra e acúmulo.

## O que o projeto faz hoje

- **Super Cashback** (`/super-cashback`): fluxo em etapas que reúne cotação do dólar, valor da compra no parceiro, pontos por real no site, pontos por dólar no cartão, bônus e custo de milheiro (parceiro e cartão), seguro de proteção de preço e opção de somar pontos do cartão na análise final. O resultado consolida a simulação para o cenário informado.
- **Rascunho** do assistente e **cenários salvos** ficam no `localStorage` do navegador; a cotação USD/BRL pode ser obtida via API pública (AwesomeAPI) conforme o fluxo da tela.

## Em breve

No menu aparecem entradas reservadas para outras calculadoras (por exemplo taxas de cartão e plano clube), ainda **desabilitadas** até serem implementadas.

## Stack

- [Angular](https://angular.dev/) 21 (standalone, rotas com lazy loading)
- [Tailwind CSS](https://tailwindcss.com/) 4
- [ng-icons](https://www.ng-icons.com/) (Lucide)
- [ngx-currency](https://www.npmjs.com/package/ngx-currency) para campos monetários
- Testes unitários com [Vitest](https://vitest.dev/) via `@angular/build`

## Pré-requisitos

- [Node.js](https://nodejs.org/) (versão compatível com o Angular 21 do projeto)
- npm (o repositório fixa `packageManager` em `package.json`)

## Como rodar em desenvolvimento

```bash
npm install
npm start
```

Abra `http://localhost:4200/`. A rota raiz redireciona para **Super Cashback**.

## Build de produção

```bash
npm run build
```

Artefatos em `dist/`.

## Testes

```bash
npm test
```

## Estrutura (visão geral)

- `src/app/features/super-cashback/` — calculadora Super Cashback (componente, rotas, serviço, utilitários e tipos)
- `src/app/features/coming-soon/` — rotas placeholder para funcionalidades futuras
- `src/app/shared/` — componentes e diretivas de UI reutilizáveis

---

Projeto gerado com [Angular CLI](https://github.com/angular/angular-cli); documentação adicional da ferramenta em [Angular CLI](https://angular.dev/tools/cli).
