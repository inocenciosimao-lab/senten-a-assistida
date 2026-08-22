import { useCallback, useEffect, useState } from "react";
import type { DiplomaLegal, Processo } from "./types";
import { BIBLIOTECA_INICIAL } from "./legal-library";
import { processoDemonstrativo } from "./demo-data";

const CHAVE_PROCESSOS = "sentenca-ai:processos";
const CHAVE_BIBLIOTECA = "sentenca-ai:biblioteca";

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function ler<T>(chave: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const bruto = window.localStorage.getItem(chave);
    if (!bruto) return fallback;
    return JSON.parse(bruto) as T;
  } catch {
    return fallback;
  }
}

function escrever<T>(chave: string, valor: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(chave, JSON.stringify(valor));
  window.dispatchEvent(new CustomEvent("sentenca-ai:mudou"));
}

export function useProcessos() {
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [pronto, setPronto] = useState(false);

  const recarregar = useCallback(() => {
    const guardados = ler<Processo[] | null>(CHAVE_PROCESSOS, null);
    if (!guardados) {
      const inicial = [processoDemonstrativo()];
      escrever(CHAVE_PROCESSOS, inicial);
      setProcessos(inicial);
    } else {
      setProcessos(guardados);
    }
    setPronto(true);
  }, []);

  useEffect(() => {
    recarregar();
    const h = () => recarregar();
    window.addEventListener("sentenca-ai:mudou", h);
    return () => window.removeEventListener("sentenca-ai:mudou", h);
  }, [recarregar]);

  return { processos, pronto };
}

export function guardarProcesso(processo: Processo) {
  const actuais = ler<Processo[]>(CHAVE_PROCESSOS, []);
  const idx = actuais.findIndex((p) => p.id === processo.id);
  const actualizado = { ...processo, actualizadoEm: new Date().toISOString() };
  if (idx >= 0) actuais[idx] = actualizado;
  else actuais.unshift(actualizado);
  escrever(CHAVE_PROCESSOS, actuais);
}

export function apagarProcesso(id: string) {
  escrever(
    CHAVE_PROCESSOS,
    ler<Processo[]>(CHAVE_PROCESSOS, []).filter((p) => p.id !== id),
  );
}

export function registarAuditoria(processo: Processo, accao: string): Processo {
  return {
    ...processo,
    auditoria: [
      { id: uid(), accao, quando: new Date().toISOString(), autor: "Utilizador local" },
      ...processo.auditoria,
    ].slice(0, 200),
  };
}

export function useProcesso(id: string) {
  const { processos, pronto } = useProcessos();
  return { processo: processos.find((p) => p.id === id) ?? null, pronto };
}

export function useBiblioteca() {
  const [biblioteca, setBiblioteca] = useState<DiplomaLegal[]>(BIBLIOTECA_INICIAL);

  const recarregar = useCallback(() => {
    const guardada = ler<DiplomaLegal[] | null>(CHAVE_BIBLIOTECA, null);
    if (!guardada) {
      escrever(CHAVE_BIBLIOTECA, BIBLIOTECA_INICIAL);
      setBiblioteca(BIBLIOTECA_INICIAL);
    } else {
      setBiblioteca(guardada);
    }
  }, []);

  useEffect(() => {
    recarregar();
    const h = () => recarregar();
    window.addEventListener("sentenca-ai:mudou", h);
    return () => window.removeEventListener("sentenca-ai:mudou", h);
  }, [recarregar]);

  return biblioteca;
}

export function guardarDiploma(diploma: DiplomaLegal) {
  const actuais = ler<DiplomaLegal[]>(CHAVE_BIBLIOTECA, BIBLIOTECA_INICIAL);
  const idx = actuais.findIndex((d) => d.id === diploma.id);
  if (idx >= 0) actuais[idx] = diploma;
  else actuais.push(diploma);
  escrever(CHAVE_BIBLIOTECA, actuais);
}
