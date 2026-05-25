import React, { useEffect } from "react";
import { StudioView } from "./views/StudioView";
import { DashboardView } from "./views/DashboardView";
import { StreamsView } from "./views/StreamsView";
import { SchedulerView } from "./views/SchedulerView";
import { HistoryView } from "./views/HistoryView";
import { AlertsView } from "./views/AlertsView";
import { DestinationsView } from "./views/DestinationsView";
import { Equalizer } from "./components/panels/Equalizer";
import { useStudioStore } from "./store/studioStore";
import { listen } from "@tauri-apps/api/event";
import "./App.css";

function App() {
  if (window.location.search.includes('view=eq')) {
    return <Equalizer />;
  }

  const {
    fetchDevices,
    setAudioLevel,
    initConvexStream,
    handleStreamFailure,
    activeView,
  } = useStudioStore();

  useEffect(() => {
    fetchDevices();
    initConvexStream();

    const unlisteners: Array<() => void> = [];

    const setupListeners = async () => {
      unlisteners.push(
        await listen<number>("audio-level", (event) => {
          setAudioLevel(event.payload);
        }),
      );
      unlisteners.push(
        await listen<string>("stream-error", (event) => {
          void handleStreamFailure(event.payload);
        }),
      );
      // Note: `stream-status` events from Rust are informational. The store
      // is the source of truth for `isLive` / `isConnecting` — set by goLive
      // / endLive / handleStreamFailure. Don't auto-flip from events here,
      // or a transient Rust `Idle` will yank the UI back to OFFLINE while
      // the store is still mid-transition.
    };

    void setupListeners();

    return () => {
      for (const u of unlisteners) u();
    };
  }, [fetchDevices, setAudioLevel, initConvexStream, handleStreamFailure]);

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
