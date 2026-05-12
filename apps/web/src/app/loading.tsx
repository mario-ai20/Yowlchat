import { GlassPanel } from "@yowl/ui";

export default function Loading() {
  return (
    <div className="space-y-5">
      <GlassPanel className="animate-pulse p-5">
        <div className="h-6 w-40 rounded-full bg-white/10" />
        <div className="mt-4 h-[52vh] rounded-[32px] bg-white/8" />
      </GlassPanel>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <GlassPanel key={index} className="animate-pulse p-4">
            <div className="h-5 w-24 rounded-full bg-white/10" />
            <div className="mt-3 h-16 rounded-3xl bg-white/8" />
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}
