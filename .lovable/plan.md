## Auditoria

Comparei os 4 SVGs/PNG usados nos cards de Próximos Passos:

| Ícone | viewBox / proporção |
|---|---|
| Alimentação | 359 × 449 (retrato, ~0.80) |
| Horários | 283 × 288 (≈ quadrado) |
| Alquimia (PNG) | quadrado |
| Akasha | 868 × 885 (≈ quadrado) |

**Causa raiz:** o SVG de Alimentação é o único em formato retrato (mais alto que largo). Como a caixa é quadrada (`w-16 h-16`) com `object-contain`, ele se ajusta pela altura e ocupa toda a vertical da caixa — por isso o topo (e/ou rodapé) parece "sair" do alinhamento dos demais, que têm folga natural acima/abaixo. O `iconScale={1.55}` atual amplifica isso.

Além disso, o conteúdo desenhado dentro do PNG embutido no SVG não é perfeitamente centralizado — há mais "ar" embaixo do que em cima, o que faz o ícone parecer empurrado para cima.

## Mudança proposta (somente Alimentação)

No `ProximoPassoCard`, permitir um deslocamento vertical opcional e ajustar o ícone de Alimentação:

1. Adicionar prop opcional `iconOffsetY` (em px) ao `ProximoPassoCard`, aplicada no `transform` junto com o `scale`.
2. Reduzir `iconScale` de `1.55` → `1.35` (para o ícone parar de "estourar" a caixa por cima/baixo) e aplicar `iconOffsetY={4}` para empurrá-lo levemente para baixo, alinhando o centro óptico com os demais.
3. Nenhum outro card é alterado.

## Detalhes técnicos

Em `src/components/meudosha/DiagnosticoCompleto.tsx`:

```tsx
// ProximoPassoCard
style={{ transform: `translateY(${iconOffsetY}px) scale(${iconScale})` }}

// Alimentação card
<ProximoPassoCard
  ...
  iconScale={1.35}
  iconOffsetY={4}
/>
```

Se após a aplicação ainda parecer alto, ajustamos `iconOffsetY` em incrementos de 2px.
