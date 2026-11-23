// Montagem do cadastro da página /parcerias/ (WEB-74) para o mtc.lead() do MetricaaS da StratAI. Função pura, roda
// no navegador (components/parcerias/Formulario.astro) e nos testes (test/parcerias.test.js).

// Campos de múltipla escolha e de texto que vão em `campos` do mtc.lead(), com a chave que o MetricaaS grava.
// Chave que o workspace não tem é descartada sem erro; as chaves precisam existir em Configurações → Campos
// personalizados do agencia-strat (criadas em 13/11/2026, com rótulo "Parceria: …").
export const CAMPOS = ['atuacao', 'contatos', 'segmentos', 'tem_indicacao', 'experiencia', 'inicio', 'detalhes'];

/** Telefone para o MetricaaS: só dígitos, com 55 na frente quando vier com DDD (10 ou 11 dígitos). */
export function telefoneParaLead(valor) {
  const d = String(valor || '').replace(/\D/g, '');
  return d.length >= 10 && d.length <= 11 ? `55${d}` : d;
}

/**
 * Monta o que vai para mtc.lead() a partir das respostas do formulário (objeto chave → string ou lista de strings).
 * `tipo_cadastro: parceria` separa o cadastro de parceiro do lead de cliente no mesmo workspace.
 */
export function montarLead(respostas) {
  const texto = (v) => (Array.isArray(v) ? v.join(', ') : String(v ?? '')).trim();
  const campos = { tipo_cadastro: 'parceria' };
  const perfil = texto(respostas.perfil);
  if (perfil) campos.instagram_ou_linkedin = perfil;
  for (const k of CAMPOS) {
    const v = texto(respostas[k]);
    if (v) campos[k] = v.slice(0, 500);
  }
  return {
    nome: texto(respostas.nome),
    telefone: telefoneParaLead(respostas.whatsapp),
    email: texto(respostas.email).toLowerCase(),
    campos,
    // Parceiro não é cliente: o cadastro não vira Lead na Meta (nem CAPI nem pixel), para não ensinar os anúncios da
    // StratAI a trazer parceiro (decisão do Helbert de 13/11; opção meta:false do MetricaaS, PR 697, tag v11). O lead
    // cai no funil Parceiros pelo fluxo do agencia-strat ("lead criado" + tipo_cadastro = parceria), sem evento.
    meta: false,
  };
}
