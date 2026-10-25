// Sem dependências de servidor: pode ser usado também nos componentes do navegador.
export function formatBytes(bytes: number): string {
  const safeBytes = Number.isFinite(bytes) ? Math.max(0, bytes) : 0;

  if (safeBytes >= 1024 * 1024 * 1024) {
    return `${(safeBytes / (1024 * 1024 * 1024)).toFixed(2).replace(/\.00$/, '')} GB`;
  }

  if (safeBytes >= 1024 * 1024) {
    return `${(safeBytes / (1024 * 1024)).toFixed(2).replace(/\.00$/, '')} MB`;
  }

  if (safeBytes >= 1024) {
    return `${(safeBytes / 1024).toFixed(2).replace(/\.00$/, '')} KB`;
  }

  return `${safeBytes} bytes`;
}
