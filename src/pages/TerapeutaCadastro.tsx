import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Loader2, Upload, Check, ArrowLeft, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import PageContainer from "@/components/PageContainer";
import { TERAPEUTA_ESPECIALIDADES, ANO_FORMACAO_MIN, ANO_FORMACAO_MAX } from "@/lib/terapeutaConstants";
import { fetchEstados, fetchMunicipios, type IbgeEstado, type IbgeMunicipio } from "@/lib/ibge";
import { slugify } from "@/lib/slugify";
import { getTherapistProfilePath } from "@/lib/terapeutas";

interface FormState {
  nome: string;
  especialidades: string[];
  formado_desde: string;
  instagram: string;
  pais: string; // "Brasil" or other
  estado: string;
  cidade: string;
  resumo: string;
  email: string;
  website: string;
  whatsapp: string;
  imagem: string;
}

const EMPTY: FormState = {
  nome: "",
  especialidades: [],
  formado_desde: "",
  instagram: "",
  pais: "Brasil",
  estado: "",
  cidade: "",
  resumo: "",
  email: "",
  website: "",
  whatsapp: "",
  imagem: "",
};

const TerapeutaCadastro = () => {
  const { user, loading: authLoading } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [existingId, setExistingId] = useState<string | null>(null);
  const [existingSlug, setExistingSlug] = useState<string | null>(null);
  const [existingStatus, setExistingStatus] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [estados, setEstados] = useState<IbgeEstado[]>([]);
  const [municipios, setMunicipios] = useState<IbgeMunicipio[]>([]);
  const [loadingMunicipios, setLoadingMunicipios] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const isBrasil = form.pais === "Brasil";

  // Load estados once
  useEffect(() => {
    fetchEstados().then(setEstados).catch(() => setEstados([]));
  }, []);

  // Load municipios when estado changes
  useEffect(() => {
    if (!isBrasil || !form.estado) {
      setMunicipios([]);
      return;
    }
    setLoadingMunicipios(true);
    fetchMunicipios(form.estado)
      .then(setMunicipios)
      .catch(() => setMunicipios([]))
      .finally(() => setLoadingMunicipios(false));
  }, [form.estado, isBrasil]);

  // Load existing profile by email
  useEffect(() => {
    if (authLoading) return;
    if (!user?.email) {
      setLoadingProfile(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoadingProfile(true);
      const { data: rawData, error } = await supabase
        .from("portal_terapeutas")
        .select("*")
        .ilike("email", user.email!)
        .maybeSingle();

      if (cancelled) return;

      const data = rawData as any;

      if (!error && data) {
        setExistingId(data.id);
        setExistingSlug(data["terapeutas(dinamica)"] ?? null);
        setExistingStatus(data.status ?? null);

        const isBR = !data.pais || String(data.pais).toLowerCase() === "brasil" || data.pais === "";
        setForm({
          nome: data.nome ?? "",
          especialidades: (data.especialidade ?? "")
            .split(/\s*,\s*|\n+/)
            .map((s: string) => s.trim())
            .filter(Boolean),
          formado_desde: data.formado_desde ? String(data.formado_desde) : "",
          instagram: data.instagram ?? "",
          pais: isBR ? "Brasil" : (data.pais ?? "Outro"),
          estado: data.estado ?? "",
          cidade: data.cidade ?? "",
          resumo: data.resumo ?? "",
          email: data.email ?? user.email!,
          website: data.website ?? "",
          whatsapp: data.whatsapp ?? "",
          imagem: data.imagem ?? data["imagem.1"] ?? "",
        });
      } else {
        setForm((f) => ({ ...f, email: user.email! }));
      }
      setLoadingProfile(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const slugPreview = useMemo(() => slugify(form.nome || "seu-nome"), [form.nome]);

  // Not logged in → invite to login
  if (!authLoading && !user) {
    return (
      <PageContainer
        title="Cadastre seu perfil — Terapeutas do Brasil"
        description="Faça login para cadastrar seu perfil de terapeuta no Portal Ayurveda."
      >
        <div className="max-w-xl mx-auto text-center py-16">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-3">
            Cadastre seu perfil
          </h1>
          <p className="text-muted-foreground mb-8">
            Para cadastrar ou editar seu perfil de terapeuta, você precisa estar logado no portal.
            Entre com seu email para continuar.
          </p>
          <Link to="/entrar?redirect=/terapeutas-do-brasil/cadastro">
            <Button size="lg" className="gap-2 bg-[#FF7676] hover:bg-[#ff5c5c] text-white">
              <LogIn className="h-4 w-4" />
              Entrar no portal
            </Button>
          </Link>
          <div className="mt-8">
            <Link
              to="/terapeutas-do-brasil"
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" /> Voltar ao diretório
            </Link>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (authLoading || loadingProfile) {
    return (
      <PageContainer title="Cadastre seu perfil" description="Carregando…">
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageContainer>
    );
  }

  const toggleEspecialidade = (esp: string) => {
    setForm((f) => ({
      ...f,
      especialidades: f.especialidades.includes(esp)
        ? f.especialidades.filter((e) => e !== esp)
        : [...f.especialidades, esp],
    }));
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Arquivo muito grande", description: "Máximo 5MB.", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${slugify(user!.email!)}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("terapeutas").upload(path, file, {
        cacheControl: "3600",
        upsert: true,
      });
      if (error) throw error;
      const { data } = supabase.storage.from("terapeutas").getPublicUrl(path);
      setForm((f) => ({ ...f, imagem: data.publicUrl }));
      toast({ title: "Foto enviada!", description: "Imagem carregada com sucesso." });
    } catch (err: any) {
      toast({ title: "Erro no upload", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim()) {
      toast({ title: "Informe seu nome", variant: "destructive" });
      return;
    }
    if (form.especialidades.length === 0) {
      toast({ title: "Selecione ao menos uma especialidade", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const slug = slugify(form.nome);
      const payload: Record<string, any> = {
        nome: form.nome.trim(),
        title: form.nome.trim(),
        especialidade: form.especialidades.join(", "),
        formado_desde: form.formado_desde ? Number(form.formado_desde) : null,
        instagram: form.instagram.trim() || null,
        pais: form.pais.trim() || null,
        estado: isBrasil ? form.estado : null,
        cidade: form.cidade.trim() || null,
        resumo: form.resumo.trim() || null,
        email: form.email.trim() || user!.email!,
        website: form.website.trim() || null,
        whatsapp: form.whatsapp.trim() || null,
        imagem: form.imagem || null,
        "terapeutas(dinamica)": existingSlug ?? slug,
      };

      if (existingId) {
        const { error } = await supabase
          .from("portal_terapeutas")
          .update(payload as any)
          .eq("id", existingId);
        if (error) throw error;
        toast({ title: "Perfil atualizado!", description: "Suas alterações foram salvas." });
      } else {
        const { error } = await supabase.from("portal_terapeutas").insert({
          ...payload,
          status: "pendente",
        } as any);
        if (error) throw error;
        setSuccess(true);
      }
    } catch (err: any) {
      toast({ title: "Erro ao salvar", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // Success screen for new submissions
  if (success) {
    return (
      <PageContainer title="Cadastro enviado" description="Seu cadastro foi recebido com sucesso.">
        <div className="max-w-xl mx-auto text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FF7676]/10 text-[#FF7676] mb-6">
            <Check className="h-8 w-8" />
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-3">
            Cadastro enviado!
          </h1>
          <p className="text-muted-foreground mb-2">
            Seu perfil foi enviado e está <strong>aguardando aprovação</strong> da nossa equipe.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Avisaremos por email assim que estiver publicado no diretório.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate("/terapeutas-do-brasil")}>
              Voltar ao diretório
            </Button>
            <Button
              className="bg-[#FF7676] hover:bg-[#ff5c5c] text-white"
              onClick={() => {
                setSuccess(false);
                window.location.reload();
              }}
            >
              Editar meu cadastro
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={existingId ? "Edite seu perfil — Terapeutas do Brasil" : "Cadastre seu perfil — Terapeutas do Brasil"}
      description="Cadastre ou edite seu perfil profissional no diretório de terapeutas ayurvédicos do Portal Ayurveda."
    >
      <div className="max-w-3xl mx-auto">
        <Link
          to="/terapeutas-do-brasil"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao diretório
        </Link>

        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
            {existingId ? "Edite seu perfil" : "Cadastre seu perfil"}
          </h1>
          {existingId && existingStatus && (
            <p className="text-sm text-muted-foreground mt-1">
              Status atual:{" "}
              <span className="font-medium capitalize">{existingStatus}</span>
              {existingStatus === "aprovado" && existingSlug && (
                <>
                  {" — "}
                  <Link
                    to={getTherapistProfilePath(existingSlug)}
                    className="text-primary hover:underline"
                  >
                    ver perfil público
                  </Link>
                </>
              )}
            </p>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            Logado como <strong>{user!.email}</strong>
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Foto */}
          <section className="space-y-3">
            <Label className="text-base font-semibold">Foto de perfil</Label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-muted border border-border flex items-center justify-center shrink-0">
                {form.imagem ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.imagem} alt="Sua foto" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-muted-foreground">Sem foto</span>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  id="foto-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />
                <label htmlFor="foto-upload">
                  <Button type="button" variant="outline" size="sm" asChild disabled={uploading}>
                    <span className="cursor-pointer">
                      {uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enviando…
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" /> {form.imagem ? "Trocar foto" : "Enviar foto"}
                        </>
                      )}
                    </span>
                  </Button>
                </label>
                <p className="text-xs text-muted-foreground mt-2">JPG ou PNG, até 5MB.</p>
              </div>
            </div>
          </section>

          {/* Nome */}
          <section className="space-y-2">
            <Label htmlFor="nome" className="text-base font-semibold">Nome completo *</Label>
            <Input
              id="nome"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Maria Silva"
              required
            />
            <p className="text-xs text-muted-foreground">
              URL do seu perfil:{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">
                /terapeutas/{existingSlug ?? slugPreview}
              </code>{" "}
              <span className="text-muted-foreground/70">(não pode ser alterada)</span>
            </p>
          </section>

          {/* Especialidades */}
          <section className="space-y-3">
            <Label className="text-base font-semibold">Especialidades * <span className="text-xs font-normal text-muted-foreground">(marque todas que se aplicam)</span></Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {TERAPEUTA_ESPECIALIDADES.map((esp) => {
                const checked = form.especialidades.includes(esp);
                return (
                  <label
                    key={esp}
                    className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                      checked ? "border-[#FF7676] bg-[#FF7676]/5" : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleEspecialidade(esp)}
                      className="mt-0.5"
                    />
                    <span className="text-sm leading-snug">{esp}</span>
                  </label>
                );
              })}
            </div>
          </section>

          {/* Formado desde */}
          <section className="space-y-2">
            <Label htmlFor="formado" className="text-base font-semibold">Atua como terapeuta desde</Label>
            <Input
              id="formado"
              type="number"
              min={ANO_FORMACAO_MIN}
              max={ANO_FORMACAO_MAX}
              value={form.formado_desde}
              onChange={(e) => setForm({ ...form, formado_desde: e.target.value })}
              placeholder="2018"
              className="max-w-[160px]"
            />
            <p className="text-xs text-muted-foreground">Entre {ANO_FORMACAO_MIN} e {ANO_FORMACAO_MAX}.</p>
          </section>

          {/* Localização */}
          <section className="space-y-3">
            <Label className="text-base font-semibold">Localização</Label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="pais"
                  checked={isBrasil}
                  onChange={() => setForm({ ...form, pais: "Brasil", estado: "", cidade: "" })}
                />
                <span className="text-sm">Brasil</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="pais"
                  checked={!isBrasil}
                  onChange={() => setForm({ ...form, pais: "", estado: "", cidade: "" })}
                />
                <span className="text-sm">Fora do Brasil</span>
              </label>
            </div>

            {isBrasil ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="estado" className="text-sm">Estado</Label>
                  <Select
                    value={form.estado}
                    onValueChange={(v) => setForm({ ...form, estado: v, cidade: "" })}
                  >
                    <SelectTrigger id="estado">
                      <SelectValue placeholder="Selecione…" />
                    </SelectTrigger>
                    <SelectContent>
                      {estados.map((uf) => (
                        <SelectItem key={uf.sigla} value={uf.sigla}>
                          {uf.nome} ({uf.sigla})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="cidade" className="text-sm">Cidade</Label>
                  <Select
                    value={form.cidade}
                    onValueChange={(v) => setForm({ ...form, cidade: v })}
                    disabled={!form.estado || loadingMunicipios}
                  >
                    <SelectTrigger id="cidade">
                      <SelectValue
                        placeholder={
                          !form.estado
                            ? "Selecione um estado primeiro"
                            : loadingMunicipios
                              ? "Carregando…"
                              : "Selecione…"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {municipios.map((m) => (
                        <SelectItem key={m.id} value={m.nome}>
                          {m.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="pais" className="text-sm">País</Label>
                  <Input
                    id="pais"
                    value={form.pais}
                    onChange={(e) => setForm({ ...form, pais: e.target.value })}
                    placeholder="Portugal"
                  />
                </div>
                <div>
                  <Label htmlFor="cidade-int" className="text-sm">Cidade</Label>
                  <Input
                    id="cidade-int"
                    value={form.cidade}
                    onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                    placeholder="Lisboa"
                  />
                </div>
              </div>
            )}
          </section>

          {/* Resumo */}
          <section className="space-y-2">
            <Label htmlFor="resumo" className="text-base font-semibold">Resumo pessoal</Label>
            <Textarea
              id="resumo"
              value={form.resumo}
              onChange={(e) => setForm({ ...form, resumo: e.target.value })}
              placeholder="Conte sobre sua trajetória, formação e abordagem terapêutica…"
              rows={6}
            />
          </section>

          {/* Contatos */}
          <section className="space-y-4">
            <Label className="text-base font-semibold">Contatos</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="email" className="text-sm">Email para contato</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="contato@exemplo.com"
                />
              </div>
              <div>
                <Label htmlFor="whatsapp" className="text-sm">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  placeholder="+55 11 99999-9999"
                />
              </div>
              <div>
                <Label htmlFor="instagram" className="text-sm">Instagram</Label>
                <Input
                  id="instagram"
                  value={form.instagram}
                  onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                  placeholder="@seu_perfil"
                />
              </div>
              <div>
                <Label htmlFor="website" className="text-sm">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  placeholder="https://seusite.com"
                />
              </div>
            </div>
          </section>

          {/* Submit */}
          <div className="pt-4 border-t border-border flex flex-col items-center gap-3">
            <Button
              type="submit"
              size="lg"
              disabled={submitting}
              className="bg-[#FF7676] hover:bg-[#ff5c5c] text-white px-10"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enviando…
                </>
              ) : existingId ? (
                "Salvar alterações"
              ) : (
                "Enviar perfil"
              )}
            </Button>
            {!existingId && (
              <p className="text-xs text-muted-foreground text-center max-w-md">
                Após o envio, seu perfil ficará com status <strong>pendente</strong> e será revisado pela nossa equipe antes de ser publicado.
              </p>
            )}
          </div>
        </form>
      </div>
    </PageContainer>
  );
};

export default TerapeutaCadastro;
