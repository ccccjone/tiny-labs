import { useState, useEffect } from "react";

interface Session {
    id: string;
    duration: number;
    completeAt: number;
}

export default function App() {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([])
  const [totalMin, setTotalMin] = useState(0)

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
    const res = await fetch('http://localhost:8001/sessions');
    const data = await res.json();
    setSessions(data.sessions);
    setTotalMin(data.totalMinutes)
  };

  const saveSession = async () => {
    await fetch('http://localhost:8001/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ duration: seconds }),
    });
    setSeconds(0);
    setIsActive(false);
    fetchData();
  }

  useEffect(() => { 
    fetchData(); 
  }, [])

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')} : ${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="App">
      <h1>Timer</h1>
      <div>
        <p>{formatTime(seconds)}</p>
      </div>
      <div>
        <button
          onClick={()=>{setIsActive(true)}}
          disabled={isActive}
        >Start</button>
        <button
          onClick={()=>{setIsActive(false)}}
          disabled={!isActive}
        >Stop</button>
        <button
          onClick={saveSession}
          disabled={isActive || seconds === 0}
        >Save</button>
      </div>
      <div>
        <p>List of completed sessions</p>
        <ul>
          {sessions.map((s) => (
            <li key={s.id}>
              <span>{formatTime(s.duration)} - </span>
              <span>{new Date(s.completeAt).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p>Total Focus: {totalMin} minutes</p>
      </div>
    </div>
  );
}
