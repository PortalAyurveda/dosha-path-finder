## Ajustar regra de cálculo do dosha principal

### Onde está a regra
A lógica vive em `src/pages/TesteDeDosha.tsx` (linhas 234–241), dentro da função que calcula os resultados antes de salvar em `doshas_registros.doshaprincipal` e enviar pro webhook do n8n.

### Regra atual
```ts
if (scores[0].score - scores[1].score >= 5) {
  doshaPrincipal = scores[0].name;       // Monodosha
} else {
  doshaPrincipal = ordered.join('-');    // Bidosha
}
```
- Diferença ≥ 5 → monodosha
- Diferença < 5 → bidosha

### Regra nova (sua proposta)
- Diferença **≥ 11** entre o 1º e o 2º dosha → **monodosha** (ex.: Vata 50, Pitta 39 → "Vata")
- Diferença **≤ 10** → **bidosha** (ex.: Vata 50, Pitta 40, Kapha 15 → "Vata-Pitta")

### Mudança no código
Substituir o bloco acima por:
```ts
if (scores[0].score - scores[1].score >= 11) {
  doshaPrincipal = scores[0].name;
} else {
  const top2 = [scores[0].name, scores[1].name];
  const ordered = ['Vata', 'Pitta', 'Kapha'].filter(d => top2.includes(d));
  doshaPrincipal = ordered.join('-');
}
```

A ordem (Vata-Pitta, Vata-Kapha, Pitta-Kapha) é mantida pelo filter na ordem canônica Vata→Pitta→Kapha, então o output continua compatível com o que `/meu-dosha`, `LoggedHero`, `MeuDosha`, `DiagnosticoCompleto` etc. já consomem.

### O que NÃO muda
- Nada no Supabase (sem migration — é só lógica de cálculo no client antes do insert).
- Registros antigos em `doshas_registros` ficam como estão. Se você quiser reprocessar testes antigos com a nova regra, posso fazer num próximo passo (script de update ou opção em `/admin/teste`). Não está incluído neste plano.
- Cálculo de Agni continua igual.

### Arquivos editados
- `src/pages/TesteDeDosha.tsx` — apenas o bloco de 6 linhas do `if`.
