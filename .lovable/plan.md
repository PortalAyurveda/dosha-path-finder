## Fix do menu superior da biblioteca no mobile

### Diagnóstico (image-48)
A 390px o menu corta "Sommelier" ("Sor…") e a Vata ativa fica fora à esquerda. Causa: o container usa `justify-center` dentro de `overflow-x-auto`. Quando a fileira é mais larga que a tela, `justify-center` empurra o início para fora da viewport e o usuário não consegue rolar até o item ativo.

A segunda barra de navegação (image-49 — Principal/Horários/Alimentação) já está OK e o conteúdo aparece logo abaixo dela ✅.

### Mudança
Em `src/components/dosha/DoshaSelector.tsx`:
- Trocar `justify-center` por `justify-start sm:justify-center` para que no mobile a barra role naturalmente da esquerda.
- Reduzir levemente o padding/tamanho dos pills no mobile (`px-2 py-1`, `text-[11px]`) para caber mais conteúdo sem rolar.
- Ao montar/trocar de rota, fazer `scrollIntoView` no pill ativo (block:'nearest', inline:'center') para que o item correspondente à página atual fique visível na barra.

### Fora de escopo
Segunda barra (DoshaNavPills) e conteúdo abaixo — já estão alinhados conforme image-49.
