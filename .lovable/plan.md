

## Objetivo

Na página `/curso/formacao`, fazer o botão **"INSCRIÇÕES ABREM INÍCIO DE MAIO"** "subir" para o cabeçalho — substituindo a logo do Portal Ayurveda — assim que o usuário rolar a página para além do botão original no Hero.

## Comportamento

```text
Estado A — topo da página (hero visível)
┌─────────────────────────────────────────────┐
│ [Menu]      [Logo Portal Ayurveda]   [👤]   │ ← Header normal
├─────────────────────────────────────────────┤
│                                             │
│        Torne-se Terapeuta Ayurveda…         │
│   [INSCRIÇÕES ABREM INÍCIO DE MAIO] ← btn   │
│                                             │
└─────────────────────────────────────────────┘

Estado B — usuário rolou para baixo (botão do hero saiu da tela)
┌─────────────────────────────────────────────┐
│ [Menu] [INSCRIÇÕES ABREM INÍCIO DE MAIO][👤]│ ← Botão substitui logo
├─────────────────────────────────────────────┤
│            (resto da página)                │
└─────────────────────────────────────────────┘
```

- Transição suave (fade + slide curto) ao trocar logo ↔ botão.
- Ao clicar no botão do header, mesma ação dos outros CTAs (`handleEmBreve("header")` → scroll até `#investimento`).
- Comportamento ativo apenas em `/curso/formacao`. Demais páginas mantêm a logo intacta.
- Mobile: o botão no header usa versão compacta (texto menor, padding reduzido) para caber entre o Menu e o avatar; em telas muito estreitas, encurta para "INSCREVER-SE".

## Implementação Técnica

1. **Novo contexto leve** `src/contexts/HeaderCtaContext.tsx`
   - Expõe `{ cta: { label, onClick } | null, setCta }`.
   - `Layout.tsx` envolve a árvore com o `HeaderCtaProvider` para que qualquer página possa registrar/limpar um CTA do header.

2. **`Header.tsx`**
   - Consome `useHeaderCta()`.
   - No bloco CENTER (linhas 175-198), quando `cta` está definido **e** não estamos em `/samkhya/*`, renderiza o botão (estilo salmão `#FF7676`, mesmo formato dos outros CTAs do curso) no lugar da logo.
   - Animação via classes existentes `animate-fade-in` / `animate-scale-in` (Tailwind config já tem). Logo recebe fade-out reverso.

3. **`src/pages/curso/Formacao.tsx`**
   - Adiciona `useEffect` com `IntersectionObserver` observando o botão do hero (via `ref`).
   - Quando o botão **sai** do viewport (`isIntersecting === false`) → `setCta({ label: data.hero.ctaText, onClick: handleEmBreve("header") })`.
   - Quando volta a aparecer → `setCta(null)`.
   - Cleanup ao desmontar limpa o CTA.

4. **`FormacaoHero.tsx`**
   - Aceita prop opcional `ctaRef?: React.Ref<HTMLButtonElement>` e a aplica ao `motion.button` do CTA, para o observer rastrear exatamente o botão.

## Arquivos afetados

- **Novo:** `src/contexts/HeaderCtaContext.tsx`
- **Editado:** `src/components/Layout.tsx` (envolver com Provider)
- **Editado:** `src/components/Header.tsx` (consumir contexto, renderizar botão no centro)
- **Editado:** `src/components/formacao/FormacaoHero.tsx` (forwardRef no botão CTA)
- **Editado:** `src/pages/curso/Formacao.tsx` (IntersectionObserver + setCta)

## Fora de escopo

- Não altera a logo no header de outras páginas.
- Não altera o cabeçalho da `/samkhya/*` (mantém logo Samkhya).
- Não muda a aparência da seção Hero em si — apenas adiciona uma `ref` no botão.

