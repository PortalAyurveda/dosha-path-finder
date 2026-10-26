import { Link } from "react-router-dom";
import { Instagram, MessageCircle } from "lucide-react";
import {
  cleanTherapistText,
  getTherapistDisplayName,
  getTherapistProfilePath,
  nomeCurtoEspecialidade,
  splitTherapistSpecialties,
} from "@/lib/terapeutas";
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
  temWhatsapp: boolean;
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
  temWhatsapp,
  temInstagram,
  online,
  valor,
}: TerapeutaCardProps) => {
  const displayName = getTherapistDisplayName(nome);
  const especialidades = splitTherapistSpecialties(especialidade).map(
    nomeCurtoEspecialidade,
  );
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
    <Link
      to={profilePath}
      className="group flex gap-3.5 rounded-2xl border border-border bg-white p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
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
          {displayName}
        </h3>

        {linhaLocal && (
          <p className="text-[12.5px] text-muted-foreground">{linhaLocal}</p>
        )}

        {(online || valor) && (
          <p className="flex flex-wrap items-center gap-x-2 text-[12.5px] text-muted-foreground">
            {online && <span className="inline-flex items-center gap-1 font-semibold text-[hsl(var(--therapist-green-ink))]"><span className="h-2 w-2 rounded-full bg-[hsl(var(--therapist-green-ink))]" aria-hidden />online agora</span>}
            {valor ? <span>Consulta {reais(Number(valor))}</span> : null}
          </p>
        )}

        {especialidades.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {especialidades.slice(0, 3).map((esp) => (
              <span
                key={esp}
                className="rounded-full bg-[#F1EEF8] px-[9px] py-[3px] text-[11.5px] font-semibold text-[#4E3F7E]"
              >
                {esp}
              </span>
            ))}
            {especialidades.length > 3 && (
              <span className="rounded-full bg-[#F3F4F7] px-[9px] py-[3px] text-[11.5px] font-semibold text-[#7A7690]">
                +{especialidades.length - 3}
              </span>
            )}
          </div>
        )}

        {frase && (
          <p className="text-[13px] text-[#4A4566] leading-snug line-clamp-2 sm:line-clamp-3">
            “{frase}”
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <span className="rounded-full bg-[#F1EEF8] px-3 py-1 text-[13px] font-bold text-[#352F54]">
            Ver perfil
          </span>

          <div className="flex items-center gap-1.5">
            {temWhatsapp && (
              <span
                className="flex h-[28px] w-[28px] items-center justify-center rounded-full border border-border bg-white text-[#25A35A]"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-3.5 w-3.5" />
              </span>
            )}
            {temInstagram && (
              <span
                className="flex h-[28px] w-[28px] items-center justify-center rounded-full border border-border bg-white text-[#C13584]"
                aria-label="Instagram"
              >
                <Instagram className="h-3.5 w-3.5" />
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TerapeutaCard;
