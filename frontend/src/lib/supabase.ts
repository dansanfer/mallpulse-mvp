import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const chaveAnonima = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Sem projeto configurado o cliente não é criado: o login exibe o aviso.
export const supabase = url && chaveAnonima ? createClient(url, chaveAnonima) : null;
