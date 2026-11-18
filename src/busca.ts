/** Busca no texto sem diferenciar maiúsculas nem acentos ("estacao" acha "Estação"). */

/** Tira o acento de um caractere só (mantém o tamanho do texto, para as posições baterem). */
function dobrar(c: string): string {
  return c.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()[0] ?? c;
}

/** Posições [início, fim) de cada vez que o termo aparece no texto. */
export function encontrar(texto: string, termo: string): [number, number][] {
  const t = [...termo.trim()].map(dobrar).join('');
  if (!t) return [];
  const chars = [...texto];
  // posição em unidades de JS (UTF-16) de cada caractere
  const pos: number[] = [];
  let p = 0;
  for (const c of chars) { pos.push(p); p += c.length; }
  pos.push(p);
  const d = chars.map(dobrar).join('');
  const dChars = [...d];
  const out: [number, number][] = [];
  const tLen = [...t].length;
  for (let i = 0; i + tLen <= dChars.length; i++) {
    if (dChars.slice(i, i + tLen).join('') === t) {
      out.push([pos[i], pos[i + tLen]]);
      i += tLen - 1;
    }
  }
  return out;
}
