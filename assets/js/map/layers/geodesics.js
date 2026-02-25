import { colors } from "../utils/tailwindColor.js";

export function addGeodesics(map, geojson) {
    // Filter features that are routes AND marked as geodesic
    const geodesicFeatures = geojson.features.filter(
        f =>
        f.geometry?.type === "LineString" &&
        f.properties?.kind === "route" &&
        f.properties?.style === "geodesic"
    );

    geodesicFeatures.forEach((feature, index) => {
        const coords = feature.geometry.coordinates;
        if (coords.length < 2) return;

        const start = coords[0];
        const end = coords[1];

        // Generate the curved great circle line using Turf
        const curve = turf.greatCircle(start, end, { npoints: 100 });

        const uniqueSourceId = `geodesic-source-${index}`;
        const layerId = `geodesic-layer-${index}`;

        map.addSource(uniqueSourceId, {
            type: "geojson",
            data: curve
        });

        map.addLayer({
            id: layerId,
            type: "line",
            source: uniqueSourceId,
            layout: {
                "line-cap": "round",
                "line-join": "round"
            },
            paint: {
                "line-width": 3,
                "line-color": colors.geodesic || "#6366f1",
                "line-opacity": 0.4,
                'line-dasharray': [2, 3]
            }
        });
    });
}
