# Baixar PNG nos mockups: volta a baixar no desktop

## O que está acontecendo

No print enviado dá pra ver a janela "Compartilhar" do Windows aberta ao lado do card — não é um bug de geração da imagem. O botão "Baixar PNG" está caindo no caminho de **compartilhamento do sistema** em vez do download.

O código decide assim: se o navegador diz que sabe compartilhar arquivos (`navigator.canShare({ files })`), ele chama a folha de compartilhamento; só se não souber é que faz o download. Isso foi feito para o iPhone (onde download direto não salva na galeria). Só que o Chrome no Windows **também** responde que sabe compartilhar arquivos — então no desktop abre aquele painel do Windows, e como não existe "salvar arquivo" ali, a pessoa fecha e não tem imagem nenhuma.

## Correção

Em `src/pages/AdminMockups.tsx`, na função `salvarArquivo`:

- Usar `navigator.share` **apenas** quando for iOS (a constante `IS_IOS` já existe no arquivo). Em qualquer outro ambiente, ir direto para o download via link (`baixarArquivo`).
- Manter o fallback atual: se o share falhar por outro motivo que não cancelamento do usuário, cair no download.
- No download, anexar o `<a>` ao documento antes do clique e removê-lo depois (alguns navegadores ignoram o clique em elemento não anexado) — deixa o caminho de download mais confiável.

Nada mais muda: geração do PNG, pré-geração em segundo plano, rótulo do botão ("Salvar / Compartilhar" no iOS, "Baixar PNG" no resto) e "Copiar link" continuam iguais.

## Verificação

Rodar o mockup no navegador headless da sandbox não é possível (a área é admin e a autenticação desse projeto não é gerenciada pelo Lovable), então a checagem final é sua: clicar em "Baixar PNG" no desktop deve baixar o arquivo direto, sem abrir a janela de compartilhamento do Windows.
