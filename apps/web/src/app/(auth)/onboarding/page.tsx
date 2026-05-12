"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { AUTH_ASIDES, APP_NAME } from "@yowl/config";
import { Avatar, Badge, Button, Card, GlassPanel, Input } from "@yowl/ui";
import { apiFetch } from "../../../lib/api";
import { useSessionStore } from "../../../store/session";
import type { YowlUser } from "@yowl/types";

function formatGender(gender?: YowlUser["gender"]) {
  if (gender === "man") return "Man";
  if (gender === "vrouw") return "Vrouw";
  if (gender === "geen_van_beide") return "Geen van beide";
  return "Not set";
}

export default function Page() {
  const router = useRouter();
  const sessionUser = useSessionStore((state) => state.user);
  const updateUser = useSessionStore((state) => state.updateUser);
  const [bio, setBio] = useState(sessionUser?.bio ?? "");
  const [location, setLocation] = useState(sessionUser?.location ?? "");
  const [publicProfile, setPublicProfile] = useState(sessionUser?.publicProfile ?? true);
  const [isGhostMode, setIsGhostMode] = useState(sessionUser?.isGhostMode ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionUser) {
      router.push("/login");
    }
  }, [router, sessionUser]);

  const continueFlow = async () => {
    setSaving(true);
    setError(null);

    try {
      const result = await apiFetch<YowlUser>("/auth/me", {
        method: "PATCH",
        body: JSON.stringify({
          bio,
          location,
          publicProfile,
          isGhostMode
        })
      });

      updateUser(result);
      router.push("/");
    } catch (savingError) {
      setError(savingError instanceof Error ? savingError.message : "Could not save onboarding");
    } finally {
      setSaving(false);
    }
  };

  return (
    <GlassPanel className="max-w-5xl p-5">
      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <div className="space-y-5">
          <Badge>Onboarding</Badge>
          <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">{APP_NAME}</h1>
          <p className="max-w-2xl text-lg text-white/62">
            Finish your Yowl profile so chats, Howls and Echoes can all use the real account data.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                label: "Name",
                value:
                  `${sessionUser?.firstName ?? ""} ${sessionUser?.lastName ?? ""}`.trim() ||
                  sessionUser?.displayName ||
                  "Not set"
              },
              { label: "Birthdate", value: sessionUser?.birthDate ? new Date(sessionUser.birthDate).toLocaleDateString() : "Not set" },
              { label: "Phone", value: sessionUser?.phoneNumber ?? "Not set" },
              { label: "Gender", value: formatGender(sessionUser?.gender) }
            ].map((item) => (
              <Card key={item.label} className="border-white/8 bg-white/[0.04] p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-white/38">{item.label}</p>
                <p className="mt-2 text-sm font-semibold text-white/78">{item.value}</p>
              </Card>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {AUTH_ASIDES.map((aside) => (
              <Card key={aside} className="border-white/8 bg-white/[0.04] p-4">
                <p className="text-sm text-white/72">{aside}</p>
              </Card>
            ))}
          </div>
        </div>

        <Card className="border-white/8 bg-white/[0.04]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/38">Your profile</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">Set your identity</h2>
            </div>
            <Avatar name={sessionUser?.displayName ?? "Yowl"} className="h-12 w-12" />
          </div>

          <div className="mt-5 space-y-4">
            <Input value={bio} onChange={(event) => setBio(event.target.value)} placeholder="Bio" />
            <Input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Location" />

              <div className="flex items-center justify-between rounded-[24px] border border-white/8 bg-white/5 px-4 py-3">
              <div>
                <p className="font-semibold">Public profile</p>
                <p className="text-sm text-white/48">Let people find and follow your Yowl.</p>
              </div>
              <button
                onClick={() => setPublicProfile((current) => !current)}
                className={`relative h-8 w-14 rounded-full border transition ${
                  publicProfile ? "border-[var(--yowl-primary)] bg-[var(--yowl-primary)]/20" : "border-white/10 bg-white/5"
                }`}
              >
                <span className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${publicProfile ? "left-7" : "left-1"}`} />
              </button>
            </div>

            <div className="flex items-center justify-between rounded-[24px] border border-white/8 bg-white/5 px-4 py-3">
              <div>
                <p className="font-semibold">Ghost mode</p>
                <p className="text-sm text-white/48">Hide your live location on YowlMap.</p>
              </div>
              <button
                onClick={() => setIsGhostMode((current) => !current)}
                className={`relative h-8 w-14 rounded-full border transition ${
                  isGhostMode ? "border-[var(--yowl-primary)] bg-[var(--yowl-primary)]/20" : "border-white/10 bg-white/5"
                }`}
              >
                <span className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${isGhostMode ? "left-7" : "left-1"}`} />
              </button>
            </div>

            {error ? <p className="text-sm text-red-300">{error}</p> : null}

            <Button className="w-full" onClick={continueFlow} disabled={saving}>
              {saving ? "Saving..." : "Continue to YowlChat"}
              <ArrowRight className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2 text-sm text-white/58">
              <Sparkles className="h-4 w-4 text-[var(--yowl-primary)]" />
              Your profile is saved to the backend, not just local state.
            </div>
          </div>
        </Card>
      </div>
    </GlassPanel>
  );
}
