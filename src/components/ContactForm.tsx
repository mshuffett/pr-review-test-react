import { useState } from "react";
import { submitContact } from "../api/contact";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [responseMsg, setResponseMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // BUG: no validation — empty name, empty email, anything goes
    // BUG: no error handling on the fetch call
    submitContact({ name, email, message }).then(() => {
      setSubmitted(true);
      setResponseMsg(message);
    });
  };

  if (submitted) {
    return (
      <div style={{ marginTop: 24 }}>
        <h3>Thanks for reaching out!</h3>
        {/* BUG: XSS — rendering user-controlled HTML via dangerouslySetInnerHTML */}
        <p>Your message:</p>
        <div dangerouslySetInnerHTML={{ __html: responseMsg }} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
      <h2>Contact Us</h2>

      {/* BUG: missing aria-label / htmlFor association */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 4 }}>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: "100%", padding: 8 }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 4 }}>Email</label>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: 8 }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 4 }}>Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          style={{ width: "100%", padding: 8 }}
        />
      </div>

      <button
        type="submit"
        style={{
          padding: "10px 24px",
          background: "#4f46e5",
          color: "white",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
        }}
      >
        Send
      </button>
    </form>
  );
}
