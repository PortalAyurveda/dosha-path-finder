import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Check,
  ChevronsUpDown,
  Copy,
  ExternalLink,
  Loader2,
  Paperclip,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import {
  Anexo,
  CORES_FUNCAO,
  FUNCOES,
  Funcao,
  Nota,
  Tarefa,
  dataLonga,
} from "./tarefasTipos";

type DevlogItem = { id: string; modulo: string | null; titulo: string | null };

const AnexoImagem = ({ path, titulo }: { path: string; titulo: string }) => {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let vivo = true;
    supabase.storage
      .from("admin-tarefas")
      .createSignedUrl(path, 3600)
      .then(({ data }) => {
        if (vivo) setUrl(data?.signedUrl ?? null);
      });
    return () => {
      vivo = false;
    };
  }, [path]);
  if (!url) return <div className="h-16 w-16 rounded bg-muted animate-pulse" />;
  return (
    <a href={url} target="_blank" rel="noreferrer">
      <img
        src={url}
        alt={titulo}
        className="h-16 w-16 rounded object-cover border border-border"
        loading="lazy"
      />
    </a>
  );
};

const BotaoArquivo = ({ path, titulo }: { path: string; titulo: string }) => {
  const abrir = async () => {
    const { data, error } = await supabase.storage
      .from("admin-tarefas")
      .createSignedUrl(path, 3600);
    if (error || !data?.signedUrl) {
      toast.error("Não consegui abrir o arquivo");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener");
  };
  return (
    <button
      type="button"
      onClick={abrir}
      className="text-sm underline underline-offset-2 inline-flex items-center gap-1"
    >
      <Paperclip className="w-3.5 h-3.5" /> {titulo}
    </button>
  );
};

type Props = {
  aberto: boolean;
  tarefa: Tarefa | null; // null = criar
  onFechar: () => void;
  onSalvo: () => void;
};

const TarefaModal = ({ aberto, tarefa, onFechar, onSalvo }: Props) => {
  const editando = !!tarefa;
  const [titulo, setTitulo] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [funcoes, setFuncoes] = useState<Funcao[]>([]);
  const [urgente, setUrgente] = useState(false);
  const [devlogId, setDevlogId] = useState<string | null>(null);
  const [anexos, setAnexos] = useState<Anexo[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [novaNota, setNovaNota] = useState("");
  const [anotando, setAnotando] = useState(false);
  const [subindo, setSubindo] = useState(false);
  const [confirmarExcluir, setConfirmarExcluir] = useState(false);
  const [devlogs, setDevlogs] = useState<DevlogItem[]>([]);
  const [comboAberto, setComboAberto] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!aberto) return;
    setTitulo(tarefa?.titulo ?? "");
    setObjetivo(tarefa?.objetivo ?? "");
    setFuncoes((tarefa?.funcoes as Funcao[]) ?? []);
    setUrgente(tarefa?.urgente ?? false);
    setDevlogId(tarefa?.devlog_id ?? null);
    setAnexos(Array.isArray(tarefa?.anexos) ? (tarefa!.anexos as Anexo[]) : []);
    setNovaNota("");
  }, [aberto, tarefa]);

  useEffect(() => {
    if (!aberto || devlogs.length) return;
    supabase
      .from("portal_devlog")
      .select("id, modulo, titulo")
      .order("modulo")
      .then(({ data }) => setDevlogs((data as DevlogItem[]) ?? []));
  }, [aberto, devlogs.length]);

  const devlogEscolhido = useMemo(
    () => devlogs.find((d) => d.id === devlogId) ?? null,
    [devlogs, devlogId]
  );

  const notas: Nota[] = Array.isArray(tarefa?.notas) ? (tarefa!.notas as Nota[]) : [];

  const alternarFuncao = (f: Funcao) =>
    setFuncoes((atual) => (atual.includes(f) ? atual.filter((x) => x !== f) : [...atual, f]));

  const salvar = async () => {
    if (!titulo.trim() || funcoes.length === 0) return;
    setSalvando(true);
    const payload = {
      titulo: titulo.trim(),
      objetivo: objetivo.trim() || null,
      funcoes,
      urgente,
      devlog_id: devlogId,
      anexos: anexos as unknown as never,
    };
    const tabela = supabase.from("admin_tarefas") as any;
    const { error } = editando
      ? await tabela.update(payload).eq("id", tarefa!.id)
      : await tabela.insert(payload);


    setSalvando(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(editando ? "Tarefa atualizada" : "Tarefa criada");
    onSalvo();
    onFechar();
  };

  const anotar = async () => {
    const texto = novaNota.trim();
    if (!texto || !tarefa) return;
    setAnotando(true);
    const { error } = await supabase.rpc("admin_tarefa_anotar", {
      p_id: tarefa.id,
      p_texto: texto.slice(0, 2000),
    });
    setAnotando(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setNovaNota("");
    toast.success("Anotação registrada");
    onSalvo();
  };

  const subirArquivo = async (file: File) => {
    if (!tarefa) return;
    setSubindo(true);
    const path = `${tarefa.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("admin-tarefas").upload(path, file);
    if (error) {
      setSubindo(false);
      toast.error(error.message);
      return;
    }
    const ehImagem = file.type.startsWith("image/");
    const novos: Anexo[] = [
      ...anexos,
      { tipo: ehImagem ? "imagem" : "arquivo", titulo: file.name, path },
    ];
    const { error: e2 } = await (supabase.from("admin_tarefas") as any)
      .update({ anexos: novos })
      .eq("id", tarefa.id);
    setSubindo(false);
    if (e2) {
      toast.error(e2.message);
      return;
    }
    setAnexos(novos);
    onSalvo();
  };

  const removerAnexo = async (idx: number) => {
    const alvo = anexos[idx];
    if (alvo?.path) {
      const { error } = await supabase.storage.from("admin-tarefas").remove([alvo.path]);
      if (error) {
        toast.error(error.message);
        return;
      }
    }
    const novos = anexos.filter((_, i) => i !== idx);
    setAnexos(novos);
    if (tarefa) {
      const { error } = await (supabase.from("admin_tarefas") as any)
        .update({ anexos: novos })
        .eq("id", tarefa.id);
      if (error) toast.error(error.message);
      else onSalvo();
    }
  };

  const arquivar = async () => {
    if (!tarefa) return;
    const { error } = await (supabase.from("admin_tarefas") as any)
      .update({ arquivada: true })
      .eq("id", tarefa.id);
    if (error) return toast.error(error.message);
    toast.success("Tarefa arquivada");
    onSalvo();
    onFechar();
  };

  const excluir = async () => {
    if (!tarefa) return;
    const paths = anexos.filter((a) => a.path).map((a) => a.path as string);
    if (paths.length) {
      const { error } = await supabase.storage.from("admin-tarefas").remove(paths);
      if (error) {
        toast.error(`Não consegui apagar os arquivos: ${error.message}`);
        return;
      }
    }
    const { error } = await supabase.from("admin_tarefas").delete().eq("id", tarefa.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Tarefa excluída");
    onSalvo();
    onFechar();
  };

  return (
    <>
      <Dialog open={aberto} onOpenChange={(v) => !v && onFechar()}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar tarefa" : "Nova tarefa"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="tarefa-titulo">O que é</Label>
              <Input
                id="tarefa-titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Título da tarefa"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tarefa-objetivo">Pro que é</Label>
              <Textarea
                id="tarefa-objetivo"
                rows={3}
                value={objetivo}
                onChange={(e) => setObjetivo(e.target.value)}
                placeholder="Objetivo dessa tarefa"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Funções</Label>
              <div className="flex flex-wrap gap-2">
                {FUNCOES.map((f) => {
                  const ativo = funcoes.includes(f.key);
                  return (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => alternarFuncao(f.key)}
                      className="px-3 py-1.5 rounded-full text-xs border transition-colors"
                      style={
                        ativo
                          ? { background: CORES_FUNCAO[f.key], borderColor: CORES_FUNCAO[f.key], color: "#fff" }
                          : { borderColor: "#EDE8F5", color: "#352F54" }
                      }
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={urgente} onCheckedChange={(v) => setUrgente(v === true)} />
              Urgente
            </label>

            <div className="space-y-1.5">
              <Label>Módulo do devlog (opcional)</Label>
              <Popover open={comboAberto} onOpenChange={setComboAberto}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between font-normal">
                    <span className="truncate">
                      {devlogEscolhido
                        ? `${devlogEscolhido.modulo ?? "—"} — ${devlogEscolhido.titulo ?? ""}`
                        : "Nenhum"}
                    </span>
                    <ChevronsUpDown className="w-4 h-4 opacity-50 shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0 z-50 bg-popover">
                  <Command>
                    <CommandInput placeholder="Buscar módulo..." />
                    <CommandList>
                      <CommandEmpty>Nada encontrado.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          onSelect={() => {
                            setDevlogId(null);
                            setComboAberto(false);
                          }}
                        >
                          Nenhum
                        </CommandItem>
                        {devlogs.map((d) => (
                          <CommandItem
                            key={d.id}
                            value={`${d.modulo ?? ""} ${d.titulo ?? ""}`}
                            onSelect={() => {
                              setDevlogId(d.id);
                              setComboAberto(false);
                            }}
                          >
                            {devlogId === d.id && <Check className="w-4 h-4 mr-2" />}
                            <span className="truncate">
                              {d.modulo ?? "—"} — {d.titulo ?? ""}
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Anexos */}
            <div className="space-y-2">
              <Label>Links e caminhos</Label>
              <div className="space-y-2">
                {anexos.map((a, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {a.tipo === "imagem" && a.path ? (
                      <AnexoImagem path={a.path} titulo={a.titulo} />
                    ) : a.tipo === "arquivo" && a.path ? (
                      <div className="flex-1 min-w-0">
                        <BotaoArquivo path={a.path} titulo={a.titulo} />
                      </div>
                    ) : (
                      <>
                        <Input
                          className="w-1/3"
                          value={a.titulo}
                          onChange={(e) =>
                            setAnexos((v) =>
                              v.map((x, j) => (j === i ? { ...x, titulo: e.target.value } : x))
                            )
                          }
                          placeholder="título"
                        />
                        <Input
                          className="flex-1"
                          value={a.url ?? ""}
                          onChange={(e) =>
                            setAnexos((v) =>
                              v.map((x, j) => (j === i ? { ...x, url: e.target.value } : x))
                            )
                          }
                          placeholder={a.tipo === "link" ? "https://..." : "src/pages/..."}
                        />
                        {a.tipo === "link" && a.url && (
                          <a href={a.url} target="_blank" rel="noreferrer" className="p-1">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        {a.tipo === "caminho" && a.url && (
                          <button
                            type="button"
                            className="p-1"
                            onClick={() => {
                              navigator.clipboard.writeText(a.url ?? "");
                              toast.success("Copiado");
                            }}
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}
                    {a.tipo !== "link" && a.tipo !== "caminho" && (
                      <span className="flex-1 text-xs text-muted-foreground truncate">
                        {a.titulo}
                      </span>
                    )}
                    <button
                      type="button"
                      className="p-1 text-muted-foreground hover:text-destructive"
                      aria-label="Remover anexo"
                      onClick={() => removerAnexo(i)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setAnexos((v) => [...v, { tipo: "link", titulo: "", url: "" }])}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Link
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setAnexos((v) => [...v, { tipo: "caminho", titulo: "", url: "" }])}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Caminho
                </Button>
                {editando && (
                  <>
                    <input
                      ref={fileRef}
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) subirArquivo(f);
                        e.target.value = "";
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={subindo}
                      onClick={() => fileRef.current?.click()}
                    >
                      {subindo ? (
                        <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5 mr-1" />
                      )}
                      Enviar arquivo
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Anotações */}
            {editando && (
              <div className="space-y-2 border-t border-border pt-4">
                <Label>Anotações</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {notas.length === 0 && (
                    <p className="text-xs text-muted-foreground">Nenhuma anotação ainda.</p>
                  )}
                  {[...notas].reverse().map((n, i) => (
                    <div key={i} className="rounded-md bg-muted/50 p-2">
                      <p className="text-sm whitespace-pre-wrap">{String(n.texto ?? "")}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {dataLonga(String(n.em ?? ""))}
                        {n.autor_email ? ` · ${String(n.autor_email)}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
                <Textarea
                  rows={2}
                  maxLength={2000}
                  placeholder="o que aconteceu?"
                  value={novaNota}
                  onChange={(e) => setNovaNota(e.target.value)}
                />
                <Button
                  type="button"
                  size="sm"
                  disabled={!novaNota.trim() || anotando}
                  onClick={anotar}
                >
                  {anotando && <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />}
                  Anotar
                </Button>
              </div>
            )}

            {editando && (
              <div className="text-[11px] text-muted-foreground space-y-0.5 border-t border-border pt-3">
                <p>
                  criada por {tarefa!.criado_por_email ?? "—"} há {tarefa!.dias_aberta ?? 0} dias
                </p>
                <p>
                  em {tarefa!.status} há {tarefa!.dias_na_coluna ?? 0} dias
                </p>
                {tarefa!.concluida_em && <p>concluída em {dataLonga(tarefa!.concluida_em)}</p>}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            <div className="flex gap-2">
              {editando && (
                <>
                  <Button type="button" variant="outline" size="sm" onClick={arquivar}>
                    Arquivar
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setConfirmarExcluir(true)}
                  >
                    Excluir
                  </Button>
                </>
              )}
            </div>
            <Button
              type="button"
              onClick={salvar}
              disabled={!titulo.trim() || funcoes.length === 0 || salvando}
            >
              {salvando && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              {editando ? "Salvar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmarExcluir} onOpenChange={setConfirmarExcluir}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir esta tarefa?</AlertDialogTitle>
            <AlertDialogDescription>
              Os anexos enviados também serão apagados. Não dá pra desfazer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={excluir}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TarefaModal;
