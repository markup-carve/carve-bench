use std::io::{self, BufRead, Write};

fn convert(request: &serde_json::Value) -> Result<String, String> {
    let source = request["html"].as_str().ok_or("missing html")?;
    let mode = match request["mode"].as_str().unwrap_or("safe") {
        "safe" => carve::HtmlImportMode::Safe,
        "semantic" => carve::HtmlImportMode::Semantic,
        "roundtrip" => carve::HtmlImportMode::Roundtrip,
        _ => return Err("unknown import mode".into()),
    };
    let options = carve::HtmlImportOptions {
        mode,
        ..Default::default()
    };
    let imported = carve::html_to_ast(source, &options).map_err(|error| format!("{error:?}"))?;
    carve::render_markdown(&imported.value).map_err(|error| error.to_string())
}

fn main() -> io::Result<()> {
    let mut stdout = io::BufWriter::new(io::stdout().lock());
    for line in io::stdin().lock().lines() {
        let line = line?;
        let response = match serde_json::from_str::<serde_json::Value>(&line) {
            Ok(request) if request["op"] == "version" => serde_json::json!({
                "id": request["id"], "ok": true,
                "revision": env!("CARVE_ENGINE_REVISION"),
                "rustc": env!("CARVE_BUILD_RUSTC"),
                "lockfile": include_str!("../Cargo.lock"),
            }),
            Ok(request) => match convert(&request) {
                Ok(markdown) => {
                    serde_json::json!({"id": request["id"], "ok": true, "markdown": markdown})
                }
                Err(error) => serde_json::json!({"id": request["id"], "ok": false, "error": error}),
            },
            Err(error) => serde_json::json!({"ok": false, "error": error.to_string()}),
        };
        writeln!(stdout, "{response}")?;
        stdout.flush()?;
    }
    Ok(())
}
