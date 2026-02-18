import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function criarURL(
  texto: string,
  opcoes?: {
    separador?: string;
    incluirNumero?: boolean;
    quantidadeNumeros?: number;
  }
): string {
  const {
    separador = '-',
    incluirNumero = true,
    quantidadeNumeros = 3
  } = opcoes || {};
  let url = texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
  url = url
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, separador);
  const regexSeparador = new RegExp(`${separador}+`, 'g');
  url = url.replace(regexSeparador, separador);
  const regexExtremidades = new RegExp(`^${separador}+|${separador}+$`, 'g');
  url = url.replace(regexExtremidades, '');
  if (incluirNumero && quantidadeNumeros > 0) {
    const numeros = Array.from({ length: quantidadeNumeros }, () => 
      Math.floor(Math.random() * 10)
    ).join('');
    return url ? `${url}${separador}${numeros}` : numeros;
  }
  return url;
}
export function scrollToTop() {
  return () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
}
