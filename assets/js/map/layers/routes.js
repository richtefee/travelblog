import { colors } from "../utils/tailwindColor.js";

export function addRoutes(map) {
    const sourceId = "route-source";
    if (!map.getSource(sourceId)) return;

    map.addLayer({
        id: "routes-layer",
        type: "line",
        source: sourceId,
        filter: ["==", ["get", "style"], "linear"],
        layout: {
            "line-cap": "round",
            "line-join": "round"
        },
        paint: {
            "line-width": 3,
            "line-color": colors.route || "#3b82f6",
            "line-opacity": 0.9
        }
    });
}
