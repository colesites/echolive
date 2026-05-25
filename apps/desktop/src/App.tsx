import React, { useEffect } from "react";
import { StudioView } from "./views/StudioView";
import { DashboardView } from "./views/DashboardView";
import { StreamsView } from "./views/StreamsView";
import { SchedulerView } from "./views/SchedulerView";
import { HistoryView } from "./views/HistoryView";
import { AlertsView } from "./views/AlertsView";
import { DestinationsView } from "./views/DestinationsView";
import { useStudioStore } from "./store/studioStore";
import { listen } from "@tauri-apps/api/event";
import "./App.css";

function App() {
  const { fetchDevices, setAudioLevel, setStreamStatusState, initConvexStream, activeView } = useStudioStore();

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

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'streams':
        return <StreamsView />;
      case 'scheduler':
        return <SchedulerView />;
      case 'history':
        return <HistoryView />;
      case 'notifications':
        return <AlertsView />;
      case 'multistream':
        return <DestinationsView />;
      case 'studio':
      default:
        return <StudioView />;
    }
  };

  return renderView();
}

export default App;
