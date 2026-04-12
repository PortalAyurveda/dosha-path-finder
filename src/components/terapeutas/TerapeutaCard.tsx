import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
        themeClass,
      )}
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-therapist opacity-70" />

      <div className="p-5 pt-6 flex flex-col items-center text-center flex-1">
        <div className="relative mb-4">
          <div className="w-28 aspect-[4/5] shadow-therapist">
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

        <h3 className="text-lg font-bold text-foreground mb-1 font-serif">{displayName}</h3>

        {location && (
          <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
            <MapPin className="h-3.5 w-3.5" />
            {location}
          </p>
        )}

        {especialidades.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5 mb-3">
            {especialidades.slice(0, 3).map((esp) => (
              <Badge
                key={esp}
                variant="outline"
                className="border-therapist/30 bg-therapist-soft/80 px-2 py-0.5 text-[10px] text-therapist-ink"
              >
                {esp}
              </Badge>
            ))}
            {especialidades.length > 3 && (
              <Badge variant="outline" className="text-[10px] px-2 py-0.5 border-muted text-muted-foreground">
                +{especialidades.length - 3}
              </Badge>
            )}
          </div>
        )}

        {summary && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
            {summary}
          </p>
        )}

        <div className="mt-auto pt-2 w-full">
          <Link to={profilePath}>
            <Button
              variant="outline"
              className="w-full border-therapist/30 bg-therapist-soft/40 text-therapist-ink transition-colors hover:bg-therapist-soft hover:text-therapist-ink"
            >
              Ver Perfil Completo
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TerapeutaCard;
