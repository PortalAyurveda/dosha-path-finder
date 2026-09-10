import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import NuggetDetalhe, { type Nugget } from "@/components/rotina/NuggetDetalhe";

interface NuggetIscaDialogProps {
  nugget: Nugget;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Card completo de uma receita/prática aberto por link (?item=...).
 * Não exige assinatura nem que o item esteja na semana atual.
 */
const NuggetIscaDialog = ({ nugget, open, onOpenChange }: NuggetIscaDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          receita da sua rotina
        </div>
        <DialogTitle className="font-serif text-2xl leading-tight">
          {nugget.titulo}
        </DialogTitle>
      </DialogHeader>
      <NuggetDetalhe nugget={nugget} />
    </DialogContent>
  </Dialog>
);

export default NuggetIscaDialog;
