fn main() {
    let path = std::env::args().nth(1).expect("fixture path");
    let source = std::fs::read_to_string(path).expect("fixture");
    // Pinned carve-rs rejects ::: in parse::try_layout_into, the exact direct
    // guard called by to_html before the AST parser.
    assert!(source.contains(":::"), "fixture lacks the default API's AST-route marker");
    let route = carve::try_render_html_streaming(&source, &carve::Options::default(), |_| {});
    match route {
        carve::StreamOutcome::Complete => println!("direct"),
        carve::StreamOutcome::NeedsAst => println!("ast"),
    }
}
