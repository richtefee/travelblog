---
title: "Georgien"
---

{{< map lat="42.35" lon="43.35" zoom="5.8" >}}
    {{< geosource >}}
{{< /map >}}

{{< stats >}}
  {{< stat number="48" label="Tage" >}}
  {{< stat number="7" label="Artikel" >}}
  {{< stat number="10" label="€ Ausgaben / Tag" >}}
{{< /stats >}}

Unsere Zickzack-Route durch Georgien war geprägt von den vielen Möglichkeiten bei Projekten zu helfen. Gepaart mit Hitchhiking und viel Gastfreundschaft z.B. auch bei einem Couch-Surf hatten wir daher geringe Kosten. Dabei sind wir gut rumgekommen und haben einen bleibenden Einblick in dieses natürlich schöne Land und dessen Kultur erhalten.


## Ausgabenaufschlüsselung
<!-- prettier-ignore-start -->
{{< chart >}}
type: 'bar',
data: {
  labels: [''],
  datasets: [
    { label: 'Versicherungen', data: [227], backgroundColor: '#C2410C', borderWidth: 0, borderRadius: {topLeft: 7, bottomLeft: 7, topRight: 0, bottomRight: 0}, borderSkipped: false },
    { label: 'Wohnen', data: [93], backgroundColor: '#EA580C', borderWidth: 0 },
    { label: 'Ernährung', data: [86], backgroundColor: '#F59E0B', borderWidth: 0 },
    { label: 'Transport', data: [22], backgroundColor: '#EAB308', borderWidth: 0 },
    { label: 'Kleidung', data: [18], backgroundColor: '#84CC16', borderWidth: 0 },
    { label: 'Internet', data: [9], backgroundColor: '#14B8A6', borderWidth: 0 },
    { label: 'Diverses', data: [7], backgroundColor: '#A855F7', borderWidth: 0, borderRadius: {topLeft: 0, bottomLeft: 0, topRight: 7, bottomRight: 7}, borderSkipped: false }
  ]
},
options: {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y',
  scales: {
    x: { stacked: true, display: false, bounds: 'data' },
    y: { stacked: true, display: false }
  },
  plugins: {
    legend: {
      position: 'bottom',     // bottom, top, left, right
      labels: {
        usePointStyle: true,
      }
    },
    tooltip: {
      position: 'average',
      yAlign: 'center',
      xAlign: 'center',
      callbacks: {
        label: function(context) {
          const datasets = context.chart.data.datasets;
          const total = datasets.reduce((sum, ds) => sum + ds.data[0], 0);
          const value = context.raw;
          const percentage = ((value / total) * 100).toFixed(1);
          return context.dataset.label + ': ' + percentage + '%';
        }
      }
    }
  }
}
{{< /chart >}}
<!-- prettier-ignore-end -->


## Blogposts
