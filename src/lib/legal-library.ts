import type { DiplomaLegal } from "./types";

export const BIBLIOTECA_INICIAL: DiplomaLegal[] = [
  {
    id: "lei-25-2019",
    designacao: "Código de Processo Penal",
    diploma: "Lei n.º 25/2019, de 26 de Dezembro",
    tipo: "processual",
    data: "2019-12-26",
    versao: "1.0 (texto base)",
    fonte: "Boletim da República — registo manual, texto integral por carregar",
    notas:
      "Diploma processual (CPP). Regula a tramitação, a prova e a estrutura da sentença. Texto integral oficial ainda não carregado.",
  },
  {
    id: "lei-18-2020",
    designacao: "Alterações ao Código de Processo Penal",
    diploma: "Lei n.º 18/2020",
    tipo: "processual",
    data: "2020-01-01",
    versao: "1.0 (registo)",
    fonte: "Boletim da República — registo manual, data exacta a confirmar",
    notas:
      "Altera disposições do CPP aprovado pela Lei n.º 25/2019. CONFIRMAR data de publicação e âmbito das alterações antes de citar.",
  },
  {
    id: "lei-24-2019",
    designacao: "Código Penal",
    diploma: "Lei n.º 24/2019, de 24 de Dezembro",
    tipo: "substantivo",
    data: "2019-12-24",
    versao: "1.0 (texto base)",
    fonte: "Boletim da República — registo manual, texto integral por carregar",
    notas:
      "Diploma substantivo (CP). Define crimes, penas, circunstâncias modificativas e concurso. Texto integral oficial ainda não carregado.",
  },
  {
    id: "lei-17-2020",
    designacao: "Alterações ao Código Penal",
    diploma: "Lei n.º 17/2020",
    tipo: "substantivo",
    data: "2020-01-01",
    versao: "1.0 (registo)",
    fonte: "Boletim da República — registo manual, data exacta a confirmar",
    notas:
      "Altera disposições do CP aprovado pela Lei n.º 24/2019. CONFIRMAR data de publicação e âmbito das alterações antes de citar.",
  },
];

/**
 * Uma citação só é considerada validada quando o diploma existe na biblioteca
 * E o respectivo texto integral estiver carregado. Caso contrário o sistema
 * marca "CONFIRMAR BASE LEGAL".
 */
export function validarBaseLegal(
  baseLegal: string | undefined,
  biblioteca: DiplomaLegal[],
): { valida: boolean; motivo: string } {
  if (!baseLegal || !baseLegal.trim()) {
    return { valida: false, motivo: "Sem base legal indicada." };
  }
  const diploma = biblioteca.find((d) =>
    baseLegal.toLowerCase().includes((d.diploma.split(",")[0] ?? "").toLowerCase()),
  );
  if (!diploma) {
    return { valida: false, motivo: "Diploma não registado na Biblioteca Jurídica." };
  }
  if (!diploma.textoIntegral) {
    return {
      valida: false,
      motivo: `Texto integral de ${diploma.diploma} não carregado — CONFIRMAR BASE LEGAL.`,
    };
  }
  return { valida: true, motivo: "Diploma e texto integral disponíveis." };
}
