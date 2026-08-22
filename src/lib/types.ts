export type EstadoProcesso =
  | "rascunho"
  | "documentos"
  | "analise"
  | "validacao"
  | "minuta"
  | "concluido";

export type TipoDocumento = "acusacao" | "acta" | "prova" | "outro";

export interface DocumentoProcesso {
  id: string;
  nome: string;
  tipo: TipoDocumento;
  tamanho: number;
  mime: string;
  paginas: number;
  estadoOcr: "pendente" | "processado" | "erro";
  textoExtraido: string;
  criadoEm: string;
}

export type EstadoItem = "pendente" | "aceite" | "rejeitado";

export interface Prova {
  id: string;
  referencia: string;
  tipo: "documental" | "testemunhal" | "pericial" | "declaracoes" | "outra";
  descricao: string;
  origemDocumentoId?: string;
  utilizavel: boolean;
  observacao?: string;
}

export interface Facto {
  id: string;
  numero: number;
  texto: string;
  categoria: "provado" | "nao_provado";
  natureza: "alegacao" | "prova" | "inferencia";
  confianca: number; // 0-100
  provasIds: string[];
  origem: string;
  estado: EstadoItem;
  alertas: string[];
}

export interface ElementoCrime {
  id: string;
  crime: string;
  baseLegal: string;
  baseLegalConfirmada: boolean;
  elemento: string;
  tipoElemento: "objectivo" | "subjectivo";
  provasIds: string[];
  preenchido: "sim" | "nao" | "duvidoso";
  nota?: string;
}

export interface Fundamento {
  id: string;
  seccao:
    | "questoes"
    | "facto"
    | "direito"
    | "qualificacao"
    | "autoria"
    | "exclusao"
    | "circunstancias"
    | "pena"
    | "concurso"
    | "desconto"
    | "civil"
    | "custas"
    | "apreendidos";
  titulo: string;
  texto: string;
  baseLegal?: string;
  baseLegalConfirmada: boolean;
  estado: EstadoItem;
  alertas: string[];
}

export interface Contradicao {
  id: string;
  descricao: string;
  fontes: string[];
  gravidade: "alta" | "media" | "baixa";
}

export interface VersaoSentenca {
  id: string;
  numero: number;
  criadoEm: string;
  autor: string;
  nota: string;
  conteudo: Record<string, string>;
}

export interface Comentario {
  id: string;
  seccao: string;
  texto: string;
  criadoEm: string;
  autor: string;
}

export interface Processo {
  id: string;
  numero: string;
  tribunal: string;
  seccao: string;
  juiz: string;
  arguidos: string;
  ofendidos: string;
  crimes: string;
  data: string;
  estado: EstadoProcesso;
  criadoEm: string;
  actualizadoEm: string;
  documentos: DocumentoProcesso[];
  provas: Prova[];
  factos: Facto[];
  elementos: ElementoCrime[];
  fundamentos: Fundamento[];
  contradicoes: Contradicao[];
  lacunas: string[];
  minuta: Record<string, string>;
  versoes: VersaoSentenca[];
  comentarios: Comentario[];
  auditoria: { id: string; accao: string; quando: string; autor: string }[];
}

export interface DiplomaLegal {
  id: string;
  designacao: string;
  diploma: string;
  tipo: "processual" | "substantivo" | "especial";
  data: string;
  versao: string;
  fonte: string;
  notas: string;
  textoIntegral?: string;
}
