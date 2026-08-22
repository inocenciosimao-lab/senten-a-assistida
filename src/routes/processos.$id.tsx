import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useProcesso } from "@/lib/store";
import { ESTADO_LABEL } from "@/lib/estado";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/processos/$id")({
  component: ProcessoLayout,
});

const SEPARADORES = [
  { to: "/processos/$id", label: "Análise", exacto: true },
  { to: "/processos/$id/documentos", label: "Documentos", exacto: false },
  { to: "/processos/$id/matriz", label: "Matriz de Prova", exacto: false },
  { to: "/processos/$id/minuta", label: "Minuta da Sentença", exacto: false },
] as const;

function ProcessoLayout() {
  const { id } = Route.useParams();
  const { processo, pronto } = useProcesso(id);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (!processo) {
    return (
      <AppLayout titulo="Processo">
        <p className="text-sm text-muted-foreground">
          {pronto ? "Processo não encontrado." : "A carregar…"}
        </p>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      titulo={`Processo n.º ${processo.numero}`}
      descricao={`${processo.tribunal} · ${processo.seccao} · ${processo.crimes}`}
      accoes={<Badge variant="secondary">{ESTADO_LABEL[processo.estado]}</Badge>}
    >
      <nav className="mb-6 flex flex-wrap gap-1 border-b border-border">
        {SEPARADORES.map((s) => {
          const alvo = s.to.replace("$id", id);
          const activo = s.exacto ? pathname === alvo : pathname.startsWith(alvo);
          return (
            <Link
              key={s.to}
              to={s.to}
              params={{ id }}
              className={cn(
                "-mb-px border-b-2 px-4 py-2 text-sm transition-colors",
                activo
                  ? "border-accent font-medium text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {s.label}
            </Link>
          );
        })}
      </nav>
      <Outlet />
    </AppLayout>
  );
}
