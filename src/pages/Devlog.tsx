import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import PageContainer from "@/components/PageContainer";
import SectionTitle from "@/components/SectionTitle";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface DevlogItem {
  id: string;
  versao: string;
  titulo: string;
  descricao: string | null;
  destaque: boolean | null;
  criado_em: string | null;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const cleanVersao = (v: string) => v.replace(/^v\s*/i, "").trim();

const Devlog = () => {
  const [items, setItems] = useState<DevlogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("devlog")
        .select("id, versao, titulo, descricao, destaque, criado_em")
        .order("criado_em", { ascending: false });
      if (!error && data) setItems(data as DevlogItem[]);
      setLoading(false);
    })();
  }, []);

  // Group by normalized versao preserving order
  const groups: { versao: string; date: string | null; items: DevlogItem[] }[] = [];
  const idx = new Map<string, number>();
  for (const it of items) {
    const key = cleanVersao(it.versao);
    if (!idx.has(key)) {
      idx.set(key, groups.length);
      groups.push({ versao: key, date: it.criado_em, items: [] });
    }
    groups[idx.get(key)!].items.push(it);
  }
  // Destaque first inside each group
  groups.forEach((g) => g.items.sort((a, b) => Number(!!b.destaque) - Number(!!a.destaque)));

  return (
    <PageContainer
      title="Devlog"
      description="O que foi construído no Portal Ayurveda, versão a versão."
    >
      <SectionTitle subtitle="O que foi construído, versão a versão." as="h1">
        Devlog
      </SectionTitle>

      {loading ? (
        <p className="text-center text-muted-foreground">Carregando…</p>
      ) : groups.length === 0 ? (
        <p className="text-center text-muted-foreground">Nenhum registro ainda.</p>
      ) : (
        <div className="space-y-12 max-w-3xl mx-auto">
          {groups.map((g) => (
            <section key={g.versao}>
              <header className="mb-4 border-b border-border pb-3">
                <h2 className="text-2xl font-semibold text-foreground">Update v{g.versao}</h2>
                {g.date && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatDate(g.date)}
                  </p>
                )}
              </header>

              <ul className="space-y-4">
                {g.items.map((it) => (
                  <li
                    key={it.id}
                    className={`rounded-lg p-4 ${
                      it.destaque
                        ? "border-2 border-primary/40 bg-primary/5"
                        : "border border-border bg-card"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium text-foreground">{it.titulo}</h3>
                          {it.destaque && (
                            <Badge className="gap-1">
                              <Star className="h-3 w-3" /> destaque
                            </Badge>
                          )}
                        </div>
                        {it.descricao && (
                          <p className="text-sm text-muted-foreground mt-1.5 whitespace-pre-line">
                            {it.descricao}
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </PageContainer>
  );
};

export default Devlog;
