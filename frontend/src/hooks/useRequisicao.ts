import { useCallback, useEffect, useState } from "react";
import { mensagemErro } from "../services/api";

interface Estado<T> {
  dados?: T;
  erro?: string;
  carregando: boolean;
}

// `buscar` precisa ter identidade estável (função de módulo ou useCallback).
export function useRequisicao<T>(buscar: () => Promise<T>) {
  const [estado, setEstado] = useState<Estado<T>>({ carregando: true });
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let ativo = true;
    buscar()
      .then((dados) => ativo && setEstado({ dados, carregando: false }))
      .catch((e) => ativo && setEstado({ erro: mensagemErro(e), carregando: false }));
    return () => {
      ativo = false;
    };
  }, [buscar, tentativa]);

  const recarregar = useCallback(() => {
    setEstado({ carregando: true });
    setTentativa((n) => n + 1);
  }, []);
  return { ...estado, recarregar };
}
