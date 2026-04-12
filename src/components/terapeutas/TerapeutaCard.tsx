import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
  const especialidades = especialidade
    ? especialidade.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const profilePath = slug ? `/terapeutas/${slug}` : `/terapeutas-do-brasil`;

  return (
    <div className="group relative rounded-2xl border border-border bg-card shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
      {/* Ogival arch decoration at top */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-600/60 via-emerald-500/80 to-emerald-600/60 rounded-t-2xl" />

      <div className="p-5 pt-6 flex flex-col items-center text-center flex-1">
        {/* Profile image */}
        <div className="relative mb-4">
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-emerald-100 shadow-md bg-muted">
            {imagem ? (
              <img
                src={imagem}
                alt={`Foto de ${nome}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-muted-foreground bg-emerald-50">
                {nome?.[0] || "?"}
              </div>
            )}
          </div>
        </div>

        {/* Name */}
        <h3 className="text-lg font-bold text-foreground mb-1 font-serif">{nome}</h3>

        {/* Location */}
        {(cidade || estado) && (
          <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
            <MapPin className="h-3.5 w-3.5" />
            {[cidade, estado].filter(Boolean).join(" — ")}
          </p>
        )}

        {/* Specialties badges */}
        {especialidades.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5 mb-3">
            {especialidades.slice(0, 3).map((esp) => (
              <Badge
                key={esp}
                variant="outline"
                className="text-[10px] px-2 py-0.5 border-emerald-300 text-emerald-700 bg-emerald-50/60"
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

        {/* Summary */}
        {resumo && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
            {resumo}
          </p>
        )}

        <div className="mt-auto pt-2 w-full">
          <Link to={profilePath}>
            <Button
              variant="outline"
              className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
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
