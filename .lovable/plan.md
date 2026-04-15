

## Plan: Dosha Favicon + Akasha Logo Positioning

### What you asked for
1. A mini dosha pie chart icon ("favicon") next to "Perfil" on the left side of the tab bar
2. Move the Akasha logo closer to the text, on the right side of "Akasha"
3. The pie chart uses the user's actual V/P/K scores proportionally

### Approach

**Mini Dosha Pie (SVG)** — Instead of using Recharts (heavy for a 20px icon), I'll create a tiny inline SVG component (`DoshaMiniPie`) that draws 3 arc segments using the user's actual `vatascore`, `pittascore`, `kaphascore` proportions. This is lightweight and renders the real distribution. No need for a generic 1/3 split.

**Changes to `src/pages/MeuDosha.tsx`:**

1. **Create `DoshaMiniPie` component** — A ~20px SVG pie chart using conic gradient math to draw 3 colored arcs (Vata blue, Pitta red, Kapha green) based on the user's actual scores.

2. **Update "Perfil" tab trigger** — Add `DoshaMiniPie` to the left of the text:
   ```
   [🥧 Perfil]  [Métricas]  [Artigos]  [Vídeos]  [Akasha 🔮]
   ```

3. **Fix Akasha tab trigger** — Move the logo image to the right of "Akasha" text and reduce the gap from `gap-1.5` to `gap-1`:
   ```tsx
   <TabsTrigger value="akasha" className="... flex items-center gap-1">
     Akasha
     <img src="..." className="w-4 h-4" />
   </TabsTrigger>
   ```

### Technical detail: Mini SVG Pie

A pure SVG with 3 `<circle>` elements using `stroke-dasharray`/`stroke-dashoffset` to simulate pie slices — same technique as `CircularProgress` in `MetricasTab.tsx`. Radius ~8px, total size ~18x18. Uses the `PIE_COLORS` already defined in the file.

### Files changed
- `src/pages/MeuDosha.tsx` — Add `DoshaMiniPie` component, update both tab triggers

