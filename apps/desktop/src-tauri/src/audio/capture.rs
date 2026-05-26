use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use cpal::{SampleFormat, StreamConfig};
use ringbuf::traits::Producer;
use ringbuf::HeapProd;

use crate::error::AppError;
use crate::state::AudioDeviceInfo;

/// Lists all available audio input devices.
pub fn list_input_devices() -> Result<Vec<AudioDeviceInfo>, AppError> {
    let host = cpal::default_host();
    let default_device = host.default_input_device();
    let default_name = default_device
        .as_ref()
        .and_then(|d| d.name().ok())
        .unwrap_or_default();

    let devices: Vec<AudioDeviceInfo> = host
        .input_devices()
        .map_err(|e| AppError::Audio(format!("Failed to enumerate input devices: {e}")))?
        .filter_map(|device| {
            let name = device.name().ok()?;
            Some(AudioDeviceInfo {
                is_default: name == default_name,
                name,
            })
        })
        .collect();

    Ok(devices)
}

/// Handle for a running audio capture stream.
///
/// Dropping the handle stops the underlying cpal stream. The audio engine
/// `mem::forget`s this on startup because cpal streams are `!Send` on
/// macOS, so they must live on the thread that created them.
pub struct CaptureHandle {
    _stream: cpal::Stream,
}

/// Starts capturing audio from the given device (or default) and writes
/// f32 PCM samples into the provided ring buffer producer.
pub fn start_capture(
    device_name: Option<&str>,
    mut producer: HeapProd<f32>,
) -> Result<CaptureHandle, AppError> {
    let host = cpal::default_host();

    let device = match device_name {
        Some(name) => host
            .input_devices()
            .map_err(|e| AppError::Audio(format!("Failed to enumerate devices: {e}")))?
            .find(|d| d.name().map(|n| n == name).unwrap_or(false))
            .ok_or_else(|| AppError::DeviceNotFound(name.to_string()))?,
        None => host
            .default_input_device()
            .ok_or_else(|| AppError::DeviceNotFound("No default input device".to_string()))?,
    };

    let supported_config = device
        .default_input_config()
        .map_err(|e| AppError::Audio(format!("No supported input config: {e}")))?;

    let sample_format = supported_config.sample_format();
    let config: StreamConfig = supported_config.into();

    let err_fn = |err: cpal::StreamError| {
        eprintln!("[echolive::audio::capture] Stream error: {err}");
    };

    let stream = match sample_format {
        SampleFormat::F32 => device.build_input_stream(
            &config,
            move |data: &[f32], _: &cpal::InputCallbackInfo| {
                producer.push_slice(data);
            },
            err_fn,
            None,
        ),
        SampleFormat::I16 => device.build_input_stream(
            &config,
            move |data: &[i16], _: &cpal::InputCallbackInfo| {
                for &sample in data {
                    let f = sample as f32 / i16::MAX as f32;
                    let _ = producer.try_push(f);
                }
            },
            err_fn,
            None,
        ),
        SampleFormat::U16 => device.build_input_stream(
            &config,
            move |data: &[u16], _: &cpal::InputCallbackInfo| {
                for &sample in data {
                    let f = (sample as f32 / u16::MAX as f32) * 2.0 - 1.0;
                    let _ = producer.try_push(f);
                }
            },
            err_fn,
            None,
        ),
        _ => {
            return Err(AppError::Audio(format!(
                "Unsupported sample format: {sample_format:?}"
            )));
        }
    }
    .map_err(|e| AppError::Audio(format!("Failed to build input stream: {e}")))?;

    stream
        .play()
        .map_err(|e| AppError::Audio(format!("Failed to start capture: {e}")))?;

    Ok(CaptureHandle { _stream: stream })
}

/// Returns the default input sample rate (for FFmpeg config).
pub fn default_sample_rate() -> Result<u32, AppError> {
    let host = cpal::default_host();
    let device = host
        .default_input_device()
        .ok_or_else(|| AppError::DeviceNotFound("No default input device".to_string()))?;
    let config = device
        .default_input_config()
        .map_err(|e| AppError::Audio(format!("No supported config: {e}")))?;
    Ok(config.sample_rate().0)
}

/// Returns the default input channel count.
pub fn default_channels() -> Result<u16, AppError> {
    let host = cpal::default_host();
    let device = host
        .default_input_device()
        .ok_or_else(|| AppError::DeviceNotFound("No default input device".to_string()))?;
    let config = device
        .default_input_config()
        .map_err(|e| AppError::Audio(format!("No supported config: {e}")))?;
    Ok(config.channels())
}
