import { useState } from "react";
import { Navigate } from "react-router-dom";
import { AlertTriangle, Loader2, LogIn } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useSessao } from "../hooks/useSessao";
import { OriginInput } from "../components/ui/OriginControls";
import { OriginBanner } from "../components/ui/OriginBanner";

export function LoginPage() {
  const { sessao } = useSessao();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  if (sessao) return <Navigate to="/" replace />;

  const handleEntrar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setEnviando(true);
    setErro(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) setErro("E-mail ou senha inválidos.");
    setEnviando(false);
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <form
        onSubmit={handleEntrar}
        className="w-full max-w-sm bg-background p-6 rounded-xl border border-border shadow-sm space-y-5"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
            M
          </div>
          <span className="text-xl font-bold tracking-tight">MallPulse</span>
        </div>
        <h1 className="font-semibold text-base border-b border-border pb-3">
          Acesso do Gestor
        </h1>

        {!supabase && (
          <OriginBanner
            variante="laranja"
            icone={<AlertTriangle className="w-4 h-4" />}
            titulo="Autenticação não configurada"
            descricao="Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY em frontend/.env."
          />
        )}
        {erro && (
          <OriginBanner
            variante="laranja"
            icone={<AlertTriangle className="w-4 h-4" />}
            titulo="Falha no login"
            descricao={erro}
          />
        )}

        <OriginInput
          label="E-mail"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <OriginInput
          label="Senha"
          type="password"
          required
          autoComplete="current-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        <button
          type="submit"
          disabled={!supabase || enviando}
          className="w-full bg-primary hover:opacity-95 disabled:opacity-60 text-white font-semibold py-3 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition shadow-sm"
        >
          {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
          Entrar
        </button>
      </form>
    </div>
  );
}
