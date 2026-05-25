import React, { useEffect } from "react";
import { StudioView } from "./views/StudioView";
import { useStudioStore } from "./store/studioStore";
import { listen } from "@tauri-apps/api/event";
import "./App.css";

function App() {
  const { fetchDevices, setAudioLevel, setStreamStatusState, initConvexStream } = useStudioStore();

  useEffect(() => {
    fetchDevices();
    initConvexStream();

    let unlistenLevel: (() => void) | null = null;
    let unlistenStatus: (() => void) | null = null;

    const setupListeners = async () => {
      unlistenLevel = await listen<number>("audio-level", (event) => {
        setAudioLevel(event.payload);
      });

      unlistenStatus = await listen<string>("stream-status", (event) => {
        const status = event.payload;
        if (status === "live") {
          setStreamStatusState(true, false);
        } else if (status === "connecting") {
          setStreamStatusState(false, true);
        } else {
          setStreamStatusState(false, false);
        }
      });
    };

    setupListeners();

    return () => {
      if (unlistenLevel) unlistenLevel();
      if (unlistenStatus) unlistenStatus();
    };
  }, [fetchDevices, setAudioLevel, setStreamStatusState]);

  return <StudioView />;
}

export default App;
