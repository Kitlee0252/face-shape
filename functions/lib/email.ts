interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(
  apiKey: string,
  { to, subject, html }: SendEmailParams
): Promise<boolean> {
  try {
    if (!apiKey) {
      console.error("[Email] RESEND_API_KEY not configured");
      return false;
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Face Shape AI <noreply@faceshapeai.org>",
        to,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[Email] Resend API error:`, res.status, errorText);
      return false;
    }

    console.log(`[Email] Sent "${subject}" to ${to}`);
    return true;
  } catch (err) {
    console.error("[Email] Send failed:", err);
    return false;
  }
}
