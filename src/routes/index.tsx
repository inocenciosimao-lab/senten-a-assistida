import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProcessos } from "@/lib/store";
import { ESTADO_LABEL } from "@/lib/estado";
import { AlertTriangle, FileText, Gavel, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Sentença AI | Assistente de Sentenças Judiciais" },
      {
        name: "description",
        content:
          "Painel de processos criminais moçambicanos: estado das análises, minutas em curso e alertas de base legal.",
      },
      { property: "og:title", content: "Sentença AI — Assistente de Sentenças Judiciais" },
      {
        property: "og:description",
        content:
          "Apoio à elaboração de minutas de sentenças criminais em Moçambique, com rastreabilidade da prova.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { processos } = useProcessos();
  const emAnalise = processos.filter((p) => ["analise", "validacao"].includes(p.estado)).length;
  const alertas = processos.reduce(
    (t, p) => t + p.contradicoes.length + p.lacunas.length + p.factos.filter((f) => f.alertas.length).length,
    0,
  );

  return (
    <AppLayout
      titulo="Dashboard"
      descricao="Visão geral dos processos e do estado das minutas."
      accoes={
        <Button asChild>
          <Link to="/processos/novo">Novo Processo</Link>
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icone: FileText, rotulo: "Processos", valor: processos.length },
          { icone: Gavel, rotulo: "Em análise/validação", valor: emAnalise },
          {
            icone: ShieldCheck,
            rotulo: "Minutas geradas",
            valor: processos.filter((p) => Object.keys(p.minuta).length > 0).length,
          },
          { icone: AlertTriangle, rotulo: "Alertas activos", valor: alertas },
        ].map((c) => (
          <Card key={c.rotulo}>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="rounded-md bg-secondary p-2.5">
                <c.icone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{c.valor}</p>
                <p className="text-xs text-muted-foreground">{c.rotulo}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Processos recentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {processos.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Ainda não existem processos. Comece por criar um novo processo.
            </p>
          )}
          {processos.slice(0, 6).map((p) => (
            <Link
              key={p.id}
              to="/processos/$id"
              params={{ id: p.id }}
              className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border px-4 py-3 transition-colors hover:bg-secondary"
            >
              <div className="min-w-0">
                <p className="font-medium">
                  Processo n.º {p.numero} — {p.crimes}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {p.tribunal} · {p.seccao} · Arguido(s): {p.arguidos}
                </p>
              </div>
              <Badge variant="secondary">{ESTADO_LABEL[p.estado]}</Badge>
            </Link>
          ))}
        </CardContent>
      </Card>

      <div className="mt-6 rounded-md border border-accent/40 bg-accent/10 px-4 py-3 text-sm">
        <strong className="font-medium">Aviso:</strong> o Sentença AI é uma ferramenta de apoio à
        redacção. Nenhum conteúdo gerado tem valor decisório — a conferência jurídica, a decisão
        final e a assinatura pertencem exclusivamente ao magistrado.
      </div>
    </AppLayout>
  );
}
