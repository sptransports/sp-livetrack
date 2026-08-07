"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { collection, limit, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

const milestones = [
  { label: "Booked", threshold: 0 },
  { label: "Driver en route", threshold: 15 },
  { label: "Picked up", threshold: 35 },
  { label: "In transit", threshold: 60 },
  { label: "Delivered", threshold: 100 },
];

function clampProgress(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.min(100, Math.max(0, number));
}

function TrackerShell({ children }) {
  return (
    <main className="min-h-screen bg-[#f3f1ec] text-[#121516]">
      <header className="border-b border-black/10 bg-[#0b0d0e] text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="S&P LiveTrack home">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f2a01e] text-sm font-black text-black">S&P</span>
            <span>
              <span className="block text-sm font-black uppercase tracking-[0.18em]">LiveTrack</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">Customer portal</span>
            </span>
          </Link>
          <a href="tel:+19292642629" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold hover:border-[#f2a01e] hover:text-[#f2a01e]">Call support</a>
        </div>
      </header>
      {children}
    </main>
  );
}

export default function TrackingPage() {
  const params = useParams();
  const jobId = decodeURIComponent(params.jobId || "").toUpperCase();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!jobId) return;
    const jobQuery = query(collection(db, "Jobs"), where("jobId", "==", jobId), limit(1));

    return onSnapshot(
      jobQuery,
      (snapshot) => {
        setJob(snapshot.empty ? null : snapshot.docs[0].data());
        setLoadError(false);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading live job:", error);
        setLoadError(true);
        setLoading(false);
      }
    );
  }, [jobId]);

  const progress = useMemo(() => clampProgress(job?.progress), [job?.progress]);
  const hasCoordinates = Number.isFinite(Number(job?.latitude)) && Number.isFinite(Number(job?.longitude));

  if (loading) {
    return (
      <TrackerShell>
        <div className="mx-auto max-w-3xl px-5 py-20 text-center">
          <span className="mx-auto block h-10 w-10 animate-spin rounded-full border-4 border-black/10 border-t-[#f2a01e]" />
          <h1 className="mt-6 text-2xl font-black">Loading your transport</h1>
          <p className="mt-2 text-black/55">Connecting to the latest trip update…</p>
        </div>
      </TrackerShell>
    );
  }

  if (!job || loadError) {
    return (
      <TrackerShell>
        <div className="mx-auto max-w-xl px-5 py-16 sm:py-24">
          <div className="rounded-[2rem] border border-black/10 bg-white p-7 text-center shadow-[0_20px_60px_rgba(0,0,0,0.08)] sm:p-10">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#f2a01e]/15 text-2xl">⌕</span>
            <h1 className="mt-6 text-3xl font-black tracking-tight">{loadError ? "Tracking is temporarily unavailable" : "Tracking number not found"}</h1>
            <p className="mt-3 leading-7 text-black/55">
              {loadError ? "We could not load the latest update. Please try again in a moment." : "Double-check the private tracking number in your confirmation message and try again."}
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <Link href="/" className="rounded-xl bg-black px-5 py-3.5 font-black text-white">Try another number</Link>
              <a href="tel:+19292642629" className="rounded-xl border border-black/15 px-5 py-3.5 font-black">Call (929) 264-2629</a>
            </div>
          </div>
        </div>
      </TrackerShell>
    );
  }

  return (
    <TrackerShell>
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-black/45">
              <span className={`h-2.5 w-2.5 rounded-full ${job.trackingPaused ? "bg-neutral-400" : "animate-pulse bg-emerald-500"}`} />
              {job.trackingPaused ? "Updates paused" : "Live transport update"}
            </div>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] sm:text-5xl">{job.vehicle || "Vehicle transport"}</h1>
            <p className="mt-2 font-semibold text-black/45">Tracking #{job.jobId}</p>
          </div>
          <div className="self-start rounded-full bg-[#0b0d0e] px-5 py-2.5 text-sm font-black text-white sm:self-auto">{job.status || "Update pending"}</div>
        </div>

        <section className="mt-8 overflow-hidden rounded-[2rem] bg-[#0b0d0e] text-white shadow-[0_24px_70px_rgba(0,0,0,0.16)]">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
            <div className="p-6 sm:p-9">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#f2a01e]">Trip progress</p>
                  <p className="mt-2 text-3xl font-black">{progress}% complete</p>
                </div>
                <p className="text-right text-xs leading-5 text-white/45">Last updated<br/><span className="font-bold text-white/75">{job.lastUpdated || "Pending"}</span></p>
              </div>

              <div className="mt-8 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-[#f2a01e] transition-[width] duration-700" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-5 grid grid-cols-5 gap-1">
                {milestones.map((milestone) => {
                  const reached = progress >= milestone.threshold;
                  return (
                    <div key={milestone.label} className="text-center">
                      <span className={`mx-auto grid h-6 w-6 place-items-center rounded-full border text-[10px] font-black ${reached ? "border-[#f2a01e] bg-[#f2a01e] text-black" : "border-white/20 text-white/30"}`}>{reached ? "✓" : ""}</span>
                      <p className={`mt-2 text-[9px] font-bold leading-3 sm:text-[11px] ${reached ? "text-white/80" : "text-white/28"}`}>{milestone.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-white/10 bg-white/[0.04] p-6 sm:p-9 lg:border-l lg:border-t-0">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/40">Estimated delivery</p>
              <p className="mt-3 text-3xl font-black text-[#f2a01e]">{job.eta || "Being confirmed"}</p>
              <p className="mt-5 text-sm leading-6 text-white/45">Arrival times may change with traffic, weather, loading, and road conditions.</p>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[2rem] border border-black/8 bg-white p-6 shadow-[0_14px_45px_rgba(0,0,0,0.06)] sm:p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black">Route details</h2>
              <span className="rounded-full bg-[#f2a01e]/15 px-3 py-1 text-xs font-black text-[#9b5d00]">Tri-State transport</span>
            </div>
            <div className="mt-7 grid grid-cols-[24px_1fr] gap-x-4">
              <div className="flex flex-col items-center">
                <span className="mt-1 h-4 w-4 rounded-full border-4 border-[#f2a01e] bg-white" />
                <span className="my-1 min-h-16 w-px flex-1 bg-black/12" />
                <span className="mb-1 h-4 w-4 rounded-full bg-black" />
              </div>
              <div className="space-y-7">
                <div><p className="text-[11px] font-black uppercase tracking-[0.16em] text-black/40">Pickup</p><p className="mt-1.5 text-lg font-bold leading-6">{job.pickup || "Pickup details pending"}</p></div>
                <div><p className="text-[11px] font-black uppercase tracking-[0.16em] text-black/40">Drop-off</p><p className="mt-1.5 text-lg font-bold leading-6">{job.dropoff || "Drop-off details pending"}</p></div>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-black/8 bg-white p-6 shadow-[0_14px_45px_rgba(0,0,0,0.06)] sm:p-8">
            <h2 className="text-xl font-black">Current update</h2>
            {job.trackingPaused ? (
              <div className="mt-5 rounded-2xl bg-[#f3f1ec] p-5">
                <p className="font-black">Location updates are paused</p>
                <p className="mt-2 text-sm leading-6 text-black/55">Your transport is still active. Updates will resume shortly; the current ETA remains {job.eta || "under review"}.</p>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl bg-[#f3f1ec] p-5">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-black/40">Approximate location</p>
                <p className="mt-2 text-lg font-black">{job.currentLocation || "Waiting for the next driver update"}</p>
                {hasCoordinates && (
                  <a className="mt-4 inline-flex rounded-lg bg-white px-3 py-2 text-xs font-black shadow-sm hover:text-[#9b5d00]" href={`https://www.google.com/maps?q=${job.latitude},${job.longitude}`} target="_blank" rel="noreferrer">View approximate map ↗</a>
                )}
              </div>
            )}
            <p className="mt-4 text-xs leading-5 text-black/38">For driver safety, locations are approximate and may update periodically rather than continuously.</p>
          </section>
        </div>

        <section className="mt-6 flex flex-col gap-5 rounded-[2rem] border border-black/8 bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div><h2 className="text-xl font-black">Questions about this transport?</h2><p className="mt-1 text-sm text-black/50">S&P Transports is available 24/7 across the Tri-State area.</p></div>
          <a href="tel:+19292642629" className="shrink-0 rounded-xl bg-[#f2a01e] px-6 py-3.5 text-center font-black text-black hover:bg-[#ffb536]">Call (929) 264-2629</a>
        </section>
      </div>
    </TrackerShell>
  );
}
