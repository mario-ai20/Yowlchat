import nodemailer from "nodemailer";
import { env } from "./env.js";
import { HttpError } from "./errors.js";

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

export function hasSmtpConfig() {
  return Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD && env.SMTP_FROM);
}

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  if (!hasSmtpConfig()) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT ?? 587,
    secure: env.SMTP_SECURE ?? false,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD
    }
  });

  return transporter;
}

type CodeEmailOptions = {
  to: string;
  displayName: string;
  code: string;
  expiresMinutes: number;
};

function buildVerificationHtml({ displayName, code, expiresMinutes }: CodeEmailOptions) {
  return `<!doctype html>
<html lang="nl">
  <body style="margin:0;background:#090510;font-family:Inter,Arial,sans-serif;color:#f5e9ff;">
    <div style="padding:32px;background:radial-gradient(circle at 20% 20%, rgba(192,132,252,0.32), transparent 28%), radial-gradient(circle at 80% 10%, rgba(236,72,153,0.18), transparent 22%), linear-gradient(180deg,#140922 0%,#090510 100%);">
      <div style="max-width:640px;margin:0 auto;border:1px solid rgba(255,255,255,0.08);border-radius:28px;overflow:hidden;box-shadow:0 30px 120px rgba(0,0,0,0.5);">
        <div style="padding:32px 32px 24px;background:linear-gradient(135deg, rgba(168,85,247,0.28), rgba(124,58,237,0.18));border-bottom:1px solid rgba(255,255,255,0.08);">
          <div style="display:inline-flex;align-items:center;gap:10px;padding:8px 14px;border-radius:999px;background:rgba(255,255,255,0.08);font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:#e9d5ff;">YowlChat</div>
          <h1 style="margin:18px 0 0;font-size:34px;line-height:1.05;font-weight:800;letter-spacing:-0.04em;color:#fff;">Bevestig je account, ${displayName}</h1>
          <p style="margin:12px 0 0;font-size:16px;line-height:1.7;color:rgba(255,255,255,0.76);">Gebruik de bevestigingscode hieronder om je account te activeren. Daarna kun je veilig inloggen en verdergaan.</p>
        </div>
        <div style="padding:28px 32px 32px;background:rgba(15,8,28,0.98);">
          <div style="margin:0 auto 20px;max-width:300px;text-align:center;padding:20px;border-radius:24px;border:1px solid rgba(255,255,255,0.09);background:linear-gradient(180deg, rgba(168,85,247,0.14), rgba(124,58,237,0.08));">
            <div style="font-size:12px;letter-spacing:.26em;text-transform:uppercase;color:rgba(255,255,255,0.48);">Bevestigingscode</div>
            <div style="margin-top:14px;font-size:42px;letter-spacing:.28em;font-weight:800;color:#fff;text-shadow:0 0 26px rgba(168,85,247,0.65);font-family:'SF Mono','Cascadia Mono',Consolas,monospace;">${code}</div>
            <div style="margin-top:10px;font-size:13px;color:rgba(255,255,255,0.62);">Geldig gedurende ${expiresMinutes} minuten.</div>
          </div>

          <div style="display:grid;gap:14px;">
            <div style="padding:16px 18px;border-radius:18px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.04);">
              <div style="font-weight:700;color:#fff;margin-bottom:6px;">Veiligheidstips</div>
              <ul style="margin:0;padding-left:18px;color:rgba(255,255,255,0.7);line-height:1.8;">
                <li>Deel deze code nooit met iemand anders.</li>
                <li>Wij vragen je code nooit via chat of telefoon.</li>
                <li>Zie je dit niet in je inbox? Check dan ook spam of reclame.</li>
              </ul>
            </div>

            <div style="padding:16px 18px;border-radius:18px;border:1px solid rgba(216,180,254,0.16);background:rgba(168,85,247,0.08);color:rgba(255,255,255,0.78);line-height:1.8;">
              Als je deze code niet hebt aangevraagd, kun je deze mail gewoon negeren. Je account blijft veilig tot jij de code invult.
            </div>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>`;
}

function buildVerificationText({ displayName, code, expiresMinutes }: CodeEmailOptions) {
  return [
    `YowlChat accountbevestiging voor ${displayName}`,
    "",
    `Gebruik deze code om je account te bevestigen: ${code}`,
    `De code is ${expiresMinutes} minuten geldig.`,
    "",
    "Veiligheidstips:",
    "- Deel je code nooit met iemand anders.",
    "- Wij vragen je code nooit via chat of telefoon.",
    "- Kijk ook in spam of reclame als de mail niet binnenkomt.",
    "",
    "Als je dit niet hebt aangevraagd, kun je deze mail negeren."
  ].join("\n");
}

function buildResetHtml({ displayName, code, expiresMinutes }: CodeEmailOptions) {
  return `<!doctype html>
<html lang="nl">
  <body style="margin:0;background:#090510;font-family:Inter,Arial,sans-serif;color:#f5e9ff;">
    <div style="padding:32px;background:radial-gradient(circle at 20% 20%, rgba(192,132,252,0.32), transparent 28%), radial-gradient(circle at 80% 10%, rgba(236,72,153,0.18), transparent 22%), linear-gradient(180deg,#140922 0%,#090510 100%);">
      <div style="max-width:640px;margin:0 auto;border:1px solid rgba(255,255,255,0.08);border-radius:28px;overflow:hidden;box-shadow:0 30px 120px rgba(0,0,0,0.5);">
        <div style="padding:32px 32px 24px;background:linear-gradient(135deg, rgba(168,85,247,0.28), rgba(124,58,237,0.18));border-bottom:1px solid rgba(255,255,255,0.08);">
          <div style="display:inline-flex;align-items:center;gap:10px;padding:8px 14px;border-radius:999px;background:rgba(255,255,255,0.08);font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:#e9d5ff;">YowlChat</div>
          <h1 style="margin:18px 0 0;font-size:34px;line-height:1.05;font-weight:800;letter-spacing:-0.04em;color:#fff;">Reset je wachtwoord, ${displayName}</h1>
          <p style="margin:12px 0 0;font-size:16px;line-height:1.7;color:rgba(255,255,255,0.76);">Gebruik de herstelcode hieronder om je wachtwoord veilig opnieuw in te stellen. Je hoeft nergens op te klikken: vul de code in YowlChat in en kies daarna meteen een nieuw wachtwoord.</p>
        </div>
        <div style="padding:28px 32px 32px;background:rgba(15,8,28,0.98);">
          <div style="margin:0 auto 20px;max-width:300px;text-align:center;padding:20px;border-radius:24px;border:1px solid rgba(255,255,255,0.09);background:linear-gradient(180deg, rgba(168,85,247,0.14), rgba(124,58,237,0.08));">
            <div style="font-size:12px;letter-spacing:.26em;text-transform:uppercase;color:rgba(255,255,255,0.48);">Herstelcode</div>
            <div style="margin-top:14px;font-size:42px;letter-spacing:.28em;font-weight:800;color:#fff;text-shadow:0 0 26px rgba(168,85,247,0.65);font-family:'SF Mono','Cascadia Mono',Consolas,monospace;">${code}</div>
            <div style="margin-top:10px;font-size:13px;color:rgba(255,255,255,0.62);">Geldig gedurende ${expiresMinutes} minuten.</div>
          </div>

          <div style="display:grid;gap:14px;">
            <div style="padding:16px 18px;border-radius:18px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.04);">
              <div style="font-weight:700;color:#fff;margin-bottom:6px;">Wat je moet doen</div>
              <ul style="margin:0;padding-left:18px;color:rgba(255,255,255,0.7);line-height:1.8;">
                <li>Open YowlChat en vul de herstelcode in.</li>
                <li>Kies daarna direct een nieuw, sterk wachtwoord.</li>
                <li>Log opnieuw in met je nieuwe wachtwoord.</li>
              </ul>
            </div>

            <div style="padding:16px 18px;border-radius:18px;border:1px solid rgba(216,180,254,0.16);background:rgba(168,85,247,0.08);color:rgba(255,255,255,0.78);line-height:1.8;">
              Heb jij deze reset niet aangevraagd? Dan mag je deze mail gewoon negeren. Deel de code nooit met iemand anders.
            </div>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>`;
}

function buildResetText({ displayName, code, expiresMinutes }: CodeEmailOptions) {
  return [
    `YowlChat wachtwoordreset voor ${displayName}`,
    "",
    `Gebruik deze code om je wachtwoord te resetten: ${code}`,
    `De code is ${expiresMinutes} minuten geldig.`,
    "",
    "Wat je moet doen:",
    "- Open YowlChat en vul de herstelcode in.",
    "- Kies daarna direct een nieuw wachtwoord.",
    "- Log opnieuw in met je nieuwe wachtwoord.",
    "",
    "Als je dit niet hebt aangevraagd, kun je deze mail negeren."
  ].join("\n");
}

export async function sendVerificationEmail(options: CodeEmailOptions) {
  const mailer = getTransporter();

  if (!mailer) {
    const previewCode = options.code;
    if (process.env.NODE_ENV === "production") {
      throw new HttpError(503, "E-mailservice niet geconfigureerd");
    }

    console.info("[verification-email] SMTP not configured; preview code for", options.to, options.code);
    return { sent: false as const, previewCode };
  }

  await mailer.sendMail({
    from: env.SMTP_FROM,
    to: options.to,
    subject: "Bevestig je Yowl account",
    text: buildVerificationText(options),
    html: buildVerificationHtml(options)
  });

  return { sent: true as const };
}

export async function sendPasswordResetEmail(options: CodeEmailOptions) {
  const mailer = getTransporter();

  if (!mailer) {
    const previewCode = options.code;
    if (process.env.NODE_ENV === "production") {
      throw new HttpError(503, "E-mailservice niet geconfigureerd");
    }

    console.info("[reset-email] SMTP not configured; preview code for", options.to, options.code);
    return { sent: false as const, previewCode };
  }

  await mailer.sendMail({
    from: env.SMTP_FROM,
    to: options.to,
    subject: "Reset je Yowl wachtwoord",
    text: buildResetText(options),
    html: buildResetHtml(options)
  });

  return { sent: true as const };
}
