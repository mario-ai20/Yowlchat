import Link from "next/link";
import { APP_NAME } from "@yowl/config";
import { Badge, GlassPanel } from "@yowl/ui";

export default function Page() {
  return (
    <GlassPanel className="grid min-h-[60vh] place-items-center p-6 text-center">
      <div className="max-w-xl space-y-4">
        <Badge>Splash screen</Badge>
        <h1 className="text-5xl font-semibold tracking-tight">{APP_NAME}</h1>
        <p className="text-white/62">Loading the premium social experience with buttery-smooth motion.</p>
        <Link
          href="/onboarding"
          className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--yowl-primary)] px-5 text-sm font-semibold text-black shadow-[0_0_36px_var(--yowl-glow)] transition hover:brightness-105"
        >
          Continue
        </Link>
      </div>
    </GlassPanel>
  );
}
