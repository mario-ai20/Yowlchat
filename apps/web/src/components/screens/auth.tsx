"use client";

import { useEffect, useMemo, useState, type InputHTMLAttributes } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Camera, KeyRound, Mail, MessageCircleMore, ShieldCheck, Sparkles, UserPlus } from "lucide-react";
import { APP_NAME } from "@yowl/config";
import { Badge, Button, Card, Input } from "@yowl/ui";
import { apiFetch } from "../../lib/api";
import { useSessionStore } from "../../store/session";
import { cn } from "../../lib/utils";
import type { YowlUser } from "@yowl/types";

type AuthMode = "login" | "register" | "forgot";
type Gender = "man" | "vrouw" | "geen_van_beide";

function AuthField({
  label,
  helper,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; helper?: string }) {
  return (
    <div className="space-y-2">
      <label className="block text-[13px] font-semibold text-slate-700">{label}</label>
      <Input
        {...props}
        className={cn(
          "h-12 border-slate-200 bg-white text-slate-950 placeholder:text-slate-400 focus:border-[var(--yowl-primary)]/60 focus:ring-[var(--yowl-primary)]/20",
          props.className
        )}
      />
      {helper ? <p className="text-xs text-slate-500">{helper}</p> : null}
    </div>
  );
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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const title = useMemo(() => {
    if (mode === "register") return "Maak een Yowl-account";
    if (mode === "forgot") return "Wachtwoord vergeten";
    return "Inloggen bij YowlChat";
  }, [mode]);

  const subtitle = useMemo(() => {
    if (mode === "register") {
      return "Vul je echte gegevens in en begin meteen met YowlChat.";
    }
    if (mode === "forgot") {
      return "Vraag een herstellink aan met je e-mailadres.";
    }
    return "Gebruik je e-mailadres of gebruikersnaam en wachtwoord om verder te gaan.";
  }, [mode]);

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
              password: registerPassword
            }
          : { identifier: loginEmail, password: loginPassword };

      const result = await apiFetch<{ user: YowlUser }>(route, {
        method: "POST",
        body: JSON.stringify(payload)
      });

      setAuth(result.user);
      router.push("/onboarding");
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Inloggen is mislukt");
    } finally {
      setLoading(false);
    }
  };

  const isLogin = mode === "login";
  const isRegister = mode === "register";

  useEffect(() => {
    if (hydrated && sessionUser) {
      router.push("/");
    }
  }, [hydrated, router, sessionUser]);

  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.24),transparent_26%),linear-gradient(180deg,#ffffff_0%,#f8f8f3_100%)] text-slate-950">
      <div className="mx-auto flex min-h-[100dvh] max-w-6xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-[16px] border border-black/10 bg-[var(--yowl-primary)] text-lg font-black text-black shadow-[0_12px_30px_var(--yowl-glow)]">
              Y
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">YowlChat</p>
              <p className="text-sm text-slate-500">Echte mensen. Echte gesprekken.</p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-2 text-sm text-slate-600 shadow-sm backdrop-blur md:flex">
            <ShieldCheck className="h-4 w-4 text-[var(--yowl-primary)]" />
            Secure account flow
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center py-6">
          <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_460px] lg:items-center">
            <div className="hidden lg:block">
              <div className="max-w-lg space-y-5">
                <Badge className="border-black/10 bg-white/80 text-slate-700">Camera-first social platform</Badge>
                <h1 className="text-5xl font-black tracking-tight text-slate-950 sm:text-6xl">{APP_NAME}</h1>
                <p className="text-lg leading-8 text-slate-600">Snel, premium en gebouwd voor Howls, chats, YowlMap en Echoes.</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { icon: Camera, label: "Howls" },
                    { icon: MessageCircleMore, label: "Realtime chat" },
                    { icon: Sparkles, label: "Moonlight" }
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        className="flex items-center gap-3 rounded-[24px] border border-black/10 bg-white/90 px-4 py-3 shadow-sm"
                      >
                        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--yowl-primary)]/20 text-black">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                          <p className="text-xs text-slate-500">Premium motion</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mx-auto w-full max-w-[520px]">
              <Card className="overflow-hidden border-black/10 bg-white p-0 shadow-[0_30px_120px_rgba(0,0,0,0.12)]">
                <div className="border-b border-slate-200 px-6 pt-6">
                  <div className="mx-auto flex max-w-[420px] items-center rounded-full border border-slate-200 bg-slate-50 p-1">
                    <button
                      type="button"
                      onClick={() => router.push("/login")}
                      className={cn(
                        "flex-1 rounded-full px-4 py-2 text-sm font-semibold transition",
                        isLogin ? "bg-[var(--yowl-primary)] text-black shadow-sm" : "text-slate-500 hover:text-slate-900"
                      )}
                    >
                      Inloggen
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push("/register")}
                      className={cn(
                        "flex-1 rounded-full px-4 py-2 text-sm font-semibold transition",
                        isRegister ? "bg-[var(--yowl-primary)] text-black shadow-sm" : "text-slate-500 hover:text-slate-900"
                      )}
                    >
                      Aanmelden
                    </button>
                  </div>

                  <div className="mx-auto mt-6 grid h-16 w-16 place-items-center rounded-[24px] border border-black/10 bg-[var(--yowl-primary)] text-3xl font-black text-black shadow-[0_14px_30px_var(--yowl-glow)]">
                    Y
                  </div>
                  <div className="mx-auto max-w-md pb-5 pt-5 text-center">
                    <h2 className="text-3xl font-black tracking-tight text-slate-950">{title}</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{subtitle}</p>
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
                        label="E-mailadres"
                        type="email"
                        value={registerEmail}
                        onChange={(event) => setRegisterEmail(event.target.value)}
                        placeholder="jij@voorbeeld.be"
                        autoComplete="email"
                      />
                      <div className="grid gap-4 sm:grid-cols-2">
                        <AuthField
                          label="Voornaam"
                          value={firstName}
                          onChange={(event) => setFirstName(event.target.value)}
                          placeholder="Voornaam"
                          autoComplete="given-name"
                        />
                        <AuthField
                          label="Achternaam"
                          value={lastName}
                          onChange={(event) => setLastName(event.target.value)}
                          placeholder="Achternaam"
                          autoComplete="family-name"
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <AuthField
                          label="Geboortedatum"
                          type="date"
                          value={birthDate}
                          onChange={(event) => setBirthDate(event.target.value)}
                          autoComplete="bday"
                        />
                        <AuthField
                          label="Telefoonnummer"
                          type="tel"
                          value={phoneNumber}
                          onChange={(event) => setPhoneNumber(event.target.value)}
                          placeholder="+32 ..."
                          autoComplete="tel"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[13px] font-semibold text-slate-700">Gender</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { label: "Man", value: "man" as Gender },
                            { label: "Vrouw", value: "vrouw" as Gender },
                            { label: "Geen van beide", value: "geen_van_beide" as Gender }
                          ].map((item) => (
                            <button
                              key={item.value}
                              type="button"
                              onClick={() => setGender(item.value)}
                              className={cn(
                                "rounded-2xl border px-3 py-3 text-sm font-semibold transition",
                                gender === item.value
                                  ? "border-[var(--yowl-primary)] bg-[var(--yowl-primary)] text-black shadow-sm"
                                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                              )}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <AuthField
                        label="Wachtwoord"
                        type="password"
                        value={registerPassword}
                        onChange={(event) => setRegisterPassword(event.target.value)}
                        placeholder="Minstens 8 tekens"
                        autoComplete="new-password"
                      />
                    </div>
                  ) : isLogin ? (
                    <div className="grid gap-4">
                      <AuthField
                        label="E-mailadres of gebruikersnaam"
                        type="text"
                        value={loginEmail}
                        onChange={(event) => setLoginEmail(event.target.value)}
                        placeholder="jij@voorbeeld.be of je gebruikersnaam"
                        autoComplete="username"
                      />
                      <AuthField
                        label="Wachtwoord"
                        type="password"
                        value={loginPassword}
                        onChange={(event) => setLoginPassword(event.target.value)}
                        placeholder="Je wachtwoord"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => router.push("/forgot-password")}
                        className="text-left text-sm font-semibold text-slate-500 transition hover:text-slate-900"
                      >
                        Wachtwoord vergeten?
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      <AuthField
                        label="E-mailadres"
                        type="email"
                        value={resetEmail}
                        onChange={(event) => setResetEmail(event.target.value)}
                        placeholder="jij@voorbeeld.be"
                        autoComplete="email"
                      />
                    </div>
                  )}

                  {error ? <div className="rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

                  <Button type="submit" className="h-12 w-full rounded-full text-base" disabled={loading}>
                    {loading ? (
                      "Even laden..."
                    ) : isRegister ? (
                      <>
                        <UserPlus className="h-4 w-4" />
                        Account aanmaken
                      </>
                    ) : mode === "forgot" ? (
                      <>
                        <Mail className="h-4 w-4" />
                        Herstelmail sturen
                      </>
                    ) : (
                      <>
                        <KeyRound className="h-4 w-4" />
                        Volgende
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-center text-sm text-slate-600">
                    <span>{isLogin ? "Nog nieuw bij YowlChat?" : isRegister ? "Al een account?" : "Terug naar login?"}</span>
                    <button
                      type="button"
                      className="ml-2 inline-flex items-center gap-1 font-semibold text-slate-900 underline decoration-[var(--yowl-primary)] decoration-2 underline-offset-4"
                      onClick={() => router.push(isLogin ? "/register" : "/login")}
                    >
                      {isLogin ? "Aanmelden" : "Inloggen"}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </form>
              </Card>
            </div>
          </div>
        </main>

        <footer className="pb-3 pt-2">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex flex-wrap gap-3">
              <span>Howls</span>
              <span>Moonlight</span>
              <span>YowlMap</span>
              <span>Echoes</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <span>Privacy</span>
              <span>Veiligheid</span>
              <span>Support</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
