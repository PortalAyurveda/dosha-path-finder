// Envia email transacional para alunos da Formação via Brevo (gateway Lovable).
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/brevo";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { to, nome, subject, message, extra_record } = await req.json();
    if (!to || !subject || !message) {
      return new Response(JSON.stringify({ error: "Campos obrigatórios faltando" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
    if (!LOVABLE_API_KEY || !BREVO_API_KEY) {
      return new Response(
        JSON.stringify({
          error:
            "Brevo não configurado. Conecte o connector Brevo no painel da Lovable.",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const numeroPedido = extra_record?.numero_pedido;
    const html = `
      <div style="font-family: Arial, sans-serif; color:#352F54; line-height:1.6;">
        <p>Olá ${String(nome || "").split(" ")[0] || ""},</p>
        ${numeroPedido ? `<p style="font-size:13px;color:#666;">Referente ao pedido <strong>#${numeroPedido}</strong></p>` : ""}
        <div>${String(message).replace(/\n/g, "<br/>")}</div>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
        <p style="font-size:12px;color:#888;">
          Portal Ayurveda<br/>
          Esta mensagem foi enviada pela equipe do Portal Ayurveda.
        </p>
      </div>
    `;

    const res = await fetch(`${GATEWAY_URL}/smtp/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: "Edson — Portal Ayurveda", email: "contato@portalayurveda.com" },
        to: [{ email: to, name: nome || to }],
        subject,
        htmlContent: html,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: data?.message || `Brevo erro ${res.status}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ ok: true, messageId: data?.messageId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
