export function engineLabel(engine, language) {
  const runtime = language === 'JavaScript' ? 'JS' : language
  const markup = engine.startsWith('carve-') ? 'Carve' : /^(?:djot|jotdown)/.test(engine) ? 'Djot' : 'Markdown'
  return `${engine} (${runtime}, ${markup})`
}
