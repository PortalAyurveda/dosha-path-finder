import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowDown,
  ArrowUp,
  Check,
  MessageSquare,
  MoveRight,
  Paperclip,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CORES_FUNCAO,
  COLUNAS,
  ESTILO_COLUNA,
  Status,
  Tarefa,
  dataCurta,
} from "./tarefasTipos";

type Props = {
  tarefa: Tarefa;
  onAbrir: (t: Tarefa) => void;
  onSubir: (t: Tarefa) => void;
  onDescer: (t: Tarefa) => void;
  onMoverColuna: (t: Tarefa, s: Status) => void;
  onTopo: (t: Tarefa) => void;
  onFim: (t: Tarefa) => void;
  onArquivar: (t: Tarefa) => void;
  podeSubir: boolean;
  podeDescer: boolean;
};

const TarefaCard = ({
  tarefa,
  onAbrir,
  onSubir,
  onDescer,
  onMoverColuna,
  onTopo,
  onFim,
  onArquivar,
  podeSubir,
  podeDescer,
}: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: tarefa.id });

  const estilo = ESTILO_COLUNA[tarefa.status] ?? ESTILO_COLUNA.a_fazer;
  const quente = tarefa.temperatura === "quente";
  const fervendo = tarefa.temperatura === "fervendo";
  const borda = fervendo ? "#DC2626" : quente ? "#F0B429" : estilo.border;
  const funcoes = tarefa.funcoes ?? [];

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        background: estilo.bg,
        border: `1px solid ${borda}`,
        boxShadow: estilo.shadow,
      }}
      className="group relative rounded-lg overflow-hidden cursor-pointer"
      onClick={() => onAbrir(tarefa)}
      {...attributes}
      {...listeners}
    >
      {/* Camada 2 — barra de funções */}
      <div className="absolute left-0 top-0 bottom-0 w-[4px] flex flex-col">
        {(funcoes.length ? funcoes : (["administrativo"] as const)).map((f) => (
          <div key={f} className="flex-1" style={{ background: CORES_FUNCAO[f] }} />
        ))}
      </div>

      <div className="pl-4 pr-2 py-2.5 space-y-1">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <p
              className="!text-sm leading-snug flex items-start gap-1.5"
              style={{
                fontSize: "0.875rem",
                fontWeight: tarefa.urgente ? 700 : 500,
                color: "#352F54",
                opacity: tarefa.status === "feito" ? 0.7 : 1,
              }}
            >
              {tarefa.urgente && (
                <span className="mt-1.5 h-[6px] w-[6px] rounded-full bg-red-600 shrink-0" />
              )}
              {tarefa.status === "feito" && (
                <Check className="w-3.5 h-3.5 mt-0.5 shrink-0 text-green-700/70" />
              )}
              <span className="min-w-0">{tarefa.titulo}</span>
            </p>
          </div>

          <div
            className="flex items-center gap-0.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Mover para cima"
              disabled={!podeSubir}
              onClick={() => onSubir(tarefa)}
              className="p-1 rounded hover:bg-black/5 disabled:opacity-25"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              aria-label="Mover para baixo"
              disabled={!podeDescer}
              onClick={() => onDescer(tarefa)}
              className="p-1 rounded hover:bg-black/5 disabled:opacity-25"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Mover para outra coluna"
                  className="p-1 rounded hover:bg-black/5"
                >
                  <MoveRight className="w-3.5 h-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-50">
                <DropdownMenuItem onClick={() => onTopo(tarefa)}>Mandar pro topo</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFim(tarefa)}>Mandar pro fim</DropdownMenuItem>
                {COLUNAS.filter((c) => c.key !== tarefa.status).map((c) => (
                  <DropdownMenuItem key={c.key} onClick={() => onMoverColuna(tarefa, c.key)}>
                    Mover para {c.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {tarefa.objetivo && (
          <p className="text-xs text-muted-foreground line-clamp-2">{tarefa.objetivo}</p>
        )}

        {tarefa.ultima_nota && (
          <p className="text-xs italic text-muted-foreground truncate">
            “{tarefa.ultima_nota}” {dataCurta(tarefa.ultima_nota_em)}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[10px] text-muted-foreground">
          {funcoes.map((f) => (
            <span
              key={f}
              className="px-1.5 py-0.5 rounded-full"
              style={{ background: `${CORES_FUNCAO[f]}1A`, color: CORES_FUNCAO[f] }}
            >
              {f}
            </span>
          ))}

          {tarefa.devlog_modulo && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="px-1.5 py-0.5 rounded-full bg-muted text-foreground/70">
                    {tarefa.devlog_modulo}
                  </span>
                </TooltipTrigger>
                <TooltipContent>{tarefa.devlog_titulo ?? tarefa.devlog_modulo}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {!!tarefa.qtd_anexos && (
            <span className="inline-flex items-center gap-0.5">
              <Paperclip className="w-3 h-3" />
              {tarefa.qtd_anexos}
            </span>
          )}
          {!!tarefa.qtd_notas && (
            <span className="inline-flex items-center gap-0.5">
              <MessageSquare className="w-3 h-3" />
              {tarefa.qtd_notas}
            </span>
          )}

          {(quente || fervendo) && (
            <span
              className="px-1.5 py-0.5 rounded"
              style={
                fervendo
                  ? { color: "#DC2626", background: "#FEF2F2", fontWeight: 600 }
                  : { color: "#B7791F" }
              }
            >
              parada há {tarefa.dias_parada} dias
            </span>
          )}

          {tarefa.sugerir_arquivar && (
            <button
              type="button"
              className="underline underline-offset-2 hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                onArquivar(tarefa);
              }}
            >
              arquivar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TarefaCard;
