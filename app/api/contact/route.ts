import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (!body) {
      return new Response(
        JSON.stringify({ error: "Invalid request body." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { name, email, message } = body as {
      name?: string;
      email?: string;
      message?: string;
    };

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({
          error: "Please provide your name, email address and a message.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const trimmedEmail = email.trim();
    const trimmedName = name.trim();
    const trimmedMessage = message.trim();

    if (!trimmedEmail || !trimmedName || !trimmedMessage) {
      return new Response(
        JSON.stringify({
          error: "Name, email and message cannot be empty.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return new Response(
        JSON.stringify({ error: "Please enter a valid email address." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const {
      SMTP_HOST,
      SMTP_PORT,
      SMTP_USER,
      SMTP_PASS,
      CONTACT_TO,
      CONTACT_FROM,
    } = process.env;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !CONTACT_TO) {
      console.error("Missing SMTP/CONTACT env vars");
      return new Response(
        JSON.stringify({
          error:
            "Email service is not configured correctly. Please try again later.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const port = parseInt(SMTP_PORT, 10) || 587;

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465, // true for 465, false for 587
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    const subject = `New ResolveForge contact message from ${trimmedName}`;

    const textBody = `
New contact form message from ResolveForge:

Name: ${trimmedName}
Email: ${trimmedEmail}

Message:
${trimmedMessage}
`.trim();

    const htmlBody = `
      <p><strong>New contact form message from ResolveForge:</strong></p>
      <p><strong>Name:</strong> ${trimmedName}</p>
      <p><strong>Email:</strong> ${trimmedEmail}</p>
      <p><strong>Message:</strong></p>
      <p style="white-space:pre-wrap">${trimmedMessage}</p>
    `;

    await transporter.sendMail({
      from: CONTACT_FROM || SMTP_USER,
      to: CONTACT_TO,
      replyTo: `"${trimmedName}" <${trimmedEmail}>`,
      subject,
      text: textBody,
      html: htmlBody,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Thanks for getting in touch. We’ll reply as soon as we can.",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Contact form API error:", err);
    return new Response(
      JSON.stringify({
        error: "Something went wrong sending your message. Please try again.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
