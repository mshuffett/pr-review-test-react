export default function Header() {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 0",
        borderBottom: "1px solid #e0e0e0",
      }}
    >
      <h1 style={{ margin: 0, fontSize: 24 }}>TestApp</h1>
      <nav>
        <a href="/" style={{ marginRight: 16 }}>
          Home
        </a>
        <a href="/about">About</a>
      </nav>
    </header>
  );
}
