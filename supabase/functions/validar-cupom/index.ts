// Edge function: validar-cupom (v7)
// Valida um cupom da tabela loja.cupons e retorna o desconto calculado.
// v7: falhas de regra de negócio (expirado, esgotado, inativo...) retornam
// HTTP 200 com { valido:false, erro } para o front exibir a mensagem amigável
// (antes retornavam 400/404 e o front mostrava "Edge Function returned a non-2xx status code").
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Body = {
  codigo?: string;
  subtotal?: number;
  email_comprador?: string | null;
  user_id?: string | null;
  escopo?: string;
};

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// Falha de regra de negócio: SEMPRE 200, o front lê { valido:false, erro }
const invalido = (erro: string) => json(200, { valido: false, erro });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  let payload: Body;
  try {
    payload = await req.json();
  } catch {
    return invalido("Payload inválido");
  }

  const codigo = String(payload.codigo || "").trim().toUpperCase();
  const subtotal = Number(payload.subtotal || 0);
  const escopoReq = String(payload.escopo || "loja");
  const userId = payload.user_id ?? null;
  const email = (payload.email_comprador || "").trim().toLowerCase() || null;

  if (!codigo) return invalido("Informe um código");
  if (!(subtotal > 0)) return invalido("Subtotal inválido");

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const db = createClient(supabaseUrl, serviceKey, {
    db: { schema: "loja" },
    auth: { persistSession: false },
  });
  const dbPublic = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const { data: cupom, error } = await db
    .from("cupons")
    .select("*")
    .ilike("codigo", codigo)
    .maybeSingle();

  if (error) return invalido("Erro ao buscar cupom, tente novamente");
  if (!cupom) return invalido("Cupom não encontrado");

  if (!cupom.ativo) return invalido("Cupom inativo");

  const now = new Date();
  if (cupom.valido_de && new Date(cupom.valido_de) > now)
    return invalido("Cupom ainda não está válido");
  if (cupom.valido_ate && new Date(cupom.valido_ate) < now)
    return invalido("Este cupom expirou. Fale com a gente no WhatsApp que renovamos para você!");

  // Escopo: aceita "ambos" ou igual ao requisitado
  if (cupom.escopo && cupom.escopo !== "ambos" && cupom.escopo !== escopoReq)
    return invalido("Cupom não válido para esta compra");

  // Limite total de usos
  if (
    cupom.limite_usos_total != null &&
    Number(cupom.usos_realizados || 0) >= Number(cupom.limite_usos_total)
  )
    return invalido("Cupom esgotado");

  // Limite por usuário
  if (cupom.limite_usos_por_usuario != null && (userId || email)) {
    let q = db.from("cupom_usos").select("id", { count: "exact", head: true }).eq("cupom_id", cupom.id);
    if (userId) q = q.eq("user_id", userId);
    else if (email) q = q.eq("email_comprador", email);
    const { count } = await q;
    if ((count ?? 0) >= Number(cupom.limite_usos_por_usuario))
      return invalido("Você já utilizou este cupom o número máximo de vezes");
  }

  // Regras por tipo
  if (cupom.tipo_cupom === "premium") {
    if (!userId) return invalido("Faça login para usar este cupom");
    const { data: prof } = await dbPublic
      .from("user_profiles")
      .select("is_premium")
      .eq("id", userId)
      .maybeSingle();
    if (!prof?.is_premium)
      return invalido("Cupom exclusivo para assinantes Premium");
  }

  // Cálculo do desconto sobre o subtotal (sem frete)
  const tipoDesc = String(cupom.tipo_desconto || "percentual");
  const valor = Number(cupom.valor_desconto || 0);
  let desconto = 0;
  if (tipoDesc === "percentual") {
    desconto = (subtotal * valor) / 100;
  } else {
    desconto = valor;
  }
  desconto = Math.min(Math.max(desconto, 0), subtotal);
  desconto = Math.round(desconto * 100) / 100;

  return json(200, {
    valido: true,
    cupom: {
      cupom_id: cupom.id,
      codigo: cupom.codigo,
      descricao: cupom.descricao,
      tipo_cupom: cupom.tipo_cupom,
      tipo_desconto: tipoDesc,
      valor_desconto: valor,
      desconto_calculado: desconto,
    },
  });
});
