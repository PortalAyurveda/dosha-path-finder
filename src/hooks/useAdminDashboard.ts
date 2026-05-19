import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { lojaSupabase } from "@/integrations/supabase/loja-client";

const startOfTodayISO = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};
const days7AgoISO = () => {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

type CountRange = { hoje: number; semana: number };

const countRange = async (
  table: string,
  col: string,
): Promise<CountRange> => {
  const today = startOfTodayISO();
  const week = days7AgoISO();
  const [a, b] = await Promise.all([
    supabase.from(table as never).select("*", { count: "exact", head: true }).gte(col, today),
    supabase.from(table as never).select("*", { count: "exact", head: true }).gte(col, week),
  ]);
  return { hoje: a.count ?? 0, semana: b.count ?? 0 };
};

export const useUltimaImagem = () =>
  useQuery({
    queryKey: ["admin-dash", "ultima-imagem"],
    queryFn: async () => {
      const { data } = await supabase
        .from("portal_conteudo")
        .select("id, title, image_url, created_at")
        .not("image_url", "is", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

export const useUltimoArtigo = () =>
  useQuery({
    queryKey: ["admin-dash", "ultimo-artigo"],
    queryFn: async () => {
      const { data } = await supabase
        .from("portal_conteudo")
        .select("id, title, summary, created_at, link_do_artigo, status")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

export const useAkashaHoje = () =>
  useQuery({
    queryKey: ["admin-dash", "akasha"],
    queryFn: async (): Promise<CountRange & { sessoesHoje: number; sessoesSemana: number }> => {
      const today = startOfTodayISO();
      const week = days7AgoISO();
      const [hojeRes, semanaRes] = await Promise.all([
        supabase
          .from("chat_histories")
          .select("session_id, data_hora")
          .gte("data_hora", today)
          .limit(5000),
        supabase
          .from("chat_histories")
          .select("session_id, data_hora")
          .gte("data_hora", week)
          .limit(20000),
      ]);
      const hojeMsgs = hojeRes.data?.length ?? 0;
      const semanaMsgs = semanaRes.data?.length ?? 0;
      const sessoesHoje = new Set((hojeRes.data ?? []).map((r) => r.session_id)).size;
      const sessoesSemana = new Set((semanaRes.data ?? []).map((r) => r.session_id)).size;
      return { hoje: hojeMsgs, semana: semanaMsgs, sessoesHoje, sessoesSemana };
    },
  });

export const useMensagensNaoLidas = () =>
  useQuery({
    queryKey: ["admin-dash", "mensagens"],
    queryFn: async () => {
      const { data, count } = await supabase
        .from("mensagens")
        .select("id, nome, assunto, created_at, status", { count: "exact" })
        .eq("status", "novo")
        .order("created_at", { ascending: false })
        .limit(1);
      return { total: count ?? 0, ultima: data?.[0] ?? null };
    },
  });

export const useTestesRange = () =>
  useQuery({
    queryKey: ["admin-dash", "testes"],
    queryFn: async () => {
      const r = await countRange("doshas_registros", "created_at");
      // Distribuição dosha últimos 7 dias
      const { data } = await supabase
        .from("doshas_registros")
        .select("doshaprincipal, created_at")
        .gte("created_at", days7AgoISO())
        .limit(5000);
      const dist = { vata: 0, pitta: 0, kapha: 0, outro: 0 };
      (data ?? []).forEach((row) => {
        const d = (row.doshaprincipal || "").toLowerCase();
        if (d.includes("vata") && !d.includes("pitta") && !d.includes("kapha")) dist.vata++;
        else if (d.includes("pitta") && !d.includes("kapha") && !d.includes("vata")) dist.pitta++;
        else if (d.includes("kapha") && !d.includes("vata") && !d.includes("pitta")) dist.kapha++;
        else dist.outro++;
      });
      return { ...r, dist };
    },
  });

export const useVendasRange = () =>
  useQuery({
    queryKey: ["admin-dash", "vendas"],
    queryFn: async (): Promise<{ valorHoje: number; valorSemana: number; countHoje: number; countSemana: number }> => {
      const today = startOfTodayISO();
      const week = days7AgoISO();
      const [hojeRes, semanaRes] = await Promise.all([
        lojaSupabase
          .from("pedidos")
          .select("total, status, created_at, paid_at")
          .or(`paid_at.gte.${today},and(status.eq.pago,created_at.gte.${today})`)
          .limit(500),
        lojaSupabase
          .from("pedidos")
          .select("total, status, created_at, paid_at")
          .gte("created_at", week)
          .limit(5000),
      ]);
      const sum = (rows: unknown[] | null): number => {
        let total = 0;
        for (const r of rows ?? []) {
          const row = r as { total?: number | string | null; status?: string };
          if (row.status !== "pago" && row.status !== "enviado" && row.status !== "entregue") continue;
          const v = typeof row.total === "string" ? parseFloat(row.total) : Number(row.total ?? 0);
          if (Number.isFinite(v)) total += v;
        }
        return total;
      };
      const cnt = (rows: unknown[] | null) =>
        (rows ?? []).filter((r) => {
          const row = r as { status?: string };
          return row.status === "pago" || row.status === "enviado" || row.status === "entregue";
        }).length;
      return {
        valorHoje: sum(hojeRes.data as unknown[] | null),
        valorSemana: sum(semanaRes.data as unknown[] | null),
        countHoje: cnt(hojeRes.data as unknown[] | null),
        countSemana: cnt(semanaRes.data as unknown[] | null),
      };
    },
  });

export const useAssinaturasRange = () =>
  useQuery({
    queryKey: ["admin-dash", "assinaturas"],
    queryFn: async () => {
      const today = startOfTodayISO();
      const week = days7AgoISO();
      const [h, s, total] = await Promise.all([
        supabase.from("assinaturas").select("*", { count: "exact", head: true }).gte("created_at", today),
        supabase.from("assinaturas").select("*", { count: "exact", head: true }).gte("created_at", week),
        supabase.from("assinaturas").select("*", { count: "exact", head: true }).eq("status", "active"),
      ]);
      return { hoje: h.count ?? 0, semana: s.count ?? 0, ativas: total.count ?? 0 };
    },
  });

export const useUltimoTerapeuta = () =>
  useQuery({
    queryKey: ["admin-dash", "terapeuta"],
    queryFn: async () => {
      const { data } = await supabase
        .from("portal_terapeutas")
        .select("id, nome, cidade, estado, especialidade, imagem")
        .order("created date", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

export const useUltimoDevlog = () =>
  useQuery({
    queryKey: ["admin-dash", "devlog"],
    queryFn: async () => {
      const { data } = await supabase
        .from("devlog")
        .select("id, versao, titulo, descricao, criado_em")
        .order("criado_em", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

export const useNovosUsuarios = () =>
  useQuery({
    queryKey: ["admin-dash", "novos-usuarios"],
    queryFn: async () => {
      const r = await countRange("perfis", "created_at");
      return r;
    },
  });

export const useAuditoriaRagPendente = () =>
  useQuery({
    queryKey: ["admin-dash", "auditoria-rag"],
    queryFn: async () => {
      const { count } = await supabase
        .from("auditoria_rag")
        .select("*", { count: "exact", head: true })
        .eq("akasha_status", "pendente");
      return { pendente: count ?? 0 };
    },
  });

export const useConversaoTesteAssinatura = () =>
  useQuery({
    queryKey: ["admin-dash", "conversao"],
    queryFn: async () => {
      const week = days7AgoISO();
      const [testes, assinaturas] = await Promise.all([
        supabase
          .from("doshas_registros2")
          .select("email")
          .gte("created_at", week)
          .limit(5000),
        supabase
          .from("assinaturas")
          .select("email")
          .gte("created_at", week)
          .limit(5000),
      ]);
      const emailsTeste = new Set(
        (testes.data ?? [])
          .map((r) => (r.email || "").toLowerCase().trim())
          .filter(Boolean),
      );
      const emailsAssin = new Set(
        (assinaturas.data ?? [])
          .map((r) => (r.email || "").toLowerCase().trim())
          .filter(Boolean),
      );
      let cruzamento = 0;
      emailsAssin.forEach((e) => {
        if (emailsTeste.has(e)) cruzamento++;
      });
      const totalTestes = emailsTeste.size;
      const pct = totalTestes > 0 ? (cruzamento / totalTestes) * 100 : 0;
      return {
        totalTestes,
        totalAssinaturas: emailsAssin.size,
        cruzamento,
        pct: Math.round(pct * 10) / 10,
      };
    },
  });
