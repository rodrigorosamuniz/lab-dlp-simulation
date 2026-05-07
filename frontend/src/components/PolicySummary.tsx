const policies = [
  ["Dados publicos", "Publico sem evidencia sensivel", "allow"],
  ["Conteudo interno para externo", "Interno enviado para destino externo", "warn"],
  ["Confidencial para destino aprovado", "Confidencial para fornecedor aprovado", "quarantine"],
  ["Confidencial para destino pessoal", "Confidencial para email pessoal, drive pessoal ou IA publica", "block"],
  ["Dados restritos", "CPF em volume, cartao, credencial, token, chave ou dump", "block"],
  ["Rotulo inconsistente", "Declarado Publico com conteudo sensivel detectado", "warn/block"]
];

export default function PolicySummary() {
  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Politicas fixas</h2>
      </div>
      <ul className="policy-list">
        {policies.map(([name, condition, action]) => (
          <li key={name}>
            <strong>{name}</strong>
            <span>{condition}</span>
            <code>{action}</code>
          </li>
        ))}
      </ul>
    </section>
  );
}
