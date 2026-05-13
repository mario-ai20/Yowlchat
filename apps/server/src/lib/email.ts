import { env } from "./env.js";
import { accountsDb } from "./db.js";
import nodemailer from "nodemailer";

type MailTransporter = {
  sendMail: (options: {
    from: string;
    to: string;
    subject: string;
    text: string;
    html: string;
  }) => Promise<{
    accepted?: string[];
    rejected?: string[];
    response?: string;
    envelope?: { from?: string; to?: string | string[] };
  }>;
};

let transporter: MailTransporter | null = null;
let transporterSignature: string | null = null;
const allowPreviewCode = process.env.NODE_ENV !== "production";

type SmtpRuntimeConfig = {
  signature: string;
  description: string;
  transport:
    | string
    | {
        host: string;
        port: number;
        secure: boolean;
        auth: {
          user: string;
          pass: string;
        };
      };
  from: string;
};

type SmtpDatabasePayload = {
  id: "primary";
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from: string | null;
};

function buildEnvConfig(): SmtpRuntimeConfig | null {
  if (env.SMTP_URL) {
    const payload = envSmtpDatabasePayload();
    if (!payload) {
      return null;
    }

    return {
      signature: `env-url:${env.SMTP_URL}`,
      description: "SMTP_URL environment variable",
      transport: env.SMTP_URL,
      from: env.SMTP_FROM ?? payload.user ?? "no-reply@yowl.chat"
    };
  }

  if (!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD)) {
    return null;
  }

  const port = env.SMTP_PORT ?? (env.SMTP_SECURE ? 465 : 587);

  return {
    signature: `env-host:${env.SMTP_HOST}:${port}:${env.SMTP_SECURE ?? false}:${env.SMTP_USER}:${env.SMTP_FROM ?? ""}`,
    description: `environment SMTP host ${env.SMTP_HOST}:${port}`,
    transport: {
      host: env.SMTP_HOST,
      port,
      secure: env.SMTP_SECURE ?? false,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD
      }
    },
    from: env.SMTP_FROM ?? env.SMTP_USER ?? "no-reply@yowl.chat"
  };
}

function envSmtpDatabasePayload(): SmtpDatabasePayload | null {
  if (env.SMTP_URL) {
    const url = new URL(env.SMTP_URL);
    const port = url.port ? Number(url.port) : url.protocol === "smtps:" ? 465 : 587;
    const secure = url.protocol === "smtps:" || port === 465;
    const user = decodeURIComponent(url.username || env.SMTP_USER || "");
    const password = decodeURIComponent(url.password || env.SMTP_PASSWORD || "");
    const host = url.hostname.trim();

    if (!host || !user || !password) {
      return null;
    }

    return {
      id: "primary",
      host,
      port,
      secure,
      user,
      password,
      from: env.SMTP_FROM?.trim() || user
    };
  }

  if (!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD)) {
    return null;
  }

  return {
    id: "primary",
    host: env.SMTP_HOST.trim(),
    port: env.SMTP_PORT ?? (env.SMTP_SECURE ? 465 : 587),
    secure: env.SMTP_SECURE ?? false,
    user: env.SMTP_USER.trim(),
    password: env.SMTP_PASSWORD,
    from: env.SMTP_FROM?.trim() || env.SMTP_USER.trim()
  };
}

async function seedEnvSmtpConfigIntoDatabase() {
  const payload = envSmtpDatabasePayload();
  if (!payload) {
    return;
  }

  try {
    await accountsDb.smtpConfiguration.upsert({
      where: { id: payload.id },
      create: payload,
      update: {
        host: payload.host,
        port: payload.port,
        secure: payload.secure,
        user: payload.user,
        password: payload.password,
        from: payload.from
      }
    });
    console.info("[mail] Seeded SMTP config into accounts database from environment.");
  } catch (error) {
    console.warn("[mail] Failed to seed SMTP config into accounts database:", error instanceof Error ? error.message : error);
  }
}

type CodeEmailOptions = {
  to: string;
  displayName: string;
  code: string;
  expiresMinutes: number;
};

async function resolveSmtpConfig(): Promise<SmtpRuntimeConfig | null> {
  try {
    const record = await accountsDb.smtpConfiguration.findUnique({ where: { id: "primary" } });

    if (record && record.host.trim() && record.user.trim() && record.password) {
      const port = record.port ?? (record.secure ? 465 : 587);

      return {
        signature: `db:${record.id}:${record.updatedAt.toISOString()}:${record.host}:${port}:${record.secure}:${record.user}:${record.from ?? ""}`,
        description: `accounts database smtpConfiguration#${record.id}`,
        transport: {
          host: record.host.trim(),
          port,
          secure: record.secure,
          auth: {
            user: record.user.trim(),
            pass: record.password
          }
        },
        from: record.from?.trim() || record.user.trim()
      };
    }
  } catch (error) {
    console.warn("[mail] Failed to read SMTP config from accounts database:", error instanceof Error ? error.message : error);
  }

  const envConfig = buildEnvConfig();
  if (envConfig) {
    await seedEnvSmtpConfigIntoDatabase();
  }

  return envConfig;
}

function maybePreviewCode(code: string) {
  return allowPreviewCode ? code : undefined;
}

function assertMailDelivery(
  result: Awaited<ReturnType<MailTransporter["sendMail"]>>,
  recipient: string,
  description: string
) {
  const accepted = result.accepted ?? [];
  const rejected = result.rejected ?? [];
  const delivered = accepted.includes(recipient) || accepted.length > 0 || Boolean(result.response?.trim());

  if (rejected.length > 0 || !delivered) {
    throw new Error(
      `SMTP provider rejected the message via ${description}${rejected.length ? ` (rejected: ${rejected.join(", ")})` : ""}`
    );
  }
}

export async function hasSmtpConfig() {
  return Boolean(await resolveSmtpConfig());
}

async function getTransporter() {
  const config = await resolveSmtpConfig();

  if (!config) {
    return null;
  }

  let currentTransporter: MailTransporter | null = transporter;
  if (!currentTransporter || transporterSignature !== config.signature) {
    currentTransporter = nodemailer.createTransport(config.transport as never) as unknown as MailTransporter;
    transporter = currentTransporter;
    transporterSignature = config.signature;
  }

  return { transporter: currentTransporter!, config };
}

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
  const mailerHandle = await getTransporter();

  if (!mailerHandle) {
    console.warn("[verification-email] SMTP not configured on the server runtime for", options.to);
    return { sent: false as const, previewCode: maybePreviewCode(options.code) };
  }

  try {
    const info = await mailerHandle.transporter.sendMail({
      from: mailerHandle.config.from,
      to: options.to,
      subject: "Bevestig je Yowl account",
      text: buildVerificationText(options),
      html: buildVerificationHtml(options)
    });
    assertMailDelivery(info, options.to, mailerHandle.config.description);
    console.info("[verification-email] SMTP accepted message for", options.to, "via", mailerHandle.config.description);
  } catch (error) {
    console.error(
      "[verification-email] SMTP delivery failed via",
      mailerHandle.config.description,
      "for",
      options.to,
      error instanceof Error ? error.message : error
    );
    return { sent: false as const, previewCode: maybePreviewCode(options.code) };
  }

  return { sent: true as const };
}

export async function sendPasswordResetEmail(options: CodeEmailOptions) {
  const mailerHandle = await getTransporter();

  if (!mailerHandle) {
    console.warn("[reset-email] SMTP not configured on the server runtime for", options.to);
    return { sent: false as const, previewCode: maybePreviewCode(options.code) };
  }

  try {
    const info = await mailerHandle.transporter.sendMail({
      from: mailerHandle.config.from,
      to: options.to,
      subject: "Reset je Yowl wachtwoord",
      text: buildResetText(options),
      html: buildResetHtml(options)
    });
    assertMailDelivery(info, options.to, mailerHandle.config.description);
    console.info("[reset-email] SMTP accepted message for", options.to, "via", mailerHandle.config.description);
  } catch (error) {
    console.error(
      "[reset-email] SMTP delivery failed via",
      mailerHandle.config.description,
      "for",
      options.to,
      error instanceof Error ? error.message : error
    );
    return { sent: false as const, previewCode: maybePreviewCode(options.code) };
  }

  return { sent: true as const };
}
