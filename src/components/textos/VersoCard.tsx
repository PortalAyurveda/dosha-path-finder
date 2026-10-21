import { fonteDevanagari } from "@/lib/classicos";

export type Verso = {
  livro: string | null;
  location_label: string | null;
  verse_no: string | null;
  verse_sanskrit: string | null;
  translation_pt: string | null;
};

export default function VersoCard({ verso }: { verso: Verso }) {
  return (
    <article className="rounded-2xl border border-classics/20 bg-card p-5 md:p-6">
      <div className="flex flex-wrap items-center gap-2">
        {verso.livro && (
          <span className="rounded-full border border-classics/40 bg-classics-soft px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-classics">
            {verso.livro}
          </span>
        )}
        {verso.location_label && (
          <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {verso.location_label}
          </span>
        )}
        {verso.verse_no && (
          <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-semibold text-muted-foreground">
            v. {verso.verse_no}
          </span>
        )}
      </div>

      {verso.verse_sanskrit && (
        <p lang="sa" className="mt-4 text-lg md:text-xl leading-relaxed text-primary" style={fonteDevanagari}>
          {verso.verse_sanskrit}
        </p>
      )}

      {verso.translation_pt && (
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">{verso.translation_pt}</p>
      )}
    </article>
  );
}
