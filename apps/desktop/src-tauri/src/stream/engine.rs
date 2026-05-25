use ringbuf::traits::Split;
use ringbuf::HeapRb;
use std::sync::{Arc, Mutex};
use tauri::Emitter;
use tauri_plugin_shell::process::CommandEvent;
use tauri_plugin_shell::ShellExt;
use tokio::sync::{mpsc, oneshot};

use crate::audio::{capture, mixer};
use crate::error::AppError;
use crate::state::{ChannelConfig, StreamStatus};

/// Handle to control the always-on audio engine.
#[derive(Clone)]
pub struct AudioEngineHandle {
    /// Channel sender to pass mixed audio chunks to the FFmpeg process (if running).
    pub ffmpeg_tx: Arc<Mutex<Option<mpsc::Sender<Vec<u8>>>>>,
}

/// Handle to stop the streaming pipeline.
pub struct StreamHandle {
    pub abort_tx: oneshot::Sender<()>,
}

/// Initializes the always-on audio engine (Mic capture + VU meters).
pub fn init_audio_engine(
    device_name: Option<String>,
    channels_state: Arc<Mutex<Vec<ChannelConfig>>>,
    on_level: impl Fn(f32) + Send + 'static,
) -> Result<AudioEngineHandle, AppError> {
    let sample_rate = capture::default_sample_rate()?;
    let num_channels = capture::default_channels()?;

    // Create ring buffer
    let ring_size = (sample_rate as usize) * (num_channels as usize);
    let rb = HeapRb::<f32>::new(ring_size);
    let (producer, mut consumer) = rb.split();

    // Start mic capture
    let capture_handle = capture::start_capture(device_name.as_deref(), producer)?;
    
    // Intentionally leak the handle so cpal::Stream stays alive
    std::mem::forget(capture_handle);

    let ffmpeg_tx: Arc<Mutex<Option<mpsc::Sender<Vec<u8>>>>> = Arc::new(Mutex::new(None));
    let engine_handle = AudioEngineHandle {
        ffmpeg_tx: ffmpeg_tx.clone(),
    };

    // Spawn the mixer thread
    std::thread::spawn(move || {
        let rt = tokio::runtime::Builder::new_current_thread()
            .enable_all()
            .build()
            .expect("Failed to build tokio runtime for audio engine");

        rt.block_on(async move {
            let mut output_buf = Vec::with_capacity(8192);

            loop {
                output_buf.clear();
                let peak = mixer::process_chunk(&mut consumer, &mut output_buf, &channels_state);

                // Always send audio level to frontend for VU meters
                on_level(peak);

                if !output_buf.is_empty() {
                    let tx_opt = {
                        let lock = ffmpeg_tx.lock().unwrap();
                        lock.clone()
                    };

                    if let Some(tx) = tx_opt {
                        // If sending fails, the receiver (stream) was dropped
                        if tx.send(output_buf.clone()).await.is_err() {
                            let mut lock = ffmpeg_tx.lock().unwrap();
                            *lock = None;
                        }
                    }
                }

                // ~10ms cadence
                tokio::time::sleep(std::time::Duration::from_millis(10)).await;
            }
        });
    });

    Ok(engine_handle)
}

/// Starts the FFmpeg streaming pipeline, receiving audio from the running engine.
pub async fn start_stream(
    app: tauri::AppHandle,
    rtmp_url: String,
    mut audio_rx: mpsc::Receiver<Vec<u8>>,
    on_status: impl Fn(StreamStatus) + Send + 'static,
) -> Result<StreamHandle, AppError> {
    let sample_rate = capture::default_sample_rate()?;
    let num_channels = capture::default_channels()?;

    let (mut rx, mut child) = app.shell().sidecar("ffmpeg")
        .map_err(|e| AppError::Stream(format!("Failed to configure FFmpeg sidecar: {}", e)))?
        .args([
            // Quieter logs, but keep errors flowing on stderr.
            "-hide_banner",
            "-loglevel", "error",
            "-f", "s16le",
            "-ar", &sample_rate.to_string(),
            "-ac", &num_channels.to_string(),
            "-i", "pipe:0",
            "-c:a", "aac",
            "-b:a", "128k",
            "-f", "flv",
            &rtmp_url,
        ])
        .spawn()
        .map_err(|e| AppError::Stream(format!("Failed to spawn FFmpeg sidecar: {}", e)))?;

    on_status(StreamStatus::Live);

    // Drain FFmpeg's stdout/stderr so the user can see WHY it failed
    // (e.g. "Connection refused" when MediaMTX is down). Each stderr line is
    // forwarded to the frontend as a `stream-log` event; an unexpected exit
    // emits a `stream-error` event with the final terminated reason.
    let app_logs = app.clone();
    tokio::spawn(async move {
        let mut last_stderr: Vec<String> = Vec::with_capacity(8);
        while let Some(event) = rx.recv().await {
            match event {
                CommandEvent::Stderr(line) => {
                    let text = String::from_utf8_lossy(&line).trim().to_string();
                    if !text.is_empty() {
                        eprintln!("[echolive::ffmpeg] {}", text);
                        let _ = app_logs.emit("stream-log", &text);
                        last_stderr.push(text);
                        if last_stderr.len() > 8 {
                            last_stderr.remove(0);
                        }
                    }
                }
                CommandEvent::Stdout(line) => {
                    let text = String::from_utf8_lossy(&line).trim().to_string();
                    if !text.is_empty() {
                        let _ = app_logs.emit("stream-log", &text);
                    }
                }
                CommandEvent::Terminated(payload) => {
                    // Code 0 = normal exit (we killed it). Anything else is a real failure.
                    let code = payload.code.unwrap_or(-1);
                    if code != 0 {
                        let reason = if last_stderr.is_empty() {
                            format!("FFmpeg exited with code {}", code)
                        } else {
                            last_stderr.join("\n")
                        };
                        let _ = app_logs.emit("stream-error", &reason);
                    }
                    break;
                }
                CommandEvent::Error(err) => {
                    let _ = app_logs.emit("stream-error", &err.to_string());
                    break;
                }
                _ => {}
            }
        }
    });

    let (abort_tx, mut abort_rx) = oneshot::channel::<()>();

    tokio::spawn(async move {
        loop {
            tokio::select! {
                _ = &mut abort_rx => {
                    break;
                }
                chunk_opt = audio_rx.recv() => {
                    match chunk_opt {
                        Some(chunk) => {
                            if child.write(&chunk).is_err() {
                                eprintln!("[echolive::stream] FFmpeg sidecar write error");
                                on_status(StreamStatus::Error);
                                break;
                            }
                        }
                        None => break, // Audio engine dropped
                    }
                }
            }
        }
        
        let _ = child.kill();
        on_status(StreamStatus::Idle);
    });

    Ok(StreamHandle { abort_tx })
}
