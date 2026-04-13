import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  cleanTherapistText,
  getTherapistDisplayName,
  getTherapistLocation,
  getTherapistProfilePath,
  getTherapistThemeClass,
  splitTherapistSpecialties,
} from "@/lib/terapeutas";
import { cn } from "@/lib/utils";

interface TerapeutaCardProps {
  nome: string;
  cidade: string | null;
  estado: string | null;
  especialidade: string | null;
  resumo: string | null;
  imagem: string | null;
  slug: string | null;
}

const TerapeutaCard = ({ nome, cidade, estado, especialidade, resumo, imagem, slug }: TerapeutaCardProps) => {
  const displayName = getTherapistDisplayName(nome);
  const especialidades = splitTherapistSpecialties(especialidade);
  const location = getTherapistLocation(cidade, estado);
  const summary = cleanTherapistText(resumo);
  const profilePath = getTherapistProfilePath(slug ?? nome);
  const themeClass = getTherapistThemeClass(slug ?? nome);

  return (
    <Link
      to={profilePath}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-therapist-soft/20 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer",
        themeClass,
      )}
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-therapist opacity-70" />

      <div className="p-4 pt-5 flex flex-col items-center text-center flex-1">
        <div className="relative mb-3">
          <div className="w-24 aspect-[3/4] shadow-therapist">
            <div className="therapist-portal-arch h-full w-full bg-therapist/30 p-[3px]">
              <div className="therapist-portal-arch h-full w-full overflow-hidden bg-muted">
                {imagem ? (
                  <img
                    src={imagem}
                    alt={`Foto de ${displayName}`}
                    className="h-full w-full object-cover object-center"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-therapist-soft text-3xl font-bold text-therapist-ink">
                    {displayName[0] || "?"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <h3 className="text-base font-bold text-foreground mb-0.5 font-serif leading-tight">{displayName}</h3>

        {location && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
            <MapPin className="h-3 w-3 shrink-0" />
            {location}
          </p>
        )}

        {especialidades.length > 0 && (
          <div className="flex items-center gap-1 mb-2 w-full overflow-hidden">
            <div className="flex gap-1 overflow-x-auto scrollbar-hide whitespace-nowrap max-w-full">
              {especialidades.slice(0, 3).map((esp) => (
                <Badge
                  key={esp}
                  variant="outline"
                  className="border-therapist/30 bg-therapist-soft/80 px-2 py-0 text-[10px] text-therapist-ink shrink-0"
                >
                  {esp}
                </Badge>
              ))}
            </div>
            {especialidades.length > 3 && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-muted text-muted-foreground shrink-0">
                +{especialidades.length - 3}
              </Badge>
            )}
          </div>
        )}

        {summary && (
          <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-2">
            {summary}
          </p>
        )}

      </div>
    </Link>
  );
};

export default TerapeutaCard;
