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

  async function saveUpdate(fields) {
    if (!docId) {
      setMessage("Load job first.");
      return;
    }

    await updateDoc(doc(db, "Jobs", docId), fields);

    setJob((prev) => ({
      ...prev,
      ...fields,
    }));
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
        });

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
    });

    setMessage("Live tracking stopped.");
  }

  async function pauseTracking() {
    await saveUpdate({
      trackingPaused: true,
      status: "Tracking Paused",
      lastUpdated: new Date().toLocaleTimeString(),
    });

    setMessage("Customer location updates paused.");
  }

  async function resumeTracking() {
    await saveUpdate({
      trackingPaused: false,
      status: "Live Tracking Active",
      lastUpdated: new Date().toLocaleTimeString(),
    });

    setMessage("Customer location updates resumed.");
  }

  async function markPickedUp() {
    await saveUpdate({
      status: "Vehicle Picked Up",
      progress: 35,
      trackingPaused: false,
      lastUpdated: new Date().toLocaleTimeString(),
    });

    setMessage("Marked picked up.");
  }

  async function markDelivered() {
    await saveUpdate({
      status: "Delivered",
      progress: 100,
      trackingPaused: false,
      trackingActive: false,
      lastUpdated: new Date().toLocaleTimeString(),
    });

    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setTracking(false);
    setMessage("Marked delivered and stopped tracking.");
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
              className="rounded-2xl bg-black px-5 py-4 font-bold text-white"
            >
              Start Live Tracking
            </button>

            <button
              onClick={stopTracking}
              className="rounded-2xl border px-5 py-4 font-bold"
            >
              Stop Live Tracking
            </button>

            <button
              onClick={pauseTracking}
              className="rounded-2xl border px-5 py-4 font-bold"
            >
              Pause Customer Updates
            </button>

            <button
              onClick={resumeTracking}
              className="rounded-2xl border px-5 py-4 font-bold"
            >
              Resume Customer Updates
            </button>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold">Trip status</h3>

          <div className="mt-4 grid gap-3">
            <button
              onClick={markPickedUp}
              className="rounded-2xl border px-5 py-4 font-bold"
            >
              Mark Picked Up
            </button>

            <button
              onClick={markDelivered}
              className="rounded-2xl bg-black px-5 py-4 font-bold text-white"
            >
              Mark Delivered
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
