import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const SamkhyaBanner = () => {
  return (
    <section className="bg-surface-sun">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div className="max-w-xl">
          <h3 className="mb-3">
            Leve o Ayurveda para a sua rotina
          </h3>
          <p className="text-muted-foreground">
            Conheça as fórmulas e produtos exclusivos da Samkhya — desenvolvidos com base nos textos clássicos do Ayurveda.
          </p>
        </div>
        <Button
          variant="outline"
          className="rounded-2xl px-8 py-6 text-base font-bold border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all"
          asChild
        >
          <a href="https://lojasamkhya.com.br" target="_blank" rel="noopener noreferrer">
            Acessar Loja Samkhya
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>
    </section>
  );
};

export default SamkhyaBanner;
