# Landing Page do Claudinho 🚀🇧🇷

Landing page moderna e responsiva pro Claudinho, construída com Next.js 14, shadcn/ui e Tailwind CSS.

## Features

- ✨ Design moderno com gradientes e animações suaves
- 🌙 Modo escuro por padrão
- 📱 Totalmente responsivo
- ⚡ Performance otimizada com Next.js 14
- 🎨 Componentes shadcn/ui
- 🎯 SEO otimizado

## Seções

1. **Hero** - Apresentação principal com CTA
2. **Features Grid** - 6 cards destacando as principais features
3. **Provedores** - Tabs com exemplos de configuração pra cada provedor
4. **Comparação de Modelos** - Tabela comparativa de qualidade
5. **FAQ** - Accordion com perguntas frequentes
6. **CTA Final** - Call-to-action com gradiente
7. **Footer** - Links e informações

## Como rodar

### Desenvolvimento

```bash
cd landing-page
npm install
npm run dev
```

Acesse http://localhost:3000

### Build pra produção

```bash
npm run build
```

Isso gera uma build estática na pasta `out/` que pode ser hospedada em qualquer servidor ou GitHub Pages.

### Deploy

A landing page é exportada como site estático, então pode ser hospedada em:

- **GitHub Pages**: Faça push da pasta `out/` pra branch `gh-pages`
- **Vercel**: Deploy automático conectando o repo
- **Netlify**: Arraste a pasta `out/` no painel
- **Qualquer servidor**: Suba os arquivos da pasta `out/`

## Estrutura

```
landing-page/
├── app/
│   ├── globals.css       # Estilos globais + tema
│   ├── layout.tsx        # Layout raiz com metadata
│   └── page.tsx          # Página principal
├── components/
│   └── ui/               # Componentes shadcn/ui
│       ├── accordion.tsx
│       ├── button.tsx
│       ├── card.tsx
│       └── tabs.tsx
├── lib/
│   └── utils.ts          # Utilitários (cn helper)
├── package.json
├── tailwind.config.ts    # Config do Tailwind
├── tsconfig.json
└── next.config.mjs       # Config do Next.js
```

## Customização

### Cores

Edite as variáveis CSS em `app/globals.css`:

```css
:root {
  --primary: 142 76% 36%;  /* Verde principal */
  --background: 0 0% 100%; /* Fundo */
  /* ... */
}
```

### Conteúdo

Todo o conteúdo tá em `app/page.tsx`. Edite diretamente os textos, adicione seções ou remova o que não precisar.

### Componentes

Os componentes shadcn/ui em `components/ui/` podem ser customizados individualmente.

## Tecnologias

- **Next.js 14** - Framework React
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Componentes acessíveis
- **Radix UI** - Primitivos de UI
- **Lucide React** - Ícones

## Licença

MIT - Mesma licença do Claudinho
