import { create } from 'zustand';
import { 
  startStream, 
  stopStream, 
  setStreamTitle as setStreamTitleBackend,
  listAudioDevices,
  selectAudioDevice,
  getSelectedDevice,
  type AudioDeviceInfo
} from '../services/streamService';
import { setVolume as setVolumeBackend, toggleMute as toggleMuteBackend } from '../services/audioService';
import { fetchLiveStream, setLiveStreamStatus, setLiveStreamTitle } from '../services/convexService';

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
  // Phase 1/2 Basic state
  isLive: boolean;
  isRecording: boolean;
  isConnecting: boolean;
  streamTitle: string;
  streamDuration: number;
  audioLevel: number; // 0.0 to 1.0 peak level from backend
  devices: AudioDeviceInfo[];
  selectedDeviceName: string | null;
  streamId: string | null;
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
  toggleLive: () => void;
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
  
  toggleStudioMode: () => void;
  toggleVirtualCamera: () => void;
  toggleReplayBuffer: () => void;
  setTransitionType: (type: 'Cut' | 'Fade' | 'Swipe') => void;
}

export const useStudioStore = create<StudioState>((set, get) => ({
  isLive: false,
  isRecording: false,
  isConnecting: false,
  streamTitle: 'My Awesome Stream',
  streamDuration: 0,
  audioLevel: 0,
  devices: [],
  selectedDeviceName: null,
  streamId: null,
  
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

  toggleLive: () => {
    const { isLive, streamId, streamTitle } = get();
    if (isLive) {
      stopStream()
        .then(() => {
          set({ isLive: false, isConnecting: false });
          if (streamId) {
            setLiveStreamStatus(streamId, false).catch(console.error);
          }
        })
        .catch((err) => console.error('[echolive] Stop stream failed:', err));
    } else {
      set({ isConnecting: true });
      startStream()
        .then(() => {
          set({ isLive: true, isConnecting: false });
          if (streamId) {
            setLiveStreamStatus(streamId, true, streamTitle).catch(console.error);
          }
        })
        .catch((err) => {
          console.error('[echolive] Start stream failed:', err);
          set({ isConnecting: false });
        });
    }
  },
  toggleRecording: () => set((state) => ({ isRecording: !state.isRecording })),
  setStreamTitle: (title) => {
    set({ streamTitle: title });
    setStreamTitleBackend(title).catch(console.error);
    const { streamId } = get();
    if (streamId) {
      setLiveStreamTitle(streamId, title).catch(console.error);
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
  initConvexStream: async () => {
    try {
      const streamDoc = await fetchLiveStream();
      set({ 
        streamId: streamDoc._id,
        streamTitle: streamDoc.title,
        isLive: streamDoc.isLive 
      });
    } catch (err) {
      console.error('[echolive] Failed to init Convex stream:', err);
    }
  },



  toggleStudioMode: () => set((state) => ({ isStudioMode: !state.isStudioMode })),
  toggleVirtualCamera: () => set((state) => ({ isVirtualCameraOn: !state.isVirtualCameraOn })),
  toggleReplayBuffer: () => set((state) => ({ isReplayBufferOn: !state.isReplayBufferOn })),
  setTransitionType: (type) => set({ transitionType: type }),
}));
