import { invoke } from '@tauri-apps/api/core';

export type StreamStatus = 'idle' | 'connecting' | 'live' | 'error';

export type AudioDeviceInfo = {
  name: string;
  isDefault: boolean;
};

export async function listAudioDevices(): Promise<AudioDeviceInfo[]> {
  return invoke<AudioDeviceInfo[]>('list_audio_devices');
}

export async function startStream(): Promise<void> {
  return invoke('start_stream');
}

export async function stopStream(): Promise<void> {
  return invoke('stop_stream');
}

export async function getStreamStatus(): Promise<StreamStatus> {
  return invoke<StreamStatus>('get_stream_status');
}

export async function setStreamTitle(title: string): Promise<void> {
  return invoke('set_stream_title', { title });
}

export async function selectAudioDevice(deviceName: string | null): Promise<void> {
  return invoke('select_audio_device', { deviceName });
}

export async function getSelectedDevice(): Promise<string | null> {
  return invoke<string | null>('get_selected_device');
}

