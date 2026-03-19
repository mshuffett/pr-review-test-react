import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, describe, it, expect, vi, beforeEach } from "vitest";
import ContactForm from "../ContactForm";

// Mock the submitContact API
vi.mock("../../api/contact", () => ({
  submitContact: vi.fn(),
}));

import { submitContact } from "../../api/contact";

const mockSubmitContact = vi.mocked(submitContact);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("ContactForm", () => {
  beforeEach(() => {
    mockSubmitContact.mockResolvedValue({ success: true, id: "123" });
  });

  it("renders all form fields and submit button", () => {
    render(<ContactForm />);
    expect(screen.getByLabelText("Name")).toBeDefined();
    expect(screen.getByLabelText("Email")).toBeDefined();
    expect(screen.getByLabelText("Message")).toBeDefined();
    expect(screen.getByRole("button", { name: "Send" })).toBeDefined();
  });

  it("renders the form heading", () => {
    render(<ContactForm />);
    expect(screen.getByText("Contact Us")).toBeDefined();
  });

  // Validation tests
  describe("validation", () => {
    it("shows error when name is empty", async () => {
      render(<ContactForm />);
      fireEvent.click(screen.getByRole("button", { name: "Send" }));
      await waitFor(() => {
        expect(screen.getByText("Name is required")).toBeDefined();
      });
      expect(mockSubmitContact).not.toHaveBeenCalled();
    });

    it("shows error when email is empty", async () => {
      render(<ContactForm />);
      fireEvent.change(screen.getByLabelText("Name"), { target: { value: "John" } });
      fireEvent.click(screen.getByRole("button", { name: "Send" }));
      await waitFor(() => {
        expect(screen.getByText("Email is required")).toBeDefined();
      });
      expect(mockSubmitContact).not.toHaveBeenCalled();
    });

    it("shows error for invalid email format", async () => {
      render(<ContactForm />);
      fireEvent.change(screen.getByLabelText("Name"), { target: { value: "John" } });
      fireEvent.change(screen.getByLabelText("Email"), { target: { value: "not-an-email" } });
      fireEvent.change(screen.getByLabelText("Message"), { target: { value: "Hello" } });
      // Use fireEvent.submit to bypass native type=email validation in jsdom
      fireEvent.submit(screen.getByRole("form", { name: "Contact form" }));
      await waitFor(() => {
        expect(screen.getByText("Please enter a valid email address")).toBeDefined();
      });
      expect(mockSubmitContact).not.toHaveBeenCalled();
    });

    it("shows error when message is empty", async () => {
      render(<ContactForm />);
      fireEvent.change(screen.getByLabelText("Name"), { target: { value: "John" } });
      fireEvent.change(screen.getByLabelText("Email"), { target: { value: "john@example.com" } });
      fireEvent.click(screen.getByRole("button", { name: "Send" }));
      await waitFor(() => {
        expect(screen.getByText("Message is required")).toBeDefined();
      });
      expect(mockSubmitContact).not.toHaveBeenCalled();
    });

    it("shows multiple errors when all fields are empty", async () => {
      render(<ContactForm />);
      fireEvent.click(screen.getByRole("button", { name: "Send" }));
      await waitFor(() => {
        expect(screen.getByText("Name is required")).toBeDefined();
        expect(screen.getByText("Email is required")).toBeDefined();
        expect(screen.getByText("Message is required")).toBeDefined();
      });
    });
  });

  // Successful submission
  describe("successful submission", () => {
    it("submits form with valid data and shows success", async () => {
      render(<ContactForm />);
      fireEvent.change(screen.getByLabelText("Name"), { target: { value: "John Doe" } });
      fireEvent.change(screen.getByLabelText("Email"), { target: { value: "john@example.com" } });
      fireEvent.change(screen.getByLabelText("Message"), { target: { value: "Hello there" } });
      fireEvent.click(screen.getByRole("button", { name: "Send" }));

      await waitFor(() => {
        expect(screen.getByText("Thanks for reaching out!")).toBeDefined();
      });

      expect(mockSubmitContact).toHaveBeenCalledWith({
        name: "John Doe",
        email: "john@example.com",
        message: "Hello there",
      });
    });

    it("displays submitted message as text (not HTML)", async () => {
      render(<ContactForm />);
      fireEvent.change(screen.getByLabelText("Name"), { target: { value: "John" } });
      fireEvent.change(screen.getByLabelText("Email"), { target: { value: "john@example.com" } });
      fireEvent.change(screen.getByLabelText("Message"), { target: { value: "<script>alert('xss')</script>" } });
      fireEvent.click(screen.getByRole("button", { name: "Send" }));

      await waitFor(() => {
        expect(screen.getByText("Thanks for reaching out!")).toBeDefined();
      });

      // The script tag should appear as text, not be executed
      const msgEl = screen.getByTestId("submitted-message");
      expect(msgEl.textContent).toContain("<script>");
      expect(msgEl.innerHTML).not.toContain("<script>");
    });
  });

  // Error handling
  describe("error handling", () => {
    it("shows error message when API call fails", async () => {
      mockSubmitContact.mockRejectedValue(new Error("Network error"));
      render(<ContactForm />);
      fireEvent.change(screen.getByLabelText("Name"), { target: { value: "John" } });
      fireEvent.change(screen.getByLabelText("Email"), { target: { value: "john@example.com" } });
      fireEvent.change(screen.getByLabelText("Message"), { target: { value: "Hello" } });
      fireEvent.click(screen.getByRole("button", { name: "Send" }));

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeDefined();
        expect(screen.getByText("Network error")).toBeDefined();
      });
    });

    it("shows generic error message for non-Error rejections", async () => {
      mockSubmitContact.mockRejectedValue("unknown");
      render(<ContactForm />);
      fireEvent.change(screen.getByLabelText("Name"), { target: { value: "John" } });
      fireEvent.change(screen.getByLabelText("Email"), { target: { value: "john@example.com" } });
      fireEvent.change(screen.getByLabelText("Message"), { target: { value: "Hello" } });
      fireEvent.click(screen.getByRole("button", { name: "Send" }));

      await waitFor(() => {
        expect(screen.getByText("Failed to send message. Please try again.")).toBeDefined();
      });
    });
  });

  // Accessibility
  describe("accessibility", () => {
    it("has form with aria-label", () => {
      render(<ContactForm />);
      expect(screen.getByRole("form", { name: "Contact form" })).toBeDefined();
    });

    it("has labels associated with inputs via htmlFor", () => {
      render(<ContactForm />);
      const nameInput = screen.getByLabelText("Name");
      expect(nameInput.getAttribute("id")).toBe("contact-name");

      const emailInput = screen.getByLabelText("Email");
      expect(emailInput.getAttribute("id")).toBe("contact-email");

      const messageInput = screen.getByLabelText("Message");
      expect(messageInput.getAttribute("id")).toBe("contact-message");
    });

    it("uses email input type", () => {
      render(<ContactForm />);
      const emailInput = screen.getByLabelText("Email");
      expect(emailInput.getAttribute("type")).toBe("email");
    });

    it("marks required fields with aria-required", () => {
      render(<ContactForm />);
      expect(screen.getByLabelText("Name").getAttribute("aria-required")).toBe("true");
      expect(screen.getByLabelText("Email").getAttribute("aria-required")).toBe("true");
      expect(screen.getByLabelText("Message").getAttribute("aria-required")).toBe("true");
    });

    it("shows validation errors in role=alert elements", async () => {
      render(<ContactForm />);
      fireEvent.click(screen.getByRole("button", { name: "Send" }));
      await waitFor(() => {
        const alerts = screen.getAllByRole("alert");
        expect(alerts.length).toBeGreaterThanOrEqual(3);
      });
    });
  });

  // Submitting state
  describe("submitting state", () => {
    it("disables button and shows sending text while submitting", async () => {
      let resolveSubmit!: (value: { success: boolean }) => void;
      mockSubmitContact.mockImplementation(() => new Promise((r) => { resolveSubmit = r; }));

      render(<ContactForm />);
      fireEvent.change(screen.getByLabelText("Name"), { target: { value: "John" } });
      fireEvent.change(screen.getByLabelText("Email"), { target: { value: "john@example.com" } });
      fireEvent.change(screen.getByLabelText("Message"), { target: { value: "Hello" } });
      fireEvent.click(screen.getByRole("button", { name: "Send" }));

      await waitFor(() => {
        const button = screen.getByRole("button", { name: "Sending..." });
        expect(button).toBeDefined();
        expect(button.hasAttribute("disabled")).toBe(true);
      });

      resolveSubmit({ success: true });
    });
  });
});
