import { Resend } from "resend";
import { SITE_URL } from "@/lib/site";

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

const PHONE = "+1-646-234-4474";
const TEL = "+16462344474";
const MARK = `${SITE_URL}/apex-mark.png`;

function ref(id: string): string {
  return id.slice(-6).toUpperCase();
}

function fmtDate(s: string): string {
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Dark branded header with the mountain mark + wordmark. */
function header(): string {
  return `
    <tr><td style="background-color:#0a0e17;background:linear-gradient(180deg,#0d1424 0%,#070a12 100%);padding:30px 32px 22px 32px;text-align:center;">
      <img src="${MARK}" alt="Apex Rentals" width="90" height="50" style="display:inline-block;width:90px;height:50px;border:0;" />
      <div style="margin-top:12px;font-family:Arial,Helvetica,sans-serif;line-height:1;">
        <span style="color:#ffffff;font-size:23px;font-weight:800;letter-spacing:2px;">APEX</span>
        <span style="color:#6f9bff;font-size:23px;font-weight:600;letter-spacing:6px;padding-left:6px;">RENTALS</span>
      </div>
      <div style="margin-top:9px;font-family:Arial,Helvetica,sans-serif;color:#7b8598;font-size:11px;letter-spacing:3px;">CAR RENTAL &middot; NEW YORK CITY</div>
    </td></tr>
    <tr><td style="height:4px;line-height:4px;font-size:0;background-color:#2f6bff;background:linear-gradient(90deg,#2f6bff 0%,#6f9bff 100%);">&nbsp;</td></tr>`;
}

/** Dark footer. */
function footer(): string {
  return `
    <tr><td style="background:#0a0e17;padding:24px 32px;font-family:Arial,Helvetica,sans-serif;text-align:center;">
      <div style="color:#ffffff;font-size:15px;font-weight:700;letter-spacing:1px;">APEX RENTALS</div>
      <div style="margin-top:7px;color:#6d778c;font-size:12px;line-height:1.8;">
        Car rental in New York City &middot; Serving NY &middot; NJ &middot; CT &middot; PA<br/>
        <a href="tel:${TEL}" style="color:#9fb4e6;text-decoration:none;">${PHONE}</a>
        &nbsp;&middot;&nbsp;
        <a href="${SITE_URL}" style="color:#9fb4e6;text-decoration:none;">apexrentalfleet.com</a>
      </div>
    </td></tr>`;
}

/** One label/value line inside the summary card. */
function line(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:9px 0;color:#8b95a8;font-size:13px;font-family:Arial,Helvetica,sans-serif;">${label}</td>
      <td style="padding:9px 0;color:#1a2230;font-size:15px;font-weight:600;text-align:right;font-family:Arial,Helvetica,sans-serif;">${value}</td>
    </tr>`;
}

/** A numbered step for the "what happens next" block. */
function step(n: number, title: string, body: string): string {
  return `
    <tr><td style="padding:9px 0;font-family:Arial,Helvetica,sans-serif;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr>
        <td width="40" valign="top">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td width="28" height="28" align="center" valign="middle" style="background:#eaf0ff;border-radius:14px;color:#2f6bff;font-size:13px;font-weight:800;">${n}</td>
          </tr></table>
        </td>
        <td valign="top" style="padding-left:4px;">
          <div style="color:#1a2230;font-size:14px;font-weight:700;">${title}</div>
          <div style="color:#7c869a;font-size:13px;line-height:1.5;margin-top:2px;">${body}</div>
        </td>
      </tr></table>
    </td></tr>`;
}

/** Full branded confirmation email for the CLIENT. */
function clientEmailHtml(data: BookingEmailData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Apex Rentals</title></head>
<body style="margin:0;padding:0;background:#eceff5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eceff5;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e7f0;">

        ${header()}

        <!-- intro -->
        <tr><td style="padding:32px 32px 0 32px;font-family:Arial,Helvetica,sans-serif;text-align:center;">
          <div style="display:inline-block;background:#eaf0ff;color:#2f6bff;font-size:11px;font-weight:700;letter-spacing:1.5px;padding:7px 14px;border-radius:20px;">REQUEST RECEIVED</div>
          <h1 style="margin:18px 0 8px 0;color:#141a24;font-size:25px;font-weight:800;">Thank you, ${data.fullName}!</h1>
          <p style="margin:0 auto;max-width:420px;color:#5b6478;font-size:15px;line-height:1.6;">
            We&rsquo;ve got your booking request. Our team will reach out shortly to confirm availability and finalize the details.
          </p>
          <p style="margin:16px 0 0 0;color:#9aa4b6;font-size:12px;letter-spacing:1px;">BOOKING REFERENCE &nbsp;<b style="color:#2f6bff;">#${ref(
            data.id
          )}</b></p>
        </td></tr>

        <!-- summary card -->
        <tr><td style="padding:24px 32px 0 32px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="background:#f7f9fc;border:1px solid #e7ebf3;border-left:4px solid #2f6bff;border-radius:12px;padding:20px 22px;">
              <div style="font-family:Arial,Helvetica,sans-serif;color:#9aa4b6;font-size:11px;letter-spacing:1.5px;">YOUR VEHICLE</div>
              <div style="font-family:Arial,Helvetica,sans-serif;color:#141a24;font-size:20px;font-weight:800;margin:3px 0 12px 0;">${
                data.car
              }</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e7ebf3;">
                ${line("Pick-up", fmtDate(data.startDate))}
                ${line("Return", fmtDate(data.endDate))}
                ${line("Duration", `${data.days} day${data.days > 1 ? "s" : ""}`)}
              </table>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:2px solid #e7ebf3;margin-top:4px;">
                <tr>
                  <td style="padding:14px 0 2px 0;color:#5b6478;font-size:14px;font-weight:700;font-family:Arial,Helvetica,sans-serif;">Estimated total</td>
                  <td style="padding:14px 0 2px 0;color:#2f6bff;font-size:24px;font-weight:800;text-align:right;font-family:Arial,Helvetica,sans-serif;">$${data.totalPrice.toFixed(
                    2
                  )}</td>
                </tr>
              </table>
              <div style="font-family:Arial,Helvetica,sans-serif;color:#9aa4b6;font-size:11px;line-height:1.5;margin-top:4px;">
                Estimate for the selected dates &middot; excludes taxes &amp; fees, calculated at pick-up
              </div>
            </td></tr>
          </table>
        </td></tr>

        ${
          data.message
            ? `<tr><td style="padding:16px 32px 0 32px;font-family:Arial,Helvetica,sans-serif;">
                 <div style="background:#fbfaf5;border:1px solid #efe9d8;border-radius:10px;padding:14px 16px;color:#6b6450;font-size:14px;line-height:1.6;">
                   <span style="color:#b09b63;font-size:11px;letter-spacing:1px;">YOUR NOTE</span><br/>${data.message}
                 </div>
               </td></tr>`
            : ""
        }

        <!-- what happens next -->
        <tr><td style="padding:28px 32px 0 32px;font-family:Arial,Helvetica,sans-serif;">
          <div style="color:#141a24;font-size:15px;font-weight:800;letter-spacing:0.3px;">What happens next</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:6px;">
            ${step(1, "We check availability", "Our team confirms the vehicle is free for your dates.")}
            ${step(2, "We call to confirm", "A quick call or email to finalize pick-up details and pricing.")}
            ${step(3, "Pick up & drive", "Bring your license — we hand you the keys and you&rsquo;re off.")}
          </table>
        </td></tr>

        <!-- CTA -->
        <tr><td style="padding:26px 32px 32px 32px;font-family:Arial,Helvetica,sans-serif;text-align:center;">
          <table role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <td style="border-radius:9px;background:#2f6bff;">
              <a href="tel:${TEL}" style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;border-radius:9px;">Call us&nbsp; ${PHONE}</a>
            </td>
            <td width="12">&nbsp;</td>
            <td style="border-radius:9px;border:1px solid #d4dae6;">
              <a href="${SITE_URL}" style="display:inline-block;padding:13px 24px;color:#2f4064;font-size:15px;font-weight:700;text-decoration:none;border-radius:9px;">Visit website</a>
            </td>
          </tr></table>
          <p style="margin:16px 0 0 0;color:#9aa4b6;font-size:13px;">Questions? Just reply to this email — we&rsquo;re happy to help.</p>
        </td></tr>

        ${footer()}

      </table>
      <p style="margin:16px 0 0 0;color:#9aa4b6;font-size:11px;font-family:Arial,Helvetica,sans-serif;">You received this email because a booking request was submitted at apexrentalfleet.com.</p>
    </td></tr>
  </table>
</body>
</html>`;
}

/** Compact branded notification for the OWNER. */
function ownerEmailHtml(data: BookingEmailData): string {
  const row = (label: string, value: string, strong = false) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #eef1f6;color:#8b95a8;font-size:13px;">${label}</td>
      <td style="padding:10px 0;border-bottom:1px solid #eef1f6;color:#141a24;font-size:15px;text-align:right;${
        strong ? "font-weight:700;" : ""
      }">${value}</td>
    </tr>`;
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#eceff5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eceff5;padding:24px 12px;"><tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e7f0;font-family:Arial,Helvetica,sans-serif;">
      ${header()}
      <tr><td style="padding:26px 32px 6px 32px;">
        <div style="color:#141a24;font-size:19px;font-weight:800;">New booking request <span style="color:#2f6bff;">#${ref(
          data.id
        )}</span></div>
        <div style="color:#8b95a8;font-size:13px;margin-top:2px;">Submitted via apexrentalfleet.com</div>
      </td></tr>
      <tr><td style="padding:14px 32px 26px 32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          ${row("Vehicle", data.car, true)}
          ${row("Pick-up", fmtDate(data.startDate))}
          ${row("Return", fmtDate(data.endDate))}
          ${row("Duration", `${data.days} day${data.days > 1 ? "s" : ""}`)}
          ${row("Estimated total", `$${data.totalPrice.toFixed(2)}`, true)}
          ${row("Name", data.fullName)}
          ${row(
            "Phone",
            `<a href="tel:${data.phone.replace(/[^+\d]/g, "")}" style="color:#2f6bff;text-decoration:none;">${data.phone}</a>`
          )}
          ${row(
            "Email",
            `<a href="mailto:${data.email}" style="color:#2f6bff;text-decoration:none;">${data.email}</a>`
          )}
          ${data.message ? row("Message", data.message) : ""}
        </table>
      </td></tr>
      ${footer()}
    </table>
  </td></tr></table>
</body></html>`;
}

export async function sendBookingNotifications(data: BookingEmailData) {
  const resend = getResend();
  if (!resend) {
    console.log("[email] RESEND_API_KEY not set — skipping emails");
    return;
  }
  const from = process.env.FROM_EMAIL || "Apex Rentals <onboarding@resend.dev>";
  const notifyEmail = process.env.NOTIFY_EMAIL;

  const jobs: Promise<unknown>[] = [];

  if (notifyEmail) {
    jobs.push(
      resend.emails.send({
        from,
        to: notifyEmail,
        replyTo: data.email,
        subject: `New booking — ${data.car} · ${fmtDate(data.startDate)} (#${ref(data.id)})`,
        html: ownerEmailHtml(data),
      })
    );
  }

  jobs.push(
    resend.emails.send({
      from,
      to: data.email,
      subject: `Apex Rentals — booking request received (#${ref(data.id)})`,
      html: clientEmailHtml(data),
    })
  );

  const results = await Promise.allSettled(jobs);
  for (const r of results) {
    if (r.status === "rejected") console.error("[email] send failed:", r.reason);
  }
}
