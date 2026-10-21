import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import BannerSlot from "@/components/banners/BannerSlot";
import AbaMelhoresVersos from "@/components/textos/AbaMelhoresVersos";

export default function ClassicosMelhores() {
  return (
    <>
      <Seo title="Melhores versos dos textos clássicos" description="Os versos escolhidos e pontuados do acervo clássico do Portal Ayurveda." />
      <div className="bg-classics-soft">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <Link to="/textos-classicos" className="text-base text-classics hover:underline">Textos Clássicos</Link>
          <h1 className="mt-2">Melhores versos</h1>
        </div>
      </div>
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <AbaMelhoresVersos />
        <BannerSlot slot="classicos_rodape" className="my-8 [&:empty]:hidden" />
      </main>
    </>
  );
}
