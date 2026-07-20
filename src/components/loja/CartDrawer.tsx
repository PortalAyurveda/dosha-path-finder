import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ChevronLeft } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { useCart, getCartKey } from "@/contexts/CartContext";
import { useUser } from "@/contexts/UserContext";
import { samkhyaTokens } from "@/components/samkhya/tokens";
import { supabase } from "@/integrations/supabase/client";
import { trackPixel } from "@/lib/metaPixel";
import { useFreteGratisConfig } from "@/hooks/useFreteGratisConfig";
import { useCupomUsuario } from "@/hooks/useCupomUsuario";

type FreteOpcao = {
  id: string | number;
  nome: string;
  empresa?: string;
  preco: number;
  prazo_dias: number;
  frete_gratis?: boolean;
};

const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const onlyDigits = (s: string) => s.replace(/\D/g, "");
const maskCEP = (s: string) => onlyDigits(s).slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");
const maskCPF = (s: string) =>
  onlyDigits(s).slice(0, 11).replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
const maskTel = (s: string) => {
  const d = onlyDigits(s).slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").trim();
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").trim();
};

const validateCPF = (cpf: string) => {
  const c = onlyDigits(cpf);
  if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(c[i]) * (10 - i);
  let d1 = 11 - (sum % 11);
  if (d1 >= 10) d1 = 0;
  if (d1 !== parseInt(c[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(c[i]) * (11 - i);
  let d2 = 11 - (sum % 11);
  if (d2 >= 10) d2 = 0;
  return d2 === parseInt(c[10]);
};

const CartDrawer = () => {
  const navigate = useNavigate();
  const { user, profile, doshaResult } = useUser();
  const {
    itens,
    isOpen,
    fecharCarrinho,
    removerItem,
    atualizarQuantidade,
    subtotal,
  } = useCart();

  const [step, setStep] = useState<"cart" | "checkout">("cart");
  const [cep, setCep] = useState(() => localStorage.getItem("samkhya:cep") || "");
  const [calculandoFrete, setCalculandoFrete] = useState(false);
  const [opcoesFrete, setOpcoesFrete] = useState<FreteOpcao[]>([]);
  const [freteId, setFreteId] = useState<string>("");
  const { data: freteConfig } = useFreteGratisConfig();

  // checkout form
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    cpf: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
  });
  const [enviando, setEnviando] = useState(false);

  // Cupom de desconto
  type CupomAplicado = {
    cupom_id: string;
    codigo: string;
    tipo_desconto: string;
    valor_desconto: number;
    desconto_calculado: number;
  };
  const [cupomCodigo, setCupomCodigo] = useState("");
  const [cupomAplicado, setCupomAplicado] = useState<CupomAplicado | null>(null);
  const [cupomErro, setCupomErro] = useState<string | null>(null);
  const [validandoCupom, setValidandoCupom] = useState(false);
  const { cupom: cupomDoUsuario } = useCupomUsuario();
  const autoAplicadoRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setStep("cart");
    }
  }, [isOpen]);

  // Pré-preenche dados a partir do usuário logado (user_profiles), sem sobrescrever edições
  useEffect(() => {
    if (!isOpen || !user?.id) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("user_profiles")
        .select("nome, nome_completo, telefone, cpf")
        .eq("id", user.id)
        .maybeSingle();
      if (cancelled) return;
      const p = (data || {}) as { nome?: string | null; nome_completo?: string | null; telefone?: string | null; cpf?: string | null };
      const nomeLogado = p.nome_completo || p.nome || profile?.nome || doshaResult?.nome || "";
      const emailLogado = user?.email || "";
      setForm((prev) => ({
        ...prev,
        nome: prev.nome || nomeLogado,
        email: prev.email || emailLogado,
        telefone: prev.telefone || (p.telefone ? maskTel(p.telefone) : ""),
        cpf: prev.cpf || (p.cpf ? maskCPF(p.cpf) : ""),
      }));
    })();
    return () => { cancelled = true; };
  }, [isOpen, user?.id, user?.email, profile?.nome, doshaResult?.nome]);

  // Reset frete quando itens mudam
  useEffect(() => {
    setOpcoesFrete([]);
    setFreteId("");
  }, [itens]);

  const freteSelecionado = opcoesFrete.find((f) => String(f.id) === freteId) || null;
  // Recalcula o desconto SEMPRE sobre o subtotal atual (não usa valor congelado)
  const descontoCupom = (() => {
    if (!cupomAplicado) return 0;
    if (cupomAplicado.tipo_desconto === "frete_gratis") return 0;
    if (cupomAplicado.tipo_desconto === "percentual") {
      return Math.min(subtotal, (subtotal * Number(cupomAplicado.valor_desconto)) / 100);
    }
    // valor_fixo
    return Math.min(subtotal, Number(cupomAplicado.valor_desconto));
  })();
  const total = Math.max(0, subtotal - descontoCupom) + (freteSelecionado?.preco ?? 0);

  const aplicarCupom = async (codigoBruto: string, opts?: { silent?: boolean }) => {
    const codigo = codigoBruto.trim().toUpperCase();
    if (!codigo) return false;
    setValidandoCupom(true);
    setCupomErro(null);
    try {
      const { data, error } = await supabase.functions.invoke("validar-cupom", {
        body: {
          codigo,
          subtotal,
          email_comprador: form.email || user?.email || null,
          user_id: user?.id ?? null,
          escopo: "loja",
        },
      });
      if (error) throw new Error(error.message || "Erro ao validar cupom");
      if (!data?.valido) {
        if (!opts?.silent) setCupomErro(data?.erro || "Cupom inválido");
        setCupomAplicado(null);
        return false;
      }
      const src = (data.cupom && typeof data.cupom === "object") ? data.cupom : data;
      const normalizado: CupomAplicado = {
        cupom_id: String(src.cupom_id ?? src.id ?? ""),
        codigo: String(src.codigo ?? codigo).toUpperCase(),
        tipo_desconto: String(src.tipo_desconto ?? "percentual"),
        valor_desconto: Number(src.valor_desconto ?? 0),
        desconto_calculado: Number(src.desconto_calculado ?? 0),
      };
      setCupomAplicado(normalizado);
      setCupomErro(null);
      return true;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao validar cupom";
      if (!opts?.silent) setCupomErro(msg);
      setCupomAplicado(null);
      return false;
    } finally {
      setValidandoCupom(false);
    }
  };

  const handleAplicarCupom = () => aplicarCupom(cupomCodigo);

  const handleRemoverCupom = () => {
    setCupomAplicado(null);
    setCupomCodigo("");
    setCupomErro(null);
  };

  // Auto-aplica o cupom pessoal do usuário (uso único) quando o carrinho abre
  // e ainda não há cupom aplicado. Roda apenas uma vez por código de cupom.
  useEffect(() => {
    if (!isOpen) return;
    if (!cupomDoUsuario?.codigo) return;
    if (cupomAplicado) return;
    if (itens.length === 0) return;
    if (autoAplicadoRef.current === cupomDoUsuario.codigo) return;
    autoAplicadoRef.current = cupomDoUsuario.codigo;
    setCupomCodigo(cupomDoUsuario.codigo);
    void aplicarCupom(cupomDoUsuario.codigo, { silent: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, cupomDoUsuario?.codigo, itens.length]);


  const handleCalcularFrete = async () => {
    const cepLimpo = onlyDigits(cep);
    if (cepLimpo.length !== 8) {
      toast.error("CEP inválido");
      return;
    }
    if (itens.length === 0) return;
    setCalculandoFrete(true);
    setOpcoesFrete([]);
    setFreteId("");
    localStorage.setItem("samkhya:cep", cep);

    try {
      const { data, error } = await supabase.functions.invoke("calcular-frete", {
        body: {
          cep_destino: cepLimpo,
          frete_gratis_cupom: cupomAplicado?.tipo_desconto === "frete_gratis",
          itens: itens.map((it) => ({
            slug: it.slug,
            quantidade: it.quantidade,
            peso_gramas: it.peso_gramas,
            preco_unitario: Number(it.preco_pix),
          })),
        },
      });
      if (error) throw error;
      let opcoes: FreteOpcao[] = (data?.opcoes || data?.fretes || data || []) as FreteOpcao[];
      if (!Array.isArray(opcoes) || opcoes.length === 0) {
        toast.error("Nenhuma opção de frete encontrada");
      } else {
        // Quando o subtotal atinge o mínimo de frete grátis, consolidamos as
        // opções da API em uma única linha "Samkhya Frete Grátis" — evita
        // mostrar várias transportadoras com valor R$ 0,00.
        const minGratis = freteConfig?.frete_gratis_minimo ?? 350;
        const gratisAtivo = freteConfig?.frete_gratis_ativo ?? true;
        const cupomFreteGratis = cupomAplicado?.tipo_desconto === "frete_gratis";
        if ((gratisAtivo && subtotal >= minGratis) || cupomFreteGratis) {
          const prazoMax = opcoes.reduce((m, o) => Math.max(m, o.prazo_dias || 0), 0) || 7;
          opcoes = [{
            id: "gratis",
            nome: "Samkhya Frete Grátis",
            empresa: "Samkhya",
            preco: 0,
            prazo_dias: prazoMax,
            frete_gratis: true,
          }];
        }
        setOpcoesFrete(opcoes);
        const gratis = opcoes.find((o) => String(o.id) === "gratis" || o.frete_gratis);
        setFreteId(String((gratis ?? opcoes[0]).id));
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao calcular frete";
      toast.error(msg);
    } finally {
      setCalculandoFrete(false);
    }
  };

  // Auto-fill via ViaCEP quando CEP do checkout muda
  useEffect(() => {
    const cepLimpo = onlyDigits(cep);
    if (cepLimpo.length !== 8 || step !== "checkout") return;
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const d = await r.json();
        if (cancelled || d.erro) return;
        setForm((prev) => ({
          ...prev,
          logradouro: prev.logradouro || d.logradouro || "",
          bairro: prev.bairro || d.bairro || "",
          cidade: d.localidade || prev.cidade,
          estado: d.uf || prev.estado,
        }));
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cep, step]);

  const handleFinalizar = async () => {
    // validações
    if (!form.nome.trim()) return toast.error("Informe seu nome");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return toast.error("Email inválido");
    if (onlyDigits(form.telefone).length < 10) return toast.error("Telefone inválido");
    if (!validateCPF(form.cpf)) return toast.error("CPF inválido");
    if (!form.logradouro.trim() || !form.numero.trim() || !form.bairro.trim() || !form.cidade || !form.estado) {
      return toast.error("Preencha o endereço completo");
    }
    if (!freteSelecionado) return toast.error("Selecione uma opção de frete");

    trackPixel("InitiateCheckout", { content_type: "product" });
    setEnviando(true);
    try {
      // Salva dados do comprador no perfil quando logado
      if (user?.id) {
        await supabase
          .from("user_profiles")
          .update({
            nome_completo: form.nome.trim(),
            telefone: onlyDigits(form.telefone),
            cpf: onlyDigits(form.cpf),
          } as never)
          .eq("id", user.id);
      }

      const origin = window.location.origin;
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          success_url: `${origin}/samkhya/obrigado?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/samkhya?checkout=cancelado`,
          user_id: user?.id ?? null,
          itens: itens.map((it) => ({
            slug: it.slug,
            tipo: it.tipo,
            nome: it.nome,
            quantidade: it.quantidade,
            preco_pix: Number(it.preco_pix),
            preco_normal: Number(it.preco_normal),
            stripe_price_id: it.stripe_price_id,
            peso_gramas: it.peso_gramas,
          })),
          frete: freteSelecionado.preco === 0
            ? { id: null, prazo_dias: null, preco: 0, nome: "Frete Grátis" }
            : {
                id: freteSelecionado.id,
                nome: freteSelecionado.nome,
                preco: freteSelecionado.preco,
                prazo_dias: freteSelecionado.prazo_dias,
              },
          comprador: {
            nome: form.nome.trim() || "Cliente",
            email: form.email.trim(),
            telefone: onlyDigits(form.telefone),
            cpf: onlyDigits(form.cpf),
          },
          endereco: {
            cep: onlyDigits(cep),
            logradouro: form.logradouro.trim(),
            numero: form.numero.trim(),
            complemento: form.complemento.trim(),
            bairro: form.bairro.trim(),
            cidade: form.cidade,
            estado: form.estado,
          },
          cupom: cupomAplicado
            ? {
                cupom_id: cupomAplicado.cupom_id,
                codigo: cupomAplicado.codigo,
                desconto_calculado: descontoCupom,
                tipo_desconto: cupomAplicado.tipo_desconto,
                valor_desconto: cupomAplicado.valor_desconto,
              }
            : null,
        },
      });
      if (error) throw error;
      const url = data?.url || data?.checkout_url;
      if (!url) throw new Error("URL de checkout não recebida");
      window.location.href = url;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao iniciar checkout";
      toast.error(msg);
      setEnviando(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(o) => !o && fecharCarrinho()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col p-0"
        style={{ background: samkhyaTokens.fundo }}
      >
        <SheetHeader className="px-5 py-4 border-b" style={{ borderColor: samkhyaTokens.cardBorder }}>
          <SheetTitle
            className="text-lg flex items-center gap-2"
            style={{ color: samkhyaTokens.roxo, fontFamily: "Georgia, serif" }}
          >
            {step === "checkout" && (
              <button onClick={() => setStep("cart")} aria-label="Voltar">
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            <ShoppingBag className="h-5 w-5" />
            {step === "cart" ? "Seu carrinho" : "Dados de entrega"}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {itens.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-16">
              <ShoppingBag className="h-12 w-12" style={{ color: samkhyaTokens.textoSec }} />
              <p style={{ color: samkhyaTokens.textoSec }}>Seu carrinho está vazio</p>
              <Button
                onClick={() => {
                  fecharCarrinho();
                  navigate("/samkhya");
                }}
                style={{ background: samkhyaTokens.roxo, color: "#fff" }}
              >
                Ver produtos
              </Button>
            </div>
          ) : step === "cart" ? (
            <div className="space-y-5">
              {freteConfig?.frete_gratis_ativo && (() => {
                const min = freteConfig.frete_gratis_minimo;
                const desbloqueado = subtotal >= min;
                const falta = Math.max(0, min - subtotal);
                const pct = Math.min(100, (subtotal / min) * 100);
                return (
                  <div
                    className="p-3 rounded-md"
                    style={{
                      background: desbloqueado ? "#E8F5E9" : samkhyaTokens.cardBg,
                      border: `1px solid ${desbloqueado ? "#66BB6A" : samkhyaTokens.cardBorder}`,
                    }}
                  >
                    <p className="text-sm font-medium" style={{ color: desbloqueado ? "#2E7D32" : samkhyaTokens.texto }}>
                      {desbloqueado
                        ? "🎉 Frete grátis desbloqueado!"
                        : `Faltam ${formatBRL(falta)} para ganhar frete grátis`}
                    </p>
                    {!desbloqueado && (
                      <div className="mt-2 h-1.5 w-full rounded-full overflow-hidden" style={{ background: samkhyaTokens.cardBorder }}>
                        <div
                          className="h-full transition-all"
                          style={{ width: `${pct}%`, background: samkhyaTokens.ouro }}
                        />
                      </div>
                    )}
                  </div>
                );
              })()}
              <ul className="space-y-3">
              {itens.map((it) => {
                  const cartKey = getCartKey(it);
                  return (
                  <li
                    key={cartKey}
                    className="flex gap-3 p-3 rounded-md"
                    style={{ background: samkhyaTokens.cardBg, border: `1px solid ${samkhyaTokens.cardBorder}` }}
                  >
                    <div className="w-16 h-16 flex-shrink-0 rounded overflow-hidden bg-white flex items-center justify-center">
                      {it.imagem_url ? (
                        <img src={it.imagem_url} alt={it.nome} className="max-w-full max-h-full object-contain" />
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium leading-tight" style={{ color: samkhyaTokens.texto }}>
                            {it.nome}
                          </p>
                          {it.escolhas_label && (
                            <p className="text-xs mt-0.5" style={{ color: samkhyaTokens.textoSec }}>
                              {it.escolhas_label}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => removerItem(cartKey)}
                          aria-label="Remover"
                          className="text-muted-foreground hover:text-destructive shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 border rounded" style={{ borderColor: samkhyaTokens.cardBorder }}>
                          <button
                            onClick={() => atualizarQuantidade(cartKey, it.quantidade - 1)}
                            className="px-2 py-1 hover:bg-black/5"
                            aria-label="Diminuir"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2 text-sm min-w-[1.5rem] text-center">{it.quantidade}</span>
                          <button
                            onClick={() => atualizarQuantidade(cartKey, it.quantidade + 1)}
                            className="px-2 py-1 hover:bg-black/5"
                            aria-label="Aumentar"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="text-sm font-medium" style={{ color: samkhyaTokens.ouroDark }}>
                          {formatBRL(Number(it.preco_pix) * it.quantidade)}
                        </span>
                      </div>
                    </div>
                  </li>
                  );
                })}
              </ul>

              <div className="pt-4 border-t" style={{ borderColor: samkhyaTokens.cardBorder }}>
                <Label className="text-sm" style={{ color: samkhyaTokens.texto }}>
                  Calcular frete
                </Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="CEP"
                    value={cep}
                    onChange={(e) => setCep(maskCEP(e.target.value))}
                    inputMode="numeric"
                  />
                  <Button
                    onClick={handleCalcularFrete}
                    disabled={calculandoFrete || onlyDigits(cep).length !== 8}
                    style={{ background: samkhyaTokens.roxo, color: "#fff" }}
                  >
                    {calculandoFrete ? "..." : "Calcular"}
                  </Button>
                </div>

                {opcoesFrete.some((o) => String(o.id) === "gratis" || o.frete_gratis) && (
                  <div
                    className="mt-3 p-2 rounded text-sm font-medium text-center"
                    style={{ background: "#E8F5E9", border: "1px solid #66BB6A", color: "#2E7D32" }}
                  >
                    🎉 Seu pedido tem frete grátis!
                  </div>
                )}
                {opcoesFrete.length > 0 && (
                  <RadioGroup value={freteId} onValueChange={setFreteId} className="mt-3 space-y-2">
                    {opcoesFrete.map((op) => (
                      <label
                        key={op.id}
                        className="flex items-center gap-3 p-2 rounded cursor-pointer"
                        style={{ background: samkhyaTokens.cardBg, border: `1px solid ${samkhyaTokens.cardBorder}` }}
                      >
                        <RadioGroupItem value={String(op.id)} id={`frete-${op.id}`} />
                        <div className="flex-1 flex justify-between items-center">
                          <div>
                            <p className="text-sm" style={{ color: samkhyaTokens.texto }}>{op.empresa ? `${op.empresa} ${op.nome}` : op.nome}</p>
                            <p className="text-xs" style={{ color: samkhyaTokens.textoSec }}>
                              {op.prazo_dias} {op.prazo_dias === 1 ? "dia útil" : "dias úteis"}
                            </p>
                          </div>
                          <span className="text-sm font-medium" style={{ color: samkhyaTokens.ouroDark }}>
                            {formatBRL(op.preco)}
                          </span>
                        </div>
                      </label>
                    ))}
                  </RadioGroup>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* CEP resumo — já preenchido na etapa anterior */}
              <div className="flex items-center justify-between p-3 rounded-md" style={{ background: samkhyaTokens.cardBg, border: `1px solid ${samkhyaTokens.cardBorder}` }}>
                <div>
                  <p className="text-xs" style={{ color: samkhyaTokens.textoSec }}>CEP de entrega</p>
                  <p className="text-sm font-medium" style={{ color: samkhyaTokens.texto }}>{cep || "—"}</p>
                </div>
                <button
                  onClick={() => setStep("cart")}
                  className="text-xs underline"
                  style={{ color: samkhyaTokens.roxo }}
                  type="button"
                >
                  Alterar
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label htmlFor="nome">Nome completo</Label>
                  <Input id="nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="tel">Telefone</Label>
                    <Input id="tel" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: maskTel(e.target.value) })} inputMode="numeric" />
                  </div>
                  <div>
                    <Label htmlFor="cpf">CPF</Label>
                    <Input id="cpf" value={form.cpf} onChange={(e) => setForm({ ...form, cpf: maskCPF(e.target.value) })} inputMode="numeric" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="log">Logradouro</Label>
                  <Input id="log" value={form.logradouro} onChange={(e) => setForm({ ...form, logradouro: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="num">Número</Label>
                    <Input id="num" value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="comp">Complemento</Label>
                    <Input id="comp" value={form.complemento} onChange={(e) => setForm({ ...form, complemento: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input id="bairro" value={form.bairro} onChange={(e) => setForm({ ...form, bairro: e.target.value })} />
                </div>
                <div className="grid grid-cols-[1fr_80px] gap-3">
                  <div>
                    <Label htmlFor="cid">Cidade</Label>
                    <Input id="cid" value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="uf">UF</Label>
                    <Input id="uf" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} maxLength={2} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {itens.length > 0 && (
          <div className="border-t px-5 py-4 space-y-3" style={{ borderColor: samkhyaTokens.cardBorder, background: samkhyaTokens.cardBg }}>
            <div className="flex justify-between text-sm">
              <span style={{ color: samkhyaTokens.textoSec }}>Subtotal</span>
              <span style={{ color: samkhyaTokens.texto }}>{formatBRL(subtotal)}</span>
            </div>
            {freteSelecionado && (
              <div className="flex justify-between text-sm">
                <span style={{ color: samkhyaTokens.textoSec }}>Frete</span>
                <span style={{ color: freteSelecionado.preco === 0 ? "#2E7D32" : samkhyaTokens.texto, fontWeight: freteSelecionado.preco === 0 ? 600 : 400 }}>
                  {freteSelecionado.preco === 0 ? "Grátis" : formatBRL(freteSelecionado.preco)}
                </span>
              </div>
            )}

            {/* Cupom de desconto */}
            <div className="pt-2 border-t" style={{ borderColor: samkhyaTokens.cardBorder }}>
              {cupomAplicado ? (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-emerald-700">
                    Cupom {cupomAplicado.codigo} — −{formatBRL(descontoCupom)}
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoverCupom}
                    className="text-xs underline"
                    style={{ color: samkhyaTokens.textoSec }}
                  >
                    Remover
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Código do cupom"
                      value={cupomCodigo}
                      onChange={(e) => setCupomCodigo(e.target.value.toUpperCase())}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAplicarCupom();
                        }
                      }}
                      className="h-9 text-sm"
                    />
                    <Button
                      type="button"
                      onClick={handleAplicarCupom}
                      disabled={validandoCupom || !cupomCodigo.trim()}
                      variant="outline"
                      className="h-9"
                    >
                      {validandoCupom ? "..." : "Aplicar"}
                    </Button>
                  </div>
                  {cupomErro && (
                    <p className="text-xs mt-1 text-red-600">{cupomErro}</p>
                  )}
                </>
              )}
            </div>

            <div className="flex justify-between text-base font-medium pt-2 border-t" style={{ borderColor: samkhyaTokens.cardBorder }}>
              <span style={{ color: samkhyaTokens.texto }}>Total</span>
              <span style={{ color: samkhyaTokens.ouroDark }}>{formatBRL(total)}</span>
            </div>

            {step === "cart" ? (
              <>
                <Button
                  onClick={async () => {
                    if (freteSelecionado) {
                      setStep("checkout");
                      return;
                    }
                    if (onlyDigits(cep).length === 8 && opcoesFrete.length === 0 && !calculandoFrete) {
                      await handleCalcularFrete();
                      toast.info("Escolha a opção de frete e toque em Continuar novamente.");
                    } else if (onlyDigits(cep).length !== 8) {
                      toast.error("Digite seu CEP e toque em Calcular para ver o frete.");
                    } else {
                      toast.error("Escolha uma opção de frete para continuar.");
                    }
                  }}
                  className="w-full"
                  style={{ background: samkhyaTokens.ouro, color: "#fff" }}
                >
                  Continuar
                </Button>
                {!freteSelecionado && (
                  <p className="text-xs text-center" style={{ color: samkhyaTokens.textoSec }}>
                    Calcule o frete acima para continuar.
                  </p>
                )}
              </>
            ) : (
              <Button
                onClick={handleFinalizar}
                disabled={enviando}
                className="w-full"
                style={{ background: samkhyaTokens.ouro, color: "#fff" }}
              >
                {enviando ? "Processando..." : "Finalizar compra"}
              </Button>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
