// Compra do Kit do Detox da Primavera. Escrita com createElement (sem JSX).
import { createElement as h, useEffect, useState, type ChangeEvent } from "react";
import { Helmet } from "react-helmet-async";
import { Check, Loader2, ShieldCheck } from "lucide-react";
import { z } from "zod";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { IMAGENS } from "@/data/detoxInscricao";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Metodo = "cartao" | "pix";
type ItemFixo = { nome: string; resumo: string | null };
type KitDetalhe = {
  nome: string;
  descricao_curta: string | null;
  preco_normal: number;
  preco_pix: number;
  imagem_url: string | null;
  frete_gratis: boolean;
  itens_fixos: ItemFixo[];
};
type Formulario = {
  nome: string; email: string; telefone: string; cpf: string; cep: string;
  rua: string; numero: string; complemento: string; bairro: string; cidade: string; estado: string;
};
type Campo = keyof Formulario;

const VAZIO: Formulario = { nome: "", email: "", telefone: "", cpf: "", cep: "", rua: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "" };
const soDigitos = (valor: string) => valor.replace(/\D/g, "");
const cpfValido = (valor: string) => {
  const cpf = soDigitos(valor);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const calcular = (limite: number) => {
    let soma = 0;
    for (let i = 0; i < limite; i += 1) soma += Number(cpf[i]) * (limite + 1 - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  return calcular(9) === Number(cpf[9]) && calcular(10) === Number(cpf[10]);
};
const formularioSchema = z.object({
  nome: z.string().trim().refine((v) => v.split(/\s+/).filter(Boolean).length >= 2, "Informe nome e sobrenome."),
  email: z.string().trim().email("Informe um email válido."),
  telefone: z.string().refine((v) => soDigitos(v).length >= 10, "Informe o telefone com DDD."),
  cpf: z.string().refine(cpfValido, "Informe um CPF válido."),
  cep: z.string().refine((v) => soDigitos(v).length === 8, "Informe um CEP válido."),
  rua: z.string().trim().min(1, "Informe a rua."),
  numero: z.string().trim().min(1, "Informe o número."),
  complemento: z.string().trim().max(100, "Use até 100 caracteres."),
  bairro: z.string().trim().min(1, "Informe o bairro."),
  cidade: z.string().trim().min(1, "Informe a cidade."),
  estado: z.string().trim().length(2, "Informe a UF com 2 letras."),
});
const dinheiro = (valor: number) => valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: Number.isInteger(valor) ? 0 : 2, maximumFractionDigits: 2 });

const DetoxKit = () => {
  const [params] = useSearchParams();
  const { user, isAnonymous } = useUser();
  const [kit, setKit] = useState<KitDetalhe | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erroPagina, setErroPagina] = useState("");
  const [etapa, setEtapa] = useState<1 | 2>(1);
  const [form, setForm] = useState<Formulario>(VAZIO);
  const [erros, setErros] = useState<Partial<Record<Campo, string>>>({});
  const [metodoCarregando, setMetodoCarregando] = useState<Metodo | null>(null);
  const [erroPagamento, setErroPagamento] = useState("");

  useEffect(() => {
    let cancelado = false;
    void (async () => {
      const { data, error } = await (supabase.rpc as any)("kit_detalhe", { p_slug: "kit-detox-primavera" });
      if (cancelado) return;
      const detalhe = (Array.isArray(data) ? data[0] : data) as KitDetalhe | null;
      if (error || !detalhe) setErroPagina("Não foi possível carregar o kit agora. Tente novamente em instantes.");
      else setKit(detalhe);
      setCarregando(false);
    })();
    return () => { cancelado = true; };
  }, []);

  useEffect(() => {
    if (!user || isAnonymous) return;
    let cancelado = false;
    void (async () => {
      const { data } = await (supabase as any).from("user_profiles").select("nome,nome_completo,telefone,cpf").eq("id", user.id).maybeSingle();
      if (cancelado) return;
      setForm((anterior) => ({
        ...anterior,
        email: user.email ?? anterior.email,
        nome: data?.nome_completo ?? data?.nome ?? anterior.nome,
        telefone: data?.telefone ?? anterior.telefone,
        cpf: data?.cpf ?? anterior.cpf,
      }));
    })();
    return () => { cancelado = true; };
  }, [user?.id, isAnonymous]);

  useEffect(() => {
    const cep = soDigitos(form.cep);
    if (cep.length !== 8) return;
    const controlador = new AbortController();
    void (async () => {
      try {
        const resposta = await fetch(`https://viacep.com.br/ws/${encodeURIComponent(cep)}/json/`, { signal: controlador.signal });
        if (!resposta.ok) return;
        const endereco = await resposta.json() as { erro?: boolean; logradouro?: string; bairro?: string; localidade?: string; uf?: string };
        if (endereco.erro) { setErros((e) => ({ ...e, cep: "CEP não encontrado." })); return; }
        setForm((atual) => ({ ...atual, rua: endereco.logradouro ?? atual.rua, bairro: endereco.bairro ?? atual.bairro, cidade: endereco.localidade ?? atual.cidade, estado: endereco.uf ?? atual.estado }));
        setErros((e) => ({ ...e, cep: undefined, rua: undefined, bairro: undefined, cidade: undefined, estado: undefined }));
      } catch (erro) {
        if ((erro as Error).name !== "AbortError") setErros((e) => ({ ...e, cep: "Não foi possível buscar o CEP. Preencha o endereço." }));
      }
    })();
    return () => controlador.abort();
  }, [form.cep]);

  const alterar = (campo: Campo) => (evento: ChangeEvent<HTMLInputElement>) => {
    let valor = evento.target.value;
    if (campo === "estado") valor = valor.replace(/[^a-zA-Z]/g, "").slice(0, 2).toUpperCase();
    setForm((atual) => ({ ...atual, [campo]: valor }));
    setErros((atuais) => ({ ...atuais, [campo]: undefined }));
  };
  const continuar = () => {
    const resultado = formularioSchema.safeParse(form);
    if (resultado.success) { setErros({}); setEtapa(2); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    const novos: Partial<Record<Campo, string>> = {};
    for (const questao of resultado.error.issues) novos[questao.path[0] as Campo] = questao.message;
    setErros(novos);
  };
  const comprar = async (metodo: Metodo) => {
    if (!kit) return;
    setMetodoCarregando(metodo);
    setErroPagamento("");
    const body = {
      kit_slug: "kit-detox-primavera", metodo,
      comprador: { nome: form.nome.trim(), email: form.email.trim().toLowerCase(), telefone: soDigitos(form.telefone), cpf: soDigitos(form.cpf) },
      endereco: { cep: soDigitos(form.cep), logradouro: form.rua.trim(), numero: form.numero.trim(), complemento: form.complemento.trim(), bairro: form.bairro.trim(), cidade: form.cidade.trim(), estado: form.estado.trim().toUpperCase() },
    };
    const { data } = await supabase.functions.invoke("comprar-kit", { body });
    setMetodoCarregando(null);
    if (data?.ok && data.checkout_url) { window.location.href = data.checkout_url; return; }
    if (data?.ja_pago && data.pedido_id) {
      toast.error(data.erro ?? "Este kit já foi pago.");
      window.location.href = `/samkhya/pedido/${encodeURIComponent(String(data.pedido_id))}`;
      return;
    }
    setErroPagamento(data?.erro ?? "Não foi possível abrir o pagamento. Tente novamente.");
  };
  const campo = (id: string, rotulo: string, nome: Campo, tipo = "text", opcional = false) => h("div", { className: "flex flex-col gap-2" },
    h("label", { htmlFor: id, className: "text-[16px] font-bold text-[#352F54]" }, rotulo, opcional ? h("span", { className: "ml-1 font-normal text-[#655E72]" }, "(opcional)") : null),
    h("input", { id, type: tipo, autoComplete: nome === "email" ? "email" : undefined, inputMode: (["telefone", "cpf", "cep", "numero"] as Campo[]).includes(nome) ? "numeric" : undefined, value: form[nome], onChange: alterar(nome), "aria-invalid": !!erros[nome], className: `min-h-[56px] w-full rounded-2xl border bg-white px-4 text-[18px] text-[#352F54] outline-none transition focus:border-[#E07B39] ${erros[nome] ? "border-[#B42318]" : "border-[#E5D8CA]"}` }),
    erros[nome] ? h("p", { className: "m-0 text-[15px] text-[#B42318]" }, erros[nome]) : null);

  const normal = Number(kit?.preco_normal ?? 0);
  const pix = Number(kit?.preco_pix ?? 0);
  return h("div", { className: "min-h-screen bg-gradient-to-b from-[#FBE3CC] via-[#FDF7F1] to-[#FBE3CC] text-[#514B62]" },
    h(Helmet, null, h("title", null, "Kit do Detox da Primavera · Portal Ayurveda"), h("meta", { name: "description", content: "Compre o Kit do Detox da Primavera com entrega grátis." })),
    params.get("pagamento") === "recusado" ? h("div", { className: "bg-[#A85A1A] px-4 py-3 text-center text-[16px] font-bold text-white" }, "O pagamento não passou. Nada foi cobrado. Você pode tentar de novo.") : null,
    h("main", { className: "mx-auto flex max-w-[1080px] flex-col gap-8 px-4 py-8 md:py-12" },
      h("div", { className: "flex items-center gap-4" }, h("img", { src: IMAGENS.logo, alt: "Detox da Primavera", className: "h-16 w-auto object-contain md:h-20" }), h("p", { className: "m-0 text-[18px] font-bold leading-snug text-[#A85A1A]" }, "Detox da Primavera com Edson Osorio")),
      carregando ? h("div", { className: "flex min-h-[360px] items-center justify-center", "aria-label": "Carregando o kit" }, h(Loader2, { className: "h-8 w-8 animate-spin text-[#E07B39]" })) : erroPagina || !kit ? h("p", { className: "rounded-3xl bg-white p-6 text-[18px] text-[#B42318]" }, erroPagina) : h("div", { className: "flex flex-col gap-8" },
        h("section", { className: "grid items-center gap-7 md:grid-cols-2 md:gap-10" },
          h("div", { className: "overflow-hidden rounded-[24px] bg-white p-4 shadow-[0_20px_50px_-32px_rgba(53,47,84,0.45)]" }, h("img", { src: kit.imagem_url ?? "https://api.portalayurveda.com/storage/v1/object/public/portal_images/promokit.webp", alt: kit.nome, className: "aspect-square w-full object-contain", decoding: "async" })),
          h("div", { className: "flex flex-col gap-5" },
            h("p", { className: "m-0 text-[15px] font-bold uppercase text-[#A85A1A]" }, "Para acompanhar os seus 10 dias"),
            h("h1", { className: "m-0 font-serif text-[36px] font-bold leading-tight text-[#352F54] md:text-[48px]" }, "Kit do Detox da Primavera"),
            kit.descricao_curta ? h("p", { className: "m-0 text-[17px] leading-relaxed md:text-[18px]" }, kit.descricao_curta) : null,
            h("ul", { className: "m-0 flex list-none flex-col gap-3 p-0" }, ...(kit.itens_fixos ?? []).map((item, i) => h("li", { key: i, className: "flex items-start gap-3" }, h("span", { className: "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FBE3CC]" }, h(Check, { className: "h-4 w-4 text-[#E07B39]" })), h("div", null, h("p", { className: "m-0 text-[17px] font-bold text-[#352F54] md:text-[18px]" }, item.nome), item.resumo ? h("p", { className: "m-0 mt-1 text-[16px] leading-relaxed text-[#655E72] md:text-[17px]" }, item.resumo) : null)))),
            h("div", { className: "rounded-[24px] bg-white p-6 shadow-[0_18px_45px_-32px_rgba(53,47,84,0.45)]" }, h("p", { className: "m-0 font-serif text-[40px] font-bold leading-none text-[#352F54]" }, dinheiro(normal)), h("p", { className: "m-0 mt-3 text-[17px] leading-relaxed" }, `Em até 3x de ${dinheiro(normal / 3)} sem juros no cartão, ou ${dinheiro(pix)} no Pix.`), kit.frete_gratis ? h("p", { className: "m-0 mt-3 inline-flex items-center gap-2 font-bold text-[#A85A1A]" }, h(Check, { className: "h-5 w-5" }), "Frete grátis") : null))),
        h("section", { className: "mx-auto w-full max-w-[820px] rounded-[24px] bg-white/95 p-5 shadow-[0_20px_50px_-32px_rgba(53,47,84,0.45)] md:p-8" }, etapa === 1
          ? h("div", { className: "flex flex-col gap-5" }, h("h2", { className: "m-0 font-serif text-[30px] font-bold text-[#352F54] md:text-[38px]" }, "Para onde enviamos o seu kit"), h("div", { className: "grid gap-4 md:grid-cols-2" }, campo("kit-nome", "Nome completo", "nome"), campo("kit-email", "Email", "email", "email"), campo("kit-telefone", "Telefone com DDD", "telefone", "tel"), campo("kit-cpf", "CPF", "cpf"), campo("kit-cep", "CEP", "cep"), campo("kit-rua", "Rua", "rua"), campo("kit-numero", "Número", "numero"), campo("kit-complemento", "Complemento", "complemento", "text", true), campo("kit-bairro", "Bairro", "bairro"), campo("kit-cidade", "Cidade", "cidade"), campo("kit-estado", "Estado (UF)", "estado")), h(Button, { type: "button", onClick: continuar, className: "min-h-[60px] w-full rounded-full bg-[#E07B39] text-[18px] font-bold text-white hover:bg-[#D0662A]" }, "Continuar"))
          : h("div", { className: "flex flex-col gap-5" }, h("h2", { className: "m-0 font-serif text-[30px] font-bold text-[#352F54] md:text-[38px]" }, "Como você quer pagar"), h("div", { className: "rounded-2xl bg-[#FDF7F1] p-5" }, h("p", { className: "m-0 text-[18px] font-bold text-[#352F54]" }, "Kit do Detox da Primavera"), h("p", { className: "m-0 mt-2 text-[17px] leading-relaxed" }, `Entrega: ${form.rua}, ${form.numero}, ${form.bairro}, ${form.cidade}/${form.estado}`), h(Button, { type: "button", variant: "link", onClick: () => setEtapa(1), className: "h-auto px-0 py-2 text-[16px] font-bold text-[#A85A1A]" }, "Alterar endereço"), h("p", { className: "m-0 font-bold text-[#A85A1A]" }, "Frete: grátis")), erroPagamento ? h("p", { className: "m-0 text-[16px] text-[#B42318]" }, erroPagamento) : null, h(Button, { type: "button", disabled: metodoCarregando !== null, onClick: () => void comprar("cartao"), className: "flex min-h-[72px] w-full flex-col rounded-2xl bg-[#E07B39] text-[18px] font-bold text-white hover:bg-[#D0662A]" }, metodoCarregando === "cartao" ? h(Loader2, { className: "h-5 w-5 animate-spin" }) : null, `Cartão: 3x de ${dinheiro(normal / 3)} sem juros`, h("span", { className: "text-[14px] font-normal text-white" }, `Total ${dinheiro(normal)}`)), h(Button, { type: "button", disabled: metodoCarregando !== null, onClick: () => void comprar("pix"), className: "min-h-[72px] w-full rounded-2xl bg-[#352F54] text-[18px] font-bold text-white hover:bg-[#1F1A38]" }, metodoCarregando === "pix" ? h(Loader2, { className: "h-5 w-5 animate-spin" }) : null, `Pix: ${dinheiro(pix)}`), h("p", { className: "m-0 flex items-center justify-center gap-2 text-center text-[14px] text-[#655E72]" }, h(ShieldCheck, { className: "h-4 w-4 text-[#E07B39]" }), "Pagamento seguro pelo Mercado Pago."))))));
};

export default DetoxKit;