import { describe, it, expect, vi, beforeEach } from 'vitest'
import prisma from '@/prisma'
import {
  applyUserStorageDelta,
  checkUserStorageQuotaByDelta,
  MAX_USER_STORAGE_BYTES,
  removeUserStorageBytes,
} from './storage-quota'

function usoAtual(bytes: number) {
  vi.spyOn(prisma.usuario, 'findUnique').mockResolvedValue({ storageUsedBytes: BigInt(bytes) } as any)
}

describe('cota de armazenamento (2 GB por usuario)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('aceita chegar exatamente no limite e recusa 1 byte a mais', async () => {
    usoAtual(MAX_USER_STORAGE_BYTES - 10)

    expect((await checkUserStorageQuotaByDelta('u', 10)).allowed).toBe(true)
    expect((await checkUserStorageQuotaByDelta('u', 11)).allowed).toBe(false)
  })

  it('mensagem de recusa informa quanto ja foi usado e quanto resta', async () => {
    usoAtual(MAX_USER_STORAGE_BYTES - 1024)

    const quota = await checkUserStorageQuotaByDelta('u', 2048)

    expect(quota.message).toContain('2GB')
    expect(quota.message).toContain('restam 1 KB')
  })

  it('soma no uso com incremento atomico e ignora valores invalidos', async () => {
    const update = vi.spyOn(prisma.usuario, 'update').mockResolvedValue({} as any)

    await applyUserStorageDelta('u', 1500)
    await applyUserStorageDelta('u', 0)
    await applyUserStorageDelta('u', -10)
    await applyUserStorageDelta('u', Number.NaN)

    expect(update).toHaveBeenCalledTimes(1)
    expect(update).toHaveBeenCalledWith({ where: { id: 'u' }, data: { storageUsedBytes: { increment: 1500n } } })
  })

  it('remove do uso no banco, sem ler e regravar, e ignora valores invalidos', async () => {
    const executeRaw = vi.spyOn(prisma, '$executeRaw').mockResolvedValue(1 as any)

    await removeUserStorageBytes('u', 700)
    await removeUserStorageBytes('u', 0)
    await removeUserStorageBytes('u', Number.NaN)

    expect(executeRaw).toHaveBeenCalledTimes(1)
  })
})
