import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";
import { HeaderCtaProvider } from "@/contexts/HeaderCtaContext";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <HeaderCtaProvider>
      <div className="flex min-h-screen flex-col">
        <ScrollToTop />
        <Header />
        <div className="flex-1 min-h-screen">{children}</div>
        <Footer />
      </div>
    </HeaderCtaProvider>
  );
};

export default Layout;
