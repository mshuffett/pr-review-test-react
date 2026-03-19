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
  const res = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Contact submission failed (${res.status})`);
  }

  const data = await res.json();
  return data as ContactResponse;
}
