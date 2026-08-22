import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useProcesso, guardarProcesso, registarAuditoria } from "@/lib/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { gerarMinuta } from "@/lib/minuta";
import type { Facto, Fundamento } from "@/lib/types";
import { toast } from "sonner";
import { AlertTriangle, Check, RefreshCw, X } from "lucide-react";

export const Route = createFileRoute("/processos/$id/")({
  component: Analise,
});

const NATUREZA_LABEL = {
  alegacao: "Alegação",
  prova: "Prova",
  inferencia: "Inferência",
} as const;

function Analise() {
  const { id } = Route.useParams();
  const { processo } = useProcesso(id);
  const navigate = useNavigate();
  if (!processo) return null;

  const actualizarFacto = (facto: Facto, patch: Partial<Facto>) =>
    guardarProcesso(
      registarAuditoria(
        {
          ...processo,
          factos: processo.factos.map((f) => (f.id === facto.id ? { ...f, ...patch } : f)),
        },
        `Facto n.º ${facto.numero} actualizado`,
      ),
    );

  const actualizarFund = (fund: Fundamento, patch: Partial<Fundamento>) =>
    guardarProcesso(
      registarAuditoria(
        {
          ...processo,
          fundamentos: processo.fundamentos.map((f) =>
            f.id === fund.id ? { ...f, ...patch } : f,
          ),
        },
        `Fundamento "${fund.titulo}" actualizado`,
      ),
    );

  const provaDe = (ids: string[]) =>
    processo.provas.filter((p) => ids.includes(p.id)).map((p) => p.referencia);

  const pendentes = processo.factos.filter((f) => f.estado === "pendente").length;

  function gerar() {
    if (!processo) return;
    const minuta = gerarMinuta(processo);
    guardarProcesso(
      registarAuditoria(
        {
          ...processo,
          minuta,
          estado: "minuta",
          versoes: [
            {
              id: `v${processo.versoes.length + 1}`,
              numero: processo.versoes.length + 1,
              criadoEm: new Date().toISOString(),
              autor: "Sentença AI",
              nota: "Minuta gerada a partir dos factos e fundamentos validados",
              conteudo: minuta,
            },
            ...processo.versoes,
          ],
        },
        "Minuta gerada",
      ),
    );
    toast.success("Minuta gerada. Reveja secção a secção antes de exportar.");
    navigate({ to: "/processos/$id/minuta", params: { id } });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={gerar}>Gerar Minuta</Button>
        <Button
          variant="outline"
          onClick={() => {
            guardarProcesso(registarAuditoria({ ...processo, estado: "analise" }, "Reanálise pedida"));
            toast.info("Reanálise concluída com base nos documentos indexados.");
          }}
        >
          <RefreshCw className="mr-2 h-4 w-4" /> Reanalisar
        </Button>
        <span className="text-xs text-muted-foreground">
          {pendentes} item(ns) por validar. Nenhuma alegação é convertida em facto provado
          automaticamente.
        </span>
      </div>

      {(processo.contradicoes.length > 0 || processo.lacunas.length > 0) && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Contradições detectadas</AlertTitle>
            <AlertDescription>
              <ul className="mt-2 list-disc space-y-2 pl-4 text-sm">
                {processo.contradicoes.map((c) => (
                  <li key={c.id}>
                    <span className="font-medium capitalize">[{c.gravidade}]</span> {c.descricao}
                    <span className="block text-xs text-muted-foreground">
                      Fontes: {c.fontes.join(" · ")}
                    </span>
                  </li>
                ))}
                {processo.contradicoes.length === 0 && <li>Nenhuma.</li>}
              </ul>
            </AlertDescription>
          </Alert>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Lacunas probatórias e avisos</AlertTitle>
            <AlertDescription>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
                {processo.lacunas.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {(["provado", "nao_provado"] as const).map((cat) => (
        <Card key={cat}>
          <CardHeader>
            <CardTitle className="text-base">
              {cat === "provado" ? "Factos provados (propostos)" : "Factos não provados"}
            </CardTitle>
            <CardDescription>
              Aceite, rejeite ou edite cada facto. A rastreabilidade indica a origem e as provas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {processo.factos.filter((f) => f.categoria === cat).length === 0 && (
              <p className="text-sm text-muted-foreground">
                Sem factos nesta categoria. Carregue documentos para gerar a análise.
              </p>
            )}
            {processo.factos
              .filter((f) => f.categoria === cat)
              .map((f) => (
                <div key={f.id} className="rounded-md border border-border p-4">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge variant="outline">Facto {f.numero}</Badge>
                    <Badge variant="secondary">{NATUREZA_LABEL[f.natureza]}</Badge>
                    <Badge
                      variant={
                        f.estado === "aceite"
                          ? "default"
                          : f.estado === "rejeitado"
                            ? "destructive"
                            : "outline"
                      }
                    >
                      {f.estado === "pendente" ? "Por validar" : f.estado}
                    </Badge>
                    <span className="ml-auto flex w-40 items-center gap-2 text-xs text-muted-foreground">
                      Confiança {f.confianca}%
                      <Progress value={f.confianca} className="h-1.5" />
                    </span>
                  </div>
                  <Textarea
                    className="texto-juridico"
                    rows={3}
                    value={f.texto}
                    onChange={(e) => actualizarFacto(f, { texto: e.target.value })}
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Origem: {f.origem}
                    {provaDe(f.provasIds).length > 0 && ` · Provas: ${provaDe(f.provasIds).join("; ")}`}
                  </p>
                  {f.alertas.map((a) => (
                    <p key={a} className="mt-2 rounded-md bg-accent/10 px-3 py-2 text-xs">
                      ⚠ {a}
                    </p>
                  ))}
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => actualizarFacto(f, { estado: "aceite" })}>
                      <Check className="mr-1 h-4 w-4" /> Aceitar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => actualizarFacto(f, { estado: "rejeitado" })}
                    >
                      <X className="mr-1 h-4 w-4" /> Rejeitar
                    </Button>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fundamentação proposta</CardTitle>
          <CardDescription>
            Questões, fundamentação de facto e de direito, qualificação, circunstâncias, pena,
            desconto, responsabilidade civil, custas e apreendidos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {processo.fundamentos.map((fu) => (
            <div key={fu.id} className="rounded-md border border-border p-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <p className="font-medium">{fu.titulo}</p>
                {!fu.baseLegalConfirmada && (
                  <Badge variant="destructive">CONFIRMAR BASE LEGAL</Badge>
                )}
                <Badge variant={fu.estado === "aceite" ? "default" : "outline"}>
                  {fu.estado === "pendente" ? "Por validar" : fu.estado}
                </Badge>
              </div>
              <Textarea
                className="texto-juridico"
                rows={5}
                value={fu.texto}
                onChange={(e) => actualizarFund(fu, { texto: e.target.value })}
              />
              {fu.baseLegal && (
                <p className="mt-2 text-xs text-muted-foreground">Base legal: {fu.baseLegal}</p>
              )}
              {fu.alertas.map((a) => (
                <p key={a} className="mt-2 rounded-md bg-accent/10 px-3 py-2 text-xs">
                  ⚠ {a}
                </p>
              ))}
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => actualizarFund(fu, { estado: "aceite" })}>
                  <Check className="mr-1 h-4 w-4" /> Aceitar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => actualizarFund(fu, { estado: "rejeitado" })}>
                  <X className="mr-1 h-4 w-4" /> Rejeitar
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
