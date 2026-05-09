import React, { FC, useEffect, useRef, useState } from "react";
import axios from "axios";

type Props = {
  videoUrl: string;
  title: string;
};

const CoursePlayer: FC<Props> = ({ videoUrl }) => {
  const [videoData, setVideoData] = useState({ otp: "", playbackInfo: "" });
  const [error, setError] = useState(false);
  // true = user clicked to interact with player; false = scroll-forwarding mode
  const [playerActive, setPlayerActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!videoUrl?.trim()) return;

    setVideoData({ otp: "", playbackInfo: "" });
    setError(false);
    setPlayerActive(false);

    const controller = new AbortController();

    axios
      .post(
        "http://localhost:8000/api/v1/getVdoCipherOTP",
        { videoId: videoUrl },
        { signal: controller.signal }
      )
      .then((res) => setVideoData(res.data))
      .catch((err) => {
        if (axios.isCancel(err)) return;
        console.warn("Failed to fetch VdoCipher OTP:", err?.response?.data?.message ?? err.message);
        setError(true);
      });

    return () => controller.abort();
  }, [videoUrl]);

  // While the player is active, watch global mousemove to detect when the
  // cursor truly leaves the container. We can't rely on onMouseLeave because
  // entering a cross-origin iframe also fires it.
  // Global mousemove only fires outside the iframe (iframe blocks events),
  // so any event we receive means the mouse is in the parent document.
  useEffect(() => {
    if (!playerActive) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      if (!inside) setPlayerActive(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [playerActive]);

  const hasVideo = !!(videoData.otp && videoData.playbackInfo);

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", paddingTop: "56.25%", overflow: "hidden" }}
    >
      {error ? (
        <div
          style={{
            position: "absolute", top: 0, left: 0,
            width: "100%", height: "100%",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "#000", color: "#fff", fontSize: "16px",
          }}
        >
          Video unavailable
        </div>
      ) : hasVideo ? (
        <>
          <iframe
            src={`https://player.vdocipher.com/v2/?otp=${videoData.otp}&playbackInfo=${videoData.playbackInfo}`}
            style={{
              position: "absolute", top: 0, left: 0,
              width: "100%", height: "100%", border: 0,
            }}
            allowFullScreen
            allow="encrypted-media"
          />
          {/* Overlay stays in the DOM at all times — only pointer-events toggles.
              When inactive: intercepts wheel and forwards to page scroll.
              When active (pointer-events:none): passes all events to the iframe. */}
          <div
            style={{
              position: "absolute", top: 0, left: 0,
              width: "100%", height: "100%",
              zIndex: 10,
              pointerEvents: playerActive ? "none" : "auto",
              background: "transparent",
            }}
            onWheel={(e) => window.scrollBy({ top: e.deltaY })}
            onClick={() => setPlayerActive(true)}
          />
        </>
      ) : null}
    </div>
  );
};

export default CoursePlayer;
