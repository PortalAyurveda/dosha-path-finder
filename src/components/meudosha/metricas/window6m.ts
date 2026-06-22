import { vataToLevel, pittaToLevel, kaphaToLevel } from "./doshaScale";

export interface HistRecord {
  created_at: string;
  vatascore: number | null;
  pittascore: number | null;
  kaphascore: number | null;
  agniPrincipal: string | null;
  tipo: string | null;
}

export interface MetaInput {
  vata_meta: number | null;
  pitta_meta: number | null;
  kapha_meta: number | null;
  agni_nivel_meta: number | null;
  agni_nivel_atual: number | null;
}

export interface MonthSlot {
  slot: number;       // 0..5
  ts: number;         // first-of-month timestamp
  label: string;      // "Jan", "Fev"...
  isOverflowAnchor: boolean; // true se slot 0 representa "vem do passado"
}

export interface WindowPoint {
  slot: number;
  ts: number;
  topLabel: string;   // "Diagn." | "Rev. 1" | "Objetivo"
  tipo: "teste" | "reteste" | "meta";
  vata?: number; vataRaw?: number;
  pitta?: number; pittaRaw?: number;
  kapha?: number; kaphaRaw?: number;
  agniNivel?: number;
}

export interface SixMonthWindow {
  months: MonthSlot[];
  points: WindowPoint[];
  metaSlot: number | null;
  hasPastOverflow: boolean;
  pastOverflowOriginTs: number | null;
}

const SHORT_MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function monthKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}`;
}
function monthsBetween(a: Date, b: Date): number {
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
}
function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}
function shortMonth(d: Date): string {
  return SHORT_MONTHS[d.getMonth()];
}

export function parseAgniNivelStr(s: string | null | undefined): number | null {
  if (!s) return null;
  const m = s.match(/nivel\s*(\d)/i);
  if (m) return Math.max(0, Math.min(3, parseInt(m[1], 10)));
  const low = s.toLowerCase();
  if (low.includes("constante") || low.includes("boa")) return 0;
  return null;
}

export function buildSixMonthWindow(
  history: HistRecord[],
  meta: MetaInput | null,
  now: Date = new Date(),
): SixMonthWindow {
  // 1. Dedupe by month — latest record per month wins (regardless of teste vs reteste).
  const byMonth = new Map<string, HistRecord>();
  const sortedHist = [...history].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  for (const r of sortedHist) {
    const d = new Date(r.created_at);
    byMonth.set(monthKey(d), r); // último vence
  }
  const monthlyAll = Array.from(byMonth.values()).sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  if (monthlyAll.length === 0) {
    return { months: [], points: [], metaSlot: null, hasPastOverflow: false, pastOverflowOriginTs: null };
  }

  const firstRec = monthlyAll[0];
  const lastRec = monthlyAll[monthlyAll.length - 1];
  const firstMonthOverall = startOfMonth(new Date(firstRec.created_at));
  const lastMonthReal = startOfMonth(new Date(lastRec.created_at));

  // 2. Janela de 6 meses (M0..M5). Objetivo sempre no slot do último real + 1, clamp em 5.
  // Se o span do primeiro real até a janela exigir > 6 meses, desliza pra direita.
  // M5 = lastRealMonth + 1 (clamped to ≥ firstMonthOverall + 5 only when spans fit).
  let m0: Date;
  const spanIfStartAtFirst = monthsBetween(firstMonthOverall, lastMonthReal) + 1; // inclui ambos + objetivo
  // Necessário acomodar: lastReal e objetivo (lastReal+1).
  // Se firstMonthOverall + 5 ≥ lastReal+1 → cabe começando em firstMonth.
  if (spanIfStartAtFirst <= 5) {
    m0 = firstMonthOverall;
  } else {
    // Desliza: M5 = lastReal + 1, M0 = M5 - 5
    m0 = addMonths(lastMonthReal, 1 - 5);
  }

  const months: MonthSlot[] = [];
  for (let i = 0; i < 6; i++) {
    const md = addMonths(m0, i);
    months.push({
      slot: i,
      ts: md.getTime(),
      label: shortMonth(md),
      isOverflowAnchor: false,
    });
  }

  // 3. Determina pontos visíveis e overflow.
  const visible: HistRecord[] = [];
  let overflowOrigin: Date | null = null;
  for (const r of monthlyAll) {
    const mDate = startOfMonth(new Date(r.created_at));
    const slot = monthsBetween(m0, mDate);
    if (slot < 0) {
      // antes da janela
      if (!overflowOrigin) overflowOrigin = mDate;
    } else if (slot <= 5) {
      visible.push(r);
    }
  }
  const hasPastOverflow = overflowOrigin != null;
  if (hasPastOverflow) months[0].isOverflowAnchor = true;

  // 4. Constrói WindowPoints com rótulos.
  // Regras de rotulagem (globais, por ordem de created_at em todo histórico):
  //   - 1º registro tipo='teste' → "Teste inicial"
  //   - 2º, 3º... tipo='teste' → "Teste 2", "Teste 3", ...
  //   - tipo='reteste' numerado independentemente → "Revisão 1", "Revisão 2", ...
  const testeRankByTs = new Map<number, number>();
  const retesteRankByTs = new Map<number, number>();
  let tk = 0;
  let rk = 0;
  for (const r of sortedHist) {
    const ts = new Date(r.created_at).getTime();
    if (r.tipo === "reteste") {
      rk++;
      retesteRankByTs.set(ts, rk);
    } else {
      tk++;
      testeRankByTs.set(ts, tk);
    }
  }

  const points: WindowPoint[] = [];
  for (let i = 0; i < monthlyAll.length; i++) {
    const r = monthlyAll[i];
    const mDate = startOfMonth(new Date(r.created_at));
    const slot = monthsBetween(m0, mDate);
    if (slot < 0 || slot > 5) continue;

    const recTs = new Date(r.created_at).getTime();
    const tipo: "teste" | "reteste" = r.tipo === "reteste" ? "reteste" : "teste";
    let topLabel: string;
    if (tipo === "reteste") {
      const rank = retesteRankByTs.get(recTs);
      topLabel = rank ? `Revisão ${rank}` : "Revisão";
    } else {
      const rank = testeRankByTs.get(recTs) ?? 1;
      topLabel = rank === 1 ? "Teste inicial" : `Teste ${rank}`;
    }
    const agni = parseAgniNivelStr(r.agniPrincipal);

    points.push({
      slot,
      ts: mDate.getTime(),
      topLabel,
      tipo,
      vata: r.vatascore != null ? vataToLevel(r.vatascore).level : undefined,
      vataRaw: r.vatascore ?? undefined,
      pitta: r.pittascore != null ? pittaToLevel(r.pittascore).level : undefined,
      pittaRaw: r.pittascore ?? undefined,
      kapha: r.kaphascore != null ? kaphaToLevel(r.kaphascore).level : undefined,
      kaphaRaw: r.kaphascore ?? undefined,
      agniNivel: agni ?? undefined,
    });
  }


  // 5. Objetivo: slot = (último real visível + 1), clamp em 5. Se não há real visível, slot 1.
  let metaSlot: number | null = null;
  if (meta) {
    const lastVisible = points[points.length - 1];
    const base = lastVisible ? lastVisible.slot : 0;
    metaSlot = Math.min(5, base + 1);

    // Fallback: agni meta pode usar agni_nivel_atual no último real se faltar agni
    if (lastVisible && lastVisible.agniNivel == null && meta.agni_nivel_atual != null) {
      lastVisible.agniNivel = meta.agni_nivel_atual;
    }

    points.push({
      slot: metaSlot,
      ts: months[metaSlot].ts,
      topLabel: "Objetivo",
      tipo: "meta",
      vata: meta.vata_meta != null ? vataToLevel(meta.vata_meta).level : undefined,
      vataRaw: meta.vata_meta ?? undefined,
      pitta: meta.pitta_meta != null ? pittaToLevel(meta.pitta_meta).level : undefined,
      pittaRaw: meta.pitta_meta ?? undefined,
      kapha: meta.kapha_meta != null ? kaphaToLevel(meta.kapha_meta).level : undefined,
      kaphaRaw: meta.kapha_meta ?? undefined,
      agniNivel: meta.agni_nivel_meta ?? undefined,
    });
  }

  return {
    months,
    points,
    metaSlot,
    hasPastOverflow,
    pastOverflowOriginTs: overflowOrigin ? overflowOrigin.getTime() : null,
  };
}

/** Constrói as 6 linhas (uma por slot) para alimentar o Recharts. */
export function rowsFromWindow(win: SixMonthWindow): Array<Record<string, any>> {
  const pointBySlot = new Map<number, WindowPoint>();
  for (const p of win.points) pointBySlot.set(p.slot, p);
  return win.months.map((m) => {
    const p = pointBySlot.get(m.slot);
    return {
      slot: m.slot,
      monthLabel: m.label,
      isOverflowAnchor: m.isOverflowAnchor,
      topLabel: p?.topLabel ?? "",
      tipo: p?.tipo,
      vata: p?.vata,
      vataRaw: p?.vataRaw,
      pitta: p?.pitta,
      pittaRaw: p?.pittaRaw,
      kapha: p?.kapha,
      kaphaRaw: p?.kaphaRaw,
      agni: p?.agniNivel,
    };
  });
}
