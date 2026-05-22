Diagnóstico provável:

1. As abas principais em `/meu-dosha` e em páginas admin usam `Tabs defaultValue`. Isso deixa o Radix controlar a aba internamente, mas não grava a aba atual na URL nem em estado persistente. Quando a página remonta ao voltar de outra aba do navegador, ela reabre sempre no default (`perfil`, `estoque`, `videos`, etc.).
2. O `TabsContent` desmonta o conteúdo das abas inativas. Então, quando você troca de subaba dentro do site, formulários em andamento somem porque o componente da aba anterior é desmontado e perde `useState` local.
3. Em rotas admin, o `AdminRoute` mostra skeleton enquanto `roleLoading` fica true. Em eventos de sessão/foco do Supabase ao voltar para a aba do navegador, isso pode desmontar temporariamente a página protegida e zerar campos locais.
4. Alguns formulários admin guardam rascunho só em memória (`useState`). Mesmo corrigindo as abas, se houver remount real do app pelo navegador/celular, o rascunho ainda some sem autosave local.

Plano de correção:

1. Tornar abas controladas e persistentes:
   - Em `/meu-dosha`, trocar `defaultValue={initialTab}` por `value/onValueChange`.
   - Ao mudar de aba, atualizar `?tab=perfil|metricas|artigos|videos|akasha` preservando `id` e `mode`.
   - Assim, ao voltar para o portal, a página reabre exatamente na aba onde estava.

2. Impedir desmontagem de conteúdo ao trocar abas:
   - Adicionar `forceMount` nos `TabsContent` críticos de `/meu-dosha`.
   - Aplicar o mesmo padrão nas páginas admin com abas internas: `AdminEstoque`, `AdminBiblioteca` e `AdminLoja`.
   - Conteúdos inativos ficam ocultos, mas os estados dos formulários/subabas permanecem vivos.

3. Reduzir remount por autenticação no admin:
   - Ajustar `AdminRoute` para não substituir a página por skeleton quando já existe usuário admin validado e o app apenas está revalidando role.
   - Manter bloqueio seguro: se não houver usuário ou se a role confirmada não for admin, continua bloqueando.

4. Persistir rascunhos de formulários mais sensíveis:
   - Começar pelo caso citado de admin/estoque/vendas: salvar o formulário de “Registrar venda” em `sessionStorage` enquanto digita e limpar só após salvar com sucesso.
   - Isso protege contra remount real, troca de aba do navegador e WebView mobile.

5. Validar sinais:
   - Conferir que `/meu-dosha?id=...&tab=akasha` mantém a aba no refresh/volta.
   - Conferir que mudar entre subabas não limpa inputs preenchidos.
   - Conferir que o admin não volta para default ao retornar de outra aba do navegador.