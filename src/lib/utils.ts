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
  // Configurações padrão
  const {
    separador = '-',
    incluirNumero = true,
    quantidadeNumeros = 3
  } = opcoes || {};
  
  // 1. Normaliza o texto: remove acentos e converte para minúsculas
  let url = texto
    .normalize('NFD') // Decompõe caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Remove os acentos
    .toLowerCase()
    .trim();
  
  // 2. Remove caracteres especiais, mantém apenas letras, números e espaços
  url = url
    .replace(/[^a-z0-9\s]/g, '') // Remove tudo que não é alfanumérico ou espaço
    .replace(/\s+/g, separador); // Substitui espaços pelo separador
  
  // 3. Remove separadores duplicados consecutivos
  const regexSeparador = new RegExp(`${separador}+`, 'g');
  url = url.replace(regexSeparador, separador);
  
  // 4. Remove separadores no início e fim da string
  const regexExtremidades = new RegExp(`^${separador}+|${separador}+$`, 'g');
  url = url.replace(regexExtremidades, '');
  
  // 5. Adiciona números aleatórios se solicitado
  if (incluirNumero && quantidadeNumeros > 0) {
    // Gera números aleatórios de 0 a 9
    const numeros = Array.from({ length: quantidadeNumeros }, () => 
      Math.floor(Math.random() * 10) // Números de 0-9
    ).join('');
    
    // Retorna com os números, apenas adiciona separador se já houver conteúdo
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
