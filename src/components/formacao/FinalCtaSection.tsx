import { motion } from "framer-motion";
import type { FormacaoData } from "@/data/courses/formacao";

interface Props {
  data: FormacaoData["finalCta"];
  branding: FormacaoData["branding"];
  onPrimary: () => void;
  onSecondary: () => void;
}

const FinalCtaSection = ({ data, branding, onPrimary, onSecondary }: Props) => (
  <section className="py-14 md:py-20" style={{ background: branding.darkColor }}>
    <div className="max-w-3xl mx-auto px-6 text-center text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
        className="flex justify-center mb-6"
      >
        <img
          src={branding.bulletSvg}
          alt=""
          aria-hidden
          className="h-14 w-auto opacity-90"
        />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="font-serif italic font-bold text-3xl md:text-4xl mb-6 leading-tight"
      >
        {data.title}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-sm md:text-base text-white/90 max-w-2xl mx-auto mb-9 leading-relaxed whitespace-pre-line"
      >
        {data.body}
      </motion.p>

      <div className="flex flex-col items-center gap-4">
        <button
          onClick={onPrimary}
          className="inline-flex items-center justify-center gap-2.5 font-bold text-sm md:text-base uppercase tracking-wide px-10 md:px-14 py-4 md:py-5 shadow-lg hover:shadow-xl transition-all hover:scale-[1.03] rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm w-full md:w-auto"
          style={{ background: "white", color: branding.darkColor }}
        >
          {data.primaryCta}
        </button>
        <p className="text-xs md:text-sm text-white/80">{data.primarySub}</p>

        <button
          onClick={onSecondary}
          className="mt-2 inline-flex items-center justify-center gap-2 font-bold text-xs md:text-sm uppercase tracking-wide px-7 py-3 border-2 border-white/40 hover:border-white/70 transition-all rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm w-full md:w-auto text-white/95"
        >
          {data.secondaryCta}
        </button>
      </div>
    </div>
  </section>
);

export default FinalCtaSection;
