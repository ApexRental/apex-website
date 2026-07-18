import { Resend } from "resend";
import { SITE_URL } from "@/lib/site";
import { computeQuote, money } from "@/lib/format";

type BookingEmailData = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  car: string;
  startDate: string;
  endDate: string;
  days: number;
  dailyRate: number;
  message?: string | null;
};

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

const PHONE = "+1-888-505-0836";
const TEL = "+18885050836";
const MARK = `${SITE_URL}/apex-mark.png`;
// Where customer replies to the confirmation email should land (a real inbox).
const REPLY_TO = process.env.REPLY_TO_EMAIL || "customercare@apexrentalfleet.com";

function ref(id: string): string {
  return id.slice(-6).toUpperCase();
}

function usd(n: number): string {
  return `$${n.toFixed(2)}`;
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

/** Dark brand bar with the mountain mark + wordmark. */
function brandBar(): string {
  return `
    <tr><td style="background-color:#0a0e17;background:linear-gradient(180deg,#0d1424 0%,#080b12 100%);padding:20px 30px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="vertical-align:middle;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="vertical-align:middle;padding-right:11px;line-height:0;">
              <img src="${MARK}" alt="Apex Rentals" width="50" height="28" style="display:block;border:0;" />
            </td>
            <td style="vertical-align:middle;font-family:Arial,Helvetica,sans-serif;white-space:nowrap;line-height:1;">
              <span style="color:#ffffff;font-size:21px;font-weight:800;letter-spacing:1px;">APEX</span>
              <span style="color:#6f9bff;font-size:21px;font-weight:600;letter-spacing:5px;padding-left:5px;">RENTALS</span>
            </td>
          </tr></table>
        </td>
        <td align="right" style="font-family:Arial,Helvetica,sans-serif;color:#8b95a8;font-size:11px;letter-spacing:2px;vertical-align:middle;">CAR RENTAL &middot; NYC</td>
      </tr></table>
    </td></tr>`;
}

/** Dark footer with links. */
function footer(): string {
  return `
    <tr><td style="background:#0a0e17;padding:26px 30px;font-family:Arial,Helvetica,sans-serif;text-align:center;">
      <div style="color:#ffffff;font-size:15px;font-weight:800;letter-spacing:1px;">APEX RENTALS</div>
      <div style="margin-top:12px;">
        <a href="${SITE_URL}" style="color:#9fb4e6;text-decoration:none;font-size:12px;letter-spacing:1px;">CONTACT</a>
        <span style="color:#39435a;padding:0 8px;">&middot;</span>
        <a href="${SITE_URL}/privacy" style="color:#9fb4e6;text-decoration:none;font-size:12px;letter-spacing:1px;">PRIVACY</a>
        <span style="color:#39435a;padding:0 8px;">&middot;</span>
        <a href="${SITE_URL}/terms" style="color:#9fb4e6;text-decoration:none;font-size:12px;letter-spacing:1px;">TERMS</a>
      </div>
      <div style="margin-top:12px;color:#6d778c;font-size:12px;line-height:1.8;">
        Car rental in New York City &middot; Serving NY &middot; NJ &middot; CT &middot; PA<br/>
        <a href="tel:${TEL}" style="color:#9fb4e6;text-decoration:none;">${PHONE}</a>
        &nbsp;&middot;&nbsp;
        <a href="${SITE_URL}" style="color:#9fb4e6;text-decoration:none;">apexrentalfleet.com</a><br/>
        <a href="mailto:${REPLY_TO}" style="color:#9fb4e6;text-decoration:none;white-space:nowrap;">${REPLY_TO}</a>
      </div>
    </td></tr>`;
}

/** Full branded confirmation email for the CLIENT (Basis-style, light). */
function clientEmailHtml(data: BookingEmailData): string {
  const q = computeQuote(data.dailyRate, data.days);
  const taxRows = q.lines
    .map(
      (l) => `
        <tr>
          <td style="padding:5px 0;color:#6b7688;font-size:13px;font-family:Arial,Helvetica,sans-serif;">${l.label} <span style="color:#a3adbe;">(${l.note})</span></td>
          <td align="right" style="padding:5px 0;color:#2b3346;font-size:14px;font-family:Arial,Helvetica,sans-serif;">${usd(
            l.amount
          )}</td>
        </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Apex Rentals</title></head>
<body style="margin:0;padding:0;background:#eef2f7;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef2f7;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e7f0;">

        ${brandBar()}

        <!-- HERO -->
        <tr><td style="padding:22px 22px 0 22px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#eaf1ff;background:linear-gradient(160deg,#e7f0ff 0%,#f4f8ff 100%);border-radius:14px;">
            <tr><td style="padding:34px 30px;text-align:center;font-family:Arial,Helvetica,sans-serif;">
              <table role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
                <td width="58" height="58" align="center" valign="middle" style="background:#ffffff;border-radius:29px;box-shadow:0 2px 8px rgba(20,40,80,0.10);">
                  <span style="color:#2f6bff;font-size:30px;font-weight:700;line-height:1;">&#10003;</span>
                </td>
              </tr></table>
              <h1 style="margin:20px 0 0 0;color:#111826;font-size:24px;font-weight:800;">Your booking request is pending</h1>
              <p style="margin:10px auto 0 auto;max-width:430px;color:#5c667a;font-size:14px;line-height:1.6;">
                Vehicle availability can change quickly. We work hard to confirm bookings fast — our team will reach out shortly to lock in your dates. If we can&rsquo;t confirm, we&rsquo;ll let you know right away.
              </p>
            </td></tr>
            <!-- ref + CTA -->
            <tr><td style="padding:0 22px 24px 22px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                <td style="font-family:Arial,Helvetica,sans-serif;vertical-align:middle;">
                  <div style="display:inline-block;background:#ffffff;border:1px solid #d5e0f5;border-radius:9px;padding:10px 16px;">
                    <span style="color:#8b95a8;font-size:12px;">Booking Ref:</span>
                    <span style="color:#2f6bff;font-size:14px;font-weight:800;letter-spacing:0.5px;">&nbsp;#${ref(
                      data.id
                    )}</span>
                  </div>
                </td>
                <td align="right" style="vertical-align:middle;">
                  <table role="presentation" cellpadding="0" cellspacing="0" align="right"><tr>
                    <td style="background:#2f6bff;border-radius:9px;">
                      <a href="tel:${TEL}" style="display:inline-block;padding:12px 22px;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;text-decoration:none;border-radius:9px;">Call us</a>
                    </td>
                  </tr></table>
                </td>
              </tr></table>
            </td></tr>
          </table>
        </td></tr>

        <!-- greeting -->
        <tr><td style="padding:26px 30px 0 30px;font-family:Arial,Helvetica,sans-serif;">
          <p style="margin:0;color:#2b3346;font-size:15px;">Hi ${data.fullName}, here are your booking details:</p>
        </td></tr>

        <!-- RENTAL card -->
        <tr><td style="padding:14px 30px 0 30px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e4e9f2;border-radius:12px;">
            <tr><td style="padding:16px 20px;border-bottom:1px solid #eef1f6;font-family:Arial,Helvetica,sans-serif;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                <td style="color:#111826;font-size:13px;font-weight:800;letter-spacing:1px;">RENTAL</td>
                <td align="right" style="color:#2f6bff;font-size:13px;font-weight:700;">${
                  data.days
                } day${data.days > 1 ? "s" : ""}</td>
              </tr></table>
            </td></tr>
            <tr><td style="padding:16px 20px 6px 20px;font-family:Arial,Helvetica,sans-serif;">
              <div style="color:#111826;font-size:19px;font-weight:800;">${data.car}</div>
            </td></tr>
            <tr><td style="padding:6px 20px 18px 20px;font-family:Arial,Helvetica,sans-serif;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                <td width="45%" style="vertical-align:top;">
                  <div style="color:#8b95a8;font-size:11px;letter-spacing:1px;">PICK-UP</div>
                  <div style="color:#1a2230;font-size:15px;font-weight:700;margin-top:3px;">${fmtDate(
                    data.startDate
                  )}</div>
                </td>
                <td width="10%" align="center" style="color:#c2ccdb;font-size:18px;vertical-align:middle;">&rarr;</td>
                <td width="45%" align="right" style="vertical-align:top;">
                  <div style="color:#8b95a8;font-size:11px;letter-spacing:1px;">RETURN</div>
                  <div style="color:#1a2230;font-size:15px;font-weight:700;margin-top:3px;">${fmtDate(
                    data.endDate
                  )}</div>
                </td>
              </tr></table>
            </td></tr>
          </table>
        </td></tr>

        <!-- PURCHASE SUMMARY -->
        <tr><td style="padding:16px 30px 0 30px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f9fc;border:1px solid #e7ebf3;border-radius:12px;">
            <tr><td style="padding:18px 20px;font-family:Arial,Helvetica,sans-serif;">
              <div style="color:#111826;font-size:13px;font-weight:800;letter-spacing:1px;">PURCHASE SUMMARY</div>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
                <tr>
                  <td style="padding:5px 0;color:#8b95a8;font-size:12px;letter-spacing:0.5px;font-family:Arial,Helvetica,sans-serif;">FARE</td>
                  <td></td>
                </tr>
                <tr>
                  <td style="padding:3px 0 8px 0;color:#2b3346;font-size:14px;font-family:Arial,Helvetica,sans-serif;">${data.car} &middot; ${
    data.days
  } day${data.days > 1 ? "s" : ""}</td>
                  <td align="right" style="padding:3px 0 8px 0;color:#2b3346;font-size:14px;font-family:Arial,Helvetica,sans-serif;">${usd(
                    q.subtotal
                  )}</td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e7ebf3;margin-top:4px;padding-top:4px;">
                <tr>
                  <td style="padding:8px 0 2px 0;color:#8b95a8;font-size:12px;letter-spacing:0.5px;font-family:Arial,Helvetica,sans-serif;">TAXES &amp; FEES</td>
                  <td></td>
                </tr>
                ${taxRows}
                <tr>
                  <td style="padding:7px 0 2px 0;color:#5b6478;font-size:13px;font-weight:700;font-family:Arial,Helvetica,sans-serif;">Total taxes &amp; fees</td>
                  <td align="right" style="padding:7px 0 2px 0;color:#2b3346;font-size:14px;font-weight:700;font-family:Arial,Helvetica,sans-serif;">${usd(
                    q.taxTotal
                  )}</td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:2px solid #e2e7f0;margin-top:8px;">
                <tr>
                  <td style="padding:14px 0 0 0;color:#111826;font-size:16px;font-weight:800;font-family:Arial,Helvetica,sans-serif;">Total</td>
                  <td align="right" style="padding:14px 0 0 0;color:#2f6bff;font-size:22px;font-weight:800;font-family:Arial,Helvetica,sans-serif;">${usd(
                    q.total
                  )}</td>
                </tr>
              </table>
            </td></tr>
          </table>
        </td></tr>

        ${
          data.message
            ? `<tr><td style="padding:16px 30px 0 30px;font-family:Arial,Helvetica,sans-serif;">
                 <div style="background:#fbfaf5;border:1px solid #efe9d8;border-radius:10px;padding:14px 16px;color:#6b6450;font-size:14px;line-height:1.6;">
                   <span style="color:#b09b63;font-size:11px;letter-spacing:1px;">YOUR NOTE</span><br/>${data.message}
                 </div>
               </td></tr>`
            : ""
        }

        <!-- deposit notice -->
        <tr><td style="padding:16px 30px 6px 30px;font-family:Arial,Helvetica,sans-serif;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef4ff;border-radius:10px;">
            <tr><td style="padding:14px 16px;color:#3f5a86;font-size:13px;line-height:1.6;">
              <b style="color:#274a80;">Security deposit.</b> A refundable deposit is collected at pick-up and released within 3&ndash;7 business days, subject to inspection at return. The total above already includes all taxes &amp; fees.
            </td></tr>
          </table>
        </td></tr>

        <!-- reply note -->
        <tr><td style="padding:14px 30px 30px 30px;font-family:Arial,Helvetica,sans-serif;text-align:center;">
          <p style="margin:0;color:#8b95a8;font-size:13px;line-height:1.6;">Questions? Just reply to this email or call <a href="tel:${TEL}" style="color:#2f6bff;text-decoration:none;">${PHONE}</a> — we&rsquo;re happy to help.</p>
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
  const q = computeQuote(data.dailyRate, data.days);
  const row = (label: string, value: string, strong = false) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #eef1f6;color:#8b95a8;font-size:13px;">${label}</td>
      <td align="right" style="padding:10px 0;border-bottom:1px solid #eef1f6;color:#141a24;font-size:15px;${
        strong ? "font-weight:700;" : ""
      }">${value}</td>
    </tr>`;
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#eef2f7;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef2f7;padding:24px 12px;"><tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e7f0;font-family:Arial,Helvetica,sans-serif;">
      ${brandBar()}
      <tr><td style="padding:24px 30px 6px 30px;">
        <div style="color:#141a24;font-size:19px;font-weight:800;">New booking request <span style="color:#2f6bff;">#${ref(
          data.id
        )}</span></div>
        <div style="color:#8b95a8;font-size:13px;margin-top:2px;">Submitted via apexrentalfleet.com</div>
      </td></tr>
      <tr><td style="padding:12px 30px 26px 30px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          ${row("Vehicle", data.car, true)}
          ${row("Pick-up", fmtDate(data.startDate))}
          ${row("Return", fmtDate(data.endDate))}
          ${row("Duration", `${data.days} day${data.days > 1 ? "s" : ""}`)}
          ${row("Subtotal", `${money(data.dailyRate)} × ${data.days} = ${usd(q.subtotal)}`)}
          ${q.lines.map((l) => row(`${l.label} (${l.note})`, usd(l.amount))).join("")}
          ${row("Total (incl. tax)", usd(q.total), true)}
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
      replyTo: REPLY_TO,
      subject: `Apex Rentals — booking request received (#${ref(data.id)})`,
      html: clientEmailHtml(data),
    })
  );

  const results = await Promise.allSettled(jobs);
  for (const r of results) {
    if (r.status === "rejected") console.error("[email] send failed:", r.reason);
  }
}
