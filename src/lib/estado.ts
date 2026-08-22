import type { EstadoProcesso } from "./types";

export const ESTADO_LABEL: Record<EstadoProcesso, string> = {
  rascunho: "Rascunho",
  documentos: "Documentos",
  analise: "Em análise",
  validacao: "Em validação",
  minuta: "Minuta gerada",
  concluido: "Concluído",
};

export const TIPO_DOC_LABEL: Record<string, string> = {
  acusacao: "Acusação",
  acta: "Acta de audiência",
  prova: "Documentos / provas",
  outro: "Outro",
};

export function dataCurta(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}
