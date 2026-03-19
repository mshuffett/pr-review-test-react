import { useState } from "react";
import { submitContact } from "../api/contact";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [responseMsg, setResponseMsg] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!name.trim()) errs.name = "Name is required";
    if (!email.trim()) {
      errs.email = "Email is required";
    } else if (!isValidEmail(email)) {
      errs.email = "Please enter a valid email address";
    }
    if (!message.trim()) errs.message = "Message is required";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    try {
      await submitContact({ name, email, message });
      setSubmitted(true);
      setResponseMsg(message);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to send message. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ marginTop: 24 }} role="status">
        <h3>Thanks for reaching out!</h3>
        <p>Your message:</p>
        {/* Fixed: render as text content to prevent script injection */}
        <div data-testid="submitted-message">{responseMsg}</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 24 }} aria-label="Contact form">
      <h2>Contact Us</h2>

      {submitError && (
        <div role="alert" style={{ color: "#dc2626", marginBottom: 12, padding: 8, border: "1px solid #dc2626", borderRadius: 4 }}>
          {submitError}
        </div>
      )}

      <div style={{ marginBottom: 12 }}>
        <label htmlFor="contact-name" style={{ display: "block", marginBottom: 4 }}>Name</label>
        <input
          id="contact-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-required="true"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
          style={{ width: "100%", padding: 8 }}
        />
        {errors.name && <span id="name-error" role="alert" style={{ color: "#dc2626", fontSize: 14 }}>{errors.name}</span>}
      </div>

      <div style={{ marginBottom: 12 }}>
        <label htmlFor="contact-email" style={{ display: "block", marginBottom: 4 }}>Email</label>
        <input
          id="contact-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-required="true"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          style={{ width: "100%", padding: 8 }}
        />
        {errors.email && <span id="email-error" role="alert" style={{ color: "#dc2626", fontSize: 14 }}>{errors.email}</span>}
      </div>

      <div style={{ marginBottom: 12 }}>
        <label htmlFor="contact-message" style={{ display: "block", marginBottom: 4 }}>Message</label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          aria-required="true"
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "message-error" : undefined}
          style={{ width: "100%", padding: 8 }}
        />
        {errors.message && <span id="message-error" role="alert" style={{ color: "#dc2626", fontSize: 14 }}>{errors.message}</span>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          padding: "10px 24px",
          background: isSubmitting ? "#9ca3af" : "#4f46e5",
          color: "white",
          border: "none",
          borderRadius: 4,
          cursor: isSubmitting ? "not-allowed" : "pointer",
        }}
      >
        {isSubmitting ? "Sending..." : "Send"}
      </button>
    </form>
  );
}
