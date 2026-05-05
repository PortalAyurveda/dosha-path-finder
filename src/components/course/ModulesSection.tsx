import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import type { CourseModulesData, CourseBranding } from "@/data/courses/courseTypes";

interface ModulesSectionProps {
  data: CourseModulesData;
  branding: CourseBranding;
}

const ModulesSection = ({ data, branding }: ModulesSectionProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-white py-10 md:py-14">
      <div className="max-w-2xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="font-serif italic font-bold text-2xl md:text-3xl mb-8 text-center"
          style={{ color: "#352F54" }}
        >
          {data.title}
        </motion.h2>

        <div className="space-y-2.5">
          {data.modules.map((mod, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={mod.number}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className="bg-white border border-gray-200 hover:border-gray-300 shadow-sm transition-all rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center gap-3 p-3 md:p-3.5 text-left"
                  aria-expanded={isOpen}
                >
                  <span
                    className="shrink-0 w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center font-bold text-sm md:text-base text-white"
                    style={{ background: branding.darkColor }}
                  >
                    {mod.number}
                  </span>
                  <h3
                    className="flex-1 font-sans font-bold text-sm md:text-base leading-tight"
                    style={{ color: "#352F54" }}
                  >
                    {mod.title}
                  </h3>
                  <ChevronDown
                    className="shrink-0 h-4 w-4 text-gray-500 transition-transform duration-300"
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
                      <div className="px-4 md:px-5 pb-5 pl-[64px] md:pl-[76px]">
                        <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-3">
                          {mod.description}
                        </p>
                        {mod.highlights && mod.highlights.length > 0 && (
                          <ul className="space-y-2 mt-3">
                            {mod.highlights.map((h, hi) => (
                              <li key={hi} className="flex items-start gap-3">
                                <span
                                  className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center mt-1"
                                  style={{ background: branding.darkColor }}
                                >
                                  <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                                </span>
                                <span className="text-sm text-gray-700">{h}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ModulesSection;
