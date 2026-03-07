---
title: "Kamerun"
---


{{< map lat="7.25" lon="12" zoom="4.5" >}}
    {{< geosource >}}
{{< /map >}}

{{< stats >}}
  {{< stat number="88" label="Tage" >}}
  {{< stat number="14" label="Artikel" >}}
  {{< stat number="39" label="€ Ausgaben / Tag" >}}
{{< /stats >}}

88 Tage verbrachten wir in Kamerun – davon 68 in Yaoundé, 3 als Kurztripp in Bafang, 3 weitere im Regenwald und zwei Wochen an der Küste in Kribi und Douala. Natürlich hätte es noch viel zu entdecken gegeben, aber man soll ja immer noch was für das nächste Mal übrig lassen.

## Ausgabenaufschlüsselung
<!-- prettier-ignore-start -->
{{< chart >}}
type: 'bar',
data: {
  labels: [''],
  datasets: [
    { label: 'Flug', data: [1250.16], backgroundColor: '#C2410C', borderWidth: 0, borderRadius: {topLeft: 7, bottomLeft: 7, topRight: 0, bottomRight: 0}, borderSkipped: false },
    { label: 'Visa', data: [625.16], backgroundColor: '#EA580C', borderWidth: 0 },
    { label: 'Versicherungen', data: [414.40], backgroundColor: '#F59E0B', borderWidth: 0 },
    { label: 'Ernährung', data: [304.38], backgroundColor: '#EAB308', borderWidth: 0 },
    { label: 'Transport', data: [263.94], backgroundColor: '#84CC16', borderWidth: 0 },
    { label: 'Guides', data: [184.46], backgroundColor: '#14B8A6', borderWidth: 0 },
    { label: 'Geschenke', data: [159.49], backgroundColor: '#0EA5E9', borderWidth: 0 },
    { label: 'Wohnen', data: [126.09], backgroundColor: '#6366F1', borderWidth: 0 },
    { label: 'Diverses', data: [90.37], backgroundColor: '#A855F7', borderWidth: 0, borderRadius: {topLeft: 0, bottomLeft: 0, topRight: 7, bottomRight: 7}, borderSkipped: false }
  ]
},
options: {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y',
  scales: {
    x: { stacked: true, display: false },
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
Während die Lebenshaltungskosten für die lokale Bevölkerung durchaus beachtlich sind, haben bei uns die Flüge und Visa die Kosten dominiert.

## Blogposts

Es war eine zutiefst beeindruckende Zeit in einer Welt, die unserer zwar in mancher Hinsicht ähnelt, insgesamt aber auf ganz andere Weise funktioniert. Wir danken allen Kameruner:innen, die uns diese wertvolle Zeit ermöglicht und uns so herzlich aufgenommen haben. Hier findet ihr die 14 Artikel über unsere Erlebnisse in Kamerun.
