import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Html } from "@/components/atividades/base";

// O gráfico "Seus próximos meses" vem pronto do banco (RPC meu_dosha_grafico_html):
// título, textos, cores e desenho. O componente só mostra dentro do cartão.
// Se o banco devolver vazio, o cartão não aparece.

const GraficoMeses = ({ idPublico }: { idPublico: string }) => {
  const { data } = useQuery({
    queryKey: ["meu-dosha-grafico-html", idPublico],
    enabled: !!idPublico,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("meu_dosha_grafico_html" as any, { p_idpublico: idPublico });
      if (error) return null;
      return typeof data === "string" ? data : null;
    },
  });

  const html = data && data.trim() ? data : null;
  if (!html) return null;

  return (
    <section id="grafico" className="bg-card rounded-xl border border-border p-4 space-y-3 scroll-mt-24">
      <Html html={html} />
    </section>
  );
};

export default GraficoMeses;
