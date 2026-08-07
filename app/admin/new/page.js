"use client";

import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AuthGate from "@/components/AuthGate";

function makePrivateTrackingId(baseId) {
  const cleanedBase = baseId.trim().toUpperCase();
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";

  for (let i = 0; i < 4; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }

  return `${cleanedBase}-${suffix}`;
}

function NewJobPageContent() {
  const [form, setForm] = useState({
    baseJobId: "",
    customerName: "",
    vehicle: "",
    pickup: "",
    dropoff: "",
    eta: "",
    status: "Booked",
    currentLocation: "Tracking has not started yet",
    progress: 0,
    trackingActive: false,
    trackingPaused: false,
    lastUpdated: "Not started",
  });

  const [message, setMessage] = useState("");
  const [createdJobId, setCreatedJobId] = useState("");

  function updateField(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function createJob(e) {
    e.preventDefault();

    if (!form.baseJobId || !form.vehicle || !form.pickup || !form.dropoff) {
      setMessage("Please enter at least tracking number, vehicle, pickup, and drop-off.");
      return;
    }

    const privateJobId = makePrivateTrackingId(form.baseJobId);

    try {
      await addDoc(collection(db, "Jobs"), {
        jobId: privateJobId,
        baseJobId: form.baseJobId.trim().toUpperCase(),
        customerName: form.customerName,
        vehicle: form.vehicle,
        pickup: form.pickup,
        dropoff: form.dropoff,
        eta: form.eta,
        status: form.status,
        currentLocation: form.currentLocation,
        progress: Number(form.progress),
        trackingActive: form.trackingActive,
        trackingPaused: form.trackingPaused,
        lastUpdated: form.lastUpdated,
        createdAt: new Date().toISOString(),
      });

      setCreatedJobId(privateJobId);
      setMessage("Job created successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Error creating job. Check the console.");
    }
  }

  return (
    <main className="min-h-screen bg-neutral-100 p-4 text-neutral-950 md:p-8">
      <div className="mx-auto max-w-4xl space-y-5">
        <header className="rounded-3xl bg-white p-6 shadow-sm">
          <a href="/admin" className="text-sm font-bold text-neutral-500 hover:text-black">
            ← Back to admin
          </a>
          <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Private admin dashboard
          </p>
          <h1 className="mt-2 text-4xl font-bold">Create New Transport</h1>
          <p className="mt-2 text-neutral-600">
            Create a private customer tracking link for a new S&P Transports job.
          </p>
        </header>

        <form onSubmit={createJob} className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-bold uppercase text-neutral-500">
                Base tracking number
              </label>
              <input
                className="mt-2 w-full rounded-2xl border p-3 uppercase"
                placeholder="SP-2409"
                value={form.baseJobId}
                onChange={(e) => updateField("baseJobId", e.target.value)}
              />
              <p className="mt-2 text-xs text-neutral-500">
                App will create a private version like SP-2409-X7K2.
              </p>
            </div>

            <div>
              <label className="text-sm font-bold uppercase text-neutral-500">
                Customer name
              </label>
              <input
                className="mt-2 w-full rounded-2xl border p-3"
                placeholder="Elite Auto Group"
                value={form.customerName}
                onChange={(e) => updateField("customerName", e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-bold uppercase text-neutral-500">
                Vehicle
              </label>
              <input
                className="mt-2 w-full rounded-2xl border p-3"
                placeholder="2021 BMW M340i"
                value={form.vehicle}
                onChange={(e) => updateField("vehicle", e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-bold uppercase text-neutral-500">
                ETA
              </label>
              <input
                className="mt-2 w-full rounded-2xl border p-3"
                placeholder="Today, 4:45 PM"
                value={form.eta}
                onChange={(e) => updateField("eta", e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-bold uppercase text-neutral-500">
                Pickup
              </label>
              <input
                className="mt-2 w-full rounded-2xl border p-3"
                placeholder="Manheim New Jersey, Bordentown, NJ"
                value={form.pickup}
                onChange={(e) => updateField("pickup", e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-bold uppercase text-neutral-500">
                Drop-off
              </label>
              <input
                className="mt-2 w-full rounded-2xl border p-3"
                placeholder="Jamaica, Queens, NY"
                value={form.dropoff}
                onChange={(e) => updateField("dropoff", e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-bold uppercase text-neutral-500">
                Starting status
              </label>
              <select
                className="mt-2 w-full rounded-2xl border p-3"
                value={form.status}
                onChange={(e) => updateField("status", e.target.value)}
              >
                <option>Booked</option>
                <option>Driver En Route</option>
                <option>Vehicle Picked Up</option>
                <option>In Transit</option>
                <option>Delivered</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-bold uppercase text-neutral-500">
                Starting progress %
              </label>
              <input
                type="number"
                min="0"
                max="100"
                className="mt-2 w-full rounded-2xl border p-3"
                value={form.progress}
                onChange={(e) => updateField("progress", e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 w-full rounded-2xl bg-black px-5 py-4 font-bold text-white"
          >
            Create Private Tracking Link
          </button>

          {message && <p className="mt-4 text-sm font-semibold">{message}</p>}

          {createdJobId && (
            <div className="mt-6 rounded-3xl bg-neutral-100 p-5">
              <p className="text-sm font-bold uppercase text-neutral-500">
                Private tracking number
              </p>
              <p className="mt-2 text-2xl font-bold">{createdJobId}</p>

              <p className="mt-4 text-sm font-bold uppercase text-neutral-500">
                Customer tracking link
              </p>
              <p className="mt-2 break-all font-bold">
                https://sp-transport-livetracking.vercel.app/track/{createdJobId}
              </p>

              <p className="mt-4 text-sm font-bold uppercase text-neutral-500">
                Driver link
              </p>
              <p className="mt-2 break-all font-bold">
                https://sp-transport-livetracking.vercel.app/driver/{createdJobId}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={`/track/${createdJobId}`}
                  target="_blank"
                  className="rounded-2xl bg-black px-5 py-3 font-bold text-white"
                >
                  View Customer Page
                </a>

                <a
                  href={`/driver/${createdJobId}`}
                  target="_blank"
                  className="rounded-2xl border px-5 py-3 font-bold"
                >
                  Open Driver Page
                </a>

                <a
                  href="/admin"
                  className="rounded-2xl border px-5 py-3 font-bold"
                >
                  Go to Admin
                </a>
              </div>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}

export default function NewJobPage() {
  return (
    <AuthGate>
      <NewJobPageContent />
    </AuthGate>
  );
}
