import { Phone, Mail, Instagram } from "lucide-react";
import type { CourseFooterData, CourseBranding } from "@/data/courses/courseTypes";

interface CourseFooterProps {
  data: CourseFooterData;
  branding: CourseBranding;
}

const CourseFooter = ({ data, branding }: CourseFooterProps) => {
  return (
    <footer className="bg-[#0F1419] text-white py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <p
          className="font-serif italic text-xl md:text-2xl mb-8 leading-snug"
          style={{ color: branding.primaryColor }}
        >
          "{data.tagline}"
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-sm md:text-base text-white/80">
          <a
            href={`tel:${data.phone.replace(/\D/g, "")}`}
            className="flex items-center gap-2 hover:text-white transition-colors"
          >
            <Phone className="h-4 w-4" />
            {data.phone}
          </a>
          <a
            href={`mailto:${data.email}`}
            className="flex items-center gap-2 hover:text-white transition-colors"
          >
            <Mail className="h-4 w-4" />
            {data.email}
          </a>
          <a
            href={`https://instagram.com/${data.instagram.replace("@", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-white transition-colors"
          >
            <Instagram className="h-4 w-4" />
            {data.instagram}
          </a>
        </div>

        <p className="mt-10 text-xs text-white/40">
          © {new Date().getFullYear()} Portal Ayurveda · Todos os direitos reservados
        </p>
      </div>
    </footer>
  );
};

export default CourseFooter;
