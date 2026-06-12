## Objetivo
Em `/meu-dosha`, quando o usuário não tem `narrativa_clinica` preenchida (ou nem tem registro em `premium.objetivos_tratamento`), reenviar automaticamente o mesmo webhook que o `/teste-de-dosha` dispara ao final do teste — para que o n8n gere a análise clínica.

## Onde
`src/components/meudosha/DiagnosticoCompleto.tsx` — já é onde a página carrega `analise` (via `useAnalise(email)`) e onde sabemos se `narrativa_clinica` está vazia. O hook `useAnalise` já faz polling a cada 3s por até ~60s, então ao receber a narrativa o componente atualiza sozinho.

## Comportamento
1. Aguardar `analiseQ.isLoading === false`.
2. Disparar UMA VEZ por email (guard com `useRef<Set<string>>`) quando:
   - `analise === null` (sem registro em objetivos_tratamento), OU
   - `analise.narrativa_clinica == null`.
3. Buscar o registro mais recente do usuário:
   ```ts
   supabase.from("doshas_registros")
     .select("*")
     .eq("email", email)
     .order("created_at", { ascending: false })
     .limit(1)
     .maybeSingle()
   ```
4. Montar o payload exatamente como em `TesteDeDosha.tsx` (linhas 382–415), mapeando colunas do registro para as chaves do webhook:

   | webhook key | origem (doshas_registros) |
   |---|---|
   | email | email (lowercase) |
   | idPublico | idPublico |
   | visitorIdBrowser | `localStorage.getItem("visitorId") ?? ""` |
   | title / nome | nome |
   | idade | idade |
   | "conhecimento ayurveda" | conhecimentoAyurveda ?? "Iniciante" |
   | altura, peso, imc | idem |
   | datateste | `new Date().toISOString()` |
   | vatascore, pittascore, kaphascore | idem |
   | doshaprincipal | doshaprincipal |
   | agniPrincipal | agniPrincipal |
   | agniirregular, agniforte, agnifraco | idem |
   | relato_aberto | relato_aberto ?? "" |
   | agravVataTags / agravPittaTags / agravKaphaTags | idem (já são strings CSV no banco) |
   | alimVata / alimPitta / alimKapha | idem |
   | aliment, remedios, mentoria, diagn, espiritual, produtos | colunas equivalentes do registro |

5. POST `fetch("https://n8n.portalayurveda.com/webhook/teste-dosha-ayurveda", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload) }).catch(()=>{})` — fire-and-forget, sem toast.
6. O polling existente em `useAnalise` continua e exibe a narrativa quando o n8n terminar.

## Detalhes técnicos
- Guard: `const firedRef = useRef<Set<string>>(new Set())`; só dispara se `!firedRef.current.has(email)`, e adiciona ao set antes do fetch.
- Não tocar em nada do `/teste-de-dosha` nem na escrita no Supabase — apenas reenviar o webhook.
- Se `doshas_registros` retornar vazio (usuário sem teste), não faz nada.