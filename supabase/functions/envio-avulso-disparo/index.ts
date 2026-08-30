import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const WEBHOOK = "https://n8n.portalayurveda.com/webhook/envio-avulso-disparo";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return json({ error: "não autenticado" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      return json({ error: "não autenticado" }, 401);
    }

    const { data: ehAdmin, error: adminErr } = await supabase.rpc("is_admin");
    if (adminErr || ehAdmin !== true) {
      return json({ error: "acesso restrito" }, 403);
    }

    let id = "";
    try {
      const body = await req.json();
      id = typeof body?.id === "string" ? body.id : "";
    } catch {
      id = "";
    }

    const uuidRe =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRe.test(id)) {
      return json({ error: "id inválido" }, 400);
    }

    const resp = await fetch(`${WEBHOOK}?id=${encodeURIComponent(id)}`, {
      method: "GET",
    });

    if (!resp.ok) {
      const texto = await resp.text().catch(() => "");
      return json(
        { error: `webhook respondeu ${resp.status}`, detalhe: texto.slice(0, 500) },
        502,
      );
    }

    return json({ ok: true });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
