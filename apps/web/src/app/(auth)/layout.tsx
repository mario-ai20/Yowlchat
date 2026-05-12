import type { ReactNode } from "react";

export default function AuthLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050507] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.22),transparent_65%)] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.14),transparent_70%)] blur-3xl" />
      </div>
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10">
        {children}
      </div>
    </div>
  );
}
