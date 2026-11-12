// Resultado de uma checagem: erros barram o PR, avisos só aparecem no log.
export function resultado() {
  const r = { erros: [], avisos: [] };
  r.erro = (onde, msg) => r.erros.push({ onde, msg });
  r.aviso = (onde, msg) => r.avisos.push({ onde, msg });
  r.juntar = (outro) => {
    r.erros.push(...outro.erros);
    r.avisos.push(...outro.avisos);
    return r;
  };
  return r;
}
