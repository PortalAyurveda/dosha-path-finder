interface Props {
  titulo: string;
}

export default function ColEmBreve({ titulo }: Props) {
  return (
    <div className="flex flex-col h-full border border-border rounded-lg bg-card overflow-hidden">
      <div className="px-3 py-2 border-b border-border bg-muted/40">
        <h3 className="text-sm font-semibold">{titulo}</h3>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-muted-foreground/70">Em breve</p>
      </div>
    </div>
  );
}
