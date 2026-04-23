import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Download, MapPin, Monitor } from "lucide-react";
import Bullet from "./Bullet";
import type { FormacaoData } from "@/data/courses/formacao";

interface Props {
  data: FormacaoData["programa"];
  branding: FormacaoData["branding"];
}

const ProgramaSection = ({ data, branding }: Props) => {
  const [openSemester, setOpenSemester] = useState<number | null>(0);

  return (
    <section className="py-12 md:py-16" style={{ background: "#FAF9F6" }}>
      <div className="max-w-4xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="font-serif italic font-bold text-2xl md:text-3xl mb-5 text-center"
          style={{ color: branding.darkColor }}
        >
          {data.title}
        </motion.h2>

        <p className="text-sm md:text-base text-gray-700 max-w-2xl mx-auto text-center mb-10 leading-relaxed">
          {data.intro}
        </p>

        <p
          className="font-bold text-base md:text-lg mb-5 text-center"
          style={{ color: branding.darkColor }}
        >
          {data.listIntro}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {data.benefits.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="flex items-start gap-3.5 p-4 bg-white border border-gray-200 shadow-sm rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm"
            >
              <span
                className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-xl"
                style={{ background: `${branding.primaryColor}25` }}
              >
                {b.icon}
              </span>
              <div>
                <h4
                  className="font-bold text-sm md:text-base mb-0.5"
                  style={{ color: branding.darkColor }}
                >
                  {b.title}
                </h4>
                <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                  {b.text}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <p
          className="font-serif italic text-base md:text-lg text-center mb-12 max-w-2xl mx-auto"
          style={{ color: branding.darkColor }}
        >
          {data.bridge}
        </p>

        {/* Semesters */}
        <div className="space-y-4 mb-12">
          {data.semesters.map((sem, si) => {
            const isOpen = openSemester === si;
            return (
              <div
                key={si}
                className="bg-white border border-gray-200 shadow-sm rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpenSemester(isOpen ? null : si)}
                  className="w-full flex items-center gap-4 p-5 text-left"
                  aria-expanded={isOpen}
                >
                  <Bullet src={branding.bulletSvg} size={32} />
                  <div className="flex-1">
                    <p
                      className="text-[11px] uppercase tracking-widest font-bold"
                      style={{ color: branding.primaryColor }}
                    >
                      {sem.title}
                    </p>
                    <h3
                      className="font-serif font-bold text-lg md:text-xl"
                      style={{ color: branding.darkColor }}
                    >
                      {sem.subtitle}
                    </h3>
                  </div>
                  <ChevronDown
                    className="shrink-0 h-5 w-5 text-gray-500 transition-transform duration-300"
                    style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 space-y-3">
                        {sem.modules.map((mod) => {
                          const isPresencial = mod.format === "Presencial SP";
                          return (
                            <div
                              key={mod.number}
                              className="flex gap-3 p-4 border border-gray-100 rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm"
                              style={{ background: "#FAF9F6" }}
                            >
                              <span
                                className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white"
                                style={{ background: branding.darkColor }}
                              >
                                {mod.number}
                              </span>
                              <div className="flex-1 min-w-0">
                                <h4
                                  className="font-serif font-bold text-sm md:text-base leading-snug mb-1"
                                  style={{ color: branding.darkColor }}
                                >
                                  {mod.title}
                                </h4>
                                <div className="flex flex-wrap gap-2 mb-2">
                                  <span
                                    className="inline-flex items-center gap-1 text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full"
                                    style={{
                                      background: isPresencial
                                        ? `${branding.accentColor}30`
                                        : `${branding.primaryColor}25`,
                                      color: branding.darkColor,
                                    }}
                                  >
                                    {isPresencial ? (
                                      <MapPin className="h-3 w-3" />
                                    ) : (
                                      <Monitor className="h-3 w-3" />
                                    )}
                                    {mod.format}
                                  </span>
                                  <span className="text-[10px] md:text-xs text-gray-600 font-medium px-2 py-0.5">
                                    {mod.date}
                                  </span>
                                </div>
                                <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                                  {mod.description}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Carga horária */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="p-6 md:p-7 mb-12 text-white rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm"
          style={{ background: branding.darkColor }}
        >
          <h3 className="font-serif italic font-bold text-xl md:text-2xl mb-5">
            {data.cargaTitle}
          </h3>
          <ul className="space-y-1.5 text-sm md:text-base">
            {data.cargaItems.map((item, i) => (
              <li key={i} className="leading-relaxed">
                {item.startsWith("→") ? (
                  <span className="pl-4 text-white/85 block">{item}</span>
                ) : (
                  <span className="font-bold">• {item}</span>
                )}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Extras */}
        <h3
          className="font-serif italic font-bold text-xl md:text-2xl mb-5 text-center"
          style={{ color: branding.darkColor }}
        >
          {data.extrasTitle}
        </h3>
        <ul className="space-y-3 mb-10 max-w-2xl mx-auto">
          {data.extras.map((e, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="flex items-start gap-3 p-3.5 bg-white border border-gray-200 rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm"
            >
              <span className="text-xl shrink-0">{e.emoji}</span>
              <span className="text-sm md:text-base text-gray-800 leading-relaxed">
                {e.text}
              </span>
            </motion.li>
          ))}
        </ul>

        <p className="text-sm md:text-base text-gray-700 leading-relaxed text-center max-w-2xl mx-auto mb-8">
          {data.closing}
        </p>

        <div className="text-center">
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-2 font-bold text-xs md:text-sm uppercase tracking-wide px-7 py-3.5 border-2 rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm cursor-not-allowed opacity-70"
            style={{ borderColor: branding.darkColor, color: branding.darkColor }}
            title="Em breve"
          >
            <Download className="h-4 w-4" />
            Baixar Programa Completo (PDF) — Em breve
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProgramaSection;
