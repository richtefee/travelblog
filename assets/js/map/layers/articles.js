import { colors } from "../utils/tailwindColor.js";

export function addArticles(map) {
    const sourceId = "article-source";
    if (!map.getSource(sourceId)) return;

    // Clusters and Count Layers
    map.addLayer({
        id: "article-clusters",
        type: "circle",
        source: sourceId,
        filter: ["has", "point_count"],
        paint: {
            "circle-radius": 12,
            "circle-color": colors.article || "#f59e0b",
            "circle-stroke-width": 2,
            "circle-stroke-color": "#fff"
        }
    });

    map.addLayer({
        id: "article-cluster-count",
        type: "symbol",
        source: sourceId,
        filter: ["has", "point_count"],
        layout: {
            "text-field": "{point_count_abbreviated}",
            "text-size": 12,
            "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"]
        },
        paint: { "text-color": "#fff" }
    });

    // Single Points Layer
    map.addLayer({
        id: "article-points",
        type: "circle",
        source: sourceId,
        filter: ["!", ["has", "point_count"]],
        paint: {
            "circle-radius": 7,
            "circle-color": colors.article || "#f59e0b",
            "circle-stroke-width": 1.5,
            "circle-stroke-color": "#fff"
        }
    });

    // Click for Clusters
    ["article-clusters", "article-cluster-count"].forEach(layerId => {
        map.on("click", layerId, (e) => {
            const props = e.features[0].properties;
            const titles = [...new Set((props.titles || "").split(" | ").filter(t => t.trim()))];
            const urls = [...new Set((props.urls || "").split(" | ").filter(u => u.trim()))];

            const html = titles.map((t, i) => `<a href="${urls[i] || "#"}" target="_blank">• ${t}</a>`).join("<br>");

            new maplibregl.Popup({ offset: [0, -10], closeButton: false, closeOnMove: true })
            .setLngLat(e.lngLat)
            .setHTML(html)
            .addTo(map);
        });
    });

    // Click for Points
    map.on("click", "article-points", (e) => {
        const props = e.features[0].properties;
        new maplibregl.Popup({ offset: [0, -10], closeButton: false, closeOnMove: true })
        .setLngLat(e.lngLat)
        .setHTML(`<a href="${props.url}" target="_blank">${props.title}</a>`)
        .addTo(map);
    });

    // Cursors
    ["article-clusters", "article-cluster-count", "article-points"].forEach(l => {
        map.on("mouseenter", l, () => map.getCanvas().style.cursor = "pointer");
        map.on("mouseleave", l, () => map.getCanvas().style.cursor = "");
    });
}
