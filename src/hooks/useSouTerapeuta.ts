import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { terapia } from "@/lib/terapia";
export function useSouTerapeuta() {
  const { user, loading } = useUser();
  const query = useQuery({
    queryKey: ["sou-terapeuta", user?.id],
    queryFn: terapia.sou,
    enabled: !!user && !loading,
  });
  return {
    ...query,
    userId: user?.id,
    permitido: !!user && query.data === true,
    carregando: loading || (!!user && query.isPending),
  };
}
