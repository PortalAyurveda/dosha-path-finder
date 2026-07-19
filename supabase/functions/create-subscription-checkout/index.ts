import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@17.5.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2024-12-18.acacia",
});

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

const PLANOS = {
  rotina: { nome: "Portal Ayurveda — Rotina personalizada (mensal)", unit_amount: 3000, interval: "month" as const, rank: 1 },
  mensal: { nome: "Portal Ayurveda Premium — Mensal", unit_amount: 7990, interval: "month" as const, rank: 2 },
  anual:  { nome: "Portal Ayurveda Premium — Anual", unit_amount: 59700, interval: "year" as const,  rank: 3 },
};

const NOMES_AMIGAVEIS: Record<string, string> = {
  rotina: "Minha Rotina",
  mensal: "Premium Mensal",
  anual: "Premium Anual",
};

type PlanoKey = keyof typeof PLANOS;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const plano = body?.plano as PlanoKey | undefined;
    const email = typeof body?.email === "string" ? body.email : null;
    const user_id = typeof body?.user_id === "string" ? body.user_id : null;
    const confirmar_upgrade = body?.confirmar_upgrade === true;

    if (!plano || !PLANOS[plano]) return json({ error: "Plano inválido" }, 400);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: "Email obrigatório" }, 400);
    }

    const cfg = PLANOS[plano];
    const origin = req.headers.get("origin") ?? "https://portalayurveda.com";

    // Consulta perfil por email (service role)
    const { data: perfil } = await supabaseAdmin
      .from("user_profiles")
      .select("id, email, plano, subscription_status, stripe_subscription_id, stripe_customer_id")
      .ilike("email", email)
      .maybeSingle();

    const jaAtivo = perfil?.subscription_status === "active";
    const planoAtual = (perfil?.plano ?? null) as PlanoKey | null;
    const rankAtual = planoAtual && PLANOS[planoAtual] ? PLANOS[planoAtual].rank : 0;

    if (jaAtivo && planoAtual) {
      // Upgrade para plano superior
      if (cfg.rank > rankAtual && perfil?.stripe_subscription_id) {
        if (!confirmar_upgrade) {
          const mensagem =
            `Você já está no plano ${NOMES_AMIGAVEIS[planoAtual]}. ` +
            `Podemos fazer o upgrade para ${NOMES_AMIGAVEIS[plano]} agora mesmo — ` +
            `você paga só a diferença proporcional pelo tempo restante do ciclo atual, ` +
            `e a partir do próximo ciclo já entra o valor do plano novo. Tudo continua no mesmo cartão.`;
          return json({
            upgrade_disponivel: true,
            plano_atual: planoAtual,
            plano_novo: plano,
            mensagem,
          });
        }

        // Executa upgrade
        try {
          const sub = await stripe.subscriptions.retrieve(perfil.stripe_subscription_id);
          const itemId = sub.items.data[0]?.id;
          if (!itemId) throw new Error("Assinatura sem item ativo no Stripe");

          await stripe.subscriptions.update(perfil.stripe_subscription_id, {
            items: [{
              id: itemId,
              price_data: {
                currency: "brl",
                unit_amount: cfg.unit_amount,
                recurring: { interval: cfg.interval },
                product_data: { name: cfg.nome },
              },
            }],
            proration_behavior: "always_invoice",
            metadata: { user_id: user_id ?? perfil.id ?? "", plano },
          });

          await supabaseAdmin
            .from("user_profiles")
            .update({
              plano,
              is_premium: true,
              subscription_status: "active",
            })
            .eq("id", perfil.id);

          return json({ upgrade_ok: true, plano_novo: plano });
        } catch (err) {
          console.error("upgrade error:", err);
          return json({
            error: "Não conseguimos concluir o upgrade agora. Tente novamente em instantes ou abra o portal de assinatura.",
          }, 400);
        }
      }

      // Mesmo plano ou plano inferior — abre billing portal
      try {
        let customerId = perfil?.stripe_customer_id ?? null;
        if (!customerId) {
          const found = await stripe.customers.list({ email, limit: 1 });
          customerId = found.data[0]?.id ?? null;
        }
        if (!customerId) throw new Error("Cliente Stripe não encontrado");

        const portal = await stripe.billingPortal.sessions.create({
          customer: customerId,
          return_url: origin + "/assinar",
        });
        return json({ url: portal.url, ja_assinante: true, plano_atual: planoAtual });
      } catch (err) {
        console.error("billing portal error:", err);
        return json({
          error: "Não conseguimos abrir seu painel de assinatura agora. Escreva para a gente e resolvemos rapidinho.",
        }, 400);
      }
    }

    // Sem assinatura ativa — fluxo original
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [{
        quantity: 1,
        price_data: {
          currency: "brl",
          unit_amount: cfg.unit_amount,
          recurring: { interval: cfg.interval },
          product_data: { name: cfg.nome },
        },
      }],
      success_url: plano === "rotina" ? origin + "/minha-rotina?assinatura=ok" : origin + "/?premium=ok",
      cancel_url:  plano === "rotina" ? origin + "/minha-rotina?canceled=1"  : origin + "/assinar?canceled=1",
      metadata: { user_id: user_id ?? "", plano },
      subscription_data: { metadata: { user_id: user_id ?? "", plano } },
    });

    return json({ url: session.url });
  } catch (err) {
    console.error("create-subscription-checkout error:", err);
    return json({ error: (err as Error).message }, 500);
  }
});
