import { motion } from "framer-motion";
import { Sparkles, Target, Sprout, BookOpen, GraduationCap, HeartHandshake, type LucideIcon } from "lucide-react";
import type { FormacaoData } from "@/data/courses/formacao";

interface Props {
  data: FormacaoData["paraQuem"];
  branding: FormacaoData["branding"];
}

const ICONS: LucideIcon[] = [Sparkles, Target, Sprout, BookOpen, GraduationCap, HeartHandshake];

const ParaQuemSection = ({ data, branding }: Props) => (
  <section className="bg-white py-12 md:py-16">
    <div className="max-w-4xl mx-auto px-6">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="font-serif italic font-bold text-2xl md:text-3xl mb-10 text-center"
        style={{ color: branding.darkColor }}
      >
        {data.title}
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.items.map((item, i) => {
          const Icon = ICONS[i] ?? Sparkles;
          return (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: (i % 2) * 0.06 }}
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
    </div>
  </section>
);

export default ParaQuemSection;
