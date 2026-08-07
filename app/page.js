"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const features = [
  {
    number: "01",
    title: "Live trip status",
    text: "Follow pickup, transit, and delivery progress from one private page.",
  },
  {
    number: "02",
    title: "Current ETA",
    text: "See the latest arrival estimate and when your update was posted.",
  },
  {
    number: "03",
    title: "No app needed",
    text: "Open your secure tracking link from any phone, tablet, or computer.",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [trackingNumber, setTrackingNumber] = useState("");
  const [error, setError] = useState("");

  function trackTransport(event) {
    event.preventDefault();
    const cleaned = trackingNumber.trim().toUpperCase().replace(/\s+/g, "");

    if (!cleaned) {
      setError("Enter the tracking number from your confirmation message.");
      return;
    }

    setError("");
    router.push(`/track/${encodeURIComponent(cleaned)}`);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#0b0d0e] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_78%_18%,rgba(242,160,30,0.18),transparent_32%),radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.08),transparent_25%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-5 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between border-b border-white/10 py-5">
          <Link href="/" className="flex items-center gap-3" aria-label="S&P LiveTrack home">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f2a01e] text-sm font-black text-black shadow-[0_0_30px_rgba(242,160,30,0.22)]">
              S&P
            </span>
            <span>
              <span className="block text-sm font-black uppercase tracking-[0.18em]">LiveTrack</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">Vehicle transport</span>
            </span>
          </Link>

          <a
            href="tel:+19292642629"
            className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold transition hover:border-[#f2a01e] hover:text-[#f2a01e]"
          >
            (929) 264-2629
          </a>
        </header>

        <section className="grid flex-1 items-center gap-14 py-14 lg:grid-cols-[1.08fr_0.92fr] lg:py-20">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#f2a01e]/30 bg-[#f2a01e]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#ffc45f]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#f2a01e]" />
              Customer tracking portal
            </div>

            <h1 className="max-w-3xl text-5xl font-black leading-[0.94] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              Your vehicle.
              <span className="block text-[#f2a01e]">Your route.</span>
              One clear update.
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-white/62 sm:text-xl">
              Track your S&P Transports delivery, view its current status, and check the latest ETA—anytime, from any device.
            </p>

            <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 text-sm font-semibold text-white/55">
              <span className="flex items-center gap-2"><span className="text-[#f2a01e]">✓</span> Private tracking number</span>
              <span className="flex items-center gap-2"><span className="text-[#f2a01e]">✓</span> No account required</span>
              <span className="flex items-center gap-2"><span className="text-[#f2a01e]">✓</span> Mobile friendly</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-8 rounded-[3rem] bg-[#f2a01e]/10 blur-3xl" />
            <div className="relative rounded-[2rem] border border-white/12 bg-white/[0.065] p-6 shadow-2xl backdrop-blur sm:p-8">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#f2a01e]">Track a transport</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight">Where is my vehicle?</h2>
              <p className="mt-3 text-sm leading-6 text-white/55">
                Your private tracking number is included in your booking confirmation.
              </p>

              <form onSubmit={trackTransport} className="mt-7">
                <label htmlFor="tracking-number" className="text-xs font-bold uppercase tracking-[0.14em] text-white/55">
                  Tracking number
                </label>
                <div className="mt-2 rounded-2xl border border-white/15 bg-black/30 p-2 focus-within:border-[#f2a01e] focus-within:ring-4 focus-within:ring-[#f2a01e]/10 sm:flex">
                  <input
                    id="tracking-number"
                    className="min-w-0 flex-1 bg-transparent px-4 py-3 text-lg font-black uppercase tracking-[0.08em] text-white outline-none placeholder:font-semibold placeholder:tracking-normal placeholder:text-white/25"
                    placeholder="Example: SP-2409-X7K2"
                    value={trackingNumber}
                    onChange={(event) => setTrackingNumber(event.target.value)}
                    autoCapitalize="characters"
                    autoComplete="off"
                    spellCheck="false"
                    aria-describedby={error ? "tracking-error" : "tracking-help"}
                  />
                  <button
                    type="submit"
                    className="mt-2 w-full rounded-xl bg-[#f2a01e] px-6 py-3.5 font-black text-black transition hover:bg-[#ffb536] focus:outline-none focus:ring-4 focus:ring-[#f2a01e]/30 sm:mt-0 sm:w-auto"
                  >
                    Track now →
                  </button>
                </div>
                {error ? (
                  <p id="tracking-error" className="mt-3 text-sm font-semibold text-[#ffc45f]" role="alert">{error}</p>
                ) : (
                  <p id="tracking-help" className="mt-3 text-xs text-white/38">Tracking numbers are not case-sensitive.</p>
                )}
              </form>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {features.map((feature) => (
                  <div key={feature.number} className="rounded-2xl border border-white/8 bg-black/20 p-4">
                    <p className="text-xs font-black text-[#f2a01e]">{feature.number}</p>
                    <h3 className="mt-3 text-sm font-black">{feature.title}</h3>
                    <p className="mt-2 text-xs leading-5 text-white/45">{feature.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <footer className="flex flex-col gap-3 border-t border-white/10 py-6 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} S&P Transports. Tri-State vehicle transport.</p>
          <p>Need help? Call or text <a className="font-bold text-white/65 hover:text-[#f2a01e]" href="tel:+19292642629">(929) 264-2629</a></p>
        </footer>
      </div>
    </main>
  );
}
