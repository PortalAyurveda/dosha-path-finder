import { Navigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import PageContainer from "@/components/PageContainer";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import AkashaTab from "@/components/meudosha/AkashaTab";

const Akasha = () => {
  const [searchParams] = useSearchParams();
  const pergunta = searchParams.get("pergunta") || "";
  const { user, doshaResult, loading } = useUser();

  const idPublico = doshaResult?.idPublico ?? null;

  const { data: registroExtra, isLoading: loadingExtra } = useQuery({
    queryKey: ["akasha-pagina-registro-extra", idPublico],
    enabled: !!idPublico,
    staleTime: 30 * 60 * 1000,
    queryFn: async () => {
      const { data } = await supabase
        .from("doshas_registros")
        .select("idade, imc, agniPrincipal, conhecimentoAyurveda")
        .eq("idPublico", idPublico!)
        .maybeSingle();
      return data as {
        idade: number | null;
        imc: number | null;
        agniPrincipal: string | null;
        conhecimentoAyurveda: string | null;
      } | null;
    },
  });

  if (loading || loadingExtra) {
    return (
      <PageContainer title="Akasha" description="Converse com a Akasha, sua inteligência ayurvédica.">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-akasha" />
          <span className="ml-2 text-sm text-muted-foreground">Carregando...</span>
        </div>
      </PageContainer>
    );
  }

  // Sem sessão, ou sem nada que identifique a pessoa: manda fazer o teste.
  if (!user || (!user.email && !doshaResult?.idPublico)) {
    return <Navigate to="/teste-de-dosha" replace />;
  }

  return (
    <PageContainer title="Akasha" description="Converse com a Akasha, sua inteligência ayurvédica.">
      <AkashaTab
        idPublico={idPublico ?? ""}
        nome={doshaResult?.nome ?? null}
        doshaprincipal={doshaResult?.doshaprincipal ?? null}
        imc={registroExtra?.imc ?? null}
        idade={registroExtra?.idade ?? null}
        vatascore={doshaResult?.vatascore ?? null}
        pittascore={doshaResult?.pittascore ?? null}
        kaphascore={doshaResult?.kaphascore ?? null}
        agniPrincipal={registroExtra?.agniPrincipal ?? null}
        conhecimentoAyurveda={registroExtra?.conhecimentoAyurveda ?? null}
        email={user?.email ?? null}
        initialPergunta={pergunta || undefined}
      />
    </PageContainer>
  );
};

export default Akasha;
