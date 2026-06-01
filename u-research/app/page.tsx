export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f9f9f7] px-5 py-10 text-[#12151a]">
      <section className="w-full max-w-[560px] rounded-lg border border-[#e5e7eb] bg-white px-7 py-8 shadow-[0_18px_54px_rgba(18,21,26,0.07)] sm:px-10 sm:py-10">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-md bg-[#12151a] text-sm font-bold tracking-[-0.08em] text-white">
            UR
          </div>
          <p className="font-heading text-[17px] font-bold tracking-[-0.03em]">
            UResearch
          </p>
        </div>
        <h1 className="font-heading mt-8 text-[34px] font-bold leading-[1.08] tracking-[-0.055em] sm:text-[40px]">
          Research outreach, organized.
        </h1>
        <p className="mt-4 text-[15px] leading-6 text-[#5d6673]">
          Student onboarding is being redesigned. Professor discovery and
          outreach tools are coming next.
        </p>
      </section>
    </main>
  );
}
