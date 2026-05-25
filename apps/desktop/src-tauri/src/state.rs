use serde::{Deserialize, Serialize};
use std::sync::Mutex;

/// Per-channel audio configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChannelConfig {
    pub id: String,
    pub name: String,
    pub volume: f32,   // 0.0 to 1.0
    pub muted: bool,
}

/// Current streaming status.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum StreamStatus {
    Idle,
    Connecting,
    Live,
    Error,
}

/// Info about an audio input device.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioDeviceInfo {
    pub name: String,
    pub is_default: bool,
}

/// Application state managed by Tauri.
pub struct AppState {
    pub stream_status: Mutex<StreamStatus>,
    pub stream_title: Mutex<String>,
    pub channels: Mutex<Vec<ChannelConfig>>,
    pub selected_device: Mutex<Option<String>>,
    /// Handle to stop the streaming pipeline.
    pub stream_abort: Mutex<Option<tokio::sync::oneshot::Sender<()>>>,
    /// Handle to control the continuous audio engine.
    pub audio_engine: Mutex<Option<crate::stream::engine::AudioEngineHandle>>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            stream_status: Mutex::new(StreamStatus::Idle),
            stream_title: Mutex::new("My Awesome Stream".to_string()),
            channels: Mutex::new(vec![
                ChannelConfig {
                    id: "mic".to_string(),
                    name: "Mic/Aux".to_string(),
                    volume: 0.65,
                    muted: false,
                },
                ChannelConfig {
                    id: "desktop".to_string(),
                    name: "Desktop Audio".to_string(),
                    volume: 0.80,
                    muted: false,
                },
            ]),
            selected_device: Mutex::new(None),
            stream_abort: Mutex::new(None),
            audio_engine: Mutex::new(None),
        }
    }
}

impl Default for AppState {
    fn default() -> Self {
        Self::new()
    }
}
