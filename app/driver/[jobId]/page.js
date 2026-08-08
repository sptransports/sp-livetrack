"use client";

import AuthGate from "@/components/AuthGate";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

function DriverPageContent() {
  const params = useParams();
  const jobId = params.jobId;

  const [job, setJob] = useState(null);
  const [docId, setDocId] = useState(null);
  const [message, setMessage] = useState("Load the job to begin.");
  const [tracking, setTracking] = useState(false);
  const [lastCoords, setLastCoords] = useState(null);
  const [savingAction, setSavingAction] = useState("");

  const watchIdRef = useRef(null);

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
      setMessage("No job found.");
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadInitialJob() {
      const initialQuery = query(
        collection(db, "Jobs"),
        where("jobId", "==", jobId),
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
        setMessage("No job found.");
      }
    }

    loadInitialJob();

    return () => {
      cancelled = true;
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [jobId]);

  async function saveUpdate(fields, action = "Update", showFeedback = true) {
    if (!docId) {
      setMessage("Load job first.");
      return;
    }

    if (showFeedback) {
      setSavingAction(action);
      setMessage(`Saving ${action.toLowerCase()}...`);
    }

    try {
      await updateDoc(doc(db, "Jobs", docId), fields);

      setJob((prev) => ({
        ...prev,
        ...fields,
      }));

      if (showFeedback) setMessage(`${action} saved ✓`);
    } catch (error) {
      console.error(error);
      if (showFeedback) setMessage(`Could not save ${action.toLowerCase()}. Please try again.`);
    } finally {
      if (showFeedback) setSavingAction("");
    }
  }

  function controlClass(selected) {
    return `rounded-2xl px-5 py-4 font-bold transition disabled:cursor-wait disabled:opacity-60 ${
      selected
        ? "bg-[#8fa7b8] text-[#10161a] shadow-md ring-4 ring-[#8fa7b8]/25"
        : "border border-neutral-300 bg-white hover:border-[#8fa7b8] hover:bg-[#eef1f3]"
    }`;
  }

  function startTracking() {
    if (!navigator.geolocation) {
      setMessage("GPS is not supported on this device/browser.");
      return;
    }

    setMessage("Requesting GPS permission...");

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setLastCoords({ lat, lng });

        await saveUpdate({
          trackingActive: true,
          trackingPaused: false,
          status: "Live Tracking Active",
          latitude: lat,
          longitude: lng,
          currentLocation: "Live GPS active — approximate location updating",
          lastUpdated: new Date().toLocaleTimeString(),
        }, "Live GPS update", false);

        setTracking(true);
        setMessage("Live tracking is active.");
      },
      (error) => {
        console.error(error);
        setMessage("GPS permission denied or unavailable.");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 10000,
      }
    );
  }

  async function stopTracking() {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setTracking(false);

    await saveUpdate({
      trackingActive: false,
      status: "Tracking Stopped",
      lastUpdated: new Date().toLocaleTimeString(),
    }, "Stop tracking");
  }

  async function pauseTracking() {
    await saveUpdate({
      trackingPaused: true,
      status: "Tracking Paused",
      lastUpdated: new Date().toLocaleTimeString(),
    }, "Pause updates");
  }

  async function resumeTracking() {
    await saveUpdate({
      trackingPaused: false,
      status: "Live Tracking Active",
      lastUpdated: new Date().toLocaleTimeString(),
    }, "Resume updates");
  }

  async function markPickedUp() {
    await saveUpdate({
      status: "Vehicle Picked Up",
      progress: 35,
      trackingPaused: false,
      lastUpdated: new Date().toLocaleTimeString(),
    }, "Picked up status");
  }

  async function markDelivered() {
    await saveUpdate({
      status: "Delivered",
      progress: 100,
      trackingPaused: false,
      trackingActive: false,
      lastUpdated: new Date().toLocaleTimeString(),
    }, "Delivered status");

    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setTracking(false);
  }

  return (
    <main className="min-h-screen bg-neutral-100 p-4 text-neutral-950 md:p-8">
      <div className="mx-auto max-w-3xl space-y-5">
        <header className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Driver page
          </p>
          <h1 className="mt-2 text-4xl font-bold">S&P LiveTrack</h1>
          <p className="mt-2 text-neutral-600">
            Control live GPS tracking from your phone.
          </p>
        </header>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase text-neutral-500">
            Tracking number
          </p>
          <h2 className="mt-2 text-2xl font-bold">{jobId}</h2>

          {job && (
            <div className="mt-4 rounded-2xl bg-neutral-100 p-4">
              <p className="font-bold">{job.vehicle}</p>
              <p className="mt-1 text-sm text-neutral-600">
                {job.pickup} → {job.dropoff}
              </p>
              <p className="mt-2 text-sm font-semibold">
                Status: {job.status}
              </p>
            </div>
          )}

          <p className="mt-4 text-sm text-neutral-600">{message}</p>

          {lastCoords && (
            <p className="mt-2 text-xs text-neutral-500">
              Last GPS: {lastCoords.lat.toFixed(5)}, {lastCoords.lng.toFixed(5)}
            </p>
          )}
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold">Live tracking</h3>

          <div className="mt-4 grid gap-3">
            <button
              onClick={startTracking}
              aria-pressed={tracking || Boolean(job?.trackingActive && !job?.trackingPaused)}
              disabled={Boolean(savingAction)}
              className={controlClass(tracking || Boolean(job?.trackingActive && !job?.trackingPaused))}
            >
              {tracking || Boolean(job?.trackingActive && !job?.trackingPaused) ? "✓ Live Tracking Active" : "Start Live Tracking"}
            </button>

            <button
              onClick={stopTracking}
              aria-pressed={job?.status === "Tracking Stopped"}
              disabled={Boolean(savingAction)}
              className={controlClass(job?.status === "Tracking Stopped")}
            >
              {savingAction === "Stop tracking" ? "Saving…" : job?.status === "Tracking Stopped" ? "✓ Tracking Stopped" : "Stop Live Tracking"}
            </button>

            <button
              onClick={pauseTracking}
              aria-pressed={Boolean(job?.trackingPaused)}
              disabled={Boolean(savingAction)}
              className={controlClass(Boolean(job?.trackingPaused))}
            >
              {savingAction === "Pause updates" ? "Saving…" : job?.trackingPaused ? "✓ Customer Updates Paused" : "Pause Customer Updates"}
            </button>

            <button
              onClick={resumeTracking}
              aria-pressed={!job?.trackingPaused && job?.status === "Live Tracking Active"}
              disabled={Boolean(savingAction)}
              className={controlClass(!job?.trackingPaused && job?.status === "Live Tracking Active")}
            >
              {savingAction === "Resume updates" ? "Saving…" : !job?.trackingPaused && job?.status === "Live Tracking Active" ? "✓ Customer Updates Active" : "Resume Customer Updates"}
            </button>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold">Trip status</h3>

          <div className="mt-4 grid gap-3">
            <button
              onClick={markPickedUp}
              aria-pressed={job?.status === "Vehicle Picked Up"}
              disabled={Boolean(savingAction)}
              className={controlClass(job?.status === "Vehicle Picked Up")}
            >
              {savingAction === "Picked up status" ? "Saving…" : job?.status === "Vehicle Picked Up" ? "✓ Vehicle Picked Up" : "Mark Picked Up"}
            </button>

            <button
              onClick={markDelivered}
              aria-pressed={job?.status === "Delivered"}
              disabled={Boolean(savingAction)}
              className={controlClass(job?.status === "Delivered")}
            >
              {savingAction === "Delivered status" ? "Saving…" : job?.status === "Delivered" ? "✓ Delivered" : "Mark Delivered"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function DriverPage() {
  return (
    <AuthGate>
      <DriverPageContent />
    </AuthGate>
  );
}
