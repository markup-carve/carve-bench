const chart = document.getElementById('interactive-chart')
const select = document.getElementById('language')
fetch('evidence.json').then(response => {
  if (!response.ok) throw new Error('Snapshot unavailable')
  return response.json()
}).then(data => {
  document.getElementById('filter-controls').hidden = false
  function render() {
    const selected = select.value
    const rows = data.peers.filter(row => selected === 'all' || row.language === selected).sort((a, b) => b.throughput - a.throughput)
    const maximum = Math.max(...rows.map(row => row.throughput))
    const list = document.createElement('ul')
    list.className = 'bars'
    list.setAttribute('aria-label', `${selected === 'all' ? 'All languages' : selected} throughput in MB/s`)
    for (const row of rows) {
      const item = document.createElement('li')
      const label = document.createElement('span')
      label.textContent = `${row.engine} (${row.language})`
      const track = document.createElement('span')
      track.className = 'bar-track'
      const bar = document.createElement('span')
      bar.className = row.engine.startsWith('carve-') ? 'bar carve' : 'bar peer'
      bar.style.width = `${row.throughput / maximum * 100}%`
      track.append(bar)
      const value = document.createElement('strong')
      value.textContent = `${row.throughput.toFixed(2)} MB/s`
      item.append(label, track, value)
      list.append(item)
    }
    chart.replaceChildren(list)
    document.getElementById('filter-status').textContent = `${selected === 'all' ? 'All languages' : selected}: ${rows.length} engines`
    for (const table of document.querySelectorAll('.language-table')) table.hidden = selected !== 'all' && table.dataset.language !== selected
  }
  select.addEventListener('change', render)
  render()
}).catch(() => {
  chart.textContent = 'Interactive chart unavailable. The measured tables and SVG chart below remain available.'
})
