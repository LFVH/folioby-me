import prisma from '@/prisma';

export const MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_SINGLE_UPLOAD_BYTES = 500 * 1024 * 1024;
export const MAX_USER_STORAGE_BYTES = 2 * 1024 * 1024 * 1024;

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

export async function getUserStorageStatus(userId: string) {
  const user = await prisma.usuario.findUnique({
    where: { id: userId },
    select: {
      storageUsedBytes: true,
    },
  });

  const usedBytes = Number(user?.storageUsedBytes ?? 0n);
  const remainingBytes = Math.max(0, MAX_USER_STORAGE_BYTES - usedBytes);

  return {
    usedBytes,
    remainingBytes,
    limitBytes: MAX_USER_STORAGE_BYTES,
  };
}

export async function checkUserStorageQuotaByDelta(userId: string, deltaBytes: number) {
  const safeDelta = Number.isFinite(deltaBytes) ? Math.max(-Number.MAX_SAFE_INTEGER, deltaBytes) : 0;
  const status = await getUserStorageStatus(userId);
  const projectedUsage = Math.max(0, status.usedBytes + safeDelta);
  const allowed = projectedUsage <= MAX_USER_STORAGE_BYTES;

  const remainingAfterDelta = Math.max(0, MAX_USER_STORAGE_BYTES - status.usedBytes);

  return {
    allowed,
    deltaBytes: safeDelta,
    usedBytes: status.usedBytes,
    projectedUsage,
    remainingBytes: remainingAfterDelta,
    limitBytes: MAX_USER_STORAGE_BYTES,
    message: allowed
      ? `Upload permitido. Você usou ${formatBytes(status.usedBytes)} de ${formatBytes(MAX_USER_STORAGE_BYTES)}.`
      : `Não é possivel inserir esse arquivo pois excede 2GB de armazenamento por usuario. Tentou inserir ${formatBytes(Math.max(0, safeDelta))}, já usou ${formatBytes(status.usedBytes)} e restam ${formatBytes(Math.max(0, MAX_USER_STORAGE_BYTES - status.usedBytes))}.`,
  };
}

export async function applyUserStorageDelta(userId: string, deltaBytes: number) {
  const safeDelta = Number.isFinite(deltaBytes) ? Math.max(0, deltaBytes) : 0;

  if (safeDelta <= 0) {
    return;
  }

  const user = await prisma.usuario.findUnique({
    where: { id: userId },
    select: { storageUsedBytes: true },
  });

  const currentUsed = Number(user?.storageUsedBytes ?? 0n);
  const nextUsed = Math.max(0, currentUsed + safeDelta);

  await prisma.usuario.update({
    where: { id: userId },
    data: {
      storageUsedBytes: BigInt(nextUsed),
    },
  });
}

export async function removeUserStorageBytes(userId: string, amountBytes: number) {
  const safeAmount = Number.isFinite(amountBytes) ? Math.max(0, amountBytes) : 0;

  if (safeAmount <= 0) {
    return;
  }

  const user = await prisma.usuario.findUnique({
    where: { id: userId },
    select: { storageUsedBytes: true },
  });

  const currentUsed = Number(user?.storageUsedBytes ?? 0n);
  const nextUsed = Math.max(0, currentUsed - safeAmount);

  await prisma.usuario.update({
    where: { id: userId },
    data: {
      storageUsedBytes: BigInt(nextUsed),
    },
  });
}
