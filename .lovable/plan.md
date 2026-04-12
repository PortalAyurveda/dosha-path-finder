

# Plano de Implementação — 4 frentes

## 1. Blog: Tags listadas diretas + multi-seleção

**`src/pages/Blog.tsx`**: Remover o sistema de categorias colapsáveis. Quando "Busca Avançada" está ativo, mostrar todas as 25 tags como chips numa lista corrida (como estava antes). Multi-seleção já funciona (o `toggleTag` já suporta). Manter o resumo de tags selecionadas com "Limpar todos".

## 2. Tags clicáveis nos artigos do blog

**`src/pages/BlogArticle.tsx`**: Trocar as `Badge` de tags por `Link` que navega para `/blog?tag=NomeDaTag`. Multi-tag: cada tag clicada leva à página do blog com aquela tag pré-selecionada.

**`src/pages/Blog.tsx`**: Ler query param `tag` da URL ao montar o componente e pré-popular `selectedTags` + ativar `isAdvanced` automaticamente.

## 3. Header: nome + scores V:X P:X K:X estilizados

**`src/components/Header.tsx`**: No bloco onde `doshaResult` existe, trocar o texto atual por:
- Primeiro nome (`profile.nome.split(" ")[0]`) — já faz isso mas pode estar caindo no email
- Scores: `V:X P:X K:X` onde cada par usa a cor do dosha (vata=#93C5FD, pitta=#FCA5A5, kapha=#86EFAC)
- Fundo semitransparente branco (`bg-white/15`) com `backdrop-blur` para dar destaque visual
- Área inteira clicável levando ao `/meu-dosha?id=...`

O problema do nome vs email: o `displayName` já tenta `profile?.nome`, mas se o profile não carregou ou o campo `nome` está null, cai no email. Vou garantir que o fallback seja mais robusto.

## 4. Biblioteca: rotas SEO por subpágina dos doshas

Hoje as rotas são `/biblioteca/vata` e `/biblioteca/vata/adoecimento`. Precisa adicionar rotas individuais para cada tab:

**Novas rotas em `App.tsx`**:
- `/biblioteca/vata/horarios` → `<DoshaVata defaultTab="horarios" />`
- `/biblioteca/vata/alimentacao` → `<DoshaVata defaultTab="alimentacao" />`
- `/biblioteca/vata/remedios` → `<DoshaVata defaultTab="remedios" />`
- `/biblioteca/vata/avancado` → `<DoshaVata defaultTab="avancado" />` (substituindo `/adoecimento`)
- Mesma lógica para pitta e kapha (total: 12 novas rotas, removendo 3 de `/adoecimento`)

**`src/components/dosha/DoshaNavPills.tsx`**: Atualizar `handleClick` para navegar para a rota real de cada tab (`/biblioteca/{dosha}/{tab}`), não só trocar state. Manter `replace: false` para que o botão "Voltar" do browser funcione.

**Páginas wrapper de adoecimento** (`DoshaVataAdoecimento.tsx`, etc.): Manter como redirect ou remover, substituídas pelas novas rotas `/avancado`.

---

### Detalhes Técnicos

| Arquivo | Mudança |
|---------|---------|
| `src/pages/Blog.tsx` | Remover `openCategories`, `toggleCategory`, `countSelectedInCategory`. Tags como lista corrida. Ler `?tag=` da URL. |
| `src/pages/BlogArticle.tsx` | Tags como `<Link to={/blog?tag=${tag}}>` |
| `src/components/Header.tsx` | Scores V:P:K com cores, fundo destacado, nome robusto |
| `src/App.tsx` | +12 rotas de subtabs, renomear `/adoecimento` → `/avancado` |
| `src/components/dosha/DoshaNavPills.tsx` | Cada pill navega para `/biblioteca/{dosha}/{tab}` |
| `src/pages/DoshaVata.tsx` (e Pitta, Kapha) | Canonical URLs atualizados para novas rotas |

