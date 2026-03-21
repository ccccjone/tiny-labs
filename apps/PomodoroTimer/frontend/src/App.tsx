import { useState, useEffect, useMemo, type CSSProperties } from "react";
import "./App.css";

interface Session {
  id: string;
  duration: number;
  completeAt: number;
}

const RING_RADIUS = 88;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const VISUAL_FILL_CAP_SEC = 25 * 60;

export default function App() {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [totalMin, setTotalMin] = useState(0);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    let interval: number | undefined;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const fetchData = async () => {
    const res = await fetch("http://localhost:8001/sessions");
    const data = await res.json();
    setSessions(data.sessions);
    setTotalMin(data.totalMinutes);
  };

  const saveSession = async () => {
    await fetch("http://localhost:8001/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ duration: seconds }),
    });
    setSeconds(0);
    setIsActive(false);
    fetchData();
    setJustSaved(true);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!justSaved) return;
    const t = window.setTimeout(() => setJustSaved(false), 5200);
    return () => clearTimeout(t);
  }, [justSaved]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const minuteRingProgress = (seconds % 60) / 60;
  const ringOffset = RING_CIRCUMFERENCE * (1 - minuteRingProgress);
  const visualBgFill = Math.min(seconds / VISUAL_FILL_CAP_SEC, 1);

  const shellStyle = useMemo(
    () =>
      ({
        "--visual-fill": String(visualBgFill),
      }) as CSSProperties,
    [visualBgFill]
  );

  return (
    <div className="app-shell" style={shellStyle}>
      <div className="app-shell__bg" aria-hidden />
      <div className="app-shell__progress-fill" aria-hidden />

      <main className="app-main">
        <h1 className="app-title">Timer</h1>

        <div
          className={`glass-card glass-card--timer${justSaved ? " just-saved" : ""}`}
        >
          <div className="ring-wrap">
            <svg className="ring-svg" viewBox="0 0 200 200" aria-hidden>
              <circle className="ring-bg" cx="100" cy="100" r={RING_RADIUS} />
              <circle
                className="ring-progress"
                cx="100"
                cy="100"
                r={RING_RADIUS}
                style={
                  {
                    strokeDasharray: RING_CIRCUMFERENCE,
                    strokeDashoffset: ringOffset,
                  } as CSSProperties
                }
              />
            </svg>
            <div className="ring-center">
              <span className="ring-time">{formatTime(seconds)}</span>
              <span className="ring-sub">{isActive ? "Running" : "Stopped"}</span>
            </div>
          </div>

          <div className="controls">
            <button
              type="button"
              className="ctrl-btn ctrl-btn--primary"
              onClick={() => setIsActive(true)}
              disabled={isActive}
            >
              Start
            </button>
            <button
              type="button"
              className="ctrl-btn"
              onClick={() => setIsActive(false)}
              disabled={!isActive}
            >
              Stop
            </button>
            <button
              type="button"
              className="ctrl-btn"
              onClick={saveSession}
              disabled={isActive || seconds === 0}
            >
              Save
            </button>
          </div>
        </div>

        <div className="glass-card">
          <p className="stats-bar">
            Total focus: <strong>{totalMin}</strong> minutes
          </p>
        </div>

        <div className="glass-card">
          <h2 className="section-heading">Completed sessions</h2>
          {sessions.length === 0 ? (
            <p className="empty-hint">No sessions yet.</p>
          ) : (
            <ul className="session-list">
              {sessions.map((s) => (
                <li key={s.id}>
                  <span className="session-duration">{formatTime(s.duration)}</span>
                  <span className="session-date">
                    {new Date(s.completeAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
