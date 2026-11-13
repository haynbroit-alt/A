// Tableau de synthèse : moyenne et IC95 par méthode, puis par archétype.
const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
const ci = (a) => { if (a.length < 2) return 0; const m = mean(a); return 1.96 * Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1) / a.length); };
const med = (a) => { const s = [...a].sort((x, y) => x - y), k = s.length >> 1; return s.length % 2 ? s[k] : (s[k - 1] + s[k]) / 2; };
const fmt = (a, f = (x) => x.toFixed(3)) => (a.length ? `${f(mean(a))} ± ${f(ci(a))}` : '—');
const pct = (x) => `${(100 * x).toFixed(1)} %`;

function line(name, rows) {
  const v = (k) => rows.map((r) => r[k]).filter((x) => x != null && Number.isFinite(x));
  const plac = rows.filter((r) => r.placebo), hid = rows.filter((r) => !r.placebo);
  const found = rows.reduce((s, r) => s + r.hiddenFound, 0), above = rows.reduce((s, r) => s + r.hiddenAbove, 0);
  const S = v('S'), P = v('P');
  return `| ${name} | ${rows.length} | ${fmt(v('F'))} | ${fmt(v('Fmacro'))} | ${fmt(v('L'))} | ${fmt(v('G'))} | ${S.length ? pct(med(S)) : '—'} | ${P.length ? pct(med(P)) : '—'} | ${above ? `${found}/${above}` : '—'} | ${plac.length ? `${plac.filter((r) => r.FD > 0).length}/${plac.length}` : '—'} | ${hid.length ? mean(hid.map((r) => r.FD)).toFixed(2) : '—'} | ${Math.round(mean(rows.map((r) => r.ms)))} |`;
}

export function report(rows) {
  const head = '| | n | F | F équilibré (sans seuil) | L | G | S médian | P médian | R (trouvés / au-dessus du seuil) | FD1 placebos touchés | FD2 / entreprise à flux cachés | ms |\n|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|';
  const out = [];
  for (const m of [...new Set(rows.map((r) => r.method))]) {
    const R = rows.filter((r) => r.method === m);
    out.push(`### ${m}\n\n${head}\n${line('tout', R)}`);
    for (const a of [...new Set(R.map((r) => r.archetype))]) out.push(line(a, R.filter((r) => r.archetype === a)));
    for (const l of [...new Set(R.map((r) => r.level))]) out.push(line(`désordre ${l}`, R.filter((r) => r.level === l)));
    out.push('');
  }
  // comparaison appariée par graine avec le plan naïf (critères M0-F et M0-L)
  const methods = [...new Set(rows.map((r) => r.method))];
  if (methods.includes('naive')) {
    const base = new Map(rows.filter((r) => r.method === 'naive').map((r) => [r.seed, r]));
    for (const m of methods.filter((x) => x !== 'naive' && x !== 'parfait')) {
      const R = rows.filter((r) => r.method === m && base.has(r.seed));
      const d = (k) => R.map((r) => r[k] - base.get(r.seed)[k]);
      out.push(`Comparaison appariée ${m} − naïf (${R.length} graines) : F équilibré ${fmt(d('Fmacro'))} · L ${fmt(d('L'))} · G ${fmt(d('G'))}\n`);
    }
  }
  return out.join('\n');
}
