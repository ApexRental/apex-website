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

/** Booking details table — shared by both emails. */
function detailsTable(data: BookingEmailData): string {
  const row = (label: string, value: string, strong = false) => `
    <tr>
      <td style="padding:11px 0;border-bottom:1px solid #eef1f6;color:#6b7688;font-size:13px;">${label}</td>
      <td style="padding:11px 0;border-bottom:1px solid #eef1f6;color:#141a24;font-size:15px;text-align:right;${
        strong ? "font-weight:700;" : ""
      }">${value}</td>
    </tr>`;
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
      ${row("Vehicle", data.car, true)}
      ${row("Pick-up", fmtDate(data.startDate))}
      ${row("Return", fmtDate(data.endDate))}
      ${row("Duration", `${data.days} day${data.days > 1 ? "s" : ""}`)}
      ${row("Estimated total", `$${data.totalPrice.toFixed(2)}`, true)}
    </table>`;
}

/** Full branded confirmation email for the CLIENT. */
function clientEmailHtml(data: BookingEmailData): string {
  const hero = `${SITE_URL}/images/fleet/gv70-1.jpg`;
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Apex Rentals</title></head>
<body style="margin:0;padding:0;background:#eef1f6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f6;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e4e8f0;">

        <!-- brand bar -->
        <tr><td style="background:#0a0e17;padding:22px 32px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="font-family:Arial,Helvetica,sans-serif;">
              <span style="color:#ffffff;font-size:24px;font-weight:800;letter-spacing:1px;">APEX</span>
              <span style="color:#6f9bff;font-size:24px;font-weight:600;letter-spacing:6px;padding-left:8px;">RENTALS</span>
            </td>
            <td align="right" style="font-family:Arial,Helvetica,sans-serif;color:#8b95a8;font-size:12px;letter-spacing:2px;">NEW YORK CITY</td>
          </tr></table>
        </td></tr>

        <!-- hero photo -->
        <tr><td style="font-size:0;line-height:0;background:#0a0e17;">
          <img src="${hero}" alt="Apex Rentals" width="600" style="width:100%;max-width:600px;height:auto;display:block;border:0;" />
        </td></tr>

        <!-- body -->
        <tr><td style="padding:34px 32px 8px 32px;font-family:Arial,Helvetica,sans-serif;">
          <div style="display:inline-block;background:#eaf0ff;color:#2f6bff;font-size:12px;font-weight:700;letter-spacing:1px;padding:6px 12px;border-radius:20px;">REQUEST RECEIVED</div>
          <h1 style="margin:18px 0 6px 0;color:#141a24;font-size:24px;font-weight:800;">Thank you, ${data.fullName}!</h1>
          <p style="margin:0;color:#54607a;font-size:15px;line-height:1.6;">
            We&rsquo;ve received your booking request. Our team will call or email you shortly to confirm availability and finalize the details.
          </p>
          <p style="margin:14px 0 0 0;color:#8b95a8;font-size:13px;">Reference&nbsp;<b style="color:#141a24;">#${ref(
            data.id
          )}</b></p>
        </td></tr>

        <!-- details -->
        <tr><td style="padding:20px 32px 4px 32px;">
          ${detailsTable(data)}
        </td></tr>

        <!-- taxes note -->
        <tr><td style="padding:14px 32px 0 32px;font-family:Arial,Helvetica,sans-serif;">
          <p style="margin:0;color:#8b95a8;font-size:12px;line-height:1.6;">
            The total shown is an estimate for the selected dates and excludes taxes, fees, and any optional extras, which are calculated at pick-up.
          </p>
        </td></tr>

        ${
          data.message
            ? `<tr><td style="padding:16px 32px 0 32px;font-family:Arial,Helvetica,sans-serif;">
                 <div style="background:#f6f8fc;border-radius:10px;padding:14px 16px;color:#54607a;font-size:14px;line-height:1.6;">
                   <span style="color:#8b95a8;font-size:12px;">Your note:</span><br/>${data.message}
                 </div>
               </td></tr>`
            : ""
        }

        <!-- CTA -->
        <tr><td style="padding:26px 32px 30px 32px;font-family:Arial,Helvetica,sans-serif;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="border-radius:9px;background:#2f6bff;">
              <a href="tel:${TEL}" style="display:inline-block;padding:14px 30px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;border-radius:9px;">Call us &nbsp;${PHONE}</a>
            </td>
          </tr></table>
          <p style="margin:16px 0 0 0;color:#8b95a8;font-size:13px;">Questions? Just reply to this email or call the number above.</p>
        </td></tr>

        <!-- footer -->
        <tr><td style="background:#0a0e17;padding:22px 32px;font-family:Arial,Helvetica,sans-serif;">
          <p style="margin:0;color:#c7cfdd;font-size:14px;font-weight:700;">Apex Rentals</p>
          <p style="margin:4px 0 0 0;color:#6d778c;font-size:12px;line-height:1.7;">
            Car rental in New York City &middot; Serving NY &middot; NJ &middot; CT &middot; PA<br/>
            ${PHONE} &middot; <a href="${SITE_URL}" style="color:#6f9bff;text-decoration:none;">apexrentalfleet.com</a>
          </p>
        </td></tr>

      </table>
      <p style="margin:16px 0 0 0;color:#9aa4b6;font-size:11px;font-family:Arial,Helvetica,sans-serif;">You received this email because a booking request was submitted at apexrentalfleet.com.</p>
    </td></tr>
  </table>
</body>
</html>`;
}

/** Compact branded notification for the OWNER. */
function ownerEmailHtml(data: BookingEmailData): string {
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#eef1f6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f6;padding:24px 12px;"><tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e4e8f0;">
      <tr><td style="background:#0a0e17;padding:20px 32px;font-family:Arial,Helvetica,sans-serif;">
        <span style="color:#ffffff;font-size:18px;font-weight:800;">New booking request</span>
        <span style="color:#6f9bff;font-size:18px;font-weight:700;">&nbsp;#${ref(data.id)}</span>
      </td></tr>
      <tr><td style="padding:24px 32px 8px 32px;">${detailsTable(data)}</td></tr>
      <tr><td style="padding:8px 32px 24px 32px;font-family:Arial,Helvetica,sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          <tr><td style="padding:11px 0;border-bottom:1px solid #eef1f6;color:#6b7688;font-size:13px;">Name</td><td style="padding:11px 0;border-bottom:1px solid #eef1f6;color:#141a24;font-size:15px;text-align:right;">${
            data.fullName
          }</td></tr>
          <tr><td style="padding:11px 0;border-bottom:1px solid #eef1f6;color:#6b7688;font-size:13px;">Phone</td><td style="padding:11px 0;border-bottom:1px solid #eef1f6;text-align:right;font-size:15px;"><a href="tel:${data.phone.replace(
            /[^+\d]/g,
            ""
          )}" style="color:#2f6bff;text-decoration:none;">${data.phone}</a></td></tr>
          <tr><td style="padding:11px 0;border-bottom:1px solid #eef1f6;color:#6b7688;font-size:13px;">Email</td><td style="padding:11px 0;border-bottom:1px solid #eef1f6;text-align:right;font-size:15px;"><a href="mailto:${
            data.email
          }" style="color:#2f6bff;text-decoration:none;">${data.email}</a></td></tr>
          ${
            data.message
              ? `<tr><td style="padding:11px 0;color:#6b7688;font-size:13px;vertical-align:top;">Message</td><td style="padding:11px 0;color:#141a24;font-size:14px;text-align:right;">${data.message}</td></tr>`
              : ""
          }
        </table>
      </td></tr>
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
