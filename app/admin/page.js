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

  async function saveJob(updatedFields) {
    if (!docId) {
      setMessage("Load a job first.");
      return;
    }

    const jobRef = doc(db, "Jobs", docId);

    await updateDoc(jobRef, updatedFields);

    setJob((prev) => ({
      ...prev,
      ...updatedFields,
    }));

    setMessage("Saved.");
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
                  })
                }
                className="w-full rounded-2xl bg-black px-5 py-3 font-bold text-white"
              >
                Save Job Details
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
                  })
                }
                className="w-full rounded-2xl bg-black px-5 py-3 font-bold text-white"
              >
                Save Live Update
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
                })
              }
              className="rounded-2xl bg-black px-5 py-3 font-bold text-white"
            >
              Pause Tracking
            </button>

            <button
              onClick={() =>
                saveJob({
                  trackingPaused: false,
                  status: "Live Tracking Active",
                  lastUpdated: "Just now",
                })
              }
              className="rounded-2xl border px-5 py-3 font-bold"
            >
              Resume Tracking
            </button>

            <button
              onClick={() =>
                saveJob({
                  status: "Vehicle Picked Up",
                  progress: 35,
                  trackingPaused: false,
                  lastUpdated: "Just now",
                })
              }
              className="rounded-2xl border px-5 py-3 font-bold"
            >
              Mark Picked Up
            </button>

            <button
              onClick={() =>
                saveJob({
                  status: "In Transit",
                  progress: 62,
                  trackingPaused: false,
                  lastUpdated: "Just now",
                })
              }
              className="rounded-2xl border px-5 py-3 font-bold"
            >
              Mark In Transit
            </button>

            <button
              onClick={() =>
                saveJob({
                  status: "Delivered",
                  progress: 100,
                  trackingPaused: false,
                  lastUpdated: "Just now",
                })
              }
              className="rounded-2xl bg-black px-5 py-3 font-bold text-white"
            >
              Mark Delivered
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
