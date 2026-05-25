import { invoke } from '@tauri-apps/api/core';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';

export async function setVolume(channelId: string, volume: number): Promise<void> {
  // Convert 0-100 UI range to 0.0-1.0 backend range
  return invoke('set_volume', { channelId, volume: volume / 100 });
}

export async function toggleMute(channelId: string): Promise<boolean> {
  return invoke<boolean>('toggle_mute', { channelId });
}

export async function listenAudioLevel(
  callback: (level: number) => void
): Promise<UnlistenFn> {
  return listen<number>('audio-level', (event) => {
    callback(event.payload);
  });
}
