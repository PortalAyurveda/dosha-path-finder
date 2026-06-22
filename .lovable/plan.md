## Parede de login com prévia em `/meu-dosha`

Objetivo: usuários deslogados veem apenas o retrato clínico (pizza, Agni, termômetro, bullets) + um cartão convidando a criar conta. Usuários logados continuam vendo exatamente o que veem hoje.

### Arquivo 1 — `src/pages/MeuDosha.tsx`

1. **Trazer `loading` do contexto** (linha 470):
   - `const { user, profile, doshaResult, loading: authLoading } = useUser();`

2. **Trava de acesso** — inserir logo após o cálculo de `doshaScores` / `pieData` / `primaryDosha` (≈linha 681, antes do `return` do JSX completo na linha 707):
   - Se `authLoading` → retornar um `<PageContainer>` simples com `<Loader2 className="animate-spin" />` centralizado (mesmo padrão do bloco da linha 647).
   - Se `!user` → retornar a **prévia** descrita no passo 3 (return imediato).
   - Caso contrário → cai no `return` atual sem alteração nenhuma.

3. **Prévia (deslogado)** — dentro de `<PageContainer>` com `max-w-3xl mx-auto space-y-6`:
   - **Cartão clínico** (cópia visual do bloco das linhas 812–905) com a pizza (`PieChart` + `pieData`), o bloco do Agni e `<ClinicalThermometer doshaScores={doshaScores} />`, **removendo** o `div` de ações (Recomeçar / Gráficos / Revisão, linhas 839–901).
   - `<DoshaLevelBullets doshaScores={doshaScores} />`.
   - **Cartão de parede** novo (`bg-card border rounded-xl p-6 shadow-sm` com leve ring/destaque) contendo:
     - `<h2>` font-serif: "Seu plano completo está pronto"
     - parágrafo: "Você já viu seu retrato. Falta o mais importante: o que está causando seu desequilíbrio, seus caminhos de tratamento, seu protocolo de produtos e sua rotina personalizada de 30 dias."
     - `<Button className="w-full" size="lg">` com texto "Criar conta grátis e ver meu plano" e `onClick`:
       ```ts
       localStorage.setItem("activeDoshaId", id);
       localStorage.setItem("pendingClaimIdPublico", id);
       navigate(`/entrar?claim=${id}`);
       ```
     - parágrafo pequeno (`text-xs text-muted-foreground`): "Leva menos de 1 minuto. Seu diagnóstico fica salvo na sua conta, de graça."

Nada mais é alterado: `RetesteCard`, banner premium, `Tabs`, `DiagnosticoCompleto`, cálculos, queries e o pixel ficam intactos para o caminho logado.

### Arquivo 2 — `src/pages/Auth.tsx`

4. **Fallback de redirect pós-login** — no `useEffect` que observa `doshaResult` (linhas 31–41), substituir o trecho que lê apenas `doshaResult?.idPublico` por:
   ```ts
   const fallbackId = doshaResult?.idPublico || localStorage.getItem("activeDoshaId");
   if (fallbackId) {
     navigate(`/meu-dosha?id=${fallbackId}`, { replace: true });
     return;
   }
   const timer = setTimeout(() => { navigate("/", { replace: true }); }, 3000);
   return () => clearTimeout(timer);
   ```
   Restante do fluxo OTP/Google/`pendingClaimIdPublico` permanece igual.

### Fora de escopo (não tocar)
- Cálculo do teste, webhook n8n, RPC `claim_dosha_test`, `UserContext`, conteúdo logado da `/meu-dosha`, demais páginas.
