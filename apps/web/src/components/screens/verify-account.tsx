"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Mail, ShieldCheck, Sparkles, Timer, XCircle } from "lucide-react";
import { APP_NAME } from "@yowl/config";
import { apiFetch } from "../../lib/api";
import { applyLocale, getPreferredLocale, setStoredLocale } from "../../lib/locale";
import { useSessionStore } from "../../store/session";
import { BrandLogo } from "../brand-logo";
import { LocalePicker } from "../locale-picker";
import type { YowlUser, AppLocale } from "@yowl/types";

type VerifyResponse = {
  user: YowlUser;
};

type ResendResponse = {
  sent: boolean;
  expiresAt: string;
  previewCode?: string;
};

function splitCode(value: string) {
  return value.replace(/[^0-9]/g, "").slice(0, 6);
}

function CodeShell({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(splitCode(event.target.value))}
      inputMode="numeric"
      autoComplete="one-time-code"
      maxLength={6}
      placeholder="000000"
      className="h-16 w-full rounded-[22px] border border-white/10 bg-white/6 px-5 text-center font-mono text-3xl tracking-[0.42em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none transition placeholder:text-white/18 focus:border-[#c084fc]/60 focus:ring-2 focus:ring-[#c084fc]/20"
    />
  );
}

export function VerifyAccountScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useSessionStore((state) => state.setAuth);
  const initialEmail = searchParams?.get("email") ?? "";
  const initialCode = searchParams?.get("code") ?? searchParams?.get("preview") ?? "";
  const initialPreview = searchParams?.get("preview") ?? "";
  const [locale, setLocale] = useState<AppLocale>(() => getPreferredLocale());
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState(splitCode(initialCode));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState<string | null>(initialPreview ? "Ontwikkelcode ingevuld. Je kunt nu bevestigen." : null);
  const [error, setError] = useState<string | null>(null);
  const previewCode = initialPreview;

  useEffect(() => {
    if (!searchParams) {
      return;
    }

    const nextEmail = searchParams.get("email");
    if (nextEmail) {
      setEmail(nextEmail);
    }
    const nextPreview = searchParams.get("preview");
    if (nextPreview) {
      setCode(splitCode(nextPreview));
      setMessage("De bevestigingscode is alvast ingevuld in ontwikkelmodus.");
    }
  }, [searchParams]);

  useEffect(() => {
    const nextLocale = getPreferredLocale();
    setLocale(nextLocale);
  }, []);

  useEffect(() => {
    applyLocale(locale);
    setStoredLocale(locale);
  }, [locale]);

  async function confirmCode() {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const result = await apiFetch<VerifyResponse>("/auth/verification/confirm", {
        method: "POST",
        body: JSON.stringify({ email, code })
      });

      setAuth(result.user);
      router.push("/onboarding");
    } catch (confirmError) {
      const text = confirmError instanceof Error ? confirmError.message : "Bevestigen mislukt.";
      const lower = text.toLowerCase();

      if (lower.includes("verlopen")) {
        setError("De code is verlopen. Vraag een nieuwe code aan.");
      } else if (lower.includes("niet gevonden")) {
        setError("Account niet gevonden.");
      } else if (lower.includes("bevestig eerst")) {
        setError("Bevestig eerst je e-mailadres.");
      } else if (lower.includes("ontgeldige") || lower.includes("ongeldige")) {
        setError("De code klopt niet.");
      } else {
        setError("Bevestigen mislukt. Probeer opnieuw.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function resendCode() {
    setResending(true);
    setError(null);
    setMessage(null);

    try {
      const result = await apiFetch<ResendResponse>("/auth/verification/resend", {
        method: "POST",
        body: JSON.stringify({ email })
      });

      setMessage(result.sent ? "We hebben een nieuwe code gestuurd." : "Er werd een previewcode gegenereerd in development.");
      if (result.previewCode) {
        setCode(result.previewCode);
      }
    } catch (resendError) {
      const text = resendError instanceof Error ? resendError.message : "Opnieuw sturen mislukt.";
      if (text.toLowerCase().includes("niet gevonden")) {
        setError("Account niet gevonden.");
      } else if (text.toLowerCase().includes("al bevestigd")) {
        setError("Dit account is al bevestigd.");
      } else {
        setError("Opnieuw sturen mislukt. Probeer nog eens.");
      }
    } finally {
      setResending(false);
    }
  }

  const tips = [
    "De code vervalt na 10 minuten.",
    "Controleer ook spam of reclame.",
    "Deel deze code nooit met anderen."
  ];

  return (
    <div className="relative flex min-h-[100dvh] w-screen items-stretch justify-stretch overflow-hidden px-4 py-4 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12%] top-[-10%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(192,132,252,0.34),transparent_66%)] blur-3xl" />
        <div className="absolute right-[-10%] top-[14%] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.26),transparent_66%)] blur-3xl" />
        <div className="absolute bottom-[-18%] left-[18%] h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle,rgba(236,72,153,0.16),transparent_72%)] blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-[1400px] items-center py-6">
        <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <section className="max-w-2xl space-y-6">
            <BrandLogo variant="icon" size={52} label={APP_NAME} caption="Accountbevestiging" priority />

            <div className="space-y-4">
              <span className="inline-flex rounded-full border border-white/10 bg-white/6 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/60">
                Stap 2 van 2
              </span>
              <h1 className="max-w-xl text-5xl font-black tracking-tight text-white sm:text-6xl">
                Bevestig je account met de code uit je mail
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-white/70">
                We hebben een paarse bevestigingsmail gestuurd naar je inbox. Vul de 6-cijferige code in om je account veilig te activeren en verder te gaan met Yowl.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { icon: Mail, title: "E-mail", body: "Je code staat in de bevestigingsmail." },
                { icon: Sparkles, title: "Snel", body: "De code werkt maar kort en blijft uniek." },
                { icon: ShieldCheck, title: "Veilig", body: "We vragen de code nooit via chat." }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-[26px] border border-white/10 bg-white/6 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[linear-gradient(135deg,rgba(216,180,254,0.22),rgba(124,58,237,0.18))] text-[#f5e9ff]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{item.title}</p>
                        <p className="text-xs text-white/50">Yowl security</p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-white/64">{item.body}</p>
                  </div>
                );
              })}
            </div>

            <div className="rounded-[30px] border border-white/10 bg-white/6 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.28em] text-white/40">Veiligheidstips</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {tips.map((tip) => (
                  <div key={tip} className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-white/68">
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="w-full">
            <div className="overflow-hidden rounded-[34px] border border-white/10 bg-[rgba(15,8,28,0.82)] shadow-[0_35px_140px_rgba(61,18,104,0.55)] backdrop-blur-2xl">
              <div className="border-b border-white/10 px-6 py-6 sm:px-8">
                <div className="mx-auto max-w-md text-center">
                  <div className="mx-auto grid h-[72px] w-[72px] place-items-center rounded-[26px] border border-white/10 bg-[linear-gradient(135deg,#d8b4fe_0%,#a855f7_55%,#7c3aed_100%)] shadow-[0_18px_55px_rgba(168,85,247,0.38)]">
                    <Mail className="h-9 w-9 text-white" />
                  </div>
                  <h2 className="mt-5 text-3xl font-black tracking-tight text-white">Code invoeren</h2>
                  <p className="mt-3 text-sm leading-6 text-white/66">
                    Vul je e-mailadres en de 6-cijferige code in. Daarna zetten we je account direct klaar.
                  </p>
                </div>
              </div>

              <div className="space-y-5 px-6 py-6 sm:px-8">
                <label className="block text-[13px] font-semibold text-white/72">
                  E-mailadres
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    autoComplete="email"
                    placeholder="jij@voorbeeld.be"
                    className="mt-2 h-12 w-full rounded-[20px] border border-white/10 bg-white/5 px-4 text-white placeholder:text-white/35 outline-none transition focus:border-[#c084fc]/60 focus:ring-2 focus:ring-[#c084fc]/20"
                  />
                </label>

                <div className="space-y-2">
                  <label className="block text-[13px] font-semibold text-white/72">Bevestigingscode</label>
                  <CodeShell value={code} onChange={setCode} />
                  <p className="text-xs text-white/44">
                    Check de mail van YowlChat en plak de code hier. Je kunt ook een nieuwe code vragen als de eerste niet meer werkt.
                  </p>
                </div>

                {message ? (
                  <div className="rounded-[20px] border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                    {message}
                  </div>
                ) : null}

                {error ? (
                  <div className="rounded-[20px] border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                    {error}
                  </div>
                ) : null}

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={resendCode}
                    disabled={resending || !email}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 text-sm font-semibold text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {resending ? "Nieuwe code sturen..." : "Nieuwe code sturen"}
                  </button>

                  <button
                    type="button"
                    onClick={confirmCode}
                    disabled={loading || !email || code.length < 6}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/10 bg-[linear-gradient(135deg,#d8b4fe_0%,#a855f7_55%,#7c3aed_100%)] px-4 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(168,85,247,0.42)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Bezig met bevestigen..." : "Account bevestigen"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid gap-3 rounded-[26px] border border-white/10 bg-white/5 p-4 text-sm text-white/66">
                  <div className="flex items-start gap-3">
                    <Timer className="mt-0.5 h-4 w-4 text-[#d8b4fe]" />
                    <p>De code blijft 10 minuten geldig, daarna sturen we gewoon een nieuwe.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-4 w-4 text-[#d8b4fe]" />
                    <p>We vragen je code nooit via support, chat of social media.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <XCircle className="mt-0.5 h-4 w-4 text-[#d8b4fe]" />
                    <p>Heb je een fout gemaakt? Vraag simpelweg een nieuwe code aan en probeer opnieuw.</p>
                  </div>
                </div>

                {previewCode ? (
                  <div className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/52">
                    Ontwikkelmodus: code {previewCode}
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        </div>
      </main>

      <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center px-4">
        <LocalePicker
          value={locale}
          onChange={(nextLocale) => setLocale(nextLocale)}
          label="Taal"
          helper=""
          className="pointer-events-auto items-center"
        />
      </div>
    </div>
  );
}
