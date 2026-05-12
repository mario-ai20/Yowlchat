"use client";

import { useEffect, useState, type InputHTMLAttributes } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Camera, KeyRound, Mail, MapPin, ShieldCheck, Sparkles, UserPlus, X } from "lucide-react";
import { APP_NAME, BRAND_TERMS } from "@yowl/config";
import { Badge, Button, Card, Input } from "@yowl/ui";
import { apiFetch } from "../../lib/api";
import { getUiCopy } from "../../lib/i18n";
import { applyLocale, getPreferredLocale, setStoredLocale } from "../../lib/locale";
import { useSessionStore } from "../../store/session";
import { cn } from "../../lib/utils";
import { LocalePicker } from "../locale-picker";
import type { AppLocale, YowlUser } from "@yowl/types";

type AuthMode = "login" | "register" | "forgot";
type Gender = "man" | "vrouw" | "geen_van_beide";
type InfoKey = "howls" | "moonlight" | "yowlmap" | "echoes" | "privacy" | "security";

function AuthField({
  label,
  helper,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; helper?: string }) {
  return (
    <div className="space-y-2">
      <label className="block text-[13px] font-semibold text-white/72">{label}</label>
      <Input
        {...props}
        className={cn(
          "h-12 border-white/10 bg-white/5 text-white placeholder:text-white/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md focus:border-[#c084fc]/60 focus:ring-[#c084fc]/25",
          props.className
        )}
      />
      {helper ? <p className="text-xs text-white/45">{helper}</p> : null}
    </div>
  );
}

function formatAuthError(error: unknown, mode: AuthMode) {
  const fallback = mode === "forgot" ? "Controleer het e-mailadres en probeer opnieuw." : "Controleer je invoer en probeer opnieuw.";

  if (!(error instanceof Error)) {
    return fallback;
  }

  const message = error.message.trim();
  const lower = message.toLowerCase();

  if (!message || message.startsWith("{") || lower.includes("too_small") || lower.includes("invalid input") || lower.includes("zod")) {
    return fallback;
  }

  if (lower.includes("account niet gevonden")) {
    return "Account niet gevonden.";
  }

  if (lower.includes("invalid credentials")) {
    return "Gebruikersnaam of wachtwoord klopt niet.";
  }

  if (lower.includes("email or username already in use")) {
    return "Dit account bestaat al.";
  }

  return fallback;
}

export function AuthScreen({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const hydrated = useSessionStore((state) => state.hydrated);
  const sessionUser = useSessionStore((state) => state.user);
  const setAuth = useSessionStore((state) => state.setAuth);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState<Gender>("geen_van_beide");
  const [registerPassword, setRegisterPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [locale, setLocale] = useState<AppLocale>(() => getPreferredLocale());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeInfo, setActiveInfo] = useState<InfoKey | null>(null);
  const copy = getUiCopy(locale).auth;
  const title = mode === "register" ? copy.registerTitle : mode === "forgot" ? copy.forgotTitle : copy.loginTitle;
  const subtitle = mode === "register" ? copy.registerSubtitle : mode === "forgot" ? copy.forgotSubtitle : copy.loginSubtitle;

  const submit = async () => {
    setLoading(true);
    setError(null);

    try {
      if (mode === "forgot") {
        await apiFetch("/auth/forgot-password", {
          method: "POST",
          body: JSON.stringify({ email: resetEmail })
        });
        router.push("/login?reset=sent");
        return;
      }

      const route = mode === "register" ? "/auth/register" : "/auth/login";
      const payload =
        mode === "register"
          ? {
              email: registerEmail,
              firstName,
              lastName,
              birthDate,
              phoneNumber,
              gender,
              locale,
              password: registerPassword
            }
          : { identifier: loginEmail, password: loginPassword };

      const result = await apiFetch<{ user: YowlUser }>(route, {
        method: "POST",
        body: JSON.stringify(payload)
      });

      let authenticatedUser = result.user;
      if (mode === "login" && authenticatedUser.locale !== locale) {
        const localeResult = await apiFetch<YowlUser>("/auth/me", {
          method: "PATCH",
          body: JSON.stringify({ locale })
        }).catch(() => null);
        authenticatedUser = localeResult ?? { ...authenticatedUser, locale };
      }

      setAuth(authenticatedUser);
      router.push("/onboarding");
    } catch (authError) {
      setError(mode === "login" ? "Account niet gevonden" : formatAuthError(authError, mode));
    } finally {
      setLoading(false);
    }
  };

  const isLogin = mode === "login";
  const isRegister = mode === "register";
  const introBadge = copy.introBadge;
  const introLine = copy.introLine;
  const featureCards = [
    {
      icon: Camera,
      label: BRAND_TERMS.Stories,
      description: copy.feature1Desc
    },
    {
      icon: Sparkles,
      label: BRAND_TERMS.Spotlight,
      description: copy.feature2Desc
    },
    {
      label: BRAND_TERMS["Snap Map"],
      icon: MapPin,
      description: copy.feature3Desc
    }
  ] as const;
  const pillTags = [copy.pill1, copy.pill2, copy.pill3];
  const footerFeatureLinks = [
    { key: "howls" as const, label: BRAND_TERMS.Stories },
    { key: "moonlight" as const, label: BRAND_TERMS.Spotlight },
    { key: "yowlmap" as const, label: BRAND_TERMS["Snap Map"] },
    { key: "echoes" as const, label: BRAND_TERMS.Memories }
  ] as const;
  const footerHelpLinks = [
    { key: "privacy" as const, label: copy.footerPrivacy },
    { key: "security" as const, label: copy.footerSecurity },
    {
      label: copy.footerSupport,
      href: "mailto:yowl.maffia@gmail.com?subject=YowlChat%20support&body=Hallo%20Yowl,%0A%0AIk%20heb%20hulp%20nodig%20met:%0A"
    }
  ] as const;

  useEffect(() => {
    if (hydrated && sessionUser) {
      router.push("/");
    }
  }, [hydrated, router, sessionUser]);

  useEffect(() => {
    applyLocale(locale);
    setStoredLocale(locale);
  }, [locale]);

  useEffect(() => {
    if (sessionUser?.locale && sessionUser.locale !== locale) {
      setLocale(sessionUser.locale);
    }
  }, [locale, sessionUser?.locale]);

  useEffect(() => {
    if (!activeInfo) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveInfo(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeInfo]);

  const activeInfoContent =
    activeInfo === "howls"
      ? copy.featureInfo.howls
      : activeInfo === "moonlight"
        ? copy.featureInfo.moonlight
        : activeInfo === "yowlmap"
          ? copy.featureInfo.yowlmap
          : activeInfo === "echoes"
            ? copy.featureInfo.echoes
            : activeInfo === "privacy"
              ? copy.footerInfo.privacy
              : activeInfo === "security"
                ? copy.footerInfo.security
                : null;

  return (
    <div className="relative min-h-[100dvh] w-screen overflow-hidden bg-[radial-gradient(circle_at_18%_10%,rgba(192,132,252,0.35),transparent_28%),radial-gradient(circle_at_80%_16%,rgba(236,72,153,0.16),transparent_24%),radial-gradient(circle_at_50%_85%,rgba(59,130,246,0.12),transparent_26%),linear-gradient(180deg,#140922_0%,#0c0715_56%,#09050f_100%)] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-12%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(196,101,255,0.36),transparent_68%)] blur-3xl" />
        <div className="absolute right-[-12%] top-[18%] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.3),transparent_68%)] blur-3xl" />
        <div className="absolute bottom-[-16%] left-[24%] h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle,rgba(236,72,153,0.16),transparent_70%)] blur-3xl" />
      </div>

      <div className="relative flex min-h-[100dvh] w-screen flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-[16px] border border-white/10 bg-[linear-gradient(135deg,#d8b4fe_0%,#a855f7_55%,#7c3aed_100%)] text-lg font-black text-white shadow-[0_16px_35px_rgba(168,85,247,0.5)]">
              Y
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/48">{APP_NAME}</p>
              <p className="text-sm text-white/62">{copy.headerTagline}</p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-2 text-sm text-white/70 shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur-xl md:flex">
            <ShieldCheck className="h-4 w-4 text-[#d8b4fe]" />
            Eigen Yowl login
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center py-8">
          <div className="grid w-full gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div className="hidden lg:block">
              <div className="max-w-xl space-y-6">
                <Badge className="border-white/10 bg-white/8 text-white/75 shadow-[0_10px_30px_rgba(0,0,0,0.14)] backdrop-blur-xl">
                  {introBadge}
                </Badge>

                <div className="space-y-4">
                  <h1 className="max-w-lg text-5xl font-black tracking-tight text-white sm:text-6xl">
                    {copy.heroTitle}
                  </h1>
                  <p className="max-w-xl text-lg leading-8 text-white/68">
                    {introLine}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {featureCards.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        className="rounded-[26px] border border-white/10 bg-white/7 p-4 shadow-[0_12px_35px_rgba(0,0,0,0.18)] backdrop-blur-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[linear-gradient(135deg,rgba(216,180,254,0.22),rgba(124,58,237,0.18))] text-[#f5e9ff]">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{item.label}</p>
                            <p className="text-xs text-white/50">Yowl</p>
                          </div>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-white/64">{item.description}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-[30px] border border-white/10 bg-white/7 p-4 shadow-[0_16px_50px_rgba(0,0,0,0.18)] backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-[18px] border border-white/10 bg-[linear-gradient(135deg,#d8b4fe_0%,#a855f7_55%,#7c3aed_100%)] text-white shadow-[0_18px_30px_rgba(168,85,247,0.35)]">
                      Y
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{copy.panelTitle}</p>
                      <p className="text-sm text-white/58">{copy.panelSubtitle}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/60">
                    {pillTags.map((tag) => (
                      <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full">
              <Card className="overflow-hidden border-white/10 bg-[rgba(15,8,28,0.78)] p-0 shadow-[0_35px_140px_rgba(61,18,104,0.55)] backdrop-blur-2xl">
                <div className="border-b border-white/10 px-6 pt-6">
                  <div className="mx-auto flex max-w-[420px] items-center rounded-full border border-white/10 bg-white/7 p-1 backdrop-blur-xl">
                    <button
                      type="button"
                      onClick={() => router.push("/login")}
                      className={cn(
                        "flex-1 rounded-full px-4 py-2 text-sm font-semibold transition",
                        isLogin
                          ? "bg-[linear-gradient(135deg,#d8b4fe_0%,#a855f7_55%,#7c3aed_100%)] text-white shadow-[0_12px_28px_rgba(168,85,247,0.45)]"
                          : "text-white/60 hover:text-white"
                      )}
                    >
                      {copy.loginTab}
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push("/register")}
                      className={cn(
                        "flex-1 rounded-full px-4 py-2 text-sm font-semibold transition",
                        isRegister
                          ? "bg-[linear-gradient(135deg,#d8b4fe_0%,#a855f7_55%,#7c3aed_100%)] text-white shadow-[0_12px_28px_rgba(168,85,247,0.45)]"
                          : "text-white/60 hover:text-white"
                      )}
                    >
                      {copy.registerTab}
                    </button>
                  </div>

                  <div className="mx-auto mt-6 grid h-16 w-16 place-items-center rounded-[24px] border border-white/10 bg-[linear-gradient(135deg,#d8b4fe_0%,#a855f7_55%,#7c3aed_100%)] text-3xl font-black text-white shadow-[0_20px_50px_rgba(168,85,247,0.45)]">
                    Y
                  </div>
                  <div className="mx-auto max-w-md pb-5 pt-5 text-center">
                    <h2 className="text-3xl font-black tracking-tight text-white">{title}</h2>
                    <p className="mt-3 text-sm leading-6 text-white/62">{subtitle}</p>
                  </div>
                </div>

                <form
                  className="space-y-5 px-6 py-6"
                  onSubmit={(event) => {
                    event.preventDefault();
                    submit().catch(() => undefined);
                  }}
                >
                  {isRegister ? (
                    <div className="grid gap-4">
                      <AuthField
                        label={copy.emailLabel}
                        type="email"
                        value={registerEmail}
                        onChange={(event) => setRegisterEmail(event.target.value)}
                        placeholder={copy.emailPlaceholder}
                        autoComplete="email"
                      />
                      <div className="grid gap-4 sm:grid-cols-2">
                        <AuthField
                          label={copy.firstNameLabel}
                          value={firstName}
                          onChange={(event) => setFirstName(event.target.value)}
                          placeholder={copy.firstNamePlaceholder}
                          autoComplete="given-name"
                        />
                        <AuthField
                          label={copy.lastNameLabel}
                          value={lastName}
                          onChange={(event) => setLastName(event.target.value)}
                          placeholder={copy.lastNamePlaceholder}
                          autoComplete="family-name"
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <AuthField
                          label={copy.birthDateLabel}
                          type="date"
                          value={birthDate}
                          onChange={(event) => setBirthDate(event.target.value)}
                          autoComplete="bday"
                        />
                        <AuthField
                          label={copy.phoneLabel}
                          type="tel"
                          value={phoneNumber}
                          onChange={(event) => setPhoneNumber(event.target.value)}
                          placeholder={copy.phonePlaceholder}
                          autoComplete="tel"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[13px] font-semibold text-white/72">{copy.genderLabel}</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { label: copy.genderMan, value: "man" as Gender },
                            { label: copy.genderWoman, value: "vrouw" as Gender },
                            { label: copy.genderOther, value: "geen_van_beide" as Gender }
                          ].map((item) => (
                            <button
                              key={item.value}
                              type="button"
                              onClick={() => setGender(item.value)}
                              className={cn(
                                "rounded-2xl border px-3 py-3 text-sm font-semibold transition",
                                gender === item.value
                                  ? "border-[#c084fc]/50 bg-white/12 text-white shadow-[0_12px_30px_rgba(168,85,247,0.22)]"
                                  : "border-white/10 bg-white/5 text-white/68 hover:bg-white/8"
                              )}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <AuthField
                        label={copy.passwordLabel}
                        type="password"
                        value={registerPassword}
                        onChange={(event) => setRegisterPassword(event.target.value)}
                        placeholder={copy.passwordPlaceholder}
                        autoComplete="new-password"
                      />
                    </div>
                  ) : isLogin ? (
                    <div className="grid gap-4">
                      <AuthField
                        label={`${copy.emailLabel} of gebruikersnaam`}
                        type="text"
                        value={loginEmail}
                        onChange={(event) => setLoginEmail(event.target.value)}
                        placeholder={copy.loginIdentifierPlaceholder}
                        autoComplete="username"
                      />
                      <AuthField
                        label={copy.passwordLabel}
                        type="password"
                        value={loginPassword}
                        onChange={(event) => setLoginPassword(event.target.value)}
                        placeholder={copy.passwordPlaceholder}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => router.push("/forgot-password")}
                        className="text-left text-sm font-semibold text-white/60 transition hover:text-white"
                      >
                        {copy.forgotPassword}
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      <AuthField
                        label={copy.emailLabel}
                        type="email"
                        value={resetEmail}
                        onChange={(event) => setResetEmail(event.target.value)}
                        placeholder={copy.emailPlaceholder}
                        autoComplete="email"
                      />
                    </div>
                  )}

                  {error ? (
                    <div className="rounded-[18px] border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                      {error}
                    </div>
                  ) : null}

                  <Button
                    type="submit"
                    className="h-12 w-full rounded-full border border-white/10 bg-[linear-gradient(135deg,#d8b4fe_0%,#a855f7_55%,#7c3aed_100%)] text-base text-white shadow-[0_18px_55px_rgba(168,85,247,0.42)] transition hover:brightness-105 disabled:opacity-60"
                    disabled={loading}
                  >
                    {loading ? (
                      copy.loading
                    ) : isRegister ? (
                      <>
                        <UserPlus className="h-4 w-4" />
                        {copy.submitRegister}
                      </>
                    ) : mode === "forgot" ? (
                      <>
                        <Mail className="h-4 w-4" />
                        {copy.submitForgot}
                      </>
                    ) : (
                      <>
                        <KeyRound className="h-4 w-4" />
                        {copy.submitLogin}
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-center text-sm text-white/65">
                    <span>{isLogin ? copy.noAccountPrompt : isRegister ? copy.accountExistsPrompt : copy.backToLoginPrompt}</span>
                    <button
                      type="button"
                      className="ml-2 inline-flex items-center gap-1 font-semibold text-white underline decoration-[#d8b4fe] decoration-2 underline-offset-4"
                      onClick={() => router.push(isLogin ? "/register" : "/login")}
                    >
                      {isLogin ? copy.noAccountAction : copy.backToLoginAction}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </form>
              </Card>
            </div>
          </div>
        </main>

        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center px-4">
          <LocalePicker
            value={locale}
            onChange={(nextLocale) => setLocale(nextLocale)}
            label={copy.languageLabel}
            helper=""
            className="pointer-events-auto items-center"
          />
        </div>

        <footer className="pb-3 pt-2">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 text-xs text-white/48">
            <div className="flex flex-wrap gap-3">
              {footerFeatureLinks.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveInfo(item.key)}
                  className="rounded-full px-2 py-1 transition hover:bg-white/6 hover:text-white"
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              {footerHelpLinks.map((item) =>
                "href" in item ? (
                  <a
                    key={item.label}
                    href={item.href}
                    className="rounded-full px-2 py-1 transition hover:bg-white/6 hover:text-white"
                  >
                    {item.label}
                  </a>
                ) : (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActiveInfo(item.key)}
                    className="rounded-full px-2 py-1 transition hover:bg-white/6 hover:text-white"
                  >
                    {item.label}
                  </button>
                )
              )}
            </div>
          </div>
        </footer>

        {activeInfoContent ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm"
            onClick={() => setActiveInfo(null)}
            role="presentation"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="feature-info-title"
              className="relative w-full max-w-[520px] rounded-[28px] border border-white/10 bg-[rgba(18,10,26,0.98)] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.55)]"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setActiveInfo(null)}
                className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-white/72 transition hover:bg-white/10 hover:text-white"
                aria-label="Sluit info"
              >
                <X className="h-4 w-4" />
              </button>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/42">Info</p>
              <h3 id="feature-info-title" className="mt-2 text-3xl font-black tracking-tight text-white">
                {activeInfoContent.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-white/70">{activeInfoContent.body}</p>
              <p className="mt-5 text-xs uppercase tracking-[0.22em] text-white/38">Klik buiten dit venster of op het kruisje om te sluiten</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
