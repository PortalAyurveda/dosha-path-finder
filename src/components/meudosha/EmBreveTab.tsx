import { Lock } from "lucide-react";

const EmBreveTab = ({ label }: { label: string }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
      <Lock className="w-10 h-10 text-muted-foreground/30" />
      <p className="font-serif font-bold text-foreground text-lg">{label}</p>
      <p className="text-sm text-muted-foreground max-w-sm">
        Esta seção está em construção. Em breve você terá acesso a conteúdo personalizado aqui.
      </p>
    </div>
  );
};

export default EmBreveTab;
