import { createContext, useContext } from "react";
// Estado do terapeuta online, leve: o código do tempo real fica em OnlineTerapeuta.tsx (lazy).
export interface EstadoOnline { participa: boolean; online: boolean; nome: string; mudando: boolean; mudar: (v: boolean) => Promise<void> }
export const OnlineCtx = createContext<EstadoOnline | null>(null);
export const useOnlineTerapeuta = () => useContext(OnlineCtx);
