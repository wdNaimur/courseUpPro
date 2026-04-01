import { ShieldCheck } from "lucide-react";

const trustSignals = [
  "Courses stay on your machine instead of being uploaded.",
  "Writable folder handles let metadata sync back into the real course folder.",
  "The dashboard separates management tasks from everyday playback.",
];

export default function HomePageTrustSection() {
  return (
    <section className="editorial-panel fade-in-up rounded-[2rem] p-5 md:p-6 [animation-delay:300ms]">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:items-center">
        <div>
          <p className="section-label">Why local-first</p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.03em] text-[var(--theme-text)] md:text-4xl">
            Built for private course archives, not cloud dependence
          </h2>
        </div>

        <div className="grid gap-3">
          {trustSignals.map((signal) => (
            <div
              key={signal}
              className="theme-soft-panel flex items-start gap-3 rounded-[1.4rem] px-4 py-4"
            >
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--theme-accent-soft)]" />
              <p className="text-sm leading-6 text-[var(--theme-text-soft)]">
                {signal}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
