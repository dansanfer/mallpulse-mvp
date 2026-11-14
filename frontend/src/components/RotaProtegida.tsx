import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSessao } from "../hooks/useSessao";

export function RotaProtegida({ children }: { children: ReactNode }) {
  const { sessao, carregando } = useSessao();
  if (carregando) return null;
  return sessao ? children : <Navigate to="/login" replace />;
}
