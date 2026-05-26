mod audio;
mod auth_callback;
mod error;
mod state;
mod stream;

use crate::error::AppError;
use crate::state::{AppState, AudioDeviceInfo, StreamStatus};
use std::sync::Arc;
use tauri::{Emitter, Manager, State};
use tauri_plugin_deep_link::DeepLinkExt;

/// Lists available audio input devices.
#[tauri::command]
fn list_audio_devices() -> Result<Vec<AudioDeviceInfo>, AppError> {
    audio::capture::list_input_devices()
}

/// Returns the current stream status.
#[tauri::command]
fn get_stream_status(state: State<'_, AppState>) -> Result<StreamStatus, AppError> {
    let status = state.stream_status.lock().unwrap_or_else(|e| e.into_inner());
    Ok(status.clone())
}

/// Sets the stream title.
#[tauri::command]
fn set_stream_title(title: String, state: State<'_, AppState>) -> Result<(), AppError> {
    let mut t = state.stream_title.lock().unwrap_or_else(|e| e.into_inner());
    *t = title;
    Ok(())
}

/// Adjusts a channel's volume (0.0 to 1.0).
#[tauri::command]
fn set_volume(channel_id: String, volume: f32, state: State<'_, AppState>) -> Result<(), AppError> {
    let mut channels = state.channels.lock().unwrap_or_else(|e| e.into_inner());
    if let Some(ch) = channels.iter_mut().find(|c| c.id == channel_id) {
        ch.volume = volume.clamp(0.0, 1.0);
    }
    Ok(())
}

/// Toggles mute on a channel.
#[tauri::command]
fn toggle_mute(channel_id: String, state: State<'_, AppState>) -> Result<bool, AppError> {
    let mut channels = state.channels.lock().unwrap_or_else(|e| e.into_inner());
    if let Some(ch) = channels.iter_mut().find(|c| c.id == channel_id) {
        ch.muted = !ch.muted;
        return Ok(ch.muted);
    }
    Ok(false)
}

/// Starts the audio streaming pipeline (mic capture → mixer → FFmpeg → RTMP).
/// `rtmp_url` must be the full RTMP target including the stream key
/// (e.g. `rtmp://host:1935/live/<streamKey>`). The desktop fetches this
/// from Convex via `streams.startStream` before calling.
#[tauri::command]
async fn start_stream(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    rtmp_url: String,
) -> Result<(), AppError> {
    if rtmp_url.is_empty() {
        return Err(AppError::Stream("rtmp_url is required".into()));
    }

    {
        let status = state.stream_status.lock().unwrap_or_else(|e| e.into_inner());
        if *status == StreamStatus::Live || *status == StreamStatus::Connecting {
            return Err(AppError::AlreadyStreaming);
        }
    }

    {
        let mut status = state.stream_status.lock().unwrap_or_else(|e| e.into_inner());
        *status = StreamStatus::Connecting;
    }
    let _ = app.emit("stream-status", StreamStatus::Connecting);

    // Callbacks for status and level updates
    let app_status = app.clone();
    let status_mutex = Arc::new(std::sync::Mutex::new(()));
    let on_status = move |new_status: StreamStatus| {
        let _lock = status_mutex.lock();
        let _ = app_status.emit("stream-status", new_status);
    };

    let (audio_tx, audio_rx) = tokio::sync::mpsc::channel(1024);

    {
        let engine_lock = state.audio_engine.lock().unwrap_or_else(|e| e.into_inner());
        if let Some(engine) = &*engine_lock {
            let mut tx_lock = engine.ffmpeg_tx.lock().unwrap_or_else(|e| e.into_inner());
            *tx_lock = Some(audio_tx);
        } else {
            return Err(AppError::Stream("Audio engine not running".into()));
        }
    }

    let handle = stream::engine::start_stream(
        app.clone(),
        rtmp_url,
        audio_rx,
        on_status,
    )
    .await?;

    // Store the abort sender so we can stop later
    {
        let mut abort = state.stream_abort.lock().unwrap_or_else(|e| e.into_inner());
        *abort = Some(handle.abort_tx);
    }

    {
        let mut status = state.stream_status.lock().unwrap_or_else(|e| e.into_inner());
        *status = StreamStatus::Live;
    }
    let _ = app.emit("stream-status", StreamStatus::Live);

    Ok(())
}

/// Stops the streaming pipeline.
#[tauri::command]
fn stop_stream(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
) -> Result<(), AppError> {
    let abort_tx = {
        let mut abort = state.stream_abort.lock().unwrap_or_else(|e| e.into_inner());
        abort.take()
    };

    // Stop sending audio data
    {
        let engine_lock = state.audio_engine.lock().unwrap_or_else(|e| e.into_inner());
        if let Some(engine) = &*engine_lock {
            let mut tx_lock = engine.ffmpeg_tx.lock().unwrap_or_else(|e| e.into_inner());
            *tx_lock = None;
        }
    }

    match abort_tx {
        Some(tx) => {
            let _ = tx.send(());
            let mut status = state.stream_status.lock().unwrap_or_else(|e| e.into_inner());
            *status = StreamStatus::Idle;
            let _ = app.emit("stream-status", StreamStatus::Idle);
            Ok(())
        }
        None => Err(AppError::NotStreaming),
    }
}

/// Spawn the dev-mode OAuth loopback server. Idempotent if the port
/// is already bound. Returns the port the browser should call back to.
#[tauri::command]
fn start_auth_callback_server(app: tauri::AppHandle) -> Result<u16, AppError> {
    auth_callback::start(app)
}

/// Sets the selected audio input device. Pass None for default.
#[tauri::command]
fn select_audio_device(
    device_name: Option<String>,
    state: State<'_, AppState>,
) -> Result<(), AppError> {
    let mut selected = state.selected_device.lock().unwrap_or_else(|e| e.into_inner());
    *selected = device_name;
    Ok(())
}

/// Returns the currently selected audio input device name.
#[tauri::command]
fn get_selected_device(state: State<'_, AppState>) -> Result<Option<String>, AppError> {
    let selected = state.selected_device.lock().unwrap_or_else(|e| e.into_inner());
    Ok(selected.clone())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        // `deep-link` must be initialised before any `setup` hook so
        // single-instance launches deliver the URL to the running window.
        .plugin(tauri_plugin_deep_link::init())
        .manage(AppState::new())
        .setup(|app| {
            let handle = app.handle();
            let state = handle.state::<AppState>();
            let channels_state = {
                let channels = state.channels.lock().unwrap();
                Arc::new(std::sync::Mutex::new(channels.clone()))
            };
            
            let app_level = handle.clone();
            let on_level = move |peak: f32| {
                let _ = app_level.emit("audio-level", peak);
            };

            if let Ok(engine) = stream::engine::init_audio_engine(None, channels_state, on_level) {
                let mut engine_state = state.audio_engine.lock().unwrap();
                *engine_state = Some(engine);
            }

            // In bundled builds the URL scheme comes from Info.plist
            // generated from `tauri.conf.json`. In `tauri dev` there's
            // no .app bundle, so we tell macOS LaunchServices about the
            // scheme at runtime. `register_all` is best-effort — if it
            // fails (e.g. already registered) we just continue.
            #[cfg(debug_assertions)]
            {
                if let Err(e) = app.deep_link().register_all() {
                    eprintln!("[echolive] deep-link register_all failed: {e}");
                }
            }

            // Forward incoming `echolive://...` URLs to the frontend.
            // Auth callback handling lives in JS (token parsing + storage).
            let app_handle = app.handle().clone();
            app.deep_link().on_open_url(move |event| {
                for url in event.urls() {
                    let _ = app_handle.emit("deep-link", url.as_str().to_string());
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            list_audio_devices,
            get_stream_status,
            set_stream_title,
            set_volume,
            toggle_mute,
            start_stream,
            stop_stream,
            select_audio_device,
            get_selected_device,
            start_auth_callback_server,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
