export const metadata = {
  title: "Schrödinger's Cat — AI Gateway",
  description: "An internal LLM router / AI gateway.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
          background: "#0b0b0e",
          color: "#e7e7ea",
        }}
      >
        {children}
      </body>
    </html>
  );
}
