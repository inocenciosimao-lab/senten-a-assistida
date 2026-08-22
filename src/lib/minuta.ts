import type { Processo } from "./types";

export const SECCOES_MINUTA: { chave: string; titulo: string }[] = [
  { chave: "cabecalho", titulo: "Cabeçalho e identificação" },
  { chave: "relatorio", titulo: "Relatório" },
  { chave: "posicoes", titulo: "Posições da acusação e da defesa" },
  { chave: "provados", titulo: "Factos provados" },
  { chave: "nao_provados", titulo: "Factos não provados" },
  { chave: "questoes", titulo: "Questões a resolver" },
  { chave: "facto", titulo: "Fundamentação de facto" },
  { chave: "direito", titulo: "Fundamentação de direito" },
  { chave: "qualificacao", titulo: "Qualificação jurídica" },
  { chave: "autoria", titulo: "Autoria e participação" },
  { chave: "exclusao", titulo: "Causas de exclusão da ilicitude e da culpa" },
  { chave: "circunstancias", titulo: "Circunstâncias agravantes e atenuantes" },
  { chave: "pena", titulo: "Medida concreta da pena" },
  { chave: "concurso", titulo: "Concurso de crimes" },
  { chave: "desconto", titulo: "Desconto da detenção / prisão preventiva" },
  { chave: "civil", titulo: "Responsabilidade civil emergente do crime" },
  { chave: "custas", titulo: "Custas" },
  { chave: "apreendidos", titulo: "Destino de objectos e valores apreendidos" },
  { chave: "dispositivo", titulo: "Dispositivo / decisão" },
];

function fund(processo: Processo, seccao: string) {
  return processo.fundamentos
    .filter((f) => f.seccao === seccao && f.estado !== "rejeitado")
    .map((f) => (f.baseLegalConfirmada ? f.texto : `${f.texto}\n[CONFIRMAR BASE LEGAL]`))
    .join("\n\n");
}

export function gerarMinuta(processo: Processo): Record<string, string> {
  const aceites = processo.factos.filter((f) => f.estado !== "rejeitado");
  const provados = aceites.filter((f) => f.categoria === "provado");
  const naoProvados = aceites.filter((f) => f.categoria === "nao_provado");

  return {
    cabecalho: `${processo.tribunal.toUpperCase()}\n${processo.seccao}\nProcesso n.º ${processo.numero}\nJuiz: ${processo.juiz}\nArguido(s): ${processo.arguidos}\nOfendido(s): ${processo.ofendidos}\nCrimes imputados: ${processo.crimes}\n\nSENTENÇA`,
    relatorio: `O Ministério Público deduziu acusação contra ${processo.arguidos}, imputando-lhe a prática de ${processo.crimes}. Realizada a audiência de julgamento com observância do legal formalismo, cumpre decidir.`,
    posicoes: `Acusação: sustenta a verificação dos factos e dos crimes imputados, conforme peça acusatória junta aos autos.\n\nDefesa: a posição do arguido resulta das suas declarações prestadas em audiência, conforme acta, sendo negados os factos não confessados.`,
    provados: provados.length
      ? provados.map((f, i) => `${i + 1}. ${f.texto}`).join("\n")
      : "Não foram validados factos provados.",
    nao_provados: naoProvados.length
      ? naoProvados.map((f, i) => `${i + 1}. ${f.texto}`).join("\n")
      : "Não se apuraram factos não provados com relevo para a decisão.",
    questoes: fund(processo, "questoes"),
    facto:
      fund(processo, "facto") ||
      "A convicção do Tribunal assentou na apreciação crítica e individualizada da prova produzida em audiência.",
    direito:
      fund(processo, "direito") ||
      "Aplica-se o Código Penal (Lei n.º 24/2019, com a alteração da Lei n.º 17/2020) quanto ao direito substantivo e o Código de Processo Penal (Lei n.º 25/2019, com as alterações da Lei n.º 18/2020) quanto às normas processuais.\n[CONFIRMAR BASE LEGAL dos artigos concretamente aplicáveis]",
    qualificacao: fund(processo, "qualificacao"),
    autoria:
      fund(processo, "autoria") ||
      "O arguido actuou como autor material dos factos dados como provados.",
    exclusao:
      fund(processo, "exclusao") ||
      "Não se apuraram factos susceptíveis de configurar causas de exclusão da ilicitude ou da culpa.",
    circunstancias: fund(processo, "circunstancias"),
    pena: fund(processo, "pena"),
    concurso:
      fund(processo, "concurso") ||
      "Verificando-se pluralidade de crimes, o cúmulo será operado nos termos legais. [CONFIRMAR BASE LEGAL]",
    desconto: fund(processo, "desconto"),
    civil: fund(processo, "civil"),
    custas: fund(processo, "custas"),
    apreendidos: fund(processo, "apreendidos"),
    dispositivo: `Pelo exposto, e sem prejuízo da conferência jurídica e decisão final do(a) Meritíssimo(a) Juiz(a), propõe-se:\n\na) Dar como provados os factos acima elencados;\nb) Condenar/absolver o arguido nos termos que vierem a ser fixados quanto a ${processo.crimes};\nc) Descontar o período de detenção sofrido, quando legalmente aplicável;\nd) Custas nos termos legais.\n\nRegiste e notifique.\n\n${processo.tribunal}, ____ de __________ de ______\n\nO(A) Juiz(a) de Direito\n\n_______________________________\n\nMINUTA GERADA POR FERRAMENTA DE APOIO — SUJEITA A CONFERÊNCIA, CORRECÇÃO E ASSINATURA DO MAGISTRADO.`,
  };
}

export function minutaParaTexto(processo: Processo) {
  return SECCOES_MINUTA.map(
    (s) => `${s.titulo.toUpperCase()}\n\n${processo.minuta[s.chave] ?? ""}`,
  ).join("\n\n\n");
}

export function exportarWord(processo: Processo) {
  const corpo = SECCOES_MINUTA.map(
    (s) =>
      `<h2 style="font-family:Georgia,serif;font-size:13pt;">${s.titulo}</h2><p style="font-family:Georgia,serif;font-size:12pt;line-height:1.6;white-space:pre-wrap;">${(
        processo.minuta[s.chave] ?? ""
      ).replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c] ?? c)}</p>`,
  ).join("");
  const html = `<html xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"></head><body>${corpo}</body></html>`;
  const blob = new Blob(["\ufeff", html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Minuta_Sentenca_${processo.numero.replace(/\//g, "-")}.doc`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportarPdf(processo: Processo) {
  const janela = window.open("", "_blank");
  if (!janela) return;
  const corpo = SECCOES_MINUTA.map(
    (s) =>
      `<h2>${s.titulo}</h2><p>${(processo.minuta[s.chave] ?? "").replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c] ?? c)}</p>`,
  ).join("");
  janela.document.write(
    `<html><head><title>Minuta ${processo.numero}</title><style>body{font-family:Georgia,serif;margin:3cm 2.5cm;line-height:1.6}h2{font-size:13pt;margin-top:24px}p{white-space:pre-wrap;font-size:12pt}</style></head><body>${corpo}</body></html>`,
  );
  janela.document.close();
  janela.focus();
  janela.print();
}
