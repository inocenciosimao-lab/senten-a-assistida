import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { guardarProcesso, uid } from "@/lib/store";
import type { Processo } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/processos/novo")({
  head: () => ({
    meta: [
      { title: "Novo Processo — Sentença AI" },
      {
        name: "description",
        content:
          "Registo dos dados básicos do processo criminal: tribunal, secção, juiz, arguidos, ofendidos e crimes imputados.",
      },
      { property: "og:title", content: "Novo Processo — Sentença AI" },
      {
        property: "og:description",
        content: "Criação de um novo processo para preparação de minuta de sentença.",
      },
    ],
  }),
  component: NovoProcesso,
});

const CAMPOS = [
  { chave: "numero", rotulo: "N.º do processo", exemplo: "128/2026" },
  { chave: "tribunal", rotulo: "Tribunal", exemplo: "Tribunal Judicial da Província de Sofala" },
  { chave: "seccao", rotulo: "Secção", exemplo: "1.ª Secção Criminal" },
  { chave: "juiz", rotulo: "Juiz", exemplo: "Dr.(a) …" },
] as const;

function NovoProcesso() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    numero: "",
    tribunal: "",
    seccao: "",
    juiz: "",
    arguidos: "",
    ofendidos: "",
    crimes: "",
    data: new Date().toISOString().slice(0, 10),
  });

  function submeter(e: React.FormEvent) {
    e.preventDefault();
    if (!form.numero.trim() || !form.tribunal.trim() || !form.arguidos.trim()) {
      toast.error("Preencha pelo menos o n.º do processo, o tribunal e o(s) arguido(s).");
      return;
    }
    const id = uid();
    const processo: Processo = {
      id,
      ...form,
      estado: "documentos",
      criadoEm: new Date().toISOString(),
      actualizadoEm: new Date().toISOString(),
      documentos: [],
      provas: [],
      factos: [],
      elementos: [],
      fundamentos: [],
      contradicoes: [],
      lacunas: [],
      minuta: {},
      versoes: [],
      comentarios: [],
      auditoria: [
        { id: uid(), accao: "Processo criado", quando: new Date().toISOString(), autor: "Utilizador local" },
      ],
    };
    guardarProcesso(processo);
    toast.success("Processo criado. Carregue agora os documentos.");
    navigate({ to: "/processos/$id/documentos", params: { id } });
  }

  return (
    <AppLayout
      titulo="Novo Processo"
      descricao="Dados básicos de identificação. Os documentos são carregados no passo seguinte."
    >
      <form onSubmit={submeter} className="max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Identificação</CardTitle>
            <CardDescription>Informação que constará do cabeçalho da sentença.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {CAMPOS.map((c) => (
              <div key={c.chave} className="space-y-2">
                <Label htmlFor={c.chave}>{c.rotulo}</Label>
                <Input
                  id={c.chave}
                  placeholder={c.exemplo}
                  value={form[c.chave]}
                  onChange={(e) => setForm({ ...form, [c.chave]: e.target.value })}
                />
              </div>
            ))}
            <div className="space-y-2">
              <Label htmlFor="data">Data de referência</Label>
              <Input
                id="data"
                type="date"
                value={form.data}
                onChange={(e) => setForm({ ...form, data: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sujeitos e imputação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="arguidos">Arguido(s)</Label>
              <Textarea
                id="arguidos"
                rows={2}
                placeholder="Nome, estado civil, idade, residência…"
                value={form.arguidos}
                onChange={(e) => setForm({ ...form, arguidos: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ofendidos">Ofendido(s)</Label>
              <Textarea
                id="ofendidos"
                rows={2}
                value={form.ofendidos}
                onChange={(e) => setForm({ ...form, ofendidos: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="crimes">Crimes imputados</Label>
              <Textarea
                id="crimes"
                rows={2}
                placeholder="Ex.: Furto qualificado; Ofensa corporal simples"
                value={form.crimes}
                onChange={(e) => setForm({ ...form, crimes: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                A qualificação jurídica só será fixada após validação dos factos e da base legal.
              </p>
            </div>
          </CardContent>
        </Card>

        <Button type="submit">Criar processo e avançar para documentos</Button>
      </form>
    </AppLayout>
  );
}
