// Oferta compacta do Kit do Detox. Escrita com createElement (sem JSX).
import { createElement as h } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const IMAGEM_KIT = "https://api.portalayurveda.com/storage/v1/object/public/portal_images/promokit.webp";

const OfertaKit = () => h("section", { className: "overflow-hidden rounded-[24px] bg-white shadow-[0_20px_50px_-32px_rgba(53,47,84,0.45)]" },
  h("div", { className: "grid items-center md:grid-cols-[0.9fr_1.1fr]" },
    h("div", { className: "bg-[#FBE3CC] p-5 md:p-7" },
      h("img", { src: IMAGEM_KIT, alt: "Kit do Detox da Primavera", loading: "lazy", decoding: "async", className: "mx-auto aspect-square w-full max-w-[360px] object-contain" })),
    h("div", { className: "flex flex-col items-start gap-3 p-6 md:p-8" },
      h("p", { className: "m-0 text-[15px] font-bold uppercase text-[#A85A1A]" }, "Para os seus 10 dias"),
      h("h2", { className: "m-0 font-serif text-[28px] font-bold leading-tight text-[#352F54] md:text-[34px]" }, "Kit do Detox da Primavera"),
      h("p", { className: "m-0 text-[17px] leading-relaxed text-[#514B62] md:text-[18px]" }, "Kitchari instantâneo, ghee artesanal, Panacéia, Massala Chai e Geleia do Detox, entregues na sua casa com frete grátis."),
      h("p", { className: "m-0 font-serif text-[21px] font-bold leading-snug text-[#352F54]" }, "R$ 250 em até 3x sem juros, ou R$ 237,50 no Pix"),
      h(Button, { asChild: true, className: "mt-1 min-h-[60px] rounded-full bg-[#E07B39] px-8 text-[17px] font-bold text-white hover:bg-[#D0662A]" },
        h(Link, { to: "/detox/kit" }, "Quero o kit")))));

export default OfertaKit;