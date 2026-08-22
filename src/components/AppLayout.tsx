import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FolderOpen,
  FilePlus2,
  Library,
  Settings,
  Scale,
  Menu,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/processos", label: "Processos", icon: FolderOpen },
  { to: "/processos/novo", label: "Novo Processo", icon: FilePlus2 },
  { to: "/biblioteca", label: "Biblioteca Jurídica", icon: Library },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
] as const;

export function AppLayout({
  children,
  titulo,
  descricao,
  accoes,
}: {
  children: ReactNode;
  titulo: string;
  descricao?: string;
  accoes?: ReactNode;
}) {
  const [aberto, setAberto] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={cn(
          "sidebar-judicial fixed inset-y-0 left-0 z-40 flex w-64 flex-col text-sidebar-foreground transition-transform lg:translate-x-0",
          aberto ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
          <Scale className="h-6 w-6 text-sidebar-primary" />
          <div>
            <p className="font-serif text-base leading-tight font-semibold">Sentença AI</p>
            <p className="text-[11px] text-sidebar-foreground/60">Assistente de Sentenças</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV.map(({ to, label, icon: Icon }) => {
            const activo = to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setAberto(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  activo
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border px-5 py-4 text-[11px] leading-relaxed text-sidebar-foreground/60">
          Ferramenta de apoio. A decisão final, a conferência jurídica e a assinatura pertencem ao
          magistrado.
        </div>
      </aside>

      {aberto && (
        <div
          className="fixed inset-0 z-30 bg-foreground/40 lg:hidden"
          onClick={() => setAberto(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:ml-64">
        <header className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur">
          <div className="flex items-start gap-4 px-5 py-4 sm:px-8">
            <button
              className="mt-1 rounded-md p-1 text-muted-foreground lg:hidden"
              onClick={() => setAberto((v) => !v)}
              aria-label="Menu"
            >
              {aberto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-semibold">{titulo}</h1>
              {descricao && <p className="mt-1 text-sm text-muted-foreground">{descricao}</p>}
            </div>
            {accoes && <div className="flex shrink-0 flex-wrap gap-2">{accoes}</div>}
          </div>
        </header>
        <main className="flex-1 px-5 py-6 sm:px-8">{children}</main>
        <footer className="border-t border-border px-5 py-4 text-xs text-muted-foreground sm:px-8">
          Sentença AI — apoio à elaboração de minutas. Base: CPP (Lei n.º 25/2019, alt. Lei n.º
          18/2020) e CP (Lei n.º 24/2019, alt. Lei n.º 17/2020). Não constitui aconselhamento
          jurídico nem substitui a consulta do texto oficial.
        </footer>
      </div>
    </div>
  );
}
