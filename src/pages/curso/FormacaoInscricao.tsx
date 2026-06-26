import { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2 } from "lucide-react";
import { formacaoData } from "@/data/courses/formacao";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { fetchEstados, fetchMunicipios, type IbgeEstado, type IbgeMunicipio } from "@/lib/ibge";

const ROXO = "#7b4963";
const TURMA_ID = "28aceb41-ad27-427c-94b2-c61063e97252";

type DoshaInfo = {
  registro_id: string;
  v: number;
  p: number;
  k: number;
  resultado: string;
};

const formatWhats = (raw: string) => {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

const formatCpf = (raw: string) => {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
};

const FormacaoInscricao = () => {
  const branding = formacaoData.branding;

  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [estado, setEstado] = useState("");
  const [cidade, setCidade] = useState("");
  const [comoConheceu, setComoConheceu] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [plano, setPlano] = useState<"mensal" | "outro">("mensal");
  const [planoDescricao, setPlanoDescricao] = useState("");

  const [dosha, setDosha] = useState<DoshaInfo | null>(null);
  const [doshaSearched, setDoshaSearched] = useState(false);
  const [doshaLoading, setDoshaLoading] = useState(false);

  const [estados, setEstados] = useState<IbgeEstado[]>([]);
  const [municipios, setMunicipios] = useState<IbgeMunicipio[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    fetchEstados().then(setEstados).catch(() => {});
  }, []);

  useEffect(() => {
    if (!estado) {
      setMunicipios([]);
      return;
    }
    fetchMunicipios(estado).then(setMunicipios).catch(() => setMunicipios([]));
  }, [estado]);

  const onBlurEmail = async () => {
    const v = email.trim().toLowerCase();
    if (!v || !/^\S+@\S+\.\S+$/.test(v)) return;
    setDoshaLoading(true);
    setDoshaSearched(false);
    try {
      const [{ data: doshaRow }, { data: prof }] = await Promise.all([
        supabase
          .from("doshas_registros")
          .select("id, vatascore, pittascore, kaphascore, nome")
          .eq("email", v)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("user_profiles")
          .select("nome, email")
          .eq("email", v)
          .maybeSingle(),
      ]);

      if (doshaRow) {
        const vv = doshaRow.vatascore ?? 0;
        const pp = doshaRow.pittascore ?? 0;
        const kk = doshaRow.kaphascore ?? 0;
        setDosha({
          registro_id: doshaRow.id as string,
          v: vv,
          p: pp,
          k: kk,
          resultado: `Vata ${vv} | Pitta ${pp} | Kapha ${kk}`,
        });
        if (!nome && doshaRow.nome) setNome(doshaRow.nome);
      } else {
        setDosha(null);
      }
      if (!nome) {
        const candidato = (prof?.nome as string) || (doshaRow?.nome as string) || "";
        if (candidato) setNome(candidato);
      }
      setDoshaSearched(true);
    } finally {
      setDoshaLoading(false);
    }
  };

  const objetivoCount = objetivo.trim().length;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const payload = {
        turma_id: TURMA_ID,
        email: email.trim().toLowerCase() || "—",
        nome_completo: nome.trim() || "—",
        cpf: cpf.trim() || null,
        whatsapp: whatsapp.trim() || "—",
        cidade: cidade.trim() || null,
        estado: estado.trim() || null,
        objetivo: objetivo.trim() || null,
        como_conheceu: comoConheceu.trim() || null,
        plano_pagamento: plano,
        plano_descricao: plano === "outro" ? (planoDescricao.trim() || null) : null,
        dosha_registro_id: dosha?.registro_id ?? null,
        dosha_v: dosha?.v ?? null,
        dosha_p: dosha?.p ?? null,
        dosha_k: dosha?.k ?? null,
        dosha_resultado: dosha?.resultado ?? null,
        status: "pendente",
      };

      const { error: insErr } = await supabase
        .from("escola_alunos")
        .insert(payload);
      if (insErr) throw insErr;

      setSucesso(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setError(err?.message || "Não foi possível enviar sua inscrição. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <Helmet>
        <title>Inscrição — Formação Ayurveda 2026/2027</title>
        <meta name="description" content="Formulário de inscrição para a Formação Ayurveda 2026/2027 com o prof. Edson." />
        <meta name="robots" content="noindex,follow" />
      </Helmet>

      <section
        className="relative w-full py-12 md:py-16 overflow-hidden"
        style={{ background: "#FFF8EE" }}
      >
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-20 pointer-events-none"
          style={{ background: branding.primaryColor }}
          aria-hidden
        />
        <div
          className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full opacity-15 pointer-events-none"
          style={{ background: branding.darkColor }}
          aria-hidden
        />

        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-serif italic font-bold text-[28px] md:text-[40px] leading-[1.15] mb-4"
            style={{ color: branding.darkColor }}
          >
            Formulário de Inscrição — Formação Ayurveda
          </motion.h1>
          <p className="text-[15px] md:text-[17px] text-stone-700">
            Preencha com atenção. Sua inscrição será analisada em breve.
          </p>
        </div>
      </section>

      <main className="max-w-2xl mx-auto px-6 py-10 md:py-14">
        {sucesso ? (
          <div
            className="rounded-2xl border p-8 md:p-10 text-center shadow-sm"
            style={{ borderColor: "#E9DCC7", background: "#FFFDF8" }}
          >
            <CheckCircle2 className="w-14 h-14 mx-auto mb-4" style={{ color: ROXO }} />
            <h2
              className="font-serif italic font-bold text-2xl md:text-3xl mb-3"
              style={{ color: branding.darkColor }}
            >
              Inscrição recebida com sucesso!
            </h2>
            <p className="text-stone-700 leading-relaxed">
              Analisaremos seu formulário em breve e entraremos em contato pelo WhatsApp
              ou e-mail informados.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={onBlurEmail}
                placeholder="seu@email.com"
              />
              {doshaLoading && (
                <div className="text-xs text-stone-500 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> verificando teste de dosha…
                </div>
              )}
              {doshaSearched && dosha && (
                <div
                  className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full font-medium"
                  style={{ background: "#F3EAF0", color: ROXO }}
                >
                  ✓ Teste de dosha encontrado: {dosha.resultado}
                </div>
              )}
              {doshaSearched && !dosha && (
                <div className="inline-flex items-center text-xs px-3 py-1.5 rounded-full bg-stone-100 text-stone-600">
                  Depois realize seu teste de dosha para completar o sistema
                </div>
              )}
            </div>

            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo *</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>

            {/* CPF */}
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF <span className="text-stone-400 font-normal">(opcional)</span></Label>
              <Input
                id="cpf"
                value={cpf}
                onChange={(e) => setCpf(formatCpf(e.target.value))}
                placeholder="000.000.000-00"
              />
            </div>

            {/* Whatsapp */}
            <div className="space-y-2">
              <Label htmlFor="whats">WhatsApp *</Label>
              <Input
                id="whats"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="(11) 99999-9999 ou +351 ..."
              />
              <p className="text-xs text-stone-500">Pode incluir DDI se for de fora do Brasil (ex.: +351 para Portugal).</p>
            </div>

            {/* Estado / Cidade — texto livre, aceita qualquer país */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estado">Estado / Região</Label>
                <Input
                  id="estado"
                  list="estados-br"
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  placeholder="Ex.: SP, Lisboa, Porto…"
                />
                <datalist id="estados-br">
                  {estados.map((e) => (
                    <option key={e.sigla} value={e.sigla}>{e.nome}</option>
                  ))}
                </datalist>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade / País</Label>
                <Input
                  id="cidade"
                  list="cidades-br"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  placeholder="Ex.: São Paulo, Lisboa / Portugal…"
                />
                <datalist id="cidades-br">
                  {municipios.map((m) => (
                    <option key={m.id} value={m.nome} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Como conheceu */}
            <div className="space-y-2">
              <Label htmlFor="conheceu">Como você conheceu Ayurveda? Sinta-se livre pra se apresentar, falar de suas formações prévias e o que quiser compartilhar.</Label>
              <Textarea
                id="conheceu"
                rows={3}
                value={comoConheceu}
                onChange={(e) => setComoConheceu(e.target.value)}
              />
            </div>

            {/* Objetivo */}
            <div className="space-y-2">
              <Label htmlFor="obj">Seu objetivo e expectativa com a formação *</Label>
              <Textarea
                id="obj"
                required
                rows={5}
                value={objetivo}
                onChange={(e) => setObjetivo(e.target.value)}
                placeholder="Conte-nos um pouco sobre sua trajetória e o que espera construir com esta formação..."
              />
              <div className={`text-xs ${objetivoCount < 100 ? "text-stone-500" : "text-emerald-700"}`}>
                {objetivoCount}/100 caracteres mínimos
              </div>
            </div>

            {/* Plano */}
            <div className="space-y-3">
              <Label>Plano de pagamento *</Label>
              <RadioGroup value={plano} onValueChange={(v) => setPlano(v as "mensal" | "outro")}>
                <label className="flex items-start gap-3 rounded-md border p-3 cursor-pointer hover:bg-stone-50">
                  <RadioGroupItem value="mensal" id="p-mensal" className="mt-1" />
                  <div>
                    <div className="font-medium text-stone-800">Mensal</div>
                    <div className="text-sm text-stone-600">
                      R$ 540/mês online + R$ 630/mês presencial
                    </div>
                  </div>
                </label>
                <label className="flex items-start gap-3 rounded-md border p-3 cursor-pointer hover:bg-stone-50">
                  <RadioGroupItem value="outro" id="p-outro" className="mt-1" />
                  <div className="w-full">
                    <div className="font-medium text-stone-800">Outro</div>
                    {plano === "outro" && (
                      <Textarea
                        className="mt-2"
                        rows={2}
                        placeholder="Descreva a proposta de pagamento que você gostaria de avaliar"
                        value={planoDescricao}
                        onChange={(e) => setPlanoDescricao(e.target.value)}
                      />
                    )}
                  </div>
                </label>
              </RadioGroup>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full h-12 rounded-md font-semibold text-white transition-opacity flex items-center justify-center gap-2"
              style={{ background: ROXO }}
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? "Enviando…" : "Enviar Inscrição"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
};

export default FormacaoInscricao;
