import { create } from 'zustand';
import {
  startStream as startStreamRust,
  stopStream as stopStreamRust,
  setStreamTitle as setStreamTitleBackend,
  listAudioDevices,
  selectAudioDevice,
  getSelectedDevice,
  type AudioDeviceInfo,
} from '../services/streamService';
import { setVolume as setVolumeBackend, toggleMute as toggleMuteBackend } from '../services/audioService';
import {
  startStream as startStreamConvex,
  markPublishStarted,
  endStream as endStreamConvex,
  endAllLive,
  updateTitle as updateTitleConvex,
  uploadCover,
  type StreamId,
  type StartedStream,
} from '../services/convexService';

export type Scene = {
  id: string;
  name: string;
};

export type Source = {
  id: string;
  name: string;
  type: 'webcam' | 'screen' | 'audio' | 'image' | 'browser' | 'ndi';
  visible: boolean;
};

export type AudioChannel = {
  id: string;
  name: string;
  volume: number;
  muted: boolean;
};

interface StudioState {
  // Navigation
  activeView: 'studio' | 'dashboard' | 'streams' | 'scheduler' | 'history' | 'notifications' | 'multistream' | 'organization';
  setActiveView: (view: 'studio' | 'dashboard' | 'streams' | 'scheduler' | 'history' | 'notifications' | 'multistream' | 'organization') => void;

  // Phase 1/2 Basic state
  isLive: boolean;
  isRecording: boolean;
  isConnecting: boolean;
  streamTitle: string;
  streamDuration: number;
  audioLevel: number; // 0.0 to 1.0 peak level from backend
  devices: AudioDeviceInfo[];
  selectedDeviceName: string | null;
  streamId: StreamId | null;
  // Populated by `startStream` so the UI can show the share link + key.
  liveSession: StartedStream | null;
  scenes: Scene[];
  activeSceneId: string | null;
  previewSceneId: string | null; // For Studio Mode
  sources: Record<string, Source[]>;
  audioChannels: AudioChannel[];

  // Phase 3/4 Advanced state
  isStudioMode: boolean;
  isVirtualCameraOn: boolean;
  isReplayBufferOn: boolean;
  transitionType: 'Cut' | 'Fade' | 'Swipe';
  multistreamDestinations: string[];

  // Actions
  goLive: (opts: { title: string; coverFile: File | null }) => Promise<StartedStream>;
  endLive: () => Promise<void>;
  resetStuckStreams: () => Promise<number>;
  toggleRecording: () => void;
  setStreamTitle: (title: string) => void;
  initConvexStream: () => Promise<void>;
  setActiveScene: (id: string) => void;
  setPreviewScene: (id: string) => void;
  transitionPreviewToActive: () => void;
  setAudioVolume: (id: string, volume: number) => void;
  setAudioLevel: (level: number) => void;
  toggleAudioMute: (id: string) => void;
  fetchDevices: () => Promise<void>;
  selectDevice: (name: string | null) => Promise<void>;
  setStreamStatusState: (isLive: boolean, isConnecting: boolean) => void;
  handleStreamFailure: (reason: string) => Promise<void>;
  lastError: string | null;
  clearError: () => void;

  toggleStudioMode: () => void;
  toggleVirtualCamera: () => void;
  toggleReplayBuffer: () => void;
  setTransitionType: (type: 'Cut' | 'Fade' | 'Swipe') => void;
}

export const useStudioStore = create<StudioState>((set, get) => ({
  activeView: 'dashboard',
  setActiveView: (view) => set({ activeView: view }),
  
  isLive: false,
  isRecording: false,
  isConnecting: false,
  streamTitle: 'My Awesome Stream',
  streamDuration: 0,
  audioLevel: 0,
  devices: [],
  selectedDeviceName: null,
  streamId: null,
  liveSession: null,
  lastError: null,
  
  isStudioMode: false,
  isVirtualCameraOn: false,
  isReplayBufferOn: false,
  transitionType: 'Fade',
  multistreamDestinations: ['Twitch', 'YouTube'],

  scenes: [
    { id: 'scene-1', name: 'Starting Soon' },
    { id: 'scene-2', name: 'Main Camera' },
    { id: 'scene-3', name: 'Screen Share' },
  ],
  activeSceneId: 'scene-2',
  previewSceneId: 'scene-3',

  sources: {
    'scene-2': [
      { id: 'src-1', name: 'Logitech Brio', type: 'webcam', visible: true },
      { id: 'src-2', name: 'Mic/Aux', type: 'audio', visible: true },
    ],
    'scene-3': [
      { id: 'src-3', name: 'Display 1', type: 'screen', visible: true },
      { id: 'src-4', name: 'Alerts', type: 'browser', visible: true },
      { id: 'src-5', name: 'Guest (NDI)', type: 'ndi', visible: true },
    ],
  },
  audioChannels: [
    { id: 'audio-1', name: 'Desktop Audio', volume: 80, muted: false },
    { id: 'audio-2', name: 'Mic/Aux', volume: 65, muted: false },
  ],

  goLive: async ({ title, coverFile }) => {
    set({ isConnecting: true });
    let session: StartedStream | undefined;
    try {
      // 1. Upload cover (optional) → get storage id.
      let coverStorageId;
      if (coverFile) {
        try {
          coverStorageId = await uploadCover(coverFile);
        } catch (err) {
          console.error('[echolive] Cover upload failed, continuing without:', err);
        }
      }

      // 2. Create a fresh stream row + mint key. Returns the share URL.
      session = await startStreamConvex({ title, coverStorageId });

      // 3. Push to FFmpeg via the Rust sidecar.
      await startStreamRust(session.rtmpUrl);

      // 4. Tell Convex the publish is healthy → status `live`.
      await markPublishStarted(session.streamId).catch((err) =>
        console.error('[echolive] markPublishStarted failed:', err),
      );

      set({
        streamId: session.streamId,
        streamTitle: title,
        isLive: true,
        isConnecting: false,
        liveSession: session,
      });
      return session;
    } catch (err) {
      console.error('[echolive] Go live failed:', err);
      set({ isConnecting: false });
      // Rollback Convex side so the row isn't stuck in `connecting`.
      if (session) {
        endStreamConvex(session.streamId).catch(() => {});
      }
      throw err;
    }
  },
  endLive: async () => {
    const { streamId } = get();
    try {
      await stopStreamRust();
    } catch (err) {
      console.error('[echolive] stopStreamRust failed:', err);
    }
    if (streamId) {
      try {
        await endStreamConvex(streamId);
      } catch (err) {
        console.error('[echolive] endStreamConvex failed:', err);
      }
    }
    set({ isLive: false, isConnecting: false, liveSession: null, streamId: null });
  },
  // Emergency: wipe every stuck "live"/"connecting" row in Convex.
  // Safe to call when the desktop has lost track of its own stream id
  // (e.g. after a hard crash, or when the FFmpeg child died silently).
  resetStuckStreams: async () => {
    try {
      const { ended } = await endAllLive();
      console.info(`[echolive] Cleared ${ended} stuck stream(s).`);
      set({ isLive: false, isConnecting: false, liveSession: null, streamId: null });
      return ended;
    } catch (err) {
      console.error('[echolive] resetStuckStreams failed:', err);
      throw err;
    }
  },
  toggleRecording: () => set((state) => ({ isRecording: !state.isRecording })),
  setStreamTitle: (title) => {
    set({ streamTitle: title });
    setStreamTitleBackend(title).catch(console.error);
    const { streamId } = get();
    if (streamId) {
      updateTitleConvex(streamId, title).catch(console.error);
    }
  },
  setActiveScene: (id) => set((state) => (state.isStudioMode ? { previewSceneId: id } : { activeSceneId: id })),
  setPreviewScene: (id) => set({ previewSceneId: id }),
  transitionPreviewToActive: () => set((state) => ({ activeSceneId: state.previewSceneId })),
  
  setAudioVolume: (id, volume) => {
    set((state) => ({
      audioChannels: state.audioChannels.map((c) =>
        c.id === id ? { ...c, volume } : c
      ),
    }));
    // Map channel UI id to backend id
    const backendId = id === 'audio-2' ? 'mic' : 'desktop';
    setVolumeBackend(backendId, volume).catch(console.error);
  },
  toggleAudioMute: (id) => {
    set((state) => ({
      audioChannels: state.audioChannels.map((c) =>
        c.id === id ? { ...c, muted: !c.muted } : c
      ),
    }));
    const backendId = id === 'audio-2' ? 'mic' : 'desktop';
    toggleMuteBackend(backendId).catch(console.error);
  },
  setAudioLevel: (level) => set({ audioLevel: level }),
  fetchDevices: async () => {
    try {
      const devices = await listAudioDevices();
      const selected = await getSelectedDevice();
      set({ devices, selectedDeviceName: selected });
    } catch (err) {
      console.error('[echolive] Failed to fetch audio devices:', err);
    }
  },
  selectDevice: async (name) => {
    try {
      await selectAudioDevice(name);
      set({ selectedDeviceName: name });
    } catch (err) {
      console.error('[echolive] Failed to select audio device:', err);
    }
  },
  setStreamStatusState: (isLive, isConnecting) => set({ isLive, isConnecting }),
  /** Called by the App-level listener when FFmpeg dies unexpectedly. */
  handleStreamFailure: async (reason: string) => {
    const { streamId, isLive, isConnecting } = get();
    if (!isLive && !isConnecting) return; // already cleaned up
    set({
      isLive: false,
      isConnecting: false,
      liveSession: null,
      lastError: reason,
    });
    if (streamId) {
      try {
        await endStreamConvex(streamId);
      } catch (err) {
        console.error('[echolive] endStreamConvex during failure failed:', err);
      }
    }
  },
  clearError: () => set({ lastError: null }),
  initConvexStream: async () => {
    // No-op: streams are now created per Go Live, not on app boot.
  },



  toggleStudioMode: () => set((state) => ({ isStudioMode: !state.isStudioMode })),
  toggleVirtualCamera: () => set((state) => ({ isVirtualCameraOn: !state.isVirtualCameraOn })),
  toggleReplayBuffer: () => set((state) => ({ isReplayBufferOn: !state.isReplayBufferOn })),
  setTransitionType: (type) => set({ transitionType: type }),
}));
