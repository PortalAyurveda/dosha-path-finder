import { useCallback, useEffect, useState } from "react";

/**
 * Persiste a aba ativa no hash da URL (#tab=valor) para que ao trocar de
 * aba do navegador, voltar e/ou recarregar, a sub-aba selecionada permaneça.
 */
export function useHashTab(defaultValue: string, key = "tab") {
  const read = () => {
    if (typeof window === "undefined") return defaultValue;
    const hash = window.location.hash.replace(/^#/, "");
    const params = new URLSearchParams(hash);
    return params.get(key) || defaultValue;
  };

  const [value, setValue] = useState<string>(read);

  useEffect(() => {
    const onHash = () => setValue(read());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = useCallback((v: string) => {
    setValue(v);
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace(/^#/, "");
    const params = new URLSearchParams(hash);
    params.set(key, v);
    const next = `#${params.toString()}`;
    if (window.location.hash !== next) {
      history.replaceState(null, "", `${window.location.pathname}${window.location.search}${next}`);
    }
  }, [key]);

  return [value, update] as const;
}
