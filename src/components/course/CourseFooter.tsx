import { Phone, Mail, Instagram } from "lucide-react";
import type { CourseFooterData, CourseBranding } from "@/data/courses/courseTypes";

interface CourseFooterProps {
  data: CourseFooterData;
  branding: CourseBranding;
}

const CourseFooter = ({ data, branding }: CourseFooterProps) => {
  return (
    <section className="bg-white py-12 md:py-14 border-t border-gray-200">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <p
          className="font-serif italic text-lg md:text-xl mb-8 leading-snug"
          style={{ color: branding.darkColor }}
        >
          "{data.tagline}"
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-8 text-sm text-gray-600">
          <a
            href={`tel:${data.phone.replace(/\D/g, "")}`}
            className="flex items-center gap-2 hover:text-gray-900 transition-colors"
          >
            <Phone className="h-4 w-4" />
            {data.phone}
          </a>
          <a
            href={`mailto:${data.email}`}
            className="flex items-center gap-2 hover:text-gray-900 transition-colors"
          >
            <Mail className="h-4 w-4" />
            {data.email}
          </a>
          <a
            href={`https://instagram.com/${data.instagram.replace("@", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-gray-900 transition-colors"
          >
            <Instagram className="h-4 w-4" />
            {data.instagram}
          </a>
        </div>
      </div>
    </section>
  );
};

export default CourseFooter;
