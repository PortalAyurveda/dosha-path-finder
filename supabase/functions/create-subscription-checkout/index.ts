import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import Stripe from "npm:stripe@17.5.0";
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", { apiVersion: "2024-12-18.acacia" });
const PLANOS = {
  rotina: { nome: "Portal Ayurveda — Rotina personalizada (mensal)", unit_amount: 3000, interval: "month" as const },
  mensal: { nome: "Portal Ayurveda Premium — Mensal", unit_amount: 7990, interval: "month" as const },
  anual:  { nome: "Portal Ayurveda Premium — Anual", unit_amount: 59700, interval: "year" as const },
};
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = await req.json().catch(() => ({}));
    const plano = body?.plano as "rotina" | "mensal" | "anual" | undefined;
    const email = typeof body?.email === "string" ? body.email : null;
    const user_id = typeof body?.user_id === "string" ? body.user_id : null;
    if (!plano || !PLANOS[plano]) return new Response(JSON.stringify({ error: "Plano inválido" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return new Response(JSON.stringify({ error: "Email obrigatório" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const cfg = PLANOS[plano];
    const origin = req.headers.get("origin") ?? "https://portalayurveda.com";
    const session = await stripe.checkout.sessions.create({
      mode: "subscription", payment_method_types: ["card"], customer_email: email,
      line_items: [{ quantity: 1, price_data: { currency: "brl", unit_amount: cfg.unit_amount, recurring: { interval: cfg.interval }, product_data: { name: cfg.nome } } }],
      success_url: plano === "rotina" ? origin + "/minha-rotina?assinatura=ok" : origin + "/?premium=ok",
      cancel_url:  plano === "rotina" ? origin + "/minha-rotina?canceled=1"  : origin + "/assinar?canceled=1",
      metadata: { user_id: user_id ?? "", plano },
      subscription_data: { metadata: { user_id: user_id ?? "", plano } },
    });
    return new Response(JSON.stringify({ url: session.url }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("create-subscription-checkout error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
