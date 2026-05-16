## Trocar foto e tratar como camada sobre o fundo

Em `src/pages/curso/FormacaoLive.tsx`:

1. **Atualizar `PHOTO_URL`** para `https://fwezkasjfguarjmjxifh.supabase.co/storage/v1/object/public/portal_images/gemini-generated-image-w7evrdw7evrdw7ev.webp` (também no `og:image`).

2. **Remover o "card" da foto** (sombra, bordas arredondadas assimétricas, blur halo atrás, gradiente escuro na base, `overflow-hidden`). Como o fundo da imagem já é creme igual ao site, ela deve flutuar livre sobre o `#FFF8EE`, sem moldura.

3. **Trocar `object-cover` por `object-contain`** para não recortar a figura, mantendo altura responsiva (~520–620px) e `drop-shadow` sutil opcional para dar leve profundidade sem criar caixa.

4. **Adicionar formas decorativas atrás/sobre a foto** no lado direito, aproveitando que agora ela é "recortada":
   - Um círculo grande em `PRIMARY` (azul) atrás da figura, semi-transparente.
   - Um círculo menor salmão sobreposto em um canto.
   - Um arco/anel fino em `DARK`.
   - Todos posicionados absolutamente, com `z-index` controlado: círculo grande atrás da imagem, círculo pequeno e anel à frente em cantos que não cubram o rosto.

5. **Manter** todo o resto da página intacto (texto, CTA WhatsApp, badges, SEO, animações).

Nenhuma outra rota, dado ou componente é tocado.