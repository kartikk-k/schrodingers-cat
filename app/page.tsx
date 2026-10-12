const card: React.CSSProperties = {
  background: "#141419",
  border: "1px solid #26262e",
  borderRadius: 12,
  padding: "16px 18px",
  marginBottom: 12,
};
const code: React.CSSProperties = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontSize: 13,
  color: "#b7b7c2",
};

export default function Home() {
  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "56px 20px" }}>
      <h1 style={{ fontSize: 30, marginBottom: 6 }}>🐈 Schrödinger&apos;s Cat</h1>
      <p style={{ color: "#9a9aa6", marginTop: 0 }}>
        An internal AI gateway. One endpoint, many model providers — routed by policy,
        metered per API key.
      </p>

      <div style={card}>
        <strong>POST</strong> <span style={code}>/api/v1/chat/completions</span>
        <p style={{ color: "#9a9aa6", margin: "8px 0 0" }}>
          OpenAI-compatible chat. Send <span style={code}>model</span>,{" "}
          <span style={code}>messages</span>, and an optional{" "}
          <span style={code}>provider</span> override.
        </p>
      </div>

      <div style={card}>
        <strong>GET</strong> <span style={code}>/api/v1/usage?api_key_id=…</span>
        <p style={{ color: "#9a9aa6", margin: "8px 0 0" }}>
          Token + cost usage for a key.
        </p>
      </div>

      <div style={card}>
        <strong>GET</strong> <span style={code}>/api/v1/keys/&#123;id&#125;</span>
        <p style={{ color: "#9a9aa6", margin: "8px 0 0" }}>Inspect an API key.</p>
      </div>

      <p style={{ color: "#6b6b76", fontSize: 12, marginTop: 28 }}>
        Internal build. Not for production use.
      </p>
    </main>
  );
}
