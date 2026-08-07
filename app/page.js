"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [trackingNumber, setTrackingNumber] = useState("");

  function trackTransport(e) {
    e.preventDefault();

    const cleaned = trackingNumber.trim().toUpperCase();

    if (!cleaned) return;

    router.push(`/track/${cleaned}`);
  }

  return (
    <main className="min-h-screen bg-neutral-100 p-4 text-neutral-950 md:p-8">
      <div className="mx-auto flex min-h-[90vh] max-w-5xl items-center">
        <div className="w-full rounded-3xl bg-white p-6 shadow-sm md:p-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            S&P LiveTrack
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-6xl">
            Track your vehicle transport.
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-neutral-600">
            Enter your tracking number to view live status updates, ETA, pickup
            details, drop-off details, and transport progress.
          </p>

          <form onSubmit={trackTransport} className="mt-8 grid gap-3 md:grid-cols-[1fr_auto]">
            <input
              className="rounded-2xl border p-4 text-lg font-semibold uppercase"
              placeholder="Enter tracking number, ex: SP-2409"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
            />

            <button
              type="submit"
              className="rounded-2xl bg-black px-7 py-4 font-bold text-white"
            >
              Track Transport
            </button>
          </form>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-neutral-100 p-5">
              <p className="font-bold">Live status</p>
              <p className="mt-2 text-sm text-neutral-600">
                See pickup, transit, and delivery updates in one place.
              </p>
            </div>

            <div className="rounded-2xl bg-neutral-100 p-5">
              <p className="font-bold">ETA updates</p>
              <p className="mt-2 text-sm text-neutral-600">
                Stay informed with current ETA and last updated time.
              </p>
            </div>

            <div className="rounded-2xl bg-neutral-100 p-5">
              <p className="font-bold">No app needed</p>
              <p className="mt-2 text-sm text-neutral-600">
                Customers can track directly from a private link.
              </p>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
