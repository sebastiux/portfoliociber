export type IocType = "ip" | "domain" | "url" | "hash";
export type HashKind = "md5" | "sha1" | "sha256";

export type ParsedIoc = {
  value: string;
  type: IocType;
  hashKind?: HashKind;
};

const IPV4 = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
const DOMAIN = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;
const MD5 = /^[a-f0-9]{32}$/i;
const SHA1 = /^[a-f0-9]{40}$/i;
const SHA256 = /^[a-f0-9]{64}$/i;

export function parseIocs(input: string): ParsedIoc[] {
  const seen = new Set<string>();
  const out: ParsedIoc[] = [];
  const tokens = input
    .split(/[\s,;]+/)
    .map((t) => t.trim().replace(/^[\[(<"']+|[\])>"',.;]+$/g, ""))
    .map((t) => t.replace(/\[\.\]/g, ".").replace(/\(\.\)/g, "."))
    .filter(Boolean);

  for (const token of tokens) {
    const parsed = classify(token);
    if (!parsed) continue;
    const dedup = `${parsed.type}:${parsed.value.toLowerCase()}`;
    if (seen.has(dedup)) continue;
    seen.add(dedup);
    out.push(parsed);
  }
  return out;
}

function classify(token: string): ParsedIoc | null {
  if (MD5.test(token)) return { value: token.toLowerCase(), type: "hash", hashKind: "md5" };
  if (SHA1.test(token)) return { value: token.toLowerCase(), type: "hash", hashKind: "sha1" };
  if (SHA256.test(token)) return { value: token.toLowerCase(), type: "hash", hashKind: "sha256" };
  if (IPV4.test(token)) return { value: token, type: "ip" };
  if (/^https?:\/\//i.test(token)) {
    try {
      const u = new URL(token);
      return { value: u.toString(), type: "url" };
    } catch {
      return null;
    }
  }
  if (DOMAIN.test(token)) return { value: token.toLowerCase(), type: "domain" };
  return null;
}
