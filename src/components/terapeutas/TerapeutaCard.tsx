import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";
import {
  cleanTherapistText,
  getTherapistDisplayName,
  getTherapistProfilePath,
  splitTherapistSpecialties,
} from "@/lib/terapeutas";
import CTAButton from "@/components/CTAButton";
import type { TerapeutaNoSistema } from "@/lib/terapia";
import { reais } from "@/lib/terapia";

interface TerapeutaCardProps {
  nome: string;
  cidade: string | null;
  estado: string | null;
  especialidade: string | null;
  resumo: string | null;
  imagem: string | null;
  slug: string | null;
  imagem_card: string | null;
  frase_card: string | null;
  formado_desde: number | null;
  sistema?: TerapeutaNoSistema;
  combina?: string[];
  temInstagram: boolean;
  online?: boolean;
  valor?: number | null;
}

function primeiraFrase(texto: string) {
  const match = texto.match(/^(.+?[.!?])(\s|$)/);
  if (match) return match[1];
  return texto.length > 140 ? `${texto.slice(0, 140).trim()}…` : texto;
}

const TerapeutaCard = ({
  nome,
  cidade,
  estado,
  especialidade,
  resumo,
  imagem,
  slug,
  imagem_card,
  frase_card,
  formado_desde,
  sistema,
  combina,
  temInstagram,
  online,
  valor,
}: TerapeutaCardProps) => {
  const displayName = getTherapistDisplayName(nome);
  const especialidades = splitTherapistSpecialties(especialidade);
  const profilePath = getTherapistProfilePath(slug ?? nome);

  const foto = imagem_card || imagem || null;

  const linhaLocal = [
    cleanTherapistText(cidade) || null,
    estado ? estado.trim().slice(0, 2).toUpperCase() : null,
    formado_desde ? `desde ${formado_desde}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const frase =
    cleanTherapistText(frase_card) || primeiraFrase(cleanTherapistText(resumo));

  return (
    <article
      className="group flex gap-3.5 rounded-2xl border border-border bg-card p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
    >
      <div className="w-[92px] sm:w-[132px] shrink-0 aspect-[4/5] rounded-xl overflow-hidden bg-muted">
        {foto ? (
          <img
            src={foto}
            alt={`Foto de ${displayName}`}
            width={480}
            height={600}
            className="h-full w-full object-cover object-center"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-3xl font-bold text-muted-foreground">
            {displayName[0] || "?"}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 min-w-0">
        <h3 className="text-[15px] sm:text-[17px] font-serif font-bold text-foreground leading-tight">
          <Link to={profilePath}>{displayName}</Link>
        </h3>

        {linhaLocal && (
          <p className="text-[12.5px] text-muted-foreground">{linhaLocal}</p>
        )}

        {sistema && <div className="space-y-1 text-xs text-muted-foreground">
          <p className="font-semibold text-[hsl(var(--therapist-green-ink))]">Consulta online {sistema.teste && <span className="ml-1 text-muted-foreground">· teste</span>}</p>
          {online && <p className="font-semibold text-[hsl(var(--therapist-green-ink))]">● online agora</p>}
          {valor != null && <p>{valor === 0 ? "Consulta gratuita" : `Consulta ${reais(Number(valor))}`}</p>}
          {sistema.proximo && <p>Próximo horário: {new Date(sistema.proximo).toLocaleString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit", hour: "numeric", minute: "2-digit", timeZone: "America/Sao_Paulo" })}</p>}
          {!!sistema.numeros?.avaliacoes && <p>★ {Number(sistema.numeros.nota).toLocaleString("pt-BR", {maximumFractionDigits: 1})} · {sistema.numeros.atendimentos} atendimentos</p>}
        </div>}
        {!!combina?.length && <p className="text-xs text-muted-foreground">Combina com o seu teste: {combina.join(", ")}</p>}

        {especialidades.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {especialidades.slice(0, 3).map((esp) => (
              <span
                key={esp}
                className="rounded-full bg-muted px-[9px] py-[3px] text-[11.5px] font-semibold text-primary"
              >
                {esp}
              </span>
            ))}
            {especialidades.length > 3 && (
              <span className="rounded-full bg-muted px-[9px] py-[3px] text-[11.5px] font-semibold text-muted-foreground">
                +{especialidades.length - 3}
              </span>
            )}
          </div>
        )}

        {frase && (
          <p className="text-[13px] text-muted-foreground leading-snug line-clamp-2 sm:line-clamp-3">
            “{frase}”
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          {sistema ? <CTAButton to={`${profilePath}#agenda`} className="h-9 px-4 py-1 text-sm">Agendar</CTAButton> : <Link to={profilePath} className="rounded-full bg-muted px-3 py-1 text-sm font-bold text-primary">Ver perfil</Link>}
          <div className="flex items-center gap-1.5">
            {temInstagram && (
              <span
                className="flex h-[28px] w-[28px] items-center justify-center rounded-full border border-border bg-card text-primary"
                aria-label="Instagram"
              >
                <Instagram className="h-3.5 w-3.5" />
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default TerapeutaCard;
