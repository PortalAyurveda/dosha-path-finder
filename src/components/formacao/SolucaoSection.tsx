import { motion } from "framer-motion";
import { BookMarked, Beaker, Users, Bot, User, Map, type LucideIcon } from "lucide-react";
import type { FormacaoData } from "@/data/courses/formacao";

interface Props {
  data: FormacaoData["solucao"];
  branding: FormacaoData["branding"];
}

const ICONS: LucideIcon[] = [BookMarked, Beaker, Users, Bot, User, Map];

const SolucaoSection = ({ data, branding }: Props) => (
  <section className="py-12 md:py-16" style={{ background: "#F5F0E6" }}>
    <div className="max-w-4xl mx-auto px-6">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="font-serif italic font-bold text-2xl md:text-3xl mb-4 text-center"
        style={{ color: branding.darkColor }}
      >
        {data.title}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-sm md:text-base text-gray-700 max-w-2xl mx-auto text-center mb-8 leading-relaxed"
      >
        {data.subtitle}
      </motion.p>

      <p
        className="font-bold text-base md:text-lg mb-6 text-center"
        style={{ color: branding.darkColor }}
      >
        {data.listIntro}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {data.items.map((item, i) => {
          const Icon = ICONS[i] ?? BookMarked;
          return (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: (i % 2) * 0.05 }}
              className="flex items-start gap-3.5 p-5 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm"
            >
              <span
                className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center"
                style={{ background: `${branding.accentColor}30`, color: branding.darkColor }}
              >
                <Icon className="h-5 w-5" strokeWidth={2.2} />
              </span>
              <span className="text-sm md:text-base text-gray-800 leading-relaxed pt-1.5">
                {item}
              </span>
            </motion.article>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="border-t border-gray-200 pt-6 text-sm md:text-base text-gray-700 leading-relaxed whitespace-pre-line italic max-w-3xl mx-auto"
      >
        {data.closing}
      </motion.div>
    </div>
  </section>
);

export default SolucaoSection;
