import { createFileRoute } from "@tanstack/react-router";
import { useProcesso, guardarProcesso, registarAuditoria, uid } from "@/lib/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRef, useState } from "react";
import type { DocumentoProcesso, TipoDocumento } from "@/lib/types";
import { TIPO_DOC_LABEL } from "@/lib/estado";
import { toast } from "sonner";
import { FileText, Trash2, Upload, Eye } from "lucide-react";

export const Route = createFileRoute("/processos/$id/documentos")({
  component: Documentos,
});

const TIPOS: TipoDocumento[] = ["acusacao", "acta", "prova", "outro"];

function Documentos() {
  const { id } = Route.useParams();
  const { processo } = useProcesso(id);
  const [progresso, setProgresso] = useState<Record<string, number>>({});
  const [aVer, setAVer] = useState<DocumentoProcesso | null>(null);
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});
  const [arrastar, setArrastar] = useState<string | null>(null);

  if (!processo) return null;

  async function processarFicheiros(lista: FileList | null, tipo: TipoDocumento) {
    if (!lista || !processo) return;
    for (const ficheiro of Array.from(lista)) {
      const docId = uid();
      setProgresso((p) => ({ ...p, [docId]: 5 }));
      let texto = "";
      if (ficheiro.type.startsWith("text/") || ficheiro.name.endsWith(".txt")) {
        texto = await ficheiro.text();
      }
      for (const v of [25, 55, 80, 100]) {
        await new Promise((r) => setTimeout(r, 180));
        setProgresso((p) => ({ ...p, [docId]: v }));
      }
      const doc: DocumentoProcesso = {
        id: docId,
        nome: ficheiro.name,
        tipo,
        tamanho: ficheiro.size,
        mime: ficheiro.type || "application/octet-stream",
        paginas: Math.max(1, Math.round(ficheiro.size / 45000)),
        estadoOcr: "processado",
        textoExtraido:
          texto ||
          `[Texto extraído por OCR/parsing de "${ficheiro.name}"]\n\nO conteúdo integral é indexado para permitir a rastreabilidade de cada facto até à sua origem. Nesta versão demonstrativa, o texto extraído é simulado para ficheiros binários (PDF, DOCX, imagens).`,
        criadoEm: new Date().toISOString(),
      };
      const actualizado = registarAuditoria(
        { ...processo, documentos: [...processo.documentos, doc], estado: "analise" },
        `Documento carregado: ${ficheiro.name} (${TIPO_DOC_LABEL[tipo]})`,
      );
      guardarProcesso(actualizado);
      setProgresso((p) => {
        const c = { ...p };
        delete c[docId];
        return c;
      });
      toast.success(`"${ficheiro.name}" carregado e indexado.`);
    }
  }

  function remover(docId: string) {
    if (!processo) return;
    guardarProcesso(
      registarAuditoria(
        { ...processo, documentos: processo.documentos.filter((d) => d.id !== docId) },
        "Documento removido",
      ),
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {TIPOS.map((tipo) => {
          const docs = processo.documentos.filter((d) => d.tipo === tipo);
          return (
            <Card
              key={tipo}
              onDragOver={(e) => {
                e.preventDefault();
                setArrastar(tipo);
              }}
              onDragLeave={() => setArrastar(null)}
              onDrop={(e) => {
                e.preventDefault();
                setArrastar(null);
                void processarFicheiros(e.dataTransfer.files, tipo);
              }}
              className={arrastar === tipo ? "border-accent ring-2 ring-accent/40" : undefined}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">{TIPO_DOC_LABEL[tipo]}</CardTitle>
                <CardDescription className="text-xs">
                  PDF, DOCX ou imagem · arraste para aqui
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <button
                  type="button"
                  onClick={() => inputs.current[tipo]?.click()}
                  className="flex w-full flex-col items-center gap-2 rounded-md border border-dashed border-border px-3 py-6 text-xs text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
                >
                  <Upload className="h-5 w-5" />
                  Carregar ficheiro
                </button>
                <input
                  ref={(el) => {
                    inputs.current[tipo] = el;
                  }}
                  type="file"
                  multiple
                  accept=".pdf,.docx,.doc,.txt,image/*"
                  className="hidden"
                  onChange={(e) => void processarFicheiros(e.target.files, tipo)}
                />
                <p className="text-xs text-muted-foreground">{docs.length} ficheiro(s)</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {Object.entries(progresso).map(([k, v]) => (
        <div key={k} className="space-y-1">
          <p className="text-xs text-muted-foreground">Extracção e indexação em curso… {v}%</p>
          <Progress value={v} />
        </div>
      ))}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Documentos do processo</CardTitle>
          <CardDescription>
            Cada facto da análise remete para o documento e o excerto de origem.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {processo.documentos.length === 0 && (
            <p className="text-sm text-muted-foreground">Ainda não existem documentos.</p>
          )}
          {processo.documentos.map((d) => (
            <div
              key={d.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{d.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    {TIPO_DOC_LABEL[d.tipo]} · {d.paginas} pág. ·{" "}
                    {(d.tamanho / 1024).toFixed(0)} KB
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={d.estadoOcr === "processado" ? "secondary" : "outline"}>
                  {d.estadoOcr === "processado" ? "Indexado" : d.estadoOcr}
                </Badge>
                <Button variant="ghost" size="sm" onClick={() => setAVer(d)}>
                  <Eye className="mr-1 h-4 w-4" /> Texto extraído
                </Button>
                <Button variant="ghost" size="sm" onClick={() => remover(d.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={!!aVer} onOpenChange={(o) => !o && setAVer(null)}>
        <DialogContent className="max-h-[80vh] max-w-3xl overflow-auto">
          <DialogHeader>
            <DialogTitle>{aVer?.nome}</DialogTitle>
          </DialogHeader>
          <pre className="texto-juridico whitespace-pre-wrap text-sm">{aVer?.textoExtraido}</pre>
        </DialogContent>
      </Dialog>
    </div>
  );
}
