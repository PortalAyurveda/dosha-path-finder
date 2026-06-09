import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ChevronLeft } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { useUser } from "@/contexts/UserContext";
import { samkhyaTokens } from "@/components/samkhya/tokens";
import { supabase } from "@/integrations/supabase/client";
import { trackPixel } from "@/lib/metaPixel";

type FreteOpcao = {
  id: string | number;
  nome: string;
  empresa?: string;
  preco: number;
  prazo_dias: number;
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
  // Recalcula o desconto se o subtotal mudar (itens alterados)
  const descontoCupom = (() => {
    if (!cupomAplicado) return 0;
    // Prioriza valor calculado pela edge function
    if (Number(cupomAplicado.desconto_calculado) > 0) {
      return Math.min(subtotal, Number(cupomAplicado.desconto_calculado));
    }
    if (cupomAplicado.tipo_desconto === "percentual") {
      return Math.min(subtotal, (subtotal * Number(cupomAplicado.valor_desconto)) / 100);
    }
    return Math.min(subtotal, Number(cupomAplicado.valor_desconto));
  })();
  const total = Math.max(0, subtotal - descontoCupom) + (freteSelecionado?.preco ?? 0);

  const handleAplicarCupom = async () => {
    const codigo = cupomCodigo.trim().toUpperCase();
    if (!codigo) return;
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
        setCupomErro(data?.erro || "Cupom inválido");
        setCupomAplicado(null);
        return;
      }
      // Aceita ambos formatos: { valido, cupom: {...} } OU { valido, ...campos no topo }
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
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao validar cupom";
      setCupomErro(msg);
      setCupomAplicado(null);
    } finally {
      setValidandoCupom(false);
    }
  };


  const handleRemoverCupom = () => {
    setCupomAplicado(null);
    setCupomCodigo("");
    setCupomErro(null);
  };

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
          itens: itens.map((it) => ({
            slug: it.slug,
            quantidade: it.quantidade,
            peso_gramas: it.peso_gramas,
            preco_unitario: Number(it.preco_pix),
          })),
        },
      });
      if (error) throw error;
      const opcoes: FreteOpcao[] = (data?.opcoes || data?.fretes || data || []) as FreteOpcao[];
      if (!Array.isArray(opcoes) || opcoes.length === 0) {
        toast.error("Nenhuma opção de frete encontrada");
      } else {
        setOpcoesFrete(opcoes);
        setFreteId(String(opcoes[0].id));
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

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
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
          frete: {
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
              <ul className="space-y-3">
                {itens.map((it) => (
                  <li
                    key={`${it.tipo}-${it.slug}`}
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
                        <p className="text-sm font-medium leading-tight" style={{ color: samkhyaTokens.texto }}>
                          {it.nome}
                        </p>
                        <button
                          onClick={() => removerItem(it.slug, it.tipo)}
                          aria-label="Remover"
                          className="text-muted-foreground hover:text-destructive shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 border rounded" style={{ borderColor: samkhyaTokens.cardBorder }}>
                          <button
                            onClick={() => atualizarQuantidade(it.slug, it.tipo, it.quantidade - 1)}
                            className="px-2 py-1 hover:bg-black/5"
                            aria-label="Diminuir"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2 text-sm min-w-[1.5rem] text-center">{it.quantidade}</span>
                          <button
                            onClick={() => atualizarQuantidade(it.slug, it.tipo, it.quantidade + 1)}
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
                ))}
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
                <span style={{ color: samkhyaTokens.texto }}>{formatBRL(freteSelecionado.preco)}</span>
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
              <Button
                onClick={() => setStep("checkout")}
                disabled={!freteSelecionado}
                className="w-full"
                style={{ background: samkhyaTokens.ouro, color: "#fff" }}
              >
                Continuar
              </Button>
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
