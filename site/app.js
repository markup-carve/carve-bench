const chart = document.getElementById('interactive-chart')
const select = document.getElementById('language')
fetch('evidence.json').then(response => {
  if (!response.ok) throw new Error('Snapshot unavailable')
  return response.json()
}).then(data => {
  document.getElementById('filter-controls').hidden = false
  function render() {
    const selected = select.value
    const panels = [{ title: data.coreTitle ?? `With pipe tables · 18 points (${data.host.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? 'recorded run'})`, statistic: data.coreStatistic ?? 'Fastest trial', peers: data.peers }, ...(data.commonmarkLanes ?? [])]
    const visible = panels.map(panel => ({ ...panel, peers: panel.peers.filter(row => selected === 'all' || row.language === selected) })).filter(panel => panel.peers.length)
    const fragments = []
    for (const panel of visible) {
      const heading = document.createElement('h3')
      heading.textContent = panel.title
      fragments.push(heading)
      const statistic = document.createElement('p')
      statistic.textContent = panel.statistic
      fragments.push(statistic)
      const rows = [...panel.peers].sort((a, b) => b.throughput - a.throughput)
      const maximum = Math.max(...rows.map(row => row.throughput))
      const list = document.createElement('ul')
      list.className = 'bars'
      list.setAttribute('aria-label', `${panel.title}: ${selected === 'all' ? 'All languages' : selected} throughput in MB/s`)
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
      fragments.push(list)
    }
    chart.replaceChildren(...fragments)
    const engineCount = new Set(visible.flatMap(panel => panel.peers.map(row => `${row.language}/${row.engine}`))).size
    document.getElementById('filter-status').textContent = `${selected === 'all' ? 'All languages' : selected}: ${engineCount} engines in ${visible.length} workload panels`
    for (const table of document.querySelectorAll('.language-table')) table.hidden = selected !== 'all' && table.dataset.language !== selected
  }
  select.addEventListener('change', render)
  render()
}).catch(() => {
  chart.textContent = 'Interactive chart unavailable. The measured tables and SVG chart below remain available.'
})
