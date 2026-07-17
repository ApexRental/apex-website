import { Resend } from "resend";

type BookingEmailData = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  car: string;
  startDate: string;
  endDate: string;
  days: number;
  totalPrice: number;
  message?: string | null;
};

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function sendBookingNotifications(data: BookingEmailData) {
  const resend = getResend();
  if (!resend) {
    console.log("[email] RESEND_API_KEY not set — skipping emails");
    return;
  }
  const from = process.env.FROM_EMAIL || "Apex Rentals <onboarding@resend.dev>";
  const notifyEmail = process.env.NOTIFY_EMAIL;

  const summary = `
    <table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">
      <tr><td style="padding:4px 12px 4px 0;color:#666">Vehicle</td><td><b>${data.car}</b></td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#666">Dates</td><td>${data.startDate} → ${data.endDate} (${data.days} day${data.days > 1 ? "s" : ""})</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#666">Total</td><td><b>$${data.totalPrice.toFixed(2)}</b></td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#666">Name</td><td>${data.fullName}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#666">Phone</td><td>${data.phone}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#666">Email</td><td>${data.email}</td></tr>
      ${data.message ? `<tr><td style="padding:4px 12px 4px 0;color:#666">Message</td><td>${data.message}</td></tr>` : ""}
    </table>`;

  const jobs: Promise<unknown>[] = [];

  if (notifyEmail) {
    jobs.push(
      resend.emails.send({
        from,
        to: notifyEmail,
        subject: `New booking request — ${data.car} (${data.startDate})`,
        html: `<h2 style="font-family:Arial">New booking request #${data.id.slice(-6).toUpperCase()}</h2>${summary}`,
      })
    );
  }

  jobs.push(
    resend.emails.send({
      from,
      to: data.email,
      subject: "Apex Rentals — we received your booking request",
      html: `
        <div style="font-family:Arial,sans-serif">
          <h2>Thank you, ${data.fullName}!</h2>
          <p>We received your booking request and will contact you shortly to confirm.</p>
          ${summary}
          <p style="color:#666;font-size:13px">Apex Rentals · Drive Your Journey<br/>+1-646-234-4474</p>
        </div>`,
    })
  );

  const results = await Promise.allSettled(jobs);
  for (const r of results) {
    if (r.status === "rejected") console.error("[email] send failed:", r.reason);
  }
}
