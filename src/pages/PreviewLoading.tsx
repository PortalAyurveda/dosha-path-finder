import { useState } from "react";
import { Button } from "@/components/ui/button";
import InterstitialLoading from "@/components/dosha/InterstitialLoading";

const PreviewLoading = () => {
  const [started, setStarted] = useState(false);

  if (started) {
    return <InterstitialLoading redirectTo="/preview-loading" />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 gap-6 text-center">
      <h1 className="font-serif text-2xl md:text-3xl text-foreground">
        Preview da esteira de carregamento
      </h1>
      <p className="text-muted-foreground max-w-md">
        Clique em "Calcular" para ver a mesma sequência exibida entre o teste de dosha e a tela de resultado.
      </p>
      <Button size="lg" onClick={() => setStarted(true)}>
        Calcular
      </Button>
    </div>
  );
};

export default PreviewLoading;
