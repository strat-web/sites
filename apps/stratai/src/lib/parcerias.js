// Dados da página /parcerias/ (WEB-74): os textos moram em src/data/parcerias.json. A montagem do cadastro que vai ao
// MetricaaS fica em parcerias-lead.js (vai para o navegador sem levar o JSON junto).
// Sem condições comerciais (percentual, dia de pagamento, prazo de resposta) no texto nem no repositório: elas ficam
// para a conversa de alinhamento (decisão do Helbert, 12/11/2026).
import dados from '../data/parcerias.json' with { type: 'json' };

export const programa = dados;
export const comissao = dados.comissao;
