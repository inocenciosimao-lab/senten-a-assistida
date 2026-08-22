import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useProcessos, apagarProcesso } from "@/lib/store";
import { ESTADO_LABEL, dataCurta } from "@/lib/estado";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/processos/")({
  head: () => ({
    meta: [
      { title: "Processos — Sentença AI" },
      {
        name: "description",
        content: "Lista de processos criminais em preparação de sentença, com estado e alertas.",
      },
      { property: "og:title", content: "Processos — Sentença AI" },
      { property: "og:description", content: "Gestão de processos criminais moçambicanos." },
    ],
  }),
  component: Processos,
});

function Processos() {
  const { processos } = useProcessos();
  const [q, setQ] = useState("");
  const filtrados = processos.filter((p) =>
    `${p.numero} ${p.arguidos} ${p.crimes} ${p.tribunal}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <AppLayout
      titulo="Processos"
      descricao="Todos os processos acessíveis a este utilizador."
      accoes={
        <Button asChild>
          <Link to="/processos/novo">Novo Processo</Link>
        </Button>
      }
    >
      <Input
        placeholder="Pesquisar por n.º, arguido, crime ou tribunal…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="mb-4 max-w-md"
      />
      <div className="space-y-3">
        {filtrados.map((p) => (
          <Card key={p.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
              <div className="min-w-0">
                <Link
                  to="/processos/$id"
                  params={{ id: p.id }}
                  className="font-medium hover:underline"
                >
                  Processo n.º {p.numero}
                </Link>
                <p className="text-sm text-muted-foreground">{p.crimes}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {p.tribunal} · {p.seccao} · {dataCurta(p.data)} · Arguido(s): {p.arguidos}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{ESTADO_LABEL[p.estado]}</Badge>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/processos/$id" params={{ id: p.id }}>
                    Abrir
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    apagarProcesso(p.id);
                    toast.success("Processo removido.");
                  }}
                  aria-label="Eliminar processo"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtrados.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum processo encontrado.</p>
        )}
      </div>
    </AppLayout>
  );
}
