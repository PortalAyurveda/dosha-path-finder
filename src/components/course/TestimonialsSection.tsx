import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import type { CourseTestimonial, CourseBranding } from "@/data/courses/courseTypes";

interface TestimonialsSectionProps {
  testimonials: CourseTestimonial[];
  branding: CourseBranding;
}

const TestimonialsSection = ({ testimonials, branding }: TestimonialsSectionProps) => {
  return (
    <section className="py-12 md:py-20" style={{ background: branding.warmBg }}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="font-serif italic font-bold text-3xl md:text-5xl text-foreground mb-12 text-center"
        >
          O que nossos alunos dizem
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {testimonials.map((t, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: (i % 2) * 0.1 }}
              className="relative bg-white p-6 md:p-8 shadow-md hover:shadow-xl transition-shadow rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm"
            >
              <Quote
                className="absolute top-4 right-4 h-12 w-12 md:h-16 md:w-16 opacity-15"
                style={{ color: branding.darkColor }}
                fill="currentColor"
              />
              <p
                className="font-bold text-sm md:text-base uppercase tracking-wide mb-3 relative z-10"
                style={{ color: branding.darkColor }}
              >
                "{t.highlight}"
              </p>
              <p className="text-base md:text-lg text-foreground/80 leading-relaxed mb-5 relative z-10">
                {t.quote}
              </p>
              <p className="font-bold text-foreground text-sm md:text-base">— {t.name}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
