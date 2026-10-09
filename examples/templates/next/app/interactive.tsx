"use client";
import { useEffect, useState } from "react";
import BlurText from "../components/react-bits/BlurText/BlurText";
import SpotlightCard from "../components/react-bits/SpotlightCard/SpotlightCard";
import SquishSwitch from "../components/react-bits/SquishSwitch/SquishSwitch";
export default function Interactive() {
  const [motion, setMotion] = useState(false);
  const [checked, setChecked] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const m = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setMotion(!m.matches);
    update();
    m.addEventListener("change", update);
    return () => m.removeEventListener("change", update);
  }, []);
  const content = (
    <>
      <h2>Your weekly studio digest</h2>
      {motion ? (
        <BlurText
          text="A little less noise. A little more focus."
          delay={35}
          stepDuration={0.15}
          className="subtitle"
        />
      ) : (
        <p className="subtitle">A little less noise. A little more focus.</p>
      )}
      <div className="setting">
        <div>
          <strong>Monday recap</strong>
          <p>Projects, progress, and what comes next.</p>
        </div>
        {motion ? (
          <SquishSwitch
            checked={checked}
            onChange={setChecked}
            ariaLabel="Monday recap"
            width={44}
            height={25}
            stretch={8}
            trackOnColor="#2f5d4b"
            thumbOnColor="#fff"
          />
        ) : (
          <input
            aria-label="Monday recap"
            role="switch"
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
        )}
      </div>
      <button
        className="save"
        onClick={() =>
          setMessage(checked ? "Digest enabled." : "Digest disabled.")
        }
      >
        Save preferences
      </button>
      <p className="feedback" role="status">
        {message}
      </p>
    </>
  );
  return motion ? (
    <SpotlightCard
      theme="light"
      intensity={0.06}
      proximity={0}
      className="settings-card"
    >
      {content}
    </SpotlightCard>
  ) : (
    <div className="settings-card">{content}</div>
  );
}
