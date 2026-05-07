import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <main className="flex flex-col items-center gap-8 text-center px-8">
        <h1 className="text-2xl font-semibold tracking-widest text-[#D4AF37]">
          SKILLPIPS
        </h1>
        <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
          Premium forex trading brand.
        </p>
        <Link
          href="/intro"
          className="border border-[#D4AF37]/60 text-[#D4AF37] text-sm tracking-widest px-8 py-3 hover:bg-[#D4AF37]/10 transition-colors"
        >
          ▶ WATCH INTRO
        </Link>
      </main>
    </div>
  );
}
