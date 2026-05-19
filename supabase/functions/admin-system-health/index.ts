// Edge function: admin-system-health
// Retorna métricas de saúde (erros edge, db, auth) das últimas 24h via Supabase Management API.
// Requer SB_MGMT_ACCESS_TOKEN (Personal Access Token) configurado como secret.
// Acesso restrito a admins (checado via tabela user_roles).

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const MGMT_TOKEN = Deno.env.get("SB_MGMT_ACCESS_TOKEN");
const PROJECT_REF = "fwezkasjfguarjmjxifh";

// Cache em memória 60s
let cache: { at: number; data: unknown } | null = null;
const CACHE_MS = 60_000;

async function runLogQuery(sql: string): Promise<any[]> {
  const url =
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/analytics/endpoints/logs.all?sql=` +
    encodeURIComponent(sql);
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${MGMT_TOKEN}` },
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`mgmt api ${res.status}: ${txt.slice(0, 200)}`);
  }
  const json = await res.json();
  return json?.result ?? [];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Auth + admin check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsRes, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !claimsRes?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsRes.claims.sub;

    // checa role admin
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roles) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Sem token = retorna disponivel:false
    if (!MGMT_TOKEN) {
      return new Response(
        JSON.stringify({
          disponivel: false,
          motivo: "SB_MGMT_ACCESS_TOKEN não configurado",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 3. Cache
    if (cache && Date.now() - cache.at < CACHE_MS) {
      return new Response(JSON.stringify(cache.data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. Queries (24h)
    const sqlEdge = `
      select count(*) as erros, m.function_id as fn
      from function_edge_logs
        cross join unnest(metadata) as m
        cross join unnest(m.response) as r
      where r.status_code >= 500
        and timestamp > timestamp_sub(current_timestamp(), interval 24 hour)
      group by fn
      order by erros desc
      limit 5
    `;
    const sqlDb = `
      select count(*) as erros
      from postgres_logs
        cross join unnest(metadata) as m
        cross join unnest(m.parsed) as p
      where p.error_severity in ('ERROR','FATAL')
        and timestamp > timestamp_sub(current_timestamp(), interval 24 hour)
    `;
    const sqlDbMsg = `
      select event_message
      from postgres_logs
        cross join unnest(metadata) as m
        cross join unnest(m.parsed) as p
      where p.error_severity in ('ERROR','FATAL')
        and timestamp > timestamp_sub(current_timestamp(), interval 24 hour)
      order by timestamp desc
      limit 1
    `;
    const sqlAuth = `
      select count(*) as falhas
      from auth_logs
        cross join unnest(metadata) as m
      where safe_cast(m.status as int64) >= 400
        and timestamp > timestamp_sub(current_timestamp(), interval 24 hour)
    `;

    const settled = await Promise.allSettled([
      runLogQuery(sqlEdge),
      runLogQuery(sqlDb),
      runLogQuery(sqlDbMsg),
      runLogQuery(sqlAuth),
    ]);

    const safe = (i: number) =>
      settled[i].status === "fulfilled" ? (settled[i] as PromiseFulfilledResult<any[]>).value : [];

    const edgeRows = safe(0);
    const dbRows = safe(1);
    const dbMsgRows = safe(2);
    const authRows = safe(3);

    const edgeTotal = edgeRows.reduce((s, r) => s + Number(r.erros || 0), 0);
    const topFn = edgeRows[0]?.fn ?? null;

    const payload = {
      disponivel: true,
      janelaHoras: 24,
      edge: { erros5xx: edgeTotal, topFunction: topFn },
      db: {
        erros: Number(dbRows[0]?.erros ?? 0),
        ultimaMensagem: dbMsgRows[0]?.event_message
          ? String(dbMsgRows[0].event_message).slice(0, 180)
          : null,
      },
      auth: { falhas: Number(authRows[0]?.falhas ?? 0) },
      erros: settled
        .map((s, i) => (s.status === "rejected" ? { i, msg: String(s.reason).slice(0, 200) } : null))
        .filter(Boolean),
      geradoEm: new Date().toISOString(),
    };

    cache = { at: Date.now(), data: payload };

    return new Response(JSON.stringify(payload), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
