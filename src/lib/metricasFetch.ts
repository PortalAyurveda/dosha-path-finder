/**
 * Portal das Métricas — Camada de dados híbrida.
 *
 * Estratégia:
 * 1) Tenta ler de `metricas_snapshot` (atualizado 1x/dia pelo n8n).
 * 2) Se a família não existir no snapshot, faz query direta nas tabelas
 *    (mais lenta, mas sempre funciona).
 *
 * ─────────────────────────────────────────────────────────────────────
 * QUERIES SQL QUE O N8N DEVE INSERIR EM metricas_snapshot
 * (familia / metrica_id / descricao / percentual / n_base / data_calculo)
 * ─────────────────────────────────────────────────────────────────────
 *
 * -- 1. KPIs gerais (familia: 'kpi_geral')
 * SELECT
 *   COUNT(*) as total_diagnosticos,
 *   COUNT(*) FILTER (WHERE doshaprincipal ILIKE 'Vata%') as total_vata,
 *   COUNT(*) FILTER (WHERE doshaprincipal ILIKE 'Pitta%') as total_pitta,
 *   COUNT(*) FILTER (WHERE doshaprincipal ILIKE 'Kapha%') as total_kapha
 * FROM doshas_registros;
 * → inserir 4 linhas: metrica_id = 'total_diagnosticos' | 'total_vata' | 'total_pitta' | 'total_kapha'
 *   percentual = NULL, n_base = <valor>
 *
 * -- 2. Distribuição doshas % (familia: 'distribuicao_dosha')
 * SELECT doshaprincipal, COUNT(*) as n,
 *   ROUND(COUNT(*)*100.0 / SUM(COUNT(*)) OVER(), 1) as pct
 * FROM doshas_registros WHERE doshaprincipal IS NOT NULL
 * GROUP BY doshaprincipal ORDER BY n DESC;
 * → metrica_id = nome do dosha (ex: 'Vata'), percentual = pct, n_base = n
 *
 * -- 3. Agni distribuição % (familia: 'agni')
 * SELECT "agniPrincipal", COUNT(*) as n,
 *   ROUND(COUNT(*)*100.0 / SUM(COUNT(*)) OVER(), 1) as pct
 * FROM doshas_registros
 * WHERE "agniPrincipal" IS NOT NULL AND "agniPrincipal" != ''
 * GROUP BY "agniPrincipal" ORDER BY n DESC;
 *
 * -- 4. IMC médio por dosha (familia: 'imc_dosha')
 * SELECT doshaprincipal, ROUND(AVG(imc)::numeric,1) as imc_medio, COUNT(*) as n
 * FROM doshas_registros
 * WHERE doshaprincipal IN ('Vata','Pitta','Kapha') AND imc > 10 AND imc < 60
 * GROUP BY doshaprincipal;
 * → metrica_id = 'Vata' | 'Pitta' | 'Kapha', percentual = imc_medio, n_base = n
 *
 * -- 5. Idade por dosha (familia: 'idade_dosha')
 * SELECT doshaprincipal,
 *   CASE WHEN idade<30 THEN 'Até 30'
 *        WHEN idade<=45 THEN '30–45'
 *        WHEN idade<=60 THEN '46–60'
 *        ELSE '60+' END as faixa,
 *   COUNT(*) as n,
 *   ROUND(COUNT(*)*100.0 / SUM(COUNT(*)) OVER (PARTITION BY doshaprincipal), 1) as pct
 * FROM doshas_registros
 * WHERE doshaprincipal IN ('Vata','Pitta','Kapha') AND idade BETWEEN 10 AND 100
 * GROUP BY doshaprincipal, faixa;
 * → metrica_id = '<dosha>|<faixa>' (ex: 'Vata|30–45'), percentual = pct, n_base = n
 *
 * -- 6/7/8. Top sintomas Vata/Pitta/Kapha % (familia: 'sintomas_vata' | 'sintomas_pitta' | 'sintomas_kapha')
 * WITH base AS (SELECT COUNT(*) as tot FROM doshas_registros
 *   WHERE "agravVataTags" IS NOT NULL AND "agravVataTags" != '')
 * SELECT trim(tag) as tag, COUNT(*) as n,
 *   ROUND(COUNT(*)*100.0 / (SELECT tot FROM base), 1) as pct
 * FROM doshas_registros, unnest(string_to_array("agravVataTags",',')) as tag
 * WHERE "agravVataTags" IS NOT NULL AND "agravVataTags" != ''
 * GROUP BY trim(tag) ORDER BY n DESC LIMIT 10;
 * → metrica_id = tag, percentual = pct, n_base = n
 *
 * -- 9/10/11. Alimentos agravantes Vata/Pitta/Kapha (familia: 'alim_vata' | 'alim_pitta' | 'alim_kapha')
 * Idem sintomas, com coluna alimVata/alimPitta/alimKapha, LIMIT 8.
 *
 * -- 12. Akasha KPIs (familia: 'akasha_kpi')
 * SELECT COUNT(*) as total_msgs, COUNT(DISTINCT session_id) as usuarios_unicos,
 *   COUNT(*) FILTER (WHERE message->>'type'='human') as msgs_humanas,
 *   ROUND(COUNT(*)::numeric / NULLIF(COUNT(DISTINCT session_id),0), 0) as media_por_usuario,
 *   MAX(cnt) as pico_usuario
 * FROM chat_histories,
 *   LATERAL (SELECT COUNT(*) as cnt FROM chat_histories c2
 *            WHERE c2.session_id = chat_histories.session_id) s;
 * → 5 linhas: metrica_id = nome do KPI, n_base = valor
 *
 * -- 13. Akasha msgs por dia (familia: 'akasha_diario') — últimos 30 dias
 * → metrica_id = 'YYYY-MM-DD', percentual = usuarios_ativos, n_base = msgs_humanas
 *
 * -- 14. Ritmo de testes diário (familia: 'testes_diario') — últimos 30 dias
 * → metrica_id = 'YYYY-MM-DD', n_base = total
 */

import { supabase } from "@/integrations/supabase/client";

export interface SnapshotRow {
  metrica_id: string;
  categoria: string;
  familia: string;
  descricao: string;
  percentual: number | null;
  n_base: number | null;
  data_calculo: string;
}

export interface MetricItem {
  label: string;
  pct: number | null;
  n: number | null;
}

export interface MetricasData {
  dataCalculo: string | null;
  kpis: { total: number; vata: number; pitta: number; kapha: number; akashaMsgs: number };
  distDoshas: MetricItem[];
  agni: MetricItem[];
  imcDosha: { dosha: string; imc: number; n: number }[];
  idadeDosha: Record<"Vata" | "Pitta" | "Kapha", { faixa: string; pct: number; n: number }[]>;
  sintomas: Record<"Vata" | "Pitta" | "Kapha", MetricItem[]>;
  alimentos: Record<"Vata" | "Pitta" | "Kapha", MetricItem[]>;
  akashaKpi: { totalMsgs: number; usuariosUnicos: number; mediaPorUsuario: number; picoUsuario: number };
  akashaDiario: { dia: string; msgs: number; usuariosAtivos: number }[];
  testesDiario: { dia: string; total: number }[];
}

const FAMILIAS_BRIEFING = [
  "kpi_geral",
  "distribuicao_dosha",
  "agni",
  "imc_dosha",
  "idade_dosha",
  "sintomas_vata",
  "sintomas_pitta",
  "sintomas_kapha",
  "alim_vata",
  "alim_pitta",
  "alim_kapha",
  "akasha_kpi",
  "akasha_diario",
  "testes_diario",
];

// ───────────────────────── helpers ─────────────────────────

const splitTags = (s: string | null) =>
  (s ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

const normalizeDosha = (d: string | null): "Vata" | "Pitta" | "Kapha" | null => {
  if (!d) return null;
  const lower = d.toLowerCase();
  if (lower.startsWith("vata")) return "Vata";
  if (lower.startsWith("pitta")) return "Pitta";
  if (lower.startsWith("kapha")) return "Kapha";
  return null;
};

const faixaIdade = (idade: number) => {
  if (idade < 30) return "Até 30";
  if (idade <= 45) return "30–45";
  if (idade <= 60) return "46–60";
  return "60+";
};

// ───────────────────────── snapshot ─────────────────────────

async function readSnapshot(): Promise<{ rows: SnapshotRow[]; data: string | null }> {
  const { data: latest } = await supabase
    .from("metricas_snapshot")
    .select("data_calculo")
    .in("familia", FAMILIAS_BRIEFING)
    .order("data_calculo", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!latest?.data_calculo) return { rows: [], data: null };

  const { data } = await supabase
    .from("metricas_snapshot")
    .select("metrica_id, categoria, familia, descricao, percentual, n_base, data_calculo")
    .eq("data_calculo", latest.data_calculo)
    .in("familia", FAMILIAS_BRIEFING);

  return { rows: (data ?? []) as SnapshotRow[], data: latest.data_calculo };
}

// ───────────────────────── live fallback (paginated) ─────────────────────────

async function fetchAllRegistros() {
  const PAGE = 1000;
  let offset = 0;
  const all: any[] = [];
  while (true) {
    const { data, error } = await supabase
      .from("doshas_registros")
      .select(
        'doshaprincipal, "agniPrincipal", imc, idade, "agravVataTags", "agravPittaTags", "agravKaphaTags", "alimVata", "alimPitta", "alimKapha", created_at',
      )
      .range(offset, offset + PAGE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < PAGE) break;
    offset += PAGE;
  }
  return all;
}

async function fetchChatHistories30d() {
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const { data, error } = await supabase
    .from("chat_histories")
    .select("session_id, data_hora, message")
    .gte("data_hora", since.toISOString())
    .order("data_hora", { ascending: true })
    .limit(50000);
  if (error) throw error;
  return data ?? [];
}

async function fetchChatTotals() {
  // Total geral (head/count) e sessions distintos via amostra (limit grande)
  const { count } = await supabase
    .from("chat_histories")
    .select("session_id", { count: "exact", head: true });
  // Para usuarios unicos / pico: pegamos amostra grande
  const { data } = await supabase
    .from("chat_histories")
    .select("session_id, message")
    .limit(50000);
  return { totalCount: count ?? 0, sample: data ?? [] };
}

async function buildLiveData(): Promise<Omit<MetricasData, "dataCalculo">> {
  const [registros, chats30, chatTotals] = await Promise.all([
    fetchAllRegistros(),
    fetchChatHistories30d(),
    fetchChatTotals(),
  ]);

  // KPIs
  const total = registros.length;
  let vata = 0,
    pitta = 0,
    kapha = 0;
  for (const r of registros) {
    const d = normalizeDosha(r.doshaprincipal);
    if (d === "Vata") vata++;
    else if (d === "Pitta") pitta++;
    else if (d === "Kapha") kapha++;
  }

  // Distribuição (mantém combinados)
  const distMap = new Map<string, number>();
  for (const r of registros) {
    if (!r.doshaprincipal) continue;
    distMap.set(r.doshaprincipal, (distMap.get(r.doshaprincipal) ?? 0) + 1);
  }
  const totalDosha = Array.from(distMap.values()).reduce((a, b) => a + b, 0) || 1;
  const distDoshas: MetricItem[] = Array.from(distMap.entries())
    .map(([label, n]) => ({ label, n, pct: Math.round((n * 1000) / totalDosha) / 10 }))
    .sort((a, b) => (b.n ?? 0) - (a.n ?? 0));

  // Agni
  const agniMap = new Map<string, number>();
  for (const r of registros) {
    const a = (r.agniPrincipal ?? "").trim();
    if (!a) continue;
    agniMap.set(a, (agniMap.get(a) ?? 0) + 1);
  }
  const totalAgni = Array.from(agniMap.values()).reduce((a, b) => a + b, 0) || 1;
  const agni: MetricItem[] = Array.from(agniMap.entries())
    .map(([label, n]) => ({ label, n, pct: Math.round((n * 1000) / totalAgni) / 10 }))
    .sort((a, b) => (b.n ?? 0) - (a.n ?? 0));

  // IMC por dosha
  const imcAgg: Record<"Vata" | "Pitta" | "Kapha", { sum: number; n: number }> = {
    Vata: { sum: 0, n: 0 },
    Pitta: { sum: 0, n: 0 },
    Kapha: { sum: 0, n: 0 },
  };
  for (const r of registros) {
    const d = normalizeDosha(r.doshaprincipal);
    if (!d) continue;
    const imc = Number(r.imc);
    if (!imc || imc <= 10 || imc >= 60) continue;
    imcAgg[d].sum += imc;
    imcAgg[d].n += 1;
  }
  const imcDosha = (["Vata", "Pitta", "Kapha"] as const).map((d) => ({
    dosha: d,
    imc: imcAgg[d].n ? Math.round((imcAgg[d].sum / imcAgg[d].n) * 10) / 10 : 0,
    n: imcAgg[d].n,
  }));

  // Idade por dosha (% dentro de cada dosha)
  const idadeAgg: Record<"Vata" | "Pitta" | "Kapha", Map<string, number>> = {
    Vata: new Map(),
    Pitta: new Map(),
    Kapha: new Map(),
  };
  for (const r of registros) {
    const d = normalizeDosha(r.doshaprincipal);
    const idade = Number(r.idade);
    if (!d || !idade || idade < 10 || idade > 100) continue;
    const f = faixaIdade(idade);
    idadeAgg[d].set(f, (idadeAgg[d].get(f) ?? 0) + 1);
  }
  const idadeDosha = (["Vata", "Pitta", "Kapha"] as const).reduce(
    (acc, d) => {
      const tot = Array.from(idadeAgg[d].values()).reduce((a, b) => a + b, 0) || 1;
      acc[d] = ["Até 30", "30–45", "46–60", "60+"].map((f) => {
        const n = idadeAgg[d].get(f) ?? 0;
        return { faixa: f, n, pct: Math.round((n * 1000) / tot) / 10 };
      });
      return acc;
    },
    {} as MetricasData["idadeDosha"],
  );

  // Sintomas e alimentos
  const buildTagAgg = (col: "agravVataTags" | "agravPittaTags" | "agravKaphaTags" | "alimVata" | "alimPitta" | "alimKapha", limit: number, normalize = false) => {
    const map = new Map<string, number>();
    let totalCom = 0;
    for (const r of registros) {
      const raw = r[col] as string | null;
      const tags = splitTags(raw);
      if (tags.length === 0) continue;
      totalCom++;
      const seen = new Set<string>();
      for (const t of tags) {
        const key = normalize ? t.toLowerCase() : t;
        if (!key || seen.has(key)) continue;
        seen.add(key);
        map.set(key, (map.get(key) ?? 0) + 1);
      }
    }
    const den = totalCom || 1;
    return Array.from(map.entries())
      .map(([label, n]) => ({ label, n, pct: Math.round((n * 1000) / den) / 10 }))
      .sort((a, b) => (b.n ?? 0) - (a.n ?? 0))
      .slice(0, limit);
  };

  const sintomas: MetricasData["sintomas"] = {
    Vata: buildTagAgg("agravVataTags", 10),
    Pitta: buildTagAgg("agravPittaTags", 10),
    Kapha: buildTagAgg("agravKaphaTags", 10),
  };
  const alimentos: MetricasData["alimentos"] = {
    Vata: buildTagAgg("alimVata", 6, true),
    Pitta: buildTagAgg("alimPitta", 6, true),
    Kapha: buildTagAgg("alimKapha", 6, true),
  };

  // Akasha KPIs
  const sessions = new Set<string>();
  const sessionMsgs = new Map<string, number>();
  let msgsHumanas = 0;
  for (const c of chatTotals.sample) {
    const s = c.session_id ?? "";
    if (s) {
      sessions.add(s);
      sessionMsgs.set(s, (sessionMsgs.get(s) ?? 0) + 1);
    }
    const msg: any = c.message;
    if (msg && (msg.type === "human" || msg?.message?.type === "human")) msgsHumanas++;
  }
  const totalMsgs = chatTotals.totalCount || chatTotals.sample.length;
  const usuariosUnicos = sessions.size;
  const mediaPorUsuario = usuariosUnicos ? Math.round(totalMsgs / usuariosUnicos) : 0;
  const picoUsuario = sessionMsgs.size ? Math.max(...sessionMsgs.values()) : 0;

  // Akasha diário
  const akashaDayMap = new Map<string, { msgs: number; usuarios: Set<string> }>();
  for (const c of chats30) {
    const dia = (c.data_hora ?? "").slice(0, 10);
    if (!dia) continue;
    const cur = akashaDayMap.get(dia) ?? { msgs: 0, usuarios: new Set() };
    const msg: any = c.message;
    if (msg && (msg.type === "human" || msg?.message?.type === "human")) cur.msgs++;
    if (c.session_id) cur.usuarios.add(c.session_id);
    akashaDayMap.set(dia, cur);
  }
  const akashaDiario = Array.from(akashaDayMap.entries())
    .map(([dia, v]) => ({ dia, msgs: v.msgs, usuariosAtivos: v.usuarios.size }))
    .sort((a, b) => a.dia.localeCompare(b.dia));

  // Testes diário 30d
  const since30 = new Date();
  since30.setDate(since30.getDate() - 30);
  const testesMap = new Map<string, number>();
  for (const r of registros) {
    if (!r.created_at) continue;
    const d = new Date(r.created_at);
    if (d < since30) continue;
    const dia = r.created_at.slice(0, 10);
    testesMap.set(dia, (testesMap.get(dia) ?? 0) + 1);
  }
  const testesDiario = Array.from(testesMap.entries())
    .map(([dia, total]) => ({ dia, total }))
    .sort((a, b) => a.dia.localeCompare(b.dia));

  return {
    kpis: { total, vata, pitta, kapha, akashaMsgs: totalMsgs },
    distDoshas,
    agni,
    imcDosha,
    idadeDosha,
    sintomas,
    alimentos,
    akashaKpi: { totalMsgs, usuariosUnicos, mediaPorUsuario, picoUsuario },
    akashaDiario,
    testesDiario,
  };
}

// ───────────────────────── orquestração ─────────────────────────

export async function fetchMetricas(): Promise<MetricasData> {
  const { rows: snap, data: snapData } = await readSnapshot();
  const present = new Set(snap.map((r) => r.familia));
  const live = await buildLiveData();

  // Helpers que tentam o snapshot, senão caem no live.
  const fromSnap = (familia: string) => snap.filter((r) => r.familia === familia);

  // KPIs gerais
  let kpis = live.kpis;
  if (present.has("kpi_geral")) {
    const map = new Map(fromSnap("kpi_geral").map((r) => [r.metrica_id, r.n_base ?? 0]));
    kpis = {
      total: map.get("total_diagnosticos") ?? live.kpis.total,
      vata: map.get("total_vata") ?? live.kpis.vata,
      pitta: map.get("total_pitta") ?? live.kpis.pitta,
      kapha: map.get("total_kapha") ?? live.kpis.kapha,
      akashaMsgs: live.kpis.akashaMsgs,
    };
  }

  // Distribuição
  let distDoshas = live.distDoshas;
  if (present.has("distribuicao_dosha")) {
    distDoshas = fromSnap("distribuicao_dosha")
      .map((r) => ({ label: r.metrica_id, pct: r.percentual ?? 0, n: r.n_base ?? 0 }))
      .sort((a, b) => (b.n ?? 0) - (a.n ?? 0));
  }

  // Agni
  let agni = live.agni;
  if (present.has("agni")) {
    agni = fromSnap("agni")
      .map((r) => ({ label: r.metrica_id, pct: r.percentual ?? 0, n: r.n_base ?? 0 }))
      .sort((a, b) => (b.n ?? 0) - (a.n ?? 0));
  }

  // IMC
  let imcDosha = live.imcDosha;
  if (present.has("imc_dosha")) {
    imcDosha = fromSnap("imc_dosha").map((r) => ({
      dosha: r.metrica_id,
      imc: Number(r.percentual ?? 0),
      n: r.n_base ?? 0,
    }));
  }

  // Idade × Dosha
  let idadeDosha = live.idadeDosha;
  if (present.has("idade_dosha")) {
    const acc: MetricasData["idadeDosha"] = { Vata: [], Pitta: [], Kapha: [] };
    for (const r of fromSnap("idade_dosha")) {
      const [d, faixa] = r.metrica_id.split("|");
      if (d === "Vata" || d === "Pitta" || d === "Kapha") {
        acc[d].push({ faixa, pct: r.percentual ?? 0, n: r.n_base ?? 0 });
      }
    }
    idadeDosha = acc;
  }

  // Sintomas
  const sintomas = { ...live.sintomas };
  (["vata", "pitta", "kapha"] as const).forEach((d) => {
    const fam = `sintomas_${d}`;
    if (present.has(fam)) {
      const dosha = (d.charAt(0).toUpperCase() + d.slice(1)) as "Vata" | "Pitta" | "Kapha";
      sintomas[dosha] = fromSnap(fam).map((r) => ({
        label: r.metrica_id,
        pct: r.percentual ?? 0,
        n: r.n_base ?? 0,
      }));
    }
  });

  // Alimentos
  const alimentos = { ...live.alimentos };
  (["vata", "pitta", "kapha"] as const).forEach((d) => {
    const fam = `alim_${d}`;
    if (present.has(fam)) {
      const dosha = (d.charAt(0).toUpperCase() + d.slice(1)) as "Vata" | "Pitta" | "Kapha";
      alimentos[dosha] = fromSnap(fam).map((r) => ({
        label: r.metrica_id,
        pct: r.percentual ?? 0,
        n: r.n_base ?? 0,
      }));
    }
  });

  // Akasha KPI
  let akashaKpi = live.akashaKpi;
  if (present.has("akasha_kpi")) {
    const map = new Map(fromSnap("akasha_kpi").map((r) => [r.metrica_id, r.n_base ?? 0]));
    akashaKpi = {
      totalMsgs: map.get("total_msgs") ?? live.akashaKpi.totalMsgs,
      usuariosUnicos: map.get("usuarios_unicos") ?? live.akashaKpi.usuariosUnicos,
      mediaPorUsuario: map.get("media_por_usuario") ?? live.akashaKpi.mediaPorUsuario,
      picoUsuario: map.get("pico_usuario") ?? live.akashaKpi.picoUsuario,
    };
    kpis = { ...kpis, akashaMsgs: akashaKpi.totalMsgs };
  }

  // Akasha diário
  let akashaDiario = live.akashaDiario;
  if (present.has("akasha_diario")) {
    akashaDiario = fromSnap("akasha_diario")
      .map((r) => ({ dia: r.metrica_id, msgs: r.n_base ?? 0, usuariosAtivos: Number(r.percentual ?? 0) }))
      .sort((a, b) => a.dia.localeCompare(b.dia));
  }

  // Testes diário
  let testesDiario = live.testesDiario;
  if (present.has("testes_diario")) {
    testesDiario = fromSnap("testes_diario")
      .map((r) => ({ dia: r.metrica_id, total: r.n_base ?? 0 }))
      .sort((a, b) => a.dia.localeCompare(b.dia));
  }

  return {
    dataCalculo: snapData,
    kpis,
    distDoshas,
    agni,
    imcDosha,
    idadeDosha,
    sintomas,
    alimentos,
    akashaKpi,
    akashaDiario,
    testesDiario,
  };
}
