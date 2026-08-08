"use client";

import AuthGate from "@/components/AuthGate";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  limit,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

function AdminPageContent() {
  const [jobId, setJobId] = useState("SP-2408");
  const [docId, setDocId] = useState(null);
  const [job, setJob] = useState(null);
  const [message, setMessage] = useState("");
  const [savingAction, setSavingAction] = useState("");

  async function loadJob() {
    setMessage("Loading job...");

    const q = query(
      collection(db, "Jobs"),
      where("jobId", "==", jobId),
      limit(1)
    );

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const foundDoc = snapshot.docs[0];
      setDocId(foundDoc.id);
      setJob(foundDoc.data());
      setMessage("Job loaded.");
    } else {
      setJob(null);
      setDocId(null);
      setMessage("No job found with that tracking number.");
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadInitialJob() {
      const initialQuery = query(
        collection(db, "Jobs"),
        where("jobId", "==", "SP-2408"),
        limit(1)
      );
      const snapshot = await getDocs(initialQuery);

      if (cancelled) return;

      if (!snapshot.empty) {
        const foundDoc = snapshot.docs[0];
        setDocId(foundDoc.id);
        setJob(foundDoc.data());
        setMessage("Job loaded.");
      } else {
        setMessage("Enter a tracking number to load a job.");
      }
    }

    loadInitialJob();
    return () => {
      cancelled = true;
    };
  }, []);

  async function saveJob(updatedFields, action = "Update") {
    if (!docId) {
      setMessage("Load a job first.");
      return;
    }

    const jobRef = doc(db, "Jobs", docId);
    setSavingAction(action);
    setMessage(`Saving ${action.toLowerCase()}...`);

    try {
      await updateDoc(jobRef, updatedFields);

      setJob((prev) => ({
        ...prev,
        ...updatedFields,
      }));

      setMessage(`${action} saved ✓`);
    } catch (error) {
      console.error(error);
      setMessage(`Could not save ${action.toLowerCase()}. Please try again.`);
    } finally {
      setSavingAction("");
    }
  }

  function quickControlClass(selected) {
    return `rounded-2xl px-5 py-3 font-bold transition disabled:cursor-wait disabled:opacity-60 ${
      selected
        ? "bg-[#8fa7b8] text-[#10161a] shadow-md ring-4 ring-[#8fa7b8]/25"
        : "border border-neutral-300 bg-white hover:border-[#8fa7b8] hover:bg-[#eef1f3]"
    }`;
  }

  async function handleFieldChange(field, value) {
    setJob((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  if (!job) {
    return (
      <main className="min-h-screen bg-neutral-100 p-6">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow">
          <h1 className="text-3xl font-bold">S&P LiveTrack Admin</h1>

          <div className="mt-6">
            <label className="text-sm font-bold uppercase text-neutral-500">
              Tracking number
            </label>
            <input
              className="mt-2 w-full rounded-2xl border p-3"
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              placeholder="SP-2408"
            />
          </div>

          <button
            onClick={loadJob}
            className="mt-4 rounded-2xl bg-black px-5 py-3 font-bold text-white"
          >
            Load Job
          </button>

          <p className="mt-4 text-sm text-neutral-600">{message}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-100 p-4 text-neutral-950 md:p-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <header className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
                Private admin dashboard
              </p>
              <h1 className="mt-2 text-4xl font-bold">S&P LiveTrack</h1>
              <p className="mt-2 text-neutral-600">
                Create transports and update customer tracking pages.
              </p>
            </div>
            <a
              href="/admin/new"
              className="shrink-0 rounded-2xl bg-[#8fa7b8] px-5 py-3 text-center font-bold text-[#10161a] hover:bg-[#a9bdca]"
            >
              + Create New Job
            </a>
          </div>
        </header>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-bold uppercase text-neutral-500">
                Tracking number
              </label>
              <input
                className="mt-2 w-full rounded-2xl border p-3"
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={loadJob}
                className="rounded-2xl bg-black px-5 py-3 font-bold text-white"
              >
                Load Job
              </button>

              <a
                href={`/track/${jobId}`}
                target="_blank"
                className="rounded-2xl border px-5 py-3 font-bold"
              >
                View Customer Page
              </a>
            </div>
          </div>

          <p className="mt-4 text-sm text-neutral-600">{message}</p>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Job details</h2>

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-bold uppercase text-neutral-500">
                  Vehicle
                </label>
                <input
                  className="mt-2 w-full rounded-2xl border p-3"
                  value={job.vehicle || ""}
                  onChange={(e) => handleFieldChange("vehicle", e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-bold uppercase text-neutral-500">
                  Pickup
                </label>
                <input
                  className="mt-2 w-full rounded-2xl border p-3"
                  value={job.pickup || ""}
                  onChange={(e) => handleFieldChange("pickup", e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-bold uppercase text-neutral-500">
                  Drop-off
                </label>
                <input
                  className="mt-2 w-full rounded-2xl border p-3"
                  value={job.dropoff || ""}
                  onChange={(e) => handleFieldChange("dropoff", e.target.value)}
                />
              </div>

              <button
                onClick={() =>
                  saveJob({
                    vehicle: job.vehicle,
                    pickup: job.pickup,
                    dropoff: job.dropoff,
                  }, "Job details")
                }
                disabled={Boolean(savingAction)}
                className="w-full rounded-2xl bg-black px-5 py-3 font-bold text-white transition hover:bg-neutral-800 disabled:cursor-wait disabled:opacity-60"
              >
                {savingAction === "Job details" ? "Saving…" : "Save Job Details"}
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Live update</h2>

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-bold uppercase text-neutral-500">
                  Status
                </label>
                <input
                  className="mt-2 w-full rounded-2xl border p-3"
                  value={job.status || ""}
                  onChange={(e) => handleFieldChange("status", e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-bold uppercase text-neutral-500">
                  ETA
                </label>
                <input
                  className="mt-2 w-full rounded-2xl border p-3"
                  value={job.eta || ""}
                  onChange={(e) => handleFieldChange("eta", e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-bold uppercase text-neutral-500">
                  Current location
                </label>
                <input
                  className="mt-2 w-full rounded-2xl border p-3"
                  value={job.currentLocation || ""}
                  onChange={(e) =>
                    handleFieldChange("currentLocation", e.target.value)
                  }
                  placeholder="I-95 N near Newark, NJ"
                />
              </div>

              <div>
                <label className="text-sm font-bold uppercase text-neutral-500">
                  Progress %
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="mt-2 w-full rounded-2xl border p-3"
                  value={job.progress || 0}
                  onChange={(e) =>
                    handleFieldChange("progress", Number(e.target.value))
                  }
                />
              </div>

              <button
                onClick={() =>
                  saveJob({
                    status: job.status,
                    eta: job.eta,
                    currentLocation: job.currentLocation,
                    progress: Number(job.progress),
                    lastUpdated: "Just now",
                  }, "Live update")
                }
                disabled={Boolean(savingAction)}
                className="w-full rounded-2xl bg-black px-5 py-3 font-bold text-white transition hover:bg-neutral-800 disabled:cursor-wait disabled:opacity-60"
              >
                {savingAction === "Live update" ? "Saving…" : "Save Live Update"}
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Quick controls</h2>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <button
              onClick={() =>
                saveJob({
                  trackingPaused: true,
                  status: "Tracking Paused",
                  lastUpdated: "Just now",
                }, "Pause tracking")
              }
              aria-pressed={Boolean(job.trackingPaused)}
              disabled={Boolean(savingAction)}
              className={quickControlClass(Boolean(job.trackingPaused))}
            >
              {savingAction === "Pause tracking" ? "Saving…" : job.trackingPaused ? "✓ Tracking Paused" : "Pause Tracking"}
            </button>

            <button
              onClick={() =>
                saveJob({
                  trackingPaused: false,
                  status: "Live Tracking Active",
                  lastUpdated: "Just now",
                }, "Resume tracking")
              }
              aria-pressed={!job.trackingPaused && job.status === "Live Tracking Active"}
              disabled={Boolean(savingAction)}
              className={quickControlClass(!job.trackingPaused && job.status === "Live Tracking Active")}
            >
              {savingAction === "Resume tracking" ? "Saving…" : !job.trackingPaused && job.status === "Live Tracking Active" ? "✓ Tracking Active" : "Resume Tracking"}
            </button>

            <button
              onClick={() =>
                saveJob({
                  status: "Vehicle Picked Up",
                  progress: 35,
                  trackingPaused: false,
                  lastUpdated: "Just now",
                }, "Picked up status")
              }
              aria-pressed={job.status === "Vehicle Picked Up"}
              disabled={Boolean(savingAction)}
              className={quickControlClass(job.status === "Vehicle Picked Up")}
            >
              {savingAction === "Picked up status" ? "Saving…" : job.status === "Vehicle Picked Up" ? "✓ Vehicle Picked Up" : "Mark Picked Up"}
            </button>

            <button
              onClick={() =>
                saveJob({
                  status: "In Transit",
                  progress: 62,
                  trackingPaused: false,
                  lastUpdated: "Just now",
                }, "In transit status")
              }
              aria-pressed={job.status === "In Transit"}
              disabled={Boolean(savingAction)}
              className={quickControlClass(job.status === "In Transit")}
            >
              {savingAction === "In transit status" ? "Saving…" : job.status === "In Transit" ? "✓ In Transit" : "Mark In Transit"}
            </button>

            <button
              onClick={() =>
                saveJob({
                  status: "Delivered",
                  progress: 100,
                  trackingPaused: false,
                  lastUpdated: "Just now",
                }, "Delivered status")
              }
              aria-pressed={job.status === "Delivered"}
              disabled={Boolean(savingAction)}
              className={quickControlClass(job.status === "Delivered")}
            >
              {savingAction === "Delivered status" ? "Saving…" : job.status === "Delivered" ? "✓ Delivered" : "Mark Delivered"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function AdminPage() {
  return (
    <AuthGate>
      <AdminPageContent />
    </AuthGate>
  );
}
