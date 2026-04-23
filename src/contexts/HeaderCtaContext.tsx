import { createContext, useContext, useState, ReactNode, useCallback } from "react";

export type HeaderCta = {
  label: string;
  onClick: () => void;
} | null;

interface HeaderCtaContextValue {
  cta: HeaderCta;
  setCta: (cta: HeaderCta) => void;
}

const HeaderCtaContext = createContext<HeaderCtaContextValue | undefined>(undefined);

export const HeaderCtaProvider = ({ children }: { children: ReactNode }) => {
  const [cta, setCtaState] = useState<HeaderCta>(null);

  const setCta = useCallback((next: HeaderCta) => {
    setCtaState(next);
  }, []);

  return (
    <HeaderCtaContext.Provider value={{ cta, setCta }}>
      {children}
    </HeaderCtaContext.Provider>
  );
};

export const useHeaderCta = () => {
  const ctx = useContext(HeaderCtaContext);
  if (!ctx) {
    // Safe fallback to avoid crashes if a page using the hook is rendered outside the provider
    return { cta: null as HeaderCta, setCta: () => {} };
  }
  return ctx;
};
