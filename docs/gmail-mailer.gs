/**
 * RED STRING – free email sender using your own Gmail (Google Apps Script).
 *
 * Setup (once):
 *  1. Go to https://script.google.com → New project. Delete the sample code, paste this file.
 *  2. Replace PASTE_YOUR_MAIL_SECRET_HERE below with your MAIL_SECRET (a long random string).
 *  3. Choose the function "testSend" in the toolbar and click Run. Allow the permissions Google asks for
 *     (it needs "Send email as you"). You'll get a test email: that means it works.
 *  4. Deploy → New deployment → type: Web app → Execute as: Me → Who has access: Anyone → Deploy.
 *     Copy the Web app URL (ends with /exec).
 *  5. In Render → red-string → Environment, add:
 *       GMAIL_SCRIPT_URL = that /exec URL
 *       MAIL_SECRET      = the same secret as in step 2
 *
 * Limit: about 100 emails a day on a normal Gmail account.
 * Only requests carrying the secret are accepted, so nobody else can send mail through it.
 */

const SECRET = 'PASTE_YOUR_MAIL_SECRET_HERE';

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    if (SECRET.indexOf('PASTE_') === 0) return reply({ ok: false, error: 'Set SECRET in the script first' });
    if (d.secret !== SECRET) return reply({ ok: false, error: 'bad secret' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(d.to || ''))) return reply({ ok: false, error: 'bad recipient' });
    MailApp.sendEmail({
      to: d.to,
      subject: String(d.subject || 'RED STRING').slice(0, 200),
      htmlBody: String(d.html || ''),
      body: String(d.text || ''),
      name: String(d.name || 'RED STRING').slice(0, 60)
    });
    return reply({ ok: true, remaining: MailApp.getRemainingDailyQuota() });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  }
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Run this once from the editor to grant permission and send yourself a test email.
function testSend() {
  MailApp.sendEmail(Session.getActiveUser().getEmail(), 'RED STRING test email', 'Your RED STRING mail sender works.');
}
