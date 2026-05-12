"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CAMERA_FILTERS } from "@yowl/config";

export type CameraFacing = "user" | "environment";

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<CameraFacing>("user");
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [activeFilter, setActiveFilter] = useState<(typeof CAMERA_FILTERS)[number]>("Glow");
  const [permission, setPermission] = useState<"idle" | "granted" | "denied" | "unsupported">("idle");
  const [recording, setRecording] = useState(false);
  const [capturedFrame, setCapturedFrame] = useState<string | null>(null);

  const constraints = useMemo<MediaStreamConstraints>(
    () => ({
      video: {
        facingMode,
        width: { ideal: 1280 },
        height: { ideal: 1920 }
      },
      audio: true
    }),
    [facingMode]
  );

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setPermission("unsupported");
      return;
    }

    try {
      stopStream();
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setPermission("granted");
    } catch {
      setPermission("denied");
    }
  }, [constraints, stopStream]);

  useEffect(() => {
    void startCamera();
    return () => stopStream();
  }, [startCamera, stopStream]);

  const flipCamera = useCallback(() => {
    setFacingMode((current) => (current === "user" ? "environment" : "user"));
  }, []);

  const toggleFlash = useCallback(() => {
    setFlashEnabled((current) => !current);
  }, []);

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video) return null;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 720;
    canvas.height = video.videoHeight || 1280;
    const context = canvas.getContext("2d");
    if (!context) return null;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCapturedFrame(dataUrl);
    return dataUrl;
  }, []);

  const setLens = useCallback((name: (typeof CAMERA_FILTERS)[number]) => {
    setActiveFilter(name);
  }, []);

  return {
    activeFilter,
    capturedFrame,
    captureFrame,
    flashEnabled,
    flipCamera,
    facingMode,
    permission,
    recording,
    setLens,
    setRecording,
    startCamera,
    stopStream,
    videoRef,
    toggleFlash
  };
}
