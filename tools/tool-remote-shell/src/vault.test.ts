// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { decryptVault, encryptVault, type HostEntry } from './vault';

const ENTRIES: HostEntry[] = [
  {
    id: 'root@example.com:22',
    alias: '生产机',
    host: 'example.com',
    port: 22,
    user: 'root',
    authType: 'password',
    secret: 'hunter2',
  },
];

describe('凭据金库', () => {
  it('同一主密码能原样解回条目', async () => {
    const blob = await encryptVault(ENTRIES, 'correct horse');
    await expect(decryptVault(blob, 'correct horse')).resolves.toEqual(ENTRIES);
  });

  it('密文里不出现明文密码', async () => {
    const blob = await encryptVault(ENTRIES, 'correct horse');
    expect(JSON.stringify(blob)).not.toContain('hunter2');
  });

  it('主密码错误必须报错，不能静默返回空', async () => {
    const blob = await encryptVault(ENTRIES, 'correct horse');
    await expect(decryptVault(blob, 'wrong horse')).rejects.toThrow();
  });

  it('每次加密都换 salt 与 iv，相同内容不产生相同密文', async () => {
    const a = await encryptVault(ENTRIES, 'same');
    const b = await encryptVault(ENTRIES, 'same');
    expect(a.ct).not.toEqual(b.ct);
    expect(a.salt).not.toEqual(b.salt);
    expect(a.iv).not.toEqual(b.iv);
  });
});
