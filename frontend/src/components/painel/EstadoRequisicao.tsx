import { AlertTriangle, Loader2 } from "lucide-react";
import { OriginBanner } from "../ui/OriginBanner";

interface EstadoRequisicaoProps {
  carregando: boolean;
  erro?: string;
}

// Mostra o banner de carregamento ou erro; não renderiza nada quando há dados.
export function EstadoRequisicao({ carregando, erro }: EstadoRequisicaoProps) {
  if (erro) {
    return (
      <OriginBanner
        variante="laranja"
        icone={<AlertTriangle className="w-4 h-4" />}
        titulo="Não foi possível carregar os dados"
        descricao={erro}
      />
    );
  }
  if (carregando) {
    return (
      <OriginBanner
        icone={<Loader2 className="w-4 h-4 animate-spin" />}
        titulo="Carregando"
        descricao="Buscando dados no servidor..."
      />
    );
  }
  return null;
}
