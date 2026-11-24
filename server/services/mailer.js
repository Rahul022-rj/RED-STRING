// Sends transactional email through Brevo's HTTPS API (Render's free plan blocks SMTP ports).
// Env: BREVO_API_KEY, MAIL_FROM (a sender address verified in Brevo), MAIL_FROM_NAME (optional).
// Without a key, development prints the email to the console instead of sending it.

const API = "https://api.brevo.com/v3/smtp/email";

const isConfigured = () => Boolean(process.env.BREVO_API_KEY && process.env.MAIL_FROM);

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function layout(title, bodyHtml) {
  return `<!doctype html><html><body style="margin:0;background:#0C0D10;padding:32px 16px;font-family:Georgia,serif;color:#E9E6DF">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="100%" style="max-width:520px;background:#15171C;border:1px solid #C83A46;padding:32px" cellpadding="0" cellspacing="0"><tr><td>
<p style="margin:0 0 8px;color:#C83A46;letter-spacing:3px;font-size:12px">RED STRING</p>
<h1 style="margin:0 0 20px;font-size:24px;color:#E9E6DF">${escapeHtml(title)}</h1>
${bodyHtml}
<p style="margin:28px 0 0;color:#92959D;font-size:12px">If you didn't ask for this, you can ignore this email. Your account is unchanged.</p>
</td></tr></table></td></tr></table></body></html>`;
}

const button = (url, label) =>
  `<p style="margin:24px 0"><a href="${escapeHtml(url)}" style="background:#C83A46;color:#ffffff;text-decoration:none;padding:14px 28px;letter-spacing:1.5px;font-size:14px;display:inline-block">${escapeHtml(label)}</a></p>
<p style="margin:0;color:#92959D;font-size:12px;word-break:break-all">Or open this link: ${escapeHtml(url)}</p>`;

async function send({ to, subject, html, text }) {
  if (!isConfigured()) {
    if (process.env.NODE_ENV === "production") {
      console.error("[mail] BREVO_API_KEY / MAIL_FROM not set - email to " + to + " was NOT sent.");
      return false;
    }
    console.log("\n[mail:dev] To: " + to + "\n[mail:dev] Subject: " + subject + "\n" + text + "\n");
    return true;
  }
  const res = await fetch(API, {
    method: "POST",
    headers: { "api-key": process.env.BREVO_API_KEY, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      sender: { email: process.env.MAIL_FROM, name: process.env.MAIL_FROM_NAME || "RED STRING" },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text
    })
  });
  if (!res.ok) {
    console.error("[mail] Brevo error " + res.status + ": " + (await res.text()).slice(0, 300));
    return false;
  }
  return true;
}

function sendPasswordReset(to, { name, url }) {
  return send({
    to,
    subject: "Reset your RED STRING password",
    text: `Hi ${name},\n\nUse this link to set a new password. It works once and expires in 30 minutes:\n${url}\n\nIf you didn't ask for this, ignore this email.`,
    html: layout("Reset your password", `<p style="margin:0;line-height:1.6">Hi ${escapeHtml(name)}, someone (hopefully you) asked to reset the password for your detective account. The link works once and expires in <strong>30 minutes</strong>.</p>${button(url, "SET A NEW PASSWORD")}`)
  });
}

function sendUsernameReminder(to, { accounts, loginUrl }) {
  const list = accounts.map((a) => `@${a.username} (${a.name})`).join("\n");
  const htmlList = accounts.map((a) => `<li style="margin:6px 0"><strong>@${escapeHtml(a.username)}</strong> <span style="color:#92959D">(${escapeHtml(a.name)})</span></li>`).join("");
  return send({
    to,
    subject: "Your RED STRING username",
    text: `The username linked to this email:\n${list}\n\nLog in: ${loginUrl}`,
    html: layout("Your username", `<p style="margin:0;line-height:1.6">This email address is linked to:</p><ul style="padding-left:20px">${htmlList}</ul>${button(loginUrl, "LOG IN")}`)
  });
}

module.exports = { isConfigured, sendPasswordReset, sendUsernameReminder };
