const chart = document.getElementById('interactive-chart')
const controls = document.getElementById('filter-controls')
const laneSelect = document.getElementById('lane')
const phaseSelect = document.getElementById('phase')
const documentSelect = document.getElementById('document')
fetch('evidence.json').then(response => {
  if (!response.ok) throw new Error('Results unavailable')
  return response.json()
}).then(data => {
  controls.hidden = false
  function render() {
    const lane = data.lanes.find(item => item.id === laneSelect.value) ?? data.lanes[0]
    const phase = phaseSelect.value
    const name = documentSelect.value
    const rows = lane.rows.filter(row => row.phase === phase && row.document === name).sort((a, b) => b.mbps - a.mbps)
    const maximum = Math.max(...rows.map(row => row.mbps))
    const title = `${lane.title}, ${phaseSelect.selectedOptions[0].textContent}, ${name}`
    const heading = document.createElement('h3')
    heading.textContent = title
    const list = document.createElement('ul')
    list.className = 'bars'
    list.setAttribute('aria-label', `${title}: throughput in MB/s`)
    for (const row of rows) {
      const engine = lane.engines.find(item => item.id === row.engine)
      const item = document.createElement('li')
      const label = document.createElement('span')
      label.textContent = engine.label
      const track = document.createElement('span')
      track.className = 'bar-track'
      const bar = document.createElement('span')
      bar.className = row.engine.startsWith('carve02') ? 'bar carve' : row.engine.startsWith('carve') ? 'bar carve-old' : 'bar peer'
      bar.style.width = `${row.mbps / maximum * 100}%`
      track.append(bar)
      const value = document.createElement('strong')
      value.textContent = `${row.mbps.toFixed(1)} MB/s`
      item.append(label, track, value)
      list.append(item)
    }
    chart.replaceChildren(heading, list)
    document.getElementById('filter-status').textContent = `${title}: ${rows.length} engines`
  }
  for (const select of [laneSelect, phaseSelect, documentSelect]) select.addEventListener('change', render)
  render()
}).catch(() => {
  controls.hidden = true
  const message = document.createElement('p')
  message.textContent = 'Interactive chart unavailable. The charts and tables below remain available.'
  chart.replaceChildren(message)
})
