import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Download, MapPin, Monitor, Check } from "lucide-react";
import type { FormacaoData } from "@/data/courses/formacao";

interface Props {
  data: FormacaoData["programa"];
  branding: FormacaoData["branding"];
}

const ProgramaSection = ({ data, branding }: Props) => {
  const [openModule, setOpenModule] = useState<number | null>(1);

  // Flatten all modules across semesters, preserving order
  const allModules = data.semesters.flatMap((sem) =>
    sem.modules.map((mod) => ({ ...mod, semester: sem.subtitle })),
  );

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
          className="font-serif italic text-base md:text-lg text-center mb-10 max-w-2xl mx-auto"
          style={{ color: branding.darkColor }}
        >
          {data.bridge}
        </p>

        {/* Modules as accordions */}
        <div className="space-y-3 mb-12">
          {allModules.map((mod, mi) => {
            const isOpen = openModule === mod.number;
            const isPresencial = mod.format === "Presencial SP";
            const altBg = mi % 2 === 0 ? "#FFFFFF" : "#FBF7F0";
            return (
              <motion.div
                key={mod.number}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35, delay: Math.min(mi * 0.03, 0.2) }}
                className="border border-gray-200 hover:border-gray-300 shadow-sm transition-all rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm overflow-hidden"
                style={{ background: altBg }}
              >
                <button
                  onClick={() => setOpenModule(isOpen ? null : mod.number)}
                  className="w-full flex items-start gap-4 p-4 md:p-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span
                    className="shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center font-serif font-bold text-sm md:text-base text-white"
                    style={{ background: branding.darkColor }}
                  >
                    {String(mod.number).padStart(2, "0")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <h3
                        className="font-serif font-bold text-base md:text-lg leading-tight"
                        style={{ color: branding.darkColor }}
                      >
                        {mod.title}
                      </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-[11px] md:text-xs text-gray-600 font-medium">
                        {mod.date}
                      </span>
                      <span
                        className="inline-flex items-center gap-1 text-[10px] md:text-xs font-bold px-2.5 py-0.5 rounded-full"
                        style={{
                          background: isPresencial
                            ? `${branding.accentColor}40`
                            : "#9ED88B40",
                          color: isPresencial ? "#7C2D12" : "#14532D",
                        }}
                      >
                        {isPresencial ? (
                          <MapPin className="h-3 w-3" />
                        ) : (
                          <Monitor className="h-3 w-3" />
                        )}
                        {mod.format}
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                      {mod.description}
                    </p>
                    <p
                      className="mt-2 inline-flex items-center gap-1 text-[11px] md:text-xs font-bold uppercase tracking-wide"
                      style={{ color: branding.primaryColor }}
                    >
                      {isOpen ? "Recolher" : "Ver conteúdo detalhado"}
                      <ChevronDown
                        className="h-3.5 w-3.5 transition-transform duration-200"
                        style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                      />
                    </p>
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 md:px-5 pb-5 pl-[68px] md:pl-[76px]">
                        <ul className="space-y-2.5 mt-1">
                          {mod.details.map((d, di) => (
                            <li key={di} className="flex items-start gap-3">
                              <span
                                className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center mt-1"
                                style={{ background: branding.darkColor }}
                              >
                                <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                              </span>
                              <span className="text-sm md:text-[15px] text-gray-800 leading-relaxed">
                                {d}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* PDF CTA highlighted card */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
          className="mb-12 p-6 md:p-8 text-center rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm border-2"
          style={{
            background: branding.lightColor,
            borderColor: branding.accentColor,
          }}
        >
          <h3
            className="font-serif italic font-bold text-xl md:text-2xl mb-3"
            style={{ color: branding.darkColor }}
          >
            Quer o programa completo detalhado?
          </h3>
          <p className="text-sm md:text-base text-gray-700 max-w-xl mx-auto mb-6 leading-relaxed">
            Receba o PDF com a descrição extensa de cada módulo, ementas, bibliografia e
            cronograma de atividades.
          </p>
          <button
            type="button"
            disabled
            className="inline-flex items-center justify-center gap-2 font-bold text-xs md:text-sm uppercase tracking-wide px-7 py-3.5 rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm cursor-not-allowed opacity-80 text-white"
            style={{ background: branding.accentColor }}
            title="Em breve"
          >
            <Download className="h-4 w-4" />
            Baixar PDF do Programa — Em breve
          </button>
          <div className="flex justify-center mt-6">
            <img
              src={branding.bulletSvg}
              alt="Portal Ayurveda"
              className="h-12 md:h-14 w-auto opacity-90"
            />
          </div>
        </motion.div>

        {/* Carga horária */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="p-6 md:p-7 mb-12 rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm border-l-4"
          style={{
            background: branding.lightColor,
            borderColor: branding.darkColor,
            color: branding.darkColor,
          }}
        >
          <h3
            className="font-serif italic font-bold text-xl md:text-2xl mb-5"
            style={{ color: branding.darkColor }}
          >
            {data.cargaTitle}
          </h3>
          <ul className="space-y-1.5 text-sm md:text-base">
            {data.cargaItems.map((item, i) => (
              <li key={i} className="leading-relaxed" style={{ color: branding.darkColor }}>
                {item.startsWith("→") ? (
                  <span className="pl-4 block" style={{ opacity: 0.85 }}>
                    {item}
                  </span>
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
      </div>
    </section>
  );
};

export default ProgramaSection;
