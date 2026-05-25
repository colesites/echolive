use ringbuf::traits::Consumer;
use ringbuf::HeapCons;
use std::sync::{Arc, Mutex};

use crate::state::ChannelConfig;

/// Reads PCM from the ring buffer, applies volume/mute, and writes
/// processed samples to an output buffer for FFmpeg.
///
/// Returns the peak level (0.0 - 1.0) for VU meter display.
pub fn process_chunk(
    consumer: &mut HeapCons<f32>,
    output: &mut Vec<u8>,
    channels: &Arc<Mutex<Vec<ChannelConfig>>>,
) -> f32 {
    let mut peak: f32 = 0.0;
    let mut temp_buf = vec![0.0f32; 4096];
    let count = consumer.pop_slice(&mut temp_buf);

    if count == 0 {
        return 0.0;
    }

    // Read channel configs
    let channel_configs = channels.lock().unwrap_or_else(|e| e.into_inner());
    let mic_config = channel_configs
        .iter()
        .find(|c| c.id == "mic")
        .cloned()
        .unwrap_or(ChannelConfig {
            id: "mic".to_string(),
            name: "Mic/Aux".to_string(),
            volume: 1.0,
            muted: false,
        });

    for sample in &temp_buf[..count] {
        let mut s = *sample;

        // Apply mic channel volume and mute
        if mic_config.muted {
            s = 0.0;
        } else {
            s *= mic_config.volume;
        }

        // Clamp to [-1.0, 1.0]
        s = s.clamp(-1.0, 1.0);

        // Track peak for VU meter
        peak = peak.max(s.abs());

        // Convert f32 to i16 little-endian bytes for FFmpeg raw PCM input
        let i16_sample = (s * i16::MAX as f32) as i16;
        output.extend_from_slice(&i16_sample.to_le_bytes());
    }

    peak
}
