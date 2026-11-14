import type { EventoHistorico } from "../services/api";

export function resumirHistorico(eventos: EventoHistorico[]) {
  const comAderencia = eventos.flatMap((ev) => (ev.aderencia === null ? [] : [ev.aderencia]));
  return {
    aderenciaMedia: comAderencia.length
      ? Math.round(comAderencia.reduce((soma, a) => soma + a, 0) / comAderencia.length)
      : null,
    totalCheckins: eventos.reduce((soma, ev) => soma + ev.checkins, 0),
    totalEventos: eventos.length,
  };
}
