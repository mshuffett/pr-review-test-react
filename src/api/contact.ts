export interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  id?: string;
}

export async function submitContact(
  payload: ContactPayload,
): Promise<ContactResponse> {
  // BUG: logs sensitive user data to console
  console.log("Submitting contact form:", JSON.stringify(payload));

  // BUG: no rate limiting — caller can spam endpoint
  const res = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // BUG: no input sanitization before sending
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  return data as ContactResponse;
}
