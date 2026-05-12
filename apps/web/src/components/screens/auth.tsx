"use client";

import { useEffect, useMemo, useState, type InputHTMLAttributes } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Camera, KeyRound, Mail, MessageCircleMore, ShieldCheck, Sparkles, UserPlus } from "lucide-react";
import { APP_NAME, AUTH_ASIDES, BRAND_TERMS } from "@yowl/config";
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
    return "Inloggen bij Yowl";
  }, [mode]);

  const subtitle = useMemo(() => {
    if (mode === "register") {
      return "Maak je profiel aan, zet je YowlMoji klaar en stap meteen de app in.";
    }
    if (mode === "forgot") {
      return "Vraag veilig een herstellink aan met je e-mailadres.";
    }
    return "Gebruik je e-mailadres of gebruikersnaam om verder te gaan.";
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
    <div className="relative min-h-[100dvh] overflow-hidden bg-[radial-gradient(circle_at_18%_10%,rgba(192,132,252,0.35),transparent_28%),radial-gradient(circle_at_80%_16%,rgba(236,72,153,0.16),transparent_24%),radial-gradient(circle_at_50%_85%,rgba(59,130,246,0.12),transparent_26%),linear-gradient(180deg,#140922_0%,#0c0715_56%,#09050f_100%)] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-12%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(196,101,255,0.36),transparent_68%)] blur-3xl" />
        <div className="absolute right-[-12%] top-[18%] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.3),transparent_68%)] blur-3xl" />
        <div className="absolute bottom-[-16%] left-[24%] h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle,rgba(236,72,153,0.16),transparent_70%)] blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[100dvh] max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-[16px] border border-white/10 bg-[linear-gradient(135deg,#d8b4fe_0%,#a855f7_55%,#7c3aed_100%)] text-lg font-black text-white shadow-[0_16px_35px_rgba(168,85,247,0.5)]">
              Y
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/48">{APP_NAME}</p>
              <p className="text-sm text-white/62">Echte mensen. Echte gesprekken. Eigen glow.</p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-2 text-sm text-white/70 shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur-xl md:flex">
            <ShieldCheck className="h-4 w-4 text-[#d8b4fe]" />
            Eigen Yowl login
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center py-8">
          <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1.05fr_480px] lg:items-center">
            <div className="hidden lg:block">
              <div className="max-w-xl space-y-6">
                <Badge className="border-white/10 bg-white/8 text-white/75 shadow-[0_10px_30px_rgba(0,0,0,0.14)] backdrop-blur-xl">
                  {AUTH_ASIDES[0]}
                </Badge>

                <div className="space-y-4">
                  <h1 className="max-w-lg text-5xl font-black tracking-tight text-white sm:text-6xl">
                    Welkom bij {APP_NAME}
                  </h1>
                  <p className="max-w-xl text-lg leading-8 text-white/68">
                    Een paarse, glow-first omgeving voor {BRAND_TERMS.Stories}, {BRAND_TERMS.Spotlight},
                    {` `}YowlMoji en {BRAND_TERMS["Snap Map"]}. Alles voelt van ons, alles blijft snel.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { icon: Camera, label: BRAND_TERMS.Stories, description: "Echte verhalen in een opvallende ring." },
                    { icon: Sparkles, label: BRAND_TERMS.Spotlight, description: "Korte highlights en featured momenten." },
                    {
                      icon: MessageCircleMore,
                      label: BRAND_TERMS["Snap Map"],
                      description: "Zie waar je vrienden actief zijn."
                    }
                  ].map((item) => {
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
                            <p className="text-xs text-white/50">Original Yowl</p>
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
                      <p className="text-sm font-semibold text-white">YowlMoji + camera + flow</p>
                      <p className="text-sm text-white/58">Je eigen avatar, je eigen beweging, je eigen app.</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/60">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{AUTH_ASIDES[1]}</span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{AUTH_ASIDES[2]}</span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{AUTH_ASIDES[3]}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mx-auto w-full max-w-[520px]">
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
                      Inloggen
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
                      Aanmelden
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
                        <label className="block text-[13px] font-semibold text-white/72">Gender</label>
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
                        className="text-left text-sm font-semibold text-white/60 transition hover:text-white"
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

                  <div className="flex items-center justify-center text-sm text-white/65">
                    <span>{isLogin ? "Nog nieuw bij Yowl?" : isRegister ? "Al een account?" : "Terug naar login?"}</span>
                    <button
                      type="button"
                      className="ml-2 inline-flex items-center gap-1 font-semibold text-white underline decoration-[#d8b4fe] decoration-2 underline-offset-4"
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
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 text-xs text-white/48">
            <div className="flex flex-wrap gap-3">
              <span>{BRAND_TERMS.Stories}</span>
              <span>{BRAND_TERMS.Spotlight}</span>
              <span>{BRAND_TERMS["Snap Map"]}</span>
              <span>{BRAND_TERMS.Memories}</span>
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
