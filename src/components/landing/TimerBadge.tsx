import { useState, useEffect } from "react";

const TimerBadge = () => {
  const [minutes, setMinutes] = useState(29);
  const [seconds, setSeconds] = useState(59);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => {
        if (s === 0) {
          setMinutes((m) => (m === 0 ? 29 : m - 1));
          return 59;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 bg-gradient-primary text-primary-foreground px-4 py-2 rounded-xl shadow-glow text-sm font-semibold">
      <div>Oferta Especial</div>
      <div className="text-xs opacity-80">
        Termina em {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </div>
    </div>
  );
};

export default TimerBadge;
