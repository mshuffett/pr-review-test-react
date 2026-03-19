import Header from "./components/Header";

export default function App() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 16px" }}>
      <Header />
      <main>
        <h2>Welcome</h2>
        <p>This is a simple demo application for testing PR reviews.</p>
      </main>
    </div>
  );
}
