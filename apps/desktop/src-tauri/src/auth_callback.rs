//! One-shot loopback HTTP server for OAuth callbacks during dev.
//!
//! Background: macOS routes `echolive://` to whichever installed `.app`
//! last claimed it. In `tauri dev` there's no bundle, so the URL ends up
//! at the installed production build instead of the dev binary.
//!
//! Standard fix (RFC 8252): use a loopback IP + ephemeral port. The
//! browser hits `http://127.0.0.1:<port>/` directly, no scheme
//! registration required, works identically in dev and prod.
//!
//! We bind on a fixed port (`53682`) so that Better Auth's
//! `trustedOrigins` can whitelist it without dynamic config. The port is
//! commonly used by OAuth tools (rclone, others), unlikely to clash.

use std::io::{Read, Write};
use std::net::{TcpListener, TcpStream};
use std::time::Duration;

use tauri::{AppHandle, Emitter};

use crate::error::AppError;

const HOST: &str = "127.0.0.1";
const PORT: u16 = 53682;

/// Spawn the listener on a background thread. Returns immediately so
/// the Tauri command doesn't block. The thread accepts one request,
/// extracts `?token=...`, emits `auth-token`, and exits.
pub fn start(app: AppHandle) -> Result<u16, AppError> {
    let listener = TcpListener::bind((HOST, PORT))
        .map_err(|e| AppError::Stream(format!("Auth callback bind failed: {e}")))?;
    // Don't block indefinitely if the user closes the browser tab.
    listener
        .set_nonblocking(false)
        .map_err(|e| AppError::Stream(format!("Auth callback setup failed: {e}")))?;

    std::thread::spawn(move || {
        if let Ok((stream, _)) = listener.accept() {
            if let Err(e) = handle_connection(stream, &app) {
                eprintln!("[echolive::auth] callback handling failed: {e}");
            }
        }
    });

    Ok(PORT)
}

fn handle_connection(mut stream: TcpStream, app: &AppHandle) -> std::io::Result<()> {
    stream.set_read_timeout(Some(Duration::from_secs(2)))?;

    let mut buf = [0u8; 4096];
    let n = stream.read(&mut buf)?;
    let request = String::from_utf8_lossy(&buf[..n]);

    // First line: "GET /...?token=XYZ HTTP/1.1"
    let path = request
        .lines()
        .next()
        .and_then(|line| line.split_whitespace().nth(1))
        .unwrap_or("/");

    let token = extract_query_param(path, "token");
    let error = extract_query_param(path, "error");

    let body = if token.is_some() {
        SUCCESS_HTML
    } else if error.is_some() {
        ERROR_HTML
    } else {
        FALLBACK_HTML
    };

    let response = format!(
        "HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{}",
        body.len(),
        body,
    );
    stream.write_all(response.as_bytes())?;
    stream.flush()?;

    if let Some(t) = token {
        let _ = app.emit("auth-token", t);
    } else if let Some(e) = error {
        let _ = app.emit("auth-error", e);
    }

    Ok(())
}

fn extract_query_param(path: &str, key: &str) -> Option<String> {
    let query = path.split_once('?')?.1;
    for pair in query.split('&') {
        if let Some(value) = pair.strip_prefix(&format!("{key}=")) {
            return Some(percent_decode(value));
        }
    }
    None
}

/// Minimal URL-decoding — handles `%XX` and `+`. Avoids pulling a crate.
fn percent_decode(input: &str) -> String {
    let bytes = input.as_bytes();
    let mut out = Vec::with_capacity(bytes.len());
    let mut i = 0;
    while i < bytes.len() {
        match bytes[i] {
            b'+' => out.push(b' '),
            b'%' if i + 2 < bytes.len() => {
                if let Ok(hex) = std::str::from_utf8(&bytes[i + 1..i + 3]) {
                    if let Ok(byte) = u8::from_str_radix(hex, 16) {
                        out.push(byte);
                        i += 3;
                        continue;
                    }
                }
                out.push(bytes[i]);
            }
            b => out.push(b),
        }
        i += 1;
    }
    String::from_utf8_lossy(&out).into_owned()
}

const SUCCESS_HTML: &str = r#"<!doctype html>
<html><head><meta charset="utf-8"><title>Echo Live — Signed in</title>
<style>body{font-family:-apple-system,sans-serif;background:#0a0a0a;color:#fafafa;display:grid;place-items:center;height:100vh;margin:0}
.box{text-align:center;max-width:380px;padding:24px}
h1{font-size:18px;margin:8px 0 4px}p{color:#71717a;font-size:14px;margin:4px 0}</style></head>
<body><div class="box">
<h1>You're signed in.</h1>
<p>You can close this tab and return to Echo Live.</p>
</div>
<script>setTimeout(()=>window.close(),800)</script></body></html>"#;

const ERROR_HTML: &str = r#"<!doctype html>
<html><head><meta charset="utf-8"><title>Echo Live — Sign-in failed</title>
<style>body{font-family:-apple-system,sans-serif;background:#0a0a0a;color:#fafafa;display:grid;place-items:center;height:100vh;margin:0}
.box{text-align:center;max-width:380px;padding:24px}
h1{font-size:18px;margin:8px 0 4px;color:#f87171}p{color:#71717a;font-size:14px;margin:4px 0}</style></head>
<body><div class="box">
<h1>Sign-in didn't complete.</h1>
<p>Return to Echo Live and try again.</p>
</div></body></html>"#;

const FALLBACK_HTML: &str = r#"<!doctype html>
<html><head><meta charset="utf-8"><title>Echo Live</title></head>
<body>OK. You can close this tab.</body></html>"#;
