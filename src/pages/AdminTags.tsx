import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminNav from "@/components/admin/AdminNav";
import Seo from "@/components/Seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

// ---------- Grupos (ordem visual) ----------
// Cada grupo lista as tags pelo emoji "chave" — o nome canônico vem da
// akasha_tags_inventory; filtramos pelo emoji presente no tag_name.
const GROUPS: { name: string; keys: string[] }[] = [
  { name: "Doshas", keys: ["🌬️", "🔥", "🪵"] },
  { name: "Fisiologia", keys: ["🧬", "🪔", "☣️", "🚽"] },
  { name: "Mente & Consciência", keys: ["🧠", "✨", "🍯", "🕊️", "🐅", "🪨", "🛏️"] },
  { name: "Prática & Terapia", keys: ["🥘", "⚗️", "🕰️", "💊", "💆", "🏗️", "📜"] },
  { name: "Clínico", keys: ["🎯", "📉", "📈", "🔍", "🧪"] },
  { name: "Público & Estações", keys: ["👩", "🍼", "🦯", "🤸", "🎈", "🍂", "❄️", "🌸", "☀️"] },
];

// Palavras-chave para fazer o match fuzzy (sem emoji, lowercase, sem acento).
// Para cada tag canônica, derivamos uma keyword a partir do nome (sem emoji).
const stripDiacritics = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const normalize = (s: string) =>
  stripDiacritics(String(s ?? "")).toLowerCase().replace(/[#_\-]/g, " ").replace(/\s+/g, " ").trim();

// Para uma tag canônica como "🌬️Vata" ou "🪔Metabolismo e digestão",
// devolve a primeira palavra textual (sem emoji), em lowercase normalizada.
const canonicalKeyword = (tagName: string): string => {
  const withoutEmoji = tagName.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\uFE0F]/gu, "").trim();
  const firstWord = withoutEmoji.split(/[\s&]+/)[0] ?? withoutEmoji;
  return normalize(firstWord);
};

// Tabs de seção
type SectionKey = "tudo" | "artigos" | "videos" | "vata" | "pitta" | "kapha" | "rotinas";
const SECTIONS: { key: SectionKey; label: string }[] = [
  { key: "tudo", label: "Tudo" },
  { key: "artigos", label: "Artigos" },
  { key: "videos", label: "Vídeos" },
  { key: "vata", label: "Vata" },
  { key: "pitta", label: "Pitta" },
  { key: "kapha", label: "Kapha" },
  { key: "rotinas", label: "Rotinas" },
];

type RawTagsBySection = Record<SectionKey, string[][]>;

// Conta tags brutas por linha contra a lista canônica.
// Para cada linha (array de tags brutas), uma tag canônica conta no máximo 1 vez por linha.
const countCanonical = (rows: string[][], canonicalTags: string[]): Record<string, number> => {
  const counts: Record<string, number> = Object.fromEntries(canonicalTags.map((t) => [t, 0]));
  // Pré-computa keyword de cada tag canônica
  const canon = canonicalTags.map((t) => ({ tag: t, kw: canonicalKeyword(t) }));

  for (const row of rows) {
    if (!row || row.length === 0) continue;
    const normRow = row.map((r) => normalize(r));
    const hits = new Set<string>();
    for (const { tag, kw } of canon) {
      if (!kw) continue;
      // match se a keyword aparece como palavra em qualquer tag bruta
      const re = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}\\b`);
      for (const nr of normRow) {
        if (re.test(nr)) {
          hits.add(tag);
          break;
        }
      }
    }
    hits.forEach((t) => (counts[t] += 1));
  }
  return counts;
};

const splitCsv = (s: unknown): string[] => {
  if (Array.isArray(s)) return s.map(String).map((x) => x.trim()).filter(Boolean);
  if (typeof s === "string") return s.split(",").map((x) => x.trim()).filter(Boolean);
  return [];
};

const AdminTags = () => {
  const [loading, setLoading] = useState(true);
  const [canonical, setCanonical] = useState<string[]>([]);
  const [raw, setRaw] = useState<RawTagsBySection>({
    tudo: [],
    artigos: [],
    videos: [],
    vata: [],
    pitta: [],
    kapha: [],
    rotinas: [],
  });
  const [section, setSection] = useState<SectionKey>("tudo");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [
        tagsRes,
        conteudoRes,
        videosSeoRes,
        videosSeo3Res,
        vataRes,
        pittaRes,
        kaphaRes,
        rotinasRes,
      ] = await Promise.all([
        supabase.from("akasha_tags_inventory").select("tag_name"),
        supabase.from("portal_conteudo").select("tags"),
        supabase.from("videos_seo" as any).select("tags"),
        supabase.from("videos_seo3" as any).select("tags"),
        supabase.from("portal_vata").select("tags"),
        supabase.from("portal_pitta" as any).select("tags"),
        supabase.from("portal_kapha").select("tags"),
        supabase.from("rotina_nuggets" as any).select("tags"),
      ]);
      if (cancelled) return;

      const canonicalTags = (tagsRes.data ?? [])
        .map((r: any) => r.tag_name as string)
        .filter(Boolean);

      const artigos = (conteudoRes.data ?? []).map((r: any) => splitCsv(r.tags));
      const videosSeo = (videosSeoRes.data ?? []).map((r: any) => splitCsv(r.tags));
      const videosSeo3 = (videosSeo3Res.data ?? []).map((r: any) => splitCsv(r.tags));
      const videos = [...videosSeo, ...videosSeo3];
      const vata = (vataRes.data ?? []).map((r: any) => splitCsv(r.tags));
      const pitta = (pittaRes.data ?? []).map((r: any) => splitCsv(r.tags));
      const kapha = (kaphaRes.data ?? []).map((r: any) => splitCsv(r.tags));
      const rotinas = (rotinasRes.data ?? []).map((r: any) => splitCsv(r.tags));
      const tudo = [...artigos, ...videos, ...vata, ...pitta, ...kapha, ...rotinas];

      setCanonical(canonicalTags);
      setRaw({ tudo, artigos, videos, vata, pitta, kapha, rotinas });
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // counts da seção ativa
  const counts = useMemo(
    () => countCanonical(raw[section] ?? [], canonical),
    [raw, section, canonical],
  );

  // Indexa tags canônicas por emoji-key (primeiro emoji do nome)
  const tagsByEmoji = useMemo(() => {
    const m: Record<string, string> = {};
    for (const t of canonical) {
      const emoji = (t.match(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}\uFE0F]+/u) ?? [""])[0];
      const key = emoji.replace(/\uFE0F/g, "");
      if (key && !m[key]) m[key] = t;
    }
    return m;
  }, [canonical]);

  return (
    <div className="min-h-screen bg-background">
      <Seo title="Tags do portal — Admin" description="Dashboard de tags do conteúdo" />
      <AdminNav />
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-heading font-bold text-foreground">Tags do portal</h1>
          <Tabs value={section} onValueChange={(v) => setSection(v as SectionKey)}>
            <TabsList className="flex-wrap h-auto">
              {SECTIONS.map((s) => (
                <TabsTrigger key={s.key} value={s.key}>
                  {s.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-72 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {GROUPS.map((group) => {
              const items = group.keys
                .map((k) => tagsByEmoji[k.replace(/\uFE0F/g, "")])
                .filter(Boolean) as string[];
              const max = Math.max(1, ...items.map((t) => counts[t] ?? 0));
              return (
                <Card key={group.name} className="h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-heading text-foreground">
                      {group.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {items.length === 0 && (
                      <p className="text-xs text-muted-foreground">Sem tags.</p>
                    )}
                    {items.map((tag) => {
                      const n = counts[tag] ?? 0;
                      const pct = Math.round((n / max) * 100);
                      return (
                        <div key={tag} className="space-y-1">
                          <div className="flex items-baseline justify-between gap-2 text-[13px]">
                            <span className="truncate text-foreground">{tag}</span>
                            <span className="tabular-nums text-muted-foreground shrink-0">
                              {n}
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary transition-[width] duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTags;
