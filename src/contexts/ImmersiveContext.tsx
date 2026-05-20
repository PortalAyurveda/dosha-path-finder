import { createContext, useContext, useState, ReactNode, useCallback } from "react";

interface ImmersiveContextType {
  immersive: boolean;
  setImmersive: (value: boolean) => void;
}

const ImmersiveContext = createContext<ImmersiveContextType>({
  immersive: false,
  setImmersive: () => {},
});

export const ImmersiveProvider = ({ children }: { children: ReactNode }) => {
  const [immersive, setImmersiveState] = useState(false);
  const setImmersive = useCallback((v: boolean) => setImmersiveState(v), []);
  return (
    <ImmersiveContext.Provider value={{ immersive, setImmersive }}>
      {children}
    </ImmersiveContext.Provider>
  );
};

export const useImmersive = () => useContext(ImmersiveContext);
